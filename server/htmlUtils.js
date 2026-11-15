/**
 * Comprehensive HTML Entity Decoder and Title Cleaner for Manga Providers
 */

export function decodeHtml(str) {
  if (!str || typeof str !== 'string') return '';
  let decoded = str
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&hellip;/gi, '…')
    .replace(/&lsquo;/gi, "‘")
    .replace(/&rsquo;/gi, "’")
    .replace(/&ldquo;/gi, '“')
    .replace(/&rdquo;/gi, '”')
    // Hex entities like &#x27; or &#X27;
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      try {
        return String.fromCodePoint(parseInt(hex, 16));
      } catch {
        return '';
      }
    })
    // Decimal entities like &#8217; or &#39;
    .replace(/&#([0-9]+);/g, (_, dec) => {
      try {
        return String.fromCodePoint(parseInt(dec, 10));
      } catch {
        return '';
      }
    });

  // Handle double encoded entities like &amp;#x27; or &amp;amp;
  if (decoded.includes('&amp;') || decoded.includes('&#')) {
    decoded = decoded
      .replace(/&quot;/gi, '"')
      .replace(/&apos;/gi, "'")
      .replace(/&#039;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
        try {
          return String.fromCodePoint(parseInt(hex, 16));
        } catch {
          return '';
        }
      })
      .replace(/&#([0-9]+);/g, (_, dec) => {
        try {
          return String.fromCodePoint(parseInt(dec, 10));
        } catch {
          return '';
        }
      });
  }
  return decoded;
}

