import { searchManga } from '../../server/mangaProvider.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const urlObj = new URL(req.url, 'http://localhost');
    const q = req.query?.q || urlObj.searchParams.get('q') || '';
    const list = await searchManga(q);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
    res.status(200).json(list);
  } catch (err) {
    console.error('Vercel API Error (/api/manga/search):', err);
    res.status(500).json({ error: err.message || 'Failed to search manga' });
  }
}
