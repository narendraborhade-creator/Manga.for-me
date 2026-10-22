import { 
  searchWebtoons, 
  getWebtoonDetails, 
  getWebtoonChapterPages, 
  WEBTOON_CATALOG 
} from './webtoonProvider.js';
import {
  searchWeebCentral,
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

function decodeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function cleanTitle(raw) {
  if (!raw) return 'Manga';
  let t = raw
    .replace(/Chapter\s+[0-9.]+/i, '')
    .replace(/\s+manga$/i, '')
    .trim();
  const words = t.split(/\s+/);
  const half = Math.floor(words.length / 2);
  if (words.length >= 2 && words.length % 2 === 0) {
    const firstHalf = words.slice(0, half).join(' ');
    const secondHalf = words.slice(half).join(' ');
    if (firstHalf.toLowerCase() === secondHalf.toLowerCase()) {
      t = firstHalf;
    }
  }
  return decodeHtml(t);
}

// Curated Top Masterpieces for Spotlight with verified high-res artwork
export const FEATURED_MANGA = [
  {
    id: '2/one-piece',
    title: 'One Piece',
    coverUrl: 'https://uploads.mangadex.org/covers/a1c7c817-4e59-43b7-9365-09675a149a6f/2f4aca53-64c7-46ac-ae85-3bc9b3169890.png.512.jpg',
    status: 'Ongoing',
    score: '9.3',
    year: '1997',
    author: 'Eiichiro Oda',
    description: 'Gol D. Roger was known as the "Pirate King", the strongest and most infamous being to have sailed the Grand Line. Monkey D. Luffy sets sail in search of the legendary One Piece treasure!',
    tags: ['Action', 'Adventure', 'Fantasy', 'Shounen'],
  },
  {
    id: '1/berserk',
    title: 'Berserk',
    coverUrl: 'https://uploads.mangadex.org/covers/dc332d04-d3b0-413c-a767-70f5e451b031/21c2aa50-53d2-4924-881b-826b9a1bca3b.jpg.512.jpg',
    status: 'Ongoing',
    score: '9.5',
    year: '1989',
    author: 'Kentaro Miura',
    description: 'Guts, known as the Black Swordsman, seeks sanctuary from demonic forces that pursue him and vengeance against the man who branded him an unholy sacrifice.',
    tags: ['Action', 'Dark Fantasy', 'Horror', 'Seinen'],
  },
  {
    id: '723/chainsaw-man',
    title: 'Chainsaw Man',
    coverUrl: 'https://uploads.mangadex.org/covers/e896c48c-3150-437d-ba57-d8567eb399ae/fa06e4e4-ef2a-477b-bfb6-a2a88793620b.jpg.512.jpg',
    status: 'Ongoing',
    score: '8.9',
    year: '2018',
    author: 'Tatsuki Fujimoto',
    description: 'Denji is a young man living in poverty with his chainsaw demon Pochita, until an unholy union transforms him into Chainsaw Man!',
    tags: ['Action', 'Supernatural', 'Gore', 'Shounen'],
  },
  {
    id: '2085/jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    coverUrl: 'https://uploads.mangadex.org/covers/c52b2ce3-7f95-469c-96b0-479524fb7a1a/6d9134b2-21ea-4d02-ac2b-7c0d1c6a2aaa.jpg.512.jpg',
    status: 'Completed',
    score: '8.8',
    year: '2018',
    author: 'Gege Akutami',
    description: 'Yuji Itadori swallows a cursed talisman—the finger of Ryomen Sukuna—and becomes caught in the deadly world of Jujutsu Sorcerers.',
    tags: ['Action', 'Supernatural', 'Dark Fantasy'],
  },
  {
    id: '7486/boruto-two-blue-vortex',
    title: 'Boruto: Two Blue Vortex',
    coverUrl: 'https://uploads.mangadex.org/covers/0b094aab-0cfb-4837-a49b-7267bdb86bec/baf472db-4658-46fb-8130-d4abdd43f171.jpg.512.jpg',
    status: 'Ongoing',
    score: '8.7',
    year: '2023',
    author: 'Masashi Kishimoto',
    description: 'Three years have passed since the fateful memory distortion. Boruto Uzumaki returns as a rogue warrior facing Omnipotence.',
    tags: ['Action', 'Ninja', 'Shounen'],
  },
  {
    id: '7529/kagurabachi',
    title: 'Kagurabachi',
    coverUrl: 'https://uploads.mangadex.org/covers/d65c0332-3764-4c89-84bd-b1a4e7278ad7/3edb80b9-dae6-4483-984d-2e7f8b02b702.jpg.512.jpg',
    status: 'Ongoing',
    score: '8.9',
    year: '2023',
    author: 'Takeru Hokazono',
    description: 'Chihiro spends his days training under his swordsmith father until tragedy strikes. Armed with an enchanted katana, his quest for vengeance begins.',
    tags: ['Action', 'Supernatural', 'Swordplay'],
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
    const [dexList, asuraList, vortexList, scrapedList] = await Promise.all([
      getPopularMangaDex(12).catch(() => []),
      getPopularAsura().catch(() => []),
      getPopularVortex().catch(() => []),
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

    const merged = [...baseList, ...dexList.slice(0, 10), ...asuraList.slice(0, 8), ...vortexList.slice(0, 8), ...scrapedList];
    setCache('popular_manga_v5', merged);
    return merged;
  } catch (error) {
    console.warn('getPopularManga upstream warning, returning instant catalog:', error.message);
    setCache('popular_manga_v5', baseList);
    return baseList;
  }
}

/**
 * Search Manga & Webtoons across multiple sources
 */
export async function searchManga(query = '') {
  if (!query || !query.trim()) return getPopularManga();

  const cacheKey = `search_v6_${query.trim().toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    // Run MangaDex, Webtoon provider, Asura Scans, Vortex Scans, WeebCentral, and MangaPill in parallel
    const [dexMatches, webtoonMatches, asuraMatches, vortexMatches, weebCentralMatches, mangapillMatches] = await Promise.all([
      searchMangaDex(query, 12).catch((e) => {
        console.error('searchMangaDex error:', e);
        return [];
      }),
      searchWebtoons(query).catch((e) => {
        console.error('searchWebtoons error:', e);
        return [];
      }),
      searchAsura(query).catch((e) => {
        console.error('searchAsura error:', e);
        return [];
      }),
      searchVortex(query).catch((e) => {
        console.error('searchVortex error:', e);
        return [];
      }),
      searchWeebCentral(query).catch((e) => {
        console.error('searchWeebCentral error:', e);
        return [];
      }),
      fetchMangaPillSearch(query).catch((e) => {
        console.error('fetchMangaPillSearch error:', e);
        return [];
      }),
    ]);

    const seen = new Set();
    const combined = [];

    // 1. MangaDex matches (flagship Keiyoushi source)
    dexMatches.forEach((item) => {
      if (!seen.has(item.id)) {
        combined.push({ ...item, sourceName: 'MangaDex' });
        seen.add(item.id);
      }
    });

    // 2. Webtoon curated catalog matches (Stepmother, Solo Leveling, ORV)
    webtoonMatches.forEach((item) => {
      if (!seen.has(item.id)) {
        combined.push({ ...item, sourceName: item.sourceName || 'Webtoon' });
        seen.add(item.id);
      }
    });

    // 3. Asura Scans matches (hundreds of top manhwa)
    asuraMatches.forEach((item) => {
      if (!seen.has(item.id)) {
        combined.push({ ...item, sourceName: 'Asura Scans' });
        seen.add(item.id);
      }
    });

    // 4. Vortex Scans matches (high-demand action/fantasy manhwa)
    vortexMatches.forEach((item) => {
      if (!seen.has(item.id)) {
        combined.push({ ...item, sourceName: 'Vortex Scans' });
        seen.add(item.id);
      }
    });

    // 5. WeebCentral matches
    weebCentralMatches.forEach((item) => {
      if (!seen.has(item.id)) {
        combined.push({ ...item, sourceName: 'WeebCentral' });
        seen.add(item.id);
      }
    });

    // 6. MangaPill matches
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
      return {
        ...details,
        id: mangaId,
        aliasId: 'webtoon:stepmother-second-life',
      };
    }
  }

  if (mangaId.startsWith('md:') || mangaId.startsWith('mangadex:')) {
    return getMangaDexDetails(mangaId, bypassCache);
  }
  if (mangaId.startsWith('asura:')) {
    return getAsuraDetails(mangaId);
  }
  if (mangaId.startsWith('vortex:')) {
    return getVortexDetails(mangaId);
  }
  if (mangaId.startsWith('webtoon:')) {
    return getWebtoonDetails(mangaId, bypassCache);
  }
  if (mangaId.startsWith('wc:')) {
    return getWeebCentralDetails(mangaId.replace('wc:', ''), '', bypassCache);
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

    // Ensure chapters are sorted descending (latest chapter first)
    chapters.sort((a, b) => {
      const numA = parseFloat(a.chapter);
      const numB = parseFloat(b.chapter);
      if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
      return 0;
    });

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
      chapters,
      totalChapters: chapters.length,
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.warn('getMangaDetails upstream warning:', error.message);
    
    // Check Featured Manga fallback
    const feat = FEATURED_MANGA.find((f) => f.id === mangaId);
    if (feat) {
      const chapters = [];
      for (let i = 25; i >= 1; i--) {
        chapters.push({
          id: `${mangaId}-100${i}000/chapter-${i}`,
          chapter: String(i),
          title: `Chapter ${i}`,
        });
      }
      return {
        ...feat,
        chapters,
        totalChapters: chapters.length,
      };
    }

    // Return safe fallback object
    const cleanIdTitle = cleanTitle(mangaId.split('/')[1] || mangaId);
    return {
      id: mangaId,
      title: cleanIdTitle,
      englishTitle: cleanIdTitle,
      coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
      description: 'Manga information is loading from backup archives.',
      status: 'Ongoing',
      tags: ['Manga'],
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

/**
 * Proxy Image with proper Referer to bypass CDN hotlink protection
 */
export async function proxyImage(imageUrl, res) {
  if (!imageUrl) {
    if (!res.headersSent) {
      res.writeHead(302, { Location: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80' });
      res.end();
    }
    return;
  }

  try {
    let referer = `${BASE_URL}/`;
    try {
      const parsed = new URL(imageUrl);
      const host = parsed.hostname.toLowerCase();
      if (
        host.includes('weebcentral') || 
        host.includes('planeptune') || 
        host.includes('compsci88') || 
        host.includes('lastation')
      ) {
        referer = 'https://weebcentral.com/';
      } else if (host.includes('asurascans') || host.includes('asuracomic')) {
        referer = 'https://asurascans.com/';
      } else if (host.includes('vortexscans')) {
        referer = 'https://vortexscans.org/';
      } else if (
        host.includes('omniscientreadersviewpoint') ||
        host.includes('lowee.us') ||
        host.includes('mangaclash')
      ) {
        referer = 'https://w1.omniscientreadersviewpoint.com/';
      } else if (host.includes('afortunetellingprincess')) {
        referer = 'https://afortunetellingprincess.com/';
      } else if (host.includes('readsololeveling')) {
        referer = 'https://readsololeveling.org/';
      } else if (host.includes('kingofshojo')) {
        referer = 'https://kingofshojo.com/';
      } else if (host.includes('mangadex') || host.includes('uploads.mangadex.org')) {
        referer = 'https://mangadex.org/';
      } else if (host.includes('mangapill') || host.includes('readdetectiveconan')) {
        referer = 'https://mangapill.com/';
      } else {
        referer = parsed.origin + '/';
      }
    } catch {}

    const response = await fetchWithTimeout(imageUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': referer,
      },
    }, 5500);

    if (!response.ok) {
      res.writeHead(302, { Location: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80' });
      res.end();
      return;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');

    const buffer = await response.arrayBuffer();
    res.end(Buffer.from(buffer));
  } catch (err) {
    console.warn('proxyImage redirecting to placeholder:', err.message);
    if (!res.headersSent) {
      res.writeHead(302, { Location: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80' });
      res.end();
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
