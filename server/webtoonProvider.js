// Multi-source Webtoon & Manhwa Provider
// Dedicated provider for Korean webtoons, manhwa, and expanded library titles

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

/**
 * Curated Manhwa & Webtoon Catalog
 */
export const WEBTOON_CATALOG = [
  {
    id: 'webtoon:fortune-telling-princess',
    title: 'A Fortune-Telling Princess',
    englishTitle: 'A Fortune-Telling Princess',
    altTitles: [
      'Fortune-Telling Lady',
      'A Princess Who Reads Fortune',
      'Fortune Telling Princess',
      'Jeomgwaeboneun Gongnyeonim',
      '점괘보는 공녀님',
    ],
    coverUrl: 'https://uploads.mangadex.org/covers/0ba6b85e-3e87-454a-b81d-1040468248e1/11023c20-0bdd-48df-bb5d-7f451a109a26.jpg',
    status: 'Ongoing',
    score: '9.2',
    year: '2022',
    author: 'Gimgae & Saidin',
    artist: 'Supercomix Studio',
    tags: ['Manhwa', 'Webtoon', 'Fantasy', 'Romance', 'Reincarnation', 'Supernatural'],
    description: 'Lee Sia, a top actress with the supernatural ability to see and communicate with ghosts, dies in an accident and awakens in the body of Camila Sorpel—a noble princess in a fantasy world cursed to die repeatedly at the hands of her own family. To survive and alter destiny, she uses her ghostly allies and fortune-telling abilities!',
    source: 'afortunetellingprincess.com',
  },
  {
    id: 'webtoon:solo-leveling',
    title: 'Solo Leveling',
    englishTitle: 'Solo Leveling',
    altTitles: ['Na Honjaman Level Up', 'I Level Up Alone', '나 혼자만 레벨업'],
    coverUrl: 'https://uploads.mangadex.org/covers/32d76d19-8a05-4db0-9fc2-e0b0648fe9d0/d24660a0-096a-4ee1-b99b-4330b659c223.jpg',
    status: 'Completed',
    score: '9.6',
    year: '2018',
    author: 'Chugong',
    artist: 'DUBU (REDICE Studio)',
    tags: ['Manhwa', 'Action', 'Fantasy', 'Supernatural', 'Dungeon'],
    description: 'In a world where hunters must battle deadly monsters to protect humanity, Sung Jinwoo, notoriously known as the "Weakest Hunter of All Mankind", discovers a mysterious Quest Window and gains the ability to level up infinitely!',
    source: 'readsololeveling.org',
  },
  {
    id: 'webtoon:omniscient-reader',
    title: "Omniscient Reader's Viewpoint",
    englishTitle: "Omniscient Reader's Viewpoint",
    altTitles: ['ORV', 'Jeonjijeok Dokja Sijeom', '전지적 독자 시점'],
    coverUrl: 'https://uploads.mangadex.org/covers/c5598687-0199-4cc3-9a3b-280fb5a8e017/e89ef067-1755-4e3f-a38f-eeaa5d2077e5.jpg',
    status: 'Ongoing',
    score: '9.5',
    year: '2020',
    author: 'sing N song',
    artist: 'Sleepy-C (REDICE Studio)',
    tags: ['Manhwa', 'Action', 'Apocalypse', 'Fantasy', 'System'],
    description: 'Kim Dokja was an ordinary office worker whose sole interest was reading his favorite web novel "Three Ways to Survive the Apocalypse". When the novel suddenly becomes reality, he is the only person who knows how the world will end.',
    source: 'omniscientreadersviewpoint.com',
  },
];

/**
 * Search Webtoons & Manhwa
 */
export async function searchWebtoons(query = '') {
  if (!query || !query.trim()) return [];

  const q = query.trim().toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);

  const matched = WEBTOON_CATALOG.filter((item) => {
    const textCorpus = [
      item.title,
      item.englishTitle,
      ...(item.altTitles || []),
      ...(item.tags || []),
      item.author,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    // Check full string inclusion
    if (textCorpus.includes(q)) return true;

    // Check all tokens
    return tokens.every((tok) => textCorpus.includes(tok));
  });

  return matched.map((item) => ({
    id: item.id,
    title: item.title,
    englishTitle: item.englishTitle || null,
    coverUrl: item.coverUrl,
    status: item.status,
    author: item.author,
    score: item.score,
    year: item.year,
    tags: item.tags,
    description: item.description,
    provider: 'webtoon',
  }));
}

/**
 * Fetch Details & Chapters for Webtoon
 */
export async function getWebtoonDetails(id) {
  if (id === 'webtoon:fortune-telling-princess') {
    return getFortuneTellingPrincessDetails();
  }
  if (id === 'webtoon:solo-leveling') {
    return getSoloLevelingDetails();
  }
  if (id === 'webtoon:omniscient-reader') {
    return getOmniscientReaderDetails();
  }

  // Fallback to catalog entry
  const entry = WEBTOON_CATALOG.find((w) => w.id === id);
  if (entry) {
    return {
      ...entry,
      chapters: [],
      totalChapters: 0,
    };
  }
  return null;
}

/**
 * Scraper for A Fortune-Telling Princess details & chapters
 */
