import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import ContinueReadingBanner from './components/ContinueReadingBanner';
import HeroCarousel from './components/HeroCarousel';
import MangaCard from './components/MangaCard';
import AnimeCard from './components/AnimeCard';
import MangaDetailModal from './components/MangaDetailModal';
import AnimeDetailModal from './components/AnimeDetailModal';
import MangaReader from './components/MangaReader';
import LibraryView from './components/LibraryView';
import HistoryView from './components/HistoryView';
import BackupModal from './components/BackupModal';

import { 
  fetchPopularManga, 
  searchManga,
  getFallbackCover
} from './services/mangaApi';

import { 
  fetchTrendingAnime, 
  fetchTopAnime, 
  fetchSeasonalAnime, 
  searchAnime 
} from './services/animeApi';

import { 
  getBookmarks, 
  setBookmark, 
  removeBookmark, 
  getBookmarkStatus,
  getLastRead, 
  getHistory,
  getUpdates,
  getUpdateSettings,
  importData,
  decodeDataFromUrl
} from './services/storage';
import { checkAllLibraryUpdates } from './services/updateService';

import { 
  BookOpen, 
  Film, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Star, 
  Loader2,
  Filter,
  Play,
  Bookmark,
  History,
  Radio,
  X,
  SlidersHorizontal,
  Search
} from 'lucide-react';

const GENRES = [
  'All',
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Supernatural',
];

const SOURCES = [
  { id: 'All', label: 'All Sources', badge: 'Multi-Feed' },
  { id: 'WeebCentral', label: 'WeebCentral', badge: '15k+ Ch.1' },
  { id: 'MangaDex', label: 'MangaDex', badge: 'Official/Scans' },
  { id: 'Asura', label: 'Asura Scans', badge: 'Weekly Action' },
  { id: 'Vortex', label: 'Vortex Scans', badge: 'High-Speed' },
  { id: 'MangaKakalot', label: 'MangaKakalot', badge: 'Classic Archive' },
  { id: 'Webtoon', label: 'Webtoons', badge: 'Full-Color' },
  { id: 'MangaPill', label: 'MangaPill', badge: 'Mirror CDN' },
];

function matchesSource(manga, filterSource) {
  if (!filterSource || filterSource === 'All') return true;
  const target = filterSource.toLowerCase();
  const src = (
    manga.sourceName || (
      manga.id?.startsWith('asura:') ? 'Asura Scans' :
      manga.id?.startsWith('vortex:') ? 'Vortex Scans' :
      manga.id?.startsWith('wc:') ? 'WeebCentral' :
      manga.id?.startsWith('md:') ? 'MangaDex' :
      manga.id?.startsWith('mk:') ? 'MangaKakalot' :
      manga.id?.startsWith('webtoon:') ? 'Webtoon' : 'MangaPill'
    )
  ).toLowerCase();
  if (src.includes(target) || target.includes(src)) return true;
  if (Array.isArray(manga.alternativeSources)) {
    return manga.alternativeSources.some((alt) => {
      const a = (alt || '').toLowerCase();
      return a.includes(target) || target.includes(a);
    });
  }
  return false;
}

