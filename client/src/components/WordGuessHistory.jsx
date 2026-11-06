import React from 'react';
import { History } from 'lucide-react';

export default function WordGuessHistory({ attempts = [] }) {
  if (!attempts || attempts.length === 0) return null;

  return (
    <div className="bg-[#121721] rounded-2xl p-3 sm:p-4 border border-slate-800 shadow-md">
      <div className="flex items-center gap-1.5 mb-2.5 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-slate-400">
        <History className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span>Word #{attempts[0]?.guess ? '' : ''} Attempts ({attempts.length})</span>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {attempts.map((item, idx) => {
          let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
          let indicator = '⚪';

          if (item.isExact) {
            badgeColor = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 font-bold';
            indicator = '🟢';
          } else if (item.closenessScore >= 85) {
            badgeColor = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40';
            indicator = '🔵';
          } else if (item.isCloseEnough) {
            badgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/40';
            indicator = '🟡';
          } else if (item.closenessScore >= 45) {
            badgeColor = 'bg-orange-500/15 text-orange-300 border-orange-500/30';
            indicator = '🟠';
          } else {
            badgeColor = 'bg-slate-800/80 text-slate-400 border-slate-700/60';
            indicator = '⚪';
          }

          return (
            <div
              key={idx}
              className={`flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border text-xs sm:text-sm transition ${badgeColor}`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <span className="font-mono text-[10px] sm:text-xs opacity-60">#{idx + 1}</span>
                <span className="font-headline font-semibold text-sm sm:text-base truncate">{item.guess}</span>
                <span className="text-xs shrink-0">{indicator}</span>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px] sm:text-xs shrink-0">
                <span>{item.closenessScore}%</span>
                {item.pointsAwarded > 0 && (
                  <span className="text-emerald-400 font-bold">+{item.pointsAwarded}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
