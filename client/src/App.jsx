import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import HeadlineBoard from './components/HeadlineBoard';
import GuessInput from './components/GuessInput';
import ClosenessMeter from './components/ClosenessMeter';
import WordGuessHistory from './components/WordGuessHistory';
import ArticleModal from './components/ArticleModal';
import LeaderboardModal from './components/LeaderboardModal';
import HowToPlayModal from './components/HowToPlayModal';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';

const CATEGORIES = ['All', 'Science', 'Tech', 'World', 'Climate', 'Culture'];

export default function App() {
  const [currentView, setCurrentView] = useState('game'); // 'game' | 'admin'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  // Auth state
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Game session state
  const [gameMeta, setGameMeta] = useState(null);
  const [revealedWords, setRevealedWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(1);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [wordAttemptsHistory, setWordAttemptsHistory] = useState([]);
  const [lastEvaluation, setLastEvaluation] = useState(null);

  // Stats & scoring
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [exactMatches, setExactMatches] = useState(0);
  const [skips, setSkips] = useState(0);
  const [totalGuessesCount, setTotalGuessesCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeSeconds, setTimeSeconds] = useState(0);

  // Game completion state
  const [isGameOver, setIsGameOver] = useState(false);
  const [fullArticle, setFullArticle] = useState(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isScoreSubmitted, setIsScoreSubmitted] = useState(false);
  const [submittedRank, setSubmittedRank] = useState(null);

  // Modal controls
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setAuthToken(savedToken);

        // Verify token is still valid
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
          .then((res) => {
            if (!res.ok) {
              // Token invalid, clear auth
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              setAuthToken(null);
            } else {
              return res.json();
            }
          })
          .then((data) => {
            if (data?.user) {
              setUser(data.user);
              localStorage.setItem('user', JSON.stringify(data.user));
            }
          })
          .catch(() => {
            // Silently fail, user can re-authenticate
          });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleAuthSuccess = (userData, token) => {
    setUser(userData);
    setAuthToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setAuthToken(null);
    if (currentView === 'admin') {
      setCurrentView('game');
    }
  };

  const isAdmin = user?.role === 'admin';

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (startTime && !isGameOver) {
      interval = setInterval(() => {
        setTimeSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isGameOver]);

  // Start new game
  const startNewGame = useCallback(
    async (cat = selectedCategory, specificArticleId = null) => {
      setLoading(true);
      setLastEvaluation(null);
      setWordAttemptsHistory([]);
      setCurrentAttempt(1);
      setCurrentWordIndex(1);
      setIsGameOver(false);
      setFullArticle(null);
      setIsArticleModalOpen(false);
      setIsScoreSubmitted(false);
      setSubmittedRank(null);
      setExactMatches(0);
      setSkips(0);
      setTotalGuessesCount(0);
      setStartTime(Date.now());
      setTimeSeconds(0);

      try {
        let url = '/api/game/start';
        const params = new URLSearchParams();
        if (specificArticleId) {
          params.append('articleId', specificArticleId);
        } else if (cat && cat !== 'All') {
          params.append('category', cat);
        }
        const qs = params.toString();
        if (qs) url += `?${qs}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load story');
        const data = await res.json();

        setGameMeta(data);
        setRevealedWords([{ word: data.firstWord, type: 'first' }]);
      } catch (err) {
        console.error('Error starting game:', err);
      } finally {
        setLoading(false);
      }
    },
    [selectedCategory]
  );

  useEffect(() => {
    startNewGame();
  }, []);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    startNewGame(cat);
  };

  // Complete game & fetch full article details
  const triggerGameOver = async (finalRevealedWords, finalScore, finalExact, finalSkips) => {
    setIsGameOver(true);
    setStreak((prev) => prev + 1);

    try {
      const res = await fetch(`/api/game/article/${gameMeta.articleId}`);
      if (res.ok) {
        const articleData = await res.json();
        setFullArticle(articleData);
        setIsArticleModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to load full article:', err);
    }
  };

  // User submits a guess
  const handleGuess = async (guess) => {
    if (!gameMeta || isGameOver || evaluating) return;
    setEvaluating(true);
    setTotalGuessesCount((prev) => prev + 1);

    try {
      const res = await fetch('/api/game/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: gameMeta.articleId,
          wordIndex: currentWordIndex,
          guess,
          attempt: currentAttempt,
        }),
      });

      if (!res.ok) throw new Error('Evaluation failed');
      const evalResult = await res.json();
      setLastEvaluation(evalResult);

      // Record in current word's attempt history
      setWordAttemptsHistory((prev) => [
        {
          guess,
          closenessScore: evalResult.closenessScore,
          isExact: evalResult.isExact,
          isCloseEnough: evalResult.isCloseEnough,
          pointsAwarded: evalResult.pointsAwarded,
        },
        ...prev,
      ]);

      if (evalResult.isExact) {
        // Bullseye!
        const earned = evalResult.pointsAwarded || 1000;
        const newScore = score + earned;
        setScore(newScore);
        const newExact = exactMatches + 1;
        setExactMatches(newExact);

        const newRevealed = [
          ...revealedWords,
          {
            word: evalResult.revealedWord,
            type: 'exact',
            score: 100,
            points: earned,
          },
        ];
        setRevealedWords(newRevealed);

        const nextIndex = currentWordIndex + 1;
        if (nextIndex >= gameMeta.totalWords) {
          await triggerGameOver(newRevealed, newScore, newExact, skips);
        } else {
          setCurrentWordIndex(nextIndex);
          setCurrentAttempt(1);
          setWordAttemptsHistory([]);
          setLastEvaluation(null);
        }
      } else {
        // Not exact: user may be close enough to advance or too far
        setCurrentAttempt((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Error submitting guess:', err);
    } finally {
      setEvaluating(false);
    }
  };

  // User accepts a close enough guess and proceeds
  const handleAcceptAndProceed = async () => {
    if (!lastEvaluation || !lastEvaluation.isCloseEnough || evaluating) return;
    setEvaluating(true);

    try {
      const earned = lastEvaluation.pointsAwarded || 500;
      const res = await fetch('/api/game/proceed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: gameMeta.articleId,
          wordIndex: currentWordIndex,
          action: 'accept',
          pointsEarned: earned,
        }),
      });

      if (!res.ok) throw new Error('Proceed failed');
      const data = await res.json();

      const newScore = score + data.pointsAwarded;
      setScore(newScore);

      const newRevealed = [
        ...revealedWords,
        {
          word: data.revealedWord,
          type: 'accepted',
          score: lastEvaluation.closenessScore,
          points: data.pointsAwarded,
        },
      ];
      setRevealedWords(newRevealed);

      const nextIndex = currentWordIndex + 1;
      if (nextIndex >= gameMeta.totalWords) {
        await triggerGameOver(newRevealed, newScore, exactMatches, skips);
      } else {
        setCurrentWordIndex(nextIndex);
        setCurrentAttempt(1);
        setWordAttemptsHistory([]);
        setLastEvaluation(null);
      }
    } catch (err) {
      console.error('Error proceeding:', err);
    } finally {
      setEvaluating(false);
    }
  };

  // User is stuck or guess too far, clicks "Proceed Nevertheless"
  const handleProceedNevertheless = async () => {
    if (!gameMeta || isGameOver || evaluating) return;
    setEvaluating(true);

    try {
      const res = await fetch('/api/game/proceed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: gameMeta.articleId,
          wordIndex: currentWordIndex,
          action: 'skip',
        }),
      });

      if (!res.ok) throw new Error('Skip failed');
      const data = await res.json();

      const newScore = score + (data.pointsAwarded || 50);
      setScore(newScore);
      const newSkips = skips + 1;
      setSkips(newSkips);

      const newRevealed = [
        ...revealedWords,
        {
          word: data.revealedWord,
          type: 'skipped',
          score: 0,
          points: data.pointsAwarded || 50,
        },
      ];
      setRevealedWords(newRevealed);

      const nextIndex = currentWordIndex + 1;
      if (nextIndex >= gameMeta.totalWords) {
        await triggerGameOver(newRevealed, newScore, exactMatches, newSkips);
      } else {
        setCurrentWordIndex(nextIndex);
        setCurrentAttempt(1);
        setWordAttemptsHistory([]);
        setLastEvaluation(null);
      }
    } catch (err) {
      console.error('Error skipping word:', err);
    } finally {
      setEvaluating(false);
    }
  };

  // Submit high score to Leaderboard (requires auth)
  const handleSubmitScore = async () => {
    if (!gameMeta) return;

    if (!user || !authToken) {
      // Open auth modal so user can log in first
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const totalWordsToGuess = Math.max(1, (gameMeta.totalWords || 2) - 1);
      const accuracy = Math.round(
        (exactMatches / Math.max(1, totalGuessesCount || totalWordsToGuess)) * 100
      );

      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          score,
          accuracy,
          words_completed: revealedWords.length,
          exact_matches: exactMatches,
          skips,
          total_attempts: totalGuessesCount,
          time_seconds: timeSeconds,
          news_id: gameMeta.articleId,
        }),
      });

      if (res.status === 401) {
        // Token expired, prompt re-login
        handleLogout();
        setIsAuthModalOpen(true);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setIsScoreSubmitted(true);
        setSubmittedRank(data.rank);
      }
    } catch (err) {
      console.error('Error submitting score:', err);
    }
  };

  // Calculate game stats for modal
  const totalWordsToGuess = Math.max(1, (gameMeta?.totalWords || 2) - 1);
  const accuracy = Math.round(
    (exactMatches / Math.max(1, totalGuessesCount || totalWordsToGuess)) * 100
  );

  const gameStats = {
    totalScore: score,
    exactMatches,
    skips,
    totalGuessesCount,
    accuracy: Math.min(100, Math.max(0, accuracy)),
    timeSeconds,
    wordResults: revealedWords.slice(1),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-slate-100">
      {/* Navigation Header */}
      <Header
        score={score}
        streak={streak}
        onNewStory={() => startNewGame()}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        categories={CATEGORIES}
        loading={loading}
        currentView={currentView}
        onToggleView={(view) => {
          if (view === 'admin' && !isAdmin) return;
          setCurrentView(view);
        }}
        user={user}
        isAdmin={isAdmin}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* View Switcher: Admin Desk vs Game Arena */}
      {currentView === 'admin' && isAdmin ? (
        <main className="flex-1 pb-safe">
          <AdminPanel
            onBackToGame={() => setCurrentView('game')}
            onPlaySpecificArticle={(articleId) => {
              setCurrentView('game');
              startNewGame(null, articleId);
            }}
          />
        </main>
      ) : (
        /* Main Game Arena */
        <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-8 space-y-3.5 sm:space-y-6 pb-6">
          {loading || !gameMeta ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] space-y-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 border-t-transparent animate-spin" />
              <p className="font-mono text-xs sm:text-sm text-slate-400">Loading breaking news dispatch...</p>
            </div>
          ) : (
            <>
              {/* The Wordle-style Headline Board */}
              <HeadlineBoard
                revealedWords={revealedWords}
                currentWordIndex={currentWordIndex}
                totalWords={gameMeta.totalWords}
                wordLengths={gameMeta.wordLengths}
                metadata={gameMeta}
                isGameOver={isGameOver}
              />

              {/* Input & Action Panel */}
              {!isGameOver ? (
                <div className="space-y-3 sm:space-y-4">
                  <GuessInput
                    onSubmitGuess={handleGuess}
                    onProceedNevertheless={handleProceedNevertheless}
                    onAcceptAndProceed={handleAcceptAndProceed}
                    loading={evaluating}
                    currentWordIndex={currentWordIndex}
                    currentAttempt={currentAttempt}
                    canProceed={lastEvaluation?.isCloseEnough}
                    isExact={lastEvaluation?.isExact}
                  />

                  {/* Semantic Closeness Meter */}
                  <ClosenessMeter
                    lastEvaluation={lastEvaluation}
                    onAcceptAndProceed={handleAcceptAndProceed}
                  />

                  {/* Guess History for the active word */}
                  <WordGuessHistory attempts={wordAttemptsHistory} />
                </div>
              ) : (
                <div className="bg-[#151c27] rounded-2xl p-4 sm:p-6 border border-emerald-500/40 text-center space-y-3.5 shadow-xl">
                  <h3 className="font-headline text-xl sm:text-2xl font-bold text-white">
                    Headline Complete!
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm">
                    You earned <strong className="text-emerald-400 font-mono">{score.toLocaleString()} points</strong>!
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-2.5">
                    <button
                      onClick={() => setIsArticleModalOpen(true)}
                      className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition flex items-center justify-center"
                    >
                      View Article &amp; Source
                    </button>
                    <button
                      onClick={() => startNewGame()}
                      className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center"
                    >
                      Play Next Headline
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-3 sm:py-4 text-center text-[11px] sm:text-xs text-slate-500 pb-safe">
        <p className="px-3">
          NewsGuessr © 2026 • Real News Headlines • Powered by Semantic NLP Embeddings &amp; MongoDB
        </p>
      </footer>

      {/* Modals */}
      <ArticleModal
        isOpen={isArticleModalOpen}
        article={fullArticle}
        gameStats={gameStats}
        onSubmitScore={handleSubmitScore}
        onPlayNext={() => {
          setIsArticleModalOpen(false);
          startNewGame();
        }}
        isScoreSubmitted={isScoreSubmitted}
        submittedRank={submittedRank}
        user={user}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentArticleId={gameMeta?.articleId}
      />

      <HowToPlayModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
