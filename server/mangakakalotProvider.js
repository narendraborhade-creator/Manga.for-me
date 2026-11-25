// High-Performance MangaKakalot & KakaManga Provider
// Integrated from Manga-API with modern API endpoints and CDN hotlink bypass

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const HEADERS = {
  'User-Agent': USER_AGENT,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.kakamanga.com/',
};

import { decodeHtml, cleanTitle, getFallbackCover } from './htmlUtils.js';

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

function parseKakalotList(html, { includeTotalChapters = false } = {}) {
  const list = [];
  const seen = new Set();
  const parts = html.split(/<div class="itemupdate|<div class="list-truyen-item-wrap/i);

  for (let i = 1; i < parts.length; i++) {
    const block = parts[i];
    const linkMatch = block.match(/href="https:\/\/www\.kakamanga\.com\/manga\/([^"/]+)"/i) || block.match(/href="\/manga\/([^"/]+)"/i);
    const dataSrcMatch = block.match(/<img[^>]+data-src="([^"]+)"/i);
    const srcMatch = block.match(/<img[^>]+src="([^"]+)"/i);
    const altMatch = block.match(/<img[^>]+alt="([^"]*)"/i);

    if (!linkMatch) continue;
    const slug = linkMatch[1];
    if (seen.has(slug)) continue;
    seen.add(slug);

    let rawTitle = altMatch?.[1]?.trim() || slug.replace(/-/g, ' ');
    const dataSrc = dataSrcMatch?.[1]?.trim() || '';
    const src = srcMatch?.[1]?.trim() || '';
    const candidateCover = (dataSrc.startsWith('http') ? dataSrc : '') || (src.startsWith('http') ? src : '');
    let rawCover = candidateCover;

    if (!rawCover) {
      rawCover = `https://img-r1.2xstorage.com/thumb/${slug}.webp`;
    }

    if (rawCover.startsWith('https://www.mangakakalot.gghttps://')) {
      rawCover = rawCover.replace('https://www.mangakakalot.gg', '');
    }

    const chMatch = block.match(/href="[^"]*\/chapter-([0-9.]+)"[^>]*title="([^"]+)"/i) || block.match(/<a[^>]*href="[^"]*\/chapter-([0-9.]+)"[^>]*>([^<]+)<\/a>/i);
    const clean = cleanTitle(rawTitle);
    const coverUrl = rawCover
      ? (rawCover.startsWith('/api/image-proxy') ? rawCover : `/api/image-proxy?url=${encodeURIComponent(rawCover)}`)
      : getFallbackCover(rawTitle);

    const item = {
      id: `mk:${slug}`,
      slug,
      title: clean,
      englishTitle: clean,
      coverUrl,
      status: 'Ongoing',
      author: 'MangaKakalot',
      latestChapter: includeTotalChapters ? (chMatch ? chMatch[1] : null) : (chMatch ? `Chapter ${chMatch[1]}` : 'Latest'),
      tags: ['Manga', 'Action'],
      sourceName: 'MangaKakalot',
      provider: 'mangakakalot',
    };

    if (includeTotalChapters) {
      item.totalChapters = item.latestChapter && !isNaN(parseFloat(item.latestChapter))
        ? Math.floor(parseFloat(item.latestChapter))
        : null;
    }

    list.push(item);
  }

  return list;
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
    const list = parseKakalotList(html);

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
 * Fetch Latest Manga Releases from MangaKakalot / KakaManga
 */
