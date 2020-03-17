const { MongoMemoryServer } = require('mongodb-memory-server');

const mongod = new MongoMemoryServer({
  instance: {
    dbName: 'userfeedback',
    port: 51412,
  },
});

mongod.getUri().then((uri) => {
  // eslint-disable-next-line no-console
  console.info(`mongodb memory server available at ${uri}`);
});
