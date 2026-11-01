import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  getPopularManga, 
  searchManga, 
  getMangaDetails, 
  getChapterPages, 
  proxyImage,
  isValidProxyTarget,
  getMangaRecommendations,
  getMangaNews
} from './server/mangaProvider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');
const PORT = parseInt(process.env.PORT || '3000', 10);

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const server = http.createServer(async (req, res) => {
  // Enterprise Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = urlObj.pathname;

    // API Routes
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

    // Static Assets from dist/
    let safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    let filePath = path.join(DIST_DIR, safePath);

    // If file doesn't exist or is a directory, fallback to dist/index.html (SPA routing)
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      if (ext !== '.html') {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.setHeader('Cache-Control', 'no-cache');
      }
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
      return;
    }

    res.statusCode = 404;
    res.end('Not Found');
  } catch (err) {
    console.error('Server error:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err.message }));
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`KuroNeko Production Server running on http://localhost:${PORT}`);
});
