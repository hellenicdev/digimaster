require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { getCurrentGame } = require('./services/gameService');
const { startScheduler } = require('./services/scheduler');
const gameRoutes = require('./routes/gameRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
}));
app.use(express.json());

app.use('/api/game', gameRoutes);

app.get('/', (_req, res) => {
  res.json({ message: 'Number Guessing Game API' });
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
