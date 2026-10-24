import React, { useState } from 'react';
import { 
  Bookmark, 
  Search, 
  Play, 
  Trash2, 
  FolderHeart,
  Download
} from 'lucide-react';
import { getHistory, getUpdates } from '../services/storage';
import { getFallbackCover } from '../services/mangaApi';

export default function LibraryView({
  bookmarks = {},
  onSelectManga,
  onOpenReader,
  onRemoveBookmark,
  onUpdateStatus,
  onOpenBackup
}) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Deduplicate library items by normalized key to ensure 0 duplicates in library
  const seenLibraryKeys = new Set();
  const bookmarkList = Object.values(bookmarks).filter((item) => {
    if (!item) return false;
    const norm = (item.englishTitle || item.title || item.id || '')
      .toLowerCase()
      .replace(/^(vortex|asura|webtoon|weebcentral|mangadex|mangakakalot|kakamanga|mangapill|wc|mk|md)\s*:\s*/i, '')
      .replace(/[^a-z0-9]+/g, '');
    if (norm && seenLibraryKeys.has(norm)) return false;
    if (norm) seenLibraryKeys.add(norm);
    return true;
  });
  const history = getHistory();
  const updates = getUpdates();

  const updatesByManga = new Map();
  updates.forEach((u) => {
    if (!u.read) {
      updatesByManga.set(u.mangaId, u);
    }
  });

  // Calculate statistics
  const totalReadChapters = history.reduce((acc, cur) => acc + (cur.readChapters?.length || 1), 0);
  const readingCount = bookmarkList.filter((b) => b.status === 'reading').length;
  const completedCount = bookmarkList.filter((b) => b.status === 'completed').length;
  const planCount = bookmarkList.filter((b) => b.status === 'plan_to_read').length;
  const favCount = bookmarkList.filter((b) => b.status === 'favorite').length;
  const hasUpdatesCount = bookmarkList.filter((b) => updatesByManga.has(b.id)).length;

  const statusTabs = [
    { id: 'all', label: 'All Titles', count: bookmarkList.length },
    ...(hasUpdatesCount > 0 ? [{ id: 'updates', label: '⚡ New Releases', count: hasUpdatesCount }] : []),
    { id: 'reading', label: 'Reading', count: readingCount },
    { id: 'plan_to_read', label: 'Plan to Read', count: planCount },
    { id: 'completed', label: 'Completed', count: completedCount },
    { id: 'favorite', label: 'Favorites', count: favCount },
    { id: 'on_hold', label: 'On Hold', count: bookmarkList.filter((b) => b.status === 'on_hold').length },
  ];

  const filteredList = bookmarkList.filter((item) => {
    const matchesStatus = filterStatus === 'all'
      ? true
      : filterStatus === 'updates'
      ? updatesByManga.has(item.id)
      : item.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      item.title?.toLowerCase().includes(q) || 
      item.englishTitle?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Stats Header with HUD Corners & Holographic Gradient */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-cyan-500/30 bg-gradient-to-r from-cyan-950/25 via-slate-900/70 to-slate-950/85 hud-corner holo-sheen shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                <Bookmark className="w-5 h-5 fill-cyan-400 text-cyan-400" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black holo-text tracking-tight font-['Outfit']">
                My Manga Sanctuary
              </h1>
            </div>
            <p className="text-sm text-slate-400 max-w-lg">
              Manage your personal reading collection, track progress, and organize your favorite titles.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 text-center font-mono">
              <span className="text-[11px] text-slate-400 block font-medium">Saved Books</span>
              <span className="text-lg font-extrabold text-white">{bookmarkList.length}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-rose-500/30 text-center font-mono">
              <span className="text-[11px] text-rose-400 block font-medium">Reading</span>
              <span className="text-lg font-extrabold text-rose-400">{readingCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 text-center col-span-2 sm:col-span-1 font-mono">
              <span className="text-[11px] text-cyan-400 block font-medium">Chapters Read</span>
              <span className="text-lg font-extrabold text-cyan-400">{totalReadChapters}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none font-mono">
          {statusTabs.map((tab) => {
            const isActive = filterStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'btn-holo shadow-md text-white'
                    : 'bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-900 border border-white/10'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search inside Library */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search your library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <button
            onClick={onOpenBackup}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
            title="Backup & Sync"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Backup</span>
          </button>
        </div>
      </div>

      {/* Grid of Bookmarked Mangas */}
      {filteredList.length === 0 ? (
        <div className="py-24 text-center glass-panel rounded-3xl border border-white/5 max-w-md mx-auto p-8 space-y-4">
          <FolderHeart className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No manga found</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {bookmarkList.length === 0
              ? 'You have not added any manga to your library yet. Browse the Manga Hub and click the bookmark button to save your favorites!'
              : 'No items match your active filter or search query.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {filteredList.map((item) => {
            const histEntry = history.find((h) => h.mangaId === item.id);
            const lastCh = histEntry?.chapterNumber;
            const updateObj = updatesByManga.get(item.id);

            return (
              <div
                key={item.id}
                className="group relative flex flex-col bg-slate-900/60 hover:bg-slate-900/90 rounded-2xl overflow-hidden border border-white/5 hover:border-rose-500/30 transition-all duration-300 shadow-lg cursor-pointer"
                onClick={() => onSelectManga(item.id, item.coverUrl)}
              >
                {/* Poster */}
                <div className="relative aspect-[3/4.2] w-full overflow-hidden bg-slate-950">
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = getFallbackCover(item.title);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

                  {/* Status & Update Badges */}
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
                    {updateObj && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-md shadow-amber-500/40 animate-pulse">
                        NEW CH. {updateObj.chapterNumber}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-rose-400 border border-rose-500/30">
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Delete Bookmark button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveBookmark(item.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-slate-400 hover:text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                    title="Remove from Library"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Resume Chapter Pill if read */}
                  {lastCh && (
                    <div className="absolute bottom-2 left-2 right-2 z-10">
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenReader && historyItem) {
                            onOpenReader(item.id, historyItem.chapterId, lastCh, item.title, item.coverUrl, item.englishTitle);
                          } else {
                            onSelectManga(item.id, item.coverUrl);
                          }
                        }}
                        className="px-2 py-1 rounded-md bg-black/80 hover:bg-rose-600 hover:text-white backdrop-blur-md border border-white/10 text-[10px] text-emerald-400 flex items-center justify-between font-semibold transition-colors cursor-pointer"
                        title={`Resume Reading Chapter ${lastCh}`}
                      >
                        <span>Ch. {lastCh}</span>
                        <Play className="w-2.5 h-2.5 fill-current" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 
                      className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-rose-400 line-clamp-1 transition-colors"
                      title={item.englishTitle || item.title}
                    >
                      {item.englishTitle || item.title}
                    </h3>
                    {item.englishTitle && item.englishTitle.toLowerCase() !== item.title.toLowerCase() && (
                      <p className="text-[10px] text-zinc-400 mt-0.5 truncate flex items-center gap-1 font-medium" title={item.title}>
                        <span className="text-zinc-500 font-mono text-[8px] uppercase px-1 py-0.2 bg-white/5 rounded border border-white/5">JP</span>
                        <span className="truncate">{item.title}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                    <select
                      value={item.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onUpdateStatus(item.id, item, e.target.value)}
                      className="bg-transparent text-[10px] text-slate-400 hover:text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="reading" className="bg-slate-900">Reading</option>
                      <option value="plan_to_read" className="bg-slate-900">Plan</option>
                      <option value="completed" className="bg-slate-900">Done</option>
                      <option value="favorite" className="bg-slate-900">Favorite</option>
                      <option value="on_hold" className="bg-slate-900">On Hold</option>
                    </select>

                    <span className="text-[10px] text-slate-500">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
