import { useState, useCallback, useRef, useEffect } from 'react';
import { WaveformDisplay } from '@/components/WaveformDisplay';
import { SampleList } from '@/components/SampleList';
import { Controls } from '@/components/Controls';
import { ParameterControls } from '@/components/ParameterControls';
import { Sample } from '@/types/audio';
import { Button } from '@/components/ui/button';
import { Upload, PanelRight, PanelLeft, Library, Menu, X } from 'lucide-react';
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  
  const [sensitivity, setSensitivity] = useState(50);
  const [attack, setAttack] = useState(10);
  const [release, setRelease] = useState(100);
  const [threshold, setThreshold] = useState(0.1);
  const [minLength, setMinLength] = useState(100);
  
  const [markers, setMarkers] = useState<{id: string; position: number; color: string; label?: string}[]>([]);
  
  const [sampleLibrary, setSampleLibrary] = useState<Sample[]>([]);
  const [activeLibrary, setActiveLibrary] = useState<'current' | 'saved'>('current');
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const audioContextRef = useRef<AudioContext>();
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const savedSamplesJson = localStorage.getItem('sampleLibrary');
    if (savedSamplesJson) {
      try {
        const savedSamples = JSON.parse(savedSamplesJson);
        setSampleLibrary(savedSamples);
      } catch (error) {
        console.error('Error loading saved samples:', error);
      }
    }
    
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setShowRightPanel(false);
      } else {
        setShowRightPanel(true);
      }
    };
    
    handleResize();
    
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const analyzeAudio = async (audioBuffer: AudioBuffer) => {
    try {
      setIsAnalyzing(true);
      
      const calculatedThreshold = (100 - sensitivity) / 1000;
      
      const transients = detectTransients(audioBuffer, calculatedThreshold);
      const onsets = detectOnsets(audioBuffer, calculatedThreshold);
      
      const allEvents = [...transients, ...onsets].sort((a, b) => a - b);
      
      const uniqueEvents: number[] = [];
      let lastEvent = -1;
      const minTimeBetweenEvents = minLength / 1000;
      
      allEvents.forEach(event => {
        if (lastEvent === -1 || event - lastEvent >= minTimeBetweenEvents) {
          uniqueEvents.push(event);
          lastEvent = event;
        }
      });
      
      const newMarkers = uniqueEvents.map((position, i) => ({
        id: `marker-${i}`,
        position,
        color: '#00ff9d',
        label: `M${i+1}`
      }));
      
      setMarkers(newMarkers);
      
      const spectrum = await analyzeSpectrum(audioBuffer);
      
      const newSamples: Sample[] = [];
      
      for (let i = 0; i < uniqueEvents.length; i++) {
        const startTime = uniqueEvents[i];
        const duration = i < uniqueEvents.length - 1 
          ? uniqueEvents[i + 1] - startTime 
          : 0.5;
        
        if (duration * 1000 < minLength / 2) continue;
        
        const instrumentType = await identifyInstrument(audioBuffer, startTime, duration);
        
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
          buffer: audioBuffer,
          tags: []
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
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsAnalyzing(true);
      const arrayBuffer = await file.arrayBuffer();
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      audioBufferRef.current = audioBuffer;
      
      const channelData = audioBuffer.getChannelData(0);
      setAudioData(channelData);
      setDuration(audioBuffer.duration);

      await analyzeAudio(audioBuffer);
    } catch (error) {
      console.error('Error loading audio:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load the audio file."
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [sensitivity, attack, release, threshold, minLength]);

  const handlePlayPause = useCallback(() => {
    if (!audioBufferRef.current || !audioContextRef.current) return;
    
    if (isPlaying) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      cancelAnimationFrame(animationFrameRef.current || 0);
    } else {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(audioContextRef.current.destination);
      
      sourceNodeRef.current = source;
      startTimeRef.current = audioContextRef.current.currentTime - currentTime;
      
      source.start(0, currentTime);
      source.onended = () => setIsPlaying(false);
      
      const updatePlaybackTime = () => {
        if (audioContextRef.current && startTimeRef.current) {
          const newTime = audioContextRef.current.currentTime - startTimeRef.current;
          if (newTime <= duration) {
            setCurrentTime(newTime);
            animationFrameRef.current = requestAnimationFrame(updatePlaybackTime);
          } else {
            setCurrentTime(0);
            setIsPlaying(false);
          }
        }
      };
      
      animationFrameRef.current = requestAnimationFrame(updatePlaybackTime);
    }
    
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentTime, duration]);

  const handleSkipBack = useCallback(() => {
    setCurrentTime(0);
    if (isPlaying) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      handlePlayPause();
    }
  }, [isPlaying, handlePlayPause]);

  const handleSkipForward = useCallback(() => {
    setCurrentTime(duration);
    if (isPlaying) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      setIsPlaying(false);
    }
  }, [isPlaying, duration]);

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

  const handleSampleMerge = useCallback((samplesToMerge: Sample[]) => {
    if (samplesToMerge.length < 2) return;
    
    const sortedSamples = [...samplesToMerge].sort((a, b) => a.start - b.start);
    
    const firstSample = sortedSamples[0];
    const lastSample = sortedSamples[sortedSamples.length - 1];
    
    const mergedSample: Sample = {
      id: `merged-${Date.now()}`,
      name: `Merged Sample (${sortedSamples.length})`,
      type: 'other',
      start: firstSample.start,
      duration: (lastSample.start + lastSample.duration) - firstSample.start,
      buffer: firstSample.buffer,
      tags: []
    };
    
    setSamples(prev => [
      ...prev.filter(sample => !samplesToMerge.some(s => s.id === sample.id)),
      mergedSample
    ]);
    
    toast({
      title: "Samples Merged",
      description: `Created ${mergedSample.name}`
    });
  }, []);

  const handleSampleRename = useCallback((sample: Sample, newName: string) => {
    setSamples(prev => 
      prev.map(s => 
        s.id === sample.id 
          ? { ...s, name: newName } 
          : s
      )
    );
  }, []);

  const handleAddToLibrary = useCallback((samplesToAdd: Sample[]) => {
    setSampleLibrary(prev => {
      const newSamples = samplesToAdd.filter(
        sample => !prev.some(existing => existing.id === sample.id)
      );
      
      if (newSamples.length === 0) {
        toast({
          title: "Already Saved",
          description: "These samples are already in your library"
        });
        return prev;
      }
      
      toast({
        title: "Added to Library",
        description: `Added ${newSamples.length} sample${newSamples.length === 1 ? '' : 's'} to your library`
      });
      
      return [...prev, ...newSamples];
    });
  }, []);

  const handleSampleUpdate = useCallback((updatedSample: Sample) => {
    if (activeLibrary === 'current') {
      setSamples(prev => 
        prev.map(sample => 
          sample.id === updatedSample.id ? updatedSample : sample
        )
      );
    } else {
      setSampleLibrary(prev => 
        prev.map(sample => 
          sample.id === updatedSample.id ? updatedSample : sample
        )
      );
    }
  }, [activeLibrary]);

  const handleRemoveFromLibrary = useCallback((sampleIds: string[]) => {
    setSampleLibrary(prev => prev.filter(sample => !sampleIds.includes(sample.id)));
    
    toast({
      title: "Removed from Library",
      description: `Removed ${sampleIds.length} sample${sampleIds.length === 1 ? '' : 's'} from your library`
    });
  }, []);

  const getDisplayedSamples = () => {
    return activeLibrary === 'current' ? samples : sampleLibrary;
  };

  const handleAddMarker = useCallback((position: number) => {
    const newMarker = {
      id: `marker-${Date.now()}`,
      position,
      color: '#00ff9d',
      label: `M${markers.length + 1}`
    };
    
    setMarkers(prev => [...prev, newMarker]);
    
    toast({
      title: "Marker Added",
      description: `Added marker at ${position.toFixed(2)}s`
    });
  }, [markers.length]);

  const handleSplitAt = useCallback((position: number) => {
    const sampleToSplit = samples.find(
      sample => position >= sample.start && position <= sample.start + sample.duration
    );
    
    if (!sampleToSplit || !audioBufferRef.current) {
      toast({
        variant: "destructive",
        title: "Split Failed",
        description: "No sample found at this position"
      });
      return;
    }
    
    const splitPoint = position;
    
    const firstHalf: Sample = {
      id: `${sampleToSplit.id}-1`,
      name: `${sampleToSplit.name} (Part 1)`,
      type: sampleToSplit.type,
      start: sampleToSplit.start,
      duration: splitPoint - sampleToSplit.start,
      buffer: audioBufferRef.current,
      tags: [...(sampleToSplit.tags || [])]
    };
    
    const secondHalf: Sample = {
      id: `${sampleToSplit.id}-2`,
      name: `${sampleToSplit.name} (Part 2)`,
      type: sampleToSplit.type,
      start: splitPoint,
      duration: (sampleToSplit.start + sampleToSplit.duration) - splitPoint,
      buffer: audioBufferRef.current,
      tags: [...(sampleToSplit.tags || [])]
    };
    
    setSamples(prev => [
      ...prev.filter(s => s.id !== sampleToSplit.id),
      firstHalf,
      secondHalf
    ]);
    
    handleAddMarker(position);
    
    toast({
      title: "Sample Split",
      description: `Split "${sampleToSplit.name}" into two parts`
    });
  }, [samples, handleAddMarker]);

  const handleAutoSettings = useCallback(() => {
    if (!audioBufferRef.current) return;
    
    const avgAmplitude = calculateAverageAmplitude(audioBufferRef.current);
    
    const newSensitivity = Math.round(60 - avgAmplitude * 100);
    setSensitivity(Math.max(10, Math.min(90, newSensitivity)));
    
    setAttack(Math.round(10 + avgAmplitude * 20));
    setRelease(Math.round(100 + avgAmplitude * 200));
    setThreshold(0.1 + avgAmplitude * 0.2);
    setMinLength(Math.round(80 + avgAmplitude * 100));
    
    toast({
      title: "Auto Settings Applied",
      description: "Parameters optimized based on audio content"
    });
  }, []);

  const calculateAverageAmplitude = (audioBuffer: AudioBuffer): number => {
    const channelData = audioBuffer.getChannelData(0);
    let sum = 0;
    
    for (let i = 0; i < channelData.length; i += 1000) {
      sum += Math.abs(channelData[i]);
    }
    
    return sum / (channelData.length / 1000);
  };

  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      cancelAnimationFrame(animationFrameRef.current || 0);
    };
  }, []);

  useEffect(() => {
    if (activeLibrary === 'saved' && audioBufferRef.current) {
      setSampleLibrary(prev => 
        prev.map(sample => {
          if (!sample.buffer && audioBufferRef.current) {
            return { ...sample, buffer: audioBufferRef.current };
          }
          return sample;
        })
      );
    }
  }, [activeLibrary, audioBufferRef.current]);

  return (
    <div className="min-h-screen flex flex-col bg-background p-2 sm:p-4 md:p-6 animate-fade-in overflow-hidden">
      <header className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight">Audio Alchemist</h1>
        
        <div className="lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
        
        <div className="hidden lg:flex items-center space-x-3">
          <Button 
            variant={activeLibrary === 'saved' ? 'default' : 'outline'} 
            onClick={() => setActiveLibrary(activeLibrary === 'current' ? 'saved' : 'current')}
          >
            <Library className="w-4 h-4 mr-2" />
            {activeLibrary === 'current' ? 'View Library' : 'Current Session'}
          </Button>
          <Button variant="outline" onClick={() => setShowRightPanel(!showRightPanel)}>
            {showRightPanel ? <PanelRight className="w-4 h-4 mr-2" /> : <PanelLeft className="w-4 h-4 mr-2" />}
            {showRightPanel ? "Hide" : "Show"} Panel
          </Button>
          <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Audio
          </Button>
        </div>
        
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-fade-in flex flex-col items-center justify-center">
            <div className="w-full max-w-xs space-y-4 p-6">
              <Button 
                className="w-full justify-start" 
                variant={activeLibrary === 'saved' ? 'default' : 'outline'}
                onClick={() => {
                  setActiveLibrary(activeLibrary === 'current' ? 'saved' : 'current');
                  setMobileMenuOpen(false);
                }}
              >
                <Library className="w-4 h-4 mr-2" />
                {activeLibrary === 'current' ? 'View Library' : 'Current Session'}
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline" 
                onClick={() => {
                  setShowRightPanel(!showRightPanel);
                  setMobileMenuOpen(false);
                }}
              >
                {showRightPanel ? <PanelRight className="w-4 h-4 mr-2" /> : <PanelLeft className="w-4 h-4 mr-2" />}
                {showRightPanel ? "Hide" : "Show"} Panel
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline" 
                onClick={() => {
                  document.getElementById('file-upload')?.click();
                  setMobileMenuOpen(false);
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Audio
              </Button>
              <Button 
                className="w-full" 
                variant="destructive" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Close Menu
              </Button>
            </div>
          </div>
        )}
      </header>

      <input
        id="file-upload"
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className={`grid grid-cols-1 ${showRightPanel ? 'lg:grid-cols-[1fr_350px]' : ''} gap-2 md:gap-4 lg:gap-6 flex-1 h-[calc(100vh-80px)] overflow-hidden`}>
        <div className="flex flex-col space-y-3 md:space-y-4 lg:space-y-6 overflow-y-auto scrollbar-thin">
          <WaveformDisplay 
            audioData={audioData}
            markers={markers}
            onMarkerAdd={handleAddMarker}
            onSplitAt={handleSplitAt}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 pb-4">
            <Controls
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onSkipBack={handleSkipBack}
              onSkipForward={handleSkipForward}
              sensitivity={sensitivity}
              onSensitivityChange={setSensitivity}
            />
            
            <ParameterControls
              sensitivity={sensitivity}
              attack={attack}
              release={release}
              threshold={threshold}
              minLength={minLength}
              onSensitivityChange={setSensitivity}
              onAttackChange={setAttack}
              onReleaseChange={setRelease}
              onThresholdChange={setThreshold}
              onMinLengthChange={setMinLength}
              onAutomaticSettings={handleAutoSettings}
            />
          </div>
        </div>
        
        {showRightPanel && (
          <div className="bg-card rounded-lg border h-full overflow-hidden flex flex-col">
            <div className="p-3 md:p-4 border-b flex items-center justify-between flex-shrink-0">
              <h2 className="text-base md:text-lg font-medium">
                {activeLibrary === 'current' ? 'Detected Samples' : 'Sample Library'}
              </h2>
              {activeLibrary === 'current' && samples.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAddToLibrary(samples)}
                  className="flex items-center gap-1"
                >
                  <Library className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Save All</span>
                </Button>
              )}
            </div>
            <div className="flex-grow overflow-hidden">
              <SampleList
                samples={getDisplayedSamples()}
                onSampleClick={handleSampleClick}
                onSampleMerge={activeLibrary === 'current' ? handleSampleMerge : undefined}
                onSampleRename={handleSampleRename}
                onSampleUpdate={handleSampleUpdate}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
