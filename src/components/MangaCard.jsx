import React, { memo } from 'react';
import { Bookmark, Star, BookOpen, Check } from 'lucide-react';
import { getFallbackCover, cleanTitle, getReliableCoverUrl } from '../services/mangaApi';

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

  const titleText = cleanTitle(manga.englishTitle || manga.title);
  const originalTitle = cleanTitle(manga.title);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(manga.id, manga.coverUrl)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(manga.id, manga.coverUrl);
        }
      }}
      className="group relative flex flex-col bg-[#0e1320] hover:bg-[#141a2c] rounded-xl overflow-hidden border border-white/[0.08] hover:border-rose-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-black/70 hover:-translate-y-1 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4.4] w-full overflow-hidden bg-slate-950">
        <img
          src={manga.coverUrl}
          alt={titleText}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            const reliable = getReliableCoverUrl(manga.englishTitle || manga.title, null);
            if (reliable && reliable !== e.target.src && !reliable.startsWith('data:')) {
              e.target.src = reliable;
            } else if (manga.rawCoverUrl && e.target.src !== manga.rawCoverUrl && !manga.rawCoverUrl.includes('nocover.jpg')) {
              e.target.src = manga.rawCoverUrl;
            } else {
              e.target.src = getFallbackCover(manga.title);
            }
          }}
        />

        {/* Natural Vignette Gradient for Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090c15] via-[#090c15]/15 to-transparent opacity-90 group-hover:opacity-75 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md shadow-sm ${
              manga.status?.toLowerCase() === 'completed'
                ? 'bg-emerald-600/90 text-white'
                : 'bg-rose-600/90 text-white shadow-rose-600/20'
            }`}>
              {manga.status || 'Ongoing'}
            </span>
            {(() => {
              const src = manga.sourceName || (
                manga.id?.startsWith('flame:') ? 'Flame Comics' :
                manga.id?.startsWith('thunder:') ? 'Thunder Scans' :
                manga.id?.startsWith('asura:') ? 'Asura Scans' :
                manga.id?.startsWith('vortex:') ? 'Vortex Scans' :
                manga.id?.startsWith('wc:') ? 'WeebCentral' :
                manga.id?.startsWith('md:') ? 'MangaDex' :
                manga.id?.startsWith('mk:') ? 'MangaKakalot' :
                manga.id?.startsWith('webtoon:') ? 'Webtoon' : 'MangaPill'
              );
              return (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide backdrop-blur-md bg-slate-900/80 text-slate-200 border border-white/10">
                  {src}
                </span>
              );
            })()}
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            aria-label={isBookmarked ? `Remove ${titleText} from library` : `Save ${titleText} to library`}
            onClick={handleBookmarkClick}
            className={`pointer-events-auto p-1.5 rounded-lg backdrop-blur-md transition-all ${
              isBookmarked
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40 scale-105'
                : 'bg-black/60 text-slate-300 hover:text-white hover:bg-rose-600 hover:scale-105 border border-white/10'
            }`}
            title={isBookmarked ? 'In Library' : 'Bookmark'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Quick Read Hover Action */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="px-3.5 py-1.5 rounded-lg bg-rose-600/95 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transform -translate-y-1 group-hover:translate-y-0 transition-transform">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Read Details</span>
          </div>
        </div>

        {/* Reading Progress Indicator */}
        {lastReadChapter && (
          <div className="absolute bottom-2 left-2 right-2 z-10">
            <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md border border-white/10 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium truncate">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Ch. {lastReadChapter}
              </span>
              <span className="text-slate-400 text-[10px]">
                {readChaptersCount > 0 ? `${readChaptersCount} read` : 'Read'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Manga Information */}
      <div className="p-3 flex flex-col flex-1 justify-between bg-gradient-to-b from-transparent to-[#080b12]">
        <div>
          <h3 
            className="font-semibold text-sm text-slate-100 group-hover:text-rose-400 line-clamp-1 transition-colors tracking-tight leading-snug"
            title={titleText}
          >
            {titleText}
          </h3>
          {manga.englishTitle && manga.englishTitle.toLowerCase() !== manga.title.toLowerCase() ? (
            <p className="text-[11px] text-slate-400 mt-0.5 truncate flex items-center gap-1.5 font-normal" title={originalTitle}>
              <span className="text-slate-300 text-[9px] uppercase px-1 py-0.5 bg-white/5 rounded border border-white/10">JP</span>
              <span className="truncate">{originalTitle}</span>
            </p>
          ) : (
            <p className="text-xs text-slate-400 mt-0.5 truncate flex items-center gap-1">
              <span>{manga.author || 'Manga'}</span>
            </p>
          )}
        </div>

        <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 truncate max-w-[140px]">
            {manga.latestChapter ? (
              <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-white/[0.08] text-[10px] text-slate-200 font-medium truncate flex items-center gap-1" title={`Latest: Chapter ${manga.latestChapter}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                Ch. {manga.latestChapter}
              </span>
            ) : manga.totalChapters ? (
              <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-white/[0.08] text-[10px] text-slate-300 font-medium">
                {manga.totalChapters} Ch
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-slate-300 font-medium">
                {manga.tags && manga.tags[0] ? manga.tags[0] : 'Manga'}
              </span>
            )}
          </div>
          {manga.score && (
            <span className="flex items-center gap-1 text-amber-400 font-medium text-xs flex-shrink-0">
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
