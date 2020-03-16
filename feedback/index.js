const database = require('./lib/database.js');
const { HttpError } = require('./lib/validation.js');
const responses = require('./lib/responses.js');

/**
 * @param {Object} body - body object from the http request
 * @returns {Promise}
 */
const handleBody = async (body) => {
  // If body has an 'answer' key, this is an initial response
  if ('answer' in body) {
    return database.saveInitialResponse({
      answer: body.answer,
    });
  }

  // otherwise, assume text comments
  return database.saveTextComments({
    comment: body.comment,
  });
};

module.exports = async (context, req) => {
  if (!req.body) {
    return responses.nodata();
  }

  try {
    await handleBody(req.body);
  } catch (err) {
    // only return error message in response if it is a HttpError
    if (err instanceof HttpError) {
      return responses.httpError(err.statusCode, err.message);
    }
    return responses.error500();
  }

  return responses.ok();
};
