import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

export default function HeadlineBoard({
  revealedWords,
  currentWordIndex,
  totalWords,
  wordLengths = [],
  metadata = {},
  isGameOver = false,
}) {
  return (
    <div className="bg-[#151b26] rounded-2xl p-3.5 sm:p-6 md:p-7 border border-slate-800/80 shadow-2xl relative overflow-hidden">
      {/* Background ambient editorial motif */}
      <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Metadata Header */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800/80 text-[11px] sm:text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2 truncate">
          <span className="px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            {metadata.category || 'News'}
          </span>
          <span className="text-slate-400 truncate max-w-[140px] sm:max-w-xs">
            {metadata.source_name || 'News Wire'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] sm:text-xs shrink-0">
          <span>
            <strong className="text-emerald-400">
              {Math.min(currentWordIndex, totalWords)}/{totalWords}
            </strong>{' '}
            words
          </span>
          <span className="h-3 w-px bg-slate-800 hidden xs:inline" />
          <span className="capitalize hidden xs:inline">{metadata.difficulty || 'Med'}</span>
        </div>
      </div>

      {/* Headline Word Tiles Container */}
      <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-6 sm:gap-y-7 my-2">
        {Array.from({ length: totalWords }).map((_, index) => {
          const isRevealed = index < revealedWords.length;
          const isCurrent = index === currentWordIndex && !isGameOver;
          const wordData = revealedWords[index];
          const wordLength = wordLengths[index] || 5;

          // Word 0 is always the starting revealed word
          if (index === 0) {
            return (
              <div
                key={index}
                className="relative flex flex-col items-center animate-pop select-none"
              >
                <div className="px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl bg-slate-800 border-2 border-slate-600 text-slate-100 font-headline text-base sm:text-xl md:text-2xl font-bold tracking-wide shadow-md">
                  {wordData?.word || 'Lead'}
                </div>
                <span className="absolute -bottom-4 text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-slate-400 whitespace-nowrap">
                  Lead Word
                </span>
              </div>
            );
          }

          // Already guessed or revealed words
          if (isRevealed && wordData) {
            const isExact = wordData.type === 'exact';
            const isAccepted = wordData.type === 'accepted';
            const isSkipped = wordData.type === 'skipped';

            let tileClasses = 'bg-emerald-600/20 border-emerald-500 text-emerald-200 shadow-emerald-950/40';
            let badgeText = 'Bullseye';
            let badgeColor = 'text-emerald-400';

            if (isAccepted) {
              tileClasses = 'bg-cyan-600/20 border-cyan-500 text-cyan-200 shadow-cyan-950/40';
              badgeText = `${wordData.score || 85}%`;
              badgeColor = 'text-cyan-400';
            } else if (isSkipped) {
              tileClasses = 'bg-amber-600/15 border-amber-600/40 text-amber-200/90 shadow-amber-950/20';
              badgeText = 'Skipped';
              badgeColor = 'text-amber-400/80';
            }

            return (
              <div
                key={index}
                className="relative flex flex-col items-center animate-pop select-none"
              >
                <div
                  className={`px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border-2 font-headline text-base sm:text-xl md:text-2xl font-bold tracking-wide shadow-lg flex items-center gap-1 sm:gap-1.5 transition-all ${tileClasses}`}
                >
                  <span>{wordData.word}</span>
                  {isExact && <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />}
                  {isAccepted && <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />}
                </div>
                <span className={`absolute -bottom-4 text-[8px] sm:text-[9px] font-mono uppercase tracking-wider whitespace-nowrap ${badgeColor}`}>
                  {badgeText}
                </span>
              </div>
            );
          }

          // Active target word currently being guessed
          if (isCurrent) {
            return (
              <div
                key={index}
                className="relative flex flex-col items-center select-none"
              >
                <div className="px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl bg-emerald-500/10 border-2 border-emerald-400 text-emerald-300 font-headline text-base sm:text-xl md:text-2xl font-bold tracking-wide shadow-lg shadow-emerald-500/20 pulse-target flex items-center gap-1">
                  <span className="text-emerald-400/70 font-mono text-sm sm:text-base">#</span>
                  <span className="italic">Word {index + 1}</span>
                </div>
                <span className="absolute -bottom-4 text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-emerald-400 font-semibold animate-pulse whitespace-nowrap">
                  {wordLength} letters
                </span>
              </div>
            );
          }

          // Future upcoming words (blank placeholder tiles)
          return (
            <div
              key={index}
              className="relative flex flex-col items-center opacity-60 select-none"
            >
              <div className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl bg-slate-900/60 border-2 border-dashed border-slate-700/70 text-slate-500 font-mono text-xs sm:text-sm font-medium min-w-[2.5rem] sm:min-w-[3.5rem] text-center">
                ···
              </div>
              <span className="absolute -bottom-4 text-[8px] sm:text-[9px] font-mono text-slate-600 whitespace-nowrap">
                #{index + 1}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="mt-7 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
        <span className="truncate pr-2">
          Guess the next word in headline context.
        </span>
        <span className="font-mono text-[10px] text-slate-600 shrink-0">
          NewsGuessr
        </span>
      </div>
    </div>
  );
}
