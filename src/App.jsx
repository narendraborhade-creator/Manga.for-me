import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  History
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

  // Go Directly to Home Screen from Reader
  const handleGoHome = () => {
    setReaderState((prev) => ({ ...prev, active: false }));
    setSelectedMangaId(null);
    setSelectedAnime(null);
    setActiveTab('manga');
    setSearchQuery('');
    setSelectedGenre('All');
    setSelectedSource('All');
    refreshStorageData();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
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
        {activeTab === 'manga' && (
          <div className="space-y-10 animate-fadeIn">
            {/* If Not Searching: Show Hero Carousel & Categories */}
            {!searchQuery.trim() && selectedGenre === 'All' ? (
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

                {/* Genre Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mr-1 flex-shrink-0">
                    <Filter className="w-3.5 h-3.5 text-rose-500" />
                    <span>Genres:</span>
                  </div>
                  {GENRES.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        selectedGenre === genre
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                          : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>

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
                          Fan favorites and trending masterworks
                        </p>
                      </div>
                    </div>
                  </div>

                  {loadingManga ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="aspect-[3/4.2] rounded-2xl bg-slate-900 animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
                      {popularManga.map((manga) => {
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
                          Freshly scanned chapters ready to read right now
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
                    {latestManga.map((manga) => {
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
                          Critically acclaimed manga sagas
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
                    {topRatedManga.map((manga) => {
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
              /* Search Results for Manga */
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Search Manga Results
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchQuery ? `Showing results for "${searchQuery}"` : `Filtered by ${selectedGenre}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Source Filter Pills */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-white/5">
                      {[
                        { id: 'All', label: 'All Sources' },
                        { id: 'WeebCentral', label: 'WeebCentral' },
                        { id: 'Webtoon', label: 'Webtoons' },
                        { id: 'MangaPill', label: 'MangaPill' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSource(s.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            selectedSource === s.id
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedGenre('All');
                        setSelectedSource('All');
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1"
                    >
                      Clear Filter
                    </button>
                  </div>
                </div>

                {searchingManga ? (
                  <div className="py-24 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                    <p className="text-xs text-slate-400">Searching Keiyoushi & Multi-Source Library...</p>
                  </div>
                ) : searchMangaList.length === 0 ? (
                  <div className="py-24 text-center text-slate-400 text-sm">
                    No manga found matching your query. Try a different title or genre.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
                    {searchMangaList
                      .filter((manga) => {
                        if (selectedSource === 'All') return true;
                        const src = manga.sourceName || (manga.id?.startsWith('wc:') ? 'WeebCentral' : manga.id?.startsWith('webtoon:') ? 'Webtoon' : 'MangaPill');
                        return src.toLowerCase().includes(selectedSource.toLowerCase());
                      })
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
        )}

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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="aspect-[3/4.2] rounded-2xl bg-slate-900 animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
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

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
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

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
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

      {/* Mobile Bottom Navigation Bar (Phone-Optimized, Safe-Area aware) */}
      {!readerState.active && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
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
                      ? 'text-rose-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-rose-500' : ''}`} />
                    {tab.badge ? (
                      <span className="absolute -top-1 -right-2 px-1 text-[9px] font-black rounded-full bg-rose-600 text-white min-w-[14px] text-center">
                        {tab.badge > 99 ? '99+' : tab.badge}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[10px] mt-0.5 tracking-tight font-medium">
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
