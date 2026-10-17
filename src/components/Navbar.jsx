import React, { useState } from 'react';
import { 
  BookOpen, 
  Film, 
  Bookmark, 
  History, 
  Search, 
  Play, 
  Download, 
  Upload, 
  Sparkles,
  Menu,
  X,
  Bell
} from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';

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
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 shadow-lg shadow-rose-500/25 group-hover:shadow-rose-500/40 transition-all duration-300">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
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
            {/* Search Input */}
            <div className="relative hidden lg:block w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={activeTab === 'anime' ? 'Search anime...' : 'Search manga by title...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
                >
                  ✕
                </button>
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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-900/80 border border-white/10 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Search Input */}
        <div className="lg:hidden pb-3">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={activeTab === 'anime' ? 'Search anime...' : 'Search manga by title...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-white/5 flex flex-col gap-1">
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
          </div>
        )}

      </div>
    </header>
  );
}
