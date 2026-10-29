/**
 * Manga News & Release Updates Provider
 * Fetches real-time manga news, chapter release dates, announcements,
 * and anime adaptation updates from verified industry RSS feeds.
 */

import { decodeHtml } from './htmlUtils.js';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

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

async function fetchWithTimeout(url, options = {}, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

function cleanNewsTitle(str) {
  if (!str) return '';
  return decodeHtml(str)
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/\s*-\s*[^-]+$/i, '') // strip trailing source tag like " - Anime Trending"
    .trim();
}

/**
 * Fetch Real-time Manga News & Updates
 * @param {string} title Optional title for series-specific news
 * @param {number} limit Maximum articles to return
 */
export async function getMangaNews(title = '', limit = 12) {
  const cleanT = (title || '').trim();
  const cacheKey = `manga_news_${cleanT.toLowerCase()}_${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const results = [];
  const seenUrls = new Set();

  try {
    if (cleanT) {
      // 1. Title-Specific News Search via Google News RSS
      const query = encodeURIComponent(`"${cleanT}" manga`);
      const gUrl = `https://news.google.com/rss/search?q=${query}+when:60d&hl=en-US&gl=US&ceid=US:en`;
      
      const res = await fetchWithTimeout(gUrl, {
        headers: { 'User-Agent': USER_AGENT }
      }, 5000);

      if (res.ok) {
        const text = await res.text();
        const items = [...text.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>(?:[\s\S]*?<source[^>]*>([^<]+)<\/source>)?/gi)];
        
        for (const item of items) {
          if (results.length >= limit) break;
          const rawTitle = item[1];
          const link = item[2];
          const pubDate = item[3];
          const source = item[4] ? item[4].trim() : 'Manga News';

          if (seenUrls.has(link)) continue;
          seenUrls.add(link);

          results.push({
            id: `news_${results.length + 1}`,
            title: cleanNewsTitle(rawTitle),
            link,
            pubDate: pubDate ? new Date(pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
            rawDate: pubDate,
            source,
            category: 'Update',
            mangaTitle: cleanT,
          });
        }
      }
    }

    // 2. Fetch Latest Global Industry Headlines from Anime News Network (ANN) Manga Feed
    if (results.length < limit) {
      const annUrl = 'https://www.animenewsnetwork.com/news/rss.xml?topic=manga';
      const annRes = await fetchWithTimeout(annUrl, {
        headers: { 'User-Agent': USER_AGENT }
      }, 5000).catch(() => null);

      if (annRes && annRes.ok) {
        const text = await annRes.text();
        const items = [...text.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<description>([\s\S]*?)<\/description>/gi)];

        for (const item of items) {
          if (results.length >= limit) break;
          const rawTitle = item[1];
          const link = item[2];
          const pubDate = item[3];
          const desc = item[4] ? decodeHtml(item[4].replace(/<[^>]+>/g, '').trim()) : '';

          if (seenUrls.has(link)) continue;

          // If title specified, filter for relevance
          if (cleanT) {
            const tLower = cleanT.toLowerCase();
            if (!rawTitle.toLowerCase().includes(tLower) && !desc.toLowerCase().includes(tLower)) {
              continue;
            }
          }

          seenUrls.add(link);
          results.push({
            id: `news_ann_${results.length + 1}`,
            title: cleanNewsTitle(rawTitle),
            link,
            pubDate: pubDate ? new Date(pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
            rawDate: pubDate,
            source: 'Anime News Network',
            snippet: desc.slice(0, 160) + (desc.length > 160 ? '...' : ''),
            category: 'Industry',
            mangaTitle: cleanT || undefined,
          });
        }
      }
    }

    // 3. Fallback to Global Google Manga News if still low
    if (results.length === 0) {
      const gGlobalUrl = 'https://news.google.com/rss/search?q=manga+chapter+release+when:7d&hl=en-US&gl=US&ceid=US:en';
      const gRes = await fetchWithTimeout(gGlobalUrl, { headers: { 'User-Agent': USER_AGENT } }, 5000).catch(() => null);
      if (gRes && gRes.ok) {
        const text = await gRes.text();
        const items = [...text.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>(?:[\s\S]*?<source[^>]*>([^<]+)<\/source>)?/gi)];
        for (const item of items) {
          if (results.length >= limit) break;
          const rawTitle = item[1];
          const link = item[2];
          const pubDate = item[3];
          const source = item[4] ? item[4].trim() : 'Manga News';

          if (seenUrls.has(link)) continue;
          seenUrls.add(link);

          results.push({
            id: `news_g_${results.length + 1}`,
            title: cleanNewsTitle(rawTitle),
            link,
            pubDate: pubDate ? new Date(pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
            rawDate: pubDate,
            source,
            category: 'Release News',
          });
        }
      }
    }

    setCache(cacheKey, results);
    return results;
  } catch (err) {
    console.warn('getMangaNews warning:', err.message);
    return [];
  }
}
