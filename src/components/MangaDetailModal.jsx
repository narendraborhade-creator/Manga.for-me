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
  RefreshCw,
  Radio,
  ChevronDown,
  ChevronUp,
  Newspaper,
  ExternalLink,
  Flame
} from 'lucide-react';
import { getFallbackCover, fetchMangaDetails, fetchMangaRecommendations, fetchMangaNews, cleanTitle, decodeHtml, deduplicateChapters } from '../services/mangaApi';
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
  const [activeMangaId, setActiveMangaId] = useState(mangaId);
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [mangaNews, setMangaNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  const [modalTab, setModalTab] = useState('chapters'); // 'chapters' | 'news'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chapterSort, setChapterSort] = useState('desc'); // 'asc' | 'desc'
  const [chapterSearch, setChapterSearch] = useState('');
  const [readChapterIds, setReadChapterIds] = useState([]);
  const [visibleChapterCount, setVisibleChapterCount] = useState(100);
  const [isExpandedSynopsis, setIsExpandedSynopsis] = useState(false);

  useEffect(() => {
    setActiveMangaId(mangaId);
    setVisibleChapterCount(100);
    setIsExpandedSynopsis(false);
  }, [mangaId]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Fetch manga details and chapters
  const loadMangaData = useCallback((forceRefresh = false) => {
    if (!activeMangaId) return;
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
      setLoadingChapters(true);
    }

    // Load read chapters from history
    const readList = getReadChaptersForManga(activeMangaId);
    setReadChapterIds(readList);

    fetchMangaDetails(activeMangaId, forceRefresh)
      .then((data) => {
        if (data) {
          if (initialCoverUrl) {
            data.coverUrl = initialCoverUrl;
          }
          setManga(data);
          if (data.chapters && Array.isArray(data.chapters)) {
            const uniqueChapters = deduplicateChapters(data.chapters);
            const sorted = uniqueChapters.sort((a, b) => {
              const numA = parseFloat(a.chapter);
              const numB = parseFloat(b.chapter);
              if (!isNaN(numA) && !isNaN(numB)) {
                if (numA !== numB) {
                  return chapterSort === 'asc' ? numA - numB : numB - numA;
                }
              }
              return 0;
            });
            setChapters(sorted);
          }

          // Fetch suggestions & recommendations for this manga
          setLoadingRecs(true);
          fetchMangaRecommendations(activeMangaId, data.tags || [])
            .then(recs => setRecommendations(recs || []))
            .catch(() => setRecommendations([]))
            .finally(() => setLoadingRecs(false));

          // Fetch latest industry news & release updates for this manga
          setLoadingNews(true);
          fetchMangaNews(data.englishTitle || data.title, 8)
            .then(news => setMangaNews(news || []))
            .catch(() => setMangaNews([]))
            .finally(() => setLoadingNews(false));
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
  }, [activeMangaId, initialCoverUrl, chapterSort]);

  useEffect(() => {
    loadMangaData(false);
  }, [loadMangaData]);

  // Handle sort change
  const toggleSort = () => {
    const newSort = chapterSort === 'asc' ? 'desc' : 'asc';
    setChapterSort(newSort);
    const sorted = [...chapters].sort((a, b) => {
      const numA = parseFloat(a.chapter);
      const numB = parseFloat(b.chapter);
      if (!isNaN(numA) && !isNaN(numB)) {
        if (numA !== numB) {
          return newSort === 'asc' ? numA - numB : numB - numA;
        }
      }
      return 0;
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

  // When searching, show all matches; otherwise limit to visibleChapterCount
  const displayedChapters = chapterSearch.trim()
    ? filteredChapters
    : filteredChapters.slice(0, visibleChapterCount);

  if (!mangaId) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl h-[94vh] max-h-[94vh] sm:h-[88vh] sm:max-h-[88vh] bg-[#080d1a]/98 border border-cyan-500/35 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col glass-panel-elevated hud-corner holo-sheen holo-modal-project overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Holographic Projector Emitter Laser Lines */}
        <div className="holo-emitter-top" />
        <div className="holo-emitter-bottom" />
        <div className="holo-beam-sweep pointer-events-none" />

        {/* Pinned Top HUD Navigation Bar (Fixed in place at top of modal) */}
        <header className="relative z-30 flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3 border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400/90 tracking-widest select-none">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              SYS_ID // 0x8F9C
            </span>
            <span className="text-slate-600 hidden xs:inline">•</span>
            <span className="hidden xs:inline">HOLO_STREAM // 60FPS</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-rose-400 hidden sm:inline">ENCRYPTED // TLS_v1.3</span>
          </div>

          <button
            type="button"
            aria-label="Close details"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/10 hover:border-rose-500/40 backdrop-blur-md transition-all shadow-md cursor-pointer flex items-center gap-1.5 flex-shrink-0"
            title="Close modal (Esc)"
          >
            <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="text-[10px] sm:text-xs font-mono font-bold">CLOSE</span>
          </button>
        </header>

        {/* Unified Scrollable Body - Everything scrolls smoothly together without nested scroll traps */}
        <div 
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-cyan-500/40 scrollbar-track-transparent divide-y divide-white/5"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 gap-3">
              <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
              <p className="text-sm text-slate-400 font-mono">Loading manga holo-data...</p>
            </div>
          ) : !manga ? (
            <div className="p-12 text-center text-slate-400">
              <p>Could not load manga information.</p>
              <button 
                onClick={onClose} 
                className="mt-4 px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-all"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Header Banner & Metadata Section */}
              <section className="relative p-5 sm:p-8 bg-gradient-to-b from-slate-900/90 to-[#0c1017]">
                {/* Blurred background cover image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl pointer-events-none"
                  style={{ backgroundImage: `url(${initialCoverUrl || manga.coverUrl})` }}
                />

                <div className="relative z-10 flex flex-col sm:flex-row gap-5 sm:gap-6 items-center sm:items-start text-center sm:text-left">
                  {/* Cover Art */}
                  <div className="w-32 sm:w-44 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[3/4.2] bg-slate-950 mx-auto sm:mx-0">
                    <img
                      src={initialCoverUrl || manga.coverUrl}
                      alt={manga.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        if (initialCoverUrl && e.target.src !== initialCoverUrl) {
                          e.target.src = initialCoverUrl;
                        } else {
                          e.target.src = getFallbackCover(manga.title);
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
                          manga.id?.startsWith('flame:') ? 'Flame Comics' :
                          manga.id?.startsWith('asura:') ? 'Asura Scans' :
                          manga.id?.startsWith('vortex:') ? 'Vortex Scans' :
                          manga.id?.startsWith('wc:') ? 'WeebCentral' :
                          manga.id?.startsWith('md:') ? 'MangaDex' :
                          manga.id?.startsWith('mk:') ? 'MangaKakalot' :
                          manga.id?.startsWith('webtoon:') ? 'Webtoon' : 'MangaPill'
                        );
                        const colorClass = 
                          src === 'Flame Comics' || src === 'Flame' ? 'text-orange-400 bg-orange-500/10 border-orange-500/30' :
                          src === 'Asura Scans' || src === 'Asura' ? 'text-violet-400 bg-violet-500/10 border-violet-500/30' :
                          src === 'Vortex Scans' || src === 'Vortex' ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' :
                          src === 'MangaDex' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                          src === 'MangaKakalot' ? 'text-sky-400 bg-sky-500/10 border-sky-500/30' :
                          src === 'Webtoon' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                          src === 'WeebCentral' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' :
                          'text-rose-400 bg-rose-500/10 border-rose-500/30';
                        return (
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${colorClass}`}>
                            {src}
                          </span>
                        );
                      })()}
                    </div>

                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold holo-text tracking-tight mb-1 font-['Outfit']">
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
                    <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mb-3">
                      {(manga.tags || []).map((t, i) => (
                        <span key={i} className="text-[11px] text-slate-300 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Multi-Source Stream Switcher */}
                    {manga.availableSources && manga.availableSources.length > 1 && (
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap mb-3.5 p-2 rounded-xl bg-slate-950/80 border border-cyan-500/25">
                        <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 flex items-center gap-1 mr-1">
                          <Radio className="w-3 h-3 text-cyan-400 animate-pulse" /> Source Stream:
                        </span>
                        {manga.availableSources.map((src) => {
                          const isSelected = src.id === activeMangaId;
                          return (
                            <button
                              key={src.id}
                              type="button"
                              onClick={() => {
                                if (src.id !== activeMangaId) {
                                  setActiveMangaId(src.id);
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                                isSelected
                                  ? 'btn-holo text-white shadow-md shadow-cyan-500/30 ring-1 ring-white/30'
                                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:border-cyan-500/30'
                              }`}
                              title={`Switch to ${src.sourceName} chapter feed`}
                            >
                              <span>{src.sourceName}</span>
                              {src.totalChapters ? (
                                <span className="text-[10px] opacity-80">({src.totalChapters} Ch)</span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    )}

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
                          className="w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white btn-holo shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>
                            {resumeChapterObj ? `Resume Ch. ${resumeChapterObj.chapter} [▶]` : `Start Ch. ${targetStartChapter.chapter} [▶]`}
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
                          className="w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 border border-amber-400/30 cursor-pointer"
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

                {/* Synopsis (Naturally flow without inner scroll trap) */}
                {manga.description && (
                  <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-white/5 text-xs sm:text-sm text-slate-300 leading-relaxed pr-1">
                    <p className="whitespace-pre-line">
                      {isExpandedSynopsis || manga.description.length <= 360
                        ? manga.description
                        : `${manga.description.slice(0, 360)}...`}
                    </p>
                    {manga.description.length > 360 && (
                      <button
                        type="button"
                        onClick={() => setIsExpandedSynopsis(!isExpandedSynopsis)}
                        className="mt-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold font-mono flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {isExpandedSynopsis ? (
                          <>
                            <span>Show Less</span>
                            <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <span>Read Full Synopsis</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </section>

              {/* Tabs: Chapters vs Latest News & Updates */}
              <div className="flex items-center gap-2 border-b border-white/10 px-4 sm:px-8 bg-[#080a0f] pt-4 font-mono">
                <button
                  type="button"
                  onClick={() => setModalTab('chapters')}
                  className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    modalTab === 'chapters'
                      ? 'border-cyan-400 text-cyan-300'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>CHAPTERS ({filteredChapters.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab('news')}
                  className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    modalTab === 'news'
                      ? 'border-amber-400 text-amber-300'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Newspaper className="w-4 h-4" />
                  <span>LATEST_NEWS ({mangaNews.length})</span>
                  {mangaNews.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </button>
              </div>

              {/* Chapters Section */}
              {modalTab === 'chapters' && (
              <section className="p-4 sm:p-6 sm:px-8 bg-[#080a0f] space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-white flex items-center gap-2 font-['Outfit']">
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
                      className="p-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 ml-1 cursor-pointer"
                      title="Check for newest chapters directly from source"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-400' : ''}`} />
                      <span className="text-[11px] font-semibold">{isRefreshing ? 'Updating...' : 'Check Updates'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Chapter Search Filter */}
                    <div className="relative flex-1 sm:w-48">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Find chapter..."
                        value={chapterSearch}
                        onChange={(e) => setChapterSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
                      />
                    </div>

                    {/* Sort Order Toggle */}
                    <button
                      onClick={toggleSort}
                      className="p-1.5 px-2.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1 transition-all cursor-pointer flex-shrink-0"
                      title={`Sort: ${chapterSort === 'asc' ? 'Ascending' : 'Descending'}`}
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      <span>{chapterSort === 'asc' ? 'Oldest' : 'Newest'}</span>
                    </button>
                  </div>
                </div>

                {/* Chapter Cards List (Natural flow, no nested scroll trap) */}
                <div className="space-y-1.5 rounded-2xl border border-white/10 bg-slate-950/60 p-2 sm:p-3">
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
                    <>
                      {displayedChapters.map((chap) => {
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

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="opacity-80 group-hover:opacity-100 text-xs font-bold text-rose-400 flex items-center gap-1 transition-opacity">
                                Read
                                <Play className="w-3 h-3 fill-rose-400" />
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Pagination / Load More Controls for large archives */}
                      {!chapterSearch.trim() && filteredChapters.length > visibleChapterCount && (
                        <div className="pt-3 pb-1 flex flex-wrap items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setVisibleChapterCount((prev) => prev + 100)}
                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold font-mono transition-all cursor-pointer"
                          >
                            Load More (+100)
                          </button>
                          <button
                            type="button"
                            onClick={() => setVisibleChapterCount(filteredChapters.length)}
                            className="px-4 py-2 rounded-xl btn-holo text-white text-xs font-semibold font-mono transition-all cursor-pointer"
                          >
                            Show All ({filteredChapters.length} Chapters)
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </section>
              )}

              {/* Latest News & Updates Tab */}
              {modalTab === 'news' && (
                <section className="p-4 sm:p-6 sm:px-8 bg-[#080a0f] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Newspaper className="w-4 h-4 text-amber-400" />
                      <h3 className="text-base font-bold text-white font-['Outfit']">
                        Real-Time Manga News & Announcements
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      LIVE_WIRE
                    </span>
                  </div>

                  {loadingNews ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                      <span className="text-xs">Fetching verified industry news & release schedules...</span>
                    </div>
                  ) : mangaNews.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs">
                      No recent news or announcements found for this title. Check back shortly for new updates.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {mangaNews.map((newsItem) => (
                        <a
                          key={newsItem.id}
                          href={newsItem.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex flex-col justify-between p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-white/10 hover:border-amber-400/50 transition-all hover:shadow-xl hover:shadow-amber-950/20 cursor-pointer"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                {newsItem.source}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {newsItem.pubDate}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-2 mb-1.5 leading-snug">
                              {newsItem.title}
                            </h4>
                            {newsItem.snippet && (
                              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                {newsItem.snippet}
                              </p>
                            )}
                          </div>
                          <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 group-hover:text-amber-300 font-mono">
                            <span className="text-[11px] font-semibold">READ_SOURCE_ARTICLE</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Recommendations / Suggestions Section */}
              <section className="p-4 sm:p-6 sm:px-8 bg-[#080a0f] space-y-4 pb-20 sm:pb-24">
                <div className="flex items-center justify-between border-t border-white/5 pt-6">
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
                    {recommendations.slice(0, 6).map((rec) => (
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
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = getFallbackCover(rec.title);
                            }}
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
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
