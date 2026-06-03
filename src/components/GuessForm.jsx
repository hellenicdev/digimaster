import { useState, useEffect, useRef } from 'react';
import { submitGuess } from '../services/api';
import './GuessForm.css';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

function GuessForm({ onResult }) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const widgetId = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
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
  }, []);

  const resetTurnstile = () => {
    if (window.turnstile && widgetId.current != null) {
      window.turnstile.reset(widgetId.current);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const num = Number(value);
    if (!value.trim() || !Number.isInteger(num) || num < 1 || num > 1000) {
      setError('Enter a whole number between 1 and 1000.');
      return;
    }

    if (!token) {
      setError('Verifying you are human. Please try again.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await submitGuess(num, token);
      onResult(data);
      resetTurnstile();
      if (data.result !== 'correct') {
        setValue('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Try again.';
      setError(msg);
      resetTurnstile();
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
      <div ref={wrapperRef} className="turnstile-wrapper" />
      <button className="guess-btn" type="submit" disabled={submitting || !token}>
        {submitting ? 'Checking...' : 'Submit Guess'}
      </button>
      <p className="rate-info">Rate limit: 10 guesses per minute per IP</p>
    </form>
  );
}

export default GuessForm;
