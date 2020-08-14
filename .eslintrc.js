module.exports = {
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'prettier', // disable things that conflict with prettier
  ],
  env: {
    es6: true,
    browser: true,
  },
  plugins: ['svelte3', 'simple-import-sort'],
  overrides: [
    {
      files: ['**/*.svelte'],
      processor: 'svelte3/svelte3',
    },
  ],
  rules: {
    'simple-import-sort/sort': [
      'error',
      {
        groups: [
          // side effect imports
          ['^\\u0000'],
          // library imports
          ['^@?\\w'],
          // app level imports
          ['^(src)'],
          // parent level imports
          ['^[.][.]'],
          // same level import
          ['^[.]'],
        ],
      },
    ],
  },
  settings: {
    // ...
  },
};
