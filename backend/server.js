require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { getCurrentGame } = require('./services/gameService');
const { startScheduler } = require('./services/scheduler');
const gameRoutes = require('./routes/gameRoutes');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

const ALLOWED_ORIGIN = 'https://hellenicdev.eu';
app.use(cors({
  origin: ALLOWED_ORIGIN,
}));
app.use(express.json({ limit: '10kb' }));

app.use('/api/game', gameRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (_req, res) => {
  res.json({ message: 'Number Guessing Game API' });
});

app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error('Unhandled error:', err.message);
  res.status(status).json({ message: status >= 500 ? 'Server error' : 'Bad request' });
});

async function start() {
  await connectDB();
  await getCurrentGame();
  startScheduler();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
