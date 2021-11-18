const { handleHealthcheck } = require('../lib/index.js');

const { createIndexes } = require('../lib/database.js');

module.exports = async (context, req) => {
  await createIndexes();
  return handleHealthcheck(context, req);
};
