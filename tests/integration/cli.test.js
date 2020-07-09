/* global expect beforeAll afterAll */
/* eslint-disable no-underscore-dangle */

const MongoClient = require('mongodb');
const csvParse = require('csv-parse');

const cli = require('../../bin/index.js');
const { mockStdout } = require('../mocks.js');

let connection;
let db;

const DATETIME_REGEX = /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z/;

beforeAll(async () => {
  connection = await MongoClient.connect(
    global.__MONGO_CONNECTION_STRING__,
    {
      useNewUrlParser: true,
    }
  );
  db = connection.db('userfeedback');
  await db.collection('feedback').deleteMany({});
  await db.collection('feedback').insertMany([{
    comments: 'This is comment 1',
    isSatisfied: true,
    url: 'https://example.com/1',
  }, {
    comments: 'This is comment 2',
    isSatisfied: false,
    unusedField: 'this is not needed',
    url: 'https://example.com/2',
  }, {
    isSatisfied: true,
    url: 'https://example.com/3',
  }, {
    comments: '',
    isSatisfied: true,
    url: 'https://example.com/4',
  }, {
    isSatisfied: true,
    url: 'https://example.com/4',
  }, {
    isSatisfied: true,
    url: 'https://example.com/4',
  }, {
    isSatisfied: false,
    url: 'https://example.com/4',
  }]);
});

afterAll(async () => {
  await db.collection('feedback').deleteMany({});
  await connection.close();
});

describe('CLI "comments" command', () => {
  let csvError;
  let csvOutput;

  beforeAll(async (done) => {
    const rawOutput = await new Promise((resolve) => {
      const stdout = mockStdout();
      cli
        .onFinishCommand(() => {
          const stdOutString = stdout.read();
          stdout.restore();
          resolve(stdOutString);
        })
        .parse(`comments -c ${global.__MONGO_CONNECTION_STRING__} -s 0`);
    });

    csvParse(rawOutput, (err, output) => {
      csvError = err;
      csvOutput = output;
      done();
    });
  });

  it('is a valid CSV', () => {
    expect(csvError).toBe(undefined);
  });

  it('returns correct number of results', () => {
    expect(csvOutput).toHaveLength(4);
  });

  it('contains timestamps in column 1', () => {
    const column = csvOutput.map((row) => row[0]);
    expect(column[0]).toEqual('Datetime');
    expect(column[1]).toMatch(DATETIME_REGEX);
    expect(column[2]).toMatch(DATETIME_REGEX);
    expect(column[3]).toMatch(DATETIME_REGEX);
  });

  it('contains URLs in column 2', () => {
    const column = csvOutput.map((row) => row[1]);
    expect(column).toEqual([
      'URL',
      'https://example.com/1',
      'https://example.com/2',
      'https://example.com/4',
    ]);
  });

  it('contains satisfaction in column 3', () => {
    const column = csvOutput.map((row) => row[2]);
    expect(column).toEqual([
      'Satisfied',
      'true',
      'false',
      'true',
    ]);
  });

  it('contains comments column 4', () => {
    const column = csvOutput.map((row) => row[3]);
    expect(column).toEqual([
      'Comments',
      'This is comment 1',
      'This is comment 2',
      '',
    ]);
  });
});
