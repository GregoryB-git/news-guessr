import React from 'react';
import { HelpCircle, X } from 'lucide-react';

export default function HowToPlayModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#151c27] border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col pb-safe">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-headline font-bold text-white">How to Play</h2>
              <p className="text-[11px] text-slate-400">Contextual headline breaker</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Content */}
        <div className="space-y-3.5 text-xs sm:text-sm text-slate-300 overflow-y-auto pr-1 flex-1">
          <div className="flex gap-2.5">
            <div className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs sm:text-sm">Start with the Lead Word</h4>
              <p className="text-slate-400 text-[11px] sm:text-xs mt-0.5">
                Each news story begins with word #1 revealed. Guess the word immediately following it.
              </p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <div className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs sm:text-sm">Semantic Estimation</h4>
              <p className="text-slate-400 text-[11px] sm:text-xs mt-0.5">
                Our AI measures how well your word fits the context:
              </p>
              <div className="mt-2 space-y-1 font-mono text-[10px] sm:text-[11px] bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">🟩 100% Bullseye:</span>
                  <span>Exact target word (+1000 pts)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-cyan-400">🔵 85-99% Hot:</span>
                  <span>Direct journalistic synonym</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400">🟡 68-84% Close Enough:</span>
                  <span>Passes to next word or retry</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">⚪ &lt;68% Too Far:</span>
                  <span>Try again or Proceed nevertheless</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            <div className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs sm:text-sm">Stuck? Proceed Nevertheless</h4>
              <p className="text-slate-400 text-[11px] sm:text-xs mt-0.5">
                Too far off? You can always tap <strong className="text-amber-300">Proceed Nevertheless</strong> to reveal the word and continue with baseline points.
              </p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <div className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
              4
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs sm:text-sm">Full Story & Leaderboard</h4>
              <p className="text-slate-400 text-[11px] sm:text-xs mt-0.5">
                Complete the headline to read the entire news article, access the source link, and record your score!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="w-full min-h-[44px] py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center"
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
}
