module.exports = {
  settings: {
    react: {
      version: 'detect',
    },
  },
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prefer-arrow', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['tsconfig.json'],
  },
  rules: {
    'default-case': 'error',
    'default-case-last': 'error',
    'no-fallthrough': 'warn',
    'no-console': 'warn',
    'no-nested-ternary': 'error',
    'object-property-newline': 'error',
    'prefer-arrow/prefer-arrow-functions': 'error',
  },
  overrides: [
    {
      files: ['*.tsx', '*.jsx'],
      rules: {
        'react/jsx-no-leaked-render': [
          'error',
          {
            validStrategies: ['coerce'],
          },
        ],
        'react/jsx-no-script-url': 'error',
        'react/jsx-no-useless-fragment': 'error',
        'react/jsx-pascal-case': 'error',
        'react/jsx-uses-react': 'error',
        'react/no-typos': 'error',
        'react/react-in-jsx-scope': 'off',
        'react/style-prop-object': 'error',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/consistent-type-imports': [
          'warn',
          {
            fixStyle: 'separate-type-imports',
            prefer: 'type-imports',
          },
        ],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
            ignoreRestSiblings: true,
            varsIgnorePattern: '^_',
          },
        ],
      },
    },
  ],
};