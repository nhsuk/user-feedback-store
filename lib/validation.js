/* eslint-disable max-classes-per-file */
/**
 @module lib/validation
*/

/**
 * Raise a HttpError when the error message should be returned to the client
 */
class HttpError extends Error {
  constructor(code, message) {
    super(message);
    this.statusCode = code;
  }
}

module.exports.HttpError = HttpError;

/**
 * A HttpError with a http status of 400
 */
class ValidationError extends HttpError {
  constructor(message) {
    super(400, message);
  }
}

module.exports.ValidationError = ValidationError;

/**
 * Validates if a given test string is a valid URL
 * @param {string} test - The string to test
 * @returns {boolean} - True if the test string is a valid URL, otherwise false.
 */
const isValidUrl = (test) => {
  try {
    new URL(test); // eslint-disable-line no-new
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Validate the incoming data and return clean data for saving to the database
 * @param {Object} data - Object containing initial response data
 * @param {boolean} data.isSatisfied - true for yes, false for no
 * @returns {Object} Cleaned data
 * @throws {ValidationError} error if data format is invalid
 */
module.exports.validateInitialResponse = (data) => {
  const { isSatisfied, token, url } = data;

  if (isSatisfied !== true && isSatisfied !== false) {
    throw new ValidationError('isSatisfied must be true or false');
  }

  if (!isValidUrl(url)) {
    throw new ValidationError('url must be a valid URL');
  }

  return { isSatisfied, token, url };
};

/**
 * Validate the incoming data and return clean data for saving to the database
 * @param {Object} data - Object containing initial response data
 * @param {string} data.comment - text comment
 * @returns {Object} Cleaned data
 * @throws {ValidationError} error if data format is invalid
 */
module.exports.validateTextComments = (data) => {
  let { comments } = data;
  const { token } = data;

  if (typeof comments !== 'string') {
    throw new ValidationError('comments must be a string');
  }
  if (comments.length > 1000) {
    throw new ValidationError('comments too long');
  }

  comments = comments.trim();
  return { comments, token };
};
