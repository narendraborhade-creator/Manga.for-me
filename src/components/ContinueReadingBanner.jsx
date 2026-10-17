import React from 'react';
import { Play, BookOpen, Clock, ChevronRight, X } from 'lucide-react';

export default function ContinueReadingBanner({
  lastRead,
  onOpenReader,
  onOpenMangaDetails,
  onDismiss
}) {
  if (!lastRead) return null;

  const formatDate = (isoString) => {
    if (!isoString) return 'Recently';
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
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
    <div className="relative overflow-hidden rounded-2xl glass-panel p-4 sm:p-5 border border-rose-500/20 bg-gradient-to-r from-rose-950/30 via-slate-900/60 to-slate-950/80 shadow-2xl transition-all">
      {/* Background glow orb */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        
        {/* Left: Thumbnail & Info */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative w-14 h-20 sm:w-16 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden shadow-lg border border-white/10 group cursor-pointer"
            onClick={() => onOpenMangaDetails(lastRead.mangaId)}
          >
            <img
              src={lastRead.coverUrl}
              alt={lastRead.mangaTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80';
              }}
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                Jump Back In
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="w-3 h-3" />
                {formatDate(lastRead.updatedAt)}
              </span>
            </div>

            <h3 
              onClick={() => onOpenMangaDetails(lastRead.mangaId)}
              className="text-base sm:text-lg font-bold text-white truncate hover:text-rose-400 cursor-pointer transition-colors"
            >
              {lastRead.mangaTitle}
            </h3>

            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 flex items-center gap-2">
              <span className="text-rose-400 font-semibold">
                Chapter {lastRead.chapterNumber}
              </span>
              {lastRead.chapterTitle && (
                <span className="truncate max-w-[200px] text-slate-500 hidden sm:inline">
                  • {lastRead.chapterTitle}
                </span>
              )}
              {lastRead.currentPage && lastRead.totalPages && lastRead.totalPages > 1 && (
                <span className="text-slate-500 text-xs">
                  (Page {lastRead.currentPage} of {lastRead.totalPages})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={() => onOpenMangaDetails(lastRead.mangaId)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>All Chapters</span>
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
            className="flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all flex items-center justify-center gap-2 group"
          >
            <Play className="w-3.5 h-3.5 fill-white group-hover:scale-110 transition-transform" />
            <span>Resume Reading</span>
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
