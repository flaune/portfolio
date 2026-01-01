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
    
    if (!currentTrack?.url) {
      audio.pause();
      audio.src = '';
      return;
    }
    
    if (audio.src !== currentTrack.url) {
      audio.src = currentTrack.url;
      audio.load();
    }
  }, [currentTrack?.url]);

  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    if (playState === 'playing') {
      audio.play().catch(console.error);
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
