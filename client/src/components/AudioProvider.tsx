import { useEffect, useRef } from 'react';
import { useOSStore } from '@/lib/store';

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
      console.error('Audio error:', audio.error);
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

    console.log('[AudioProvider] Track changed:', currentTrack);

    if (!currentTrack?.url || currentTrack.url.trim() === '') {
      console.log('[AudioProvider] No valid URL, pausing and clearing source');
      audio.pause();
      audio.src = '';
      return;
    }

    console.log('[AudioProvider] Current audio.src:', audio.src);
    console.log('[AudioProvider] New track URL:', currentTrack.url);

    // Compare URLs properly - audio.src is absolute, currentTrack.url might be relative
    const currentSrc = audio.src;
    const newSrc = currentTrack.url.startsWith('http')
      ? currentTrack.url
      : window.location.origin + currentTrack.url;

    console.log('[AudioProvider] Comparing:', currentSrc, 'vs', newSrc);

    if (currentSrc !== newSrc) {
      console.log('[AudioProvider] Setting new audio source:', currentTrack.url);
      audio.src = currentTrack.url;
      audio.load();
    } else {
      console.log('[AudioProvider] Same source, skipping load');
    }
  }, [currentTrack?.url]);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    console.log('[AudioProvider] Play state changed:', playState);
    console.log('[AudioProvider] Audio ready state:', audio.readyState);
    console.log('[AudioProvider] Audio src:', audio.src);

    if (playState === 'playing') {
      // Only try to play if we have a valid audio source
      if (!audio.src || audio.src === '') {
        console.log('[AudioProvider] Cannot play - no audio source set');
        return;
      }
      console.log('[AudioProvider] Attempting to play');
      audio.play().catch((err) => {
        console.error('[AudioProvider] Play error:', err);
      });
    } else if (playState === 'paused') {
      console.log('[AudioProvider] Pausing');
      audio.pause();
    } else if (playState === 'stopped') {
      console.log('[AudioProvider] Stopping');
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
