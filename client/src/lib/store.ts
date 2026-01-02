import { create } from 'zustand';

export type AppId = 'finder' | 'gallery' | 'mail' | 'music' | 'video' | 'paint' | 'notes' | 'bookshelf' | 'linkedin' | 'twitter' | 'substack' | 'kalimba';

// Music controller types
export interface Track {
  id: number;
  title: string;
  duration: number;
  url: string;
}

// Default tracks (URLs will be set by MusicPlayer when it mounts)
export const defaultLightTracks: Track[] = [
  { id: 1, title: "Lyn - No More What If", duration: 300, url: "" },
  { id: 2, title: "Philip Bailey - Easy Lover", duration: 300, url: "" },
  { id: 3, title: "Home Made Kazoku - Thank You", duration: 300, url: "" },
];

export type PlayState = 'stopped' | 'playing' | 'paused';

export interface MusicState {
  tracks: Track[];
  currentTrackIndex: number;
  playState: PlayState;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: boolean;
  showMiniPlayer: boolean;
}

export interface WindowState {
  id: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isFullscreen: boolean;
  zIndex: number;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  savedPosition?: { x: number; y: number };
  savedSize?: { width: number; height: number };
}

interface OSState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  reduceMotion: boolean;
  toggleReduceMotion: () => void;
  
  uiZoom: number;
  setUIZoom: (zoom: number) => void;
  
  showHelpModal: boolean;
  setShowHelpModal: (show: boolean) => void;
  
  windows: Record<AppId, WindowState>;
  activeWindowId: AppId | null;
  maxZIndex: number;
  
  mobileActiveApp: AppId | null;
  openMobileApp: (id: AppId) => void;
  closeMobileApp: () => void;
  
  openWindow: (id: AppId) => void;
  closeWindow: (id: AppId) => void;
  minimizeWindow: (id: AppId) => void;
  toggleFullscreen: (id: AppId) => void;
  focusWindow: (id: AppId) => void;
  updateWindowPosition: (id: AppId, position: { x: number; y: number }) => void;
  updateWindowSize: (id: AppId, size: { width: number; height: number }) => void;
  
  // Music controller
  music: MusicState;
  setMusicTracks: (tracks: Track[]) => void;
  musicPlay: () => void;
  musicPause: () => void;
  musicStop: () => void;
  musicNext: () => void;
  musicPrev: () => void;
  musicSetTrack: (index: number) => void;
  musicUpdateTime: (time: number) => void;
  musicSetDuration: (duration: number) => void;
  musicSetVolume: (volume: number) => void;
  musicToggleShuffle: () => void;
  musicToggleRepeat: () => void;
  musicShowMiniPlayer: (show: boolean) => void;
  musicDismiss: () => void;
}

const initialWindows: Record<AppId, WindowState> = {
  finder: { id: 'finder', title: 'Finder', isOpen: true, isMinimized: false, isFullscreen: false, zIndex: 1, position: { x: 100, y: 50 }, size: { width: 800, height: 500 } },
  gallery: { id: 'gallery', title: 'My Portfolio', isOpen: false, isMinimized: false, isFullscreen: false, zIndex: 0, position: { x: 80, y: 40 }, size: { width: 900, height: 550 } },
  mail: { id: 'mail', title: 'Mail', isOpen: false, isMinimized: false, isFullscreen: false, zIndex: 0, position: { x: 150, y: 80 }, size: { width: 600, height: 500 } },
  music: { id: 'music', title: 'Music Player', isOpen: false, isMinimized: false, isFullscreen: false, zIndex: 0, position: { x: 200, y: 100 }, size: { width: 350, height: 500 } },
  video: { id: 'video', title: 'Video Player', isOpen: false, isMinimized: false, isFullscreen: false, zIndex: 0, position: { x: 250, y: 120 }, size: { width: 700, height: 450 } },
  paint: { id: 'paint', title: 'Paint', isOpen: false, isMinimized: false, isFullscreen: false, zIndex: 0, position: { x: 300, y: 150 }, size: { width: 600, height: 500 } },
  notes: { id: 'notes', title: 'Notes', isOpen: false, isMinimized: false, isFullscreen: false, zIndex: 0, position: { x: 180, y: 90 }, size: { width: 500, height: 450 } },
  bookshelf: { id: 'bookshelf', title: 'AI Resources', isOpen: false, isMinimized: false, isFullscreen: false, zIndex: 0, position: { x: 220, y: 110 }, size: { width: 700, height: 550 } },
  linkedin: { id: 'linkedin', title: 'LinkedIn', isOpen: false, isMinimized: false, isFullscreen: false, zIndex: 0, position: { x: 350, y: 80 }, size: { width: 400, height: 520 } },
  twitter: { id: 'twitter', title: 'X', isOpen: false, isMinimized: false, isFullscreen: false, zIndex: 0 },
  substack: { id: 'substack', title: 'Substack', isOpen: false, isMinimized: false, isFullscreen: false, zIndex: 0 },
  kalimba: { id: 'kalimba', title: 'Kalimba', isOpen: false, isMinimized: false, isFullscreen: false, zIndex: 0, position: { x: 200, y: 100 }, size: { width: 600, height: 700 } },
};

