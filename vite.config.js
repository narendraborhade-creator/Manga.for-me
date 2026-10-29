import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { 
  getPopularManga, 
  searchManga, 
  getMangaDetails, 
  getChapterPages, 
  proxyImage,
  isValidProxyTarget,
  getMangaRecommendations,
  getMangaNews
} from './server/mangaProvider.js'

// In-memory sliding window rate limiter (120 requests per 10 seconds per IP)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10000;
const MAX_REQUESTS_PER_WINDOW = 120;

function checkRateLimit(ip) {
  const now = Date.now();
  let timestamps = rateLimitMap.get(ip) || [];
  timestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

function mangaApiPlugin() {
  const handler = async (req, res, next) => {
    // 1. Enterprise Security Headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: http:; connect-src 'self' https: http: ws: wss:;"
    );

    try {
      const urlObj = new URL(req.url, 'http://localhost');
      const pathname = urlObj.pathname;

      if (pathname.startsWith('/api/')) {
        // 2. Input Sanitization & Injection Defense
        if (req.url.includes('\0') || req.url.includes('%00') || req.url.includes('../')) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Bad Request: Malformed input detected' }));
          return;
        }

        // 3. Sliding Window Rate Limiting
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        if (!checkRateLimit(clientIp)) {
          res.statusCode = 429;
          res.setHeader('Retry-After', '5');
          res.end(JSON.stringify({ error: 'Too Many Requests. Please slow down.' }));
          return;
        }
      }

      if (pathname === '/api/manga/popular') {
        const list = await getPopularManga();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(list));
        return;
      }

      if (pathname === '/api/manga/search') {
        const q = (urlObj.searchParams.get('q') || '').slice(0, 200);
        const list = await searchManga(q);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(list));
        return;
      }

      if (pathname === '/api/manga/news') {
        const title = (urlObj.searchParams.get('title') || '').slice(0, 200);
        const limit = Math.min(parseInt(urlObj.searchParams.get('limit') || '12', 10), 30);
        const news = await getMangaNews(title, limit);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(news));
        return;
      }

      if (pathname === '/api/manga/recommendations') {
        const id = (urlObj.searchParams.get('id') || '').slice(0, 150);
        const genresRaw = (urlObj.searchParams.get('genres') || '').slice(0, 200);
        const genres = genresRaw ? genresRaw.split(',').map(g => g.trim()).filter(Boolean) : [];
        const limit = Math.min(parseInt(urlObj.searchParams.get('limit') || '8', 10), 30);
        const recommendations = await getMangaRecommendations(id, genres, limit);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ recommendations }));
        return;
      }

      if (pathname === '/api/manga/details') {
        const id = (urlObj.searchParams.get('id') || '').slice(0, 200);
        const refresh = urlObj.searchParams.get('refresh') === 'true';
        const details = await getMangaDetails(id, refresh);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(details));
        return;
      }

      if (pathname === '/api/manga/read') {
        const chapterId = (urlObj.searchParams.get('chapterId') || '').slice(0, 300);
        const result = await getChapterPages(chapterId);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
        return;
      }

      if (pathname === '/api/image-proxy') {
        const targetUrl = urlObj.searchParams.get('url');
        if (targetUrl) {
          if (!isValidProxyTarget(targetUrl)) {
            res.statusCode = 403;
            res.end(JSON.stringify({ error: 'Forbidden: Invalid proxy destination' }));
            return;
          }
          await proxyImage(targetUrl, res);
          return;
        }
      }

      next();
    } catch (err) {
      console.error('API Error:', err);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err.message }));
    }
  };

  return {
    name: 'manga-api-plugin',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    mangaApiPlugin(),
  ],
})
