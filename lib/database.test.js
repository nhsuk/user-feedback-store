/* global expect beforeAll afterAll */

const { MongoClient } = require('mongodb');

const database = require('./database.js');

describe('database', () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(
      global.__MONGO_URI__, // eslint-disable-line no-underscore-dangle
      {
        useNewUrlParser: true,
      }
    );
    db = connection.db('userfeedback');
  });

  beforeEach(async () => {
    await db.collection('feedback').deleteMany({});
  });

  afterAll(async () => {
    await connection.close();
  });

  it('inserts true answer into database', async () => {
    await database.saveInitialResponse({
      isSatisfied: true,
      url: 'https://example.com/my-test-page/',
    });
    const data = await db.collection('feedback').find({}).toArray();
    expect(data.length).toBe(1);
    expect(data[0].isSatisfied).toBe(true);
    expect(data[0].url).toBe('https://example.com/my-test-page/');
  });

  it('inserts false answer into database', async () => {
    await database.saveInitialResponse({
      isSatisfied: false,
      url: 'https://example.com/my-test-page/',
    });
    const data = await db.collection('feedback').find({}).toArray();
    expect(data.length).toBe(1);
    expect(data[0].isSatisfied).toBe(false);
    expect(data[0].url).toBe('https://example.com/my-test-page/');
  });

  it('inserts text comment into database', async () => {
    await database.saveTextComments({ comments: 'More cowbell' });
    const data = await db.collection('feedback').find({}).toArray();
    expect(data.length).toBe(1);
    expect(data[0].comments).toBe('More cowbell');
  });
});
