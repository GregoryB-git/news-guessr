require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const gameRoutes = require('./routes/game');
const newsRoutes = require('./routes/news');
const leaderboardRoutes = require('./routes/leaderboard');
const authRoutes = require('./routes/auth');
const { seedAdmin } = require('./seedAdmin');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Connect to DB and start server
async function startServer() {
  await connectDB();
  await seedAdmin();
  app.listen(PORT, () => {
    console.log(`NewsGuessr server listening on port ${PORT}`);
  });
}

startServer();
