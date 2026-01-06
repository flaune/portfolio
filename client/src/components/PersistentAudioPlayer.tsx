import { useEffect, useRef, useState } from 'react';
import { useOSStore } from '@/lib/store';
import { createLogger } from '@/lib/logger';

const logger = createLogger('PersistentAudioPlayer');

export function PersistentAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const shouldPlayRef = useRef(false);

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

  // Setup audio event listeners
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
    const handleCanPlay = () => {
      logger.log('Audio can play');
      setIsAudioReady(true);
    };
    const handleError = (e: Event) => {
      logger.error('Audio error:', audio.error);
      musicPause();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrackIndex, musicUpdateTime, musicSetDuration, musicNext, musicPause, tracks.length]);

  // Handle track changes - load new audio source
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Don't load if URL is empty or invalid
    if (!currentTrack?.url || currentTrack.url.trim() === '') {
      logger.log('No valid URL, skipping load');
      return;
    }

    logger.log('Loading track:', currentTrack.title);
    setIsAudioReady(false);
    audio.src = currentTrack.url;
    audio.load();

    // If we should be playing, remember that for when audio is ready
    if (isPlaying) {
      shouldPlayRef.current = true;
    }
  }, [currentTrack?.url, currentTrack?.title, isPlaying]);

  // Handle playback state changes - only when audio is ready
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      shouldPlayRef.current = true;
      if (isAudioReady) {
        logger.log('Playing audio');
        audio.play().catch(err => {
          logger.error('Failed to play:', err);
          musicPause();
        });
      } else {
        logger.log('Waiting for audio to be ready...');
      }
    } else {
      shouldPlayRef.current = false;
      audio.pause();
    }
  }, [isPlaying, isAudioReady, musicPause]);

  // Auto-play when audio becomes ready if we should be playing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isAudioReady || !shouldPlayRef.current) return;

    logger.log('Audio ready, auto-playing');
    audio.play().catch(err => {
      logger.error('Failed to auto-play:', err);
      musicPause();
    });
  }, [isAudioReady, musicPause]);

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
  return <audio ref={audioRef} preload="metadata" />;
}
