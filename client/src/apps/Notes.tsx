import { useState, useEffect, useRef } from 'react';
import { useOSStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { StickyNote, Sparkles, ChevronLeft } from 'lucide-react';
import { NotesCache } from '@/lib/cache';

interface NotesProps {
  onEasterEgg?: () => void;
}

export function Notes({ onEasterEgg }: NotesProps) {
  const { theme } = useOSStore();
  const isDark = theme === 'dark';
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const [notes, setNotes] = useState([
    { id: 1, title: 'Welcome!', content: 'Feel free to connect with me on Linkedin! I would love to get to know more people' },
    { id: 2, title: 'Quick Tips', content: '• Drag windows to move them\n• Click dock icons to open apps\n• Toggle theme in menu bar' },
    { id: 3, title: 'Roadmap 🚀', content: '# Portfolio Roadmap\n\n## Completed ✅\n• Fixed music player MP3 loading\n• Improved startup animation (fade to black)\n• Added AI Resources \n• Dark mode wallpaper support\n• Created this roadmap!\n\n## In Progress 🔨\n• Optimizing mobile experience\n• Adding more interactive features\n\n## Planned 📋\n• Blog integration\n• Project showcase expansion\n• Custom themes\n• More Easter eggs\n• Performance optimizations\n\n## Future Ideas 💡\n• Commission custom icon app art for the HUD\n• 3D elements\n• Animation improvements\n• Accessibility features\n• Multilingual support\n\nStay tuned for updates!' },
  ]);

  // Load cached state
  const cachedState = NotesCache.loadState();
  const initialNote = cachedState.selectedNoteId
    ? notes.find(n => n.id === cachedState.selectedNoteId) || notes[0]
    : notes[0];

  const [selectedNote, setSelectedNote] = useState(initialNote);
  const [secretAnswer, setSecretAnswer] = useState(cachedState.secretAnswer || '');
  const [showSecret, setShowSecret] = useState(cachedState.secretShown || false);

  // Restore scroll position on mount
  useEffect(() => {
    if (contentRef.current && cachedState.scrollPosition > 0) {
      contentRef.current.scrollTop = cachedState.scrollPosition;
    }
  }, []);

  // Save state when note selection or secret changes (not scroll - that's debounced separately)
  useEffect(() => {
    NotesCache.saveState({
      selectedNoteId: selectedNote.id,
      secretAnswer,
      secretShown: showSecret,
    });
  }, [selectedNote, secretAnswer, showSecret]);

  // Track scroll position changes with debouncing (waits 500ms after last scroll)
  const handleScroll = () => {
    if (contentRef.current) {
      NotesCache.saveScrollPositionDebounced(contentRef.current.scrollTop);
    }
  };

  const handleSecretSubmit = () => {
    const answer = secretAnswer.trim().toLowerCase();
    if (answer === 'mew') {
      setSecretAnswer('');
      setShowSecret(false);
      onEasterEgg?.();
    } else if (answer.length > 0) {
      setSecretAnswer('');
    }
  };

  const handleNoteSelect = (note: typeof notes[0]) => {
    setSelectedNote(note);
    setShowSecret(false);
    if (isMobile) setShowSidebar(false);
  };

  const handleSecretSelect = () => {
    setShowSecret(true);
    setSelectedNote({ id: -1, title: '', content: '' });
    if (isMobile) setShowSidebar(false);
  };

  return (
    <div className={cn(
      "h-full flex",
      !isDark && "bg-[#fef3c7] text-amber-900",
      isDark && "bg-[#1a1a2e] text-blue-100"
    )}>
      {/* Notes List - hidden on mobile when viewing content */}
      {(!isMobile || showSidebar) && (
      <div className={cn(
        "flex-shrink-0 flex flex-col border-r",
        isMobile ? "w-full" : "w-48",
        !isDark && "bg-[#fde68a]/50 border-amber-300",
        isDark && "bg-black/30 border-blue-500/20"
      )}>
        <div className="p-3 text-xs font-bold uppercase tracking-wider opacity-60">
          My Notes
        </div>
        
        {notes.map((note) => (
          <button
            key={note.id}
            onClick={() => handleNoteSelect(note)}
            className={cn(
              "text-left px-3 py-2 border-b transition-colors",
              !isDark && "border-amber-200 hover:bg-amber-100",
              isDark && "border-blue-500/10 hover:bg-blue-500/10",
              selectedNote.id === note.id && (isDark ? "bg-blue-500/20" : "bg-amber-200")
            )}
          >
            <div className="font-medium text-sm truncate">{note.title}</div>
            <div className="text-xs opacity-60 truncate">{note.content.substring(0, 30)}...</div>
          </button>
        ))}

        {/* Secret Note */}
        <button
          onClick={handleSecretSelect}
          className={cn(
            "text-left px-3 py-2 border-b transition-colors mt-auto",
            !isDark && "border-amber-200 hover:bg-amber-100",
            isDark && "border-blue-500/10 hover:bg-blue-500/10",
            showSecret && (isDark ? "bg-blue-500/20" : "bg-amber-200")
          )}
        >
          <div className="font-medium text-sm truncate flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> ???
          </div>
          <div className="text-xs opacity-60">Something hidden...</div>
        </button>
      </div>
      )}

      {/* Note Content - hidden on mobile when viewing sidebar */}
      {(!isMobile || !showSidebar) && (
      <div ref={contentRef} onScroll={handleScroll} className="flex-1 p-6 overflow-auto">
        {showSecret ? (
          <div className="h-full flex flex-col items-center justify-center text-center relative">
            {isMobile && (
              <button 
                onClick={() => setShowSidebar(true)}
                className={cn(
                  "absolute top-0 left-0 p-1 rounded hover:bg-black/10",
                  isDark && "hover:bg-white/10"
                )}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <Sparkles className={cn("w-12 h-12 mb-4", isDark ? "text-pink-400" : "text-amber-600")} />
            <h2 className="text-xl font-bold mb-2">Secret Question</h2>
            <p className={cn("text-lg mb-6 opacity-80", isDark && "text-pink-300")}>
              What is my favorite Pokémon?
            </p>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={secretAnswer}
                onChange={(e) => setSecretAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSecretSubmit()}
                placeholder="Type your answer..."
                className={cn(
                  "px-4 py-2 rounded-lg border outline-none transition-colors w-48",
                  !isDark && "bg-white border-amber-300 focus:border-amber-500",
                  isDark && "bg-black/30 border-blue-500/30 focus:border-pink-500 text-white placeholder:text-blue-300/50"
                )}
              />
              <button
                onClick={handleSecretSubmit}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-colors",
                  !isDark && "bg-amber-500 text-white hover:bg-amber-600",
                  isDark && "bg-pink-600 text-white hover:bg-pink-500"
                )}
              >
                Submit
              </button>
            </div>
            
            <p className="mt-4 text-xs opacity-50">
              Hint: It's a legendary psychic type...
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              {isMobile && (
                <button 
                  onClick={() => setShowSidebar(true)}
                  className={cn(
                    "p-1 rounded hover:bg-black/10",
                    isDark && "hover:bg-white/10"
                  )}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <StickyNote className="w-5 h-5 opacity-60" />
              <h2 className="text-xl font-bold">{selectedNote.title}</h2>
            </div>
            <div className={cn(
              "whitespace-pre-wrap leading-relaxed",
              !isDark && "text-amber-800",
              isDark && "text-blue-200"
            )}>
              {selectedNote.content}
            </div>
          </>
        )}
      </div>
      )}
    </div>
  );
}
