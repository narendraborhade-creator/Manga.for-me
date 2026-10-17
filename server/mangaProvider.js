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

// Curated Top Masterpieces for Spotlight
export const FEATURED_MANGA = [
  {
    id: '2/one-piece',
    title: 'One Piece',
    coverUrl: 'https://cdn.readdetectiveconan.com/file/mangapill/i/2.webp?h=01971742-5d7f-7f32-8d2b-d038279f8a73',
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
    coverUrl: 'https://cdn.readdetectiveconan.com/file/mangapill/i/1.jpeg',
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
    coverUrl: 'https://cdn.readdetectiveconan.com/file/mangapill/i/723.jpeg',
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
    coverUrl: 'https://cdn.readdetectiveconan.com/file/mangapill/i/2085.jpeg',
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
    coverUrl: 'https://cdn.readdetectiveconan.com/file/mangapill/i/7486.jpeg',
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
    coverUrl: 'https://cdn.readdetectiveconan.com/file/mangapill/i/7529.jpeg',
    status: 'Ongoing',
    score: '8.9',
    year: '2023',
    author: 'Takeru Hokazono',
    description: 'Chihiro spends his days training under his swordsmith father until tragedy strikes. Armed with an enchanted katana, his quest for vengeance begins.',
    tags: ['Action', 'Supernatural', 'Swordplay'],
  },
];

/**
 * Fetch Popular / Trending Manga with 100% accurate card-by-card matching
 */
export async function getPopularManga() {
  const cached = getCached('popular_manga_v3');
  if (cached) return cached;

  try {
    const res = await fetch(BASE_URL, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // In MangaPill homepage, each card contains cover image and a link to manga with 1 or 2 divs (original title and optional english title)
    const homeCardRegex = /<img\s+(?:data-)?src="([^"]+)"\s+alt="([^"]+)"[\s\S]*?<a\s+href="\/manga\/([0-9]+\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;

    let m;
    const list = [];
    const seen = new Set();

    while ((m = homeCardRegex.exec(html)) !== null) {
      const coverUrl = m[1];
      const id = m[3];
      const innerA = m[4];

      if (seen.has(id)) continue;
      seen.add(id);

      const divs = [...innerA.matchAll(/<div[^>]*>([\s\S]*?)<\/div>/gi)].map((d) => d[1].replace(/<[^>]+>/g, '').trim());
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
        tags: ['Manga', 'Trending'],
        provider: 'mangapill',
      });
    }

    // Combine with featured masterpieces if list is short
    const merged = [...list];
    FEATURED_MANGA.forEach((feat) => {
      if (!seen.has(feat.id)) {
        merged.push({
          ...feat,
          englishTitle: feat.englishTitle || null,
        });
        seen.add(feat.id);
      }
    });

    setCache('popular_manga_v3', merged);
    return merged;
  } catch (error) {
    console.error('getPopularManga error:', error);
    return FEATURED_MANGA;
  }
}

/**
 * Search Manga by Title with 100% accurate card-by-card matching
 */
export async function searchManga(query = '') {
  if (!query || !query.trim()) return getPopularManga();

  const cacheKey = `search_v3_${query.trim().toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/search?q=${encodeURIComponent(query.trim())}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // In MangaPill search results, each card has:
    // 1) <a href="/manga/([0-9]+\/[^"]+)" class="relative block"[^>]*> ... <img (data-)?src="([^"]+)"
    // 2) Inside the same card container: <a href="/manga/\1" class="mb-2">([\s\S]*?)</a>
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

    setCache(cacheKey, list);
    return list;
  } catch (error) {
    console.error('searchManga error:', error);
    return [];
  }
}

/**
 * Get Manga Details & Complete Chapters List
 */
export async function getMangaDetails(mangaId) {
  const cacheKey = `details_v3_${mangaId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/manga/${mangaId}`;
    const res = await fetch(url, { headers: HEADERS });
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
      const numMatch = titleAttr.match(/Chapter\s+([0-9.]+)/i);
      const chapterNum = numMatch ? numMatch[1] : titleAttr.replace(/Chapter/i, '').trim();

      chapters.push({
        id: chapterId,
        chapter: chapterNum || 'Special',
        title: titleAttr,
      });
    }

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
    console.error('getMangaDetails error:', error);
    return null;
  }
}

/**
 * Get Complete Real Pages for a Chapter
 */
export async function getChapterPages(chapterId) {
  const cacheKey = `chapter_v2_${chapterId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/chapters/${chapterId}`;
    const res = await fetch(url, { headers: HEADERS });
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
      // Proxied URL so browser never gets 403 / CORS block
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
    console.error('getChapterPages error:', error);
    throw error;
  }
}

/**
 * Proxy Image with proper Referer to bypass CDN hotlink protection
 */
export async function proxyImage(imageUrl, res) {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': `${BASE_URL}/`,
      },
    });

    if (!response.ok) {
      res.statusCode = response.status;
      res.end(`Image fetch failed: ${response.status}`);
      return;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');

    const buffer = await response.arrayBuffer();
    res.end(Buffer.from(buffer));
  } catch (err) {
    console.error('proxyImage error:', err);
    res.statusCode = 500;
    res.end('Proxy error');
  }
}
