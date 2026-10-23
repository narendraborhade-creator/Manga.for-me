// High-Performance MangaKakalot & KakaManga Provider
// Integrated from Manga-API with modern API endpoints and CDN hotlink bypass

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const HEADERS = {
  'User-Agent': USER_AGENT,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.kakamanga.com/',
};

const BASE_URL = 'https://www.kakamanga.com';

// In-memory cache
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

function decodeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
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
 * Fetch 50+ Latest Manga Releases from MangaKakalot / KakaManga
 */
export async function getPopularMangaKakalot() {
  const cacheKey = 'mk_popular_v2';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetchWithTimeout(`${BASE_URL}/`, { headers: HEADERS }, 6000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const list = [];
    const parts = html.split(/<div class="itemupdate/i);

    for (let i = 1; i < parts.length; i++) {
      const block = parts[i];
      const linkMatch = block.match(/href="https:\/\/www\.kakamanga\.com\/manga\/([^"/]+)"/i) || block.match(/href="\/manga\/([^"/]+)"/i);
      const imgMatch = block.match(/<img[^>]+(?:data-src|src)="([^"]+)"[^>]*alt="([^"]*)"/i) || block.match(/<img[^>]*alt="([^"]*)"[^>]+(?:data-src|src)="([^"]+)"/i);

      if (linkMatch) {
        const slug = linkMatch[1];
        let rawTitle = slug.replace(/-/g, ' ');
        let rawCover = '';

        if (imgMatch) {
          if (imgMatch[1]?.startsWith('http')) {
            rawCover = imgMatch[1];
            if (imgMatch[2]) rawTitle = imgMatch[2];
          } else if (imgMatch[2]?.startsWith('http')) {
            rawCover = imgMatch[2];
            if (imgMatch[1]) rawTitle = imgMatch[1];
          }
        }

        if (!rawCover) {
          rawCover = `https://img-r1.2xstorage.com/thumb/${slug}.webp`;
        }

        // Clean double-prefixed URLs
        if (rawCover.startsWith('https://www.mangakakalot.gghttps://')) {
          rawCover = rawCover.replace('https://www.mangakakalot.gg', '');
        }

        // Extract latest chapter
        const chMatch = block.match(/href="[^"]*\/chapter-([0-9.]+)"[^>]*title="([^"]+)"/i) || block.match(/<a[^>]*href="[^"]*\/chapter-([0-9.]+)"[^>]*>([^<]+)<\/a>/i);
        const latestCh = chMatch ? `Chapter ${chMatch[1]}` : 'Latest';

        list.push({
          id: `mk:${slug}`,
          slug,
          title: decodeHtml(rawTitle),
          englishTitle: decodeHtml(rawTitle),
          coverUrl: rawCover,
          status: 'Ongoing',
          author: 'MangaKakalot',
          latestChapter: latestCh,
          tags: ['Manga', 'Action'],
          sourceName: 'MangaKakalot',
          provider: 'mangakakalot',
        });
      }
    }

    if (list.length > 0) {
      setCache(cacheKey, list);
      return list;
    }
  } catch (err) {
    console.warn('getPopularMangaKakalot error:', err.message);
  }

  return [];
}

/**
 * Get MangaKakalot Manga Details and Chapters using high-speed JSON API
 */
export async function getMangaKakalotDetails(slug, bypassCache = false) {
  const cleanSlug = String(slug).replace(/^mk:/, '').replace(/^https?:\/\/[^/]+\/manga\//, '');
  const cacheKey = `mk_details_${cleanSlug}`;
  if (!bypassCache) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  try {
    // 1. Fetch main page metadata (title, cover, description, authors, status)
    const pageUrl = `${BASE_URL}/manga/${cleanSlug}`;
    const pageRes = await fetchWithTimeout(pageUrl, { headers: HEADERS }, 6000);
    let title = cleanSlug.replace(/-/g, ' ');
    let coverUrl = `https://img-r1.2xstorage.com/thumb/${cleanSlug}.webp`;
    let description = '';
    let status = 'Ongoing';
    let authors = 'MangaKakalot Artist';
    let tags = ['Manga', 'Action'];

    if (pageRes.ok) {
      const html = await pageRes.text();
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (h1Match) title = decodeHtml(h1Match[1].trim());

      const imgMatch = html.match(/class="manga-info-pic"[\s\S]*?<img[^>]+src="([^"]+)"/i);
      if (imgMatch) coverUrl = imgMatch[1];

      const descMatch = html.match(/id="contentBox"[^>]*>([\s\S]*?)<\/div>/i);
      if (descMatch) {
        description = descMatch[1].replace(/<[^>]+>/g, '').replace(/summary\s*:\s*/i, '').trim();
      }

      const statusMatch = html.match(/Status\s*:\s*([^<]+)/i);
      if (statusMatch) status = statusMatch[1].trim();

      const authorMatch = html.match(/Author\(s\)\s*:\s*([^<]+)/i);
      if (authorMatch) authors = authorMatch[1].trim();
    }

    // 2. Fetch full chapter list via the official JSON chapters endpoint
    const chaptersUrl = `${BASE_URL}/api/manga/${cleanSlug}/chapters`;
    const chapRes = await fetchWithTimeout(chaptersUrl, { headers: HEADERS }, 6000);
    const chapters = [];

    if (chapRes.ok) {
      const json = await chapRes.json();
      const rawChapters = json?.data?.chapters || [];

      for (const ch of rawChapters) {
        const chNum = String(ch.chapter_num ?? ch.chapter_slug?.replace('chapter-', '') ?? '1');
        const chName = ch.chapter_name || `Chapter ${chNum}`;
        const chSlug = ch.chapter_slug || `chapter-${chNum}`;

        chapters.push({
          id: `mk_ch:${cleanSlug}:${chSlug}`,
          chapter: chNum,
          title: decodeHtml(chName),
          date: ch.updated_at ? ch.updated_at.slice(0, 10) : 'Recent',
          source: 'MangaKakalot',
        });
      }
    }

    const result = {
      id: `mk:${cleanSlug}`,
      slug: cleanSlug,
      title: title || cleanSlug,
      englishTitle: title || cleanSlug,
      coverUrl: coverUrl || `https://img-r1.2xstorage.com/thumb/${cleanSlug}.webp`,
      description: description || 'Read on MangaKakalot.',
      status,
      author: authors,
      tags,
      sourceName: 'MangaKakalot',
      chapters,
      totalChapters: chapters.length,
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.warn(`getMangaKakalotDetails error for ${cleanSlug}:`, err.message);
    throw err;
  }
}

/**
 * Fetch All Real Image Pages for a MangaKakalot Chapter
 */
export async function getMangaKakalotChapterPages(rawChapterId) {
  // Format: mk_ch:slug:chapter-31 or mk_ch:slug:31
  const cleanId = String(rawChapterId).replace(/^mk_ch:/, '');
  const [slug, rawCh] = cleanId.split(':');
  const chSlug = rawCh.startsWith('chapter-') ? rawCh : `chapter-${rawCh}`;

  const cacheKey = `mk_pages_${slug}_${chSlug}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const chapterUrl = `${BASE_URL}/manga/${slug}/${chSlug}`;
    const res = await fetchWithTimeout(chapterUrl, { headers: HEADERS }, 7000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const imgMatches = [
      ...html.matchAll(/<img[^>]+(?:data-src|src)="([^"]*2xstorage\.com\/[^"]+)"/gi),
      ...html.matchAll(/<img[^>]+(?:data-src|src)="([^"]*kakamanga\.com\/[^"]+)"/gi),
      ...html.matchAll(/<img[^>]+(?:data-src|src)="([^"]*chapter[^"]*\.(?:jpg|jpeg|png|webp))"/gi),
    ];

    const seenUrls = new Set();
    const rawImages = [];

    for (const m of imgMatches) {
      let u = m[1];
      if (u.includes('avatar') || u.includes('logo') || u.includes('icon') || u.includes('banner')) continue;
      if (!seenUrls.has(u)) {
        seenUrls.add(u);
        rawImages.push(u);
      }
    }

    const pages = rawImages.map((imgUrl, idx) => ({
      pageNumber: idx + 1,
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
      return result;
    }
    throw new Error('No chapter images found');
  } catch (err) {
    console.warn(`getMangaKakalotChapterPages error for ${cleanId}:`, err.message);
    throw err;
  }
}
