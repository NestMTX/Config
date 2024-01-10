import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import pkg from './package.json' assert { type: 'json' }

export default [
  {
    input: 'config.ts',
    external: Object.keys(pkg.dependencies),
    output: [
      { file: 'dist/config.cjs.js', format: 'cjs', sourcemap: true, exports: 'named' },
      { file: 'dist/config.esm.js', format: 'es', sourcemap: true, exports: 'named' },
    ],
    plugins: [
      typescript({
        outputToFilesystem: true,
        exclude: ['bin/**/*', 'tests/**/*'],
      }),
      resolve(),
      commonjs(),
      json(),
    ],
  },
  {
    input: 'env.ts',
    external: Object.keys(pkg.dependencies),
    output: [
      { file: 'dist/env.cjs.js', format: 'cjs', sourcemap: true, exports: 'named' },
      { file: 'dist/env.esm.js', format: 'es', sourcemap: true, exports: 'named' },
    ],
    plugins: [
      typescript({
        outputToFilesystem: true,
        exclude: ['bin/**/*', 'tests/**/*'],
      }),
      resolve(),
      commonjs(),
      json(),
    ],
  },
  {
    input: 'errors.ts',
    external: Object.keys(pkg.dependencies),
    output: [
      { file: 'dist/errors.cjs.js', format: 'cjs', sourcemap: true, exports: 'named' },
      { file: 'dist/errors.esm.js', format: 'es', sourcemap: true, exports: 'named' },
    ],
    plugins: [
      typescript({
        outputToFilesystem: true,
        exclude: ['bin/**/*', 'tests/**/*'],
      }),
      resolve(),
      commonjs(),
      json(),
    ],
  },
]
