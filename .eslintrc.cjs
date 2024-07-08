const fs = require('node:fs');

const prettierConfig = fs.readFileSync('./.prettierrc', 'utf8');
const prettierOptions = JSON.parse(prettierConfig);

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
          { group: 'external', pattern: '@polkadot/**', position: 'after' },
          { group: 'sibling', pattern: '@/**', position: 'before' },
        ],
        pathGroupsExcludedImportTypes: [],
      },
    ],
    'sort-imports': ['error', { ignoreDeclarationSort: true }],

    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }
    ],

    'newline-before-return': 'error',
    'prettier/prettier': ['error', prettierOptions],
    'react/no-array-index-key': 'warn',
    'react/display-name': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-sort-props': ['error', { callbacksLast: true, noSortAlphabetically: true }],
    'react/function-component-definition': 'off',
  },
  ignorePatterns: ['.vscode', '.idea', 'coverage', 'node_modules', 'package.json', 'remix-routes.d.ts'],
};
