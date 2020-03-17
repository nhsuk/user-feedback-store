/**
 @module lib/database
*/

const mongoClient = require('mongodb').MongoClient;
const { uuid } = require('uuidv4');

const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;
const DB_NAME = 'userfeedback';
const COLLECTION_NAME = 'feedback';

const { validateInitialResponse, validateTextComments } = require('./validation.js');

/**
 * @param {Object} data - Data object to be saved into the database
 * @returns {Promise} - A promise which resolves to a unique token
 */
const insertOrUpdate = async (data) => {
  const client = await mongoClient.connect(CONNECTION_STRING);
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  try {
    if (data.token) {
      const filter = { token: data.token };
      const options = { upsert: true };
      await collection.updateOne(filter, { $set: data }, options);
      return data.token;
    }

    const token = uuid();
    await collection.insertOne({
      ...data,
      token,
    });
    return token;
  } finally {
    client.close();
  }
};

/**
 * @param {Object} payload - data to save for the initial response
 * @returns {Promise}
 */
module.exports.saveInitialResponse = (payload) => {
  const data = validateInitialResponse(payload);
  const token = insertOrUpdate(data);
  return token;
};

/**
 * @param {Object} payload - data to save for the text comment response
 * @param {string} payload.comments - Text comments
 * @returns {Promise}
 */
module.exports.saveTextComments = (payload) => {
  const data = validateTextComments(payload);
  const token = insertOrUpdate(data);
  return token;
};
