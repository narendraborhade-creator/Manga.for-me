/**
 * Mihon / Tachiyomi Extension & Repository Management System
 * Handles Extension Repositories, Extension Store, Installed Sources & Source Browsing.
 */

import { 
  getApiBaseUrl, 
  fetchPopularManga, 
  searchManga, 
  fetchClientHtml, 
  cleanTitle, 
  decodeHtml, 
  FALLBACK_MANGA_CATALOG, 
  searchAniList 
} from './mangaApi.js';

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
  },
  {
    pkg: 'eu.kanade.tachiyomi.extension.en.manga18fx',
    name: 'Manga18fx',
    versionName: '1.4.12',
    lang: 'en',
    iconUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/en/manga18fx/res/mipmap-xhdpi/ic_launcher.png',
    repoId: 'keiyoushi',
    installedAt: Date.now(),
    enabled: true,
    isPinned: false,
    contentWarning: 'CONTENT_WARNING_NSFW',
    sources: [
      { id: 'manga18fx', name: 'Manga18fx', language: 'en', homeUrl: 'https://manga18fx.com', badge: '18+ Adult' }
    ]
  },
  {
    pkg: 'eu.kanade.tachiyomi.extension.all.doujindesu',
    name: 'DoujinDesu',
    versionName: '1.4.15',
    lang: 'all',
    iconUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/all/doujindesu/res/mipmap-xhdpi/ic_launcher.png',
    repoId: 'keiyoushi',
    installedAt: Date.now(),
    enabled: true,
    isPinned: false,
    contentWarning: 'CONTENT_WARNING_NSFW',
    sources: [
      { id: 'doujindesu', name: 'DoujinDesu', language: 'all', homeUrl: 'https://doujindesu.tv', badge: '18+ Color' }
    ]
  }
];

export function isNsfwAllowed() {
  try {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('kuroneko_show_nsfw') === 'true';
  } catch {
    return false;
  }
}

export function setNsfwAllowed(allowed) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kuroneko_show_nsfw', allowed ? 'true' : 'false');
      notifyExtensionUpdate('nsfw_toggled', { allowed });
    }
  } catch {}
}

// Helper: Safely get/set localStorage with JSON
function getStorageJSON(key, defaultValue) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return defaultValue;
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorageJSON(key, val) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, JSON.stringify(val));
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
        const repoBaseUrl = String(endpoint || repo.url || '').replace(/\/[^/]+$/, '');
        const normalized = rawList.map(ext => normalizeExtension(ext, repo.id, repoBaseUrl));
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

function sanitizeHttpUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
  } catch {}
  return null;
}

/**
 * Normalize diverse extension schemas into unified Mihon Extension model
 */
