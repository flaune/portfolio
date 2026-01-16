/**
 * Centralized localStorage cache utility for portfolio website
 * All keys are namespaced with "portfolio_" prefix to avoid conflicts
 */

const CACHE_PREFIX = 'portfolio_';
const MUSIC_CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheData<T> {
  value: T;
  timestamp: number;
  expiresAt?: number;
}

/**
 * Cache keys enum for type safety and consistency
 */
export const CacheKeys = {
  // Music app
  MUSIC_CURRENT_TRACK: 'music_current_track',
  MUSIC_PLAYBACK_TIME: 'music_playback_time',
  MUSIC_VOLUME: 'music_volume',
  MUSIC_PLAY_STATE: 'music_play_state',
  MUSIC_SHUFFLE: 'music_shuffle',
  MUSIC_REPEAT: 'music_repeat',

  // Paint app
  PAINT_CANVAS_DATA: 'paint_canvas_data',
  PAINT_COLOR: 'paint_color',
  PAINT_BRUSH_SIZE: 'paint_brush_size',
  PAINT_TOOL: 'paint_tool',

  // Kalimba app
  KALIMBA_LAST_NOTES: 'kalimba_last_notes',
  KALIMBA_SEQUENCES: 'kalimba_sequences',

  // Window management
  WINDOWS_STATE: 'windows_state',
  WINDOWS_POSITIONS: 'windows_positions',
  WINDOWS_Z_INDEX: 'windows_z_index',

  // Notes app
  NOTES_SELECTED: 'notes_selected',
  NOTES_SCROLL_POSITION: 'notes_scroll_position',
  NOTES_SECRET_ANSWER: 'notes_secret_answer',
  NOTES_SECRET_SHOWN: 'notes_secret_shown',
} as const;

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = `${CACHE_PREFIX}test`;
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.warn('localStorage is not available:', e);
    return false;
  }
}

/**
 * Get full cache key with prefix
 */
function getCacheKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

/**
 * Set item in cache with optional expiration
 */
export function cacheSet<T>(
  key: string,
  value: T,
  expiryMs?: number
): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const cacheData: CacheData<T> = {
      value,
      timestamp: Date.now(),
      expiresAt: expiryMs ? Date.now() + expiryMs : undefined,
    };

    localStorage.setItem(getCacheKey(key), JSON.stringify(cacheData));
    return true;
  } catch (e) {
    // Handle quota exceeded or other errors
    if (e instanceof Error && e.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, attempting cleanup...');
      // Try to clear expired items and retry
      clearExpiredCache();
      try {
        const cacheData: CacheData<T> = {
          value,
          timestamp: Date.now(),
          expiresAt: expiryMs ? Date.now() + expiryMs : undefined,
        };
        localStorage.setItem(getCacheKey(key), JSON.stringify(cacheData));
        return true;
      } catch (retryError) {
        console.error('Failed to cache after cleanup:', retryError);
        return false;
      }
    }
    console.error('Failed to cache data:', e);
    return false;
  }
}

/**
 * Get item from cache with expiration check
 */
export function cacheGet<T>(key: string, defaultValue?: T): T | null {
  if (!isLocalStorageAvailable()) {
    return defaultValue ?? null;
  }

  try {
    const item = localStorage.getItem(getCacheKey(key));
    if (!item) {
      return defaultValue ?? null;
    }

    const cacheData: CacheData<T> = JSON.parse(item);

    // Check if expired
    if (cacheData.expiresAt && Date.now() > cacheData.expiresAt) {
      localStorage.removeItem(getCacheKey(key));
      return defaultValue ?? null;
    }

    return cacheData.value;
  } catch (e) {
    console.error('Failed to retrieve cached data:', e);
    // If corrupted, remove the item
    try {
      localStorage.removeItem(getCacheKey(key));
    } catch (removeError) {
      // Ignore removal errors
    }
    return defaultValue ?? null;
  }
}

/**
 * Remove specific item from cache
 */
export function cacheRemove(key: string): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(getCacheKey(key));
    return true;
  } catch (e) {
    console.error('Failed to remove cached item:', e);
    return false;
  }
}

/**
 * Clear all cache items with portfolio_ prefix
 */
