/**
 @module lib/database
*/

const { MongoClient, ObjectID } = require('mongodb');
const { uuid } = require('uuidv4');

const DB_NAME = 'userfeedback';
const COLLECTION_NAME = 'feedback';

const { validateInitialResponse, validateTextComments } = require('./validation.js');

let dbClient;

/**
 * @returns {Promise} - A promise which returns a mongo database connection
 */
const getDb = async () => {
  const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;
  if (!dbClient) {
    dbClient = await MongoClient.connect(CONNECTION_STRING, {
      useUnifiedTopology: true,
    });
  }
  return dbClient.db(DB_NAME);
};

/**
 * Close the mongodb connection.
 * This function usually shouldn't be used by application code since we want to re-use connections.
 * It is useful for closing database connections between tests.
 */
module.exports.closeConnection = async () => {
  if (!dbClient) {
    return;
  }
  await dbClient.close();
  dbClient = null;
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
 * Create database indexes. This function only needs to be run once, but should
 * also be idempotent so that running multiple times doesn't error.
 */
module.exports.createIndexes = async () => {
  const db = await getDb();
  const collection = db.collection(COLLECTION_NAME);

  // Create an index on the "token" field. This field is used to match requests.
  // It needs to be indexed for efficient update operations
  await collection.createIndexes({ token: 1 });
};

/**
 * @param {Object} data - Data object to be saved into the database
 * @returns {Promise} - A promise which resolves to a unique token
 */
const insert = async (data) => {
  const db = await getDb();
  const collection = db.collection(COLLECTION_NAME);

  const token = data.token || uuid();
  await collection.insertOne({
    ...data,
    token,
  });
  return token;
};

/**
 *
 * @param {Object} data - Data object to be saved into the database
 * @returns {Promise} - A promise which resolves to a unique token
 */
const update = async (data) => {
  const db = await getDb();
  const collection = db.collection(COLLECTION_NAME);

  const token = data.token || uuid();
  const filter = { token };
  const options = { upsert: true };
  await collection.updateOne(filter, { $set: data }, options);
  return token;
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
  const db = await getDb();
  const collection = db.collection(COLLECTION_NAME);
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
module.exports.getSatisfactionPerURL = async (sinceDate = null) => {
  const db = await getDb();
  const collection = db.collection(COLLECTION_NAME);
  const aggregate = [{
    $match: {
      ...(sinceDate ? getSinceDateQuery(sinceDate) : {}),
    },
  },
  {
    $addFields: {
      // Strip URL querystring and hash fragment by splitting the string with $split into
      // an array and selecting the first part with $arrayElemAt.
      // Then convert to lower case
      url: { $toLower: { $arrayElemAt: [{ $split: [{ $arrayElemAt: [{ $split: ['$url', '#'] }, 0] }, '?'] }, 0] } },
    },
  },
  {
    $group: {
      // Group by URL
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
  }, {
    $sort: {
      _id: 1,
    },
  }];
  return collection.aggregate(aggregate).toArray();
};

/**
 * @param {Object} payload - data to save for the initial response
 * @param {boolean} payload.isSatisfied - is the user satisfied?
 * @param {string} payload.url - URL that the user is commenting on
 * @returns {Promise}
 */
module.exports.saveInitialResponse = (payload) => {
  const data = validateInitialResponse(payload);
  const token = insert(data);
  return token;
};

/**
 * @param {Object} payload - data to save for the text comment response
 * @param {string} payload.comments - Text comments
 * @returns {Promise}
 */
module.exports.saveTextComments = (payload) => {
  const data = validateTextComments(payload);
  const token = update(data);
  return token;
};