function normalizeExtension(raw, repoId, repoBaseUrl = '') {
  const pkg = raw.pkg || raw.packageName || `ext.${raw.name?.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const name = raw.name || 'Unnamed Source';
  const versionName = raw.version || raw.versionName || '1.4.0';
  const versionCode = raw.versionCode || raw.code || raw.version || null;
  const rawApk = raw.resources?.apkUrl || raw.apkUrl || (
    raw.apk
      ? (String(raw.apk).startsWith('http') ? raw.apk : (repoBaseUrl ? `${repoBaseUrl}/apk/${raw.apk}` : null))
      : null
  );
  const apkUrl = sanitizeHttpUrl(rawApk);
  const jarUrl = sanitizeHttpUrl(raw.resources?.jarUrl || raw.jarUrl || null);
  const iconUrl = raw.resources?.iconUrl || raw.icon || raw.iconUrl ||
    (repoBaseUrl && raw.pkg
      ? `${repoBaseUrl}/icon/${pkg}.png`
      : `https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/${raw.lang || 'all'}/${pkg.split('.').pop()}/res/mipmap-xhdpi/ic_launcher.png`);

  // Content rating: preserve NSFW, MIXED, and SAFE
  let contentWarning = 'CONTENT_WARNING_SAFE';
  if (raw.contentWarning === 'CONTENT_WARNING_NSFW' || raw.nsfw === 1 || raw.nsfw === true || raw.isNsfw === true) {
    contentWarning = 'CONTENT_WARNING_NSFW';
  } else if (raw.contentWarning === 'CONTENT_WARNING_MIXED') {
    contentWarning = 'CONTENT_WARNING_MIXED';
  } else if (raw.contentWarning === 'CONTENT_WARNING_SAFE') {
    contentWarning = 'CONTENT_WARNING_SAFE';
  }

  // Normalize every sub-source inside extension
  const rawSources = Array.isArray(raw.sources) && raw.sources.length > 0
    ? raw.sources
    : [{
        id: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        name,
        language: raw.lang || 'all',
        homeUrl: raw.baseUrl || raw.homeUrl || ''
      }];

  const sources = rawSources.map(s => ({
    ...s,
    id: String(s.id || s.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || name.toLowerCase().replace(/[^a-z0-9]/g, '')),
    name: s.name || name,
    language: s.lang || s.language || raw.lang || 'all',
    homeUrl: s.baseUrl || s.homeUrl || '',
    isNsfw: contentWarning === 'CONTENT_WARNING_NSFW' || s.nsfw === 1 || s.nsfw === true || s.isNsfw === true
  }));

  if (!raw.contentWarning && raw.nsfw !== 1 && raw.nsfw !== true && raw.isNsfw !== true) {
    const hasNsfwSub = sources.some(s => s.isNsfw);
    const hasSafeSub = sources.some(s => !s.isNsfw);
    if (hasNsfwSub && hasSafeSub) {
      contentWarning = 'CONTENT_WARNING_MIXED';
    } else if (hasNsfwSub) {
      contentWarning = 'CONTENT_WARNING_NSFW';
    }
  }

  return {
    ...raw,
    pkg,
    name,
    versionName,
    versionCode,
    lang: raw.lang || sources[0]?.language || 'all',
    iconUrl,
    apkUrl,
    jarUrl,
    repoId,
    contentWarning,
    isMultiSource: sources.length > 1,
    sources
  };
}

function hydrateExtensionShape(ext) {
  if (!ext) return ext;
  const sources = (Array.isArray(ext.sources) && ext.sources.length > 0
    ? ext.sources
    : [{
        id: (ext.name || ext.pkg || 'source').toLowerCase().replace(/[^a-z0-9]/g, ''),
        name: ext.name || 'Unnamed Source',
        language: ext.lang || 'all',
        homeUrl: ext.baseUrl || ext.homeUrl || ''
      }]
  ).map(s => ({
    ...s,
    id: String(s.id || s.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || ''),
    name: s.name || ext.name || 'Unnamed Source',
    language: s.language || s.lang || ext.lang || 'all',
    homeUrl: s.homeUrl || s.baseUrl || '',
    isNsfw: typeof s.isNsfw === 'boolean'
      ? s.isNsfw
      : (ext.contentWarning === 'CONTENT_WARNING_NSFW' || s.nsfw === 1 || s.nsfw === true)
  }));

  return {
    ...ext,
    apkUrl: ext.apkUrl || ext.resources?.apkUrl || null,
    jarUrl: ext.jarUrl || ext.resources?.jarUrl || null,
    versionCode: ext.versionCode || ext.code || ext.version || null,
    contentWarning: ext.contentWarning || 'CONTENT_WARNING_SAFE',
    isMultiSource: sources.length > 1,
    sources
  };
}

/**
 * Flatten every individual sub-source across all enabled/installed extensions
 */
export function flattenExtensionSources(extensions, includeNsfw = true) {
  const list = Array.isArray(extensions) ? extensions : getInstalledExtensions();
  const flattened = [];

  for (const rawExt of list) {
    if (!rawExt || rawExt.enabled === false) continue;
    const ext = hydrateExtensionShape(rawExt);
    const extSources = ext.sources || [];

    for (const src of extSources) {
      const subIsNsfw = Boolean(
        src.isNsfw ||
        ext.contentWarning === 'CONTENT_WARNING_NSFW' ||
        isNsfwSource(src.id) ||
        isNsfwSource(src.name) ||
        isNsfwSource(src.homeUrl)
      );
      if (!includeNsfw && (subIsNsfw || ext.contentWarning === 'CONTENT_WARNING_NSFW')) {
        continue;
      }

      flattened.push({
        ...src,
        id: String(src.id || src.name || ext.name || '').trim(),
        name: src.name || ext.name || 'Unnamed Source',
        language: src.language || ext.lang || 'all',
        homeUrl: src.homeUrl || '',
        extensionPkg: ext.pkg,
        extensionName: ext.name,
        iconUrl: ext.iconUrl,
        apkUrl: sanitizeHttpUrl(ext.apkUrl) || null,
        contentWarning: ext.contentWarning,
        isNsfw: subIsNsfw,
        isPinned: Boolean(ext.isPinned),
        enabled: ext.enabled !== false,
        totalExtensionSources: extSources.length
      });
    }
  }

  return flattened;
}

/**
 * Get all installed extensions
 */
export function getInstalledExtensions() {
  const saved = getStorageJSON(STORAGE_KEYS.INSTALLED_EXTENSIONS, null);
  if (!saved || !Array.isArray(saved) || saved.length === 0) {
    const initial = DEFAULT_PREINSTALLED_EXTENSIONS.map(hydrateExtensionShape);
    setStorageJSON(STORAGE_KEYS.INSTALLED_EXTENSIONS, initial);
    return initial;
  }
  const uninstalled = getStorageJSON('mihon_uninstalled_pkgs', []);
  let modified = false;
  const currentList = [...saved];
  DEFAULT_PREINSTALLED_EXTENSIONS.forEach(defExt => {
    if (!currentList.some(e => e.pkg === defExt.pkg) && !uninstalled.includes(defExt.pkg)) {
      currentList.push(defExt);
      modified = true;
    }
  });
  if (modified) {
    setStorageJSON(STORAGE_KEYS.INSTALLED_EXTENSIONS, currentList);
  }
  return currentList.map(hydrateExtensionShape);
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
  
  // Remove from uninstalled history if reinstalling
  const uninstalled = getStorageJSON('mihon_uninstalled_pkgs', []);
  if (uninstalled.includes(ext.pkg)) {
    setStorageJSON('mihon_uninstalled_pkgs', uninstalled.filter(p => p !== ext.pkg));
  }

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
  const uninstalled = getStorageJSON('mihon_uninstalled_pkgs', []);
  if (!uninstalled.includes(pkg)) {
    setStorageJSON('mihon_uninstalled_pkgs', [...uninstalled, pkg]);
  }
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

// ----------------- CLIENT-SIDE EXTENSION SCRAPERS & RESOLVERS -----------------

function formatMangaDexItem(item) {
  if (!item) return null;
  const attrs = item.attributes || {};
  const rawTitle = attrs.title?.en 
    || attrs.title?.['ja-ro'] 
    || attrs.title?.['ko-ro'] 
    || Object.values(attrs.title || {})[0] 
    || 'Manga';
  const title = cleanTitle(rawTitle);
  const coverRel = (item.relationships || []).find(r => r.type === 'cover_art');
  const coverUrl = coverRel?.attributes?.fileName
    ? `https://uploads.mangadex.org/covers/${item.id}/${coverRel.attributes.fileName}.512.jpg`
    : `https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/default.jpg`;
  
  const lastCh = attrs.lastChapter;
  const numCh = lastCh && !isNaN(parseFloat(lastCh)) ? Math.floor(parseFloat(lastCh)) : null;

  return {
    id: `md:${item.id}`,
    rawId: item.id,
    title,
    englishTitle: title,
    coverUrl,
    description: decodeHtml(attrs.description?.en || Object.values(attrs.description || {})[0] || ''),
    sourceName: 'MangaDex',
    status: attrs.status ? attrs.status.toUpperCase() : 'ONGOING',
    score: '9.2',
    year: attrs.year || new Date().getFullYear(),
    tags: (attrs.tags || []).map(t => t.attributes?.name?.en).filter(Boolean).slice(0, 4),
    totalChapters: numCh,
    latestChapter: lastCh || (numCh ? String(numCh) : '1')
  };
}

