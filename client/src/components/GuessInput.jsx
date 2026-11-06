import React, { useState, useRef, useEffect } from 'react';
import { Send, FastForward, Sparkles, X } from 'lucide-react';

export default function GuessInput({
  onSubmitGuess,
  onProceedNevertheless,
  loading,
  currentWordIndex,
  currentAttempt = 1,
  canProceed = false,
  isExact = false,
  onAcceptAndProceed,
}) {
  const [guess, setGuess] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setGuess('');
  }, [currentWordIndex]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!guess.trim() || loading) return;
    onSubmitGuess(guess.trim());
    setGuess('');
  };

  return (
    <div className="bg-[#151b26] rounded-2xl p-3.5 sm:p-5 border border-slate-800 shadow-xl space-y-3 sm:space-y-4">
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            inputMode="text"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            enterKeyHint="go"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Type your guess for next word..."
            disabled={loading}
            className="w-full pl-3.5 pr-20 py-3 sm:py-3.5 rounded-xl bg-slate-900 border-2 border-slate-700/80 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 text-slate-100 font-headline text-base sm:text-lg placeholder:font-sans placeholder:text-slate-500 transition"
          />

          {/* Right inline controls: Clear button + Attempt badge */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {guess && (
              <button
                type="button"
                onClick={() => setGuess('')}
                className="p-1 rounded-full text-slate-500 hover:text-slate-300 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <span className="text-[11px] sm:text-xs text-slate-400 font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
              #{currentAttempt}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!guess.trim() || loading}
          className="min-h-[46px] flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>Submit Guess</span>
        </button>
      </form>

      {/* Alternative Actions: Proceed / Accept / Skip */}
      <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
        <div className="text-slate-400 flex items-center justify-between xs:justify-start gap-1.5 text-[11px] sm:text-xs">
          <span>Target:</span>
          <span className="font-semibold text-slate-200">Word #{currentWordIndex + 1}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* If the user had a close enough guess, offer direct advance */}
          {canProceed && !isExact && (
            <button
              type="button"
              onClick={onAcceptAndProceed}
              disabled={loading}
              className="flex-1 xs:flex-none min-h-[38px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold transition active:scale-95 text-[11px] sm:text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Accept & Next Word</span>
            </button>
          )}

          {/* Proceed nevertheless / Skip button */}
          <button
            type="button"
            onClick={onProceedNevertheless}
            disabled={loading}
            title="Reveal actual word and advance with minimal points"
            className="flex-1 xs:flex-none min-h-[38px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 transition active:scale-95 text-[11px] sm:text-xs"
          >
            <FastForward className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Proceed Nevertheless</span>
          </button>
        </div>
      </div>
    </div>
  );
}
