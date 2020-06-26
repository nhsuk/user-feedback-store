const yargs = require('yargs');

const getComments = require('./comments.js');
const getAverages = require('./averages.js');

const setEnvVars = (args) => {
  process.env.MONGO_CONNECTION_STRING = args['connection-string'];
};

yargs
  .env()
  .option('connection-string', {
    alias: 'c',
    demandOption: true,
    describe: 'Mongo database connection string. e.g mongodb://localhost',
    requiresArg: true,
    type: 'string',
  })
  .command(
    'comments',
    'Get a CSV of user comments',
    () => {},
    (args) => {
      setEnvVars(args);
      getComments();
    }
  )
  .command(
    'averages',
    'Get a CSV of average satisfaction scores',
    () => {},
    (args) => {
      setEnvVars(args);
      getAverages();
    }
  )
  .demandCommand(1, 'You need at least one command')
  .strictCommands()
  .help()
  .parse();
