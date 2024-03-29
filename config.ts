import dot from 'dot-object'
import fs from 'fs'
import { join } from 'path'
import { ConfigDirectoryDoesNotExistError, ConfigDirectoryIsNotDirectory } from './errors'

let instance: Config | undefined

/**
 * A class for managing configurations stored in files in a directory.
 */
export class Config {
  readonly #cache: Record<string, any> = {}

  /**
   * Create a new Config instance.
   * @param configs An object where the keys are the names of the configuration files and the values are the configuration objects.
   */
  constructor(configs: Record<string, any>) {
    this.#cache = configs
    this.#freeze(this.#cache)
  }

  /**
   * Get the root configuration object.
   * @returns The root configuration object.
   */
  public get root() {
    const root = { ...this.#cache }
    this.#freeze(root)
    return root
  }

  /**
   * Get the value at the given path.
   * @param path The dot notation path to the value to get.
   * @param fallback The fallback value to return if the value is not set.
   * @returns The value at the given path or the fallback value if it is not set.
   */
  public get<T = any>(path: string, fallback?: T) {
    const value = dot.pick(path, this.#cache)
    if ('undefined' !== typeof value) {
      return value as T
    }
    return fallback as T
  }

  #freeze = (obj: any) => {
    if (typeof obj === 'object' && obj !== null) {
      Object.freeze(obj)
      Object.getOwnPropertyNames(obj).forEach((prop) => this.#freeze(obj[prop]))
    }
    return obj
  }

  /**
   * Initialize the Config instance by importing all of the configuration files in the given directory.
   * @param path The path to the directory containing the configuration files.
   * @returns A promise that resolves to the Config instance.
   */
  public static async initialize(path: string) {
    if (!(instance instanceof Config)) {
      const configObjectsFromFile: Record<string, any> = {}
      // make sure that the path actually exists
      if (!fs.existsSync(path)) {
        throw new ConfigDirectoryDoesNotExistError(path)
      }
      // make sure that the path is actually a directory
      if (!fs.lstatSync(path).isDirectory()) {
        throw new ConfigDirectoryIsNotDirectory(path)
      }
      // make a list of all of the files in the directory
      const files = fs
        .readdirSync(path)
        .filter((file) => /\.(js|mjs|cjs|json|ts|node)$/i.test(file))
        .sort((a, b) => {
          const importNameA = a
            .split('.')
            .slice(0, -1)
            .filter((p) => !['config'].includes(p))
            .join('.')
          const importNameB = b
            .split('.')
            .slice(0, -1)
            .filter((p) => !['config'].includes(p))
            .join('.')
          return importNameA.localeCompare(importNameB)
        })
      // import all of the files in the directory that can be imported,
      // returning undefined for those that cannot be imported
      const importArray = await Promise.all(
        files.map(async (file) => {
          const absolutePath = join(path, file)
          const importName = file
            .split('.')
            .slice(0, -1)
            .filter((p) => !['config'].includes(p))
            .join('.')
          let imported
          try {
            imported = await import(absolutePath)
          } catch (e) {
            if (e instanceof TypeError && e.message.includes('Unknown file extension')) {
              imported = require(absolutePath)
            } else {
              throw e
            }
          }
          if (
            'object' === typeof imported &&
            null !== imported &&
            !Array.isArray(imported) &&
            'undefined' !== typeof imported.default
          ) {
            return { [importName]: imported.default }
          }
          return { [importName]: imported }
        })
      )
      const imports = Object.assign({}, ...importArray)
      // add all of the imported objects to the config object
      for (const key in imports) {
        if ('undefined' !== typeof imports[key]) {
          configObjectsFromFile[key] = imports[key]
        } else if (imports[key] instanceof Error) {
          throw imports[key]
        }
      }
      // create the config object
      instance = new Config(configObjectsFromFile)
    }
    return instance
  }
}
