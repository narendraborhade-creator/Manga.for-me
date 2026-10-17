import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Maximize, 
  Minimize, 
  Play, 
  Pause, 
  Check, 
  ArrowUp,
  Loader2,
  AlertCircle,
  Layers,
  Palette,
  Eye,
  Sliders,
  Compass
} from 'lucide-react';
import { fetchChapterPages, fetchMangaChapters } from '../services/mangaApi';
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
  mangaEnglishTitle = null,
  coverUrl,
  onClose,
  onChangeChapter
}) {
  const [pages, setPages] = useState([]);
  const [allChapters, setAllChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [settings, setSettings] = useState(() => {
    const saved = getReaderSettings();
    const effectiveGap = (saved.pageGap === 8 || saved.pageGap === 10) ? 0 : (saved.pageGap ?? 0);
    return {
      theme: 'oled', // 'oled' | 'obsidian' | 'sepia'
      readingMode: 'webtoon', // 'webtoon' | 'single' | 'double'
      fitMode: 'width', // 'width' | 'wide' | 'full'
      pageGap: 0,
      readingDirection: 'ltr', // 'ltr' | 'rtl'
      autoScrollSpeed: 0, // 0 = off, 1 = slow, 2 = normal, 3 = fast
      ...saved,
      pageGap: effectiveGap,
    };
  });

  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showChapterMenu, setShowChapterMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  // References
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const pageRefs = useRef([]);
  const autoScrollRef = useRef(null);

  // Auto-hide controls after idle
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
      setShowSettingsMenu(false);
      setShowChapterMenu(false);
    }, 4500);
  };

  // Tap on reader area to toggle controls on mobile
  const handleReaderTap = (e) => {
    if (e.target.closest('button, input, select, a, .glass-panel, [role="dialog"], .glass-nav')) {
      return;
    }
    setControlsVisible((prev) => !prev);
  };

  // Load Chapter Pages & Chapters List
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setCurrentPage(1);

    fetchChapterPages(chapterId)
      .then((data) => {
        if (!isMounted) return;
        setPages(data.pages || []);
        setLoading(false);

        recordReadingProgress({
          mangaId,
          mangaTitle,
          mangaEnglishTitle,
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
        setError('Failed to load chapter pages. The chapter might be momentarily busy or unavailable.');
        setLoading(false);
      });

    fetchMangaChapters(mangaId, 'asc')
      .then((chapList) => {
        if (isMounted) setAllChapters(chapList);
      })
      .catch(console.error);

    return () => {
      isMounted = false;
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (autoScrollRef.current) cancelAnimationFrame(autoScrollRef.current);
    };
  }, [chapterId, mangaId]);

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
          if (settings.readingDirection === 'rtl') {
            setCurrentPage((prev) => Math.max(prev - 1, 1));
          } else {
            setCurrentPage((prev) => Math.min(prev + 1, pages.length));
          }
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        if (settings.readingMode === 'single') {
          if (settings.readingDirection === 'rtl') {
            setCurrentPage((prev) => Math.min(prev + 1, pages.length));
          } else {
            setCurrentPage((prev) => Math.max(prev - 1, 1));
          }
        }
      } else if (e.key === 'f') {
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.readingMode, settings.readingDirection, pages.length]);

  // Track scroll position in Webtoon mode to update current page and progress
  const handleScroll = useCallback(() => {
    if (settings.readingMode !== 'webtoon' || pages.length === 0) return;

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
              mangaEnglishTitle,
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
  }, [settings.readingMode, pages.length, currentPage, chapterId, chapterNumber, mangaId, mangaTitle, mangaEnglishTitle, coverUrl]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Auto-Scroll Loop
  useEffect(() => {
    if (!isAutoScrolling || settings.readingMode !== 'webtoon') {
      if (autoScrollRef.current) cancelAnimationFrame(autoScrollRef.current);
      return;
    }

    const speed = settings.autoScrollSpeed === 3 ? 3.5 : settings.autoScrollSpeed === 2 ? 2 : 1;
    let running = true;

    const step = () => {
      if (!running) return;
      window.scrollBy({ top: speed, behavior: 'auto' });
      autoScrollRef.current = requestAnimationFrame(step);
    };

    autoScrollRef.current = requestAnimationFrame(step);

    return () => {
      running = false;
      if (autoScrollRef.current) cancelAnimationFrame(autoScrollRef.current);
    };
  }, [isAutoScrolling, settings.readingMode, settings.autoScrollSpeed]);

  // Scroll to Top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Theme styling classes
  const themeBg = 
    settings.theme === 'oled' 
      ? 'bg-black' 
      : settings.theme === 'sepia' 
      ? 'bg-[#181512]' 
      : 'bg-[#06080e]';

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onClick={handleReaderTap}
      className={`fixed inset-0 z-50 ${themeBg} text-slate-100 overflow-y-auto selection:bg-rose-500 selection:text-white transition-colors duration-300`}
    >
      {/* Top Floating Control Bar */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          controlsVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="glass-nav border-b border-white/10 px-3 sm:px-4 py-2.5 sm:py-3 pt-[calc(0.6rem+env(safe-area-inset-top))] max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 shadow-2xl">
          
          {/* Left: Back & Manga Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white hover:bg-rose-600 transition-all flex-shrink-0"
              title="Close Reader"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-[110px] xs:max-w-[170px] sm:max-w-md" title={mangaEnglishTitle || mangaTitle}>
                {mangaEnglishTitle || mangaTitle}
              </h2>
              {mangaEnglishTitle && mangaEnglishTitle.toLowerCase() !== mangaTitle.toLowerCase() && (
                <div className="text-[10px] text-zinc-400 truncate max-w-[110px] xs:max-w-[150px] sm:max-w-sm hidden xs:block" title={mangaTitle}>
                  {mangaTitle}
                </div>
              )}
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-rose-400 font-semibold">
                <span>Ch. {chapterNumber}</span>
                {pages.length > 0 && (
                  <span className="text-slate-400 font-normal">
                    • {currentPage}/{pages.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Chapter Quick Selector (Mobile & Desktop Responsive) */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              disabled={!prevChapter}
              onClick={() => prevChapter && onChangeChapter(prevChapter.id, prevChapter.chapter)}
              className="p-1.5 px-2 sm:px-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-semibold flex items-center gap-1"
              title="Previous Chapter"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowChapterMenu(!showChapterMenu)}
                className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 sm:gap-2 hover:border-rose-500/40"
              >
                <Layers className="w-3.5 h-3.5 text-rose-400" />
                <span className="max-w-[80px] sm:max-w-none truncate">Ch. {chapterNumber}</span>
              </button>

              {/* Chapter Dropdown List */}
              {showChapterMenu && (
                <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto top-16 sm:top-full sm:left-1/2 sm:-translate-x-1/2 mt-2 w-auto sm:w-72 max-h-[65vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-2 z-50">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 border-b border-white/5 flex items-center justify-between">
                    <span>Jump to Chapter</span>
                    <button onClick={() => setShowChapterMenu(false)} className="text-slate-400 hover:text-white sm:hidden text-xs">✕</button>
                  </div>
                  {allChapters.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => {
                        onChangeChapter(ch.id, ch.chapter);
                        setShowChapterMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all min-h-[40px] ${
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
              className="p-1.5 px-2 sm:px-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-semibold flex items-center gap-1"
              title="Next Chapter"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Right: Auto-Scroll, Settings & Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Auto-scroll toggle (Webtoon mode) */}
            {settings.readingMode === 'webtoon' && (
              <button
                onClick={() => {
                  if (settings.autoScrollSpeed === 0) {
                    updateSetting('autoScrollSpeed', 1);
                  }
                  setIsAutoScrolling(!isAutoScrolling);
                }}
                className={`p-1.5 sm:p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isAutoScrolling 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                    : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
                }`}
                title="Toggle Auto-Scroll"
              >
                {isAutoScrolling ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="hidden md:inline">Auto-Scroll</span>
              </button>
            )}

            {/* Settings Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className={`p-1.5 sm:p-2 rounded-xl border transition-all ${
                  showSettingsMenu
                    ? 'bg-rose-600 border-rose-500 text-white'
                    : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
                }`}
                title="Reader Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Classy Settings Dropdown */}
              {showSettingsMenu && (
                <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto right-auto sm:right-0 top-16 sm:top-full mt-2 w-auto sm:w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 z-50 space-y-4 max-h-[75vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Reader Settings
                    </h4>
                    <button onClick={() => setShowSettingsMenu(false)} className="text-slate-400 hover:text-white sm:hidden text-xs">✕</button>
                  </div>

                  {/* Reading Theme */}
                  <div>
                    <label className="text-xs text-slate-300 block mb-1.5 font-medium flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-rose-400" />
                      <span>Theme Mood</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'oled', label: 'OLED Black', color: '#000000' },
                        { id: 'obsidian', label: 'Obsidian', color: '#080a0f' },
                        { id: 'sepia', label: 'Sepia Paper', color: '#181512' },
                      ].map((th) => (
                        <button
                          key={th.id}
                          onClick={() => updateSetting('theme', th.id)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 ${
                            settings.theme === th.id
                              ? 'bg-rose-600 border-rose-500 text-white'
                              : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: th.color }} />
                          <span>{th.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reading Layout Mode */}
                  <div>
                    <label className="text-xs text-slate-300 block mb-1.5 font-medium flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-rose-400" />
                      <span>Reading Mode</span>
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

                  {/* Direction for Single Page */}
                  {settings.readingMode === 'single' && (
                    <div>
                      <label className="text-xs text-slate-300 block mb-1.5 font-medium">
                        Reading Direction
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => updateSetting('readingDirection', 'ltr')}
                          className={`py-1 rounded-lg text-xs font-semibold border ${
                            settings.readingDirection === 'ltr'
                              ? 'bg-rose-600 border-rose-500 text-white'
                              : 'bg-slate-800 border-white/5 text-slate-400'
                          }`}
                        >
                          Left to Right
                        </button>
                        <button
                          onClick={() => updateSetting('readingDirection', 'rtl')}
                          className={`py-1 rounded-lg text-xs font-semibold border ${
                            settings.readingDirection === 'rtl'
                              ? 'bg-rose-600 border-rose-500 text-white'
                              : 'bg-slate-800 border-white/5 text-slate-400'
                          }`}
                        >
                          Right to Left (JP)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Webtoon Page Spacing */}
                  {settings.readingMode === 'webtoon' && (
                    <div>
                      <label className="text-xs text-slate-300 block mb-1.5 font-medium flex items-center justify-between">
                        <span>Page Spacing</span>
                        <span className="text-rose-400 font-bold">
                          {(settings.pageGap ?? 0) === 0 ? 'Seamless (0px)' : `${settings.pageGap}px`}
                        </span>
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { val: 0, label: 'Seamless' },
                          { val: 6, label: 'Compact' },
                          { val: 14, label: 'Spaced' },
                        ].map((sp) => (
                          <button
                            key={sp.val}
                            type="button"
                            onClick={() => updateSetting('pageGap', sp.val)}
                            className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              (settings.pageGap ?? 0) === sp.val
                                ? 'bg-rose-600 border-rose-500 text-white'
                                : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'
                            }`}
                          >
                            {sp.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Container Width */}
                  <div>
                    <label className="text-xs text-slate-300 block mb-1.5 font-medium">
                      Page Container Width
                    </label>
                    <select
                      value={settings.fitMode || 'width'}
                      onChange={(e) => updateSetting('fitMode', e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 text-slate-200 text-xs rounded-lg p-2 focus:outline-none"
                    >
                      <option value="width">Standard (800px)</option>
                      <option value="wide">Wide (1020px)</option>
                      <option value="full">Edge-to-Edge Full</option>
                    </select>
                  </div>

                  {/* Auto-scroll Speed */}
                  {settings.readingMode === 'webtoon' && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                        <span>Auto-Scroll Speed</span>
                        <span className="text-rose-400 font-bold">{settings.autoScrollSpeed || 1}x</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={3}
                        value={settings.autoScrollSpeed || 1}
                        onChange={(e) => updateSetting('autoScrollSpeed', Number(e.target.value))}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                    </div>
                  )}
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

      {/* Main Reading Area */}
      <main className="min-h-screen pt-20 pb-32 flex flex-col items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-36 gap-3">
            <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
            <p className="text-sm text-slate-300 font-bold">
              Fetching Chapter {chapterNumber} Pages...
            </p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-center space-y-4">
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
            {/* 1. Webtoon Mode */}
            {settings.readingMode === 'webtoon' && (
              <div 
                className={`w-full mx-auto flex flex-col items-center ${
                  settings.fitMode === 'wide'
                    ? 'max-w-4xl'
                    : settings.fitMode === 'full'
                    ? 'max-w-full'
                    : 'max-w-3xl'
                }`}
                style={{ gap: `${settings.pageGap ?? 0}px` }}
              >
                {pages.map((p, idx) => (
                  <div
                    key={p.pageNumber}
                    ref={(el) => (pageRefs.current[idx] = el)}
                    className="relative w-full flex justify-center p-0 m-0 border-0 shadow-none leading-none select-none text-[0px]"
                    style={
                      (settings.pageGap ?? 0) === 0 && idx > 0
                        ? { marginTop: '-1px' }
                        : {}
                    }
                  >
                    <img
                      src={p.url}
                      alt={`Page ${p.pageNumber}`}
                      loading={idx < 5 ? 'eager' : 'lazy'}
                      referrerPolicy="no-referrer"
                      className="block w-full h-auto select-none pointer-events-none p-0 m-0 border-0 outline-none align-bottom"
                      style={{
                        display: 'block',
                        verticalAlign: 'bottom',
                        width: '100%',
                        height: 'auto',
                        border: 'none',
                        outline: 'none',
                      }}
                    />
                  </div>
                ))}

                {/* Chapter End Milestone */}
                <div className="w-full p-8 mt-12 rounded-3xl bg-slate-900/80 border border-white/10 text-center space-y-4 max-w-xl">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-white">
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
                        🎉 Caught up to the latest chapter!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Single Page Mode */}
            {settings.readingMode === 'single' && pages.length > 0 && (
              <div className="flex flex-col items-center justify-center w-full max-w-4xl px-4 select-none">
                <div 
                  className="relative w-full max-h-[85vh] flex items-center justify-center bg-black/50 rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const isRight = x > rect.width / 2;
                    if (settings.readingDirection === 'rtl') {
                      if (isRight) setCurrentPage((prev) => Math.max(prev - 1, 1));
                      else setCurrentPage((prev) => Math.min(prev + 1, pages.length));
                    } else {
                      if (isRight) setCurrentPage((prev) => Math.min(prev + 1, pages.length));
                      else setCurrentPage((prev) => Math.max(prev - 1, 1));
                    }
                  }}
                >
                  <img
                    src={pages[currentPage - 1]?.url}
                    alt={`Page ${currentPage}`}
                    referrerPolicy="no-referrer"
                    className="max-h-[85vh] w-auto object-contain mx-auto"
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
        className={`fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-24px)] sm:w-auto transition-all duration-300 ${
          controlsVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
        }`}
      >
        <div className="glass-panel border border-white/10 rounded-2xl px-3.5 sm:px-5 py-2 sm:py-2.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-between sm:justify-center gap-2 sm:gap-4 text-xs font-semibold">
          {prevChapter && (
            <button
              onClick={() => onChangeChapter(prevChapter.id, prevChapter.chapter)}
              className="text-slate-300 hover:text-white flex items-center gap-1 transition-colors p-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev Chapter</span>
            </button>
          )}

          <div className="px-2.5 sm:px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-200 text-[11px] sm:text-xs">
            Page {currentPage} / {pages.length}
          </div>

          {nextChapter && (
            <button
              onClick={() => {
                onChangeChapter(nextChapter.id, nextChapter.chapter);
                scrollToTop();
              }}
              className="text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors p-1"
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
