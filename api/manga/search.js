import { searchManga } from '../../server/mangaProvider.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const urlObj = new URL(req.url, 'http://localhost');
    const q = req.query?.q || urlObj.searchParams.get('q') || '';
    const list = await searchManga(q);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
    res.status(200).json(Array.isArray(list) ? list : []);
  } catch (err) {
    console.warn('Vercel API handled error (/api/manga/search):', err.message);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json([]);
  }
}
