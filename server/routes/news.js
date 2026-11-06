const express = require('express');
const router = express.Router();
const News = require('../models/News');

// Get news categorized into the 3 admin sections: Upcoming, Current, Archive
router.get('/admin/sections', async (req, res) => {
  try {
    const [upcoming, currentList, archive] = await Promise.all([
      // 1. Upcoming news: sorted by latest submitted (createdAt: -1)
      News.find({ status: 'upcoming' }).sort({ createdAt: -1 }),

      // 2. Current news: active for today
      News.find({ status: 'current' }).sort({ updatedAt: -1 }),

      // 3. Archive: historical articles
      News.find({ status: 'archived' }).sort({ updatedAt: -1, createdAt: -1 }),
    ]);

    let current = currentList[0] || null;

    // If no current news is designated, automatically designate the latest submitted upcoming post
    if (!current && upcoming.length > 0) {
      current = upcoming[0];
      current.status = 'current';
      await current.save();
      // Remove it from the upcoming array returned
      upcoming.shift();
    }

    res.json({
      upcoming,
      current,
      archive,
      counts: {
        upcoming: upcoming.length,
        current: current ? 1 : 0,
        archive: archive.length,
      },
    });
  } catch (err) {
    console.error('Error fetching admin sections:', err);
    res.status(500).json({ error: 'Failed to load news sections.' });
  }
});

// Get all articles (for client filters/dropdowns)
router.get('/', async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (status) {
      filter.status = status;
    }

    const articles = await News.find(filter)
      .select('headline category source_name difficulty summary published_date status createdAt')
      .sort({ createdAt: -1 });

    res.json(articles);
  } catch (err) {
    console.error('Error fetching news list:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Create new news article
router.post('/', async (req, res) => {
  try {
    const {
      headline,
      newsbody,
      source_url,
      source_name,
      category,
      difficulty,
      summary,
      status = 'upcoming',
    } = req.body;

    if (!headline || !newsbody || !source_url) {
      return res.status(400).json({
        error: 'Headline, newsbody, and source_url are all required.',
      });
    }

    // If setting to current, archive any existing current news
    if (status === 'current') {
      await News.updateMany({ status: 'current' }, { $set: { status: 'archived' } });
    }

    const article = new News({
      headline: headline.trim(),
      newsbody: newsbody.trim(),
      source_url: source_url.trim(),
      source_name: (source_name || 'News Wire').trim(),
      category: category || 'World',
      difficulty: difficulty || 'Medium',
      summary: summary || headline.slice(0, 100),
      status,
    });

    const saved = await article.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating news:', err);
    res.status(500).json({ error: 'Failed to create news article.' });
  }
});

// Update an existing news article
router.put('/:id', async (req, res) => {
  try {
    const {
      headline,
      newsbody,
      source_url,
      source_name,
      category,
      difficulty,
      summary,
      status,
    } = req.body;

    const existing = await News.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'News article not found.' });
    }

    // If promoting to current, demote any other current article to archived
    if (status === 'current' && existing.status !== 'current') {
      await News.updateMany(
        { _id: { $ne: existing._id }, status: 'current' },
        { $set: { status: 'archived' } }
      );
    }

    if (headline !== undefined) existing.headline = headline.trim();
    if (newsbody !== undefined) existing.newsbody = newsbody.trim();
    if (source_url !== undefined) existing.source_url = source_url.trim();
    if (source_name !== undefined) existing.source_name = source_name.trim();
    if (category !== undefined) existing.category = category;
    if (difficulty !== undefined) existing.difficulty = difficulty;
    if (summary !== undefined) existing.summary = summary.trim();
    if (status !== undefined) existing.status = status;

    const updated = await existing.save();
    res.json(updated);
  } catch (err) {
    console.error('Error updating news:', err);
    res.status(500).json({ error: 'Failed to update news article.' });
  }
});

// Quick status change endpoint (e.g. Promote to Current, Move to Archive, Move to Upcoming)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['upcoming', 'current', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const article = await News.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    // If promoting to current, archive any existing current news
    if (status === 'current') {
      await News.updateMany(
        { _id: { $ne: article._id }, status: 'current' },
        { $set: { status: 'archived' } }
      );
    }

    article.status = status;
    const saved = await article.save();
    res.json(saved);
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Failed to change article status.' });
  }
});

// Delete an article
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await News.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Article not found.' });
    }
    res.json({ message: 'Article deleted successfully.', id: req.params.id });
  } catch (err) {
    console.error('Error deleting news:', err);
    res.status(500).json({ error: 'Failed to delete article.' });
  }
});

// Get single article by id
router.get('/:id', async (req, res) => {
  try {
    const article = await News.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch article.' });
  }
});

module.exports = router;
