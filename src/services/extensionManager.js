/**
 * Mihon / Tachiyomi Extension & Repository Management System
 * Handles Extension Repositories, Extension Store, Installed Sources & Source Browsing.
 */

import { getApiBaseUrl, fetchPopularManga, searchManga } from './mangaApi';

const STORAGE_KEYS = {
  REPOSITORIES: 'mihon_repositories_v1',
  INSTALLED_EXTENSIONS: 'mihon_installed_extensions_v1',
  PINNED_SOURCES: 'mihon_pinned_sources_v1',
  ACTIVE_EXTENSIONS: 'mihon_active_extensions_v1',
  CACHE_PREFIX: 'mihon_repo_cache_',
  LAST_SYNC: 'mihon_last_sync_timestamp'
};

// Official Keiyoushi Extension Repository (the gold standard for Mihon & Tachiyomi)
export const DEFAULT_REPOSITORIES = [
  {
    id: 'keiyoushi',
    name: 'Keiyoushi Repository (Official)',
    url: 'https://raw.githubusercontent.com/keiyoushi/extensions/repo/index.json',
    fallbackUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions@repo/index.json',
    website: 'https://keiyoushi.github.io',
    isOfficial: true,
    enabled: true,
    lastSynced: null,
    extensionsCount: 1692
  }
];

// Default pre-installed sources for instant out-of-the-box reading
export const DEFAULT_PREINSTALLED_EXTENSIONS = [
  {
    pkg: 'eu.kanade.tachiyomi.extension.en.mangakatana',
    name: 'MangaKatana',
    versionName: '1.4.38',
    lang: 'en',
    iconUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/en/mangakatana/res/mipmap-xhdpi/ic_launcher.png',
    repoId: 'keiyoushi',
    installedAt: Date.now(),
    enabled: true,
    isPinned: true,
    contentWarning: 'CONTENT_WARNING_SAFE',
    sources: [
      { id: 'mangakatana', name: 'MangaKatana', language: 'en', homeUrl: 'https://mangakatana.com', badge: '30k+ HQ' }
    ]
  },
  {
    pkg: 'eu.kanade.tachiyomi.extension.en.weebcentral',
    name: 'WeebCentral',
    versionName: '1.4.15',
    lang: 'en',
    iconUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/en/weebcentral/res/mipmap-xhdpi/ic_launcher.png',
    repoId: 'keiyoushi',
    installedAt: Date.now(),
    enabled: true,
    isPinned: true,
    contentWarning: 'CONTENT_WARNING_SAFE',
    sources: [
      { id: 'weebcentral', name: 'WeebCentral', language: 'en', homeUrl: 'https://weebcentral.com', badge: '15k+ Clean' }
    ]
  },
  {
    pkg: 'eu.kanade.tachiyomi.extension.all.mangadex',
    name: 'MangaDex',
    versionName: '1.4.210',
    lang: 'all',
    iconUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/all/mangadex/res/mipmap-xhdpi/ic_launcher.png',
    repoId: 'keiyoushi',
    installedAt: Date.now(),
    enabled: true,
    isPinned: true,
    contentWarning: 'CONTENT_WARNING_SAFE',
    sources: [
      { id: 'mangadex', name: 'MangaDex', language: 'all', homeUrl: 'https://mangadex.org', badge: 'Official Multi' }
    ]
  },
  {
    pkg: 'eu.kanade.tachiyomi.extension.en.asurascans',
    name: 'Asura Scans',
    versionName: '1.4.62',
    lang: 'en',
    iconUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/en/asurascans/res/mipmap-xhdpi/ic_launcher.png',
    repoId: 'keiyoushi',
    installedAt: Date.now(),
    enabled: true,
    isPinned: false,
    contentWarning: 'CONTENT_WARNING_SAFE',
    sources: [
      { id: 'asura', name: 'Asura Scans', language: 'en', homeUrl: 'https://asuracomic.net', badge: 'Fast Manhwa' }
    ]
  },
  {
    pkg: 'eu.kanade.tachiyomi.extension.en.flamecomics',
    name: 'Flame Comics',
    versionName: '1.4.28',
    lang: 'en',
    iconUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/en/flamecomics/res/mipmap-xhdpi/ic_launcher.png',
    repoId: 'keiyoushi',
    installedAt: Date.now(),
    enabled: true,
    isPinned: false,
    contentWarning: 'CONTENT_WARNING_SAFE',
    sources: [
      { id: 'flame', name: 'Flame Comics', language: 'en', homeUrl: 'https://flamecomics.me', badge: 'Weekly Action' }
    ]
  },
  {
    pkg: 'eu.kanade.tachiyomi.extension.en.thunderscans',
    name: 'Thunder Scans',
    versionName: '1.4.19',
    lang: 'en',
    iconUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/en/thunderscans/res/mipmap-xhdpi/ic_launcher.png',
    repoId: 'keiyoushi',
    installedAt: Date.now(),
    enabled: true,
    isPinned: false,
    contentWarning: 'CONTENT_WARNING_SAFE',
    sources: [
      { id: 'thunder', name: 'Thunder Scans', language: 'en', homeUrl: 'https://en-thunderscans.com', badge: 'New Drops' }
    ]
  },
  {
    pkg: 'eu.kanade.tachiyomi.extension.all.webtoons',
    name: 'Webtoons',
    versionName: '1.4.45',
    lang: 'all',
    iconUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/all/webtoons/res/mipmap-xhdpi/ic_launcher.png',
    repoId: 'keiyoushi',
    installedAt: Date.now(),
    enabled: true,
    isPinned: false,
    contentWarning: 'CONTENT_WARNING_SAFE',
    sources: [
      { id: 'webtoon', name: 'Webtoons', language: 'all', homeUrl: 'https://webtoons.com', badge: 'Full-Color' }
    ]
  },
  {
    pkg: 'eu.kanade.tachiyomi.extension.en.mangapill',
    name: 'MangaPill',
    versionName: '1.4.20',
    lang: 'en',
    iconUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/en/mangapill/res/mipmap-xhdpi/ic_launcher.png',
    repoId: 'keiyoushi',
    installedAt: Date.now(),
    enabled: true,
    isPinned: false,
    contentWarning: 'CONTENT_WARNING_SAFE',
    sources: [
      { id: 'mangapill', name: 'MangaPill', language: 'en', homeUrl: 'https://mangapill.com', badge: 'Mirror CDN' }
    ]
  }
];

