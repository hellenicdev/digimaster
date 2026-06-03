const rateLimit = require('express-rate-limit');

const guessLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  handler: (_req, res) => {
    res.status(429).json({
      message: 'Too many guesses. Limit: 10 per minute. Please wait and try again.',
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { guessLimiter };
