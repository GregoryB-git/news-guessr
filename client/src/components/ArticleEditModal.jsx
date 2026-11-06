import React, { useState, useEffect } from 'react';
import { X, Check, Globe, FileText, Tag, BarChart3, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Science', 'Tech', 'World', 'Climate', 'Culture', 'Business'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const STATUSES = [
  { id: 'upcoming', label: '1. Upcoming News (Queue)', desc: 'Queued for future daily rotation' },
  { id: 'current', label: '2. Current News (Active Today)', desc: 'Featured headline shown to players right now' },
  { id: 'archived', label: '3. Archive', desc: 'Retired historical news headline' },
];

export default function ArticleEditModal({
  isOpen,
  onClose,
  onSave,
  initialArticle = null,
  defaultStatus = 'upcoming',
}) {
  const [headline, setHeadline] = useState('');
  const [newsbody, setNewsbody] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [category, setCategory] = useState('Science');
  const [difficulty, setDifficulty] = useState('Medium');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState(defaultStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialArticle) {
      setHeadline(initialArticle.headline || '');
      setNewsbody(initialArticle.newsbody || '');
      setSourceUrl(initialArticle.source_url || '');
      setSourceName(initialArticle.source_name || '');
      setCategory(initialArticle.category || 'Science');
      setDifficulty(initialArticle.difficulty || 'Medium');
      setSummary(initialArticle.summary || '');
      setStatus(initialArticle.status || 'upcoming');
    } else {
      setHeadline('');
      setNewsbody('');
      setSourceUrl('');
      setSourceName('');
      setCategory('Science');
      setDifficulty('Medium');
      setSummary('');
      setStatus(defaultStatus);
    }
    setError('');
  }, [initialArticle, defaultStatus, isOpen]);

  if (!isOpen) return null;

  const wordCount = headline.trim() ? headline.trim().split(/\s+/).length : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!headline.trim() || !newsbody.trim() || !sourceUrl.trim()) {
      setError('Headline, news body, and source URL are required.');
      return;
    }
    if (wordCount < 3) {
      setError('Headline must contain at least 3 words for gameplay.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSave({
        _id: initialArticle?._id,
        headline: headline.trim(),
        newsbody: newsbody.trim(),
        source_url: sourceUrl.trim(),
        source_name: sourceName.trim() || 'News Wire',
        category,
        difficulty,
        summary: summary.trim() || headline.slice(0, 120),
        status,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save news article.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#151c27] border border-slate-700/80 rounded-3xl max-w-2xl w-full p-4 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] flex flex-col my-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-headline font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span>{initialArticle ? 'Edit News Story' : 'New Headline Story'}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Manage content for the 3 editorial sections
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form id="article-form" onSubmit={handleSubmit} className="overflow-y-auto space-y-4 pr-1 flex-1 text-xs sm:text-sm">
          {/* Section Assignment */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 font-mono text-xs uppercase tracking-wider block">
              Editorial Section Assignment
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {STATUSES.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setStatus(item.id)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    status === item.id
                      ? item.id === 'current'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md shadow-amber-500/10'
                        : item.id === 'upcoming'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-700/40 border-slate-500 text-slate-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold text-xs">{item.label}</span>
                  <span className="text-[10px] text-slate-400 mt-1">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-300 font-mono text-xs uppercase tracking-wider">
                Headline (Game Puzzle)
              </label>
              <span className={`font-mono text-xs ${wordCount >= 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {wordCount} words
              </span>
            </div>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. NASA Discovers Atmospheric Clues on Earth-Sized Rocky Exoplanet"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:outline-none text-slate-100 font-headline text-base"
            />
            <p className="text-[11px] text-slate-500">
              Word #1 is shown first; remaining words are guessed sequentially by players.
            </p>
          </div>

          {/* Category & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Category</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:outline-none text-slate-200 text-xs"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Difficulty</span>
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:outline-none text-slate-200 text-xs"
              >
                {DIFFICULTIES.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Source URL & Source Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 font-mono text-xs uppercase tracking-wider">
                Source Name
              </label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="e.g. Reuters, NASA Science, BBC"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:outline-none text-slate-100 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Original Source Link</span>
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:outline-none text-slate-100 text-xs"
              />
            </div>
          </div>

          {/* News Body */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 font-mono text-xs uppercase tracking-wider">
              News Body (Full Article Text)
            </label>
            <textarea
              rows={4}
              value={newsbody}
              onChange={(e) => setNewsbody(e.target.value)}
              placeholder="Paste the full article body or paragraph here. This is displayed upon victory with the original source link..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:outline-none text-slate-100 font-serif text-xs sm:text-sm leading-relaxed"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="article-form"
            disabled={saving}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Saving...' : initialArticle ? 'Save Changes' : 'Create Story'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
