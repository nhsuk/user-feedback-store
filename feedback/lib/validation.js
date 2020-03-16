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
 * Validate the incoming data and return clean data for saving to the database
 * @param {Object} data - Object containing initial response data
 * @param {boolean} data.answer - true for yes, false for no
 * @returns {Object} Cleaned data
 * @throws {ValidationError} error if data format is invalid
 */
module.exports.validateInitialResponse = (data) => {
  const { answer } = data;

  if (answer !== true && answer !== false) {
    throw new ValidationError('answer must be true or false');
  }

  return { answer };
};

/**
 * Validate the incoming data and return clean data for saving to the database
 * @param {Object} data - Object containing initial response data
 * @param {string} data.comment - text comment
 * @returns {Object} Cleaned data
 * @throws {ValidationError} error if data format is invalid
 */
module.exports.validateTextComments = (data) => {
  let { comment } = data;

  if (typeof comment !== 'string') {
    throw new ValidationError('comment must be a string');
  }
  if (comment.length > 1000) {
    throw new ValidationError('comment too long');
  }

  comment = comment.trim();
  return { comment };
};