async function fetchMangaDexSourceManga(mode = 'popular', query = '', showNsfw = false, nsfwOnly = false) {
  const ratingParams = nsfwOnly
    ? '&contentRating[]=erotica&contentRating[]=pornographic'
    : showNsfw
      ? '&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic'
      : '&contentRating[]=safe&contentRating[]=suggestive';

  let url;
  if (query && query.trim()) {
    url = `https://api.mangadex.org/manga?title=${encodeURIComponent(query.trim())}&limit=25&order[relevance]=desc&includes[]=cover_art${ratingParams}`;
  } else if (mode === 'latest') {
    url = `https://api.mangadex.org/manga?limit=25&order[latestUploadedChapter]=desc&includes[]=cover_art${ratingParams}`;
  } else {
    url = `https://api.mangadex.org/manga?limit=25&order[followedCount]=desc&includes[]=cover_art${ratingParams}`;
  }

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || []).map(item => {
      const formatted = formatMangaDexItem(item);
      if (formatted && (nsfwOnly || item.attributes?.contentRating === 'erotica' || item.attributes?.contentRating === 'pornographic')) {
        formatted.contentWarning = 'CONTENT_WARNING_NSFW';
        formatted.isNsfw = true;
      }
      return formatted;
    }).filter(Boolean);
  } catch (err) {
    console.warn('fetchMangaDexSourceManga error:', err);
    return [];
  }
}

