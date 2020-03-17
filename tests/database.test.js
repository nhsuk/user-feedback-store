/* global expect beforeAll afterAll */

const { MongoClient } = require('mongodb');

const database = require('../feedback/lib/database.js');

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
    await database.saveInitialResponse({ answer: true });
    const data = await db.collection('feedback').find({}).toArray();
    expect(data.length).toBe(1);
    expect(data[0].answer).toBe(true);
  });

  it('inserts false answer into database', async () => {
    await database.saveInitialResponse({ answer: false });
    const data = await db.collection('feedback').find({}).toArray();
    expect(data.length).toBe(1);
    expect(data[0].answer).toBe(false);
  });

  it('inserts text comment into database', async () => {
    await database.saveTextComments({ comment: 'More cowbell' });
    const data = await db.collection('feedback').find({}).toArray();
    expect(data.length).toBe(1);
    expect(data[0].comment).toBe('More cowbell');
  });
});
