import { useOSStore, AppId } from '@/lib/store';
import { MenuBar } from './MenuBar';
import { Dock } from './Dock';
import { Window } from './Window';
import { MiniMusicPlayer } from '../MiniMusicPlayer';
import { PersistentAudioPlayer } from '../PersistentAudioPlayer';
import { ErrorBoundary } from '../ErrorBoundary';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { FolderOpen, Mail as MailIcon, Music, Video, Palette, StickyNote, BookOpen, Linkedin, Twitter, FileText, Image, Piano } from 'lucide-react';
import { MikanraIcon } from '../icons/MikanraIcon';
import { useMemo, lazy, Suspense } from 'react';

// Lazy-loaded Apps for code-splitting
const Finder = lazy(() => import('@/apps/Finder').then(m => ({ default: m.Finder })));
const Gallery = lazy(() => import('@/apps/Gallery').then(m => ({ default: m.Gallery })));
const Mail = lazy(() => import('@/apps/Mail').then(m => ({ default: m.Mail })));
const MusicPlayer = lazy(() => import('@/apps/MusicPlayer').then(m => ({ default: m.MusicPlayer })));
// const VideoPlayer = lazy(() => import('@/apps/VideoPlayer').then(m => ({ default: m.VideoPlayer }))); // Temporarily hidden - uncomment to re-enable
const Paint = lazy(() => import('@/apps/Paint').then(m => ({ default: m.Paint })));
const Notes = lazy(() => import('@/apps/Notes').then(m => ({ default: m.Notes })));
const Bookshelf = lazy(() => import('@/apps/AiResources').then(m => ({ default: m.Bookshelf })));
const LinkedIn = lazy(() => import('@/apps/LinkedIn').then(m => ({ default: m.LinkedIn })));
const Kalimba = lazy(() => import('@/apps/Kalimba').then(m => ({ default: m.Kalimba })));

