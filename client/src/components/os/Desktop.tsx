import { useOSStore, AppId } from '@/lib/store';
import { MenuBar } from './MenuBar';
import { Dock } from './Dock';
import { Window } from './Window';
import { MiniMusicPlayer } from '../MiniMusicPlayer';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { FolderOpen, Mail as MailIcon, Music, Video, Palette, StickyNote, BookOpen, Linkedin, Twitter, FileText, Image, Piano } from 'lucide-react';
import { MikanraIcon } from '../icons/MikanraIcon';
import { useMemo } from 'react';

// Apps
import { Finder } from '@/apps/Finder';
import { Gallery } from '@/apps/Gallery';
import { Mail } from '@/apps/Mail';
import { MusicPlayer } from '@/apps/MusicPlayer';
import { VideoPlayer } from '@/apps/VideoPlayer';
import { Paint } from '@/apps/Paint';
import { Notes } from '@/apps/Notes';
import { Bookshelf } from '@/apps/AiResources';
import { LinkedIn } from '@/apps/LinkedIn';
import { Kalimba } from '@/apps/Kalimba';

// Mobile app grid config
const mobileApps: { id: AppId; icon: React.ElementType; label: string; external?: string }[] = [
  { id: 'finder', icon: FolderOpen, label: 'Finder' },
  { id: 'mail', icon: MailIcon, label: 'Mail' },
  { id: 'music', icon: Music, label: 'Music' },
  { id: 'video', icon: Video, label: 'Videos' },
  { id: 'paint', icon: Palette, label: 'Paint' },
  { id: 'notes', icon: StickyNote, label: 'Notes' },
  { id: 'bookshelf', icon: BookOpen, label: 'AI Bookshelf' },
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
  const { theme, windows, openWindow, uiZoom, reduceMotion, mobileActiveApp, openMobileApp } = useOSStore();
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
        "w-screen h-screen overflow-hidden relative bg-cover bg-center bg-no-repeat font-sans",
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
        <div className="absolute inset-0 top-8 flex items-center justify-center p-6">
          <div className="grid grid-cols-4 gap-4 max-w-sm">
            {mobileApps.map((app) => {
              const Icon = app.icon;
              return (
                <button
                  key={app.id}
                  onClick={() => handleAppClick(app)}
                  className="flex flex-col items-center gap-1 p-2 active:scale-95 transition-transform"
                  data-testid={`mobile-app-${app.id}`}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
                    !isDark && "bg-gradient-to-br from-[#EAD477] to-[#D99D3C] border border-[#D99D3C]/50",
                    isDark && "bg-blue-900/50 border border-blue-400/50 shadow-[0_0_15px_rgba(0,100,255,0.4)]"
                  )}>
                    <Icon className={cn(
                      "w-7 h-7",
                      !isDark && "text-[#2C2C2C]",
                      isDark && "text-blue-300"
                    )} />
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
            className="group flex flex-col items-center gap-1 w-20"
            data-testid="desktop-icon-portfolio"
          >
            <div className={cn(
              "w-16 h-16 rounded-lg flex items-center justify-center shadow-lg transition-transform group-hover:scale-105",
              !isDark && "bg-gradient-to-br from-[#EAD477] to-[#D99D3C] border border-[#D99D3C]/50",
              isDark && "bg-blue-900/50 border border-blue-400/50 shadow-[0_0_15px_rgba(0,100,255,0.4)]"
            )}>
              <span className="text-3xl">📂</span>
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
            className="group flex flex-col items-center gap-1 w-20"
            data-testid="desktop-icon-mikanra"
          >
            <div className={cn(
              "w-16 h-16 rounded-lg flex items-center justify-center shadow-lg transition-transform group-hover:scale-105",
              !isDark && "bg-gradient-to-br from-[#EAD477] to-[#D99D3C] border border-[#D99D3C]/50",
              isDark && "bg-blue-900/50 border border-blue-400/50 shadow-[0_0_15px_rgba(0,100,255,0.4)]"
            )}>
              <MikanraIcon className="w-10 h-10" isDark={isDark} />
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
          <Window key="finder" id="finder"><Finder /></Window>
          <Window key="gallery" id="gallery"><Gallery /></Window>
          <Window key="mail" id="mail"><Mail /></Window>
          <Window key="music" id="music"><MusicPlayer /></Window>
          <Window key="video" id="video"><VideoPlayer /></Window>
          <Window key="paint" id="paint"><Paint /></Window>
          <Window key="notes" id="notes"><Notes onEasterEgg={onEasterEgg} /></Window>
          <Window key="bookshelf" id="bookshelf"><Bookshelf /></Window>
          <Window key="kalimba" id="kalimba"><Kalimba /></Window>
          <Window key="linkedin" id="linkedin"><LinkedIn /></Window>
        </AnimatePresence>
      </div>

      {/* Dock - hidden on mobile */}
      {!isMobile && <Dock />}
      
      {/* Mini Music Player - mobile only */}
      {isMobile && <MiniMusicPlayer />}
    </div>
  );
}
