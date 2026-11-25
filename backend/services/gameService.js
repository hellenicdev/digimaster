const crypto = require('crypto');
const GameState = require('../models/GameState');
const Winner = require('../models/Winner');

const WIN_TOKEN_TTL_MS = 15 * 60 * 1000;
// One-time tokens handed out on a correct guess, so the leaderboard only
// accepts real wins with the server-side guess count.
const winTokens = new Map();

function generateRandomNumber() {
  return crypto.randomInt(1, 1001);
}

function lastRotation(game) {
  return new Date(game.rotatedAt || game.updatedAt || Date.now());
}

async function getCurrentGame() {
  let game = await GameState.findOne();
  if (!game) {
    game = await GameState.create({
      currentNumber: generateRandomNumber(),
      guessCount: 0,
      rotatedAt: new Date(),
    });
  }
  return game;
}

async function rotateNumber() {
  const game = await getCurrentGame();
  game.currentNumber = generateRandomNumber();
  game.guessCount = 0;
  game.rotatedAt = new Date();
  return game.save();
}

function pruneWinTokens() {
  const now = Date.now();
  for (const [token, entry] of winTokens) {
    if (entry.expiresAt <= now) winTokens.delete(token);
  }
}

function issueWinToken(guesses) {
  pruneWinTokens();
  const token = crypto.randomBytes(24).toString('hex');
  winTokens.set(token, { guesses, expiresAt: Date.now() + WIN_TOKEN_TTL_MS });
  return token;
}

function redeemWinToken(token) {
  if (typeof token !== 'string') return null;
  const entry = winTokens.get(token);
  if (!entry) return null;
  winTokens.delete(token);
  if (entry.expiresAt <= Date.now()) return null;
  return entry.guesses;
}

async function checkGuess(number) {
  await getCurrentGame();
  // Atomic increment so concurrent guesses aren't lost.
  const game = await GameState.findOneAndUpdate(
    {},
    { $inc: { guessCount: 1 } },
    { new: true }
  );

  if (number < game.currentNumber) return { result: 'too-low' };
  if (number > game.currentNumber) return { result: 'too-high' };

  // Only one request can win a given number.
  const won = await GameState.findOneAndUpdate(
    { _id: game._id, currentNumber: number },
    {
      $set: {
        currentNumber: generateRandomNumber(),
        guessCount: 0,
        rotatedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!won) {
    return {
      result: 'too-late',
      message: 'Someone guessed it a moment before you. A new number is in play!',
    };
  }

  const guesses = game.guessCount;
  return {
    result: 'correct',
    guesses,
    winToken: issueWinToken(guesses),
    message: 'You guessed correctly! A new number has been generated.',
  };
}

async function saveWinner(username, guesses) {
  return Winner.create({ username, guesses, date: new Date() });
}

module.exports = {
  generateRandomNumber,
  getCurrentGame,
  rotateNumber,
  checkGuess,
  saveWinner,
  redeemWinToken,
  lastRotation,
};
