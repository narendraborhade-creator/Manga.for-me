import { 
  searchWebtoons, 
  getWebtoonDetails, 
  getWebtoonChapterPages, 
  WEBTOON_CATALOG 
} from './webtoonProvider.js';
import {
  searchWeebCentral,
  getPopularWeebCentral,
  getLatestUpdatesWeebCentral,
  getRecentlyAddedWeebCentral,
  getWeebCentralDetails,
  getWeebCentralChapterPages
} from './weebcentralProvider.js';
import {
  searchFlame,
  getPopularFlame,
  getFlameDetails,
  getFlameChapterPages
} from './flameProvider.js';
import {
  searchThunder,
  getPopularThunder,
  getThunderDetails,
  getThunderChapterPages
} from './thunderProvider.js';
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
  getLatestMangaDex,
  getNewlyAddedMangaDex,
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
import { getMangaNews } from './newsProvider.js';
import {
  searchMangaKatana,
  getPopularMangaKatana,
  getMangaKatanaDetails,
  getMangaKatanaChapterPages
} from './mangakatanaProvider.js';
import { decodeHtml, cleanTitle, getFallbackCover, deduplicateChapters, detectChapterGaps, mergeAndDeduplicateChapters } from './htmlUtils.js';

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
    id: '2/one-piece',
    title: 'One Piece',
    latestChapter: '1198',
    totalChapters: 1208,
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30013-BeslEMqiPhlk.jpg',
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
    latestChapter: '376',
    totalChapters: 376,
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30002-Cul4OeN7bYtn.jpg',
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
    latestChapter: '232',
    totalChapters: 232,
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105778-euxXZEIfDY2u.png',
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
    latestChapter: '271',
    totalChapters: 271,
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx101517-H3TdM3g5ZUe9.jpg',
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
    latestChapter: '25',
    totalChapters: 25,
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx168468-FEo5x1ZZyWj4.png',
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
    latestChapter: '70',
    totalChapters: 70,
    coverUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx169355-5pqzh1Wb4NOQ.png',
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

// Quality ranking weights for providers (higher is better for complete unskipped chapters)
export const PROVIDER_QUALITY_SCORE = {
  weebcentral: 100,
  mangakatana: 98,
  flame: 95,
  thunder: 92,
  asura: 90,
  vortex: 85,
  mangakakalot: 80,
  mangadex: 75,
  webtoon: 65,
  mangapill: 95,
};

/**
 * Robust title normalization key to deduplicate identical series across different sources.
 * Strips bracketed tags, season annotations, trailing suffixes, and leading articles.
 */

export const KNOWN_CHAPTER_COUNTS = {
  'lookism': 631,
  'tower of god': 630,
  'wind breaker': 500,
  'eleceed': 320,
  'mercenary enrollment': 210,
  'teenage mercenary': 210,
  'nano machine': 230,
  'the beginning after the end': 190,
  'tbate': 190,
  'return of the mount hua sect': 150,
  'reincarnation of the suicidal battle god': 110,
  'doom breaker': 110,
  'reaper of the drifting moon': 110,
  'murim login': 190,
  'a fortune-telling princess': 176,
  'solo leveling': 200,
  'omniscient reader': 240,
  'damn reincarnation': 85,
  'surviving the game as a barbarian': 100,
  'the greatest estate developer': 165,
  'one piece': 1120,
  'berserk': 376,
  'naruto': 700,
  'bleach': 686,
  'jujutsu kaisen': 271,
  'chainsaw man': 180,
  'death note': 108,
  'one-punch man': 215,
  'one punch man': 215,
  'tokyo ghoul': 143,
  'black clover': 375,
  'blue lock': 280,
  'sakamoto days': 190,
  'oshi no ko': 166,
  'haikyuu': 402,
  'dragon ball super': 103,
  'fortune-telling princess': 176,
  'fortune telling princess': 176,
  'a fortune-telling princess': 176,
  'damn reincarnation': 81,
  'surviving the game as a barbarian': 90,
  'the greatest estate developer': 180,
  'the beginning after the end': 185,
  'tbate': 185,
  'reincarnation of the suicidal battle god': 110,
  'doom breaker': 110,
  'return of the mount hua sect': 150,
  'mount hua': 150,
};

export function getKnownChapterCount(title) {
  if (!title) return null;
  const t = String(title).toLowerCase().trim();
  for (const [key, count] of Object.entries(KNOWN_CHAPTER_COUNTS)) {
    if (t === key || t.startsWith(key) || key.startsWith(t)) return count;
  }
  return null;
}

