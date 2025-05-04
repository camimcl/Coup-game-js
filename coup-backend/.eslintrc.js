module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  settings: {
    'import/resolver': {
      typescript: {},
      node: {
        extensions: [".ts"]
      }
    },
  },
  rules: {
    // enforce single‐quotes and semis
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],

    // TypeScript recommended overrides
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.ts'] }],

    // trailing commas for cleaner diffs
    'comma-dangle': ['error', 'always-multiline'],
  },
};

