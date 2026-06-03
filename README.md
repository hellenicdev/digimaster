# Number Guessing Game

A full-stack number guessing game built with React, Node.js, Express, and MongoDB.

**Live demo:** [https://<your-github-username>.github.io/digimaster](https://<your-github-username>.github.io/digimaster)

## Architecture

```
┌─────────────────┐       ┌──────────────────┐       ┌──────────────┐
│  GitHub Pages    │  API  │  Render (Node)   │       │  MongoDB     │
│  React + Vite    │◄─────►│  Express Server  │◄─────►│  Atlas       │
│  (Static Files)  │       │  /api/game/*     │       │  GameState   │
└─────────────────┘       └──────────────────┘       │  Winner      │
                                                      └──────────────┘
```

- **Frontend**: React + Vite, deployed to GitHub Pages
- **Backend**: Node.js + Express, deployed to Render
- **Database**: MongoDB Atlas (single `GameState` document + `Winner` collection)

## Game Rules

1. A secret number between **1 and 1000** is stored in MongoDB.
2. Users submit guesses. The API responds with `"too-high"`, `"too-low"`, or `"correct"`.
3. On a correct guess, a new random number is generated and saved immediately.
4. If no one guesses correctly for **12 hours**, the number rotates automatically.
5. Number rotation is validated against MongoDB timestamps (not server uptime).

## Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas account (free tier)
- Render account (free tier)
- GitHub account

---

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/<your-github-username>/digimaster.git
cd digimaster
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set your MongoDB connection string:

```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/number-guessing-game?retryWrites=true&w=majority
PORT=5000
CLIENT_URL=http://localhost:5173
```

```bash
npm install
npm run dev
```

The backend starts on `http://localhost:5000`.

### 3. Frontend setup

In a separate terminal:

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_API_URL=http://localhost:5000
```

```bash
npm install
npm run dev
```

The frontend starts on `http://localhost:5173`.

---

## MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and sign in.
2. Create a **free (M0) cluster**.
3. Under **Security → Network Access**, add `0.0.0.0/0` (allow all) for Render — or add Render's IP range.
4. Under **Security → Database Access**, create a database user.
5. Click **Connect → Connect your application**, copy the connection string.
6. Replace `<username>`, `<password>`, and `myFirstDatabase` in the string.
7. Use this string as your `MONGODB_URI`.

The database and collections are created automatically on first request.

---

## Backend Deployment (Render)

1. Push your repo to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com) → **New + → Web Service**.
3. Connect your GitHub repository.
4. Configure:

| Setting | Value |
|---------|-------|
| Name | `number-guessing-backend` |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `node server.js` |

5. Add environment variables:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `PORT` | `10000` |
| `CLIENT_URL` | `https://<your-github-username>.github.io` |

6. Click **Create Web Service**.

Render will deploy and give you a URL like `https://number-guessing-backend.onrender.com`.

---

## Frontend Deployment (GitHub Pages)

1. Update `vite.config.js` — the `base` is already set to `/digimaster/`. If your repo has a different name, update it.
2. In your Render dashboard, copy your backend URL (e.g. `https://number-guessing-backend.onrender.com`).
3. On GitHub, go to your repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Name | Value |
|-----|-------|
| `VITE_API_URL` | `https://number-guessing-backend.onrender.com` |

Alternatively, build locally with the correct env var:

```bash
VITE_API_URL=https://number-guessing-backend.onrender.com npm run build
```

4. Enable GitHub Pages:

   - Go to repo **Settings → Pages**.
   - Source: **Deploy from a branch**.
   - Branch: `gh-pages` (created by the deploy script) → `/ (root)`.

5. Deploy:

```bash
npm run deploy
```

This builds the frontend and pushes the `dist` folder to the `gh-pages` branch.

6. Your app is live at `https://<your-github-username>.github.io/digimaster/`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/game` |
| `PORT` | Server port | `5000` |
| `CLIENT_URL` | Allowed CORS origin | `http://localhost:5173` |

### Frontend (`.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` |

---

## API Documentation

### `GET /api/game/status`

Returns the current game state.

**Response:**

```json
{
  "lastChanged": "2025-01-15T10:30:00.000Z",
  "hoursRemaining": 7.2
}
```

`hoursRemaining` is the time until the next automatic number rotation (max 12).

---

### `POST /api/game/guess`

Submit a guess.

**Request:**

```json
{
  "guess": 123
}
```

Optional: include a username to save to the leaderboard on correct guess.

```json
{
  "guess": 123,
  "username": "Alice"
}
```

**Responses:**

```json
{ "result": "too-high" }
{ "result": "too-low" }
{
  "result": "correct",
  "guesses": 5,
  "message": "You guessed correctly! A new number has been generated."
}
```

**Validation errors (400):**

```json
{ "message": "Guess must be between 1 and 1000." }
```

---

### `GET /api/game/winners`

Returns the leaderboard sorted by fewest guesses.

**Response:**

```json
[
  {
    "_id": "...",
    "username": "Alice",
    "guesses": 3,
    "date": "2025-01-15T10:30:00.000Z"
  }
]
```

---

## Project Structure

```
/
├── index.html                     Vite HTML entry
├── package.json                   Frontend dependencies
├── vite.config.js                 Vite config (base: /digimaster/)
├── .env.example                   Frontend env template
├── .eslintrc.cjs                  Frontend ESLint config
├── src/
│   ├── main.jsx                   React entry
│   ├── App.jsx                    Root component
│   ├── App.css                    Global styles
│   ├── services/
│   │   └── api.js                 Axios API client
│   └── components/
│       ├── Header.jsx / .css       Title + description
│       ├── StatusPanel.jsx / .css  Game status display
│       ├── GuessForm.jsx / .css    Guess input + submit
│       ├── ResultCard.jsx / .css   Result display + winner form
│       └── WinnersPanel.jsx / .css Leaderboard
├── backend/
│   ├── package.json               Backend dependencies
│   ├── server.js                  Express app entry
│   ├── render.yaml                Render deployment config
│   ├── .env.example               Backend env template
│   ├── .eslintrc.json             Backend ESLint config
│   ├── config/
│   │   └── db.js                  MongoDB connection
│   ├── models/
│   │   ├── GameState.js           Single-document game state
│   │   └── Winner.js              Leaderboard entries
│   ├── services/
│   │   ├── gameService.js         Core game logic
│   │   └── scheduler.js           12-hour rotation cron
│   ├── routes/
│   │   └── gameRoutes.js          API route handlers
│   └── middleware/
│       ├── validation.js          Guess validation
│       └── profanity.js           Username sanitization
└── README.md
```

---

## Bonus Features

- **Leaderboard**: Winners are stored in MongoDB with their username and guess count.
- **Profanity filter**: Usernames are sanitized using `bad-words` on both client and server.
- **Auto-rotation**: The number rotates after 12 hours of inactivity, verified by MongoDB timestamps.
- **Persistent state**: The game state survives server restarts, crashes, and redeployments.
