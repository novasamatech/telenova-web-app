const fs = require('node:fs');
const path = require('node:path');

const prettierConfig = fs.readFileSync('./.prettierrc', 'utf8');
const prettierOptions = JSON.parse(prettierConfig);
const checkI18n = process.env.I18N === 'true';
const localesDir = './src/common/utils/locales';
const enLocalePath = path.resolve(localesDir, 'en.json');

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  globals: {
    JSX: 'readonly',
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:import/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier',
  ],
  plugins: ['prettier', 'import'],
  parserOptions: { ecmaVersion: 2022 },
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: {},
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/eslint-recommended', 'plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            prefer: 'type-imports',
            fixStyle: 'inline-type-imports',
          },
        ],
      },
    },
    {
      files: ['**/*.json'],
      plugins: ['json'],
    },
    {
      files: [`${localesDir}/*.json`],
      plugins: ['plugin:i18n-json/recommended'],
      extends: ['plugin:i18next/recommended'],
      rules: {
        'i18n-json/identical-keys': ['error', { filePath: enLocalePath }],
        'i18n-json/identical-placeholders': ['error', { filePath: enLocalePath }],
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
    },
  ],
  rules: {
    'import/order': [
      'error',
      {
        alphabetize: { order: 'asc' },
        groups: ['type', 'builtin', 'external', 'parent', ['sibling', 'index']],
        'newlines-between': 'always',
        pathGroups: [
          { group: 'external', pattern: 'react**', position: 'before' },
          { group: 'external', pattern: '@remix-run/**', position: 'before' },
          { group: 'external', pattern: '@polkadot/**', position: 'before' },
          { group: 'sibling', pattern: '@/**', position: 'before' },
        ],
        pathGroupsExcludedImportTypes: [],
      },
    ],
    'sort-imports': ['error', { ignoreDeclarationSort: true }],

    'newline-before-return': 'error',
    'prettier/prettier': ['error', prettierOptions],
    'react/no-array-index-key': 'warn',
    'react/display-name': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-sort-props': ['error', { callbacksLast: true, noSortAlphabetically: true }],
    'react/function-component-definition': 'off',
  },
  ignorePatterns: ['.vscode', '.idea', 'coverage', 'node_modules', 'package.json'],
};
