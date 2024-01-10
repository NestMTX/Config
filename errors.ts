import dot from 'dot-object'
import { inspect } from 'util'

import type * as Joi from 'joi'
/**
 * Error thrown when the schema type for an environmental variable is not supported.
 */
export class EnvSchemaTypeError extends Error {
  /**
   * Create a new EnvSchemaTypeError instance.
   * @param variable The name of the variable that has an unsupported type.
   * @param type The type of the variable that is not supported.
   */
  constructor(variable: string, type: string | undefined) {
    if ('string' === typeof type) {
      super(`Schema Type "${type}" for variable "${variable}" is not supported.`)
    } else {
      super(`The Schema Type for variable "${variable}" is undefined.`)
    }
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Error thrown when a required environmental variable is not set.
 */
export class EnvMissingError extends Error {
  /**
   * Create a new EnvMissingError instance.
   * @param variable The name of the variable that is missing
   */
  constructor(variable: string) {
    super(`Required variable "${variable}" is not set.`)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Error thrown when a environmental variable fails validation.
 */
export class EnvSchemaValidationError extends Error {
  /**
   * An array of error messages describing what failed validation.
   * @var messages
   * @access public
   * @readonly
   * @type {Array<string>}
   * @memberof EnvSchemaValidationError
   * @instance
   */
  public readonly messages?: Array<string>

  /**
   * Create a new EnvSchemaValidationError instance.
   * @param key The name of the variable that failed validation.
   * @param messages An array of error messages describing what failed validation.
   */
  constructor(key: string, messages?: Array<string>) {
    if (messages && messages.length > 0) {
      super(`Validation failed for variable "${key}": ${messages.join(', ')}`)
    } else {
      super(`Validation failed for variable "${key}".`)
    }
    this.name = this.constructor.name
    this.messages = messages
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * Create a new EnvSchemaValidationError instance from a Joi.ValidationError.
   * @param key The name of the variable that failed validation.
   * @param error The Joi.ValidationError that was thrown or returned
   * @param source The source value that was validated
   * @returns A new EnvSchemaValidationError instance
   */
  public static fromJoi(key: string, error: Joi.ValidationError, source: any) {
    return new EnvSchemaValidationError(
      key,
      error.details.map(({ message, path }) => {
        const dotPath = path.join('.')
        const value = dot.pick(dotPath, source)
        return `${message}, but got "${inspect(value, { depth: 2 })}"`
      })
    )
  }
}

/**
 * Error thrown when the value of an environmental variable cannot be parsed from JSON.
 */
export class EnvUnparseableFromJSONError extends Error {
  /**
   * Create a new EnvUnparseableFromJSON instance.
   * @param variable The name of the variable that is missing
   */
  constructor(variable: string) {
    super(`The variable "${variable}" could not be parsed as a JSON encoded object`)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Error thrown when the value of an environmental variable cannot be parsed as a number
 */
export class EnvUnparseableNumberError extends Error {
  /**
   * Create a new EnvUnparseableNumber instance.
   * @param variable The name of the variable that is missing
   */
  constructor(variable: string) {
    super(`The variable "${variable}" could not be parsed as a number`)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Error thrown when the value of an environmental variable cannot be parsed as a Date
 */
export class EnvUnparseableDateError extends Error {
  /**
   * Create a new EnvUnparseableDate instance.
   * @param variable The name of the variable that is missing
   */
  constructor(variable: string) {
    super(`The variable "${variable}" could not be parsed as a Date`)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Error thrown when the value of an environmental variable cannot be parsed as a Boolean
 */
export class EnvUnparseableBooleanError extends Error {
  /**
   * Create a new EnvUnparseableBoolean instance.
   * @param variable The name of the variable that is missing
   */
  constructor(variable: string) {
    super(`The variable "${variable}" could not be parsed as a Boolean`)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Error thrown when the directory holding the configuration files cannot be found.
 */
export class ConfigDirectoryDoesNotExistError extends Error {
  /**
   * Create a new ConfigDirectoryDoesNotExistError instance.
   * @param path The path to the directory that does not exist.
   */
  constructor(path: string) {
    super(`The path "${path}" could not be accessed`)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Error thrown when the directory holding the configuration files cannot be found.
 */
export class ConfigDirectoryIsNotDirectory extends Error {
  /**
   * Create a new ConfigDirectoryIsNotDirectory instance.
   * @param path The path to the directory that does not exist.
   */
  constructor(path: string) {
    super(`The path "${path}" is not a directory`)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}
