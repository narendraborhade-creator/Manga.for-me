import React, { useState, useEffect } from 'react';
import { Play, BookOpen, Star, Bookmark, ChevronLeft, ChevronRight, Info } from 'lucide-react';

export default function HeroCarousel({
  items = [],
  onSelectManga,
  onSelectAnime,
  isBookmarkedFn,
  onToggleBookmark
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!items || items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) return null;

  const current = items[currentIndex];
  if (!current) return null;

  const isManga = !current.episodes; // Anime has episodes
  const isSaved = isBookmarkedFn ? isBookmarkedFn(current.id) : false;

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] md:h-[520px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group mb-8">
      {/* Background Banner with Layered Gradients */}
      <div className="absolute inset-0">
        <img
          src={current.bannerUrl || current.coverUrl}
          alt={current.title}
          className="w-full h-full object-cover object-center filter brightness-[0.6] group-hover:scale-105 transition-transform duration-1000 ease-out"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80';
          }}
        />
        {/* Cinematic Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080a0f] via-[#080a0f]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080a0f] via-[#080a0f]/80 to-transparent w-full md:w-3/4" />
      </div>

      {/* Content Container */}
      <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-10 flex flex-col justify-end pb-8 sm:pb-12 z-10">
        
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider uppercase bg-rose-600 text-white shadow-md shadow-rose-600/30">
            {isManga ? 'Featured Manga' : 'Featured Anime'}
          </span>

          {current.score && current.score !== 'N/A' && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{current.score}</span>
            </span>
          )}

          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900/80 text-slate-300 border border-white/10 capitalize">
            {current.status?.toLowerCase() || 'Ongoing'}
          </span>

          {current.year && (
            <span className="px-2 py-0.5 rounded-md text-xs text-slate-400 bg-white/5">
              {current.year}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-2 sm:mb-3 line-clamp-2 drop-shadow-md">
          {current.title}
        </h1>

        {/* Genres / Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {(current.tags || current.genres || []).slice(0, 4).map((tag, idx) => (
            <span
              key={idx}
              className="text-xs text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Synopsis Snippet */}
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl line-clamp-2 sm:line-clamp-3 mb-5 leading-relaxed drop-shadow">
          {current.description}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          {isManga ? (
            <button
              onClick={() => onSelectManga(current.id)}
              className="px-6 py-2.5 sm:py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-xl shadow-rose-600/30 hover:shadow-rose-500/50 transition-all flex items-center gap-2 group"
            >
              <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Read Manga</span>
            </button>
          ) : (
            <button
              onClick={() => onSelectAnime(current)}
              className="px-6 py-2.5 sm:py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-xl shadow-rose-600/30 hover:shadow-rose-500/50 transition-all flex items-center gap-2 group"
            >
              <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
              <span>Watch Trailer & Details</span>
            </button>
          )}

          {/* Bookmark Button */}
          {onToggleBookmark && isManga && (
            <button
              onClick={() => onToggleBookmark(current)}
              className={`px-4 py-2.5 sm:py-3 rounded-xl text-sm font-semibold border transition-all flex items-center gap-2 ${
                isSaved
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                  : 'bg-slate-900/80 border-white/15 text-slate-200 hover:bg-white/10'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span className="hidden sm:inline">{isSaved ? 'In Library' : 'Bookmark'}</span>
            </button>
          )}

          {/* View Details */}
          <button
            onClick={() => (isManga ? onSelectManga(current.id) : onSelectAnime(current))}
            className="px-4 py-2.5 sm:py-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/10 transition-all flex items-center gap-1.5"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </button>
        </div>

      </div>

      {/* Slide Navigation Arrows */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/10"
        title="Previous"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/10"
        title="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 right-6 flex items-center gap-1.5 z-20">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-6 bg-rose-500' : 'w-2 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
