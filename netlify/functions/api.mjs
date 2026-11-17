import { 
  getPopularManga, 
  searchManga, 
  getMangaDetails, 
  getChapterPages, 
  isValidProxyTarget,
  getMangaRecommendations,
  getMangaNews,
  getSourceListings
} from '../../server/mangaProvider.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data, status = 200, cacheControl = 's-maxage=120, stale-while-revalidate=240') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': cacheControl,
      ...CORS_HEADERS,
    },
  });
}

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const urlObj = new URL(req.url);
  let pathname = urlObj.pathname;
  if (pathname.includes('/.netlify/functions/api')) {
    pathname = pathname.replace('/.netlify/functions/api', '/api');
  }

  try {
    // 1. Popular manga
    if (pathname === '/api/manga/popular') {
      const list = await getPopularManga();
      return jsonResponse(list || []);
    }

    // 2. Manga search
    if (pathname === '/api/manga/search') {
      const q = (urlObj.searchParams.get('q') || '').slice(0, 200);
      const list = await searchManga(q);
      return jsonResponse(list || []);
    }

    // 3. Manga details
    if (pathname === '/api/manga/details') {
      const id = (urlObj.searchParams.get('id') || '').slice(0, 200);
      const refresh = urlObj.searchParams.get('refresh') === 'true';
      const details = await getMangaDetails(id, refresh);
      return jsonResponse(details || {});
    }

    // 4. Manga read
    if (pathname === '/api/manga/read') {
      const chapterId = (urlObj.searchParams.get('chapterId') || '').slice(0, 300);
      const mangaId = (urlObj.searchParams.get('mangaId') || '').slice(0, 300);
      const ch = (urlObj.searchParams.get('ch') || '').slice(0, 50);
      const title = (urlObj.searchParams.get('title') || '').slice(0, 300);
      const result = await getChapterPages(chapterId, mangaId, ch, title);
      return jsonResponse(result || { pages: [] });
    }

    // 5. Manga news
    if (pathname === '/api/manga/news') {
      const title = (urlObj.searchParams.get('title') || '').slice(0, 200);
      const limit = Math.min(parseInt(urlObj.searchParams.get('limit') || '12', 10), 30);
      const news = await getMangaNews(title, limit);
      return jsonResponse(news || []);
    }

    // 6. Manga recommendations
    if (pathname === '/api/manga/recommendations') {
      const id = (urlObj.searchParams.get('id') || '').slice(0, 150);
      const genresRaw = (urlObj.searchParams.get('genres') || '').slice(0, 200);
      const genres = genresRaw ? genresRaw.split(',').map(g => g.trim()).filter(Boolean) : [];
      const limit = Math.min(parseInt(urlObj.searchParams.get('limit') || '8', 10), 30);
      const recommendations = await getMangaRecommendations(id, genres, limit);
      return jsonResponse({ recommendations: recommendations || [] });
    }

    // 7. Image proxy
    if (pathname === '/api/image-proxy') {
      const targetUrl = urlObj.searchParams.get('url');
      if (!targetUrl || !isValidProxyTarget(targetUrl)) {
        return new Response(JSON.stringify({ error: 'Forbidden: Invalid image proxy destination' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        });
      }

      let primaryReferer = '';
      try {
        const parsed = new URL(targetUrl);
        const host = parsed.hostname.toLowerCase();
        if (host.includes('kakamanga') || host.includes('2xstorage') || host.includes('mangakakalot') || host.includes('chapmanganato')) {
          primaryReferer = 'https://www.kakamanga.com/';
        } else if (host.includes('weebcentral') || host.includes('planeptune') || host.includes('compsci88') || host.includes('lastation')) {
          primaryReferer = 'https://weebcentral.com/';
        } else if (host.includes('asurascans') || host.includes('asuracomic')) {
          primaryReferer = 'https://asurascans.com/';
        } else if (host.includes('thunderscans')) {
          primaryReferer = 'https://en-thunderscans.com/';
        } else if (host.includes('vortexscans')) {
          primaryReferer = 'https://vortexscans.org/';
        } else if (host.includes('mangadex') || host.includes('uploads.mangadex.org')) {
          primaryReferer = 'https://mangadex.org/';
        } else if (host.includes('mangapill')) {
          primaryReferer = 'https://mangapill.com/';
        } else if (host.includes('mangakatana')) {
          primaryReferer = 'https://mangakatana.com/';
        } else {
          primaryReferer = parsed.origin + '/';
        }
      } catch {
        primaryReferer = 'https://mangadex.org/';
      }

      const imgRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': primaryReferer,
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
      });

      if (!imgRes.ok) {
        return new Response('Image not found', { status: imgRes.status, headers: CORS_HEADERS });
      }

      const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
      return new Response(imgRes.body, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=604800, immutable',
          'X-Content-Type-Options': 'nosniff',
          ...CORS_HEADERS
        }
      });
    }

    // 8. Extension repository proxy (SSRF protected)
    if (pathname === '/api/extensions/repo') {
      const repoUrl = urlObj.searchParams.get('url');
      if (!repoUrl || !isValidProxyTarget(repoUrl)) {
        return jsonResponse({ error: 'Invalid repository destination' }, 400);
      }
      try {
        const parsed = new URL(repoUrl);
        const host = parsed.hostname.toLowerCase();
        const isAllowed = host === 'raw.githubusercontent.com' || host === 'cdn.jsdelivr.net' || host.endsWith('.github.io');
        if (!isAllowed) {
          return jsonResponse({ error: 'Forbidden: Repository host is not allowlisted' }, 403);
        }
        const repoRes = await fetch(repoUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        if (!repoRes.ok) throw new Error(`HTTP ${repoRes.status}`);
        const data = await repoRes.json();
        return jsonResponse(data, 200, 'public, max-age=900');
      } catch (_err) {
        return jsonResponse({ error: 'Failed to retrieve repository index' }, 502);
      }
    }

    // 9. Extension source listings
    if (pathname === '/api/extensions/source') {
      const sourceId = urlObj.searchParams.get('id') || '';
      const type = urlObj.searchParams.get('type') || 'popular';
      const q = urlObj.searchParams.get('q') || '';
      const list = await getSourceListings(sourceId, type, q);
      return jsonResponse(list || []);
    }

    // 10. Anime Skip
    if (pathname === '/api/anime/skip') {
      const malId = urlObj.searchParams.get('malId');
      const ep = urlObj.searchParams.get('ep') || '1';
      const duration = urlObj.searchParams.get('duration') || '0';
      if (!malId) {
        return jsonResponse({ error: 'Missing malId parameter' }, 400);
      }
      const apiUrl = `https://api.aniskip.com/v2/skip-times/${encodeURIComponent(malId)}/${encodeURIComponent(ep)}?types=op&types=ed&episodeLength=${encodeURIComponent(duration)}`;
      const res = await fetch(apiUrl).catch(() => null);
      if (!res || !res.ok) {
        return jsonResponse({ found: false, malId, episode: ep, results: [] });
      }
      const data = await res.json();
      return jsonResponse(data);
    }

    // 9. Anime Source / Stream
    if (pathname === '/api/anime/stream' || pathname === '/api/anime/source') {
      const rawTitle = urlObj.searchParams.get('title') || '';
      const ep = urlObj.searchParams.get('ep') || '1';
      const malId = urlObj.searchParams.get('malId') || '';
      const isDub = urlObj.searchParams.get('dub') === 'true';
      const cleanTitle = rawTitle.replace(/[:;!?()[\]]/g, ' ').replace(/\s+/g, ' ').trim();
      const titleSlug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      const sources = [
        {
          url: `https://anitaku.pe/category/${titleSlug}${isDub ? '-dub' : ''}`,
          isM3U8: false,
          quality: '1080p',
          server: 'Consumet / Anitaku',
        },
        {
          url: `https://hianime.to/search?keyword=${encodeURIComponent(cleanTitle + (isDub ? ' dub' : ''))}`,
          isM3U8: false,
          quality: '1080p Ultra HD',
          server: 'HiAnime MegaPlay',
        },
      ];

      return jsonResponse({
        title: cleanTitle,
        episode: parseInt(ep, 10) || 1,
        isDub,
        malId: malId || null,
        sources,
        directStream: null,
      });
    }

    return jsonResponse({ error: 'Not Found' }, 404);
  } catch (err) {
    console.error('Netlify API Error:', err);
    return jsonResponse({ error: err.message || 'Internal Server Error' }, 500);
  }
};

export const config = {
  path: ['/api/*', '/.netlify/functions/api/*'],
};
