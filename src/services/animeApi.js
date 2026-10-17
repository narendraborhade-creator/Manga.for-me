const ANILIST_URL = 'https://graphql.anilist.co';

const MEDIA_FIELDS = `
  id
  title {
    romaji
    english
    native
  }
  coverImage {
    extraLarge
    large
    color
  }
  bannerImage
  description(asHtml: false)
  episodes
  duration
  status
  season
  seasonYear
  averageScore
  meanScore
  popularity
  genres
  studios(isMain: true) {
    nodes {
      name
    }
  }
  trailer {
    id
    site
    thumbnail
  }
  nextAiringEpisode {
    airingAt
    timeUntilAiring
    episode
  }
`;

/**
 * Execute GraphQL Query on AniList
 */
async function queryAniList(query, variables = {}) {
  try {
    const res = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      throw new Error(`AniList HTTP error: ${res.status}`);
    }

    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error('AniList API Error:', err);
    return null;
  }
}

/**
 * Clean & Format Anime object
 */
export const formatAnimeItem = (media) => {
  if (!media) return null;
  const title = media.title?.english || media.title?.romaji || media.title?.native || 'Untitled Anime';
  const cleanDesc = (media.description || 'No description available.')
    .replace(/<[^>]*>?/gm, '') // strip html tags
    .trim();

  let trailerUrl = null;
  if (media.trailer?.site === 'youtube' && media.trailer?.id) {
    trailerUrl = `https://www.youtube.com/embed/${media.trailer.id}?autoplay=1`;
  }

  const studio = media.studios?.nodes?.[0]?.name || 'Studio Unknown';

  return {
    id: media.id,
    title,
    romajiTitle: media.title?.romaji,
    nativeTitle: media.title?.native,
    coverUrl: media.coverImage?.extraLarge || media.coverImage?.large,
    bannerUrl: media.bannerImage || media.coverImage?.extraLarge,
    dominantColor: media.coverImage?.color || '#ef4444',
    description: cleanDesc,
    episodes: media.episodes || 'TBA',
    duration: media.duration ? `${media.duration} mins` : null,
    status: media.status || 'FINISHED',
    season: media.season ? `${media.season} ${media.seasonYear || ''}` : '',
    score: media.averageScore ? (media.averageScore / 10).toFixed(1) : 'N/A',
    popularity: media.popularity || 0,
    genres: media.genres || [],
    studio,
    trailer: media.trailer,
    trailerUrl,
    nextAiring: media.nextAiringEpisode,
  };
};

/**
 * Fetch Trending Anime
 */
export const fetchTrendingAnime = async (page = 1, perPage = 20) => {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: TRENDING_DESC) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const result = await queryAniList(query, { page, perPage });
  return (result?.Page?.media || []).map(formatAnimeItem);
};

/**
 * Fetch Top Rated Anime of All Time
 */
export const fetchTopAnime = async (page = 1, perPage = 20) => {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: SCORE_DESC) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const result = await queryAniList(query, { page, perPage });
  return (result?.Page?.media || []).map(formatAnimeItem);
};

/**
 * Fetch Popular This Season
 */
export const fetchSeasonalAnime = async (page = 1, perPage = 20) => {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: POPULARITY_DESC, status: RELEASING) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const result = await queryAniList(query, { page, perPage });
  return (result?.Page?.media || []).map(formatAnimeItem);
};

/**
 * Search Anime with keyword and genre
 */
export const searchAnime = async (search = '', genre = null, page = 1, perPage = 24) => {
  const query = `
    query ($search: String, $genre: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, search: $search, genre: $genre, sort: POPULARITY_DESC) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const vars = {
    page,
    perPage,
    search: search.trim() ? search.trim() : undefined,
    genre: genre || undefined,
  };
  const result = await queryAniList(query, vars);
  return (result?.Page?.media || []).map(formatAnimeItem);
};
