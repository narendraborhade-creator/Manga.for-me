import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Film, 
  Bookmark, 
  History, 
  Search, 
  Play, 
  Download, 
  Sparkles,
  Menu,
  X,
  Bell,
  TrendingUp,
  Loader2
} from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';
import { searchManga } from '../services/mangaApi';

export default function Navbar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  bookmarksCount,
  lastRead,
  onOpenReader,
  onOpenBackup,
  unreadUpdatesCount = 0,
  onSelectManga
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Suggestions & Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const TRENDING_SEARCHES = [
    'Solo Leveling',
    'One Piece',
    'Chainsaw Man',
    'Omniscient Reader',
    'Jujutsu Kaisen',
    'Stepmother Second Life'
  ];

  // Debounced search suggestions fetcher
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsSearchingSuggestions(false);
      return;
    }

    let isMounted = true;
    setIsSearchingSuggestions(true);

    const timer = setTimeout(async () => {
      try {
        const results = await searchManga(searchQuery);
        if (isMounted) {
          setSuggestions(results.slice(0, 5));
          setIsSearchingSuggestions(false);
        }
      } catch {
        if (isMounted) {
          setSuggestions([]);
          setIsSearchingSuggestions(false);
        }
      }
    }, 220);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        desktopSearchRef.current && !desktopSearchRef.current.contains(e.target) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (mangaId) => {
    setShowSuggestions(false);
    if (onSelectManga) {
      onSelectManga(mangaId);
    }
  };

  const navItems = [
    { id: 'manga', label: 'Manga Hub', icon: BookOpen },
    { id: 'anime', label: 'Anime Hub', icon: Film },
    { 
      id: 'library', 
      label: 'My Library', 
      icon: Bookmark, 
      badge: bookmarksCount > 0 ? bookmarksCount : null 
    },
    { id: 'history', label: 'Reading History', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-nav backdrop-blur-xl border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none"
            onClick={() => setActiveTab('manga')}
          >
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden border border-rose-500/40 shadow-lg shadow-rose-600/30 ring-2 ring-rose-500/20 group-hover:ring-rose-500/50 group-hover:scale-105 transition-all duration-300 bg-slate-900">
              <img 
                src="/logo.jpg" 
                alt="Logo" 
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent font-['Outfit']">
                  KuroNeko
                </span>
                <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/20">
                  黒猫
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                Manga & Anime Reader
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-2xl border border-white/5 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 relative ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-3">
            {/* Desktop Search Input with Suggestions Dropdown */}
            <div ref={desktopSearchRef} className="relative hidden lg:block w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={activeTab === 'anime' ? 'Search anime...' : 'Search manga by title...'}
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all"
              />
              {isSearchingSuggestions ? (
                <Loader2 className="w-3.5 h-3.5 text-rose-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
              ) : searchQuery ? (
                <button
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
                >
                  ✕
                </button>
              ) : null}

              {/* Suggestions Popover Card */}
              {showSuggestions && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl p-2 z-50 animate-fadeIn space-y-1 max-h-[80vh] overflow-y-auto">
                  {searchQuery.trim().length >= 2 ? (
                    suggestions.length > 0 ? (
                      <div>
                        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                          <span>Suggestions</span>
                          <span className="text-rose-400 font-semibold">{suggestions.length} matches</span>
                        </div>
                        {suggestions.map((manga) => (
                          <div
                            key={manga.id}
                            onClick={() => handleSelectSuggestion(manga.id)}
                            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all group"
                          >
                            <img
                              src={manga.coverUrl}
                              alt={manga.title}
                              className="w-8 h-11 rounded-lg object-cover bg-slate-950 flex-shrink-0 border border-white/10"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-white truncate group-hover:text-rose-400 transition-colors">
                                {manga.englishTitle || manga.title}
                              </h4>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                                <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/20">
                                  {manga.sourceName || 'Manga'}
                                </span>
                                <span>•</span>
                                <span className="truncate">{manga.status}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : isSearchingSuggestions ? (
                      <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
                        <span>Searching all sources...</span>
                      </div>
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-400">
                        No matches found. Press Enter to search catalog.
                      </div>
                    )
                  ) : (
                    <div>
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3 text-rose-400" />
                        <span>Trending Suggestions</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 p-1.5">
                        {TRENDING_SEARCHES.map((title) => (
                          <button
                            key={title}
                            onClick={() => {
                              setSearchQuery(title);
                              setShowSuggestions(true);
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs bg-white/5 hover:bg-rose-600 hover:text-white text-slate-300 font-medium transition-all border border-white/5"
                          >
                            {title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Resume Pill if last read exists */}
            {lastRead && (
              <button
                onClick={() => onOpenReader(lastRead.mangaId, lastRead.chapterId, lastRead.chapterNumber, lastRead.mangaTitle, lastRead.coverUrl)}
                title={`Continue ${lastRead.mangaTitle} Ch. ${lastRead.chapterNumber}`}
                className="hidden sm:flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all group"
              >
                <Play className="w-3.5 h-3.5 fill-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-[120px]">
                  Resume Ch. {lastRead.chapterNumber}
                </span>
              </button>
            )}

            {/* Updates / Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                title="Latest Chapter Releases & Updates"
                className={`relative p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                  unreadUpdatesCount > 0
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                    : 'bg-slate-900/80 hover:bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Bell className={`w-3.5 h-3.5 ${unreadUpdatesCount > 0 ? 'fill-amber-400 text-amber-400 animate-bounce' : ''}`} />
                  {unreadUpdatesCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  )}
                </div>
                <span className="hidden sm:inline">Updates</span>
                {unreadUpdatesCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-sm">
                    {unreadUpdatesCount}
                  </span>
                )}
              </button>

              <NotificationsDropdown
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                onOpenReader={onOpenReader}
                onSelectManga={onSelectManga}
              />
            </div>

            {/* Backup / Restore Button */}
            <button
              onClick={onOpenBackup}
              title="Backup & Restore Library Data"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900/80 hover:bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Backup</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-900/80 border border-white/10 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Search Input with Suggestions Dropdown */}
        <div ref={mobileSearchRef} className="lg:hidden pb-3 relative">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={activeTab === 'anime' ? 'Search anime...' : 'Search manga by title...'}
              value={searchQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500/50 transition-all"
            />
            {isSearchingSuggestions ? (
              <Loader2 className="w-3.5 h-3.5 text-rose-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
            ) : searchQuery ? (
              <button
                aria-label="Clear search"
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            ) : null}
          </div>

          {/* Mobile Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl p-2 z-50 animate-fadeIn space-y-1 max-h-[60vh] overflow-y-auto">
              {searchQuery.trim().length >= 2 ? (
                suggestions.length > 0 ? (
                  <div>
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                      <span>Suggestions</span>
                      <span className="text-rose-400 font-semibold">{suggestions.length} matches</span>
                    </div>
                    {suggestions.map((manga) => (
                      <div
                        key={manga.id}
                        onClick={() => handleSelectSuggestion(manga.id)}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all"
                      >
                        <img
                          src={manga.coverUrl}
                          alt={manga.title}
                          className="w-8 h-11 rounded-lg object-cover bg-slate-950 flex-shrink-0 border border-white/10"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-white truncate">
                            {manga.englishTitle || manga.title}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/20">
                              {manga.sourceName || 'Manga'}
                            </span>
                            <span>•</span>
                            <span className="truncate">{manga.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isSearchingSuggestions ? (
                  <div className="p-3 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-rose-500 animate-spin" />
                    <span>Searching...</span>
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400">
                    No instant suggestions found.
                  </div>
                )
              ) : (
                <div>
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-rose-400" />
                    <span>Quick Suggestions</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-1.5">
                    {TRENDING_SEARCHES.map((title) => (
                      <button
                        key={title}
                        onClick={() => {
                          setSearchQuery(title);
                          setShowSuggestions(true);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs bg-white/5 hover:bg-rose-600 hover:text-white text-slate-300 font-medium transition-all border border-white/5"
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-white/5 flex flex-col gap-1 animate-fadeIn">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {lastRead && (
              <div className="pt-2 mt-1 border-t border-white/5">
                <button
                  onClick={() => {
                    onOpenReader(lastRead.mangaId, lastRead.chapterId, lastRead.chapterNumber, lastRead.mangaTitle, lastRead.coverUrl);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                >
                  <Play className="w-4 h-4 fill-emerald-400" />
                  <span className="truncate">Resume {lastRead.mangaTitle} Ch. {lastRead.chapterNumber}</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
}
