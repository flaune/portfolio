import { useEffect, useRef } from 'react';
import Webamp from 'webamp';
import { createLogger } from '@/lib/logger';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOSStore, Track } from '@/lib/store';

const logger = createLogger('Webamp');

// MP3 tracks with proper URLs matching the Track interface
const tracks: Track[] = [
  {
    id: 1,
    title: "Lyn - No More What If",
    url: "/attached_assets/lyn_-_no_more_what_if_1765390331882.mp3",
    duration: 0
  },
  {
    id: 2,
    title: "Philip Bailey - Easy Lover",
    url: "/attached_assets/Philip_Bailey_-_Easy_Lover_1765390331881.mp3",
    duration: 0
  },
  {
    id: 3,
    title: "Home Made Kazoku - Thank You",
    url: "/attached_assets/home_made_kazoku_-_thank_you_1765390331882.mp3",
    duration: 0
  },
  {
    id: 4,
    title: "Last Dinosaur - Zoom",
    url: "/attached_assets/Last Dinosaur - Zoom.mp3",
    duration: 0
  },
];

// Mobile-friendly audio player component
function MobileMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Use shared store state
  const {
    music,
    musicPlay,
    musicPause,
    musicNext,
    musicPrev,
    musicUpdateTime,
    musicSetDuration,
    musicSetVolume,
    setMusicTracks
  } = useOSStore();

  const { currentTrackIndex, playState, currentTime, duration, volume } = music;
  const currentTrack = tracks[currentTrackIndex];
  const isPlaying = playState === 'playing';

  // Initialize tracks in store on mount
  useEffect(() => {
    setMusicTracks(tracks);
  }, [setMusicTracks]);

  // Sync audio element with store state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => musicUpdateTime(audio.currentTime);
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        musicSetDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      // Auto-play next track
      if (currentTrackIndex < tracks.length - 1) {
        musicNext();
      } else {
        musicPause();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, musicUpdateTime, musicSetDuration, musicNext, musicPause]);

  // Handle playback state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(err => {
        logger.error('Failed to play:', err);
        musicPause();
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrackIndex, musicPause]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Sync current time when changed externally (e.g., from store)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Only update if significantly different (avoid feedback loop)
    if (Math.abs(audio.currentTime - currentTime) > 0.5) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  const togglePlayPause = () => {
    if (isPlaying) {
      musicPause();
    } else {
      musicPlay();
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    musicUpdateTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    musicSetVolume(parseFloat(e.target.value) * 100);
  };

  const playNext = () => {
    if (currentTrackIndex < tracks.length - 1) {
      musicNext();
      musicPlay();
    }
  };

  const playPrevious = () => {
    if (currentTrackIndex > 0) {
      musicPrev();
      musicPlay();
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mobile-music-player">
      <audio ref={audioRef} src={currentTrack.url} preload="metadata" />

      <div className="track-info">
        <div className="track-name">{currentTrack.title}</div>
        <div className="track-counter">{currentTrackIndex + 1} / {tracks.length}</div>
      </div>

      <div className="progress-container">
        <span className="time-display">{formatTime(currentTime)}</span>
        <input
          type="range"
          className="progress-bar"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleProgressChange}
          step="0.1"
        />
        <span className="time-display">{formatTime(duration)}</span>
      </div>

      <div className="controls">
        <button
          onClick={playPrevious}
          disabled={currentTrackIndex === 0}
          className="control-btn"
          aria-label="Previous track"
        >
          ⏮
        </button>
        <button
          onClick={togglePlayPause}
          className="control-btn play-pause-btn"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          onClick={playNext}
          disabled={currentTrackIndex === tracks.length - 1}
          className="control-btn"
          aria-label="Next track"
        >
          ⏭
        </button>
      </div>

      <div className="volume-container">
        <span className="volume-icon">🔊</span>
        <input
          type="range"
          className="volume-slider"
          min="0"
          max="1"
          step="0.01"
          value={volume / 100}
          onChange={handleVolumeChange}
          aria-label="Volume"
        />
        <span className="volume-percentage">{Math.round(volume)}%</span>
      </div>

      <style>{`
        .mobile-music-player {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          padding: 24px;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          font-family: system-ui, -apple-system, sans-serif;
        }

        .track-info {
          text-align: center;
          margin-bottom: 20px;
        }

        .track-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--foreground);
          margin-bottom: 4px;
        }

        .track-counter {
          font-size: 12px;
          color: var(--muted-foreground);
        }

        .progress-container {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .time-display {
          font-size: 12px;
          color: var(--muted-foreground);
          min-width: 40px;
          text-align: center;
        }

        .progress-bar {
          flex: 1;
          height: 6px;
          border-radius: 3px;
          appearance: none;
          background: var(--secondary);
          outline: none;
        }

        .progress-bar::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          transition: transform 0.2s;
        }

        .progress-bar::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        .progress-bar::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          border: none;
          transition: transform 0.2s;
        }

        .progress-bar::-moz-range-thumb:hover {
          transform: scale(1.2);
        }

        .controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .control-btn {
          background: var(--secondary);
          border: none;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 20px;
          transition: all 0.2s;
          color: var(--foreground);
        }

        .control-btn:hover:not(:disabled) {
          background: var(--accent);
          transform: scale(1.05);
        }

        .control-btn:active:not(:disabled) {
          transform: scale(0.95);
        }

        .control-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .play-pause-btn {
          width: 56px;
          height: 56px;
          background: var(--primary);
          color: var(--primary-foreground);
          font-size: 24px;
        }

        .volume-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .volume-icon {
          font-size: 18px;
        }

        .volume-slider {
          flex: 1;
          height: 6px;
          border-radius: 3px;
          appearance: none;
          background: var(--secondary);
          outline: none;
        }

        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
        }

        .volume-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          border: none;
        }

        .volume-percentage {
          font-size: 12px;
          color: var(--muted-foreground);
          min-width: 40px;
          text-align: right;
        }

        @media (prefers-color-scheme: dark) {
          .mobile-music-player {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }
        }
      `}</style>
    </div>
  );
}

