import { useEffect, useRef } from 'react';
import { useOSStore } from '@/lib/store';
import { createLogger } from '@/lib/logger';

const logger = createLogger('PersistentAudioPlayer');

export function PersistentAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const {
    music,
    musicPlay,
    musicPause,
    musicNext,
    musicUpdateTime,
    musicSetDuration,
  } = useOSStore();

  const { tracks, currentTrackIndex, playState, currentTime, volume } = music;
  const currentTrack = tracks[currentTrackIndex];
  const isPlaying = playState === 'playing';

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
  }, [currentTrackIndex, musicUpdateTime, musicSetDuration, musicNext, musicPause, tracks.length]);

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

  // Don't render anything visible - this is just the audio element
  return <audio ref={audioRef} src={currentTrack?.url} preload="metadata" />;
}
