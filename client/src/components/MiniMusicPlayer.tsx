import { useOSStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { X, Play, Pause, SkipForward, SkipBack, Music } from 'lucide-react';

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function MiniMusicPlayer() {
  const {
    theme,
    music,
    musicPlay,
    musicPause,
    musicNext,
    musicPrev,
    musicDismiss,
    mobileActiveApp,
    openMobileApp,
  } = useOSStore();
  
  const isDark = theme === 'dark';
  const { tracks, currentTrackIndex, playState, currentTime, duration, showMiniPlayer } = music;
  const currentTrack = tracks.length > 0 ? tracks[currentTrackIndex] : null;
  
  const shouldShow = showMiniPlayer && 
    mobileActiveApp !== 'music' && 
    currentTrack && 
    (playState === 'playing' || playState === 'paused');
  
  if (!shouldShow) return null;
  
  const trackDuration = duration || currentTrack?.duration || 0;
  const progress = trackDuration > 0 ? (currentTime / trackDuration) * 100 : 0;

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[9999]",
        "pb-[env(safe-area-inset-bottom)]",
        isDark 
          ? "bg-gradient-to-r from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a] border-t border-cyan-500/30" 
          : "bg-gradient-to-r from-[#c9bc9e] via-[#d4c7a9] to-[#c9bc9e] border-t border-[#9a8b6e]",
        "shadow-lg"
      )}
      data-testid="mini-music-player"
    >
      <div 
        className={cn(
          "h-0.5 absolute top-0 left-0",
          isDark 
            ? "bg-gradient-to-r from-cyan-500 to-purple-500"
            : "bg-gradient-to-r from-[#d4a556] to-[#f0c878]"
        )}
        style={{ width: `${progress}%` }}
      />
      
      <div className="flex items-center gap-3 px-3 py-2">
        <button
          onClick={() => openMobileApp('music')}
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            isDark 
              ? "bg-cyan-900/50 text-cyan-400" 
              : "bg-[#9a8b6e] text-[#f0e6d0]"
          )}
          data-testid="mini-player-open"
        >
          <Music size={20} />
        </button>
        
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => openMobileApp('music')}
        >
          <div className={cn(
            "text-sm font-medium truncate",
            isDark ? "text-cyan-300" : "text-[#3a2b0e]"
          )}>
            {currentTrack?.title || 'No track'}
          </div>
          <div className={cn(
            "text-xs",
            isDark ? "text-cyan-600" : "text-[#6a5b3e]"
          )}>
            {formatDuration(currentTime)} / {formatDuration(trackDuration)}
          </div>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={musicPrev}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              isDark 
                ? "text-cyan-400 hover:bg-cyan-900/50" 
                : "text-[#5a4b2e] hover:bg-[#9a8b6e]/50"
            )}
            data-testid="mini-player-prev"
          >
            <SkipBack size={18} />
          </button>
          
          <button
            onClick={playState === 'playing' ? musicPause : musicPlay}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isDark 
                ? "bg-cyan-600 text-white hover:bg-cyan-500" 
                : "bg-[#7a6b4e] text-[#f0e6d0] hover:bg-[#8a7b5e]"
            )}
            data-testid="mini-player-play-pause"
          >
            {playState === 'playing' ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
          
          <button
            onClick={musicNext}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              isDark 
                ? "text-cyan-400 hover:bg-cyan-900/50" 
                : "text-[#5a4b2e] hover:bg-[#9a8b6e]/50"
            )}
            data-testid="mini-player-next"
          >
            <SkipForward size={18} />
          </button>
        </div>
        
        <button
          onClick={musicDismiss}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
            isDark 
              ? "text-red-400 hover:bg-red-900/30" 
              : "text-[#8a5a3e] hover:bg-[#9a8b6e]/50"
          )}
          data-testid="mini-player-dismiss"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
