const { handleHealthcheck } = require('../lib/index.js');

module.exports = async (context, req) => handleHealthcheck(context, req);
