import { Rnd } from 'react-rnd';
import { X, Minus, Maximize2, ArrowLeft } from 'lucide-react';
import { useOSStore, AppId } from '@/lib/store';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRef, useCallback } from 'react';

interface WindowProps {
  id: AppId;
  children: React.ReactNode;
}

export function Window({ id, children }: WindowProps) {
  const { windows, focusWindow, closeWindow, minimizeWindow, toggleFullscreen, updateWindowPosition, updateWindowSize, theme, mobileActiveApp, closeMobileApp } = useOSStore();
  const windowState = windows[id];
  const isMobile = useIsMobile();
  
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleGoBack = useCallback(() => {
    closeWindow(id);
    closeMobileApp();
  }, [id, closeWindow, closeMobileApp]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = Math.abs(touchEndY - touchStartY.current);
    
    // Swipe right from left edge (like iOS back gesture)
    // Must start from left 50px of screen and swipe at least 100px right
    if (touchStartX.current < 50 && deltaX > 100 && deltaY < 100) {
      handleGoBack();
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
  }, [handleGoBack]);

  // On mobile, only show the active app
  if (isMobile && mobileActiveApp !== id) return null;

  if (!windowState.isOpen || windowState.isMinimized) return null;

  const isDark = theme === 'dark';

  // Special case: Music player should render without window wrapper
  if (!isMobile && id === 'music') {
    return (
      <Rnd
        size={{ width: 'auto', height: 'auto' }}
        position={{ x: windowState.position?.x || 100, y: windowState.position?.y || 100 }}
        onDragStop={(e, d) => {
          updateWindowPosition(id, { x: d.x, y: d.y });
        }}
        onMouseDown={() => focusWindow(id)}
        bounds="parent"
        enableResizing={false}
        style={{ zIndex: windowState.zIndex }}
        className="pointer-events-auto"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </Rnd>
    );
  }

  if (isMobile) {
    return (
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "fixed inset-0 z-[9999] flex flex-col pointer-events-auto",
          !isDark && "bg-[#FAF9F6]",
          isDark && "bg-black"
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Mobile Header */}
        <div className={cn(
          "h-12 flex items-center px-4 shrink-0 border-b relative",
          "pt-[env(safe-area-inset-top)]",
          !isDark && "bg-[#EAD477] border-[#D99D3C]/30",
          isDark && "bg-[#1a1a1a] border-gray-800"
        )}>
          <button 
            onClick={handleGoBack}
            className="p-2 -ml-2 active:opacity-50 relative z-10"
            data-testid="button-mobile-back"
          >
            <ArrowLeft className={cn("w-6 h-6", !isDark ? "text-[#2C2C2C]" : "text-blue-400")} />
          </button>
          <span className={cn(
            "absolute inset-0 flex items-center justify-center font-semibold text-lg pointer-events-none",
            !isDark && "text-[#2C2C2C]",
            isDark && "text-white"
          )}>
            {windowState.title}
          </span>
        </div>
        
        {/* Mobile Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </motion.div>
    );
  }

  const isFullscreen = windowState.isFullscreen;
  
  return (
    <Rnd
      size={isFullscreen 
        ? { width: '100%', height: 'calc(100% - 27px)' }
        : { width: windowState.size?.width || 600, height: windowState.size?.height || 400 }
      }
      position={isFullscreen 
        ? { x: 0, y: 0 }
        : { x: windowState.position?.x || 100, y: windowState.position?.y || 100 }
      }
      onDragStop={(e, d) => {
        if (!isFullscreen) {
          updateWindowPosition(id, { x: d.x, y: d.y });
        }
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        if (!isFullscreen) {
          updateWindowSize(id, { width: parseInt(ref.style.width), height: parseInt(ref.style.height) });
          updateWindowPosition(id, { x: position.x, y: position.y });
        }
      }}
      onMouseDown={() => focusWindow(id)}
      minWidth={300}
      minHeight={200}
      bounds="parent"
      disableDragging={isFullscreen}
      enableResizing={!isFullscreen}
      style={{ zIndex: windowState.zIndex }}
      className="pointer-events-auto"
      dragHandleClassName={id !== 'music' ? "window-header" : undefined}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex flex-col w-full h-full overflow-hidden shadow-2xl rounded-lg transition-colors duration-300",
          // Light Mode: Persona 4 Warm Style
          !isDark && "bg-[#FAF9F6] border border-[#D99D3C]/30",
          // Dark Mode: Futuristic Style
          isDark && "bg-black/80 border border-blue-500/30 shadow-[0_0_20px_rgba(0,100,255,0.15)] backdrop-blur-md"
        )}
      >
        {/* Window Header - Hidden for music player (Webamp has its own controls) */}
        {id !== 'music' && (
          <div
            className={cn(
              "window-header h-8 flex items-center justify-between px-3 select-none cursor-default shrink-0",
              !isDark && "bg-[#EAD477] border-b border-[#D99D3C]/30",
              isDark && "bg-black/90 border-b border-blue-500/30"
            )}
            onDoubleClick={() => {}}
          >
            {/* Traffic Lights */}
            <div className="flex items-center gap-2" role="group" aria-label="Window controls">
              <button
                onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
                aria-label={`Close ${windowState.title}`}
                className={cn(
                  "w-3 h-3 rounded-full flex items-center justify-center group transition-all",
                  "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-red-500 focus-visible:outline-none",
                  !isDark && "bg-[#ff5f56] border border-[#e0443e] hover:brightness-90",
                  isDark && "bg-transparent border border-red-500 hover:bg-red-500/20 text-red-500"
                )}
              >
                <X className={cn("w-2 h-2 opacity-0 group-hover:opacity-100", !isDark && "text-black/50")} aria-hidden="true" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }}
                aria-label={`Minimize ${windowState.title}`}
                className={cn(
                  "w-3 h-3 rounded-full flex items-center justify-center group transition-all",
                  "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-yellow-500 focus-visible:outline-none",
                  !isDark && "bg-[#ffbd2e] border border-[#dea123] hover:brightness-90",
                  isDark && "bg-transparent border border-yellow-500 hover:bg-yellow-500/20 text-yellow-500"
                )}
              >
                <Minus className={cn("w-2 h-2 opacity-0 group-hover:opacity-100", !isDark && "text-black/50")} aria-hidden="true" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(id); }}
                aria-label={windowState.isFullscreen ? `Exit fullscreen ${windowState.title}` : `Fullscreen ${windowState.title}`}
                className={cn(
                  "w-3 h-3 rounded-full flex items-center justify-center group transition-all",
                  "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500 focus-visible:outline-none",
                  !isDark && "bg-[#27c93f] border border-[#1aab29] hover:brightness-90",
                  isDark && "bg-transparent border border-green-500 hover:bg-green-500/20 text-green-500"
                )}
                data-testid="button-fullscreen"
              >
                <Maximize2 className={cn("w-2 h-2 opacity-0 group-hover:opacity-100", !isDark && "text-black/50")} aria-hidden="true" />
              </button>
            </div>

            {/* Title */}
            <div className={cn(
              "absolute left-0 right-0 text-center pointer-events-none text-sm font-medium",
              !isDark && "text-[#2C2C2C]",
              isDark && "text-blue-400 font-tech tracking-widest uppercase text-xs"
            )}>
              {windowState.title}
            </div>

            <div className="w-14" /> {/* Spacer for balance */}
          </div>
        )}

        {/* Window Content */}
        <div className="flex-1 overflow-auto relative">
          {children}
        </div>
      </motion.div>
    </Rnd>
  );
}