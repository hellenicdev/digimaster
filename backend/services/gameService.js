const GameState = require('../models/GameState');
const Winner = require('../models/Winner');

function generateRandomNumber() {
  return Math.floor(Math.random() * 1000) + 1;
}

async function getCurrentGame() {
  let game = await GameState.findOne();
  if (!game) {
    game = await GameState.create({
      currentNumber: generateRandomNumber(),
      guessCount: 0,
    });
  }
  return game;
}

async function rotateNumber() {
  const game = await getCurrentGame();
  game.currentNumber = generateRandomNumber();
  game.guessCount = 0;
  return game.save();
}

async function checkGuess(number) {
  const game = await getCurrentGame();
  game.guessCount += 1;

  if (number < game.currentNumber) {
    await game.save();
    return { result: 'too-low' };
  }

  if (number > game.currentNumber) {
    await game.save();
    return { result: 'too-high' };
  }

  const guesses = game.guessCount;
  await rotateNumber();
  return {
    result: 'correct',
    guesses,
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
};