export async function fetchManga18fxSourceManga(mode = 'popular', query = '') {
  let targetUrl;
  if (query && query.trim()) {
    targetUrl = `https://manga18fx.com/search?q=${encodeURIComponent(query.trim())}`;
  } else if (mode === 'latest') {
    targetUrl = 'https://manga18fx.com/latest-releases';
  } else {
    targetUrl = 'https://manga18fx.com/popular-manga';
  }

  try {
    const html = await fetchClientHtml(targetUrl, 6000);
    if (html) {
      const items = [];
      const regex = /<div class="bsx-item">[\s\S]*?<a href="\/manga\/([^"#?]+)"\s+title="([^"]+)"[\s\S]*?<img [^>]*(?:data-src|src)="([^"]+)"/gi;
      for (const m of html.matchAll(regex)) {
        const slug = m[1];
        const rawTitle = m[2];
        const cover = m[3];
        const title = cleanTitle(decodeHtml(rawTitle));
        items.push({
          id: `m18:${slug}`,
          rawId: slug,
          title,
          englishTitle: title,
          coverUrl: cover,
          sourceName: 'Manga18fx',
          status: 'Ongoing',
          score: '9.6',
          tags: ['18+ Adult', 'Manhwa', 'Webtoon'],
          contentWarning: 'CONTENT_WARNING_NSFW',
          isNsfw: true
        });
      }
      if (items.length > 0) return items;
    }
  } catch (err) {
    console.warn('fetchManga18fxSourceManga error:', err);
  }

  return await fetchMangaDexSourceManga(mode, query, true, true);
}

