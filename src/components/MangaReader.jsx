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
  Compass,
  RotateCw,
  Gauge,
  Infinity as InfinityIcon
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
  // Loaded chapters in continuous reading sequence
  // Each item: { id, chapter, title, pages: [{ pageNumber, url }] }
  const [loadedChapters, setLoadedChapters] = useState([]);
  const loadedChaptersRef = useRef([]);
  loadedChaptersRef.current = loadedChapters;

  const [allChapters, setAllChapters] = useState([]);
  const allChaptersRef = useRef([]);
  allChaptersRef.current = allChapters;

  const [initialLoading, setInitialLoading] = useState(true);
  const [initialError, setInitialError] = useState(null);

  // Next chapter auto-loading state (continuous stream)
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const isLoadingNextRef = useRef(false);
  const [nextChapterError, setNextChapterError] = useState(null);

  // Previous chapter loading state
  const [isLoadingPrev, setIsLoadingPrev] = useState(false);

  // Active tracking in current viewport
  const [activeChapterId, setActiveChapterId] = useState(chapterId);
  const [activeChapterNumber, setActiveChapterNumber] = useState(chapterNumber);
  const [activePageNumber, setActivePageNumber] = useState(1);
  const [activeTotalPages, setActiveTotalPages] = useState(1);

  const activeChapterIdRef = useRef(chapterId);
  const activePageNumberRef = useRef(1);
  const currentHandledChapterIdRef = useRef(chapterId);

  // Single page mode page tracker
  const [singlePageNum, setSinglePageNum] = useState(1);

  // Settings
  const [settings, setSettings] = useState(() => {
    const saved = getReaderSettings();
    const effectiveGap = (saved.pageGap === 8 || saved.pageGap === 10) ? 0 : (saved.pageGap ?? 0);
    return {
      theme: 'oled',
      readingMode: 'webtoon',
      fitMode: 'full', // Default to 'full' for edge-to-edge phone screen fit
      pageGap: 0,
      readingDirection: 'ltr',
      autoScrollSpeed: 2, // 1 = 45px/s, 2 = 95px/s, 3 = 175px/s, 4 = 280px/s
      continuousScroll: true,
      ...saved,
      pageGap: effectiveGap,
      fitMode: saved.fitMode || 'full',
      autoScrollSpeed: saved.autoScrollSpeed || 2,
    };
  });

  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showChapterMenu, setShowChapterMenu] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  // DOM References
  const containerRef = useRef(null);
  const bottomSentinelRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const autoScrollRef = useRef(null);

  // Auto-hide controls after idle (only if not interacting)
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
      setShowSettingsMenu(false);
      setShowChapterMenu(false);
    }, 4500);
  };

  // Tap reader area: toggle floating controls or pause auto-scrolling
  const handleReaderTap = (e) => {
    if (e.target.closest('button, input, select, a, .glass-panel, [role="dialog"], .glass-nav')) {
      return;
    }
    // If auto-scrolling is active, tapping the screen immediately pauses it
    if (isAutoScrolling) {
      setIsAutoScrolling(false);
      setControlsVisible(true);
      return;
    }
    setControlsVisible((prev) => !prev);
  };

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

  // Scroll to top of container
  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Current active chapter position in allChapters list
  const currentActiveIndex = allChapters.findIndex(
    (c) => String(c.id) === String(activeChapterId)
  );
  const prevChapter = currentActiveIndex > 0 ? allChapters[currentActiveIndex - 1] : null;
  const nextChapter = currentActiveIndex !== -1 && currentActiveIndex < allChapters.length - 1 
    ? allChapters[currentActiveIndex + 1] 
    : null;

  // Next chapter to auto-load at bottom of stream
  const lastLoadedChapter = loadedChapters[loadedChapters.length - 1];
  const lastLoadedIndex = lastLoadedChapter 
    ? allChapters.findIndex((c) => String(c.id) === String(lastLoadedChapter.id))
    : -1;
  const nextChapterToLoad = (lastLoadedIndex !== -1 && lastLoadedIndex < allChapters.length - 1)
    ? allChapters[lastLoadedIndex + 1]
    : null;
  const hasNextChapterToLoad = Boolean(nextChapterToLoad);

  // Previous chapter before the first loaded chapter
  const firstLoadedChapter = loadedChapters[0];
  const firstLoadedIndex = firstLoadedChapter
    ? allChapters.findIndex((c) => String(c.id) === String(firstLoadedChapter.id))
    : -1;
  const prevChapterToLoad = firstLoadedIndex > 0 ? allChapters[firstLoadedIndex - 1] : null;

  // Initial Chapter Load / Prop Change (Only when changed from outside)
  useEffect(() => {
    // If the prop matches the chapter we already loaded or transitioned into, do not re-fetch
    if (chapterId && String(chapterId) === String(currentHandledChapterIdRef.current) && loadedChaptersRef.current.length > 0) {
      return;
    }

    currentHandledChapterIdRef.current = chapterId;
    let isMounted = true;
    setInitialLoading(true);
    setInitialError(null);
    setActiveChapterId(chapterId);
    setActiveChapterNumber(chapterNumber);
    setActivePageNumber(1);
    setSinglePageNum(1);
    setLoadedChapters([]);
    setNextChapterError(null);

    fetchChapterPages(chapterId)
      .then((data) => {
        if (!isMounted) return;
        if (!data || !data.pages || data.pages.length === 0) {
          setInitialError(data?.warning || 'Pages for this chapter are currently synchronizing. Please try refreshing or choosing another chapter.');
          setInitialLoading(false);
          return;
        }

        setLoadedChapters([
          {
            id: chapterId,
            chapter: chapterNumber,
            title: '',
            pages: data.pages || [],
          },
        ]);
        setActiveTotalPages(data.pages?.length || 1);
        setInitialLoading(false);

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
        console.error('Error fetching initial chapter pages:', err);
        setInitialError('Failed to load chapter pages. The chapter might be momentarily busy or unavailable.');
        setInitialLoading(false);
      });

    fetchMangaChapters(mangaId, 'asc')
      .then((chapList) => {
        if (isMounted) {
          setAllChapters(chapList);
          const currentMeta = chapList.find((c) => String(c.id) === String(chapterId));
          if (currentMeta && currentMeta.title) {
            setLoadedChapters((prev) =>
              prev.map((c) => (String(c.id) === String(chapterId) ? { ...c, title: currentMeta.title } : c))
            );
          }
        }
      })
      .catch(console.error);

    return () => {
      isMounted = false;
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (autoScrollRef.current) cancelAnimationFrame(autoScrollRef.current);
    };
  }, [chapterId, chapterNumber, mangaId, coverUrl, mangaEnglishTitle, mangaTitle]);

  // Seamless Next Chapter Auto-loader (Continuous Infinite Scroll)
  const loadNextChapter = useCallback(async () => {
    if (isLoadingNextRef.current) return;
    if (!settings.continuousScroll || settings.readingMode !== 'webtoon') return;

    const currentChaps = loadedChaptersRef.current;
    const allChaps = allChaptersRef.current;
    if (currentChaps.length === 0 || allChaps.length === 0) return;

    const last = currentChaps[currentChaps.length - 1];
    const lastIdx = allChaps.findIndex((c) => String(c.id) === String(last.id));
    if (lastIdx === -1 || lastIdx >= allChaps.length - 1) {
      return;
    }

    const nextChap = allChaps[lastIdx + 1];
    if (currentChaps.some((c) => String(c.id) === String(nextChap.id))) {
      return;
    }

    isLoadingNextRef.current = true;
    setIsLoadingNext(true);
    setNextChapterError(null);

    try {
      const data = await fetchChapterPages(nextChap.id);
      if (!data || !data.pages || data.pages.length === 0) {
        throw new Error(data?.warning || 'Pages for this chapter are currently synchronizing.');
      }

      setLoadedChapters((prev) => {
        if (prev.some((c) => String(c.id) === String(nextChap.id))) return prev;
        return [
          ...prev,
          {
            id: nextChap.id,
            chapter: nextChap.chapter,
            title: nextChap.title || '',
            pages: data.pages,
          },
        ];
      });
    } catch (err) {
      console.error('Failed to auto-load next chapter:', err);
      setNextChapterError({
        chapter: nextChap,
        message: err.message || 'Failed to load chapter',
      });
    } finally {
      isLoadingNextRef.current = false;
      setIsLoadingNext(false);
    }
  }, [settings.continuousScroll, settings.readingMode]);

  // Load Previous Chapter (Prepended seamlessly)
  const loadPrevChapter = async () => {
    if (isLoadingPrev || !prevChapterToLoad) return;
    setIsLoadingPrev(true);

    try {
      const data = await fetchChapterPages(prevChapterToLoad.id);
      if (!data || !data.pages || data.pages.length === 0) {
        throw new Error('Pages unavailable for previous chapter');
      }

      const container = containerRef.current;
      const oldScrollHeight = container ? container.scrollHeight : 0;
      const oldScrollTop = container ? container.scrollTop : 0;

      setLoadedChapters((prev) => [
        {
          id: prevChapterToLoad.id,
          chapter: prevChapterToLoad.chapter,
          title: prevChapterToLoad.title || '',
          pages: data.pages,
        },
        ...prev,
      ]);

      requestAnimationFrame(() => {
        if (container) {
          const heightDiff = container.scrollHeight - oldScrollHeight;
          container.scrollTop = oldScrollTop + heightDiff;
        }
      });
    } catch (err) {
      console.error('Error loading previous chapter:', err);
    } finally {
      setIsLoadingPrev(false);
    }
  };

  // Jump directly to a selected chapter
  const jumpToChapter = (targetChapterId, targetChapterNumber) => {
    setShowChapterMenu(false);

    const existingEl = document.getElementById(`chapter-${targetChapterId}`);
    if (existingEl) {
      existingEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      currentHandledChapterIdRef.current = targetChapterId;
      setActiveChapterId(targetChapterId);
      setActiveChapterNumber(targetChapterNumber);
      if (onChangeChapter) {
        onChangeChapter(targetChapterId, targetChapterNumber);
      }
      return;
    }

    currentHandledChapterIdRef.current = targetChapterId;
    setInitialLoading(true);
    setInitialError(null);
    setLoadedChapters([]);
    setNextChapterError(null);
    setActiveChapterId(targetChapterId);
    setActiveChapterNumber(targetChapterNumber);
    setActivePageNumber(1);
    setSinglePageNum(1);

    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }

    fetchChapterPages(targetChapterId)
      .then((data) => {
        if (!data || !data.pages || data.pages.length === 0) {
          setInitialError(data?.warning || 'Pages for this chapter are currently synchronizing.');
          setInitialLoading(false);
          return;
        }

        const chapMeta = allChaptersRef.current.find((c) => String(c.id) === String(targetChapterId));
        setLoadedChapters([
          {
            id: targetChapterId,
            chapter: targetChapterNumber,
            title: chapMeta?.title || '',
            pages: data.pages,
          },
        ]);
        setActiveTotalPages(data.pages.length);
        setInitialLoading(false);

        recordReadingProgress({
          mangaId,
          mangaTitle,
          mangaEnglishTitle,
          coverUrl,
          chapterId: targetChapterId,
          chapterNumber: targetChapterNumber,
          currentPage: 1,
          totalPages: data.pages.length,
        });

        if (onChangeChapter) {
          onChangeChapter(targetChapterId, targetChapterNumber);
        }
      })
      .catch((err) => {
        console.error('Error jumping to chapter:', err);
        setInitialError('Failed to load chapter pages. Please try again.');
        setInitialLoading(false);
      });
  };

  // Track scroll position in Webtoon mode to update active chapter, page number, and trigger infinite loading
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (settings.readingMode === 'webtoon') {
      // 1. Proactive auto-load when near bottom
      const remaining = container.scrollHeight - (container.scrollTop + container.clientHeight);
      if (remaining < 1800 && settings.continuousScroll) {
        loadNextChapter();
      }

      // 2. Active page & chapter tracking in viewport
      const midY = container.clientHeight / 2;
      const pageEls = container.querySelectorAll('.manga-page');
      for (let i = 0; i < pageEls.length; i++) {
        const el = pageEls[i];
        const rect = el.getBoundingClientRect();
        if (rect.top <= midY && rect.bottom >= midY) {
          const chId = el.getAttribute('data-chapter-id');
          const chNum = el.getAttribute('data-chapter-number');
          const pNum = Number(el.getAttribute('data-page-number'));
          const tot = Number(el.getAttribute('data-total-pages'));

          if (chId && chNum && pNum) {
            if (activeChapterIdRef.current !== chId || activePageNumberRef.current !== pNum) {
              activeChapterIdRef.current = chId;
              activePageNumberRef.current = pNum;
              currentHandledChapterIdRef.current = chId;
              setActiveChapterId(chId);
              setActiveChapterNumber(chNum);
              setActivePageNumber(pNum);
              if (tot) setActiveTotalPages(tot);

              recordReadingProgress({
                mangaId,
                mangaTitle,
                mangaEnglishTitle,
                coverUrl,
                chapterId: chId,
                chapterNumber: chNum,
                currentPage: pNum,
                totalPages: tot || 1,
              });

              if (onChangeChapter && chId !== chapterId) {
                onChangeChapter(chId, chNum);
              }
            }
          }
          break;
        }
      }
    }
  }, [settings.readingMode, settings.continuousScroll, loadNextChapter, mangaId, mangaTitle, mangaEnglishTitle, coverUrl, onChangeChapter, chapterId]);

  // Attach scroll listener to reader container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // IntersectionObserver for Bottom Sentinel (Proactive next chapter auto-fetch)
  useEffect(() => {
    if (!settings.continuousScroll || settings.readingMode !== 'webtoon') return;
    const sentinel = bottomSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadNextChapter();
        }
      },
      {
        root: containerRef.current,
        rootMargin: '1400px',
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadedChapters.length, settings.continuousScroll, settings.readingMode, loadNextChapter]);

  // -------------------------------------------------------------
  // High-Precision Auto-Scroll Engine (Tested for Mobile & Desktop)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isAutoScrolling || settings.readingMode !== 'webtoon') {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
        autoScrollRef.current = null;
      }
      return;
    }

    // Precise speeds in pixels per second:
    // 1x = 45px/s (Relaxed), 2x = 95px/s (Normal), 3x = 175px/s (Fast), 4x = 280px/s (Turbo)
    const speedMap = {
      1: 45,
      2: 95,
      3: 175,
      4: 280,
    };

    const currentSpeedLevel = settings.autoScrollSpeed || 2;
    const pixelsPerSecond = speedMap[currentSpeedLevel] || 95;

    let lastTime = performance.now();
    let scrollAccumulator = 0;
    let running = true;

    const tick = (now) => {
      if (!running) return;

      const deltaSeconds = Math.min((now - lastTime) / 1000, 0.1); // clamp to prevent jumps
      lastTime = now;

      scrollAccumulator += pixelsPerSecond * deltaSeconds;

      if (scrollAccumulator >= 1) {
        const movePixels = Math.floor(scrollAccumulator);
        scrollAccumulator -= movePixels;

        const container = containerRef.current;
        if (container) {
          container.scrollTop += movePixels;

          // Check if approaching bottom to trigger continuous chapter load
          const remainingBottom = container.scrollHeight - (container.scrollTop + container.clientHeight);
          if (remainingBottom < 1600 && hasNextChapterToLoad && !isLoadingNextRef.current) {
            loadNextChapter();
          }
        }

        // Also scroll window in case document is scrolling
        if (typeof window !== 'undefined') {
          window.scrollBy(0, movePixels);
        }
      }

      autoScrollRef.current = requestAnimationFrame(tick);
    };

    autoScrollRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
        autoScrollRef.current = null;
      }
    };
  }, [isAutoScrolling, settings.readingMode, settings.autoScrollSpeed, hasNextChapterToLoad, loadNextChapter]);

  // Single Page Next / Prev helpers
  const handleSinglePageNext = useCallback(() => {
    const currentChapter = loadedChapters[0];
    const totalPages = currentChapter?.pages?.length || 1;
    if (singlePageNum < totalPages) {
      const nextP = singlePageNum + 1;
      setSinglePageNum(nextP);
      setActivePageNumber(nextP);
      recordReadingProgress({
        mangaId,
        mangaTitle,
        mangaEnglishTitle,
        coverUrl,
        chapterId: activeChapterId,
        chapterNumber: activeChapterNumber,
        currentPage: nextP,
        totalPages,
      });
    } else if (nextChapter) {
      jumpToChapter(nextChapter.id, nextChapter.chapter);
    }
  }, [loadedChapters, singlePageNum, nextChapter, mangaId, mangaTitle, mangaEnglishTitle, coverUrl, activeChapterId, activeChapterNumber]);

  const handleSinglePagePrev = useCallback(() => {
    if (singlePageNum > 1) {
      const prevP = singlePageNum - 1;
      setSinglePageNum(prevP);
      setActivePageNumber(prevP);
      recordReadingProgress({
        mangaId,
        mangaTitle,
        mangaEnglishTitle,
        coverUrl,
        chapterId: activeChapterId,
        chapterNumber: activeChapterNumber,
        currentPage: prevP,
        totalPages: activeTotalPages,
      });
    } else if (prevChapter) {
      jumpToChapter(prevChapter.id, prevChapter.chapter);
    }
  }, [singlePageNum, prevChapter, mangaId, mangaTitle, mangaEnglishTitle, coverUrl, activeChapterId, activeChapterNumber, activeTotalPages]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === ' ') {
        if (settings.readingMode === 'single') {
          if (settings.readingDirection === 'rtl') {
            handleSinglePagePrev();
          } else {
            handleSinglePageNext();
          }
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        if (settings.readingMode === 'single') {
          if (settings.readingDirection === 'rtl') {
            handleSinglePageNext();
          } else {
            handleSinglePagePrev();
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
  }, [settings.readingMode, settings.readingDirection, handleSinglePageNext, handleSinglePagePrev, onClose]);

  // Theme background styles
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
      className={`fixed inset-0 z-50 ${themeBg} text-slate-100 overflow-y-auto overscroll-y-contain selection:bg-rose-500 selection:text-white transition-colors duration-300 w-full h-full`}
      style={{ WebkitOverflowScrolling: 'touch' }}
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
                <span>Ch. {activeChapterNumber}</span>
                {activeTotalPages > 0 && (
                  <span className="text-slate-400 font-normal">
                    • {activePageNumber}/{activeTotalPages}
                  </span>
                )}
                {settings.continuousScroll && settings.readingMode === 'webtoon' && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.2 text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md font-mono">
                    <InfinityIcon className="w-2.5 h-2.5" /> Continuous
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Chapter Quick Selector */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              disabled={!prevChapter}
              onClick={() => prevChapter && jumpToChapter(prevChapter.id, prevChapter.chapter)}
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
                <span className="max-w-[80px] sm:max-w-none truncate">Ch. {activeChapterNumber}</span>
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
                      onClick={() => jumpToChapter(ch.id, ch.chapter)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all min-h-[40px] ${
                        String(ch.id) === String(activeChapterId)
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
              onClick={() => nextChapter && jumpToChapter(nextChapter.id, nextChapter.chapter)}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAutoScrolling((prev) => !prev);
                }}
                className={`p-1.5 sm:p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isAutoScrolling 
                    ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30' 
                    : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
                }`}
                title="Toggle Auto-Scroll"
              >
                {isAutoScrolling ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="hidden md:inline">{isAutoScrolling ? 'Auto-Scrolling' : 'Auto-Scroll'}</span>
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

              {/* Reader Settings Modal / Dropdown */}
              {showSettingsMenu && (
                <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto right-auto sm:right-0 top-16 sm:top-full mt-2 w-auto sm:w-84 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 z-50 space-y-4 max-h-[75vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Reader Settings
                    </h4>
                    <button onClick={() => setShowSettingsMenu(false)} className="text-slate-400 hover:text-white sm:hidden text-xs">✕</button>
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

                  {/* Continuous Infinite Chapter Scrolling Toggle */}
                  {settings.readingMode === 'webtoon' && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/70 border border-white/5">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <InfinityIcon className="w-3.5 h-3.5 text-rose-400" />
                          <span>Continuous Scrolling</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Auto-loads next chapter seamlessly (Mihon style)
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateSetting('continuousScroll', !settings.continuousScroll)}
                        className={`w-11 h-6 rounded-full transition-colors relative p-0.5 flex-shrink-0 ${
                          settings.continuousScroll !== false ? 'bg-rose-600' : 'bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            settings.continuousScroll !== false ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Page Container Width / Phone Fit Mode */}
                  <div>
                    <label className="text-xs text-slate-300 block mb-1.5 font-medium flex items-center justify-between">
                      <span>Screen Fit / Page Width</span>
                      <span className="text-[10px] text-rose-400 font-bold uppercase">
                        {settings.fitMode === 'full' ? 'Edge-to-Edge (Phone Fit)' : settings.fitMode === 'wide' ? 'Wide (1020px)' : 'Standard (800px)'}
                      </span>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'full', label: 'Phone Fit (Full)' },
                        { id: 'width', label: '800px' },
                        { id: 'wide', label: '1020px' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => updateSetting('fitMode', item.id)}
                          className={`py-1.5 px-1.5 rounded-lg text-[11px] font-semibold border text-center transition-all ${
                            (settings.fitMode || 'full') === item.id
                              ? 'bg-rose-600 border-rose-500 text-white'
                              : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Auto-scroll Speed Preset */}
                  {settings.readingMode === 'webtoon' && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Gauge className="w-3.5 h-3.5 text-rose-400" />
                          <span>Auto-Scroll Speed</span>
                        </span>
                        <span className="text-rose-400 font-bold">
                          {settings.autoScrollSpeed === 1 ? '1x (Slow)' : settings.autoScrollSpeed === 3 ? '3x (Fast)' : settings.autoScrollSpeed === 4 ? '4x (Turbo)' : '2x (Normal)'}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { val: 1, label: '1x Slow' },
                          { val: 2, label: '2x Normal' },
                          { val: 3, label: '3x Fast' },
                          { val: 4, label: '4x Turbo' },
                        ].map((sp) => (
                          <button
                            key={sp.val}
                            type="button"
                            onClick={() => updateSetting('autoScrollSpeed', sp.val)}
                            className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              (settings.autoScrollSpeed || 2) === sp.val
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

      {/* Main Reading Canvas */}
      <main className="min-h-screen pt-14 sm:pt-16 pb-24 sm:pb-32 w-full flex flex-col items-center justify-start">
        {initialLoading ? (
          <div className="flex flex-col items-center justify-center py-36 gap-3">
            <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
            <p className="text-sm text-slate-300 font-bold">
              Fetching Chapter {chapterNumber} Pages...
            </p>
          </div>
        ) : initialError ? (
          <div className="max-w-md mx-auto p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-center space-y-4 my-auto">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="font-bold text-white">Chapter Unavailable</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{initialError}</p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => jumpToChapter(chapterId, chapterNumber)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white"
              >
                Retry
              </button>
              {nextChapter && (
                <button
                  onClick={() => jumpToChapter(nextChapter.id, nextChapter.chapter)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white"
                >
                  Try Next Chapter
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* 1. Webtoon Mode: Continuous Seamless Stream (Fitted to Phone Screen Width) */}
            {settings.readingMode === 'webtoon' && (
              <div className="w-full flex flex-col items-center">
                
                {/* Optional: Load Previous Chapter Button */}
                {prevChapterToLoad && (
                  <div className="w-full max-w-xl mx-auto py-3 px-4 flex items-center justify-center">
                    <button
                      onClick={loadPrevChapter}
                      disabled={isLoadingPrev}
                      className="px-4 py-2 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-rose-500/40 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-black/40 hover:bg-slate-800 disabled:opacity-50"
                    >
                      {isLoadingPrev ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                      ) : (
                        <ChevronLeft className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      <span>Load Previous: Chapter {prevChapterToLoad.chapter}</span>
                    </button>
                  </div>
                )}

                {/* Chapters Stream */}
                {loadedChapters.map((ch, chIdx) => (
                  <div 
                    key={ch.id} 
                    id={`chapter-${ch.id}`}
                    className="w-full flex flex-col items-center"
                  >
                    {/* Chapter Separator / Continuous Transition Header */}
                    {chIdx > 0 && (
                      <div 
                        id={`chapter-header-${ch.id}`}
                        className="w-full py-8 px-4 flex items-center justify-center select-none"
                      >
                        <div className="flex items-center gap-3 w-full max-w-lg">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-rose-500/30 to-rose-500/60" />
                          <div className="px-4 py-2 rounded-2xl bg-slate-900/90 border border-rose-500/30 shadow-lg shadow-rose-950/50 backdrop-blur-md flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-xs font-bold text-white tracking-wide">
                              Chapter {ch.chapter}
                            </span>
                            {ch.title && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="text-[11px] text-slate-300 font-medium truncate max-w-[150px] sm:max-w-xs">
                                  {ch.title}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-rose-500/30 to-rose-500/60" />
                        </div>
                      </div>
                    )}

                    {/* Pages of Chapter - Fitted to Phone Screen Size */}
                    <div 
                      className={`w-full mx-auto flex flex-col items-center max-sm:w-full max-sm:max-w-full ${
                        settings.fitMode === 'wide'
                          ? 'max-w-4xl'
                          : settings.fitMode === 'width'
                          ? 'max-w-3xl sm:max-w-3xl'
                          : 'max-w-full'
                      }`}
                      style={{ gap: `${settings.pageGap ?? 0}px` }}
                    >
                      {ch.pages.map((p, idx) => (
                        <div
                          key={`${ch.id}-p-${p.pageNumber}`}
                          className="manga-page relative w-full min-w-full max-w-full block p-0 m-0 border-0 shadow-none leading-none select-none text-[0px]"
                          data-chapter-id={ch.id}
                          data-chapter-number={ch.chapter}
                          data-page-number={p.pageNumber}
                          data-total-pages={ch.pages.length}
                          style={
                            (settings.pageGap ?? 0) === 0 && idx > 0
                              ? { marginTop: '-1px' }
                              : {}
                          }
                        >
                          <img
                            src={p.url}
                            alt={`Ch ${ch.chapter} - Page ${p.pageNumber}`}
                            loading={chIdx === 0 && idx < 4 ? 'eager' : 'lazy'}
                            referrerPolicy="no-referrer"
                            className="block w-full min-w-full max-w-full h-auto select-none pointer-events-none p-0 m-0 border-0 outline-none align-bottom object-contain"
                            style={{
                              display: 'block',
                              verticalAlign: 'bottom',
                              width: '100%',
                              minWidth: '100%',
                              maxWidth: '100%',
                              height: 'auto',
                              border: 'none',
                              outline: 'none',
                              margin: 0,
                              padding: 0,
                            }}
                            onError={(e) => {
                              if (!e.target.dataset.retried) {
                                e.target.dataset.retried = 'true';
                                const sep = p.url.includes('?') ? '&' : '?';
                                e.target.src = `${p.url}${sep}_retry=${Date.now()}`;
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Bottom Sentinel: Triggers continuous loading 1400px before reaching the end */}
                {settings.continuousScroll && hasNextChapterToLoad && !nextChapterError && (
                  <div ref={bottomSentinelRef} className="h-12 w-full pointer-events-none opacity-0" />
                )}

                {/* Loading indicator for the Next Chapter */}
                {isLoadingNext && (
                  <div className="w-full py-12 flex flex-col items-center justify-center gap-3 select-none animate-fadeIn">
                    <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                    <span className="text-xs font-semibold text-slate-300">
                      Loading Chapter {nextChapterToLoad?.chapter}...
                    </span>
                  </div>
                )}

                {/* Error handling when auto-loading next chapter fails */}
                {nextChapterError && (
                  <div className="w-full max-w-md mx-auto my-8 p-5 rounded-3xl bg-rose-950/40 border border-rose-500/30 text-center space-y-3 select-none">
                    <AlertCircle className="w-7 h-7 text-rose-400 mx-auto" />
                    <p className="text-xs text-rose-200 font-medium">
                      Failed to load Chapter {nextChapterError.chapter?.chapter}.
                    </p>
                    <button
                      onClick={loadNextChapter}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-600/30 flex items-center gap-2 mx-auto"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Retry Chapter {nextChapterError.chapter?.chapter}</span>
                    </button>
                  </div>
                )}

                {/* End of Manga Series Milestone */}
                {!hasNextChapterToLoad && !isLoadingNext && (
                  <div className="w-full p-8 mt-12 rounded-3xl bg-slate-900/80 border border-white/10 text-center space-y-3 max-w-xl select-none">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                      <Check className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-extrabold text-white">
                      Caught up to the latest chapter!
                    </h3>
                    <p className="text-xs text-slate-400">
                      You've completed Chapter {activeChapterNumber}. All released chapters read!
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all"
                      >
                        Close Reader
                      </button>
                    </div>
                  </div>
                )}

                {/* Fallback button if continuous scrolling is toggled off */}
                {!settings.continuousScroll && (
                  <div className="w-full p-8 mt-12 rounded-3xl bg-slate-900/80 border border-white/10 text-center space-y-4 max-w-xl">
                    <h3 className="text-lg font-extrabold text-white">
                      Completed Chapter {activeChapterNumber}
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      {prevChapter && (
                        <button
                          onClick={() => jumpToChapter(prevChapter.id, prevChapter.chapter)}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Ch. {prevChapter.chapter}</span>
                        </button>
                      )}
                      {nextChapter && (
                        <button
                          onClick={() => jumpToChapter(nextChapter.id, nextChapter.chapter)}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
                        >
                          <span>Next: Chapter {nextChapter.chapter}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Single Page Mode: Fitted to Screen */}
            {settings.readingMode === 'single' && loadedChapters[0]?.pages?.length > 0 && (
              <div className="flex flex-col items-center justify-center w-full max-w-4xl px-0 sm:px-4 select-none my-auto">
                <div 
                  className="relative w-full flex items-center justify-center bg-black/40 sm:rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const isRight = x > rect.width / 2;
                    if (settings.readingDirection === 'rtl') {
                      if (isRight) handleSinglePagePrev();
                      else handleSinglePageNext();
                    } else {
                      if (isRight) handleSinglePageNext();
                      else handleSinglePagePrev();
                    }
                  }}
                >
                  <img
                    src={loadedChapters[0].pages[singlePageNum - 1]?.url}
                    alt={`Page ${singlePageNum}`}
                    referrerPolicy="no-referrer"
                    className="w-full sm:w-auto max-h-[88vh] sm:max-h-[85vh] object-contain mx-auto"
                    style={{
                      display: 'block',
                      width: '100%',
                      maxWidth: '100%',
                      maxHeight: '88vh',
                      objectFit: 'contain'
                    }}
                  />

                  {/* Left / Right click hints */}
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-40 hover:opacity-100 transition-opacity">
                    <ChevronLeft className="w-6 h-6" />
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-40 hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>

                {/* Single Page Slider */}
                <div className="flex items-center gap-4 mt-6 w-full max-w-md px-4">
                  <button
                    disabled={singlePageNum <= 1 && !prevChapter}
                    onClick={handleSinglePagePrev}
                    className="p-2 rounded-xl bg-slate-900 border border-white/10 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <input
                    type="range"
                    min={1}
                    max={loadedChapters[0].pages.length}
                    value={singlePageNum}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      setSinglePageNum(p);
                      setActivePageNumber(p);
                    }}
                    className="flex-1 accent-rose-500 cursor-pointer"
                  />

                  <button
                    disabled={singlePageNum >= loadedChapters[0].pages.length && !nextChapter}
                    onClick={handleSinglePageNext}
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

      {/* Floating Auto-Scroll HUD Controller */}
      {isAutoScrolling && (
        <div className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fadeIn select-none pointer-events-auto">
          <div className="glass-panel px-3 sm:px-4 py-2 rounded-2xl border border-rose-500/40 shadow-2xl shadow-rose-950/60 backdrop-blur-xl flex items-center gap-2 sm:gap-3 bg-slate-900/95 text-white">
            {/* Pulsing indicator */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="hidden xs:inline">Auto-Scroll</span>
              <span>{settings.autoScrollSpeed || 2}x</span>
            </div>

            {/* Quick Speed Switcher */}
            <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-xl border border-white/5">
              {[1, 2, 3, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateSetting('autoScrollSpeed', spd);
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    (settings.autoScrollSpeed || 2) === spd
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={`${spd}x Speed`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Pause / Stop Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsAutoScrolling(false);
              }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-200 hover:text-white transition-all flex items-center gap-1 text-xs font-semibold px-2"
              title="Pause Auto-Scroll"
            >
              <Pause className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Pause</span>
            </button>

            {/* Close HUD */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsAutoScrolling(false);
              }}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Close Auto-Scroll"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Bar (Controls & Progress Indicator) */}
      <div 
        className={`fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100vw-24px)] sm:w-auto transition-all duration-300 ${
          controlsVisible && !isAutoScrolling ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
        }`}
      >
        <div className="glass-panel border border-white/10 rounded-2xl px-3.5 sm:px-5 py-2 sm:py-2.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-between sm:justify-center gap-2 sm:gap-4 text-xs font-semibold">
          {prevChapter && (
            <button
              onClick={() => jumpToChapter(prevChapter.id, prevChapter.chapter)}
              className="text-slate-300 hover:text-white flex items-center gap-1 transition-colors p-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev Chapter</span>
            </button>
          )}

          <div className="px-2.5 sm:px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-200 text-[11px] sm:text-xs">
            Ch. {activeChapterNumber} • Page {activePageNumber} / {activeTotalPages}
          </div>

          {nextChapter && (
            <button
              onClick={() => jumpToChapter(nextChapter.id, nextChapter.chapter)}
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