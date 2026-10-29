import { getMangaNews } from '../../server/mangaProvider.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const urlObj = new URL(req.url, 'http://localhost');
    const title = req.query?.title || urlObj.searchParams.get('title') || '';
    const limit = Math.min(parseInt(req.query?.limit || urlObj.searchParams.get('limit') || '12', 10), 30);
    
    const news = await getMangaNews(title, limit);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
    res.status(200).json(Array.isArray(news) ? news : []);
  } catch (err) {
    console.warn('Vercel API handled error (/api/manga/news):', err.message);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json([]);
  }
}
