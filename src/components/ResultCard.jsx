import { useState } from 'react';
import Filter from 'bad-words';
import { submitGuessWithWinner } from '../services/api';
import './ResultCard.css';

const filter = new Filter();

function ResultCard({ result, onNewGame }) {
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [nameError, setNameError] = useState(null);

  if (!result) return null;

  const isCorrect = result.result === 'correct';

  const icon = isCorrect ? '🎉' : result.result === 'too-high' ? '⬆' : '⬇';
  const label = isCorrect
    ? 'Correct!'
    : result.result === 'too-high'
    ? 'Too High'
    : 'Too Low';
  const cls = isCorrect ? 'correct' : result.result === 'too-high' ? 'high' : 'low';

  const handleSave = async (e) => {
    e.preventDefault();
    setNameError(null);
    const clean = filter.clean(username.trim());
    if (!clean || clean === '****') {
      setNameError('Please enter a valid username.');
      return;
    }
    setSaving(true);
    try {
      await submitGuessWithWinner(result.guess, clean);
      setSaved(true);
    } catch {
      setNameError('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`result-card card ${cls}`}>
      <div className="result-icon">{icon}</div>
      <div className="result-text">{label}</div>
      {result.message && <p className="result-message">{result.message}</p>}

      {isCorrect && !saved && (
        <form className="winner-form" onSubmit={handleSave}>
          <input
            className="winner-input"
            type="text"
            placeholder="Enter your name for the leaderboard"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={saving}
            maxLength={30}
          />
          {nameError && <p className="guess-error">{nameError}</p>}
          <button className="winner-btn" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save to Leaderboard'}
          </button>
          <button
            type="button"
            className="skip-btn"
            onClick={onNewGame}
          >
            Skip
          </button>
        </form>
      )}

      {isCorrect && saved && (
        <div className="saved-msg">
          You are on the leaderboard!{' '}
          <button className="link-btn" onClick={onNewGame}>
            Guess again
          </button>
        </div>
      )}
    </div>
  );
}

export default ResultCard;
