import { test } from '@japa/runner'
import Joi from 'joi'
import { inspect } from 'util'
import type { EnvSchema } from '../env'
import { Env } from '../env'
import {
  EnvMissingError,
  EnvSchemaValidationError,
  EnvUnparseableBooleanError,
  EnvUnparseableDateError,
  EnvUnparseableFromJSONError,
  EnvUnparseableNumberError,
} from '../errors'

test.group('Env', (group) => {
  group.tap((test) => test.tags(['@Env']))

  test('Can initialize Env without a schema', ({ assert }) => {
    const env = new Env()
    assert.isTrue(env instanceof Env)
    assert.isObject(env.env)
    assert.isObject(env.all())
    assert.instanceOf(env.all(false), Map)
    assert.isString(env.get('PATH'))
    assert.isUndefined(env.get('THIS_SHOULD_NOT_BE_SET_ANYWHERE'))
    assert.isString(env.get('THIS_SHOULD_NOT_BE_SET_ANYWHERE', 'fallback'))
  })

  test('Can initialize Env with a schema that has no invalid values', ({ assert }) => {
    const schema: EnvSchema = {
      PATH: Joi.string().required(),
      TEST_ARRAY_CSV: Joi.array().items(Joi.number()).required(),
      TEST_ARRAY_JSON: Joi.array().items(Joi.number()).required(),
      TEST_BOOLEAN: Joi.boolean().required(),
      TEST_DATE_SHORT: Joi.date().required(),
      TEST_DATE_UTC: Joi.date().required(),
      TEST_DATE_OFFSET: Joi.date().required(),
      TEST_NUMBER: Joi.number().required(),
      TEST_DECIMAL: Joi.number().required(),
      TEST_OBJECT: Joi.object().required(),
    }
    const env = new Env(schema)
    assert.isTrue(env instanceof Env)
    assert.isObject(env.env)
    assert.isObject(env.all())
    assert.instanceOf(env.all(false), Map)
    assert.isString(env.get('PATH'))
    assert.isUndefined(env.get('THIS_SHOULD_NOT_BE_SET_ANYWHERE'))
    assert.isString(env.get('THIS_SHOULD_NOT_BE_SET_ANYWHERE', 'fallback'))
    assert.isObject(env.get('TEST_OBJECT'))
    assert.equal(env.get('TEST_OBJECT').a, 1)
    assert.isNumber(env.get('TEST_NUMBER'))
    assert.equal(env.get('TEST_NUMBER'), -123)
    assert.isNumber(env.get('TEST_DECIMAL'))
    assert.equal(env.get('TEST_DECIMAL'), 1.234)
    assert.instanceOf(env.get('TEST_DATE_SHORT'), Date)
    assert.instanceOf(env.get('TEST_DATE_UTC'), Date)
    assert.instanceOf(env.get('TEST_DATE_OFFSET'), Date)
    assert.equal(env.get('TEST_DATE_SHORT').toISOString(), '2019-01-01T00:00:00.000Z')
    assert.equal(env.get('TEST_DATE_UTC').toISOString(), '2019-01-01T00:00:00.000Z')
    assert.equal(env.get('TEST_DATE_OFFSET').toISOString(), '2019-01-01T00:00:00.000Z')
    assert.isBoolean(env.get('TEST_BOOLEAN'))
    assert.equal(env.get('TEST_BOOLEAN'), true)
    assert.isArray(env.get('TEST_ARRAY_JSON'))
    assert.isArray(env.get('TEST_ARRAY_CSV'))
    assert.equal(env.get('TEST_ARRAY_JSON').length, 5)
    assert.equal(env.get('TEST_ARRAY_CSV').length, 5)
    assert.deepEqual(env.get('TEST_ARRAY_JSON'), [1, 2, 3, 4, 5])
    assert.deepEqual(env.get('TEST_ARRAY_CSV'), [1, 2, 3, 4, 5])
  })

  test('Initialization of an Env with required variables that are missing throws a EnvMissingError', ({
    assert,
  }) => {
    const schema: EnvSchema = {
      THIS_WILL_CERTAINLY_FAIL_BECAUSE_IT_IS_MISSING: Joi.string().required(),
    }
    try {
      const e = new Env(schema)
      assert.fail(
        `EnvMissingError not thrown. Got ${inspect(
          e.get('THIS_WILL_CERTAINLY_FAIL_BECAUSE_IT_IS_MISSING'),
          false,
          25,
          true
        )}`
      )
    } catch (error) {
      if (error instanceof EnvMissingError) {
        assert.instanceOf(error, EnvMissingError)
      } else {
        throw error
      }
    }
  })

  test('Initialization of an Env with required variables that do not pass validation throws a EnvSchemaValidationError', ({
    assert,
  }) => {
    const schema: EnvSchema = {
      TEST_ARRAY_CSV: Joi.array().items(Joi.number().min(20)).required(),
    }
    try {
      const e = new Env(schema)
      assert.fail(
        `EnvSchemaValidationError not thrown. Got ${inspect(
          e.get('TEST_ARRAY_CSV'),
          false,
          25,
          true
        )}`
      )
    } catch (error) {
      if (error instanceof EnvSchemaValidationError) {
        assert.instanceOf(error, EnvSchemaValidationError)
      } else {
        throw error
      }
    }
  })

  test('Initialization of an Env with a badly formatted JSON object throws a EnvUnparseableFromJSONError', ({
    assert,
  }) => {
    const schema: EnvSchema = {
      TEST_BAD_OBJECT: Joi.object().required(),
    }
    try {
      const e = new Env(schema)
      assert.fail(
        `EnvUnparseableFromJSONError not thrown. Got ${inspect(
          e.get('TEST_BAD_OBJECT'),
          false,
          25,
          true
        )}`
      )
    } catch (error) {
      if (error instanceof EnvUnparseableFromJSONError) {
        assert.instanceOf(error, EnvUnparseableFromJSONError)
      } else {
        throw error
      }
    }
  })

  test('Initialization of an Env with a badly formatted number throws a EnvUnparseableNumberError', ({
    assert,
  }) => {
    const schema: EnvSchema = {
      TEST_BAD_NUMBER: Joi.number().required(),
    }
    try {
      const e = new Env(schema)
      assert.fail(
        `EnvUnparseableNumberError not thrown. Got ${inspect(
          e.get('TEST_BAD_NUMBER'),
          false,
          25,
          true
        )}`
      )
    } catch (error) {
      if (error instanceof EnvUnparseableNumberError) {
        assert.instanceOf(error, EnvUnparseableNumberError)
      } else {
        throw error
      }
    }
  })

  test('Initialization of an Env with a price meant to be cast as a number throws a EnvUnparseableNumberError', ({
    assert,
  }) => {
    const schema: EnvSchema = {
      TEST_PRICE: Joi.number().required(),
    }
    try {
      const e = new Env(schema)
      assert.fail(
        `EnvUnparseableNumberError not thrown. Got ${inspect(e.get('TEST_PRICE'), false, 25, true)}`
      )
    } catch (error) {
      if (error instanceof EnvUnparseableNumberError) {
        assert.instanceOf(error, EnvUnparseableNumberError)
      } else {
        throw error
      }
    }
  })

  test('Initialization of an Env with a badly formatted date throws a EnvUnparseableDateError', ({
    assert,
  }) => {
    const schema: EnvSchema = {
      TEST_BAD_DATE: Joi.date().required(),
    }
    try {
      const e = new Env(schema)
      assert.fail(
        `EnvUnparseableDateError not thrown. Got ${inspect(
          e.get('TEST_BAD_DATE'),
          false,
          25,
          true
        )}`
      )
    } catch (error) {
      if (error instanceof EnvUnparseableDateError) {
        assert.instanceOf(error, EnvUnparseableDateError)
      } else {
        throw error
      }
    }
  })

  test('Initialization of an Env with a badly formatted boolean throws a EnvUnparseableBooleanError', ({
    assert,
  }) => {
    const schema: EnvSchema = {
      TEST_BAD_BOOLEAN: Joi.boolean().required(),
    }
    try {
      const e = new Env(schema)
      assert.fail(
        `EnvUnparseableBooleanError not thrown. Got ${inspect(
          e.get('TEST_BAD_BOOLEAN'),
          false,
          25,
          true
        )}`
      )
    } catch (error) {
      if (error instanceof EnvUnparseableBooleanError) {
        assert.instanceOf(error, EnvUnparseableBooleanError)
      } else {
        throw error
      }
    }
  })
})
