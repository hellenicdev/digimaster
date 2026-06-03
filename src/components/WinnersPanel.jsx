import './WinnersPanel.css';

function WinnersPanel({ winners }) {
  if (!winners || winners.length === 0) return null;

  return (
    <div className="winners-panel card">
      <h2 className="winners-title">Leaderboard</h2>
      <div className="winners-table">
        <div className="winners-header">
          <span className="col-rank">#</span>
          <span className="col-name">Name</span>
          <span className="col-guesses">Guesses</span>
          <span className="col-date">Date</span>
        </div>
        {winners.map((w, i) => (
          <div key={w._id} className="winners-row">
            <span className="col-rank">{i + 1}</span>
            <span className="col-name">{w.username}</span>
            <span className="col-guesses">{w.guesses}</span>
            <span className="col-date">
              {new Date(w.date).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WinnersPanel;
