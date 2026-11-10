/**
 * Anime Streaming & Smart Player Client API
 * Integrates AniSkip OP/ED skip intervals, Multi-Server Stream Resolvers (Sub & Dub),
 * and official streaming directory feeds.
 */

import { getApiBaseUrl } from './mangaApi';

const skipCache = new Map();
const streamCache = new Map();

/**
 * Format raw seconds into MM:SS format (e.g. 62.76 -> 01:02)
 */
export function formatSecondsToTime(seconds) {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const paddedMins = String(mins).padStart(2, '0');
  const paddedSecs = String(secs).padStart(2, '0');
  return `${paddedMins}:${paddedSecs}`;
}

/**
 * Fetch Millisecond-Accurate AniSkip Timings (OP & ED)
 * @param {string|number} malId - MyAnimeList ID
 * @param {string|number} episode - Episode number
 * @param {number} [duration=0] - Total episode duration in seconds if known
 */
export async function fetchAnimeSkipTimes(malId, episode = 1, duration = 0) {
  if (!malId) return { found: false, op: null, ed: null };

  const cacheKey = `aniskip_${malId}_ep_${episode}`;
  if (skipCache.has(cacheKey)) {
    return skipCache.get(cacheKey);
  }

  const baseUrl = getApiBaseUrl();
  const url = baseUrl
    ? `${baseUrl}/api/anime/skip?malId=${encodeURIComponent(malId)}&ep=${encodeURIComponent(episode)}&duration=${duration}`
    : `/api/anime/skip?malId=${encodeURIComponent(malId)}&ep=${encodeURIComponent(episode)}&duration=${duration}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      skipCache.set(cacheKey, data);
      return data;
    }
  } catch (err) {
    console.warn('fetchAnimeSkipTimes warning, checking direct AniSkip:', err.message);
  }

  // Direct client fallback to AniSkip public endpoint
  try {
    const directUrl = `https://api.aniskip.com/v2/skip-times/${encodeURIComponent(malId)}/${encodeURIComponent(episode)}?types=op&types=ed&episodeLength=${duration || 0}`;
    const directRes = await fetch(directUrl, { signal: AbortSignal.timeout(5000) });
    if (directRes.ok) {
      const data = await directRes.json();
      let op = null;
      let ed = null;
      if (Array.isArray(data.results)) {
        for (const item of data.results) {
          if (item.skipType === 'op' && item.interval) {
            op = {
              startTime: item.interval.startTime,
              endTime: item.interval.endTime,
              duration: Math.round((item.interval.endTime - item.interval.startTime) * 10) / 10,
            };
          } else if (item.skipType === 'ed' && item.interval) {
            ed = {
              startTime: item.interval.startTime,
              endTime: item.interval.endTime,
              duration: Math.round((item.interval.endTime - item.interval.startTime) * 10) / 10,
            };
          }
        }
      }
      const formatted = {
        found: Boolean(op || ed),
        malId,
        episode,
        op,
        ed,
        results: data.results || [],
      };
      skipCache.set(cacheKey, formatted);
      return formatted;
    }
  } catch (directErr) {
    console.warn('Direct AniSkip fetch failed:', directErr.message);
  }

  return { found: false, op: null, ed: null };
}

/**
 * Fetch Multi-Server Stream Details with Sub and Dub Support
 * @param {string} title - Anime search title
 * @param {string|number} episode - Episode number
 * @param {string|number} malId - MyAnimeList ID
 * @param {boolean} [isDub=false] - Whether to request English Dub servers
 */
