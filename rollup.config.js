import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { dts } from 'rollup-plugin-dts'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

const input = 'src/index.ts'

const defaultOutputOptions = {
  name: pkg.name,
  format: 'umd',
  exports: 'named',
  sourcemap: true,
  globals: {
    '@atproto/api': 'atproto',
    '@atproto/oauth-client-node': 'atproto',
    '@tanstack/react-query': 'tanstack',
    axios: 'axios',
    react: 'React',
    'react/jsx-runtime': 'react/jsx-runtime',
    'react-dom': 'ReactDOM',
  },
  banner: `/*! ${pkg.name} v${pkg.version} !*/`,
  footer: `/* ${pkg.repository.url} | ${pkg.author} */`,
}

const defaultPlugins = [peerDepsExternal(), json(), resolve(), commonjs()]

const external = [
  'react',
  'react-dom',
  '@atproto/api',
  '@atproto/oauth-client-node',
  '@tanstack/react-query',
  'axios',
]

export default [
  // UMD - Minified
  {
    input,
    output: [
      {
        ...defaultOutputOptions,
        file: `dist/${pkg.name}.min.js`,
        format: 'umd',
      },
    ],
    external,
    plugins: [
      ...defaultPlugins,
      typescript({
        tsconfig: './tsconfig.json',
      }),
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
    output: [
      {
        ...defaultOutputOptions,
        file: `dist/${pkg.name}.js`,
        format: 'umd',
      },
    ],
    external,
    plugins: [
      ...defaultPlugins,
      typescript({
        tsconfig: './tsconfig.json',
      }),
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
      typescript({
        tsconfig: './tsconfig.json',
        declarationDir: 'dist/esm/types',
      }),
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
    output: [
      {
        ...defaultOutputOptions,
        file: 'dist/cjs/index.cjs',
        format: 'cjs',
        exports: 'auto',
      },
    ],
    external,
    plugins: [
      ...defaultPlugins,
      typescript({
        tsconfig: './tsconfig.json',
        declarationDir: 'dist/cjs/types',
      }),
      babel({
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        babelHelpers: 'runtime',
        presets: ['@babel/preset-env', '@babel/preset-react'],
      }),
    ],
  },
  {
    input: 'dist/esm/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    external: [/\.css$/],
    plugins: [dts()],
  },
]
