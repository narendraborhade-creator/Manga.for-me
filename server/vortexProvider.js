/**
 * Vortex Scans Provider
 * Scrapes manga, manhwa & webtoons from Vortex Scans (vortexscans.org)
 */

import { decodeHtml, cleanTitle } from './htmlUtils.js';

const BASE_URL = 'https://vortexscans.org';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const HEADERS = {
  'User-Agent': USER_AGENT,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': `${BASE_URL}/`,
};

// In-memory cache with 15-minute TTL
const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000;

function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Format raw slug into a human-readable title
 */
function cleanSlugTitle(slug) {
  const clean = decodeHtml(slug);
  return clean
    .replace(/-[a-f0-9]{8}$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Search Vortex Scans
 */
export async function searchVortex(query) {
  if (!query || !query.trim()) return [];
  const q = query.trim();
  const cacheKey = `vortex_search_${q.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/series?search=${encodeURIComponent(q)}`;
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 6500);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const linkMatches = [...html.matchAll(/<a[^>]+href="(\/series\/[^"/]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
    const results = [];
    const seen = new Set();

    for (const m of linkMatches) {
      const rawSlug = m[1].replace('/series/', '').replace(/\/$/, '');
      const slug = decodeHtml(rawSlug);
      if (slug === 'series' || seen.has(slug)) continue;
      seen.add(slug);

      const inner = m[2];
      const imgMatch = inner.match(/src="([^"]+)"/i);
      const coverUrl = imgMatch ? decodeHtml(imgMatch[1]) : '';
      const titleAttr = m[0].match(/title="([^"]+)"/i) || inner.match(/alt="([^"]+)"/i);
      const title = titleAttr ? cleanTitle(titleAttr[1]) : cleanSlugTitle(slug);

      results.push({
        id: `vortex:${slug}`,
        title,
        englishTitle: title,
        coverUrl: coverUrl ? `/api/image-proxy?url=${encodeURIComponent(coverUrl)}` : '',
        rawCoverUrl: coverUrl,
        status: 'Ongoing',
        author: 'Vortex Scans',
        tags: ['Manhwa', 'Webtoon'],
        sourceName: 'Vortex Scans',
        provider: 'vortex',
      });
    }

    setCache(cacheKey, results);
    return results;
  } catch (err) {
    console.warn('searchVortex error:', err.message);
    return [];
  }
}

/**
 * Get Popular / Series List from Vortex Scans
 */
