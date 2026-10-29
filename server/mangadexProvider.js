/**
 * MangaDex Provider (Official Open API v5)
 * Flagship source from the Keiyoushi ecosystem
 */

import { cleanTitle, getFallbackCover } from './htmlUtils.js';

const BASE_URL = 'https://api.mangadex.org';
const COVER_BASE_URL = 'https://uploads.mangadex.org/covers';

// In-memory cache with 20-minute TTL
const cache = new Map();
const CACHE_TTL_MS = 20 * 60 * 1000;

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

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'KuroNeko/2.0 (Manga Reader)',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Format MangaDex raw item into standardized shape
 */
function formatMangaDexItem(item) {
  if (!item) return null;
  const id = item.id;
  const attrs = item.attributes || {};
  
  // Title resolution
  const rawTitle = attrs.title?.en 
    || attrs.title?.['ja-ro'] 
    || attrs.title?.['ko-ro'] 
    || Object.values(attrs.title || {})[0] 
    || 'Untitled Manga';
  const title = cleanTitle(rawTitle);

  // Alt title resolution
  let englishTitle = null;
  const allAltTitles = [];
  if (attrs.altTitles && Array.isArray(attrs.altTitles)) {
    attrs.altTitles.forEach(t => {
      Object.values(t).forEach(val => {
        if (val && typeof val === 'string' && val.trim().length > 0) {
          allAltTitles.push(cleanTitle(val.trim()));
        }
      });
    });
    const enAlt = attrs.altTitles.find(t => t.en);
    if (enAlt) englishTitle = cleanTitle(enAlt.en);
  }
  if (!englishTitle && attrs.title?.en && attrs.title['ja-ro']) {
    englishTitle = cleanTitle(attrs.title.en);
  }
  if (attrs.title && typeof attrs.title === 'object') {
    Object.values(attrs.title).forEach(val => {
      if (val && typeof val === 'string' && !allAltTitles.includes(val)) {
        allAltTitles.push(cleanTitle(val));
      }
    });
  }

  // Cover resolution
  let coverUrl = getFallbackCover(title);
  const coverRel = (item.relationships || []).find(r => r.type === 'cover_art');
  if (coverRel?.attributes?.fileName) {
    coverUrl = `${COVER_BASE_URL}/${id}/${coverRel.attributes.fileName}.512.jpg`;
  }

  // Description
  const description = attrs.description?.en || Object.values(attrs.description || {})[0] || 'No description available.';

  // Genres / Tags
  const genres = (attrs.tags || [])
    .map(t => t.attributes?.name?.en)
    .filter(Boolean);

  return {
    id: `md:${id}`,
    rawId: id,
    title,
    englishTitle,
    altTitles: allAltTitles,
    coverUrl,
    description,
    status: attrs.status ? attrs.status.toUpperCase() : 'ONGOING',
    year: attrs.year || null,
    contentRating: attrs.contentRating || 'safe',
    genres: genres.slice(0, 5),
    rating: '4.8',
    source: 'MangaDex',
    sourceName: 'MangaDex',
    latestChapter: attrs.lastChapter || null,
    lastUpdated: attrs.updatedAt || attrs.createdAt || null,
  };
}

/**
 * Popular / Trending Manga from MangaDex
 */
export async function getPopularMangaDex(limit = 20) {
  const cacheKey = `md_popular_${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/manga?limit=${limit}&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive&includes[]=cover_art`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const items = (data.data || []).map(formatMangaDexItem).filter(Boolean);
    if (items.length > 0) {
      setCache(cacheKey, items);
    }
    return items;
  } catch (err) {
    console.warn('MangaDex getPopular error:', err.message);
    return [];
  }
}

/**
 * Fetch Fresh Manga with Latest Uploaded Chapters (Real-time updates)
 */
export async function getLatestMangaDex(limit = 24) {
  const cacheKey = `md_latest_uploaded_${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/manga?limit=${limit}&order[latestUploadedChapter]=desc&contentRating[]=safe&contentRating[]=suggestive&includes[]=cover_art`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const items = (data.data || []).map(formatMangaDexItem).filter(Boolean);
    if (items.length > 0) {
      setCache(cacheKey, items);
    }
    return items;
  } catch (err) {
    console.warn('MangaDex getLatest error:', err.message);
    return [];
  }
}

