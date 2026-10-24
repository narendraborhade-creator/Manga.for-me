import React, { memo } from 'react';
import { Bookmark, Star, BookOpen, Check } from 'lucide-react';
import { getFallbackCover, cleanTitle } from '../services/mangaApi';

function MangaCard({
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
      className="group relative flex flex-col bg-[#0a0f1d]/75 hover:bg-[#10172e] rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-950/40 hover:-translate-y-1 cursor-pointer select-none glass-card hud-corner holo-sheen"
    >
      {/* Cover Image Container with Holographic Vignette */}
      <div className="relative aspect-[3/4.3] w-full overflow-hidden bg-slate-950">
        <img
          src={manga.coverUrl}
          alt={manga.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          onError={(e) => {
            if (manga.rawCoverUrl && e.target.src !== manga.rawCoverUrl) {
              e.target.src = manga.rawCoverUrl;
            } else {
              e.target.src = getFallbackCover(manga.title);
            }
          }}
        />

        {/* Cinematic Holographic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060810] via-[#060810]/20 to-transparent opacity-90 group-hover:opacity-75 transition-opacity" />
        <div className="absolute inset-0 holo-scanlines pointer-events-none opacity-25 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-1 flex-wrap">
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider backdrop-blur-md ${
              manga.status?.toLowerCase() === 'completed'
                ? 'bg-emerald-500/80 text-white'
                : 'bg-rose-600/90 text-white shadow-md shadow-rose-600/30'
            }`}>
              {manga.status || 'Ongoing'}
            </span>
            {(() => {
              const src = manga.sourceName || (
                manga.id?.startsWith('asura:') ? 'Asura' :
                manga.id?.startsWith('vortex:') ? 'Vortex' :
                manga.id?.startsWith('wc:') ? 'WeebCentral' :
                manga.id?.startsWith('webtoon:') ? 'Webtoon' : 'MangaPill'
              );
              const colorClass = 
                src === 'Asura' ? 'bg-violet-600/80 text-violet-100 border-violet-500/40' :
                src === 'Vortex' ? 'bg-indigo-600/80 text-indigo-100 border-indigo-500/40' :
                src === 'Webtoon' ? 'bg-emerald-600/80 text-emerald-100 border-emerald-500/40' :
                'bg-cyan-600/80 text-cyan-100 border-cyan-500/40';
              return (
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-wider backdrop-blur-md border ${colorClass}`}>
                  {src}
                </span>
              );
            })()}
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkClick}
            className={`pointer-events-auto p-1.5 rounded-xl backdrop-blur-md transition-all ${
              isBookmarked
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/50 scale-105'
                : 'bg-black/60 text-slate-300 hover:text-white hover:bg-rose-600 hover:scale-105 border border-white/10'
            }`}
            title={isBookmarked ? 'In Library' : 'Bookmark'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Quick Read Hover Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="px-3.5 py-2 rounded-xl btn-holo text-white text-xs font-mono font-bold shadow-xl flex items-center gap-1.5 scale-90 group-hover:scale-100 transition-transform">
            <BookOpen className="w-4 h-4" />
            <span>ACCESS [▶]</span>
          </div>
        </div>

        {/* Reading Progress Indicator if read */}
        {lastReadChapter && (
          <div className="absolute bottom-2 left-2 right-2 z-10">
            <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md border border-cyan-500/30 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-cyan-300 font-bold truncate">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                Ch. {lastReadChapter}
              </span>
              <span className="text-slate-400 text-[10px]">
                {readChaptersCount > 0 ? `${readChaptersCount} read` : 'Read'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Manga Information with Holographic Title Hover */}
      <div className="p-3.5 flex flex-col flex-1 justify-between bg-gradient-to-b from-transparent to-[#060810]/60">
        <div>
          <h3 
            className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 line-clamp-1 transition-colors tracking-tight"
            title={cleanTitle(manga.englishTitle || manga.title)}
          >
            {cleanTitle(manga.englishTitle || manga.title)}
          </h3>
          {manga.englishTitle && manga.englishTitle.toLowerCase() !== manga.title.toLowerCase() ? (
            <p className="text-[11px] text-zinc-400 mt-0.5 truncate flex items-center gap-1.5 font-medium" title={cleanTitle(manga.title)}>
              <span className="text-cyan-400 font-mono text-[9px] uppercase px-1 py-0.5 bg-cyan-950/40 rounded border border-cyan-500/30">JP</span>
              <span className="truncate">{cleanTitle(manga.title)}</span>
            </p>
          ) : (
            <p className="text-xs text-slate-400 mt-0.5 truncate flex items-center gap-1">
              <span>{manga.author || 'Manga'}</span>
            </p>
          )}
        </div>

        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1 truncate max-w-[120px]">
            <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-slate-300 font-medium font-mono">
              {manga.tags && manga.tags[0] ? manga.tags[0] : 'Manga'}
            </span>
          </div>
          {manga.score && (
            <span className="flex items-center gap-0.5 text-amber-400 font-mono font-bold text-xs">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{manga.score}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(MangaCard);
