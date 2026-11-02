import { getMangaRecommendations } from '../../server/mangaProvider.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
    const id = req.query?.id || urlObj.searchParams.get('id') || '';
    const genresRaw = req.query?.genres || urlObj.searchParams.get('genres') || '';
    const genres = genresRaw ? genresRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
    const limit = parseInt(req.query?.limit || urlObj.searchParams.get('limit') || '8', 10);

    const recommendations = await getMangaRecommendations(id, genres, limit);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
    res.status(200).json({ recommendations: recommendations || [] });
  } catch (err) {
    console.warn('Vercel API handled error (/api/manga/recommendations):', err.message);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ recommendations: [] });
  }
}
