const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const guessLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req, res) => ipKeyGenerator(req.ip || req.connection.remoteAddress),
  handler: (_req, res) => {
    res.status(429).json({
      message: 'Too many guesses. Limit: 10 per minute. Please wait and try again.',
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const winnerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => ipKeyGenerator(req.ip || req.connection.remoteAddress),
  handler: (_req, res) => {
    res.status(429).json({ message: 'Too many leaderboard submissions. Please try again later.' });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { guessLimiter, winnerLimiter };
