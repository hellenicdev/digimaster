import { useState, useEffect, useRef } from 'react';
import Filter from 'bad-words';
import { saveWinner } from '../services/api';
import './ResultCard.css';

const filter = new Filter();
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

function ResultCard({ result, onNewGame }) {
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [nameError, setNameError] = useState(null);
  const [token, setToken] = useState(null);
  const widgetId = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!result) {
      widgetId.current = null;
      return;
    }
    if (!wrapperRef.current || widgetId.current != null) return;

    const renderWidget = () => {
      widgetId.current = window.turnstile.render(wrapperRef.current, {
        sitekey: SITE_KEY,
        callback: (t) => setToken(t),
        'expired-callback': () => setToken(null),
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const id = setInterval(() => {
        if (window.turnstile) {
          clearInterval(id);
          renderWidget();
        }
      }, 200);
      return () => clearInterval(id);
    }
  }, [result]);

  if (!result) return null;

  const isCorrect = result.result === 'correct';
  const isHigh = result.result === 'too-high';
  const isLow = result.result === 'too-low';

  const icon = isCorrect ? '🎉' : isHigh ? '⬆' : '⬇';
  const label = isCorrect ? 'Correct!' : isHigh ? 'Too High' : 'Too Low';
  const cls = isCorrect ? 'correct' : isHigh ? 'high' : 'low';

  const handleSave = async (e) => {
    e.preventDefault();
    setNameError(null);
    const clean = filter.clean(username.trim());
    if (!clean || clean === '****') {
      setNameError('Please enter a valid username.');
      return;
    }
    if (!token) {
      setNameError('Verification failed. Please refresh.');
      return;
    }
    setSaving(true);
    try {
      await saveWinner(clean, result.guesses, token);
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
          <div ref={wrapperRef} className="turnstile-wrapper" />
          <button className="winner-btn" type="submit" disabled={saving || !token}>
            {saving ? 'Saving...' : 'Save to Leaderboard'}
          </button>
          <button type="button" className="skip-btn" onClick={onNewGame}>
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
