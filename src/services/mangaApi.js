/**
 * Frontend Manga API Client
 * Connects to the integrated complete manga provider with automatic fallback protection
 */

export const FALLBACK_MANGA_CATALOG = [
  {
    id: '2/one-piece',
    title: 'One Piece',
    englishTitle: 'One Piece',
    coverUrl: 'https://uploads.mangadex.org/covers/a1c7c817-4e59-43b7-9365-09675a149a6f/2f4aca53-64c7-46ac-ae85-3bc9b3169890.png.512.jpg',
    status: 'Ongoing',
    score: '9.3',
    year: '1997',
    author: 'Eiichiro Oda',
    description: 'Gol D. Roger was known as the "Pirate King", the strongest and most infamous being to have sailed the Grand Line. Monkey D. Luffy sets sail in search of the legendary One Piece treasure!',
    tags: ['Action', 'Adventure', 'Fantasy', 'Shounen'],
    sourceName: 'MangaPill',
    chapters: [
      { id: '2-11100000/one-piece-chapter-1110', chapter: '1110', title: 'Falling Stars' },
      { id: '2-11090000/one-piece-chapter-1109', chapter: '1109', title: 'Interception' },
      { id: '2-11080000/one-piece-chapter-1108', chapter: '1108', title: 'World, Please Respond' },
      { id: '2-10000000/one-piece-chapter-1', chapter: '1', title: 'Romance Dawn' }
    ]
  },
  {
    id: '1/berserk',
    title: 'Berserk',
    englishTitle: 'Berserk',
    coverUrl: 'https://uploads.mangadex.org/covers/dc332d04-d3b0-413c-a767-70f5e451b031/21c2aa50-53d2-4924-881b-826b9a1bca3b.jpg.512.jpg',
    status: 'Ongoing',
    score: '9.5',
    year: '1989',
    author: 'Kentaro Miura',
    description: 'Guts, known as the Black Swordsman, seeks sanctuary from demonic forces that pursue him and vengeance against the man who branded him an unholy sacrifice.',
    tags: ['Action', 'Dark Fantasy', 'Horror', 'Seinen'],
    sourceName: 'MangaPill',
    chapters: [
      { id: '1-10375000/berserk-chapter-375', chapter: '375', title: 'The Crescent Moon' },
      { id: '1-10001000/berserk-chapter-1', chapter: '1', title: 'The Black Swordsman' }
    ]
  },
  {
    id: 'webtoon:solo-leveling',
    title: 'Solo Leveling',
    englishTitle: 'Solo Leveling (Only I Level Up)',
    coverUrl: 'https://uploads.mangadex.org/covers/ade0306c-f4b6-4890-9edb-1ddf04df2039/fe76445d-387f-4ff6-8340-f06403c20dbe.jpg.512.jpg',
    status: 'Completed',
    score: '9.6',
    year: '2018',
    author: 'Chugong & DUBU (REDICE)',
    description: '10 years ago, after "the Gate" that connected the real world with the monster world opened, ordinary hunter Sung Jin-woo receives a quest log that only he can see!',
    tags: ['Action', 'Fantasy', 'Supernatural', 'Manhwa'],
    sourceName: 'Webtoon',
    chapters: [
      { id: 'webtoon:solo-leveling:200', chapter: '200', title: 'Epilogue 21' },
      { id: 'webtoon:solo-leveling:1', chapter: '1', title: 'Prologue' }
    ]
  },
  {
    id: 'webtoon:fortune-telling-princess',
    aliases: ['webtoon:a-fortune-telling-princess'],
    title: 'A Fortune-Telling Princess',
    englishTitle: 'A Fortune-Telling Princess',
    coverUrl: 'https://uploads.mangadex.org/covers/0ba6b85e-3e87-454a-b81d-1040468248e1/11023c20-0bdd-48df-bb5d-7f451a109a26.jpg.512.jpg',
    status: 'Ongoing',
    score: '9.2',
    year: '2023',
    author: 'Gimgae & Saidin',
    description: 'I was a prophetess who was revered as a living god in my past life. But after dying a tragic death, I was reincarnated as the neglected fifth princess of the imperial family.',
    tags: ['Romance', 'Fantasy', 'Shoujo', 'Reincarnation'],
    sourceName: 'Webtoon',
    chapters: [
      { id: 'webtoon:a-fortune-telling-princess:110', chapter: '110', title: 'Chapter 110' },
      { id: 'webtoon:a-fortune-telling-princess:109', chapter: '109', title: 'Chapter 109' },
      { id: 'webtoon:a-fortune-telling-princess:1', chapter: '1', title: 'Chapter 1' }
    ]
  },
  {
    id: 'webtoon:stepmother-second-life',
    aliases: [
      'webtoon:the-step-mothers-began-her-second-life',
      'wc:01j76xy74zfsrkyp568q0e43q1-the-step-mother-began-her-second-life'
    ],
    title: 'The Despised Stepmother Begins Her Second Life',
    englishTitle: "The Step Mother's Began Her Second Life",
    coverUrl: 'https://uploads.mangadex.org/covers/73f00a6a-dc33-49f6-beb0-98feb29ce0cc/48f83bf3-2493-411b-a7c2-4242a39887f5.jpg.512.jpg',
    status: 'Ongoing',
    score: '9.3',
    year: '2024',
    author: 'Gwon Gyeoul',
    description: 'After dying from betrayal, she regresses back to the start of her second marriage with her stepchildren. This time, she will protect them and take control of her destiny!',
    tags: ['Romance', 'Drama', 'Fantasy', 'Regression'],
    sourceName: 'Webtoon',
    chapters: Array.from({ length: 35 }, (_, idx) => {
      const num = 35 - idx;
      return {
        id: `webtoon:stepmother:${num}`,
        chapter: String(num),
        title: `Chapter ${num}`,
      };
    })
  },
  {
    id: '723/chainsaw-man',
    title: 'Chainsaw Man',
    englishTitle: 'Chainsaw Man',
    coverUrl: 'https://uploads.mangadex.org/covers/e896c48c-3150-437d-ba57-d8567eb399ae/fa06e4e4-ef2a-477b-bfb6-a2a88793620b.jpg.512.jpg',
    status: 'Ongoing',
    score: '8.9',
    year: '2018',
    author: 'Tatsuki Fujimoto',
    description: 'Denji is a young man living in poverty with his chainsaw demon Pochita, until an unholy union transforms him into Chainsaw Man!',
    tags: ['Action', 'Supernatural', 'Gore', 'Shounen'],
    sourceName: 'MangaPill',
    chapters: [
      { id: '723-10156000/chainsaw-man-chapter-156', chapter: '156', title: 'Whir' },
      { id: '723-10001000/chainsaw-man-chapter-1', chapter: '1', title: 'Dog & Chainsaw' }
    ]
  },
  {
    id: '2085/jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    englishTitle: 'Jujutsu Kaisen',
    coverUrl: 'https://uploads.mangadex.org/covers/c52b2ce3-7f95-469c-96b0-479524fb7a1a/6d9134b2-21ea-4d02-ac2b-7c0d1c6a2aaa.jpg.512.jpg',
    status: 'Completed',
    score: '8.8',
    year: '2018',
    author: 'Gege Akutami',
    description: 'Yuji Itadori swallows a cursed talisman—the finger of Ryomen Sukuna—and becomes caught in the deadly world of Jujutsu Sorcerers.',
    tags: ['Action', 'Supernatural', 'Dark Fantasy'],
    sourceName: 'MangaPill',
    chapters: [
      { id: '2085-10271000/jujutsu-kaisen-chapter-271', chapter: '271', title: 'From Now On' },
      { id: '2085-10001000/jujutsu-kaisen-chapter-1', chapter: '1', title: 'Ryomen Sukuna' }
    ]
  },
  {
    id: '7486/boruto-two-blue-vortex',
    title: 'Boruto: Two Blue Vortex',
    englishTitle: 'Boruto: Two Blue Vortex',
    coverUrl: 'https://uploads.mangadex.org/covers/0b094aab-0cfb-4837-a49b-7267bdb86bec/baf472db-4658-46fb-8130-d4abdd43f171.jpg.512.jpg',
    status: 'Ongoing',
    score: '8.7',
    year: '2023',
    author: 'Masashi Kishimoto',
    description: 'Three years have passed since the fateful memory distortion. Boruto Uzumaki returns as a rogue warrior facing Omnipotence.',
    tags: ['Action', 'Ninja', 'Shounen'],
    sourceName: 'MangaPill',
    chapters: [
      { id: '7486-10008000/boruto-two-blue-vortex-chapter-8', chapter: '8', title: 'It Matters' },
      { id: '7486-10001000/boruto-two-blue-vortex-chapter-1', chapter: '1', title: 'Boruto' }
    ]
  },
  {
    id: '7529/kagurabachi',
    title: 'Kagurabachi',
    englishTitle: 'Kagurabachi',
    coverUrl: 'https://uploads.mangadex.org/covers/d65c0332-3764-4c89-84bd-b1a4e7278ad7/3edb80b9-dae6-4483-984d-2e7f8b02b702.jpg.512.jpg',
    status: 'Ongoing',
    score: '8.9',
    year: '2023',
    author: 'Takeru Hokazono',
    description: 'Chihiro spends his days training under his swordsmith father until tragedy strikes. Armed with an enchanted katana, his quest for vengeance begins.',
    tags: ['Action', 'Supernatural', 'Swordplay'],
    sourceName: 'MangaPill',
    chapters: [
      { id: '7529-10025000/kagurabachi-chapter-25', chapter: '25', title: 'Transaction' },
      { id: '7529-10001000/kagurabachi-chapter-1', chapter: '1', title: 'Mission' }
    ]
  },
  {
    id: 'webtoon:omniscient-reader',
    aliases: ['webtoon:omniscient-readers-viewpoint', 'asura:omniscient-readers-viewpoint-11fe7da3'],
    title: "Omniscient Reader's Viewpoint",
    englishTitle: "Omniscient Reader's Viewpoint",
    coverUrl: 'https://uploads.mangadex.org/covers/9a414441-bbad-43f1-a3a7-dc262ca790a3/be18dc9a-7f1c-4ca5-b318-ffff2d7d58c3.jpg.512.jpg',
    status: 'Ongoing',
    score: '9.8',
    year: '2020',
    author: 'sing N song & Sleepy-C',
    description: 'Dokja was an average office worker whose sole interest was reading his favorite web novel. But when the novel suddenly becomes reality, he is the only person who knows how the world will end.',
    tags: ['Action', 'Fantasy', 'Apocalypse', 'Manhwa'],
    sourceName: 'Asura Scans',
    chapters: Array.from({ length: 311 }, (_, i) => {
      const chNum = 311 - i;
      return {
        id: `webtoon:orv:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'asura:surviving-the-game-as-a-barbarian-11fe7da3',
    title: 'Surviving The Game as a Barbarian',
    englishTitle: 'Surviving The Game as a Barbarian',
    coverUrl: 'https://cdn.asurascans.com/asura-images/covers/surviving-the-game-as-a-barbarian.86af24-400.webp',
    status: 'Ongoing',
    score: '9.7',
    year: '2023',
    author: 'Asura Scans',
    description: 'Entering the dungeon of the dark fantasy RPG Dungeon and Stone that no one has ever cleared.',
    tags: ['Action', 'Fantasy', 'Manhwa', 'Asura'],
    sourceName: 'Asura Scans',
    chapters: Array.from({ length: 165 }, (_, i) => {
      const chNum = 165 - i;
      return {
        id: `asura_ch:surviving-the-game-as-a-barbarian-11fe7da3:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  },
  {
    id: 'vortex:regressing-as-the-reincarnated-bastard',
    title: 'Regressing as the Reincarnated Bastard of the Sword Clan',
    englishTitle: 'Regressing as the Reincarnated Bastard of the Sword Clan',
    coverUrl: 'https://i0.wp.com/storage.vortexscans.org/upload/series/banner/4/7f6da000-9781-4d10-baee-0f6426996786.png?w=768&quality=50&strip=all&ssl=1',
    status: 'Ongoing',
    score: '9.6',
    year: '2023',
    author: 'Vortex Scans',
    description: 'Reincarnated as a bastard of the empires greatest sword family, surviving against all odds.',
    tags: ['Action', 'Reincarnation', 'Sword', 'Manhwa'],
    sourceName: 'Vortex Scans',
    chapters: Array.from({ length: 117 }, (_, i) => {
      const chNum = 117 - i;
      return {
        id: `vortex_ch:regressing-as-the-reincarnated-bastard:${chNum}`,
        chapter: String(chNum),
        title: `Chapter ${chNum}`,
      };
    })
  }
];

// High-speed client-side memory cache with 5-minute TTL
const clientCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getClientCached(key) {
  const item = clientCache.get(key);
  if (!item) return null;
  if (Date.now() - item.time > CACHE_TTL_MS) {
    clientCache.delete(key);
    return null;
  }
  return item.data;
}

function setClientCached(key, data) {
  clientCache.set(key, { data, time: Date.now() });
}

/**
 * Fetch Popular / Trending Manga
 */
export async function fetchPopularManga() {
  const cached = getClientCached('popular_manga');
  if (cached) return cached;

  try {
    const res = await fetch('/api/manga/popular');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const formatted = data.map(formatMangaItem);
      setClientCached('popular_manga', formatted);
      return formatted;
    }
    return FALLBACK_MANGA_CATALOG.map(formatMangaItem);
  } catch (err) {
    console.warn('fetchPopularManga network warning, using fallback catalog:', err);
    return FALLBACK_MANGA_CATALOG.map(formatMangaItem);
  }
}

/**
 * Search Manga with query
 */
export async function searchManga(query = '') {
  if (!query || !query.trim()) return fetchPopularManga();

  const cacheKey = `search_${query.trim().toLowerCase()}`;
  const cached = getClientCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `/api/manga/search?q=${encodeURIComponent(query.trim())}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const formatted = data.map(formatMangaItem);
      setClientCached(cacheKey, formatted);
      return formatted;
    }
  } catch (err) {
    console.warn('searchManga API warning, matching fallback:', err);
  }

  // Client-side fallback filter
  const q = query.toLowerCase().trim();
  const matched = FALLBACK_MANGA_CATALOG.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      (m.englishTitle && m.englishTitle.toLowerCase().includes(q))
  );
  return matched.map(formatMangaItem);
}

/**
 * Helper to check if an image needs proxying (skips MangaDex, Data URIs)
 */
function needsImageProxy(url) {
  if (!url) return false;
  if (url.startsWith('/api/image-proxy') || url.startsWith('data:')) return false;
  if (url.includes('mangadex.org') || url.includes('mangadex.network')) return false;
  return true;
}

/**
 * Robust HTML entity decoder
 */
export function decodeHtml(str) {
  if (!str || typeof str !== 'string') return '';
  let decoded = str
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&hellip;/gi, '…')
    .replace(/&lsquo;/gi, "‘")
    .replace(/&rsquo;/gi, "’")
    .replace(/&ldquo;/gi, '“')
    .replace(/&rdquo;/gi, '”')
    // Hex entities like &#x27; or &#X27;
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      try {
        return String.fromCodePoint(parseInt(hex, 16));
      } catch {
        return '';
      }
    })
    // Decimal entities like &#8217; or &#39;
    .replace(/&#([0-9]+);/g, (_, dec) => {
      try {
        return String.fromCodePoint(parseInt(dec, 10));
      } catch {
        return '';
      }
    });

  if (decoded.includes('&amp;') || decoded.includes('&#')) {
    decoded = decoded
      .replace(/&quot;/gi, '"')
      .replace(/&apos;/gi, "'")
      .replace(/&#039;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
        try {
          return String.fromCodePoint(parseInt(hex, 16));
        } catch {
          return '';
        }
      })
      .replace(/&#([0-9]+);/g, (_, dec) => {
        try {
          return String.fromCodePoint(parseInt(dec, 10));
        } catch {
          return '';
        }
      });
  }
  return decoded;
}

/**
 * Title cleaner: strips provider prefix tags (Vortex:, Asura:, etc.) and decodes entities
 */
export function cleanTitle(raw) {
  if (!raw || typeof raw !== 'string') return 'Manga';
  let t = decodeHtml(raw);

  // Strip source provider prefixes like "vortex:", "asura:", "webtoon:", "weebcentral:", "mangadex:", "mk:", "wc:"
  t = t.replace(/^(vortex|asura|webtoon|weebcentral|mangadex|mangakakalot|kakamanga|mangapill|wc|mk|md)\s*:\s*/i, '');

  // Strip Chapter trailing text or manga suffix
  t = t
    .replace(/Chapter\s+[0-9.]+/i, '')
    .replace(/\s+manga$/i, '')
    .trim();

  // Deduplicate repeating title segments like "Solo Leveling Solo Leveling"
  const words = t.split(/\s+/);
  const half = Math.floor(words.length / 2);
  if (words.length >= 2 && words.length % 2 === 0) {
    const firstHalf = words.slice(0, half).join(' ');
    const secondHalf = words.slice(half).join(' ');
    if (firstHalf.toLowerCase() === secondHalf.toLowerCase()) {
      t = firstHalf;
    }
  }

  // Normalize dashes/underscores if it was a raw slug
  if (t.includes('-') && !t.includes(' ')) {
    t = t.replace(/-/g, ' ');
  }
  t = t.replace(/\s+/g, ' ').trim();

  // Capitalize properly if all lowercase
  if (t === t.toLowerCase()) {
    t = t.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return t || 'Manga';
}

/**
 * Deduplicate chapter lists by normalized chapter number and ID
 * Prevents "double chapters" from multi-group scanlations or re-releases
 */
export function deduplicateChapters(chapters) {
  if (!Array.isArray(chapters)) return [];
  const seenNumbers = new Map();
  const seenIds = new Set();
  const result = [];

  for (const ch of chapters) {
    if (!ch || (!ch.id && !ch.chapter)) continue;

    // Check unique ID
    if (ch.id && seenIds.has(ch.id)) continue;
    if (ch.id) seenIds.add(ch.id);

    // Normalize chapter key
    let normKey = null;
    const parsedNum = parseFloat(ch.chapter);
    if (!isNaN(parsedNum)) {
      normKey = `num:${parsedNum}`;
    } else if (ch.chapter) {
      normKey = `str:${String(ch.chapter).toLowerCase().trim()}`;
    } else if (ch.title) {
      normKey = `title:${String(ch.title).toLowerCase().trim()}`;
    }

    if (normKey) {
      if (seenNumbers.has(normKey)) {
        // Double chapter found! Pick the one with richer title if available
        const existingIdx = seenNumbers.get(normKey);
        const existing = result[existingIdx];
        const existingTitle = (existing.title || '').toLowerCase();
        const curTitle = (ch.title || '').toLowerCase();
        const genericTitle = `chapter ${ch.chapter}`.toLowerCase();

        if (
          (existingTitle === genericTitle || !existingTitle) &&
          curTitle &&
          curTitle !== genericTitle
        ) {
          result[existingIdx] = ch;
        }
        continue;
      }
      seenNumbers.set(normKey, result.length);
    }

    result.push(ch);
  }

  // Sort descending by chapter number
  result.sort((a, b) => {
    const numA = parseFloat(a.chapter);
    const numB = parseFloat(b.chapter);
    if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
    return 0;
  });

  return result;
}

/**
 * Fetch Manga Details & Full Chapter List
 */
export async function fetchMangaDetails(mangaId, refresh = false) {
  const cacheKey = `details_${mangaId}`;
  if (!refresh) {
    const cached = getClientCached(cacheKey);
    if (cached) return cached;
  }

  try {
    const refreshQuery = refresh ? '&refresh=true' : '';
    const url = `/api/manga/details?id=${encodeURIComponent(mangaId)}${refreshQuery}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data) {
      if (data.title) data.title = cleanTitle(data.title);
      if (data.englishTitle) data.englishTitle = cleanTitle(data.englishTitle);
      if (data.description) data.description = decodeHtml(data.description);
      if (!data.author || !data.author.trim() || data.author.toLowerCase() === 'author') {
        data.author = 'Unknown Author';
      }
      if (data.coverUrl && needsImageProxy(data.coverUrl)) {
        data.coverUrl = `/api/image-proxy?url=${encodeURIComponent(data.coverUrl)}`;
      }
      if (Array.isArray(data.chapters)) {
        data.chapters = deduplicateChapters(data.chapters);
        data.totalChapters = data.chapters.length;
      }
      setClientCached(cacheKey, data);
    }
    return data;
  } catch (err) {
    console.warn('fetchMangaDetails API warning, checking fallback:', err);
    // 1. Try finding by ID or aliases
    let fallbackItem = FALLBACK_MANGA_CATALOG.find(
      (m) => m.id === mangaId || m.aliases?.includes(mangaId)
    );
    // 2. Try finding by title/slug tokens
    if (!fallbackItem) {
      const q = mangaId.toLowerCase().replace(/^wc:|^webtoon:|^md:/, '').replace(/[-_:]/g, ' ');
      fallbackItem = FALLBACK_MANGA_CATALOG.find((m) => {
        const titleQ = m.title.toLowerCase().replace(/[-_:]/g, ' ');
        return q.includes(titleQ) || titleQ.includes(q);
      });
    }
    if (fallbackItem) {
      const result = {
        ...fallbackItem,
        id: mangaId,
        title: cleanTitle(fallbackItem.title),
        englishTitle: fallbackItem.englishTitle ? cleanTitle(fallbackItem.englishTitle) : null,
        coverUrl: fallbackItem.coverUrl,
        chapters: fallbackItem.chapters || []
      };
      setClientCached(cacheKey, result);
      return result;
    }
    return null;
  }
}

