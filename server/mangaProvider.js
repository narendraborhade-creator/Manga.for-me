import { 
  searchWebtoons, 
  getWebtoonDetails, 
  getWebtoonChapterPages, 
  WEBTOON_CATALOG 
} from './webtoonProvider.js';
import {
  searchWeebCentral,
  getPopularWeebCentral,
  getWeebCentralDetails,
  getWeebCentralChapterPages
} from './weebcentralProvider.js';
import {
  searchAsura,
  getPopularAsura,
  getAsuraDetails,
  getAsuraChapterPages
} from './asuraProvider.js';
import {
  searchVortex,
  getPopularVortex,
  getVortexDetails,
  getVortexChapterPages
} from './vortexProvider.js';
import {
  searchMangaDex,
  getPopularMangaDex,
  getMangaDexDetails,
  getMangaDexChapterPages,
  getMangaDexRecommendations
} from './mangadexProvider.js';
import {
  getPopularMangaKakalot,
  searchMangaKakalot,
  getMangaKakalotDetails,
  getMangaKakalotChapterPages
} from './mangakakalotProvider.js';
import { decodeHtml, cleanTitle, getFallbackCover, deduplicateChapters } from './htmlUtils.js';

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

// Curated Top Masterpieces for Spotlight with verified high-res artwork and complete 1000+ chapter archives
export const FEATURED_MANGA = [
  {
    id: 'wc:01J76XY7E9FNDZ1DBBM6PBJPFK',
    title: 'One Piece',
    coverUrl: 'https://uploads.mangadex.org/covers/a1c7c817-4e59-43b7-9365-09675a149a6f/2f4aca53-64c7-46ac-ae85-3bc9b3169890.png.512.jpg',
    status: 'Ongoing',
    score: '9.3',
    year: '1997',
    author: 'Eiichiro Oda',
    description: 'Gol D. Roger was known as the "Pirate King", the strongest and most infamous being to have sailed the Grand Line. Monkey D. Luffy sets sail in search of the legendary One Piece treasure!',
    tags: ['Action', 'Adventure', 'Fantasy', 'Shounen'],
    sourceName: 'WeebCentral',
    provider: 'weebcentral',
  },
  {
    id: 'wc:01J76XY7EF75DJNQCV04HTPDZK',
    title: 'Berserk',
    coverUrl: 'https://uploads.mangadex.org/covers/dc332d04-d3b0-413c-a767-70f5e451b031/21c2aa50-53d2-4924-881b-826b9a1bca3b.jpg.512.jpg',
    status: 'Ongoing',
    score: '9.5',
    year: '1989',
    author: 'Kentaro Miura',
    description: 'Guts, known as the Black Swordsman, seeks sanctuary from demonic forces that pursue him and vengeance against the man who branded him an unholy sacrifice.',
    tags: ['Action', 'Dark Fantasy', 'Horror', 'Seinen'],
    sourceName: 'WeebCentral',
    provider: 'weebcentral',
  },
  {
    id: 'wc:01J76XYCRVY3QGYAMRR3STW941',
    title: 'Chainsaw Man',
    coverUrl: 'https://uploads.mangadex.org/covers/e896c48c-3150-437d-ba57-d8567eb399ae/fa06e4e4-ef2a-477b-bfb6-a2a88793620b.jpg.512.jpg',
    status: 'Ongoing',
    score: '8.9',
    year: '2018',
    author: 'Tatsuki Fujimoto',
    description: 'Denji is a young man living in poverty with his chainsaw demon Pochita, until an unholy union transforms him into Chainsaw Man!',
    tags: ['Action', 'Supernatural', 'Gore', 'Shounen'],
    sourceName: 'WeebCentral',
    provider: 'weebcentral',
  },
  {
    id: 'wc:01J76XYCERXE60T7FKXVCCAQ0H',
    title: 'Jujutsu Kaisen',
    coverUrl: 'https://uploads.mangadex.org/covers/c52b2ce3-7f95-469c-96b0-479524fb7a1a/6d9134b2-21ea-4d02-ac2b-7c0d1c6a2aaa.jpg.512.jpg',
    status: 'Completed',
    score: '8.8',
    year: '2018',
    author: 'Gege Akutami',
    description: 'Yuji Itadori swallows a cursed talisman—the finger of Ryomen Sukuna—and becomes caught in the deadly world of Jujutsu Sorcerers.',
    tags: ['Action', 'Supernatural', 'Dark Fantasy'],
    sourceName: 'WeebCentral',
    provider: 'weebcentral',
  },
  {
    id: 'wc:01J76XYBNEJ5EGK9ZEP3YS0PMH',
    title: 'Boruto: Two Blue Vortex',
    coverUrl: 'https://uploads.mangadex.org/covers/0b094aab-0cfb-4837-a49b-7267bdb86bec/baf472db-4658-46fb-8130-d4abdd43f171.jpg.512.jpg',
    status: 'Ongoing',
    score: '8.7',
    year: '2023',
    author: 'Masashi Kishimoto',
    description: 'Three years have passed since the fateful memory distortion. Boruto Uzumaki returns as a rogue warrior facing Omnipotence.',
    tags: ['Action', 'Ninja', 'Shounen'],
    sourceName: 'WeebCentral',
    provider: 'weebcentral',
  },
  {
    id: 'wc:01J76XYGGM22WZP7T4TKA4ZFAF',
    title: 'Kagurabachi',
    coverUrl: 'https://uploads.mangadex.org/covers/d65c0332-3764-4c89-84bd-b1a4e7278ad7/3edb80b9-dae6-4483-984d-2e7f8b02b702.jpg.512.jpg',
    status: 'Ongoing',
    score: '8.9',
    year: '2023',
    author: 'Takeru Hokazono',
    description: 'Chihiro spends his days training under his swordsmith father until tragedy strikes. Armed with an enchanted katana, his quest for vengeance begins.',
    tags: ['Action', 'Supernatural', 'Swordplay'],
    sourceName: 'WeebCentral',
    provider: 'weebcentral',
  },
];

