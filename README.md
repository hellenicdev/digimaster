# DigiMaster: Number Guessing Game

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/S6S31XB030)

A global number guessing game: everyone hunts the same secret number between **1 and 1000**. Guess it, claim your spot on the leaderboard, and a fresh number is generated for everyone.

**Live:** https://hellenicdev.eu/digimaster/

## Features

- One shared secret number for all players, stored in MongoDB
- Instant "too high" / "too low" feedback
- Number rotates on a correct guess, or automatically after 12 hours without a winner
- Top-10 leaderboard (fewest guesses wins); only server-verified wins can be saved
- Cloudflare Turnstile bot protection and per-IP rate limiting
- Profanity filtering on usernames (client and server)
- Accessible, responsive UI with loading, error and empty states

## Tech stack

| Layer | Tech |
| --- | --- |
| Frontend | React 18, Vite 5, Axios (static build in `docs/` served by GitHub Pages) |
| Backend | Node.js, Express 4, express-rate-limit, node-cron |
| Database | MongoDB Atlas via Mongoose |
| Hosting | GitHub Pages (frontend), Render (API) |

## Getting started

Requirements: Node.js 18+ and a MongoDB connection string.

```bash
git clone https://github.com/hellenicdev/digimaster.git
cd digimaster

# API
cd backend
cp .env.example .env   # fill in the values
npm install
npm run dev            # http://localhost:5000

# Frontend (new terminal, repo root)
cd ..
cp .env.example .env
npm install
npm run dev            # http://localhost:5173/digimaster/
```

Build the frontend into `docs/` with `npm run build`.

### Environment variables

Backend (`backend/.env`):

| Name | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `PORT` | Port for the API (default `5000`) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret (verification is skipped if unset) |

Frontend (`.env`):

| Name | Purpose |
| --- | --- |
| `VITE_API_URL` | Base URL of the API |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key |

CORS is restricted to `https://hellenicdev.eu`.

## API

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/game/status` | When the number last changed and hours until auto-rotation |
| `POST` | `/api/game/guess` | `{ guess }`, returns `too-low`, `too-high`, `correct` (with a one-time `winToken`) or `too-late` |
| `GET` | `/api/game/winners` | Top 10 winners |
| `POST` | `/api/game/winners` | `{ username, winToken }`, saves a verified win |
| `GET` | `/api/health` | Health check |

## Project structure

```
digimaster/
├── src/                 React app (components, API client, styles)
├── docs/                Production build served by GitHub Pages
├── backend/
│   ├── config/          MongoDB connection
│   ├── middleware/      Rate limiting, Turnstile, validation, profanity filter
│   ├── models/          GameState, Winner
│   ├── routes/          /api/game routes
│   ├── services/        Game logic and 12-hour scheduler
│   └── server.js        Express entry point
└── vite.config.js
```

## License

© 2026 HellenicDev. All rights reserved.

Built by [HellenicDev](https://hellenicdev.eu).
