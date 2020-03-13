const mongoClient = require('mongodb').MongoClient;

const CONNECTION_STRING = 'mongodb://localhost';
const DB_NAME = 'userfeedback';
const COLLECTION_NAME = 'feedback';

const { validateInitialResponse, validateTextComments } = require('./validation.js');

const insert = (data) => mongoClient.connect(CONNECTION_STRING).then((client) => {
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  return collection.insertOne(data);
});

module.exports.saveInitialResponse = async (payload) => {
  const data = validateInitialResponse(payload);
  return insert(data);
};

module.exports.saveTextComments = async (payload) => {
  const data = validateTextComments(payload);

  return insert(data);
};
