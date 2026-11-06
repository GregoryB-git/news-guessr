const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema(
  {
    headline: {
      type: String,
      required: true,
      trim: true,
    },
    newsbody: {
      type: String,
      required: true,
    },
    source_url: {
      type: String,
      required: true,
      trim: true,
    },
    source_name: {
      type: String,
      default: 'World News',
      trim: true,
    },
    category: {
      type: String,
      enum: ['Tech', 'Science', 'World', 'Business', 'Culture', 'Climate'],
      default: 'World',
    },
    published_date: {
      type: Date,
      default: Date.now,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    summary: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['upcoming', 'current', 'archived'],
      default: 'upcoming',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('News', NewsSchema);
