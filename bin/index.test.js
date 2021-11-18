/* global expect jest */

const cli = require('./index.js');

jest.mock('./comments.js');
jest.mock('./averages.js');

const getComments = require('./comments.js');
const getAverages = require('./averages.js');

describe('CLI', () => {
  it('returns help text by default', (done) => {
    cli.parse('', (err, stdout, stderr) => {
      expect(stderr).toMatch('You need at least one command');
      done();
    });
  });
});

describe('Comments CLI command', () => {
  beforeEach(() => {
    getComments.mockClear();
  });

  it('requires the --connection-string or -c argument', (done) => {
    cli.parse('comments', (err, argv, output) => {
      expect(output).toMatch(/Missing required argument(s?):.* connection-string/);
      done();
    });
  });

  it('requires --since or -s argument', (done) => {
    cli.parse('comments', (err, argv, output) => {
      expect(output).toMatch(/Missing required argument(s?):.* since/);
      done();
    });
  });

  it('Runs the comments command', (done) => {
    cli.parse('comments -c mongodb://localhost -s 0', (err, argv, output) => {
      expect(getComments).toHaveBeenCalledWith(new Date(0));
      expect(output).toBe('');
      done();
    });
  });
});

describe('Averages CLI command', () => {
  beforeEach(() => {
    getAverages.mockClear();
  });

  it('requires the --connection-string or -c argument', (done) => {
    cli.parse('averages', (err, argv, output) => {
      expect(output).toMatch(/Missing required argument(s?):.* connection-string/);
      done();
    });
  });

  it('Runs the averages command', (done) => {
    cli.parse('averages -c mongodb://localhost -s 0', (err, argv, output) => {
      expect(getAverages).toHaveBeenCalledWith(new Date(0));
      expect(output).toBe('');
      done();
    });
  });
});
