module.exports.validateInitialResponse = (data) => {
  const { answer } = data;

  if (answer !== true && answer !== false) {
    throw Error('answer must be true or false');
  }

  return { answer };
};

module.exports.validateTextComments = (data) => {
  let { comment } = data;

  if (typeof comment !== 'string') {
    throw Error('comment must be a string');
  }
  if (comment.length > 1000) {
    throw Error('comment too long');
  }

  comment = comment.trim();
  return { comment };
};
