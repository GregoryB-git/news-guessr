# Developer & Agent Guide: NewsGuessr

A brief reference for developers and AI agents working on this codebase.

---

## 1. System Overview

**NewsGuessr** is a web-based word-by-word news headline guessing game with a 3-section Editorial Admin Panel. Players start with the 1st word revealed and guess subsequent words sequentially. An NLP engine scores contextual semantic closeness.

- **Frontend**: React 18 (Vite) on port `3000` (proxies `/api` to `5001`).
- **Backend**: Express on port `5001`.
- **Database**: MongoDB on `mongodb://127.0.0.1:27017/newsguessr`.
- **NLP / Embeddings**: Local ONNX Transformers.js (`all-MiniLM-L6-v2`) + Natural (WordNet & Porter Stemmer). Zero external API keys required.

---

## 2. Architecture & Data Flow

```
[React Client] (port 3000)
   ├── Player Game View     --> Word-by-word headline deciphering
   └── Admin Editorial Desk --> 3 Sections (Upcoming, Current, Archive)
      │
      ▼ Vite Proxy (/api/*)
[Express Server] (port 5001)
   ├── routes/game.js        --> Start session (serves Current News), evaluate guess, accept/skip
   ├── routes/news.js        --> Admin 3-section CRUD, status transitions, browse
   ├── routes/leaderboard.js --> Fetch and submit high scores
   ├── services/similarity.js--> Multi-tiered semantic proximity engine
   └── db.js                 --> Mongoose connection (port 27017)
```

---

## 3. Database Schemas (`server/models/`)

- **`News`** (`models/News.js`):
  - `headline`: String (required)
  - `newsbody`: String (required)
  - `source_url`: String (required)
  - `source_name`: String (e.g., `'NASA Science'`)
  - `category`: Enum (`'Tech'`, `'Science'`, `'World'`, `'Climate'`, `'Culture'`, `'Business'`)
  - `difficulty`: Enum (`'Easy'`, `'Medium'`, `'Hard'`)
  - `status`: Enum (`'upcoming'`, `'current'`, `'archived'`) — indexed.
- **`Leaderboard`** (`models/Leaderboard.js`):
  - `player_name`: String
  - `score`: Number
  - `accuracy`: Number (0–100%)
  - `exact_matches`, `skips`, `total_attempts`, `time_seconds`
  - `news_id`: ObjectId ref to `News`

---

## 4. Editorial 3-Section Admin Logic (`routes/news.js`)

1. **Upcoming News (`status: 'upcoming'`)**:
   - Queued future news articles sorted by `createdAt: -1` (latest submitted first).
   - If no article is marked `current`, the backend automatically takes the latest submitted upcoming article as the active daily story.
2. **Current News (`status: 'current'`)**:
   - The single active article shown to all players today.
   - When any article is promoted to `current`, the existing current article is automatically moved to `archived`.
3. **Archive (`status: 'archived'`)**:
   - Retired historical news articles preserved for history and free play.
   - Can be restored to `upcoming` or reactivated as `current`.

---

## 5. API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/news/admin/sections` | Returns `{ upcoming: [...], current: {...}, archive: [...] }` |
| `POST` | `/api/news` | Create news story (defaults to `upcoming` or specified status) |
| `PUT` | `/api/news/:id` | Full edit of news story (headline, newsbody, source, category, status) |
| `PATCH` | `/api/news/:id/status` | Fast status change (`upcoming`, `current`, `archived`) |
| `DELETE` | `/api/news/:id` | Remove story from database |
| `GET` | `/api/game/start` | Starts game serving **Current News** (or latest submitted upcoming) |
| `POST` | `/api/game/guess` | Body: `{ articleId, wordIndex, guess, attempt }`. Scores semantic proximity |
| `POST` | `/api/game/proceed` | Body: `{ articleId, wordIndex, action: 'accept'\|'skip' }` |
| `GET` | `/api/game/article/:id` | Full headline, newsbody, and source URL after completion |
| `GET` / `POST`| `/api/leaderboard` | Global leaderboard records and rankings |

---

## 6. CLI Quick Reference

```bash
# Seed news database with statuses (1 current, 4 upcoming, 3 archived)
npm run seed

# Run server (port 5001)
npm run server

# Run client (port 3000)
npm run client

# Build client for production
npm run build
```
