const { handleHealthcheck } = require('../lib/index');

module.exports = async (context, req) => handleHealthcheck(context, req);
