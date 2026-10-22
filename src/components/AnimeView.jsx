import React from 'react';
import { TrendingUp, Sparkles, Star, Loader2 } from 'lucide-react';
import HeroCarousel from './HeroCarousel';
import AnimeCard from './AnimeCard';

export default function AnimeView({
  searchQuery,
  setSearchQuery,
  trendingAnime,
  seasonalAnime,
  topAnime,
  loadingAnime,
  searchingAnime,
  searchAnimeList,
  handleSelectAnime,
  handleOpenMangaDetails,
}) {
  if (!searchQuery.trim()) {
    return (
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
    );
  }

  /* Anime Search Results */
  return (
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
  );
}
