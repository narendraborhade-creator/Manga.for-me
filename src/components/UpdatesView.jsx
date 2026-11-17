import React, { useState, useMemo } from 'react';
import { 
  RotateCw, 
  CheckCheck, 
  Play, 
  BookOpen, 
  Clock, 
  Filter, 
  Inbox
} from 'lucide-react';
import { 
  getUpdates, 
  markUpdateAsRead, 
  markAllUpdatesAsRead
} from '../services/storage';
import { checkAllLibraryUpdates } from '../services/updateService';
import { getFallbackCover } from '../services/mangaApi';

export default function UpdatesView({
  onOpenReader,
  onSelectManga,
  onGoToBrowse
}) {
  const [updates, setUpdates] = useState(() => getUpdates());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await checkAllLibraryUpdates();
      setUpdates(getUpdates());
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkAllRead = () => {
    const updated = markAllUpdatesAsRead();
    setUpdates(updated);
  };

  const handleMarkOneRead = (e, updateId) => {
    e.stopPropagation();
    const updated = markUpdateAsRead(updateId);
    setUpdates(updated);
  };

  const filteredUpdates = useMemo(() => {
    if (!filterUnreadOnly) return updates;
    return updates.filter((u) => !u.read);
  }, [updates, filterUnreadOnly]);

  // Group chronologically: Today, Yesterday, This Week, Older
  const groupedUpdates = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const thisWeek = today - 86400000 * 7;

    const groups = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      Older: [],
    };

    filteredUpdates.forEach((item) => {
      const time = new Date(item.detectedAt || item.publishedAt || Date.now()).getTime();
      if (time >= today) {
        groups.Today.push(item);
      } else if (time >= yesterday) {
        groups.Yesterday.push(item);
      } else if (time >= thisWeek) {
        groups['This Week'].push(item);
      } else {
        groups.Older.push(item);
      }
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [filteredUpdates]);

  const unreadCount = useMemo(() => {
    return updates.filter((u) => !u.read).length;
  }, [updates]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn pb-24">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight text-white flex items-center gap-2">
              Updates
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {unreadCount} new
                </span>
              )}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Chronological chapter release feed from your tracked Library
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterUnreadOnly((prev) => !prev)}
            aria-label={filterUnreadOnly ? 'Showing Unread' : 'All Updates'}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
              filterUnreadOnly
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/20'
                : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{filterUnreadOnly ? 'Showing Unread' : 'All Updates'}</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              aria-label="Mark all read"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mark all read</span>
            </button>
          )}

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Check for updates"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all flex items-center gap-1.5 shadow-md shadow-rose-600/25 disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Checking...' : 'Check Updates'}</span>
          </button>
        </div>
      </div>

      {/* Main List */}
      {groupedUpdates.length === 0 ? (
        <div className="text-center py-20 px-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4 text-rose-400 shadow-inner">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Recent Updates</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            When new chapters are scanned for titles in your Library, they will appear right here in real time.
          </p>
          <button
            onClick={onGoToBrowse}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/25 transition-all inline-flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse Manga Hub</span>
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {groupedUpdates.map(([groupName, items]) => (
            <div key={groupName} className="space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-slate-400">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>{groupName}</span>
                <span className="text-slate-600">({items.length})</span>
                <div className="flex-1 h-px bg-white/10 ml-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((item) => {
                  const isUnread = !item.read;
                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectManga(item.mangaId, item.coverUrl)}
                      className={`group relative flex items-center gap-3.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                        isUnread
                          ? 'bg-[#0f1522]/90 hover:bg-[#131c2e] border-rose-500/30 shadow-md shadow-rose-950/40'
                          : 'bg-slate-900/50 hover:bg-slate-900/80 border-white/5 text-slate-400'
                      }`}
                    >
                      {/* Unread indicator */}
                      {isUnread && (
                        <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)] z-10" />
                      )}

                      {/* Cover Thumbnail */}
                      <div className="relative w-14 h-20 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-white/10 group-hover:border-rose-500/40 transition-all shadow-sm">
                        <img
                          src={item.coverUrl}
                          alt={item.mangaTitle}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = getFallbackCover(item.mangaTitle);
                          }}
                        />
                      </div>

                      {/* Manga & Chapter Info */}
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-rose-500/15 text-rose-300 border border-rose-500/25">
                            {item.sourceName || 'Mihon Source'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Just Now'}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-white group-hover:text-rose-300 transition-colors truncate">
                          {item.mangaEnglishTitle || item.mangaTitle}
                        </h3>

                        <p className="text-xs text-rose-400/90 mt-0.5 flex items-center gap-1 font-semibold">
                          <span>Chapter {item.chapterNumber}</span>
                          {item.chapterTitle && (
                            <span className="text-slate-400 font-normal truncate">
                              • {item.chapterTitle}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Direct Read Action */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isUnread) {
                              markUpdateAsRead(item.id);
                            }
                            onOpenReader(
                              item.mangaId,
                              item.chapterId,
                              item.chapterNumber,
                              item.mangaTitle,
                              item.coverUrl,
                              item.mangaEnglishTitle
                            );
                          }}
                          className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-all transform active:scale-95"
                          title="Read Chapter Now"
                          aria-label="Read Chapter Now"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span className="hidden sm:inline">Read</span>
                        </button>

                        {isUnread && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkOneRead(e, item.id)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all border border-white/5"
                            title="Mark as Read"
                            aria-label="Mark as Read"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
