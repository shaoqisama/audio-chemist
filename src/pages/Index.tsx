
import { useState, useCallback } from 'react';
import { WaveformDisplay } from '@/components/WaveformDisplay';
import { SampleList } from '@/components/SampleList';
import { Controls } from '@/components/Controls';
import { Sample } from '@/types/audio';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

const Index = () => {
  const [audioData, setAudioData] = useState<Float32Array | undefined>();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sensitivity, setSensitivity] = useState(50);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Get audio data for visualization
    const channelData = audioBuffer.getChannelData(0);
    setAudioData(channelData);

    // Example detection (simplified)
    const sampleData: Sample[] = [
      {
        id: '1',
        name: 'Kick Sample 1',
        type: 'kick',
        start: 0,
        duration: 0.5,
        buffer: audioBuffer
      },
      {
        id: '2',
        name: 'Snare Sample 1',
        type: 'snare',
        start: 0.5,
        duration: 0.3,
        buffer: audioBuffer
      }
    ];
    setSamples(sampleData);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSkipBack = useCallback(() => {
    // Implementation for skip back
  }, []);

  const handleSkipForward = useCallback(() => {
    // Implementation for skip forward
  }, []);

  const handleSampleClick = useCallback((sample: Sample) => {
    // Implementation for sample playback
    console.log('Playing sample:', sample.name);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background p-6 animate-fade-in">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Audio Alchemist</h1>
        <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Audio
          <input
            id="file-upload"
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 flex-1">
        <div className="flex flex-col space-y-6">
          <WaveformDisplay audioData={audioData} />
          <Controls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onSkipBack={handleSkipBack}
            onSkipForward={handleSkipForward}
            sensitivity={sensitivity}
            onSensitivityChange={setSensitivity}
          />
        </div>
        
        <div className="bg-card rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Detected Samples</h2>
          </div>
          <SampleList
            samples={samples}
            onSampleClick={handleSampleClick}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
