const Filter = require('bad-words');
const filter = new Filter();

function sanitizeUsername(req, res, next) {
  if (typeof req.body.username === 'string' && req.body.username) {
    req.body.username = filter.clean(req.body.username);
  }
  next();
}

module.exports = { sanitizeUsername };
