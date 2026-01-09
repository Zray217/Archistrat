
import React from 'react';

interface ImagePainterProps {
  baseImage: string;
  onSave: (sketch: string) => void;
  onClose: () => void;
  title: string;
}

const ImagePainter: React.FC<ImagePainterProps> = ({ baseImage, onSave, onClose, title }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = baseImage;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#ef4444'; 
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };
  }, [baseImage]);

  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Correct coordinates using scale factors
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: any) => {
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

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-6xl w-full">
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600">{title}</h4>
            <p className="text-[12px] font-bold text-black uppercase mt-1">标记形态调整意图 / MARK ADJUSTMENT INTENT</p>
          </div>
          <div className="flex gap-4">
            <button onClick={onClose} className="text-[10px] font-bold text-gray-400 hover:text-black uppercase">取消 / CANCEL</button>
            <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-full text-[10px] font-black shadow-xl hover:bg-blue-700 uppercase tracking-widest">确认意图 / CONFIRM</button>
          </div>
        </div>
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="w-full h-full cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseUp={() => setIsDrawing(false)}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={() => setIsDrawing(false)}
            onTouchMove={draw}
          />
        </div>
      </div>
    </div>
  );
};

export default ImagePainter;
