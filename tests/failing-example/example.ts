import Joi from 'joi'
import type { EnvSchema } from '../../env'
import { Env } from '../../env'

const schema: EnvSchema = {
  FAKE_ENV_VAR_THAT_DOES_NOT_EXIST: Joi.string().required(),
}

const env = new Env(schema)

export default {
  foo: env.get('FAKE_ENV_VAR_THAT_DOES_NOT_EXIST'),
}
