// WeebCentral Multi-Source Provider (from Keiyoushi Extension ecosystem)
// Provides access to over 15,000+ manga, manhwa, and manhua titles

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const HEADERS = {
  'User-Agent': USER_AGENT,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

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

function decodeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
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
 * Get WeebCentral Series Details & Full Chapter List
 */
export async function getWeebCentralDetails(seriesId, initialCover = '') {
  const cacheKey = `wc_details_${seriesId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const seriesUrl = `https://weebcentral.com/series/${seriesId}`;
    const res = await fetch(seriesUrl, { headers: HEADERS });
    if (!res.ok) throw new Error(`WeebCentral series fetch error: ${res.status}`);
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
    const chapRes = await fetch(chapUrl, { headers: HEADERS });
    if (!chapRes.ok) throw new Error(`WeebCentral chapters fetch error: ${chapRes.status}`);
    const chapHtml = await chapRes.text();

    const chapMatches = [...chapHtml.matchAll(/<a[^>]+href="(\/chapters\/([^"/]+))"[^>]*>([\s\S]*?)<\/a>/gi)];
    const chapters = [];
    const seenChaps = new Set();

    for (const match of chapMatches) {
      const rawChapId = match[2];
      if (seenChaps.has(rawChapId)) continue;
      seenChaps.add(rawChapId);

      const rawContent = match[3].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      // Extract Chapter number
      const numMatch = rawContent.match(/Chapter\s+([0-9.]+)/i);
      const chapterNum = numMatch ? numMatch[1] : '';
      const chapTitle = chapterNum ? `Chapter ${chapterNum}` : rawContent.slice(0, 30);

      chapters.push({
        id: `wc_ch:${rawChapId}`,
        chapter: chapterNum || String(chapters.length + 1),
        title: chapTitle,
        sourceUrl: `https://weebcentral.com/chapters/${rawChapId}`,
      });
    }

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
  } catch (err) {
    console.error('getWeebCentralDetails error:', err);
    throw err;
  }
}

/**
 * Get WeebCentral Chapter Images
 */
export async function getWeebCentralChapterPages(rawChapId) {
  const cacheKey = `wc_pages_${rawChapId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://weebcentral.com/chapters/${rawChapId}/images?is_prev=False&current_page=1&reading_style=long_strip`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`WeebCentral pages fetch error: ${res.status}`);
    const html = await res.text();

    const imgMatches = [...html.matchAll(/<img[^>]+src="([^"]+)"/gi)];
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
  } catch (err) {
    console.error('getWeebCentralChapterPages error:', err);
    throw err;
  }
}
