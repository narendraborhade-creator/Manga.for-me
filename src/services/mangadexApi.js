const BASE_URL = 'https://api.mangadex.org';
const COVER_BASE_URL = 'https://uploads.mangadex.org/covers';

/**
 * Helper to extract title from localized title object
 */
export const getTitle = (titleObj, altTitles = []) => {
  if (!titleObj) return 'Untitled';
  if (titleObj.en) return titleObj.en;
  if (titleObj['ja-ro']) return titleObj['ja-ro'];
  if (titleObj.ja) return titleObj.ja;
  const firstVal = Object.values(titleObj)[0];
  if (firstVal) return firstVal;

  if (altTitles && altTitles.length > 0) {
    for (const alt of altTitles) {
      if (alt.en) return alt.en;
      if (alt['ja-ro']) return alt['ja-ro'];
    }
    const firstAlt = Object.values(altTitles[0])[0];
    if (firstAlt) return firstAlt;
  }
  return 'Untitled';
};

/**
 * Helper to extract description
 */
export const getDescription = (descObj) => {
  if (!descObj) return 'No synopsis available.';
  if (descObj.en) return descObj.en;
  const firstVal = Object.values(descObj)[0];
  return firstVal || 'No synopsis available.';
};

/**
 * Format a MangaDex manga item into a clean unified object
 */
export const formatMangaItem = (item) => {
  if (!item) return null;
  const { id, attributes, relationships = [] } = item;
  const title = getTitle(attributes.title, attributes.altTitles);
  const description = getDescription(attributes.description);

  // Extract cover art
  const coverRel = relationships.find((r) => r.type === 'cover_art');
  const coverFileName = coverRel?.attributes?.fileName;
  const coverUrl = coverFileName
    ? `${COVER_BASE_URL}/${id}/${coverFileName}.512.jpg`
    : `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect width="400" height="600" fill="#080a0f"/><text x="200" y="300" text-anchor="middle" fill="#f43f5e" font-family="sans-serif" font-size="20" font-weight="bold">MangaDex</text></svg>')}`;

  const authorRel = relationships.find((r) => r.type === 'author');
  const author = authorRel?.attributes?.name || 'Unknown Author';

  const tags = (attributes.tags || [])
    .map((t) => t.attributes?.name?.en)
    .filter(Boolean)
    .slice(0, 6);

  return {
    id,
    title,
    rawTitle: attributes.title,
    description,
    coverUrl,
    author,
    status: attributes.status || 'ongoing',
    year: attributes.year || null,
    tags,
    lastChapter: attributes.lastChapter || attributes.latestUploadedChapter || null,
    contentRating: attributes.contentRating,
  };
};

/**
 * Fetch Popular / Trending Manga
 */
