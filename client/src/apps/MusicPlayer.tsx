import { useEffect, useRef } from 'react';
import Webamp from 'webamp';
import { createLogger } from '@/lib/logger';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOSStore, Track } from '@/lib/store';

const logger = createLogger('MusicPlayer');

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

// Mobile-friendly audio player component with VLC-inspired design
// Note: This is UI-only. Audio playback is handled by PersistentAudioPlayer
function MobileMusicPlayer() {
  // Use shared store state
  const {
    music,
    musicPlay,
    musicPause,
    musicNext,
    musicPrev,
    musicUpdateTime,
    musicSetVolume,
    setMusicTracks,
    theme
  } = useOSStore();

  const { currentTrackIndex, playState, currentTime, duration, volume } = music;
  const currentTrack = tracks[currentTrackIndex];
  const isPlaying = playState === 'playing';
  const isDark = theme === 'dark';

  // Initialize tracks in store on mount
  useEffect(() => {
    setMusicTracks(tracks);
  }, [setMusicTracks]);

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
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    musicSetVolume(parseFloat(e.target.value));
  };

  const playNext = () => {
    musicNext();
    if (playState !== 'stopped') {
      musicPlay();
    }
  };

  const playPrevious = () => {
    musicPrev();
    if (playState !== 'stopped') {
      musicPlay();
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`vlc-music-player ${isDark ? 'dark' : 'light'}`}>
      {/* Large Album Art Area */}
      <div className="album-art">
        <div className="album-art-placeholder">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="55" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
            <circle cx="60" cy="60" r="8" fill="currentColor" opacity="0.3"/>
            <path d="M60 15 L60 105 M15 60 L105 60" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
          </svg>
        </div>
      </div>

      {/* Track Info */}
      <div className="track-info">
        <h2 className="track-title">{currentTrack.title}</h2>
        <p className="track-meta">Track {currentTrackIndex + 1} of {tracks.length}</p>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
          <input
            type="range"
            className="progress-input"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            step="0.1"
          />
        </div>
        <div className="time-info">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="controls">
        <button
          onClick={playPrevious}
          className="control-btn"
          aria-label="Previous track"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z"/>
          </svg>
        </button>
        <button
          onClick={togglePlayPause}
          className="control-btn play-btn"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>
        <button
          onClick={playNext}
          className="control-btn"
          aria-label="Next track"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>
      </div>

      {/* Volume Control */}
      <div className="volume-section">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="volume-icon">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
        </svg>
        <input
          type="range"
          className="volume-slider"
          min="0"
          max="100"
          step="1"
          value={volume}
          onChange={handleVolumeChange}
          aria-label="Volume"
        />
        <span className="volume-value">{Math.round(volume)}%</span>
      </div>

      <style>{`
        .vlc-music-player {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100%;
          padding: 40px 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .vlc-music-player.light {
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
          color: #1a1a1a;
        }

        .vlc-music-player.dark {
          background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
          color: #ffffff;
        }

        /* Album Art */
        .album-art {
          margin-bottom: 32px;
        }

        .album-art-placeholder {
          width: 200px;
          height: 200px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .light .album-art-placeholder {
          background: linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%);
          color: #666;
        }

        .dark .album-art-placeholder {
          background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
          color: #888;
        }

        /* Track Info */
        .track-info {
          text-align: center;
          margin-bottom: 32px;
          max-width: 90%;
        }

        .track-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        .track-meta {
          font-size: 14px;
          margin: 0;
          opacity: 0.6;
        }

        /* Progress Section */
        .progress-section {
          width: 100%;
          max-width: 400px;
          margin-bottom: 32px;
        }

        .progress-track {
          position: relative;
          height: 4px;
          border-radius: 2px;
          margin-bottom: 8px;
          overflow: hidden;
        }

        .light .progress-track {
          background: #e0e0e0;
        }

        .dark .progress-track {
          background: #333;
        }

        .progress-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          border-radius: 2px;
          transition: width 0.1s linear;
        }

        .light .progress-fill {
          background: linear-gradient(90deg, #ff6b35 0%, #ff8c42 100%);
        }

        .dark .progress-fill {
          background: linear-gradient(90deg, #ff6b35 0%, #ff8c42 100%);
        }

        .progress-input {
          position: absolute;
          top: -6px;
          left: 0;
          width: 100%;
          height: 16px;
          opacity: 0;
          cursor: pointer;
          z-index: 10;
        }

        .time-info {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          opacity: 0.6;
        }

        /* Controls */
        .controls {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 40px;
        }

        .control-btn {
          background: none;
          border: none;
          padding: 12px;
          cursor: pointer;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .light .control-btn {
          color: #333;
        }

        .dark .control-btn {
          color: #fff;
        }

        .light .control-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .dark .control-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .control-btn:active {
          transform: scale(0.95);
        }

        .play-btn {
          padding: 16px;
        }

        .light .play-btn {
          background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
        }

        .dark .play-btn {
          background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
        }

        .play-btn:hover {
          transform: scale(1.05);
        }

        /* Volume Section */
        .volume-section {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          max-width: 300px;
        }

        .volume-icon {
          opacity: 0.6;
          flex-shrink: 0;
        }

        .volume-slider {
          flex: 1;
          height: 4px;
          border-radius: 2px;
          appearance: none;
          outline: none;
          cursor: pointer;
        }

        .light .volume-slider {
          background: #e0e0e0;
        }

        .dark .volume-slider {
          background: #333;
        }

        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ff6b35;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .volume-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        .volume-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ff6b35;
          cursor: pointer;
          border: none;
          transition: transform 0.2s;
        }

        .volume-slider::-moz-range-thumb:hover {
          transform: scale(1.2);
        }

        .volume-value {
          font-size: 12px;
          opacity: 0.6;
          min-width: 40px;
          text-align: right;
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
          webamp.setCurrentTrack(currentTrackIndex);
        }
        if (playState === 'playing') {
          webamp.play();
        }
        webamp.setVolume(volume);

        // Listen to Webamp events and update store
        webamp.onTrackDidChange((trackInfo) => {
          if (trackInfo) {
            // Find the index of the track by URL
            const trackIndex = tracks.findIndex(t => t.url === trackInfo.url);
            if (trackIndex !== -1) {
              musicSetTrack(trackIndex);
            }
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
