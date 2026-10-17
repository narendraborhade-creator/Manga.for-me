import { getMangaDetails } from '../../server/mangaProvider.js';

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
    const id = req.query?.id || urlObj.searchParams.get('id');
    const refresh = (req.query?.refresh || urlObj.searchParams.get('refresh')) === 'true';

    if (!id) {
      res.status(400).json({ error: 'Missing manga id parameter' });
      return;
    }

    const details = await getMangaDetails(id, refresh);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', refresh ? 'no-cache' : 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json(details);
  } catch (err) {
    console.error('Vercel API Error (/api/manga/details):', err);
    res.status(500).json({ error: err.message || 'Failed to fetch manga details' });
  }
}
