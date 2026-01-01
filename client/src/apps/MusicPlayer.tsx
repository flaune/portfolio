import { useEffect, useRef } from 'react';
import Webamp from 'webamp';

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
        console.log('[Webamp] Rendered successfully');
      }).catch((error) => {
        console.error('[Webamp] Failed to render:', error);
      });

      webampRef.current = webamp;
    }

    // Cleanup on unmount
    return () => {
      if (webampRef.current) {
        console.log('[Webamp] Disposing');
        webampRef.current.dispose();
        webampRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full flex items-center justify-center bg-black/50"
      data-testid="webamp-container"
    />
  );
}