export function cleanTitle(raw) {
  if (!raw || typeof raw !== 'string') return 'Manga';
  let t = decodeHtml(raw);

  // Strip source provider prefixes like "vortex:", "asura:", "webtoon:", "weebcentral:", "mangadex:", "mk:", "wc:"
  t = t.replace(/^(vortex|asura|webtoon|weebcentral|mangadex|mangakakalot|kakamanga|mangapill|wc|mk|md)\s*:\s*/i, '');

  // Strip Chapter trailing text or manga suffix
  t = t
    .replace(/Chapter\s+[0-9.]+/i, '')
    .replace(/\s+manga$/i, '')
    .trim();

  // Deduplicate repeating title segments like "Solo Leveling Solo Leveling"
  const words = t.split(/\s+/);
  const half = Math.floor(words.length / 2);
  if (words.length >= 2 && words.length % 2 === 0) {
    const firstHalf = words.slice(0, half).join(' ');
    const secondHalf = words.slice(half).join(' ');
    if (firstHalf.toLowerCase() === secondHalf.toLowerCase()) {
      t = firstHalf;
    }
  }

  // Normalize excessive dashes or underscores if it was a slug
  if (t.includes('-') && !t.includes(' ')) {
    t = t.replace(/-/g, ' ');
  }
  t = t.replace(/\s+/g, ' ').trim();

  // Capitalize properly if all lowercase
  if (t === t.toLowerCase()) {
    t = t.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return t || 'Manga';
}

/**
 * Deduplicate chapter lists by normalized chapter number and ID
 * Filters out non-story half-chapters (promos, teasers, hiatuses, delay notices)
 * Prevents "double chapters" and guarantees only full story chapters sorted descending
 */
export function deduplicateChapters(chapters) {
  if (!Array.isArray(chapters)) return [];
  const seenNumbers = new Map();
  const seenIds = new Set();
  const result = [];

  const NON_STORY_PATTERN = /\b(recap|promo|teaser|preview|announcement|notice|delay|author's note|hiatus|special notice)\b/i;

  for (const ch of chapters) {
    if (!ch || (!ch.id && !ch.chapter)) continue;

    // Filter out non-story half-chapters and notices (e.g. "Chapter 10.5 - Hiatus Notice", "Promo")
    const titleLower = String(ch.title || '').toLowerCase();
    const chStr = String(ch.chapter || '').toLowerCase();
    if (NON_STORY_PATTERN.test(titleLower) || NON_STORY_PATTERN.test(chStr)) {
      // If it has no valid number or is a fractional/teaser filler, exclude it
      const parsedNum = parseFloat(ch.chapter);
      if (isNaN(parsedNum) || parsedNum === 0 || chStr.includes('.') || titleLower.includes('notice') || titleLower.includes('hiatus')) {
        continue;
      }
      if (parsedNum >= 1990 && parsedNum <= 2030 && !titleLower.includes('chapter')) {
        continue;
      }
    }

    // Check unique ID
    if (ch.id && seenIds.has(ch.id)) continue;
    if (ch.id) seenIds.add(ch.id);

    // Normalize chapter key
    let normKey = null;
    const parsedNum = parseFloat(ch.chapter);
    if (!isNaN(parsedNum)) {
      normKey = `num:${parsedNum}`;
    } else if (ch.chapter) {
      normKey = `str:${String(ch.chapter).toLowerCase().trim()}`;
    } else if (ch.title) {
      normKey = `title:${String(ch.title).toLowerCase().trim()}`;
    }

    if (normKey) {
      if (seenNumbers.has(normKey)) {
        // Double chapter found! Pick the latest or highest quality release
        const existingIdx = seenNumbers.get(normKey);
        const existing = result[existingIdx];
        const existingTitle = (existing.title || '').toLowerCase();
        const curTitle = (ch.title || '').toLowerCase();
        const genericTitle = `chapter ${ch.chapter}`.toLowerCase();

        // If current has a newer published date or a richer title, replace existing
        const curTime = ch.publishedAt ? new Date(ch.publishedAt).getTime() : 0;
        const existTime = existing.publishedAt ? new Date(existing.publishedAt).getTime() : 0;

        if (curTime > existTime || (existTime === 0 && (existingTitle === genericTitle || !existingTitle) && curTitle && curTitle !== genericTitle)) {
          result[existingIdx] = ch;
        }
        continue;
      }
      seenNumbers.set(normKey, result.length);
    }

    result.push(ch);
  }

  // Sort descending by chapter number: latest release at the top
  result.sort((a, b) => {
    const numA = parseFloat(String(a.chapter || '').replace(/[^0-9.]/g, ''));
    const numB = parseFloat(String(b.chapter || '').replace(/[^0-9.]/g, ''));
    if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
    return 0;
  });

  return result;
}

export function getFallbackCover(title = 'Manga') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
    <defs>
      <linearGradient id="cyberBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#080c16"/>
        <stop offset="40%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e1338"/>
      </linearGradient>
      <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#06b6d4"/>
        <stop offset="50%" stop-color="#8b5cf6"/>
        <stop offset="100%" stop-color="#f43f5e"/>
      </linearGradient>
      <radialGradient id="aura" cx="50%" cy="42%" r="50%">
        <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.35"/>
        <stop offset="60%" stop-color="#06b6d4" stop-opacity="0.1"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#38bdf8" stroke-width="0.5" stroke-opacity="0.08"/>
      </pattern>
    </defs>
    <rect width="400" height="600" fill="url(#cyberBg)"/>
    <rect width="400" height="600" fill="url(#grid)"/>
    <circle cx="200" cy="250" r="140" fill="url(#aura)"/>
    <rect x="22" y="22" width="356" height="556" rx="20" fill="none" stroke="url(#neonGlow)" stroke-width="2" stroke-opacity="0.4"/>
    <rect x="30" y="30" width="340" height="540" rx="16" fill="none" stroke="#38bdf8" stroke-width="0.8" stroke-opacity="0.2" stroke-dasharray="4 6"/>
    <!-- Cyber Manga Emblem & Seal -->
    <circle cx="200" cy="240" r="70" fill="#0f172a" stroke="url(#neonGlow)" stroke-width="3" stroke-opacity="0.8"/>
    <circle cx="200" cy="240" r="54" fill="none" stroke="#06b6d4" stroke-width="1.2" stroke-opacity="0.5" stroke-dasharray="6 4"/>
    <!-- Stylized Katana & Manga Seal Glyph -->
    <path d="M165 240 L235 240 M200 205 L200 275 M175 215 L225 265 M175 265 L225 215" stroke="url(#neonGlow)" stroke-width="3" stroke-linecap="round"/>
    <polygon points="200,185 240,240 200,295 160,240" fill="none" stroke="#f43f5e" stroke-width="2" stroke-opacity="0.75"/>
    <circle cx="200" cy="240" r="10" fill="#38bdf8"/>
    <!-- Top & Bottom HUD Tech Decals -->
    <text x="40" y="55" fill="#06b6d4" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" letter-spacing="2">SYS::ARCHIVE</text>
    <text x="360" y="55" text-anchor="end" fill="#f43f5e" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" letter-spacing="2">VERIFIED</text>
    <text x="200" y="380" text-anchor="middle" fill="#f8fafc" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="20" font-weight="900" letter-spacing="3">MANGA ARCHIVE</text>
    <text x="200" y="405" text-anchor="middle" fill="#06b6d4" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" letter-spacing="3">AUTHENTIC EDITION</text>
    <line x1="120" y1="425" x2="280" y2="425" stroke="url(#neonGlow)" stroke-width="2" stroke-linecap="round"/>
    <text x="200" y="535" text-anchor="middle" fill="#64748b" font-family="'JetBrains Mono', monospace" font-size="9" letter-spacing="4">KURONEKO // WEBTOON NETWORK</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}


/**
 * Detect large skips or cutoffs between chapters (e.g. from Ch 20 skipping directly to Ch 60)
 */
export function detectChapterGaps(chapters) {
  if (!Array.isArray(chapters) || chapters.length < 2) return [];
  const valid = chapters
    .map((c) => ({ ...c, num: parseFloat(String(c.chapter || '').replace(/[^0-9.]/g, '')) }))
    .filter((c) => !isNaN(c.num) && c.num > 0 && !(c.num >= 1990 && c.num <= 2030))
    .sort((a, b) => b.num - a.num);

  if (valid.length < 2) return [];
  const gaps = [];
  for (let i = 0; i < valid.length - 1; i++) {
    const diff = valid[i].num - valid[i + 1].num;
    // Missing 3 or more chapters between consecutive entries (e.g. 20 to 60)
    if (diff >= 3) {
      gaps.push({
        from: valid[i + 1].num,
        to: valid[i].num,
        missingCount: Math.round(diff - 1),
      });
    }
  }
  return gaps;
}

/**
 * Merge chapters from multiple sources to fill in missing chapters and bridge gaps
 */
export function mergeAndDeduplicateChapters(primaryChapters = [], secondaryChapters = []) {
  if (!Array.isArray(primaryChapters) || primaryChapters.length === 0) {
    return deduplicateChapters(secondaryChapters || []);
  }
  if (!Array.isArray(secondaryChapters) || secondaryChapters.length === 0) {
    return deduplicateChapters(primaryChapters);
  }

  const map = new Map();

  // Secondary chapters serve as filler for missing numbers
  secondaryChapters.forEach((ch) => {
    if (!ch || (!ch.id && !ch.chapter)) return;
    const num = parseFloat(ch.chapter);
    const key = !isNaN(num) ? `num:${num}` : `str:${String(ch.chapter || ch.title).toLowerCase().trim()}`;
    map.set(key, ch);
  });

  // Primary chapters take precedence for existing chapter numbers
  primaryChapters.forEach((ch) => {
    if (!ch || (!ch.id && !ch.chapter)) return;
    const num = parseFloat(ch.chapter);
    const key = !isNaN(num) ? `num:${num}` : `str:${String(ch.chapter || ch.title).toLowerCase().trim()}`;
    map.set(key, ch);
  });

  return deduplicateChapters(Array.from(map.values()));
}
