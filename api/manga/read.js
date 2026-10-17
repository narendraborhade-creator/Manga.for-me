import { getChapterPages } from '../../server/mangaProvider.js';

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
    const chapterId = req.query?.chapterId || urlObj.searchParams.get('chapterId');

    if (!chapterId) {
      res.status(400).json({ error: 'Missing chapterId parameter' });
      return;
    }

    const result = await getChapterPages(chapterId);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
    res.status(200).json(result);
  } catch (err) {
    console.error('Vercel API Error (/api/manga/read):', err);
    res.status(500).json({ error: err.message || 'Failed to fetch chapter pages' });
  }
}
