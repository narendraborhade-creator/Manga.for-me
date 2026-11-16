import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Radio, 
  Download, 
  Trash2, 
  ExternalLink, 
  Search, 
  RefreshCw, 
  Check, 
  CheckCircle2, 
  AlertTriangle, 
  Pin, 
  Plus, 
  Globe, 
  Layers, 
  Cpu, 
  Filter, 
  Sparkles, 
  Flame, 
  Clock, 
  X, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  BookOpen
} from 'lucide-react';

import {
  getRepositories,
  addRepository,
  removeRepository,
  fetchRepositoryIndex,
  getInstalledExtensions,
  installExtension,
  uninstallExtension,
  toggleExtensionState,
  togglePinExtension,
  fetchSourcePopular,
  fetchSourceLatest,
  searchSourceManga,
  searchAllInstalledSources,
  DEFAULT_REPOSITORIES
} from '../services/extensionManager';
import MangaCard from './MangaCard';

export default function ExtensionsView({ onSelectManga, onOpenReader }) {
  // Navigation Tabs: 'sources' | 'extensions' | 'repositories'
  const [activeSubTab, setActiveSubTab] = useState('sources');

  // Repositories State
  const [repositories, setRepositories] = useState([]);
  const [isSyncingRepos, setIsSyncingRepos] = useState(false);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [newRepoName, setNewRepoName] = useState('');
  const [repoAddError, setRepoAddError] = useState(null);
  const [repoAddSuccess, setRepoAddSuccess] = useState(null);
  const [isAddingRepo, setIsAddingRepo] = useState(false);

  // Extensions Store State
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [loadingExtensions, setLoadingExtensions] = useState(false);
  const [installedExtensions, setInstalledExtensions] = useState([]);
  const [installingPkgs, setInstallingPkgs] = useState({});
  const [extensionSearch, setExtensionSearch] = useState('');
  const [selectedLang, setSelectedLang] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'installed' | 'available'
  const [showNsfw, setShowNsfw] = useState(false);

  // Source Browser Modal State
  const [browsingSource, setBrowsingSource] = useState(null); // { source, mode: 'popular'|'latest'|'search' }
  const [sourceMangaList, setSourceMangaList] = useState([]);
  const [loadingSourceManga, setLoadingSourceManga] = useState(false);
  const [sourceQuery, setSourceQuery] = useState('');

  // Global Multi-Source Search State
  const [globalSearchActive, setGlobalSearchActive] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');
  const [globalResults, setGlobalResults] = useState([]);
  const [searchingGlobal, setSearchingGlobal] = useState(false);

  // Load repositories and installed extensions
  const refreshInstalled = useCallback(() => {
    setInstalledExtensions(getInstalledExtensions());
  }, []);

  const refreshRepos = useCallback(() => {
    setRepositories(getRepositories());
  }, []);

  useEffect(() => {
    refreshInstalled();
    refreshRepos();

    const handleUpdate = () => {
      refreshInstalled();
      refreshRepos();
    };

    window.addEventListener('mihon:extension_update', handleUpdate);
    return () => window.removeEventListener('mihon:extension_update', handleUpdate);
  }, [refreshInstalled, refreshRepos]);

  // Load extension store catalog from connected repositories
  const loadExtensionsCatalog = useCallback(async (forceRefresh = false) => {
    const repos = getRepositories();
    if (repos.length === 0) return;

    setLoadingExtensions(true);
    const combined = [];
    const seenPkgs = new Set();

    for (const repo of repos) {
      if (!repo.enabled) continue;
      try {
        const exts = await fetchRepositoryIndex(repo);
        exts.forEach(e => {
          if (!seenPkgs.has(e.pkg)) {
            seenPkgs.add(e.pkg);
            combined.push(e);
          }
        });
      } catch (err) {
        console.warn(`Failed to fetch repo ${repo.name}:`, err);
      }
    }

    setAvailableExtensions(combined);
    setLoadingExtensions(false);
  }, []);

  useEffect(() => {
    if (activeSubTab === 'extensions' && availableExtensions.length === 0) {
      loadExtensionsCatalog();
    }
  }, [activeSubTab, availableExtensions.length, loadExtensionsCatalog]);

  // Handle Sync All Repositories
  const handleSyncAll = async () => {
    setIsSyncingRepos(true);
    try {
      await loadExtensionsCatalog(true);
      const updatedRepos = getRepositories().map(r => ({
        ...r,
        lastSynced: Date.now()
      }));
      setRepositories(updatedRepos);
    } finally {
      setIsSyncingRepos(false);
    }
  };

  // Handle Add Custom Repository
  const handleAddCustomRepo = async (e) => {
    e.preventDefault();
    if (!newRepoUrl.trim()) return;

    setIsAddingRepo(true);
    setRepoAddError(null);
    setRepoAddSuccess(null);

    try {
      const added = await addRepository(newRepoUrl.trim(), newRepoName.trim());
      setRepoAddSuccess(`Successfully connected "${added.name}" with ${added.extensionsCount} extensions!`);
      setNewRepoUrl('');
      setNewRepoName('');
      refreshRepos();
      loadExtensionsCatalog(true);
    } catch (err) {
      setRepoAddError(err.message || 'Failed to connect repository.');
    } finally {
      setIsAddingRepo(false);
    }
  };

  // Handle Install Extension with download animation
  const handleInstallExtension = async (ext) => {
    setInstallingPkgs(prev => ({ ...prev, [ext.pkg]: true }));
    try {
      // Simulate quick secure package verification & install
      await new Promise(r => setTimeout(r, 650));
      await installExtension(ext);
      refreshInstalled();
    } finally {
      setInstallingPkgs(prev => ({ ...prev, [ext.pkg]: false }));
    }
  };

  // Handle Uninstall Extension
  const handleUninstall = (pkg) => {
    uninstallExtension(pkg);
    refreshInstalled();
  };

  // Filter available extensions for Store tab
  const filteredExtensions = useMemo(() => {
    const installedSet = new Set(installedExtensions.map(e => e.pkg));
    const q = extensionSearch.toLowerCase().trim();

    return availableExtensions.filter(ext => {
      // Search query filter
      if (q) {
        const matchName = ext.name.toLowerCase().includes(q);
        const matchPkg = ext.pkg.toLowerCase().includes(q);
        if (!matchName && !matchPkg) return false;
      }

      // Language filter
      if (selectedLang !== 'all') {
        const extLang = (ext.lang || '').toLowerCase();
        if (extLang !== selectedLang.toLowerCase()) return false;
      }

      // Status filter
      const isInst = installedSet.has(ext.pkg);
      if (statusFilter === 'installed' && !isInst) return false;
      if (statusFilter === 'available' && isInst) return false;

      // NSFW filter
      if (!showNsfw && ext.contentWarning === 'CONTENT_WARNING_NSFW') {
        return false;
      }

      return true;
    });
  }, [availableExtensions, extensionSearch, selectedLang, statusFilter, showNsfw, installedExtensions]);

  // Languages list dynamically extracted from available extensions
  const languagesList = useMemo(() => {
    const langCounts = {};
    availableExtensions.forEach(e => {
      const l = (e.lang || 'all').toLowerCase();
      langCounts[l] = (langCounts[l] || 0) + 1;
    });
    const sorted = Object.keys(langCounts).sort((a, b) => {
      if (a === 'all') return -1;
      if (b === 'all') return 1;
      if (a === 'en') return -1;
      if (b === 'en') return 1;
      return langCounts[b] - langCounts[a];
    });
    return sorted.slice(0, 15);
  }, [availableExtensions]);

  // Open Source Browser modal
  const handleOpenSourceBrowse = async (source, mode = 'popular') => {
    setBrowsingSource({ source, mode });
    setSourceQuery('');
    setLoadingSourceManga(true);
    setSourceMangaList([]);

    try {
      const sourceId = source.sources[0]?.id || source.name.toLowerCase();
      const list = mode === 'latest' 
        ? await fetchSourceLatest(sourceId) 
        : await fetchSourcePopular(sourceId);
      setSourceMangaList(list);
    } catch (err) {
      console.warn('Source browse error:', err);
      setSourceMangaList([]);
    } finally {
      setLoadingSourceManga(false);
    }
  };

  // Search inside currently open Source Browser
  const handleSourceSearch = async (e) => {
    e.preventDefault();
    if (!browsingSource) return;
    setLoadingSourceManga(true);
    try {
      const sourceId = browsingSource.source.sources[0]?.id || browsingSource.source.name.toLowerCase();
      const list = await searchSourceManga(sourceId, sourceQuery);
      setSourceMangaList(list);
    } finally {
      setLoadingSourceManga(false);
    }
  };

  // Handle Global Multi-Source Search
  const handleExecuteGlobalSearch = async (e) => {
    e.preventDefault();
    if (!globalQuery.trim()) return;

    setSearchingGlobal(true);
    setGlobalSearchActive(true);
    setGlobalResults([]);

    try {
      const results = await searchAllInstalledSources(globalQuery.trim());
      setGlobalResults(results);
    } finally {
      setSearchingGlobal(false);
    }
  };

  // Pinned vs Non-pinned installed extensions
  const { pinnedSources, unpinnedSources } = useMemo(() => {
    const pinned = [];
    const unpinned = [];
    installedExtensions.forEach(ext => {
      if (ext.isPinned) pinned.push(ext);
      else unpinned.push(ext);
    });
    return { pinnedSources: pinned, unpinnedSources: unpinned };
  }, [installedExtensions]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* ----------------- TOP HERO HUD & NAVIGATION ----------------- */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-950 via-[#0d1322] to-slate-950 border border-cyan-500/20 shadow-2xl overflow-hidden holo-card">
        {/* Futuristic Grid Accent Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d40a_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-cyan-400 animate-pulse" />
                MIHON_EXTENSION_CORE // v2.4
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                • KEIYOUSHI REPO COMPATIBLE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Outfit'] flex items-center gap-3">
              <span>Sources & Extensions Deck</span>
              <Layers className="w-6 h-6 text-rose-500 fill-rose-500/20" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Connect Mihon & Tachiyomi extension repositories, install community scrapers, and browse multi-feed manga catalogs directly in your browser.
            </p>
          </div>

          {/* Quick HUD Metrics & Sync All */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-white/10 shadow-inner flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div>
                <div className="text-[10px] text-slate-400 font-mono">INSTALLED</div>
                <div className="text-sm font-bold text-white font-mono">{installedExtensions.length} Sources</div>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-white/10 shadow-inner flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-[10px] text-slate-400 font-mono">REPOSITORIES</div>
                <div className="text-sm font-bold text-white font-mono">{repositories.length} Active</div>
              </div>
            </div>

            <button
              onClick={handleSyncAll}
              disabled={isSyncingRepos}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Sync all connected repositories"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingRepos ? 'animate-spin' : ''}`} />
              <span>{isSyncingRepos ? 'Syncing...' : 'Sync Repos'}</span>
            </button>
          </div>
        </div>

        {/* Mihon Segmented Tabs Switcher */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none font-mono">
          {[
            { id: 'sources', label: 'Installed Sources', icon: Radio, count: installedExtensions.length },
            { id: 'extensions', label: 'Extension Store', icon: Download, count: availableExtensions.length || '1.6k+' },
            { id: 'repositories', label: 'Repositories', icon: Globe, count: repositories.length }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'btn-holo text-white shadow-lg ring-2 ring-cyan-400/80 shadow-cyan-500/25 bg-cyan-950/80'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-cyan-500/30 text-cyan-200' : 'bg-white/5 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ----------------- TAB 1: INSTALLED SOURCES ----------------- */}
      {activeSubTab === 'sources' && (
        <div className="space-y-6">
          
          {/* Multi-Source Search & Global Query Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-white/10 shadow-lg space-y-3">
            <form onSubmit={handleExecuteGlobalSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" />
                <input
                  type="text"
                  value={globalQuery}
                  onChange={(e) => setGlobalQuery(e.target.value)}
                  placeholder="Global Search: Query all installed sources simultaneously (e.g. Solo Leveling, One Piece)..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all font-sans"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={searchingGlobal || !globalQuery.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-cyan-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 flex-shrink-0"
                >
                  {searchingGlobal ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-white fill-white" />
                  )}
                  <span>Global Search</span>
                </button>

                {globalSearchActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setGlobalSearchActive(false);
                      setGlobalQuery('');
                      setGlobalResults([]);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Global Search Results Panel */}
            {globalSearchActive && (
              <div className="pt-3 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-300 font-bold">
                    RESULTS ACROSS {installedExtensions.filter(e => e.enabled).length} ACTIVE SOURCES:
                  </span>
                  <span className="text-slate-400">{globalResults.length} titles found</span>
                </div>

                {searchingGlobal ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
                    <p className="text-xs text-slate-400 font-mono">Querying installed scrapers concurrently...</p>
                  </div>
                ) : globalResults.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-sm">
                    No results found across your installed sources for "{globalQuery}".
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {globalResults.map(item => (
                      <div key={`${item.extensionPkg}_${item.id}`} className="relative group">
                        <MangaCard manga={item} onSelect={onSelectManga} />
                        <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-slate-950/90 text-cyan-300 border border-cyan-400/40 backdrop-blur-md shadow-md pointer-events-none">
                          {item.extensionName || item.sourceName}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pinned Sources Shelf (Mihon-Style Top Row) */}
          {pinnedSources.length > 0 && !globalSearchActive && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 tracking-wider">
                <Pin className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>PINNED SOURCES</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pinnedSources.map(ext => (
                  <SourceDeckCard
                    key={ext.pkg}
                    extension={ext}
                    onOpenBrowse={handleOpenSourceBrowse}
                    onTogglePin={togglePinExtension}
                    onToggleActive={toggleExtensionState}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Installed Sources */}
          {!globalSearchActive && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 tracking-wider">
                <span className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ALL INSTALLED SOURCES ({installedExtensions.length})</span>
                </span>
                <button
                  onClick={() => setActiveSubTab('extensions')}
                  className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Install More Sources</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(unpinnedSources.length > 0 ? unpinnedSources : installedExtensions).map(ext => (
                  <SourceDeckCard
                    key={ext.pkg}
                    extension={ext}
                    onOpenBrowse={handleOpenSourceBrowse}
                    onTogglePin={togglePinExtension}
                    onToggleActive={toggleExtensionState}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB 2: EXTENSION STORE ----------------- */}
      {activeSubTab === 'extensions' && (
        <div className="space-y-6">
          
          {/* Controls Bar: Search, Language, Status, NSFW */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-white/10 shadow-lg space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={extensionSearch}
                  onChange={(e) => setExtensionSearch(e.target.value)}
                  placeholder="Filter 1,600+ extensions by name (e.g. MangaDex, MangaKatana, Asura, Flame, Bato)..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all font-sans"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/10 font-mono text-xs">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'installed', label: 'Installed' },
                  { id: 'available', label: 'Available' }
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setStatusFilter(s.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      statusFilter === s.id
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* NSFW Toggle */}
              <button
                type="button"
                onClick={() => setShowNsfw(prev => !prev)}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                  showNsfw
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
                }`}
                title="Toggle 18+ NSFW Extensions"
              >
                {showNsfw ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>18+ NSFW: {showNsfw ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Language Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
              <span className="text-slate-400 mr-1 flex-shrink-0 flex items-center gap-1">
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>LANG::</span>
              </span>
              <button
                onClick={() => setSelectedLang('all')}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedLang === 'all'
                    ? 'bg-cyan-500 text-black'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                All Languages
              </button>
              {languagesList.map(lang => (
                <button
                  key={lang}
                  onClick={() => setSelectedLang(lang)}
                  className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap uppercase transition-all cursor-pointer ${
                    selectedLang === lang
                      ? 'bg-cyan-500 text-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Extensions Catalog Grid */}
          {loadingExtensions ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
              <p className="text-xs text-slate-400 font-mono">Parsing extensions from connected repositories...</p>
            </div>
          ) : filteredExtensions.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-sm space-y-3">
              <p>No extensions found matching your search and language filter.</p>
              <button
                onClick={() => {
                  setExtensionSearch('');
                  setSelectedLang('all');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/40 hover:bg-cyan-500/30 transition-all cursor-pointer"
              >
                Reset Store Filters
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-1">
                <span>SHOWING {filteredExtensions.length} EXTENSIONS</span>
                <span>STORE CATALOG: ONLINE</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredExtensions.map(ext => {
                  const isInstalled = installedExtensions.some(e => e.pkg === ext.pkg);
                  const isInstalling = installingPkgs[ext.pkg];

                  return (
                    <div
                      key={ext.pkg}
                      className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-cyan-500/30 transition-all flex items-center justify-between gap-3 shadow-sm group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Extension Icon with Fallback */}
                        <div className="w-11 h-11 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {ext.iconUrl ? (
                            <img
                              src={ext.iconUrl}
                              alt={ext.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full hidden items-center justify-center text-sm font-extrabold text-cyan-300 font-mono">
                            {ext.name.slice(0, 2).toUpperCase()}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                              {ext.name}
                            </h3>
                            {ext.contentWarning === 'CONTENT_WARNING_NSFW' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                18+
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                            <span className="uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                              {ext.lang || 'ALL'}
                            </span>
                            <span>v{ext.versionName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex-shrink-0">
                        {isInstalled ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-mono flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="hidden sm:inline">Installed</span>
                            </span>
                            <button
                              onClick={() => handleUninstall(ext.pkg)}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 transition-all cursor-pointer"
                              title="Uninstall extension"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleInstallExtension(ext)}
                            disabled={isInstalling}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isInstalling ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            <span>{isInstalling ? 'Installing' : 'Install'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB 3: REPOSITORIES ----------------- */}
      {activeSubTab === 'repositories' && (
        <div className="space-y-6">
          
          {/* Add Custom Repo Form */}
          <div className="p-6 rounded-3xl bg-slate-950/90 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white font-['Outfit']">
                Connect New Extension Repository
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Paste the URL of any Mihon or Tachiyomi-compatible repository index (e.g. GitHub raw, Gitea, or custom self-hosted JSON endpoint).
            </p>

            <form onSubmit={handleAddCustomRepo} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    REPOSITORY MANIFEST URL (.json) *
                  </label>
                  <input
                    type="url"
                    value={newRepoUrl}
                    onChange={(e) => setNewRepoUrl(e.target.value)}
                    placeholder="https://raw.githubusercontent.com/.../index.json"
                    required
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    CUSTOM NAME (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={newRepoName}
                    onChange={(e) => setNewRepoName(e.target.value)}
                    placeholder="e.g. My Custom Repo"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
                  />
                </div>
              </div>

              {repoAddError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{repoAddError}</span>
                </div>
              )}

              {repoAddSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{repoAddSuccess}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isAddingRepo || !newRepoUrl.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isAddingRepo ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>{isAddingRepo ? 'Validating & Adding...' : 'Add Repository'}</span>
                </button>

                {/* Pre-fill Keiyoushi Helper */}
                <button
                  type="button"
                  onClick={() => {
                    setNewRepoUrl('https://raw.githubusercontent.com/keiyoushi/extensions/repo/index.json');
                    setNewRepoName('Keiyoushi Official');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono transition-all border border-white/10 cursor-pointer"
                >
                  Quick Fill Keiyoushi URL
                </button>
              </div>
            </form>
          </div>

          {/* Active Connected Repositories List */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-400 tracking-wider">
              CONNECTED REPOSITORIES ({repositories.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {repositories.map(repo => (
                <div
                  key={repo.id}
                  className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 shadow-md space-y-3 relative group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        <Globe className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white font-['Outfit']">
                            {repo.name}
                          </h4>
                          {repo.isOfficial && (
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              OFFICIAL
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 truncate max-w-xs mt-0.5">
                          {repo.url}
                        </p>
                      </div>
                    </div>

                    {!repo.isOfficial && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove repository "${repo.name}"?`)) {
                            removeRepository(repo.id);
                            refreshRepos();
                          }
                        }}
                        className="p-2 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer"
                        title="Remove custom repository"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{repo.extensionsCount || '1.6k+'} extensions available</span>
                    </span>
                    {repo.website && (
                      <a
                        href={repo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-cyan-300 flex items-center gap-1 transition-colors"
                      >
                        <span>Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SOURCE BROWSER MODAL (POPULAR / LATEST / SEARCH) ----------------- */}
      {browsingSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-5xl max-h-[92vh] rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-2xl flex flex-col overflow-hidden holo-card">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-900/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-950 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {browsingSource.source.iconUrl ? (
                    <img src={browsingSource.source.iconUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Radio className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-['Outfit']">
                    <span>{browsingSource.source.name}</span>
                    <span className="text-xs font-mono font-normal text-cyan-400 uppercase">
                      [{browsingSource.mode.toUpperCase()}]
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Scraping live from {browsingSource.source.sources[0]?.homeUrl || 'extension feed'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Switch between Popular and Latest */}
                <button
                  onClick={() => handleOpenSourceBrowse(browsingSource.source, browsingSource.mode === 'popular' ? 'latest' : 'popular')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 font-bold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-cyan-400" />
                  <span>Switch to {browsingSource.mode === 'popular' ? 'Latest' : 'Popular'}</span>
                </button>

                <button
                  onClick={() => setBrowsingSource(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* In-Source Search Bar */}
            <div className="p-3 sm:p-4 bg-slate-900/40 border-b border-white/5">
              <form onSubmit={handleSourceSearch} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={sourceQuery}
                    onChange={(e) => setSourceQuery(e.target.value)}
                    placeholder={`Search titles exclusively within ${browsingSource.source.name}...`}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Modal Body: Manga Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
              {loadingSourceManga ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  <p className="text-xs text-slate-400 font-mono">Fetching catalog directly from {browsingSource.source.name}...</p>
                </div>
              ) : sourceMangaList.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-sm">
                  No manga found from {browsingSource.source.name} for this query.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {sourceMangaList.map(manga => (
                    <MangaCard
                      key={manga.id}
                      manga={manga}
                      onSelect={(id, cover) => {
                        setBrowsingSource(null);
                        onSelectManga(id, cover);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ----------------- COMPONENT: SOURCE DECK CARD -----------------
function SourceDeckCard({ extension, onOpenBrowse, onTogglePin, onToggleActive }) {
  const isPinned = !!extension.isPinned;
  const isEnabled = extension.enabled !== false;
  const sourceName = extension.name;
  const lang = (extension.lang || 'all').toUpperCase();
  const primarySource = extension.sources?.[0];

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-3 shadow-md group ${
      isPinned 
        ? 'bg-slate-900/90 border-amber-500/40 hover:border-amber-400 shadow-amber-500/5' 
        : 'bg-slate-900/70 border-white/10 hover:border-cyan-500/30'
    }`}>
      
      {/* Top Details */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
            {extension.iconUrl ? (
              <img src={extension.iconUrl} alt={sourceName} className="w-full h-full object-cover" />
            ) : (
              <Radio className="w-5 h-5 text-cyan-400" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors font-['Outfit']">
              {sourceName}
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                {lang}
              </span>
              {primarySource?.badge && (
                <span className="text-cyan-400 font-bold">{primarySource.badge}</span>
              )}
            </div>
          </div>
        </div>

        {/* Pin Button */}
        <button
          onClick={() => onTogglePin(extension.pkg)}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            isPinned 
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
              : 'text-slate-500 hover:text-slate-300 border-transparent hover:border-white/10'
          }`}
          title={isPinned ? 'Unpin source' : 'Pin source to top'}
        >
          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400' : ''}`} />
        </button>
      </div>

      {/* Action Buttons: Browse Popular / Latest / Search */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 font-mono text-xs">
        <button
          onClick={() => onOpenBrowse(extension, 'popular')}
          className="px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold"
        >
          <Flame className="w-3 h-3 text-cyan-400 fill-cyan-400" />
          <span>Popular</span>
        </button>

        <button
          onClick={() => onOpenBrowse(extension, 'latest')}
          className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold"
        >
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Latest</span>
        </button>
      </div>

    </div>
  );
}
