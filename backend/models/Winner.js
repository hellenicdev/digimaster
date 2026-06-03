const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  guesses: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Winner', winnerSchema);
