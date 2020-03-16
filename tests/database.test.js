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
    db = await connection.db('userfeedback');
  });

  beforeEach(async () => {
    await db.collection('feedback').deleteMany({});
  });

  afterAll(async () => {
    await connection.close();
    await db.close();
  });

  it('inserts true answer into databas', async () => {
    await database.saveInitialResponse({ answer: true });
    const data = await db.collection('feedback').find({}).toArray();
    expect(data.length).toBe(1);
  });

  it('inserts false answer into databas', async () => {
    await database.saveInitialResponse({ answer: false });
    const data = await db.collection('feedback').find({}).toArray();
    expect(data.length).toBe(1);
  });
});