async function fetchMangaKatanaSourceManga(mode = 'popular', query = '') {
  let targetUrl;
  if (query && query.trim()) {
    targetUrl = `https://mangakatana.com/?search=${encodeURIComponent(query.trim())}&search_by=book_name`;
  } else if (mode === 'latest') {
    targetUrl = 'https://mangakatana.com/latest';
  } else {
    targetUrl = 'https://mangakatana.com/manga';
  }

  try {
    const html = await fetchClientHtml(targetUrl, 6000);
    if (html) {
      const items = [];
      const itemRegex = /<div class="item"[^>]*>[\s\S]*?<div class="cover"[^>]*>\s*<a href="https:\/\/mangakatana\.com\/manga\/([^"]+)"[^>]*>\s*<img[^>]+(?:data-src|src)="([^"]+)"[^>]*alt="([^"]*)"[\s\S]*?<h3 class="title">\s*<a[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/div>/gi;
      for (const m of html.matchAll(itemRegex)) {
        const slug = m[1];
        const cover = m[2];
        const rawTitle = m[4] || m[3] || slug;
        const title = cleanTitle(decodeHtml(rawTitle));
        items.push({
          id: `kat:${slug}`,
          title,
          englishTitle: title,
          coverUrl: cover,
          sourceName: 'MangaKatana',
          status: 'Ongoing',
          score: '9.4',
          tags: ['Manga']
        });
      }
      if (items.length > 0) return items;
    }
  } catch (err) {
    console.warn('fetchMangaKatanaSourceManga error:', err);
  }

  return getFallbackSourceManga('mangakatana', query, mode);
}

async function fetchWeebCentralSourceManga(mode = 'popular', query = '') {
  let targetUrl;
  if (query && query.trim()) {
    targetUrl = `https://weebcentral.com/search/data?text=${encodeURIComponent(query.trim())}`;
  } else if (mode === 'latest') {
    targetUrl = 'https://weebcentral.com/search/data?sort=Latest%20Updates&order=Desc';
  } else {
    targetUrl = 'https://weebcentral.com/search/data?sort=Popularity&order=Desc';
  }

  try {
    const html = await fetchClientHtml(targetUrl, 6000);
    if (html) {
      const items = [];
      const articles = html.split(/<article\b[^>]*class="[^"]*bg-base-300[^"]*"|<article\b/i).slice(1);
      for (const art of articles) {
        const idMatch = art.match(/\/series\/([0-9A-Z]{26})(?:\/([^"/?#\s]+))?/i);
        if (!idMatch) continue;
        const seriesId = idMatch[1];
        let slugTitle = '';
        try {
          slugTitle = idMatch[2] ? decodeURIComponent(idMatch[2]).replace(/[-_]/g, ' ') : '';
        } catch {
          slugTitle = idMatch[2] ? idMatch[2].replace(/[-_]/g, ' ') : '';
        }

        const titleMatch = art.match(/alt="([^"]+)\s+cover"/i) 
          || art.match(/truncate[^>]*>([^<]+)<\/div>/i)
          || art.match(/<a[^>]+href="[^"]*series\/[0-9A-Z]{26}[^"]*"[^>]*>([^<]+)<\/a>/i);
        const title = cleanTitle(decodeHtml(titleMatch ? titleMatch[1].trim() : (slugTitle || seriesId)));

        const imgMatch = art.match(/<img[^>]+src="([^"]+)"/i) 
          || art.match(/srcset="([^"\s]+)/i);
        const cover = imgMatch ? imgMatch[1] : `https://temp.compsci88.com/cover/fallback/${seriesId}.jpg`;

        items.push({
          id: `wc:${seriesId}`,
          title,
          englishTitle: title,
          coverUrl: cover,
          sourceName: 'WeebCentral',
          status: 'Ongoing',
          score: '9.5',
          tags: ['Manhwa']
        });
      }
      if (items.length > 0) return items;
    }
  } catch (err) {
    console.warn('fetchWeebCentralSourceManga error:', err);
  }

  return getFallbackSourceManga('weebcentral', query, mode);
}

function isNsfwSource(sourceId) {
  const s = String(sourceId || '').toLowerCase();
  return s.includes('18') || s.includes('nsfw') || s.includes('doujin') || s.includes('hentai') || s.includes('erocool') || s.includes('asmhentai');
}

