import React from 'react';
import {
  Infinity as InfinityIcon,
  Clock,
  Battery,
  Bookmark,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  Layers,
  ArrowUp
} from 'lucide-react';

export default function ReaderBottomHud({
  controlsVisible,
  isAutoScrolling,
  mangaTitle,
  mangaEnglishTitle,
  activeChapterNumber,
  settings,
  clockTime,
  batteryLevel,
  bookmarked,
  toggleBookmark,
  showSettingsMenu,
  setShowSettingsMenu,
  setControlsVisible,
  activePageNumber,
  activeTotalPages,
  handlePrevPage,
  handleNextPage,
  scrollToPage,
  prevChapter,
  nextChapter,
  showChapterMenu,
  setShowChapterMenu,
  jumpToChapter,
  handleHome,
  onClose,
  scrollToTop
}) {
  return (
    <div
      className={`fixed bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-16px)] sm:w-auto max-w-xl transition-all duration-300 select-none pointer-events-auto pb-[env(safe-area-inset-bottom)] ${
        controlsVisible && !isAutoScrolling ? 'translate-y-0 opacity-100' : 'translate-y-36 opacity-0 pointer-events-none'
      }`}
    >
      <div className="glass-panel border border-white/15 bg-slate-950/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_12px_45px_rgba(0,0,0,0.85)] flex flex-col gap-2 text-xs font-semibold">

        {/* Header Row: Manga Title, Chapter, Clock & Battery, Settings, Bookmark, Close */}
        <div className="flex items-center justify-between text-[11px] text-slate-300 px-1 border-b border-white/10 pb-1.5 gap-2">
          <div className="min-w-0 flex items-center gap-1.5 truncate">
            <span className="font-bold text-white truncate max-w-[130px] xs:max-w-[200px] sm:max-w-xs" title={mangaEnglishTitle || mangaTitle}>
              {mangaEnglishTitle || mangaTitle}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-rose-400 font-semibold font-mono whitespace-nowrap">
              Ch. {activeChapterNumber}
            </span>
            {settings.continuousScroll && settings.readingMode === 'webtoon' && (
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.2 text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md font-mono">
                <InfinityIcon className="w-2.5 h-2.5" /> Continuous
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Clock & Battery */}
            <div className="hidden xs:flex items-center gap-1.5 text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded-lg bg-white/5 select-none">
              <Clock className="w-3 h-3 text-rose-400" />
              <span>{clockTime}</span>
              {batteryLevel !== null && (
                <>
                  <span className="text-slate-600">•</span>
                  <Battery className="w-3 h-3 text-emerald-400" />
                  <span>{batteryLevel}%</span>
                </>
              )}
            </div>

            {/* Bookmark Toggle */}
            <button
              type="button"
              onClick={toggleBookmark}
              className={`p-1.5 rounded-lg border transition-all ${
                bookmarked
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
              }`}
              title={bookmarked ? 'Saved in Library' : 'Save to Library'}
              aria-label={bookmarked ? 'Saved in Library' : 'Save to Library'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Reader Settings Toggle */}
            <button
              type="button"
              onClick={() => setShowSettingsMenu((prev) => !prev)}
              className={`p-1.5 rounded-lg border transition-all ${
                showSettingsMenu
                  ? 'bg-rose-600 border-rose-500 text-white'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
              }`}
              title="Reader Settings"
              aria-label="Reader Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            {/* Hide Bar */}
            <button
              type="button"
              onClick={() => setControlsVisible(false)}
              className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all"
              title="Hide Bar"
              aria-label="Hide reader bar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Row 1: Interactive Page Scrubber with "Go Back", "Page X of Y", and "Go Front" */}
        {activeTotalPages > 0 && (
          <div className="flex items-center gap-2 sm:gap-3 px-1 py-0.5">
            {/* Go Back Button (Previous Page) */}
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={activePageNumber <= 1 && !prevChapter}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 text-[11px] font-bold flex-shrink-0"
              title="Go Back (Previous Page)"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-rose-400" />
              <span>Go Back</span>
            </button>

            {/* Page Indicator & Scrubber Slider */}
            <div className="flex-1 flex items-center gap-2 min-w-[120px]">
              <input
                type="range"
                min="1"
                max={activeTotalPages || 1}
                value={activePageNumber}
                onChange={(e) => scrollToPage(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500 hover:accent-rose-400"
                aria-label="Page scrubber"
              />
              <span className="text-[11px] font-mono text-rose-400 font-bold whitespace-nowrap bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 flex-shrink-0 shadow-sm">
                Page {activePageNumber} / {activeTotalPages}
              </span>
            </div>

            {/* Go Front Button (Next Page) */}
            <button
              type="button"
              onClick={handleNextPage}
              disabled={activePageNumber >= activeTotalPages && !nextChapter}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 text-[11px] font-bold flex-shrink-0"
              title="Go Front (Next Page)"
            >
              <span>Go Front</span>
              <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
            </button>
          </div>
        )}

        {/* Row 2: Fast Navigation Actions Dock (Home Screen, Details, Prev Chapter, Chapter Menu, Next Chapter) */}
        <div className="flex items-center justify-between sm:justify-center gap-1.5 sm:gap-2.5 pt-1.5 border-t border-white/10">
          {/* Go to Home Screen Button */}
          <button
            type="button"
            onClick={handleHome}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-rose-500/40 text-slate-200 hover:text-white font-bold flex items-center gap-1.5 transition-all text-[11px] sm:text-xs"
            title="Go to Home Screen"
          >
            <Home className="w-3.5 h-3.5 text-rose-400" />
            <span>Home Screen</span>
          </button>

          {/* Go Back Button */}
          <button
            type="button"
            onClick={onClose}
            className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-bold flex items-center gap-1 transition-all text-[11px] sm:text-xs"
            title="Back to Details / Previous View"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {/* Previous Chapter Button */}
          <button
            type="button"
            disabled={!prevChapter}
            onClick={() => prevChapter && jumpToChapter(prevChapter.id, prevChapter.chapter)}
            className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 text-[11px] sm:text-xs font-semibold"
            title="Previous Chapter"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-rose-400" />
            <span className="truncate max-w-[55px] xs:max-w-none">
              Ch. {prevChapter?.chapter || '—'}
            </span>
          </button>

          {/* Chapter Picker Trigger */}
          <button
            type="button"
            onClick={() => setShowChapterMenu(!showChapterMenu)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-rose-500/40 text-slate-200 font-bold flex items-center gap-1.5 transition-all text-[11px] sm:text-xs"
            title="Open Chapter List"
          >
            <Layers className="w-3.5 h-3.5 text-rose-400" />
            <span>Ch. {activeChapterNumber}</span>
          </button>

          {/* Move to Next Chapter (Highlighted Gradient) */}
          <button
            type="button"
            disabled={!nextChapter}
            onClick={() => nextChapter && jumpToChapter(nextChapter.id, nextChapter.chapter)}
            className="px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-rose-600/30 transition-all flex items-center gap-1 text-[11px] sm:text-xs"
            title="Move to Next Chapter"
          >
            <span className="truncate max-w-[70px] xs:max-w-none">
              Next Ch. {nextChapter?.chapter || ''}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Scroll to Top */}
          <button
            type="button"
            onClick={scrollToTop}
            className="p-1.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Scroll to Top"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
