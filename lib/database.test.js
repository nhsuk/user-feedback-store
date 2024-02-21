/* global expect beforeAll afterAll */

const { MongoClient } = require('mongodb');

const database = require('./database');

let connection;
let db;

beforeAll(async () => {
  connection = await MongoClient.connect(
    global.__MONGO_URI__ // eslint-disable-line no-underscore-dangle
  );
  db = connection.db('userfeedback');
});

afterAll(async () => {
  // Close the connection used by tests to set up data
  await connection.close();

  // Close the connection used by the application
  await database.closeConnection();
});

expect.extend({
  // `received` should be a date object within `millisecond` of the `target`
  toBeWithinMilliseconds(received, target, millisecond) {
    const pass = Math.abs(received.valueOf() - target.valueOf()) < millisecond;
    if (pass) {
      return {
        message: () => `Expected ${received} not to be within ${millisecond} milliseconds of ${target}`,
        pass: true,
      };
    }

    return {
      message: () => `Expected ${received} to be within ${millisecond} of ${target}`,
      pass: false,
    };
  },
});

describe('database inserts', () => {
  afterEach(async () => {
    await db.collection('feedback').deleteMany({});
  });

  it('inserts true answer into database', async () => {
    await database.saveInitialResponse({
      isSatisfied: true,
      url: 'https://example.com/my-test-page/',
    });
    const data = await db.collection('feedback').find({}).toArray();
    expect(data).toHaveLength(1);
    expect(data[0].isSatisfied).toBe(true);
    expect(data[0].url).toBe('https://example.com/my-test-page/');
  });

  it('inserts false answer into database', async () => {
    await database.saveInitialResponse({
      isSatisfied: false,
      url: 'https://example.com/my-test-page/',
    });
    const data = await db.collection('feedback').find({}).toArray();
    expect(data).toHaveLength(1);
    expect(data[0].isSatisfied).toBe(false);
    expect(data[0].url).toBe('https://example.com/my-test-page/');
  });

  it('inserts text comment into database', async () => {
    await database.saveTextComments({ comments: 'More cowbell' });
    const data = await db.collection('feedback').find({}).toArray();
    expect(data).toHaveLength(1);
    expect(data[0].comments).toBe('More cowbell');
  });
});

describe('database select', () => {
  let insertTime;
  beforeAll(async () => {
    await db.collection('feedback').deleteMany({});

    // record the time of DB insert for use in tests. This time is only approximate
    insertTime = new Date();

    await db.collection('feedback').insertMany([
      {
        comments: 'This is comment 1',
        isSatisfied: true,
        url: 'https://example.com/1',
      },
      {
        comments: 'This is comment 2',
        isSatisfied: false,
        unusedField: 'this is not needed',
        url: 'https://example.com/2',
      },
      {
        isSatisfied: true,
        url: 'https://example.com/3',
      },
      {
        comments: '',
        isSatisfied: true,
        url: 'https://example.com/4',
      },
    ]);
  });

  describe('getAll', () => {
    it('gets all rows', async () => {
      const data = await database.getAll();
      expect(data).toHaveLength(4);
    });

    it('selects relevant fields', async () => {
      const data = await database.getAll();
      expect(data[0]).toMatchObject({
        comments: 'This is comment 1',
        isSatisfied: true,
        url: 'https://example.com/1',
      });
    });

    it('only selects relevant fields', async () => {
      const data = await database.getAll();
      expect(data[1]).not.toHaveProperty('unusedField');
    });

    it('returns a timestamp for each row', async () => {
      const data = await database.getAll();
      expect(data[0].timestamp).toBeInstanceOf(Date);

      // timestamps should be roughly the time that the insert operation happened
      expect(data[0].timestamp).toBeWithinMilliseconds(insertTime, 1000);
      expect(data[1].timestamp).toBeWithinMilliseconds(insertTime, 1000);
    });
  });

  describe('getAllComments', () => {
    it('only returns rows that contain comments', async () => {
      const data = await database.getAllComments();
      const urls = data.map((row) => row.url);
      expect(urls).toContain('https://example.com/1');
      expect(urls).toContain('https://example.com/2');
      expect(urls).not.toContain('https://example.com/3');
      expect(urls).toContain('https://example.com/4');
    });

    it('filters by "since" date', async () => {
      // Filtering by a future date should return zero items.
      const futureDate = new Date(new Date().valueOf() + 2000); // Now, plus 2 seconds
      const nodata = await database.getAllComments(futureDate);
      expect(nodata).toHaveLength(0);

      // Filtering by a long-past date should return all items.
      const pastDate = new Date('1990-12-20'); // The date that Tim Berners-Lee published the first website
      const data = await database.getAllComments(pastDate);
      expect(data).toHaveLength(3);
    });
  });

  describe('getSatisfactionPerURL', () => {
    beforeAll(async () => {
      await db.collection('feedback').deleteMany({});
      await db.collection('feedback').insertMany([
        {
          isSatisfied: true,
          url: 'https://example.com/1?query=a',
        },
        {
          isSatisfied: false,
          url: 'https://example.com/1?query=b&foo=bar',
        },
        {
          isSatisfied: true,
          url: 'https://example.com/2?query=c#an-anchor',
        },
        {
          isSatisfied: true,
          url: 'https://example.com/2?query=d',
        },
        {
          isSatisfied: true,
          url: 'https://example.com/2#an-anchor',
        },
      ]);
    });

    it('returns one row per unique url', async () => {
      const data = await database.getSatisfactionPerURL();
      expect(data).toHaveLength(2);
    });

    it('url returned as _id', async () => {
      const data = await database.getSatisfactionPerURL();
      expect(data[0]).toHaveProperty('_id');
    });

    it('returns aggregated satisfaction scores', async () => {
      const data = await database.getSatisfactionPerURL();

      /* eslint-disable no-underscore-dangle */
      const [url1] = data.filter((row) => row._id === 'https://example.com/1');
      const [url2] = data.filter((row) => row._id === 'https://example.com/2');
      /* eslint-enable no-underscore-dangle */

      expect(url1).toHaveProperty('satisfied', 1);
      expect(url1).toHaveProperty('unsatisfied', 1);
      expect(url2).toHaveProperty('satisfied', 3);
      expect(url2).toHaveProperty('unsatisfied', 0);
    });

    it('returns URLs in alphabetical order', async () => {
      const data = await database.getSatisfactionPerURL();

      /* eslint-disable no-underscore-dangle */
      expect(data[0]._id).toEqual('https://example.com/1');
      expect(data[1]._id).toEqual('https://example.com/2');
      /* eslint-enable no-underscore-dangle */
    });

    it('URLs are lower-cased', async () => {
      await db.collection('feedback').deleteMany({});
      await db.collection('feedback').insertMany([
        {
          isSatisfied: true,
          url: 'https://EXAMPLE.COM/',
        },
        {
          isSatisfied: true,
          url: 'https://example.com/',
        },
      ]);

      const data = await database.getSatisfactionPerURL();
      expect(data).toHaveLength(1);
    });
  });
});
