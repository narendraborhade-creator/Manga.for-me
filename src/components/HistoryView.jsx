import React from 'react';
import { History, Play, Trash2, Clock, BookOpen, AlertTriangle } from 'lucide-react';
import { clearHistory, removeFromHistory } from '../services/storage';

export default function HistoryView({
  history = [],
  onOpenReader,
  onOpenMangaDetails,
  onRefreshHistory
}) {
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your entire reading history?')) {
      clearHistory();
      if (onRefreshHistory) onRefreshHistory();
    }
  };

  const handleRemoveItem = (e, mangaId) => {
    e.stopPropagation();
    removeFromHistory(mangaId);
    if (onRefreshHistory) onRefreshHistory();
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'Recently';
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays} days ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Reading History & Timeline
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Keep track of which manga you read last and your chapter milestones.
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-3xl border border-white/5 p-8 max-w-md mx-auto space-y-4">
          <History className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No reading history yet</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            As soon as you start reading chapters in the Manga Hub, your progress and last-read chapters will automatically be saved and displayed here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.mangaId}
              onClick={() => onOpenMangaDetails(item.mangaId)}
              className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-rose-500/30 transition-all shadow-md cursor-pointer"
            >
              {/* Left: Thumbnail & Info */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-14 h-20 sm:w-16 sm:h-22 rounded-xl overflow-hidden flex-shrink-0 bg-slate-950 border border-white/10 shadow-md">
                  <img
                    src={item.coverUrl}
                    alt={item.mangaTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {formatTime(item.updatedAt)}
                    </span>
                    {item.readChapters && item.readChapters.length > 0 && (
                      <span className="text-[10px] px-2 py-0.2 rounded-md bg-white/5 text-slate-400 border border-white/5">
                        {item.readChapters.length} chapter{item.readChapters.length > 1 ? 's' : ''} read
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-rose-400 truncate transition-colors">
                    {item.mangaTitle}
                  </h3>

                  <p className="text-xs text-rose-400 font-semibold mt-0.5">
                    Last Read: Chapter {item.chapterNumber}
                    {item.currentPage && item.totalPages && item.totalPages > 1 && (
                      <span className="text-slate-500 font-normal ml-2">
                        (Page {item.currentPage} / {item.totalPages})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenReader(
                      item.mangaId,
                      item.chapterId,
                      item.chapterNumber,
                      item.mangaTitle,
                      item.coverUrl
                    );
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Resume Ch. {item.chapterNumber}</span>
                </button>

                <button
                  onClick={(e) => handleRemoveItem(e, item.mangaId)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-all"
                  title="Remove from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
