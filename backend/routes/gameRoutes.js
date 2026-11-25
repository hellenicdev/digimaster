const express = require('express');
const router = express.Router();
const GameState = require('../models/GameState');
const Winner = require('../models/Winner');
const { checkGuess, saveWinner, redeemWinToken, lastRotation } = require('../services/gameService');
const { validateGuess } = require('../middleware/validation');
const { sanitizeUsername } = require('../middleware/profanity');
const { guessLimiter, winnerLimiter } = require('../middleware/rateLimiter');
const { verifyTurnstile } = require('../middleware/turnstile');

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

router.get('/status', async (_req, res) => {
  try {
    const game = await GameState.findOne();
    if (!game) {
      return res.status(200).json({
        lastChanged: new Date().toISOString(),
        hoursRemaining: 12,
      });
    }

    const changed = lastRotation(game);
    const elapsed = Date.now() - changed.getTime();
    const hoursRemaining = Math.max(0, (TWELVE_HOURS_MS - elapsed) / 1000 / 60 / 60);

    res.json({
      lastChanged: changed.toISOString(),
      hoursRemaining,
    });
  } catch (err) {
    console.error('GET /status error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/guess', guessLimiter, verifyTurnstile, validateGuess, async (req, res) => {
  try {
    const result = await checkGuess(req.guessValue);
    res.json(result);
  } catch (err) {
    console.error('POST /guess error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/winners', winnerLimiter, verifyTurnstile, sanitizeUsername, async (req, res) => {
  try {
    const { username, winToken } = req.body;
    if (typeof username !== 'string' || !username.trim()) {
      return res.status(400).json({ message: 'Username is required.' });
    }
    if (username.trim().length > 30) {
      return res.status(400).json({ message: 'Username must be 30 characters or fewer.' });
    }
    const guesses = redeemWinToken(winToken);
    if (!Number.isInteger(guesses) || guesses < 1) {
      return res.status(403).json({ message: 'This win has expired or was already saved.' });
    }
    const winner = await saveWinner(username.trim(), guesses);
    res.status(201).json(winner);
  } catch (err) {
    console.error('POST /winners error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/winners', async (_req, res) => {
  try {
    const winners = await Winner.find()
      .sort({ guesses: 1, date: -1 })
      .limit(10);
    res.json(winners);
  } catch (err) {
    console.error('GET /winners error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
