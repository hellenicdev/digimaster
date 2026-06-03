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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('GameState', gameStateSchema);
