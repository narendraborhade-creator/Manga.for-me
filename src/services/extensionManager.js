/**
 * Mihon / Tachiyomi Extension & Repository Management System
 * Handles Extension Repositories, Extension Store, Installed Sources & Source Browsing.
 */

import { 
  getApiBaseUrl, 
  fetchClientHtml, 
  cleanTitle, 
  decodeHtml, 
  FALLBACK_MANGA_CATALOG, 
  searchAniList,
  toBase64Url,
  getFallbackCover
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
    contentWarning: 'CONTENT_WARNING_MIXED',
    sources: [
      { id: 'mangadex', name: 'MangaDex', language: 'all', homeUrl: 'https://mangadex.org', badge: 'Official Multi' },
      { id: 'mangadex_nsfw', name: 'MangaDex (18+)', language: 'all', homeUrl: 'https://mangadex.org', badge: '18+ Erotica', isNsfw: true }
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
      { id: 'manga18fx', name: 'Manga18fx', language: 'en', homeUrl: 'https://manga18fx.com', badge: '18+ Adult', isNsfw: true }
    ]
  },
  {
    pkg: 'eu.kanade.tachiyomi.extension.all.nhentai',
    name: 'NHentai',
    versionName: '1.4.40',
    lang: 'all',
    iconUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/all/nhentai/res/mipmap-xhdpi/ic_launcher.png',
    repoId: 'keiyoushi',
    installedAt: Date.now(),
    enabled: true,
    isPinned: false,
    contentWarning: 'CONTENT_WARNING_NSFW',
    sources: [
      { id: 'nhentai', name: 'NHentai', language: 'all', homeUrl: 'https://nhentai.net', badge: '18+ Doujin', isNsfw: true }
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
      { id: 'doujindesu', name: 'DoujinDesu', language: 'all', homeUrl: 'https://doujindesu.tv', badge: '18+ Color', isNsfw: true }
    ]
  },
  {
    pkg: 'eu.kanade.tachiyomi.extension.en.hiperdex',
    name: 'HiperDEX',
    versionName: '1.4.25',
    lang: 'en',
    iconUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/en/hiperdex/res/mipmap-xhdpi/ic_launcher.png',
    repoId: 'keiyoushi',
    installedAt: Date.now(),
    enabled: true,
    isPinned: false,
    contentWarning: 'CONTENT_WARNING_NSFW',
    sources: [
      { id: 'hiperdex', name: 'HiperDEX', language: 'en', homeUrl: 'https://hiperdex.com', badge: '18+ Manhwa', isNsfw: true }
    ]
  },
  {
    pkg: 'eu.kanade.tachiyomi.extension.en.toonily',
    name: 'Toonily',
    versionName: '1.4.30',
    lang: 'en',
    iconUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/en/toonily/res/mipmap-xhdpi/ic_launcher.png',
    repoId: 'keiyoushi',
    installedAt: Date.now(),
    enabled: true,
    isPinned: false,
    contentWarning: 'CONTENT_WARNING_NSFW',
    sources: [
      { id: 'toonily', name: 'Toonily', language: 'en', homeUrl: 'https://toonily.com', badge: '18+ Webtoon', isNsfw: true }
    ]
  },
  {
    pkg: 'eu.kanade.tachiyomi.extension.en.manhwa18',
    name: 'Manhwa18',
    versionName: '1.4.18',
    lang: 'en',
    iconUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/en/manhwa18/res/mipmap-xhdpi/ic_launcher.png',
    repoId: 'keiyoushi',
    installedAt: Date.now(),
    enabled: true,
    isPinned: false,
    contentWarning: 'CONTENT_WARNING_NSFW',
    sources: [
      { id: 'manhwa18', name: 'Manhwa18', language: 'en', homeUrl: 'https://manhwa18.com', badge: '18+ Manhwa', isNsfw: true }
    ]
  },
  {
    pkg: 'eu.kanade.tachiyomi.extension.en.manhwa18cc',
    name: 'Manhwa18.cc',
    versionName: '1.4.14',
    lang: 'en',
    iconUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/en/manhwa18cc/res/mipmap-xhdpi/ic_launcher.png',
    repoId: 'keiyoushi',
    installedAt: Date.now(),
    enabled: true,
    isPinned: false,
    contentWarning: 'CONTENT_WARNING_NSFW',
    sources: [
      { id: 'manhwa18cc', name: 'Manhwa18.cc', language: 'en', homeUrl: 'https://manhwa18.cc', badge: '18+ Raw/En', isNsfw: true }
    ]
  },
  {
    pkg: 'eu.kanade.tachiyomi.extension.en.manytoon',
    name: 'ManyToon',
    versionName: '1.4.22',
    lang: 'en',
    iconUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/en/manytoon/res/mipmap-xhdpi/ic_launcher.png',
    repoId: 'keiyoushi',
    installedAt: Date.now(),
    enabled: true,
    isPinned: false,
    contentWarning: 'CONTENT_WARNING_NSFW',
    sources: [
      { id: 'manytoon', name: 'ManyToon', language: 'en', homeUrl: 'https://manytoon.com', badge: '18+ Webtoon', isNsfw: true }
    ]
  },
  {
    pkg: 'eu.kanade.tachiyomi.extension.en.hentairead',
    name: 'HentaiRead',
    versionName: '1.4.16',
    lang: 'en',
    iconUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/en/hentairead/res/mipmap-xhdpi/ic_launcher.png',
    repoId: 'keiyoushi',
    installedAt: Date.now(),
    enabled: true,
    isPinned: false,
    contentWarning: 'CONTENT_WARNING_NSFW',
    sources: [
      { id: 'hentairead', name: 'HentaiRead', language: 'en', homeUrl: 'https://hentairead.com', badge: '18+ English', isNsfw: true }
    ]
  },
  {
    pkg: 'eu.kanade.tachiyomi.extension.all.asmhentai',
    name: 'AsmHentai',
    versionName: '1.4.11',
    lang: 'all',
    iconUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/all/asmhentai/res/mipmap-xhdpi/ic_launcher.png',
    repoId: 'keiyoushi',
    installedAt: Date.now(),
    enabled: true,
    isPinned: false,
    contentWarning: 'CONTENT_WARNING_NSFW',
    sources: [
      { id: 'asmhentai', name: 'AsmHentai', language: 'all', homeUrl: 'https://asmhentai.com', badge: '18+ Gallery', isNsfw: true }
    ]
  },
  {
    pkg: 'eu.kanade.tachiyomi.extension.all.ehentai',
    name: 'E-Hentai',
    versionName: '1.4.29',
    lang: 'all',
    iconUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/all/ehentai/res/mipmap-xhdpi/ic_launcher.png',
    repoId: 'keiyoushi',
    installedAt: Date.now(),
    enabled: true,
    isPinned: false,
    contentWarning: 'CONTENT_WARNING_NSFW',
    sources: [
      { id: 'ehentai', name: 'E-Hentai', language: 'all', homeUrl: 'https://e-hentai.org', badge: '18+ Archive', isNsfw: true }
    ]
  },
  {
    pkg: 'eu.kanade.tachiyomi.extension.en.allporncomic',
    name: 'AllPornComic',
    versionName: '1.4.10',
    lang: 'en',
    iconUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/en/allporncomic/res/mipmap-xhdpi/ic_launcher.png',
    repoId: 'keiyoushi',
    installedAt: Date.now(),
    enabled: true,
    isPinned: false,
    contentWarning: 'CONTENT_WARNING_NSFW',
    sources: [
      { id: 'allporncomic', name: 'AllPornComic', language: 'en', homeUrl: 'https://allporncomic.com', badge: '18+ Comics', isNsfw: true }
    ]
  },
  {
    pkg: 'eu.kanade.tachiyomi.extension.all.hentaifox',
    name: 'HentaiFox',
    versionName: '1.4.14',
    lang: 'all',
    iconUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/all/hentaifox/res/mipmap-xhdpi/ic_launcher.png',
    repoId: 'keiyoushi',
    installedAt: Date.now(),
    enabled: true,
    isPinned: false,
    contentWarning: 'CONTENT_WARNING_NSFW',
    sources: [
      { id: 'hentaifox', name: 'HentaiFox', language: 'all', homeUrl: 'https://hentaifox.com', badge: '18+ Doujin', isNsfw: true }
    ]
  },
  {
    pkg: 'eu.kanade.tachiyomi.extension.all.imhentai',
    name: 'IMHentai',
    versionName: '1.4.12',
    lang: 'all',
    iconUrl: 'https://cdn.jsdelivr.net/gh/keiyoushi/extensions-source@main/src/all/imhentai/res/mipmap-xhdpi/ic_launcher.png',
    repoId: 'keiyoushi',
    installedAt: Date.now(),
    enabled: true,
    isPinned: false,
    contentWarning: 'CONTENT_WARNING_NSFW',
    sources: [
      { id: 'imhentai', name: 'IMHentai', language: 'all', homeUrl: 'https://imhentai.xxx', badge: '18+ Gallery', isNsfw: true }
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

async function fetchAniListNsfwSourceManga(mode = 'popular', query = '') {
  const cleanQ = String(query || '').trim();
  const sortMode = cleanQ ? 'SEARCH_MATCH' : (mode === 'latest' ? 'UPDATED_AT_DESC' : 'POPULARITY_DESC');
  const gqlQuery = cleanQ
    ? `query ($search: String, $sort: [MediaSort]) {
        Page(page: 1, perPage: 24) {
          media(search: $search, type: MANGA, isAdult: true, sort: $sort) {
            id
            title { romaji english userPreferred }
            coverImage { extraLarge large medium }
            chapters
            status
            averageScore
            genres
            startDate { year }
          }
        }
      }`
    : `query ($sort: [MediaSort]) {
        Page(page: 1, perPage: 24) {
          media(type: MANGA, isAdult: true, sort: $sort) {
            id
            title { romaji english userPreferred }
            coverImage { extraLarge large medium }
            chapters
            status
            averageScore
            genres
            startDate { year }
          }
        }
      }`;

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        query: gqlQuery,
        variables: cleanQ ? { search: cleanQ, sort: [sortMode] } : { sort: [sortMode] }
      }),
      signal: AbortSignal.timeout(6500)
    });
    if (!res.ok) return [];
    const json = await res.json();
    const media = json?.data?.Page?.media || [];
    return media.map(m => {
      const title = cleanTitle(m.title?.english || m.title?.romaji || m.title?.userPreferred || 'Adult Manga');
      const totalCh = m.chapters || 24;
      return {
        id: `anilist:${m.id}`,
        rawId: String(m.id),
        title,
        englishTitle: m.title?.english ? cleanTitle(m.title.english) : title,
        coverUrl: m.coverImage?.extraLarge || m.coverImage?.large || m.coverImage?.medium || getFallbackCover(title),
        sourceName: 'AniList (18+)',
        status: m.status === 'FINISHED' ? 'Completed' : 'Ongoing',
        score: m.averageScore ? (m.averageScore / 10).toFixed(1) : '8.9',
        year: m.startDate?.year ? String(m.startDate.year) : '2024',
        tags: (m.genres && m.genres.length > 0) ? ['18+ Adult', ...m.genres.slice(0, 3)] : ['18+ Adult', 'Ecchi'],
        totalChapters: totalCh,
        latestChapter: String(totalCh),
        contentWarning: 'CONTENT_WARNING_NSFW',
        isNsfw: true
      };
    });
  } catch (err) {
    console.warn('fetchAniListNsfwSourceManga error:', err);
    return [];
  }
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
    let json = null;
    // Use native Android OkHttp bridge first when in APK so WebView Origin headers don't trigger 403
    if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.fetchHtml === 'function') {
      try {
        const raw = window.AndroidBridge.fetchHtml(url);
        if (raw && raw.trim().startsWith('{')) {
          json = JSON.parse(raw);
        }
      } catch {}
    }

    if (!json) {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        json = await res.json();
      }
    }

    const mapped = (json?.data || []).map(item => {
      const formatted = formatMangaDexItem(item);
      if (formatted && (nsfwOnly || item.attributes?.contentRating === 'erotica' || item.attributes?.contentRating === 'pornographic')) {
        formatted.contentWarning = 'CONTENT_WARNING_NSFW';
        formatted.isNsfw = true;
      }
      return formatted;
    }).filter(Boolean);

    if (mapped.length > 0) return mapped;
  } catch (err) {
    console.warn('fetchMangaDexSourceManga error:', err);
  }

  if (nsfwOnly) {
    return await fetchAniListNsfwSourceManga(mode, query);
  }
  return [];
}

