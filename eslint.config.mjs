export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['src/**/*.js', '*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',
      globals: {
        chrome: 'readonly',
        CoverAPI: 'readonly',
        CoverClipboard: 'readonly',
        CoverPrompt: 'readonly',
        CoverCandidateProfile: 'readonly',
        CoverJobParser: 'readonly',
        ENV: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(?:_|e|error)$',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
];