/**
 * Fetch Brand New Manga Titles Added to MangaDex
 */
export async function getNewlyAddedMangaDex(limit = 24) {
  const cacheKey = `md_newly_created_${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/manga?limit=${limit}&order[createdAt]=desc&contentRating[]=safe&contentRating[]=suggestive&includes[]=cover_art`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const items = (data.data || []).map(formatMangaDexItem).filter(Boolean);
    if (items.length > 0) {
      setCache(cacheKey, items);
    }
    return items;
  } catch (err) {
    console.warn('MangaDex getNewlyAdded error:', err.message);
    return [];
  }
}

/**
 * Search MangaDex with Relevance and Follower Count Ranking
 */
export async function searchMangaDex(query, limit = 15) {
  if (!query || !query.trim()) return [];
  const cleanQ = query.trim();
  const cacheKey = `md_search_${cleanQ.toLowerCase()}_${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    // Order by relevance and popularity so official and prominent releases appear first
    const url = `${BASE_URL}/manga?title=${encodeURIComponent(cleanQ)}&limit=${limit}&order[relevance]=desc&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive&includes[]=cover_art`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const items = (data.data || []).map(formatMangaDexItem).filter(Boolean);
    setCache(cacheKey, items);
    return items;
  } catch (err) {
    console.warn('MangaDex search error:', err.message);
    return [];
  }
}

/**
 * Get Manga Details and Chapters from MangaDex
 */
export async function getMangaDexDetails(rawId, bypassCache = false) {
  const cleanId = String(rawId).replace(/^md:/, '').replace(/^mangadex:/, '');
  const cacheKey = `md_details_${cleanId}`;
  
  if (!bypassCache) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  try {
    // 1. Fetch Manga Info
    const mangaUrl = `${BASE_URL}/manga/${cleanId}?includes[]=cover_art&includes[]=author&includes[]=artist`;
    const res = await fetchWithTimeout(mangaUrl);
    if (!res.ok) throw new Error(`Manga fetch failed: HTTP ${res.status}`);
    const mangaData = await res.json();
    const item = mangaData.data;
    if (!item) throw new Error('Manga not found');

    const formatted = formatMangaDexItem(item);

    // 2. Fetch Chapters (English, sorted descending, up to 500 per batch, paginating if total > 500)
    let chapters = [];
    try {
      const initialFeedUrl = `${BASE_URL}/manga/${cleanId}/feed?translatedLanguage[]=en&order[chapter]=desc&limit=500&offset=0&includeExternalUrl=0&contentRating[]=safe&contentRating[]=suggestive`;
      const initialRes = await fetchWithTimeout(initialFeedUrl, {}, 8000);
      if (initialRes.ok) {
        const feedData = await initialRes.json();
        let rawFeedChapters = feedData.data || [];
        const totalChaptersCount = feedData.total || 0;

        // If total chapters exceed 500, fetch additional batches in parallel (up to 1500 chapters)
        if (totalChaptersCount > 500) {
          const remainingBatches = [];
          const maxToFetch = Math.min(totalChaptersCount, 1500);
          for (let offset = 500; offset < maxToFetch; offset += 500) {
            const nextUrl = `${BASE_URL}/manga/${cleanId}/feed?translatedLanguage[]=en&order[chapter]=desc&limit=500&offset=${offset}&includeExternalUrl=0&contentRating[]=safe&contentRating[]=suggestive`;
            remainingBatches.push(
              fetchWithTimeout(nextUrl, {}, 8000)
                .then(r => r.ok ? r.json() : null)
                .then(json => json?.data || [])
                .catch(() => [])
            );
          }
          if (remainingBatches.length > 0) {
            const extraBatches = await Promise.all(remainingBatches);
            for (const batch of extraBatches) {
              if (Array.isArray(batch)) {
                rawFeedChapters = rawFeedChapters.concat(batch);
              }
            }
          }
        }

        const seenChapters = new Set();
        chapters = rawFeedChapters
          .map(ch => {
            if (ch.attributes?.externalUrl) return null;
            if (ch.attributes?.pages === 0) return null;
            const chNum = ch.attributes?.chapter || '0';
            const chTitle = ch.attributes?.title || '';
            const publishAt = ch.attributes?.publishAt || '';
            
            // Deduplicate same chapter numbers (take first English translation)
            if (seenChapters.has(chNum)) return null;
            seenChapters.add(chNum);

            return {
              id: `md_ch:${ch.id}`,
              rawId: ch.id,
              chapter: chNum,
              title: chTitle ? `Ch. ${chNum} - ${chTitle}` : `Chapter ${chNum}`,
              date: publishAt ? publishAt.slice(0, 10) : 'Recent',
              publishedAt: publishAt || null,
              source: 'MangaDex',
            };
          })
          .filter(Boolean);
      }
    } catch (feedErr) {
      console.warn('MangaDex feed error:', feedErr.message);
    }

    const result = {
      ...formatted,
      chapters,
      totalChapters: chapters.length,
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.warn(`MangaDex getDetails error for ${cleanId}:`, err.message);
    throw err;
  }
}

/**
 * Get Chapter Pages from MangaDex@Home CDN
 */
export async function getMangaDexChapterPages(rawChapterId, preferDataSaver = true) {
  const cleanId = String(rawChapterId).replace(/^md_ch:/, '');
  const cacheKey = `md_pages_${cleanId}_${preferDataSaver ? 'saver' : 'full'}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/at-home/server/${cleanId}`;
    const res = await fetchWithTimeout(url, {}, 6000);
    if (!res.ok) throw new Error(`At-Home API error: HTTP ${res.status}`);
    const data = await res.json();

    const baseUrl = data.baseUrl;
    const chapter = data.chapter;
    if (!baseUrl || !chapter) throw new Error('Invalid At-Home response');

    const hash = chapter.hash;
    // Use data-saver for lightning-fast loading or fallback to full quality data
    const useSaver = preferDataSaver && chapter.dataSaver && chapter.dataSaver.length > 0;
    const fileList = useSaver ? chapter.dataSaver : chapter.data;
    const subFolder = useSaver ? 'data-saver' : 'data';

    const pages = fileList.map((fileName, idx) => ({
      pageNumber: idx + 1,
      url: `${baseUrl}/${subFolder}/${hash}/${fileName}`,
    }));

    const result = {
      chapterId: `md_ch:${cleanId}`,
      totalPages: pages.length,
      pages,
      source: 'MangaDex',
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.warn(`MangaDex getChapterPages error for ${cleanId}:`, err.message);
    return {
      chapterId: rawChapterId,
      totalPages: 0,
      pages: [],
      warning: 'Pages for this MangaDex chapter are temporarily synchronizing. Please try refreshing or choosing another chapter.',
    };
  }
}

/**
 * Get Recommendations based on genre/tags
 */
export async function getMangaDexRecommendations(genres = [], limit = 8) {
  const cacheKey = `md_recs_${(genres || []).slice(0, 2).join('_')}_${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Tag ID mappings for popular genres
  const TAG_MAP = {
    'action': '391b0423-d847-456f-aff0-8b0cfc03066b',
    'fantasy': 'cdc58593-87dd-415e-bbc0-2ec27bf404cc',
    'romance': '423e2eae-a7a2-4a8b-ac03-a8351462d71d',
    'comedy': '4d32cc48-9f00-4cca-9b5a-a839f0764984',
    'drama': 'b9af3a63-f058-46de-a9a0-e0c13906197a',
    'adventure': '87cc87cd-a395-47af-b27a-93258283bbc6',
    'supernatural': 'e197aaf1-3728-4347-b184-455ca786c72e',
    'isekai': 'ace04997-f6bd-4329-8b02-571ab0a43c35',
  };

  let tagId = null;
  if (Array.isArray(genres)) {
    for (const g of genres) {
      const lower = String(g).toLowerCase().trim();
      if (TAG_MAP[lower]) {
        tagId = TAG_MAP[lower];
        break;
      }
    }
  }

  try {
    let url = `${BASE_URL}/manga?limit=${limit}&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive&includes[]=cover_art`;
    if (tagId) {
      url += `&includedTags[]=${tagId}`;
    }

    const res = await fetchWithTimeout(url, {}, 8000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const items = (data.data || []).map(formatMangaDexItem).filter(Boolean);
    if (items.length > 0) {
      setCache(cacheKey, items);
    }
    return items;
  } catch (err) {
    console.warn('MangaDex recommendations error:', err.message);
    return [];
  }
}
