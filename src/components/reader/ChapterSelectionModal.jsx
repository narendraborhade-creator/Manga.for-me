import React from 'react';
import { Layers, ArrowUpDown, Search, Check } from 'lucide-react';

export default function ChapterSelectionModal({
  isOpen,
  onClose,
  allChapters,
  activeChapterId,
  readChapterIds,
  chapterFilter,
  setChapterFilter,
  chapterSortAsc,
  setChapterSortAsc,
  onJumpToChapter
}) {
  if (!isOpen) return null;

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
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full sm:w-96 max-h-[75vh] bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-4 flex flex-col space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-rose-400" />
            <span>Chapter Selection</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setChapterSortAsc(!chapterSortAsc)}
              className="p-1 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-semibold flex items-center gap-1 transition-all"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{chapterSortAsc ? '1 → N' : 'N → 1'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xs p-1 rounded-lg hover:bg-white/10"
            >
              ✕
            </button>
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
            className="w-full bg-slate-800/90 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500/50"
          />
        </div>

        {/* Chapters List */}
        <div className="overflow-y-auto max-h-[50vh] space-y-1 pr-1">
          {sortedDropdownChapters.map((ch) => {
            const isRead = readChapterIds.includes(ch.id);
            const isCurrent = String(ch.id) === String(activeChapterId);
            return (
              <button
                key={ch.id}
                onClick={() => onJumpToChapter(ch.id, ch.chapter)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all min-h-[40px] ${
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
                    <span className="text-[11px] text-slate-400 truncate max-w-[140px] sm:max-w-[180px]">
                      • {ch.title}
                    </span>
                  )}
                </div>
                {isCurrent && (
                  <span className="text-[10px] uppercase font-bold bg-white/20 px-1.5 py-0.5 rounded text-white">
                    Reading
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