export function cacheClearAll(): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const keys = Object.keys(localStorage);
    const portfolioKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));

    portfolioKeys.forEach((key) => {
      localStorage.removeItem(key);
    });

    console.log(`Cleared ${portfolioKeys.length} cached items`);
    return true;
  } catch (e) {
    console.error('Failed to clear cache:', e);
    return false;
  }
}

/**
 * Clear only expired cache items
 */
export function clearExpiredCache(): number {
  if (!isLocalStorageAvailable()) {
    return 0;
  }

  try {
    const keys = Object.keys(localStorage);
    const portfolioKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
    let clearedCount = 0;

    portfolioKeys.forEach((key) => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const cacheData: CacheData<unknown> = JSON.parse(item);
          if (cacheData.expiresAt && Date.now() > cacheData.expiresAt) {
            localStorage.removeItem(key);
            clearedCount++;
          }
        }
      } catch (e) {
        // If corrupted, remove it
        localStorage.removeItem(key);
        clearedCount++;
      }
    });

    if (clearedCount > 0) {
      console.log(`Cleared ${clearedCount} expired cached items`);
    }

    return clearedCount;
  } catch (e) {
    console.error('Failed to clear expired cache:', e);
    return 0;
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalItems: number;
  totalSize: number;
  itemsByKey: Record<string, number>;
} {
  const stats = {
    totalItems: 0,
    totalSize: 0,
    itemsByKey: {} as Record<string, number>,
  };

  if (!isLocalStorageAvailable()) {
    return stats;
  }

  try {
    const keys = Object.keys(localStorage);
    const portfolioKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));

    portfolioKeys.forEach((key) => {
      const item = localStorage.getItem(key);
      if (item) {
        const size = new Blob([item]).size;
        stats.totalItems++;
        stats.totalSize += size;
        stats.itemsByKey[key.replace(CACHE_PREFIX, '')] = size;
      }
    });
  } catch (e) {
    console.error('Failed to get cache stats:', e);
  }

  return stats;
}

/**
 * Music-specific cache helpers with 24-hour expiry
 */
export const MusicCache = {
  saveState: (state: {
    currentTrackIndex: number;
    currentTime: number;
    volume: number;
    playState: 'stopped' | 'playing' | 'paused';
    shuffle: boolean;
    repeat: boolean;
  }) => {
    cacheSet(CacheKeys.MUSIC_CURRENT_TRACK, state.currentTrackIndex, MUSIC_CACHE_EXPIRY_MS);
    cacheSet(CacheKeys.MUSIC_PLAYBACK_TIME, state.currentTime, MUSIC_CACHE_EXPIRY_MS);
    cacheSet(CacheKeys.MUSIC_VOLUME, state.volume, MUSIC_CACHE_EXPIRY_MS);
    cacheSet(CacheKeys.MUSIC_PLAY_STATE, state.playState, MUSIC_CACHE_EXPIRY_MS);
    cacheSet(CacheKeys.MUSIC_SHUFFLE, state.shuffle, MUSIC_CACHE_EXPIRY_MS);
    cacheSet(CacheKeys.MUSIC_REPEAT, state.repeat, MUSIC_CACHE_EXPIRY_MS);
  },

  loadState: () => {
    return {
      currentTrackIndex: cacheGet<number>(CacheKeys.MUSIC_CURRENT_TRACK, 0),
      currentTime: cacheGet<number>(CacheKeys.MUSIC_PLAYBACK_TIME, 0),
      volume: cacheGet<number>(CacheKeys.MUSIC_VOLUME, 75),
      playState: cacheGet<'stopped' | 'playing' | 'paused'>(CacheKeys.MUSIC_PLAY_STATE, 'stopped'),
      shuffle: cacheGet<boolean>(CacheKeys.MUSIC_SHUFFLE, false),
      repeat: cacheGet<boolean>(CacheKeys.MUSIC_REPEAT, false),
    };
  },

  clear: () => {
    cacheRemove(CacheKeys.MUSIC_CURRENT_TRACK);
    cacheRemove(CacheKeys.MUSIC_PLAYBACK_TIME);
    cacheRemove(CacheKeys.MUSIC_VOLUME);
    cacheRemove(CacheKeys.MUSIC_PLAY_STATE);
    cacheRemove(CacheKeys.MUSIC_SHUFFLE);
    cacheRemove(CacheKeys.MUSIC_REPEAT);
  },
};

