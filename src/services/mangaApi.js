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
    aliases: ['webtoon:omniscient-readers-viewpoint'],
    title: "Omniscient Reader's Viewpoint",
    englishTitle: "Omniscient Reader's Viewpoint",
    coverUrl: 'https://uploads.mangadex.org/covers/9a414441-bbad-43f1-a3a7-dc262ca790a3/be18dc9a-7f1c-4ca5-b318-ffff2d7d58c3.jpg.512.jpg',
    status: 'Ongoing',
    score: '9.5',
    year: '2020',
    author: 'sing N song & Sleepy-C',
    description: 'Dokja was an average office worker whose sole interest was reading his favorite web novel. But when the novel suddenly becomes reality, he is the only person who knows how the world will end.',
    tags: ['Action', 'Fantasy', 'Apocalypse', 'Manhwa'],
    sourceName: 'Webtoon',
    chapters: [
      { id: 'webtoon:omniscient-readers-viewpoint:200', chapter: '200', title: 'Chapter 200' },
      { id: 'webtoon:omniscient-readers-viewpoint:1', chapter: '1', title: 'Chapter 1' }
    ]
  }
];

/**
 * Fetch Popular / Trending Manga
 */
export async function fetchPopularManga() {
  try {
    const res = await fetch('/api/manga/popular');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map(formatMangaItem);
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

  try {
    const url = `/api/manga/search?q=${encodeURIComponent(query.trim())}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map(formatMangaItem);
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
 * Helper to check if an image needs proxying (skips Unsplash, MangaDex, Data URIs)
 */
function needsImageProxy(url) {
  if (!url) return false;
  if (url.startsWith('/api/image-proxy') || url.startsWith('data:')) return false;
  if (url.includes('unsplash.com') || url.includes('mangadex.org')) return false;
  return true;
}

/**
 * Fetch Manga Details & Full Chapter List
 */
export async function fetchMangaDetails(mangaId, refresh = false) {
  try {
    const refreshQuery = refresh ? '&refresh=true' : '';
    const url = `/api/manga/details?id=${encodeURIComponent(mangaId)}${refreshQuery}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && data.coverUrl && needsImageProxy(data.coverUrl)) {
      data.coverUrl = `/api/image-proxy?url=${encodeURIComponent(data.coverUrl)}`;
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
      const q = mangaId.toLowerCase().replace(/^wc:|^webtoon:/, '').replace(/[-_:]/g, ' ');
      fallbackItem = FALLBACK_MANGA_CATALOG.find((m) => {
        const titleQ = m.title.toLowerCase().replace(/[-_:]/g, ' ');
        return q.includes(titleQ) || titleQ.includes(q);
      });
    }
    if (fallbackItem) {
      return {
        ...fallbackItem,
        id: mangaId,
        coverUrl: fallbackItem.coverUrl,
        chapters: fallbackItem.chapters || []
      };
    }
    return null;
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
      const numA = parseFloat(a.chapter) || 0;
      const numB = parseFloat(b.chapter) || 0;
      return order === 'asc' ? numA - numB : numB - numA;
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

/**
 * Format a Manga item into standard shape
 */
function formatMangaItem(item) {
  if (!item) return null;
  // Proxy cover image only if hotlinking bypass is required
  const proxiedCover = item.coverUrl
    ? (needsImageProxy(item.coverUrl) ? `/api/image-proxy?url=${encodeURIComponent(item.coverUrl)}` : item.coverUrl)
    : 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80';

  return {
    id: item.id,
    title: item.title,
    englishTitle: item.englishTitle || null,
    coverUrl: proxiedCover,
    rawCoverUrl: item.coverUrl,
    status: item.status || 'Ongoing',
    author: item.author || 'Manga Artist',
    tags: item.tags || ['Manga', 'Action'],
    year: item.year || null,
    sourceName: item.sourceName || (item.id?.startsWith('wc:') ? 'WeebCentral' : item.id?.startsWith('webtoon:') ? 'Webtoon' : 'MangaPill'),
    provider: item.provider || (item.id?.startsWith('wc:') ? 'weebcentral' : item.id?.startsWith('webtoon:') ? 'webtoon' : 'mangapill'),
  };
}
