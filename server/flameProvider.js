/**
 * Flame Comics Provider
 * Fast, high-quality scanlation provider for weekly manhwa and action manga.
 * Source: flamecomics.xyz
 */

import { decodeHtml, cleanTitle, getFallbackCover, deduplicateChapters } from './htmlUtils.js';

const BASE_URL = 'https://flamecomics.xyz';
const CDN_URL = 'https://cdn.flamecomics.xyz';

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
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch and cache all series from Flame Comics API
 */
async function fetchAllFlameSeries() {
  const cached = getCached('flame_all_series');
  if (cached) return cached;

  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/series`, { headers: HEADERS }, 6000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setCache('flame_all_series', data);
      return data;
    }
  } catch (err) {
    console.warn('fetchAllFlameSeries warning:', err.message);
  }
  return [];
}

/**
 * Format a Flame Comics series object
 */
function formatFlameSeries(item) {
  if (!item || !item.id) return null;
  const id = String(item.id);
  const title = cleanTitle(item.label || 'Manga');
  const rawImage = item.image || 'thumbnail.png';
  const coverUrl = rawImage.startsWith('http')
    ? `/api/image-proxy?url=${encodeURIComponent(rawImage)}`
    : `/api/image-proxy?url=${encodeURIComponent(`${CDN_URL}/uploads/images/series/${id}/${rawImage}`)}`;

  const totalChapters = parseInt(item.chapter_count || '0', 10);

  return {
    id: `flame:${id}`,
    rawId: id,
    title,
    englishTitle: title,
    coverUrl,
    status: item.status || 'Ongoing',
    author: 'Flame Comics',
    tags: ['Manhwa', 'Action'],
    totalChapters: totalChapters > 0 ? totalChapters : null,
    latestChapter: totalChapters > 0 ? String(totalChapters) : null,
    sourceName: 'Flame Comics',
    provider: 'flame',
  };
}

/**
 * Popular Flame Comics Series
 */
export async function getPopularFlame(limit = 16) {
  const all = await fetchAllFlameSeries();
  if (!all || all.length === 0) return [];
  return all.slice(0, limit).map(formatFlameSeries).filter(Boolean);
}

/**
 * Search Flame Comics
 */
export async function searchFlame(query = '') {
  if (!query || !query.trim()) return [];
  const cleanQ = query.trim().toLowerCase();
  const cacheKey = `flame_search_${cleanQ}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const all = await fetchAllFlameSeries();
  if (!all || all.length === 0) return [];

  const tokens = cleanQ.split(/\s+/).filter(Boolean);
  const matches = all.filter((s) => {
    const label = (s.label || '').toLowerCase();
    return tokens.every((tok) => label.includes(tok));
  });

  const formatted = matches.slice(0, 20).map(formatFlameSeries).filter(Boolean);
  setCache(cacheKey, formatted);
  return formatted;
}

/**
 * Get Manga Details and Chapters from Flame Comics
 */
