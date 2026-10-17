// Server-side provider for complete manga chapters and pages
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const HEADERS = {
  'User-Agent': USER_AGENT,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

const BASE_URL = 'https://mangapill.com';

// In-memory cache to ensure fast responses
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

function getCached(key) {
  const item = cache.get(key);
  if (item && Date.now() - item.time < CACHE_TTL) {
    return item.data;
  }
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, time: Date.now() });
}

/**
 * Fetch Popular / Trending Manga
 */
export async function getPopularManga() {
  const cached = getCached('popular_manga');
  if (cached) return cached;

  try {
    const res = await fetch(BASE_URL, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const regex = /<a\s+href="\/manga\/([0-9]+\/[^"]+)"[^>]*>[\s\S]*?<img\s+(?:data-)?src="([^"]+)"[\s\S]*?alt="([^"]+)"/gi;
    let m;
    const list = [];
    const seen = new Set();

    while ((m = regex.exec(html)) !== null) {
      const id = m[1];
      if (seen.has(id)) continue;
      seen.add(id);

      const rawTitle = m[3]
        .replace(/Chapter\s+[0-9.]+/i, '')
        .replace(/\s+manga$/i, '')
        .trim();
      
      // Clean title repetition (e.g. "One Piece One Piece")
      const words = rawTitle.split(/\s+/);
      const half = Math.floor(words.length / 2);
      let cleanTitle = rawTitle;
      if (words.length >= 2 && words.length % 2 === 0) {
        const firstHalf = words.slice(0, half).join(' ');
        const secondHalf = words.slice(half).join(' ');
        if (firstHalf.toLowerCase() === secondHalf.toLowerCase()) {
          cleanTitle = firstHalf;
        }
      }

      list.push({
        id,
        title: cleanTitle,
        coverUrl: m[2],
        status: 'Ongoing',
        provider: 'mangapill',
      });
    }

    setCache('popular_manga', list);
    return list;
  } catch (error) {
    console.error('getPopularManga error:', error);
    return [];
  }
}

/**
 * Search Manga by Title
 */
export async function searchManga(query = '') {
  if (!query || !query.trim()) return getPopularManga();

  const cacheKey = `search_${query.trim().toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/search?q=${encodeURIComponent(query.trim())}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const regex = /<a\s+href="\/manga\/([0-9]+\/[^"]+)"[^>]*>[\s\S]*?<img\s+(?:data-)?src="([^"]+)"[\s\S]*?alt="([^"]+)"/gi;
    let m;
    const list = [];
    const seen = new Set();

    while ((m = regex.exec(html)) !== null) {
      const id = m[1];
      if (seen.has(id)) continue;
      seen.add(id);

      const rawTitle = m[3]
        .replace(/Chapter\s+[0-9.]+/i, '')
        .replace(/\s+manga$/i, '')
        .trim();

      const words = rawTitle.split(/\s+/);
      const half = Math.floor(words.length / 2);
      let cleanTitle = rawTitle;
      if (words.length >= 2 && words.length % 2 === 0) {
        const firstHalf = words.slice(0, half).join(' ');
        const secondHalf = words.slice(half).join(' ');
        if (firstHalf.toLowerCase() === secondHalf.toLowerCase()) {
          cleanTitle = firstHalf;
        }
      }

      list.push({
        id,
        title: cleanTitle,
        coverUrl: m[2],
        status: 'Ongoing',
        provider: 'mangapill',
      });
    }

    setCache(cacheKey, list);
    return list;
  } catch (error) {
    console.error('searchManga error:', error);
    return [];
  }
}

/**
 * Get Manga Details & Complete Chapters List
 */
export async function getMangaDetails(mangaId) {
  const cacheKey = `details_${mangaId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/manga/${mangaId}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // Extract Title
    const titleMatch = html.match(/<h1[^>]*class="[^"]*font-bold[^"]*"[^>]*>([\s\S]*?)<\/h1>/i);
    const title = titleMatch ? titleMatch[1].trim() : mangaId.split('/')[1] || 'Manga';

    // Extract Cover
    const coverMatch = html.match(/<img[^>]+data-src="([^"]+)"/i) || html.match(/<img[^>]+src="([^"]+)"/i);
    const coverUrl = coverMatch ? coverMatch[1] : '';

    // Extract Synopsis
    const synMatch = html.match(/<p\s+class="[^"]*text-secondary[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
    const description = synMatch ? synMatch[1].trim() : 'No synopsis available.';

    // Extract Status & Type
    const statusMatch = html.match(/Status[\s\S]*?<div[^>]*>([^<]+)<\/div>/i);
    const status = statusMatch ? statusMatch[1].trim() : 'Ongoing';

    const typeMatch = html.match(/Type[\s\S]*?<div[^>]*>([^<]+)<\/div>/i);
    const type = typeMatch ? typeMatch[1].trim() : 'Manga';

    const yearMatch = html.match(/Year[\s\S]*?<div[^>]*>([^<]+)<\/div>/i);
    const year = yearMatch ? yearMatch[1].trim() : null;

    // Extract Genres
    const genres = [...html.matchAll(/<a\s+href="\/search\?genre=[^"]*"[^>]*>([^<]+)<\/a>/gi)].map((g) => g[1].trim());

    // Extract Chapters List
    const chapRegex = /<a\s+class="[^"]*"\s+href="\/chapters\/([0-9]+-[0-9]+\/[^"]+)"[^>]*title="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    let chM;
    const chapters = [];
    while ((chM = chapRegex.exec(html)) !== null) {
      const chapterId = chM[1];
      const titleAttr = chM[2].trim() || chM[3].trim();
      const numMatch = titleAttr.match(/Chapter\s+([0-9.]+)/i);
      const chapterNum = numMatch ? numMatch[1] : titleAttr.replace(/Chapter/i, '').trim();

      chapters.push({
        id: chapterId,
        chapter: chapterNum || 'Special',
        title: titleAttr,
      });
    }

    const result = {
      id: mangaId,
      title,
      coverUrl,
      description,
      status,
      type,
      year,
      tags: genres,
      chapters,
      totalChapters: chapters.length,
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('getMangaDetails error:', error);
    return null;
  }
}

/**
 * Get Complete Real Pages for a Chapter
 */
export async function getChapterPages(chapterId) {
  const cacheKey = `chapter_${chapterId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/chapters/${chapterId}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const imgRegex = /<img[^>]+data-src="([^"]+)"/gi;
    let m;
    const rawImages = [];
    while ((m = imgRegex.exec(html)) !== null) {
      rawImages.push(m[1]);
    }

    // Format into pages with proxy URLs
    const pages = rawImages.map((imgUrl, index) => ({
      pageNumber: index + 1,
      // Proxied URL so browser never gets 403 / CORS block
      url: `/api/image-proxy?url=${encodeURIComponent(imgUrl)}`,
      originalUrl: imgUrl,
    }));

    const result = {
      chapterId,
      totalPages: pages.length,
      pages,
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('getChapterPages error:', error);
    throw error;
  }
}

/**
 * Proxy Image with proper Referer to bypass CDN hotlink protection
 */
export async function proxyImage(imageUrl, res) {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': `${BASE_URL}/`,
      },
    });

    if (!response.ok) {
      res.statusCode = response.status;
      res.end(`Image fetch failed: ${response.status}`);
      return;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');

    const buffer = await response.arrayBuffer();
    res.end(Buffer.from(buffer));
  } catch (err) {
    console.error('proxyImage error:', err);
    res.statusCode = 500;
    res.end('Proxy error');
  }
}
