module.exports = {
  preset: '@shelf/jest-mongodb',
  rootDir: './../../',
  setupFiles: ['./tests/unit/setup.js'],
  testMatch: ['<rootDir>/{lib,bin}/**/*.test.js'],
};
