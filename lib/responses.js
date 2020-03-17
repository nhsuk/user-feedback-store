/**
 * @module lib/responses
 * @desc Library of HTTP responses that the app can respond with.
 * Response objects should follow the azure-function response format
 * https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node#response-object
 *
 */

/**
 * HTTP 200 ok response.
 * @param {string} token - UUIDv4 token
 * @returns {Object}
 */
module.exports.ok = (token) => ({
  body: {
    status: 'ok',
    token,
  },
});

/**
 * Request did not contain any data.
 * @returns {Object}
 */
module.exports.nodata = () => ({
  body: {
    error: 'Please pass a JSON request body',
  },
  status: 400,
});

/**
 * Something went wrong. Return 500 with a generic message
 * @returns {Object}
 */
module.exports.error500 = () => ({
  body: {
    error: 'Something went wrong',
  },
  status: 500,
});

/**
 * Http error with message returned to client.
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message to return in the http response
 * @returns {Object}
 */
module.exports.httpError = (statusCode, message) => ({
  body: { error: message },
  status: statusCode,
});
