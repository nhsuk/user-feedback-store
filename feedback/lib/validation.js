/* eslint-disable max-classes-per-file */

class HttpError extends Error {
  constructor(code, message) {
    super(message);
    this.statusCode = code;
  }
}

module.exports.HttpError = HttpError;

class ValidationError extends HttpError {
  constructor(message) {
    super(400, message);
  }
}

module.exports.ValidationError = ValidationError;

module.exports.validateInitialResponse = (data) => {
  const { answer } = data;

  if (answer !== true && answer !== false) {
    throw new ValidationError('answer must be true or false');
  }

  return { answer };
};

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
