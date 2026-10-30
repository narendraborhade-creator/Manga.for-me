/**
 * Thunder Scans Provider
 * Premium scanlation provider for weekly fantasy, action, and manhwa releases.
 * Source: en-thunderscans.com
 */

import { decodeHtml, cleanTitle, getFallbackCover, deduplicateChapters } from './htmlUtils.js';

const BASE_URL = 'https://en-thunderscans.com';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const HEADERS = {
  'User-Agent': USER_AGENT,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': `${BASE_URL}/`,
};

// In-memory cache with 15-minute TTL
const cache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL_MS) {
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
 * Search Thunder Scans
 */
export async function searchThunder(query = '') {
  if (!query || !query.trim()) return [];
  const cleanQ = query.trim();
  const cacheKey = `thunder_search_${cleanQ.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/?s=${encodeURIComponent(cleanQ)}`;
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 7000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const cardBlocks = html.split('<div class="bsx">').slice(1);
    const results = [];
    const seen = new Set();

    for (const card of cardBlocks) {
      const linkMatch = card.match(/<a\s+href="([^"]+)"\s+title="([^"]+)"[\s\S]*?<img[^>]+(?:data-src|src)="([^"]+)"/i);
      if (!linkMatch) continue;

      const pageUrl = linkMatch[1];
      const rawTitle = linkMatch[2];
      const coverUrl = linkMatch[3];

      // Extract slug from url: https://en-thunderscans.com/comics/{slug}/
      const slugMatch = pageUrl.match(/\/(?:comics|manga)\/([^/]+)/i);
      const slug = slugMatch ? slugMatch[1] : pageUrl.replace(/\/$/, '').split('/').pop();

      if (seen.has(slug)) continue;
      seen.add(slug);

      const title = cleanTitle(decodeHtml(rawTitle));

      // Extract chapter count from card badge or link
      const chMatch = card.match(/(?:class="epxs"[^>]*>|epxs">\s*(?:Chapter\s*)?|Chapter\s+)([0-9.]+)/i) ||
                      card.match(/\/chapter-([0-9.]+)/i);
      const latestChapter = chMatch ? chMatch[1] : null;
      const totalChapters = latestChapter && !isNaN(parseFloat(latestChapter)) ? Math.floor(parseFloat(latestChapter)) : null;

      results.push({
        id: `thunder:${slug}`,
        rawId: slug,
        title,
        englishTitle: title,
        coverUrl: coverUrl ? `/api/image-proxy?url=${encodeURIComponent(coverUrl)}` : getFallbackCover(title),
        status: 'Ongoing',
        author: 'Thunder Scans',
        tags: ['Manhwa', 'Action'],
        totalChapters,
        latestChapter,
        sourceName: 'Thunder Scans',
        provider: 'thunder',
      });
    }

    setCache(cacheKey, results);
    return results;
  } catch (err) {
    console.warn('searchThunder error:', err.message);
    return [];
  }
}

/**
 * Popular / Trending Manga from Thunder Scans
 */
export async function getPopularThunder(limit = 16) {
  const cacheKey = `thunder_popular_${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/comics/?order=popular`;
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 7000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const cardBlocks = html.split('<div class="bsx">').slice(1);
    const results = [];
    const seen = new Set();

    for (const card of cardBlocks) {
      if (results.length >= limit) break;
      const linkMatch = card.match(/<a\s+href="([^"]+)"\s+title="([^"]+)"[\s\S]*?<img[^>]+(?:data-src|src)="([^"]+)"/i);
      if (!linkMatch) continue;

      const pageUrl = linkMatch[1];
      const rawTitle = linkMatch[2];
      const coverUrl = linkMatch[3];

      const slugMatch = pageUrl.match(/\/(?:comics|manga)\/([^/]+)/i);
      const slug = slugMatch ? slugMatch[1] : pageUrl.replace(/\/$/, '').split('/').pop();

      if (seen.has(slug)) continue;
      seen.add(slug);

      const title = cleanTitle(decodeHtml(rawTitle));

      // Extract chapter count from card badge or link
      const chMatch = card.match(/(?:class="epxs"[^>]*>|epxs">\s*(?:Chapter\s*)?|Chapter\s+)([0-9.]+)/i) ||
                      card.match(/\/chapter-([0-9.]+)/i);
      const latestChapter = chMatch ? chMatch[1] : null;
      const totalChapters = latestChapter && !isNaN(parseFloat(latestChapter)) ? Math.floor(parseFloat(latestChapter)) : null;

      results.push({
        id: `thunder:${slug}`,
        rawId: slug,
        title,
        englishTitle: title,
        coverUrl: coverUrl ? `/api/image-proxy?url=${encodeURIComponent(coverUrl)}` : getFallbackCover(title),
        status: 'Ongoing',
        author: 'Thunder Scans',
        tags: ['Manhwa', 'Action'],
        totalChapters,
        latestChapter,
        sourceName: 'Thunder Scans',
        provider: 'thunder',
      });
    }

    setCache(cacheKey, results);
    return results;
  } catch (err) {
    console.warn('getPopularThunder error:', err.message);
    return [];
  }
}

/**
 * Get Manga Details and Full Chapter List from Thunder Scans
 */
export async function getThunderDetails(rawId) {
  if (!rawId) return null;
  const slug = String(rawId).replace(/^thunder:/, '').replace(/\/$/, '');
  const cacheKey = `thunder_details_${slug}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/comics/${slug}/`;
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 8000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // Extract Title
    const titleMatch = html.match(/<h1[^>]*class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i) ||
                       html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = titleMatch ? cleanTitle(decodeHtml(titleMatch[1].replace(/<[^>]+>/g, '').trim())) : 'Manga';

    // Extract Alt Titles
    const altMatch = html.match(/Alternative(?:\s+Titles|:)?[\s\S]*?<div[^>]*class="desktop-titles"[^>]*>([\s\S]*?)<\/div>/i) ||
                     html.match(/<b>Alternative(?:\s+Titles)?:?<\/b>([\s\S]*?)<\/div>/i);
    let altTitles = [];
    if (altMatch) {
      const rawAlt = decodeHtml(altMatch[1].replace(/<[^>]+>/g, ' ').trim());
      altTitles = rawAlt.split(/[\/,|•]+/).map(t => cleanTitle(t.trim())).filter(t => t.length > 1);
    }

    // Extract Cover
    let coverUrl = getFallbackCover(title);
    const coverMatch = html.match(/<div class="thumb"[^>]*>[\s\S]*?<img[^>]+(?:data-src|src)="([^"]+)"/i);
    if (coverMatch) {
      coverUrl = `/api/image-proxy?url=${encodeURIComponent(coverMatch[1])}`;
    }

    // Extract Synopsis
    let description = 'No synopsis available.';
    const synMatch = html.match(/class="entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (synMatch) {
      description = decodeHtml(synMatch[1].replace(/<[^>]+>/g, '').trim());
    }

    // Extract Status
    const status = html.toLowerCase().includes('completed') ? 'Completed' : 'Ongoing';

    // Extract Chapters
    // Pattern: <li data-num="X">...<a href="URL">...<span class="chapternum">...</span>...<span class="chapterdate">...</span>
    const chRegex = /<li[^>]*data-num="([0-9.]+)"[^>]*>[\s\S]*?<a\s+href="([^"]+)"[^>]*>[\s\S]*?<span\s+class="chapternum">([\s\S]*?)<\/span>[\s\S]*?<span\s+class="chapterdate">([^<]+)<\/span>/gi;
    let chM;
    const chapters = [];
    const seenUrls = new Set();

    while ((chM = chRegex.exec(html)) !== null) {
      const num = chM[1];
      const chUrl = chM[2];
      const rawChTitle = chM[3].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const date = chM[4].trim();

      if (seenUrls.has(chUrl)) continue;
      seenUrls.add(chUrl);

      // Chapter slug from url: https://en-thunderscans.com/{chapterSlug}/
      const chSlugMatch = chUrl.match(/https?:\/\/[^/]+\/([^/]+)\/?/);
      const chSlug = chSlugMatch ? chSlugMatch[1] : `ch-${num}`;

      chapters.push({
        id: `thunder_ch:${slug}:${chSlug}`,
        chapter: num,
        title: rawChTitle || `Chapter ${num}`,
        publishedAt: date,
        url: chUrl,
      });
    }

    // Fallback chapter matcher if data-num is missing
    if (chapters.length === 0) {
      const altChRegex = /href="(https:\/\/en-thunderscans\.com\/[^\"]*chapter-([0-9.]+)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
      let m2;
      while ((m2 = altChRegex.exec(html)) !== null) {
        const chUrl = m2[1];
        const num = m2[2];
        const text = m2[3].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (seenUrls.has(chUrl)) continue;
        seenUrls.add(chUrl);

        const chSlugMatch = chUrl.match(/https?:\/\/[^/]+\/([^/]+)\/?/);
        const chSlug = chSlugMatch ? chSlugMatch[1] : `ch-${num}`;

        chapters.push({
          id: `thunder_ch:${slug}:${chSlug}`,
          chapter: num,
          title: text || `Chapter ${num}`,
          publishedAt: null,
          url: chUrl,
        });
      }
    }

    const dedupedChapters = deduplicateChapters(chapters);

    const result = {
      id: `thunder:${slug}`,
      rawId: slug,
      title,
      englishTitle: altTitles[0] || title,
      altTitles,
      coverUrl,
      description,
      status,
      author: 'Thunder Scans',
      tags: ['Manhwa', 'Action', 'Fantasy'],
      chapters: dedupedChapters,
      totalChapters: dedupedChapters.length,
      latestChapter: dedupedChapters[0] ? dedupedChapters[0].chapter : null,
      sourceName: 'Thunder Scans',
      provider: 'thunder',
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.warn(`getThunderDetails error for ${slug}:`, err.message);
    return null;
  }
}

