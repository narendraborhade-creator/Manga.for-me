/**
 * AniSkip REST API Proxy & Cache
 * Returns exact millisecond opening (op) and ending (ed) timestamps for anime episodes
 * Endpoint: /api/anime/skip?malId=52299&ep=1
 */

const ANISKIP_BASE = 'https://api.aniskip.com/v2/skip-times';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const urlObj = new URL(req.url, 'http://localhost');
    const malId = req.query?.malId || urlObj.searchParams.get('malId');
    const ep = req.query?.ep || req.query?.episode || urlObj.searchParams.get('ep') || '1';
    const duration = req.query?.duration || urlObj.searchParams.get('duration') || '0';

    if (!malId) {
      res.status(400).json({ error: 'Missing malId parameter' });
      return;
    }

    const apiUrl = `${ANISKIP_BASE}/${encodeURIComponent(malId)}/${encodeURIComponent(ep)}?types=op&types=ed&episodeLength=${encodeURIComponent(duration)}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    const apiRes = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
    }).catch(() => null);

    clearTimeout(timer);

    if (!apiRes || !apiRes.ok) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
      res.status(200).json({
        found: false,
        malId,
        episode: ep,
        results: [],
        message: 'No skip times registered for this episode',
      });
      return;
    }

    const data = await apiRes.json();
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

    res.setHeader('Content-Type', 'application/json');
    // Long cache since anime OP/ED timestamps are immutable once indexed
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json({
      found: Boolean(op || ed),
      malId,
      episode: ep,
      op,
      ed,
      results: data.results || [],
    });
  } catch (err) {
    console.warn('AniSkip API handler warning:', err.message);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      found: false,
      results: [],
      error: 'Failed to fetch skip times',
    });
  }
}
