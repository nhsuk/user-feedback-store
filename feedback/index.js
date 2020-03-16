const database = require('./lib/database.js');
const { HttpError } = require('./lib/validation.js');
const responses = require('./lib/responses.js');

module.exports = async (context, req) => {
  if (!req.body) {
    return responses.nodata();
  }

  try {
    await database.saveInitialResponse({
      answer: req.body.answer,
    });
  } catch (err) {
    // only return error message in response if it is a HttpError
    if (err instanceof HttpError) {
      return responses.httpError(err.statusCode, err.message);
    }
    return responses.error500();
  }

  return responses.ok();
};
