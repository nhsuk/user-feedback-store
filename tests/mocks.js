/* global jest */
/* eslint-disable import/prefer-default-export */

/**
 * Attach a mock function to process.stdout.write which stores all output.
 * Returns an object which can be used to read output and stop the mocking.
 *
 * Usage:
 * ```
 * const stdout = mockStdout(); // Start the mock
 * const output = stdout.read(); // Read all stdout since starting the mock. Returns string
 * const lines = stdout.readLines() // Read all stdout, split by newline. Returns array
 * stdout.restore(); // Stop the mock
 * ```
 */
module.exports.mockStdout = () => {
  let stdout = '';
  const mock = jest.spyOn(process.stdout, 'write').mockImplementation((data) => {
    stdout += data;
  });
  return {
    mock,
    read: () => stdout,
    readLines: () => stdout.split('\n'),
    restore: () => {
      stdout = '';
      mock.mockRestore();
    },
  };
};
