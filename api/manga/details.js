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
    res.status(200).json(details || {
      id,
      title: id.replace(/^wc:|^webtoon:/, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
      description: 'Manga information is loading from backup archives.',
      status: 'Ongoing',
      tags: ['Manga'],
      chapters: [],
      totalChapters: 0,
    });
  } catch (err) {
    console.warn('Vercel API handled error (/api/manga/details):', err.message);
    const safeId = req.query?.id || 'manga';
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      id: safeId,
      title: safeId.replace(/^wc:|^webtoon:/, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
      description: 'Manga information is loading from backup archives.',
      status: 'Ongoing',
      tags: ['Manga'],
      chapters: [],
      totalChapters: 0,
    });
  }
}
