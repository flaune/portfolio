import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';
import { useRef } from 'react';
import { useOSStore, AppId } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Mail,
  Music,
  Video,
  Palette,
  Linkedin,
  Twitter,
  FileText,
  FolderOpen,
  StickyNote,
  BookOpen,
  Piano
} from 'lucide-react';

function DockIcon({ mouseX, id, icon: Icon, label, isMobile, external }: { mouseX: MotionValue, id: AppId, icon: any, label: string, isMobile: boolean, external?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const { openWindow, windows, theme } = useOSStore();
  const isDark = theme === 'dark';
  const isOpen = windows[id]?.isOpen;

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], isMobile ? [40, 40, 40] : [50, 90, 50]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  const handleClick = () => {
    if (external) {
      window.open(external, '_blank');
    } else {
      openWindow(id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 group flex-shrink-0">
      <motion.button
        ref={ref}
        style={{ width }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-label={external ? `${label} (opens in new tab)` : `Open ${label}`}
        className={cn(
          "aspect-square rounded-2xl flex items-center justify-center cursor-pointer relative transition-colors duration-300",
          !isDark && "bg-[#FAF9F6] shadow-[0_5px_10px_rgba(0,0,0,0.15)] border border-[#EAD477]/50 hover:bg-[#EAD477]/20 focus-visible:ring-2 focus-visible:ring-[#D99D3C] focus-visible:outline-none",
          isDark && "bg-black/60 border border-blue-500/30 shadow-[0_0_15px_rgba(0,100,255,0.3)] hover:bg-blue-500/20 hover:shadow-[0_0_25px_rgba(0,100,255,0.5)] focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
        )}
        whileTap={{ scale: 0.9 }}
      >
        <Icon
          className={cn(
            "w-1/2 h-1/2",
            !isDark && "text-[#2C2C2C]",
            isDark && "text-blue-400"
          )}
          aria-hidden="true"
        />
      </motion.button>
      
      {/* Open indicator */}
      <div className={cn(
        "w-1 h-1 rounded-full transition-all duration-300",
        isOpen 
          ? (isDark ? "bg-blue-400 shadow-[0_0_8px_#60a5fa]" : "bg-[#D99D3C]") 
          : "bg-transparent"
      )} />

      {/* Tooltip - hidden on mobile */}
      {!isMobile && (
        <div className={cn(
          "absolute -top-12 px-3 py-1 rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none whitespace-nowrap",
          !isDark && "bg-[#EAD477] text-[#2C2C2C] border border-[#D99D3C]/30 shadow-sm",
          isDark && "bg-black/80 text-blue-400 border border-blue-500/30 backdrop-blur"
        )}>
          {label}
        </div>
      )}
    </div>
  );
}

export function Dock() {
  const mouseX = useMotionValue(Infinity);
  const { theme } = useOSStore();
  const isDark = theme === 'dark';
  const isMobile = useIsMobile();

  const apps: { id: AppId, icon: any, label: string, external?: string }[] = [
    { id: 'finder', icon: FolderOpen, label: 'Finder' },
    { id: 'mail', icon: Mail, label: 'Mail' },
    { id: 'music', icon: Music, label: 'Music' },
    { id: 'video', icon: Video, label: 'Videos' },
    { id: 'paint', icon: Palette, label: 'Paint' },
    { id: 'notes', icon: StickyNote, label: 'Notes' },
    { id: 'bookshelf', icon: BookOpen, label: 'AI Resources' },
    { id: 'kalimba', icon: Piano, label: 'Kalimba' },
    { id: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
    { id: 'twitter', icon: Twitter, label: 'X', external: 'https://x.com/Bhachz' },
    { id: 'substack', icon: FileText, label: 'Substack', external: 'https://substack.com/@bhach' },
  ];

  return (
    <nav
      className={cn(
        "fixed left-0 right-0 flex justify-center z-50 pointer-events-none",
        isMobile ? "bottom-2" : "bottom-4"
      )}
      aria-label="Application dock"
    >
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={cn(
          "flex items-end rounded-2xl pointer-events-auto transition-all duration-300",
          isMobile
            ? "gap-1 px-2 pb-1 pt-2 overflow-x-auto max-w-[95vw] scrollbar-hide"
            : "gap-3 px-4 pb-2 pt-3 mx-auto",
          !isDark && "bg-[#EAD477]/40 backdrop-blur-xl border border-[#D99D3C]/30 shadow-lg",
          isDark && "bg-black/40 backdrop-blur-xl border border-blue-500/20 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        )}
      >
        {apps.map((app) => (
          <DockIcon key={app.id} mouseX={mouseX} isMobile={isMobile} {...app} />
        ))}
      </motion.div>
    </nav>
  );
}