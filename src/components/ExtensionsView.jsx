import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  ChevronDown,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  BookOpen,
  Smartphone
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
  flattenExtensionSources,
  fetchSourcePopular,
  fetchSourceLatest,
  searchSourceManga,
  searchAllInstalledSources,
  searchNsfwSources,
  fetchNsfwPopular,
  fetchNsfwLatest,
  DEFAULT_REPOSITORIES,
  isNsfwAllowed,
  setNsfwAllowed
} from '../services/extensionManager';
import { triggerFileDownload } from '../services/downloadManager';
import MangaCard from './MangaCard';

function extractDomain(url) {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return String(url).replace(/^https?:\/\//i, '').split('/')[0];
  }
}

export default function ExtensionsView({
  onSelectManga,
  onOpenReader,
  initialSubTab = null,
  initialNsfwQuery = '',
  launchKey = 0
}) {
  // Navigation Tabs: 'sources' | 'nsfw' | 'extensions' | 'repositories'
  const [activeSubTab, setActiveSubTab] = useState(() => initialSubTab || 'sources');
  const [sourcesViewMode, setSourcesViewMode] = useState('grouped'); // 'grouped' | 'individual'
  const [expandedStorePkgs, setExpandedStorePkgs] = useState({});

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
  const [showNsfw, setShowNsfw] = useState(() => isNsfwAllowed());

  const handleToggleNsfw = () => {
    const nextVal = !showNsfw;
    setShowNsfw(nextVal);
    setNsfwAllowed(nextVal);
  };

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

  // Dedicated 18+ NSFW Search State
  const [sourceSearchMode, setSourceSearchMode] = useState('standard'); // 'standard' | 'nsfw'
  const [nsfwQuery, setNsfwQuery] = useState('');
  const [nsfwResults, setNsfwResults] = useState([]);
  const [searchingNsfw, setSearchingNsfw] = useState(false);
  const [nsfwSearchActive, setNsfwSearchActive] = useState(false);
  const [nsfwFeedMode, setNsfwFeedMode] = useState('popular'); // 'popular' | 'latest' | 'search'
  const [loadingNsfwFeed, setLoadingNsfwFeed] = useState(false);
  const [nsfwPopularList, setNsfwPopularList] = useState([]);

  const nsfwSearchSeq = useRef(0);
  const browseSeqRef = useRef(0);
  const globalSearchSeqRef = useRef(0);
  const hasAttemptedNsfwFeedRef = useRef(false);
  const nsfwQueryRef = useRef(nsfwQuery);
  useEffect(() => {
    nsfwQueryRef.current = nsfwQuery;
  }, [nsfwQuery]);

  // Handle Dedicated 18+ NSFW Search
  const handleExecuteNsfwSearch = useCallback(async (e, directQuery = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const queryToUse = directQuery !== null ? String(directQuery) : nsfwQueryRef.current;
    if (!queryToUse.trim()) return;

    const currentSeq = ++nsfwSearchSeq.current;

    setShowNsfw(true);
    setNsfwAllowed(true);

    setSearchingNsfw(true);
    setNsfwSearchActive(true);
    setNsfwResults([]);
    setNsfwFeedMode('search');

    try {
      const results = await searchNsfwSources(queryToUse.trim());
      if (currentSeq === nsfwSearchSeq.current) {
        setNsfwResults(results);
      }
    } finally {
      if (currentSeq === nsfwSearchSeq.current) {
        setSearchingNsfw(false);
      }
    }
  }, []);

  // Sync external initialSubTab / initialNsfwQuery launch props
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
      if (initialSubTab === 'nsfw') {
        setShowNsfw(true);
        setNsfwAllowed(true);
      }
    }
    if (initialNsfwQuery && initialNsfwQuery.trim()) {
      const q = initialNsfwQuery.trim();
      setActiveSubTab('nsfw');
      setNsfwQuery(q);
      handleExecuteNsfwSearch(null, q);
    }
  }, [initialSubTab, initialNsfwQuery, launchKey, handleExecuteNsfwSearch]);

  // Load 18+ NSFW Popular or Latest Feed
  const handleLoadNsfwFeed = useCallback(async (mode = 'popular') => {
    setLoadingNsfwFeed(true);
    setNsfwFeedMode(mode);
    try {
      const list = mode === 'latest' ? await fetchNsfwLatest() : await fetchNsfwPopular();
      setNsfwPopularList(list);
    } finally {
      setLoadingNsfwFeed(false);
    }
  }, []);

  // When switching to the dedicated 'nsfw' tab, load popular feed once safely if 18+ mode is enabled
  useEffect(() => {
    if (activeSubTab === 'nsfw' && showNsfw && !hasAttemptedNsfwFeedRef.current && !loadingNsfwFeed && !initialNsfwQuery?.trim()) {
      hasAttemptedNsfwFeedRef.current = true;
      handleLoadNsfwFeed('popular');
    }
  }, [activeSubTab, showNsfw, loadingNsfwFeed, handleLoadNsfwFeed, initialNsfwQuery]);

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
      setShowNsfw(isNsfwAllowed());
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

    // Enrich already-installed extensions with apkUrl/jarUrl/full multi-sources from live repos
    if (combined.length > 0) {
      const byPkg = new Map(combined.map(c => [c.pkg, c]));
      const byName = new Map(combined.map(c => [String(c.name || '').toLowerCase(), c]));
      const curInstalled = getInstalledExtensions();
      let changed = false;
      const enriched = curInstalled.map(inst => {
        const match = byPkg.get(inst.pkg) || byName.get(String(inst.name || '').toLowerCase());
        if (!match) return inst;
        const nextApk = inst.apkUrl || match.apkUrl || null;
        const nextJar = inst.jarUrl || match.jarUrl || null;
        const nextSources = (Array.isArray(match.sources) && match.sources.length > (inst.sources?.length || 0))
          ? match.sources
          : inst.sources;
        if (nextApk !== inst.apkUrl || nextJar !== inst.jarUrl || nextSources !== inst.sources) {
          changed = true;
          return { ...inst, apkUrl: nextApk, jarUrl: nextJar, sources: nextSources };
        }
        return inst;
      });
      if (changed) {
        try {
          window.localStorage.setItem('mihon_installed_extensions_v1', JSON.stringify(enriched));
          setInstalledExtensions(enriched);
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    if ((activeSubTab === 'extensions' || activeSubTab === 'sources') && availableExtensions.length === 0) {
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
      // Search query filter (match extension name, pkg, or any provided sub-source name/homeUrl)
      if (q) {
        const matchName = ext.name.toLowerCase().includes(q);
        const matchPkg = ext.pkg.toLowerCase().includes(q);
        const matchSubSource = Array.isArray(ext.sources) && ext.sources.some(s =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.homeUrl && s.homeUrl.toLowerCase().includes(q))
        );
        if (!matchName && !matchPkg && !matchSubSource) return false;
      }

      // Language filter (match extension primary lang or any provided sub-source language)
      if (selectedLang !== 'all') {
        const targetLang = selectedLang.toLowerCase();
        const extLang = (ext.lang || '').toLowerCase();
        const matchSubLang = Array.isArray(ext.sources) && ext.sources.some(s =>
          (s.language || '').toLowerCase() === targetLang
        );
        if (extLang !== targetLang && !matchSubLang) return false;
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
  const handleOpenSourceBrowse = async (extension, mode = 'popular', targetSource = null, customQuery = '') => {
    const reqSeq = ++browseSeqRef.current;
    const subSrc = targetSource
      || extension.sources?.[0]
      || { id: (extension.name || '').toLowerCase(), name: extension.name, language: extension.lang || 'all', homeUrl: '' };

    const sourceMeta = {
      ...subSrc,
      contentWarning: extension.contentWarning,
      isNsfw: extension.contentWarning === 'CONTENT_WARNING_NSFW' || Boolean(subSrc.isNsfw)
    };

    setBrowsingSource({ source: extension, mode, activeSubSource: subSrc });
    if (!customQuery) {
      setSourceQuery('');
    }
    setLoadingSourceManga(true);
    setSourceMangaList([]);

    try {
      const sourceId = subSrc.id || extension.name.toLowerCase();
      let list;
      if (mode === 'search' && customQuery.trim()) {
        list = await searchSourceManga(sourceId, customQuery.trim(), sourceMeta);
      } else {
        list = mode === 'latest'
          ? await fetchSourceLatest(sourceId, sourceMeta)
          : await fetchSourcePopular(sourceId, sourceMeta);
      }
      if (reqSeq === browseSeqRef.current) {
        setSourceMangaList(list);
      }
    } catch (err) {
      console.warn('Source browse error:', err);
      if (reqSeq === browseSeqRef.current) {
        setSourceMangaList([]);
      }
    } finally {
      if (reqSeq === browseSeqRef.current) {
        setLoadingSourceManga(false);
      }
    }
  };

  // Search inside currently open Source Browser
  const handleSourceSearch = async (e) => {
    e.preventDefault();
    if (!browsingSource) return;
    const reqSeq = ++browseSeqRef.current;
    setLoadingSourceManga(true);
    try {
      const subSrc = browsingSource.activeSubSource
        || browsingSource.source.sources?.[0]
        || { id: browsingSource.source.name.toLowerCase(), name: browsingSource.source.name };
      const sourceMeta = {
        ...subSrc,
        contentWarning: browsingSource.source.contentWarning,
        isNsfw: browsingSource.source.contentWarning === 'CONTENT_WARNING_NSFW' || Boolean(subSrc.isNsfw)
      };
      const sourceId = subSrc.id || browsingSource.source.name.toLowerCase();
      setBrowsingSource((prev) => (prev ? { ...prev, mode: sourceQuery.trim() ? 'search' : 'popular' } : prev));
      const list = await searchSourceManga(sourceId, sourceQuery, sourceMeta);
      if (reqSeq === browseSeqRef.current) {
        setSourceMangaList(list);
      }
    } finally {
      if (reqSeq === browseSeqRef.current) {
        setLoadingSourceManga(false);
      }
    }
  };

  // Handle Global Multi-Source Search
  const handleExecuteGlobalSearch = async (e) => {
    e.preventDefault();
    if (!globalQuery.trim()) return;
    const reqSeq = ++globalSearchSeqRef.current;

    setSearchingGlobal(true);
    setGlobalSearchActive(true);
    setGlobalResults([]);

    try {
      const results = await searchAllInstalledSources(globalQuery.trim());
      if (reqSeq === globalSearchSeqRef.current) {
        setGlobalResults(results);
      }
    } finally {
      if (reqSeq === globalSearchSeqRef.current) {
        setSearchingGlobal(false);
      }
    }
  };

  // Flattened individual sub-sources across installed extensions
  const flattenedSources = useMemo(() => {
    return flattenExtensionSources(installedExtensions, showNsfw) || [];
  }, [installedExtensions, showNsfw]);

  // Pinned vs Non-pinned installed extensions filtered by user NSFW preference
  const { pinnedSources, unpinnedSources, hiddenNsfwCount } = useMemo(() => {
    const pinned = [];
    const unpinned = [];
    let hiddenCount = 0;
    installedExtensions.forEach(ext => {
      if (!showNsfw && ext.contentWarning === 'CONTENT_WARNING_NSFW') {
        hiddenCount++;
        return;
      }
      if (ext.isPinned) pinned.push(ext);
      else unpinned.push(ext);
    });
    return { pinnedSources: pinned, unpinnedSources: unpinned, hiddenNsfwCount: hiddenCount };
  }, [installedExtensions, showNsfw]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* ----------------- TOP HERO HEADER & NAVIGATION ----------------- */}
      <div className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-[#0d1222]/90 border border-white/10 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-rose-400" />
                Mihon & Tachiyomi Ecosystem
              </span>
              <span className="text-xs text-slate-400">
                • Keiyoushi Repository Compatible
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
                <div className="text-sm font-bold text-white font-mono">
                  {installedExtensions.length} Ext • {flattenedSources.length} Sources
                </div>
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
            { id: 'sources', label: 'Installed Sources', icon: Radio, count: flattenedSources.length },
            { id: 'nsfw', label: '18+ NSFW Search', icon: ShieldAlert, count: '18+', isNsfwTab: true },
            { id: 'extensions', label: 'Extension Store', icon: Download, count: availableExtensions.length || '1.6k+' },
            { id: 'repositories', label: 'Repositories', icon: Globe, count: repositories.length }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id);
                }}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? tab.isNsfwTab
                      ? 'bg-rose-950/90 text-white shadow-lg ring-2 ring-rose-500/80 shadow-rose-500/25 border border-rose-500/50'
                      : 'btn-holo text-white shadow-lg ring-2 ring-cyan-400/80 shadow-cyan-500/25 bg-cyan-950/80'
                    : tab.isNsfwTab
                      ? 'bg-rose-950/30 text-rose-300 hover:text-white hover:bg-rose-900/50 border border-rose-500/30'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? (tab.isNsfwTab ? 'text-rose-400' : 'text-cyan-300') : (tab.isNsfwTab ? 'text-rose-400/80' : 'text-slate-400')}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive 
                    ? (tab.isNsfwTab ? 'bg-rose-500/30 text-rose-200' : 'bg-cyan-500/30 text-cyan-200')
                    : (tab.isNsfwTab ? 'bg-rose-500/10 text-rose-300' : 'bg-white/5 text-slate-400')
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
          
          {/* Multi-Source Search & Global Query Bar with Standard vs NSFW Search Switch */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-white/10 shadow-lg space-y-3">
            
            {/* Search Mode Segmented Switch: Standard vs 18+ NSFW */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-white/5">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setSourceSearchMode('standard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    sourceSearchMode === 'standard'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Standard Sources Search</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSourceSearchMode('nsfw');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    sourceSearchMode === 'nsfw'
                      ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                      : 'text-rose-400/80 hover:text-rose-300'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
                  <span>18+ NSFW Sources Search</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-200 font-black">18+</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubTab('nsfw');
                    if (!showNsfw) {
                      setShowNsfw(true);
                      setNsfwAllowed(true);
                    }
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer font-mono font-semibold"
                >
                  <span>Open Full 18+ NSFW Deck</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Standard Search Form */}
            {sourceSearchMode === 'standard' && (
              <form onSubmit={handleExecuteGlobalSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" />
                  <input
                    type="text"
                    value={globalQuery}
                    onChange={(e) => setGlobalQuery(e.target.value)}
                    placeholder="Standard Search: Query all installed sources simultaneously (e.g. Solo Leveling, One Piece)..."
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

                  <button
                    type="button"
                    onClick={handleToggleNsfw}
                    className={`px-3 py-2.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                      showNsfw
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
                    }`}
                    title="Toggle 18+ NSFW Sources"
                  >
                    {showNsfw ? (
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>18+ NSFW: {showNsfw ? 'ON' : 'OFF'}</span>
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
            )}

            {/* Separate 18+ NSFW Search Form */}
            {sourceSearchMode === 'nsfw' && (
              <div className="space-y-3">
                <form onSubmit={handleExecuteNsfwSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <ShieldAlert className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400 pointer-events-none" />
                    <input
                      type="text"
                      value={nsfwQuery}
                      onChange={(e) => setNsfwQuery(e.target.value)}
                      placeholder="18+ NSFW Search: Query Manga18fx, DoujinDesu & Adult archives (e.g. Secret, Teacher, Stepmother)..."
                      className="w-full bg-slate-900 border border-rose-500/40 focus:border-rose-400 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none transition-all font-sans ring-1 ring-rose-500/20"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={searchingNsfw || !nsfwQuery.trim()}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-rose-600/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 flex-shrink-0"
                    >
                      {searchingNsfw ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-white" />
                      )}
                      <span>18+ Adult Search</span>
                    </button>

                    {nsfwSearchActive && (
                      <button
                        type="button"
                        onClick={() => {
                          setNsfwSearchActive(false);
                          setNsfwQuery('');
                          setNsfwResults([]);
                        }}
                        className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer"
                        title="Clear 18+ search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </form>

                {/* Quick 18+ Keyword Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                  <span className="text-slate-400 text-[11px] font-bold mr-1">TRENDING 18+::</span>
                  {['Teacher', 'Secret', 'Stepmother', 'Harem', 'Roommate', 'College', 'Romance', 'Manhwa'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setNsfwQuery(tag);
                        handleExecuteNsfwSearch(null, tag);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-[11px] font-medium transition-all cursor-pointer"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!showNsfw && hiddenNsfwCount > 0 && !globalSearchActive && !nsfwSearchActive && (
              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{hiddenNsfwCount} adult (18+ NSFW) sources hidden</span>
                </span>
                <button
                  type="button"
                  onClick={handleToggleNsfw}
                  className="text-rose-400 hover:text-rose-300 font-bold hover:underline cursor-pointer"
                >
                  Enable 18+ Sources
                </button>
              </div>
            )}

            {/* Global Standard Search Results Panel */}
            {sourceSearchMode === 'standard' && globalSearchActive && (
              <div className="pt-3 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-300 font-bold">
                    RESULTS ACROSS {flattenedSources.length} ACTIVE SOURCES:
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
                    {globalResults.map((item, idx) => (
                      <div key={`${item.extensionPkg || item.sourceName}_${item.id}_${idx}`} className="relative group">
                        <MangaCard manga={item} onSelect={onSelectManga} />
                        <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-slate-950/90 text-cyan-300 border border-cyan-400/40 backdrop-blur-md shadow-md pointer-events-none">
                          {item.sourceName || item.extensionName}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Separate 18+ NSFW Search Results Panel */}
            {sourceSearchMode === 'nsfw' && nsfwSearchActive && (
              <div className="pt-3 border-t border-rose-500/20 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-rose-400 font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>18+ NSFW RESULTS (Manga18fx, DoujinDesu, MangaDex Adult):</span>
                  </span>
                  <span className="text-rose-300 font-semibold">{nsfwResults.length} adult titles found</span>
                </div>

                {searchingNsfw ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-7 h-7 text-rose-500 animate-spin" />
                    <p className="text-xs text-rose-300 font-mono">Concurrently querying Manga18fx & Adult feeds...</p>
                  </div>
                ) : nsfwResults.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-sm">
                    No adult titles found for "{nsfwQuery}". Try a broader term like "Teacher", "Secret", or "Harem".
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {nsfwResults.map((item, idx) => (
                      <div key={`${item.sourceName || 'm18'}_${item.id}_${idx}`} className="relative group">
                        <MangaCard manga={item} onSelect={onSelectManga} />
                        <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-md text-[9px] font-mono font-black bg-rose-950/90 text-rose-300 border border-rose-500/50 backdrop-blur-md shadow-md pointer-events-none">
                          {item.sourceName || '18+ Adult'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Segmented View Switcher: Grouped Extensions vs All Individual Sources */}
          {!globalSearchActive && !(sourceSearchMode === 'nsfw' && nsfwSearchActive) && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-white/10 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setSourcesViewMode('grouped')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    sourcesViewMode === 'grouped'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Grouped Extensions ({pinnedSources.length + unpinnedSources.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourcesViewMode('individual')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    sourcesViewMode === 'individual'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>All Individual Sources ({flattenedSources.length})</span>
                </button>
              </div>

              <button
                onClick={() => setActiveSubTab('extensions')}
                className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Install More Sources</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Individual Flattened Sources View */}
          {!globalSearchActive && !(sourceSearchMode === 'nsfw' && nsfwSearchActive) && sourcesViewMode === 'individual' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 tracking-wider">
                <span className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ALL INDIVIDUAL SOURCES ({flattenedSources.length})</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {flattenedSources.map((subSource, idx) => {
                  const parentExt = installedExtensions.find((e) => e.pkg === subSource.extensionPkg) || {
                    pkg: subSource.extensionPkg,
                    name: subSource.extensionName || subSource.name,
                    iconUrl: subSource.iconUrl,
                    apkUrl: subSource.apkUrl,
                    contentWarning: subSource.contentWarning,
                    sources: [subSource]
                  };
                  const domain = extractDomain(subSource.homeUrl);
                  const lang = (subSource.language || 'all').toUpperCase();
                  const isNsfwItem = subSource.isNsfw || subSource.contentWarning === 'CONTENT_WARNING_NSFW';

                  return (
                    <div
                      key={`${subSource.extensionPkg}_${subSource.id}_${idx}`}
                      className="p-4 rounded-2xl border bg-slate-900/75 border-white/10 hover:border-cyan-500/35 transition-all flex flex-col justify-between gap-3 shadow-md group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {subSource.iconUrl ? (
                              <img src={subSource.iconUrl} alt={subSource.name} className="w-full h-full object-cover" />
                            ) : (
                              <Radio className="w-5 h-5 text-cyan-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors font-['Outfit']">
                                {subSource.name}
                              </h3>
                              {isNsfwItem && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                  18+
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mt-0.5 flex-wrap">
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-200 font-bold">
                                {lang}
                              </span>
                              {domain && (
                                <span className="text-slate-400 truncate max-w-[140px]" title={subSource.homeUrl}>
                                  {domain}
                                </span>
                              )}
                            </div>
                            {subSource.extensionName && subSource.extensionName !== subSource.name && (
                              <div className="text-[10px] text-cyan-400/80 font-mono truncate mt-0.5">
                                {subSource.extensionName}
                              </div>
                            )}
                          </div>
                        </div>

                        {subSource.apkUrl && (
                          <button
                            type="button"
                            onClick={() => triggerFileDownload(subSource.apkUrl, `${subSource.extensionPkg || subSource.name}.apk`)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer flex-shrink-0"
                            title="Download Extension APK"
                            aria-label={`Download ${subSource.extensionName || subSource.name} APK`}
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 font-mono text-xs">
                        <button
                          type="button"
                          onClick={() => handleOpenSourceBrowse(parentExt, 'popular', subSource)}
                          className="px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold"
                        >
                          <Flame className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                          <span>Popular</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenSourceBrowse(parentExt, 'latest', subSource)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold"
                        >
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Latest</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pinned Sources Shelf (Mihon-Style Top Row) */}
          {pinnedSources.length > 0 && !globalSearchActive && !(sourceSearchMode === 'nsfw' && nsfwSearchActive) && sourcesViewMode === 'grouped' && (
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
                    showNsfw={showNsfw}
                    onOpenBrowse={handleOpenSourceBrowse}
                    onTogglePin={togglePinExtension}
                    onToggleActive={toggleExtensionState}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Installed Sources */}
          {!globalSearchActive && !(sourceSearchMode === 'nsfw' && nsfwSearchActive) && sourcesViewMode === 'grouped' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 tracking-wider">
                <span className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ALL INSTALLED EXTENSIONS ({pinnedSources.length + unpinnedSources.length})</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {unpinnedSources.map(ext => (
                  <SourceDeckCard
                    key={ext.pkg}
                    extension={ext}
                    showNsfw={showNsfw}
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

      {/* ----------------- TAB 2: DEDICATED 18+ NSFW SEARCH & DECK ----------------- */}
      {activeSubTab === 'nsfw' && !showNsfw && (
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-rose-950/60 via-slate-950/95 to-slate-950 border border-rose-500/30 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7 text-rose-400" />
          </div>
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
              18+ NSFW Sources Are Currently Hidden
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Adult (18+) manga, manhwa, and doujinshi search is opt-in so your main library and Safe Mode search stay clean. Enable 18+ Mode if you want to browse and search adult sources.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setShowNsfw(true);
                setNsfwAllowed(true);
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Enable 18+ NSFW Search</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('sources')}
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              Stay in Safe Mode
            </button>
          </div>
        </div>
      )}

      {activeSubTab === 'nsfw' && showNsfw && (
        <div className="space-y-6">
          {/* Hero Banner for 18+ NSFW Search Engine */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-rose-950/80 via-slate-950/95 to-slate-950 border border-rose-500/30 shadow-2xl relative overflow-hidden space-y-5">
            <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 font-mono">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    ADULT CONTENT ENGINE
                  </span>
                  <span className="text-xs text-rose-300/80 font-mono">
                    • Manga18fx & MangaDex Erotica
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Outfit'] flex items-center gap-2.5">
                  <span>18+ NSFW Sources Search Engine</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Search exclusively across adult manhwa, webtoons, and doujinshi from Manga18fx, DoujinDesu, and the MangaDex 18+ archive with zero safe filter pollution.
                </p>
              </div>

              {/* Feed Switcher: Popular vs Latest */}
              <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-white/10 font-mono text-xs flex-shrink-0 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => handleLoadNsfwFeed('popular')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    nsfwFeedMode === 'popular'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Trending 18+</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadNsfwFeed('latest')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    nsfwFeedMode === 'latest'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Latest Releases</span>
                </button>
              </div>
            </div>

            {/* Dedicated 18+ Search Bar */}
            <form onSubmit={handleExecuteNsfwSearch} className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <ShieldAlert className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400 pointer-events-none" />
                <input
                  type="text"
                  value={nsfwQuery}
                  onChange={(e) => setNsfwQuery(e.target.value)}
                  placeholder="Query adult titles (e.g. Teacher, Secret, Stepmother, Harem, Roommate, College)..."
                  className="w-full bg-slate-900/90 border border-rose-500/40 focus:border-rose-400 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none transition-all font-sans ring-1 ring-rose-500/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={searchingNsfw || !nsfwQuery.trim()}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold transition-all shadow-xl shadow-rose-600/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 flex-shrink-0"
                >
                  {searchingNsfw ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Search className="w-4 h-4 text-white" />
                  )}
                  <span>Search 18+ Sources</span>
                </button>

                {nsfwFeedMode === 'search' && (
                  <button
                    type="button"
                    onClick={() => {
                      setNsfwQuery('');
                      setNsfwResults([]);
                      handleLoadNsfwFeed('popular');
                    }}
                    className="p-3 rounded-2xl bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer"
                    title="Return to Trending"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Quick 18+ Tag Shortcuts */}
            <div className="relative z-10 flex flex-wrap items-center gap-1.5 text-xs font-mono pt-1">
              <span className="text-slate-400 text-[11px] font-bold mr-1">QUICK TAGS::</span>
              {['Teacher', 'Secret', 'Stepmother', 'Harem', 'Roommate', 'College', 'Romance', 'Manhwa', 'Neighbor', 'Office'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setNsfwQuery(tag);
                    handleExecuteNsfwSearch(null, tag);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-500/30 text-[11px] font-medium transition-all cursor-pointer hover:border-rose-400/50"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* 18+ Content Display Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-rose-400 font-bold flex items-center gap-2 tracking-wider">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>
                  {nsfwFeedMode === 'search'
                    ? `SEARCH RESULTS FOR "${nsfwQuery}" (${nsfwResults.length})`
                    : nsfwFeedMode === 'latest'
                      ? `LATEST 18+ RELEASES (${nsfwPopularList.length})`
                      : `TRENDING 18+ MANHWA & DOUJIN (${nsfwPopularList.length})`}
                </span>
              </span>

              {nsfwFeedMode === 'search' && (
                <button
                  onClick={() => handleLoadNsfwFeed('popular')}
                  className="text-xs text-rose-400 hover:underline cursor-pointer"
                >
                  ← Back to Trending
                </button>
              )}
            </div>

            {(searchingNsfw || loadingNsfwFeed) ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                <p className="text-xs text-rose-300 font-mono">Retrieving adult titles from Manga18fx & Adult feeds...</p>
              </div>
            ) : (nsfwFeedMode === 'search' ? nsfwResults : nsfwPopularList).length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm space-y-2">
                <p>No adult titles found matching your search.</p>
                <p className="text-xs text-slate-500">Try one of the trending tags above or click Trending 18+.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                {(nsfwFeedMode === 'search' ? nsfwResults : nsfwPopularList).map((manga, idx) => (
                  <div key={`${manga.sourceName || 'm18'}_${manga.id}_${idx}`} className="relative group">
                    <MangaCard manga={manga} onSelect={onSelectManga} />
                    <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-md text-[9px] font-mono font-black bg-rose-950/90 text-rose-300 border border-rose-500/50 backdrop-blur-md shadow-md pointer-events-none">
                      {manga.sourceName || '18+ Adult'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
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
                onClick={handleToggleNsfw}
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
                {filteredExtensions.map(ext => {
                  const installedExt = installedExtensions.find(e => e.pkg === ext.pkg);
                  const isInstalled = Boolean(installedExt);
                  const isInstalling = installingPkgs[ext.pkg];
                  const rawSourcesList = Array.isArray(ext.sources) ? ext.sources : [];
                  const sourcesList = showNsfw ? rawSourcesList : rawSourcesList.filter(s => !s?.isNsfw);
                  const isExpanded = Boolean(expandedStorePkgs[ext.pkg]);

                  return (
                    <div
                      key={ext.pkg}
                      className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col gap-3 shadow-sm group"
                    >
                      <div className="flex items-start justify-between gap-3">
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
                                  if (e.currentTarget.nextElementSibling) {
                                    e.currentTarget.nextElementSibling.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full items-center justify-center text-sm font-extrabold text-cyan-300 font-mono ${ext.iconUrl ? 'hidden' : 'flex'}`}>
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
                              {sourcesList.length > 1 && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                                  {sourcesList.length} sources
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

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                          {ext.apkUrl && (
                            <button
                              type="button"
                              onClick={() => triggerFileDownload(ext.apkUrl, `${ext.pkg || ext.name}.apk`)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/40 text-[11px] font-bold font-mono flex items-center gap-1 transition-all cursor-pointer"
                              title="Download Extension APK"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Download APK</span>
                            </button>
                          )}

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

                      {/* Expandable Sub-Sources List */}
                      {sourcesList.length > 0 && (
                        <div className="pt-2 border-t border-white/5 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => setExpandedStorePkgs(prev => ({ ...prev, [ext.pkg]: !prev[ext.pkg] }))}
                              className="text-[11px] font-mono font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                              <span>View All Sources ({sourcesList.length})</span>
                            </button>

                            {ext.apkUrl && (
                              <button
                                type="button"
                                onClick={() => triggerFileDownload(ext.apkUrl, `${ext.pkg || ext.name}.apk`)}
                                className="xl:hidden text-[10px] font-mono font-bold text-emerald-300 hover:text-emerald-200 flex items-center gap-1 cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                <span>Download APK</span>
                              </button>
                            )}
                          </div>

                          {isExpanded && (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                              {sourcesList.map((subSrc, idx) => {
                                const domain = extractDomain(subSrc.homeUrl);
                                return (
                                  <div
                                    key={`${ext.pkg}_sub_${subSrc.id || idx}`}
                                    className="px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-white/5 flex items-center justify-between gap-2 text-[11px]"
                                  >
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-slate-200 truncate">{subSrc.name}</span>
                                        <span className="uppercase px-1 py-0.2 rounded bg-slate-800 text-slate-300 text-[9px] font-mono font-bold">
                                          {subSrc.language || ext.lang || 'all'}
                                        </span>
                                      </div>
                                      {domain && (
                                        <p className="text-[10px] font-mono text-slate-500 truncate">{domain}</p>
                                      )}
                                    </div>

                                    {isInstalled && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenSourceBrowse(installedExt || ext, 'popular', subSrc)}
                                        className="px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold flex items-center gap-1 flex-shrink-0 cursor-pointer"
                                      >
                                        <BookOpen className="w-3 h-3" />
                                        <span>Browse</span>
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
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
                          if (window.confirm(`Remove repository "${repo.name}"?`)) {
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
          <div className="w-full max-w-5xl max-h-[92vh] rounded-2xl sm:rounded-3xl bg-[#0c101d] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-900/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-950 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {browsingSource.source.iconUrl ? (
                    <img src={browsingSource.source.iconUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Radio className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-['Outfit'] flex-wrap">
                    <span className="truncate">
                      {browsingSource.activeSubSource?.name || browsingSource.source.name}
                    </span>
                    {browsingSource.activeSubSource?.language && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono uppercase">
                        {browsingSource.activeSubSource.language}
                      </span>
                    )}
                    <span className="text-xs font-mono font-normal text-cyan-400 uppercase">
                      [{browsingSource.mode.toUpperCase()}]
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono truncate">
                    Scraping live from {browsingSource.activeSubSource?.homeUrl || browsingSource.source.sources?.[0]?.homeUrl || 'extension feed'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Switch between Popular and Latest */}
                <button
                  onClick={() => handleOpenSourceBrowse(
                    browsingSource.source,
                    browsingSource.mode === 'popular' ? 'latest' : 'popular',
                    browsingSource.activeSubSource
                  )}
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

            {/* Source Stream / Language Switcher Bar for Multi-Source Extensions */}
            {browsingSource.source.sources?.length > 1 && (
              <div className="px-3 sm:px-4 py-2.5 bg-slate-950/80 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto scrollbar-none font-mono text-[11px]">
                <span className="text-cyan-400 font-bold flex items-center gap-1 flex-shrink-0 mr-1">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>STREAMS ({browsingSource.source.sources.length}):</span>
                </span>
                {browsingSource.source.sources.map((sub, idx) => {
                  const activeSub = browsingSource.activeSubSource;
                  const isActiveSub = (sub.id && activeSub?.id && sub.id === activeSub.id)
                    || (sub.name === activeSub?.name && sub.language === activeSub?.language);
                  return (
                    <button
                      key={`${sub.id || sub.name}_${idx}`}
                      type="button"
                      onClick={() => {
                        if (sourceQuery.trim()) {
                          handleOpenSourceBrowse(browsingSource.source, 'search', sub, sourceQuery);
                        } else {
                          handleOpenSourceBrowse(
                            browsingSource.source,
                            browsingSource.mode === 'search' ? 'popular' : browsingSource.mode,
                            sub
                          );
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActiveSub
                          ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-500/30'
                          : 'bg-slate-900 text-slate-300 hover:text-white border border-white/10 hover:border-cyan-500/40'
                      }`}
                    >
                      <span>{sub.name}</span>
                      <span className={`text-[9px] uppercase px-1 rounded ${
                        isActiveSub ? 'bg-black/25 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {sub.language || 'all'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* In-Source Search Bar */}
            <div className="p-3 sm:p-4 bg-slate-900/40 border-b border-white/5">
              <form onSubmit={handleSourceSearch} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={sourceQuery}
                    onChange={(e) => setSourceQuery(e.target.value)}
                    placeholder={`Search titles exclusively within ${browsingSource.activeSubSource?.name || browsingSource.source.name}...`}
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
                  <p className="text-xs text-slate-400 font-mono">
                    Fetching catalog directly from {browsingSource.activeSubSource?.name || browsingSource.source.name}...
                  </p>
                </div>
              ) : sourceMangaList.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-sm">
                  No manga found from {browsingSource.activeSubSource?.name || browsingSource.source.name} for this query.
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
function SourceDeckCard({ extension, showNsfw = false, onOpenBrowse, onTogglePin, onToggleActive }) {
  const isPinned = !!extension.isPinned;
  const isEnabled = extension.enabled !== false;
  const sourceName = extension.name;
  const lang = (extension.lang || 'all').toUpperCase();
  const rawSources = Array.isArray(extension.sources) ? extension.sources : [];
  const sources = showNsfw ? rawSources : rawSources.filter(s => !s?.isNsfw);
  const primarySource = sources[0] || extension.sources?.[0];

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-3 shadow-md group ${
      isPinned 
        ? 'bg-slate-900/90 border-amber-500/40 hover:border-amber-400 shadow-amber-500/5' 
        : 'bg-slate-900/70 border-white/10 hover:border-cyan-500/30'
    } ${!isEnabled ? 'opacity-60' : ''}`}>
      
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
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors font-['Outfit']">
                {sourceName}
              </h3>
              {sources.length > 1 && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {sources.length} sources
                </span>
              )}
            </div>
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

        <div className="flex items-center gap-1 flex-shrink-0">
          {onToggleActive && (
            <button
              type="button"
              onClick={() => onToggleActive(extension.pkg, !isEnabled)}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                isEnabled
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                  : 'bg-slate-800 text-slate-400 border-white/10 hover:text-white'
              }`}
              title={isEnabled ? 'Disable in global search' : 'Enable in global search'}
            >
              {isEnabled ? 'ON' : 'OFF'}
            </button>
          )}

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
      </div>

      {/* All Sub-Sources Pills */}
      {sources.length > 0 && (
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-0.5 scrollbar-thin">
          {sources.map((sub, idx) => (
            <button
              key={`${sub.id || sub.name}_${idx}`}
              type="button"
              onClick={() => onOpenBrowse(extension, 'popular', sub)}
              className="px-2 py-1 rounded-lg bg-slate-950/90 hover:bg-cyan-950/70 border border-white/10 hover:border-cyan-400/50 text-[10px] font-mono text-slate-300 hover:text-cyan-200 transition-all flex items-center gap-1 cursor-pointer"
              title={`Browse ${sub.name} (${(sub.language || 'all').toUpperCase()})`}
            >
              <span className="truncate max-w-[130px] font-semibold">{sub.name}</span>
              <span className="text-slate-500">•</span>
              <span className="uppercase text-cyan-400 font-bold">{sub.language || 'all'}</span>
            </button>
          ))}
        </div>
      )}

      {/* Action Buttons: Browse Popular / Latest / Download APK */}
      <div className="space-y-2 pt-2 border-t border-white/5 font-mono text-xs">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onOpenBrowse(extension, 'popular', primarySource)}
            className="px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold"
          >
            <Flame className="w-3 h-3 text-cyan-400 fill-cyan-400" />
            <span>Popular</span>
          </button>

          <button
            onClick={() => onOpenBrowse(extension, 'latest', primarySource)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold"
          >
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Latest</span>
          </button>
        </div>

        {extension.apkUrl && (
          <button
            type="button"
            onClick={() => triggerFileDownload(extension.apkUrl, `${extension.pkg || extension.name}.apk`)}
            className="w-full px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold text-[11px]"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download APK</span>
          </button>
        )}
      </div>

    </div>
  );
}
