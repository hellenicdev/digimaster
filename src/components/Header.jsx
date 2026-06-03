import './Header.css';

function Header() {
  return (
    <header className="header card">
      <h1 className="header-title">Number Guessing Game</h1>
      <p className="header-subtitle">
        Guess a number between <strong>1</strong> and <strong>1000</strong>. A new
        secret number is generated every 12 hours — or instantly when someone wins!
      </p>
    </header>
  );
}

export default Header;
