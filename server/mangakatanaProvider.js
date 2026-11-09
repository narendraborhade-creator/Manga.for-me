import { decodeHtml, cleanTitle } from './htmlUtils.js';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const HEADERS = {
  'User-Agent': USER_AGENT,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://mangakatana.com/',
};

const BASE_URL = 'https://mangakatana.com';

const cache = new Map();
const CACHE_TTL = 1000 * 60 * 20; // 20 minutes

function getCached(key) {
  const item = cache.get(key);
  if (item && Date.now() - item.time < CACHE_TTL) return item.data;
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, time: Date.now() });
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Search MangaKatana
 */
export async function searchMangaKatana(query = '') {
  if (!query || !query.trim()) return [];
  const q = query.trim();
  const cacheKey = `kat_search_${q.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const searchUrl = `${BASE_URL}/?search=${encodeURIComponent(q)}&search_by=book_name`;
    const res = await fetchWithTimeout(searchUrl, { headers: HEADERS }, 7500);
    if (!res.ok) return [];
    const html = await res.text();

    // Check if MangaKatana automatically redirected exact match to the manga detail page
    if (res.url && res.url.includes('/manga/')) {
      const slugMatch = res.url.match(/\/manga\/([^/?#]+)/i);
      if (slugMatch) {
        const slug = slugMatch[1];
        const titleMatch = html.match(/<h1 class="heading">([^<]+)<\/h1>/i) || html.match(/<title>([^<]+)<\/title>/i);
        const imgMatch = html.match(/<div class="cover"[^>]*>\s*<img[^>]+src="([^"]+)"/i) || html.match(/<meta property="og:image" content="([^"]+)"/i);
        const chMatches = [...html.matchAll(/<div class="chapter">\s*<a href="https:\/\/mangakatana\.com\/manga\/[^/]+\/([^"]+)"[^>]*>([^<]+)<\/a>/gi)];
        const rawImg = imgMatch ? imgMatch[1] : '';
        const title = titleMatch ? decodeHtml(titleMatch[1].replace(/\s*-\s*MangaKatana.*$/i, '').trim()) : slug;
        const latestChStr = chMatches.length > 0 ? chMatches[0][2].trim() : 'Latest';
        const numMatch = latestChStr.match(/(?:Chapter|Ch\.?)\s*([0-9.]+)/i);
        const totalCh = numMatch ? parseFloat(numMatch[1]) : chMatches.length;

        const singleResult = [{
          id: `kat:${slug}`,
          slug,
          title: cleanTitle(title),
          englishTitle: cleanTitle(title),
          coverUrl: rawImg ? `/api/image-proxy?url=${encodeURIComponent(rawImg)}` : '',
          rawCoverUrl: rawImg,
          latestChapter: latestChStr,
          totalChapters: totalCh,
          status: html.includes('Completed') ? 'Completed' : 'Ongoing',
          tags: ['Manga'],
          provider: 'mangakatana',
          sourceName: 'MangaKatana',
        }];
        setCache(cacheKey, singleResult);
        return singleResult;
      }
    }

    const listStart = html.indexOf('id="book_list"');
    let items = [];
    if (listStart !== -1) {
      const listEnd = html.indexOf('class="uk-width-medium-1-3', listStart);
      const listSection = listEnd !== -1 ? html.slice(listStart, listEnd) : html.slice(listStart);
      items = listSection.split('<div class="item"').slice(1);
    }

    // Fallbacks if 0 results were found
    if (items.length === 0) {
      const fallbackQueries = [];
      if (!q.includes("'") && /\b([a-zA-Z]+)s\b/i.test(q)) {
        fallbackQueries.push(q.replace(/\b([a-zA-Z]+)s\b/gi, "$1's"));
      }
      if (q.includes("'") || q.includes("’")) {
        fallbackQueries.push(q.replace(/['’]/g, ''));
      }
      if (/^(the|a|an)\s+/i.test(q)) {
        fallbackQueries.push(q.replace(/^(the|a|an)\s+/i, ''));
      }

      for (const fbQ of fallbackQueries) {
        if (!fbQ || fbQ === q) continue;
        try {
          const fbUrl = `${BASE_URL}/?search=${encodeURIComponent(fbQ)}&search_by=book_name`;
          const fbRes = await fetchWithTimeout(fbUrl, { headers: HEADERS }, 6000);
          if (fbRes.ok) {
            if (fbRes.url && fbRes.url.includes('/manga/')) {
              const fbSlugMatch = fbRes.url.match(/\/manga\/([^/?#]+)/i);
              if (fbSlugMatch) {
                const fbHtml = await fbRes.text();
                const slug = fbSlugMatch[1];
                const titleMatch = fbHtml.match(/<h1 class="heading">([^<]+)<\/h1>/i) || fbHtml.match(/<title>([^<]+)<\/title>/i);
                const imgMatch = fbHtml.match(/<div class="cover"[^>]*>\s*<img[^>]+src="([^"]+)"/i) || fbHtml.match(/<meta property="og:image" content="([^"]+)"/i);
                const chMatches = [...fbHtml.matchAll(/<div class="chapter">\s*<a href="https:\/\/mangakatana\.com\/manga\/[^/]+\/([^"]+)"[^>]*>([^<]+)<\/a>/gi)];
                const rawImg = imgMatch ? imgMatch[1] : '';
                const title = titleMatch ? decodeHtml(titleMatch[1].replace(/\s*-\s*MangaKatana.*$/i, '').trim()) : slug;
                const latestChStr = chMatches.length > 0 ? chMatches[0][2].trim() : 'Latest';
                const numMatch = latestChStr.match(/(?:Chapter|Ch\.?)\s*([0-9.]+)/i);
                const totalCh = numMatch ? parseFloat(numMatch[1]) : chMatches.length;

                const singleResult = [{
                  id: `kat:${slug}`,
                  slug,
                  title: cleanTitle(title),
                  englishTitle: cleanTitle(title),
                  coverUrl: rawImg ? `/api/image-proxy?url=${encodeURIComponent(rawImg)}` : '',
                  rawCoverUrl: rawImg,
                  latestChapter: latestChStr,
                  totalChapters: totalCh,
                  status: fbHtml.includes('Completed') ? 'Completed' : 'Ongoing',
                  tags: ['Manga'],
                  provider: 'mangakatana',
                  sourceName: 'MangaKatana',
                }];
                setCache(cacheKey, singleResult);
                return singleResult;
              }
            }
            const fbHtml = await fbRes.text();
            const fbStart = fbHtml.indexOf('id="book_list"');
            if (fbStart !== -1) {
              const fbEnd = fbHtml.indexOf('class="uk-width-medium-1-3', fbStart);
              const fbSection = fbEnd !== -1 ? fbHtml.slice(fbStart, fbEnd) : fbHtml.slice(fbStart);
              const fbItems = fbSection.split('<div class="item"').slice(1);
              if (fbItems.length > 0) {
                items = fbItems;
                break;
              }
            }
          }
        } catch {}
      }
    }

    if (items.length === 0) return [];

    const list = [];
    const seen = new Set();

    for (const item of items) {
      const slugMatch = item.match(/href="(?:https:\/\/mangakatana\.com)?\/manga\/([^"/]+)"/i);
      const imgMatch = item.match(/<img[^>]+src="([^"]+)"/i);
      const titleMatch = item.match(/<h3 class="title">\s*<a[^>]*>([^<]+)<\/a>/i);
      const chMatch = item.match(/Update chapter\s*([0-9.]+)/i);
      const statusMatch = item.match(/class="status\s+([^"]+)"/i);
      const genreMatches = [...item.matchAll(/<a href="https:\/\/mangakatana\.com\/genre\/[^"]*">([^<]+)<\/a>/gi)].map(g => g[1]);

      if (slugMatch && titleMatch) {
        const slug = slugMatch[1];
        if (seen.has(slug)) continue;
        seen.add(slug);

        const rawImg = imgMatch ? imgMatch[1] : '';
        const title = decodeHtml(titleMatch[1].trim());
        const totalCh = chMatch ? parseFloat(chMatch[1]) : 0;

        list.push({
          id: `kat:${slug}`,
          slug,
          title: cleanTitle(title),
          englishTitle: cleanTitle(title),
          coverUrl: rawImg ? `/api/image-proxy?url=${encodeURIComponent(rawImg)}` : '',
          rawCoverUrl: rawImg,
          latestChapter: chMatch ? `Chapter ${chMatch[1]}` : 'Latest',
          totalChapters: totalCh,
          status: statusMatch ? (statusMatch[1].includes('completed') ? 'Completed' : 'Ongoing') : 'Ongoing',
          tags: genreMatches.length > 0 ? genreMatches : ['Manga'],
          provider: 'mangakatana',
          sourceName: 'MangaKatana',
        });
      }
    }

    setCache(cacheKey, list);
    return list;
  } catch (err) {
    console.warn('searchMangaKatana error:', err.message);
    return [];
  }
}

/**
 * Get MangaKatana Details & Full Chapter List
 */
export async function getMangaKatanaDetails(mangaId, bypassCache = false) {
  const slug = String(mangaId).replace(/^kat:/, '').replace(/^https?:\/\/mangakatana\.com\/manga\//, '');
  const cacheKey = `kat_details_${slug}`;
  if (!bypassCache) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  try {
    const url = `${BASE_URL}/manga/${slug}`;
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 6000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const titleMatch = html.match(/<h1 class="heading">([^<]+)<\/h1>/i) || html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? decodeHtml(titleMatch[1].replace(/\s*–\s*MangaKatana.*|\|\s*MangaKatana.*/i, '').trim()) : slug;

    const altMatch = html.match(/<div class="alt_name">([^<]+)<\/div>/i);
    const altTitles = altMatch ? altMatch[1].split(';').map(t => decodeHtml(t.trim())).filter(Boolean) : [];
    const englishTitle = altTitles.length > 0 ? altTitles[0] : null;

    const descMatch =
      html.match(/class="summary"[\s\S]*?<p>([\s\S]*?)<\/p>/i) ||
      html.match(/<meta\s+(?:name|property)="description"\s+content="([^"]+)"/i) ||
      html.match(/<div class="summary">([\s\S]*?)<\/div>/i);
    const description = descMatch
      ? decodeHtml(descMatch[1].replace(/<div class="label">[\s\S]*?<\/div>/gi, '').replace(/<[^>]+>/g, '').trim())
      : '';

    const imgMatch =
      html.match(/<div class="cover"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i) ||
      html.match(/property="og:image"\s+content="([^"]+)"/i) ||
      html.match(/content="([^"]+)"\s+property="og:image"/i) ||
      html.match(/<img[^>]+alt="\[Cover\]"[^>]+src="([^"]+)"/i);
    const rawCover = imgMatch ? imgMatch[1] : '';
    const coverUrl = rawCover ? `/api/image-proxy?url=${encodeURIComponent(rawCover)}` : '';

    const statusMatch = html.match(/<div class="status\s+([^"]+)">/i);
    const status = statusMatch ? (statusMatch[1].includes('completed') ? 'Completed' : 'Ongoing') : 'Ongoing';

    const authorMatch = html.match(/<a class="author"[^>]*>([^<]+)<\/a>/i);
    const author = authorMatch ? decodeHtml(authorMatch[1].trim()) : 'Top Artist';

    const genreMatches = [...html.matchAll(/<a href="https:\/\/mangakatana\.com\/genre\/[^"]*">([^<]+)<\/a>/gi)].map(g => g[1]);

    // Chapters - extract from table rows including published update time
    const trMatches = [...html.matchAll(/<tr[^>]*>\s*<td>\s*<div class="chapter">\s*<a href="https:\/\/mangakatana\.com\/manga\/[^/]+\/([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/div>\s*<\/td>(?:\s*<td>\s*<div class="update_time">([^<]*)<\/div>\s*<\/td>)?/gi)];
    const chMatches = trMatches.length > 0 
      ? trMatches.map(m => ({ slug: m[1], text: m[2], date: m[3] }))
      : [...html.matchAll(/<div class="chapter"[^>]*>\s*<a href="https:\/\/mangakatana\.com\/manga\/[^/]+\/([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)].map(m => ({ slug: m[1], text: m[2], date: null }));

    const chapters = [];
    const seenCh = new Set();

    for (const cm of chMatches) {
      const chSlug = cm.slug;
      if (seenCh.has(chSlug)) continue;
      seenCh.add(chSlug);

      const chText = cm.text.replace(/<[^>]+>/g, '').trim();
      const slugMatch = chSlug.match(/^c([0-9.]+)/i);
      const titleChMatch = chText.match(/(?:Chapter|Ch\.?|Ep\.?)\s*([0-9.]+)/i);

      let chapterNum;
      if (titleChMatch) {
        chapterNum = titleChMatch[1];
      } else if (slugMatch) {
        chapterNum = slugMatch[1];
      } else {
        const fallbackMatch = chText.match(/([0-9.]+)/);
        const pNum = fallbackMatch ? parseFloat(fallbackMatch[1]) : NaN;
        if (!isNaN(pNum) && !(pNum >= 1990 && pNum <= 2030)) {
          chapterNum = fallbackMatch[1];
        } else {
          chapterNum = chSlug.replace(/^c/, '') || 'Special';
        }
      }

      chapters.push({
        id: `kat_ch:${slug}:${chSlug}`,
        chapter: chapterNum,
        title: decodeHtml(chText) || `Chapter ${chapterNum}`,
        publishedAt: cm.date ? cm.date.trim() : null,
        sourceUrl: `${BASE_URL}/manga/${slug}/${chSlug}`,
      });
    }

    chapters.sort((a, b) => {
      const numA = parseFloat(a.chapter);
      const numB = parseFloat(b.chapter);
      if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
      return 0;
    });

    const result = {
      id: `kat:${slug}`,
      slug,
      title: cleanTitle(title),
      englishTitle: englishTitle ? cleanTitle(englishTitle) : cleanTitle(title),
      altTitles,
      coverUrl,
      rawCoverUrl: rawCover,
      description,
      status,
      author,
      tags: genreMatches.length > 0 ? genreMatches : ['Manga'],
      chapters,
      totalChapters: chapters.length,
      latestChapter: chapters[0] ? chapters[0].chapter : null,
      provider: 'mangakatana',
      sourceName: 'MangaKatana',
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`getMangaKatanaDetails error for ${slug}:`, err.message);
    throw err;
  }
}

/**
 * Get Pages for MangaKatana Chapter
 */
export async function getMangaKatanaChapterPages(rawChapterId) {
  const cleanId = String(rawChapterId).replace(/^kat_ch:/, '');
  const parts = cleanId.split(':');
  const slug = parts[0];
  const chSlug = parts[1] || '';

  if (!slug || !chSlug) {
    return { chapterId: rawChapterId, totalPages: 0, pages: [] };
  }

  const cacheKey = `kat_pages_${slug}_${chSlug}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/manga/${slug}/${chSlug}`;
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 8000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const arrayMatch = html.match(/var\s+thzq\s*=\s*\[([^\]]+)\]/i) || html.match(/var\s+[a-z0-9_]+\s*=\s*\[([^\]]*https:[^\]]*)\]/i);
    let rawUrls = [];
    if (arrayMatch) {
      rawUrls = [...arrayMatch[1].matchAll(/['"](https?:\/\/[^'"]+)['"]/g)].map(m => m[1]);
    }

    if (rawUrls.length === 0) {
      // Fallback img tags in page
      rawUrls = [...html.matchAll(/<img[^>]+src="([^"]*mangakatana\.com\/token\/[^"]+)"/gi)].map(m => m[1]);
    }

    const pages = rawUrls.map((imgUrl, idx) => ({
      pageNumber: idx + 1,
      url: `/api/image-proxy?url=${encodeURIComponent(imgUrl)}`,
      originalUrl: imgUrl,
    }));

    const result = {
      chapterId: rawChapterId,
      totalPages: pages.length,
      pages,
      sourceUrl: url,
    };

    if (pages.length > 0) {
      setCache(cacheKey, result);
      return result;
    }
    throw new Error('No images found on chapter page');
  } catch (err) {
    console.warn(`getMangaKatanaChapterPages error for ${cleanId}:`, err.message);
    return {
      chapterId: rawChapterId,
      totalPages: 0,
      pages: [],
      warning: 'MangaKatana chapter pages are temporarily synchronizing.',
    };
  }
}

/**
 * Fetch Popular Manga from MangaKatana
 */
export async function getPopularMangaKatana(limit = 24) {
  const cacheKey = `kat_popular_${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/manga`;
    const res = await fetchWithTimeout(url, { headers: HEADERS }, 6000);
    if (!res.ok) return [];
    const html = await res.text();

    const listStart = html.indexOf('id="book_list"');
    if (listStart === -1) return [];
    const listEnd = html.indexOf('class="uk-width-medium-1-3', listStart);
    const listSection = listEnd !== -1 ? html.slice(listStart, listEnd) : html.slice(listStart);

    const items = listSection.split('<div class="item"').slice(1);
    const list = [];
    const seen = new Set();

    for (const item of items) {
      if (list.length >= limit) break;
      const slugMatch = item.match(/href="(?:https:\/\/mangakatana\.com)?\/manga\/([^"/]+)"/i);
      const imgMatch = item.match(/<img[^>]+src="([^"]+)"/i);
      const titleMatch = item.match(/<h3 class="title">\s*<a[^>]*>([^<]+)<\/a>/i);
      const chMatch = item.match(/Update chapter\s*([0-9.]+)/i);
      const statusMatch = item.match(/class="status\s+([^"]+)"/i);
      const genreMatches = [...item.matchAll(/<a href="https:\/\/mangakatana\.com\/genre\/[^"]*">([^<]+)<\/a>/gi)].map(g => g[1]);

      if (slugMatch && titleMatch) {
        const slug = slugMatch[1];
        if (seen.has(slug)) continue;
        seen.add(slug);

        const rawImg = imgMatch ? imgMatch[1] : '';
        const title = decodeHtml(titleMatch[1].trim());
        const totalCh = chMatch ? parseFloat(chMatch[1]) : 0;

        list.push({
          id: `kat:${slug}`,
          slug,
          title: cleanTitle(title),
          englishTitle: cleanTitle(title),
          coverUrl: rawImg ? `/api/image-proxy?url=${encodeURIComponent(rawImg)}` : '',
          rawCoverUrl: rawImg,
          latestChapter: chMatch ? `Chapter ${chMatch[1]}` : 'Latest',
          totalChapters: totalCh,
          status: statusMatch ? (statusMatch[1].includes('completed') ? 'Completed' : 'Ongoing') : 'Ongoing',
          tags: genreMatches.length > 0 ? genreMatches : ['Manga', 'Popular'],
          provider: 'mangakatana',
          sourceName: 'MangaKatana',
        });
      }
    }

    setCache(cacheKey, list);
    return list;
  } catch (err) {
    console.warn('getPopularMangaKatana error:', err.message);
    return [];
  }
}
