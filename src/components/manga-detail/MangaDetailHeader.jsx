import React from 'react';
import { Play, Bookmark, Sparkles } from 'lucide-react';

export default function MangaDetailHeader({
  manga,
  initialCoverUrl,
  chaptersCount,
  targetStartChapter,
  resumeChapterObj,
  latestChapter,
  isBookmarked,
  bookmarkStatus,
  onClose,
  onOpenReader,
  onSetBookmark,
  onRemoveBookmark,
}) {
  const displayCover = initialCoverUrl || manga.coverUrl;
  const sourceName = manga.sourceName || (
    manga.id?.startsWith('asura:') ? 'Asura Scans' :
    manga.id?.startsWith('vortex:') ? 'Vortex Scans' :
    manga.id?.startsWith('wc:') ? 'WeebCentral' :
    manga.id?.startsWith('webtoon:') ? 'Webtoon' : 'MangaPill'
  );

  const sourceColorClass =
    sourceName === 'Asura Scans' ? 'text-violet-400 bg-violet-500/10 border-violet-500/30' :
    sourceName === 'Vortex Scans' ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' :
    sourceName === 'Webtoon' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
    'text-sky-400 bg-sky-500/10 border-sky-500/30';

  return (
    <div className="relative p-5 sm:p-8 bg-gradient-to-b from-slate-900/90 to-[#0c1017] border-b border-white/5 pt-[calc(1.2rem+env(safe-area-inset-top))] sm:pt-8">
      {/* Blurred background cover image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl pointer-events-none"
        style={{ backgroundImage: `url(${displayCover})` }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row gap-5 sm:gap-6 items-center sm:items-start text-center sm:text-left">
        {/* Cover Art */}
        <div className="w-28 sm:w-44 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[3/4.2] bg-slate-950 mx-auto sm:mx-0">
          <img
            src={displayCover}
            alt={manga.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              if (initialCoverUrl && e.target.src !== initialCoverUrl) {
                e.target.src = initialCoverUrl;
              } else {
                e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80';
              }
            }}
          />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mb-2">
            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
              manga.status === 'completed'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {manga.status}
            </span>

            {manga.year && (
              <span className="px-2 py-0.5 rounded-md text-[11px] text-slate-400 bg-white/5 border border-white/5">
                {manga.year}
              </span>
            )}

            <span className="px-2 py-0.5 rounded-md text-[11px] text-slate-400 bg-white/5 border border-white/5">
              {chaptersCount} Chapters
            </span>

            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${sourceColorClass}`}>
              {sourceName}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-1">
            {manga.englishTitle || manga.title}
          </h2>

          {manga.englishTitle && manga.englishTitle.toLowerCase() !== manga.title.toLowerCase() && (
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-white/10 text-zinc-300 border border-white/5 font-semibold">
                Original Title
              </span>
              <span className="text-xs sm:text-sm text-zinc-300 font-medium truncate max-w-xs">
                {manga.title}
              </span>
            </div>
          )}

          <p className="text-xs sm:text-sm text-slate-400 mb-3 flex items-center justify-center sm:justify-start gap-2">
            <span className="text-slate-300 font-medium">By {manga.author}</span>
          </p>

          {/* Tags */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mb-4">
            {(manga.tags || []).map((t, i) => (
              <span key={i} className="text-[11px] text-slate-300 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                {t}
              </span>
            ))}
          </div>

          {/* Action Buttons: Read Now, Read Latest & Bookmark status selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            {targetStartChapter && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReader(
                    manga.id,
                    targetStartChapter.id,
                    targetStartChapter.chapter,
                    manga.title,
                    displayCover,
                    manga.englishTitle || null
                  );
                }}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>
                  {resumeChapterObj ? `Resume Ch. ${resumeChapterObj.chapter}` : `Start Ch. ${targetStartChapter.chapter}`}
                </span>
              </button>
            )}

            {latestChapter && (!targetStartChapter || String(latestChapter.id) !== String(targetStartChapter.id)) && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReader(
                    manga.id,
                    latestChapter.id,
                    latestChapter.chapter,
                    manga.title,
                    displayCover,
                    manga.englishTitle || null
                  );
                }}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 border border-amber-400/30"
              >
                <Sparkles className="w-4 h-4 fill-white text-white" />
                <span>Read Latest (Ch. {latestChapter.chapter})</span>
              </button>
            )}

            {/* Bookmark Status Selector */}
            <div className="relative inline-flex items-center w-full sm:w-auto">
              <select
                value={isBookmarked ? (bookmarkStatus || 'reading') : 'none'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'none') {
                    onRemoveBookmark(manga.id);
                  } else {
                    onSetBookmark(manga.id, manga, val);
                  }
                }}
                className="w-full sm:w-auto appearance-none bg-slate-900 border border-white/10 text-slate-200 text-xs sm:text-sm font-semibold pl-8 pr-8 py-2.5 rounded-xl hover:border-rose-500/40 focus:outline-none focus:border-rose-500 cursor-pointer transition-all"
              >
                <option value="none">Not in Library</option>
                <option value="reading">📖 Reading</option>
                <option value="plan_to_read">📋 Plan to Read</option>
                <option value="completed">✅ Completed</option>
                <option value="on_hold">⏸️ On Hold</option>
                <option value="favorite">⭐ Favorite</option>
              </select>
              <Bookmark className={`w-4 h-4 absolute left-2.5 pointer-events-none ${
                isBookmarked ? 'text-rose-400 fill-rose-400' : 'text-slate-400'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Synopsis */}
      <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-white/5 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-32 overflow-y-auto pr-2">
        <p className="whitespace-pre-line">{manga.description}</p>
      </div>
    </div>
  );
}