function adaptMangaToSource(manga, sourceId) {
  const sId = String(sourceId || '').toLowerCase().trim();
  let srcName = 'Manga Source';
  if (sId.includes('katana') || sId === 'kat') srcName = 'MangaKatana';
  else if (sId.includes('weeb') || sId === 'wc') srcName = 'WeebCentral';
  else if (sId.includes('dex') || sId === 'md') srcName = 'MangaDex';
  else if (sId.includes('asura')) srcName = 'Asura Scans';
  else if (sId.includes('flame')) srcName = 'Flame Comics';
  else if (sId.includes('thunder')) srcName = 'Thunder Scans';
  else if (sId.includes('webtoon')) srcName = 'Webtoons';
  else if (sId.includes('mangapill')) srcName = 'MangaPill';
  else if (sId.includes('18') || sId.includes('doujin')) srcName = sourceId.toUpperCase();
  else srcName = sourceId.charAt(0).toUpperCase() + sourceId.slice(1);

  return {
    ...manga,
    id: manga.id.includes(':') ? manga.id : `${sId}:${manga.id}`,
    sourceName: srcName
  };
}

async function getFallbackSourceManga(sourceId, query = '', mode = 'popular') {
  const sId = String(sourceId || '').toLowerCase().trim();
  const q = String(query || '').toLowerCase().trim();
  const isNsfw = isNsfwAllowed();

  if (q) {
    // 1. Search local verified catalog
    const localMatches = FALLBACK_MANGA_CATALOG.filter(m => {
      const t = (m.title || '').toLowerCase();
      const eng = (m.englishTitle || '').toLowerCase();
      const aliases = (m.aliases || []).map(a => String(a).toLowerCase());
      return t.includes(q) || eng.includes(q) || aliases.some(a => a.includes(q));
    }).map(m => adaptMangaToSource(m, sId));

    if (localMatches.length > 0) {
      return localMatches;
    }

    // 2. Query MangaDex or AniList
    try {
      if (sId.includes('dex') || sId === 'md' || isNsfwSource(sId)) {
        const mdMatches = await fetchMangaDexSourceManga('search', q, isNsfw);
        if (mdMatches.length > 0) return mdMatches;
      }

      const anilistMatches = await searchAniList(query);
      if (anilistMatches && anilistMatches.length > 0) {
        return anilistMatches.map(m => adaptMangaToSource(m, sId));
      }
    } catch {}

    return [];
  }

  // Browse Popular / Latest without query
  if (isNsfwSource(sId)) {
    try {
      const nsfwList = await fetchMangaDexSourceManga(mode, '', true);
      if (nsfwList.length > 0) return nsfwList;
    } catch {}
  }

  if (sId.includes('asura') || sId.includes('flame') || sId.includes('thunder')) {
    return FALLBACK_MANGA_CATALOG.filter(m => {
      const tags = (m.tags || []).map(t => t.toLowerCase());
      return tags.includes('manhwa') || tags.includes('action') || (m.aliases || []).some(a => a.includes(sId));
    }).map(m => adaptMangaToSource(m, sId));
  }

  if (sId.includes('webtoon')) {
    return FALLBACK_MANGA_CATALOG.filter(m => {
      const tags = (m.tags || []).map(t => t.toLowerCase());
      return tags.includes('manhwa') || (m.author && m.author.includes('Park'));
    }).map(m => adaptMangaToSource(m, sId));
  }

  if (sId.includes('mangapill')) {
    return FALLBACK_MANGA_CATALOG.filter(m => {
      const tags = (m.tags || []).map(t => t.toLowerCase());
      return !tags.includes('manhwa');
    }).map(m => adaptMangaToSource(m, sId));
  }

  return FALLBACK_MANGA_CATALOG.map(m => adaptMangaToSource(m, sId));
}

/**
 * Fetch Popular titles for a specific source
 */
