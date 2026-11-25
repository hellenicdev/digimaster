const mongoose = require('mongoose');

const gameStateSchema = new mongoose.Schema(
  {
    currentNumber: {
      type: Number,
      required: true,
    },
    guessCount: {
      type: Number,
      default: 0,
    },
    // When the secret number last changed. Kept separate from updatedAt,
    // which also moves on every guess.
    rotatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('GameState', gameStateSchema);
