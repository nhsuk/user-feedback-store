const { getSatisfactionPerURL, closeConnection } = require('../lib/database.js');

module.exports = async (dateSince) => {
  const averages = await getSatisfactionPerURL(dateSince);
  process.stdout.write('URL,satisfied,unsatisfied\n');
  averages.forEach((row) => {
    // eslint-disable-next-line no-underscore-dangle
    process.stdout.write(`"${row._id}",${row.satisfied},${row.unsatisfied}\n`);
  });

  await closeConnection();
};
