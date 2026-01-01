import { useOSStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Play, Pause, Volume2, Maximize } from 'lucide-react';

export function VideoPlayer() {
  const { theme } = useOSStore();
  const isDark = theme === 'dark';

  return (
    <div className={cn(
      "h-full flex flex-col bg-black overflow-hidden relative group",
      isDark && "border border-blue-900/30"
    )}>
      {/* Video Content Placeholder */}
      <div className="flex-1 flex items-center justify-center bg-black relative">
        <div className="text-center opacity-50">
          <div className="w-24 h-24 border-4 border-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-10 h-10 ml-2 text-white/50" />
          </div>
          <p className="text-white/50">Work in progress</p>
        </div>
        
        {/* Scanlines overlay for dark mode */}
        {isDark && (
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,20,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_4px,3px_100%] opacity-20" />
        )}
      </div>
      {/* Controls Overlay */}
      <div className={cn(
        "h-14 flex items-center px-4 gap-4 transition-transform duration-300",
        !isDark && "bg-gradient-to-t from-[#e0e0e0] to-[#f5f5f5] border-t border-white/50",
        isDark && "bg-black/80 border-t border-blue-500/20 text-blue-400"
      )}>
        <button className="hover:opacity-70"><Play className="w-5 h-5 fill-current" /></button>
        
        {/* Scrubber */}
        <div className="flex-1 h-1.5 bg-black/10 rounded-full relative cursor-pointer group/scrubber">
          <div className={cn("absolute left-0 top-0 bottom-0 w-1/3 rounded-full", !isDark ? "bg-blue-500" : "bg-blue-400 box-shadow-[0_0_10px_blue]")} />
          <div className="absolute left-[33.33%] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover/scrubber:scale-100 transition-transform" />
        </div>

        <span className="text-xs font-mono opacity-70">00:45 / 02:30</span>
        
        <div className="w-24 flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
          <div className="flex-1 h-1 bg-black/10 rounded-full">
            <div className="w-2/3 h-full bg-current rounded-full" />
          </div>
        </div>
        
        <Maximize className="w-4 h-4 cursor-pointer hover:opacity-70" />
      </div>
    </div>
  );
}