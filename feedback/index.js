const database = require('./lib/database.js');

module.exports = async (context, req) => {
  if (req.body) {
    try {
      await database.saveInitialResponse({
        answer: req.body.answer,
      });
    } catch (err) {
      context.done(null, {
        body: { error: err.message },
        status: 400,
      });
    }

    context.done(null, {
      body: '',
    });
  } else {
    context.done(null, {
      body: 'Please pass a JSON request body',
      status: 400,
    });
  }
};
