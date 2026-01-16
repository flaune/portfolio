/**
 * Centralized localStorage cache utility for portfolio website
 * All keys are namespaced with "portfolio_" prefix to avoid conflicts
 *
 * Performance optimized:
 * - Debounced/throttled saves to prevent excessive writes
 * - Canvas compression to reduce storage
 * - Size limits with warnings
 * - Dev-mode performance monitoring
 */

const CACHE_PREFIX = 'portfolio_';
const MUSIC_CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CANVAS_SIZE_MB = 2; // Warn if canvas cache exceeds 2MB
const MAX_CANVAS_SIZE_BYTES = MAX_CANVAS_SIZE_MB * 1024 * 1024;
const PERF_WARN_THRESHOLD_MS = 50; // Warn if operation takes >50ms in dev mode
const IS_DEV = import.meta.env.DEV;

interface CacheData<T> {
  value: T;
  timestamp: number;
  expiresAt?: number;
}

/**
 * Performance utilities: Debounce and Throttle
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
};

/**
 * Debounce a function - delays execution until after wait time has elapsed since last call
 * Perfect for: scroll position saves, window resizes
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): DebouncedFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

/**
 * Throttle a function - limits execution to once per wait time
 * Perfect for: frequent events like dragging, but need regular updates
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): DebouncedFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastRan: number = 0;

  const throttled = (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastRan >= wait) {
      func(...args);
      lastRan = now;
    } else {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args);
        lastRan = Date.now();
        timeout = null;
      }, wait - (now - lastRan));
    }
  };

  throttled.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return throttled;
}

/**
 * Performance monitoring wrapper for dev mode
 */
function withPerformanceMonitoring<T>(
  operation: string,
  fn: () => T
): T {
  if (!IS_DEV) return fn();

  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  if (duration > PERF_WARN_THRESHOLD_MS) {
    console.warn(
      `[Cache Performance] ${operation} took ${duration.toFixed(2)}ms (threshold: ${PERF_WARN_THRESHOLD_MS}ms)`
    );
  }

  return result;
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
 * Compress canvas data by reducing quality (async for better performance)
 * @param dataUrl Base64 canvas data URL
 * @param quality JPEG quality 0-1 (default 0.8)
 * @returns Promise<Compressed data URL or original if compression fails>
 */
export async function compressCanvasData(dataUrl: string, quality: number = 0.8): Promise<string> {
  try {
    // If it's already small enough, return as-is
    const sizeBytes = new Blob([dataUrl]).size;
    if (sizeBytes < MAX_CANVAS_SIZE_BYTES) {
      return dataUrl;
    }

    // Use async image loading to avoid blocking the UI thread
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return dataUrl;

    // Load image asynchronously
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to load image'));
      image.src = dataUrl;
    });

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Use requestAnimationFrame to perform canvas operations without blocking
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        ctx.drawImage(img, 0, 0);
        resolve();
      });
    });

    // Convert to JPEG with quality reduction
    const compressedData = canvas.toDataURL('image/jpeg', quality);
    const compressedSize = new Blob([compressedData]).size;

    if (IS_DEV) {
      console.log(
        `[Cache] Canvas compressed: ${(sizeBytes / 1024).toFixed(2)}KB → ${(compressedSize / 1024).toFixed(2)}KB`
      );
    }

    // If still too large, warn user
    if (compressedSize > MAX_CANVAS_SIZE_BYTES) {
      console.warn(
        `[Cache] Canvas data is large (${(compressedSize / 1024 / 1024).toFixed(2)}MB). Consider clearing to free space.`
      );
    }

    return compressedData;
  } catch (e) {
    console.error('[Cache] Failed to compress canvas data:', e);
    return dataUrl;
  }
}

/**
 * Check cache item size and warn if too large
 */
function checkCacheSize(key: string, data: string): boolean {
  const sizeBytes = new Blob([data]).size;
  const sizeMB = sizeBytes / 1024 / 1024;

  if (sizeMB > MAX_CANVAS_SIZE_MB) {
    console.warn(
      `[Cache] Item "${key}" is large (${sizeMB.toFixed(2)}MB). Storage limit may be exceeded.`
    );
    return false;
  }

  return true;
}

/**
 * Get full cache key with prefix
 */
function getCacheKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

/**
 * Set item in cache with optional expiration
 * Includes performance monitoring and size checks
 */
