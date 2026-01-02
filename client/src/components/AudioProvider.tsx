import { useEffect, useRef } from 'react';
import { useOSStore } from '@/lib/store';
import { createLogger } from '@/lib/logger';

const logger = createLogger('AudioProvider');

export function AudioProvider() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    music,
    musicUpdateTime,
    musicSetDuration,
    musicNext,
    musicPause,
  } = useOSStore();

  const { tracks, currentTrackIndex, playState, volume, currentTime } = music;
  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }
    
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      musicUpdateTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      musicSetDuration(audio.duration);
    };

    const handleEnded = () => {
      musicNext();
    };

    const handleError = () => {
      logger.error('Audio error:', audio.error);
      musicPause();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [musicUpdateTime, musicSetDuration, musicNext, musicPause]);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    logger.log('Track changed:', currentTrack?.title);

    // Don't do anything if there's no valid URL - avoid setting empty src which causes "Invalid URI" error
    if (!currentTrack?.url || currentTrack.url.trim() === '') {
      logger.log('No valid URL, skipping');
      return;
    }

    // Compare URLs properly - audio.src is absolute, currentTrack.url might be relative
    const currentSrc = audio.src;
    const newSrc = currentTrack.url.startsWith('http')
      ? currentTrack.url
      : window.location.origin + currentTrack.url;

    if (currentSrc !== newSrc) {
      logger.log('Setting new audio source:', currentTrack.title);
      audio.src = currentTrack.url;
      audio.load();
    }
  }, [currentTrack?.url]);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    logger.log('Play state changed:', playState);

    if (playState === 'playing') {
      // Only try to play if we have a valid audio source
      if (!audio.src || audio.src === '') {
        logger.warn('Cannot play - no audio source set');
        return;
      }
      audio.play().catch((err) => {
        logger.error('Play error:', err);
      });
    } else if (playState === 'paused') {
      audio.pause();
    } else if (playState === 'stopped') {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [playState, currentTrack?.url]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    
    if (Math.abs(audio.currentTime - currentTime) > 1) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  return null;
}
