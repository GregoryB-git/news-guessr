import React, { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';

export default function LeaderboardModal({ isOpen, onClose, currentArticleId }) {
  const [entries, setEntries] = useState([]);
  const [filterMode, setFilterMode] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen, filterMode]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let url = '/api/leaderboard?limit=25';
      if (filterMode === 'article' && currentArticleId) {
        url += `&news_id=${currentArticleId}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#151c27] border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col pb-safe">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-headline font-bold text-white">Leaderboard</h2>
              <p className="text-[11px] text-slate-400">Top headline deciphering scouts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-medium shrink-0">
          <button
            onClick={() => setFilterMode('all')}
            className={`flex-1 py-2 rounded-lg transition min-h-[38px] ${
              filterMode === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All-Time High Scores
          </button>
          {currentArticleId && (
            <button
              onClick={() => setFilterMode('article')}
              className={`flex-1 py-2 rounded-lg transition min-h-[38px] ${
                filterMode === 'article'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Current Story
            </button>
          )}
        </div>

        {/* Entries List */}
        <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
          {loading ? (
            <div className="text-center py-8 text-slate-500 text-xs font-mono animate-pulse">
              Retrieving scores from database...
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No recorded high scores yet. Complete a headline to claim #1!
            </div>
          ) : (
            entries.map((item, index) => {
              const rank = index + 1;
              let rankBadge = (
                <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center font-mono text-xs font-bold text-slate-400 shrink-0">
                  {rank}
                </span>
              );

              if (rank === 1) {
                rankBadge = (
                  <span className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-xs shrink-0">
                    🥇
                  </span>
                );
              } else if (rank === 2) {
                rankBadge = (
                  <span className="w-6 h-6 rounded bg-slate-400/20 text-slate-300 border border-slate-400/40 flex items-center justify-center text-xs shrink-0">
                    🥈
                  </span>
                );
              } else if (rank === 3) {
                rankBadge = (
                  <span className="w-6 h-6 rounded bg-amber-700/20 text-amber-600 border border-amber-700/40 flex items-center justify-center text-xs shrink-0">
                    🥉
                  </span>
                );
              }

              return (
                <div
                  key={item._id || index}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 transition"
                >
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    {rankBadge}
                    <div className="truncate">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                        {item.player_name}
                      </h4>
                      {item.headline_preview && (
                        <p className="text-[10px] text-slate-500 truncate italic">
                          {item.headline_preview}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-black text-xs sm:text-sm text-emerald-400 block">
                      {item.score?.toLocaleString()} pts
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-mono text-slate-400">
                      {item.accuracy}% acc • {item.time_seconds || 0}s
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="w-full min-h-[44px] py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center justify-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