/**
 * Get Real Pages for a Thunder Scans Chapter
 */
export async function getThunderChapterPages(rawChapterId) {
  if (!rawChapterId) return { chapterId: rawChapterId, totalPages: 0, pages: [] };
  const parts = rawChapterId.replace(/^thunder_ch:/, '').split(':');
  const chSlug = parts.length > 1 ? parts[1] : parts[0];
  const cacheKey = `thunder_pages_${chSlug}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/${chSlug}/`;
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 8000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    let rawImages = [];

    // 1. Try extracting ts_reader.run JSON payload
    const tsMatch = html.match(/ts_reader\.run\(([\s\S]*?)\);/i);
    if (tsMatch) {
      try {
        const payload = JSON.parse(tsMatch[1]);
        const sources = payload?.sources || [];
        for (const src of sources) {
          if (Array.isArray(src.images) && src.images.length > 0) {
            rawImages = src.images;
            break;
          }
        }
      } catch (jsonErr) {
        console.warn('Failed to parse ts_reader json:', jsonErr.message);
      }
    }

    // 2. Fallback: Parse #readerarea img tags
    if (rawImages.length === 0) {
      const readerMatch = html.match(/id="readerarea"[^>]*>([\s\S]*?)<\/div>/i);
      if (readerMatch) {
        const imgRegex = /<img[^>]+(?:data-src|src)="([^"]+)"/gi;
        let im;
        while ((im = imgRegex.exec(readerMatch[1])) !== null) {
          if (!im[1].includes('data:image')) {
            rawImages.push(im[1]);
          }
        }
      }
    }

    // Format pages with proxy URLs
    const pages = rawImages.map((imgUrl, index) => {
      const cleanImg = imgUrl.replace(/\\/g, '');
      return {
        pageNumber: index + 1,
        url: `/api/image-proxy?url=${encodeURIComponent(cleanImg)}`,
        originalUrl: cleanImg,
      };
    });

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
    console.warn(`getThunderChapterPages error for ${rawChapterId}:`, err.message);
    return {
      chapterId: rawChapterId,
      totalPages: 0,
      pages: [],
      warning: 'Thunder Scans pages are temporarily synchronizing.',
    };
  }
}
