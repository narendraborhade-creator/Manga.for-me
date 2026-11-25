import React, { useState, useEffect } from 'react';
import logoImg from '../assets/logo.png';
import { 
  Settings, 
  Layers, 
  Download, 
  Upload, 
  Trash2, 
  FolderPlus, 
  Check, 
  ExternalLink, 
  Sliders, 
  ShieldCheck, 
  ShieldAlert,
  Sparkles, 
  Palette, 
  Smartphone, 
  Globe, 
  HardDrive, 
  HelpCircle,
  Link,
  Copy,
  Folder,
  Radio,
  BookOpen
} from 'lucide-react';
import { 
  getCategories, 
  saveCategories, 
  deleteCategory, 
  addCategory,
  exportData, 
  importData,
  encodeDataForUrl,
  getReaderSettings, 
  saveReaderSettings,
  getMihonTracking,
  saveMihonTracking,
  clearHistory
} from '../services/storage';
import { isNsfwAllowed, setNsfwAllowed } from '../services/extensionManager';

export default function MoreView({
  onOpenBackup,
  onGoToSources,
  onGoToBrowse,
  onOpenNsfwSection
}) {
  const [categories, setCategories] = useState(() => getCategories());
  const [newCatInput, setNewCatInput] = useState('');
  const [readerSettings, setReaderSettings] = useState(() => getReaderSettings());
  const [tracking, setTracking] = useState(() => getMihonTracking());
  const [aniInput, setAniInput] = useState(tracking.anilist?.username || '');
  const [malInput, setMalInput] = useState(tracking.mal?.username || '');
  const [toastMsg, setToastMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [nsfwEnabled, setNsfwEnabled] = useState(() => isNsfwAllowed());

  useEffect(() => {
    const syncNsfw = () => setNsfwEnabled(isNsfwAllowed());
    if (typeof window === 'undefined') return undefined;
    window.addEventListener('mihon:extension_update', syncNsfw);
    return () => window.removeEventListener('mihon:extension_update', syncNsfw);
  }, []);

  const handleToggleNsfw = () => {
    const nextVal = !nsfwEnabled;
    setNsfwEnabled(nextVal);
    setNsfwAllowed(nextVal);
    showToast(`18+ NSFW content ${nextVal ? 'enabled' : 'disabled'}`);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleAddCat = (e) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;
    const updated = addCategory(newCatInput.trim());
    setCategories(updated);
    setNewCatInput('');
    showToast('Category created');
  };

  const handleDeleteCat = (name) => {
    const updated = deleteCategory(name);
    setCategories(updated);
    showToast(`Removed "${name}"`);
  };

  const handleUpdateReader = (key, value) => {
    const updated = { ...readerSettings, [key]: value };
    setReaderSettings(updated);
    saveReaderSettings(updated);
    showToast('Reader preference saved');
  };

  const handleSaveTracking = (e) => {
    e.preventDefault();
    const updated = {
      anilist: { connected: !!aniInput.trim(), username: aniInput.trim() },
      mal: { connected: !!malInput.trim(), username: malInput.trim() },
    };
    setTracking(updated);
    saveMihonTracking(updated);
    showToast('Tracking accounts saved');
  };

  const handleClearCache = () => {
    try {
      // Clear image cache or non-essential storage keys
      sessionStorage.clear();
      showToast('Cache memory cleared');
    } catch {
      showToast('Cleared memory cache');
    }
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mihon_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Backup JSON downloaded');
  };

  const handleCopySyncLink = () => {
    const jsonStr = exportData();
    const encoded = encodeDataForUrl(jsonStr);
    if (!encoded) return;
    const url = `${window.location.origin}${window.location.pathname}#sync_data=${encoded}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 2000);
          showToast('1-Click Sync URL copied to clipboard');
        })
        .catch(() => {
          showToast('Could not access clipboard');
        });
    } else {
      showToast('Clipboard API unavailable');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn pb-28 space-y-8">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 bg-rose-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg animate-fadeIn flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-6 border-b border-white/10">
        <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-rose-500" />
          More & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manga terminal settings, category management, tracking, and backups
        </p>
      </div>

      {/* Section 1: Extensions & Sources quick access */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/20 via-slate-900/60 to-slate-950/80 border border-rose-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Extensions & Source Repositories</h3>
            <p className="text-xs text-slate-400">
              Manage Keiyoushi repo, 1,600+ community scrapers, and pinned feeds.
            </p>
          </div>
        </div>
        <button
          onClick={onGoToSources}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/25 flex items-center gap-1.5 transition-all whitespace-nowrap"
        >
          <span>Open Extensions Deck</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Section 2: Reader Engine Preferences */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
          <Sliders className="w-4 h-4" />
          <span>Reader Engine Settings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Default Reading Mode */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 space-y-2">
            <label className="text-xs text-slate-300 block font-semibold">
              Default Reading Mode
            </label>
            <select
              value={readerSettings.readingMode === 'double' ? 'spread' : (readerSettings.readingMode || 'webtoon')}
              onChange={(e) => handleUpdateReader('readingMode', e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="webtoon">Webtoon (Continuous Vertical)</option>
              <option value="single">Single Page (Standard)</option>
              <option value="spread">Double Page (Spread)</option>
            </select>
            <p className="text-[11px] text-slate-500">
              Webtoon offers seamless 0-gap vertical scrolling for manhwa and webcomics.
            </p>
          </div>

          {/* Reading Direction */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 space-y-2">
            <label className="text-xs text-slate-300 block font-semibold">
              Manga Page Direction
            </label>
            <select
              value={readerSettings.readingDirection || 'rtl'}
              onChange={(e) => handleUpdateReader('readingDirection', e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="rtl">Right to Left (Authentic Manga RTL)</option>
              <option value="ltr">Left to Right (Western Comic LTR)</option>
            </select>
            <p className="text-[11px] text-slate-500">
              Controls page turning direction in single and double page views.
            </p>
          </div>

          {/* Max Desktop Strip Width */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 space-y-2">
            <label className="text-xs text-slate-300 block font-semibold">
              Webtoon Desktop Fit Width
            </label>
            <select
              value={readerSettings.fitMode || 'width'}
              onChange={(e) => handleUpdateReader('fitMode', e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="width">Medium (800px) - Recommended</option>
              <option value="wide">Wide (1020px)</option>
              <option value="full">Full Screen Edge-to-Edge</option>
            </select>
            <p className="text-[11px] text-slate-500">
              Prevents ultra-wide stretching on large monitors while reading webtoons.
            </p>
          </div>

          {/* Continuous Chapter Scroll */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 space-y-2">
            <label className="text-xs text-slate-300 block font-semibold">
              Continuous Infinite Scroll
            </label>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">
                {readerSettings.continuousScroll ? 'Enabled (Auto-load next chapter)' : 'Disabled'}
              </span>
              <button
                type="button"
                aria-label="Toggle Continuous Infinite Scroll"
                onClick={() => handleUpdateReader('continuousScroll', !readerSettings.continuousScroll)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  readerSettings.continuousScroll ? 'bg-rose-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    readerSettings.continuousScroll ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Automatically preloads and stacks the next chapter at the end of the scroll.
            </p>
          </div>

          {/* 18+ NSFW Content Setting */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 space-y-2.5 md:col-span-2">
            <label className="text-xs text-slate-300 font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>18+ Adult & NSFW Content (Opt-In)</span>
            </label>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">
                {nsfwEnabled ? 'Enabled (18+ sources and NSFW search section unlocked)' : 'Disabled (Safe mode only)'}
              </span>
              <button
                type="button"
                aria-label="Toggle 18+ NSFW Content"
                onClick={handleToggleNsfw}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  nsfwEnabled ? 'bg-rose-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    nsfwEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Optional user preference: Unlocks adult extensions, Manga18fx, DoujinDesu, NHentai, and the dedicated 18+ NSFW search bar.
            </p>
            {nsfwEnabled && onOpenNsfwSection && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onOpenNsfwSection}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/25 inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Open 18+ NSFW Search Section</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Manage Library Categories */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
            <Folder className="w-4 h-4" />
            <span>Library Categories</span>
          </div>
          <span className="text-xs text-slate-400">{categories.length} total</span>
        </div>

        {/* Existing categories list */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isDefault = ['All', 'Reading', 'Completed', 'Plan to Read', 'On Hold', 'Favorites'].includes(cat);
            return (
              <div
                key={cat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-200"
              >
                <span>{cat}</span>
                {!isDefault && (
                  <button
                    onClick={() => handleDeleteCat(cat)}
                    className="p-1 hover:text-rose-400 transition-colors"
                    title={`Delete ${cat}`}
                    aria-label={`Delete ${cat}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add custom category form */}
        <form onSubmit={handleAddCat} className="flex gap-2">
          <input
            type="text"
            placeholder="New custom category (e.g. 'Manhwa', 'Daily', 'Classics')..."
            value={newCatInput}
            onChange={(e) => setNewCatInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            disabled={!newCatInput.trim()}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Section 4: Tracking Accounts (AniList & MyAnimeList) */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
          <Globe className="w-4 h-4" />
          <span>Tracking Sync (AniList & MyAnimeList)</span>
        </div>
        <p className="text-xs text-slate-400">
          Link your tracker usernames to check reading scores, reviews, and sync chapter progress.
        </p>

        <form onSubmit={handleSaveTracking} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
              <span>AniList Username</span>
              {tracking.anilist?.connected && (
                <span className="text-[10px] text-emerald-400 font-bold">● Connected</span>
              )}
            </label>
            <input
              type="text"
              placeholder="e.g. animelover99"
              value={aniInput}
              onChange={(e) => setAniInput(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
              <span>MyAnimeList Username</span>
              {tracking.mal?.connected && (
                <span className="text-[10px] text-emerald-400 font-bold">● Connected</span>
              )}
            </label>
            <input
              type="text"
              placeholder="e.g. otaku_reader"
              value={malInput}
              onChange={(e) => setMalInput(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/20"
            >
              Save Tracking
            </button>
          </div>
        </form>
      </div>

      {/* Section 5: Backup, Restore & Data */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
          <HardDrive className="w-4 h-4" />
          <span>Data, Backup & Cache</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Download JSON */}
          <button
            onClick={handleDownloadBackup}
            className="p-4 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-white/10 hover:border-rose-500/30 text-left transition-all group"
          >
            <Download className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-xs text-white">Download Backup</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Export library & history to JSON</p>
          </button>

          {/* Restore / Import */}
          <button
            onClick={onOpenBackup}
            className="p-4 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-white/10 hover:border-rose-500/30 text-left transition-all group"
          >
            <Upload className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-xs text-white">Restore Backup</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Import previously saved JSON file</p>
          </button>

          {/* 1-Click Sync Link */}
          <button
            onClick={handleCopySyncLink}
            className="p-4 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-white/10 hover:border-rose-500/30 text-left transition-all group"
          >
            <Copy className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-xs text-white">
              {copiedLink ? 'Copied to Clipboard!' : '1-Click Sync URL'}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Migrate between mobile and PC</p>
          </button>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-white/5">
          <span className="text-xs text-slate-500">Need to free up browser storage memory?</span>
          <button
            onClick={handleClearCache}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs transition-all"
          >
            Clear Temp Cache
          </button>
        </div>
      </div>

      {/* Section 6: About Mihon Web Terminal */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-white/10 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 font-bold font-['Outfit'] text-slate-200">
          <img src={logoImg || './logo.png'} alt="Logo" className="w-6 h-6 rounded-lg object-cover" onError={(e) => { e.currentTarget.src = './logo.png'; }} />
          <span>KuroNeko • Mihon Web Terminal v3.5</span>
        </div>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Built with React, Vite, and high-performance community scraper bridges connecting Keiyoushi, MangaDex, MangaKatana, and WeebCentral.
        </p>
      </div>
    </div>
  );
}
