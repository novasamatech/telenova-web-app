const fs = require('fs');
const path = require('path');

const prettierConfig = fs.readFileSync('./.prettierrc', 'utf8');
const prettierOptions = JSON.parse(prettierConfig);
const checkI18n = process.env.I18N === 'true';
const localePath = path.resolve('./src/common/utils/locales/en.json');

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  globals: {
    JSX: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:@next/next/recommended',
    'plugin:import/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:jest-dom/recommended',
    'plugin:i18n-json/recommended',
    'plugin:i18next/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'prettier', 'import', 'unused-imports', 'jest-dom', 'json'],
  parserOptions: {
    ecmaVersion: 2021,
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {
    'no-unused-vars': 'off',
    'no-irregular-whitespace': 'off',
    'newline-before-return': 'error',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prettier/prettier': ['error', prettierOptions],
    'unused-imports/no-unused-imports': 'error',
    'react/no-array-index-key': 'warn',
    'react/display-name': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-sort-props': ['error', { callbacksLast: true, noSortAlphabetically: true }],
    'react/function-component-definition': 'off',
    'i18n-json/identical-keys': ['error', { filePath: localePath }],
    'i18n-json/identical-placeholders': ['error', { filePath: localePath }],
    'i18next/no-literal-string': [
      checkI18n ? 'error' : 'off',
      {
        mode: 'jsx-text-only',
        'should-validate-template': true,
        'jsx-attributes': {
          include: ['alt', 'aria-label', 'title', 'placeholder', 'label', 'description'],
          exclude: ['data-testid', 'className'],
        },
        callees: {
          exclude: ['Error', 'log', 'warn'],
        },
        words: {
          exclude: ['[0-9!-/:-@[-`{-~]+', '[A-Z_-]+'],
        },
      },
    ],
  },
  ignorePatterns: [
    '.vscode',
    'coverage',
    'release',
    'node_modules',
    'jest-unit-results.json',
    'jest.config.ts',
    'jest.setup.ts',
    'package.json',
    'next.config.js',
  ],
};
