module.exports = [
  {
    ignores: ['node_modules/', 'package-lock.json', 'coverage/']
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        ...require('globals').node
      }
    },
    rules: {
      'eol-last': ['error', 'always'],
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 0, 'maxBOF': 0 }],
      'no-trailing-spaces': 'error',
      'no-undef': 'error',
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always']
    }
  },
  {
    files: ['**/*.test.js', '**/*.spec.js', '__tests__/**/*.js'],
    languageOptions: {
      globals: {
        ...require('globals').jest
      }
    }
  }
];
