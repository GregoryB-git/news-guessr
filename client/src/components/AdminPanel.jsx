import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Archive as ArchiveIcon,
  Play,
  ExternalLink,
  Calendar,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import ArticleEditModal from './ArticleEditModal';

export default function AdminPanel({ onBackToGame, onPlaySpecificArticle }) {
  const [sections, setSections] = useState({ upcoming: [], current: null, archive: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'upcoming', 'current', 'archive'
  const [modalState, setModalState] = useState({
    isOpen: false,
    article: null,
    defaultStatus: 'upcoming',
  });

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news/admin/sections');
      if (res.ok) {
        const data = await res.json();
        setSections(data);
      }
    } catch (err) {
      console.error('Failed to load news sections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`/api/news/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchSections();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (id, headline) => {
    if (!window.confirm(`Delete story: "${headline}"?`)) return;
    try {
      const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSections();
      }
    } catch (err) {
      console.error('Failed to delete story:', err);
    }
  };

  const handleSaveArticle = async (articleData) => {
    const isEdit = Boolean(articleData._id);
    const url = isEdit ? `/api/news/${articleData._id}` : '/api/news';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save news article.');
    }

    fetchSections();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6">
      {/* Editorial Header */}
      <div className="bg-[#151c27] border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="font-headline text-xl sm:text-3xl font-bold text-white tracking-tight">
              Newsroom Editorial Desk
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage upcoming queue, active daily headline, and historical archive.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setModalState({ isOpen: true, article: null, defaultStatus: 'upcoming' })}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Story</span>
          </button>

          <button
            onClick={fetchSections}
            disabled={loading}
            title="Refresh list"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onBackToGame}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>Play Game</span>
          </button>
        </div>
      </div>

      {/* Mobile / Screen Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800 text-xs font-medium overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl transition whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-slate-800 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All 3 Sections
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl transition whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'upcoming'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>1. Upcoming ({sections.upcoming?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('current')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl transition whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'current'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>2. Current ({sections.current ? 1 : 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('archive')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl transition whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'archive'
              ? 'bg-slate-700/40 text-slate-200 border border-slate-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArchiveIcon className="w-3.5 h-3.5 text-slate-400" />
          <span>3. Archive ({sections.archive?.length || 0})</span>
        </button>
      </div>

      {/* 3 Sections Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* =========================================================================
            SECTION 1: UPCOMING NEWS (Future posts, latest submitted first)
           ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'upcoming') && (
          <div className="bg-[#121721] rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-headline font-bold text-white flex items-center gap-1.5">
                    <span>1. Upcoming News</span>
                    <span className="text-xs font-mono font-normal text-slate-400">
                      ({sections.upcoming?.length || 0})
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Latest submitted takes next daily spot
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalState({ isOpen: true, article: null, defaultStatus: 'upcoming' })}
                title="Add upcoming story"
                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {sections.upcoming?.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs border-2 border-dashed border-slate-800/80 rounded-2xl p-6">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p className="font-semibold text-slate-400">No upcoming news queued</p>
                  <p className="mt-1">Add stories here to schedule future headlines.</p>
                </div>
              ) : (
                sections.upcoming.map((article, index) => {
                  const words = article.headline.trim().split(/\s+/).filter(Boolean);
                  const isLatest = index === 0;

                  return (
                    <div
                      key={article._id}
                      className={`p-3.5 rounded-2xl bg-slate-900/80 border transition hover:border-slate-700 space-y-2.5 ${
                        isLatest
                          ? 'border-emerald-500/30 ring-1 ring-emerald-500/20 shadow-md shadow-emerald-950/20'
                          : 'border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                            {article.category}
                          </span>
                          {isLatest && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-bold">
                              ★ Next in Line
                            </span>
                          )}
                        </div>
                        <span>{words.length} words</span>
                      </div>

                      <h3 className="font-headline font-bold text-sm sm:text-base text-slate-100 leading-snug">
                        {article.headline}
                      </h3>

                      <p className="text-[11px] text-slate-400 line-clamp-2 font-serif">
                        {article.newsbody}
                      </p>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                        <span className="text-[10px] text-slate-500 truncate max-w-[110px]">
                          {article.source_name}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStatusChange(article._id, 'current')}
                            title="Set as Current News for today"
                            className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 font-semibold text-[10px] flex items-center gap-1 active:scale-95 transition"
                          >
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>Make Current</span>
                          </button>

                          <button
                            onClick={() => setModalState({ isOpen: true, article, defaultStatus: 'upcoming' })}
                            title="Edit story"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleStatusChange(article._id, 'archived')}
                            title="Move to Archive"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                          >
                            <ArchiveIcon className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(article._id, article.headline)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 2: CURRENT NEWS (Active daily headline for all players)
           ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'current') && (
          <div className="bg-[#121721] rounded-3xl p-4 sm:p-5 border-2 border-amber-500/40 shadow-2xl shadow-amber-950/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-headline font-bold text-white flex items-center gap-2">
                    <span>2. Current News</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold animate-pulse">
                      ● LIVE TODAY
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Shown to all users playing today's game
                  </p>
                </div>
              </div>
            </div>

            {!sections.current ? (
              <div className="text-center py-12 text-slate-500 text-xs border-2 border-dashed border-slate-800 rounded-2xl p-6">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="font-semibold text-slate-400">No Current story set</p>
                <p className="mt-1">
                  Promote a story from Upcoming or create a new one to activate daily play.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 space-y-3.5 shadow-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {sections.current.category} • {sections.current.difficulty}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {sections.current.headline.trim().split(/\s+/).length} words
                    </span>
                  </div>

                  <h3 className="font-headline font-bold text-lg sm:text-xl text-white leading-snug">
                    {sections.current.headline}
                  </h3>

                  {/* Word Sequence Tiles Preview */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                      Word Guess Sequence:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sections.current.headline
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean)
                        .map((w, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-1 rounded-lg text-xs font-headline font-semibold ${
                              idx === 0
                                ? 'bg-slate-700 text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {w}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 font-serif leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800 max-h-36 overflow-y-auto">
                    <p>{sections.current.newsbody}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
                    <span className="font-medium text-slate-300">
                      Source: {sections.current.source_name}
                    </span>
                    <a
                      href={sections.current.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px] underline"
                    >
                      <span>Original Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Current Story Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() =>
                      setModalState({
                        isOpen: true,
                        article: sections.current,
                        defaultStatus: 'current',
                      })
                    }
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Edit Story</span>
                  </button>

                  <button
                    onClick={() => onPlaySpecificArticle(sections.current._id)}
                    className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-300 text-xs font-semibold border border-emerald-500/40 flex items-center justify-center gap-1.5 transition"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Test Play</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange(sections.current._id, 'archived')}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-400 hover:text-white text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition"
                  >
                    <ArchiveIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Archive</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            SECTION 3: ARCHIVE (Retired historical headlines)
           ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'archive') && (
          <div className="bg-[#121721] rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                  <ArchiveIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-headline font-bold text-white flex items-center gap-1.5">
                    <span>3. Archive</span>
                    <span className="text-xs font-mono font-normal text-slate-400">
                      ({sections.archive?.length || 0})
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Past stories retired from the daily slot
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {sections.archive?.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs border-2 border-dashed border-slate-800 rounded-2xl p-6">
                  <ArchiveIcon className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p className="font-semibold text-slate-400">Archive is empty</p>
                  <p className="mt-1">Retired daily headlines will appear here.</p>
                </div>
              ) : (
                sections.archive.map((article) => {
                  const words = article.headline.trim().split(/\s+/).filter(Boolean);

                  return (
                    <div
                      key={article._id}
                      className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition space-y-2.5 opacity-90 hover:opacity-100"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          {article.category}
                        </span>
                        <span>{words.length} words</span>
                      </div>

                      <h3 className="font-headline font-bold text-sm text-slate-200 leading-snug">
                        {article.headline}
                      </h3>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                        <span className="text-[10px] text-slate-500 truncate max-w-[100px]">
                          {article.source_name}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStatusChange(article._id, 'current')}
                            title="Promote to Current"
                            className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 text-[10px] font-semibold active:scale-95 transition"
                          >
                            Set Current
                          </button>

                          <button
                            onClick={() => handleStatusChange(article._id, 'upcoming')}
                            title="Move back to Upcoming Queue"
                            className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-[10px] font-semibold active:scale-95 transition"
                          >
                            Queue
                          </button>

                          <button
                            onClick={() => setModalState({ isOpen: true, article, defaultStatus: 'archived' })}
                            title="Edit"
                            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(article._id, article.headline)}
                            title="Delete"
                            className="p-1 rounded-lg text-slate-500 hover:text-red-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Article Modal */}
      <ArticleEditModal
        isOpen={modalState.isOpen}
        initialArticle={modalState.article}
        defaultStatus={modalState.defaultStatus}
        onClose={() => setModalState({ isOpen: false, article: null, defaultStatus: 'upcoming' })}
        onSave={handleSaveArticle}
      />
    </div>
  );
}
