# NewsGuessr 📰

> The contextual breaking news headline guessing game. Legally distinct from Wordle, powered by Semantic NLP, React, Node.js, and MongoDB.

---

## 🎮 How the Game Works

1. **Lead Word Revealed**: The game starts with the 1st word of a real breaking news headline revealed.
2. **Contextual Next-Word Guessing**: You type in your guess for the very next word in the headline sequence.
3. **Semantic AI Estimation**: The engine estimates the contextual and semantic proximity of your word relative to the headline using a combination of:
   - **Exact Match** (100% Bullseye — up to 1,000 points)
   - **WordNet & Journalistic Synsets** (88-95% Hot)
   - **Vector Embedding Cosine Similarity** via Transformers.js (`all-MiniLM-L6-v2`)
4. **Pass / Proceed Mechanics**:
   - **Close Enough (Score ≥ 68%)**: You can immediately accept and advance to the next word with high points, or keep trying for the 100% exact word.
   - **Too Far (Score < 68%)**: You can try again on the same word, or click **"Proceed Nevertheless"** (Skip) to reveal the word with minimal baseline points and keep the game moving.
5. **Full Article Unlocked**: Completing the headline unlocks:
   - The full completed headline
   - The complete news article body
   - A verified clickable link to the original news source
6. **Leaderboard & Sharing**: Submit your score to the persistent MongoDB Leaderboard and copy a Wordle-inspired emoji score card to share with friends!

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend**: Node.js, Express, Natural NLP (WordNet, Stemmer, Jaro-Winkler), Transformers.js ONNX Embeddings
- **Database**: MongoDB with Mongoose (stores headlines, news body, original source URLs, and leaderboard entries)

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 2. Seed Database with News Stories
```bash
npm run seed
```
This populates the database with real curated articles across Science, Tech, World, Climate, and Culture.

### 3. Start Backend Server
```bash
npm run server
```
Runs the Express backend on `http://localhost:5001`.

### 4. Start React Frontend
```bash
npm run client
```
Opens the interactive web application on `http://localhost:3000`.

---

## 📁 Project Structure

```text
newsGuessr/
├── DEVELOPER.md               # Quick technical reference for developers & AI agents
├── server/
│   ├── index.js               # Express API entry point
│   ├── db.js                  # MongoDB connection
│   ├── seed.js                # Database news seeder
│   ├── models/
│   │   ├── News.js            # Headline, newsbody, source_url schema
│   │   └── Leaderboard.js     # Player scores & stats schema
│   ├── services/
│   │   └── similarity.js      # Multi-tiered NLP semantic closeness engine
│   └── routes/
│       ├── game.js            # Game session start, guess evaluation, proceed
│       ├── news.js            # Article list and detail endpoints
│       └── leaderboard.js     # Leaderboard submissions and top scores
├── client/
│   ├── src/
│   │   ├── App.jsx            # Main game orchestration
│   │   └── components/
│   │       ├── Header.jsx           # Brand, score, streak, category filters
│   │       ├── HeadlineBoard.jsx    # Wordle-style animated headline tiles
│   │       ├── GuessInput.jsx       # Input box, submit, and proceed buttons
│   │       ├── ClosenessMeter.jsx   # Visual semantic proximity gauge (0-100%)
│   │       ├── WordGuessHistory.jsx # Per-word attempt history log
│   │       ├── ArticleModal.jsx     # Full newsbody, source link & celebration
│   │       ├── LeaderboardModal.jsx # Global top scores drawer
│   │       └── HowToPlayModal.jsx   # Rules and scoring breakdown
│   ├── index.html
│   └── vite.config.js
└── package.json
```