export default function App() {
  // Navigation & Search
  const [activeTab, setActiveTab] = useState('manga'); // 'manga' | 'anime' | 'library' | 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All'); // 'All' | 'WeebCentral' | 'Webtoon' | 'MangaPill'

  // Local Storage States
  const [bookmarks, setBookmarks] = useState({});
  const [history, setHistory] = useState([]);
  const [lastRead, setLastRead] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [activeToast, setActiveToast] = useState(null);
  const [dismissContinueBanner, setDismissContinueBanner] = useState(false);

  // Modals & Reader
  const [selectedMangaId, setSelectedMangaId] = useState(null);
  const [selectedMangaCover, setSelectedMangaCover] = useState('');
  const [selectedAnime, setSelectedAnime] = useState(null);

  const handleOpenMangaDetails = useCallback((id, coverUrl = '') => {
    setSelectedMangaId(id);
    setSelectedMangaCover(coverUrl);
  }, []);

  const [readerState, setReaderState] = useState({
    active: false,
    mangaId: null,
    chapterId: null,
    chapterNumber: null,
    mangaTitle: '',
    mangaEnglishTitle: null,
    coverUrl: '',
  });
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Manga Hub Data
  const [popularManga, setPopularManga] = useState([]);
  const [latestManga, setLatestManga] = useState([]);
  const [topRatedManga, setTopRatedManga] = useState([]);
  const [searchMangaList, setSearchMangaList] = useState([]);
  const [loadingManga, setLoadingManga] = useState(true);
  const [searchingManga, setSearchingManga] = useState(false);

  // Anime Hub Data
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [topAnime, setTopAnime] = useState([]);
  const [seasonalAnime, setSeasonalAnime] = useState([]);
  const [searchAnimeList, setSearchAnimeList] = useState([]);
  const [loadingAnime, setLoadingAnime] = useState(true);
  const [searchingAnime, setSearchingAnime] = useState(false);

  // Refresh Storage Data
  const refreshStorageData = useCallback(() => {
    setBookmarks(getBookmarks());
    setHistory(getHistory());
    setLastRead(getLastRead());
    setUpdates(getUpdates());
  }, []);

  useEffect(() => {
    refreshStorageData();

    // Check for 1-click sync data in URL hash (e.g. migrating from localhost to Vercel)
    if (window.location.hash && window.location.hash.startsWith('#sync_data=')) {
      try {
        const encoded = window.location.hash.replace('#sync_data=', '');
        const jsonStr = decodeDataFromUrl(encoded);
        if (jsonStr) {
          const success = importData(jsonStr);
          if (success) {
            refreshStorageData();
            window.history.replaceState(null, '', window.location.pathname);
            setActiveToast({
              chapterId: 'sync-complete',
              chapterNumber: 'Sync Success',
              mangaTitle: 'Localhost Data Restored!',
              mangaEnglishTitle: 'Your library bookmarks and reading history were successfully imported to this app.',
              coverUrl: getFallbackCover('Sync Complete'),
            });
          }
        }
      } catch (err) {
        console.error('Failed to parse sync data from URL hash:', err);
      }
    }
  }, [refreshStorageData]);

  // Background Periodic Chapter Updates Engine
  useEffect(() => {
    let isMounted = true;
    const settings = getUpdateSettings();
    const intervalMs = Math.max((settings.intervalMinutes || 15), 5) * 60 * 1000;

    // Grace period initial check after 3.5s
    const initialTimer = setTimeout(() => {
      checkAllLibraryUpdates((newDrop) => {
        if (!isMounted) return;
        setActiveToast(newDrop);
        refreshStorageData();
      }).then(() => {
        if (isMounted) refreshStorageData();
      });
    }, 3500);

    // Regular interval checking
    const intervalId = setInterval(() => {
      checkAllLibraryUpdates((newDrop) => {
        if (!isMounted) return;
        setActiveToast(newDrop);
        refreshStorageData();
      }).then(() => {
        if (isMounted) refreshStorageData();
      });
    }, intervalMs);

    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      clearInterval(intervalId);
    };
  }, [refreshStorageData]);

  // Fetch Initial Manga Catalog
  useEffect(() => {
    let isMounted = true;
    setLoadingManga(true);

    fetchPopularManga()
      .then((pop) => {
        if (!isMounted) return;
        setPopularManga(pop.slice(0, 12));
        setLatestManga(pop.slice(12, 24).length > 0 ? pop.slice(12, 24) : pop.slice(0, 12));
        setTopRatedManga(pop.slice(24, 36).length > 0 ? pop.slice(24, 36) : pop.slice(0, 12));
        setLoadingManga(false);
      })
      .catch((err) => {
        console.error('Failed to load initial manga:', err);
        if (isMounted) setLoadingManga(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Initial Anime Catalog
  useEffect(() => {
    let isMounted = true;
    setLoadingAnime(true);

    Promise.all([
      fetchTrendingAnime(1, 12),
      fetchTopAnime(1, 12),
      fetchSeasonalAnime(1, 12),
    ])
      .then(([trend, top, season]) => {
        if (!isMounted) return;
        setTrendingAnime(trend);
        setTopAnime(top);
        setSeasonalAnime(season);
        setLoadingAnime(false);
      })
      .catch((err) => {
        console.error('Failed to load initial anime:', err);
        if (isMounted) setLoadingAnime(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Search Debounce
  useEffect(() => {
    if (!searchQuery.trim() && selectedGenre === 'All') {
      setSearchMangaList((prev) => (prev.length > 0 ? [] : prev));
      setSearchAnimeList((prev) => (prev.length > 0 ? [] : prev));
      return;
    }

    const timer = setTimeout(() => {
      if (activeTab === 'manga' || searchQuery) {
        setSearchingManga(true);
        const query = searchQuery.trim() || (selectedGenre !== 'All' ? selectedGenre : '');
        searchManga(query).then((res) => {
          setSearchMangaList(res);
          setSearchingManga(false);
        });
      }

      if (activeTab === 'anime' || searchQuery) {
        setSearchingAnime(true);
        const genreParam = selectedGenre !== 'All' ? selectedGenre : null;
        searchAnime(searchQuery, genreParam, 1, 24).then((res) => {
          setSearchAnimeList(res);
          setSearchingAnime(false);
        });
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedGenre, activeTab]);

  // Bookmarking handlers
  const handleToggleBookmark = useCallback((manga) => {
    if (bookmarks[manga.id]) {
      removeBookmark(manga.id);
    } else {
      setBookmark(manga.id, manga, 'reading');
    }
    refreshStorageData();
  }, [bookmarks, refreshStorageData]);

  const handleSetBookmark = useCallback((mangaId, mangaData, status) => {
    setBookmark(mangaId, mangaData, status);
    refreshStorageData();
  }, [refreshStorageData]);

  const handleRemoveBookmark = useCallback((mangaId) => {
    removeBookmark(mangaId);
    refreshStorageData();
  }, [refreshStorageData]);

  // Open Reader
  const handleOpenReader = (mangaId, chapterId, chapterNumber, mangaTitle, coverUrl, mangaEnglishTitle = null) => {
    setReaderState({
      active: true,
      mangaId,
      chapterId,
      chapterNumber,
      mangaTitle,
      mangaEnglishTitle,
      coverUrl,
    });
  };

  // Change Chapter in Reader
  const handleChangeChapter = (newChapterId, newChapterNumber) => {
    setReaderState((prev) => ({
      ...prev,
      chapterId: newChapterId,
      chapterNumber: newChapterNumber,
    }));
    refreshStorageData();
  };

  // Close Reader (Returns back to manga details or previous view)
  const handleCloseReader = () => {
    setReaderState((prev) => ({ ...prev, active: false }));
    refreshStorageData();
  };

  // Go Directly to Home Screen from Reader / Modals / Subviews
  const handleGoHome = useCallback(() => {
    setReaderState((prev) => ({ ...prev, active: false }));
    setSelectedMangaId(null);
    setSelectedAnime(null);
    setIsBackupOpen(false);
    setActiveTab('manga');
    setSearchQuery('');
    setSelectedGenre('All');
    setSelectedSource('All');
    refreshStorageData();
    if (typeof window !== 'undefined') {
      if (window.history.state?.appScreen === 'subview') {
        window.history.replaceState({ appScreen: 'home' }, '');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [refreshStorageData]);

  // Mobile Device Back Button & Swipe-to-back Gesture Integration
  const isSubView = readerState.active || Boolean(selectedMangaId) || Boolean(selectedAnime) || isBackupOpen || activeTab !== 'manga';
  const isSubViewRef = useRef(false);

  useEffect(() => {
    isSubViewRef.current = isSubView;
  }, [isSubView]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!window.history.state || !window.history.state.appScreen) {
      window.history.replaceState({ appScreen: 'home' }, '');
    }

    if (isSubView) {
      if (window.history.state?.appScreen !== 'subview') {
        window.history.pushState({ appScreen: 'subview' }, '');
      }
    } else {
      if (window.history.state?.appScreen === 'subview') {
        window.history.replaceState({ appScreen: 'home' }, '');
      }
    }
  }, [isSubView]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      // User pressed device hardware back button or used swipe-to-back gesture
      if (isSubViewRef.current) {
        handleGoHome();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handleGoHome]);

  // Featured Spotlight Items for Hero Carousel (Manga & Anime mix)
  const spotlightItems = [
    ...(popularManga.slice(0, 3)),
    ...(trendingAnime.slice(0, 2)),
  ];
  // Memoized O(1) lookups for performance
  const historyMap = useMemo(() => {
    const map = {};
    history.forEach((entry) => {
      map[entry.mangaId] = entry;
    });
    return map;
  }, [history]);
  const handleSelectAnime = useCallback((anime) => {
    setSelectedAnime(anime);
  }, []);
  const handleOpenHistoryMangaDetails = useCallback((id) => {
    const item = historyMap[id];
    handleOpenMangaDetails(id, item?.coverUrl);
  }, [handleOpenMangaDetails, historyMap]);

  // Centralized body scroll lock when modal or reader is active to prevent scroll fighting
  useEffect(() => {
    const isOverlayOpen = readerState.active || Boolean(selectedMangaId) || Boolean(selectedAnime) || isBackupOpen;
    if (isOverlayOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [readerState.active, selectedMangaId, selectedAnime, isBackupOpen]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#080a0f] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        bookmarksCount={Object.keys(bookmarks).length}
        lastRead={lastRead}
        onOpenReader={handleOpenReader}
        onOpenBackup={() => setIsBackupOpen(true)}
        unreadUpdatesCount={updates.filter((u) => !u.read).length}
        onSelectManga={handleOpenMangaDetails}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Continue Reading Banner (Always tracks last read manga!) */}
        {lastRead && !dismissContinueBanner && activeTab !== 'history' && (
          <ContinueReadingBanner
            lastRead={lastRead}
            onOpenReader={handleOpenReader}
            onOpenMangaDetails={(mangaId) => handleOpenMangaDetails(mangaId, lastRead?.coverUrl)}
            onDismiss={() => setDismissContinueBanner(true)}
          />
        )}

        {/* --------------------- TAB 1: MANGA HUB --------------------- */}
        {activeTab === 'manga' && (() => {
          const isFilterActive = selectedGenre !== 'All' || selectedSource !== 'All' || Boolean(searchQuery.trim());
          const isSearching = Boolean(searchQuery.trim()) || selectedGenre !== 'All';
          const displayedMatchingCount = isSearching
            ? searchMangaList.filter((m) => matchesSource(m, selectedSource)).length
            : (
                popularManga.filter((m) => matchesSource(m, selectedSource)).length +
                latestManga.filter((m) => matchesSource(m, selectedSource)).length +
                topRatedManga.filter((m) => matchesSource(m, selectedSource)).length
              );

          return (
            <div className="space-y-8 animate-fadeIn">
              {/* Dynamic Holographic HUD Active Filters Bar */}
              {isFilterActive && (
                <div className="flex flex-wrap items-center gap-2 p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.18)] font-mono text-xs animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold tracking-wider uppercase flex-shrink-0">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>ACTIVE_FILTERS:</span>
                  </div>

                  {searchQuery.trim() && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 font-semibold shadow-[0_0_10px_rgba(6,182,212,0.25)]">
                      <Search className="w-3 h-3 text-cyan-400" />
                      <span>QUERY: "{searchQuery.trim()}"</span>
                      <button
                        aria-label="Remove search query"
                        onClick={() => setSearchQuery('')}
                        className="ml-1 p-0.5 rounded-full hover:bg-cyan-500/20 text-cyan-400 hover:text-white transition-colors cursor-pointer"
                        title="Remove search query"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedGenre !== 'All' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-950/80 border border-purple-400/50 text-purple-300 font-semibold shadow-[0_0_10px_rgba(168,85,247,0.25)]">
                      <Filter className="w-3 h-3 text-purple-400" />
                      <span>GENRE: {selectedGenre}</span>
                      <button
                        aria-label="Remove genre filter"
                        onClick={() => setSelectedGenre('All')}
                        className="ml-1 p-0.5 rounded-full hover:bg-purple-500/20 text-purple-400 hover:text-white transition-colors cursor-pointer"
                        title="Remove genre filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedSource !== 'All' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-950/80 border border-rose-400/50 text-rose-300 font-semibold shadow-[0_0_10px_rgba(244,63,94,0.25)]">
                      <Radio className="w-3 h-3 text-rose-400" />
                      <span>SOURCE: {SOURCES.find((s) => s.id === selectedSource)?.label || selectedSource}</span>
                      <button
                        aria-label="Remove source filter"
                        onClick={() => setSelectedSource('All')}
                        className="ml-1 p-0.5 rounded-full hover:bg-rose-500/20 text-rose-400 hover:text-white transition-colors cursor-pointer"
                        title="Remove source filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  <div className="ml-auto flex items-center gap-2.5 flex-shrink-0">
                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
                      • {displayedMatchingCount} TITLES MATCHED
                    </span>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedGenre('All');
                        setSelectedSource('All');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-sm hover:shadow-rose-500/20"
                    >
                      <X className="w-3 h-3" />
                      <span>RESET ALL</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Genre Filter Chips with HUD Monospace & Holographic Active State */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono">
                <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold mr-1 flex-shrink-0">
                  <Filter className="w-3.5 h-3.5 text-cyan-400" />
                  <span>GENRE::</span>
                </div>
                {GENRES.map((genre) => {
                  const isSelected = selectedGenre === genre;
                  return (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'btn-holo text-white shadow-md ring-2 ring-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.4)] font-bold'
                          : 'bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-900 border border-white/10'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />}
                      <span>{genre}</span>
                    </button>
                  );
                })}
              </div>

              {/* Source Selection Bar (8 High-Speed & Comprehensive Feeds) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono">
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold mr-1 flex-shrink-0">
                  <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>SOURCE::</span>
                </div>
                {SOURCES.map((s) => {
                  const isSelected = selectedSource === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSource(s.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'btn-holo text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-400/80 font-bold'
                          : 'bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-900 border border-white/10'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />}
                      <span>{s.label}</span>
                      {s.badge && (
                        <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                          isSelected ? 'bg-black/40 text-white font-bold' : 'bg-white/5 text-cyan-400'
                        }`}>
                          {s.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* If Not Searching: Show Hero Carousel & Categories */}
              {!isSearching ? (
                <>
                  {/* Hero Spotlight Carousel */}
                  {spotlightItems.length > 0 && (
                    <HeroCarousel
                      items={spotlightItems}
                      onSelectManga={handleOpenMangaDetails}
                      onSelectAnime={handleSelectAnime}
                      isBookmarkedFn={(id) => !!bookmarks[id]}
                      onToggleBookmark={handleToggleBookmark}
                    />
                  )}

                  {/* Section 1: Most Popular / Trending Manga */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
                          <Flame className="w-5 h-5 fill-rose-500 text-rose-500" />
                        </div>
                        <div>
                          <h2 className="text-xl font-extrabold text-white tracking-tight">
                            Most Popular Manga
                          </h2>
                          <p className="text-xs text-slate-400">
                            Fan favorites and trending masterworks {selectedSource !== 'All' ? `• Filtered by ${selectedSource}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    {loadingManga ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="aspect-[3/4.2] rounded-2xl bg-slate-900 animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                        {popularManga
                          .filter((m) => matchesSource(m, selectedSource))
                          .map((manga) => {
                            const hist = historyMap[manga.id];
                            return (
                              <MangaCard
                                key={manga.id}
                                manga={manga}
                                onSelect={handleOpenMangaDetails}
                                isBookmarked={!!bookmarks[manga.id]}
                                onToggleBookmark={handleToggleBookmark}
                                lastReadChapter={hist?.chapterNumber || null}
                              />
                            );
                          })}
                      </div>
                    )}
                  </section>

                  {/* Section 2: Latest Chapter Releases */}
                  <section className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <Sparkles className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <h2 className="text-xl font-extrabold text-white tracking-tight">
                            Latest Chapter Updates
                          </h2>
                          <p className="text-xs text-slate-400">
                            Freshly scanned chapters ready to read right now {selectedSource !== 'All' ? `• Filtered by ${selectedSource}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                      {latestManga
                        .filter((m) => matchesSource(m, selectedSource))
                        .map((manga) => {
                          const hist = historyMap[manga.id];
                          return (
                            <MangaCard
                              key={manga.id}
                              manga={manga}
                              onSelect={handleOpenMangaDetails}
                              isBookmarked={!!bookmarks[manga.id]}
                              onToggleBookmark={handleToggleBookmark}
                              lastReadChapter={hist?.chapterNumber || null}
                            />
                          );
                        })}
                    </div>
                  </section>

                  {/* Section 3: Highest Rated All-Time */}
                  <section className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
                          <Star className="w-5 h-5 fill-violet-400 text-violet-400" />
                        </div>
                        <div>
                          <h2 className="text-xl font-extrabold text-white tracking-tight">
                            Top Rated of All Time
                          </h2>
                          <p className="text-xs text-slate-400">
                            Critically acclaimed manga sagas {selectedSource !== 'All' ? `• Filtered by ${selectedSource}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                      {topRatedManga
                        .filter((m) => matchesSource(m, selectedSource))
                        .map((manga) => {
                          const hist = historyMap[manga.id];
                          return (
                            <MangaCard
                              key={manga.id}
                              manga={manga}
                              onSelect={handleOpenMangaDetails}
                              isBookmarked={!!bookmarks[manga.id]}
                              onToggleBookmark={handleToggleBookmark}
                              lastReadChapter={hist?.chapterNumber || null}
                            />
                          );
                        })}
                    </div>
                  </section>
                </>
              ) : (
                /* Search / Filter Results for Manga */
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                        <span>Search & Filter Results</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        {searchQuery ? `Showing results for "${searchQuery}"` : `Filtered by ${selectedGenre}`}
                        {selectedSource !== 'All' ? ` • Source: ${selectedSource}` : ''}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedGenre('All');
                        setSelectedSource('All');
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2.5 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 transition-all flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reset Filters</span>
                    </button>
                  </div>

                  {searchingManga ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                      <p className="text-xs text-slate-400">Searching Keiyoushi & Multi-Source Library...</p>
                    </div>
                  ) : searchMangaList.filter((m) => matchesSource(m, selectedSource)).length === 0 ? (
                    <div className="py-24 text-center text-slate-400 text-sm">
                      <p>No manga found matching the active filters.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedGenre('All');
                          setSelectedSource('All');
                        }}
                        className="mt-3 px-4 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 transition-all cursor-pointer"
                      >
                        Clear Active Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                      {searchMangaList
                        .filter((manga) => matchesSource(manga, selectedSource))
                        .map((manga) => (
                          <MangaCard
                            key={manga.id}
                            manga={manga}
                            onSelect={handleOpenMangaDetails}
                            isBookmarked={!!bookmarks[manga.id]}
                            onToggleBookmark={handleToggleBookmark}
                          />
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* --------------------- TAB 2: ANIME HUB --------------------- */}
        {activeTab === 'anime' && (
          <div className="space-y-10 animate-fadeIn">
            {/* If Not Searching: Show Anime Spotlight & Categories */}
            {!searchQuery.trim() ? (
              <>
                {/* Hero Carousel for Anime */}
                {trendingAnime.length > 0 && (
                  <HeroCarousel
                    items={trendingAnime.slice(0, 4)}
                    onSelectAnime={handleSelectAnime}
                    onSelectManga={handleOpenMangaDetails}
                  />
                )}

                {/* Section 1: Trending Anime Right Now */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
                        <TrendingUp className="w-5 h-5 text-rose-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-white tracking-tight">
                          Trending Anime
                        </h2>
                        <p className="text-xs text-slate-400">
                          Most talked-about anime shows streaming right now
                        </p>
                      </div>
                    </div>
                  </div>

                  {loadingAnime ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="aspect-[3/4.2] rounded-2xl bg-slate-900 animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                      {trendingAnime.map((anime) => (
                        <AnimeCard
                          key={anime.id}
                          anime={anime}
                          onSelect={handleSelectAnime}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* Section 2: Popular This Season */}
                <section className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-white tracking-tight">
                          Popular This Season
                        </h2>
                        <p className="text-xs text-slate-400">
                          Currently broadcasting seasonal episodes
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                    {seasonalAnime.map((anime) => (
                      <AnimeCard
                        key={anime.id}
                        anime={anime}
                        onSelect={handleSelectAnime}
                      />
                    ))}
                  </div>
                </section>

                {/* Section 3: All-Time Top Rated Anime */}
                <section className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-white tracking-tight">
                          Top Rated of All Time
                        </h2>
                        <p className="text-xs text-slate-400">
                          Legendary masterpieces and highest scored series
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                    {topAnime.map((anime) => (
                      <AnimeCard
                        key={anime.id}
                        anime={anime}
                        onSelect={handleSelectAnime}
                      />
                    ))}
                  </div>
                </section>
              </>
            ) : (
              /* Anime Search Results */
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Search Anime Results
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Showing results for "{searchQuery}"
                    </p>
                  </div>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    Clear Filter
                  </button>
                </div>

                {searchingAnime ? (
                  <div className="py-24 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                    <p className="text-xs text-slate-400">Searching AniList anime database...</p>
                  </div>
                ) : searchAnimeList.length === 0 ? (
                  <div className="py-24 text-center text-slate-400 text-sm">
                    No anime found matching "{searchQuery}".
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                    {searchAnimeList.map((anime) => (
                      <AnimeCard
                        key={anime.id}
                        anime={anime}
                        onSelect={handleSelectAnime}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --------------------- TAB 3: MY LIBRARY --------------------- */}
        {activeTab === 'library' && (
          <LibraryView
            bookmarks={bookmarks}
            onSelectManga={(id, cover) => handleOpenMangaDetails(id, cover || bookmarks[id]?.coverUrl)}
            onOpenReader={handleOpenReader}
            onRemoveBookmark={handleRemoveBookmark}
            onUpdateStatus={handleSetBookmark}
            onOpenBackup={() => setIsBackupOpen(true)}
          />
        )}

        {/* --------------------- TAB 4: READING HISTORY --------------------- */}
        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onOpenReader={handleOpenReader}
            onOpenMangaDetails={handleOpenHistoryMangaDetails}
            onRefreshHistory={refreshStorageData}
          />
        )}

      </main>

      {/* --------------------- MODALS & FULLSCREEN VIEWS --------------------- */}

      {/* Manga Detail Modal */}
      {selectedMangaId && (
        <MangaDetailModal
          mangaId={selectedMangaId}
          initialCoverUrl={selectedMangaCover}
          onClose={() => {
            setSelectedMangaId(null);
            setSelectedMangaCover('');
          }}
          onOpenReader={handleOpenReader}
          onSelectManga={handleOpenMangaDetails}
          isBookmarked={!!bookmarks[selectedMangaId]}
          bookmarkStatus={getBookmarkStatus(selectedMangaId)}
          onSetBookmark={handleSetBookmark}
          onRemoveBookmark={handleRemoveBookmark}
          lastReadChapter={
            historyMap[selectedMangaId]?.chapterNumber || null
          }
        />
      )}

      {/* Anime Detail Modal */}
      {selectedAnime && (
        <AnimeDetailModal
          anime={selectedAnime}
          onClose={() => setSelectedAnime(null)}
        />
      )}

      {/* Interactive Manga Reader */}
      {readerState.active && (
        <MangaReader
          mangaId={readerState.mangaId}
          chapterId={readerState.chapterId}
          chapterNumber={readerState.chapterNumber}
          mangaTitle={readerState.mangaTitle}
          mangaEnglishTitle={readerState.mangaEnglishTitle}
          coverUrl={readerState.coverUrl}
          onClose={handleCloseReader}
          onGoHome={handleGoHome}
          onChangeChapter={handleChangeChapter}
        />
      )}

      {/* Backup & Restore Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onRefreshData={refreshStorageData}
      />

      {/* Floating Real-Time Update Alert Toast */}
      {activeToast && (
        <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 left-3 sm:left-auto z-50 max-w-sm sm:w-auto bg-[#0c1017]/95 border border-amber-500/40 rounded-2xl shadow-2xl p-4 flex items-center gap-3 backdrop-blur-xl animate-fadeIn text-white">
          <div className="w-12 h-16 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-white/10 shadow-md">
            <img
              src={activeToast.coverUrl}
              alt={activeToast.mangaTitle}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = getFallbackCover(activeToast.mangaTitle);
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-amber-400 text-amber-400 animate-pulse" />
              New Chapter Released
            </span>
            <h4 className="font-bold text-xs text-white truncate mt-0.5" title={activeToast.mangaEnglishTitle || activeToast.mangaTitle}>
              {activeToast.mangaEnglishTitle || activeToast.mangaTitle}
            </h4>
            <p className="text-[11px] text-slate-300 font-medium">
              Chapter {activeToast.chapterNumber} is ready to read!
            </p>
          </div>
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <button
              onClick={() => {
                handleOpenReader(
                  activeToast.mangaId,
                  activeToast.chapterId,
                  activeToast.chapterNumber,
                  activeToast.mangaTitle,
                  activeToast.coverUrl,
                  activeToast.mangaEnglishTitle
                );
                setActiveToast(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center gap-1 transition-all"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Read</span>
            </button>
            <button
              onClick={() => setActiveToast(null)}
              className="text-[10px] text-slate-400 hover:text-slate-200 text-center py-0.5"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-12 mb-20 md:mb-0 text-center text-xs text-slate-500 bg-[#06080c]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 font-['Outfit'] font-bold text-slate-400">
            <img src="/logo.jpg" alt="KuroNeko Logo" className="w-6 h-6 rounded-lg object-cover border border-white/10 shadow-sm" />
            <span>KuroNeko • 黒猫</span>
            <span className="text-slate-600">|</span>
            <span className="font-normal text-slate-500">Manga & Anime Universe</span>
          </div>
          <p>
            Powered by public community APIs (MangaDex REST API & AniList GraphQL) from public-apis.
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Phone-Optimized, Safe-Area aware, Glassmorphism + HUD) */}
      {!readerState.active && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-3xl border-t border-cyan-500/25 px-2 py-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-10px_35px_rgba(0,0,0,0.9)]">
          <div className="grid grid-cols-4 items-center justify-around max-w-md mx-auto">
            {[
              { id: 'manga', label: 'Manga', icon: BookOpen },
              { id: 'anime', label: 'Anime', icon: Film },
              { id: 'library', label: 'Library', icon: Bookmark, badge: Object.keys(bookmarks).length || null },
              { id: 'history', label: 'History', icon: History, badge: history.length || null },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                    isActive
                      ? 'text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(0,245,212,0.7)]' : ''}`} />
                    {tab.badge ? (
                      <span className="absolute -top-1 -right-2 px-1 text-[9px] font-mono font-black rounded-full bg-rose-600 text-white min-w-[14px] text-center border border-white/20">
                        {tab.badge > 99 ? '99+' : tab.badge}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[10px] mt-0.5 tracking-tight font-mono font-medium">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
