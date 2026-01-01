import { useRef, useState, useEffect } from 'react';
import { useOSStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Eraser, Pencil, MousePointer, Download, Trash2 } from 'lucide-react';

export function Paint() {
  const { theme } = useOSStore();
  const isDark = theme === 'dark';
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#000000');
  const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(2);

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
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? 20 : lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  useEffect(() => {
    // Init white background
    clearCanvas();
  }, []);

  const colors = [
    '#000000', '#787c7e', '#ff0000', '#ff8800', '#ffff00', 
    '#00ff00', '#0000ff', '#8800ff', '#ff00ff'
  ];

  return (
    <div className="h-full flex flex-col bg-[#c0c0c0]">
      {/* Toolbar */}
      <div className={cn(
        "p-2 flex items-center gap-4 border-b shrink-0",
        !isDark && "bg-[#f0f0f0] border-gray-300",
        isDark && "bg-[#2d2d2d] border-black text-white"
      )}>
        <div className="flex bg-white/10 rounded p-1 gap-1 border border-black/10">
          <button 
            onClick={() => setTool('pencil')}
            className={cn("p-1.5 rounded hover:bg-black/10", tool === 'pencil' && "bg-blue-200")}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setTool('eraser')}
            className={cn("p-1.5 rounded hover:bg-black/10", tool === 'eraser' && "bg-blue-200")}
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-8 bg-black/10" />

        <div className="flex flex-wrap gap-1 max-w-[120px]">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool('pencil'); }}
              className={cn(
                "w-5 h-5 border border-black/20 hover:scale-110 transition-transform",
                color === c && tool !== 'eraser' && "ring-2 ring-blue-500 z-10"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          <button onClick={clearCanvas} className="p-2 hover:bg-red-100 rounded text-red-600" title="Clear">
            <Trash2 className="w-4 h-4" />
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