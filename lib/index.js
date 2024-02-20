const database = require('./database');
const { HttpError } = require('./validation');
const responses = require('./responses');

const handleError = (err) => {
  // only return error message in response if it is a HttpError
  if (err instanceof HttpError) {
    return responses.httpError(err.statusCode, err.message);
  }
  console.error('500 ERROR:', err.message); // eslint-disable-line no-console
  return responses.error500();
};

module.exports.handleHealthcheck = async () => {
  const healthy = await database.healthcheck();
  if (!healthy) {
    return responses.httpError(503, 'Service unavailable');
  }

  return responses.healthcheckOk();
};

module.exports.handleSatisfied = async (context, req) => {
  if (!req.body) {
    return responses.nodata();
  }
  let token = req.body.token || null;
  try {
    token = await database.saveInitialResponse({
      isSatisfied: req.body.isSatisfied,
      token,
      url: req.body.url,
    });
  } catch (err) {
    return handleError(err);
  }
  return responses.ok(token);
};

module.exports.handleComments = async (context, req) => {
  if (!req.body) {
    return responses.nodata();
  }
  let token = req.body.token || null;
  try {
    token = await database.saveTextComments({
      comments: req.body.comments,
      token,
    });
  } catch (err) {
    return handleError(err);
  }
  return responses.ok(token);
};
