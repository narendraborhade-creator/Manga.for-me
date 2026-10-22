import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SinglePageView({
  loadedChapters,
  singlePageNum,
  setSinglePageNum,
  setActivePageNumber,
  handleSinglePagePrev,
  handleSinglePageNext,
  handleReaderTap,
  prevChapter,
  nextChapter
}) {
  if (!loadedChapters[0]?.pages?.length) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl px-0 sm:px-4 select-none my-auto">
      <div
        className="relative w-full flex items-center justify-center bg-black/40 sm:rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
        onClick={handleReaderTap}
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
  );
}
