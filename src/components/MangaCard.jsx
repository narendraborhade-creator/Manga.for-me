import React, { memo, useRef } from 'react';
import { Bookmark, Star, BookOpen, Check } from 'lucide-react';
import { getFallbackCover, cleanTitle, getReliableCoverUrl, fetchLiveCover, isMachineId, unwrapProxyUrl } from '../services/mangaApi';

function MangaCard({
  manga,
  onSelect,
  isBookmarked,
  onToggleBookmark,
  readChaptersCount = 0,
  lastReadChapter = null
}) {
  const cardRef = useRef(null);

  if (!manga) return null;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    if (onToggleBookmark) {
      onToggleBookmark(manga);
    }
  };

  let titleText = cleanTitle(manga.englishTitle || manga.title);
  if (isMachineId(titleText)) {
    titleText = cleanTitle(manga.title);
  }
  const originalTitle = cleanTitle(manga.title);

  // Calculate visual reading progress
  const totalCh = parseFloat(manga.latestChapter || manga.totalChapters || 0);
  const currentCh = parseFloat(lastReadChapter || 0);
  const progressPct = totalCh > 0 && currentCh > 0 
    ? Math.min(100, Math.round((currentCh / totalCh) * 100)) 
    : 0;

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onMouseMove={handleMouseMove}
      onClick={() => onSelect(manga.id, manga.coverUrl)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(manga.id, manga.coverUrl);
        }
      }}
      className="group relative flex flex-col bg-[#0b0e18] hover:bg-[#121626] rounded-xl overflow-hidden border border-white/[0.08] hover:border-rose-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-black/80 hover:-translate-y-1.5 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
    >
      {/* 21st.dev Ambient Radial Spotlight on Hover */}
      <div 
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-30"
        style={{
          background: 'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(244, 63, 94, 0.15), transparent 80%)'
        }}
      />

      {/* Cover Image Container */}
      <div className="relative aspect-[3/4.4] w-full overflow-hidden bg-slate-950">
        <img
          src={manga.coverUrl}
          alt={titleText}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
          onError={async (e) => {
            const target = e.target;
            const title = manga.englishTitle || manga.title;

            // Prevent repeated loops if fallback is already applied
            if (target.dataset.fallbackApplied === 'true') {
              return;
            }

            // Step 1: If current src has /api/image-proxy, unwrap and try direct URL
            const unwrapped = unwrapProxyUrl(target.src);
            if (unwrapped && unwrapped !== target.src) {
              target.src = unwrapped;
              return;
            }

            // Step 1b: On Android APK, try native OkHttp bridge directly with proper Referer
            if (!target.dataset.bridgeTried && typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.fetchImageBase64 === 'function') {
              const candidateUrl = unwrapProxyUrl(manga.rawCoverUrl || manga.coverUrl);
              if (candidateUrl && /^https?:\/\//i.test(candidateUrl)) {
                target.dataset.bridgeTried = 'true';
                try {
                  const dataUri = window.AndroidBridge.fetchImageBase64(candidateUrl, '');
                  if (dataUri && dataUri.startsWith('data:image/')) {
                    target.src = dataUri;
                    return;
                  }
                } catch {}
              }
            }

            // Step 2: If raw provider cover exists and wasn't the failing src
            const raw = unwrapProxyUrl(manga.rawCoverUrl);
            if (raw && target.src !== raw && !raw.includes('nocover') && !raw.includes('placeholder')) {
              target.src = raw;
              return;
            }

            // Step 3: Try verified known cover
            const reliable = getReliableCoverUrl(title, null);
            if (reliable && target.src !== reliable && !reliable.startsWith('data:')) {
              target.src = reliable;
              return;
            }

            // Step 4: Try Weserv CDN image proxy for cross-origin loading
            if (raw && !raw.startsWith('data:')) {
              const weserv = `https://images.weserv.nl/?url=${encodeURIComponent(raw)}`;
              if (target.src !== weserv) {
                target.src = weserv;
                return;
              }
            }

            // Step 5: Real-time dynamic fetch from AniList / MangaDex API
            target.dataset.fallbackApplied = 'true';
            try {
              const live = await fetchLiveCover(title);
              if (live && live !== target.src) {
                target.src = live;
                return;
              }
            } catch {}

            // Step 6: Stylized bespoke typographic manga cover (real title, never machine ID)
            target.src = getFallbackCover(manga.title, manga.author);
          }}
        />

        {/* Natural Vignette Gradient for Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080a11] via-[#080a11]/20 to-transparent opacity-90 group-hover:opacity-75 transition-opacity" />

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
                (manga.id?.startsWith('wc:') || /^[0-9a-hjkmnp-tv-z]{26}$/i.test(manga.id || '')) ? 'WeebCentral' :
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

        {/* Quick Read / Details Hover Action Bar */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
          <div className="px-3.5 py-1.5 rounded-xl bg-rose-600/95 text-white text-xs font-semibold shadow-lg shadow-rose-600/40 flex items-center gap-1.5 transform -translate-y-1 group-hover:translate-y-0 transition-transform backdrop-blur-md">
            <BookOpen className="w-3.5 h-3.5" />
            <span>View Chapters</span>
          </div>
          {lastReadChapter && (
            <div className="px-3 py-1 rounded-lg bg-black/80 text-emerald-400 text-[11px] font-medium border border-white/10 backdrop-blur-md flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Read up to Ch. {lastReadChapter}</span>
            </div>
          )}
        </div>

        {/* Mini Reading Progress Bar on bottom edge */}
        {progressPct > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-black/60 z-20 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-rose-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
              title={`Reading progress: ${progressPct}%`}
            />
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
            {progressPct > 0 ? (
              <span className="text-[10px] text-emerald-400 font-semibold">
                {progressPct}%
              </span>
            ) : readChaptersCount > 0 ? (
              <span className="text-[10px] text-emerald-400 font-semibold">
                {readChaptersCount} read
              </span>
            ) : null}
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
