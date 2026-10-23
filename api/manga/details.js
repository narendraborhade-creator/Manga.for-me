import { getMangaDetails } from '../../server/mangaProvider.js';
import { cleanTitle, getFallbackCover } from '../../server/htmlUtils.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method Not Allowed' });
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
    const safeTitle = cleanTitle(id.split('/')[1] || id);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', refresh ? 'no-cache' : 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json(details || {
      id,
      title: safeTitle,
      englishTitle: safeTitle,
      coverUrl: getFallbackCover(safeTitle),
      description: `${safeTitle} information and chapters are being refreshed.`,
      status: 'Ongoing',
      author: 'Manga',
      tags: ['Manga', 'Ongoing'],
      chapters: [],
      totalChapters: 0,
    });
  } catch (err) {
    console.warn('Vercel API handled error (/api/manga/details):', err.message);
    const safeId = req.query?.id || 'manga';
    const safeTitle = cleanTitle(safeId.split('/')[1] || safeId);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      id: safeId,
      title: safeTitle,
      englishTitle: safeTitle,
      coverUrl: getFallbackCover(safeTitle),
      description: `${safeTitle} information and chapters are being refreshed.`,
      status: 'Ongoing',
      author: 'Manga',
      tags: ['Manga', 'Ongoing'],
      chapters: [],
      totalChapters: 0,
    });
  }
}
