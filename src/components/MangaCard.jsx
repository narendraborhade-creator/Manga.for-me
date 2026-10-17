import React from 'react';
import { Bookmark, Star, BookOpen, Check, Play } from 'lucide-react';

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
      onClick={() => onSelect(manga.id, manga.coverUrl)}
      className="group relative flex flex-col bg-[#0b0e14]/80 hover:bg-[#111622] rounded-2xl overflow-hidden border border-white/5 hover:border-rose-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-950/30 hover:-translate-y-1 cursor-pointer select-none"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4.3] w-full overflow-hidden bg-slate-950">
        <img
          src={manga.coverUrl}
          alt={manga.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          onError={(e) => {
            if (manga.rawCoverUrl && e.target.src !== manga.rawCoverUrl) {
              e.target.src = manga.rawCoverUrl;
            } else {
              e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80';
            }
          }}
        />

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/20 to-transparent opacity-90 group-hover:opacity-75 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-1 flex-wrap">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md ${
              manga.status?.toLowerCase() === 'completed'
                ? 'bg-emerald-500/80 text-white'
                : 'bg-rose-600/90 text-white shadow-md shadow-rose-600/30'
            }`}>
              {manga.status || 'Ongoing'}
            </span>
            {(manga.sourceName || (manga.id?.startsWith('wc:') ? 'WeebCentral' : manga.id?.startsWith('webtoon:') ? 'Webtoon' : 'MangaPill')) && (
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider backdrop-blur-md bg-sky-600/80 text-white shadow-sm">
                {manga.sourceName || (manga.id?.startsWith('wc:') ? 'WeebCentral' : manga.id?.startsWith('webtoon:') ? 'Webtoon' : 'MangaPill')}
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkClick}
            className={`pointer-events-auto p-1.5 rounded-xl backdrop-blur-md transition-all ${
              isBookmarked
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/50 scale-105'
                : 'bg-black/50 text-slate-300 hover:text-white hover:bg-rose-600 hover:scale-105 border border-white/10'
            }`}
            title={isBookmarked ? 'In Library' : 'Bookmark'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Quick Read Hover Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xl shadow-rose-600/50 flex items-center gap-1.5 scale-90 group-hover:scale-100 transition-transform">
            <BookOpen className="w-4 h-4" />
            <span>Read Chapters</span>
          </div>
        </div>

        {/* Reading Progress Indicator if read */}
        {lastReadChapter && (
          <div className="absolute bottom-2 left-2 right-2 z-10">
            <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md border border-emerald-500/30 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold truncate">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Ch. {lastReadChapter}
              </span>
              <span className="text-slate-400 text-[10px]">
                Read
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Manga Information */}
      <div className="p-3.5 flex flex-col flex-1 justify-between bg-gradient-to-b from-transparent to-[#0b0e14]/40">
        <div>
          <h3 
            className="font-bold text-sm text-slate-100 group-hover:text-rose-400 line-clamp-1 transition-colors tracking-tight"
            title={manga.englishTitle || manga.title}
          >
            {manga.englishTitle || manga.title}
          </h3>
          {manga.englishTitle && manga.englishTitle.toLowerCase() !== manga.title.toLowerCase() ? (
            <p className="text-[11px] text-zinc-400 mt-0.5 truncate flex items-center gap-1.5 font-medium" title={manga.title}>
              <span className="text-zinc-500 font-mono text-[9px] uppercase px-1 py-0.5 bg-white/5 rounded border border-white/5">JP</span>
              <span className="truncate">{manga.title}</span>
            </p>
          ) : (
            <p className="text-xs text-slate-400 mt-0.5 truncate flex items-center gap-1">
              <span>{manga.author || 'Manga'}</span>
            </p>
          )}
        </div>

        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1 truncate max-w-[120px]">
            <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-slate-300 font-medium">
              {manga.tags && manga.tags[0] ? manga.tags[0] : 'Manga'}
            </span>
          </div>
          {manga.score && (
            <span className="flex items-center gap-0.5 text-amber-400 font-bold text-xs">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{manga.score}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
