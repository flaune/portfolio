import { useRef, useState, useEffect } from 'react';
import { useOSStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Eraser, Pencil, MousePointer, Download, Trash2 } from 'lucide-react';
import { PaintCache } from '@/lib/cache';

const colorNames: Record<string, string> = {
  '#000000': 'Black',
  '#787c7e': 'Gray',
  '#ff0000': 'Red',
  '#ff8800': 'Orange',
  '#ffff00': 'Yellow',
  '#00ff00': 'Green',
  '#0000ff': 'Blue',
  '#8800ff': 'Purple',
  '#ff00ff': 'Magenta'
};

const COLORS = [
  '#000000', '#787c7e', '#ff0000', '#ff8800', '#ffff00',
  '#00ff00', '#0000ff', '#8800ff', '#ff00ff'
];

export function Paint() {
  const { theme } = useOSStore();
  const isDark = theme === 'dark';

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load cached state on initialization
  const cachedState = PaintCache.loadState();
  const [color, setColor] = useState(cachedState.color ?? '#000000');
  const [tool, setTool] = useState<'pencil' | 'eraser'>(cachedState.tool ?? 'pencil');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(cachedState.brushSize ?? 2);

  const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * (canvas.width / rect.width),
        y: (touch.clientY - rect.top) * (canvas.height / rect.height)
      };
    }
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    const pos = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPosition(e);
    ctx.lineTo(pos.x, pos.y);

    // Configure drawing based on tool
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)'; // Color doesn't matter for eraser
      ctx.lineWidth = 20;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }

    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    // Reset composite operation when done drawing
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.globalCompositeOperation = 'source-over';
      }

      // Save canvas state with throttling (waits 1.5s after last draw)
      // Use requestAnimationFrame to avoid blocking the UI thread
      requestAnimationFrame(() => {
        const canvasData = canvas.toDataURL('image/png');
        PaintCache.saveCanvasDataThrottled(canvasData);
      });
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clear cached canvas data immediately (don't wait for throttle)
      // Fire and forget - we don't need to await since clearing is lightweight
      PaintCache.saveState({
        canvasData: null,
        color,
        brushSize: lineWidth,
        tool,
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set white background
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load cached canvas data if available
    if (cachedState.canvasData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.onerror = () => {
        console.error('Failed to load cached canvas data');
      };
      img.src = cachedState.canvasData;
    }
  }, []);

  // Save lightweight state immediately when color, tool, or lineWidth changes
  // Canvas data is saved separately with throttling in stopDrawing
  useEffect(() => {
    PaintCache.saveState({
      color,
      brushSize: lineWidth,
      tool,
    });
  }, [color, tool, lineWidth]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'p':
          setTool('pencil');
          break;
        case 'e':
          setTool('eraser');
          break;
        case 'c':
          if (e.ctrlKey || e.metaKey) {
            // Allow default copy behavior
            return;
          }
          clearCanvas();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          {
            const index = parseInt(e.key) - 1;
            if (index < COLORS.length) {
              setColor(COLORS[index]);
              setTool('pencil');
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#c0c0c0]">
      {/* Toolbar */}
      <div
        className={cn(
          "p-2 flex items-center gap-4 border-b shrink-0",
          !isDark && "bg-[#f0f0f0] border-gray-300",
          isDark && "bg-[#2d2d2d] border-black text-white"
        )}
        role="toolbar"
        aria-label="Drawing tools"
      >
        <div className="flex bg-white/10 rounded p-1 gap-1 border border-black/10" role="group" aria-label="Tool selection">
          <button
            onClick={() => setTool('pencil')}
            aria-label="Pencil tool"
            aria-pressed={tool === 'pencil'}
            className={cn(
              "p-1.5 rounded hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
              tool === 'pencil' && "bg-blue-200"
            )}
          >
            <Pencil className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => setTool('eraser')}
            aria-label="Eraser tool"
            aria-pressed={tool === 'eraser'}
            className={cn(
              "p-1.5 rounded hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
              tool === 'eraser' && "bg-blue-200"
            )}
          >
            <Eraser className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="w-px h-8 bg-black/10" aria-hidden="true" />

        <div className="flex flex-wrap gap-1 max-w-[120px]" role="group" aria-label="Color palette">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool('pencil'); }}
              aria-label={`${colorNames[c]} color`}
              aria-pressed={color === c && tool !== 'eraser'}
              className={cn(
                "w-5 h-5 border border-black/20 hover:scale-110 transition-transform rounded-sm",
                "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
                color === c && tool !== 'eraser' && "ring-2 ring-blue-500 z-10"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          <button
            onClick={clearCanvas}
            aria-label="Clear canvas"
            className="p-2 hover:bg-red-100 rounded text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 p-4 overflow-hidden bg-gray-200 flex items-center justify-center cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="bg-white shadow-lg max-w-full max-h-full touch-none"
          aria-label="Drawing canvas"
          role="img"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      
      {/* Status Bar */}
      <div className={cn(
        "h-6 border-t px-2 text-xs flex items-center select-none justify-between",
        !isDark ? "bg-[#f0f0f0] text-gray-600" : "bg-[#2d2d2d] text-gray-400"
      )}>
        <span>{tool === 'pencil' ? 'Drawing...' : 'Erasing...'} | Size: {lineWidth}px</span>
        <span className="hidden sm:inline opacity-70">Shortcuts: P (Pencil) | E (Eraser) | 1-9 (Colors) | C (Clear)</span>
      </div>
    </div>
  );
}