const { MongoMemoryServer } = require('mongodb-memory-server');

const PORT = 51412;

const mongod = new MongoMemoryServer({
  instance: {
    dbName: 'userfeedback',
    port: PORT,
  },
});

// Make sure that the correct port could be used and we haven't fallen-back to a random port number.
mongod.getPort().then((port) => {
  if (port !== PORT) {
    mongod.stop();
    // eslint-disable-next-line no-console
    console.error(`Error: port ${PORT} is not available. Do you already have this server running?`);
    process.exit(1);
  }

  mongod.getUri().then((uri) => {
    // eslint-disable-next-line no-console
    console.info(`mongodb memory server available at ${uri}`);
  });
});
