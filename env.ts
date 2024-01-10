/**
 * The first thing we do is load the dotenv config so that if there is anything missing from process.env it will be loaded from the .env file.
 */
import 'dotenv/config'
import Joi from 'joi'
import {
  EnvMissingError,
  EnvSchemaTypeError,
  EnvSchemaValidationError,
  EnvUnparseableBooleanError,
  EnvUnparseableDateError,
  EnvUnparseableFromJSONError,
  EnvUnparseableNumberError,
} from './errors'

export interface EnvSchema {
  [key: string]: Joi.Schema
}

/**
 * The Env class is a wrapper around process.env that allows us to define a schema for the environment variables and cast them to the correct type.
 */
export class Env {
  readonly #cache: Map<string, any> = new Map()

  /**
   * Create a new Env instance.
   * @param schema The schema is an object where the keys are the environment variable names and the values are Joi schemas.
   */
  constructor(schema?: EnvSchema) {
    for (const key in process.env) {
      if (schema && schema[key]) {
        const { type } = schema[key]
        switch (type) {
          case 'array':
            this.#cache.set(key, this.#castToArray(key, process.env[key], schema[key]))
            break
          case 'boolean':
            this.#cache.set(key, this.#castToBoolean(key, process.env[key], schema[key]))
            break
          case 'date':
            this.#cache.set(key, this.#castToDate(key, process.env[key], schema[key]))
            break
          case 'number':
            this.#cache.set(key, this.#castToNumber(key, process.env[key], schema[key]))
            break
          case 'object':
          case 'any':
            this.#cache.set(key, this.#castToObject(key, process.env[key], schema[key]))
            break
          case 'string':
            this.#cache.set(key, this.#castToString(key, process.env[key], schema[key]))
            break
          default:
            throw new EnvSchemaTypeError(key, type)
        }
        // we have to determine the type to cast the value to based on the schema
      } else if ('undefined' !== typeof process.env[key]) {
        // assume that the value is a string
        this.#cache.set(
          key,
          this.#castToString(key, process.env[key]!, Joi.string().optional().allow(''))
        )
      }
    }
    for (const key in schema) {
      if (!this.#cache.has(key)) {
        const presence = schema[key].$_getFlag('presence')
        if ('required' === presence) {
          throw new EnvMissingError(key)
        }
      }
    }
  }

  /**
   * Get the value of an environment variable.
   * @param key The key of the environment variable to get.
   * @param fallback The fallback value to return if the environment variable is not set.
   * @returns The value of the environment variable or the fallback value if it is not set.
   */
  public get(key: string, fallback: any = undefined) {
    if (!this.#cache.has(key)) {
      return fallback
    }
    return this.#cache.get(key)
  }

  /**
   * Get all of the cached environment variables.
   * @param obj Should the result be an object. If false the result will be a Map. Defaults to true.
   * @returns An object or Map containing all the environment variables.
   */
  public all(obj: boolean = true) {
    if (obj) {
      const result: Record<string, any> = {}
      this.#cache.forEach((value, key) => {
        result[key] = value
      })
      Object.freeze(result)
      return result
    } else {
      const ret = new Map([...this.#cache.entries()])
      Object.freeze(ret)
      return ret
    }
  }

  /**
   * Get all of the environment cached environment variables.
   */
  public get env() {
    return this.all(true)
  }

  #castToArray(key: string, value: string | undefined, validator: Joi.Schema) {
    const presence = validator.$_getFlag('presence')
    if ('undefined' === typeof value) {
      if ('optional' === presence) {
        return value
      } else {
        throw new EnvMissingError(key)
      }
    }
    let casted: Array<any> | undefined
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        casted = JSON.parse(value)
      } catch {
        throw new EnvUnparseableFromJSONError(key)
      }
    } else {
      casted = value.split(',')
    }
    try {
      const { error, value: validated } = validator.validate(casted)
      if (error instanceof Joi.ValidationError) {
        throw EnvSchemaValidationError.fromJoi(key, error, casted)
      }
      return validated
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        throw EnvSchemaValidationError.fromJoi(key, error, casted)
      } else {
        throw error
      }
    }
  }

  #castToBoolean(key: string, value: string | undefined, validator: Joi.Schema) {
    const presence = validator.$_getFlag('presence')
    if ('undefined' === typeof value) {
      if ('optional' === presence) {
        return value
      } else {
        throw new EnvMissingError(key)
      }
    }
    let casted: boolean | undefined
    switch (value.toLowerCase()) {
      case 'true':
      case 'yes':
      case 'on':
      case '1':
        casted = true
        break
      case 'false':
      case 'no':
      case 'off':
      case '0':
        casted = false
        break
    }
    if ('boolean' !== typeof casted) {
      throw new EnvUnparseableBooleanError(key)
    }
    try {
      const { error, value: validated } = validator.validate(casted)
      if (error instanceof Joi.ValidationError) {
        throw EnvSchemaValidationError.fromJoi(key, error, casted)
      }
      return validated
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        throw EnvSchemaValidationError.fromJoi(key, error, casted)
      } else {
        throw error
      }
    }
  }

  #castToDate(key: string, value: string | undefined, validator: Joi.Schema) {
    const presence = validator.$_getFlag('presence')
    if ('undefined' === typeof value) {
      if ('optional' === presence) {
        return value
      } else {
        throw new EnvMissingError(key)
      }
    }
    const casted = Date.parse(value)
    if (isNaN(casted)) {
      throw new EnvUnparseableDateError(key)
    }
    try {
      const { error, value: validated } = validator.validate(casted)
      if (error instanceof Joi.ValidationError) {
        throw EnvSchemaValidationError.fromJoi(key, error, casted)
      }
      return validated
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        throw EnvSchemaValidationError.fromJoi(key, error, casted)
      } else {
        throw error
      }
    }
  }

  #castToNumber(key: string, value: string | undefined, validator: Joi.Schema) {
    const presence = validator.$_getFlag('presence')
    if ('undefined' === typeof value) {
      if ('optional' === presence) {
        return value
      } else {
        throw new EnvMissingError(key)
      }
    }
    const casted = Number(value)
    if (isNaN(casted)) {
      throw new EnvUnparseableNumberError(key)
    }
    if (casted.toString() !== value.toString()) {
      throw new EnvUnparseableNumberError(key)
    }
    try {
      const { error, value: validated } = validator.validate(casted)
      if (error instanceof Joi.ValidationError) {
        throw EnvSchemaValidationError.fromJoi(key, error, casted)
      }
      return validated
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        throw EnvSchemaValidationError.fromJoi(key, error, casted)
      } else {
        throw error
      }
    }
  }

  #castToObject(key: string, value: string | undefined, validator: Joi.Schema) {
    const presence = validator.$_getFlag('presence')
    if ('undefined' === typeof value) {
      if ('optional' === presence) {
        return value
      } else {
        throw new EnvMissingError(key)
      }
    }
    let casted: any
    try {
      casted = JSON.parse(value)
    } catch {
      throw new EnvUnparseableFromJSONError(key)
    }
    try {
      const { error, value: validated } = validator.validate(casted)
      if (error instanceof Joi.ValidationError) {
        throw EnvSchemaValidationError.fromJoi(key, error, casted)
      }
      return validated
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        throw EnvSchemaValidationError.fromJoi(key, error, casted)
      } else {
        throw error
      }
    }
  }

  #castToString(key: string, value: string | undefined, validator: Joi.Schema) {
    const presence = validator.$_getFlag('presence')
    if ('undefined' === typeof value) {
      if ('optional' === presence) {
        return value
      } else {
        throw new EnvMissingError(key)
      }
    }
    const casted = value.toString()
    try {
      const { error, value: validated } = validator.validate(casted)
      if (error instanceof Joi.ValidationError) {
        throw EnvSchemaValidationError.fromJoi(key, error, casted)
      }
      return validated
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        throw EnvSchemaValidationError.fromJoi(key, error, casted)
      } else {
        throw error
      }
    }
  }
}
