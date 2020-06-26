const { getSatisfactionPerURL } = require('../lib/database.js');

module.exports = async () => {
  const averages = await getSatisfactionPerURL();
  process.stdout.write('URL,satisfied,unsatisfied\n');
  averages.forEach((row) => {
    // eslint-disable-next-line no-underscore-dangle
    process.stdout.write(`"${row._id}",${row.satisfied},${row.unsatisfied}\n`);
  });
};
