const { MongoMemoryServer } = require('mongodb-memory-server');

const PORT = 51412;

const mongod = new MongoMemoryServer({
  instance: {
    dbName: 'userfeedback',
    port: PORT,
  },
});

(async () => {
  try {
    await mongod.start();
    const uri = await mongod.getUri();
    const actualPort = new URL(uri).port;

   actualPort !== PORT ?
      console.error(`Error: Desired port ${PORT} is not available. Using port ${actualPort} instead.`) : console.info(`MongoDB Memory Server running at ${uri}`);
    
  } catch (error) {
    console.error('Failed to start MongoDB Memory Server:', error);
    await mongod.stop();
    process.exit(1);
  }
})();
