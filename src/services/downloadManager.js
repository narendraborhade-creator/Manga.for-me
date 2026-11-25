/**
 * Offline Chapter Download & Native File Download Manager
 * Stores chapter page binaries in IndexedDB (compatible with file:// Android WebView & browsers)
 * and maintains a synchronous metadata summary index in localStorage.
 */

const DB_NAME = 'kuroneko_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'chapters';
const INDEX_STORAGE_KEY = 'kuroneko_downloaded_chapters_v1';

// In-memory cache of created Blob Object URLs so repeated reads don't leak duplicates
const objectUrlCache = new Map();

function readDownloadIndex() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return {};
    const raw = window.localStorage.getItem(INDEX_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeDownloadIndex(index) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.setItem(INDEX_STORAGE_KEY, JSON.stringify(index));
}

function dispatchDownloadsUpdated() {
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('kuroneko:downloads_updated'));
    }
  } catch {}
}

function revokeChapterObjectUrls(chapterId) {
  const prefix = `${String(chapterId || '')}::`;
  for (const [key, objUrl] of objectUrlCache.entries()) {
    if (key.startsWith(prefix)) {
      try {
        if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
          URL.revokeObjectURL(objUrl);
        }
      } catch {}
      objectUrlCache.delete(key);
    }
  }
}

function openOfflineDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is unavailable in this environment'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'chapterId' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Failed to open offline database'));
  });
}

async function idbPutChapter(record) {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(record);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error || new Error('Failed to save offline chapter'));
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error || new Error('Offline storage aborted (quota exceeded or interrupted)'));
    };
  });
}

async function idbGetChapter(chapterId) {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(chapterId);
    req.onsuccess = () => {
      db.close();
      resolve(req.result || null);
    };
    req.onerror = () => {
      db.close();
      reject(req.error || new Error('Failed to read offline chapter'));
    };
  });
}

async function idbDeleteChapter(chapterId) {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(chapterId);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error || new Error('Failed to delete offline chapter'));
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error || new Error('Delete offline chapter aborted'));
    };
  });
}

function unwrapProxyImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  if (url.includes('/api/image-proxy?url=')) {
    try {
      const match = url.match(/url=([^&]+)/);
      if (match) return decodeURIComponent(match[1]);
    } catch {}
  }
  return url;
}

async function fetchPageForOffline(page, idx, refererHint = '') {
  const pageNumber = page?.pageNumber || idx + 1;
  const pageUrl = String(page?.url || '').trim();
  const rawUrl = String(page?.originalUrl || unwrapProxyImageUrl(pageUrl) || pageUrl).trim();

  if (!pageUrl && !rawUrl) return null;

  // Already a Data URL (e.g. inline SVG/image)
  if (pageUrl.startsWith('data:')) {
    return { pageNumber, dataUrl: pageUrl, originalUrl: rawUrl };
  }

  // 1. Android Native Bridge (zero CORS binary fetch via OkHttp)
  if (
    typeof window !== 'undefined' &&
    window.AndroidBridge &&
    typeof window.AndroidBridge.fetchImageBase64 === 'function' &&
    /^https?:\/\//i.test(rawUrl)
  ) {
    try {
      const b64 = window.AndroidBridge.fetchImageBase64(rawUrl, refererHint || '');
      if (typeof b64 === 'string' && b64.startsWith('data:') && b64.length > 32) {
        return { pageNumber, dataUrl: b64, originalUrl: rawUrl };
      }
    } catch {}
  }

  // 2. Browser / Local Server Blob Fetch
  const candidates = [pageUrl, rawUrl];
  if (rawUrl && /^https?:\/\//i.test(rawUrl)) {
    candidates.push(`https://images.weserv.nl/?url=${encodeURIComponent(rawUrl)}`);
  }

  const seen = new Set();
  for (const candidate of candidates) {
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      let res;
      try {
        res = await fetch(candidate, { signal: controller.signal });
      } finally {
        clearTimeout(timer);
      }

      if (!res.ok) continue;
      const blob = await res.blob();
      const mime = String(blob?.type || '').toLowerCase();
      if (!blob || blob.size < 100) continue;
      if (mime.includes('text/html') || mime.includes('application/json') || mime.includes('javascript')) continue;

      return {
        pageNumber,
        blob,
        mimeType: mime || 'image/jpeg',
        originalUrl: rawUrl,
      };
    } catch {}
  }

  return null;
}

/**
 * Download a chapter's pages and save them offline into IndexedDB + metadata index.
 * @param {object} manga
 * @param {object} chapter
 * @param {function} onProgress - Called with ({ loaded, total, current, percent }, total)
 * @returns {Promise<{ success: boolean, chapterId: string, pageCount: number, error: string|null }>}
 */
