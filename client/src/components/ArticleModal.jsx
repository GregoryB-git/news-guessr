import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ExternalLink, Trophy, Share2, Check, ArrowRight, Award, LogIn } from 'lucide-react';

export default function ArticleModal({
  isOpen,
  article,
  gameStats,
  onSubmitScore,
  onPlayNext,
  isScoreSubmitted,
  submittedRank,
  user,
}) {
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 50,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 40,
          angle: 120,
          spread: 50,
          origin: { x: 1 },
        });
      }, 250);
    }
  }, [isOpen]);

  if (!isOpen || !article) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || isScoreSubmitted) return;
    setSubmitting(true);
    await onSubmitScore();
    setSubmitting(false);
  };

  const handleShare = () => {
    const emojiGrid = (gameStats.wordResults || [])
      .map((w) => {
        if (w.type === 'exact') return '🟩';
        if (w.type === 'accepted') return '🟨';
        return '⬜';
      })
      .join('');

    const words = article.headline.trim().split(/\s+/);
    const maskedHeadline = words.map((w, i) => (i === 0 ? w : '___')).join(' ');

    const text = `NewsGuessr 📰\n${maskedHeadline}\nScore: ${gameStats.totalScore?.toLocaleString()} pts | Acc: ${gameStats.accuracy}%\n${emojiGrid}\nPlay: ${window.location.origin}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#151c27] border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-7 shadow-2xl space-y-4 sm:space-y-5 max-h-[92vh] flex flex-col pb-safe">
        {/* Celebration Header */}
        <div className="text-center space-y-1 shrink-0 pt-1">
          <div className="inline-flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/20 text-slate-950 mb-1">
            <Award className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-headline font-bold text-white">
            Headline Decoded!
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400">
            You successfully completed this breaking news dispatch
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-4 pr-1">
          {/* Score Stats Matrix */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 bg-slate-900/90 p-2.5 sm:p-3.5 rounded-2xl border border-slate-800 text-center">
            <div className="p-1">
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                Score
              </span>
              <span className="text-base sm:text-2xl font-black font-mono text-emerald-400">
                {gameStats.totalScore?.toLocaleString() || 0}
              </span>
            </div>

            <div className="p-1">
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                Exact
              </span>
              <span className="text-base sm:text-2xl font-bold font-mono text-cyan-400">
                {gameStats.exactMatches || 0}
              </span>
            </div>

            <div className="p-1">
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                Accuracy
              </span>
              <span className="text-base sm:text-2xl font-bold font-mono text-amber-400">
                {gameStats.accuracy || 100}%
              </span>
            </div>

            <div className="p-1">
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                Time
              </span>
              <span className="text-base sm:text-2xl font-bold font-mono text-slate-300">
                {gameStats.timeSeconds || 0}s
              </span>
            </div>
          </div>

          {/* Full Article Card */}
          <div className="bg-slate-900/60 rounded-2xl p-3.5 sm:p-5 border border-slate-800 space-y-2.5 text-left">
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-2">
              <span className="font-semibold text-emerald-400 uppercase tracking-wider">
                {article.category} • {article.source_name}
              </span>
              <span>{new Date(article.published_date || Date.now()).toLocaleDateString()}</span>
            </div>

            <h3 className="font-headline font-bold text-base sm:text-xl text-slate-100 leading-snug">
              {article.headline}
            </h3>

            <div className="text-slate-300 text-xs sm:text-sm leading-relaxed max-h-36 sm:max-h-48 overflow-y-auto pr-1 space-y-2 font-serif">
              <p>{article.newsbody}</p>
            </div>

            {/* Clickable original source link */}
            <div className="pt-2 border-t border-slate-800/80">
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition group underline-offset-4 hover:underline"
              >
                <span>Read original on {article.source_name || 'source'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Leaderboard Submission */}
          {!isScoreSubmitted ? (
            <div className="bg-[#1a2332] p-3 sm:p-4 rounded-2xl border border-slate-700/60 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 font-mono uppercase tracking-wider">
                <Trophy className="w-4 h-4" />
                <span>Submit to Leaderboard</span>
              </div>

              {user ? (
                <div className="space-y-2.5">
                  <p className="text-xs text-slate-400">
                    Posting as <strong className="text-emerald-400">{user.displayName || user.email}</strong>
                  </p>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? 'Posting...' : 'Post Score'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-xs text-slate-400">
                    Sign in or create an account to submit your score to the leaderboard.
                  </p>
                  <button
                    onClick={onSubmitScore}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In to Post Score
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
              <p className="text-xs sm:text-sm text-emerald-300 font-semibold flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>Score posted! {submittedRank ? `Ranked #${submittedRank}` : ''}</span>
              </p>
            </div>
          )}
        </div>

        {/* Sticky Actions Bar */}
        <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-slate-800 shrink-0">
          <button
            onClick={handleShare}
            className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Copied Grid!' : 'Share Result'}</span>
          </button>

          <button
            onClick={onPlayNext}
            className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition"
          >
            <span>Next Story</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
