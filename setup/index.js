const { handleHealthcheck } = require('../lib/index');

const { createIndexes } = require('../lib/database');

module.exports = async (context, req) => {
  await createIndexes();
  return handleHealthcheck(context, req);
};
