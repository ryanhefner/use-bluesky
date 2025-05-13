import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

const input = 'src/index.js'

const defaultOutputOptions = {
  name: pkg.name,
  format: 'umd',
  globals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  banner: `/*! [banner info] !*/`,
  footer: '/* [footer info] */',
}

const defaultPlugins = [json(), resolve({ browser: true })]

const external = ['react', 'react-dom']

export default [
  // UMD - Minified
  {
    input,
    output: {
      ...defaultOutputOptions,
      file: `dist/${pkg.name}.min.js`,
      format: 'umd',
    },
    external,
    plugins: [
      ...defaultPlugins,
      babel({
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        babelHelpers: 'runtime',
        presets: ['@babel/preset-env', '@babel/preset-react'],
      }),
      terser(),
    ],
  },
  // UMD
  {
    input,
    output: {
      ...defaultOutputOptions,
      file: `dist/${pkg.name}.js`,
      format: 'umd',
    },
    external,
    plugins: [
      ...defaultPlugins,
      babel({
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        babelHelpers: 'runtime',
        presets: ['@babel/preset-env', '@babel/preset-react'],
      }),
    ],
  },
  // ES
  {
    input,
    output: [
      {
        ...defaultOutputOptions,
        file: 'dist/esm/index.mjs',
        format: 'esm',
      },
    ],
    external,
    plugins: [
      ...defaultPlugins,
      babel({
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        babelHelpers: 'runtime',
        presets: ['@babel/preset-env', '@babel/preset-react'],
      }),
    ],
  },
  // CJS
  {
    input,
    output: {
      ...defaultOutputOptions,
      file: 'dist/cjs/index.cjs',
      format: 'cjs',
      exports: 'auto',
    },
    external,
    plugins: [
      ...defaultPlugins,
      babel({
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        babelHelpers: 'runtime',
        presets: [
          ['@babel/preset-env', { modules: false }],
          '@babel/preset-react',
        ],
      }),
      commonjs({
        include: /node_modules/,
      }),
    ],
  },
]
