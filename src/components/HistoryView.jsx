import React, { useState, useMemo } from 'react';
import { 
  History, 
  Play, 
  Trash2, 
  Clock, 
  Search, 
  LayoutGrid, 
  List 
} from 'lucide-react';
import { clearHistory, removeFromHistory } from '../services/storage';
import { getFallbackCover } from '../services/mangaApi';

export default function HistoryView({
  history = [],
  onOpenReader,
  onOpenMangaDetails,
  onRefreshHistory
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTimestamp] = useState(() => Date.now());

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your entire reading history?')) {
      clearHistory();
      if (onRefreshHistory) onRefreshHistory();
    }
  };

  const handleRemoveItem = (e, mangaId) => {
    e.stopPropagation();
    removeFromHistory(mangaId);
    if (onRefreshHistory) onRefreshHistory();
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'Recently';
    try {
      const date = new Date(isoString);
      const diffMs = currentTimestamp - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  // Calculate stats
  const totalReadChapters = useMemo(() => {
    return history.reduce((acc, cur) => acc + (cur.readChapters?.length || 1), 0);
  }, [history]);

  // Filtered by search query
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase().trim();
    return history.filter((item) => {
      const title = item.mangaTitle?.toLowerCase() || '';
      const eng = item.mangaEnglishTitle?.toLowerCase() || '';
      return title.includes(q) || eng.includes(q);
    });
  }, [history, searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full max-w-full overflow-hidden">
      {/* Top Banner / Stats Header (Grounded Glassmorphism + HUD + Holographic) */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-elevated p-5 sm:p-7 border border-cyan-500/30 bg-gradient-to-r from-cyan-950/25 via-slate-900/70 to-slate-950/85 shadow-xl hud-corner holo-sheen">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                <History className="w-5 h-5 fill-cyan-400 text-cyan-400" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black holo-text tracking-tight font-['Outfit']">
                Reading History & Timeline
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
              Pick up right where you left off, review completed chapters, and keep track of your reading milestones.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto font-mono">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 text-center min-w-[120px]">
              <span className="text-[11px] text-slate-400 block font-medium">Titles Read</span>
              <span className="text-lg font-extrabold text-white">{history.length}</span>
            </div>
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 text-center min-w-[120px]">
              <span className="text-[11px] text-cyan-400 block font-medium">Chapters Read</span>
              <span className="text-lg font-extrabold text-cyan-400">{totalReadChapters}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 w-full">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-cyan-400/80 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reading history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 transition-all font-sans"
          />
        </div>

        {/* View Mode Toggle & Clear All */}
        <div className="flex items-center gap-2 justify-between sm:justify-end font-mono">
          <div className="flex items-center p-1 rounded-xl bg-slate-950/80 border border-white/10">
            <button
              aria-label="Grid View"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                viewMode === 'grid'
                  ? 'btn-holo text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              aria-label="List View"
              onClick={() => setViewMode('list')}
              className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                viewMode === 'list'
                  ? 'btn-holo text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {filteredHistory.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-3xl border border-white/5 p-8 max-w-md mx-auto space-y-4 shadow-xl">
          <History className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">
            {history.length === 0 ? 'No reading history yet' : 'No matching manga found'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {history.length === 0
              ? 'As soon as you start reading chapters in the Manga Hub, your reading progress and milestones will automatically appear here.'
              : 'Try searching with a different manga title or keyword.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* ------------------ GRID VIEW (Manga Sanctuary Style) ------------------ */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 w-full">
          {filteredHistory.map((item) => {
            const hasProgress = item.currentPage && item.totalPages && item.totalPages > 1;
            const progressPct = hasProgress
              ? Math.min(100, Math.round((item.currentPage / item.totalPages) * 100))
              : 100;

            return (
              <div
                key={item.mangaId}
                onClick={() => onOpenMangaDetails(item.mangaId, item.coverUrl)}
                className="group relative flex flex-col bg-slate-900/80 hover:bg-slate-900 rounded-2xl overflow-hidden border border-white/10 hover:border-rose-500/40 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer w-full"
              >
                {/* Poster */}
                <div className="relative aspect-[3/4.2] w-full overflow-hidden bg-slate-950">
                  <img
                    src={item.coverUrl}
                    alt={item.mangaTitle}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = getFallbackCover(item.mangaTitle);
                    }}
                  />

                  {/* Gradient Shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40 pointer-events-none" />

                  {/* Chapter Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-bold text-rose-400 border border-white/10 shadow-sm">
                      Ch. {item.chapterNumber}
                    </span>
                  </div>

                  {/* Quick Delete from History */}
                  <button
                    aria-label="Remove from history"
                    onClick={(e) => handleRemoveItem(e, item.mangaId)}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-slate-300 hover:text-white backdrop-blur-md border border-white/10 transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 shadow-sm focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                    title="Remove from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Timestamp Pill */}
                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-white/10">
                    <Clock className="w-2.5 h-2.5 text-slate-400" />
                    <span>{formatTime(item.updatedAt)}</span>
                  </div>

                  {/* Reading Progress Line */}
                  {hasProgress && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <div
                        className="h-full bg-rose-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Card Info & Resume Action */}
                <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2.5">
                  <div className="min-w-0">
                    <h3
                      className="font-bold text-xs sm:text-sm text-white line-clamp-2 leading-snug group-hover:text-rose-400 transition-colors"
                      title={item.mangaEnglishTitle || item.mangaTitle}
                    >
                      {item.mangaEnglishTitle || item.mangaTitle}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                      <span className="text-rose-400 font-semibold">Ch. {item.chapterNumber}</span>
                      {hasProgress && (
                        <span>• p. {item.currentPage}/{item.totalPages}</span>
                      )}
                    </div>
                  </div>

                  {/* Resume Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenReader(
                        item.mangaId,
                        item.chapterId,
                        item.chapterNumber,
                        item.mangaTitle,
                        item.coverUrl,
                        item.mangaEnglishTitle
                      );
                    }}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Resume</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ------------------ LIST VIEW (Compact & Responsive) ------------------ */
        <div className="space-y-3 w-full">
          {filteredHistory.map((item) => (
            <div
              key={item.mangaId}
              onClick={() => onOpenMangaDetails(item.mangaId, item.coverUrl)}
              className="group flex items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-rose-500/30 transition-all shadow-md cursor-pointer w-full overflow-hidden"
            >
              {/* Left: Thumbnail & Info */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 overflow-hidden">
                <div className="w-13 h-18 sm:w-16 sm:h-22 rounded-xl overflow-hidden flex-shrink-0 bg-slate-950 border border-white/10 shadow-md relative">
                  <img
                    src={item.coverUrl}
                    alt={item.mangaTitle}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = getFallbackCover(item.mangaTitle);
                    }}
                  />
                </div>

                <div className="min-w-0 flex-1 overflow-hidden space-y-0.5 sm:space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium whitespace-nowrap">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {formatTime(item.updatedAt)}
                    </span>
                    {item.readChapters && item.readChapters.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/5 text-slate-400 border border-white/5 whitespace-nowrap">
                        {item.readChapters.length} read
                      </span>
                    )}
                  </div>

                  <h3
                    className="font-bold text-sm sm:text-base text-white group-hover:text-rose-400 truncate transition-colors"
                    title={item.mangaEnglishTitle || item.mangaTitle}
                  >
                    {item.mangaEnglishTitle || item.mangaTitle}
                  </h3>

                  {item.mangaEnglishTitle && item.mangaEnglishTitle.toLowerCase() !== item.mangaTitle.toLowerCase() && (
                    <p className="text-[11px] text-zinc-400 truncate font-medium" title={item.mangaTitle}>
                      <span className="text-zinc-500 font-mono text-[9px] uppercase px-1 py-0.2 bg-white/5 rounded border border-white/5 mr-1">JP</span>
                      <span>{item.mangaTitle}</span>
                    </p>
                  )}

                  <p className="text-xs text-rose-400 font-semibold truncate">
                    Last Read: Chapter {item.chapterNumber}
                    {item.currentPage && item.totalPages && item.totalPages > 1 && (
                      <span className="text-slate-500 font-normal ml-1.5">
                        (p. {item.currentPage} / {item.totalPages})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenReader(
                      item.mangaId,
                      item.chapterId,
                      item.chapterNumber,
                      item.mangaTitle,
                      item.coverUrl,
                      item.mangaEnglishTitle
                    );
                  }}
                  className="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span className="hidden xs:inline">Resume</span> Ch. {item.chapterNumber}
                </button>

                <button
                  aria-label="Remove from history"
                  type="button"
                  onClick={(e) => handleRemoveItem(e, item.mangaId)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  title="Remove from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