// Helper for fetch with timeout to prevent Vercel 10s hang
async function fetchWithTimeout(url, options = {}, timeoutMs = 4000) {
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
 * Fetch Popular / Trending Manga with resilient catalog fallback
 */
export async function getPopularManga() {
  const cached = getCached('popular_manga_v5');
  if (cached && Array.isArray(cached) && cached.length > 0) return cached;

  // Build baseline list from featured masterpieces and webtoon catalog
  const seen = new Set();
  const baseList = [];

  // 1. Featured manga
  FEATURED_MANGA.forEach((feat) => {
    if (!seen.has(feat.id)) {
      seen.add(feat.id);
      baseList.push({
        ...feat,
        englishTitle: feat.englishTitle || null,
        sourceName: feat.sourceName || 'MangaPill',
        provider: 'mangapill',
      });
    }
  });

  // 2. Webtoons & Manhwa catalog (Stepmother, Fortune Telling Princess, Solo Leveling, ORV)
  WEBTOON_CATALOG.forEach((wt) => {
    if (!seen.has(wt.id)) {
      seen.add(wt.id);
      baseList.push({
        id: wt.id,
        title: wt.title,
        englishTitle: wt.englishTitle || null,
        coverUrl: wt.coverUrl,
        status: wt.status,
        author: wt.author,
        score: wt.score,
        year: wt.year,
        tags: wt.tags,
        description: wt.description,
        sourceName: 'Webtoon',
        provider: 'webtoon',
      });
    }
  });

  try {
    const [wcList, dexList, asuraList, vortexList, mkList, scrapedList] = await Promise.all([
      getPopularWeebCentral(16).catch(() => []),
      getPopularMangaDex(12).catch(() => []),
      getPopularAsura().catch(() => []),
      getPopularVortex().catch(() => []),
      getPopularMangaKakalot().catch(() => []),
      (async () => {
        try {
          const res = await fetchWithTimeout(BASE_URL, { headers: HEADERS }, 3500);
          if (!res.ok) return [];
          const html = await res.text();
          const homeCardRegex = /<img\s+(?:data-)?src="([^"]+)"\s+alt="([^"]+)"[\s\S]*?<a\s+href="\/manga\/([0-9]+\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
          let m;
          const list = [];
          while ((m = homeCardRegex.exec(html)) !== null) {
            const coverUrl = m[1];
            const id = m[3];
            const innerA = m[4];
            if (seen.has(id)) continue;
            seen.add(id);
            const divs = [...innerA.matchAll(/<div[^>]*>([\s\S]*?)<\/div>/gi)].map((d) => d[1].replace(/<[^>]+>/g, '').trim());
            const rawTitle = divs[0] || '';
            const rawEnglish = divs.length > 1 ? divs[1] : null;
            list.push({
              id,
              title: cleanTitle(rawTitle),
              englishTitle: rawEnglish ? cleanTitle(rawEnglish) : null,
              coverUrl,
              status: 'Ongoing',
              author: 'Manga Artist',
              tags: ['Manga', 'Trending'],
              sourceName: 'MangaPill',
              provider: 'mangapill',
            });
          }
          return list;
        } catch {
          return [];
        }
      })(),
    ]);

    const merged = [...baseList, ...wcList.slice(0, 16), ...dexList.slice(0, 10), ...asuraList.slice(0, 8), ...vortexList.slice(0, 8), ...mkList.slice(0, 10), ...scrapedList];
    setCache('popular_manga_v5', merged);
    return merged;
  } catch (error) {
    console.warn('getPopularManga upstream warning, returning instant catalog:', error.message);
    setCache('popular_manga_v5', baseList);
    return baseList;
  }
}

/**
 * Search Manga & Webtoons across prioritized sources
 * Ranked strictly by chapter completeness:
 * 1. WeebCentral (complete scanlation archives from Ch. 1, 15,000+ titles)
 * 2. MangaDex (official & community scanlations with full chapters)
 * 3. MangaKakalot / KakaManga (deep back-catalog for classic/completed series)
 * 4. Asura Scans (fastest manhwa/manhua weekly chapters)
 * 5. Vortex Scans (high-speed manhwa/manhua scanlations)
 * 6. Webtoon (high-res verified color catalog)
 * 7. MangaPill (clean mirror fallback)
 */
export async function searchManga(query = '') {
  if (!query || !query.trim()) return getPopularManga();

  const cacheKey = `search_v7_${query.trim().toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const [
      weebCentralMatches,
      dexMatches,
      mkMatches,
      asuraMatches,
      vortexMatches,
      webtoonMatches,
      mangapillMatches
    ] = await Promise.all([
      searchWeebCentral(query).catch((e) => {
        console.error('searchWeebCentral error:', e.message);
        return [];
      }),
      searchMangaDex(query, 12).catch((e) => {
        console.error('searchMangaDex error:', e.message);
        return [];
      }),
      searchMangaKakalot(query).catch((e) => {
        console.error('searchMangaKakalot error:', e.message);
        return [];
      }),
      searchAsura(query).catch((e) => {
        console.error('searchAsura error:', e.message);
        return [];
      }),
      searchVortex(query).catch((e) => {
        console.error('searchVortex error:', e.message);
        return [];
      }),
      searchWebtoons(query).catch((e) => {
        console.error('searchWebtoons error:', e.message);
        return [];
      }),
      fetchMangaPillSearch(query).catch((e) => {
        console.error('fetchMangaPillSearch error:', e.message);
        return [];
      }),
    ]);

    const seen = new Set();
    const combined = [];

    // 1. WeebCentral matches (Ranked #1 for complete chapter scanlations)
    weebCentralMatches.forEach((item) => {
      if (!seen.has(item.id)) {
        combined.push({ ...item, sourceName: 'WeebCentral' });
        seen.add(item.id);
      }
    });

    // 2. MangaDex matches (Ranked #2 for official & high-quality scanlations)
    dexMatches.forEach((item) => {
      if (!seen.has(item.id)) {
        combined.push({ ...item, sourceName: 'MangaDex' });
        seen.add(item.id);
      }
    });

    // 3. MangaKakalot matches (Ranked #3 for extensive catalog)
    mkMatches.forEach((item) => {
      if (!seen.has(item.id)) {
        combined.push({ ...item, sourceName: 'MangaKakalot' });
        seen.add(item.id);
      }
    });

    // 4. Asura Scans matches (Ranked #4 for weekly manhwa)
    asuraMatches.forEach((item) => {
      if (!seen.has(item.id)) {
        combined.push({ ...item, sourceName: 'Asura Scans' });
        seen.add(item.id);
      }
    });

    // 5. Vortex Scans matches (Ranked #5 for manhwa/manhua)
    vortexMatches.forEach((item) => {
      if (!seen.has(item.id)) {
        combined.push({ ...item, sourceName: 'Vortex Scans' });
        seen.add(item.id);
      }
    });

    // 6. Webtoon curated catalog matches (Stepmother, Solo Leveling, ORV)
    webtoonMatches.forEach((item) => {
      if (!seen.has(item.id)) {
        combined.push({ ...item, sourceName: item.sourceName || 'Webtoon' });
        seen.add(item.id);
      }
    });

    // 7. MangaPill matches (Ranked #7 for fallback)
    mangapillMatches.forEach((item) => {
      if (!seen.has(item.id)) {
        combined.push({ ...item, sourceName: 'MangaPill' });
        seen.add(item.id);
      }
    });

    setCache(cacheKey, combined);
    return combined;
  } catch (error) {
    console.error('searchManga error:', error);
    return [];
  }
}

/**
 * Fetch Search Results from MangaPill
 */
async function fetchMangaPillSearch(query = '') {
  const url = `${BASE_URL}/search?q=${encodeURIComponent(query.trim())}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const searchCardRegex = /<a\s+href="\/manga\/([0-9]+\/[^"]+)"\s+class="relative block"[^>]*>[\s\S]*?<img\s+(?:data-)?src="([^"]+)"[\s\S]*?<a\s+href="\/manga\/\1"\s+class="mb-2">([\s\S]*?)<\/a>/gi;

  let m;
  const list = [];
  const seen = new Set();

  while ((m = searchCardRegex.exec(html)) !== null) {
    const id = m[1];
    const coverUrl = m[2];
    const innerTitleBlock = m[3];

    if (seen.has(id)) continue;
    seen.add(id);

    const divs = [...innerTitleBlock.matchAll(/<div[^>]*>([\s\S]*?)<\/div>/gi)].map((d) => d[1].replace(/<[^>]+>/g, '').trim());
    const rawTitle = divs[0] || '';
    const rawEnglish = divs.length > 1 ? divs[1] : null;

    const title = cleanTitle(rawTitle);
    const englishTitle = rawEnglish ? cleanTitle(rawEnglish) : null;

    list.push({
      id,
      title,
      englishTitle,
      coverUrl,
      status: 'Ongoing',
      author: 'Manga Artist',
      tags: ['Manga'],
      provider: 'mangapill',
    });
  }

  // Filter out noisy MangaPill matches that only matched stop words like "The"
  const stopWords = new Set(['the', 'a', 'an', 'her', 'his', 'of', 'in', 'to', 'for', 's']);
  const queryTokens = query.toLowerCase().replace(/['’"”`]/g, '').split(/\s+/).filter((t) => !stopWords.has(t) && t.length > 1);

  if (queryTokens.length > 0) {
    return list.filter((item) => {
      const t = (item.title + ' ' + (item.englishTitle || '')).toLowerCase().replace(/['’"”`]/g, '');
      return queryTokens.some((tok) => t.includes(tok));
    });
  }

  return list;
}

async function resolveAvailableSources(title, currentId, currentSourceName, currentTotalChapters) {
  const sources = [
    {
      id: currentId,
      sourceName: currentSourceName || 'Primary',
      totalChapters: currentTotalChapters || 0,
      isCurrent: true,
    }
  ];

  if (!title) return sources;

  const cacheKey = `avail_src_${title.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const cached = getCached(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached.map(s => ({ ...s, isCurrent: s.id === currentId }));
  }

  try {
    const clean = title.replace(/[^\w\s]/gi, ' ').trim();
    if (!clean || clean.length < 2) return sources;

    const [wc, md, mk] = await Promise.all([
      searchWeebCentral(clean).catch(() => []),
      searchMangaDex(clean, 4).catch(() => []),
      searchMangaKakalot(clean).catch(() => []),
    ]);

    const targetLower = clean.toLowerCase();
    const seenSources = new Set([sources[0].sourceName]);

    const addIfMatch = (item) => {
      if (!item || !item.id || item.id === currentId) return;
      if (seenSources.has(item.sourceName)) return;
      const tLower = (item.title || '').toLowerCase();
      const engLower = (item.englishTitle || '').toLowerCase();
      if (
        tLower.includes(targetLower) ||
        targetLower.includes(tLower) ||
        (engLower && (engLower.includes(targetLower) || targetLower.includes(engLower)))
      ) {
        seenSources.add(item.sourceName);
        sources.push({
          id: item.id,
          sourceName: item.sourceName,
          totalChapters: item.totalChapters || null,
          isCurrent: false,
        });
      }
    };

    wc.slice(0, 3).forEach(addIfMatch);
    md.slice(0, 3).forEach(addIfMatch);
    mk.slice(0, 3).forEach(addIfMatch);

    setCache(cacheKey, sources);
  } catch {}

  return sources;
}

/**
 * Get Manga Details & Complete Chapters List
 */
export async function getMangaDetails(mangaId, bypassCache = false) {
  if (!mangaId) return null;

  // Direct alias resolution for Stepmother Second Life across all source prefixes
  if (
    mangaId === 'webtoon:stepmother-second-life' ||
    mangaId === 'webtoon:the-step-mothers-began-her-second-life' ||
    mangaId.includes('step-mother') ||
    mangaId.includes('stepmother')
  ) {
    const details = await getWebtoonDetails('webtoon:stepmother-second-life', bypassCache);
    if (details) {
      const uniqueChapters = deduplicateChapters(details.chapters || []);
      const sources = await resolveAvailableSources(details.englishTitle || details.title, mangaId, 'Webtoon', uniqueChapters.length);
      return {
        ...details,
        id: mangaId,
        aliasId: 'webtoon:stepmother-second-life',
        chapters: uniqueChapters,
        totalChapters: uniqueChapters.length,
        availableSources: sources,
      };
    }
  }

  // Direct alias resolution for top series with verified 1000+ unskipped chapter archives
  const VERIFIED_COMPLETE_ALIASES = {
    '2/one-piece': 'wc:01J76XY7E9FNDZ1DBBM6PBJPFK',
    '1/berserk': 'wc:01J76XY7EF75DJNQCV04HTPDZK',
    '723/chainsaw-man': 'wc:01J76XYCRVY3QGYAMRR3STW941',
    '2085/jujutsu-kaisen': 'wc:01J76XYCERXE60T7FKXVCCAQ0H',
    '7486/boruto-two-blue-vortex': 'wc:01J76XYBNEJ5EGK9ZEP3YS0PMH',
    '7529/kagurabachi': 'wc:01J76XYGGM22WZP7T4TKA4ZFAF',
  };

  const lookupId = VERIFIED_COMPLETE_ALIASES[mangaId] || mangaId;

  let resolvedDetails = null;

  if (lookupId.startsWith('md:') || lookupId.startsWith('mangadex:')) {
    resolvedDetails = await getMangaDexDetails(lookupId, bypassCache);
  } else if (lookupId.startsWith('asura:')) {
    resolvedDetails = await getAsuraDetails(lookupId);
  } else if (lookupId.startsWith('vortex:')) {
    resolvedDetails = await getVortexDetails(lookupId);
  } else if (lookupId.startsWith('webtoon:')) {
    resolvedDetails = await getWebtoonDetails(lookupId, bypassCache);
  } else if (lookupId.startsWith('wc:')) {
    resolvedDetails = await getWeebCentralDetails(lookupId.replace('wc:', ''), '', bypassCache);
  } else if (lookupId.startsWith('mk:')) {
    resolvedDetails = await getMangaKakalotDetails(lookupId, bypassCache);
  }

  if (resolvedDetails) {
    if (Array.isArray(resolvedDetails.chapters)) {
      resolvedDetails.chapters = deduplicateChapters(resolvedDetails.chapters);
      resolvedDetails.totalChapters = resolvedDetails.chapters.length;
    }
    resolvedDetails.availableSources = await resolveAvailableSources(
      resolvedDetails.englishTitle || resolvedDetails.title,
      resolvedDetails.id,
      resolvedDetails.sourceName,
      resolvedDetails.totalChapters
    );
    return {
      ...resolvedDetails,
      id: mangaId, // preserve requested ID for frontend consistency
      aliasId: lookupId !== mangaId ? lookupId : undefined,
    };
  }

  const cacheKey = `details_v4_${mangaId}`;
  if (!bypassCache) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  try {
    const url = `${BASE_URL}/manga/${mangaId}`;
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 4000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // Extract Title
    const titleMatch = html.match(/<h1[^>]*class="[^"]*font-bold[^"]*"[^>]*>([\s\S]*?)<\/h1>/i);
    let title = titleMatch ? titleMatch[1].trim() : mangaId.split('/')[1] || 'Manga';
    title = cleanTitle(title);

    // Extract English Title if provided
    const subMatch = html.match(/<h1[^>]*>[\s\S]*?<\/h1>\s*(?:<!--[\s\S]*?-->\s*)*<div class="text-sm text-secondary">([\s\S]*?)<\/div>/i);
    const englishTitle = subMatch ? cleanTitle(subMatch[1].trim()) : null;

    // Extract Cover with proxy to prevent 403 Forbidden
    const coverMatch = html.match(/<img[^>]+data-src="([^"]+)"/i) || html.match(/<img[^>]+src="([^"]+)"/i);
    const rawCover = coverMatch ? coverMatch[1] : '';
    const coverUrl = rawCover ? `/api/image-proxy?url=${encodeURIComponent(rawCover)}` : '';

    // Extract Synopsis (matches text-sm or text--secondary)
    const synMatch = html.match(/<p\s+class="[^"]*text-sm[^"]*"[^>]*>([\s\S]*?)<\/p>/i) || html.match(/<p\s+class="[^"]*text--secondary[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
    const description = synMatch ? decodeHtml(synMatch[1].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim()) : 'No synopsis available.';

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
      const numMatch = titleAttr.match(/(?:Chapter|Episode|Ch\.?|Ep\.?)\s*([0-9.]+)/i)
        || titleAttr.match(/([0-9.]+)/);
      const chapterNum = numMatch ? numMatch[1] : titleAttr.replace(/Chapter/i, '').trim();

      // Check for time tag inside inner content
      const timeMatch = chM[3].match(/datetime="([^"]+)"/i);
      const publishedAt = timeMatch ? timeMatch[1] : null;

      chapters.push({
        id: chapterId,
        chapter: chapterNum || 'Special',
        title: titleAttr,
        publishedAt,
      });
    }

    // Ensure chapters are unique and sorted descending
    const dedupedChapters = deduplicateChapters(chapters);

    const sources = await resolveAvailableSources(englishTitle || title, mangaId, 'MangaPill', dedupedChapters.length);

    const result = {
      id: mangaId,
      title,
      englishTitle,
      coverUrl,
      description,
      status,
      type,
      year,
      tags: genres.length > 0 ? genres : ['Manga', 'Action'],
      chapters: dedupedChapters,
      totalChapters: dedupedChapters.length,
      availableSources: sources,
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.warn('getMangaDetails upstream warning:', error.message);
    
    // Proactively attempt fallback search on WeebCentral by title to retrieve full unskipped chapter archive
    try {
      const cleanIdTitle = cleanTitle(mangaId.split('/')[1] || mangaId);
      const wcMatches = await searchWeebCentral(cleanIdTitle);
      if (wcMatches && wcMatches.length > 0 && wcMatches[0].seriesId) {
        const wcDetails = await getWeebCentralDetails(wcMatches[0].seriesId, '', true);
        if (wcDetails && wcDetails.chapters && wcDetails.chapters.length > 0) {
          const deduped = deduplicateChapters(wcDetails.chapters);
          return {
            ...wcDetails,
            id: mangaId,
            aliasId: `wc:${wcMatches[0].seriesId}`,
            chapters: deduped,
            totalChapters: deduped.length,
          };
        }
      }
    } catch (fallbackErr) {
      console.warn('Fallback WeebCentral lookup failed:', fallbackErr.message);
    }

    // Return safe fallback object with sanitized title and SVG cover
    const cleanIdTitle = cleanTitle(mangaId.split('/')[1] || mangaId);
    return {
      id: mangaId,
      title: cleanIdTitle,
      englishTitle: cleanIdTitle,
      coverUrl: getFallbackCover(cleanIdTitle),
      description: `${cleanIdTitle} chapters and updates are being indexed. Check back shortly.`,
      status: 'Ongoing',
      author: 'Manga',
      tags: ['Manga', 'Ongoing'],
      chapters: [],
      totalChapters: 0,
    };
  }
}

/**
 * Get Complete Real Pages for a Chapter
 */
export async function getChapterPages(chapterId) {
  if (!chapterId) return { chapterId: '', totalPages: 0, pages: [] };

  if (
    chapterId.startsWith('webtoon:stepmother:') ||
    chapterId.includes('stepmother') ||
    chapterId.includes('step-mother')
  ) {
    const num = chapterId.match(/([0-9.]+)/)?.[1] || '1';
    return getWebtoonChapterPages(`webtoon:stepmother:${num}`);
  }

  if (chapterId.startsWith('md_ch:') || chapterId.startsWith('md:')) {
    return getMangaDexChapterPages(chapterId);
  }
  if (chapterId.startsWith('asura_ch:') || chapterId.startsWith('asura:')) {
    return getAsuraChapterPages(chapterId);
  }
  if (chapterId.startsWith('vortex_ch:') || chapterId.startsWith('vortex:')) {
    return getVortexChapterPages(chapterId);
  }
  if (chapterId.startsWith('webtoon:')) {
    return getWebtoonChapterPages(chapterId);
  }
  if (chapterId.startsWith('wc_ch:')) {
    return getWeebCentralChapterPages(chapterId.replace('wc_ch:', ''));
  }
  if (chapterId.startsWith('mk_ch:')) {
    return getMangaKakalotChapterPages(chapterId);
  }

  const cacheKey = `chapter_v3_${chapterId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/chapters/${chapterId}`;
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 4500);
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
    console.warn('getChapterPages warning, returning safe object:', error.message);
    return {
      chapterId,
      totalPages: 0,
      pages: [],
      warning: 'Chapter images are temporarily synchronizing. Please try another chapter.',
    };
  }
}

const FALLBACK_PAGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200" viewBox="0 0 800 1200">
  <rect width="800" height="1200" fill="#080a0f"/>
  <rect x="40" y="40" width="720" height="1120" rx="24" fill="#0d1117" stroke="#ffffff" stroke-opacity="0.08" stroke-width="2"/>
  <circle cx="400" cy="540" r="48" fill="#f43f5e" fill-opacity="0.12"/>
  <path d="M400 516v32M400 564h.01" stroke="#f43f5e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="400" y="628" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700">Chapter Page Reload Required</text>
  <text x="400" y="662" text-anchor="middle" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="14">Tap or click to refresh this manga page</text>
</svg>`;

/**
 * Strict SSRF & Pentest-proof URL Validator
 * Blocks loopback, RFC1918 private subnets, cloud metadata (169.254.169.254),
 * local domains, non-HTTP/S protocols, non-standard ports, and credential embedding.
 */
export function isValidProxyTarget(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  if (rawUrl.length > 2048) return false;
  // Reject null-bytes, newlines, or control characters safely
  for (let i = 0; i < rawUrl.length; i++) {
    const code = rawUrl.charCodeAt(i);
    if ((code >= 0 && code <= 31) || code === 127) return false;
  }

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  // Protocol must strictly be http: or https:
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return false;
  }

  // Reject credentials in URL
  if (parsed.username || parsed.password) {
    return false;
  }

  // Reject non-standard ports (only 80, 443, or empty allowed)
  if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase().trim();

  // Reject empty or local hostnames without domain
  if (!hostname || !hostname.includes('.')) {
    return false;
  }

  // Block localhost, .local, .internal, .lan, .corp, etc.
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan') ||
    hostname.endsWith('.corp') ||
    hostname.endsWith('.home') ||
    hostname.endsWith('.onion')
  ) {
    return false;
  }

  // IPv6 checks
  if (hostname.startsWith('[') || hostname.includes(':')) {
    const cleanIpv6 = hostname.replace(/[[\]]/g, '').toLowerCase();
    if (
      cleanIpv6 === '::1' ||
      cleanIpv6 === '::' ||
      cleanIpv6.startsWith('fe80:') ||
      cleanIpv6.startsWith('fc00:') ||
      cleanIpv6.startsWith('fd00:')
    ) {
      return false;
    }
  }

  // IPv4 & numeric checks (including octal, hex, decimal integer bypasses)
  if (/^\d+$/.test(hostname) || /^0x[0-9a-f]+$/i.test(hostname)) {
    return false;
  }

  const ipv4Regex = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
  const ipMatch = hostname.match(ipv4Regex);

  if (ipMatch) {
    const octets = [
      parseInt(ipMatch[1], 10),
      parseInt(ipMatch[2], 10),
      parseInt(ipMatch[3], 10),
      parseInt(ipMatch[4], 10),
    ];

    // 127.0.0.0/8 - Loopback
    if (octets[0] === 127) return false;
    // 0.0.0.0/8 - Current network
    if (octets[0] === 0) return false;
    // 10.0.0.0/8 - RFC 1918 Private
    if (octets[0] === 10) return false;
    // 172.16.0.0/12 - RFC 1918 Private (172.16.0.0 - 172.31.255.255)
    if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return false;
    // 192.168.0.0/16 - RFC 1918 Private
    if (octets[0] === 192 && octets[1] === 168) return false;
    // 169.254.0.0/16 - Link-local & Cloud Metadata (169.254.169.254)
    if (octets[0] === 169 && octets[1] === 254) return false;
    // 100.64.0.0/10 - Shared Address Space (Carrier-grade NAT)
    if (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127) return false;
    // Documentation / TEST-NET
    if (octets[0] === 192 && octets[1] === 0 && (octets[2] === 0 || octets[2] === 2)) return false;
    if (octets[0] === 198 && (octets[1] === 18 || octets[1] === 19 || octets[1] === 51)) return false;
    if (octets[0] === 203 && octets[1] === 0 && octets[2] === 113) return false;
    // 224.0.0.0/4 - Multicast
    if (octets[0] >= 224 && octets[0] <= 239) return false;
    // 240.0.0.0/4 - Reserved
    if (octets[0] >= 240) return false;
  }

  return true;
}

const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB DoS memory exhaustion cap

/**
 * Proxy Image with proper Referer to bypass CDN hotlink protection
 * Hardened with SSRF prevention, size caps, and security response headers
 */
export async function proxyImage(imageUrl, res) {
  if (!imageUrl || !isValidProxyTarget(imageUrl)) {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'");
      res.end(FALLBACK_PAGE_SVG);
    }
    return;
  }

  try {
    let primaryReferer = `${BASE_URL}/`;
    let parsedOrigin = '';
    try {
      const parsed = new URL(imageUrl);
      parsedOrigin = parsed.origin + '/';
      const host = parsed.hostname.toLowerCase();

      if (
        host.includes('kakamanga') ||
        host.includes('2xstorage') ||
        host.includes('mangakakalot') ||
        host.includes('chapmanganato')
      ) {
        primaryReferer = 'https://www.kakamanga.com/';
      } else if (
        host.includes('weebcentral') || 
        host.includes('planeptune') || 
        host.includes('compsci88') || 
        host.includes('lastation')
      ) {
        primaryReferer = 'https://weebcentral.com/';
      } else if (host.includes('asurascans') || host.includes('asuracomic')) {
        primaryReferer = 'https://asurascans.com/';
      } else if (host.includes('vortexscans')) {
        primaryReferer = 'https://vortexscans.org/';
      } else if (
        host.includes('omniscientreadersviewpoint') ||
        host.includes('lowee.us') ||
        host.includes('mangaclash')
      ) {
        primaryReferer = 'https://w1.omniscientreadersviewpoint.com/';
      } else if (host.includes('afortunetellingprincess')) {
        primaryReferer = 'https://afortunetellingprincess.com/';
      } else if (host.includes('readsololeveling')) {
        primaryReferer = 'https://readsololeveling.org/';
      } else if (host.includes('kingofshojo')) {
        primaryReferer = 'https://kingofshojo.com/';
      } else if (host.includes('mangadex') || host.includes('uploads.mangadex.org')) {
        primaryReferer = 'https://mangadex.org/';
      } else if (host.includes('mangapill') || host.includes('readdetectiveconan')) {
        primaryReferer = 'https://mangapill.com/';
      } else {
        primaryReferer = parsedOrigin;
      }
    } catch {}

    // Multi-candidate referer resolution
    const candidates = [
      primaryReferer,
      parsedOrigin,
      '',
    ].filter((v, idx, arr) => arr.indexOf(v) === idx);

    let finalRes = null;
    for (const ref of candidates) {
      try {
        const testRes = await fetchWithTimeout(imageUrl, {
          headers: {
            'User-Agent': USER_AGENT,
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            ...(ref ? { 'Referer': ref } : {}),
          },
        }, 6500);

        if (testRes.ok) {
          // Check content-length header to prevent memory exhaustion DoS
          const cl = parseInt(testRes.headers.get('content-length') || '0', 10);
          if (cl > MAX_IMAGE_SIZE_BYTES) {
            console.warn(`proxyImage rejected: size ${cl} exceeds ${MAX_IMAGE_SIZE_BYTES}`);
            break;
          }
          finalRes = testRes;
          break;
        }
      } catch {}
    }

    if (!finalRes || !finalRes.ok) {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=60');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'");
        res.end(FALLBACK_PAGE_SVG);
      }
      return;
    }

    const rawContentType = finalRes.headers.get('content-type') || 'image/jpeg';
    // Reject non-image responses (e.g. text/html or scripts)
    const lowerCt = rawContentType.toLowerCase();
    if (
      lowerCt.includes('text/html') || 
      lowerCt.includes('javascript') || 
      lowerCt.includes('application/json')
    ) {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=60');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.end(FALLBACK_PAGE_SVG);
      }
      return;
    }

    const contentType = lowerCt.startsWith('image/') ? rawContentType : 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'");

    const buffer = await finalRes.arrayBuffer();
    if (buffer.byteLength > MAX_IMAGE_SIZE_BYTES) {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.end(FALLBACK_PAGE_SVG);
      }
      return;
    }

    res.end(Buffer.from(buffer));
  } catch (err) {
    console.warn('proxyImage fetch warning:', err.message);
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(FALLBACK_PAGE_SVG);
    }
  }
}

