const { handleRequest, requestTypes } = require('../lib/index.js');

module.exports = async (context, req) => handleRequest(context, req, requestTypes.HEALTHCHECK);
