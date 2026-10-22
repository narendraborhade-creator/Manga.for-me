import React from 'react';
import { Filter, Flame, Sparkles, Star, Loader2 } from 'lucide-react';
import HeroCarousel from './HeroCarousel';
import MangaCard from './MangaCard';

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

export default function MangaView({
  searchQuery,
  selectedGenre,
  setSelectedGenre,
  selectedSource,
  setSelectedSource,
  setSearchQuery,
  spotlightItems,
  popularManga,
  latestManga,
  topRatedManga,
  loadingManga,
  searchingManga,
  searchMangaList,
  bookmarks,
  historyMap,
  handleOpenMangaDetails,
  handleSelectAnime,
  handleToggleBookmark,
}) {
  if (!searchQuery.trim() && selectedGenre === 'All') {
    return (
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
    );
  }

  /* Search Results for Manga */
  return (
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
  );
}
