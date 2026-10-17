/**
 * Frontend Manga API Client
 * Connects to the integrated complete manga provider
 */

/**
 * Fetch Popular / Trending Manga
 */
export async function fetchPopularManga() {
  try {
    const res = await fetch('/api/manga/popular');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data || []).map(formatMangaItem);
  } catch (err) {
    console.error('fetchPopularManga failed:', err);
    return [];
  }
}

/**
 * Search Manga with query
 */
export async function searchManga(query = '') {
  try {
    const url = `/api/manga/search?q=${encodeURIComponent(query.trim())}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data || []).map(formatMangaItem);
  } catch (err) {
    console.error('searchManga failed:', err);
    return [];
  }
}

/**
 * Fetch Manga Details & Full Chapter List
 */
export async function fetchMangaDetails(mangaId) {
  try {
    const url = `/api/manga/details?id=${encodeURIComponent(mangaId)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && data.coverUrl && !data.coverUrl.startsWith('/api/image-proxy')) {
      data.coverUrl = `/api/image-proxy?url=${encodeURIComponent(data.coverUrl)}`;
    }
    return data;
  } catch (err) {
    console.error('fetchMangaDetails failed:', err);
    return null;
  }
}

/**
 * Fetch Chapters for a Manga
 */
export async function fetchMangaChapters(mangaId, order = 'desc') {
  try {
    const details = await fetchMangaDetails(mangaId);
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
  // Proxy cover image through our referer bypass proxy
  const proxiedCover = item.coverUrl
    ? (item.coverUrl.startsWith('/api/image-proxy') ? item.coverUrl : `/api/image-proxy?url=${encodeURIComponent(item.coverUrl)}`)
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
  };
}
