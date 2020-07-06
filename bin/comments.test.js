/* global expect jest */

const comments = require('./comments.js');

jest.mock('../lib/database.js');

const { getAllComments } = require('../lib/database.js');

const { mockStdout } = require('../tests/mocks.js');

describe('Print a CSV of comments', () => {
  let stdout;

  beforeEach(() => {
    stdout = mockStdout();
  });

  afterEach(() => {
    getAllComments.mockRestore();
    stdout.restore();
  });

  it('contains a header row', async () => {
    getAllComments.mockImplementation(() => []);
    await comments();
    const lines = stdout.readLines();
    const headerValues = lines[0].split(',');
    expect(headerValues).toEqual([
      '"Datetime"',
      '"URL"',
      '"Satisfied"',
      '"Comments"',
    ]);
  });

  it('empty when there are no comments', async () => {
    getAllComments.mockImplementation(() => []);
    await comments();
    const lines = stdout.readLines();
    expect(lines).toHaveLength(2);
    expect(lines[1]).toBe('');
  });

  it('when there is 1 comment', async () => {
    getAllComments.mockImplementation(() => [{
      comments: 'This is a fake test',
      isSatisfied: true,
      timestamp: new Date(0),
      url: 'http://localhost:8080/tests/example/',
    }]);
    await comments();
    const lines = stdout.readLines();
    expect(lines).toHaveLength(3);
    expect(lines[1]).toBe('"1970-01-01T00:00:00.000Z","http://localhost:8080/tests/example/","true","This is a fake test"');
  });

  it('when there are many comments', async () => {
    getAllComments.mockImplementation(() => Array(10).fill({
      comments: 'This is a fake test',
      isSatisfied: true,
      timestamp: new Date(0),
      url: 'http://localhost:8080/tests/example/',
    }));
    await comments();
    const lines = stdout.readLines();
    expect(lines).toHaveLength(12);
  });

  it('passes date filtering arg', async () => {
    getAllComments.mockImplementation(() => []);
    const date = new Date('1994/03/01');
    await comments(date);
    expect(getAllComments).toHaveBeenCalledWith(date);
  });
});
