import { getPopularManga } from '../../server/mangaProvider.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const list = await getPopularManga();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json(list);
  } catch (err) {
    console.error('Vercel API Error (/api/manga/popular):', err);
    res.status(500).json({ error: err.message || 'Failed to fetch popular manga' });
  }
}
