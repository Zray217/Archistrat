
import React from 'react';

interface SketchCanvasProps {
  onSave: (dataUrl: string) => void;
  aspectRatio?: number; // width / height
}

const SketchCanvas: React.FC<SketchCanvasProps> = ({ onSave, aspectRatio = 16 / 9 }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const dimensions = { width: 1280, height: 720 }; // High internal resolution

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Initial fill
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
  }, []);

  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Important: Calculate scale between CSS size and internal coordinate size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clientX = (e.clientX || (e.touches && e.touches[0].clientX));
    const clientY = (e.clientY || (e.touches && e.touches[0].clientY));
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const endDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (canvasRef.current) {
        onSave(canvasRef.current.toDataURL('image/png'));
      }
    }
  };

  const clear = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      onSave('');
    }
  };

  return (
    <div className="space-y-2 w-full" ref={containerRef}>
      <div className="flex justify-between items-center px-1">
        <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">形态调整手绘 / MASSING SKETCH</span>
        <button type="button" onClick={clear} className="text-[9px] font-bold text-gray-400 hover:text-red-500 uppercase transition-colors">清除 / CLEAR</button>
      </div>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={startDrawing}
        onMouseUp={endDrawing}
        onMouseMove={draw}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchEnd={endDrawing}
        onTouchMove={draw}
        className="border border-blue-100 rounded-lg cursor-crosshair bg-white touch-none shadow-inner w-full aspect-video"
      />
    </div>
  );
};

export default SketchCanvas;
