import './StatusPanel.css';

function StatusPanel({ lastChanged, hoursRemaining }) {
  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString();
  };

  const clamped = Math.max(0, Math.min(12, hoursRemaining));
  const pct = (clamped / 12) * 100;

  return (
    <div className="status-panel card">
      <div className="status-row">
        <span className="status-label">Last changed</span>
        <span className="status-value">{formatDate(lastChanged)}</span>
      </div>
      <div className="status-row">
        <span className="status-label">Next reset in</span>
        <span className="status-value">{hoursRemaining.toFixed(1)} hours</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${100 - pct}%` }} />
      </div>
    </div>
  );
}

export default StatusPanel;
