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

const UUID_REGEX = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;

describe('API endpoint /satisfied/', () => {
  it('returns status ok response', async () => {
    const payload = { isSatisfied: true };
    const response = await axios.post('http://localhost:7071/satisfied/', payload);
    expect(response.status).toEqual(200);
    expect(response.data).toEqual(
      expect.objectContaining({
        status: 'ok',
        token: expect.stringMatching(UUID_REGEX),
      })
    );
  });

  it('saves into the database', async () => {
    const payload = { isSatisfied: true };
    await axios.post('http://localhost:7071/satisfied/', payload);
    const data = await db.collection('feedback').find({}).toArray();
    expect(data.length).toBe(1);
    expect(data[0]).toEqual(
      expect.objectContaining({
        satisfied: true,
      })
    );
  });
});

describe('API endpoint /comments/', () => {
  const getToken = async () => {
    const payload = { isSatisfied: true };
    const response = await axios.post('http://localhost:7071/comments/', payload);
    return response.token;
  };

  it('returns status ok response', async () => {
    const payload = {
      comments: 'Could do with a bit more cowbell.',
      token: await getToken(),
    };
    const response = await axios.post('http://localhost:7071/comments/', payload);
    expect(response.status).toEqual(200);
    expect(response.data).toEqual(
      expect.objectContaining({
        status: 'ok',
        token: expect.stringMatching(UUID_REGEX),
      })
    );

    // token should be unchanged from the input
    expect(response.data.token).toBe(payload.token);
  });

  it('saves into the database', async () => {
    const payload = {
      comments: 'Could do with a bit more cowbell.',
      token: await getToken(),
    };
    await axios.post('http://localhost:7071/comments/', payload);
    const data = await db.collection('feedback').find({}).toArray();
    expect(data.length).toBe(1);

    expect(data[0]).toEqual(
      expect.objectContaining({
        comments: 'Could do with a bit more cowbell.',
      })
    );
  });

  it('is associated with satisfaction response via token', async () => {
    const satisfiedPayload = { isSatisfied: false };
    const response = await axios.post('http://localhost:7071/satisfied/', satisfiedPayload);

    const payload = {
      comments: 'Could do with a bit more cowbell.',
      token: response.token,
    };
    await axios.post('http://localhost:7071/comments/', payload);
    const data = await db.collection('feedback').find({}).toArray();
    expect(data.length).toBe(1);

    // comment data should be associated with the earlier "satisfied" API call
    expect(data[0]).toEqual(
      expect.objectContaining({
        comments: 'Could do with a bit more cowbell.',
        satisfied: false,
      })
    );
  });
});
