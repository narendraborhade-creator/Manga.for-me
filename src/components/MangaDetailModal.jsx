import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Play, 
  Bookmark, 
  Check, 
  Search, 
  ArrowUpDown, 
  Layers,
  Sparkles,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { getFallbackCover, fetchMangaDetails, fetchMangaRecommendations, cleanTitle, decodeHtml } from '../services/mangaApi';
import { getReadChaptersForManga } from '../services/storage';

export default function MangaDetailModal({
  mangaId,
  initialCoverUrl = null,
  onClose,
  onOpenReader,
  onSelectManga,
  isBookmarked,
  bookmarkStatus,
  onSetBookmark,
  onRemoveBookmark,
  lastReadChapter
}) {
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chapterSort, setChapterSort] = useState('desc'); // 'asc' | 'desc'
  const [chapterSearch, setChapterSearch] = useState('');
  const [readChapterIds, setReadChapterIds] = useState([]);

  // Fetch manga details and chapters
  const loadMangaData = useCallback((forceRefresh = false) => {
    if (!mangaId) return;
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
      setLoadingChapters(true);
    }

    // Load read chapters from history
    const readList = getReadChaptersForManga(mangaId);
    setReadChapterIds(readList);

    fetchMangaDetails(mangaId, forceRefresh)
      .then((data) => {
        if (data) {
          if (initialCoverUrl) {
            data.coverUrl = initialCoverUrl;
          }
          setManga(data);
          if (data.chapters && Array.isArray(data.chapters)) {
            const sorted = [...data.chapters].sort((a, b) => {
              const numA = parseFloat(a.chapter) || 0;
              const numB = parseFloat(b.chapter) || 0;
              return chapterSort === 'asc' ? numA - numB : numB - numA;
            });
            setChapters(sorted);
          }

          // Fetch suggestions & recommendations for this manga
          setLoadingRecs(true);
          fetchMangaRecommendations(mangaId, data.tags || [])
            .then(recs => setRecommendations(recs || []))
            .catch(() => setRecommendations([]))
            .finally(() => setLoadingRecs(false));
        }
      })
      .catch((err) => {
        console.error('loadMangaData error:', err);
      })
      .finally(() => {
        setLoading(false);
        setLoadingChapters(false);
        setIsRefreshing(false);
      });
  }, [mangaId, initialCoverUrl, chapterSort]);

  useEffect(() => {
    loadMangaData(false);
  }, [loadMangaData]);

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

  // Calculate first and latest chapters numerically
  const sortedByNumAsc = [...chapters].sort(
    (a, b) => (parseFloat(a.chapter) || 0) - (parseFloat(b.chapter) || 0)
  );
  const firstChapter = sortedByNumAsc.length > 0 ? sortedByNumAsc[0] : null;
  const latestChapter = sortedByNumAsc.length > 0 ? sortedByNumAsc[sortedByNumAsc.length - 1] : null;

  const resumeChapterObj = lastReadChapter
    ? chapters.find((c) => String(c.chapter) === String(lastReadChapter))
    : null;

  const targetStartChapter = resumeChapterObj || firstChapter;

  const formatDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
    return String(val);
  };

  if (!mangaId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-[#0c1017] border-0 sm:border border-white/10 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-full sm:max-h-[92vh] h-full sm:h-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          aria-label="Close details"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white border border-white/10 backdrop-blur-md transition-all"
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
            <div className="relative p-5 sm:p-8 bg-gradient-to-b from-slate-900/90 to-[#0c1017] border-b border-white/5 pt-[calc(1.2rem+env(safe-area-inset-top))] sm:pt-8">
              {/* Blurred background cover image */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl pointer-events-none"
                style={{ backgroundImage: `url(${initialCoverUrl || manga.coverUrl})` }}
              />

              <div className="relative z-10 flex flex-col sm:flex-row gap-5 sm:gap-6 items-center sm:items-start text-center sm:text-left">
                {/* Cover Art */}
                <div className="w-28 sm:w-44 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[3/4.2] bg-slate-950 mx-auto sm:mx-0">
                  <img
                    src={initialCoverUrl || manga.coverUrl}
                    alt={manga.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      if (initialCoverUrl && e.target.src !== initialCoverUrl) {
                        e.target.src = initialCoverUrl;
                      } else {
                        e.target.src = getFallbackCover(mangaData?.title);
                      }
                    }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mb-2">
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

                    {(() => {
                      const src = manga.sourceName || (
                        manga.id?.startsWith('asura:') ? 'Asura Scans' :
                        manga.id?.startsWith('vortex:') ? 'Vortex Scans' :
                        manga.id?.startsWith('wc:') ? 'WeebCentral' :
                        manga.id?.startsWith('webtoon:') ? 'Webtoon' : 'MangaPill'
                      );
                      const colorClass = 
                        src === 'Asura Scans' ? 'text-violet-400 bg-violet-500/10 border-violet-500/30' :
                        src === 'Vortex Scans' ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' :
                        src === 'Webtoon' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                        'text-sky-400 bg-sky-500/10 border-sky-500/30';
                      return (
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${colorClass}`}>
                          {src}
                        </span>
                      );
                    })()}
                  </div>

                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-1">
                    {cleanTitle(manga.englishTitle || manga.title)}
                  </h2>

                  {manga.englishTitle && manga.englishTitle.toLowerCase() !== manga.title.toLowerCase() && (
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-white/10 text-zinc-300 border border-white/5 font-semibold">
                        Original Title
                      </span>
                      <span className="text-xs sm:text-sm text-zinc-300 font-medium truncate max-w-xs">
                        {cleanTitle(manga.title)}
                      </span>
                    </div>
                  )}

                  {manga.author && manga.author.trim() !== '' && manga.author.toLowerCase() !== 'unknown author' && (
                    <p className="text-xs sm:text-sm text-slate-400 mb-3 flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-slate-300 font-medium">By {decodeHtml(manga.author)}</span>
                    </p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mb-4">
                    {(manga.tags || []).map((t, i) => (
                      <span key={i} className="text-[11px] text-slate-300 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons: Read Now, Read Latest & Bookmark status selector */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                    {targetStartChapter && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenReader(
                            manga.id,
                            targetStartChapter.id,
                            targetStartChapter.chapter,
                            manga.title,
                            initialCoverUrl || manga.coverUrl,
                            manga.englishTitle || null
                          );
                        }}
                        className="w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>
                          {resumeChapterObj ? `Resume Ch. ${resumeChapterObj.chapter}` : `Start Ch. ${targetStartChapter.chapter}`}
                        </span>
                      </button>
                    )}

                    {latestChapter && (!targetStartChapter || String(latestChapter.id) !== String(targetStartChapter.id)) && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenReader(
                            manga.id,
                            latestChapter.id,
                            latestChapter.chapter,
                            manga.title,
                            initialCoverUrl || manga.coverUrl,
                            manga.englishTitle || null
                          );
                        }}
                        className="w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 border border-amber-400/30"
                      >
                        <Sparkles className="w-4 h-4 fill-white text-white" />
                        <span>Read Latest (Ch. {latestChapter.chapter})</span>
                      </button>
                    )}

                    {/* Bookmark Status Selector */}
                    <div className="relative inline-flex items-center w-full sm:w-auto">
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
                        className="w-full sm:w-auto appearance-none bg-slate-900 border border-white/10 text-slate-200 text-xs sm:text-sm font-semibold pl-8 pr-8 py-2.5 rounded-xl hover:border-rose-500/40 focus:outline-none focus:border-rose-500 cursor-pointer transition-all"
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
              <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-white/5 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-32 overflow-y-auto pr-2">
                <p className="whitespace-pre-line">{manga.description}</p>
              </div>
            </div>

            {/* Chapters Feed Section */}
            <div className="flex-1 p-4 sm:p-6 flex flex-col min-h-0 bg-[#080a0f] pb-[calc(1.2rem+env(safe-area-inset-bottom))] sm:pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-rose-500" />
                    <span>Chapters</span>
                    <span className="text-xs text-slate-400 font-normal">
                      ({filteredChapters.length} available)
                    </span>
                  </h3>

                  {latestChapter && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                      Latest: Ch. {latestChapter.chapter}
                    </span>
                  )}

                  <button
                    onClick={() => loadMangaData(true)}
                    disabled={isRefreshing}
                    className="p-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 ml-1"
                    title="Check for newest chapters directly from source"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-400' : ''}`} />
                    <span className="text-[11px] font-semibold">{isRefreshing ? 'Updating...' : 'Check Updates'}</span>
                  </button>
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
                    const isLatest = latestChapter && String(chap.chapter) === String(latestChapter.chapter);

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
                            initialCoverUrl || manga.coverUrl,
                            manga.englishTitle || null
                          );
                        }}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${
                          isCurrentLastRead
                            ? 'bg-rose-500/10 border-rose-500/40 text-white'
                            : isLatest
                            ? 'bg-amber-500/10 border-amber-500/40 hover:border-amber-500/60 text-slate-200 hover:bg-amber-500/15'
                            : isRead
                            ? 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                            : 'bg-slate-900/80 border-white/5 hover:border-white/20 text-slate-200 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                            isCurrentLastRead
                              ? 'bg-rose-500 text-white'
                              : isLatest
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : isRead
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-white/5 text-slate-400 group-hover:text-white'
                          }`}>
                            {isRead ? <Check className="w-4 h-4" /> : chap.chapter}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-semibold text-sm transition-colors ${
                                isLatest ? 'text-amber-300 group-hover:text-amber-200 font-bold' : 'group-hover:text-rose-400'
                              }`}>
                                Chapter {chap.chapter}
                              </span>

                              {isLatest && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                                  LATEST
                                </span>
                              )}

                              {chap.title && !chap.title.toLowerCase().startsWith(`chapter ${chap.chapter}`.toLowerCase()) && (
                                <span className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-[320px]">
                                  • {chap.title}
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              {chap.group && <span>{chap.group}</span>}
                              {chap.publishedAt && (
                                <span>• {formatDate(chap.publishedAt)}</span>
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

              {/* Recommendations / Suggestions Section */}
              <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-400" />
                    <h3 className="font-extrabold text-base text-white font-['Outfit']">
                      You Might Also Like
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Smart Suggestions</span>
                </div>

                {loadingRecs ? (
                  <div className="flex items-center justify-center py-6 gap-2 text-xs text-slate-400">
                    <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
                    <span>Loading recommendations...</span>
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {recommendations.map((rec) => (
                      <div
                        key={rec.id}
                        onClick={() => {
                          if (onSelectManga) {
                            onSelectManga(rec.id, rec.coverUrl);
                          }
                        }}
                        className="group cursor-pointer flex flex-col space-y-2 p-2 rounded-2xl bg-slate-900/40 hover:bg-white/5 border border-white/5 hover:border-rose-500/30 transition-all"
                      >
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 border border-white/5 shadow-md">
                          <img
                            src={rec.coverUrl}
                            alt={rec.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute bottom-1.5 left-1.5 text-[9px] px-1.5 py-0.2 rounded-md bg-black/80 backdrop-blur-md text-rose-400 font-semibold border border-white/10">
                            {rec.sourceName || 'Manga'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-rose-400 transition-colors line-clamp-2">
                          {rec.englishTitle || rec.title}
                        </h4>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
