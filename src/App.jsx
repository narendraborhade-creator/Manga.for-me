import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from './components/Navbar';
import ContinueReadingBanner from './components/ContinueReadingBanner';
import MangaView from './components/MangaView';
import AnimeView from './components/AnimeView';
import LibraryView from './components/LibraryView';
import HistoryView from './components/HistoryView';
import MangaDetailModal from './components/MangaDetailModal';
import AnimeDetailModal from './components/AnimeDetailModal';
import MangaReader from './components/MangaReader';
import BackupModal from './components/BackupModal';
import UpdateToast from './components/UpdateToast';

import { fetchPopularManga, searchManga } from './services/mangaApi';
import { fetchTrendingAnime, fetchTopAnime, fetchSeasonalAnime, searchAnime } from './services/animeApi';
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

export default function App() {
  // Navigation & Search
  const [activeTab, setActiveTab] = useState('manga');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');

  // Storage States
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
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  const [readerState, setReaderState] = useState({
    active: false,
    mangaId: null,
    chapterId: null,
    chapterNumber: null,
    mangaTitle: '',
    mangaEnglishTitle: null,
    coverUrl: '',
  });

  // Manga Data
  const [popularManga, setPopularManga] = useState([]);
  const [latestManga, setLatestManga] = useState([]);
  const [topRatedManga, setTopRatedManga] = useState([]);
  const [searchMangaList, setSearchMangaList] = useState([]);
  const [loadingManga, setLoadingManga] = useState(true);
  const [searchingManga, setSearchingManga] = useState(false);

  // Anime Data
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [topAnime, setTopAnime] = useState([]);
  const [seasonalAnime, setSeasonalAnime] = useState([]);
  const [searchAnimeList, setSearchAnimeList] = useState([]);
  const [loadingAnime, setLoadingAnime] = useState(true);
  const [searchingAnime, setSearchingAnime] = useState(false);

  // Callbacks
  const handleOpenMangaDetails = useCallback((id, coverUrl = '') => {
    setSelectedMangaId(id);
    setSelectedMangaCover(coverUrl);
  }, []);

  const handleSelectAnime = useCallback((anime) => {
    setSelectedAnime(anime);
  }, []);

  const refreshStorageData = useCallback(() => {
    setBookmarks(getBookmarks());
    setHistory(getHistory());
    setLastRead(getLastRead());
    setUpdates(getUpdates());
  }, []);

  // Sync data & load initial storage
  useEffect(() => {
    refreshStorageData();

    if (window.location.hash && window.location.hash.startsWith('#sync_data=')) {
      try {
        const encoded = window.location.hash.replace('#sync_data=', '');
        const jsonStr = decodeDataFromUrl(encoded);
        if (jsonStr && importData(jsonStr)) {
          refreshStorageData();
          window.history.replaceState(null, '', window.location.pathname);
          setActiveToast({
            chapterId: 'sync-complete',
            chapterNumber: 'Sync Success',
            mangaTitle: 'Localhost Data Restored!',
            mangaEnglishTitle: 'Your library bookmarks and reading history were successfully imported to this app.',
            coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&auto=format&fit=crop&q=80',
          });
        }
      } catch (err) {
        console.error('Failed to parse sync data from URL hash:', err);
      }
    }
  }, [refreshStorageData]);

  // Periodic Library Updates Engine
  useEffect(() => {
    let isMounted = true;
    const settings = getUpdateSettings();
    const intervalMs = Math.max((settings.intervalMinutes || 15), 5) * 60 * 1000;

    const runCheck = () => {
      checkAllLibraryUpdates((newDrop) => {
        if (!isMounted) return;
        setActiveToast(newDrop);
        refreshStorageData();
      }).then(() => {
        if (isMounted) refreshStorageData();
      });
    };

    const initialTimer = setTimeout(runCheck, 3500);
    const intervalId = setInterval(runCheck, intervalMs);

    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      clearInterval(intervalId);
    };
  }, [refreshStorageData]);

  // Catalog Fetching
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

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoadingAnime(true);
    Promise.all([fetchTrendingAnime(1, 12), fetchTopAnime(1, 12), fetchSeasonalAnime(1, 12)])
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

    return () => { isMounted = false; };
  }, []);

  // Search Debounce
  useEffect(() => {
    if (!searchQuery.trim() && selectedGenre === 'All') {
      setSearchMangaList([]);
      setSearchAnimeList([]);
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

  // Bookmark handlers
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

  // Reader handlers
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

  const handleChangeChapter = (newChapterId, newChapterNumber) => {
    setReaderState((prev) => ({
      ...prev,
      chapterId: newChapterId,
      chapterNumber: newChapterNumber,
    }));
    refreshStorageData();
  };

  const handleCloseReader = () => {
    setReaderState((prev) => ({ ...prev, active: false }));
    refreshStorageData();
  };

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

  // Memoized maps
  const historyMap = useMemo(() => {
    const map = {};
    history.forEach((entry) => {
      map[entry.mangaId] = entry;
    });
    return map;
  }, [history]);

  const spotlightItems = useMemo(() => [
    ...popularManga.slice(0, 3),
    ...trendingAnime.slice(0, 2),
  ], [popularManga, trendingAnime]);

  const handleOpenHistoryMangaDetails = useCallback((id) => {
    const item = historyMap[id];
    handleOpenMangaDetails(id, item?.coverUrl);
  }, [handleOpenMangaDetails, historyMap]);

  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 sm:py-8 space-y-6 sm:space-y-8">
        {lastRead && !dismissContinueBanner && activeTab !== 'history' && (
          <ContinueReadingBanner
            lastRead={lastRead}
            onOpenReader={handleOpenReader}
            onOpenMangaDetails={(mangaId) => handleOpenMangaDetails(mangaId, lastRead?.coverUrl)}
            onDismiss={() => setDismissContinueBanner(true)}
          />
        )}

        {activeTab === 'manga' && (
          <MangaView
            searchQuery={searchQuery}
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
            selectedSource={selectedSource}
            setSelectedSource={setSelectedSource}
            setSearchQuery={setSearchQuery}
            spotlightItems={spotlightItems}
            popularManga={popularManga}
            latestManga={latestManga}
            topRatedManga={topRatedManga}
            loadingManga={loadingManga}
            searchingManga={searchingManga}
            searchMangaList={searchMangaList}
            bookmarks={bookmarks}
            historyMap={historyMap}
            handleOpenMangaDetails={handleOpenMangaDetails}
            handleSelectAnime={handleSelectAnime}
            handleToggleBookmark={handleToggleBookmark}
          />
        )}

        {activeTab === 'anime' && (
          <AnimeView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            trendingAnime={trendingAnime}
            seasonalAnime={seasonalAnime}
            topAnime={topAnime}
            loadingAnime={loadingAnime}
            searchingAnime={searchingAnime}
            searchAnimeList={searchAnimeList}
            handleSelectAnime={handleSelectAnime}
            handleOpenMangaDetails={handleOpenMangaDetails}
          />
        )}

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

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onOpenReader={handleOpenReader}
            onOpenMangaDetails={handleOpenHistoryMangaDetails}
            onRefreshHistory={refreshStorageData}
          />
        )}
      </main>

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
          lastReadChapter={historyMap[selectedMangaId]?.chapterNumber || null}
        />
      )}

      {selectedAnime && (
        <AnimeDetailModal
          anime={selectedAnime}
          onClose={() => setSelectedAnime(null)}
        />
      )}

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

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onRefreshData={refreshStorageData}
      />

      <UpdateToast
        activeToast={activeToast}
        onOpenReader={handleOpenReader}
        onDismiss={() => setActiveToast(null)}
      />

      <footer className="border-t border-white/5 py-8 mt-12 mb-16 md:mb-0 text-center text-xs text-slate-500 bg-[#06080c]">
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
    </div>
  );
}
