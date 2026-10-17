import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Maximize, 
  Minimize, 
  Sliders, 
  RotateCcw, 
  BookOpen, 
  Layers, 
  Check, 
  ArrowUp,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { fetchChapterPages, fetchMangaChapters } from '../services/mangadexApi';
import { 
  recordReadingProgress, 
  getReaderSettings, 
  saveReaderSettings 
} from '../services/storage';

export default function MangaReader({
  mangaId,
  chapterId,
  chapterNumber,
  mangaTitle,
  coverUrl,
  onClose,
  onChangeChapter
}) {
  const [pages, setPages] = useState([]);
  const [allChapters, setAllChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reader Settings
  const [settings, setSettings] = useState(getReaderSettings());
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showChapterMenu, setShowChapterMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // References
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const pageRefs = useRef([]);

  // Auto-hide controls after idle
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 4000);
  };

  // Load Chapter Pages & Chapters List
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setCurrentPage(1);

    // 1. Fetch Pages
    fetchChapterPages(chapterId, settings.dataSaver)
      .then((data) => {
        if (!isMounted) return;
        setPages(data.pages || []);
        setLoading(false);

        // Record initial reading progress
        recordReadingProgress({
          mangaId,
          mangaTitle,
          coverUrl,
          chapterId,
          chapterNumber,
          currentPage: 1,
          totalPages: data.pages?.length || 1,
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error fetching chapter pages:', err);
        setError('Failed to load chapter pages from MangaDex. The chapter might be unavailable or temporary network issue.');
        setLoading(false);
      });

    // 2. Fetch all chapters for navigation
    fetchMangaChapters(mangaId, 'asc', 500)
      .then((chapList) => {
        if (isMounted) setAllChapters(chapList);
      })
      .catch(console.error);

    return () => {
      isMounted = false;
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [chapterId, mangaId, settings.dataSaver]);

  // Update Settings
  const updateSetting = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveReaderSettings(updated);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(console.error);
      }
      setIsFullscreen(false);
    }
  };

  // Find prev and next chapters
  const currentIndex = allChapters.findIndex((c) => c.id === chapterId);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex !== -1 && currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  // Single Page Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === ' ') {
        if (settings.readingMode === 'single') {
          setCurrentPage((prev) => Math.min(prev + 1, pages.length));
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        if (settings.readingMode === 'single') {
          setCurrentPage((prev) => Math.max(prev - 1, 1));
        }
      } else if (e.key === 'f') {
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.readingMode, pages.length]);

  // Track scroll position in Webtoon mode to update current page and progress
  const handleScroll = useCallback(() => {
    if (settings.readingMode !== 'webtoon' || pages.length === 0) return;

    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;

    for (let i = 0; i < pageRefs.current.length; i++) {
      const el = pageRefs.current[i];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= viewportHeight / 2 && rect.bottom >= viewportHeight / 2) {
          const pageNum = i + 1;
          if (pageNum !== currentPage) {
            setCurrentPage(pageNum);
            recordReadingProgress({
              mangaId,
              mangaTitle,
              coverUrl,
              chapterId,
              chapterNumber,
              currentPage: pageNum,
              totalPages: pages.length,
            });
          }
          break;
        }
      }
    }
  }, [settings.readingMode, pages.length, currentPage, chapterId, chapterNumber, mangaId, mangaTitle, coverUrl]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Scroll to Top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-[#05070a] text-slate-100 overflow-y-auto selection:bg-rose-500 selection:text-white"
    >
      {/* Top Floating Control Bar */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          controlsVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="glass-nav border-b border-white/10 px-4 py-3 max-w-7xl mx-auto flex items-center justify-between gap-3 shadow-2xl">
          
          {/* Left: Back & Manga Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              title="Close Reader"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white truncate max-w-[180px] sm:max-w-md">
                {mangaTitle}
              </h2>
              <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold">
                <span>Chapter {chapterNumber}</span>
                {pages.length > 0 && (
                  <span className="text-slate-400 font-normal">
                    • Page {currentPage} of {pages.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Chapter Quick Selector */}
          <div className="hidden md:flex items-center gap-2">
            <button
              disabled={!prevChapter}
              onClick={() => prevChapter && onChangeChapter(prevChapter.id, prevChapter.chapter)}
              className="p-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Previous Chapter"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowChapterMenu(!showChapterMenu)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2"
              >
                <Layers className="w-3.5 h-3.5 text-rose-400" />
                <span>Chapter {chapterNumber}</span>
              </button>

              {/* Chapter Dropdown List */}
              {showChapterMenu && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 max-h-80 overflow-y-auto bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-2 z-50">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 border-b border-white/5">
                    Jump to Chapter
                  </div>
                  {allChapters.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => {
                        onChangeChapter(ch.id, ch.chapter);
                        setShowChapterMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                        ch.id === chapterId
                          ? 'bg-rose-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span>Chapter {ch.chapter}</span>
                      {ch.title && (
                        <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                          {ch.title}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              disabled={!nextChapter}
              onClick={() => nextChapter && onChangeChapter(nextChapter.id, nextChapter.chapter)}
              className="p-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Next Chapter"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Settings & Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Settings Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className={`p-2 rounded-xl border transition-all ${
                  showSettingsMenu
                    ? 'bg-rose-600 border-rose-500 text-white'
                    : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
                }`}
                title="Reader Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Settings Dropdown */}
              {showSettingsMenu && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 z-50 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
                    Reader Settings
                  </h4>

                  {/* Mode */}
                  <div>
                    <label className="text-xs text-slate-300 block mb-1.5 font-medium">
                      Reading Mode
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => updateSetting('readingMode', 'webtoon')}
                        className={`py-1.5 rounded-lg text-xs font-semibold border ${
                          settings.readingMode === 'webtoon'
                            ? 'bg-rose-600 border-rose-500 text-white'
                            : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        Webtoon (Strip)
                      </button>
                      <button
                        onClick={() => updateSetting('readingMode', 'single')}
                        className={`py-1.5 rounded-lg text-xs font-semibold border ${
                          settings.readingMode === 'single'
                            ? 'bg-rose-600 border-rose-500 text-white'
                            : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        Single Page
                      </button>
                    </div>
                  </div>

                  {/* Max Width */}
                  <div>
                    <label className="text-xs text-slate-300 block mb-1.5 font-medium">
                      Container Width
                    </label>
                    <select
                      value={settings.fitMode || 'width'}
                      onChange={(e) => updateSetting('fitMode', e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 text-slate-200 text-xs rounded-lg p-2 focus:outline-none"
                    >
                      <option value="width">Standard (800px)</option>
                      <option value="wide">Wide (1000px)</option>
                      <option value="full">Full Screen Width</option>
                    </select>
                  </div>

                  {/* Data Saver Mode */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div>
                      <span className="text-xs text-slate-200 font-medium block">
                        Data Saver
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Compressed images
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.dataSaver}
                      onChange={(e) => updateSetting('dataSaver', e.target.checked)}
                      className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition-all hidden sm:block"
              title="Toggle Fullscreen (F)"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="min-h-screen pt-20 pb-28 flex flex-col items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
            <p className="text-sm text-slate-400 font-medium">
              Loading Chapter {chapterNumber}...
            </p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="font-bold text-white">Chapter Unavailable</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{error}</p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => onChangeChapter(chapterId, chapterNumber)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white"
              >
                Retry
              </button>
              {nextChapter && (
                <button
                  onClick={() => onChangeChapter(nextChapter.id, nextChapter.chapter)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white"
                >
                  Try Next Chapter
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Webtoon / Continuous Vertical Strip Mode */}
            {settings.readingMode === 'webtoon' && (
              <div 
                className={`w-full mx-auto flex flex-col items-center ${
                  settings.fitMode === 'wide'
                    ? 'max-w-4xl'
                    : settings.fitMode === 'full'
                    ? 'max-w-full'
                    : 'max-w-3xl'
                }`}
                style={{ gap: `${settings.pageGap || 8}px` }}
              >
                {pages.map((p, idx) => (
                  <div
                    key={p.pageNumber}
                    ref={(el) => (pageRefs.current[idx] = el)}
                    className="relative w-full flex justify-center bg-black/40 overflow-hidden shadow-2xl"
                  >
                    <img
                      src={p.url}
                      alt={`Page ${p.pageNumber}`}
                      loading={idx < 4 ? 'eager' : 'lazy'}
                      className="w-full h-auto object-contain select-none"
                      onError={(e) => {
                        // Fallback URL if primary CDN is slow or blocked
                        if (e.target.src !== p.fallbackUrl) {
                          e.target.src = p.fallbackUrl;
                        }
                      }}
                    />
                    {/* Small page number watermarker */}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-slate-400 backdrop-blur-sm pointer-events-none">
                      {p.pageNumber}
                    </div>
                  </div>
                ))}

                {/* Chapter End & Next Chapter Action Banner */}
                <div className="w-full p-8 mt-12 rounded-3xl bg-slate-900/80 border border-white/10 text-center space-y-4 max-w-xl">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Completed Chapter {chapterNumber}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Your reading progress has been automatically saved!
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    {prevChapter && (
                      <button
                        onClick={() => onChangeChapter(prevChapter.id, prevChapter.chapter)}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Ch. {prevChapter.chapter}</span>
                      </button>
                    )}

                    {nextChapter ? (
                      <button
                        onClick={() => {
                          onChangeChapter(nextChapter.id, nextChapter.chapter);
                          scrollToTop();
                        }}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 transition-all flex items-center justify-center gap-2"
                      >
                        <span>Next: Chapter {nextChapter.chapter}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-xs text-rose-400 font-semibold py-2">
                        🎉 You are caught up to the latest chapter!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Single Page Mode */}
            {settings.readingMode === 'single' && pages.length > 0 && (
              <div className="flex flex-col items-center justify-center w-full max-w-4xl px-4 select-none">
                <div 
                  className="relative w-full max-h-[85vh] flex items-center justify-center bg-black/60 rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    if (x > rect.width / 2) {
                      setCurrentPage((prev) => Math.min(prev + 1, pages.length));
                    } else {
                      setCurrentPage((prev) => Math.max(prev - 1, 1));
                    }
                  }}
                >
                  <img
                    src={pages[currentPage - 1]?.url}
                    alt={`Page ${currentPage}`}
                    className="max-h-[85vh] w-auto object-contain mx-auto"
                    onError={(e) => {
                      if (e.target.src !== pages[currentPage - 1]?.fallbackUrl) {
                        e.target.src = pages[currentPage - 1]?.fallbackUrl;
                      }
                    }}
                  />

                  {/* Left / Right click zone hints */}
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-40 hover:opacity-100 transition-opacity">
                    <ChevronLeft className="w-6 h-6" />
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-40 hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>

                {/* Page Navigation Slider */}
                <div className="flex items-center gap-4 mt-6 w-full max-w-md">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="p-2 rounded-xl bg-slate-900 border border-white/10 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <input
                    type="range"
                    min={1}
                    max={pages.length}
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    className="flex-1 accent-rose-500 cursor-pointer"
                  />

                  <button
                    disabled={currentPage >= pages.length}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pages.length))}
                    className="p-2 rounded-xl bg-slate-900 border border-white/10 disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Bottom Bar (Controls & Progress Indicator) */}
      <div 
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          controlsVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
        }`}
      >
        <div className="glass-panel border border-white/10 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-4 text-xs font-semibold">
          {prevChapter && (
            <button
              onClick={() => onChangeChapter(prevChapter.id, prevChapter.chapter)}
              className="text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev Chapter</span>
            </button>
          )}

          <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-200">
            Page {currentPage} / {pages.length}
          </div>

          {nextChapter && (
            <button
              onClick={() => {
                onChangeChapter(nextChapter.id, nextChapter.chapter);
                scrollToTop();
              }}
              className="text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              <span className="hidden sm:inline">Next Chapter</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={scrollToTop}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Scroll to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