export async function fetchSourcePopular(sourceId) {
  const baseUrl = getApiBaseUrl();
  const id = (sourceId || '').toLowerCase().trim();

  try {
    const url = baseUrl 
      ? `${baseUrl}/api/extensions/source?id=${encodeURIComponent(id)}&type=popular`
      : `/api/extensions/source?id=${encodeURIComponent(id)}&type=popular`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}

  if (id.includes('manga18') || id === 'manga18fx') {
    return await fetchManga18fxSourceManga('popular', '');
  }
  if (id.includes('doujin') || isNsfwSource(id)) {
    return await fetchMangaDexSourceManga('popular', '', true, true);
  }
  if (id.includes('dex') || id === 'md') {
    return await fetchMangaDexSourceManga('popular', '', isNsfwAllowed());
  }
  if (id.includes('katana') || id === 'kat') {
    return await fetchMangaKatanaSourceManga('popular', '');
  }
  if (id.includes('weeb') || id === 'wc') {
    return await fetchWeebCentralSourceManga('popular', '');
  }

  return await getFallbackSourceManga(id, '', 'popular');
}

/**
 * Fetch Latest Updates for a specific source
 */
export async function fetchSourceLatest(sourceId) {
  const baseUrl = getApiBaseUrl();
  const id = (sourceId || '').toLowerCase().trim();

  try {
    const url = baseUrl 
      ? `${baseUrl}/api/extensions/source?id=${encodeURIComponent(id)}&type=latest`
      : `/api/extensions/source?id=${encodeURIComponent(id)}&type=latest`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}

  if (id.includes('manga18') || id === 'manga18fx') {
    return await fetchManga18fxSourceManga('latest', '');
  }
  if (id.includes('doujin') || isNsfwSource(id)) {
    return await fetchMangaDexSourceManga('latest', '', true, true);
  }
  if (id.includes('dex') || id === 'md') {
    return await fetchMangaDexSourceManga('latest', '', isNsfwAllowed());
  }
  if (id.includes('katana') || id === 'kat') {
    return await fetchMangaKatanaSourceManga('latest', '');
  }
  if (id.includes('weeb') || id === 'wc') {
    return await fetchWeebCentralSourceManga('latest', '');
  }

  return await getFallbackSourceManga(id, '', 'latest');
}

/**
 * Search manga specifically within one source
 */