export function cacheSet<T>(
  key: string,
  value: T,
  expiryMs?: number
): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  return withPerformanceMonitoring(`cacheSet(${key})`, () => {
    try {
      const cacheData: CacheData<T> = {
        value,
        timestamp: Date.now(),
        expiresAt: expiryMs ? Date.now() + expiryMs : undefined,
      };

      const serialized = JSON.stringify(cacheData);

      // Check size for large items (like canvas data)
      if (key.includes('canvas') || key.includes('CANVAS')) {
        checkCacheSize(key, serialized);
      }

      localStorage.setItem(getCacheKey(key), serialized);
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
  });
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
 * Paint-specific cache helpers with throttled saves and compression
 */
export const PaintCache = {
  /**
   * Save paint state (immediate for non-canvas data)
   * Canvas data should be saved via saveCanvasDataThrottled
   */
  saveState: async (state: {
    canvasData?: string | null;
    color: string;
    brushSize: number;
    tool: 'pencil' | 'eraser';
  }) => {
    // Save lightweight state immediately
    cacheSet(CacheKeys.PAINT_COLOR, state.color);
    cacheSet(CacheKeys.PAINT_BRUSH_SIZE, state.brushSize);
    cacheSet(CacheKeys.PAINT_TOOL, state.tool);

    // Canvas data is saved separately with throttling
    if (state.canvasData !== undefined && state.canvasData !== null) {
      // Compress before saving (async to avoid blocking)
      const compressed = await compressCanvasData(state.canvasData, 0.85);
      cacheSet(CacheKeys.PAINT_CANVAS_DATA, compressed);
    } else if (state.canvasData === null) {
      // Explicitly clear canvas cache
      cacheRemove(CacheKeys.PAINT_CANVAS_DATA);
    }
  },

  /**
   * Throttled canvas save - use this for drawing operations
   * Saves max once every 1500ms to avoid blocking
   */
  saveCanvasDataThrottled: throttle(async (canvasData: string) => {
    const compressed = await compressCanvasData(canvasData, 0.85);
    cacheSet(CacheKeys.PAINT_CANVAS_DATA, compressed);
  }, 1500), // 1.5 second throttle

  loadState: () => {
    return withPerformanceMonitoring('PaintCache.loadState', () => {
      return {
        canvasData: cacheGet<string | null>(CacheKeys.PAINT_CANVAS_DATA, null),
        color: cacheGet<string>(CacheKeys.PAINT_COLOR, '#000000'),
        brushSize: cacheGet<number>(CacheKeys.PAINT_BRUSH_SIZE, 2),
        tool: cacheGet<'pencil' | 'eraser'>(CacheKeys.PAINT_TOOL, 'pencil'),
      };
    });
  },

  clear: () => {
    cacheRemove(CacheKeys.PAINT_CANVAS_DATA);
    cacheRemove(CacheKeys.PAINT_COLOR);
    cacheRemove(CacheKeys.PAINT_BRUSH_SIZE);
    cacheRemove(CacheKeys.PAINT_TOOL);
  },
};

/**
 * Notes-specific cache helpers with debounced scroll saves
 */
export const NotesCache = {
  /**
   * Save notes state immediately (for note selection, etc.)
   */
  saveState: (state: {
    selectedNoteId: number | null;
    scrollPosition?: number;
    secretAnswer?: string;
    secretShown?: boolean;
  }) => {
    cacheSet(CacheKeys.NOTES_SELECTED, state.selectedNoteId);
    if (state.scrollPosition !== undefined) {
      cacheSet(CacheKeys.NOTES_SCROLL_POSITION, state.scrollPosition);
    }
    if (state.secretAnswer !== undefined) {
      cacheSet(CacheKeys.NOTES_SECRET_ANSWER, state.secretAnswer);
    }
    if (state.secretShown !== undefined) {
      cacheSet(CacheKeys.NOTES_SECRET_SHOWN, state.secretShown);
    }
  },

  /**
   * Debounced scroll position save - use for onScroll events
   * Waits 500ms after last scroll before saving
   */
  saveScrollPositionDebounced: debounce((scrollPosition: number) => {
    cacheSet(CacheKeys.NOTES_SCROLL_POSITION, scrollPosition);
  }, 500),

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

/**
 * Window management cache with debouncing for position/size updates
 * Use this for dragging operations to avoid excessive writes
 */
export const WindowCache = {
  /**
   * Save window state immediately (for open/close/minimize)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveState: (windows: Record<string, any>) => {
    cacheSet(CacheKeys.WINDOWS_STATE, windows);
  },

  /**
   * Debounced window state save - use for position/size updates during drag/resize
   * Waits 500ms after last change before saving
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveStateDebounced: debounce((windows: Record<string, any>) => {
    cacheSet(CacheKeys.WINDOWS_STATE, windows);
  }, 500),
};

/**
 * Initialize cache system - call once on app startup
 * Performs automatic cleanup of expired items
 */
export function initializeCache(): void {
  if (typeof window === 'undefined') return;

  // Clear expired cache items on startup
  const cleared = clearExpiredCache();

  // Get cache stats for monitoring
  const stats = getCacheStats();

  if (IS_DEV) {
    console.log('[Cache] Initialized', {
      itemsCleared: cleared,
      totalItems: stats.totalItems,
      totalSizeKB: (stats.totalSize / 1024).toFixed(2),
    });

    // Warn if total cache size is large
    if (stats.totalSize > 3 * 1024 * 1024) {
      // >3MB
      console.warn(
        `[Cache] Total cache size is ${(stats.totalSize / 1024 / 1024).toFixed(2)}MB. Consider using "Reset All Cache" in View menu.`
      );
    }
  }

  // Run cleanup periodically (every 5 minutes)
  setInterval(() => {
    const cleaned = clearExpiredCache();
    if (cleaned > 0 && IS_DEV) {
      console.log(`[Cache] Periodic cleanup removed ${cleaned} expired items`);
    }
  }, 5 * 60 * 1000);
}
