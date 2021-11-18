const yargs = require('yargs');

const getComments = require('./comments.js');
const getAverages = require('./averages.js');

const setEnvVars = (args) => {
  process.env.MONGO_CONNECTION_STRING = args['connection-string'];
};

const getSinceOption = (returnedDataType) => yargs.option('since', {
  alias: 's',
  demandOption: true,
  describe: `Earliest datetime to retrieve ${returnedDataType} from, in seconds since Epoch time.`,
  requiresArg: true,
  type: 'number',
});

const cli = yargs
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
    () => getSinceOption('comments'),
    async (args) => {
      setEnvVars(args);
      // The `since` option is in seconds, but Date requires milliseconds so multiply by 1000.
      const dateSince = new Date(args.since * 1000);
      await getComments(dateSince);
    }
  )
  .command(
    'averages',
    'Get a CSV of average satisfaction scores',
    () => getSinceOption('averages'),
    async (args) => {
      setEnvVars(args);
      // The `since` option is in seconds, but Date requires milliseconds so multiply by 1000.
      const dateSince = new Date(args.since * 1000);
      await getAverages(dateSince);
    }
  )
  .demandCommand(1, 'You need at least one command')
  .strictCommands()
  .help();

if (require.main === module) {
  // If this module is executed directly, run the yargs CLI.
  cli.parse();
} else {
  // Otherwise, this module has been require()'d, so return the yargs object.
  module.exports = cli;
}
