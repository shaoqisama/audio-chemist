
import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut, Flag, Scissors } from 'lucide-react';

interface Marker {
  id: string;
  position: number;
  color: string;
  label?: string;
}

interface WaveformDisplayProps {
  audioData?: Float32Array;
  onSplitAt?: (position: number) => void;
  onMarkerAdd?: (position: number) => void;
  markers?: Marker[];
}

export const WaveformDisplay = ({ 
  audioData, 
  onSplitAt,
  onMarkerAdd,
  markers = [] 
}: WaveformDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState(0);
  const [markerMode, setMarkerMode] = useState(false);
  const [splitMode, setSplitMode] = useState(false);

  // Handle zoom functionality
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 10));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 1));
  };

  // Handle panning
  const handleScroll = (e: React.WheelEvent) => {
    if (e.shiftKey && audioData) {
      const maxOffset = Math.max(0, (audioData.length * zoom - audioData.length) / audioData.length);
      setOffset(prev => Math.max(0, Math.min(prev + e.deltaY * 0.0005, maxOffset)));
      e.preventDefault();
    }
  };

  // Handle canvas click for markers or splitting
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!audioData || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const relativePosition = clickX / rect.width;
    
    // Calculate the actual position in the audio data considering zoom and offset
    const position = (offset + relativePosition / zoom) * audioData.length / audioData.length;
    
    if (markerMode && onMarkerAdd) {
      onMarkerAdd(position);
      setMarkerMode(false); // Turn off marker mode after placing
    } else if (splitMode && onSplitAt) {
      onSplitAt(position);
      setSplitMode(false); // Turn off split mode after splitting
    }
  };

  // Render waveform and markers
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

    // Calculate visible part of the waveform based on zoom and offset
    const visibleDataLength = Math.floor(audioData.length / zoom);
    const startIdx = Math.floor(offset * audioData.length);
    const endIdx = Math.min(startIdx + visibleDataLength, audioData.length);
    
    // Draw waveform with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
    gradient.addColorStop(0, '#00ff9d');
    gradient.addColorStop(1, '#00a569');
    
    ctx.beginPath();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    const width = rect.width;
    const height = rect.height;
    
    // Calculate step size based on zoom level
    const step = Math.max(1, Math.ceil((endIdx - startIdx) / width));
    
    for (let i = 0; i < width; i++) {
      const dataIdx = startIdx + Math.floor(i * step);
      if (dataIdx >= audioData.length) break;
      
      let min = 1.0;
      let max = -1.0;
      
      for (let j = 0; j < step; j++) {
        const idx = dataIdx + j;
        if (idx < audioData.length) {
          const datum = audioData[idx];
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }
      }
      
      const y = ((1 + min) * height) / 2;
      const y2 = ((1 + max) * height) / 2;
      
      ctx.moveTo(i, y);
      ctx.lineTo(i, y2);
    }
    
    ctx.stroke();
    
    // Draw RMS/volume envelope
    if (zoom > 1) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      
      let prevX = 0;
      let prevY = height / 2;
      
      for (let i = 0; i < width; i += 5) {
        const dataIdx = startIdx + Math.floor(i * (endIdx - startIdx) / width);
        if (dataIdx >= audioData.length) break;
        
        // Calculate RMS for a small window
        const windowSize = Math.min(50, endIdx - dataIdx);
        let sumSquares = 0;
        for (let j = 0; j < windowSize; j++) {
          if (dataIdx + j < audioData.length) {
            sumSquares += audioData[dataIdx + j] ** 2;
          }
        }
        
        const rms = Math.sqrt(sumSquares / windowSize);
        const y = height / 2 - rms * height / 2;
        
        if (i === 0) {
          ctx.moveTo(i, y);
        } else {
          ctx.quadraticCurveTo(prevX, prevY, (prevX + i) / 2, (prevY + y) / 2);
        }
        
        prevX = i;
        prevY = y;
      }
      
      ctx.stroke();
    }
    
    // Draw markers
    markers.forEach(marker => {
      const markerPos = marker.position;
      if (markerPos >= offset && markerPos <= offset + 1/zoom) {
        const x = (markerPos - offset) * zoom * width;
        
        // Draw line
        ctx.beginPath();
        ctx.strokeStyle = marker.color;
        ctx.lineWidth = 2;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        
        // Draw marker flag
        ctx.fillStyle = marker.color;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 10, 0);
        ctx.lineTo(x + 10, 10);
        ctx.lineTo(x, 20);
        ctx.closePath();
        ctx.fill();
        
        // Draw label if provided
        if (marker.label) {
          ctx.fillStyle = '#fff';
          ctx.font = '10px sans-serif';
          ctx.fillText(marker.label, x + 15, 15);
        }
      }
    });
    
  }, [audioData, zoom, offset, markers]);

  return (
    <div className="waveform-container" ref={containerRef} onWheel={handleScroll}>
      <div className="waveform-grid" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: 'pixelated' }}
        onClick={handleCanvasClick}
      />
      
      {audioData && (
        <div className="absolute bottom-3 right-3 flex space-x-2">
          <Button 
            variant="secondary" 
            size="icon" 
            className={markerMode ? 'bg-primary text-primary-foreground' : ''} 
            onClick={() => setMarkerMode(!markerMode)}
            title="Add Marker"
          >
            <Flag className="h-4 w-4" />
          </Button>
          <Button 
            variant="secondary" 
            size="icon" 
            className={splitMode ? 'bg-primary text-primary-foreground' : ''} 
            onClick={() => setSplitMode(!splitMode)}
            title="Split Sample"
          >
            <Scissors className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
