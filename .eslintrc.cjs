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
    'plugin:effector/recommended',
  ],
  plugins: ['effector', 'import'],
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
      files: ['**/*.test.ts'],
      rules: {
        'no-restricted-properties': 'off',
      },
    },
    {
      files: ['*.tsx'],
      plugins: ['react'],
      extends: ['plugin:react/recommended'],
      rules: {
        'react/jsx-no-useless-fragment': 'error',
        'react/jsx-no-constructed-context-values': 'error',
        'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'ignore' }],
        'react/no-array-index-key': 'warn',
        'react/display-name': 'off',
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/jsx-sort-props': ['error', { callbacksLast: true, noSortAlphabetically: true }],
        'react/function-component-definition': [
          'error',
          {
            namedComponents: 'arrow-function',
            unnamedComponents: 'arrow-function',
          },
        ],
      },
      settings: { react: { version: 'detect' } },
    },
    {
      files: ['*.ts', '*.tsx'],
      plugins: ['@typescript-eslint', 'effector'],
      extends: [
        'plugin:effector/recommended',
        'plugin:effector/scope',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        createDefaultProgram: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',

        // Imports
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
        ],
        // Stricter rules
        'effector/no-watch': 'error',
        'effector/keep-options-order': 'error',

        // Time heavy rules
        'effector/enforce-effect-naming-convention': 'off',
        'effector/enforce-store-naming-convention': 'off',

        'no-restricted-syntax': [
          'error',
          {
            message: 'Replace with "useStoreMap". Getting object members directly from "useUnit" in restricted.',
            selector: 'MemberExpression > CallExpression[callee.name="useUnit"]',
          },
          // effector store naming convention
          {
            message: 'Use effector naming convention for stores.',
            selector: 'VariableDeclarator[init.callee.name=/^createStore|combine$/][id.name!=/^\\$.*/]',
          },
          // effector effect naming convention
          {
            message: 'Use effector naming convention for effects.',
            selector: 'VariableDeclarator[init.callee.name="createEffect"][id.name!=/.*?Fx$/]',
          },
        ],
      },
      settings: {
        'import/resolver': {
          typescript: true,
          node: {
            extensions: ['.ts', '.tsx', '.js'],
          },
        },
      },
    }
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

    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'caughtErrorsIgnorePattern': '^_',
      },
    ],

    'no-restricted-properties': [
      'error',
      {
        'property': '_internal',
        'message': 'It\'s a hidden API for unit testing',
      },
    ],

    'newline-before-return': 'error',
    'react/no-array-index-key': 'warn',
    'react/display-name': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-sort-props': ['error', { callbacksLast: true, noSortAlphabetically: true }],
    'react/function-component-definition': 'off',

  },
  ignorePatterns: ['.vscode', '.idea', 'coverage', 'node_modules', 'package.json', 'remix-routes.d.ts'],
};
