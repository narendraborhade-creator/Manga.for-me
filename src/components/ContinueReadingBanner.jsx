import React, { useState, useEffect, useRef } from 'react';
import { Play, BookOpen, Clock, ChevronRight, ChevronLeft, X, Layers, Trash2 } from 'lucide-react';
import { getFallbackCover, cleanTitle } from '../services/mangaApi';

export default function ContinueReadingBanner({
  lastRead,
  history = [],
  onOpenReader,
  onOpenMangaDetails,
  onDismiss,
  onRemoveFromHistory
}) {
  const [currentTimestamp, setCurrentTimestamp] = useState(() => Date.now());
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(null);

  // Combine lastRead and unique history items to build a comprehensive continue reading list
  const continueItems = React.useMemo(() => {
    const list = [];
    const seen = new Set();

    if (lastRead && lastRead.mangaId) {
      list.push(lastRead);
      seen.add(lastRead.mangaId);
    }

    (history || []).forEach((item) => {
      if (item && item.mangaId && !seen.has(item.mangaId)) {
        seen.add(item.mangaId);
        list.push(item);
      }
    });

    return list.slice(0, 8); // Top 8 active reading titles
  }, [lastRead, history]);

  // Keep active index in bounds
  useEffect(() => {
    if (activeIndex >= continueItems.length) {
      setActiveIndex(Math.max(0, continueItems.length - 1));
    }
  }, [continueItems.length, activeIndex]);

  // Keep relative times fresh
  useEffect(() => {
    const timer = setInterval(() => setCurrentTimestamp(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  if (continueItems.length === 0) return null;

  const currentItem = continueItems[activeIndex] || continueItems[0];
  if (!currentItem) return null;

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

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + continueItems.length) % continueItems.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % continueItems.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  const progressPercent = currentItem.currentPage && currentItem.totalPages && currentItem.totalPages > 1
    ? Math.min(100, Math.max(5, Math.round((currentItem.currentPage / currentItem.totalPages) * 100)))
    : null;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl glass-panel-elevated p-4 sm:p-5 border border-cyan-500/35 bg-gradient-to-r from-cyan-950/30 via-slate-900/80 to-slate-950/90 shadow-2xl transition-all hud-corner holo-sheen select-none"
    >
      {/* Background glow orbs */}
      <div className="absolute -top-12 -right-12 w-56 h-56 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar: status telemetry & carousel pagination */}
      <div className="flex items-center justify-between gap-2 mb-3 relative z-10 border-b border-cyan-500/15 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            CONTINUE_READING // ACTIVE
          </span>
          <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
            <Clock className="w-3 h-3 text-cyan-400/80" />
            {formatDate(currentItem.updatedAt)}
          </span>
        </div>

        {/* Carousel controls if multiple items in history */}
        <div className="flex items-center gap-1.5">
          {continueItems.length > 1 && (
            <div className="flex items-center gap-1 bg-slate-950/80 border border-cyan-500/30 px-2 py-0.5 rounded-xl font-mono text-[10px] text-cyan-300">
              <button
                type="button"
                onClick={handlePrev}
                className="p-0.5 hover:text-white hover:bg-white/10 rounded transition-colors"
                title="Previous continue item"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold px-1">
                {(activeIndex + 1).toString().padStart(2, '0')}/{continueItems.length.toString().padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="p-0.5 hover:text-white hover:bg-white/10 rounded transition-colors"
                title="Next continue item"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick remove from continue shelf */}
          {onRemoveFromHistory && (
            <button
              type="button"
              onClick={() => onRemoveFromHistory(currentItem.mangaId)}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
              title="Remove this title from continue reading"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Close/dismiss banner */}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Dismiss continue reading shelf"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Thumbnail, Titles, Progress Bar & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        
        {/* Left: Thumbnail & Manga Details */}
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
          <div
            className="relative w-14 h-20 sm:w-16 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden shadow-xl border border-cyan-500/40 group cursor-pointer"
            onClick={() => onOpenMangaDetails(currentItem.mangaId, currentItem.coverUrl)}
            title="Open manga details"
          >
            <img
              src={currentItem.coverUrl}
              alt={currentItem.mangaTitle}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
              onError={(e) => {
                e.target.src = getFallbackCover(currentItem.mangaTitle);
              }}
            />
            <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-colors" />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <h3
              onClick={() => onOpenMangaDetails(currentItem.mangaId, currentItem.coverUrl)}
              className="text-base sm:text-lg font-bold text-white truncate hover:text-cyan-300 cursor-pointer transition-colors font-['Outfit']"
              title={cleanTitle(currentItem.mangaEnglishTitle || currentItem.mangaTitle)}
            >
              {cleanTitle(currentItem.mangaEnglishTitle || currentItem.mangaTitle)}
            </h3>

            {currentItem.mangaEnglishTitle && currentItem.mangaEnglishTitle.toLowerCase() !== currentItem.mangaTitle.toLowerCase() && (
              <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1 font-medium" title={cleanTitle(currentItem.mangaTitle)}>
                <span className="text-cyan-400 font-mono text-[9px] uppercase px-1 py-0.2 bg-cyan-950/40 rounded border border-cyan-500/30">ORIGINAL</span>
                <span className="truncate">{cleanTitle(currentItem.mangaTitle)}</span>
              </p>
            )}

            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <span className="text-cyan-300 font-bold px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-500/30">
                CH::{currentItem.chapterNumber}
              </span>
              {currentItem.chapterTitle && (
                <span className="truncate max-w-[200px] text-slate-400 hidden md:inline">
                  // {currentItem.chapterTitle}
                </span>
              )}
              {currentItem.currentPage && currentItem.totalPages && currentItem.totalPages > 1 && (
                <span className="text-slate-400 text-[11px]">
                  (Page {currentItem.currentPage}/{currentItem.totalPages})
                </span>
              )}
            </div>

            {/* Neon Page Progress Bar */}
            {progressPercent !== null && (
              <div className="w-full max-w-xs h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-cyan-500/20 mt-1">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-rose-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-shrink-0">
          <button
            type="button"
            onClick={() => onOpenMangaDetails(currentItem.mangaId, currentItem.coverUrl)}
            className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>CONSOLE</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onOpenReader(
                currentItem.mangaId,
                currentItem.chapterId,
                currentItem.chapterNumber,
                currentItem.mangaTitle,
                currentItem.coverUrl,
                currentItem.mangaEnglishTitle || null
              )
            }
            className="flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white btn-holo shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white group-hover:scale-110 transition-transform" />
            <span>RESUME [▶]</span>
            <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Multi-item thumbnail strip if more than 1 item */}
      {continueItems.length > 1 && (
        <div className="flex items-center gap-2 mt-3.5 pt-2.5 border-t border-white/5 overflow-x-auto scrollbar-none relative z-10">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>SHELF:</span>
          </span>
          {continueItems.map((item, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={item.mangaId}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`flex items-center gap-2 px-2 py-1 rounded-xl text-[11px] font-mono transition-all flex-shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-bold'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-white/5'
                }`}
                title={`Switch to ${item.mangaTitle}`}
              >
                <div className="w-4 h-5 rounded overflow-hidden flex-shrink-0 bg-slate-900">
                  <img
                    src={item.coverUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = getFallbackCover(item.mangaTitle); }}
                  />
                </div>
                <span className="truncate max-w-[110px]">{cleanTitle(item.mangaEnglishTitle || item.mangaTitle)}</span>
                <span className="text-[9px] text-cyan-400 font-bold">Ch.{item.chapterNumber}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
