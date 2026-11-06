import React from 'react';
import { Target, Zap, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

export default function ClosenessMeter({ lastEvaluation, onAcceptAndProceed }) {
  if (!lastEvaluation) {
    return (
      <div className="bg-[#121721] rounded-xl p-3 sm:p-4 border border-slate-800 text-center text-slate-400 text-xs">
        <span className="text-slate-300 font-medium">Type your guess for the next word above.</span>
        <p className="text-slate-500 mt-0.5 text-[11px]">
          Our semantic engine will estimate how closely your word fits the headline.
        </p>
      </div>
    );
  }

  const {
    closenessScore = 0,
    isExact = false,
    isCloseEnough = false,
    feedback = '',
    pointsAwarded = 0,
  } = lastEvaluation;

  // Color mapping based on score
  let barGradient = 'from-slate-600 to-slate-500';
  let badgeBorder = 'border-slate-700 bg-slate-800/80 text-slate-300';
  let icon = <AlertTriangle className="w-4 h-4 text-slate-400 shrink-0" />;

  if (isExact) {
    barGradient = 'from-emerald-500 to-teal-400';
    badgeBorder = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300';
    icon = <Target className="w-4 h-4 text-emerald-400 shrink-0" />;
  } else if (closenessScore >= 85) {
    barGradient = 'from-cyan-500 to-emerald-400';
    badgeBorder = 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300';
    icon = <Zap className="w-4 h-4 text-cyan-400 shrink-0" />;
  } else if (isCloseEnough) {
    barGradient = 'from-amber-500 to-yellow-400';
    badgeBorder = 'border-amber-500/50 bg-amber-500/10 text-amber-300';
    icon = <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />;
  } else if (closenessScore >= 45) {
    barGradient = 'from-orange-500 to-amber-500';
    badgeBorder = 'border-orange-500/40 bg-orange-500/10 text-orange-300';
    icon = <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />;
  }

  return (
    <div className="bg-[#121721] rounded-2xl p-3.5 sm:p-5 border border-slate-800 shadow-lg space-y-3">
      {/* Top summary row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {icon}
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-300 font-mono">
            Semantic Match
          </span>
        </div>

        <div className="flex items-center gap-2">
          {pointsAwarded > 0 && (
            <span className="text-[11px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              +{pointsAwarded} pts
            </span>
          )}
          <span className="font-mono text-base sm:text-xl font-black text-white">
            {closenessScore}%
          </span>
        </div>
      </div>

      {/* Progress Bar Gauge */}
      <div className="space-y-1">
        <div className="w-full h-2.5 sm:h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-500 ease-out`}
            style={{ width: `${Math.max(4, closenessScore)}%` }}
          />
        </div>

        {/* Threshold Markers */}
        <div className="flex justify-between text-[9px] sm:text-[10px] font-mono text-slate-500 px-0.5">
          <span>0% Cold</span>
          <span className="text-orange-400/80 hidden xs:inline">45% Warm</span>
          <span className="text-amber-400 font-bold">68% Pass</span>
          <span className="text-emerald-400 font-bold">100% Bullseye</span>
        </div>
      </div>

      {/* Feedback Message Bubble */}
      <div className={`p-2.5 sm:p-3 rounded-xl border flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2.5 ${badgeBorder}`}>
        <p className="text-xs sm:text-sm font-medium leading-snug">{feedback}</p>

        {isCloseEnough && !isExact && onAcceptAndProceed && (
          <button
            onClick={onAcceptAndProceed}
            className="w-full xs:w-auto shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition active:scale-95 min-h-[36px]"
          >
            <span>Accept & Advance</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
