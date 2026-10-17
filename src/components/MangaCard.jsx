import React from 'react';
import { Bookmark, Star, BookOpen, Check } from 'lucide-react';

export default function MangaCard({
  manga,
  onSelect,
  isBookmarked,
  onToggleBookmark,
  readChaptersCount = 0,
  lastReadChapter = null,
}) {
  if (!manga) return null;

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    if (onToggleBookmark) {
      onToggleBookmark(manga);
    }
  };

  return (
    <div
      onClick={() => onSelect(manga.id)}
      className="group relative flex flex-col bg-slate-900/60 hover:bg-slate-900/90 rounded-2xl overflow-hidden border border-white/5 hover:border-rose-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-950/20 cursor-pointer"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4.2] w-full overflow-hidden bg-slate-950">
        <img
          src={manga.coverUrl}
          alt={manga.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80';
          }}
        />

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-1">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
              manga.status === 'completed'
                ? 'bg-emerald-500/80 text-white'
                : 'bg-rose-600/90 text-white'
            }`}>
              {manga.status || 'Ongoing'}
            </span>
          </div>

          {/* Bookmark Button (Pointer Events Enabled) */}
          <button
            onClick={handleBookmarkClick}
            className={`pointer-events-auto p-1.5 rounded-lg backdrop-blur-md transition-all ${
              isBookmarked
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40'
                : 'bg-black/50 text-slate-300 hover:text-white hover:bg-black/80'
            }`}
            title={isBookmarked ? 'In Library' : 'Add to Library'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Reading Progress Indicator if read */}
        {lastReadChapter && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
            <div className="flex items-center justify-between px-2 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold truncate">
                <Check className="w-3 h-3 text-emerald-400" />
                Ch. {lastReadChapter} read
              </span>
              {readChaptersCount > 1 && (
                <span className="text-slate-400 text-[10px]">
                  {readChaptersCount} chs
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Manga Information */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-100 group-hover:text-rose-400 line-clamp-1 transition-colors">
            {manga.title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {manga.author}
          </p>
        </div>

        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1 truncate max-w-[140px]">
            {manga.tags && manga.tags[0] && (
              <span className="truncate text-slate-400">
                {manga.tags[0]}
              </span>
            )}
          </div>
          {manga.lastChapter && (
            <span className="text-rose-400/90 font-medium">
              Ch. {manga.lastChapter}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