export async function downloadChapterOffline(manga, chapter, onProgress = null) {
  const chapterId = String(chapter?.id || '').trim();
  const mangaId = String(manga?.id || '').trim();

  if (!chapterId) {
    return { success: false, chapterId: '', pageCount: 0, error: 'Missing chapter ID' };
  }

  try {
    const { fetchChapterPages } = await import('./mangaApi.js');
    const pageData = await fetchChapterPages(
      chapterId,
      mangaId || null,
      chapter?.chapter ?? null,
      manga?.title || manga?.englishTitle || null
    );

    const rawPages = Array.isArray(pageData?.pages) ? pageData.pages : [];
    if (rawPages.length === 0) {
      return {
        success: false,
        chapterId,
        pageCount: 0,
        error: pageData?.warning || 'No pages available for offline download',
      };
    }

    const total = rawPages.length;
    const refererHint = manga?.homeUrl || manga?.mangaUrl || pageData?.sourceUrl || '';
    const results = new Array(total);
    let nextIndex = 0;
    let completed = 0;

    const workerCount = Math.min(3, total);
    const workers = Array.from({ length: workerCount }, async () => {
      while (nextIndex < total) {
        const currentIdx = nextIndex++;
        let fetched = await fetchPageForOffline(rawPages[currentIdx], currentIdx, refererHint);
        if (!fetched) {
          fetched = await fetchPageForOffline(rawPages[currentIdx], currentIdx, refererHint);
        }
        results[currentIdx] = fetched;
        completed += 1;
        if (typeof onProgress === 'function') {
          const percent = Math.round((completed / total) * 100);
          onProgress({ loaded: completed, total, current: completed, percent, chapterId }, total);
        }
      }
    });

    await Promise.all(workers);

    const savedPages = results.filter(Boolean).sort((a, b) => a.pageNumber - b.pageNumber);
    if (savedPages.length === 0) {
      return {
        success: false,
        chapterId,
        pageCount: 0,
        error: 'Failed to fetch chapter images for offline storage',
      };
    }

    if (savedPages.length < total) {
      return {
        success: false,
        chapterId,
        pageCount: savedPages.length,
        error: `Only ${savedPages.length} of ${total} pages downloaded. Please retry.`,
      };
    }

    revokeChapterObjectUrls(chapterId);

    const downloadedAt = Date.now();
    const mangaTitle = manga?.englishTitle || manga?.title || 'Manga';
    const coverUrl = manga?.coverUrl || '';
    const sourceName = manga?.sourceName || 'Manga Source';
    const chapterNumber = String(chapter?.chapter ?? '');
    const chapterTitle = chapter?.title || '';

    await idbPutChapter({
      chapterId,
      mangaId,
      mangaTitle,
      coverUrl,
      sourceName,
      chapterNumber,
      chapterTitle,
      downloadedAt,
      pageCount: savedPages.length,
      pages: savedPages,
    });

    const index = readDownloadIndex();
    index[chapterId] = {
      chapterId,
      mangaId,
      mangaTitle,
      coverUrl,
      sourceName,
      chapterNumber,
      chapterTitle,
      pageCount: savedPages.length,
      downloadedAt,
    };
    try {
      writeDownloadIndex(index);
    } catch (indexErr) {
      try {
        await idbDeleteChapter(chapterId);
      } catch {}
      throw indexErr;
    }
    dispatchDownloadsUpdated();

    return {
      success: true,
      chapterId,
      pageCount: savedPages.length,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      chapterId,
      pageCount: 0,
      error: err?.message || 'Offline download failed',
    };
  }
}

/**
 * Retrieve cached offline chapter pages from IndexedDB.
 */
export async function getOfflineChapterPages(chapterId) {
  const cleanId = String(chapterId || '').trim();
  if (!cleanId) return null;

  try {
    const record = await idbGetChapter(cleanId);
    if (!record || !Array.isArray(record.pages) || record.pages.length === 0) {
      return null;
    }

    const pages = [];
    for (let i = 0; i < record.pages.length; i++) {
      const p = record.pages[i];
      if (!p) continue;
      let url = '';
      if (p.dataUrl) {
        url = p.dataUrl;
      } else if (typeof Blob !== 'undefined' && p.blob instanceof Blob) {
        const cacheKey = `${cleanId}::${p.pageNumber || i + 1}`;
        url = objectUrlCache.get(cacheKey) || '';
        if (!url && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
          url = URL.createObjectURL(p.blob);
          objectUrlCache.set(cacheKey, url);
        }
      }
      if (url) {
        pages.push({
          pageNumber: p.pageNumber || i + 1,
          url,
          originalUrl: p.originalUrl || '',
          offline: true,
        });
      }
    }

    if (pages.length === 0) return null;

    return {
      chapterId: cleanId,
      mangaId: record.mangaId || '',
      totalPages: pages.length,
      pages,
      offline: true,
    };
  } catch {
    return null;
  }
}

/**
 * Synchronous check whether a chapter is cached offline.
 */
export function isChapterDownloaded(chapterId) {
  const cleanId = String(chapterId || '').trim();
  if (!cleanId) return false;
  const index = readDownloadIndex();
  return Boolean(index[cleanId]);
}

/**
 * Synchronous lookup of downloaded chapter metadata keyed by chapterId for a manga.
 */
