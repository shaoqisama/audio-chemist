
import { useEffect, useRef } from 'react';

interface WaveformDisplayProps {
  audioData?: Float32Array;
}

export const WaveformDisplay = ({ audioData }: WaveformDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !audioData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw waveform
    ctx.beginPath();
    ctx.strokeStyle = '#00ff9d';
    ctx.lineWidth = 2;
    const width = rect.width;
    const height = rect.height;
    const step = Math.ceil(audioData.length / width);
    
    for (let i = 0; i < width; i++) {
      const x = i;
      let min = 1.0;
      let max = -1.0;
      
      for (let j = 0; j < step; j++) {
        const datum = audioData[(i * step) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      
      const y = ((1 + min) * height) / 2;
      const y2 = ((1 + max) * height) / 2;
      
      ctx.moveTo(x, y);
      ctx.lineTo(x, y2);
    }
    
    ctx.stroke();
  }, [audioData]);

  return (
    <div className="waveform-container">
      <div className="waveform-grid" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};
