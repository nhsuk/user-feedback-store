/**
 @module lib/database
*/

const mongoClient = require('mongodb').MongoClient;

const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;
const DB_NAME = 'userfeedback';
const COLLECTION_NAME = 'feedback';

const { validateInitialResponse, validateTextComments } = require('./validation.js');

/**
 * @param {Object} data - Data object to be saved into the database
 * @returns {Promise}
 */
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

/**
 * @param {Object} payload - data to save for the initial response
 * @returns {Promise}
 */
module.exports.saveInitialResponse = (payload) => {
  const data = validateInitialResponse(payload);
  return insert(data);
};

/**
 * @param {Object} payload - data to save for the text comment response
 * @param {string} payload.comments - Text comments
 * @returns {Promise}
 */
module.exports.saveTextComments = (payload) => {
  const data = validateTextComments(payload);
  return insert(data);
};
