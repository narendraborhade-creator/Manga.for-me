import { getMangaRecommendations } from '../../server/mangaProvider.js';

export default async function handler(req, res) {
  try {
    const urlObj = new URL(req.url, 'http://localhost');
    const id = req.query?.id || urlObj.searchParams.get('id') || '';
    const genresRaw = req.query?.genres || urlObj.searchParams.get('genres') || '';
    const limit = parseInt(req.query?.limit || urlObj.searchParams.get('limit') || '8', 10);

    const genres = genresRaw 
      ? genresRaw.split(',').map(g => g.trim()).filter(Boolean)
      : [];

    const recommendations = await getMangaRecommendations(id, genres, limit);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
    res.status(200).json({
      recommendations: recommendations || [],
    });
  } catch (err) {
    console.warn('Vercel API handled error (/api/manga/recommendations):', err.message);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      recommendations: [],
    });
  }
}
