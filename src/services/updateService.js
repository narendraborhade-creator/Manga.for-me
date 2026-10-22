import { 
  getBookmarks, 
  getHistory, 
  getUpdates, 
  addUpdateNotification, 
  getUpdateSettings, 
  saveUpdateSettings 
} from './storage.js';
import { fetchMangaDetails } from './mangaApi.js';

/**
 * Request Browser Push / Desktop Notification Permission
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

/**
 * Send a Browser Desktop Notification
 */
export function sendBrowserNotification(title, body, iconUrl, onClickUrl = null) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }

  try {
    const notif = new Notification(title, {
      body,
      icon: iconUrl || '/favicon.ico',
      badge: '/favicon.ico',
      silent: false,
    });

    if (onClickUrl) {
      notif.onclick = () => {
        window.focus();
        if (typeof onClickUrl === 'function') {
          onClickUrl();
        }
      };
    }
    return notif;
  } catch (err) {
    console.warn('Could not show browser notification:', err);
    return null;
  }
}

/**
 * Check updates for a single manga
 */
export async function checkSingleMangaUpdates(mangaId) {
  try {
    const data = await fetchMangaDetails(mangaId, true);
    if (!data || !data.chapters || data.chapters.length === 0) return null;

    // Get the latest chapter numerically
    const sorted = [...data.chapters].sort(
      (a, b) => (parseFloat(b.chapter) || 0) - (parseFloat(a.chapter) || 0)
    );
    const latestChapter = sorted[0];
    return {
      mangaId,
      mangaTitle: data.title,
      mangaEnglishTitle: data.englishTitle || null,
      coverUrl: data.coverUrl,
      latestChapter,
      totalChapters: data.chapters.length,
    };
  } catch (err) {
    console.error(`checkSingleMangaUpdates error for ${mangaId}:`, err);
    return null;
  }
}

/**
 * Check updates for all bookmarked manga in library
 */
export async function checkAllLibraryUpdates(onUpdateFound = null) {
  const bookmarks = getBookmarks();
  const bookmarkList = Object.values(bookmarks);
  const history = getHistory();
  const settings = getUpdateSettings();

  // If no bookmarks, check recent history
  const targetMap = new Map();
  bookmarkList.forEach((b) => targetMap.set(b.id, b));
  history.slice(0, 10).forEach((h) => {
    if (!targetMap.has(h.mangaId)) {
      targetMap.set(h.mangaId, {
        id: h.mangaId,
        title: h.mangaTitle,
        englishTitle: h.mangaEnglishTitle,
        coverUrl: h.coverUrl,
        latestChapter: h.chapterNumber,
      });
    }
  });

  const targets = Array.from(targetMap.values());
  if (targets.length === 0) {
    // Add default popular tracking: Stepmother Second Life, One Piece, Fantasie of a Stepmother
    targets.push(
      { id: 'webtoon:stepmother-second-life', title: "The Step Mother's Began Her Second Life" },
      { id: 'wc:01J76XYDQ9JTWW4THBJWPXNJ9H', title: 'The Fantasie of a Stepmother' },
      { id: '2/one-piece', title: 'One Piece' }
    );
  }

  let newUpdatesFound = 0;
  const discoveredUpdates = [];

  // Fetch all updates concurrently to avoid N+1 query latency
  const updatePromises = targets.map(async (item) => {
    try {
      const res = await checkSingleMangaUpdates(item.id);
      return { item, res };
    } catch (e) {
      console.warn(`Update check failed for ${item.id}:`, e);
      return { item, res: null };
    }
  });

  const updateResults = await Promise.all(updatePromises);

  // Process the fetched results synchronously to maintain data consistency
  for (const { item, res } of updateResults) {
    if (!res || !res.latestChapter) continue;

    const latestNum = parseFloat(res.latestChapter.chapter) || 0;

    // Determine user's last known chapter
    const histItem = history.find((h) => h.mangaId === item.id);
    const lastReadNum = histItem ? parseFloat(histItem.chapterNumber) || 0 : 0;
    const knownLatestNum = parseFloat(item.latestChapter) || 0;

    // Has a new chapter dropped that is greater than what user read or previously recorded?
    const isNewDrop = latestNum > 0 && (
      (lastReadNum > 0 && latestNum > lastReadNum) ||
      (knownLatestNum > 0 && latestNum > knownLatestNum) ||
      (!lastReadNum && !knownLatestNum)
    );

    // Check if this notification already exists
    const existingUpdates = getUpdates();
    const alreadyNotified = existingUpdates.some(
      (u) => u.mangaId === item.id && String(u.chapterNumber) === String(res.latestChapter.chapter)
    );

    if (isNewDrop && !alreadyNotified) {
      const notif = {
        mangaId: item.id,
        mangaTitle: res.mangaTitle,
        mangaEnglishTitle: res.mangaEnglishTitle,
        coverUrl: res.coverUrl,
        chapterId: res.latestChapter.id,
        chapterNumber: res.latestChapter.chapter,
        chapterTitle: res.latestChapter.title,
        publishedAt: res.latestChapter.publishedAt || new Date().toLocaleDateString(),
      };

      const savedNotif = addUpdateNotification(notif);
      if (savedNotif) {
        newUpdatesFound++;
        discoveredUpdates.push(savedNotif);

        // Trigger Browser Desktop Notification if enabled
        if (settings.browserNotifications) {
          sendBrowserNotification(
            `New Chapter: ${res.mangaEnglishTitle || res.mangaTitle}`,
            `Chapter ${res.latestChapter.chapter} is now available!`,
            res.coverUrl
          );
        }

        if (onUpdateFound) {
          onUpdateFound(savedNotif);
        }
      }
    }
  }

  // Update last checked time
  saveUpdateSettings({
    ...settings,
    lastCheckedAt: new Date().toISOString(),
  });

  return {
    checkedCount: targets.length,
    newUpdatesCount: newUpdatesFound,
    discoveredUpdates,
    allUpdates: getUpdates(),
  };
}
