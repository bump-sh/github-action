// See: https://rollupjs.org/introduction/

import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

const config = {
  input: 'src/index.ts',
  output: {
    esModule: true,
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    typescript(),
    commonjs({
      // strictRequires: "auto",
      // include: ['node_modules/**'],
      // dynamicRequireTargets: ['node_modules/jsonpath/*.js'],
      // transformMixedEsModules: true,
    }),
    nodeResolve({
      preferBuiltins: true,
      // This is needed for chalk package which doesn't seem to want
      // to fix their browser only code. Cf
      // https://github.com/chalk/chalk/issues/598
      exportConditions: ['node'],
    }),
    json({
      compact: true,
    }),
  ],
};

export default config;
