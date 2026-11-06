const express = require('express');
const router = express.Router();
const News = require('../models/News');
const { evaluateCloseness, normalizeWord } = require('../services/similarity');

// Helper to tokenize headline into clean array of words
function splitHeadline(headline) {
  return headline.trim().split(/\s+/).filter(Boolean);
}

// Start a game session: returns first word and metadata (hiding remaining words)
router.get('/start', async (req, res) => {
  try {
    const { articleId, category } = req.query;
    let article = null;

    if (articleId) {
      // Direct request for specific article
      article = await News.findById(articleId);
    } else if (category && category !== 'All') {
      // Category filter requested
      const count = await News.countDocuments({ category });
      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        article = await News.findOne({ category }).skip(randomIndex);
      }
    } else {
      // Default / Daily Mode:
      // 1. First priority: The designated 'current' news article for today
      article = await News.findOne({ status: 'current' });

      // 2. Second priority: The latest submitted upcoming news
      if (!article) {
        article = await News.findOne({ status: 'upcoming' }).sort({ createdAt: -1 });
      }

      // 3. Fallback: Any latest article
      if (!article) {
        article = await News.findOne({}).sort({ createdAt: -1 });
      }
    }

    if (!article) {
      return res.status(404).json({ error: 'No news articles found in database.' });
    }

    const words = splitHeadline(article.headline);
    if (words.length < 2) {
      return res.status(400).json({ error: 'Headline is too short for a game.' });
    }

    // Return the first word revealed, word count, and article metadata
    res.json({
      articleId: article._id,
      category: article.category,
      source_name: article.source_name,
      difficulty: article.difficulty,
      published_date: article.published_date,
      status: article.status || 'current',
      totalWords: words.length,
      firstWord: words[0],
      wordLengths: words.map((w) => normalizeWord(w).length),
    });
  } catch (err) {
    console.error('Error starting game:', err);
    res.status(500).json({ error: 'Internal server error starting game.' });
  }
});

// Evaluate user's guess for word at wordIndex (1-indexed for the hidden words)
router.post('/guess', async (req, res) => {
  try {
    const { articleId, wordIndex, guess, attempt = 1 } = req.body;

    if (!articleId || wordIndex === undefined || !guess) {
      return res.status(400).json({ error: 'Missing articleId, wordIndex, or guess.' });
    }

    const article = await News.findById(articleId);
    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    const words = splitHeadline(article.headline);
    if (wordIndex < 1 || wordIndex >= words.length) {
      return res.status(400).json({ error: 'Invalid wordIndex for this headline.' });
    }

    const targetWord = words[wordIndex];
    const context = words.slice(0, wordIndex).join(' ');

    const result = await evaluateCloseness(guess, targetWord, context, attempt);

    let responsePayload = {
      ...result,
      wordIndex,
    };

    if (result.isExact) {
      responsePayload.revealedWord = targetWord;
      responsePayload.canProceed = true;
    } else if (result.isCloseEnough) {
      responsePayload.canProceed = true;
      responsePayload.acceptableGuess = guess;
      responsePayload.actualWord = targetWord;
    } else {
      responsePayload.canProceed = false;
    }

    res.json(responsePayload);
  } catch (err) {
    console.error('Error evaluating guess:', err);
    res.status(500).json({ error: 'Internal server error evaluating guess.' });
  }
});

// Proceed or skip: User either accepts close enough guess or skips with minimal points
router.post('/proceed', async (req, res) => {
  try {
    const { articleId, wordIndex, action, pointsEarned = 0 } = req.body;

    const article = await News.findById(articleId);
    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    const words = splitHeadline(article.headline);
    if (wordIndex < 1 || wordIndex >= words.length) {
      return res.status(400).json({ error: 'Invalid wordIndex.' });
    }

    const targetWord = words[wordIndex];
    const isLastWord = wordIndex === words.length - 1;

    let points = 50; // baseline for proceed nevertheless / skip
    if (action === 'accept') {
      points = Math.max(100, Number(pointsEarned) || 200);
    }

    res.json({
      wordIndex,
      revealedWord: targetWord,
      pointsAwarded: points,
      isLastWord,
      action,
    });
  } catch (err) {
    console.error('Error in proceed route:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get full article details upon completion
router.get('/article/:id', async (req, res) => {
  try {
    const article = await News.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    res.json({
      id: article._id,
      headline: article.headline,
      newsbody: article.newsbody,
      source_url: article.source_url,
      source_name: article.source_name,
      category: article.category,
      difficulty: article.difficulty,
      published_date: article.published_date,
      summary: article.summary,
      status: article.status,
    });
  } catch (err) {
    console.error('Error fetching article:', err);
    res.status(500).json({ error: 'Internal server error fetching article.' });
  }
});

module.exports = router;
