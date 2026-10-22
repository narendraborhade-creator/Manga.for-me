import { proxyImage } from '../server/mangaProvider.js';

export default async function handler(req, res) {

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const urlObj = new URL(req.url, 'http://localhost');
    const targetUrl = req.query?.url || urlObj.searchParams.get('url');

    if (!targetUrl) {
      res.statusCode = 400;
      res.end('Missing image url parameter');
      return;
    }

    await proxyImage(targetUrl, res);
  } catch (err) {
    console.error('Vercel API Error (/api/image-proxy):', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end('Proxy error');
    }
  }
}
