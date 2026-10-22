import React from 'react';
import { Layers, RefreshCw, Search, ArrowUpDown, Loader2, Check, Play } from 'lucide-react';

export default function MangaDetailChapters({
  manga,
  displayCover,
  filteredChapters,
  latestChapter,
  isRefreshing,
  chapterSearch,
  setChapterSearch,
  chapterSort,
  toggleSort,
  loadingChapters,
  readChapterIds,
  lastReadChapter,
  loadMangaData,
  onClose,
  onOpenReader,
  formatDate,
}) {
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-rose-500" />
            <span>Chapters</span>
            <span className="text-xs text-slate-400 font-normal">
              ({filteredChapters.length} available)
            </span>
          </h3>

          {latestChapter && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              Latest: Ch. {latestChapter.chapter}
            </span>
          )}

          <button
            onClick={() => loadMangaData(true)}
            disabled={isRefreshing}
            className="p-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 ml-1"
            title="Check for newest chapters directly from source"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-400' : ''}`} />
            <span className="text-[11px] font-semibold">{isRefreshing ? 'Updating...' : 'Check Updates'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Chapter Search Filter */}
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Find chapter..."
              value={chapterSearch}
              onChange={(e) => setChapterSearch(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition-all"
            />
          </div>

          {/* Sort Order Toggle */}
          <button
            onClick={toggleSort}
            className="p-1.5 px-2.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1 transition-all"
            title={`Sort: ${chapterSort === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{chapterSort === 'asc' ? 'Oldest' : 'Newest'}</span>
          </button>
        </div>
      </div>

      {/* Chapter List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[340px]">
        {loadingChapters ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
            <span className="text-xs">Fetching English chapters...</span>
          </div>
        ) : filteredChapters.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No translated chapters found matching your filter.
          </div>
        ) : (
          filteredChapters.map((chap) => {
            const isRead = readChapterIds.includes(chap.id);
            const isCurrentLastRead = String(chap.chapter) === String(lastReadChapter);
            const isLatest = latestChapter && String(chap.chapter) === String(latestChapter.chapter);

            return (
              <div
                key={chap.id}
                onClick={() => {
                  onClose();
                  onOpenReader(
                    manga.id,
                    chap.id,
                    chap.chapter,
                    manga.title,
                    displayCover,
                    manga.englishTitle || null
                  );
                }}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${
                  isCurrentLastRead
                    ? 'bg-rose-500/10 border-rose-500/40 text-white'
                    : isLatest
                    ? 'bg-amber-500/10 border-amber-500/40 hover:border-amber-500/60 text-slate-200 hover:bg-amber-500/15'
                    : isRead
                    ? 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    : 'bg-slate-900/80 border-white/5 hover:border-white/20 text-slate-200 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isCurrentLastRead
                      ? 'bg-rose-500 text-white'
                      : isLatest
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : isRead
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/5 text-slate-400 group-hover:text-white'
                  }`}>
                    {isRead ? <Check className="w-4 h-4" /> : chap.chapter}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-sm transition-colors ${
                        isLatest ? 'text-amber-300 group-hover:text-amber-200 font-bold' : 'group-hover:text-rose-400'
                      }`}>
                        Chapter {chap.chapter}
                      </span>

                      {isLatest && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                          LATEST
                        </span>
                      )}

                      {chap.title && !chap.title.toLowerCase().startsWith(`chapter ${chap.chapter}`.toLowerCase()) && (
                        <span className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-[320px]">
                          • {chap.title}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      {chap.group && <span>{chap.group}</span>}
                      {chap.publishedAt && (
                        <span>• {formatDate(chap.publishedAt)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="opacity-0 group-hover:opacity-100 text-xs font-bold text-rose-400 flex items-center gap-1 transition-opacity">
                    Read
                    <Play className="w-3 h-3 fill-rose-400" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
