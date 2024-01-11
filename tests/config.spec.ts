import { test } from '@japa/runner'
import { join } from 'path'
import { Config } from '../config'
import {
  ConfigDirectoryDoesNotExistError,
  ConfigDirectoryIsNotDirectory,
  EnvMissingError,
} from '../errors'

test.group('Config', (group) => {
  group.tap((test) => test.tags(['@Config']))

  test('Throw error on a non-existing path', ({ assert }) => {
    Config.initialize('/this/path/does/not/exist')
      .then(() => {
        assert.fail('Should not have initialized')
      })
      .catch((error) => {
        assert.instanceOf(error, ConfigDirectoryDoesNotExistError)
      })
  })

  test('Throw error path being a file', ({ assert }) => {
    Config.initialize(__filename)
      .then(() => {
        assert.fail('Should not have initialized')
      })
      .catch((error) => {
        assert.instanceOf(error, ConfigDirectoryIsNotDirectory)
      })
  })
  test('Throw error when configuration file has error', ({ assert }) => {
    Config.initialize(join(__dirname, 'failing-example'))
      .then(() => {
        assert.fail('Should not have initialized')
      })
      .catch((error) => {
        assert.instanceOf(error, EnvMissingError)
      })
  })
  test('Loads correctly with a valid folder', async ({ assert }) => {
    let cnf
    try {
      cnf = await Config.initialize(join(__dirname, 'passing-example'))
    } catch (error) {
      assert.fail(error)
      return
    }
    assert.instanceOf(cnf, Config)
    assert.isObject(cnf.root)
    assert.isObject(cnf.root.example)
    assert.equal(cnf.root.example.foo, 'bar')
    assert.isObject(cnf.get('example'))
    assert.equal(cnf.get('example.foo'), 'bar')
  })
  test('Is able to import configuration files from JSON', async ({ assert }) => {
    let cnf
    try {
      cnf = await Config.initialize(join(__dirname, 'json-example'))
    } catch (error) {
      assert.fail(error)
      return
    }
    assert.instanceOf(cnf, Config)
    assert.isObject(cnf.root)
    assert.isObject(cnf.root.example)
    assert.equal(cnf.root.example.foo, 'bar')
    assert.isObject(cnf.get('example'))
    assert.equal(cnf.get('example.foo'), 'bar')
  })
  test('Is able to skip unimportable files', async ({ assert }) => {
    let cnf
    try {
      cnf = await Config.initialize(join(__dirname, 'unimportable-example'))
    } catch (error) {
      assert.fail(error)
      return
    }
    assert.instanceOf(cnf, Config)
    assert.isObject(cnf.root)
    assert.isUndefined(cnf.root.text)
    assert.isUndefined(cnf.root.m3u8)
    assert.isObject(cnf.root.example)
    assert.equal(cnf.root.example.foo, 'bar')
    assert.isObject(cnf.get('example'))
    assert.equal(cnf.get('example.foo'), 'bar')
  })
})
