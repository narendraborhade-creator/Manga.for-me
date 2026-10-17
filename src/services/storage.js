// LocalStorage Keys
const KEYS = {
  BOOKMARKS: 'kuroneko_bookmarks_v1',
  HISTORY: 'kuroneko_history_v1',
  LAST_READ: 'kuroneko_last_read_v1',
  READER_SETTINGS: 'kuroneko_reader_settings_v1',
};

// Default reader settings
export const DEFAULT_SETTINGS = {
  readingMode: 'webtoon', // 'webtoon' (vertical strip) | 'single' | 'double'
  dataSaver: false,
  fitMode: 'width', // 'width' | 'height' | 'original'
  pageGap: 8, // pixels between pages in webtoon mode
  readingDirection: 'ltr', // 'ltr' | 'rtl' (for single/double)
};

// Safe JSON parser
function safeGet(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

// ----------------- BOOKMARKS & LIBRARY -----------------
export const getBookmarks = () => safeGet(KEYS.BOOKMARKS, {});

export const setBookmark = (mangaId, mangaData, status = 'reading') => {
  const bookmarks = getBookmarks();
  bookmarks[mangaId] = {
    id: mangaId,
    title: mangaData.title,
    coverUrl: mangaData.coverUrl,
    latestChapter: mangaData.latestChapter || 'Unknown',
    status, // 'reading', 'plan_to_read', 'completed', 'on_hold', 'favorite'
    updatedAt: new Date().toISOString(),
    rating: mangaData.rating || null,
  };
  safeSet(KEYS.BOOKMARKS, bookmarks);
  return bookmarks;
};

export const removeBookmark = (mangaId) => {
  const bookmarks = getBookmarks();
  delete bookmarks[mangaId];
  safeSet(KEYS.BOOKMARKS, bookmarks);
  return bookmarks;
};

export const isBookmarked = (mangaId) => {
  const bookmarks = getBookmarks();
  return !!bookmarks[mangaId];
};

export const getBookmarkStatus = (mangaId) => {
  const bookmarks = getBookmarks();
  return bookmarks[mangaId]?.status || null;
};

// ----------------- READING HISTORY & TRACKING -----------------
export const getHistory = () => safeGet(KEYS.HISTORY, []);

export const getLastRead = () => safeGet(KEYS.LAST_READ, null);

export const recordReadingProgress = ({
  mangaId,
  mangaTitle,
  coverUrl,
  chapterId,
  chapterNumber,
  chapterTitle = '',
  totalChapters = null,
  currentPage = 1,
  totalPages = 1,
}) => {
  const timestamp = new Date().toISOString();
  const lastReadObj = {
    mangaId,
    mangaTitle,
    coverUrl,
    chapterId,
    chapterNumber,
    chapterTitle,
    totalChapters,
    currentPage,
    totalPages,
    updatedAt: timestamp,
  };

  // Update Last Read
  safeSet(KEYS.LAST_READ, lastReadObj);

  // Update History List
  const history = getHistory();
  const existingIdx = history.findIndex((item) => item.mangaId === mangaId);

  // Maintain list of read chapters for this manga
  let readChapters = [];
  if (existingIdx !== -1) {
    readChapters = history[existingIdx].readChapters || [];
    if (!readChapters.includes(chapterId)) {
      readChapters.push(chapterId);
    }
    history.splice(existingIdx, 1);
  } else {
    readChapters = [chapterId];
  }

  const updatedEntry = {
    ...lastReadObj,
    readChapters,
  };

  // Add to top of history
  history.unshift(updatedEntry);

  // Keep up to 100 recent items in history
  if (history.length > 100) {
    history.length = 100;
  }

  safeSet(KEYS.HISTORY, history);
  return { lastRead: lastReadObj, history };
};

export const getReadChaptersForManga = (mangaId) => {
  const history = getHistory();
  const entry = history.find((item) => item.mangaId === mangaId);
  return entry ? entry.readChapters || [] : [];
};

export const clearHistory = () => {
  safeSet(KEYS.HISTORY, []);
  safeSet(KEYS.LAST_READ, null);
};

export const removeFromHistory = (mangaId) => {
  let history = getHistory();
  history = history.filter((item) => item.mangaId !== mangaId);
  safeSet(KEYS.HISTORY, history);

  const lastRead = getLastRead();
  if (lastRead && lastRead.mangaId === mangaId) {
    safeSet(KEYS.LAST_READ, history.length > 0 ? history[0] : null);
  }
};

// ----------------- READER SETTINGS -----------------
export const getReaderSettings = () => {
  const saved = safeGet(KEYS.READER_SETTINGS, {});
  return { ...DEFAULT_SETTINGS, ...saved };
};

export const saveReaderSettings = (settings) => {
  safeSet(KEYS.READER_SETTINGS, settings);
};

// ----------------- EXPORT / IMPORT BACKUP -----------------
export const exportData = () => {
  return JSON.stringify(
    {
      version: 1,
      bookmarks: getBookmarks(),
      history: getHistory(),
      lastRead: getLastRead(),
      readerSettings: getReaderSettings(),
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
};

export const importData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.bookmarks) safeSet(KEYS.BOOKMARKS, data.bookmarks);
    if (data.history) safeSet(KEYS.HISTORY, data.history);
    if (data.lastRead) safeSet(KEYS.LAST_READ, data.lastRead);
    if (data.readerSettings) safeSet(KEYS.READER_SETTINGS, data.readerSettings);
    return true;
  } catch (e) {
    console.error('Failed to import data:', e);
    return false;
  }
};