/**
 * Get Recommendations & Suggestions based on manga genres and categories
 */
export async function getMangaRecommendations(currentId = '', genres = [], limit = 8) {
  try {
    const cleanId = String(currentId).toLowerCase();
    const dexRecs = await getMangaDexRecommendations(genres, limit + 2);
    
    // Also consider catalog webtoons if genre matches
    const catalogMatches = WEBTOON_CATALOG
      .filter(w => String(w.id).toLowerCase() !== cleanId)
      .map(w => ({
        id: w.id,
        title: w.title,
        englishTitle: w.englishTitle || null,
        coverUrl: w.coverUrl,
        genres: w.tags || ['Webtoon'],
        rating: '4.9',
        sourceName: 'Webtoon',
      }));

    const combined = [];
    const seen = new Set();
    if (cleanId) seen.add(cleanId);

    // Prioritize high-quality MangaDex recommendations
    dexRecs.forEach(item => {
      const lower = String(item.id).toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        combined.push(item);
      }
    });

    // Add catalog recommendations
    catalogMatches.forEach(item => {
      const lower = String(item.id).toLowerCase();
      if (!seen.has(lower) && combined.length < limit) {
        seen.add(lower);
        combined.push(item);
      }
    });

    // Fallback to featured manga if still low
    if (combined.length < limit) {
      FEATURED_MANGA.forEach(item => {
        const lower = String(item.id).toLowerCase();
        if (!seen.has(lower) && combined.length < limit) {
          seen.add(lower);
          combined.push(item);
        }
      });
    }

    return combined.slice(0, limit);
  } catch (err) {
    console.warn('getMangaRecommendations error:', err.message);
    return FEATURED_MANGA.slice(0, limit);
  }
}
