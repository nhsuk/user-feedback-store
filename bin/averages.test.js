/* global expect jest */

const averages = require('./averages');

jest.mock('../lib/database');

const { getSatisfactionPerURL } = require('../lib/database');

const { mockStdout } = require('../tests/mocks');

describe('Print a CSV of average satisfaction scores', () => {
  let stdout;

  beforeEach(() => {
    stdout = mockStdout();
  });

  afterEach(() => {
    getSatisfactionPerURL.mockRestore();
    stdout.restore();
  });

  it('contains a header row', async () => {
    getSatisfactionPerURL.mockImplementation(() => []);
    await averages();
    const lines = stdout.readLines();
    const headerValues = lines[0].split(',');
    expect(headerValues).toEqual([
      'URL',
      'satisfied',
      'unsatisfied',
    ]);
    getSatisfactionPerURL.mockRestore();
  });

  it('empty when there are no urls', async () => {
    getSatisfactionPerURL.mockImplementation(() => []);
    await averages();
    const lines = stdout.readLines();
    expect(lines.length).toBe(2);
    expect(lines[1]).toBe('');
    getSatisfactionPerURL.mockRestore();
  });

  it('when there is a url', async () => {
    getSatisfactionPerURL.mockImplementation(() => [{
      _id: 'http://localhost:8080/tests/example/',
      satisfied: 1,
      unsatisfied: 2,
    }]);
    await averages();
    const lines = stdout.readLines();
    expect(lines.length).toBe(3);
    expect(lines[1]).toBe('"http://localhost:8080/tests/example/",1,2');
  });
});