/**
 * Paint-specific cache helpers
 */
export const PaintCache = {
  saveState: (state: {
    canvasData: string | null;
    color: string;
    brushSize: number;
    tool: 'pencil' | 'eraser';
  }) => {
    if (state.canvasData) {
      cacheSet(CacheKeys.PAINT_CANVAS_DATA, state.canvasData);
    }
    cacheSet(CacheKeys.PAINT_COLOR, state.color);
    cacheSet(CacheKeys.PAINT_BRUSH_SIZE, state.brushSize);
    cacheSet(CacheKeys.PAINT_TOOL, state.tool);
  },

  loadState: () => {
    return {
      canvasData: cacheGet<string | null>(CacheKeys.PAINT_CANVAS_DATA, null),
      color: cacheGet<string>(CacheKeys.PAINT_COLOR, '#000000'),
      brushSize: cacheGet<number>(CacheKeys.PAINT_BRUSH_SIZE, 2),
      tool: cacheGet<'pencil' | 'eraser'>(CacheKeys.PAINT_TOOL, 'pencil'),
    };
  },

  clear: () => {
    cacheRemove(CacheKeys.PAINT_CANVAS_DATA);
    cacheRemove(CacheKeys.PAINT_COLOR);
    cacheRemove(CacheKeys.PAINT_BRUSH_SIZE);
    cacheRemove(CacheKeys.PAINT_TOOL);
  },
};

/**
 * Notes-specific cache helpers
 */
export const NotesCache = {
  saveState: (state: {
    selectedNoteId: number | null;
    scrollPosition: number;
    secretAnswer?: string;
    secretShown?: boolean;
  }) => {
    cacheSet(CacheKeys.NOTES_SELECTED, state.selectedNoteId);
    cacheSet(CacheKeys.NOTES_SCROLL_POSITION, state.scrollPosition);
    if (state.secretAnswer !== undefined) {
      cacheSet(CacheKeys.NOTES_SECRET_ANSWER, state.secretAnswer);
    }
    if (state.secretShown !== undefined) {
      cacheSet(CacheKeys.NOTES_SECRET_SHOWN, state.secretShown);
    }
  },

  loadState: () => {
    return {
      selectedNoteId: cacheGet<number | null>(CacheKeys.NOTES_SELECTED, null),
      scrollPosition: cacheGet<number>(CacheKeys.NOTES_SCROLL_POSITION, 0),
      secretAnswer: cacheGet<string>(CacheKeys.NOTES_SECRET_ANSWER, ''),
      secretShown: cacheGet<boolean>(CacheKeys.NOTES_SECRET_SHOWN, false),
    };
  },

  clear: () => {
    cacheRemove(CacheKeys.NOTES_SELECTED);
    cacheRemove(CacheKeys.NOTES_SCROLL_POSITION);
    cacheRemove(CacheKeys.NOTES_SECRET_ANSWER);
    cacheRemove(CacheKeys.NOTES_SECRET_SHOWN);
  },
};

/**
 * Kalimba-specific cache helpers
 */
export const KalimbaCache = {
  saveState: (state: {
    lastNotes: string[];
    sequences: Array<{ name: string; notes: string[] }>;
  }) => {
    cacheSet(CacheKeys.KALIMBA_LAST_NOTES, state.lastNotes);
    cacheSet(CacheKeys.KALIMBA_SEQUENCES, state.sequences);
  },

  loadState: () => {
    return {
      lastNotes: cacheGet<string[]>(CacheKeys.KALIMBA_LAST_NOTES, []),
      sequences: cacheGet<Array<{ name: string; notes: string[] }>>(
        CacheKeys.KALIMBA_SEQUENCES,
        []
      ),
    };
  },

  clear: () => {
    cacheRemove(CacheKeys.KALIMBA_LAST_NOTES);
    cacheRemove(CacheKeys.KALIMBA_SEQUENCES);
  },
};
