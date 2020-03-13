module.exports = (context, req) => {
  context.log('JavaScript HTTP trigger function processed a request.');

  if (req.query.name || (req.body && req.body.name)) {
    context.done(null, {
      body: `Hello ${req.query.name || req.body.name}`,
    });
  } else {
    context.done(null, {
      body: 'Please pass a name on the query string or in the request body',
      status: 400,
    });
  }
};
