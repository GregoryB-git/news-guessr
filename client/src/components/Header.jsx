import React from 'react';
import { Newspaper, Trophy, HelpCircle, Shuffle, Flame, Shield, Play, LogIn, LogOut, User } from 'lucide-react';

export default function Header({
  score,
  streak,
  onNewStory,
  onOpenLeaderboard,
  onOpenHelp,
  selectedCategory,
  onSelectCategory,
  categories,
  loading,
  currentView = 'game',
  onToggleView,
  user,
  isAdmin,
  onOpenAuth,
  onLogout,
}) {
  const isAdminView = currentView === 'admin';

  return (
    <header className="border-b border-slate-800/90 bg-[#121721]/95 backdrop-blur-md sticky top-0 z-30 pt-safe transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
        {/* Main Header Bar */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => onToggleView && onToggleView('game')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0 group-hover:scale-105 transition-transform">
                <Newspaper className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-headline text-lg sm:text-2xl font-bold tracking-tight text-white flex items-center">
                    News<span className="text-emerald-400">Guessr</span>
                  </h1>
                  {isAdminView ? (
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Editorial Desk
                    </span>
                  ) : (
                    <span className="hidden sm:inline-block text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Daily
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 hidden md:block">
                  {isAdminView ? 'Admin News Management' : 'Contextual breaking headline challenge'}
                </p>
              </div>
            </button>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {!isAdminView && (
              <>
                {/* Live Score & Streak Pill */}
                <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl border border-slate-800 text-xs">
                  <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm">
                    {score.toLocaleString()}
                  </span>
                  <span className="text-slate-600 font-mono hidden xs:inline">•</span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="font-mono font-bold text-[11px] sm:text-xs text-slate-200">
                      {streak}
                    </span>
                  </div>
                </div>

                {/* New Story Button */}
                <button
                  onClick={onNewStory}
                  disabled={loading}
                  title="Next Story"
                  className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-slate-200 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 transition flex items-center gap-1 text-xs font-semibold disabled:opacity-50 min-h-[38px] min-w-[38px] justify-center"
                >
                  <Shuffle className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">New</span>
                </button>

                {/* Leaderboard Button */}
                <button
                  onClick={onOpenLeaderboard}
                  title="Leaderboard"
                  className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 border border-amber-500/30 transition flex items-center gap-1 text-xs font-semibold min-h-[38px] min-w-[38px] justify-center"
                >
                  <Trophy className="w-4 h-4" />
                  <span className="hidden md:inline">Rank</span>
                </button>

                {/* Help Button */}
                <button
                  onClick={onOpenHelp}
                  title="How to play"
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 active:scale-95 transition min-h-[38px] min-w-[38px] flex items-center justify-center"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Admin Desk Switcher Button - Only visible to admins */}
            {isAdmin && (
              <button
                onClick={() => onToggleView && onToggleView(isAdminView ? 'game' : 'admin')}
                title={isAdminView ? 'Return to Play Game' : 'Open Admin Editorial Desk'}
                className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 min-h-[38px] ${
                  isAdminView
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/25'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                {isAdminView ? (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span className="hidden xs:inline">Back to Game</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Admin Desk</span>
                  </>
                )}
              </button>
            )}

            {/* Auth: Sign In / User Menu */}
            {user ? (
              <div className="flex items-center gap-1.5">
                <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-200 font-semibold max-w-[100px] truncate">
                    {user.displayName || user.email}
                  </span>
                  {isAdmin && (
                    <span className="px-1 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 active:scale-95 transition min-h-[38px] min-w-[38px] flex items-center justify-center"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                title="Sign In"
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 min-h-[38px] bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Horizontal Scrolling Pills (only in game view) */}
        {!isAdminView && (
          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`text-[11px] sm:text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-all font-medium active:scale-95 shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/25'
                    : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