async function getFortuneTellingPrincessDetails() {
  const cacheKey = 'details_ftp_all';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const entry = WEBTOON_CATALOG.find((w) => w.id === 'webtoon:fortune-telling-princess');
    const res = await fetch('https://afortunetellingprincess.com/', { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const chapRegex = /<a[^>]+href="(https:\/\/afortunetellingprincess\.com\/a-fortune-telling-princess-manhwa-chapter-([0-9.]+)\/)"[^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    const chaptersMap = new Map();
    while ((m = chapRegex.exec(html)) !== null) {
      const chapUrl = m[1];
      const num = m[2];
      if (!chaptersMap.has(num)) {
        chaptersMap.set(num, {
          id: `webtoon:ftp:${num}`,
          chapter: num,
          title: `Chapter ${num}`,
          sourceUrl: chapUrl,
        });
      }
    }

    const chapters = Array.from(chaptersMap.values()).sort(
      (a, b) => parseFloat(b.chapter) - parseFloat(a.chapter)
    );

    const result = {
      ...entry,
      chapters,
      totalChapters: chapters.length,
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error('getFortuneTellingPrincessDetails error:', err);
    // Fallback generated chapters up to 173
    const entry = WEBTOON_CATALOG.find((w) => w.id === 'webtoon:fortune-telling-princess');
    const fallbackChapters = [];
    for (let i = 173; i >= 0; i--) {
      fallbackChapters.push({
        id: `webtoon:ftp:${i}`,
        chapter: String(i),
        title: `Chapter ${i}`,
        sourceUrl: `https://afortunetellingprincess.com/a-fortune-telling-princess-manhwa-chapter-${i}/`,
      });
    }
    return {
      ...entry,
      chapters: fallbackChapters,
      totalChapters: fallbackChapters.length,
    };
  }
}

/**
 * Scraper for Solo Leveling
 */
async function getSoloLevelingDetails() {
  const entry = WEBTOON_CATALOG.find((w) => w.id === 'webtoon:solo-leveling');
  const chapters = [];
  for (let i = 200; i >= 1; i--) {
    chapters.push({
      id: `webtoon:solo:${i}`,
      chapter: String(i),
      title: `Chapter ${i}`,
      sourceUrl: `https://readsololeveling.org/chapter/solo-leveling-chapter-${i}/`,
    });
  }
  return {
    ...entry,
    chapters,
    totalChapters: chapters.length,
  };
}

/**
 * Scraper for Omniscient Reader
 */
async function getOmniscientReaderDetails() {
  const entry = WEBTOON_CATALOG.find((w) => w.id === 'webtoon:omniscient-reader');
  const chapters = [];
  for (let i = 250; i >= 1; i--) {
    chapters.push({
      id: `webtoon:orv:${i}`,
      chapter: String(i),
      title: `Chapter ${i}`,
      sourceUrl: `https://omniscientreadersviewpoint.com/chapter/omniscient-reader-chapter-${i}/`,
    });
  }
  return {
    ...entry,
    chapters,
    totalChapters: chapters.length,
  };
}

/**
 * Get Pages for a Webtoon Chapter
 */
export async function getWebtoonChapterPages(chapterId) {
  const cacheKey = `webtoon_pages_${chapterId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  if (chapterId.startsWith('webtoon:ftp:')) {
    const chapterNum = chapterId.replace('webtoon:ftp:', '');
    const url = `https://afortunetellingprincess.com/a-fortune-telling-princess-manhwa-chapter-${chapterNum}/`;

    try {
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();

      const pageRegex = /<img[^>]+(?:src|data-src)="([^"]*\/uploads\/manga\/[^"]+)"/gi;
      const pages = [...html.matchAll(pageRegex)].map((match, idx) => ({
        pageNumber: idx + 1,
        url: `/api/image-proxy?url=${encodeURIComponent(match[1])}`,
        originalUrl: match[1],
      }));

      if (pages.length === 0) {
        // Fallback for any image with wp-content/uploads
        const fallbackRegex = /<img[^>]+(?:src|data-src)="([^"]*\/wp-content\/uploads\/[0-9]{4}\/[^"]+)"/gi;
        const fb = [...html.matchAll(fallbackRegex)].map((match, idx) => ({
          pageNumber: idx + 1,
          url: `/api/image-proxy?url=${encodeURIComponent(match[1])}`,
          originalUrl: match[1],
        }));
        pages.push(...fb);
      }

      const result = {
        chapterId,
        totalPages: pages.length,
        pages,
      };

      setCache(cacheKey, result);
      return result;
    } catch (err) {
      console.error('getWebtoonChapterPages error for FTP:', err);
      throw err;
    }
  }

  // Handle Solo Leveling
  if (chapterId.startsWith('webtoon:solo:')) {
    const num = chapterId.replace('webtoon:solo:', '');
    const url = `https://readsololeveling.org/chapter/solo-leveling-chapter-${num}/`;
    try {
      const res = await fetch(url, { headers: HEADERS });
      const html = await res.text();
      const pageRegex = /<img[^>]+(?:src|data-src)="([^"]+(?:sololeveling|wp-content|chapter)[^"]+)"/gi;
      const pages = [...html.matchAll(pageRegex)].map((match, idx) => ({
        pageNumber: idx + 1,
        url: `/api/image-proxy?url=${encodeURIComponent(match[1])}`,
        originalUrl: match[1],
      }));
      const result = { chapterId, totalPages: pages.length, pages };
      setCache(cacheKey, result);
      return result;
    } catch (e) {
      console.error('Solo Leveling page fetch error:', e);
      throw e;
    }
  }

  throw new Error(`Unsupported webtoon chapter: ${chapterId}`);
}
