/* global expect beforeAll afterAll */

const axios = require('axios');
const MongoClient = require('mongodb');

let connection;
let db;

beforeAll(async () => {
  connection = await MongoClient.connect(
    global.__MONGO_CONNECTION_STRING__, // eslint-disable-line no-underscore-dangle
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

describe('API endpoint /feedback/', () => {
  it('returns status ok response', async () => {
    const payload = { answer: true };
    const response = await axios.post('http://localhost:7071/api/feedback/', payload);
    expect(response.status).toEqual(200);
    expect(response.data).toEqual({ ok: true });
  });

  it('saves into the database', async () => {
    const payload = { answer: true };
    await axios.post('http://localhost:7071/api/feedback/', payload);
    const data = await db.collection('feedback').find({}).toArray();
    expect(data.length).toBe(1);
  });
});