export async function getLatestMangaKakalot(limit = 24) {
  const cacheKey = `mk_latest_v1_${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetchWithTimeout(`${BASE_URL}/manga-list/latest-manga`, { headers: HEADERS }, 6000);
    if (res.ok) {
      const html = await res.text();
      const list = parseKakalotList(html);
      if (list.length > 0) {
        const sliced = list.slice(0, limit);
        setCache(cacheKey, sliced);
        return sliced;
      }
    }
  } catch (err) {
    console.warn('getLatestMangaKakalot error:', err.message);
  }

  const popular = await getPopularMangaKakalot();
  return popular.slice(0, limit);
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
      if (h1Match) title = cleanTitle(h1Match[1].trim());

      const imgMatch = html.match(/class="manga-info-pic"[\s\S]*?<img[^>]+src="([^"]+)"/i);
      if (imgMatch) coverUrl = imgMatch[1];

      const descMatch = html.match(/id="contentBox"[^>]*>([\s\S]*?)<\/div>/i);
      if (descMatch) {
        description = decodeHtml(descMatch[1].replace(/<[^>]+>/g, '').replace(/summary\s*:\s*/i, '').trim());
      }

      const statusMatch = html.match(/Status\s*:\s*([^<\n\r]+|<[^>]+>([^<]+)<\/[^>]+>)/i);
      if (statusMatch) {
        const cleanSt = (statusMatch[2] || statusMatch[1]).replace(/<[^>]+>/g, '').trim();
        if (cleanSt) status = cleanSt;
      }

      const authorMatch = html.match(/Author\(s\)\s*:\s*([\s\S]*?)<\/li>/i) || html.match(/Author\(s\)\s*:\s*([^<\n\r]+)/i);
      if (authorMatch) {
        const cleanAuth = decodeHtml(authorMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
        if (cleanAuth) authors = cleanAuth;
      }
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

    chapters.sort((a, b) => (parseFloat(b.chapter) || 0) - (parseFloat(a.chapter) || 0));

    const result = {
      id: `mk:${cleanSlug}`,
      slug: cleanSlug,
      title: title || cleanSlug,
      englishTitle: title || cleanSlug,
      coverUrl: (coverUrl && coverUrl.startsWith("/api/image-proxy")) ? coverUrl : (coverUrl ? `/api/image-proxy?url=${encodeURIComponent(coverUrl)}` : `https://img-r1.2xstorage.com/thumb/${cleanSlug}.webp`),
      description: description || 'Read on MangaKakalot.',
      status,
      author: authors,
      tags,
      provider: 'mangakakalot',
      sourceName: 'MangaKakalot',
      chapters,
      totalChapters: chapters.length,
      latestChapter: chapters[0] ? chapters[0].chapter : null,
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
  if (!rawChapterId) return { chapterId: '', totalPages: 0, pages: [] };
  // Format: mk_ch:slug:chapter-31 or mk_ch:slug:31
  const cleanId = String(rawChapterId).replace(/^mk_ch:/, '');
  const parts = cleanId.split(':');
  const slug = parts[0];
  const rawCh = parts.length > 1 ? parts[1] : '';
  if (!slug || !rawCh) {
    return { chapterId: rawChapterId, totalPages: 0, pages: [] };
  }
  const chSlug = rawCh.startsWith('chapter-') ? rawCh : `chapter-${rawCh}`;

  const cacheKey = `mk_pages_${slug}_${chSlug}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const chapterUrl = `${BASE_URL}/manga/${slug}/${chSlug}`;
    const res = await fetchWithTimeout(chapterUrl, { headers: HEADERS }, 7000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const seenUrls = new Set();
    const rawImages = [];
    const imgTags = [...html.matchAll(/<img\b[^>]*>/gi)];

    for (const tagMatch of imgTags) {
      const tag = tagMatch[0];
      const dataSrcM = tag.match(/\bdata-src="([^"]+)"/i);
      const srcM = tag.match(/\bsrc="([^"]+)"/i);
      const u = (dataSrcM?.[1] || srcM?.[1] || '').trim();
      if (!u || !u.startsWith('http')) continue;
      if (u.includes('avatar') || u.includes('logo') || u.includes('icon') || u.includes('banner')) continue;
      const isChapterHost =
        u.includes('2xstorage.com/') ||
        u.includes('kakamanga.com/') ||
        /chapter[^"]*\.(?:jpg|jpeg|png|webp)/i.test(u);
      if (!isChapterHost) continue;
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
    return {
      chapterId: rawChapterId,
      totalPages: 0,
      pages: [],
      warning: 'MangaKakalot chapter pages are temporarily synchronizing.',
    };
  }
}

/**
 * Search Manga on MangaKakalot / KakaManga
 */
export async function searchMangaKakalot(query = '') {
  if (!query || !query.trim()) return [];
  const q = query.trim();
  const cacheKey = `mk_search_${q.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const searchUrl = `${BASE_URL}/search?q=${encodeURIComponent(q)}`;
    const res = await fetchWithTimeout(searchUrl, { headers: HEADERS }, 6000);
    if (!res.ok) return [];
    const html = await res.text();
    const list = parseKakalotList(html, { includeTotalChapters: true });

    if (list.length > 0) {
      setCache(cacheKey, list);
    }
    return list;
  } catch (err) {
    console.warn('searchMangaKakalot error:', err.message);
    return [];
  }
}

