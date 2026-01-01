import { useOSStore, Track } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect, useCallback } from 'react';

// Use direct paths to the attached_assets folder
const lightModeTracks: Track[] = [
  { id: 1, title: "Lyn - No More What If", duration: 240, url: "/attached_assets/lyn_-_no_more_what_if_1765390331882.mp3" },
  { id: 2, title: "Philip Bailey - Easy Lover", duration: 300, url: "/attached_assets/Philip_Bailey_-_Easy_Lover_1765390331881.mp3" },
  { id: 3, title: "Home Made Kazoku - Thank You", duration: 273, url: "/attached_assets/home_made_kazoku_-_thank_you_1765390331882.mp3" },
];

// Use the same tracks for both modes so music works in both light and dark mode
const darkModeTracks: Track[] = lightModeTracks;

const eqBands = ['60', '170', '310', '600', '1K', '3K', '6K', '12K', '14K', '16K'];

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function MusicPlayer() {
  const { 
    theme, 
    reduceMotion,
    music,
    setMusicTracks,
    musicPlay,
    musicPause,
    musicStop,
    musicNext,
    musicPrev,
    musicSetTrack,
    musicUpdateTime,
    musicSetVolume,
    musicToggleShuffle,
    musicToggleRepeat,
  } = useOSStore();
  
  const isDark = theme === 'dark';
  const isMobile = useIsMobile();
  
  const { tracks, currentTrackIndex, playState, currentTime, duration, volume, shuffle, repeat } = music;
  const currentTrackData = tracks[currentTrackIndex] || { title: 'No track', duration: 0 };
  
  const [balance, setBalance] = useState(50);
  const [eqEnabled, setEqEnabled] = useState(true);
  const [eqAuto, setEqAuto] = useState(false);
  const [preamp, setPreamp] = useState(50);
  const [eqValues, setEqValues] = useState<number[]>(Array(10).fill(50));
  const [bars, setBars] = useState<number[]>(Array(20).fill(10));
  const [marqueeOffset, setMarqueeOffset] = useState(0);

  // Initialize tracks on mount - check if tracks have empty URLs
  useEffect(() => {
    console.log('[MusicPlayer] Mount - Current tracks:', tracks);
    console.log('[MusicPlayer] Light mode tracks to load:', lightModeTracks);
    if (tracks.length === 0 || !tracks[0]?.url || tracks[0].url.trim() === '') {
      console.log('[MusicPlayer] Loading tracks with URLs');
      setMusicTracks(lightModeTracks);
    }
  }, []);

  useEffect(() => {
    if (playState !== 'playing' || reduceMotion) {
      if (playState !== 'playing') setBars(Array(20).fill(5));
      return;
    }
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.random() * 90 + 10));
    }, 80);
    return () => clearInterval(interval);
  }, [playState, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    const interval = setInterval(() => {
      setMarqueeOffset(prev => (prev + 1) % 200);
    }, 100);
    return () => clearInterval(interval);
  }, [reduceMotion]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const trackDuration = duration || currentTrackData.duration;
    const newTime = percent * trackDuration;
    musicUpdateTime(newTime);
  }, [duration, currentTrackData.duration, musicUpdateTime]);

  const handleEqChange = (index: number, value: number) => {
    setEqValues(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const trackDuration = duration || currentTrackData.duration;
  const progress = trackDuration > 0 ? (currentTime / trackDuration) * 100 : 0;
  const isSimulated = !currentTrackData.url;

  return (
    <div className={cn(
      "h-full flex flex-col overflow-hidden select-none",
      isDark ? "font-['Orbitron',sans-serif]" : "font-['Arial',sans-serif]"
    )}>
      <div className={cn(
        "rounded-t-lg overflow-hidden",
        !isDark && "winamp-light-main",
        isDark && "winamp-dark-main"
      )}>
        <div className={cn(
          "h-4 flex items-center justify-between px-1",
          !isDark && "bg-gradient-to-r from-[#9c8b6e] via-[#c4b596] to-[#9c8b6e]",
          isDark && "bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] border-b border-cyan-500/30"
        )}>
          <div className="flex gap-0.5">
            <button className={cn(
              "w-2 h-2 rounded-sm text-[6px] flex items-center justify-center",
              !isDark && "bg-[#7a6b4e] text-[#c4b596] hover:bg-[#6a5b3e]",
              isDark && "bg-cyan-900/50 text-cyan-400 hover:bg-cyan-800/50"
            )} data-testid="winamp-minimize">−</button>
          </div>
          <span className={cn(
            "text-[8px] font-bold tracking-wider",
            !isDark && "text-[#5a4b2e]",
            isDark && "text-cyan-400"
          )}>
            {isDark ? "NEON AUDIO PLAYER" : "Arcane Audio Player"}
          </span>
          <div className="flex gap-0.5">
            <button className={cn(
              "w-2 h-2 rounded-sm text-[6px]",
              !isDark && "bg-[#7a6b4e] text-[#c4b596]",
              isDark && "bg-cyan-900/50 text-cyan-400"
            )} data-testid="winamp-shade">▪</button>
            <button className={cn(
              "w-2 h-2 rounded-sm text-[6px]",
              !isDark && "bg-[#7a6b4e] text-[#c4b596]",
              isDark && "bg-red-900/50 text-red-400"
            )} data-testid="winamp-close">×</button>
          </div>
        </div>

        <div className={cn(
          "p-2",
          !isDark && "bg-gradient-to-b from-[#c9bc9e] to-[#b8a988]",
          isDark && "bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e]"
        )}>
          <div className={cn(
            "rounded p-2 mb-2",
            !isDark && "bg-[#1a1a1a] border-2 border-[#8a7b5e] shadow-inner",
            isDark && "bg-black/60 border border-cyan-500/40 shadow-[inset_0_0_20px_rgba(0,255,255,0.1)]"
          )}>
            <div className="flex items-end gap-[1px] h-8 mb-1">
              {bars.map((height, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex-1 transition-all rounded-t-[1px]",
                    reduceMotion ? "duration-0" : "duration-75",
                    !isDark && "bg-gradient-to-t from-green-600 via-yellow-500 to-red-500",
                    isDark && "bg-gradient-to-t from-cyan-600 via-blue-400 to-purple-500 shadow-[0_0_4px_rgba(0,255,255,0.5)]"
                  )}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            
            <div className={cn(
              "h-4 overflow-hidden text-[10px] font-bold tracking-wide",
              !isDark && "text-[#00ff00]",
              isDark && "text-cyan-400"
            )}>
              <div 
                className="whitespace-nowrap"
                style={{ transform: `translateX(-${marqueeOffset}px)` }}
              >
                *** {currentTrackIndex + 1}. {currentTrackData.title} ***
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-1">
              <span className={cn(
                "text-[8px]",
                !isDark && "text-[#00aa00]",
                isDark && "text-cyan-600"
              )}>
                128 KB/s &nbsp;&nbsp; 44 KHZ
              </span>
              <span className={cn(
                "text-[10px] font-mono",
                !isDark && "text-[#00ff00]",
                isDark && "text-cyan-400"
              )}>
                {formatDuration(currentTime)} / {formatDuration(trackDuration)}
              </span>
            </div>
          </div>

          <div 
            className={cn(
              "h-2 rounded-full mb-2 cursor-pointer relative overflow-hidden",
              !isDark && "bg-[#8a7b5e]",
              isDark && "bg-cyan-950 border border-cyan-800/50"
            )}
            onClick={handleSeek}
            data-testid="winamp-seek"
          >
            <div 
              className={cn(
                "h-full rounded-full transition-all",
                !isDark && "bg-gradient-to-r from-[#d4a556] to-[#f0c878]",
                isDark && "bg-gradient-to-r from-cyan-600 to-blue-400 shadow-[0_0_8px_rgba(0,255,255,0.4)]"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-2 mb-2 text-[8px]">
            <span className={cn(!isDark ? "text-[#5a4b2e]" : "text-cyan-600")}>VOL</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={volume}
              onChange={(e) => musicSetVolume(parseInt(e.target.value))}
              className={cn(
                "flex-1 h-1 appearance-none rounded cursor-pointer winamp-slider",
                !isDark && "bg-[#8a7b5e]",
                isDark && "bg-cyan-950"
              )}
              data-testid="winamp-volume"
            />
            <span className={cn(!isDark ? "text-[#5a4b2e]" : "text-cyan-600")}>BAL</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={balance}
              onChange={(e) => setBalance(parseInt(e.target.value))}
              className={cn(
                "w-12 h-1 appearance-none rounded cursor-pointer winamp-slider",
                !isDark && "bg-[#8a7b5e]",
                isDark && "bg-cyan-950"
              )}
              data-testid="winamp-balance"
            />
            <span className={cn(
              "text-[7px] w-4 text-center",
              !isDark ? "text-[#5a4b2e]" : "text-cyan-600"
            )}>{balance < 45 ? 'L' : balance > 55 ? 'R' : '•'}</span>
          </div>

          <div className="flex items-center justify-center gap-1">
            <button 
              onClick={musicPrev}
              className={cn(
                "winamp-btn w-6 h-5 flex items-center justify-center",
                !isDark && "winamp-btn-light",
                isDark && "winamp-btn-dark"
              )}
              data-testid="winamp-prev"
            >
              <span className="text-[8px]">⏮</span>
            </button>
            
            <button 
              onClick={musicPlay}
              className={cn(
                "winamp-btn w-6 h-5 flex items-center justify-center",
                !isDark && "winamp-btn-light",
                isDark && "winamp-btn-dark",
                playState === 'playing' && (isDark ? "ring-1 ring-cyan-400" : "ring-1 ring-[#7a6b4e]")
              )}
              data-testid="winamp-play"
            >
              <span className="text-[8px]">▶</span>
            </button>
            
            <button 
              onClick={musicPause}
              className={cn(
                "winamp-btn w-6 h-5 flex items-center justify-center",
                !isDark && "winamp-btn-light",
                isDark && "winamp-btn-dark",
                playState === 'paused' && (isDark ? "ring-1 ring-cyan-400" : "ring-1 ring-[#7a6b4e]")
              )}
              data-testid="winamp-pause"
            >
              <span className="text-[8px]">⏸</span>
            </button>
            
            <button 
              onClick={musicStop}
              className={cn(
                "winamp-btn w-6 h-5 flex items-center justify-center",
                !isDark && "winamp-btn-light",
                isDark && "winamp-btn-dark",
                playState === 'stopped' && (isDark ? "ring-1 ring-cyan-400" : "ring-1 ring-[#7a6b4e]")
              )}
              data-testid="winamp-stop"
            >
              <span className="text-[8px]">⏹</span>
            </button>
            
            <button 
              onClick={musicNext}
              className={cn(
                "winamp-btn w-6 h-5 flex items-center justify-center",
                !isDark && "winamp-btn-light",
                isDark && "winamp-btn-dark"
              )}
              data-testid="winamp-next"
            >
              <span className="text-[8px]">⏭</span>
            </button>

            <div className="w-2" />

            <button 
              onClick={musicToggleShuffle}
              className={cn(
                "text-[7px] px-1.5 py-0.5 rounded font-bold",
                !isDark && (shuffle ? "bg-[#7a6b4e] text-[#d4c4a6]" : "bg-[#9a8b6e] text-[#5a4b2e]"),
                isDark && (shuffle ? "bg-cyan-600 text-white" : "bg-cyan-950 text-cyan-600")
              )}
              data-testid="winamp-shuffle"
            >
              SHUF
            </button>
            
            <button 
              onClick={musicToggleRepeat}
              className={cn(
                "text-[7px] px-1.5 py-0.5 rounded font-bold",
                !isDark && (repeat ? "bg-[#7a6b4e] text-[#d4c4a6]" : "bg-[#9a8b6e] text-[#5a4b2e]"),
                isDark && (repeat ? "bg-cyan-600 text-white" : "bg-cyan-950 text-cyan-600")
              )}
              data-testid="winamp-repeat"
            >
              REP
            </button>
          </div>
        </div>
      </div>

      {!isMobile && (
      <div className={cn(
        "mt-0.5",
        !isDark && "bg-gradient-to-b from-[#c9bc9e] to-[#b8a988] border-t border-[#9a8b6e]",
        isDark && "bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e] border-t border-cyan-800/30"
      )}>
        <div className={cn(
          "h-3 flex items-center justify-between px-2",
          !isDark && "bg-gradient-to-r from-[#9c8b6e] via-[#c4b596] to-[#9c8b6e]",
          isDark && "bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#1a1a2e]"
        )}>
          <span className={cn(
            "text-[7px] font-bold",
            !isDark && "text-[#5a4b2e]",
            isDark && "text-cyan-500"
          )}>EQUALIZER</span>
        </div>

        <div className="p-2">
          <div className="flex items-center gap-2 mb-2">
            <button 
              onClick={() => setEqEnabled(!eqEnabled)}
              className={cn(
                "text-[7px] px-1.5 py-0.5 rounded font-bold",
                !isDark && (eqEnabled ? "bg-[#7a6b4e] text-[#d4c4a6]" : "bg-[#9a8b6e] text-[#5a4b2e]"),
                isDark && (eqEnabled ? "bg-cyan-600 text-white" : "bg-cyan-950 text-cyan-600")
              )}
              data-testid="winamp-eq-toggle"
            >
              ON
            </button>
            <button 
              onClick={() => setEqAuto(!eqAuto)}
              className={cn(
                "text-[7px] px-1.5 py-0.5 rounded font-bold",
                !isDark && (eqAuto ? "bg-[#7a6b4e] text-[#d4c4a6]" : "bg-[#9a8b6e] text-[#5a4b2e]"),
                isDark && (eqAuto ? "bg-cyan-600 text-white" : "bg-cyan-950 text-cyan-600")
              )}
              data-testid="winamp-eq-auto"
            >
              AUTO
            </button>
            <div className="flex-1" />
            <select className={cn(
              "text-[7px] px-1 py-0.5 rounded border-none outline-none",
              !isDark && "bg-[#9a8b6e] text-[#3a2b0e]",
              isDark && "bg-cyan-950 text-cyan-400"
            )} data-testid="winamp-eq-preset">
              <option>PRESETS</option>
              <option>Rock</option>
              <option>Pop</option>
              <option>Jazz</option>
              <option>Classical</option>
              <option>Bass Boost</option>
            </select>
          </div>

          <div className="flex items-end gap-1">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-4 h-16 rounded relative overflow-hidden",
                !isDark && "bg-[#5a4b2e]",
                isDark && "bg-cyan-950"
              )}>
                <div 
                  className={cn(
                    "absolute bottom-0 w-full transition-all",
                    !isDark && "bg-gradient-to-t from-[#d4a556] to-[#f0c878]",
                    isDark && "bg-gradient-to-t from-cyan-600 to-blue-400"
                  )}
                  style={{ height: `${preamp}%` }}
                />
              </div>
              <span className={cn(
                "text-[6px] mt-0.5",
                !isDark ? "text-[#5a4b2e]" : "text-cyan-600"
              )}>PRE</span>
            </div>

            {eqBands.map((band, i) => (
              <div key={band} className="flex flex-col items-center">
                <div 
                  className={cn(
                    "w-3 h-16 rounded relative overflow-hidden cursor-pointer",
                    !isDark && "bg-[#5a4b2e]",
                    isDark && "bg-cyan-950"
                  )}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = 100 - ((e.clientY - rect.top) / rect.height * 100);
                    handleEqChange(i, Math.max(0, Math.min(100, percent)));
                  }}
                >
                  <div 
                    className={cn(
                      "absolute bottom-0 w-full transition-all",
                      !isDark && "bg-gradient-to-t from-green-600 via-yellow-500 to-red-500",
                      isDark && "bg-gradient-to-t from-cyan-600 via-blue-400 to-purple-500"
                    )}
                    style={{ height: `${eqValues[i]}%` }}
                  />
                </div>
                <span className={cn(
                  "text-[5px] mt-0.5",
                  !isDark ? "text-[#5a4b2e]" : "text-cyan-600"
                )}>{band}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      <div className={cn(
        "flex-1 mt-0.5 overflow-hidden flex flex-col",
        !isDark && "bg-gradient-to-b from-[#c9bc9e] to-[#b8a988] rounded-b-lg",
        isDark && "bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e] rounded-b-lg border-t border-cyan-800/30"
      )}>
        <div className={cn(
          "h-3 flex items-center justify-between px-2",
          !isDark && "bg-gradient-to-r from-[#9c8b6e] via-[#c4b596] to-[#9c8b6e]",
          isDark && "bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#1a1a2e]"
        )}>
          <span className={cn(
            "text-[7px] font-bold",
            !isDark && "text-[#5a4b2e]",
            isDark && "text-cyan-500"
          )}>PLAYLIST</span>
          <span className={cn(
            "text-[6px]",
            !isDark && "text-[#5a4b2e]",
            isDark && "text-cyan-600"
          )}>{tracks.length} tracks</span>
        </div>

        <div className={cn(
          "flex-1 overflow-y-auto p-1",
          !isDark && "bg-[#1a1a1a]",
          isDark && "bg-black/60"
        )}>
          {tracks.filter(track => track.url && track.url.trim() !== '').map((track, i) => {
            const actualIndex = tracks.findIndex(t => t.id === track.id);
            return (
              <div
                key={track.id}
                onClick={() => musicSetTrack(actualIndex)}
                className={cn(
                  "px-2 py-0.5 cursor-pointer text-[9px] flex items-center gap-2 rounded",
                  actualIndex === currentTrackIndex && !isDark && "bg-[#7a6b4e] text-[#d4c4a6]",
                  actualIndex === currentTrackIndex && isDark && "bg-cyan-900/50 text-cyan-300",
                  actualIndex !== currentTrackIndex && !isDark && "text-[#00aa00] hover:bg-[#2a2a2a]",
                  actualIndex !== currentTrackIndex && isDark && "text-cyan-600 hover:bg-cyan-950/50"
                )}
                data-testid={`playlist-track-${track.id}`}
              >
                <span className="w-4 text-right opacity-70">{actualIndex + 1}.</span>
                <span className="flex-1 truncate">{track.title}</span>
                <span className="opacity-70">{formatDuration(track.duration)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