export async function getFlameDetails(rawId) {
  if (!rawId) return null;
  const cleanId = String(rawId).replace(/^flame:/, '');
  const cacheKey = `flame_details_${cleanId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/series/${cleanId}`;
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 8000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // Title
    const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = titleMatch ? cleanTitle(titleMatch[1].replace(/<[^>]+>/g, '').trim()) : 'Manga';

    // Cover
    let coverUrl = getFallbackCover(title);
    const coverMatch = html.match(/(https:\/\/cdn\.flamecomics\.xyz\/uploads\/images\/series\/[^\s"']+(?:cover|thumbnail)[^\s"']*)/i);
    if (coverMatch) {
      coverUrl = `/api/image-proxy?url=${encodeURIComponent(coverMatch[1])}`;
    }

    // Synopsis
    let description = 'No synopsis available.';
    const synMatch = html.match(/class="[^"]*(?:description|synopsis|summary)[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
      html.match(/<p[^>]*class="[^"]*(?:lead|text)[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
    if (synMatch) {
      description = decodeHtml(synMatch[1].replace(/<[^>]+>/g, '').trim());
    }

    // Status
    const status = html.toLowerCase().includes('completed') ? 'Completed' : 'Ongoing';

    // Chapters
    // Pattern: href="/series/{id}/{hash}" with inner chapter text
    const chRegex = new RegExp(`href="(\\/series\\/${cleanId}\\/([a-f0-9]{10,32}))"[^>]*>([\\s\\S]*?)<\\/a>`, 'gi');
    let m;
    const chapters = [];
    const seenHashes = new Set();

    while ((m = chRegex.exec(html)) !== null) {
      const hash = m[2];
      if (seenHashes.has(hash)) continue;
      seenHashes.add(hash);

      const inner = m[3].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Skip "First Chapter" or "Latest Chapter" shortcuts
      if (inner.toLowerCase().includes('first chapter') || inner.toLowerCase() === 'latest chapter') {
        continue;
      }

      // Extract Chapter Number
      const numMatch = inner.match(/(?:Chapter|Ch\.?|Episode|Ep\.?)\s*([0-9.]+)/i) || inner.match(/([0-9.]+)/);
      const chapterNum = numMatch ? numMatch[1] : 'Special';

      // Extract relative time (e.g., "9 months ago", "2 hours ago", "yesterday")
      const timeMatch = inner.match(/([0-9]+\s+(?:second|minute|hour|day|week|month|year)s?\s+ago|yesterday|today)/i);
      const publishedAt = timeMatch ? timeMatch[1] : null;

      chapters.push({
        id: `flame_ch:${cleanId}:${hash}`,
        chapter: chapterNum,
        title: inner,
        publishedAt,
      });
    }

    const dedupedChapters = deduplicateChapters(chapters);

    const result = {
      id: `flame:${cleanId}`,
      rawId: cleanId,
      title,
      englishTitle: title,
      coverUrl,
      description,
      status,
      author: 'Flame Comics',
      tags: ['Manhwa', 'Action', 'Fantasy'],
      chapters: dedupedChapters,
      totalChapters: dedupedChapters.length,
      latestChapter: dedupedChapters[0] ? dedupedChapters[0].chapter : null,
      sourceName: 'Flame Comics',
      provider: 'flame',
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.warn(`getFlameDetails error for ${cleanId}:`, err.message);
    return null;
  }
}

/**
 * Get Chapter Pages from Flame Comics
 */
export async function getFlameChapterPages(rawChapterId) {
  if (!rawChapterId) return { chapterId: rawChapterId, totalPages: 0, pages: [] };
  const parts = rawChapterId.replace(/^flame_ch:/, '').split(':');
  if (parts.length < 2) return { chapterId: rawChapterId, totalPages: 0, pages: [] };

  const [seriesId, chapterHash] = parts;
  const cacheKey = `flame_pages_${seriesId}_${chapterHash}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/series/${seriesId}/${chapterHash}`;
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 8000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // Match all chapter images hosted on Flame Comics CDN
    const imgRegex = new RegExp(`https:\\/\\/cdn\\.flamecomics\\.xyz\\/uploads\\/images\\/series\\/${seriesId}\\/${chapterHash}\\/[^\\s"']+`, 'gi');
    let m;
    const rawImages = [];
    const seen = new Set();

    while ((m = imgRegex.exec(html)) !== null) {
      const imgUrl = m[0].replace(/&amp;/g, '&');
      if (!seen.has(imgUrl)) {
        seen.add(imgUrl);
        rawImages.push(imgUrl);
      }
    }

    // Format pages with proxy URLs
    const pages = rawImages.map((imgUrl, index) => ({
      pageNumber: index + 1,
      url: `/api/image-proxy?url=${encodeURIComponent(imgUrl)}`,
      originalUrl: imgUrl,
    }));

    const result = {
      chapterId: rawChapterId,
      totalPages: pages.length,
      pages,
    };

    if (pages.length > 0) {
      setCache(cacheKey, result);
    }
    return result;
  } catch (err) {
    console.warn(`getFlameChapterPages error for ${rawChapterId}:`, err.message);
    return {
      chapterId: rawChapterId,
      totalPages: 0,
      pages: [],
      warning: 'Flame Comics pages are temporarily synchronizing.',
    };
  }
}
