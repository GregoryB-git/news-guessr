const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema(
  {
    player_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
      default: 'Anonymous Scout',
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    accuracy: {
      type: Number,
      default: 100,
    },
    words_completed: {
      type: Number,
      default: 0,
    },
    exact_matches: {
      type: Number,
      default: 0,
    },
    skips: {
      type: Number,
      default: 0,
    },
    total_attempts: {
      type: Number,
      default: 0,
    },
    time_seconds: {
      type: Number,
      default: 0,
    },
    news_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'News',
    },
    headline_preview: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);
