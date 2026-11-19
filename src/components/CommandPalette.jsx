import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  BookOpen, 
  Bookmark, 
  History, 
  Bell, 
  Layers, 
  SlidersHorizontal, 
  Sparkles, 
  Dice5, 
  ArrowRight, 
  Check, 
  X, 
  Loader2,
  ExternalLink,
  Star
} from 'lucide-react';
import { searchManga, cleanTitle, getFallbackCover } from '../services/mangaApi';

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onSelectManga,
  bookmarks = {},
  history = [],
  popularList = []
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setSearchResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search for API results
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let isMounted = true;
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchManga(query.trim());
        if (isMounted) {
          setSearchResults(results.slice(0, 6));
          setIsSearching(false);
        }
      } catch {
        if (isMounted) {
          setSearchResults([]);
          setIsSearching(false);
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Static navigation actions
  const navigationActions = useMemo(() => [
    {
      id: 'nav-browse',
      type: 'action',
      category: 'Navigation',
      label: 'Browse Manga & Webtoons',
      subtitle: 'Trending, latest releases, and multi-source feed',
      icon: BookOpen,
      action: () => onNavigate('manga')
    },
    {
      id: 'nav-library',
      type: 'action',
      category: 'Navigation',
      label: 'My Library',
      subtitle: `${Object.keys(bookmarks).length} titles saved`,
      icon: Bookmark,
      action: () => onNavigate('library')
    },
    {
      id: 'nav-updates',
      type: 'action',
      category: 'Navigation',
      label: 'Chapter Updates Feed',
      subtitle: 'Real-time release scanner for library',
      icon: Bell,
      action: () => onNavigate('updates')
    },
    {
      id: 'nav-history',
      type: 'action',
      category: 'Navigation',
      label: 'Reading History',
      subtitle: `${history.length} titles read`,
      icon: History,
      action: () => onNavigate('history')
    },
    {
      id: 'nav-sources',
      type: 'action',
      category: 'Navigation',
      label: 'Mihon Extensions Deck',
      subtitle: 'Browse 1,600+ Keiyoushi sources & community repos',
      icon: Layers,
      action: () => onNavigate('sources')
    },
    {
      id: 'nav-settings',
      type: 'action',
      category: 'Navigation',
      label: 'Reader & App Settings',
      subtitle: 'Webtoon width, tracking, backup & preferences',
      icon: SlidersHorizontal,
      action: () => onNavigate('more')
    },
    {
      id: 'action-random',
      type: 'action',
      category: 'Quick Actions',
      label: 'Random Manga Discovery',
      subtitle: 'Pick a surprise title from popular catalog',
      icon: Dice5,
      action: () => {
        if (popularList && popularList.length > 0) {
          const randomIndex = Math.floor(Math.random() * popularList.length);
          const picked = popularList[randomIndex];
          onSelectManga(picked.id, picked.coverUrl);
        }
      }
    }
  ], [bookmarks, history, popularList, onNavigate, onSelectManga]);

  // Filtered bookmark matches
  const bookmarkMatches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return Object.values(bookmarks)
      .filter((b) => {
        const title = (b.englishTitle || b.title || '').toLowerCase();
        return title.includes(q);
      })
      .slice(0, 4)
      .map((b) => ({
        id: `bm-${b.id}`,
        type: 'manga',
        category: 'In Your Library',
        label: cleanTitle(b.englishTitle || b.title),
        subtitle: `Chapter ${b.latestChapter || b.totalChapters || '?'} • ${b.category || b.status || 'Library'}`,
        coverUrl: b.coverUrl,
        mangaId: b.id
      }));
  }, [bookmarks, query]);

  // Combined flat items list for keyboard navigation
  const items = useMemo(() => {
    if (!query.trim()) {
      return navigationActions;
    }

    const filteredNav = navigationActions.filter((a) =>
      a.label.toLowerCase().includes(query.toLowerCase()) ||
      a.subtitle.toLowerCase().includes(query.toLowerCase())
    );

    const apiItems = searchResults.map((m) => ({
      id: `search-${m.id}`,
      type: 'manga',
      category: 'Manga Search Results',
      label: cleanTitle(m.englishTitle || m.title),
      subtitle: `Score: ${m.score || '8.5'} • ${m.status || 'Ongoing'} • ${m.sourceName || 'Multi-Source'}`,
      coverUrl: m.coverUrl,
      mangaId: m.id,
      score: m.score
    }));

    return [...bookmarkMatches, ...filteredNav, ...apiItems];
  }, [query, navigationActions, bookmarkMatches, searchResults]);

  // Handle keyboard events (Up/Down/Enter/Escape)
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (items.length > 0 ? (prev + 1) % items.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (items.length > 0 ? (prev - 1 + items.length) % items.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = items[selectedIndex];
      if (current) {
        if (current.type === 'action') {
          current.action();
        } else if (current.type === 'manga') {
          onSelectManga(current.mangaId, current.coverUrl);
        }
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-black/75 backdrop-blur-xl animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#0a0d17]/95 border border-white/10 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-white/10 bg-white/[0.02]">
          <Search className="w-5 h-5 text-rose-500 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a title or jump to view (e.g. Solo Leveling, library, updates)..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none"
          />
          {isSearching && (
            <Loader2 className="w-4 h-4 text-rose-500 animate-spin mr-2 flex-shrink-0" />
          )}
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-slate-400 border border-white/10">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto p-2.5 space-y-1 scrollbar-thin"
        >
          {items.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <p>No results found for "{query}".</p>
              <p className="text-[11px] text-slate-500 mt-1">Try searching for manga names, genres, or navigation tabs.</p>
            </div>
          ) : (
            items.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon || BookOpen;

              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (item.type === 'action') {
                      item.action();
                    } else if (item.type === 'manga') {
                      onSelectManga(item.mangaId, item.coverUrl);
                    }
                    onClose();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (item.type === 'action') {
                        item.action();
                      } else if (item.type === 'manga') {
                        onSelectManga(item.mangaId, item.coverUrl);
                      }
                      onClose();
                    }
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500 ${
                    isSelected
                      ? 'bg-rose-600/20 text-white border border-rose-500/30 shadow-sm'
                      : 'text-slate-300 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  {item.coverUrl ? (
                    <div className="w-9 h-12 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 border border-white/10">
                      <img
                        src={item.coverUrl}
                        alt={item.label}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = getFallbackCover(item.label);
                        }}
                      />
                    </div>
                  ) : (
                    <div className={`p-2 rounded-xl flex-shrink-0 ${
                      isSelected ? 'bg-rose-600 text-white' : 'bg-white/5 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-xs sm:text-sm truncate">
                        {item.label}
                      </h4>
                      {item.score && (
                        <span className="flex items-center gap-0.5 text-[10px] text-amber-400 font-medium">
                          <Star className="w-2.5 h-2.5 fill-amber-400" />
                          <span>{item.score}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>

                  <ArrowRight className={`w-3.5 h-3.5 transition-transform ${
                    isSelected ? 'text-rose-400 translate-x-0.5' : 'text-slate-600 opacity-0'
                  }`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Keyboard hints */}
        <div className="px-4 py-2.5 border-t border-white/5 bg-black/40 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-300">↑↓</kbd> navigate</span>
            <span><kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-300">↵</kbd> select</span>
            <span><kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-300">esc</kbd> close</span>
          </div>
          <span className="text-[10px] text-slate-400">KuroNeko Command Bar</span>
        </div>
      </div>
    </div>
  );
}
