/**
 * Asura Scans Provider
 * Scrapes manga, manhwa & webtoons from Asura Scans (asurascans.com)
 */

const BASE_URL = 'https://asurascans.com';
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
  return slug
    .replace(/-[a-f0-9]{8}$/i, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Search Asura Scans
 */
export async function searchAsura(query) {
  if (!query || !query.trim()) return [];
  const q = query.trim();
  const cacheKey = `asura_search_${q.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/browse/comics?search=${encodeURIComponent(q)}`;
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 6500);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const linkMatches = [...html.matchAll(/<a[^>]+href="(\/comics\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
    const results = [];
    const seen = new Set();

    for (const m of linkMatches) {
      const link = m[1];
      const slug = link.replace('/comics/', '').replace(/\/$/, '');
      if (seen.has(slug)) continue;
      seen.add(slug);

      const inner = m[2];
      const imgMatch = inner.match(/src="([^"]+)"/i);
      const coverUrl = imgMatch ? imgMatch[1] : '';

      const titleMatch =
        inner.match(/<span[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/span>/i) ||
        inner.match(/<h[2-6][^>]*>([^<]+)<\/h[2-6]>/i);
      const title = titleMatch ? titleMatch[1].trim() : cleanSlugTitle(slug);

      results.push({
        id: `asura:${slug}`,
        title,
        englishTitle: title,
        coverUrl: coverUrl ? `/api/image-proxy?url=${encodeURIComponent(coverUrl)}` : '',
        rawCoverUrl: coverUrl,
        status: 'Ongoing',
        author: 'Asura Scans',
        tags: ['Manhwa', 'Action'],
        sourceName: 'Asura Scans',
        provider: 'asura',
      });
    }

    setCache(cacheKey, results);
    return results;
  } catch (err) {
    console.warn('searchAsura error:', err.message);
    return [];
  }
}

/**
 * Get Featured / Popular comics from Asura Scans
 */
export async function getPopularAsura() {
  const cacheKey = 'asura_popular';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/browse/comics`;
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 6500);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const linkMatches = [...html.matchAll(/<a[^>]+href="(\/comics\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
    const results = [];
    const seen = new Set();

    for (const m of linkMatches) {
      const link = m[1];
      const slug = link.replace('/comics/', '').replace(/\/$/, '');
      if (seen.has(slug)) continue;
      seen.add(slug);

      const inner = m[2];
      const imgMatch = inner.match(/src="([^"]+)"/i);
      const coverUrl = imgMatch ? imgMatch[1] : '';
      const title = cleanSlugTitle(slug);

      results.push({
        id: `asura:${slug}`,
        title,
        englishTitle: title,
        coverUrl: coverUrl ? `/api/image-proxy?url=${encodeURIComponent(coverUrl)}` : '',
        rawCoverUrl: coverUrl,
        status: 'Ongoing',
        author: 'Asura Scans',
        tags: ['Manhwa', 'Popular'],
        sourceName: 'Asura Scans',
        provider: 'asura',
      });

      if (results.length >= 24) break;
    }

    setCache(cacheKey, results);
    return results;
  } catch (err) {
    console.warn('getPopularAsura error:', err.message);
    return [];
  }
}

/**
 * Get Asura Comic Details & Chapter List
 */
export async function getAsuraDetails(slug) {
  const cleanSlug = slug.replace(/^asura:/, '');
  const cacheKey = `asura_details_${cleanSlug}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/comics/${cleanSlug}`;
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 8000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const title = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]?.trim() || cleanSlugTitle(cleanSlug);
    const descMatch =
      html.match(/<span[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/span>/i) ||
      html.match(/<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
      html.match(/<p[^>]*class="[^"]*text-sm[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
    const description = descMatch
      ? descMatch[1].replace(/<[^>]+>/g, '').trim()
      : 'Read this hit series directly from Asura Scans.';

    const coverMatch =
      html.match(/<img[^>]+src="([^"]*asura-images\/covers[^"]+)"/i) ||
      html.match(/<img[^>]+src="([^"]*covers\/[^"]+)"/i);
    const coverUrl = coverMatch ? coverMatch[1] : '';

    // Extract tags
    const genreMatches = [...html.matchAll(/href="\/genres\/[^"]+"[^>]*>([^<]+)<\/a>/gi)].map(m => m[1].trim());
    const tags = genreMatches.length > 0 ? genreMatches.slice(0, 6) : ['Manhwa', 'Action', 'Fantasy'];

    // Extract chapters
    const chapterMatches = [...html.matchAll(/href="(\/comics\/[^"/]+\/chapter\/([0-9.]+))"/gi)];
    const chapters = [];
    const seenCh = new Set();

    for (const cm of chapterMatches) {
      const chNum = cm[2];
      if (seenCh.has(chNum)) continue;
      seenCh.add(chNum);
      chapters.push({
        id: `asura_ch:${cleanSlug}:${chNum}`,
        chapter: chNum,
        title: `Chapter ${chNum}`,
        sourceUrl: `${BASE_URL}${cm[1]}`,
      });
    }

    chapters.sort((a, b) => parseFloat(b.chapter) - parseFloat(a.chapter));

    const result = {
      id: `asura:${cleanSlug}`,
      title,
      englishTitle: title,
      coverUrl: coverUrl ? `/api/image-proxy?url=${encodeURIComponent(coverUrl)}` : '',
      rawCoverUrl: coverUrl,
      description,
      status: 'Ongoing',
      author: 'Asura Scans',
      tags,
      chapters,
      totalChapters: chapters.length,
      sourceName: 'Asura Scans',
      provider: 'asura',
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`getAsuraDetails error for ${cleanSlug}:`, err.message);
    throw err;
  }
}

/**
 * Get Chapter Pages from Asura Scans
 */
export async function getAsuraChapterPages(chapterId) {
  const parts = chapterId.replace(/^asura_ch:/, '').split(':');
  const slug = parts[0];
  const chNum = parts[1];

  const cacheKey = `asura_pages_${slug}_${chNum}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/comics/${slug}/chapter/${chNum}`;
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 8000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const allImgs = [...html.matchAll(/<img[^>]+(?:src|data-src)="([^"]+)"/gi)].map(m => m[1]);
    const chapterImages = allImgs.filter(u =>
      u.includes('asura-images/chapters') ||
      u.includes('cdn.asurascans.com') ||
      (u.includes('chapters/') && !u.includes('covers/'))
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
      sourceName: 'Asura Scans',
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`getAsuraChapterPages error for ${chapterId}:`, err.message);
    throw err;
  }
}
