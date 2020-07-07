/**
 @module lib/database
*/

const { MongoClient, ObjectID } = require('mongodb');
const { uuid } = require('uuidv4');

const DB_NAME = 'userfeedback';
const COLLECTION_NAME = 'feedback';

const { validateInitialResponse, validateTextComments } = require('./validation.js');

/**
 * Keep a global `client` variable so that we can make multiple database requests with one
 * connection. After all requests are finished, the close() function should be called to close the
 * database connection.
 */
let client = null;

const getConnectionString = () => process.env.MONGO_CONNECTION_STRING;

const getCollection = async () => {
  client = client || await MongoClient.connect(getConnectionString());
  const db = client.db(DB_NAME);
  return db.collection(COLLECTION_NAME);
};

const close = () => {
  client.close();
  client = null;
};

/**
 * @param {Object} data - Data object to be saved into the database
 * @returns {Promise} - A promise which resolves to a unique token
 */
const insertOrUpdate = async (data) => {
  const collection = await getCollection();
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
    close();
  }
};

const getSinceDateQuery = (sinceDate) => {
  const minObjectId = ObjectID.createFromTime(sinceDate.getTime() / 1000);
  return {
    _id: {
      $gt: minObjectId,
    },
  };
};

const getAllData = async (sinceDate = null, extraQuery = {}) => {
  const collection = await getCollection();
  try {
    const fields = {
      comments: 1,
      isSatisfied: 1,
      url: 1,
    };
    const query = {
      ...(sinceDate ? getSinceDateQuery(sinceDate) : {}),
      ...extraQuery,
    };
    const data = await collection.find(query).project(fields).toArray();
    return data.map((row) => ({
      ...row,
      timestamp: ObjectID(row._id).getTimestamp(), // eslint-disable-line no-underscore-dangle
    }));
  } finally {
    close();
  }
};

module.exports.getAll = async () => getAllData();
module.exports.getAllComments = async (sinceDate) => getAllData(sinceDate, {
  comments: {
    $exists: true,
  },
});

/**
 * Get the average satisfaction score for each URL in the collection
 */
module.exports.getSatisfactionPerURL = async () => {
  const collection = await getCollection();
  try {
    const aggregate = [{
      $group: {
        _id: '$url',
        satisfied: {
          $sum: {
            $cond: ['$isSatisfied', 1, 0],
          },
        },
        unsatisfied: {
          $sum: {
            $cond: ['$isSatisfied', 0, 1],
          },
        },
      },
    }];
    return collection.aggregate(aggregate).toArray();
  } finally {
    close();
  }
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