// Desktop Webamp player component
function DesktopMusicPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const webampRef = useRef<Webamp | null>(null);

  // Use shared store state
  const {
    music,
    setMusicTracks,
    musicSetTrack,
    musicPlay,
    musicPause,
    musicUpdateTime,
    musicSetVolume
  } = useOSStore();

  const { currentTrackIndex, playState, volume } = music;

  // Initialize tracks in store on mount
  useEffect(() => {
    setMusicTracks(tracks);
  }, [setMusicTracks]);

  useEffect(() => {
    // Initialize Webamp when component mounts
    if (containerRef.current && !webampRef.current) {
      const webampTracks = tracks.map(track => ({
        url: track.url,
        metaData: {
          artist: track.title.split(' - ')[0],
          title: track.title.split(' - ')[1] || track.title
        }
      }));

      const webamp = new Webamp({
        initialTracks: webampTracks,
        enableHotkeys: true,
      });

      webamp.renderWhenReady(containerRef.current).then(() => {
        logger.log('Rendered successfully');

        // Sync initial state from store
        if (currentTrackIndex > 0) {
          webamp.setTracksToPlay([currentTrackIndex]);
        }
        if (playState === 'playing') {
          webamp.play();
        }
        webamp.setVolume(volume);

        // Listen to Webamp events and update store
        webamp.onTrackDidChange((track) => {
          if (track && typeof track === 'number') {
            musicSetTrack(track);
          }
        });

        webamp.onWillClose(() => {
          logger.log('Webamp closing');
          musicPause();
        });

      }).catch((error) => {
        logger.error('Failed to render:', error);
      });

      webampRef.current = webamp;
    }

    // Cleanup on unmount
    return () => {
      if (webampRef.current) {
        logger.log('Disposing');
        // Save current state before disposing
        try {
          const webamp = webampRef.current;
          const currentTime = webamp.timeElapsed();
          if (currentTime !== null) {
            musicUpdateTime(currentTime);
          }
        } catch (err) {
          logger.error('Error saving state:', err);
        }
        webampRef.current.dispose();
        webampRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      data-testid="webamp-container"
    />
  );
}

// Main component that switches between mobile and desktop players
export function MusicPlayer() {
  const isMobile = useIsMobile();

  return isMobile ? <MobileMusicPlayer /> : <DesktopMusicPlayer />;
}
