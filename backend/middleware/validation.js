function validateGuess(req, res, next) {
  const { guess } = req.body;

  if (guess === undefined || guess === null || guess === '') {
    return res.status(400).json({ message: 'Guess is required.' });
  }

  const num = Number(guess);
  if (!Number.isInteger(num)) {
    return res.status(400).json({ message: 'Guess must be a whole number.' });
  }

  if (num < 1 || num > 1000) {
    return res.status(400).json({ message: 'Guess must be between 1 and 1000.' });
  }

  req.guessValue = num;
  next();
}

module.exports = { validateGuess };