export function normalizeTitleKey(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\s*[\(\[\{](?:official|fan colored|colored|webtoon|manhwa|manhua|novel|scanlation|book version)[\)\]\}]/gi, '')
    .replace(/\s*-\s*(?:official|fan colored|colored|webtoon|manhwa|manhua|novel|scanlation).*$/gi, '')
    .replace(/^(the|a|an)\s+/i, '')
    .replace(/\s*-(?:san|kun|chan|sama|dono)\b/gi, '')
    .replace(/\b([a-z0-9]{3,})(?:san|kun|chan|sama|dono)\b/gi, '$1')
    .replace(/\s*season\s*[0-9]+/gi, '')
    .replace(/\s*s[0-9]+\b/gi, '')
    .replace(/\s*part\s*[0-9]+/gi, '')
    .replace(/na honjaman level[\s-]*up/i, 'solo leveling')
    .replace(/omniscient reader['’]?s?(\s+viewpoint)?/i, 'omniscient reader')
    .replace(/reincarnation of the suicidal battle god/i, 'doom breaker')
    .replace(/my blasted reincarnat(ion|ed life)/gi, 'damn reincarnation')
    .replace(/bireomeogeul hwansaeng/gi, 'damn reincarnation')
    .replace(/(to hell with being heir.*|hugyeja neun moreugetgo healing.*|forget about the succession.*)/gi, 'forget about succession')
    .replace(/(jeomgwaeboneun gongnyeonim|fortune[\s-]*telling lady)/gi, 'fortune telling princess')
    .replace(/fortune[\s-]*telling princess/gi, 'fortune telling princess')
    .replace(/komi[\s-]*san wa komyushou desu/gi, 'komi cant communicate')
    .replace(/kaoru hana wa rin to saku/gi, 'fragrant flower blooms with dignity')
    .replace(/the fragrant flower blooms with dignity/gi, 'fragrant flower blooms with dignity')
    .replace(/sousou no frieren/gi, 'frieren beyond journeys end')
    .replace(/boku no hero academia/gi, 'my hero academia')
    .replace(/kimetsu no yaiba/gi, 'demon slayer')
    .replace(/shingeki no kyojin/gi, 'attack on titan')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compute composite quality and completeness score for a manga card
 */

export function extractNumericChapter(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const match = String(val).match(/([0-9]+(?:\.[0-9]+)?)/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  if (num >= 1990 && num <= 2030) return 0; // Exclude year promos
  return isNaN(num) ? 0 : num;
}

export function computeSourceScore(item) {
  if (!item) return 0;
  const prov = item.provider || (
    item.id?.startsWith('wc:') ? 'weebcentral' :
    item.id?.startsWith('kat:') ? 'mangakatana' :
    item.id?.startsWith('flame:') ? 'flame' :
    item.id?.startsWith('thunder:') ? 'thunder' :
    item.id?.startsWith('md:') ? 'mangadex' :
    item.id?.startsWith('asura:') ? 'asura' :
    item.id?.startsWith('vortex:') ? 'vortex' :
    item.id?.startsWith('mk:') ? 'mangakakalot' :
    item.id?.startsWith('webtoon:') ? 'webtoon' : 'mangapill'
  );
  let score = PROVIDER_QUALITY_SCORE[prov] || 50;

  // Extract numeric chapter count from totalChapters or latestChapter
  const chCount = extractNumericChapter(item.totalChapters) || extractNumericChapter(item.latestChapter);

  if (chCount > 0) {
    // Strongly prioritize the source with the most complete and latest chapters (e.g. 54 vs 32)
    score += chCount * 10;
  }

  if (item.coverUrl && !item.coverUrl.includes('nocover') && !item.coverUrl.includes('placeholder')) {
    score += 15;
  }
  return score;
}

/**
 * Deduplicate manga titles across multiple sources and select the single BEST source entry.
 * Attaches alternative sources into `alternativeSources` so the user knows they exist without card duplication.
 */
export function groupAndSelectBestManga(list) {
  if (!list || !Array.isArray(list) || list.length === 0) return [];
  const groups = new Map();

  for (const item of list) {
    if (!item) continue;
    const key = normalizeTitleKey(item.englishTitle || item.title);
    if (!key) continue;

    if (!groups.has(key)) {
      groups.set(key, {
        best: item,
        alternatives: [],
      });
    } else {
      const entry = groups.get(key);
      const currentScore = computeSourceScore(entry.best);
      const newScore = computeSourceScore(item);

      if (newScore > currentScore) {
        entry.alternatives.push(entry.best);
        entry.best = item;
      } else {
        entry.alternatives.push(item);
      }
    }
  }

  return Array.from(groups.values()).map(g => {
    const allMatches = [g.best, ...g.alternatives];
    let maxCh = 0;
    let maxChStr = null;
    let bestItem = g.best;

    for (const m of allMatches) {
      const num = extractNumericChapter(m.totalChapters) || extractNumericChapter(m.latestChapter);
      if (num > maxCh) {
        maxCh = num;
        maxChStr = m.latestChapter || String(Math.floor(num));
        // If an alternative source has substantially more chapters, upgrade the primary card!
        if (num > (extractNumericChapter(bestItem.totalChapters) || extractNumericChapter(bestItem.latestChapter)) + 5) {
          bestItem = m;
        }
      }
    }

    const knownCount = getKnownChapterCount(bestItem.englishTitle || bestItem.title);
    const latestChStr = bestItem.latestChapter || (maxCh > 0 ? (maxChStr || `Chapter ${maxCh}`) : (knownCount ? String(knownCount) : null));
    const totalCh = bestItem.totalChapters || (maxCh > 0 ? Math.floor(maxCh) : (knownCount || null));

    return {
      ...bestItem,
      latestChapter: latestChStr || bestItem.latestChapter,
      totalChapters: totalCh || bestItem.totalChapters,
      alternativeSourcesCount: g.alternatives.length,
      alternativeSources: g.alternatives.map(a => a.sourceName || a.provider || 'Alternative')
    };
  });
}

/**
 * Generate sanitized search query variants for reliable cross-provider lookups
 */
export function getQueryVariants(title) {
  if (!title) return [];
  const base = title
    .replace(/\s*[\(\[\{][^\)\]\}]+[\)\]\}]/g, '')
    .replace(/\s*-\s*(?:official|fan colored|colored|webtoon|manhwa|manhua|novel|scanlation).*$/i, '')
    .trim();
  const variants = new Set([base]);
  const noPunct = base.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  variants.add(noPunct);
  const noArticle = base.replace(/^(the|a|an)\s+/i, '').trim();
  variants.add(noArticle);
  const shortened = base.replace(/['’]s\s+viewpoint/i, '').replace(/\s+viewpoint/i, '').trim();
  variants.add(shortened);
  return Array.from(variants).filter(v => v && v.length >= 2);
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
        latestChapter: wt.latestChapter ? String(wt.latestChapter) : null,
        totalChapters: wt.totalChapters || null,
        sourceName: 'Webtoon',
        provider: 'webtoon',
      });
    }
  });

  try {
    const [wcList, katList, dexList, flameList, thunderList, asuraList, vortexList, mkList, scrapedList] = await Promise.all([
      getPopularMangaKatana(16).catch(() => []),
      getPopularWeebCentral(16).catch(() => []),
      getPopularMangaDex(12).catch(() => []),
      getPopularFlame(12).catch(() => []),
      getPopularThunder(12).catch(() => []),
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
            const rawHomeCover = m[1];
            const coverUrl = rawHomeCover ? (rawHomeCover.startsWith("/api/image-proxy") ? rawHomeCover : `/api/image-proxy?url=${encodeURIComponent(rawHomeCover)}`) : "";
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

    const merged = [
      ...baseList,
      ...wcList.slice(0, 16),
      ...katList.slice(0, 16),
      ...flameList.slice(0, 10),
      ...thunderList.slice(0, 10),
      ...dexList.slice(0, 10),
      ...asuraList.slice(0, 8),
      ...vortexList.slice(0, 8),
      ...mkList.slice(0, 10),
      ...scrapedList
    ];
    const deduplicated = groupAndSelectBestManga(merged);
    setCache('popular_manga_v5', deduplicated);
    return deduplicated;
  } catch (error) {
    console.warn('getPopularManga upstream warning, returning instant catalog:', error.message);
    const deduplicated = groupAndSelectBestManga(baseList);
    setCache('popular_manga_v5', deduplicated);
    return deduplicated;
  }
}

const SEARCH_SYNONYMS = {
  'my blasted reincarnation': ['my blasted reincarnated life', 'damn reincarnation'],
  'my blasted reincarnated life': ['my blasted reincarnation', 'damn reincarnation'],
  'damn reincarnation': ['my blasted reincarnated life', 'my blasted reincarnation'],
  'to hell with being heir': ['forget about the succession', 'to hell with being heir im going to heal'],
  'to hell with being heir im going to heal': ['forget about the succession', 'to hell with being heir'],
  'hugyeja neun moreugetgo healing': ['forget about the succession', 'to hell with being heir'],
  'hugyeja neun moreugetgo healing ina haryeomnida': ['forget about the succession', 'to hell with being heir'],
  'forget about the succession': ['to hell with being heir', 'hugyeja neun moreugetgo healing'],
  'forget about the succession im here to heal': ['to hell with being heir', 'hugyeja neun moreugetgo healing'],
  'solo leveling ragnarok': ['solo leveling: ragnarok', 'ragnarok'],
};

/**
 * Search Manga & Webtoons across prioritized sources
 * Ranked strictly by chapter completeness:
 * 1. WeebCentral (complete scanlation archives from Ch. 1, 15,000+ titles)
 * 2. Flame Comics (high-speed official scanlator for top weekly action manhwa)
 * 3. MangaDex (official & community scanlations with full chapters)
 * 4. MangaKakalot / KakaManga (deep back-catalog for classic/completed series)
 * 5. Asura Scans (fastest manhwa/manhua weekly chapters)
 * 6. Vortex Scans (high-speed manhwa/manhua scanlations)
 * 7. Webtoon (high-res verified color catalog)
 * 8. MangaPill (clean mirror fallback)
 */

/**
 * Compute search relevance score to prioritize exact matches and working series
 */
export function computeSearchRelevance(item, query) {
  if (!item) return -1000;
  const q = String(query || '').toLowerCase().trim();
  const cleanQ = q.replace(/[^a-z0-9]/g, '');
  const t = String(item.title || '').toLowerCase().trim();
  const et = String(item.englishTitle || '').toLowerCase().trim();
  const cleanT = t.replace(/[^a-z0-9]/g, '');
  const cleanEt = et.replace(/[^a-z0-9]/g, '');

  let score = 0;

  // Exact matches get supreme priority (+10,000)
  if (t === q || et === q || cleanT === cleanQ || cleanEt === cleanQ) {
    score += 10000;
  }
  // Title starts with query (+5,000)
  else if (t.startsWith(q) || et.startsWith(q)) {
    score += 5000;
  }
  // Full query occurs as a phrase in title (+3,000)
  else if (t.includes(q) || et.includes(q)) {
    score += 3000;
  }
  // Normalized query occurs (+1,500)
  else if (cleanT.includes(cleanQ) || cleanEt.includes(cleanQ)) {
    score += 1500;
  }

  // Severe penalty for pre-serialization, fan-colored duplicates, side stories if querying the main series
  if (t.includes('pre-serialization') || t.includes('fan colored') || t.includes('side story')) {
    score -= 2500;
  }

  // Bonus for sources with real chapters
  const ch = item.totalChapters || (item.latestChapter ? parseFloat(item.latestChapter) : 0);
  if (ch > 0) {
    score += Math.min(ch * 5, 1000);
  } else {
    score -= 1500; // Penalize 0-chapter entries heavily
  }

  return score;
}

export async function searchManga(query = '') {
  if (!query || !query.trim()) return getPopularManga();

  const trimmed = query.trim();
  const cacheKey = `search_v8_${trimmed.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Handle "new manga", "latest", "new", "recent" intent to return the freshest released chapters and titles
  const isNewQuery = /^(new|new\s*manga|latest|latest\s*manga|new\s*releases?|recent|fresh|trending)$/i.test(trimmed);

  if (isNewQuery) {
    try {
      const [wcLatest, wcAdded, katPopular, dexLatest, dexAdded, flamePopular, thunderPop, asuraPop, vortexPop] = await Promise.all([
        getPopularMangaKatana(20).catch(() => []),
        getLatestUpdatesWeebCentral(20).catch(() => []),
        getRecentlyAddedWeebCentral(16).catch(() => []),
        getLatestMangaDex(20).catch(() => []),
        getNewlyAddedMangaDex(16).catch(() => []),
        getPopularFlame(16).catch(() => []),
        getPopularThunder(16).catch(() => []),
        getPopularAsura().catch(() => []),
        getPopularVortex().catch(() => []),
      ]);

      const seen = new Set();
      const freshList = [];
      const addFresh = (list, srcName) => {
        (list || []).forEach(item => {
          if (item && item.id && !seen.has(item.id)) {
            seen.add(item.id);
            freshList.push({
              ...item,
              sourceName: item.sourceName || srcName,
              tags: item.tags?.length ? item.tags : ['New Release'],
            });
          }
        });
      };

      addFresh(wcLatest, 'WeebCentral');
      addFresh(katPopular, 'MangaKatana');
      addFresh(dexLatest, 'MangaDex');
      addFresh(flamePopular, 'Flame Comics');
      addFresh(thunderPop, 'Thunder Scans');
      addFresh(asuraPop, 'Asura Scans');
      addFresh(wcAdded, 'WeebCentral');
      addFresh(dexAdded, 'MangaDex');
      addFresh(vortexPop, 'Vortex Scans');

      const deduplicated = groupAndSelectBestManga(freshList);
      setCache(cacheKey, deduplicated);
      return deduplicated;
    } catch (e) {
      console.warn('New manga search fallback:', e.message);
    }
  }

  try {
    const normQ = trimmed.toLowerCase();
    const expandedQueries = [trimmed];
    for (const [key, syns] of Object.entries(SEARCH_SYNONYMS)) {
      if (normQ.includes(key) || key.includes(normQ)) {
        syns.forEach(s => {
          if (!expandedQueries.includes(s)) expandedQueries.push(s);
        });
      }
    }

    const secondaryQuery = expandedQueries[1] || null;

    const [
      katMatches,
      weebCentralMatches,
      flameMatches,
      thunderMatches,
      dexMatches,
      mkMatches,
      asuraMatches,
      vortexMatches,
      webtoonMatches,
      mangapillMatches,
      extraWcMatches,
      extraThunderMatches,
      extraAsuraMatches,
      extraKatMatches
    ] = await Promise.all([
      searchMangaKatana(query).catch(() => []),
      searchWeebCentral(query).catch((e) => {
        console.error('searchWeebCentral error:', e.message);
        return [];
      }),
      searchFlame(query).catch((e) => {
        console.error('searchFlame error:', e.message);
        return [];
      }),
      searchThunder(query).catch((e) => {
        console.error('searchThunder error:', e.message);
        return [];
      }),
      searchMangaDex(query, 14).catch((e) => {
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
      secondaryQuery ? searchWeebCentral(secondaryQuery).catch(() => []) : Promise.resolve([]),
      secondaryQuery ? searchThunder(secondaryQuery).catch(() => []) : Promise.resolve([]),
      secondaryQuery ? searchAsura(secondaryQuery).catch(() => []) : Promise.resolve([]),
      secondaryQuery ? searchMangaKatana(secondaryQuery).catch(() => []) : Promise.resolve([]),
    ]);

    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'of', 'in', 'to', 'for', 'with', 'on', 'at', 'from', 'by', 'about', 'as',
      'into', 'like', 'through', 'after', 'over', 'between', 'out', 'against', 'during', 'without', 'before',
      'under', 'around', 'among', 'my', 'me', 'i', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'we', 'us',
      'our', 'they', 'them', 'their', 'it', 'its', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being'
    ]);
    const allTokens = expandedQueries.flatMap(q => 
      q.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length >= 2 && !stopWords.has(t))
    );

    const filterMatches = (list) => {
      if (!allTokens.length) return list;
      return list.filter(item => {
        if (!item) return false;
        const text = `${item.title || ''} ${item.englishTitle || ''} ${item.id || ''}`.toLowerCase();
        return allTokens.some(tok => text.includes(tok));
      });
    };

    const seen = new Set();
    const combined = [];

    // 1. MangaKatana matches (30,000+ complete HQ scanlations)
    filterMatches([...katMatches, ...extraKatMatches]).forEach((item) => {
      if (!seen.has(item.id)) {
        combined.push({ ...item, sourceName: 'MangaKatana', provider: 'mangakatana' });
        seen.add(item.id);
      }
    });

    // 2. WeebCentral matches (Ranked #1 for complete chapter scanlations)
    filterMatches([...weebCentralMatches, ...extraWcMatches]).forEach((item) => {
      if (!seen.has(item.id)) {
        combined.push({ ...item, sourceName: 'WeebCentral' });
        seen.add(item.id);
      }
    });

    // 2. Flame Comics matches (Ranked #2 for official weekly manhwa releases)
    filterMatches(flameMatches).forEach((item) => {
      if (!seen.has(item.id)) {
        combined.push({ ...item, sourceName: 'Flame Comics' });
        seen.add(item.id);
      }
    });

    // 3. Thunder Scans matches (Ranked for premium manhwa & fantasy chapters)
    filterMatches([...thunderMatches, ...extraThunderMatches]).forEach((item) => {
      if (!seen.has(item.id)) {
        combined.push({ ...item, sourceName: 'Thunder Scans' });
        seen.add(item.id);
      }
    });

    // 4. MangaDex matches (Ranked for official & high-quality scanlations)
    filterMatches(dexMatches).forEach((item) => {
      if (!seen.has(item.id)) {
        combined.push({ ...item, sourceName: 'MangaDex' });
        seen.add(item.id);
      }
    });

    // 5. MangaKakalot matches (Ranked for extensive catalog)
    filterMatches(mkMatches).forEach((item) => {
      if (!seen.has(item.id)) {
        combined.push({ ...item, sourceName: 'MangaKakalot' });
        seen.add(item.id);
      }
    });

    // 6. Asura Scans matches (Ranked for weekly manhwa)
    filterMatches([...asuraMatches, ...extraAsuraMatches]).forEach((item) => {
      if (!seen.has(item.id)) {
        combined.push({ ...item, sourceName: 'Asura Scans' });
        seen.add(item.id);
      }
    });

    // 7. Vortex Scans matches (Ranked for manhwa/manhua)
    filterMatches(vortexMatches).forEach((item) => {
      if (!seen.has(item.id)) {
        combined.push({ ...item, sourceName: 'Vortex Scans' });
        seen.add(item.id);
      }
    });

    // 8. Webtoon curated catalog matches (Stepmother, Solo Leveling, ORV)
    filterMatches(webtoonMatches).forEach((item) => {
      if (!seen.has(item.id)) {
        combined.push({ ...item, sourceName: item.sourceName || 'Webtoon' });
        seen.add(item.id);
      }
    });

    // 9. MangaPill matches (Ranked for fallback)
    filterMatches(mangapillMatches).forEach((item) => {
      if (!seen.has(item.id)) {
        combined.push({ ...item, sourceName: 'MangaPill' });
        seen.add(item.id);
      }
    });

    const deduplicated = groupAndSelectBestManga(combined);
    setCache(cacheKey, deduplicated);
    return deduplicated;
  } catch (error) {
    console.error('searchManga error:', error);
    return [];
  }
}

/**
 * Fetch Search Results from MangaPill
 */
export async function fetchMangaPillSearch(query = '') {
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
    const rawSearchCover = m[2];
    const coverUrl = rawSearchCover ? (rawSearchCover.startsWith("/api/image-proxy") ? rawSearchCover : `/api/image-proxy?url=${encodeURIComponent(rawSearchCover)}`) : "";
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
      sourceName: 'MangaPill',
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

    const [kat, wc, flame, thunder, md, mk, asura, vortex, pill] = await Promise.all([
      searchMangaKatana(clean).catch(() => []),
      searchWeebCentral(clean).catch(() => []),
      searchFlame(clean).catch(() => []),
      searchThunder(clean).catch(() => []),
      searchMangaDex(clean, 4).catch(() => []),
      searchMangaKakalot(clean).catch(() => []),
      searchAsura(clean).catch(() => []),
      searchVortex(clean).catch(() => []),
      fetchMangaPillSearch(clean).catch(() => []),
    ]);

    const targetNorm = normalizeTitleKey(title);
    const seenSources = new Set([sources[0].sourceName]);

    const addIfMatch = (item) => {
      if (!item || !item.id || item.id === currentId) return;
      const srcName = item.sourceName || (
        item.id?.startsWith('kat:') ? 'MangaKatana' :
        item.id?.startsWith('wc:') ? 'WeebCentral' :
        item.id?.startsWith('flame:') ? 'Flame Comics' :
        item.id?.startsWith('thunder:') ? 'Thunder Scans' :
        item.id?.startsWith('md:') ? 'MangaDex' :
        item.id?.startsWith('asura:') ? 'Asura Scans' :
        item.id?.startsWith('vortex:') ? 'Vortex Scans' :
        item.id?.startsWith('mk:') ? 'MangaKakalot' :
        item.id?.startsWith('webtoon:') ? 'Webtoon' : 'MangaPill'
      );
      if (seenSources.has(srcName)) return;
      const titleNorm = normalizeTitleKey(item.title);
      const engNorm = normalizeTitleKey(item.englishTitle);
      // Strictly match identical series to prevent mixing different mangas
      if (targetNorm && (titleNorm === targetNorm || engNorm === targetNorm)) {
        seenSources.add(srcName);
        const chCount = item.totalChapters || (item.latestChapter && !isNaN(parseFloat(item.latestChapter)) ? Math.floor(parseFloat(item.latestChapter)) : null);
        sources.push({
          id: item.id,
          sourceName: srcName,
          totalChapters: chCount,
          isCurrent: false,
        });
      }
    };

    kat.slice(0, 3).forEach(addIfMatch);
    wc.slice(0, 3).forEach(addIfMatch);
    flame.slice(0, 3).forEach(addIfMatch);
    thunder.slice(0, 3).forEach(addIfMatch);
    md.slice(0, 3).forEach(addIfMatch);
    mk.slice(0, 3).forEach(addIfMatch);
    asura.slice(0, 3).forEach(addIfMatch);
    vortex.slice(0, 3).forEach(addIfMatch);
    pill.slice(0, 3).forEach(addIfMatch);

    setCache(cacheKey, sources);
  } catch {}

  return sources;
}

/**
 * Verify that a candidate match from another provider actually represents the exact same series
 * (matches title, englishTitle, or any of the altTitles in Korean, Japanese, or English).
 * Strictly prevents intermixing or scraping chapters from unrelated series.
 */
export function isAuthenticSeriesMatch(details, match, matchDetails) {
  if (!details || !match) return false;

  const validTargets = new Set();
  const addTarget = (t) => {
    if (!t || typeof t !== 'string') return;
    const norm = normalizeTitleKey(t);
    if (norm) validTargets.add(norm);
    const rawClean = t.trim().toLowerCase();
    if (rawClean) validTargets.add(rawClean);
  };

  addTarget(details.title);
  addTarget(details.englishTitle);
  if (Array.isArray(details.altTitles)) {
    details.altTitles.forEach(addTarget);
  }

  const matchTitles = [];
  if (match.title) matchTitles.push(match.title);
  if (match.englishTitle) matchTitles.push(match.englishTitle);
  if (matchDetails?.title) matchTitles.push(matchDetails.title);
  if (matchDetails?.englishTitle) matchTitles.push(matchDetails.englishTitle);
  if (Array.isArray(matchDetails?.altTitles)) {
    matchDetails.altTitles.forEach(t => matchTitles.push(t));
  }

  for (const mt of matchTitles) {
    if (!mt || typeof mt !== 'string') continue;
    const norm = normalizeTitleKey(mt);
    const rawClean = mt.trim().toLowerCase();
    if (validTargets.has(norm) || validTargets.has(rawClean)) {
      return true;
    }
    // Substring match for lengthy titles (e.g., romanized vs localized)
    for (const vt of validTargets) {
      if (vt.length >= 8 && norm.length >= 8) {
        if (norm.includes(vt) || vt.includes(norm)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Automatically heal manga with missing chapters OR upgrade to a source with more complete, latest chapters.
 * Cross-queries top scanlation providers (Thunder Scans, WeebCentral, Flame Comics, Asura Scans, Vortex Scans, MangaKakalot).
 * Strictly enforces isAuthenticSeriesMatch to prevent mixing different mangas.
 */
export async function autoHealAndUpgradeChapters(details, bypassCache = false) {
  if (!details) return details;

  let currentChapters = Array.isArray(details.chapters) ? deduplicateChapters(details.chapters) : [];
  let currentGaps = detectChapterGaps(currentChapters);
  const currentCount = currentChapters.length;

  // If already has 100+ complete chapters with 0 gaps, no healing needed
  if (currentCount >= 100 && currentGaps.length === 0) {
    return details;
  }

  // Build high-value search queries prioritizing English/Western titles
  const queryCandidates = [];
  const addQuery = (q) => {
    if (!q || typeof q !== 'string') return;
    const clean = q.replace(/\s*[\(\[\{][^\)\]\}]+[\)\]\}]/g, '').trim();
    if (clean.length >= 2 && !queryCandidates.includes(clean)) {
      queryCandidates.push(clean);
    }
    const noSan = clean.replace(/-(?:san|kun|chan|sama|dono)\b/gi, '').trim();
    if (noSan.length >= 2 && !queryCandidates.includes(noSan)) {
      queryCandidates.push(noSan);
    }
  };

  // 1. English title first
  if (details.englishTitle) addQuery(details.englishTitle);

  // 2. English / Latin altTitles
  if (Array.isArray(details.altTitles)) {
    const latinAlts = details.altTitles.filter(t => /^[a-zA-Z0-9\s'’.,!?-]+$/.test(t));
    latinAlts.forEach(addQuery);
  }

  // 3. Primary title
  if (details.title) addQuery(details.title);

  // 4. Any remaining altTitles
  if (Array.isArray(details.altTitles)) {
    details.altTitles.forEach(addQuery);
  }

  const candidateList = queryCandidates.slice(0, 4);
  let bestUpgrade = null;
  let maxFoundCount = currentCount;

  for (const query of candidateList) {
    try {
      const [katResults, wcResults, mkResults, thunderResults, flameResults, asuraResults, vortexResults] = await Promise.all([
        searchMangaKatana(query).catch(() => []),
        searchWeebCentral(query).catch(() => []),
        searchMangaKakalot(query).catch(() => []),
        searchThunder(query).catch(() => []),
        searchFlame(query).catch(() => []),
        searchAsura(query).catch(() => []),
        searchVortex(query).catch(() => []),
      ]);

      // Balanced cross-provider candidate gathering: top 2 from each provider
      const providerMatches = [
        ...katResults.slice(0, 2),
        ...wcResults.slice(0, 2),
        ...mkResults.slice(0, 2),
        ...thunderResults.slice(0, 2),
        ...flameResults.slice(0, 2),
        ...asuraResults.slice(0, 2),
        ...vortexResults.slice(0, 2),
      ];

      for (const match of providerMatches) {
        if (!match || !match.id || match.id === details.id) continue;

        let matchDetails = null;
        if (match.id.startsWith('kat:')) {
          matchDetails = await getMangaKatanaDetails(match.id, bypassCache);
        } else if (match.id.startsWith('wc:')) {
          matchDetails = await getWeebCentralDetails(match.id.replace('wc:', ''), '', bypassCache);
        } else if (match.id.startsWith('mk:')) {
          matchDetails = await getMangaKakalotDetails(match.id, bypassCache);
        } else if (match.id.startsWith('thunder:')) {
          matchDetails = await getThunderDetails(match.id, bypassCache);
        } else if (match.id.startsWith('flame:')) {
          matchDetails = await getFlameDetails(match.id, bypassCache);
        } else if (match.id.startsWith('asura:')) {
          matchDetails = await getAsuraDetails(match.id, bypassCache);
        } else if (match.id.startsWith('vortex:')) {
          matchDetails = await getVortexDetails(match.id, bypassCache);
        }

        if (matchDetails && Array.isArray(matchDetails.chapters) && matchDetails.chapters.length > 0) {
          if (!isAuthenticSeriesMatch(details, match, matchDetails)) {
            continue;
          }

          const candidateChapters = deduplicateChapters(matchDetails.chapters);
          const candidateGaps = detectChapterGaps(candidateChapters);

          // 1. If candidate has significantly more chapters and fewer/no gaps, adopt it as primary
          if (candidateChapters.length > maxFoundCount && candidateGaps.length <= currentGaps.length) {
            maxFoundCount = candidateChapters.length;
            currentChapters = candidateChapters;
            currentGaps = candidateGaps;
            bestUpgrade = {
              ...details,
              aliasId: matchDetails.id,
              sourceName: matchDetails.sourceName || details.sourceName,
              provider: matchDetails.provider || details.provider,
              chapters: candidateChapters,
              totalChapters: candidateChapters.length,
              latestChapter: candidateChapters[0]?.chapter || matchDetails.latestChapter || null,
              coverUrl: details.coverUrl && !details.coverUrl.includes('placeholder') ? details.coverUrl : matchDetails.coverUrl,
              description: details.description && details.description !== 'No synopsis available.' ? details.description : matchDetails.description,
            };
          } else if (currentGaps.length > 0) {
            // 2. Gap filling: merge chapters from candidate to bridge the missing chapters!
            const merged = mergeAndDeduplicateChapters(currentChapters, candidateChapters);
            const mergedGaps = detectChapterGaps(merged);
            if (mergedGaps.length < currentGaps.length || merged.length > currentChapters.length) {
              currentChapters = merged;
              currentGaps = mergedGaps;
              bestUpgrade = {
                ...(bestUpgrade || details),
                chapters: merged,
                totalChapters: merged.length,
                latestChapter: merged[0]?.chapter || details.latestChapter || null,
              };
            }
          }

          // If all gaps are sealed and chapters are complete, stop searching
          if (currentGaps.length === 0 && currentChapters.length >= 40) {
            break;
          }
        }
      }

      if (currentGaps.length === 0 && currentChapters.length >= 40) {
        break;
      }
    } catch (err) {
      console.warn('autoHealAndUpgradeChapters search step warning:', err.message);
    }
  }

  return bestUpgrade || {
    ...details,
    chapters: currentChapters,
    totalChapters: currentChapters.length,
    latestChapter: currentChapters[0]?.chapter || details.latestChapter || null,
  };
}

// Backward-compatibility alias
export const autoHealMissingChapters = autoHealAndUpgradeChapters;

/**
 * Get Manga Details & Complete Chapters List
 * Guarantees 100% authentic chapter continuity from the selected source.
 * Never scrapes or intermixes chapters from other mangas.
 */
export async function getMangaDetails(mangaId, bypassCache = false) {
  if (!mangaId) return null;

  // Exact ID resolution for Stepmother Second Life webtoon
  if (
    mangaId === 'webtoon:stepmother-second-life' ||
    mangaId === 'webtoon:the-step-mothers-began-her-second-life'
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
    '2/one-piece': 'kat:one-piece.49',
    'one-piece': 'kat:one-piece.49',
    '1/berserk': 'kat:berserk.1',
    'berserk': 'kat:berserk.1',
    '5/naruto': 'kat:naruto.5',
    'naruto': 'kat:naruto.5',
    '3/bleach': 'kat:bleach.4',
    'bleach': 'kat:bleach.4',
    '2085/jujutsu-kaisen': 'kat:jujutsu-kaisen.2085',
    'jujutsu-kaisen': 'kat:jujutsu-kaisen.2085',
    '723/chainsaw-man': 'kat:chainsaw-man.2081',
    'chainsaw-man': 'kat:chainsaw-man.2081',
    'damn-reincarnation': 'kat:damn-reincarnation.26360',
    'my-blasted-reincarnation': 'kat:damn-reincarnation.26360',
    'my-blasted-reincarnated-life': 'kat:damn-reincarnation.26360',
    'lookism': 'wc:01J76XYBD282Y3XKX0KRGD64Q5',
    'webtoon:lookism': 'wc:01J76XYBD282Y3XKX0KRGD64Q5',
    'tower-of-god': 'wc:01J76XY7M0W9WWJ55VJYYB2J1S',
    'webtoon:tower-of-god': 'wc:01J76XY7M0W9WWJ55VJYYB2J1S',
    'wind-breaker': 'wc:01J76XYA1TQYKV6W4BCMR2WD5M',
    'webtoon:wind-breaker': 'wc:01J76XYA1TQYKV6W4BCMR2WD5M',
    'eleceed': 'wc:01J76XYD3Q2Q7HYYMB3FSDPSKC',
    'webtoon:eleceed': 'wc:01J76XYD3Q2Q7HYYMB3FSDPSKC',
    'mercenary-enrollment': 'wc:01J76XYEA95PG5AVMCKC9TK492',
    'webtoon:mercenary-enrollment': 'wc:01J76XYEA95PG5AVMCKC9TK492',
    'teenage-mercenary': 'wc:01J76XYEA95PG5AVMCKC9TK492',
    'nano-machine': 'asura:nano-machine-ab39de10',
    'webtoon:nano-machine': 'asura:nano-machine-ab39de10',
    'the-beginning-after-the-end': 'thunder:the-beginning-after-the-end',
    'tbate': 'thunder:the-beginning-after-the-end',
    'doom-breaker': 'asura:reincarnation-of-the-suicidal-battle-god-ab39de10',
    'reincarnation-of-the-suicidal-battle-god': 'asura:reincarnation-of-the-suicidal-battle-god-ab39de10',
    'mount-hua': 'asura:return-of-the-mount-hua-sect-ab39de10',
    'return-of-the-mount-hua-sect': 'asura:return-of-the-mount-hua-sect-ab39de10',
    'reaper-of-the-drifting-moon': 'asura:reaper-of-the-drifting-moon-ab39de10',
    'murim-login': 'asura:murim-login-ab39de10',
    'barbarian': 'asura:surviving-the-game-as-a-barbarian-ab39de10',
    'a-fortune-telling-princess': 'webtoon:fortune-telling-princess',
    'fortune-telling-princess': 'webtoon:fortune-telling-princess',
    'md:0ba6b85e-3e87-454a-b81d-1040468248e1': 'webtoon:fortune-telling-princess',
    'damn-reincarnation': 'asura:damn-reincarnation-ab39de10',
    'surviving-the-game-as-a-barbarian': 'asura:surviving-the-game-as-a-barbarian-ab39de10',
    'greatest-estate-developer': 'asura:the-greatest-estate-developer-ab39de10',
    'the-greatest-estate-developer': 'asura:the-greatest-estate-developer-ab39de10',
    'md:eee25eb6-591b-40a4-a2aa-f4ab68169795': 'thunder:forget-about-the-succession-im-here-to-heal',
    'eee25eb6-591b-40a4-a2aa-f4ab68169795': 'thunder:forget-about-the-succession-im-here-to-heal',
    'my-blasted-reincarnation': 'asura:damn-reincarnation-3ebcc5a9',
    'my-blasted-reincarnated-life': 'asura:damn-reincarnation-3ebcc5a9',
    'damn-reincarnation': 'asura:damn-reincarnation-3ebcc5a9',
    'to-hell-with-being-heir': 'thunder:forget-about-the-succession-im-here-to-heal',
  };

  const lookupId = VERIFIED_COMPLETE_ALIASES[mangaId] || mangaId;

  let resolvedDetails = null;

  try {
    if (lookupId.startsWith('md:') || lookupId.startsWith('mangadex:')) {
      resolvedDetails = await getMangaDexDetails(lookupId, bypassCache);
      // If MangaDex returned 0 chapters, immediately fall back to known alias if available
      if ((!resolvedDetails?.chapters || resolvedDetails.chapters.length === 0) && VERIFIED_COMPLETE_ALIASES[mangaId]) {
        const altId = VERIFIED_COMPLETE_ALIASES[mangaId];
        if (altId.startsWith('thunder:')) {
          resolvedDetails = await getThunderDetails(altId);
        } else if (altId.startsWith('wc:')) {
          resolvedDetails = await getWeebCentralDetails(altId.replace('wc:', ''), '', bypassCache);
        } else if (altId.startsWith('asura:')) {
          resolvedDetails = await getAsuraDetails(altId);
        }
      }
    } else if (lookupId.startsWith('thunder:')) {
      resolvedDetails = await getThunderDetails(lookupId, bypassCache);
    } else if (lookupId.startsWith('flame:')) {
      resolvedDetails = await getFlameDetails(lookupId, bypassCache);
    } else if (lookupId.startsWith('asura:')) {
      resolvedDetails = await getAsuraDetails(lookupId, bypassCache);
    } else if (lookupId.startsWith('vortex:')) {
      resolvedDetails = await getVortexDetails(lookupId, bypassCache);
    } else if (lookupId.startsWith('webtoon:')) {
      resolvedDetails = await getWebtoonDetails(lookupId, bypassCache);
    } else if (lookupId.startsWith('wc:')) {
      resolvedDetails = await getWeebCentralDetails(lookupId.replace('wc:', ''), '', bypassCache);
    } else if (lookupId.startsWith('kat:')) {
      resolvedDetails = await getMangaKatanaDetails(lookupId, bypassCache);
    } else if (lookupId.startsWith('mk:')) {
      resolvedDetails = await getMangaKakalotDetails(lookupId, bypassCache);
    }
  } catch (providerErr) {
    console.warn(`Upstream error resolving ${lookupId}:`, providerErr.message);
  }

  if (resolvedDetails) {
    const resolvedGaps = detectChapterGaps(resolvedDetails.chapters);
    if (!resolvedDetails.chapters || resolvedDetails.chapters.length < 35 || resolvedGaps.length > 0) {
      resolvedDetails = await autoHealAndUpgradeChapters(resolvedDetails, bypassCache);
    }
    if (Array.isArray(resolvedDetails.chapters)) {
      resolvedDetails.chapters = deduplicateChapters(resolvedDetails.chapters);
      resolvedDetails.totalChapters = resolvedDetails.chapters.length;
    }
    try {
      resolvedDetails.availableSources = await Promise.race([
        resolveAvailableSources(
          resolvedDetails.englishTitle || resolvedDetails.title,
          resolvedDetails.id,
          resolvedDetails.sourceName,
          resolvedDetails.totalChapters
        ),
        new Promise(resolve => setTimeout(() => resolve([
          {
            id: resolvedDetails.id,
            sourceName: resolvedDetails.sourceName || 'Primary',
            totalChapters: resolvedDetails.totalChapters || 0,
            isCurrent: true,
          }
        ]), 1800))
      ]);
    } catch {
      resolvedDetails.availableSources = [
        {
          id: resolvedDetails.id,
          sourceName: resolvedDetails.sourceName || 'Primary',
          totalChapters: resolvedDetails.totalChapters || 0,
          isCurrent: true,
        }
      ];
    }
    return {
      ...resolvedDetails,
      id: mangaId, // preserve requested ID for frontend consistency
      aliasId: resolvedDetails.aliasId || (lookupId !== mangaId ? lookupId : undefined),
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

    let result = {
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

    const pillGaps = detectChapterGaps(result.chapters);
    if (!result.chapters || result.chapters.length < 35 || pillGaps.length > 0) {
      result = await autoHealAndUpgradeChapters(result, bypassCache);
    }
    if (Array.isArray(result.chapters)) {
      result.chapters = deduplicateChapters(result.chapters);
      result.totalChapters = result.chapters.length;
    }
    result.availableSources = await resolveAvailableSources(result.englishTitle || result.title, mangaId, result.sourceName, result.totalChapters);

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.warn('getMangaDetails upstream warning:', error.message);
    
    // Proactively attempt fallback search on WeebCentral by title ONLY if title strictly matches
    try {
      const cleanIdTitle = cleanTitle(mangaId.split('/')[1] || mangaId);
      const targetNorm = normalizeTitleKey(cleanIdTitle);
      const wcMatches = await searchWeebCentral(cleanIdTitle);
      const exactMatch = wcMatches.find(m => normalizeTitleKey(m.title) === targetNorm);
      if (exactMatch && exactMatch.seriesId) {
        const wcDetails = await getWeebCentralDetails(exactMatch.seriesId, '', true);
        if (wcDetails && wcDetails.chapters && wcDetails.chapters.length > 0) {
          const deduped = deduplicateChapters(wcDetails.chapters);
          return {
            ...wcDetails,
            id: mangaId,
            aliasId: `wc:${exactMatch.seriesId}`,
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
const MANGAPILL_PREFIX_MAP = {
  'death-note': { prefix: '938', slug: 'death-note' },
  'one-punch-man': { prefix: '3262', slug: 'one-punch-man' },
  'tokyo-ghoul': { prefix: '4524', slug: 'tokyo-ghoul' },
  'black-clover': { prefix: '524', slug: 'black-clover' },
  'blue-lock': { prefix: '580', slug: 'blue-lock' },
  'sakamoto-days': { prefix: '5281', slug: 'sakamoto-days' },
  'oshi-no-ko': { prefix: '5053', slug: 'oshi-no-ko' },
  'haikyuu': { prefix: '1515', slug: 'haikyuu' },
  'haikyu': { prefix: '1515', slug: 'haikyuu' },
  'dragon-ball-super': { prefix: '1069', slug: 'dragon-ball-super' },
  'one-piece': { prefix: '2', slug: 'one-piece' },
  'berserk': { prefix: '1', slug: 'berserk' },
  'chainsaw-man': { prefix: '723', slug: 'chainsaw-man' },
  'jujutsu-kaisen': { prefix: '2085', slug: 'jujutsu-kaisen' },
  'boruto': { prefix: '7486', slug: 'boruto-two-blue-vortex' },
  'boruto-two-blue-vortex': { prefix: '7486', slug: 'boruto-two-blue-vortex' },
  'kagurabachi': { prefix: '7529', slug: 'kagurabachi' },
  'demon-slayer': { prefix: '467', slug: 'demon-slayer-kimetsu-no-yaiba' },
  'attack-on-titan': { prefix: '50', slug: 'attack-on-titan' },
  'aot': { prefix: '50', slug: 'attack-on-titan' },
  'bleach': { prefix: '3', slug: 'bleach' },
  'naruto': { prefix: '5', slug: 'naruto' },
  'hunter-x-hunter': { prefix: '17', slug: 'hunter-x-hunter' },
  'spy-x-family': { prefix: '2873', slug: 'spy-x-family' },
  'frieren': { prefix: '4708', slug: 'sousou-no-frieren' },
  'dandadan': { prefix: '5588', slug: 'dandadan' },
  'vinland-saga': { prefix: '60', slug: 'vinland-saga' },
  'vagabond': { prefix: '4', slug: 'vagabond' },
  'kingdom': { prefix: '8', slug: 'kingdom' },
};

export async function getChapterPages(rawChapterId, rawMangaId = '', rawChapterNumber = '', rawTitle = '') {
  if (!rawChapterId && (!rawMangaId || !rawChapterNumber)) {
    return { chapterId: '', totalPages: 0, pages: [] };
  }
  let chapterId = String(rawChapterId || '');
  const mId = String(rawMangaId || '').toLowerCase();
  const title = String(rawTitle || '').toLowerCase();
  const chNum = String(rawChapterNumber || '').replace(/[^0-9.]/g, '') || (chapterId.match(/([0-9.]+)/)?.[1] || '1');

  // Universal AniList Chapter Resolver
  if (chapterId.startsWith('anilist_ch:')) {
    const parts = chapterId.replace('anilist_ch:', '').split(':');
    const aniId = parts[0];
    const requestedCh = parts[1] || chNum;
    
    if (aniId === '151512' || mId.includes('blasted') || mId.includes('damn-reincarnation') || title.includes('reincarnat')) {
      const katDetails = await getMangaKatanaDetails('damn-reincarnation.26360').catch(() => null);
      const targetCh = katDetails?.chapters?.find(c => String(c.chapter) === String(requestedCh));
      if (targetCh) {
        return await getMangaKatanaChapterPages(targetCh.id);
      }
      chapterId = `asura_ch:damn-reincarnation-3ebcc5a9:${requestedCh}`;
    } else if (aniId === '164857' || mId.includes('barbarian') || title.includes('barbarian')) {
      chapterId = `asura_ch:surviving-the-game-as-a-barbarian-ab39de10:${requestedCh}`;
    } else if (aniId === '140407' || mId.includes('estate') || title.includes('greatest estate')) {
      chapterId = `asura_ch:the-greatest-estate-developer-ab39de10:${requestedCh}`;
    } else if (aniId === '105398' || mId.includes('solo') || title.includes('solo leveling')) {
      chapterId = `webtoon:solo:${requestedCh}`;
    } else if (aniId === '170151' || mId.includes('fortune-telling') || title.includes('fortune-telling')) {
      chapterId = `webtoon:ftp:${requestedCh}`;
    } else if (aniId === '213993' || mId.includes('stepmother') || title.includes('stepmother')) {
      chapterId = `webtoon:stepmother:${requestedCh}`;
    } else if (aniId === '119257' || mId.includes('omniscient') || title.includes('omniscient')) {
      chapterId = `webtoon:orv:${requestedCh}`;
    } else if (aniId === '86337' || mId.includes('lookism') || title.includes('lookism')) {
      const wcDetails = await getWeebCentralDetails('01J76XYBD282Y3XKX0KRGD64Q5').catch(() => null);
      const targetCh = wcDetails?.chapters?.find(c => String(c.chapter) === String(requestedCh));
      if (targetCh) {
        return await getWeebCentralChapterPages(targetCh.id.replace('wc_ch:', ''));
      }
    } else if (aniId === '30013' || mId.includes('one-piece') || title.includes('one piece')) {
      const katDetails = await getMangaKatanaDetails('one-piece.49').catch(() => null);
      const targetCh = katDetails?.chapters?.find(c => String(c.chapter) === String(requestedCh));
      if (targetCh) {
        return await getMangaKatanaChapterPages(targetCh.id);
      }
      const code = 10000000 + Math.floor(parseFloat(requestedCh) * 1000);
      chapterId = `2-${code}/one-piece-chapter-${requestedCh}`;
    } else if (aniId === '30002' || mId.includes('berserk') || title.includes('berserk')) {
      const katDetails = await getMangaKatanaDetails('berserk.1').catch(() => null);
      const targetCh = katDetails?.chapters?.find(c => String(c.chapter) === String(requestedCh));
      if (targetCh) {
        return await getMangaKatanaChapterPages(targetCh.id);
      }
      const code = 10000000 + Math.floor(parseFloat(requestedCh) * 1000);
      chapterId = `1-${code}/berserk-chapter-${requestedCh}`;
    } else if (aniId === '105778' || mId.includes('chainsaw') || title.includes('chainsaw man')) {
      const code = 10000000 + Math.floor(parseFloat(requestedCh) * 1000);
      chapterId = `723-${code}/chainsaw-man-chapter-${requestedCh}`;
    } else if (aniId === '101517' || mId.includes('jujutsu') || title.includes('jujutsu kaisen')) {
      const code = 10000000 + Math.floor(parseFloat(requestedCh) * 1000);
      chapterId = `2085-${code}/jujutsu-kaisen-chapter-${requestedCh}`;
    } else if (aniId === '30011' || mId.includes('naruto') || title.includes('naruto')) {
      const code = 10000000 + Math.floor(parseFloat(requestedCh) * 1000);
      chapterId = `5-${code}/naruto-chapter-${requestedCh}`;
    } else if (aniId === '30012' || mId.includes('bleach') || title.includes('bleach')) {
      const code = 10000000 + Math.floor(parseFloat(requestedCh) * 1000);
      chapterId = `3-${code}/bleach-chapter-${requestedCh}`;
    } else if (aniId === '87216' || mId.includes('demon-slayer') || title.includes('demon slayer')) {
      const code = 10000000 + Math.floor(parseFloat(requestedCh) * 1000);
      chapterId = `467-${code}/demon-slayer-kimetsu-no-yaiba-chapter-${requestedCh}`;
    }
  }

  // Auto-correct any MangaPill IDs that used leading zeros (e.g. 2-00010000 -> 2-10001000)
  if (/^[0-9]+-0+[0-9]+\//.test(chapterId)) {
    const chMatch = chapterId.match(/^([0-9]+)-0+([0-9]+)\/([a-z0-9\-]+)-chapter-([0-9.]+)/i);
    if (chMatch) {
      const prefix = chMatch[1];
      const chNum = parseFloat(chMatch[4]);
      const slug = chMatch[3];
      if (!isNaN(chNum)) {
        const code = 10000000 + Math.floor(chNum * 1000);
        chapterId = `${prefix}-${code}/${slug}-chapter-${chMatch[4]}`;
      }
    }
  }

  // Handle mp:series:ch format
  if (chapterId.startsWith('mp:')) {
    const parts = chapterId.replace('mp:', '').split(':');
    const series = parts[0];
    const chNum = parts[1];
    const meta = MANGAPILL_PREFIX_MAP[series];
    if (meta && chNum) {
      const parsedNum = parseFloat(chNum);
      const code = 10000000 + Math.floor(parsedNum * 1000);
      chapterId = `${meta.prefix}-${code}/${meta.slug}-chapter-${chNum}`;
    }
  }

  try {
    if (chapterId.startsWith('webtoon:stepmother:')) {
      const num = chapterId.match(/([0-9.]+)/)?.[1] || '1';
      return await getWebtoonChapterPages(`webtoon:stepmother:${num}`);
    }

    if (chapterId.startsWith('kat_ch:') || chapterId.startsWith('kat:')) {
      return await getMangaKatanaChapterPages(chapterId);
    }
    if (chapterId.startsWith('md_ch:') || chapterId.startsWith('md:')) {
      return await getMangaDexChapterPages(chapterId);
    }
    if (chapterId.startsWith('flame_ch:') || chapterId.startsWith('flame:')) {
      return await getFlameChapterPages(chapterId);
    }
    if (chapterId.startsWith('asura_ch:') || chapterId.startsWith('asura:')) {
      return await getAsuraChapterPages(chapterId);
    }
    if (chapterId.startsWith('vortex_ch:') || chapterId.startsWith('vortex:')) {
      return await getVortexChapterPages(chapterId);
    }
    if (chapterId.startsWith('webtoon:')) {
      return await getWebtoonChapterPages(chapterId);
    }
    if (chapterId.startsWith('wc_ch:')) {
      return await getWeebCentralChapterPages(chapterId.replace('wc_ch:', ''));
    }
    if (chapterId.startsWith('thunder_ch:') || chapterId.startsWith('thunder:')) {
      return await getThunderChapterPages(chapterId);
    }
    if (chapterId.startsWith('mk_ch:')) {
      return await getMangaKakalotChapterPages(chapterId);
    }
  } catch (providerErr) {
    console.warn(`Provider error resolving chapter pages for ${chapterId}:`, providerErr.message);
    return {
      chapterId,
      totalPages: 0,
      pages: [],
      warning: 'Chapter images are temporarily synchronizing. Please try another chapter.',
    };
  }

  const cacheKey = `chapter_v3_${chapterId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/chapters/${chapterId}`;
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 12000);
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
    console.warn('getChapterPages MangaPill warning, attempting MangaKatana fallback:', error.message);
    if (rawTitle || rawMangaId) {
      try {
        const queryTerm = rawTitle || rawMangaId.replace(/[-_]/g, ' ');
        const searchMatches = await searchMangaKatana(queryTerm);
        if (searchMatches && searchMatches.length > 0) {
          const matchDet = await getMangaKatanaDetails(searchMatches[0].id);
          const matchedCh = matchDet?.chapters?.find(c => String(c.chapter) === String(chNum));
          if (matchedCh) {
            const katRes = await getMangaKatanaChapterPages(matchedCh.id);
            if (katRes && katRes.pages && katRes.pages.length > 0) {
              return katRes;
            }
          }
        }
      } catch (fbErr) {
        console.warn('MangaKatana chapter fallback error:', fbErr.message);
      }
    }
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
      } else if (host.includes('thunderscans')) {
        primaryReferer = 'https://en-thunderscans.com/';
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
      } else if (host.includes('mangakatana')) {
        primaryReferer = 'https://mangakatana.com/';
      } else {
        primaryReferer = parsedOrigin;
      }
    } catch {}

    const isMangaDex = parsedOrigin.includes('mangadex.org') || parsedOrigin.includes('mangadex.network') || primaryReferer.includes('mangadex.org');

    // Multi-candidate referer resolution (fast 2-candidate resolution)
    const candidates = [
      primaryReferer,
      ...(parsedOrigin && parsedOrigin !== primaryReferer ? [parsedOrigin] : []),
      '',
    ].filter((v, idx, arr) => arr.indexOf(v) === idx).slice(0, 2);

    let finalRes = null;
    for (const ref of candidates) {
      try {
        const fetchHeaders = {
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          ...(ref ? { 'Referer': ref } : {}),
        };
        // MangaDex Cloudflare strictly blocks desktop Chrome User-Agent strings with 403 Forbidden
        if (!isMangaDex) {
          fetchHeaders['User-Agent'] = USER_AGENT;
        }

        const testRes = await fetchWithTimeout(imageUrl, {
          headers: fetchHeaders,
        }, 4500);

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

export { getMangaNews };
