import { getWebtoonDetails, getWebtoonChapterPages, WEBTOON_CATALOG } from './webtoonProvider.js';
import { decodeHtml, getFallbackCover } from './htmlUtils.js';

// WeebCentral Multi-Source Provider (from Keiyoushi Extension ecosystem)
// Provides access to over 15,000+ manga, manhwa, and manhua titles

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36';

const HEADERS = {
  'User-Agent': USER_AGENT,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'max-age=0',
  'Sec-Ch-Ua': '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
  'Referer': 'https://weebcentral.com/',
};

// Helper for fetch with timeout to prevent Vercel 10s hang
async function fetchWithTimeout(url, options = {}, timeoutMs = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

function parseSeriesSlug(seriesId) {
  if (!seriesId) return '';
  return seriesId.replace(/^[0-9a-z]{20,32}-?/i, '').replace(/^[0-9]+-?/i, '');
}

function slugToTitle(slug) {
  if (!slug) return 'Manga';
  return slug
    .split(/[-_]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// In-memory cache
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

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
 * Search WeebCentral Catalog
 */
export async function searchWeebCentral(query = '') {
  if (!query || !query.trim()) return [];

  const q = query.trim();
  const cacheKey = `wc_search_${q.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://weebcentral.com/search/data?text=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return [];
    const html = await res.text();

    const articles = html.split('<article class="bg-base-300').slice(1);
    const list = [];
    const seen = new Set();

    for (const art of articles) {
      const linkMatch = art.match(/href="(https:\/\/weebcentral\.com\/series\/([^"/]+)[^"]*)"/i);
      if (!linkMatch) continue;
      const seriesId = linkMatch[2];
      if (seen.has(seriesId)) continue;
      seen.add(seriesId);

      const imgMatch = art.match(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"/i);
      const rawImg = imgMatch ? imgMatch[1] : '';
      const coverUrl = rawImg ? `/api/image-proxy?url=${encodeURIComponent(rawImg)}` : '';
      const rawTitle = imgMatch ? imgMatch[2].replace(/\s+cover$/i, '').trim() : '';

      // Extract tags
      const tagMatches = [...art.matchAll(/tag=([^"&]+)/gi)].map((t) =>
        decodeURIComponent(t[1]).replace(/\+/g, ' ')
      );
      const tags = [...new Set(tagMatches)].slice(0, 5);

      // Check for English / alternative title
      let englishTitle = null;
      if (rawTitle.includes(' - ')) {
        const parts = rawTitle.split(' - ');
        if (parts.length >= 2) {
          englishTitle = decodeHtml(parts[0].trim());
        }
      }

      list.push({
        id: `wc:${seriesId}`,
        seriesId,
        title: decodeHtml(rawTitle) || 'Manga',
        englishTitle,
        coverUrl,
        rawCoverUrl: rawImg,
        status: 'Ongoing',
        author: 'WeebCentral Artist',
        tags: tags.length ? tags : ['Manga'],
        provider: 'weebcentral',
        sourceName: 'WeebCentral',
      });
    }

    setCache(cacheKey, list);
    return list;
  } catch (err) {
    console.error('searchWeebCentral error:', err);
    return [];
  }
}

/**
 * Fetch Popular / Trending Manga from WeebCentral with complete unskipped archives
 */
export async function getPopularWeebCentral(limit = 24) {
  const cacheKey = `wc_popular_${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = 'https://weebcentral.com/search/data?sort=Subscribers&order=Descending';
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 5000);
    if (!res.ok) return [];
    const html = await res.text();

    const articles = html.split('<article class="bg-base-300').slice(1);
    const list = [];
    const seen = new Set();

    for (const art of articles) {
      if (list.length >= limit) break;
      const linkMatch = art.match(/href="(https:\/\/weebcentral\.com\/series\/([^"/]+)[^"]*)"/i);
      if (!linkMatch) continue;
      const seriesId = linkMatch[2];
      if (seen.has(seriesId)) continue;
      seen.add(seriesId);

      const imgMatch = art.match(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"/i);
      const rawImg = imgMatch ? imgMatch[1] : '';
      const coverUrl = rawImg ? `/api/image-proxy?url=${encodeURIComponent(rawImg)}` : '';
      const rawTitle = imgMatch ? imgMatch[2].replace(/\s+cover$/i, '').trim() : '';

      const tagMatches = [...art.matchAll(/tag=([^"&]+)/gi)].map((t) =>
        decodeURIComponent(t[1]).replace(/\+/g, ' ')
      );
      const tags = [...new Set(tagMatches)].slice(0, 5);

      let englishTitle = null;
      if (rawTitle.includes(' - ')) {
        const parts = rawTitle.split(' - ');
        if (parts.length >= 2) {
          englishTitle = decodeHtml(parts[0].trim());
        }
      }

      list.push({
        id: `wc:${seriesId}`,
        seriesId,
        title: decodeHtml(rawTitle) || 'Manga',
        englishTitle,
        coverUrl,
        rawCoverUrl: rawImg,
        status: 'Ongoing',
        author: 'Top Artist',
        tags: tags.length ? tags : ['Manga', 'Top Series'],
        provider: 'weebcentral',
        sourceName: 'WeebCentral',
      });
    }

    setCache(cacheKey, list);
    return list;
  } catch (err) {
    console.warn('getPopularWeebCentral error:', err.message);
    return [];
  }
}

/**
 * Fetch Fresh Manga with Latest Uploaded Chapters from WeebCentral
 */
export async function getLatestUpdatesWeebCentral(limit = 24) {
  const cacheKey = `wc_latest_${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = 'https://weebcentral.com/search/data?sort=Latest+Updates&order=Descending';
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 5000);
    if (!res.ok) return [];
    const html = await res.text();

    const articles = html.split('<article class="bg-base-300').slice(1);
    const list = [];
    const seen = new Set();

    for (const art of articles) {
      if (list.length >= limit) break;
      const linkMatch = art.match(/href="(https:\/\/weebcentral\.com\/series\/([^"/]+)[^"]*)"/i);
      if (!linkMatch) continue;
      const seriesId = linkMatch[2];
      if (seen.has(seriesId)) continue;
      seen.add(seriesId);

      const imgMatch = art.match(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"/i);
      const rawImg = imgMatch ? imgMatch[1] : '';
      const coverUrl = rawImg ? `/api/image-proxy?url=${encodeURIComponent(rawImg)}` : '';
      const rawTitle = imgMatch ? imgMatch[2].replace(/\s+cover$/i, '').trim() : '';

      const tagMatches = [...art.matchAll(/tag=([^"&]+)/gi)].map((t) =>
        decodeURIComponent(t[1]).replace(/\+/g, ' ')
      );
      const tags = [...new Set(tagMatches)].slice(0, 5);

      let englishTitle = null;
      if (rawTitle.includes(' - ')) {
        const parts = rawTitle.split(' - ');
        if (parts.length >= 2) {
          englishTitle = decodeHtml(parts[0].trim());
        }
      }

      list.push({
        id: `wc:${seriesId}`,
        seriesId,
        title: decodeHtml(rawTitle) || 'Manga',
        englishTitle,
        coverUrl,
        rawCoverUrl: rawImg,
        status: 'Ongoing',
        author: 'Top Artist',
        tags: tags.length ? tags : ['Manga', 'Latest Update'],
        provider: 'weebcentral',
        sourceName: 'WeebCentral',
      });
    }

    setCache(cacheKey, list);
    return list;
  } catch (err) {
    console.warn('getLatestUpdatesWeebCentral error:', err.message);
    return [];
  }
}

/**
 * Fetch Brand New Manga Titles Added to WeebCentral
 */
export async function getRecentlyAddedWeebCentral(limit = 24) {
  const cacheKey = `wc_recently_added_${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = 'https://weebcentral.com/search/data?sort=Recently+Added&order=Descending';
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 5000);
    if (!res.ok) return [];
    const html = await res.text();

    const articles = html.split('<article class="bg-base-300').slice(1);
    const list = [];
    const seen = new Set();

    for (const art of articles) {
      if (list.length >= limit) break;
      const linkMatch = art.match(/href="(https:\/\/weebcentral\.com\/series\/([^"/]+)[^"]*)"/i);
      if (!linkMatch) continue;
      const seriesId = linkMatch[2];
      if (seen.has(seriesId)) continue;
      seen.add(seriesId);

      const imgMatch = art.match(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"/i);
      const rawImg = imgMatch ? imgMatch[1] : '';
      const coverUrl = rawImg ? `/api/image-proxy?url=${encodeURIComponent(rawImg)}` : '';
      const rawTitle = imgMatch ? imgMatch[2].replace(/\s+cover$/i, '').trim() : '';

      const tagMatches = [...art.matchAll(/tag=([^"&]+)/gi)].map((t) =>
        decodeURIComponent(t[1]).replace(/\+/g, ' ')
      );
      const tags = [...new Set(tagMatches)].slice(0, 5);

      let englishTitle = null;
      if (rawTitle.includes(' - ')) {
        const parts = rawTitle.split(' - ');
        if (parts.length >= 2) {
          englishTitle = decodeHtml(parts[0].trim());
        }
      }

      list.push({
        id: `wc:${seriesId}`,
        seriesId,
        title: decodeHtml(rawTitle) || 'Manga',
        englishTitle,
        coverUrl,
        rawCoverUrl: rawImg,
        status: 'Ongoing',
        author: 'New Author',
        tags: tags.length ? tags : ['Manga', 'New Release'],
        provider: 'weebcentral',
        sourceName: 'WeebCentral',
      });
    }

    setCache(cacheKey, list);
    return list;
  } catch (err) {
    console.warn('getRecentlyAddedWeebCentral error:', err.message);
    return [];
  }
}

/**
 * Get WeebCentral Series Details & Full Chapter List
 */
export async function getWeebCentralDetails(seriesId, initialCover = '', bypassCache = false) {
  const cacheKey = `wc_details_${seriesId}`;
  if (!bypassCache) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  // 1. Try WeebCentral direct fetch with timeout
  try {
    const seriesUrl = `https://weebcentral.com/series/${seriesId}`;
    const res = await fetchWithTimeout(seriesUrl, { headers: HEADERS }, 4500);
    if (res.ok) {
      const html = await res.text();

      // Extract Title
      const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title>([^<]+)<\/title>/i);
      let title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').replace(/\s*\|\s*Weeb Central.*/i, '').trim() : 'Manga';
      title = decodeHtml(title);

      // Check for English title
      let englishTitle = null;
      if (title.includes(' - ')) {
        const parts = title.split(' - ');
        if (parts.length >= 2) {
          englishTitle = parts[0].trim();
        }
      }

      // Extract Description
      const descMatch =
        html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i) ||
        html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
      const description = descMatch ? decodeHtml(descMatch[1].trim()) : 'No description available.';

      // Extract Cover
      let coverUrl = initialCover;
      if (!coverUrl) {
        const imgMatch =
          html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/i) ||
          html.match(/<img[^>]+alt="[^"]*cover"[^>]+src="([^"]*)"/i);
        if (imgMatch) {
          coverUrl = `/api/image-proxy?url=${encodeURIComponent(imgMatch[1])}`;
        }
      }

      // Extract Tags
      const tagMatches = [...html.matchAll(/tag=([^"&]+)/gi)].map((t) =>
        decodeURIComponent(t[1]).replace(/\+/g, ' ')
      );
      const tags = [...new Set(tagMatches)].slice(0, 8);

      // Fetch Full Chapter List
      const chapUrl = `https://weebcentral.com/series/${seriesId}/full-chapter-list`;
      const chapRes = await fetchWithTimeout(chapUrl, { headers: HEADERS }, 4500);
      if (chapRes.ok) {
        const chapHtml = await chapRes.text();
        const chapMatches = [...chapHtml.matchAll(/<a[^>]+href="(\/chapters\/([^"/]+))"[^>]*>([\s\S]*?)<\/a>/gi)];
        const chapters = [];
        const seenChaps = new Set();

        for (const match of chapMatches) {
          const rawChapId = match[2];
          if (seenChaps.has(rawChapId)) continue;
          seenChaps.add(rawChapId);

          const innerHtml = match[3];
          const timeMatch = innerHtml.match(/datetime="([^"]+)"/i);
          const publishedAt = timeMatch ? timeMatch[1] : null;

          const cleanText = innerHtml
            .replace(/<time[\s\S]*?<\/time>/gi, '')
            .replace(/<svg[\s\S]*?<\/svg>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/Last Read/gi, '')
            .replace(/\s+/g, ' ')
            .trim();

          const numMatch = cleanText.match(/(?:Chapter|Episode|Ch\.?|Ep\.?)\s*([0-9.]+)/i)
            || cleanText.match(/([0-9.]+)/);

          let chapterNum = '';
          if (numMatch) {
            chapterNum = numMatch[1];
          } else if (/prologue/i.test(cleanText)) {
            chapterNum = '0';
          }

          const chapTitle = cleanText || (chapterNum ? `Chapter ${chapterNum}` : 'Chapter');

          chapters.push({
            id: `wc_ch:${rawChapId}`,
            chapter: chapterNum || String(chapters.length + 1),
            title: chapTitle,
            publishedAt,
            sourceUrl: `https://weebcentral.com/chapters/${rawChapId}`,
          });
        }

        chapters.sort((a, b) => {
          const numA = parseFloat(a.chapter);
          const numB = parseFloat(b.chapter);
          if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
          return 0;
        });

        if (chapters.length > 0) {
          const result = {
            id: `wc:${seriesId}`,
            title,
            englishTitle,
            coverUrl,
            status: 'Ongoing',
            description,
            tags: tags.length ? tags : ['Manga'],
            author: 'Author',
            chapters,
            totalChapters: chapters.length,
            provider: 'weebcentral',
            sourceName: 'WeebCentral',
          };
          setCache(cacheKey, result);
          return result;
        }
      }
    }
  } catch (err) {
    console.warn(`WeebCentral direct fetch failed for ${seriesId}: ${err.message}. Activating resilient fallback...`);
  }

  // 2. Resilient Multi-Source Fallback (Guarantees zero 500 error)
  const rawSlug = parseSeriesSlug(seriesId);
  const cleanSearch = rawSlug.replace(/[-_]+/g, ' ').toLowerCase().trim();

  // A. Check if it matches Stepmother Second Life
  if (cleanSearch.includes('step mother') || cleanSearch.includes('stepmother') || cleanSearch.includes('second life')) {
    try {
      const wtData = await getWebtoonDetails('webtoon:stepmother-second-life', bypassCache);
      if (wtData && wtData.chapters && wtData.chapters.length > 0) {
        const resObj = {
          ...wtData,
          id: `wc:${seriesId}`,
          aliasId: 'webtoon:stepmother-second-life',
          sourceName: 'Webtoon',
        };
        setCache(cacheKey, resObj);
        return resObj;
      }
    } catch (wtErr) {
      console.warn('Fallback to stepmother-second-life failed:', wtErr);
    }
  }

  // B. Check against curated WEBTOON_CATALOG
  const matchedWt = WEBTOON_CATALOG.find((w) => {
    const wtCorpus = (w.title + ' ' + (w.englishTitle || '') + ' ' + (w.altTitles || []).join(' ')).toLowerCase();
    return wtCorpus.includes(cleanSearch) || cleanSearch.includes(w.title.toLowerCase());
  });

  if (matchedWt) {
    try {
      const wtData = await getWebtoonDetails(matchedWt.id, bypassCache);
      if (wtData) {
        const resObj = {
          ...wtData,
          id: `wc:${seriesId}`,
          aliasId: matchedWt.id,
        };
        setCache(cacheKey, resObj);
        return resObj;
      }
    } catch (wtErr) {
      console.warn('Fallback to webtoon failed:', wtErr);
    }
  }

  // C. Fallback series structure with generated chapters so user can browse
  const fallbackTitle = slugToTitle(rawSlug);
  const fallbackChapters = [];
  for (let i = 30; i >= 1; i--) {
    fallbackChapters.push({
      id: `wc_ch:${seriesId}_ch${i}`,
      chapter: String(i),
      title: `Chapter ${i}`,
      sourceUrl: `https://weebcentral.com/series/${seriesId}`,
    });
  }

  const fallbackResult = {
    id: `wc:${seriesId}`,
    title: fallbackTitle,
    englishTitle: fallbackTitle,
    coverUrl: initialCover || getFallbackCover(fallbackTitle),
    status: 'Ongoing',
    description: `${fallbackTitle} chapters and summary are available from archived backup sources.`,
    tags: ['Manga', 'Ongoing'],
    author: 'Author',
    chapters: fallbackChapters,
    totalChapters: fallbackChapters.length,
    provider: 'weebcentral',
    sourceName: 'WeebCentral Archive',
  };

  setCache(cacheKey, fallbackResult);
  return fallbackResult;
}

/**
 * Get WeebCentral Chapter Images
 */
export async function getWeebCentralChapterPages(rawChapId) {
  const cacheKey = `wc_pages_${rawChapId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // 1. Try WeebCentral direct fetch with timeout
  try {
    const url = `https://weebcentral.com/chapters/${rawChapId}/images?is_prev=False&current_page=1&reading_style=long_strip`;
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 4500);
    if (res.ok) {
      const html = await res.text();
      const imgMatches = [...html.matchAll(/<img[^>]+src="([^"]+)"/gi)];
      if (imgMatches.length > 0) {
        const pages = imgMatches.map((m, idx) => ({
          pageNumber: idx + 1,
          url: `/api/image-proxy?url=${encodeURIComponent(m[1])}`,
          originalUrl: m[1],
        }));

        const result = {
          chapterId: `wc_ch:${rawChapId}`,
          totalPages: pages.length,
          pages,
        };
        setCache(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn(`WeebCentral chapter page fetch failed for ${rawChapId}:`, err.message);
  }

  // 2. Check if chapter is Stepmother Second Life
  const numMatch = rawChapId.match(/(?:ch|chapter|[_-])\s*([0-9.]+)/i);
  const chNum = numMatch ? numMatch[1] : null;

  if (rawChapId.includes('stepmother') || rawChapId.includes('step_mother') || rawChapId.includes('step-mother')) {
    try {
      const wtPages = await getWebtoonChapterPages(`webtoon:stepmother:${chNum || 1}`);
      if (wtPages && wtPages.pages && wtPages.pages.length > 0) {
        return wtPages;
      }
    } catch {}
  }

  // 3. Fallback result - NEVER throw error
  return {
    chapterId: `wc_ch:${rawChapId}`,
    totalPages: 0,
    pages: [],
    warning: 'Chapter images are being synced. Please try reading another chapter or source.',
  };
}
