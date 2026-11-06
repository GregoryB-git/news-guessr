const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/Leaderboard');
const News = require('../models/News');
const { requireAuth } = require('../middleware/auth');

// Get top leaderboard entries
router.get('/', async (req, res) => {
  try {
    const { news_id, limit = 25 } = req.query;
    const filter = {};
    if (news_id) {
      filter.news_id = news_id;
    }

    const entries = await Leaderboard.find(filter)
      .sort({ score: -1, time_seconds: 1, createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate('news_id', 'headline category source_name');

    res.json(entries);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Internal server error fetching leaderboard.' });
  }
});

// Submit a new score (requires authentication)
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      score,
      accuracy = 100,
      words_completed = 0,
      exact_matches = 0,
      skips = 0,
      total_attempts = 0,
      time_seconds = 0,
      news_id,
    } = req.body;

    if (score === undefined || score === null) {
      return res.status(400).json({ error: 'Score is required.' });
    }

    // Use authenticated user's display name
    const playerName = req.user.displayName || req.user.email.split('@')[0] || 'Anonymous Scout';

    let headlinePreview = '';
    if (news_id) {
      const article = await News.findById(news_id);
      if (article) {
        headlinePreview = article.headline;
      }
    }

    const newEntry = new Leaderboard({
      player_name: playerName.trim().slice(0, 30) || 'Anonymous Scout',
      score: Math.max(0, Math.round(score)),
      accuracy: Math.min(100, Math.max(0, Math.round(accuracy))),
      words_completed,
      exact_matches,
      skips,
      total_attempts,
      time_seconds,
      news_id: news_id || null,
      headline_preview: headlinePreview,
    });

    const saved = await newEntry.save();

    // Compute rank of this player
    const higherScores = await Leaderboard.countDocuments({
      score: { $gt: saved.score },
    });
    const rank = higherScores + 1;

    res.status(201).json({
      entry: saved,
      rank,
      message: `Score recorded! You are ranked #${rank}`,
    });
  } catch (err) {
    console.error('Error submitting score:', err);
    res.status(500).json({ error: 'Internal server error submitting score.' });
  }
});

module.exports = router;