export async function getPopularVortex() {
  const cacheKey = 'vortex_popular';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/series`;
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 6500);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const linkMatches = [...html.matchAll(/<a[^>]+href="(\/series\/[^"/]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
    const results = [];
    const seen = new Set();

    for (const m of linkMatches) {
      const rawSlug = m[1].replace('/series/', '').replace(/\/$/, '');
      const slug = decodeHtml(rawSlug);
      if (slug === 'series' || seen.has(slug)) continue;
      seen.add(slug);

      const inner = m[2];
      const imgMatch = inner.match(/src="([^"]+)"/i);
      const coverUrl = imgMatch ? decodeHtml(imgMatch[1]) : '';
      const titleAttr = m[0].match(/title="([^"]+)"/i) || inner.match(/alt="([^"]+)"/i);
      const title = titleAttr ? cleanTitle(titleAttr[1]) : cleanSlugTitle(slug);

      results.push({
        id: `vortex:${slug}`,
        title,
        englishTitle: title,
        coverUrl: coverUrl ? `/api/image-proxy?url=${encodeURIComponent(coverUrl)}` : '',
        rawCoverUrl: coverUrl,
        status: 'Ongoing',
        author: 'Vortex Scans',
        tags: ['Manhwa', 'Popular'],
        sourceName: 'Vortex Scans',
        provider: 'vortex',
      });

      if (results.length >= 24) break;
    }

    setCache(cacheKey, results);
    return results;
  } catch (err) {
    console.warn('getPopularVortex error:', err.message);
    return [];
  }
}

/**
 * Get Vortex Series Details & Chapter List
 */
export async function getVortexDetails(slug) {
  const cleanSlug = decodeHtml(slug.replace(/^vortex:/i, ''));
  const cacheKey = `vortex_details_${cleanSlug}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/series/${encodeURI(cleanSlug)}`;
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 8000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const rawTitle = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]?.trim();
    const title = rawTitle ? cleanTitle(rawTitle) : cleanSlugTitle(cleanSlug);
    const descMatch =
      html.match(/<p[^>]+class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/p>/i) ||
      html.match(/<div[^>]+class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
      html.match(/<div[^>]+class="[^"]*summary[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const description = descMatch
      ? decodeHtml(descMatch[1].replace(/<[^>]+>/g, '').trim())
      : 'Read this hot series directly from Vortex Scans.';

    const coverMatch =
      html.match(/<img[^>]+src="([^"]*upload\/series[^"]+)"/i) ||
      html.match(/<img[^>]+src="([^"]*storage\.vortexscans[^"]+)"/i);
    const coverUrl = coverMatch ? decodeHtml(coverMatch[1]) : '';

    // Extract tags
    const genreMatches = [...html.matchAll(/href="\/genre\/[^"]+"[^>]*>([^<]+)<\/a>/gi)].map(m => decodeHtml(m[1].trim()));
    const tags = genreMatches.length > 0 ? genreMatches.slice(0, 6) : ['Manhwa', 'Action', 'Fantasy'];

    // Extract chapters
    const chMatches = [...html.matchAll(/href="(\/series\/[^"/]+\/chapter-([0-9.]+))"/gi)];
    const chapters = [];
    const seenCh = new Set();

    for (const cm of chMatches) {
      const chNum = cm[2];
      if (seenCh.has(chNum)) continue;
      seenCh.add(chNum);
      chapters.push({
        id: `vortex_ch:${cleanSlug}:${chNum}`,
        chapter: chNum,
        title: `Chapter ${chNum}`,
        sourceUrl: `${BASE_URL}${decodeHtml(cm[1])}`,
      });
    }

    chapters.sort((a, b) => parseFloat(b.chapter) - parseFloat(a.chapter));

    const result = {
      id: `vortex:${cleanSlug}`,
      title,
      englishTitle: title,
      coverUrl: coverUrl ? `/api/image-proxy?url=${encodeURIComponent(coverUrl)}` : '',
      rawCoverUrl: coverUrl,
      description,
      status: 'Ongoing',
      author: 'Vortex Scans',
      tags,
      chapters,
      totalChapters: chapters.length,
      sourceName: 'Vortex Scans',
      provider: 'vortex',
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`getVortexDetails error for ${cleanSlug}:`, err.message);
    throw err;
  }
}

/**
 * Get Chapter Pages from Vortex Scans
 */
export async function getVortexChapterPages(chapterId) {
  const parts = chapterId.replace(/^vortex_ch:/, '').split(':');
  const slug = decodeHtml(parts[0]);
  const chNum = parts[1];

  const cacheKey = `vortex_pages_${slug}_${chNum}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/series/${encodeURI(slug)}/chapter-${chNum}`;
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 8000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const allImgs = [...html.matchAll(/<img[^>]+(?:src|data-src)="([^"]+)"/gi)].map(m => m[1]);
    const chapterImages = allImgs
      .map(u => u.replace(/&amp;/g, '&'))
      .filter(u =>
        u.includes('storage.vortexscans.org/upload/series') ||
        (u.includes('chapter_') && !u.includes('banner'))
      );

    const pages = chapterImages.map((imgUrl, idx) => ({
      pageNumber: idx + 1,
      url: `/api/image-proxy?url=${encodeURIComponent(imgUrl)}`,
      originalUrl: imgUrl,
    }));

    const result = {
      chapterId,
      totalPages: pages.length,
      pages,
      sourceName: 'Vortex Scans',
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`getVortexChapterPages error for ${chapterId}:`, err.message);
    throw err;
  }
}
