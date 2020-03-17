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

  try {
    if (requestType === requestTypes.SATISFIED) {
      await database.saveInitialResponse({
        isSatisfied: req.body.isSatisfied,
      });
    }
    if (requestType === requestTypes.COMMENTS) {
      await database.saveTextComments({
        comments: req.body.comments,
      });
    }
  } catch (err) {
    // only return error message in response if it is a HttpError
    if (err instanceof HttpError) {
      return responses.httpError(err.statusCode, err.message);
    }
    return responses.error500();
  }

  return responses.ok();
};
