const cron = require('node-cron');
const GameState = require('../models/GameState');
const { generateRandomNumber } = require('./gameService');

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

async function checkAndRotate() {
  try {
    const game = await GameState.findOne();
    if (!game) return;

    const elapsed = Date.now() - new Date(game.updatedAt).getTime();
    if (elapsed >= TWELVE_HOURS_MS) {
      game.currentNumber = generateRandomNumber();
      game.guessCount = 0;
      await game.save();
      console.log('[Scheduler] Number rotated after 12+ hour idle period');
    }
  } catch (err) {
    console.error('[Scheduler] Error:', err.message);
  }
}

function startScheduler() {
  cron.schedule('0 * * * *', () => {
    checkAndRotate();
  });
  console.log('Scheduler started — checking every hour for 12-hour rotation');
}

module.exports = { startScheduler, checkAndRotate };
