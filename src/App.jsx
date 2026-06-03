import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatusPanel from './components/StatusPanel';
import GuessForm from './components/GuessForm';
import ResultCard from './components/ResultCard';
import WinnersPanel from './components/WinnersPanel';
import { getStatus, getWinners } from './services/api';

function App() {
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getStatus();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError('Could not connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWinners = useCallback(async () => {
    try {
      const data = await getWinners();
      setWinners(data);
    } catch {
      // Silently fail for winners
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchWinners();
  }, [fetchStatus, fetchWinners]);

  const handleGuessResult = (guessResult) => {
    setResult(guessResult);
    if (guessResult.result === 'correct') {
      fetchStatus();
      fetchWinners();
    }
  };

  const handleNewGame = () => {
    setResult(null);
  };

  return (
    <div className="app">
      <Header />
      {loading && <div className="card">Loading game state...</div>}
      {error && <div className="card" style={{ borderColor: '#ff6b6b' }}>{error}</div>}
      {status && <StatusPanel lastChanged={status.lastChanged} hoursRemaining={status.hoursRemaining} />}
      {status && <GuessForm onResult={handleGuessResult} />}
      {result && <ResultCard result={result} onNewGame={handleNewGame} />}
      <WinnersPanel winners={winners} />
    </div>
  );
}

export default App;
