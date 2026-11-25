import React, { useState, useMemo, useEffect } from 'react';
import { 
  Bookmark, 
  Search, 
  Play, 
  Trash2, 
  FolderHeart,
  Download,
  LayoutGrid,
  Grid,
  Image as ImageIcon,
  List,
  ArrowUpDown,
  Tag,
  Plus,
  Check,
  MoreVertical,
  SlidersHorizontal,
  FolderPlus,
  HardDrive
} from 'lucide-react';
import { 
  getHistory, 
  getUpdates,
  getCategories,
  saveCategories,
  getLibraryDisplayMode,
  saveLibraryDisplayMode,
  getLibrarySort,
  saveLibrarySort
} from '../services/storage';
import { getFallbackCover, getReliableCoverUrl } from '../services/mangaApi';
import { getAllDownloadedManga, deleteDownloadedManga } from '../services/downloadManager';

export default function LibraryView({
  bookmarks = {},
  onSelectManga,
  onOpenReader,
  onRemoveBookmark,
  onUpdateStatus,
  onOpenBackup
}) {
  const [categories, setCategories] = useState(() => getCategories());
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayMode, setDisplayMode] = useState(() => getLibraryDisplayMode()); // 'comfortable' | 'compact' | 'cover_only' | 'list'
  const [sortBy, setSortBy] = useState(() => getLibrarySort()); // 'alpha_asc' | 'alpha_desc' | 'unread' | 'total_ch' | 'last_read'
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [downloadedMangaList, setDownloadedMangaList] = useState(() => getAllDownloadedManga() || []);

  useEffect(() => {
    const refreshDownloads = () => {
      setDownloadedMangaList(getAllDownloadedManga() || []);
    };
    refreshDownloads();
    if (typeof window === 'undefined') return undefined;
    window.addEventListener('kuroneko:downloads_updated', refreshDownloads);
    return () => window.removeEventListener('kuroneko:downloads_updated', refreshDownloads);
  }, []);

  const downloadedCountMap = useMemo(() => {
    const map = new Map();
    downloadedMangaList.forEach((entry) => {
      if (entry?.mangaId) {
        map.set(entry.mangaId, entry);
      }
    });
    return map;
  }, [downloadedMangaList]);

  const handleDisplayModeChange = (mode) => {
    setDisplayMode(mode);
    saveLibraryDisplayMode(mode);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    saveLibrarySort(sort);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const trimmed = newCategoryName.trim();
    if (!categories.includes(trimmed)) {
      const updated = [...categories, trimmed];
      setCategories(updated);
      saveCategories(updated);
    }
    setNewCategoryName('');
    setIsCategoryModalOpen(false);
  };

  // Deduplicate library items by normalized key
  const seenLibraryKeys = new Set();
  const bookmarkList = Object.values(bookmarks || {}).filter((item) => {
    if (!item) return false;
    const norm = (item.englishTitle || item.title || item.id || '')
      .toLowerCase()
      .replace(/^(vortex|asura|webtoon|weebcentral|mangadex|mangakakalot|kakamanga|mangapill|wc|mk|md)\s*:\s*/i, '')
      .replace(/[^a-z0-9]+/g, '');
    if (norm && seenLibraryKeys.has(norm)) return false;
    if (norm) seenLibraryKeys.add(norm);
    return true;
  });

  const rawHistory = getHistory();
  const history = Array.isArray(rawHistory) ? rawHistory : [];
  const rawUpdates = getUpdates();
  const updates = Array.isArray(rawUpdates) ? rawUpdates : [];

  const updatesByManga = new Map();
  updates.forEach((u) => {
    if (!u.read) {
      updatesByManga.set(u.mangaId, u);
    }
  });

  const historyMap = useMemo(() => {
    const map = new Map();
    history.forEach((h) => {
      map.set(h.mangaId, h);
    });
    return map;
  }, [history]);

  // Statistics
  const totalReadChapters = history.reduce((acc, cur) => acc + (cur.readChapters?.length || 1), 0);
  const readingCount = bookmarkList.filter((b) => (b.category || b.status) === 'Reading' || b.status === 'reading').length;
  const completedCount = bookmarkList.filter((b) => (b.category || b.status) === 'Completed' || b.status === 'completed').length;
  const planCount = bookmarkList.filter((b) => (b.category || b.status) === 'Plan to Read' || b.status === 'plan_to_read').length;
  const onHoldCount = bookmarkList.filter((b) => (b.category || b.status) === 'On Hold' || b.status === 'on_hold').length;
  const favCount = bookmarkList.filter((b) => (b.category || b.status) === 'Favorites' || b.status === 'favorite').length;

  // Filter list by category & search
  const filteredList = useMemo(() => {
    const isDownloadsTab = activeCategory === 'Downloads';
    const q = searchQuery.toLowerCase().trim();

    let result = isDownloadsTab
      ? downloadedMangaList
          .map((d) => ({
            id: d.mangaId,
            title: d.mangaTitle || 'Offline Manga',
            englishTitle: d.mangaTitle || 'Offline Manga',
            coverUrl: d.coverUrl || '',
            sourceName: d.sourceName || 'Offline',
            totalDownloaded: d.totalDownloaded ?? d.chapters?.length ?? 0,
            downloadedChapters: d.chapters || [],
            latestChapter: d.chapters?.[0]?.chapterNumber || String(d.totalDownloaded || ''),
            isOfflineEntry: true,
            category: 'Downloads'
          }))
          .filter((item) => {
            if (!q) return true;
            return (
              (item.title && String(item.title).toLowerCase().includes(q)) ||
              (item.englishTitle && String(item.englishTitle).toLowerCase().includes(q)) ||
              (item.sourceName && String(item.sourceName).toLowerCase().includes(q))
            );
          })
      : bookmarkList.filter((item) => {
          // Category match
          let matchesCat = false;
          const cat = item.category || item.status || 'Reading';
          const normCat = String(cat).toLowerCase().replace(/_/g, ' ');
          
          if (activeCategory === 'All') {
            matchesCat = true;
          } else if (activeCategory === 'Favorites') {
            matchesCat = normCat.includes('favorite') || item.status === 'favorite';
          } else if (activeCategory === 'Reading') {
            matchesCat = normCat.includes('reading') || item.status === 'reading';
          } else if (activeCategory === 'Completed') {
            matchesCat = normCat.includes('completed') || item.status === 'completed';
          } else if (activeCategory === 'Plan to Read') {
            matchesCat = normCat.includes('plan') || item.status === 'plan_to_read';
          } else if (activeCategory === 'On Hold') {
            matchesCat = normCat.includes('hold') || item.status === 'on_hold';
          } else {
            matchesCat = cat === activeCategory || normCat === activeCategory.toLowerCase();
          }

          const matchesSearch = !q || 
            (item.title && String(item.title).toLowerCase().includes(q)) || 
            (item.englishTitle && String(item.englishTitle).toLowerCase().includes(q));

          return matchesCat && matchesSearch;
        });

    // Sort list
    result = [...result].sort((a, b) => {
      const titleA = (a.englishTitle || a.title || '').toLowerCase();
      const titleB = (b.englishTitle || b.title || '').toLowerCase();
      
      if (sortBy === 'alpha_asc') return titleA.localeCompare(titleB);
      if (sortBy === 'alpha_desc') return titleB.localeCompare(titleA);
      if (sortBy === 'total_ch') {
        const countA = parseFloat(String(a.totalDownloaded ?? a.latestChapter ?? a.totalChapters ?? 0).replace(/[^0-9.]/g, '')) || 0;
        const countB = parseFloat(String(b.totalDownloaded ?? b.latestChapter ?? b.totalChapters ?? 0).replace(/[^0-9.]/g, '')) || 0;
        return countB - countA;
      }
      if (sortBy === 'unread') {
        const hasUpA = updatesByManga.has(a.id) ? 1 : 0;
        const hasUpB = updatesByManga.has(b.id) ? 1 : 0;
        return hasUpB - hasUpA;
      }
      if (sortBy === 'last_read') {
        const timeA = historyMap.get(a.id)?.updatedAt ? new Date(historyMap.get(a.id).updatedAt).getTime() : 0;
        const timeB = historyMap.get(b.id)?.updatedAt ? new Date(historyMap.get(b.id).updatedAt).getTime() : 0;
        return timeB - timeA;
      }
      return 0;
    });

    return result;
  }, [bookmarkList, downloadedMangaList, activeCategory, searchQuery, sortBy, updatesByManga, historyMap]);

  const handleDeleteDownloaded = async (e, mangaId) => {
    if (e) e.stopPropagation();
    await deleteDownloadedManga(mangaId);
    setDownloadedMangaList(getAllDownloadedManga() || []);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 py-4 pb-28">
      {/* Top Banner & Stats Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-white/10 bg-gradient-to-r from-rose-950/20 via-slate-900/80 to-slate-950/90 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Bookmark className="w-5 h-5 fill-rose-400 text-rose-400" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Outfit']">
                My Library
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
              Organize your manga collection with custom categories, display layouts, and unread chapter badges.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5 w-full md:w-auto font-mono">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">In Library</span>
              <span className="text-base sm:text-lg font-black text-white">{bookmarkList.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-rose-500/30 text-center">
              <span className="text-[10px] text-rose-400 block font-medium">Reading</span>
              <span className="text-base sm:text-lg font-black text-rose-400">{readingCount}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Read</span>
              <span className="text-base sm:text-lg font-black text-white">{totalReadChapters}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Bar & Action Controls */}
      <div className="space-y-4">
        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
          {categories.filter((c) => c !== 'Downloads').map((cat) => {
            const isActive = activeCategory === cat;
            let count = 0;
            if (cat === 'All') count = bookmarkList.length;
            else if (cat === 'Reading') count = readingCount;
            else if (cat === 'Completed') count = completedCount;
            else if (cat === 'Plan to Read') count = planCount;
            else if (cat === 'On Hold') count = onHoldCount;
            else if (cat === 'Favorites') count = favCount;
            else {
              count = bookmarkList.filter((b) => (b.category || b.status) === cat).length;
            }

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

          {/* Dedicated Offline Downloads Category Pill */}
          <button
            type="button"
            onClick={() => setActiveCategory('Downloads')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'Downloads'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-900/80 hover:bg-slate-800 text-emerald-300 hover:text-white border border-emerald-500/30'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Downloads</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeCategory === 'Downloads' ? 'bg-black/30 text-white' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {downloadedMangaList.length}
            </span>
          </button>

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-rose-400 border border-dashed border-rose-500/30 whitespace-nowrap transition-all"
            title="Add New Category"
            aria-label="Add New Category"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Category</span>
          </button>
        </div>

        {/* Search, Display Modes & Sorting Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500/50"
            />
          </div>

          <div className="flex items-center gap-2 justify-end">
            {/* Sorting Select */}
            <div className="relative flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-slate-900/90 border border-white/10 hover:border-white/20 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="alpha_asc">Sort: A-Z</option>
                <option value="alpha_desc">Sort: Z-A</option>
                <option value="unread">Sort: Unread First</option>
                <option value="total_ch">Sort: Chapters</option>
                <option value="last_read">Sort: Last Read</option>
              </select>
            </div>

            {/* Display Modes Selector (Comfortable, Compact, Cover-Only, List) */}
            <div className="flex items-center bg-slate-900/90 border border-white/10 rounded-xl p-1 gap-1">
              <button
                onClick={() => handleDisplayModeChange('comfortable')}
                className={`p-1.5 rounded-lg transition-all ${
                  displayMode === 'comfortable' ? 'bg-rose-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Comfortable Grid"
                aria-label="Comfortable Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDisplayModeChange('compact')}
                className={`p-1.5 rounded-lg transition-all ${
                  displayMode === 'compact' ? 'bg-rose-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Compact Grid"
                aria-label="Compact Grid"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDisplayModeChange('cover_only')}
                className={`p-1.5 rounded-lg transition-all ${
                  displayMode === 'cover_only' ? 'bg-rose-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Cover Only Grid"
                aria-label="Cover Only Grid"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDisplayModeChange('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  displayMode === 'list' ? 'bg-rose-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="List View"
                aria-label="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Backup Button */}
            <button
              onClick={onOpenBackup}
              className="p-2 rounded-xl bg-slate-900/90 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all"
              title="Backup & Restore"
              aria-label="Backup & Restore"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Manga Collection View */}
      {filteredList.length === 0 ? (
        <div className="py-24 text-center bg-slate-900/30 rounded-3xl border border-white/5 max-w-md mx-auto p-8 space-y-4">
          {activeCategory === 'Downloads' ? (
            <HardDrive className="w-12 h-12 text-emerald-500/60 mx-auto" />
          ) : (
            <FolderHeart className="w-12 h-12 text-slate-600 mx-auto" />
          )}
          <h3 className="text-base font-bold text-white">
            {activeCategory === 'Downloads' ? 'No offline downloads yet' : 'No manga found'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {activeCategory === 'Downloads'
              ? (searchQuery.trim()
                  ? 'No downloaded manga match your search query.'
                  : 'Open any manga from Browse, Library, or Sources and tap the Download icon on chapters to save them for offline reading.')
              : bookmarkList.length === 0
                ? 'Your library is empty. Browse the Manga Hub and click "Bookmark" to add manga to your collection!'
                : 'No manga in this category match your search query.'}
          </p>
        </div>
      ) : displayMode === 'list' ? (
        /* ---------------- LIST VIEW ---------------- */
        <div className="space-y-2.5">
          {filteredList.map((item) => {
            const histEntry = historyMap.get(item.id);
            const lastCh = histEntry?.chapterNumber;
            const updateObj = updatesByManga.get(item.id);
            const offlineInfo = item.isOfflineEntry ? item : downloadedCountMap.get(item.id);
            const offlineCount = offlineInfo?.totalDownloaded ?? 0;
            const firstOfflineChap = offlineInfo?.downloadedChapters?.[0] || item.downloadedChapters?.[0];

            return (
              <div
                key={item.id}
                onClick={() => onSelectManga(item.id, item.coverUrl)}
                className="group flex items-center gap-4 p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-white/5 hover:border-rose-500/30 transition-all cursor-pointer shadow-sm"
              >
                <div className="w-12 h-16 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-white/10">
                  <img
                    src={getReliableCoverUrl(item.title, item.coverUrl)}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.target.src = getFallbackCover(item.title);
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                      item.isOfflineEntry
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-300 border-rose-500/20'
                    }`}>
                      {item.isOfflineEntry ? (item.sourceName || 'Offline') : (item.category || item.status || 'Reading')}
                    </span>
                    {offlineCount > 0 && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {offlineCount} offline ch
                      </span>
                    )}
                    {updateObj && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-500 text-slate-950 animate-pulse">
                        Ch. {updateObj.chapterNumber}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-white group-hover:text-rose-300 transition-colors truncate">
                    {item.englishTitle || item.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span>
                      {item.isOfflineEntry
                        ? `${offlineCount} chapter${offlineCount === 1 ? '' : 's'} saved`
                        : `Total: Ch. ${item.latestChapter || item.totalChapters || '?'}`}
                    </span>
                    {lastCh && <span className="text-emerald-400 font-semibold">• Read up to Ch. {lastCh}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {(lastCh || (item.isOfflineEntry && firstOfflineChap)) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenReader && histEntry) {
                          onOpenReader(item.id, histEntry.chapterId, lastCh, item.title, item.coverUrl, item.englishTitle);
                        } else if (onOpenReader && firstOfflineChap) {
                          onOpenReader(item.id, firstOfflineChap.chapterId, firstOfflineChap.chapterNumber, item.title, item.coverUrl, item.englishTitle);
                        } else {
                          onSelectManga(item.id, item.coverUrl);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{lastCh ? 'Resume' : 'Read Offline'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      if (item.isOfflineEntry) {
                        handleDeleteDownloaded(e, item.id);
                      } else {
                        e.stopPropagation();
                        onRemoveBookmark(item.id);
                      }
                    }}
                    className="p-2 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title={item.isOfflineEntry ? 'Delete all downloaded chapters' : 'Remove from Library'}
                    aria-label={item.isOfflineEntry ? 'Delete all downloaded chapters' : 'Remove from Library'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : displayMode === 'compact' ? (
        /* ---------------- COMPACT GRID (MIHON CLASSIC) ---------------- */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredList.map((item) => {
            const histEntry = historyMap.get(item.id);
            const lastCh = histEntry?.chapterNumber;
            const updateObj = updatesByManga.get(item.id);
            const offlineInfo = item.isOfflineEntry ? item : downloadedCountMap.get(item.id);
            const offlineCount = offlineInfo?.totalDownloaded ?? 0;

            return (
              <div
                key={item.id}
                onClick={() => onSelectManga(item.id, item.coverUrl)}
                className="group relative aspect-[3/4.4] rounded-2xl overflow-hidden bg-slate-950 border border-white/10 hover:border-rose-500/40 transition-all cursor-pointer shadow-md"
              >
                <img
                  src={getReliableCoverUrl(item.title, item.coverUrl)}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = getFallbackCover(item.title);
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                {/* Top badges */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 z-10">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase backdrop-blur-md border ${
                    item.isOfflineEntry
                      ? 'bg-emerald-950/85 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950/80 text-rose-300 border-rose-500/30'
                  }`}>
                    {item.isOfflineEntry ? `${offlineCount} Offline` : (item.category || item.status || 'Reading')}
                  </span>
                  {item.isOfflineEntry ? (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteDownloaded(e, item.id)}
                      className="p-1 rounded-lg bg-black/70 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Delete offline downloads"
                      aria-label="Delete offline downloads"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  ) : updateObj ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white animate-pulse">
                      NEW
                    </span>
                  ) : null}
                </div>

                {/* Bottom title & chapter */}
                <div className="absolute bottom-2 left-2 right-2 z-10">
                  <h3 className="font-bold text-xs text-white truncate group-hover:text-rose-300 transition-colors">
                    {item.englishTitle || item.title}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>{item.isOfflineEntry ? `${offlineCount} ch saved` : `Ch. ${item.latestChapter || '?'}`}</span>
                    {lastCh && <span className="text-emerald-400">Read: {lastCh}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : displayMode === 'cover_only' ? (
        /* ---------------- COVER-ONLY GRID ---------------- */
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5">
          {filteredList.map((item) => {
            const updateObj = updatesByManga.get(item.id);
            const offlineInfo = item.isOfflineEntry ? item : downloadedCountMap.get(item.id);
            const offlineCount = offlineInfo?.totalDownloaded ?? 0;
            return (
              <div
                key={item.id}
                onClick={() => onSelectManga(item.id, item.coverUrl)}
                className="group relative aspect-[3/4.5] rounded-xl overflow-hidden bg-slate-950 border border-white/10 hover:border-rose-500/40 transition-all cursor-pointer shadow-md"
                title={item.englishTitle || item.title}
              >
                <img
                  src={getReliableCoverUrl(item.title, item.coverUrl)}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = getFallbackCover(item.title);
                  }}
                />
                {item.isOfflineEntry && (
                  <>
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                      {offlineCount}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteDownloaded(e, item.id)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/75 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Delete offline downloads"
                      aria-label="Delete offline downloads"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
                {!item.isOfflineEntry && updateObj && (
                  <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-md animate-ping" />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] font-bold text-white truncate">{item.englishTitle || item.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ---------------- COMFORTABLE GRID (DEFAULT) ---------------- */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {filteredList.map((item) => {
            const histEntry = historyMap.get(item.id);
            const lastCh = histEntry?.chapterNumber;
            const updateObj = updatesByManga.get(item.id);
            const offlineInfo = item.isOfflineEntry ? item : downloadedCountMap.get(item.id);
            const offlineCount = offlineInfo?.totalDownloaded ?? 0;
            const firstOfflineChap = offlineInfo?.downloadedChapters?.[0] || item.downloadedChapters?.[0];

            return (
              <div
                key={item.id}
                className="group relative flex flex-col bg-slate-900/60 hover:bg-slate-900/90 rounded-2xl overflow-hidden border border-white/5 hover:border-rose-500/30 transition-all duration-300 shadow-lg cursor-pointer"
                onClick={() => onSelectManga(item.id, item.coverUrl)}
              >
                {/* Poster */}
                <div className="relative aspect-[3/4.2] w-full overflow-hidden bg-slate-950">
                  <img
                    src={getReliableCoverUrl(item.title, item.coverUrl)}
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
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md border ${
                      item.isOfflineEntry
                        ? 'text-emerald-300 border-emerald-500/40'
                        : 'text-rose-300 border-rose-500/30'
                    }`}>
                      {item.isOfflineEntry ? `${offlineCount} Offline Ch` : (item.category || item.status || 'Reading')}
                    </span>
                  </div>

                  {/* Delete Bookmark / Download button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      if (item.isOfflineEntry) {
                        handleDeleteDownloaded(e, item.id);
                      } else {
                        e.stopPropagation();
                        onRemoveBookmark(item.id);
                      }
                    }}
                    className={`absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-slate-300 hover:text-white backdrop-blur-md transition-all cursor-pointer ${
                      item.isOfflineEntry ? 'opacity-90' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    title={item.isOfflineEntry ? 'Delete all offline chapters' : 'Remove from Library'}
                    aria-label={item.isOfflineEntry ? 'Delete all offline chapters' : 'Remove from Library'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Resume / Read Offline Chapter Pill */}
                  {(lastCh || (item.isOfflineEntry && firstOfflineChap)) && (
                    <div className="absolute bottom-2 left-2 right-2 z-10">
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenReader && histEntry) {
                            onOpenReader(item.id, histEntry.chapterId, lastCh, item.title, item.coverUrl, item.englishTitle);
                          } else if (onOpenReader && firstOfflineChap) {
                            onOpenReader(item.id, firstOfflineChap.chapterId, firstOfflineChap.chapterNumber, item.title, item.coverUrl, item.englishTitle);
                          } else {
                            onSelectManga(item.id, item.coverUrl);
                          }
                        }}
                        className="px-2 py-1 rounded-md bg-black/80 hover:bg-rose-600 hover:text-white backdrop-blur-md border border-white/10 text-[10px] text-emerald-400 flex items-center justify-between font-semibold transition-colors cursor-pointer"
                        title={lastCh ? `Resume Reading Chapter ${lastCh}` : 'Read Offline'}
                      >
                        <span>{lastCh ? `Ch. ${lastCh}` : `Read Ch. ${firstOfflineChap?.chapterNumber || 1}`}</span>
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
                  </div>

                  {item.isOfflineEntry ? (
                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-400 font-semibold truncate max-w-[110px]">
                        {item.sourceName || 'Offline'}
                      </span>
                      <span className="text-slate-400">
                        {offlineCount} ch saved
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                      <select
                        value={
                          item.category ||
                          (item.status === 'plan_to_read' ? 'Plan to Read' :
                           item.status === 'on_hold' ? 'On Hold' :
                           item.status === 'favorite' ? 'Favorites' :
                           item.status === 'completed' ? 'Completed' :
                           item.status === 'reading' ? 'Reading' :
                           item.status || 'Reading')
                        }
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const newCat = e.target.value;
                          const statusMap = {
                            'Reading': 'reading',
                            'Completed': 'completed',
                            'Plan to Read': 'plan_to_read',
                            'On Hold': 'on_hold',
                            'Favorites': 'favorite',
                          };
                          onUpdateStatus(item.id, { ...item, category: newCat }, statusMap[newCat] || newCat.toLowerCase());
                        }}
                        className="bg-transparent text-[10px] text-slate-400 hover:text-slate-200 focus:outline-none cursor-pointer max-w-[90px] truncate"
                      >
                        {categories.filter(c => c !== 'All' && c !== 'Downloads').map(c => (
                          <option key={c} value={c} className="bg-slate-900">{c}</option>
                        ))}
                      </select>

                      <span className="text-[10px] text-slate-500">
                        {offlineCount > 0 ? `${offlineCount} saved • ` : ''}Ch. {item.latestChapter || '?'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0c1017] border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-rose-500" />
              <h3 className="text-lg font-bold text-white">Create Category</h3>
            </div>
            <p className="text-xs text-slate-400">
              Add a new category to group your manga (e.g. "Manhwa", "Daily Reads", "Top Tier").
            </p>
            <input
              type="text"
              placeholder="Category name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              autoFocus
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