export async function fetchManga18fxSourceManga(mode = 'popular', query = '') {
  const baseUrl = getApiBaseUrl();
  if (baseUrl) {
    try {
      const q = String(query || '').trim();
      const apiUrl = `${baseUrl}/api/extensions/source?id=manga18fx&type=${mode}${q ? `&q=${encodeURIComponent(q)}` : ''}`;
      const res = await fetch(apiUrl, { signal: AbortSignal.timeout(4500) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {}
  }

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
      const seenSlugs = new Set();
      const regex = /<div class="(?:bsx-item|page-item-detail|bixbox)[\s\S]{0,1800}?<a[^>]+href="(?:https?:\/\/manga18fx\.com)?\/manga\/([^"#?/]+)\/?"[^>]*?(?:title="([^"]+)")?[\s\S]{0,800}?<img [^>]*(?:data-src|data-lazy-src|src)="([^"]+)"/gi;
      for (const m of html.matchAll(regex)) {
        const slug = m[1];
        if (!slug || seenSlugs.has(slug)) continue;
        seenSlugs.add(slug);
        const rawTitle = m[2] || slug.replace(/-/g, ' ');
        let cover = m[3];
        if (cover && cover.startsWith('//')) cover = `https:${cover}`;
        const title = cleanTitle(decodeHtml(rawTitle));
        items.push({
          id: `m18:${slug}`,
          rawId: slug,
          title,
          englishTitle: title,
          coverUrl: cover,
          rawCoverUrl: cover,
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

function isNsfwSource(sourceIdOrName) {
  const s = String(sourceIdOrName || '').toLowerCase();
  return /(?:manga18|manhwa18|18fx|18\+|nsfw|doujin|hentai|erocool|asmhentai|hentaifox|imhentai|hentairead|hiperdex|toonily|manytoon|allporncomic|ehentai|e-hentai|nhentai|adult|erotica|porn|smut)/i.test(s);
}

function makeExtMangaId(homeUrl, mangaUrl) {
  return `ext:${toBase64Url(homeUrl)}:${toBase64Url(mangaUrl)}`;
}

function resolveExtensionUrl(rawUrl, baseHome) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) {
    return '';
  }
  try {
    return new URL(trimmed, baseHome).toString();
  } catch {
    return '';
  }
}

function extractImageFromTag(tagHtml, baseHome) {
  if (!tagHtml) return '';
  const attrMatch = tagHtml.match(/\b(?:data-src|data-lazy-src|data-original|data-cfsrc|src)=["']([^"']+)["']/i)
    || tagHtml.match(/\bsrcset=["']([^"'\s,]+)/i);
  if (!attrMatch) return '';
  const resolved = resolveExtensionUrl(attrMatch[1], baseHome);
  if (!resolved) return '';
  const lower = resolved.toLowerCase();
  if (
    lower.includes('logo') ||
    lower.includes('favicon') ||
    lower.includes('avatar') ||
    lower.includes('spinner') ||
    lower.includes('loading') ||
    lower.includes('placeholder') ||
    lower.includes('1x1')
  ) {
    return '';
  }
  return resolved;
}

function adaptMangaToSource(manga, sourceId, sourceMeta = null) {
  const sId = String(sourceId || sourceMeta?.id || '').toLowerCase().trim();
  let srcName = sourceMeta?.name || 'Manga Source';
  if (!sourceMeta?.name) {
    if (sId.includes('katana') || sId === 'kat') srcName = 'MangaKatana';
    else if (sId.includes('weeb') || sId === 'wc') srcName = 'WeebCentral';
    else if (sId.includes('dex') || sId === 'md') srcName = 'MangaDex';
    else if (sId.includes('asura')) srcName = 'Asura Scans';
    else if (sId.includes('flame')) srcName = 'Flame Comics';
    else if (sId.includes('thunder')) srcName = 'Thunder Scans';
    else if (sId.includes('webtoon')) srcName = 'Webtoons';
    else if (sId.includes('mangapill')) srcName = 'MangaPill';
    else if (sId.includes('18') || sId.includes('doujin')) srcName = String(sourceId).toUpperCase();
    else if (sourceId) srcName = String(sourceId).charAt(0).toUpperCase() + String(sourceId).slice(1);
  }

  const isNsfw = Boolean(
    sourceMeta?.isNsfw ||
    sourceMeta?.contentWarning === 'CONTENT_WARNING_NSFW' ||
    isNsfwSource(sId) ||
    manga.isNsfw
  );

  return {
    ...manga,
    id: manga.id.includes(':') ? manga.id : `${sId || 'ext'}:${manga.id}`,
    sourceName: srcName,
    ...(isNsfw ? { contentWarning: 'CONTENT_WARNING_NSFW', isNsfw: true } : {})
  };
}

async function getFallbackSourceManga(sourceId, query = '', mode = 'popular', sourceMeta = null) {
  const sId = String(sourceId || sourceMeta?.id || '').toLowerCase().trim();
  const q = String(query || '').toLowerCase().trim();
  const metaNsfw = Boolean(
    sourceMeta?.isNsfw ||
    sourceMeta?.contentWarning === 'CONTENT_WARNING_NSFW' ||
    isNsfwSource(sId) ||
    isNsfwSource(sourceMeta?.name) ||
    isNsfwSource(sourceMeta?.homeUrl)
  );
  const isNsfw = metaNsfw || isNsfwAllowed();

  if (q) {
    if (metaNsfw) {
      try {
        const mdNsfw = await fetchMangaDexSourceManga('search', q, true, true);
        if (mdNsfw.length > 0) return mdNsfw;
      } catch {}
      return [];
    }

    // 1. Search local verified catalog
    const localMatches = FALLBACK_MANGA_CATALOG.filter(m => {
      const t = (m.title || '').toLowerCase();
      const eng = (m.englishTitle || '').toLowerCase();
      const aliases = (m.aliases || []).map(a => String(a).toLowerCase());
      return t.includes(q) || eng.includes(q) || aliases.some(a => a.includes(q));
    }).map(m => adaptMangaToSource(m, sId, sourceMeta));

    if (localMatches.length > 0) {
      return localMatches;
    }

    // 2. Query MangaDex or AniList
    try {
      if (sId.includes('dex') || sId === 'md') {
        const mdMatches = await fetchMangaDexSourceManga('search', q, isNsfw, false);
        if (mdMatches.length > 0) return mdMatches;
      }

      const anilistMatches = await searchAniList(query);
      if (anilistMatches && anilistMatches.length > 0) {
        return anilistMatches.map(m => adaptMangaToSource(m, sId, sourceMeta));
      }
    } catch {}

    return [];
  }

  // Browse Popular / Latest without query
  if (metaNsfw) {
    try {
      const nsfwList = await fetchMangaDexSourceManga(mode, '', true, true);
      if (nsfwList.length > 0) return nsfwList;
    } catch {}
    return [];
  }

  if (sId.includes('asura') || sId.includes('flame') || sId.includes('thunder')) {
    return FALLBACK_MANGA_CATALOG.filter(m => {
      const tags = (m.tags || []).map(t => t.toLowerCase());
      return tags.includes('manhwa') || tags.includes('action') || (m.aliases || []).some(a => a.includes(sId));
    }).map(m => adaptMangaToSource(m, sId, sourceMeta));
  }

  if (sId.includes('webtoon')) {
    return FALLBACK_MANGA_CATALOG.filter(m => {
      const tags = (m.tags || []).map(t => t.toLowerCase());
      return tags.includes('manhwa') || (m.author && m.author.includes('Park'));
    }).map(m => adaptMangaToSource(m, sId, sourceMeta));
  }

  if (sId.includes('mangapill')) {
    return FALLBACK_MANGA_CATALOG.filter(m => {
      const tags = (m.tags || []).map(t => t.toLowerCase());
      return !tags.includes('manhwa');
    }).map(m => adaptMangaToSource(m, sId, sourceMeta));
  }

  return FALLBACK_MANGA_CATALOG.map(m => adaptMangaToSource(m, sId, sourceMeta));
}

/**
 * NHentai API & HTML client scraper
 */
export async function fetchNHentaiSourceManga(mode = 'popular', query = '', sourceMeta = null) {
  const q = String(query || '').trim();
  const baseHome = 'https://nhentai.net';
  const apiUrl = q
    ? `${baseHome}/api/galleries/search?query=${encodeURIComponent(q)}&sort=popular`
    : (mode === 'latest'
        ? `${baseHome}/api/galleries/all`
        : `${baseHome}/api/galleries/search?query=english&sort=popular`);

  const extMap = { j: 'jpg', p: 'png', g: 'gif', w: 'webp' };
  const mapGallery = (g) => {
    if (!g || !g.id) return null;
    const rawTitle = g.title?.english || g.title?.pretty || g.title?.japanese || `Gallery #${g.id}`;
    const title = cleanTitle(decodeHtml(rawTitle));
    const coverExt = extMap[g.images?.cover?.t] || 'jpg';
    const coverUrl = g.media_id
      ? `https://t.nhentai.net/galleries/${g.media_id}/cover.${coverExt}`
      : getFallbackCover(title);
    const galleryUrl = `${baseHome}/g/${g.id}/`;
    const tags = Array.isArray(g.tags)
      ? g.tags.filter(t => t.type === 'tag' || t.type === 'parody').map(t => t.name).slice(0, 4)
      : [];

    return {
      id: makeExtMangaId(baseHome, galleryUrl),
      rawId: String(g.id),
      title,
      englishTitle: cleanTitle(decodeHtml(g.title?.pretty || g.title?.english || title)),
      coverUrl,
      sourceName: sourceMeta?.name || 'NHentai',
      status: 'Completed',
      score: '9.5',
      tags: tags.length > 0 ? tags : ['18+ Adult', 'Doujinshi'],
      totalChapters: 1,
      latestChapter: `${g.num_pages || 1} Pages`,
      contentWarning: 'CONTENT_WARNING_NSFW',
      isNsfw: true,
      homeUrl: baseHome,
      mangaUrl: galleryUrl
    };
  };

  try {
    let json = null;
    try {
      const res = await fetch(apiUrl, { signal: AbortSignal.timeout(5500) });
      if (res.ok) json = await res.json();
    } catch {}

    if (!json) {
      const rawText = await fetchClientHtml(apiUrl, 6000);
      if (rawText && rawText.trim().startsWith('{')) {
        try {
          json = JSON.parse(rawText);
        } catch {}
      }
    }

    if (json && Array.isArray(json.result) && json.result.length > 0) {
      return json.result.slice(0, 24).map(mapGallery).filter(Boolean);
    }

    // HTML fallback if JSON API was blocked by CORS/Cloudflare
    const htmlUrl = q ? `${baseHome}/search/?q=${encodeURIComponent(q)}` : `${baseHome}/`;
    const html = await fetchClientHtml(htmlUrl, 6000);
    if (html) {
      const items = [];
      const galleryBlocks = html.split(/<div class="gallery"/i).slice(1);
      for (const block of galleryBlocks.slice(0, 24)) {
        const gMatch = block.match(/href=["']\/g\/(\d+)\/?["']/i);
        if (!gMatch) continue;
        const gId = gMatch[1];
        const imgTag = block.match(/<img\b[^>]*>/i)?.[0] || '';
        const coverUrl = extractImageFromTag(imgTag, baseHome) || getFallbackCover(`Gallery #${gId}`);
        const capMatch = block.match(/<div class="caption"[^>]*>([\s\S]*?)<\/div>/i);
        const rawTitle = capMatch ? capMatch[1].replace(/<[^>]+>/g, ' ').trim() : `Gallery #${gId}`;
        const title = cleanTitle(decodeHtml(rawTitle));
        const galleryUrl = `${baseHome}/g/${gId}/`;

        items.push({
          id: makeExtMangaId(baseHome, galleryUrl),
          rawId: gId,
          title,
          englishTitle: title,
          coverUrl,
          sourceName: sourceMeta?.name || 'NHentai',
          status: 'Completed',
          score: '9.5',
          tags: ['18+ Adult', 'Doujinshi'],
          totalChapters: 1,
          latestChapter: 'Gallery',
          contentWarning: 'CONTENT_WARNING_NSFW',
          isNsfw: true,
          homeUrl: baseHome,
          mangaUrl: galleryUrl
        });
      }
      if (items.length > 0) return items;
    }
  } catch (err) {
    console.warn('fetchNHentaiSourceManga error:', err);
  }

  return await fetchMangaDexSourceManga(mode, q, true, true);
}

function extractGenericCatalogItems(html, baseHome, sourceMeta) {
  if (!html || typeof html !== 'string') return [];

  let baseHost = '';
  try {
    baseHost = new URL(baseHome).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return [];
  }

  const isNsfw = Boolean(
    sourceMeta?.isNsfw ||
    sourceMeta?.contentWarning === 'CONTENT_WARNING_NSFW' ||
    isNsfwSource(sourceMeta?.id || sourceMeta?.name || baseHome)
  );
  const sourceName = sourceMeta?.name || baseHost;

  const isInvalidNavUrl = (urlStr) => {
    try {
      const u = new URL(urlStr);
      const host = u.hostname.replace(/^www\./, '').toLowerCase();
      if (!host.endsWith(baseHost)) return true;
      const p = u.pathname.toLowerCase();
      if (!p || p === '/') return true;
      if (
        /\/(genre|genres|tag|tags|author|authors|artist|artists|login|register|signup|wp-admin|wp-login|wp-content|wp-json|privacy|dmca|contact|terms|about|faq|user|account|bookmarks|history|discord|donate|shop|cart|category|feed|rss|page\/\d+\/?$)/i.test(p)
      ) {
        return true;
      }
      if (/\.(css|js|png|jpe?g|webp|gif|svg|ico|xml|json)$/i.test(p)) return true;
      return false;
    } catch {
      return true;
    }
  };

  const isBadTitle = (t) => {
    const lower = String(t || '').trim().toLowerCase();
    return lower.length < 2 || /^(home|login|register|sign in|read more|next|prev|previous|menu|search|logo|discord|bookmarks?)$/i.test(lower);
  };

  const items = [];
  const seenUrls = new Set();

  const pushCandidate = (href, imgTag, rawTitleCandidate) => {
    if (items.length >= 24) return;
    const mangaUrl = resolveExtensionUrl(href, baseHome);
    if (!mangaUrl || isInvalidNavUrl(mangaUrl)) return;
    if (/\/chapter[-_]?\d+/i.test(mangaUrl) && !/\/manga\/[^/]+\/?$/i.test(mangaUrl)) return;

    const canonical = mangaUrl.replace(/\/+$/, '');
    if (seenUrls.has(canonical)) return;

    const coverUrl = extractImageFromTag(imgTag, baseHome);
    if (!coverUrl) return;

    const slugTitle = canonical.split('/').pop()?.replace(/[-_]+/g, ' ') || '';
    const altMatch = imgTag.match(/\balt=["']([^"']+)["']/i);
    const chosenTitle = [rawTitleCandidate, altMatch?.[1], slugTitle].find(t => t && !isBadTitle(t));
    if (!chosenTitle) return;

    const title = cleanTitle(decodeHtml(String(chosenTitle).replace(/<[^>]+>/g, ' ').trim()));
    if (isBadTitle(title)) return;

    seenUrls.add(canonical);
    items.push({
      id: makeExtMangaId(baseHome, mangaUrl),
      title,
      englishTitle: title,
      coverUrl,
      sourceName,
      status: 'Ongoing',
      score: '9.0',
      tags: isNsfw ? ['18+ Adult', sourceName] : ['Manga', sourceName],
      homeUrl: baseHome,
      mangaUrl,
      ...(isNsfw ? { contentWarning: 'CONTENT_WARNING_NSFW', isNsfw: true } : { contentWarning: 'CONTENT_WARNING_SAFE', isNsfw: false })
    });
  };

  // Pass 1: Split common Madara / MangaStream / gallery card containers
  const cardBlocks = html.split(/<div[^>]+class=["'][^"']*(?:page-item-detail|c-tabs-item__content|bsx|utao|manga-item|book-item|itemupdate|gallery|series-card|item\b)[^"']*["'][^>]*>|<article\b[^>]*>/i).slice(1);
  for (const rawBlock of cardBlocks) {
    if (items.length >= 24) break;
    const block = rawBlock.slice(0, 2600);
    const imgTag = block.match(/<img\b[^>]*>/i)?.[0] || '';
    if (!imgTag) continue;

    const links = [...block.matchAll(/<a\b[^>]*href=["']([^"']+)["']([^>]*)>([\s\S]{0,400}?)<\/a>/gi)];
    const preferredLink = links.find(l => /\/(?:manga|series|comic|webtoon|manhwa|doujin|book|title|g)\//i.test(l[1]))
      || links.find(l => !/\/chapter/i.test(l[1]) && !isInvalidNavUrl(resolveExtensionUrl(l[1], baseHome)))
      || links[0];
    if (!preferredLink) continue;

    const headingMatch = block.match(/<h[1-5][^>]*>([\s\S]*?)<\/h[1-5]>/i);
    const titleAttrMatch = preferredLink[2]?.match(/\btitle=["']([^"']+)["']/i);
    const rawTitleCandidate = headingMatch?.[1] || titleAttrMatch?.[1] || preferredLink[3]?.replace(/<[^>]+>/g, ' ').trim();

    pushCandidate(preferredLink[1], imgTag, rawTitleCandidate);
  }

  // Pass 2: Generic <a href="..."><img ...></a> scan fallback
  if (items.length < 3) {
    const anchorImgRegex = /<a\b([^>]*href=["']([^"']+)["'][^>]*)>([\s\S]{0,1200}?<img\b[^>]*>[\s\S]{0,400}?)<\/a>/gi;
    for (const m of html.matchAll(anchorImgRegex)) {
      if (items.length >= 24) break;
      const attrs = m[1] || '';
      const href = m[2] || '';
      const inner = m[3] || '';
      const imgTag = inner.match(/<img\b[^>]*>/i)?.[0] || '';
      const titleAttrMatch = attrs.match(/\btitle=["']([^"']+)["']/i);
      const innerText = inner.replace(/<[^>]+>/g, ' ').trim();
      pushCandidate(href, imgTag, titleAttrMatch?.[1] || innerText);
    }
  }

  return items;
}

/**
 * Generic HTML catalog scraper for any Keiyoushi / Mihon extension homeUrl
 */
export async function fetchGenericExtensionManga(sourceMeta, mode = 'popular', query = '') {
  const rawHome = String(sourceMeta?.homeUrl || sourceMeta?.baseUrl || '').trim();
  const sourceId = String(sourceMeta?.id || sourceMeta?.name || 'extension').trim();
  const q = String(query || '').trim();

  if (!rawHome || !/^https?:\/\//i.test(rawHome)) {
    return await getFallbackSourceManga(sourceId, q, mode, sourceMeta);
  }

  const baseHome = rawHome.replace(/\/+$/, '');
  const candidateUrls = q
    ? [
        `${baseHome}/?s=${encodeURIComponent(q)}&post_type=wp-manga`,
        `${baseHome}/?s=${encodeURIComponent(q)}`,
        `${baseHome}/search?q=${encodeURIComponent(q)}`
      ]
    : mode === 'latest'
      ? [
          `${baseHome}/manga/?m_orderby=latest`,
          `${baseHome}/manga/?order=update`,
          `${baseHome}/`
        ]
      : [
          `${baseHome}/manga/?m_orderby=views`,
          `${baseHome}/manga/?order=popular`,
          `${baseHome}/`
        ];

  for (const targetUrl of candidateUrls) {
    try {
      const html = await fetchClientHtml(targetUrl, 4500);
      if (!html) continue;
      const items = extractGenericCatalogItems(html, baseHome, sourceMeta);
      if (items.length > 0) {
        return items;
      }
    } catch {}
  }

  return await getFallbackSourceManga(sourceId, q, mode, sourceMeta);
}

async function fetchSourceCatalog(sourceId, mode = 'popular', query = '', sourceMeta = null) {
  const baseUrl = getApiBaseUrl();
  const id = String(sourceId || sourceMeta?.id || '').toLowerCase().trim();
  const metaName = String(sourceMeta?.name || '').toLowerCase();
  const metaHome = String(sourceMeta?.homeUrl || sourceMeta?.baseUrl || '').toLowerCase();
  const q = String(query || '').trim();

  const metaHomeUrl = String(sourceMeta?.homeUrl || sourceMeta?.baseUrl || '').trim();
  const homeParam = metaHomeUrl ? `&homeUrl=${encodeURIComponent(metaHomeUrl)}` : '';

  // 1. NHentai API / HTML client handler
  if ((id.includes('nhentai') || metaName.includes('nhentai') || metaHome.includes('nhentai.net')) &&
      !id.includes('asm') && !id.includes('imhentai')) {
    return await fetchNHentaiSourceManga(mode, q, sourceMeta);
  }

  // 1b. AniList 18+ Adult Catalog handler
  if (id === 'anilist_nsfw' || metaName === 'anilist (18+)') {
    return await fetchAniListNsfwSourceManga(mode, q);
  }

  // 2. Manga18fx scraper (including mangadex_nsfw)
  if (id === 'mangadex_nsfw' || metaName === 'mangadex (18+)') {
    return await fetchMangaDexSourceManga(mode, q, true, true);
  }
  if (id.includes('manga18') || id === 'manga18fx' || metaHome.includes('manga18fx')) {
    return await fetchManga18fxSourceManga(mode, q);
  }

  const combinedText = `${id} ${metaName} ${metaHome}`;
  const matchedServerId =
    (combinedText.includes('katana') || id === 'kat' || metaHome.includes('mangakatana')) ? 'kat' :
    (combinedText.includes('weebcentral') || id === 'wc' || metaHome.includes('weebcentral')) ? 'wc' :
    (combinedText.includes('mangadex') || id === 'md' || id.includes('dex') || metaHome.includes('mangadex')) ? 'md' :
    (combinedText.includes('asura') || metaHome.includes('asura')) ? 'asura' :
    (combinedText.includes('flame') || metaHome.includes('flame')) ? 'flame' :
    (combinedText.includes('thunder') || metaHome.includes('thunder')) ? 'thunder' :
    (combinedText.includes('kakalot') || id === 'mk' || metaHome.includes('kakamanga') || metaHome.includes('mangakakalot') || metaHome.includes('manganato')) ? 'mk' :
    (combinedText.includes('webtoon') || metaHome.includes('webtoons.com')) ? 'webtoon' :
    null;

  if (matchedServerId) {
    try {
      const url = baseUrl
        ? `${baseUrl}/api/extensions/source?id=${encodeURIComponent(matchedServerId)}&type=${mode}${q ? `&q=${encodeURIComponent(q)}` : ''}${homeParam}`
        : `/api/extensions/source?id=${encodeURIComponent(matchedServerId)}&type=${mode}${q ? `&q=${encodeURIComponent(q)}` : ''}${homeParam}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {}
  }

  if (matchedServerId === 'md') {
    return await fetchMangaDexSourceManga(mode, q, Boolean(sourceMeta?.isNsfw || isNsfwAllowed()));
  }
  if (matchedServerId === 'kat') {
    return await fetchMangaKatanaSourceManga(mode, q);
  }
  if (matchedServerId === 'wc') {
    return await fetchWeebCentralSourceManga(mode, q);
  }

  const isNsfw = Boolean(
    sourceMeta?.isNsfw ||
    sourceMeta?.contentWarning === 'CONTENT_WARNING_NSFW' ||
    id.includes('doujin') ||
    isNsfwSource(id) ||
    isNsfwSource(metaName) ||
    isNsfwSource(metaHome)
  );

  // 3. Backend proxy first for generic extension sites (avoids Cloudflare/CORS blocks in browser)
  if (metaHomeUrl || isNsfw) {
    try {
      const url = baseUrl
        ? `${baseUrl}/api/extensions/source?id=${encodeURIComponent(id || metaName)}&type=${mode}${q ? `&q=${encodeURIComponent(q)}` : ''}${homeParam}`
        : `/api/extensions/source?id=${encodeURIComponent(id || metaName)}&type=${mode}${q ? `&q=${encodeURIComponent(q)}` : ''}${homeParam}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {}
  }

  // 4. Generic extension HTML catalog scraper when homeUrl is provided
  if (metaHomeUrl) {
    return await fetchGenericExtensionManga(sourceMeta, mode, q);
  }

  if (isNsfw) {
    return await fetchMangaDexSourceManga(mode, q, true, true);
  }

  return await getFallbackSourceManga(id, q, mode, sourceMeta);
}

/**
 * Fetch Popular titles for a specific source
 */
export async function fetchSourcePopular(sourceId, sourceMeta = null) {
  return await fetchSourceCatalog(sourceId, 'popular', '', sourceMeta);
}

/**
 * Fetch Latest Updates for a specific source
 */
export async function fetchSourceLatest(sourceId, sourceMeta = null) {
  return await fetchSourceCatalog(sourceId, 'latest', '', sourceMeta);
}

/**
 * Search manga specifically within one source
 */
export async function searchSourceManga(sourceId, query, sourceMeta = null) {
  if (!query || !query.trim()) return fetchSourcePopular(sourceId, sourceMeta);
  return await fetchSourceCatalog(sourceId, 'search', query.trim(), sourceMeta);
}

function getUniqueSubSources(extensions, includeNsfw = true, maxCount = 60) {
  const flat = flattenExtensionSources(extensions, includeNsfw);
  const unique = [];
  const seenKeys = new Set();

  for (const sub of flat) {
    const key = `${String(sub.extensionPkg || '').toLowerCase()}:${String(sub.id || sub.homeUrl || sub.name || '').toLowerCase().trim()}`;
    if (!key || seenKeys.has(key)) continue;
    seenKeys.add(key);
    unique.push(sub);
    if (maxCount > 0 && unique.length >= maxCount) break;
  }

  return unique;
}

function getInstalledNsfwSubSources(maxCount = 0) {
  const installed = getInstalledExtensions().filter(e => e && e.enabled !== false);
  const flat = flattenExtensionSources(installed, true);
  const unique = [];
  const seenKeys = new Set();

  for (const sub of flat) {
    const isMixed = sub.contentWarning === 'CONTENT_WARNING_MIXED';
    const isSafeSubOfMixed = isMixed && String(sub.id || '').toLowerCase() === 'mangadex';
    const isSubNsfw = !isSafeSubOfMixed && Boolean(
      sub.isNsfw ||
      sub.contentWarning === 'CONTENT_WARNING_NSFW' ||
      isNsfwSource(sub.id) ||
      isNsfwSource(sub.name) ||
      isNsfwSource(sub.homeUrl)
    );
    if (!isSubNsfw) continue;

    const key = `${String(sub.extensionPkg || '').toLowerCase()}:${String(sub.id || sub.homeUrl || sub.name || '').toLowerCase().trim()}`;
    if (!key || seenKeys.has(key)) continue;
    seenKeys.add(key);
    unique.push(sub);
    if (maxCount > 0 && unique.length >= maxCount) break;
  }

  return unique;
}

/**
 * Return EVERY available 18+ NSFW source across built-ins, installed extensions, and repo catalogs
 */
export function getAllNsfwSources(availableCatalog = [], installedList = null) {
  const installed = Array.isArray(installedList) ? installedList : getInstalledExtensions();
  const installedPkgs = new Set(installed.map(e => e.pkg));
  const result = [];
  const seenKeys = new Set();

  const pushUnique = (sub, isInstalled, parentExt = null) => {
    const subId = String(sub.id || sub.name || '').toLowerCase().trim();
    const home = String(sub.homeUrl || sub.baseUrl || '').toLowerCase().replace(/\/+$/, '');
    const key = `${subId}|${home}`;
    if (!subId || seenKeys.has(key)) return;
    seenKeys.add(key);
    result.push({
      ...sub,
      id: String(sub.id || sub.name || '').trim(),
      name: sub.name || parentExt?.name || '18+ Source',
      language: sub.language || parentExt?.lang || 'all',
      homeUrl: sub.homeUrl || sub.baseUrl || '',
      extensionPkg: sub.extensionPkg || parentExt?.pkg || '',
      extensionName: sub.extensionName || parentExt?.name || sub.name,
      iconUrl: sub.iconUrl || parentExt?.iconUrl || null,
      apkUrl: sanitizeHttpUrl(sub.apkUrl || parentExt?.apkUrl) || null,
      contentWarning: 'CONTENT_WARNING_NSFW',
      isNsfw: true,
      isInstalled,
      enabled: parentExt ? parentExt.enabled !== false : true,
      parentExtension: parentExt || null,
    });
  };

  // Built-in Adult Archive engines
  pushUnique({
    id: 'anilist_nsfw',
    name: 'AniList (18+)',
    language: 'all',
    homeUrl: 'https://anilist.co',
    badge: '18+ Catalog',
    extensionPkg: 'builtin.anilist.nsfw',
    extensionName: 'AniList (18+)',
    iconUrl: 'https://anilist.co/img/icons/android-chrome-512x512.png',
  }, true);

  // Installed NSFW & Mixed 18+ sub-sources first
  for (const ext of installed) {
    const hydrated = hydrateExtensionShape(ext);
    for (const src of (hydrated.sources || [])) {
      const subNsfw = Boolean(
        src.isNsfw ||
        hydrated.contentWarning === 'CONTENT_WARNING_NSFW' ||
        isNsfwSource(src.id) ||
        isNsfwSource(src.name) ||
        isNsfwSource(src.homeUrl)
      );
      if (subNsfw) {
        pushUnique(src, true, hydrated);
      }
    }
  }

  // All remaining NSFW & Mixed sources from connected extension repositories (Keiyoushi etc.)
  for (const rawExt of (Array.isArray(availableCatalog) ? availableCatalog : [])) {
    if (!rawExt) continue;
    const ext = hydrateExtensionShape(rawExt);
    const isExtInstalled = installedPkgs.has(ext.pkg);
    const extIsNsfw = ext.contentWarning === 'CONTENT_WARNING_NSFW' || ext.contentWarning === 'CONTENT_WARNING_MIXED' || isNsfwSource(ext.name);
    for (const src of (ext.sources || [])) {
      const subNsfw = Boolean(
        src.isNsfw ||
        ext.contentWarning === 'CONTENT_WARNING_NSFW' ||
        isNsfwSource(src.id) ||
        isNsfwSource(src.name) ||
        isNsfwSource(src.homeUrl) ||
        (extIsNsfw && src.id !== 'mangadex')
      );
      if (subNsfw) {
        pushUnique(src, isExtInstalled, ext);
      }
    }
  }

  return result;
}

/**
 * Multi-Source Global Search (searches all unique sub-sources across enabled installed extensions in batches)
 */
export async function searchAllInstalledSources(query, onSourceResult = null) {
  if (!query || !query.trim()) return [];
  const showNsfw = isNsfwAllowed();
  const subSources = getUniqueSubSources(getInstalledExtensions(), showNsfw, 60);

  const allResults = [];
  const seenIds = new Set();
  const CONCURRENCY = 8;

  for (let i = 0; i < subSources.length; i += CONCURRENCY) {
    const batch = subSources.slice(i, i + CONCURRENCY);
    await Promise.allSettled(
      batch.map(async (sub) => {
        try {
          const list = await searchSourceManga(sub.id, query, sub);
          if (onSourceResult) {
            onSourceResult(sub.name || sub.extensionName, list);
          }
          (list || []).forEach(item => {
            const uniqueKey = `${sub.extensionPkg}_${sub.id}_${item.id}`;
            if (!seenIds.has(uniqueKey)) {
              seenIds.add(uniqueKey);
              allResults.push({
                ...item,
                sourceName: item.sourceName || sub.name,
                extensionPkg: sub.extensionPkg,
                extensionName: sub.extensionName
              });
            }
          });
        } catch (err) {
          console.warn(`Search failed on ${sub.name || sub.extensionName}:`, err);
        }
      })
    );
  }

  return allResults;
}

/**
 * Dedicated Multi-Source Search for 18+ Adult (NSFW) Sources
 * Concurrently queries enabled Manga18fx, MangaDex Adult Archive, and all unique installed 18+/Mixed sub-sources
 */
export async function searchNsfwSources(query, onSourceResult = null) {
  const q = String(query || '').trim();
  if (!q) return [];
  const allResults = [];
  const seenKeys = new Set();

  const installedSubSources = getInstalledNsfwSubSources(0);
  const nsfwSources = [
    { id: 'anilist_nsfw', name: 'AniList (18+)', fn: () => fetchAniListNsfwSourceManga('search', q) }
  ];
  const addedIds = new Set(['anilist_nsfw']);

  installedSubSources.forEach(sub => {
    const subKey = String(sub.id || sub.name || '').toLowerCase().trim();
    if (!subKey || addedIds.has(subKey)) return;
    addedIds.add(subKey);
    nsfwSources.push({
      id: sub.id,
      name: sub.name || sub.extensionName,
      fn: () => searchSourceManga(sub.id, q, sub)
    });
  });

  if (!addedIds.has('manga18fx')) {
    nsfwSources.push({ id: 'manga18fx', name: 'Manga18fx', fn: () => fetchManga18fxSourceManga('search', q) });
  }
  if (!addedIds.has('mangadex_nsfw')) {
    nsfwSources.push({ id: 'mangadex_nsfw', name: 'MangaDex (18+)', fn: () => fetchMangaDexSourceManga('search', q, true, true) });
  }

  const CONCURRENCY = 8;
  for (let i = 0; i < nsfwSources.length; i += CONCURRENCY) {
    const batch = nsfwSources.slice(i, i + CONCURRENCY);
    await Promise.allSettled(
      batch.map(async (src) => {
        try {
          const list = await src.fn();
          if (!Array.isArray(list)) return;
          if (onSourceResult) {
            onSourceResult(src.name, list);
          }
          list.forEach(item => {
            if (!item || !item.title) return;
            const key = `${src.id}:${item.id || cleanTitle(item.title).toLowerCase()}`;
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
  }

  return allResults;
}

async function fetchNsfwFeed(mode = 'popular') {
  const allResults = [];
  const seenKeys = new Set();

  const tasks = [
    fetchAniListNsfwSourceManga(mode, ''),
    fetchManga18fxSourceManga(mode, ''),
    fetchMangaDexSourceManga(mode, '', true, true)
  ];

  const extraSubSources = getInstalledNsfwSubSources(0).filter(
    s => !['manga18fx', 'mangadex_nsfw'].includes(String(s.id || '').toLowerCase())
  );
  for (const sub of extraSubSources) {
    tasks.push(
      mode === 'latest'
        ? fetchSourceLatest(sub.id, sub)
        : fetchSourcePopular(sub.id, sub)
    );
  }

  const results = await Promise.allSettled(tasks);
  results.forEach(res => {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      res.value.forEach(item => {
        if (!item || !item.title) return;
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
 * Fetch Popular 18+ Adult (NSFW) Titles
 */
export async function fetchNsfwPopular() {
  return await fetchNsfwFeed('popular');
}

/**
 * Fetch Latest 18+ Adult (NSFW) Releases
 */
export async function fetchNsfwLatest() {
  return await fetchNsfwFeed('latest');
}
