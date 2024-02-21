const { handleSatisfied } = require('../lib/index');

module.exports = async (context, req) => handleSatisfied(context, req);
