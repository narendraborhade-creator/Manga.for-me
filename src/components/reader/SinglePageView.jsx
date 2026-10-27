import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

export default function SinglePageView({
  loadedChapters,
  singlePageNum,
  setSinglePageNum,
  setActivePageNumber,
  handleSinglePagePrev,
  handleSinglePageNext,
  handleReaderTap,
  prevChapter,
  nextChapter,
  settings = {}
}) {
  const [hasError, setHasError] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');
  const retriedCountRef = useRef(0);

  const isSpread = settings?.readingMode === 'spread';
  const totalPages = loadedChapters[0]?.pages?.length || 0;

  const curPage = loadedChapters[0]?.pages?.[singlePageNum - 1];
  const secondPage = isSpread && singlePageNum < totalPages ? loadedChapters[0]?.pages?.[singlePageNum] : null;
  const chapterId = loadedChapters[0]?.id;

  useEffect(() => {
    if (curPage) {
      setCurrentSrc(curPage.url || '');
      setHasError(false);
      setIsReloading(false);
      retriedCountRef.current = 0;
    }
  }, [curPage, singlePageNum, chapterId]);

  const handleManualReload = () => {
    if (!curPage) return;
    setIsReloading(true);
    setHasError(false);
    retriedCountRef.current += 1;
    const targetUrl = curPage.originalUrl || curPage.url;
    const newSrc = `/api/image-proxy?url=${encodeURIComponent(targetUrl)}&_reload=${Date.now()}`;
    setCurrentSrc(newSrc);
  };

  const handleImageError = () => {
    if (!curPage) return;
    if (retriedCountRef.current === 0 && !currentSrc.startsWith('/api/image-proxy')) {
      retriedCountRef.current = 1;
      setCurrentSrc(`/api/image-proxy?url=${encodeURIComponent(curPage.originalUrl || curPage.url)}`);
      return;
    }
    if (retriedCountRef.current < 2) {
      retriedCountRef.current = 2;
      const sep = currentSrc.includes('?') ? '&' : '?';
      setCurrentSrc(`${currentSrc}${sep}_retry=${Date.now()}`);
      return;
    }
    setHasError(true);
    setIsReloading(false);
  };

  const handleImageLoad = () => {
    setHasError(false);
    setIsReloading(false);
  };

  if (!loadedChapters[0]?.pages?.length) return null;

  return (
    <div className={`flex flex-col items-center justify-center w-full ${isSpread ? 'max-w-6xl' : 'max-w-4xl'} px-0 sm:px-4 select-none my-auto`}>
      <div
        className="relative w-full flex items-center justify-center bg-black/40 sm:rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
        onClick={handleReaderTap}
      >
        {hasError ? (
          <div className="w-full min-h-[300px] sm:min-h-[420px] py-14 px-6 flex flex-col items-center justify-center bg-slate-900/90 border border-white/10 sm:rounded-2xl text-center space-y-4 my-2 shadow-2xl select-none">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <RotateCw className={`w-6 h-6 ${isReloading ? 'animate-spin' : ''}`} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Page {singlePageNum} Didn't Load Properly</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                The image server may be slow or temporarily busy.
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleManualReload();
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
              <span>{isReloading ? 'Reloading...' : 'Tap to Reload Page'}</span>
            </button>
          </div>
        ) : isSpread && secondPage ? (
          <div className={`flex flex-row items-center justify-center gap-1 sm:gap-3 w-full max-h-[88vh] ${settings?.readingDirection === 'rtl' ? 'flex-row-reverse' : ''}`}>
            {/* Page 1 */}
            <img
              src={currentSrc}
              alt={`Page ${singlePageNum}`}
              referrerPolicy="no-referrer"
              onError={handleImageError}
              onLoad={handleImageLoad}
              className="w-1/2 max-h-[88vh] object-contain"
            />
            {/* Page 2 */}
            <img
              src={secondPage.url}
              alt={`Page ${singlePageNum + 1}`}
              referrerPolicy="no-referrer"
              className="w-1/2 max-h-[88vh] object-contain"
            />
          </div>
        ) : (
          <img
            src={currentSrc}
            alt={`Page ${singlePageNum}`}
            referrerPolicy="no-referrer"
            onError={handleImageError}
            onLoad={handleImageLoad}
            className="w-full sm:w-auto max-h-[88vh] sm:max-h-[85vh] object-contain mx-auto"
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '100%',
              maxHeight: '88vh',
              objectFit: 'contain'
            }}
          />
        )}

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
          aria-label="Previous page"
          disabled={singlePageNum <= 1 && !prevChapter}
          onClick={handleSinglePagePrev}
          className="p-2 rounded-xl bg-slate-900 border border-white/10 disabled:opacity-30 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <input
          type="range"
          min={1}
          max={totalPages}
          value={singlePageNum}
          onChange={(e) => {
            const p = Number(e.target.value);
            setSinglePageNum(p);
            setActivePageNumber(p);
          }}
          className="flex-1 accent-cyan-400 cursor-pointer"
        />

        <button
          aria-label="Next page"
          disabled={singlePageNum >= totalPages && !nextChapter}
          onClick={handleSinglePageNext}
          className="p-2 rounded-xl bg-slate-900 border border-white/10 disabled:opacity-30 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="text-xs font-mono text-cyan-300 font-bold mt-2">
        {isSpread && secondPage
          ? `Pages ${singlePageNum} - ${singlePageNum + 1} of ${totalPages}`
          : `Page ${singlePageNum} of ${totalPages}`}
      </div>
    </div>
  );
}
