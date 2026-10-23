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
 * Curated Manhwa & Webtoon Catalog
 */
export const WEBTOON_CATALOG = [
  {
    id: 'webtoon:stepmother-second-life',
    title: 'The Despised Stepmother Begins Her Second Life',
    englishTitle: "The Step Mother's Began Her Second Life",
    altTitles: [
      "The Step Mother's Began Her Second Life",
      'The Stepmother Began Her Second Life',
      'The Stepmother Begins Her Second Life',
      'The Step Mother Began Her Second Life',
      'The Hated Stepmother Begins Her Second Life',
      'The Despised Stepmother Begins Her Second Life',
      'The Stepmother Has Left',
      'Stepmother Second Life',
      'Step Mother Second Life',
      '새엄마가 떠났다',
      'Saeeommaga Tteonassda',
    ],
    coverUrl: 'https://uploads.mangadex.org/covers/73f00a6a-dc33-49f6-beb0-98feb29ce0cc/48f83bf3-2493-411b-a7c2-4242a39887f5.jpg.512.jpg',
    status: 'Ongoing',
    score: '9.3',
    year: '2024',
    author: 'Gwon Gyeoul',
    artist: 'Shojo Studio',
    tags: ['Manhwa', 'Webtoon', 'Fantasy', 'Romance', 'Drama', 'Reincarnation'],
    description: 'Fulfilling the final dying wish of her one and only true friend, she entered a contract marriage to look after and protect the two children left behind. Enduring seven long years of social judgment, loneliness, and the deep resentment of her stepsons, she strictly honors the agreement. The moment they come of age, she walks away to start fresh. But just as she begins her second life, figures from her past start tracking her down!',
    source: 'kingofshojo.com',
  },
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
    coverUrl: 'https://uploads.mangadex.org/covers/0ba6b85e-3e87-454a-b81d-1040468248e1/11023c20-0bdd-48df-bb5d-7f451a109a26.jpg.512.jpg',
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
    coverUrl: 'https://uploads.mangadex.org/covers/ade0306c-f4b6-4890-9edb-1ddf04df2039/fe76445d-387f-4ff6-8340-f06403c20dbe.jpg.512.jpg',
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
    coverUrl: 'https://uploads.mangadex.org/covers/9a414441-bbad-43f1-a3a7-dc262ca790a3/be18dc9a-7f1c-4ca5-b318-ffff2d7d58c3.jpg.512.jpg',
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

  const rawQ = query.trim().toLowerCase();
  const cleanQ = rawQ.replace(/['’"”`]/g, '').replace(/[-_:]/g, ' ');
  const tokens = cleanQ.split(/\s+/).filter(Boolean);
  const stopWords = new Set(['the', 'a', 'an', 'her', 'his', 'of', 'in', 'to', 'for', 's']);
  const meaningfulTokens = tokens.filter((t) => !stopWords.has(t));

  // 1. Check curated catalog
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

    const cleanCorpus = textCorpus.replace(/['’"”`]/g, '').replace(/[-_:]/g, ' ');
    const collapsedCorpus = cleanCorpus.replace(/\s+/g, '');
    const collapsedQ = cleanQ.replace(/\s+/g, '');

    // Direct inclusion
    if (textCorpus.includes(rawQ) || cleanCorpus.includes(cleanQ)) return true;

    // Collapsed match (handles "step mother" vs "stepmother")
    if (collapsedCorpus.includes(collapsedQ) || collapsedQ.includes(collapsedCorpus)) return true;

    // All tokens present
    if (tokens.length > 0 && tokens.every((tok) => cleanCorpus.includes(tok))) return true;

    // Meaningful tokens match (ignoring stop words)
    if (meaningfulTokens.length >= 2 && meaningfulTokens.every((tok) => cleanCorpus.includes(tok) || collapsedCorpus.includes(tok))) {
      return true;
    }

    return false;
  });

  const results = matched.map((item) => ({
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
    sourceName: 'Webtoon',
  }));

  // 2. Query King of Shojo dynamically for expanded manhwa/webtoon titles
  try {
    const ksQuery = meaningfulTokens.length > 0 ? meaningfulTokens.slice(0, 3).join(' ') : rawQ;
    const ksUrl = `https://kingofshojo.com/?s=${encodeURIComponent(ksQuery)}&post_type=wp-manga`;
    const res = await fetch(ksUrl, { headers: HEADERS });
    if (res.ok) {
      const html = await res.text();
      const bsxMatches = [...html.matchAll(/<div class="bsx">[\s\S]*?<a\s+href="https:\/\/kingofshojo\.com\/manga\/([^"/]+)\/"\s+title="([^"]*)"[\s\S]*?<img\s+(?:data-)?src="([^"]+)"/gi)];
      
      const seenSlugs = new Set();
      // Don't duplicate items already matched in curated catalog
      if (results.some((r) => r.id === 'webtoon:stepmother-second-life')) {
        seenSlugs.add('the-despised-stepmother-begins-her-second-life');
      }

      for (const m of bsxMatches) {
        const slug = m[1];
        if (seenSlugs.has(slug)) continue;
        seenSlugs.add(slug);

        const title = decodeHtml(m[2].trim());
        const rawCover = m[3];
        const coverUrl = rawCover ? `/api/image-proxy?url=${encodeURIComponent(rawCover)}` : '';

        results.push({
          id: `webtoon:ks:${slug}`,
          slug,
          title,
          englishTitle: null,
          coverUrl,
          status: 'Ongoing',
          author: 'Shojo Creator',
          tags: ['Manhwa', 'Webtoon', 'Romance'],
          provider: 'webtoon',
          sourceName: 'Webtoon',
        });
      }
    }
  } catch {
    // Dynamic lookup failed, return curated catalog results
  }

  return results;
}

/**
 * Fetch Details & Chapters for Webtoon
 */
export async function getWebtoonDetails(id, bypassCache = false) {
  if (id === 'webtoon:stepmother-second-life') {
    return getStepmotherSecondLifeDetails(bypassCache);
  }
  if (id === 'webtoon:fortune-telling-princess') {
    return getFortuneTellingPrincessDetails(bypassCache);
  }
  if (id === 'webtoon:solo-leveling') {
    return getSoloLevelingDetails();
  }
  if (id === 'webtoon:omniscient-reader') {
    return getOmniscientReaderDetails();
  }

  // Handle generic King of Shojo webtoon
  if (id.startsWith('webtoon:ks:')) {
    const slug = id.replace('webtoon:ks:', '');
    return getKingOfShojoDetails(slug, bypassCache);
  }

  // Fallback to catalog entry
  const entry = WEBTOON_CATALOG.find((w) => w.id === id);
  if (entry) {
    return {
      ...entry,
      chapters: [],
      totalChapters: 0,
      sourceName: 'Webtoon',
    };
  }
  return null;
}

/**
 * Scraper for The Despised Stepmother Begins Her Second Life
 */
async function getStepmotherSecondLifeDetails(bypassCache = false) {
  const cacheKey = 'details_stepmother_all';
  if (!bypassCache) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  const entry = WEBTOON_CATALOG.find((w) => w.id === 'webtoon:stepmother-second-life');

  try {
    const res = await fetch('https://kingofshojo.com/manga/the-despised-stepmother-begins-her-second-life/', { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const chaptersMap = new Map();

    // 1. Primary: Match list items with data-num and chapterdate
    const liMatches = [...html.matchAll(/<li[^>]*data-num="([^"]+)"[\s\S]*?<a[^>]+href="([^"]+)"[\s\S]*?<span class="chapternum">([^<]*)<\/span>[\s\S]*?<span class="chapterdate">([^<]*)<\/span>/gi)];
    for (const m of liMatches) {
      const num = m[1];
      if (num.includes('{{')) continue;
      const url = m[2];
      const chapName = m[3].trim();
      const date = m[4].trim();

      if (!chaptersMap.has(num)) {
        chaptersMap.set(num, {
          id: `webtoon:stepmother:${num}`,
          chapter: num,
          title: chapName || `Chapter ${num}`,
          sourceUrl: url,
          publishedAt: date,
        });
      }
    }

    // 2. Fallback regex on chapter links if li extraction was empty
    if (chaptersMap.size === 0) {
      const chapRegex = /<a[^>]+href="(https:\/\/kingofshojo\.com\/the-despised-stepmother-begins-her-second-life-chapter-([0-9.]+)\/)"[^>]*>/gi;
      let m;
      while ((m = chapRegex.exec(html)) !== null) {
        const chapUrl = m[1];
        const num = m[2];
        if (!chaptersMap.has(num)) {
          chaptersMap.set(num, {
            id: `webtoon:stepmother:${num}`,
            chapter: num,
            title: `Chapter ${num}`,
            sourceUrl: chapUrl,
          });
        }
      }
    }

    const chapters = Array.from(chaptersMap.values()).sort(
      (a, b) => parseFloat(b.chapter) - parseFloat(a.chapter)
    );

    const result = {
      ...entry,
      chapters,
      totalChapters: chapters.length,
      sourceName: 'Webtoon',
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error('getStepmotherSecondLifeDetails error:', err);
    // Fallback chapters up to 35
    const fallbackChapters = [];
    for (let i = 35; i >= 1; i--) {
      fallbackChapters.push({
        id: `webtoon:stepmother:${i}`,
        chapter: String(i),
        title: `Chapter ${i}`,
        sourceUrl: `https://kingofshojo.com/the-despised-stepmother-begins-her-second-life-chapter-${i}/`,
      });
    }
    return {
      ...entry,
      chapters: fallbackChapters,
      totalChapters: fallbackChapters.length,
      sourceName: 'Webtoon',
    };
  }
}

/**
 * Generic Details scraper for King of Shojo
 */
async function getKingOfShojoDetails(slug, bypassCache = false) {
  const cacheKey = `details_ks_${slug}`;
  if (!bypassCache) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  try {
    const url = `https://kingofshojo.com/manga/${slug}/`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const titleMatch = html.match(/<h1[^>]*class="entry-title"[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? decodeHtml(titleMatch[1].replace(/<[^>]+>/g, '').replace(/\s*–\s*King.*|\|\s*King.*/i, '').trim()) : slug;

    const descMatch = html.match(/<div class="entry-content entry-content-single"[^>]*>([\s\S]*?)<\/div>/i) || html.match(/<meta property="og:description" content="([^"]*)"/i);
    const description = descMatch ? decodeHtml(descMatch[1].replace(/<[^>]+>/g, '').trim()) : 'Read this romantic fantasy manhwa.';

    const imgMatch = html.match(/<div class="thumb"[^>]*>[\s\S]*?<img[^>]+(?:src|data-src)="([^"]+)"/i);
    const coverUrl = imgMatch ? `/api/image-proxy?url=${encodeURIComponent(imgMatch[1])}` : '';

    const chaptersMap = new Map();

    // 1. Try structured li tags with dates
    const liMatches = [...html.matchAll(/<li[^>]*data-num="([^"]+)"[\s\S]*?<a[^>]+href="([^"]+)"[\s\S]*?<span class="chapternum">([^<]*)<\/span>[\s\S]*?<span class="chapterdate">([^<]*)<\/span>/gi)];
    for (const m of liMatches) {
      const num = m[1];
      if (num.includes('{{')) continue;
      const chUrl = m[2];
      const chName = m[3].trim();
      const date = m[4].trim();

      if (!chaptersMap.has(num)) {
        chaptersMap.set(num, {
          id: `webtoon:ks:${slug}:${num}`,
          chapter: num,
          title: chName || `Chapter ${num}`,
          sourceUrl: chUrl,
          publishedAt: date,
        });
      }
    }

    // 2. Fallback regex
    if (chaptersMap.size === 0) {
      const chRegex = new RegExp(`href="(https:\\/\\/kingofshojo\\.com\\/${slug}-chapter-([0-9.]+)\\/)"`, 'gi');
      let m;
      while ((m = chRegex.exec(html)) !== null) {
        const chUrl = m[1];
        const chNum = m[2];
        if (!chaptersMap.has(chNum)) {
          chaptersMap.set(chNum, {
            id: `webtoon:ks:${slug}:${chNum}`,
            chapter: chNum,
            title: `Chapter ${chNum}`,
            sourceUrl: chUrl,
          });
        }
      }
    }

    const chapters = Array.from(chaptersMap.values()).sort(
      (a, b) => parseFloat(b.chapter) - parseFloat(a.chapter)
    );

    const result = {
      id: `webtoon:ks:${slug}`,
      title,
      englishTitle: null,
      coverUrl,
      status: 'Ongoing',
      description,
      tags: ['Manhwa', 'Webtoon', 'Romance'],
      chapters,
      totalChapters: chapters.length,
      provider: 'webtoon',
      sourceName: 'Webtoon',
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error('getKingOfShojoDetails error:', err);
    throw err;
  }
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
      sourceName: 'Webtoon',
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
      sourceName: 'Webtoon',
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
    sourceName: 'Webtoon',
  };
}

/**
 * Scraper for Omniscient Reader
 */
async function getOmniscientReaderDetails() {
  const entry = WEBTOON_CATALOG.find((w) => w.id === 'webtoon:omniscient-reader');
  const cacheKey = 'orv_details_live';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  let chapters = [];
  try {
    const res = await fetchWithTimeout('https://w1.omniscientreadersviewpoint.com/', { headers: HEADERS }, 6000);
    if (res.ok) {
      const html = await res.text();
      const matches = [...html.matchAll(/href="(https:\/\/w1\.omniscientreadersviewpoint\.com\/manga\/omniscient-readers-viewpoint-chapter-([^"/]+)\/)"/gi)];
      const seen = new Set();
      for (const m of matches) {
        const url = m[1];
        const num = m[2];
        if (seen.has(num)) continue;
        seen.add(num);
        chapters.push({
          id: `webtoon:orv:${num}`,
          chapter: num,
          title: `Chapter ${num}`,
          sourceUrl: url,
        });
      }
      chapters.sort((a, b) => (parseFloat(b.chapter) || 0) - (parseFloat(a.chapter) || 0));
    }
  } catch (err) {
    console.warn('Live ORV fetch error, using generated 311 chapters fallback:', err.message);
  }

  if (chapters.length === 0) {
    for (let i = 311; i >= 1; i--) {
      chapters.push({
        id: `webtoon:orv:${i}`,
        chapter: String(i),
        title: `Chapter ${i}`,
        sourceUrl: `https://w1.omniscientreadersviewpoint.com/manga/omniscient-readers-viewpoint-chapter-${i}/`,
      });
    }
  }

  const result = {
    ...entry,
    chapters,
    totalChapters: chapters.length,
    sourceName: 'Webtoon',
  };

  setCache(cacheKey, result);
  return result;
}

/**
 * Get Pages for a Webtoon Chapter
 */
export async function getWebtoonChapterPages(chapterId) {
  const cacheKey = `webtoon_pages_${chapterId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Handle Stepmother Second Life
  if (chapterId.startsWith('webtoon:stepmother:')) {
    const num = chapterId.replace('webtoon:stepmother:', '');
    const url = `https://kingofshojo.com/the-despised-stepmother-begins-her-second-life-chapter-${num}/`;
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();

      const allImgs = [...html.matchAll(/<img[^>]+(?:src|data-src)="([^"]+)"/gi)].map(m => m[1]);
      const pages = allImgs
        .filter(u => u.includes('king-bucket') && !u.includes('images/jppppp'))
        .map((imgUrl, idx) => ({
          pageNumber: idx + 1,
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
    } catch (err) {
      console.error('getWebtoonChapterPages error for stepmother:', err);
      throw err;
    }
  }

  // Handle generic King of Shojo chapter
  if (chapterId.startsWith('webtoon:ks:')) {
    const parts = chapterId.replace('webtoon:ks:', '').split(':');
    const slug = parts[0];
    const num = parts[1];
    const url = `https://kingofshojo.com/${slug}-chapter-${num}/`;
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();

      const allImgs = [...html.matchAll(/<img[^>]+(?:src|data-src)="([^"]+)"/gi)].map(m => m[1]);
      const pages = allImgs
        .filter(u => u.includes('king-bucket') || u.includes('/chapter/'))
        .map((imgUrl, idx) => ({
          pageNumber: idx + 1,
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
    } catch (err) {
      console.error('getWebtoonChapterPages error for ks:', err);
      throw err;
    }
  }

  // Handle A Fortune-Telling Princess
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
  if (chapterId.startsWith('webtoon:solo:') || chapterId.startsWith('webtoon:solo-leveling:')) {
    const num = chapterId.match(/([0-9.]+)/)?.[1] || '1';
    const url = `https://readsololeveling.org/chapter/solo-leveling-chapter-${num}/`;
    try {
      const res = await fetchWithTimeout(url, { headers: HEADERS }, 6500);
      if (res.ok) {
        const html = await res.text();
        const pageRegex = /<img[^>]+(?:src|data-src)="([^"]+(?:sololeveling|wp-content|chapter|file)[^"]+)"/gi;
        const pages = [...html.matchAll(pageRegex)]
          .map((m) => m[1])
          .filter((u) => !u.startsWith('data:') && !u.includes('logo') && !u.includes('avatar'))
          .map((imgUrl, idx) => ({
            pageNumber: idx + 1,
            url: `/api/image-proxy?url=${encodeURIComponent(imgUrl)}`,
            originalUrl: imgUrl,
          }));

        if (pages.length > 0) {
          const result = { chapterId, totalPages: pages.length, pages };
          setCache(cacheKey, result);
          return result;
        }
      }
    } catch (e) {
      console.warn('Solo Leveling primary fetch failed, falling back:', e.message);
    }

    // Fallback: WeebCentral Solo Leveling
    try {
      const { getWeebCentralDetails, getWeebCentralChapterPages } = await import('./weebcentralProvider.js');
      const wcDetails = await getWeebCentralDetails('01J76XYCPSY3C4BNPBRY8JMCBE');
      const targetCh = wcDetails?.chapters?.find((c) => String(c.chapter) === String(num));
      if (targetCh) {
        const wcPages = await getWeebCentralChapterPages(targetCh.id.replace('wc_ch:', ''));
        if (wcPages?.pages?.length > 0) {
          const result = { chapterId, totalPages: wcPages.pages.length, pages: wcPages.pages };
          setCache(cacheKey, result);
          return result;
        }
      }
    } catch (wcErr) {
      console.warn('WeebCentral Solo Leveling fallback warning:', wcErr.message);
    }
  }

  // Handle Omniscient Reader's Viewpoint
  if (
    chapterId.startsWith('webtoon:orv:') ||
    chapterId.startsWith('webtoon:omniscient-reader:') ||
    chapterId.startsWith('webtoon:omniscient-readers-viewpoint:')
  ) {
    const num = chapterId.match(/([0-9.]+)/)?.[1] || '1';

    // 1. Try Asura Scans first (fast, HD webp images)
    try {
      const asuraUrl = `https://asurascans.com/comics/omniscient-readers-viewpoint-11fe7da3/chapter/${num}`;
      const asuraRes = await fetchWithTimeout(asuraUrl, { headers: HEADERS }, 6500);
      if (asuraRes.ok) {
        const html = await asuraRes.text();
        const allImgs = [...html.matchAll(/<img[^>]+(?:src|data-src)="([^"]+)"/gi)].map(m => m[1]);
        const chapterImages = allImgs.filter(u => u.includes('asura-images/chapters'));
        if (chapterImages.length > 0) {
          const pages = chapterImages.map((imgUrl, idx) => ({
            pageNumber: idx + 1,
            url: `/api/image-proxy?url=${encodeURIComponent(imgUrl)}`,
            originalUrl: imgUrl,
          }));
          const result = { chapterId, totalPages: pages.length, pages, sourceName: 'Asura Scans' };
          setCache(cacheKey, result);
          return result;
        }
      }
    } catch (e) {
      console.warn(`Asura ORV fetch failed for ch ${num}, trying secondary source:`, e.message);
    }

    // 2. Secondary source (w1.omniscientreadersviewpoint.com)
    try {
      const orvUrl = `https://w1.omniscientreadersviewpoint.com/manga/omniscient-readers-viewpoint-chapter-${num}/`;
      const res = await fetchWithTimeout(orvUrl, { headers: HEADERS }, 7000);
      if (res.ok) {
        const html = await res.text();
        const allImgs = [...html.matchAll(/<img[^>]+(?:src|data-src)="([^"]+)"/gi)].map(m => m[1]);
        const chapterImages = allImgs.filter(u =>
          !u.includes('logo') &&
          !u.includes('avatar') &&
          !u.includes('favicon') &&
          !u.includes('cover') &&
          (u.includes('lowee.us') || u.includes('wp-content/uploads') || u.includes('omniscient') || u.includes('/chapter'))
        );
        if (chapterImages.length > 0) {
          const pages = chapterImages.map((imgUrl, idx) => ({
            pageNumber: idx + 1,
            url: `/api/image-proxy?url=${encodeURIComponent(imgUrl)}`,
            originalUrl: imgUrl,
          }));
          const result = { chapterId, totalPages: pages.length, pages, sourceName: 'Webtoon' };
          setCache(cacheKey, result);
          return result;
        }
      }
    } catch (err) {
      console.error(`Secondary ORV fetch error for ch ${num}:`, err.message);
    }

    throw new Error(`Failed to load pages for Omniscient Reader chapter ${num}`);
  }

  throw new Error(`Unsupported webtoon chapter: ${chapterId}`);
}
