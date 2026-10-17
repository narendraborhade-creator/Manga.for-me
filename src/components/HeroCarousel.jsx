import React, { useState, useEffect, useRef } from 'react';
import { Play, BookOpen, Star, Bookmark, ChevronLeft, ChevronRight, Info, Sparkles } from 'lucide-react';

export default function HeroCarousel({
  items = [],
  onSelectManga,
  onSelectAnime,
  isBookmarkedFn,
  onToggleBookmark
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);

  useEffect(() => {
    if (!items || items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [items]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped left -> next
        setCurrentIndex((prev) => (prev + 1) % items.length);
      } else {
        // Swiped right -> prev
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
      }
    }
    touchStartX.current = null;
  };

  if (!items || items.length === 0) return null;

  const current = items[currentIndex];
  if (!current) return null;

  const isManga = !current.episodes; // Anime has episodes
  const isSaved = isBookmarkedFn ? isBookmarkedFn(current.id) : false;

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-[380px] sm:h-[480px] md:h-[540px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 group mb-6 sm:mb-10 select-none touch-pan-y"
    >
      {/* Background Banner with Layered Gradients */}
      <div className="absolute inset-0">
        <img
          src={current.coverUrl}
          alt={current.title}
          className="w-full h-full object-cover object-center filter brightness-[0.55] group-hover:scale-104 transition-transform duration-1000 ease-out"
          onError={(e) => {
            if (current.rawCoverUrl && e.target.src !== current.rawCoverUrl) {
              e.target.src = current.rawCoverUrl;
            } else {
              e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80';
            }
          }}
        />
        {/* Layered Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080a0f] via-[#080a0f]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080a0f] via-[#080a0f]/85 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#080a0f]/80 pointer-events-none" />
      </div>

      {/* Content Container */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-12 flex flex-col justify-end pb-7 sm:pb-14 z-10">
        
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2.5 mb-3">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-600/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isManga ? 'Spotlight Manga' : 'Trending Anime'}</span>
          </span>

          {current.score && current.score !== 'N/A' && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{current.score} / 10</span>
            </span>
          )}

          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-900/80 text-slate-300 border border-white/10 capitalize backdrop-blur-md">
            {current.status?.toLowerCase() || 'Ongoing'}
          </span>

          {current.year && (
            <span className="px-2.5 py-1 rounded-xl text-xs text-slate-300 bg-white/5 border border-white/5 backdrop-blur-md font-medium">
              {current.year}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-1.5 sm:mb-3 line-clamp-2 drop-shadow-lg font-['Outfit']">
          {current.englishTitle || current.title}
        </h1>

        {current.englishTitle && current.englishTitle.toLowerCase() !== current.title.toLowerCase() && (
          <p className="text-[11px] sm:text-sm text-zinc-300 mb-1.5 sm:mb-2 font-medium flex items-center gap-1.5 drop-shadow">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-white/15 text-zinc-200 border border-white/10">JP</span>
            <span className="truncate">{current.title}</span>
          </p>
        )}

        {/* Genres */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-3.5">
          {(current.tags || current.genres || []).slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] sm:text-xs text-slate-200 bg-white/10 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full backdrop-blur-md font-medium border border-white/5"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Synopsis Snippet */}
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl line-clamp-2 sm:line-clamp-3 mb-4 sm:mb-6 leading-relaxed drop-shadow">
          {current.description || 'Follow this thrilling journey as legendary characters fight for destiny in an expansive universe.'}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {isManga ? (
            <button
              onClick={() => onSelectManga(current.id, current.coverUrl)}
              className="px-4 sm:px-7 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 shadow-xl shadow-rose-600/35 hover:shadow-rose-600/50 hover:scale-102 transition-all flex items-center gap-1.5 sm:gap-2 group"
            >
              <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Read Manga Now</span>
            </button>
          ) : (
            <button
              onClick={() => onSelectAnime(current)}
              className="px-4 sm:px-7 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-xl shadow-rose-600/35 hover:shadow-rose-600/50 hover:scale-102 transition-all flex items-center gap-1.5 sm:gap-2 group"
            >
              <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
              <span>Watch Trailer & Details</span>
            </button>
          )}

          {/* Bookmark Button */}
          {onToggleBookmark && isManga && (
            <button
              onClick={() => onToggleBookmark(current)}
              className={`px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold border transition-all flex items-center gap-1.5 sm:gap-2 backdrop-blur-md ${
                isSaved
                  ? 'bg-rose-500/25 border-rose-500/50 text-rose-300 hover:bg-rose-500/35 shadow-lg shadow-rose-500/20'
                  : 'bg-slate-900/80 border-white/15 text-slate-200 hover:bg-white/10'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span className="hidden sm:inline">{isSaved ? 'Bookmarked' : 'Add to Library'}</span>
            </button>
          )}

          {/* View Details */}
          <button
            onClick={() => (isManga ? onSelectManga(current.id, current.coverUrl) : onSelectAnime(current))}
            className="px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 transition-all flex items-center gap-1.5 sm:gap-2"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">Chapter Guide</span>
          </button>
        </div>

      </div>

      {/* Slide Navigation Arrows */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/10 hover:scale-110 hidden sm:block"
        title="Previous"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/10 hover:scale-110 hidden sm:block"
        title="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Progress Dots */}
      <div className="absolute bottom-3 sm:bottom-5 right-4 sm:right-8 flex items-center gap-1.5 sm:gap-2 z-20">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-6 sm:w-8 bg-rose-500 shadow-md shadow-rose-500/50' : 'w-1.5 sm:w-2 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
