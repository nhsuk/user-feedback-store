/**
 @module lib/database
*/

const mongoClient = require('mongodb').MongoClient;
const { uuid } = require('uuidv4');

const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;
const DB_NAME = 'userfeedback';
const COLLECTION_NAME = 'feedback';

const { validateInitialResponse, validateTextComments } = require('./validation.js');

let dbClient;

/**
 * @returns {Promise} - A promise which returns a mongo database connection
 */
const getDb = async () => {
  if (!dbClient) {
    dbClient = await mongoClient.connect(CONNECTION_STRING);
  }
  return dbClient.db(DB_NAME);
};

/**
 * @returns {Promise} - A promise which returns true for healthy connection, false for unhealthy.
 */
module.exports.healthcheck = async () => {
  try {
    const db = await getDb();
    const result = await db.admin().ping();
    return result.ok === 1;
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    return false;
  }
};

/**
 * @param {Object} data - Data object to be saved into the database
 * @returns {Promise} - A promise which resolves to a unique token
 */
const insertOrUpdate = async (data) => {
  const db = await getDb();
  const collection = db.collection(COLLECTION_NAME);
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
};

/**
 * @param {Object} payload - data to save for the initial response
 * @param {boolean} payload.isSatisfied - is the user satisfied?
 * @param {string} payload.url - URL that the user is commenting on
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
