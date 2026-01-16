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

export function Paint() {
  const { theme } = useOSStore();
  const isDark = theme === 'dark';

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load cached state on initialization
  const cachedState = PaintCache.loadState();
  const [color, setColor] = useState(cachedState.color);
  const [tool, setTool] = useState<'pencil' | 'eraser'>(cachedState.tool);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(cachedState.brushSize);

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

      // Save canvas state to cache
      const canvasData = canvas.toDataURL('image/png');
      PaintCache.saveState({
        canvasData,
        color,
        brushSize: lineWidth,
        tool,
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

      // Clear cached canvas data
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

  // Save state when color, tool, or lineWidth changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    PaintCache.saveState({
      canvasData: canvas.toDataURL('image/png'),
      color,
      brushSize: lineWidth,
      tool,
    });
  }, [color, tool, lineWidth]);

  const colors = [
    '#000000', '#787c7e', '#ff0000', '#ff8800', '#ffff00', 
    '#00ff00', '#0000ff', '#8800ff', '#ff00ff'
  ];

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
          {colors.map(c => (
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
        "h-6 border-t px-2 text-xs flex items-center select-none",
        !isDark ? "bg-[#f0f0f0] text-gray-600" : "bg-[#2d2d2d] text-gray-400"
      )}>
        {tool === 'pencil' ? 'Drawing...' : 'Erasing...'} | Size: {lineWidth}px | Pos: X, Y
      </div>
    </div>
  );
}