export async function fetchAnimeStreams(title, episode = 1, malId = null, isDub = false) {
  if (!title) return null;

  const cacheKey = `stream_${title}_ep_${episode}_dub_${isDub}`;
  if (streamCache.has(cacheKey)) {
    return streamCache.get(cacheKey);
  }

  const baseUrl = getApiBaseUrl();
  const qParams = new URLSearchParams({
    title,
    ep: String(episode),
    malId: String(malId || ''),
    dub: String(Boolean(isDub)),
  });

  const url = baseUrl
    ? `${baseUrl}/api/anime/stream?${qParams.toString()}`
    : `/api/anime/stream?${qParams.toString()}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      streamCache.set(cacheKey, data);
      return data;
    }
  } catch (err) {
    console.warn('fetchAnimeStreams API warning, building client fallback:', err.message);
  }

  // Client-side fallback server list
  const cleanTitle = title.replace(/[:;!?\(\)\[\]]/g, ' ').replace(/\s+/g, ' ').trim();
  const dubSuffix = isDub ? ' (Dub)' : ' (Sub)';
  const dubSearch = isDub ? `${cleanTitle} dub` : cleanTitle;
  const titleSlug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const fallbackData = {
    title: cleanTitle,
    episode: parseInt(episode, 10) || 1,
    isDub,
    malId,
    skipTimes: { found: false, op: null, ed: null },
    servers: [
      {
        id: 'hianime',
        name: `HiAnime / Zoro${dubSuffix}`,
        provider: 'HiAnime (HD-1)',
        quality: '1080p HD',
        audio: isDub ? 'English Dub' : 'Japanese Sub',
        badge: 'Recommended',
        speed: 'Ultra-Fast CDN',
        streamUrl: `https://hianime.to/search?keyword=${encodeURIComponent(dubSearch)}`,
        directWatchUrl: `https://hianime.to/search?keyword=${encodeURIComponent(dubSearch)}`,
      },
      {
        id: 'animepahe',
        name: 'AnimePahe',
        provider: 'AnimePahe (Compact)',
        quality: '1080p / 720p',
        audio: 'Multi-Audio',
        badge: 'Buffer-Free',
        speed: 'Small Filesize',
        streamUrl: `https://animepahe.ru/?q=${encodeURIComponent(cleanTitle)}`,
        directWatchUrl: `https://animepahe.ru/?q=${encodeURIComponent(cleanTitle)}`,
      },
      {
        id: 'allanime',
        name: `AllAnime${dubSuffix}`,
        provider: 'AllAnime Global',
        quality: '1080p HD',
        audio: isDub ? 'English Dub' : 'Japanese Sub',
        badge: 'Dual Audio',
        speed: 'Multi-Host',
        streamUrl: `https://allanime.to/search?keyword=${encodeURIComponent(dubSearch)}`,
        directWatchUrl: `https://allanime.to/search?keyword=${encodeURIComponent(dubSearch)}`,
      },
      {
        id: 'gogoanime',
        name: `GogoAnime${dubSuffix}`,
        provider: 'GogoAnime CDN',
        quality: '1080p / 720p',
        audio: isDub ? 'English Dub' : 'Japanese Sub',
        badge: 'Archive Mirror',
        speed: 'High-Capacity',
        streamUrl: isDub
          ? `https://anitaku.so/category/${titleSlug}-dub`
          : `https://anitaku.so/category/${titleSlug}`,
        directWatchUrl: isDub
          ? `https://anitaku.so/search.html?keyword=${encodeURIComponent(cleanTitle + ' (Dub)')}`
          : `https://anitaku.so/search.html?keyword=${encodeURIComponent(cleanTitle)}`,
      },
      {
        id: 'crunchyroll',
        name: 'Crunchyroll',
        provider: 'Official Simulcast',
        quality: 'Studio HD 1080p',
        audio: 'Licensed Simulcast',
        badge: 'Official',
        speed: 'Lossless Audio',
        streamUrl: `https://www.crunchyroll.com/search?q=${encodeURIComponent(cleanTitle)}`,
        directWatchUrl: `https://www.crunchyroll.com/search?q=${encodeURIComponent(cleanTitle)}`,
      },
    ],
  };

  streamCache.set(cacheKey, fallbackData);
  return fallbackData;
}
