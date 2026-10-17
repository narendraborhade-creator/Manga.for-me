import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Bookmark, 
  Check, 
  Search, 
  ArrowUpDown, 
  BookOpen, 
  Clock, 
  Tag, 
  Users, 
  Layers,
  Sparkles,
  Loader2
} from 'lucide-react';
import { fetchMangaDetails, fetchMangaChapters } from '../services/mangadexApi';
import { getReadChaptersForManga } from '../services/storage';

export default function MangaDetailModal({
  mangaId,
  onClose,
  onOpenReader,
  isBookmarked,
  bookmarkStatus,
  onSetBookmark,
  onRemoveBookmark,
  lastReadChapter
}) {
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [chapterSort, setChapterSort] = useState('desc'); // 'asc' | 'desc'
  const [chapterSearch, setChapterSearch] = useState('');
  const [readChapterIds, setReadChapterIds] = useState([]);

  // Fetch manga details and chapters
  useEffect(() => {
    if (!mangaId) return;
    setLoading(true);
    setLoadingChapters(true);

    // Load read chapters from history
    const readList = getReadChaptersForManga(mangaId);
    setReadChapterIds(readList);

    // 1. Fetch Details
    fetchMangaDetails(mangaId).then((data) => {
      setManga(data);
      setLoading(false);
    });

    // 2. Fetch Chapters
    fetchMangaChapters(mangaId, chapterSort, 500).then((chapList) => {
      setChapters(chapList);
      setLoadingChapters(false);
    });
  }, [mangaId]);

  // Handle sort change
  const toggleSort = () => {
    const newSort = chapterSort === 'asc' ? 'desc' : 'asc';
    setChapterSort(newSort);
    const sorted = [...chapters].sort((a, b) => {
      const numA = parseFloat(a.chapter) || 0;
      const numB = parseFloat(b.chapter) || 0;
      return newSort === 'asc' ? numA - numB : numB - numA;
    });
    setChapters(sorted);
  };

  // Filter chapters based on search query
  const filteredChapters = chapters.filter((c) => {
    if (!chapterSearch) return true;
    const q = chapterSearch.toLowerCase();
    return (
      c.chapter?.toString().toLowerCase().includes(q) ||
      c.title?.toLowerCase().includes(q) ||
      c.group?.toLowerCase().includes(q)
    );
  });

  // Find first chapter or resume chapter
  const firstChapter = chapters.length > 0 
    ? [...chapters].sort((a, b) => (parseFloat(a.chapter) || 0) - (parseFloat(b.chapter) || 0))[0] 
    : null;
    
  const resumeChapterObj = lastReadChapter
    ? chapters.find((c) => String(c.chapter) === String(lastReadChapter))
    : null;

  const targetStartChapter = resumeChapterObj || firstChapter;

  if (!mangaId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-[#0c1017] border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white border border-white/10 backdrop-blur-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
            <p className="text-sm text-slate-400">Loading manga details...</p>
          </div>
        ) : !manga ? (
          <div className="p-12 text-center text-slate-400">
            <p>Could not load manga information.</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 rounded-xl bg-white/10 text-white text-sm">
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Header with Backdrop Banner */}
            <div className="relative p-6 sm:p-8 bg-gradient-to-b from-slate-900/90 to-[#0c1017] border-b border-white/5">
              {/* Blurred background cover image */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-15 blur-2xl pointer-events-none"
                style={{ backgroundImage: `url(${manga.coverUrl})` }}
              />

              <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start">
                {/* Cover Art */}
                <div className="w-32 sm:w-44 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[3/4.2] bg-slate-950 mx-auto sm:mx-0">
                  <img
                    src={manga.coverUrl}
                    alt={manga.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                      manga.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {manga.status}
                    </span>

                    {manga.year && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] text-slate-400 bg-white/5 border border-white/5">
                        {manga.year}
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded-md text-[11px] text-slate-400 bg-white/5 border border-white/5">
                      {chapters.length} Chapters
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-1">
                    {manga.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-400 mb-3 flex items-center gap-2">
                    <span className="text-slate-300 font-medium">By {manga.author}</span>
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(manga.tags || []).map((t, i) => (
                      <span key={i} className="text-[11px] text-slate-300 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons: Read Now & Bookmark status selector */}
                  <div className="flex flex-wrap items-center gap-3">
                    {targetStartChapter && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenReader(
                            manga.id,
                            targetStartChapter.id,
                            targetStartChapter.chapter,
                            manga.title,
                            manga.coverUrl
                          );
                        }}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>
                          {resumeChapterObj ? `Resume Ch. ${resumeChapterObj.chapter}` : `Start Ch. ${targetStartChapter.chapter}`}
                        </span>
                      </button>
                    )}

                    {/* Bookmark Status Selector */}
                    <div className="relative inline-flex items-center">
                      <select
                        value={isBookmarked ? (bookmarkStatus || 'reading') : 'none'}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'none') {
                            onRemoveBookmark(manga.id);
                          } else {
                            onSetBookmark(manga.id, manga, val);
                          }
                        }}
                        className="appearance-none bg-slate-900 border border-white/10 text-slate-200 text-xs sm:text-sm font-semibold pl-8 pr-8 py-2.5 rounded-xl hover:border-rose-500/40 focus:outline-none focus:border-rose-500 cursor-pointer transition-all"
                      >
                        <option value="none">Not in Library</option>
                        <option value="reading">📖 Reading</option>
                        <option value="plan_to_read">📋 Plan to Read</option>
                        <option value="completed">✅ Completed</option>
                        <option value="on_hold">⏸️ On Hold</option>
                        <option value="favorite">⭐ Favorite</option>
                      </select>
                      <Bookmark className={`w-4 h-4 absolute left-2.5 pointer-events-none ${
                        isBookmarked ? 'text-rose-400 fill-rose-400' : 'text-slate-400'
                      }`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Synopsis */}
              <div className="mt-6 pt-4 border-t border-white/5 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-32 overflow-y-auto pr-2">
                <p className="whitespace-pre-line">{manga.description}</p>
              </div>
            </div>

            {/* Chapters Feed Section */}
            <div className="flex-1 p-6 flex flex-col min-h-0 bg-[#080a0f]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-rose-500" />
                    <span>Chapters</span>
                    <span className="text-xs text-slate-400 font-normal">
                      ({filteredChapters.length} available)
                    </span>
                  </h3>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Chapter Search Filter */}
                  <div className="relative flex-1 sm:w-44">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Find chapter..."
                      value={chapterSearch}
                      onChange={(e) => setChapterSearch(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition-all"
                    />
                  </div>

                  {/* Sort Order Toggle */}
                  <button
                    onClick={toggleSort}
                    className="p-1.5 px-2.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1 transition-all"
                    title={`Sort: ${chapterSort === 'asc' ? 'Ascending' : 'Descending'}`}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>{chapterSort === 'asc' ? 'Oldest' : 'Newest'}</span>
                  </button>
                </div>
              </div>

              {/* Chapter List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[340px]">
                {loadingChapters ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                    <span className="text-xs">Fetching English chapters...</span>
                  </div>
                ) : filteredChapters.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    No translated chapters found matching your filter.
                  </div>
                ) : (
                  filteredChapters.map((chap) => {
                    const isRead = readChapterIds.includes(chap.id);
                    const isCurrentLastRead = String(chap.chapter) === String(lastReadChapter);

                    return (
                      <div
                        key={chap.id}
                        onClick={() => {
                          onClose();
                          onOpenReader(
                            manga.id,
                            chap.id,
                            chap.chapter,
                            manga.title,
                            manga.coverUrl
                          );
                        }}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${
                          isCurrentLastRead
                            ? 'bg-rose-500/10 border-rose-500/40 text-white'
                            : isRead
                            ? 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                            : 'bg-slate-900/80 border-white/5 hover:border-white/20 text-slate-200 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                            isCurrentLastRead
                              ? 'bg-rose-500 text-white'
                              : isRead
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-white/5 text-slate-400 group-hover:text-white'
                          }`}>
                            {isRead ? <Check className="w-4 h-4" /> : chap.chapter}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm group-hover:text-rose-400 transition-colors">
                                Chapter {chap.chapter}
                              </span>
                              {chap.title && (
                                <span className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-[320px]">
                                  • {chap.title}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{chap.group}</span>
                              {chap.publishedAt && (
                                <span>• {new Date(chap.publishedAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="opacity-0 group-hover:opacity-100 text-xs font-bold text-rose-400 flex items-center gap-1 transition-opacity">
                            Read
                            <Play className="w-3 h-3 fill-rose-400" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