// Helper: Safely get/set localStorage with JSON
function getStorageJSON(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorageJSON(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn(`Error writing to ${key}:`, err);
  }
}

// Event dispatcher for reactive UI updates
function notifyExtensionUpdate(type, data) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mihon:extension_update', { detail: { type, data } }));
  }
}

/**
 * Get all connected repositories
 */
export function getRepositories() {
  const saved = getStorageJSON(STORAGE_KEYS.REPOSITORIES, null);
  if (!saved || !Array.isArray(saved) || saved.length === 0) {
    setStorageJSON(STORAGE_KEYS.REPOSITORIES, DEFAULT_REPOSITORIES);
    return DEFAULT_REPOSITORIES;
  }
  return saved;
}

/**
 * Add a new repository by URL
 */
export async function addRepository(repoUrl, customName = '') {
  if (!repoUrl || !repoUrl.trim()) throw new Error('Repository URL is required');
  const cleanUrl = repoUrl.trim();
  const repos = getRepositories();

  if (repos.some(r => r.url.toLowerCase() === cleanUrl.toLowerCase())) {
    throw new Error('This repository URL is already added');
  }

  // Validate and fetch manifest
  const newRepo = {
    id: `repo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: customName?.trim() || cleanUrl.split('/')[4] || 'Custom Extension Repo',
    url: cleanUrl,
    fallbackUrl: cleanUrl.includes('raw.githubusercontent.com')
      ? cleanUrl.replace('https://raw.githubusercontent.com/', 'https://cdn.jsdelivr.net/gh/').replace('/repo/', '@repo/')
      : null,
    isOfficial: false,
    enabled: true,
    lastSynced: null,
    extensionsCount: 0
  };

  // Test fetch the repo index
  const extensions = await fetchRepositoryIndex(newRepo);
  newRepo.extensionsCount = extensions.length;
  newRepo.lastSynced = Date.now();

  const updated = [...repos, newRepo];
  setStorageJSON(STORAGE_KEYS.REPOSITORIES, updated);
  notifyExtensionUpdate('repo_added', newRepo);
  return newRepo;
}

/**
 * Remove a repository
 */
export function removeRepository(repoId) {
  const repos = getRepositories();
  const updated = repos.filter(r => r.id !== repoId);
  setStorageJSON(STORAGE_KEYS.REPOSITORIES, updated);
  try {
    localStorage.removeItem(`${STORAGE_KEYS.CACHE_PREFIX}${repoId}`);
  } catch {}
  notifyExtensionUpdate('repo_removed', { repoId });
  return updated;
}

/**
 * Fetch and parse a repository index (JSON or proxy)
 */
export async function fetchRepositoryIndex(repo) {
  const cacheKey = `${STORAGE_KEYS.CACHE_PREFIX}${repo.id}`;
  
  // Try endpoints in order: direct repo.url, fallbackUrl, or backend proxy
  const endpoints = [
    repo.url,
    repo.fallbackUrl,
    `/api/extensions/repo?url=${encodeURIComponent(repo.url)}`
  ].filter(Boolean);

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000); // 12s timeout
      const res = await fetch(endpoint, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!res.ok) continue;

      const data = await res.json();
      const rawList = Array.isArray(data) 
        ? data 
        : (data.extensionList?.extensions || data.extensions || []);

      if (Array.isArray(rawList) && rawList.length > 0) {
        const normalized = rawList.map(ext => normalizeExtension(ext, repo.id));
        // Cache normalized extensions
        setStorageJSON(cacheKey, {
          timestamp: Date.now(),
          count: normalized.length,
          extensions: normalized
        });
        return normalized;
      }
    } catch (err) {
      lastError = err;
    }
  }

  // Check cached copy if network failed
  const cached = getStorageJSON(cacheKey, null);
  if (cached && Array.isArray(cached.extensions)) {
    return cached.extensions;
  }

  // Fallback to pre-installed catalog if it was the Keiyoushi repo
  if (repo.id === 'keiyoushi') {
    return DEFAULT_PREINSTALLED_EXTENSIONS;
  }

  throw new Error(`Failed to load repository index: ${lastError?.message || 'Network error'}`);
}

/**
 * Normalize diverse extension schemas into unified Mihon Extension model
 */
function normalizeExtension(raw, repoId) {
  const pkg = raw.pkg || raw.packageName || `ext.${raw.name?.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const name = raw.name || 'Unnamed Source';
  const versionName = raw.version || raw.versionName || '1.4.0';
  const iconUrl = raw.resources?.iconUrl || raw.icon || raw.iconUrl || 
    `https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/${raw.lang || 'all'}/${pkg.split('.').pop()}/res/mipmap-xhdpi/ic_launcher.png`;

  // Sources array inside extension
  let sources = [];
  if (Array.isArray(raw.sources) && raw.sources.length > 0) {
    sources = raw.sources.map(s => ({
      id: String(s.id || s.name?.toLowerCase().replace(/[^a-z0-9]/g, '')),
      name: s.name || name,
      language: s.lang || s.language || raw.lang || 'all',
      homeUrl: s.baseUrl || s.homeUrl || ''
    }));
  } else {
    sources = [{
      id: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      name,
      language: raw.lang || 'all',
      homeUrl: raw.baseUrl || ''
    }];
  }

  // Content rating: Safe or NSFW
  let contentWarning = 'CONTENT_WARNING_SAFE';
  if (raw.nsfw === 1 || raw.nsfw === true || raw.contentWarning === 'CONTENT_WARNING_NSFW' || raw.isNsfw) {
    contentWarning = 'CONTENT_WARNING_NSFW';
  }

  return {
    pkg,
    name,
    versionName,
    lang: raw.lang || sources[0]?.language || 'all',
    iconUrl,
    repoId,
    contentWarning,
    sources
  };
}

/**
 * Get all installed extensions
 */
export function getInstalledExtensions() {
  const saved = getStorageJSON(STORAGE_KEYS.INSTALLED_EXTENSIONS, null);
  if (!saved || !Array.isArray(saved) || saved.length === 0) {
    setStorageJSON(STORAGE_KEYS.INSTALLED_EXTENSIONS, DEFAULT_PREINSTALLED_EXTENSIONS);
    return DEFAULT_PREINSTALLED_EXTENSIONS;
  }
  return saved;
}

/**
 * Check if a specific extension is installed
 */
export function isExtensionInstalled(pkg) {
  const installed = getInstalledExtensions();
  return installed.some(e => e.pkg === pkg);
}

/**
 * Install an extension
 */
export async function installExtension(ext) {
  const installed = getInstalledExtensions();
  if (installed.some(e => e.pkg === ext.pkg)) return installed;

  const itemToInstall = {
    ...ext,
    installedAt: Date.now(),
    enabled: true,
    isPinned: false
  };

  const updated = [...installed, itemToInstall];
  setStorageJSON(STORAGE_KEYS.INSTALLED_EXTENSIONS, updated);
  notifyExtensionUpdate('extension_installed', itemToInstall);
  return updated;
}

/**
 * Uninstall an extension
 */
export function uninstallExtension(pkg) {
  const installed = getInstalledExtensions();
  const updated = installed.filter(e => e.pkg !== pkg);
  setStorageJSON(STORAGE_KEYS.INSTALLED_EXTENSIONS, updated);
  notifyExtensionUpdate('extension_uninstalled', { pkg });
  return updated;
}

/**
 * Toggle extension enabled / disabled state
 */
export function toggleExtensionState(pkg, enabled) {
  const installed = getInstalledExtensions();
  const updated = installed.map(e => e.pkg === pkg ? { ...e, enabled } : e);
  setStorageJSON(STORAGE_KEYS.INSTALLED_EXTENSIONS, updated);
  notifyExtensionUpdate('extension_toggled', { pkg, enabled });
  return updated;
}

/**
 * Toggle source pinning (pinned sources show at top in Mihon style)
 */
export function togglePinExtension(pkg) {
  const installed = getInstalledExtensions();
  const updated = installed.map(e => e.pkg === pkg ? { ...e, isPinned: !e.isPinned } : e);
  setStorageJSON(STORAGE_KEYS.INSTALLED_EXTENSIONS, updated);
  notifyExtensionUpdate('extension_pinned', { pkg });
  return updated;
}

/**
 * Fetch Popular titles for a specific source
 */
export async function fetchSourcePopular(sourceId) {
  const baseUrl = getApiBaseUrl();
  const id = sourceId.toLowerCase();

  try {
    const url = baseUrl 
      ? `${baseUrl}/api/extensions/source?id=${encodeURIComponent(id)}&type=popular`
      : `/api/extensions/source?id=${encodeURIComponent(id)}&type=popular`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn(`fetchSourcePopular API warning for ${id}:`, err);
  }

  // Client-side fallback mapping
  const allPopular = await fetchPopularManga();

  return allPopular.filter(m => {
    const sName = (m.sourceName || '').toLowerCase();
    const mId = (m.id || '').toLowerCase();
    return sName.includes(id) || id.includes(sName) || mId.startsWith(`${id}:`);
  });
}

/**
 * Fetch Latest Updates for a specific source
 */
export async function fetchSourceLatest(sourceId) {
  const baseUrl = getApiBaseUrl();
  const id = sourceId.toLowerCase();

  try {
    const url = baseUrl 
      ? `${baseUrl}/api/extensions/source?id=${encodeURIComponent(id)}&type=latest`
      : `/api/extensions/source?id=${encodeURIComponent(id)}&type=latest`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn(`fetchSourceLatest API warning for ${id}:`, err);
  }

  // Client-side fallback
  const allPopular = await fetchPopularManga();
  return allPopular.filter(m => {
    const sName = (m.sourceName || '').toLowerCase();
    const mId = (m.id || '').toLowerCase();
    return sName.includes(id) || id.includes(sName) || mId.startsWith(`${id}:`);
  });
}

/**
 * Search manga specifically within one source
 */
export async function searchSourceManga(sourceId, query) {
  if (!query || !query.trim()) return fetchSourcePopular(sourceId);
  const baseUrl = getApiBaseUrl();
  const id = sourceId.toLowerCase();

  try {
    const url = baseUrl 
      ? `${baseUrl}/api/extensions/source?id=${encodeURIComponent(id)}&type=search&q=${encodeURIComponent(query)}`
      : `/api/extensions/source?id=${encodeURIComponent(id)}&type=search&q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn(`searchSourceManga API warning for ${id}:`, err);
  }

  // Client-side fallback
  const searchResults = await searchManga(query);
  return searchResults.filter(m => {
    const sName = (m.sourceName || '').toLowerCase();
    const mId = (m.id || '').toLowerCase();
    return sName.includes(id) || id.includes(sName) || mId.startsWith(`${id}:`);
  });
}

/**
 * Multi-Source Global Search (searches all installed & active sources concurrently)
 */
export async function searchAllInstalledSources(query, onSourceResult = null) {
  if (!query || !query.trim()) return [];
  const installed = getInstalledExtensions().filter(e => e.enabled);
  const resultsBySource = {};
  const allResults = [];
  const seenIds = new Set();

  await Promise.allSettled(
    installed.map(async (ext) => {
      const primarySource = ext.sources[0]?.id || ext.name.toLowerCase();
      try {
        const list = await searchSourceManga(primarySource, query);
        resultsBySource[ext.name] = list;
        if (onSourceResult) {
          onSourceResult(ext.name, list);
        }
        list.forEach(item => {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            allResults.push({
              ...item,
              extensionPkg: ext.pkg,
              extensionName: ext.name
            });
          }
        });
      } catch (err) {
        console.warn(`Search failed on ${ext.name}:`, err);
      }
    })
  );

  return allResults;
}
