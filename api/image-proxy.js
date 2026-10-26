import { proxyImage, isValidProxyTarget } from '../server/mangaProvider.js';

export default async function handler(req, res) {
  // Enforce security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'");

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.statusCode = 405;
    res.end('Method Not Allowed');
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

    if (!isValidProxyTarget(targetUrl)) {
      res.statusCode = 403;
      res.end('Forbidden: Invalid image proxy target');
      return;
    }

    await proxyImage(targetUrl, res);
  } catch (err) {
    console.error('API Error (/api/image-proxy):', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end('Proxy error');
    }
  }
}

