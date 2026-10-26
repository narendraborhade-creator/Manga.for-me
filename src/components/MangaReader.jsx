import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
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

import ChapterSelectionModal from './reader/ChapterSelectionModal';
import ReaderSettingsModal from './reader/ReaderSettingsModal';
import KeyboardHelpModal from './reader/KeyboardHelpModal';
import AutoScrollHud from './reader/AutoScrollHud';
import ReaderBottomHud from './reader/ReaderBottomHud';
import SinglePageView from './reader/SinglePageView';
import WebtoonView from './reader/WebtoonView';

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
  const [loadedChapters, setLoadedChapters] = useState([]);
  const loadedChaptersRef = useRef([]);

  useEffect(() => {
    loadedChaptersRef.current = loadedChapters;
  }, [loadedChapters]);

  const [allChapters, setAllChapters] = useState([]);
  const allChaptersRef = useRef([]);

  useEffect(() => {
    loadedChaptersRef.current = loadedChapters;
  }, [loadedChapters]);

  useEffect(() => {
    allChaptersRef.current = allChapters;
  }, [allChapters]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [initialError, setInitialError] = useState(null);

  // Next chapter auto-loading state
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
  const [isReloadingChapter, setIsReloadingChapter] = useState(false);

  // Read chapters list for checkmark indicators
  const [readChapterIds, setReadChapterIds] = useState([]);
  const [chapterFilter, setChapterFilter] = useState('');
  const [chapterSortAsc, setChapterSortAsc] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleHome = onGoHome || onClose;

  // Bookmarking integration
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

  // Clock & Battery Indicator
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
      fitMode: saved.fitMode || 'full',
      pageGap: effectiveGap,
      readingDirection: saved.readingDirection || 'ltr',
      autoScrollSpeed: saved.autoScrollSpeed || 2,
      brightness: saved.brightness ?? 100,
      continuousScroll: saved.continuousScroll !== undefined ? saved.continuousScroll : true,
      tapZones: saved.tapZones !== undefined ? saved.tapZones : true,
      visualFilter: saved.visualFilter || 'normal',
    };
  });

  const readStartTimeRef = useRef(0);
  const [readDurationMins, setReadDurationMins] = useState(1);

  useEffect(() => {
    if (!readStartTimeRef.current) {
      readStartTimeRef.current = Date.now();
    }
    const paceTimer = setInterval(() => {
      const elapsed = Math.max(1, Math.round((Date.now() - (readStartTimeRef.current || Date.now())) / 60000));
      setReadDurationMins(elapsed);
    }, 20000);
    return () => clearInterval(paceTimer);
  }, []);

  const readingPace = (activePageNumber / Math.max(1, readDurationMins)).toFixed(1);

  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showChapterMenu, setShowChapterMenu] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  // Sync menu state refs inside effect to satisfy react compiler
  const showSettingsMenuRef = useRef(showSettingsMenu);
  const showChapterMenuRef = useRef(showChapterMenu);
  const showHelpModalRef = useRef(showHelpModal);

  useEffect(() => {
    showSettingsMenuRef.current = showSettingsMenu;
    showChapterMenuRef.current = showChapterMenu;
    showHelpModalRef.current = showHelpModal;
  }, [showSettingsMenu, showChapterMenu, showHelpModal]);

  // DOM References
  const containerRef = useRef(null);
  const bottomSentinelRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const autoScrollRef = useRef(null);

  // Auto-hide controls after idle
  const rescheduleControls = useCallback((duration = 5000) => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (!showSettingsMenuRef.current && !showChapterMenuRef.current && !showHelpModalRef.current) {
        setControlsVisible(false);
      }
    }, duration);
  }, []);

  // Show controls briefly on initial chapter load so user sees title/chapter, then auto-hide
  useEffect(() => {
    rescheduleControls(3500);
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [rescheduleControls]);

  // Handle click/tap on canvas: toggle controls on/off
  const handleReaderTap = (e) => {
    if (e.target.closest('button, input, select, a, .glass-panel, [role="dialog"], .glass-nav, .slider-thumb')) {
      return;
    }
    if (isAutoScrolling) {
      setIsAutoScrolling(false);
    }
    setControlsVisible((prev) => {
      if (prev) {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
          controlsTimeoutRef.current = null;
        }
        return false;
      } else {
        rescheduleControls(5000);
        return true;
      }
    });
  };

  const updateSetting = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveReaderSettings(updated);
  };

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

  // Proactive Lookahead Page Preloader
  useEffect(() => {
    if (loadedChapters.length === 0) return;
    const allPages = loadedChapters.flatMap((ch) => ch.pages || []);
    if (allPages.length === 0) return;

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

  // Seamless Next Chapter Auto-loader
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

  // Load Previous Chapter
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

  const handleReloadCurrentChapter = useCallback(async () => {
    const targetChapId = activeChapterIdRef.current || chapterId;
    if (!targetChapId || isReloadingChapter) return;
    setIsReloadingChapter(true);
    try {
      const data = await fetchChapterPages(targetChapId);
      if (data && data.pages && data.pages.length > 0) {
        setLoadedChapters((prev) =>
          prev.map((c) =>
            String(c.id) === String(targetChapId)
              ? { ...c, pages: data.pages }
              : c
          )
        );
      }
    } catch (err) {
      console.error('Error reloading chapter:', err);
    } finally {
      setIsReloadingChapter(false);
    }
  }, [chapterId, isReloadingChapter]);

  // Track scroll position in Webtoon mode & auto-hide controls on scroll
  const handleScroll = useCallback(() => {
    // Auto-hide HUD controls immediately when scrolling/reading
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
    setControlsVisible((prev) => {
      if (prev && !showSettingsMenuRef.current && !showChapterMenuRef.current && !showHelpModalRef.current) {
        return false;
      }
      return prev;
    });

    const container = containerRef.current;
    if (!container) return;

    if (settings.readingMode === 'webtoon') {
      const remaining = container.scrollHeight - (container.scrollTop + container.clientHeight);
      if (remaining < 1800 && settings.continuousScroll) {
        loadNextChapter();
      }

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

  // Attach scroll listeners to auto-hide controls while reading/scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // IntersectionObserver for Bottom Sentinel
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

  // Auto-Scroll Engine
  useEffect(() => {
    if (!isAutoScrolling || settings.readingMode !== 'webtoon') {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
        autoScrollRef.current = null;
      }
      return;
    }

    const speedMap = { 1: 45, 2: 95, 3: 175, 4: 280 };
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

          const remainingBottom = container.scrollHeight - (container.scrollTop + container.clientHeight);
          if (remainingBottom < 1600 && hasNextChapterToLoad && !isLoadingNextRef.current) {
            loadNextChapter();
          }
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

  // Jump directly to a specific page
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

  return (
    <div className={`fixed inset-0 z-50 ${themeBg} text-slate-100 overflow-hidden w-full h-full select-none`}>
      {/* Top 2px Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] bg-white/10 z-[60] pointer-events-none">
        <div 
          className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400 transition-all duration-150 shadow-sm shadow-rose-500/50"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Chapter Selection Modal */}
      <ChapterSelectionModal
        isOpen={showChapterMenu}
        onClose={() => setShowChapterMenu(false)}
        allChapters={allChapters}
        activeChapterId={activeChapterId}
        readChapterIds={readChapterIds}
        chapterFilter={chapterFilter}
        setChapterFilter={setChapterFilter}
        chapterSortAsc={chapterSortAsc}
        setChapterSortAsc={setChapterSortAsc}
        onJumpToChapter={jumpToChapter}
      />

      {/* Reader Settings Modal */}
      <ReaderSettingsModal
        isOpen={showSettingsMenu}
        onClose={() => setShowSettingsMenu(false)}
        settings={settings}
        updateSetting={updateSetting}
        isAutoScrolling={isAutoScrolling}
        setIsAutoScrolling={setIsAutoScrolling}
        toggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        onOpenHelpModal={() => {
          setShowSettingsMenu(false);
          setShowHelpModal(true);
        }}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* Scrollable Canvas for Manga Pages */}
      <div 
        ref={containerRef}
        onClick={handleReaderTap}
        className={`absolute inset-0 overflow-y-auto overscroll-y-contain selection:bg-rose-500 selection:text-white transition-colors duration-300 w-full h-full ${
          settings.visualFilter === 'oled' ? 'reader-filter-oled' :
          settings.visualFilter === 'sepia' ? 'reader-filter-sepia' :
          settings.visualFilter === 'invert' ? 'reader-filter-invert' :
          settings.visualFilter === 'night' ? 'reader-filter-night' : ''
        }`}
        style={{ 
          WebkitOverflowScrolling: 'touch',
          filter: `brightness(${settings.brightness ?? 100}%)`
        }}
      >
        <main className="min-h-screen pt-4 sm:pt-6 pb-36 sm:pb-40 w-full flex flex-col items-center justify-start">
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
              {/* 1. Webtoon Mode */}
              {settings.readingMode === 'webtoon' && (
                <WebtoonView
                  prevChapterToLoad={prevChapterToLoad}
                  loadPrevChapter={loadPrevChapter}
                  isLoadingPrev={isLoadingPrev}
                  loadedChapters={loadedChapters}
                  settings={settings}
                  bottomSentinelRef={bottomSentinelRef}
                  hasNextChapterToLoad={hasNextChapterToLoad}
                  nextChapterError={nextChapterError}
                  isLoadingNext={isLoadingNext}
                  nextChapterToLoad={nextChapterToLoad}
                  loadNextChapter={loadNextChapter}
                  activeChapterNumber={activeChapterNumber}
                  handleHome={handleHome}
                  onClose={onClose}
                  prevChapter={prevChapter}
                  nextChapter={nextChapter}
                  jumpToChapter={jumpToChapter}
                />
              )}

              {/* 2. Single Page & Double Page Spread Mode */}
              {(settings.readingMode === 'single' || settings.readingMode === 'spread') && (
                <SinglePageView
                  loadedChapters={loadedChapters}
                  singlePageNum={singlePageNum}
                  setSinglePageNum={setSinglePageNum}
                  setActivePageNumber={setActivePageNumber}
                  handleSinglePagePrev={handleSinglePagePrev}
                  handleSinglePageNext={handleSinglePageNext}
                  handleReaderTap={handleReaderTap}
                  prevChapter={prevChapter}
                  nextChapter={nextChapter}
                  settings={settings}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Floating Auto-Scroll HUD Controller */}
      <AutoScrollHud
        isAutoScrolling={isAutoScrolling}
        setIsAutoScrolling={setIsAutoScrolling}
        autoScrollSpeed={settings.autoScrollSpeed}
        updateSetting={updateSetting}
      />

      {/* Floating Bottom HUD */}
      <ReaderBottomHud
        controlsVisible={controlsVisible}
        isAutoScrolling={isAutoScrolling}
        mangaTitle={mangaTitle}
        mangaEnglishTitle={mangaEnglishTitle}
        activeChapterNumber={activeChapterNumber}
        settings={settings}
        clockTime={clockTime}
        batteryLevel={batteryLevel}
        bookmarked={bookmarked}
        toggleBookmark={toggleBookmark}
        showSettingsMenu={showSettingsMenu}
        setShowSettingsMenu={setShowSettingsMenu}
        setControlsVisible={setControlsVisible}
        activeTotalPages={activeTotalPages}
        activePageNumber={activePageNumber}
        handlePrevPage={handlePrevPage}
        handleNextPage={handleNextPage}
        scrollToPage={scrollToPage}
        prevChapter={prevChapter}
        nextChapter={nextChapter}
        handleHome={handleHome}
        onClose={onClose}
        jumpToChapter={jumpToChapter}
        showChapterMenu={showChapterMenu}
        setShowChapterMenu={setShowChapterMenu}
        scrollToTop={scrollToTop}
        handleReloadChapter={handleReloadCurrentChapter}
        isReloadingChapter={isReloadingChapter}
        readPages={loadedChapters[0]?.pages || []}
        readDurationMins={readDurationMins}
        readingPace={readingPace}
      />
    </div>
  );
}
