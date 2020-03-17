const database = require('./database.js');
const { HttpError } = require('./validation.js');
const responses = require('./responses.js');

const requestTypes = {
  COMMENTS: 'COMMENTS',
  SATISFIED: 'SATISFIED',
};

module.exports.requestTypes = requestTypes;

/**
 * @param {Object} context - See azure function context documentation
 * @param {Object} req - See azure function request documentation
 * @param {string} requestType - requestTypes enum value representing which type of request this is
 * @returns {Object} response object
 */
module.exports.handleRequest = async (context, req, requestType) => {
  if (!req.body) {
    return responses.nodata();
  }

  let token = req.body.token || null;

  try {
    if (requestType === requestTypes.SATISFIED) {
      token = await database.saveInitialResponse({
        isSatisfied: req.body.isSatisfied,
        token,
      });
    }
    if (requestType === requestTypes.COMMENTS) {
      token = await database.saveTextComments({
        comments: req.body.comments,
        token,
      });
    }
  } catch (err) {
    // only return error message in response if it is a HttpError
    if (err instanceof HttpError) {
      return responses.httpError(err.statusCode, err.message);
    }
    context.log('500 ERROR:', err.message);
    return responses.error500();
  }

  return responses.ok(token);
};