// Mobile app grid config
const mobileApps: { id: AppId; icon: React.ElementType; label: string; external?: string }[] = [
  { id: 'finder', icon: FolderOpen, label: 'Finder' },
  { id: 'mail', icon: MailIcon, label: 'Mail' },
  { id: 'music', icon: Music, label: 'Music' },
  // { id: 'video', icon: Video, label: 'Videos' }, // Temporarily hidden - uncomment to re-enable
  { id: 'paint', icon: Palette, label: 'Paint' },
  { id: 'notes', icon: StickyNote, label: 'Notes' },
  { id: 'bookshelf', icon: BookOpen, label: 'AI Resources' },
  { id: 'kalimba', icon: Piano, label: 'Kalimba' },
  { id: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
  { id: 'twitter', icon: Twitter, label: 'X', external: 'https://x.com/Bhachz' },
  { id: 'gallery', icon: Image, label: 'My Portfolio' },
  { id: 'substack', icon: FileText, label: 'Substack', external: 'https://substack.com/@bhach' },
];

// Assets (Using the generated ones via aliases if configured, or just importing them if they are in public. 
// Since generate_image_tool puts them in attached_assets, and vite.config.ts has alias, we use that)
import spaceBg from '@assets/generated_images/dark_futuristic_deep_space_starfield_wallpaper.png';

interface DesktopProps {
  onEasterEgg?: () => void;
}

export function Desktop({ onEasterEgg }: DesktopProps) {
  const { theme, windows, openWindow, closeWindow, uiZoom, reduceMotion, mobileActiveApp, openMobileApp } = useOSStore();
  const isDark = theme === 'dark';
  const isMobile = useIsMobile();

  const handleAppClick = (app: typeof mobileApps[0]) => {
    if (app.external) {
      window.open(app.external, '_blank');
    } else if (isMobile) {
      openMobileApp(app.id);
    } else {
      openWindow(app.id);
    }
  };

  // Memoize the background style to ensure it updates when theme changes
  const backgroundStyle = useMemo(() => {
    const lightGradient = 'linear-gradient(135deg, #FFF5E6 0%, #FFE4CC 25%, #FFDAB3 50%, #FFD1A3 75%, #FFC896 100%)';
    const darkBackground = `url(${spaceBg})`;
    
    return {
      backgroundImage: isDark ? darkBackground : lightGradient,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      transform: `scale(${uiZoom / 100})`,
      transformOrigin: 'top left' as const,
      width: `${10000 / uiZoom}vw`,
      height: `${10000 / uiZoom}vh`
    };
  }, [isDark, uiZoom]);

  return (
    <div
      key={`desktop-theme-${theme}`}
      className={cn(
        "w-screen relative bg-cover bg-center bg-no-repeat font-sans",
        "h-screen md:overflow-hidden overflow-y-auto",
        "min-h-screen",
        !isDark && "text-[#2C2C2C] selection:bg-[#D99D3C]/30",
        isDark && "text-white selection:bg-blue-500/30",
        !reduceMotion && "transition-all duration-700"
      )}
      style={backgroundStyle}
    >
      <div className="absolute inset-0 bg-black/0 transition-colors duration-700 pointer-events-none" />
      
      <MenuBar />
      
      {/* Mobile App Grid - shown when no app is active */}
      {isMobile && !mobileActiveApp && (
        <div className="absolute inset-0 top-8 flex items-center justify-center px-6 pb-24 pt-[calc(1.5rem+env(safe-area-inset-top))] overflow-y-auto">
          <div className="grid grid-cols-4 gap-4 max-w-sm my-auto" role="grid" aria-label="Applications">
            {mobileApps.map((app) => {
              const Icon = app.icon;
              return (
                <button
                  key={app.id}
                  onClick={() => handleAppClick(app)}
                  aria-label={app.external ? `${app.label} (opens in new tab)` : `Open ${app.label}`}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 active:scale-95 transition-transform rounded-lg",
                    "focus-visible:ring-2 focus-visible:outline-none",
                    !isDark && "focus-visible:ring-[#D99D3C]",
                    isDark && "focus-visible:ring-blue-400"
                  )}
                  data-testid={`mobile-app-${app.id}`}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
                    !isDark && "bg-gradient-to-br from-[#EAD477] to-[#D99D3C] border border-[#D99D3C]/50",
                    isDark && "bg-blue-900/50 border border-blue-400/50 shadow-[0_0_15px_rgba(0,100,255,0.4)]"
                  )}>
                    <Icon
                      className={cn(
                        "w-7 h-7",
                        !isDark && "text-[#2C2C2C]",
                        isDark && "text-blue-300"
                      )}
                      aria-hidden="true"
                    />
                  </div>
                  <span className={cn(
                    "text-xs font-medium text-center",
                    !isDark && "text-[#2C2C2C]",
                    isDark && "text-white"
                  )}>
                    {app.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop Icons Area - hidden on mobile */}
      {!isMobile && (
        <div className="absolute top-10 right-4 flex flex-col items-end gap-6 p-4">
          <button
            onClick={() => openWindow('gallery')}
            aria-label="Open My Portfolio"
            className={cn(
              "group flex flex-col items-center gap-1 w-20 rounded-lg p-1",
              "focus-visible:ring-2 focus-visible:outline-none",
              !isDark && "focus-visible:ring-[#D99D3C]",
              isDark && "focus-visible:ring-blue-400"
            )}
            data-testid="desktop-icon-portfolio"
          >
            <div className={cn(
              "w-16 h-16 rounded-lg flex items-center justify-center shadow-lg transition-transform group-hover:scale-105",
              !isDark && "bg-gradient-to-br from-[#EAD477] to-[#D99D3C] border border-[#D99D3C]/50",
              isDark && "bg-blue-900/50 border border-blue-400/50 shadow-[0_0_15px_rgba(0,100,255,0.4)]"
            )}>
              <span className="text-3xl" role="img" aria-label="Folder icon">📂</span>
            </div>
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded",
              !isDark && "text-[#2C2C2C] bg-[#EAD477]/80",
              isDark && "text-blue-200 bg-black/50"
            )}>
              My Portfolio
            </span>
          </button>

          <button
            onClick={() => window.open('https://www.mikanra.com/', '_blank')}
            aria-label="Mikanra (opens in new tab)"
            className={cn(
              "group flex flex-col items-center gap-1 w-20 rounded-lg p-1",
              "focus-visible:ring-2 focus-visible:outline-none",
              !isDark && "focus-visible:ring-[#D99D3C]",
              isDark && "focus-visible:ring-blue-400"
            )}
            data-testid="desktop-icon-mikanra"
          >
            <div className={cn(
              "w-16 h-16 rounded-lg flex items-center justify-center shadow-lg transition-transform group-hover:scale-105",
              !isDark && "bg-gradient-to-br from-[#EAD477] to-[#D99D3C] border border-[#D99D3C]/50",
              isDark && "bg-blue-900/50 border border-blue-400/50 shadow-[0_0_15px_rgba(0,100,255,0.4)]"
            )}>
              <MikanraIcon className="w-10 h-10" isDark={isDark} aria-hidden="true" />
            </div>
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded",
              !isDark && "text-[#2C2C2C] bg-[#EAD477]/80",
              isDark && "text-blue-200 bg-black/50"
            )}>
              Mikanra
            </span>
          </button>
        </div>
      )}

      {/* Windows Layer */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          <Window key="finder" id="finder">
            <ErrorBoundary appName="Finder" onClose={() => closeWindow('finder')}>
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
                <Finder />
              </Suspense>
            </ErrorBoundary>
          </Window>
          <Window key="gallery" id="gallery">
            <ErrorBoundary appName="Gallery" onClose={() => closeWindow('gallery')}>
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
                <Gallery />
              </Suspense>
            </ErrorBoundary>
          </Window>
          <Window key="mail" id="mail">
            <ErrorBoundary appName="Mail" onClose={() => closeWindow('mail')}>
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
                <Mail />
              </Suspense>
            </ErrorBoundary>
          </Window>
          <Window key="music" id="music">
            <ErrorBoundary appName="Music" onClose={() => closeWindow('music')}>
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
                <MusicPlayer />
              </Suspense>
            </ErrorBoundary>
          </Window>
          {/* Temporarily hidden - uncomment to re-enable
          <Window key="video" id="video">
            <ErrorBoundary appName="Videos" onClose={() => closeWindow('video')}>
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
                <VideoPlayer />
              </Suspense>
            </ErrorBoundary>
          </Window>
          */}
          <Window key="paint" id="paint">
            <ErrorBoundary appName="Paint" onClose={() => closeWindow('paint')}>
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
                <Paint />
              </Suspense>
            </ErrorBoundary>
          </Window>
          <Window key="notes" id="notes">
            <ErrorBoundary appName="Notes" onClose={() => closeWindow('notes')}>
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
                <Notes onEasterEgg={onEasterEgg} />
              </Suspense>
            </ErrorBoundary>
          </Window>
          <Window key="bookshelf" id="bookshelf">
            <ErrorBoundary appName="AI Resources" onClose={() => closeWindow('bookshelf')}>
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
                <Bookshelf />
              </Suspense>
            </ErrorBoundary>
          </Window>
          <Window key="kalimba" id="kalimba">
            <ErrorBoundary appName="Kalimba" onClose={() => closeWindow('kalimba')}>
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
                <Kalimba />
              </Suspense>
            </ErrorBoundary>
          </Window>
          <Window key="linkedin" id="linkedin">
            <ErrorBoundary appName="LinkedIn" onClose={() => closeWindow('linkedin')}>
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
                <LinkedIn />
              </Suspense>
            </ErrorBoundary>
          </Window>
        </AnimatePresence>
      </div>

      {/* Dock - hidden on mobile */}
      {!isMobile && <Dock />}

      {/* Persistent Audio Player - always mounted on mobile */}
      {isMobile && <PersistentAudioPlayer />}

      {/* Mini Music Player - mobile only */}
      {isMobile && <MiniMusicPlayer />}
    </div>
  );
}
