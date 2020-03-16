module.exports.ok = () => ({
  body: {
    ok: true,
  },
});

module.exports.nodata = () => ({
  body: {
    error: 'Please pass a JSON request body',
  },
  status: 400,
});

module.exports.error500 = () => ({
  body: {
    error: 'Something went wrong',
  },
  status: 500,
});

module.exports.httpError = (statusCode, message) => ({
  body: { error: message },
  status: statusCode,
});
