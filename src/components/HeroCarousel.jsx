import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Star, Bookmark, ChevronLeft, ChevronRight, Info, Sparkles } from 'lucide-react';
import { getFallbackCover, cleanTitle, getReliableCoverUrl, fetchLiveCover } from '../services/mangaApi';

export default function HeroCarousel({
  items = [],
  onSelectManga,
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

  const isSaved = isBookmarkedFn ? isBookmarkedFn(current.id) : false;
  const titleText = cleanTitle(current.englishTitle || current.title);
  const originalTitle = cleanTitle(current.title);

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-[380px] sm:h-[460px] md:h-[500px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/[0.08] bg-[#0c101c] group mb-6 sm:mb-10 select-none touch-pan-y"
    >
      {/* Background Banner with Layered Ambient Gradients */}
      <div className="absolute inset-0">
        <img
          src={getReliableCoverUrl(current.title, current.coverUrl)}
          alt={titleText}
          fetchpriority={currentIndex === 0 ? "high" : "auto"}
          loading={currentIndex === 0 ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.45] group-hover:scale-102 transition-transform duration-1000 ease-out"
          onError={async (e) => {
            const target = e.target;
            const title = current.englishTitle || current.title;

            if (target.dataset.fallbackApplied === 'true') {
              return;
            }

            if (current.rawCoverUrl && target.src !== current.rawCoverUrl && !current.rawCoverUrl.includes('nocover')) {
              target.src = current.rawCoverUrl;
              return;
            }

            const reliable = getReliableCoverUrl(title, null);
            if (reliable && target.src !== reliable && !reliable.startsWith('data:')) {
              target.src = reliable;
              return;
            }

            target.dataset.fallbackApplied = 'true';
            try {
              const live = await fetchLiveCover(title);
              if (live && live !== target.src) {
                target.src = live;
                return;
              }
            } catch {}

            target.src = getFallbackCover(current.title, current.author);
          }}
        />
        {/* Layered Vignettes for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090b12] via-[#090b12]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090b12] via-[#090b12]/80 to-transparent w-full md:w-3/4" />
      </div>

      {/* Content Container */}
      <div className="relative h-full max-w-7xl mx-auto px-5 sm:px-12 flex flex-col justify-end pb-7 sm:pb-12 z-10">
        
        {/* Spotlight Pill & Metadata */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-600/90 text-white shadow-md shadow-rose-600/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Featured Title</span>
          </span>

          {current.score && current.score !== 'N/A' && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{current.score}</span>
            </span>
          )}

          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-200 border border-white/10 backdrop-blur-md">
            {current.status || 'Ongoing'}
          </span>

          {current.latestChapter && (
            <span className="px-2.5 py-1 rounded-full text-xs text-slate-300 bg-white/5 border border-white/10 backdrop-blur-md">
              Ch. {current.latestChapter}
            </span>
          )}

          {current.year && (
            <span className="px-2.5 py-1 rounded-full text-xs text-slate-300 bg-white/5 border border-white/10 backdrop-blur-md">
              {current.year}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2 sm:mb-3 line-clamp-2 leading-tight">
          {titleText}
        </h1>

        {current.englishTitle && current.englishTitle.toLowerCase() !== current.title.toLowerCase() && (
          <p className="text-xs sm:text-sm text-slate-300 mb-2 font-normal flex items-center gap-2">
            <span className="text-slate-400 text-xs">Japanese:</span>
            <span className="truncate">{originalTitle}</span>
          </p>
        )}

        {/* Genres */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
          {(current.tags || current.genres || []).slice(0, 4).map((tag, idx) => (
            <span
              key={idx}
              className="text-xs text-slate-300 bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur-md font-medium border border-white/10"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Synopsis Snippet */}
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl line-clamp-2 sm:line-clamp-3 mb-5 leading-relaxed">
          {current.description || 'Follow this thrilling journey as legendary characters fight for destiny in an expansive universe.'}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onSelectManga(current.id, current.coverUrl)}
            className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <BookOpen className="w-4 h-4" />
            <span>Start Reading</span>
          </button>

          {/* Bookmark Button */}
          {onToggleBookmark && (
            <button
              type="button"
              onClick={() => onToggleBookmark(current)}
              aria-label={isSaved ? 'In Library' : 'Add to Library'}
              className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center gap-2 backdrop-blur-md cursor-pointer ${
                isSaved
                  ? 'bg-rose-600/20 border-rose-500/40 text-rose-300 hover:bg-rose-600/30 shadow-md shadow-rose-600/20'
                  : 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span>{isSaved ? 'Bookmarked' : 'Add to Library'}</span>
            </button>
          )}

          {/* View Details */}
          <button
            type="button"
            onClick={() => onSelectManga(current.id, current.coverUrl)}
            className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">Details & Chapters</span>
          </button>
        </div>

      </div>

      {/* Slide Navigation Arrows */}
      <button
        type="button"
        aria-label="Previous featured title"
        onClick={() => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/10 hover:scale-105 hidden sm:block focus-visible:opacity-100 cursor-pointer"
        title="Previous"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        aria-label="Next featured title"
        onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/10 hover:scale-105 hidden sm:block focus-visible:opacity-100 cursor-pointer"
        title="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Pagination Indicators */}
      <div className="absolute bottom-4 right-5 sm:right-10 flex items-center gap-1.5 z-20">
        {items.map((_, idx) => (
          <button
            type="button"
            key={idx}
            aria-label={`Go to slide ${idx + 1}`}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === currentIndex ? 'w-6 bg-rose-500' : 'w-2 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
