import { getChapterPages } from '../../server/mangaProvider.js';

export default async function handler(req, res) {

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
    res.status(200).json(result || {
      chapterId,
      totalPages: 0,
      pages: [],
      warning: 'Chapter images are being synchronized.',
    });
  } catch (err) {
    console.warn('Vercel API handled error (/api/manga/read):', err.message);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      chapterId: req.query?.chapterId || '',
      totalPages: 0,
      pages: [],
      warning: 'Chapter images are being synchronized.',
    });
  }
}
