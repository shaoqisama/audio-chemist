
import { useState, useCallback, useRef } from 'react';
import { WaveformDisplay } from '@/components/WaveformDisplay';
import { SampleList } from '@/components/SampleList';
import { Controls } from '@/components/Controls';
import { Sample } from '@/types/audio';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { 
  detectTransients, 
  analyzeSpectrum, 
  detectEnvelope,
  identifyInstrument, 
  detectOnsets 
} from '@/utils/audioAnalysis';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const [audioData, setAudioData] = useState<Float32Array | undefined>();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sensitivity, setSensitivity] = useState(50);
  const audioContextRef = useRef<AudioContext>();

  const analyzeAudio = async (audioBuffer: AudioBuffer) => {
    try {
      // Detect transients and onsets
      const transients = detectTransients(audioBuffer, sensitivity);
      const onsets = detectOnsets(audioBuffer, sensitivity);
      
      // Combine both detection methods and sort chronologically
      const allEvents = [...transients, ...onsets].sort((a, b) => a - b);
      
      // Remove duplicates (events that are very close to each other)
      const uniqueEvents: number[] = [];
      let lastEvent = -1;
      const minTimeBetweenEvents = 0.1; // 100ms minimum between events
      
      allEvents.forEach(event => {
        if (lastEvent === -1 || event - lastEvent >= minTimeBetweenEvents) {
          uniqueEvents.push(event);
          lastEvent = event;
        }
      });
      
      // Analyze spectrum for overall characteristics
      const spectrum = await analyzeSpectrum(audioBuffer);
      
      // Create samples based on analysis
      const newSamples: Sample[] = [];
      
      // Process each detected event
      for (let i = 0; i < uniqueEvents.length; i++) {
        const startTime = uniqueEvents[i];
        const duration = i < uniqueEvents.length - 1 
          ? uniqueEvents[i + 1] - startTime 
          : 0.5;
        
        // Use the new instrument identification function
        const instrumentType = await identifyInstrument(audioBuffer, startTime, duration);
        
        // Map instrument type to sample type
        let sampleType: Sample['type'] = 'other';
        switch (instrumentType) {
          case 'kick':
          case 'snare':
          case 'hihat':
            sampleType = instrumentType as Sample['type'];
            break;
          case 'bass':
            sampleType = 'bass';
            break;
          case 'piano':
          case 'guitar':
          case 'synth':
            sampleType = 'melody';
            break;
          default:
            sampleType = 'other';
        }
        
        newSamples.push({
          id: `${i + 1}`,
          name: `${instrumentType.charAt(0).toUpperCase() + instrumentType.slice(1)} Sample ${i + 1}`,
          type: sampleType,
          start: startTime,
          duration,
          buffer: audioBuffer
        });
      }
      
      setSamples(newSamples);
      toast({
        title: "Analysis Complete",
        description: `Found ${newSamples.length} samples in the audio file.`
      });
    } catch (error) {
      console.error('Error analyzing audio:', error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "There was an error analyzing the audio file."
      });
    }
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      // Get audio data for visualization
      const channelData = audioBuffer.getChannelData(0);
      setAudioData(channelData);

      // Analyze the audio
      await analyzeAudio(audioBuffer);
    } catch (error) {
      console.error('Error loading audio:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load the audio file."
      });
    }
  }, [sensitivity]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSkipBack = useCallback(() => {
    // Implementation for skip back
  }, []);

  const handleSkipForward = useCallback(() => {
    // Implementation for skip forward
  }, []);

  const handleSampleClick = useCallback(async (sample: Sample) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    try {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = sample.buffer;
      source.connect(audioContextRef.current.destination);
      source.start(0, sample.start, sample.duration);
      
      toast({
        title: "Playing Sample",
        description: sample.name
      });
    } catch (error) {
      console.error('Error playing sample:', error);
      toast({
        variant: "destructive",
        title: "Playback Failed",
        description: "Failed to play the sample."
      });
    }
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