/**
 * Fetch Smart Manga Recommendations / Suggestions
 */
export async function fetchMangaRecommendations(mangaId = '', genres = [], limit = 8) {
  const genresStr = Array.isArray(genres) ? genres.slice(0, 3).join(',') : String(genres || '');
  const cacheKey = `recs_${mangaId}_${genresStr}_${limit}`;
  const cached = getClientCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `/api/manga/recommendations?id=${encodeURIComponent(mangaId)}&genres=${encodeURIComponent(genresStr)}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list = (data?.recommendations || []).map(formatMangaItem).filter(Boolean);
    if (list.length > 0) {
      setClientCached(cacheKey, list);
      return list;
    }
    return FALLBACK_MANGA_CATALOG.slice(0, limit).map(formatMangaItem);
  } catch (err) {
    console.warn('fetchMangaRecommendations error:', err);
    return FALLBACK_MANGA_CATALOG.slice(0, limit).map(formatMangaItem);
  }
}

/**
 * Fetch Chapters for a Manga
 */
export async function fetchMangaChapters(mangaId, order = 'desc', refresh = false) {
  try {
    const details = await fetchMangaDetails(mangaId, refresh);
    if (!details || !details.chapters) return [];

    const chapters = [...details.chapters];
    chapters.sort((a, b) => {
      const numA = parseFloat(a.chapter);
      const numB = parseFloat(b.chapter);
      if (!isNaN(numA) && !isNaN(numB)) {
        if (numA !== numB) {
          return order === 'asc' ? numA - numB : numB - numA;
        }
      }
      return 0;
    });

    return chapters;
  } catch (err) {
    console.error('fetchMangaChapters failed:', err);
    return [];
  }
}

/**
 * Fetch All Real Pages for a Chapter
 */
export async function fetchChapterPages(chapterId) {
  try {
    const url = `/api/manga/read?chapterId=${encodeURIComponent(chapterId)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('fetchChapterPages failed:', err);
    throw err;
  }
}

