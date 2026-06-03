const Filter = require('bad-words');
const filter = new Filter();

function sanitizeUsername(req, res, next) {
  if (req.body.username) {
    req.body.username = filter.clean(req.body.username);
  }
  next();
}

module.exports = { sanitizeUsername };