export function getDownloadedChaptersForManga(mangaId) {
  const cleanMangaId = String(mangaId || '').trim();
  if (!cleanMangaId) return {};
  const index = readDownloadIndex();
  const map = {};
  for (const [chId, meta] of Object.entries(index)) {
    if (meta && String(meta.mangaId) === cleanMangaId) {
      map[chId] = meta;
    }
  }
  return map;
}

/**
 * Synchronous list of all downloaded manga grouped with their saved offline chapters.
 */
export function getAllDownloadedManga() {
  const index = readDownloadIndex();
  const grouped = new Map();

  for (const meta of Object.values(index)) {
    if (!meta || !meta.chapterId) continue;
    const mId = String(meta.mangaId || meta.mangaTitle || 'unknown');
    if (!grouped.has(mId)) {
      grouped.set(mId, {
        mangaId: mId,
        mangaTitle: meta.mangaTitle || 'Manga',
        coverUrl: meta.coverUrl || '',
        sourceName: meta.sourceName || 'Manga Source',
        chapters: [],
        totalDownloaded: 0,
        latestDownloadedAt: 0,
      });
    }
    const entry = grouped.get(mId);
    entry.chapters.push(meta);
    entry.totalDownloaded = entry.chapters.length;
    if ((meta.downloadedAt || 0) > entry.latestDownloadedAt) {
      entry.latestDownloadedAt = meta.downloadedAt || 0;
      if (meta.coverUrl) entry.coverUrl = meta.coverUrl;
    }
  }

  const list = Array.from(grouped.values());
  for (const item of list) {
    item.chapters.sort((a, b) => {
      const nA = parseFloat(a.chapterNumber);
      const nB = parseFloat(b.chapterNumber);
      if (!isNaN(nA) && !isNaN(nB) && nA !== nB) return nB - nA;
      return (b.downloadedAt || 0) - (a.downloadedAt || 0);
    });
  }
  list.sort((a, b) => (b.latestDownloadedAt || 0) - (a.latestDownloadedAt || 0));
  return list;
}

/**
 * Delete a single downloaded chapter from IndexedDB and the metadata index.
 */
export async function deleteDownloadedChapter(chapterId) {
  const cleanId = String(chapterId || '').trim();
  if (!cleanId) return false;

  revokeChapterObjectUrls(cleanId);
  await idbDeleteChapter(cleanId);

  const index = readDownloadIndex();
  if (index[cleanId]) {
    delete index[cleanId];
    writeDownloadIndex(index);
  }
  dispatchDownloadsUpdated();
  return true;
}

/**
 * Delete all downloaded chapters belonging to a manga.
 */
export async function deleteDownloadedManga(mangaId) {
  const cleanMangaId = String(mangaId || '').trim();
  if (!cleanMangaId) return false;

  const index = readDownloadIndex();
  const toDelete = [];
  for (const [chId, meta] of Object.entries(index)) {
    if (meta && String(meta.mangaId) === cleanMangaId) {
      toDelete.push(chId);
    }
  }

  for (const chId of toDelete) {
    revokeChapterObjectUrls(chId);
    await idbDeleteChapter(chId);
    delete index[chId];
  }

  writeDownloadIndex(index);
  dispatchDownloadsUpdated();
  return true;
}

function validateDownloadUrl(rawUrl, allowBlob = false) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  if (allowBlob && trimmed.startsWith('blob:')) return trimmed;
  try {
    const base = typeof window !== 'undefined' ? window.location.href : 'https://localhost';
    const parsed = new URL(trimmed, base);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
  } catch {}
  return null;
}

/**
 * Download an external file (e.g. Mihon extension .apk) natively on Android or in browser.
 */
export function triggerFileDownload(url, filename = '') {
  const cleanUrl = validateDownloadUrl(url, true);
  if (!cleanUrl) return false;

  const safeFilename = (filename && String(filename).trim().replace(/[\\/:*?"<>|]/g, '_')) ||
    cleanUrl.split('/').pop()?.split('?')[0] ||
    'extension.apk';

  const isHttp = /^https?:\/\//i.test(cleanUrl);
  if (isHttp && typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.downloadFile === 'function') {
    try {
      const handled = window.AndroidBridge.downloadFile(cleanUrl, safeFilename);
      if (handled !== false) return true;
    } catch {}
  }

  if (typeof document !== 'undefined') {
    try {
      const anchor = document.createElement('a');
      anchor.href = cleanUrl;
      anchor.download = safeFilename;
      anchor.rel = 'noopener noreferrer';

      try {
        const targetOrigin = new URL(cleanUrl, window.location.href).origin;
        if (targetOrigin !== window.location.origin) {
          anchor.target = '_blank';
        }
      } catch {
        anchor.target = '_blank';
      }

      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      return true;
    } catch {
      if (isHttp && typeof window !== 'undefined') {
        window.open(cleanUrl, '_blank', 'noopener,noreferrer');
        return true;
      }
    }
  }

  return false;
}