export function getFallbackCover(title = 'Manga') {
  const clean = (title || 'Manga').slice(0, 24);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0b0e14"/>
        <stop offset="100%" stop-color="#1e1322"/>
      </linearGradient>
      <linearGradient id="acc" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f43f5e"/>
        <stop offset="100%" stop-color="#e11d48"/>
      </linearGradient>
    </defs>
    <rect width="400" height="600" fill="url(#bg)"/>
    <circle cx="200" cy="240" r="64" fill="url(#acc)" fill-opacity="0.15"/>
    <path d="M175 220h50M175 240h50M175 260h30" stroke="#f43f5e" stroke-width="4" stroke-linecap="round"/>
    <text x="200" y="360" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800">${clean.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
    <text x="200" y="390" text-anchor="middle" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" letter-spacing="1.5">MANGA UNIVERSE</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Format a Manga item into standard shape
 */
function formatMangaItem(item) {
  if (!item) return null;
  const safeTitle = cleanTitle(item.title);
  const safeEnglishTitle = item.englishTitle ? cleanTitle(item.englishTitle) : null;
  // Proxy cover image only if hotlinking bypass is required
  const proxiedCover = item.coverUrl
    ? (needsImageProxy(item.coverUrl) ? `/api/image-proxy?url=${encodeURIComponent(item.coverUrl)}` : item.coverUrl)
    : getFallbackCover(safeTitle);

  return {
    id: item.id,
    title: safeTitle,
    englishTitle: safeEnglishTitle,
    coverUrl: proxiedCover,
    rawCoverUrl: item.coverUrl,
    status: item.status || 'Ongoing',
    author: item.author && item.author.trim() ? decodeHtml(item.author) : 'Unknown Author',
    tags: (item.tags || ['Manga', 'Action']).map(decodeHtml),
    year: item.year || null,
    sourceName: item.sourceName || (
      item.id?.startsWith('md:') ? 'MangaDex' :
      item.id?.startsWith('asura:') ? 'Asura Scans' :
      item.id?.startsWith('vortex:') ? 'Vortex Scans' :
      item.id?.startsWith('wc:') ? 'WeebCentral' :
      item.id?.startsWith('mk:') ? 'MangaKakalot' :
      item.id?.startsWith('webtoon:') ? 'Webtoon' : 'MangaPill'
    ),
    provider: item.provider || (
      item.id?.startsWith('md:') ? 'mangadex' :
      item.id?.startsWith('asura:') ? 'asura' :
      item.id?.startsWith('vortex:') ? 'vortex' :
      item.id?.startsWith('wc:') ? 'weebcentral' :
      item.id?.startsWith('mk:') ? 'mangakakalot' :
      item.id?.startsWith('webtoon:') ? 'webtoon' : 'mangapill'
    ),
  };
}
