import { useState } from 'react';
import { submitGuess } from '../services/api';
import './GuessForm.css';

function GuessForm({ onResult }) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const num = Number(value);
    if (!value.trim() || !Number.isInteger(num) || num < 1 || num > 1000) {
      setError('Enter a whole number between 1 and 1000.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await submitGuess(num);
      onResult(data);
      if (data.result !== 'correct') {
        setValue('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="guess-form card" onSubmit={handleSubmit}>
      <label className="guess-label" htmlFor="guess">
        Your guess
      </label>
      <input
        id="guess"
        className="guess-input"
        type="number"
        min={1}
        max={1000}
        placeholder="1 – 1000"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={submitting}
        autoFocus
      />
      {error && <p className="guess-error">{error}</p>}
      <button className="guess-btn" type="submit" disabled={submitting}>
        {submitting ? 'Checking...' : 'Submit Guess'}
      </button>
    </form>
  );
}

export default GuessForm;
