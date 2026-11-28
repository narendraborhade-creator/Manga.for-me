import { getApiBaseUrl, isRedundantChapterTitle } from '../../services/mangaApi';
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, RotateCw, Check, Home, Sparkles } from 'lucide-react';

function WebtoonPageItem({ p, ch, idx, chIdx, settings }) {
  const safeUrl = p?.url || '';
  const [hasError, setHasError] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(safeUrl);
  const retriedCountRef = useRef(0);

  useEffect(() => {
    setCurrentSrc(safeUrl);
    setHasError(false);
    setIsReloading(false);
    setIsLoaded(false);
    retriedCountRef.current = 0;
  }, [safeUrl]);

  const getProxyUrl = (raw) => {
    if (!raw) return '';
    const baseUrl = getApiBaseUrl();
    if (baseUrl) {
      return `${baseUrl}/api/image-proxy?url=${encodeURIComponent(raw)}`;
    }
    return `/api/image-proxy?url=${encodeURIComponent(raw)}`;
  };

  const handleManualReload = (e) => {
    e.stopPropagation();
    setIsReloading(true);
    setHasError(false);
    setIsLoaded(false);
    retriedCountRef.current += 1;
    const targetUrl = p.originalUrl || p.url;
    if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.fetchImageBase64 === 'function' && /^https?:\/\//i.test(targetUrl)) {
      try {
        const b64 = window.AndroidBridge.fetchImageBase64(targetUrl, ch?.sourceUrl || '');
        if (b64 && b64.startsWith('data:image/')) {
          setCurrentSrc(b64);
          return;
        }
      } catch {}
    }
    const proxyUrl = getProxyUrl(targetUrl);
    const sep = proxyUrl.includes('?') ? '&' : '?';
    const newSrc = `${proxyUrl}${sep}_reload=${Date.now()}`;
    setCurrentSrc(newSrc);
  };

  const handleImageError = () => {
    const targetUrl = p.originalUrl || p.url || '';
    if (retriedCountRef.current === 0) {
      retriedCountRef.current = 1;
      if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.fetchImageBase64 === 'function' && /^https?:\/\//i.test(targetUrl)) {
        try {
          const b64 = window.AndroidBridge.fetchImageBase64(targetUrl, ch?.sourceUrl || '');
          if (b64 && b64.startsWith('data:image/')) {
            setCurrentSrc(b64);
            return;
          }
        } catch {}
      }
      if (getApiBaseUrl() || (typeof window !== 'undefined' && window.AndroidBridge)) {
        setCurrentSrc(getProxyUrl(targetUrl));
        return;
      }
      if (targetUrl && currentSrc !== targetUrl && /^https?:\/\//i.test(targetUrl)) {
        setCurrentSrc(targetUrl);
        return;
      }
    }
    if (retriedCountRef.current <= 1 && targetUrl && !targetUrl.startsWith('data:') && !targetUrl.includes('/api/image-proxy')) {
      retriedCountRef.current = 2;
      const fallbackUrl = `https://images.weserv.nl/?url=${encodeURIComponent(targetUrl)}`;
      setCurrentSrc(fallbackUrl);
      return;
    }
    setHasError(true);
    setIsReloading(false);
    setIsLoaded(false);
  };

  const handleImageLoad = () => {
    setHasError(false);
    setIsReloading(false);
    setIsLoaded(true);
  };

  return (
    <div
      id={`page-${ch.id}-${p.pageNumber}`}
      className="manga-page relative w-full min-w-full max-w-full block p-0 m-0 border-0 shadow-none leading-none select-none text-[0px] bg-slate-950/40 overflow-hidden"
      data-chapter-id={ch.id}
      data-chapter-number={ch.chapter}
      data-page-number={p.pageNumber}
      data-total-pages={ch.pages.length}
      style={{
        minHeight: isLoaded ? 'auto' : '65vh',
        ...((settings.pageGap ?? 0) === 0 && idx > 0 ? { marginTop: '-1px' } : {})
      }}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 w-full h-full min-h-[65vh] flex flex-col items-center justify-center bg-slate-900/50 gap-2.5 select-none pointer-events-none">
          <div className="w-9 h-9 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <span className="text-xs font-semibold text-slate-400 tracking-wide">
            Page {p.pageNumber}
          </span>
        </div>
      )}
      {hasError ? (
        <div className="w-full min-h-[260px] sm:min-h-[380px] py-12 px-4 flex flex-col items-center justify-center bg-slate-900/90 border border-white/10 rounded-2xl text-center space-y-3.5 my-2 shadow-2xl select-none">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <RotateCw className={`w-6 h-6 ${isReloading ? 'animate-spin' : ''}`} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Page {p.pageNumber} Didn't Load Properly</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              The image server may be slow or temporarily busy.
            </p>
          </div>
          <button
            type="button"
            onClick={handleManualReload}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
            <span>Reload Page {p.pageNumber}</span>
          </button>
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={`Ch ${ch.chapter} - Page ${p.pageNumber}`}
          decoding="async"
          referrerPolicy="no-referrer"
          className={`block w-full min-w-full max-w-full h-auto select-none pointer-events-none p-0 m-0 border-0 outline-none align-bottom object-contain transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
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
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}
    </div>
  );
}

export default function WebtoonView({
  prevChapterToLoad,
  loadPrevChapter,
  isLoadingPrev,
  loadedChapters,
  settings,
  bottomSentinelRef,
  hasNextChapterToLoad,
  nextChapterError,
  isLoadingNext,
  nextChapterToLoad,
  loadNextChapter,
  activeChapterNumber,
  handleHome,
  onClose,
  prevChapter,
  nextChapter,
  jumpToChapter,
  checkForNewChapters,
  isCheckingUpdates,
  newChapterAlert
}) {
  return (
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
          {chIdx > 0 && (() => {
            const rawTitle = (ch.title || '').trim();
            const isRedundantTitle = isRedundantChapterTitle(rawTitle, ch.chapter);

            return (
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
                    {!isRedundantTitle && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="text-[11px] text-slate-300 font-medium truncate max-w-[150px] sm:max-w-xs">
                          {rawTitle}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-rose-500/30 to-rose-500/60" />
                </div>
              </div>
            );
          })()}

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
            {(Array.isArray(ch?.pages) ? ch.pages : []).filter((p) => p && (p.url || p.originalUrl)).map((p, idx) => (
              <WebtoonPageItem
                key={`${ch.id}-p-${p.pageNumber ?? idx + 1}`}
                p={p}
                ch={ch}
                idx={idx}
                chIdx={chIdx}
                settings={settings}
              />
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
        <div className="w-full p-8 mt-12 rounded-3xl bg-slate-900/80 border border-white/10 text-center space-y-4 max-w-xl select-none">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-white">
            Caught up to Chapter {activeChapterNumber}!
          </h3>
          <p className="text-xs text-slate-400">
            You've completed Chapter {activeChapterNumber}.
          </p>

          {/* New Chapter Announcement if source updated */}
          {newChapterAlert ? (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex flex-col items-center gap-2.5 my-2">
              <span className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Chapter {newChapterAlert.chapter} is now available!
              </span>
              <button
                type="button"
                onClick={() => jumpToChapter(newChapterAlert.id, newChapterAlert.chapter)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Read Chapter {newChapterAlert.chapter}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => checkForNewChapters && checkForNewChapters(true)}
                disabled={isCheckingUpdates}
                className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isCheckingUpdates ? 'animate-spin text-rose-400' : ''}`} />
                <span>{isCheckingUpdates ? 'Checking for updates...' : 'Check for New Chapters'}</span>
              </button>
            </div>
          )}

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={handleHome}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Home Screen</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
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
  );
}
