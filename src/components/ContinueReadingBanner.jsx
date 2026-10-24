import React from 'react';
import { Play, BookOpen, Clock, ChevronRight, X } from 'lucide-react';
import { getFallbackCover, cleanTitle } from '../services/mangaApi';

export default function ContinueReadingBanner({
  lastRead,
  onOpenReader,
  onOpenMangaDetails,
  onDismiss
}) {
  const [currentTimestamp] = React.useState(() => Date.now());

  if (!lastRead) return null;

  const formatDate = (isoString) => {
    if (!isoString) return 'Recently';
    try {
      const date = new Date(isoString);
      const diffMs = currentTimestamp - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl glass-panel-elevated p-4 sm:p-5 border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-slate-900/70 to-slate-950/85 shadow-2xl transition-all hud-corner holo-sheen">
      {/* Background glow orbs */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        
        {/* Left: Thumbnail & Info */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative w-14 h-20 sm:w-16 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden shadow-lg border border-cyan-500/30 group cursor-pointer"
            onClick={() => onOpenMangaDetails(lastRead.mangaId, lastRead.coverUrl)}
          >
            <img
              src={lastRead.coverUrl}
              alt={lastRead.mangaTitle}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = getFallbackCover(lastRead.mangaTitle);
              }}
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                MISSION::ACTIVE
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                <Clock className="w-3 h-3 text-cyan-400/70" />
                {formatDate(lastRead.updatedAt)}
              </span>
            </div>

            <h3 
              onClick={() => onOpenMangaDetails(lastRead.mangaId)}
              className="text-base sm:text-lg font-bold text-white truncate hover:text-cyan-300 cursor-pointer transition-colors"
              title={cleanTitle(lastRead.mangaEnglishTitle || lastRead.mangaTitle)}
            >
              {cleanTitle(lastRead.mangaEnglishTitle || lastRead.mangaTitle)}
            </h3>
            {lastRead.mangaEnglishTitle && lastRead.mangaEnglishTitle.toLowerCase() !== lastRead.mangaTitle.toLowerCase() && (
              <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1 font-medium mt-0.5" title={cleanTitle(lastRead.mangaTitle)}>
                <span className="text-cyan-400 font-mono text-[9px] uppercase px-1 py-0.2 bg-cyan-950/40 rounded border border-cyan-500/30">JP</span>
                <span className="truncate">{cleanTitle(lastRead.mangaTitle)}</span>
              </p>
            )}

            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 flex items-center gap-2 font-mono">
              <span className="text-cyan-300 font-semibold">
                CH::{lastRead.chapterNumber}
              </span>
              {lastRead.chapterTitle && (
                <span className="truncate max-w-[200px] text-slate-500 hidden sm:inline">
                  // {lastRead.chapterTitle}
                </span>
              )}
              {lastRead.currentPage && lastRead.totalPages && lastRead.totalPages > 1 && (
                <span className="text-slate-400 text-xs">
                  (P. {lastRead.currentPage}/{lastRead.totalPages})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={() => onOpenMangaDetails(lastRead.mangaId, lastRead.coverUrl)}
            className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>CONSOLE</span>
          </button>

          <button
            onClick={() =>
              onOpenReader(
                lastRead.mangaId,
                lastRead.chapterId,
                lastRead.chapterNumber,
                lastRead.mangaTitle,
                lastRead.coverUrl
              )
            }
            className="flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white btn-holo shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white group-hover:scale-110 transition-transform" />
            <span>RESUME [▶]</span>
            <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-white/5 transition-all ml-1"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
