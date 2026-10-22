import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2 } from 'lucide-react';
import { fetchMangaDetails, fetchMangaRecommendations } from '../services/mangaApi';
import { getReadChaptersForManga } from '../services/storage';
import MangaDetailHeader from './manga-detail/MangaDetailHeader';
import MangaDetailChapters from './manga-detail/MangaDetailChapters';
import MangaDetailRecommendations from './manga-detail/MangaDetailRecommendations';

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

  const displayCover = initialCoverUrl || manga?.coverUrl;

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
            <MangaDetailHeader
              manga={manga}
              initialCoverUrl={initialCoverUrl}
              chaptersCount={chapters.length}
              targetStartChapter={targetStartChapter}
              resumeChapterObj={resumeChapterObj}
              latestChapter={latestChapter}
              isBookmarked={isBookmarked}
              bookmarkStatus={bookmarkStatus}
              onClose={onClose}
              onOpenReader={onOpenReader}
              onSetBookmark={onSetBookmark}
              onRemoveBookmark={onRemoveBookmark}
            />

            {/* Chapters & Recommendations Feed Section */}
            <div className="flex-1 p-4 sm:p-6 flex flex-col min-h-0 bg-[#080a0f] pb-[calc(1.2rem+env(safe-area-inset-bottom))] sm:pb-6">
              <MangaDetailChapters
                manga={manga}
                displayCover={displayCover}
                filteredChapters={filteredChapters}
                latestChapter={latestChapter}
                isRefreshing={isRefreshing}
                chapterSearch={chapterSearch}
                setChapterSearch={setChapterSearch}
                chapterSort={chapterSort}
                toggleSort={toggleSort}
                loadingChapters={loadingChapters}
                readChapterIds={readChapterIds}
                lastReadChapter={lastReadChapter}
                loadMangaData={loadMangaData}
                onClose={onClose}
                onOpenReader={onOpenReader}
                formatDate={formatDate}
              />

              <MangaDetailRecommendations
                recommendations={recommendations}
                loadingRecs={loadingRecs}
                onSelectManga={onSelectManga}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
