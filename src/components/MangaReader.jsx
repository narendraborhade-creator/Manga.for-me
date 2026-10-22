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
  Sun,
  Search,
  ArrowUpDown,
  HelpCircle,
  Home,
  Clock,
  Battery,
  Bookmark,
  Smartphone,
  Infinity as InfinityIcon
} from 'lucide-react';
import { fetchChapterPages, fetchMangaChapters } from '../services/mangaApi';
import { 
  recordReadingProgress, 
  getReaderSettings, 
  saveReaderSettings,
  getReadChaptersForManga,
  isBookmarked,
  setBookmark,
  removeBookmark
} from '../services/storage';

export default function MangaReader({
  mangaId,
  chapterId,
  chapterNumber,
  mangaTitle,
  mangaEnglishTitle = null,
  coverUrl,
  onClose,
  onGoHome,
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

  // Read chapters list for checkmark indicators
  const [readChapterIds, setReadChapterIds] = useState([]);
  const [chapterFilter, setChapterFilter] = useState('');
  const [chapterSortAsc, setChapterSortAsc] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleHome = onGoHome || onClose;

  // Bookmarking integration (Mihon & Webtoon quick bookmark)
  const [bookmarked, setBookmarked] = useState(() => mangaId ? isBookmarked(mangaId) : false);

  const toggleBookmark = (e) => {
    e?.stopPropagation?.();
    if (!mangaId) return;
    if (bookmarked) {
      removeBookmark(mangaId);
      setBookmarked(false);
    } else {
      setBookmark(mangaId, {
        id: mangaId,
        title: mangaTitle,
        englishTitle: mangaEnglishTitle,
        coverUrl: coverUrl,
        currentChapter: activeChapterNumber,
        updatedAt: new Date().toISOString(),
      });
      setBookmarked(true);
    }
  };

  // Mihon Header Clock & Battery Indicator
  const [clockTime, setClockTime] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });
  const [batteryLevel, setBatteryLevel] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setClockTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 15000);

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        const updateBat = () => setBatteryLevel(Math.round(battery.level * 100));
        updateBat();
        battery.addEventListener('levelchange', updateBat);
      }).catch(() => {});
    }

    return () => clearInterval(timer);
  }, []);

  // Settings
  const [settings, setSettings] = useState(() => {
    const saved = getReaderSettings() || {};
    const effectiveGap = (saved.pageGap === 8 || saved.pageGap === 10) ? 0 : (saved.pageGap ?? 0);
    return {
      theme: saved.theme || 'oled',
      readingMode: saved.readingMode || 'webtoon',
      fitMode: saved.fitMode || 'full', // Default to 'full' for edge-to-edge phone screen fit
      pageGap: effectiveGap,
      readingDirection: saved.readingDirection || 'ltr',
      autoScrollSpeed: saved.autoScrollSpeed || 2, // 1 = 45px/s, 2 = 95px/s, 3 = 175px/s, 4 = 280px/s
      brightness: saved.brightness ?? 100, // 40 - 100
      continuousScroll: saved.continuousScroll !== undefined ? saved.continuousScroll : true,
      tapZones: saved.tapZones !== undefined ? saved.tapZones : true,
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

  // Auto-hide controls after idle (only if menus are not open)
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (!showSettingsMenu && !showChapterMenu && !showHelpModal) {
        setControlsVisible(false);
      }
    }, 4500);
  };

  // Tap anywhere on any manga page: toggle the options bar
  const handleReaderTap = (e) => {
    if (e.target.closest('button, input, select, a, .glass-panel, [role="dialog"], .glass-nav, .slider-thumb')) {
      return;
    }
    // If auto-scrolling is active, tapping anywhere immediately pauses it and reveals options
    if (isAutoScrolling) {
      setIsAutoScrolling(false);
      setControlsVisible(true);
      return;
    }

    // Toggle options bar on/off anywhere the user clicks on the manga page
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

  // Initial Chapter Load / Prop Change
  useEffect(() => {
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

    // Load read history
    if (mangaId) {
      setReadChapterIds(getReadChaptersForManga(mangaId));
    }

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

  // -------------------------------------------------------------
  // Proactive Lookahead Page Preloader (Instant Scrolling)
  // -------------------------------------------------------------
  useEffect(() => {
    if (loadedChapters.length === 0) return;
    const allPages = loadedChapters.flatMap((ch) => ch.pages || []);
    if (allPages.length === 0) return;

    // Prefetch upcoming 6 pages ahead into browser memory cache
    const currentIdx = allPages.findIndex((p) => p.pageNumber === activePageNumber);
    const start = Math.max(0, currentIdx);
    const end = Math.min(allPages.length, start + 6);

    for (let i = start; i < end; i++) {
      const p = allPages[i];
      if (p?.url) {
        const img = new Image();
        img.src = p.url;
      }
    }
  }, [activeChapterId, activePageNumber, loadedChapters]);

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
  const jumpToChapter = useCallback((targetChapterId, targetChapterNumber) => {
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
  }, [onChangeChapter, mangaId, mangaTitle, mangaEnglishTitle, coverUrl]);

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

      const deltaSeconds = Math.min((now - lastTime) / 1000, 0.1);
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
  }, [loadedChapters, singlePageNum, nextChapter, mangaId, mangaTitle, mangaEnglishTitle, coverUrl, activeChapterId, activeChapterNumber, jumpToChapter]);

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
  }, [singlePageNum, prevChapter, mangaId, mangaTitle, mangaEnglishTitle, coverUrl, activeChapterId, activeChapterNumber, activeTotalPages, jumpToChapter]);

  // Jump directly to a specific page inside the active chapter (Webtoon & Single Page Scrubber)
  const scrollToPage = useCallback((pageNum) => {
    const targetPage = Math.max(1, Math.min(pageNum, activeTotalPages || 1));
    setActivePageNumber(targetPage);

    if (settings.readingMode === 'single') {
      setSinglePageNum(targetPage);
      recordReadingProgress({
        mangaId,
        mangaTitle,
        mangaEnglishTitle,
        coverUrl,
        chapterId: activeChapterId,
        chapterNumber: activeChapterNumber,
        currentPage: targetPage,
        totalPages: activeTotalPages,
      });
      return;
    }

    // Webtoon continuous mode: scroll into view
    const pageEl = document.getElementById(`page-${activeChapterId}-${targetPage}`)
      || document.querySelector(`[data-page-number="${targetPage}"][data-chapter-id="${activeChapterId}"]`);

    if (pageEl) {
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (containerRef.current) {
      const ratio = (targetPage - 1) / Math.max(1, (activeTotalPages - 1));
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight * ratio,
        behavior: 'smooth',
      });
    }
  }, [settings.readingMode, activeTotalPages, activeChapterId, mangaId, mangaTitle, mangaEnglishTitle, coverUrl, activeChapterNumber]);

  // Next Page action (Webtoon scroll step or Single Page step)
  const handleNextPage = useCallback(() => {
    if (settings.readingMode === 'single') {
      handleSinglePageNext();
    } else {
      if (activePageNumber < activeTotalPages) {
        scrollToPage(activePageNumber + 1);
      } else if (nextChapter) {
        jumpToChapter(nextChapter.id, nextChapter.chapter);
      }
    }
  }, [settings.readingMode, handleSinglePageNext, activePageNumber, activeTotalPages, scrollToPage, nextChapter, jumpToChapter]);

  // Previous Page action (Webtoon scroll step or Single Page step)
  const handlePrevPage = useCallback(() => {
    if (settings.readingMode === 'single') {
      handleSinglePagePrev();
    } else {
      if (activePageNumber > 1) {
        scrollToPage(activePageNumber - 1);
      } else if (prevChapter) {
        jumpToChapter(prevChapter.id, prevChapter.chapter);
      }
    }
  }, [settings.readingMode, handleSinglePagePrev, activePageNumber, scrollToPage, prevChapter, jumpToChapter]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

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
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 's' || e.key === 'S') {
        setShowSettingsMenu((prev) => !prev);
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        setShowHelpModal((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (showHelpModal) setShowHelpModal(false);
        else if (showSettingsMenu) setShowSettingsMenu(false);
        else if (showChapterMenu) setShowChapterMenu(false);
        else onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.readingMode, settings.readingDirection, handleSinglePageNext, handleSinglePagePrev, onClose, showHelpModal, showSettingsMenu, showChapterMenu]);

  // Theme background styles
  const themeBg = 
    settings.theme === 'oled' 
      ? 'bg-black' 
      : settings.theme === 'sepia' 
      ? 'bg-[#181512]' 
      : 'bg-[#06080e]';

  // Reading progress percentage
  const progressPercent = Math.min(100, Math.max(0, Math.round((activePageNumber / Math.max(activeTotalPages, 1)) * 100)));

  // Filtered chapters for chapter dropdown
  const filteredChapters = allChapters.filter((ch) => {
    if (!chapterFilter) return true;
    return (
      String(ch.chapter).toLowerCase().includes(chapterFilter.toLowerCase()) ||
      (ch.title && ch.title.toLowerCase().includes(chapterFilter.toLowerCase()))
    );
  });

  const sortedDropdownChapters = [...filteredChapters].sort((a, b) => {
    const numA = parseFloat(a.chapter) || 0;
    const numB = parseFloat(b.chapter) || 0;
    return chapterSortAsc ? numA - numB : numB - numA;
  });

  return (
    <div className={`fixed inset-0 z-50 ${themeBg} text-slate-100 overflow-hidden w-full h-full select-none`}>
      {/* Top 2px Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] bg-white/10 z-[60] pointer-events-none">
        <div 
          className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400 transition-all duration-150 shadow-sm shadow-rose-500/50"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Top Floating Control Bar */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          controlsVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="glass-nav border-b border-white/10 px-3 sm:px-4 py-2.5 sm:py-3 pt-[calc(0.6rem+env(safe-area-inset-top))] max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 shadow-2xl">
          
          {/* Left: Back, Home & Manga Title */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            {/* Back Button (Returns back to Manga Details / Previous Screen) */}
            <button
              onClick={onClose}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1 text-xs font-bold flex-shrink-0"
              title="Go Back to Manga Details (Esc)"
            >
              <ChevronLeft className="w-4 h-4 text-rose-400 sm:text-inherit" />
              <span className="hidden sm:inline">Back</span>
            </button>

            {/* Home Button (Direct to Home Screen) */}
            <button
              onClick={handleHome}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1 text-xs font-bold flex-shrink-0"
              title="Go to Home Screen"
            >
              <Home className="w-4 h-4 text-rose-400 sm:text-inherit" />
              <span className="hidden md:inline">Home</span>
            </button>

            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-[90px] xs:max-w-[140px] sm:max-w-xs md:max-w-sm" title={mangaEnglishTitle || mangaTitle}>
                {mangaEnglishTitle || mangaTitle}
              </h2>
              {mangaEnglishTitle && mangaEnglishTitle.toLowerCase() !== mangaTitle.toLowerCase() && (
                <div className="text-[10px] text-zinc-400 truncate max-w-[90px] xs:max-w-[130px] sm:max-w-xs hidden xs:block" title={mangaTitle}>
                  {mangaTitle}
                </div>
              )}
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-rose-400 font-semibold">
                <span>Ch. {activeChapterNumber}</span>
                {activeTotalPages > 0 && (
                  <span className="text-slate-400 font-normal">
                    • {activePageNumber}/{activeTotalPages} ({progressPercent}%)
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

              {/* Enhanced Chapter Dropdown List with Search & Sort */}
              {showChapterMenu && (
                <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto top-16 sm:top-full sm:left-1/2 sm:-translate-x-1/2 mt-2 w-auto sm:w-80 max-h-[70vh] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-3 z-50 flex flex-col space-y-2">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-rose-400" />
                      <span>Chapter Navigation</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setChapterSortAsc(!chapterSortAsc)}
                        className="p-1 px-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-semibold flex items-center gap-1"
                        title="Toggle Sort Order"
                      >
                        <ArrowUpDown className="w-3 h-3" />
                        <span>{chapterSortAsc ? '1 → N' : 'N → 1'}</span>
                      </button>
                      <button onClick={() => setShowChapterMenu(false)} className="text-slate-400 hover:text-white text-xs p-1">✕</button>
                    </div>
                  </div>

                  {/* Chapter Quick Filter Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Filter chapter number (e.g. 50)..."
                      value={chapterFilter}
                      onChange={(e) => setChapterFilter(e.target.value)}
                      className="w-full bg-slate-800/90 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500/50"
                    />
                  </div>

                  {/* Chapters List */}
                  <div className="overflow-y-auto max-h-[48vh] space-y-1 pr-1">
                    {sortedDropdownChapters.map((ch) => {
                      const isRead = readChapterIds.includes(ch.id);
                      const isCurrent = String(ch.id) === String(activeChapterId);
                      return (
                        <button
                          key={ch.id}
                          onClick={() => jumpToChapter(ch.id, ch.chapter)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all min-h-[38px] ${
                            isCurrent
                              ? 'bg-rose-600 text-white font-bold'
                              : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isRead && !isCurrent && (
                              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            )}
                            <span className="font-semibold">Chapter {ch.chapter}</span>
                            {ch.title && (
                              <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                                • {ch.title}
                              </span>
                            )}
                          </div>
                          {isCurrent && (
                            <span className="text-[10px] uppercase font-bold bg-white/20 px-1.5 py-0.2 rounded text-white">
                              Reading
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
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

          {/* Right: Clock & Battery, Bookmark, Mode Switcher, Auto-Scroll, Settings, Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mihon App Clock & Battery Status */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-[11px] font-mono text-slate-300 select-none">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>{clockTime}</span>
              {batteryLevel !== null && (
                <>
                  <span className="text-slate-600">•</span>
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{batteryLevel}%</span>
                </>
              )}
            </div>

            {/* Quick Bookmark Toggle (Mihon / Webtoon feature) */}
            <button
              onClick={toggleBookmark}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all ${
                bookmarked
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-sm shadow-rose-500/20'
                  : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
              }`}
              title={bookmarked ? 'Saved in Library (Click to remove)' : 'Save to Library'}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Quick Reading Mode Switcher */}
            <button
              onClick={() => updateSetting('readingMode', settings.readingMode === 'webtoon' ? 'single' : 'webtoon')}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              title={`Switch Mode: Currently ${settings.readingMode === 'webtoon' ? 'Webtoon' : 'Single Page'}`}
            >
              <RotateCw className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden xl:inline">{settings.readingMode === 'webtoon' ? 'Webtoon' : 'Paged'}</span>
            </button>

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

            {/* Reader Settings Modal Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className={`p-1.5 sm:p-2 rounded-xl border transition-all ${
                  showSettingsMenu
                    ? 'bg-rose-600 border-rose-500 text-white'
                    : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
                }`}
                title="Reader Settings (S)"
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

                  {/* Mihon Tap Navigation Zones Toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/70 border border-white/5">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-rose-400" />
                        <span>Tap Navigation Zones</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Tap sides to page/scroll, tap center to show controls (Mihon style)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSetting('tapZones', settings.tapZones === false)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 flex-shrink-0 ${
                        settings.tapZones !== false ? 'bg-rose-600' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          settings.tapZones !== false ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Screen Dimmer / Night Mode Brightness */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                        <span>Screen Dimmer (Night Mode)</span>
                      </span>
                      <span className="text-rose-400 font-bold">{settings.brightness ?? 100}%</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={settings.brightness ?? 100}
                      onChange={(e) => updateSetting('brightness', Number(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

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

            {/* Keyboard Shortcuts Help */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-all hidden sm:block"
              title="Keyboard Shortcuts (?)"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

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

      {/* Scrollable Canvas for Manga Pages (Dimmed by brightness filter) */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onClick={handleReaderTap}
        className="absolute inset-0 overflow-y-auto overscroll-y-contain selection:bg-rose-500 selection:text-white transition-colors duration-300 w-full h-full"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          filter: `brightness(${settings.brightness ?? 100}%)`
        }}
      >
        {/* Main Reading Canvas */}
        <main className="min-h-screen pt-14 sm:pt-16 pb-32 sm:pb-40 w-full flex flex-col items-center justify-start">
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
                          id={`page-${ch.id}-${p.pageNumber}`}
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
                    <div className="pt-2 flex items-center justify-center gap-3">
                      <button
                        onClick={handleHome}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-rose-600/30"
                      >
                        <Home className="w-4 h-4" />
                        <span>Home Screen</span>
                      </button>
                      <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back to Details</span>
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
                      <button
                        onClick={handleHome}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Home className="w-4 h-4 text-rose-400" />
                        <span>Home</span>
                      </button>
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
                  onClick={() => setControlsVisible((prev) => !prev)}
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
      </div>

      {/* Floating Auto-Scroll HUD Controller (Fixed above the bottom dock) */}
      {isAutoScrolling && (
        <div className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-50 animate-fadeIn select-none pointer-events-auto">
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

      {/* Floating Bottom HUD: Mihon & Webtoon Page Scrubber & Action Dock (Fixed at bottom of phone) */}
      <div 
        className={`fixed bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-16px)] sm:w-auto max-w-xl transition-all duration-300 select-none pointer-events-auto pb-[env(safe-area-inset-bottom)] ${
          controlsVisible && !isAutoScrolling ? 'translate-y-0 opacity-100' : 'translate-y-36 opacity-0 pointer-events-none'
        }`}
      >
        <div className="glass-panel border border-white/15 bg-slate-950/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_12px_45px_rgba(0,0,0,0.85)] flex flex-col gap-2 text-xs font-semibold">
          
          {/* Row 1: Interactive Page Scrubber with "Go Back", "Page X of Y", and "Go Front" */}
          {activeTotalPages > 0 && (
            <div className="flex items-center gap-2 sm:gap-3 px-1 py-0.5">
              {/* Go Back Button (Previous Page) */}
              <button
                onClick={handlePrevPage}
                disabled={activePageNumber <= 1 && !prevChapter}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 text-[11px] font-bold flex-shrink-0"
                title="Go Back (Previous Page)"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-rose-400" />
                <span>Go Back</span>
              </button>

              {/* Page Indicator ("On What Page I Am") & Scrubber Slider */}
              <div className="flex-1 flex items-center gap-2 min-w-[120px]">
                <input
                  type="range"
                  min="1"
                  max={activeTotalPages || 1}
                  value={activePageNumber}
                  onChange={(e) => scrollToPage(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500 hover:accent-rose-400"
                />
                <span className="text-[11px] font-mono text-rose-400 font-bold whitespace-nowrap bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 flex-shrink-0 shadow-sm">
                  Page {activePageNumber} / {activeTotalPages}
                </span>
              </div>

              {/* Go Front Button (Next Page) */}
              <button
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
              onClick={handleHome}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-rose-500/40 text-slate-200 hover:text-white font-bold flex items-center gap-1.5 transition-all text-[11px] sm:text-xs"
              title="Go to Home Screen"
            >
              <Home className="w-3.5 h-3.5 text-rose-400" />
              <span>Home Screen</span>
            </button>

            {/* Go Back Button */}
            <button
              onClick={onClose}
              className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-bold flex items-center gap-1 transition-all text-[11px] sm:text-xs"
              title="Back to Details / Previous View"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {/* Previous Chapter Button */}
            <button
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
              onClick={() => setShowChapterMenu(!showChapterMenu)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-rose-500/40 text-slate-200 font-bold flex items-center gap-1.5 transition-all text-[11px] sm:text-xs"
              title="Open Chapter List"
            >
              <Layers className="w-3.5 h-3.5 text-rose-400" />
              <span>Ch. {activeChapterNumber}</span>
            </button>

            {/* Move to Next Chapter (Highlighted Gradient) */}
            <button
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
              onClick={scrollToTop}
              className="p-1.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Scroll to Top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-base font-['Outfit']">Keyboard Shortcuts</h3>
              </div>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Next Page / Chapter</span>
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white font-bold">Space / → / D</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Previous Page / Chapter</span>
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white font-bold">← / A</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Toggle Fullscreen</span>
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white font-bold">F</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Toggle Reader Settings</span>
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white font-bold">S</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Close Reader</span>
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white font-bold">Esc</span>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/30"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
