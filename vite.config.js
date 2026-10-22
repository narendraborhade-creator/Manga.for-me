import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { 
  getPopularManga, 
  searchManga, 
  getMangaDetails, 
  getChapterPages, 
  proxyImage,
  getMangaRecommendations
} from './server/mangaProvider.js'

function mangaApiPlugin() {
  const handler = async (req, res, next) => {
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      const pathname = urlObj.pathname;

      if (pathname === '/api/manga/popular') {
        const list = await getPopularManga();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(list));
        return;
      }

      if (pathname === '/api/manga/search') {
        const q = urlObj.searchParams.get('q') || '';
        const list = await searchManga(q);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(list));
        return;
      }

      if (pathname === '/api/manga/recommendations') {
        const id = urlObj.searchParams.get('id') || '';
        const genresRaw = urlObj.searchParams.get('genres') || '';
        const genres = genresRaw ? genresRaw.split(',').map(g => g.trim()).filter(Boolean) : [];
        const limit = parseInt(urlObj.searchParams.get('limit') || '8', 10);
        const recommendations = await getMangaRecommendations(id, genres, limit);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ recommendations }));
        return;
      }

      if (pathname === '/api/manga/details') {
        const id = urlObj.searchParams.get('id');
        const refresh = urlObj.searchParams.get('refresh') === 'true';
        const details = await getMangaDetails(id, refresh);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(details));
        return;
      }

      if (pathname === '/api/manga/read') {
        const chapterId = urlObj.searchParams.get('chapterId');
        const result = await getChapterPages(chapterId);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
        return;
      }

      if (pathname === '/api/image-proxy') {
        const targetUrl = urlObj.searchParams.get('url');
        if (targetUrl) {
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
