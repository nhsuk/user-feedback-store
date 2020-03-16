const mongoClient = require('mongodb').MongoClient;

const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;
const DB_NAME = 'userfeedback';
const COLLECTION_NAME = 'feedback';

const { validateInitialResponse, validateTextComments } = require('./validation.js');

const insert = async (data) => {
  const client = await mongoClient.connect(CONNECTION_STRING);
  try {
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    return collection.insertOne(data);
  } catch (err) {
    return err;
  } finally {
    await client.close();
  }
};

module.exports.saveInitialResponse = async (payload) => {
  const data = validateInitialResponse(payload);
  return insert(data);
};

module.exports.saveTextComments = async (payload) => {
  const data = validateTextComments(payload);

  return insert(data);
};