export const fetchPopularManga = async (limit = 20, offset = 0) => {
  try {
    const url = `${BASE_URL}/manga?limit=${limit}&offset=${offset}&includes[]=cover_art&includes[]=author&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return (data.data || []).map(formatMangaItem);
  } catch (error) {
    console.error('fetchPopularManga failed:', error);
    return [];
  }
};

/**
 * Fetch Latest Updated Manga
 */
export const fetchLatestManga = async (limit = 20, offset = 0) => {
  try {
    const url = `${BASE_URL}/manga?limit=${limit}&offset=${offset}&includes[]=cover_art&includes[]=author&order[latestUploadedChapter]=desc&contentRating[]=safe&contentRating[]=suggestive`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return (data.data || []).map(formatMangaItem);
  } catch (error) {
    console.error('fetchLatestManga failed:', error);
    return [];
  }
};

/**
 * Fetch Top Rated Manga
 */
export const fetchTopRatedManga = async (limit = 20, offset = 0) => {
  try {
    const url = `${BASE_URL}/manga?limit=${limit}&offset=${offset}&includes[]=cover_art&includes[]=author&order[rating]=desc&contentRating[]=safe&contentRating[]=suggestive`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return (data.data || []).map(formatMangaItem);
  } catch (error) {
    console.error('fetchTopRatedManga failed:', error);
    return [];
  }
};

/**
 * Search Manga with query, optional tags, order
 */
export const searchManga = async (query = '', limit = 24, tags = []) => {
  try {
    let url = `${BASE_URL}/manga?limit=${limit}&includes[]=cover_art&includes[]=author&contentRating[]=safe&contentRating[]=suggestive`;
    if (query.trim()) {
      url += `&title=${encodeURIComponent(query.trim())}`;
    } else {
      url += `&order[followedCount]=desc`;
    }

    if (tags && tags.length > 0) {
      tags.forEach((tagId) => {
        url += `&includedTags[]=${tagId}`;
      });
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return (data.data || []).map(formatMangaItem);
  } catch (error) {
    console.error('searchManga failed:', error);
    return [];
  }
};

/**
 * Fetch Single Manga Details
 */
export const fetchMangaDetails = async (mangaId) => {
  try {
    const url = `${BASE_URL}/manga/${mangaId}?includes[]=cover_art&includes[]=author&includes[]=artist`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return formatMangaItem(data.data);
  } catch (error) {
    console.error('fetchMangaDetails failed:', error);
    return null;
  }
};

/**
 * Fetch Chapters feed for a manga
 * Supports translatedLanguage (default English 'en'), and sorts by chapter asc or desc
 */
export const fetchMangaChapters = async (mangaId, order = 'asc', limit = 300) => {
  try {
    const url = `${BASE_URL}/manga/${mangaId}/feed?translatedLanguage[]=en&order[chapter]=${order}&limit=${limit}&includes[]=scanlation_group&contentRating[]=safe&contentRating[]=suggestive`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    // Deduplicate chapters by chapter number if there are multiple scanlations
    const seenChapters = new Map();
    const formatted = [];

    (data.data || []).forEach((item) => {
      const chapterNum = item.attributes.chapter;
      // Skip if already seen exact chapter number and we want cleanest list
      const key = chapterNum ? `ch_${chapterNum}` : `id_${item.id}`;
      
      const scanGroup = item.relationships?.find((r) => r.type === 'scanlation_group');
      const groupName = scanGroup?.attributes?.name || 'MangaDex';

      const chapterObj = {
        id: item.id,
        chapter: chapterNum || 'Special',
        title: item.attributes.title || '',
        volume: item.attributes.volume || null,
        pages: item.attributes.pages || 0,
        publishedAt: item.attributes.publishAt,
        group: groupName,
      };

      if (!seenChapters.has(key)) {
        seenChapters.set(key, chapterObj);
        formatted.push(chapterObj);
      }
    });

    // Numerical sort fallback if string chapter numbers vary
    formatted.sort((a, b) => {
      const numA = parseFloat(a.chapter) || 0;
      const numB = parseFloat(b.chapter) || 0;
      return order === 'asc' ? numA - numB : numB - numA;
    });

    return formatted;
  } catch (error) {
    console.error('fetchMangaChapters failed:', error);
    return [];
  }
};

/**
 * Fetch Reader Pages for a Chapter using MangaDex@Home
 */
export const fetchChapterPages = async (chapterId, dataSaver = false) => {
  try {
    const url = `${BASE_URL}/at-home/server/${chapterId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    const baseUrl = data.baseUrl;
    const hash = data.chapter?.hash;
    const fileList = dataSaver ? data.chapter?.dataSaver : data.chapter?.data;

    if (!baseUrl || !hash || !fileList) {
      throw new Error('Incomplete chapter data received from MangaDex');
    }

    const folder = dataSaver ? 'data-saver' : 'data';
    const pages = fileList.map((fileName, index) => ({
      pageNumber: index + 1,
      fileName,
      url: `${baseUrl}/${folder}/${hash}/${fileName}`,
      fallbackUrl: `https://uploads.mangadex.org/${folder}/${hash}/${fileName}`,
    }));

    return {
      baseUrl,
      hash,
      pages,
      totalPages: pages.length,
    };
  } catch (error) {
    console.error('fetchChapterPages failed:', error);
    throw error;
  }
};
