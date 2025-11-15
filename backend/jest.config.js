module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/scripts/**'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ]
};
