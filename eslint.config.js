import tseslint from 'typescript-eslint';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  { ignores: ['dist/', 'lib/', 'coverage/', 'tmp/', 'jest.config.js'] },
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommended, prettierRecommended],
    rules: {
      'padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: 'multiline-expression',
          next: 'multiline-expression',
        },
      ],
    },
  },
);
