const { handleRequest, requestTypes } = require('../lib/index.js');

module.exports = (context, req) => handleRequest(context, req, requestTypes.COMMENTS);