export async function searchSourceManga(sourceId, query) {
  if (!query || !query.trim()) return fetchSourcePopular(sourceId);
  const baseUrl = getApiBaseUrl();
  const id = (sourceId || '').toLowerCase().trim();

  try {
    const url = baseUrl 
      ? `${baseUrl}/api/extensions/source?id=${encodeURIComponent(id)}&type=search&q=${encodeURIComponent(query.trim())}`
      : `/api/extensions/source?id=${encodeURIComponent(id)}&type=search&q=${encodeURIComponent(query.trim())}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}

  if (id.includes('manga18') || id === 'manga18fx') {
    return await fetchManga18fxSourceManga('search', query.trim());
  }
  if (id.includes('doujin') || isNsfwSource(id)) {
    return await fetchMangaDexSourceManga('search', query.trim(), true, true);
  }
  if (id.includes('dex') || id === 'md') {
    return await fetchMangaDexSourceManga('search', query.trim(), isNsfwAllowed());
  }
  if (id.includes('katana') || id === 'kat') {
    return await fetchMangaKatanaSourceManga('search', query.trim());
  }
  if (id.includes('weeb') || id === 'wc') {
    return await fetchWeebCentralSourceManga('search', query.trim());
  }

  return await getFallbackSourceManga(id, query.trim(), 'search');
}

/**
 * Multi-Source Global Search (searches all installed & active sources concurrently)
 */
export async function searchAllInstalledSources(query, onSourceResult = null) {
  if (!query || !query.trim()) return [];
  const showNsfw = isNsfwAllowed();
  const installed = getInstalledExtensions().filter(e => {
    if (e.enabled === false) return false;
    if (!showNsfw && e.contentWarning === 'CONTENT_WARNING_NSFW') return false;
    return true;
  });

  const allResults = [];
  const seenIds = new Set();

  await Promise.allSettled(
    installed.map(async (ext) => {
      const primarySource = ext.sources[0]?.id || ext.name.toLowerCase();
      try {
        const list = await searchSourceManga(primarySource, query);
        if (onSourceResult) {
          onSourceResult(ext.name, list);
        }
        list.forEach(item => {
          const uniqueKey = `${ext.name}_${item.id}`;
          if (!seenIds.has(uniqueKey)) {
            seenIds.add(uniqueKey);
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

/**
 * Dedicated Multi-Source Search for 18+ Adult (NSFW) Sources
 * Concurrently queries Manga18fx, DoujinDesu, MangaDex Adult Archive, and any installed 18+ extensions
 */
export async function searchNsfwSources(query, onSourceResult = null) {
  const q = String(query || '').trim();
  if (!q) return [];
  const allResults = [];
  const seenKeys = new Set();

  // 1. Built-in adult scrapers
  const nsfwSources = [
    { id: 'manga18fx', name: 'Manga18fx', fn: () => fetchManga18fxSourceManga('search', q) },
    { id: 'mangadex_nsfw', name: 'MangaDex (18+)', fn: () => fetchMangaDexSourceManga('search', q, true, true) }
  ];

  // 2. Dynamically include installed 18+ extensions
  const installedNsfw = getInstalledExtensions().filter(e => 
    e.enabled !== false && (e.contentWarning === 'CONTENT_WARNING_NSFW' || isNsfwSource(e.sources[0]?.id))
  );
  installedNsfw.forEach(ext => {
    const srcId = ext.sources[0]?.id || ext.name.toLowerCase();
    if (!nsfwSources.some(s => s.id === srcId)) {
      nsfwSources.push({
        id: srcId,
        name: ext.name,
        fn: () => searchSourceManga(srcId, q)
      });
    }
  });

  await Promise.allSettled(
    nsfwSources.map(async (src) => {
      try {
        const list = await src.fn();
        if (!Array.isArray(list)) return;
        if (onSourceResult) {
          onSourceResult(src.name, list);
        }
        list.forEach(item => {
          if (!item || !item.title) return;
          const key = cleanTitle(item.title).toLowerCase();
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            allResults.push({
              ...item,
              sourceName: item.sourceName || src.name,
              extensionName: src.name,
              contentWarning: 'CONTENT_WARNING_NSFW',
              isNsfw: true
            });
          }
        });
      } catch (err) {
        console.warn(`NSFW search on ${src.name} failed:`, err);
      }
    })
  );

  return allResults;
}

/**
 * Fetch Popular 18+ Adult (NSFW) Titles
 */
export async function fetchNsfwPopular() {
  const allResults = [];
  const seenKeys = new Set();
  const results = await Promise.allSettled([
    fetchManga18fxSourceManga('popular', ''),
    fetchMangaDexSourceManga('popular', '', true, true)
  ]);
  results.forEach(res => {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      res.value.forEach(item => {
        const key = cleanTitle(item.title).toLowerCase();
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          allResults.push({
            ...item,
            contentWarning: 'CONTENT_WARNING_NSFW',
            isNsfw: true
          });
        }
      });
    }
  });
  return allResults;
}

/**
 * Fetch Latest 18+ Adult (NSFW) Releases
 */
export async function fetchNsfwLatest() {
  const allResults = [];
  const seenKeys = new Set();
  const results = await Promise.allSettled([
    fetchManga18fxSourceManga('latest', ''),
    fetchMangaDexSourceManga('latest', '', true, true)
  ]);
  results.forEach(res => {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      res.value.forEach(item => {
        const key = cleanTitle(item.title).toLowerCase();
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          allResults.push({
            ...item,
            contentWarning: 'CONTENT_WARNING_NSFW',
            isNsfw: true
          });
        }
      });
    }
  });
  return allResults;
}
