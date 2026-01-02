import { useEffect, useRef } from 'react';
import Webamp from 'webamp';
import { createLogger } from '@/lib/logger';

const logger = createLogger('Webamp');

// MP3 tracks with proper URLs
const tracks = [
  {
    url: "/attached_assets/lyn_-_no_more_what_if_1765390331882.mp3",
    defaultName: "Lyn - No More What If"
  },
  {
    url: "/attached_assets/Philip_Bailey_-_Easy_Lover_1765390331881.mp3",
    defaultName: "Philip Bailey - Easy Lover"
  },
  {
    url: "/attached_assets/home_made_kazoku_-_thank_you_1765390331882.mp3",
    defaultName: "Home Made Kazoku - Thank You"
  },
  {
    url: "/attached_assets/Last Dinosaur - Zoom.mp3",
    defaultName: "Last Dinosaur - Zoom"
  },
];

export function MusicPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const webampRef = useRef<Webamp | null>(null);

  useEffect(() => {
    // Initialize Webamp when component mounts
    if (containerRef.current && !webampRef.current) {
      const webamp = new Webamp({
        initialTracks: tracks,
        enableHotkeys: true,
      });

      webamp.renderWhenReady(containerRef.current).then(() => {
        logger.log('Rendered successfully');
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
  }, []);

  return (
    <div
      ref={containerRef}
      data-testid="webamp-container"
    />
  );
}
