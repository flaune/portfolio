import { useTime } from '@/hooks/use-time';
import { useOSStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Battery, Wifi, Search, Moon, Sun, ChevronDown, Check, ZoomIn, Eye, HelpCircle, X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useRef, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cacheClearAll, getCacheStats } from '@/lib/cache';

function ViewDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme, reduceMotion, toggleReduceMotion, uiZoom, setUIZoom } = useOSStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowResetConfirm(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const zoomOptions = [75, 100, 125, 150];

  const handleResetCache = () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }

    const success = cacheClearAll();
    if (success) {
      // Reload the page to apply cleared cache
      window.location.reload();
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1 px-2 py-0.5 rounded transition-colors",
          isOpen && (isDark ? "bg-white/10" : "bg-black/10"),
          "hover:opacity-70"
        )}
        data-testid="menu-view"
      >
        View
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute top-full left-0 mt-1 w-56 rounded-lg shadow-xl border overflow-hidden z-[9999]",
          !isDark && "bg-white/95 backdrop-blur border-gray-200",
          isDark && "bg-gray-900/95 backdrop-blur border-blue-500/30"
        )}>
          <button
            onClick={() => { toggleTheme(); setIsOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors",
              !isDark && "hover:bg-gray-100",
              isDark && "hover:bg-white/10"
            )}
            data-testid="menu-toggle-theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            <span>Toggle Light/Dark Mode</span>
          </button>

          <button
            onClick={() => { toggleReduceMotion(); }}
            className={cn(
              "w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors",
              !isDark && "hover:bg-gray-100",
              isDark && "hover:bg-white/10"
            )}
            data-testid="menu-reduce-motion"
          >
            <div className="flex items-center gap-3">
              <Eye className="w-4 h-4 opacity-70" />
              <span>Reduce Motion</span>
            </div>
            {reduceMotion && <Check className="w-4 h-4 text-green-500" />}
          </button>

          <button
            onClick={handleResetCache}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors",
              showResetConfirm
                ? (isDark ? "bg-red-500/20 hover:bg-red-500/30" : "bg-red-50 hover:bg-red-100")
                : (isDark ? "hover:bg-white/10" : "hover:bg-gray-100")
            )}
            data-testid="menu-reset-cache"
          >
            <Trash2 className={cn("w-4 h-4", showResetConfirm ? "text-red-500" : "opacity-70")} />
            <span className={showResetConfirm ? "text-red-500 font-medium" : ""}>
              {showResetConfirm ? "Click again to confirm" : "Reset All Cache"}
            </span>
          </button>

          <div className={cn(
            "border-t",
            !isDark ? "border-gray-200" : "border-blue-500/20"
          )}>
            <div className="px-4 py-2 text-xs opacity-50 uppercase tracking-wider">Zoom UI</div>
            <div className="flex items-center gap-1 px-4 pb-3">
              {zoomOptions.map((zoom) => (
                <button
                  key={zoom}
                  onClick={() => setUIZoom(zoom)}
                  className={cn(
                    "flex-1 py-1.5 text-xs rounded transition-colors",
                    uiZoom === zoom
                      ? (isDark ? "bg-blue-600 text-white" : "bg-blue-500 text-white")
                      : (isDark ? "bg-white/10 hover:bg-white/20" : "bg-gray-100 hover:bg-gray-200")
                  )}
                  data-testid={`menu-zoom-${zoom}`}
                >
                  {zoom}%
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HelpModal() {
  const { showHelpModal, setShowHelpModal, theme } = useOSStore();
  const isDark = theme === 'dark';

  if (!showHelpModal) return null;

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => setShowHelpModal(false)}
    >
      <div 
        className={cn(
          "w-full max-w-md rounded-xl shadow-2xl border overflow-hidden",
          !isDark && "bg-white border-gray-200",
          isDark && "bg-gray-900 border-blue-500/30"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn(
          "flex items-center justify-between px-4 py-3 border-b",
          !isDark && "bg-gray-50 border-gray-200",
          isDark && "bg-black/30 border-blue-500/20"
        )}>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 opacity-70" />
            <h2 className="font-semibold">How this OS works</h2>
          </div>
          <button 
            onClick={() => setShowHelpModal(false)}
            className="p-1 rounded hover:bg-black/10 transition-colors"
            data-testid="help-modal-close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-1">Navigating the Desktop</h3>
            <p className="opacity-70">Click icons in the Dock at the bottom to open apps. Drag windows to reposition them.</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-1">Finder</h3>
            <p className="opacity-70">Browse my portfolio through the sidebar: About Me, Case Studies, Notes & Insights, and Resume.</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-1">Other Apps</h3>
            <p className="opacity-70">Mail for contact, Music for vibes, Videos for reels, and Paint to doodle.</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-1">Theme & Accessibility</h3>
            <p className="opacity-70">Use the View menu in the top bar to toggle dark mode, reduce motion, or zoom the UI.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MenuBar() {
  const { theme, toggleTheme, setShowHelpModal } = useOSStore();
  const time = useTime();
  const isDark = theme === 'dark';
  const isMobile = useIsMobile();

  return (
    <>
      <HelpModal />
      <div className={cn(
        "h-7 w-full flex items-center justify-between px-4 select-none z-50 transition-colors duration-300",
        "pt-[env(safe-area-inset-top)]",
        !isDark && "bg-[#EAD477] shadow-sm border-b border-[#D99D3C]/30 text-[#2C2C2C]",
        isDark && "bg-black/80 backdrop-blur border-b border-blue-500/20 text-white"
      )}>
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="font-bold text-lg"></span>
          <span className={cn("hidden sm:inline font-bold", !isDark && "text-[#2C2C2C]", isDark && "text-blue-400")}>Bhach</span>
          <ViewDropdown />
          <button 
            onClick={() => setShowHelpModal(true)}
            className="hidden sm:inline cursor-pointer hover:opacity-70"
            data-testid="menu-help"
          >
            Help
          </button>
        </div>

        <div className={cn("flex items-center text-sm", isMobile ? "gap-2" : "gap-4")}>
          <button 
            onClick={toggleTheme}
            className={cn(
              "p-1 rounded-full transition-colors",
              !isDark && "hover:bg-[#D99D3C]/30",
              isDark && "hover:bg-white/10"
            )}
            data-testid="button-toggle-theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-5 h-5 text-[#2C2C2C] fill-[#2C2C2C]" />}
          </button>

          {!isMobile && <Wifi className={cn("w-4 h-4", !isDark && "text-[#2C2C2C]")} />}
          <Battery className={cn("w-4 h-4", !isDark && "text-[#2C2C2C]")} />
          {!isMobile && <Search className={cn("w-4 h-4", !isDark && "text-[#2C2C2C]")} />}
          
          <span className={cn(
            "tabular-nums font-medium text-right text-xs sm:text-sm",
            !isDark && "text-[#2C2C2C]"
          )}>
            {format(time, isMobile ? "h:mm a" : "EEE MMM d h:mm aa")}
          </span>
        </div>
      </div>
    </>
  );
}