// Initialize theme from localStorage or default to 'light'
const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      // Apply dark theme immediately to prevent flash
      document.documentElement.classList.add('dark');
      return 'dark';
    }
  }
  // Always default to light mode
  document.documentElement.classList.remove('dark');
  return 'light';
};

export const useOSStore = create<OSState>((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Persist to localStorage
    localStorage.setItem('theme', newTheme);
    return { theme: newTheme };
  }),

  reduceMotion: false,
  toggleReduceMotion: () => set((state) => ({ reduceMotion: !state.reduceMotion })),

  uiZoom: 100,
  setUIZoom: (zoom) => set({ uiZoom: zoom }),

  showHelpModal: false,
  setShowHelpModal: (show) => set({ showHelpModal: show }),

  windows: initialWindows,
  activeWindowId: 'finder',
  maxZIndex: 1,
  
  mobileActiveApp: null,
  openMobileApp: (id) => set((state) => {
    const newZ = state.maxZIndex + 1;
    return {
      mobileActiveApp: id,
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], isOpen: true, isMinimized: false, zIndex: newZ }
      },
      activeWindowId: id,
      maxZIndex: newZ
    };
  }),
  closeMobileApp: () => set({ mobileActiveApp: null }),

  openWindow: (id) => set((state) => {
    const newZ = state.maxZIndex + 1;
    return {
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], isOpen: true, isMinimized: false, zIndex: newZ }
      },
      activeWindowId: id,
      maxZIndex: newZ
    };
  }),

  closeWindow: (id) => set((state) => ({
    windows: {
      ...state.windows,
      [id]: { ...state.windows[id], isOpen: false }
    }
  })),

  minimizeWindow: (id) => set((state) => ({
    windows: {
      ...state.windows,
      [id]: { ...state.windows[id], isMinimized: true }
    },
    activeWindowId: null
  })),

  toggleFullscreen: (id) => set((state) => {
    const win = state.windows[id];
    if (win.isFullscreen) {
      return {
        windows: {
          ...state.windows,
          [id]: {
            ...win,
            isFullscreen: false,
            position: win.savedPosition || win.position,
            size: win.savedSize || win.size,
          }
        }
      };
    } else {
      return {
        windows: {
          ...state.windows,
          [id]: {
            ...win,
            isFullscreen: true,
            savedPosition: win.position,
            savedSize: win.size,
          }
        }
      };
    }
  }),

  focusWindow: (id) => set((state) => {
    const newZ = state.maxZIndex + 1;
    return {
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], isMinimized: false, zIndex: newZ }
      },
      activeWindowId: id,
      maxZIndex: newZ
    };
  }),

  updateWindowPosition: (id, position) => set((state) => ({
    windows: {
      ...state.windows,
      [id]: { ...state.windows[id], position }
    }
  })),

  updateWindowSize: (id, size) => set((state) => ({
    windows: {
      ...state.windows,
      [id]: { ...state.windows[id], size }
    }
  })),

  // Music controller state and actions
  music: {
    tracks: defaultLightTracks,
    currentTrackIndex: 0,
    playState: 'stopped',
    currentTime: 0,
    duration: 0,
    volume: 80,
    shuffle: false,
    repeat: false,
    showMiniPlayer: false,
  },
  
  setMusicTracks: (tracks) => set((state) => ({
    music: { ...state.music, tracks, currentTrackIndex: 0, currentTime: 0 }
  })),
  
  musicPlay: () => set((state) => ({
    music: { ...state.music, playState: 'playing', showMiniPlayer: true }
  })),
  
  musicPause: () => set((state) => ({
    music: { ...state.music, playState: 'paused' }
  })),
  
  musicStop: () => set((state) => ({
    music: { ...state.music, playState: 'stopped', currentTime: 0, showMiniPlayer: false }
  })),
  
  musicNext: () => set((state) => {
    const { tracks, currentTrackIndex, shuffle, repeat } = state.music;
    if (tracks.length === 0) return state;
    
    // Filter out tracks without URLs
    const validTracks = tracks.filter(t => t.url && t.url.trim() !== '');
    if (validTracks.length === 0) return state;
    
    const validIndices = tracks
      .map((t, i) => ({ track: t, index: i }))
      .filter(({ track }) => track.url && track.url.trim() !== '')
      .map(({ index }) => index);
    
    const currentValidIndex = validIndices.indexOf(currentTrackIndex);
    
    // If current track is invalid, start from first valid track
    if (currentValidIndex === -1) {
      return {
        music: { ...state.music, currentTrackIndex: validIndices[0], currentTime: 0 }
      };
    }
    
    let nextValidIndex: number;
    
    if (repeat) {
      nextValidIndex = currentValidIndex;
    } else if (shuffle) {
      nextValidIndex = Math.floor(Math.random() * validIndices.length);
      if (nextValidIndex === currentValidIndex && validIndices.length > 1) {
        nextValidIndex = (nextValidIndex + 1) % validIndices.length;
      }
    } else {
      nextValidIndex = (currentValidIndex + 1) % validIndices.length;
    }
    
    return {
      music: { ...state.music, currentTrackIndex: validIndices[nextValidIndex], currentTime: 0 }
    };
  }),
  
  musicPrev: () => set((state) => {
    const { tracks, currentTrackIndex, currentTime } = state.music;
    if (tracks.length === 0) return state;
    
    if (currentTime > 3) {
      return { music: { ...state.music, currentTime: 0 } };
    }
    
    // Filter out tracks without URLs
    const validIndices = tracks
      .map((t, i) => ({ track: t, index: i }))
      .filter(({ track }) => track.url && track.url.trim() !== '')
      .map(({ index }) => index);
    
    if (validIndices.length === 0) return state;
    
    const currentValidIndex = validIndices.indexOf(currentTrackIndex);
    const prevValidIndex = (currentValidIndex - 1 + validIndices.length) % validIndices.length;
    
    return {
      music: { ...state.music, currentTrackIndex: validIndices[prevValidIndex], currentTime: 0 }
    };
  }),
  
  musicSetTrack: (index) => set((state) => ({
    music: { ...state.music, currentTrackIndex: index, currentTime: 0, playState: 'playing', showMiniPlayer: true }
  })),
  
  musicUpdateTime: (time) => set((state) => ({
    music: { ...state.music, currentTime: time }
  })),
  
  musicSetDuration: (duration) => set((state) => ({
    music: { ...state.music, duration }
  })),
  
  musicSetVolume: (volume) => set((state) => ({
    music: { ...state.music, volume }
  })),
  
  musicToggleShuffle: () => set((state) => ({
    music: { ...state.music, shuffle: !state.music.shuffle }
  })),
  
  musicToggleRepeat: () => set((state) => ({
    music: { ...state.music, repeat: !state.music.repeat }
  })),
  
  musicShowMiniPlayer: (show) => set((state) => ({
    music: { ...state.music, showMiniPlayer: show }
  })),
  
  musicDismiss: () => set((state) => ({
    music: { ...state.music, playState: 'stopped', currentTime: 0, showMiniPlayer: false }
  })),
}));