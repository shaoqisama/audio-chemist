import { useState, useCallback, useRef, useEffect } from 'react';
import { WaveformDisplay } from '@/components/WaveformDisplay';
import { SampleList } from '@/components/SampleList';
import { Controls } from '@/components/Controls';
import { ParameterControls } from '@/components/ParameterControls';
import { Sample } from '@/types/audio';
import { Button } from "@/components/ui/button";
import { Upload, PanelRight, PanelLeft, Library, Menu, X, FlaskConical } from 'lucide-react';
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
    <div className="relative min-h-screen flex flex-col bg-gradient-to-tr from-[#202f1e] via-[#18381d] to-[#222] p-2 sm:p-4 md:p-6 animate-fade-in overflow-hidden justify-between items-center">
      {/* Grunge/Texture overlays as in Landing */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-50 mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center"></div>
      <div className="pointer-events-none absolute inset-0 z-10 opacity-30 bg-gradient-to-br from-[#aeea62]/25 via-[#2e4e1c]/15 to-transparent animate-fade-in"></div>
      <div className="pointer-events-none fixed inset-0 z-10 opacity-25 blur-[2px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#cbff6c]/40 via-transparent to-transparent"></div>
      
      {/* Header */}
      <header className="relative z-20 w-full px-4 pt-7 flex items-center justify-between max-w-6xl mx-auto">
        <span className="flex items-center space-x-1 text-2xl font-bold tracking-tighter font-playfair text-[#caff70] drop-shadow-glow">
          <span className="bg-[#234c20] px-2 rounded-md text-[#e1fe82] border-2 border-[#afe62c] mr-2 shadow-lg">Au</span>
          <span>AUDIO</span>
          <span className="ml-2 bg-[#234c20] px-2 rounded-md text-[#e1fe82] border-2 border-[#afe62c] shadow-lg">Al</span>
          <span>CHEMIST</span>
        </span>
        <a href="/landing" className="ml-2">
          <Button variant="outline" size="sm" className="!bg-[#232] !text-[#caff70] border-[#b4e762] hover:!bg-[#2c521d] hover:border-[#ffe600] shadow-md">
            Launch Pad
          </Button>
        </a>
      </header>

      {/* Main App Content Wrapped in a Card-style Box */}
      <main className="relative z-20 flex flex-col flex-1 w-full items-center justify-center px-2 pt-4 md:pt-10 max-w-6xl mx-auto w-[98vw]">
        {/* Hero-like section mimicking landing page */}
        <div className="w-full text-center mb-4 md:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#cbff6c] via-[#ffe600] to-[#6ee7b7] text-transparent bg-clip-text animate-fade-in mb-2 drop-shadow-glow uppercase">
            <span className="inline-block transform hover:scale-110 transition-transform">
              Audio Alchemist
              <span className="inline ml-3 bg-[#1e3d23] px-3 rounded-md text-[#ffe600] border-2 border-[#d3ff6d] shadow-2xl">LAB</span>
            </span>
          </h1>
          <p className="mt-4 text-base md:text-xl text-[#cedfc2] font-light drop-shadow-md">
            <span className="text-[#e1fe82] font-bold">Detect</span>, <span className="text-[#ffe600] font-bold">split</span>, and <span className="text-[#ffb129] font-bold">remix</span> your samples like Heisenberg himself.<br/>
            Chemistry-level precision. No half measures.
          </p>
        </div>
        <div className="fixed top-4 right-4 z-40">
          <a href="/landing" className="text-xs bg-card border border-border px-2 py-1 rounded shadow hover:scale-105 transition-transform animate-fade-in">
            Try the Landing Page →
          </a>
        </div>
        {/* Responsive, BB-styled panel */}
        <div className={`grid grid-cols-1 ${
          showRightPanel ? 'lg:grid-cols-[1fr_385px]' : ''
        } gap-2 md:gap-4 lg:gap-7 flex-1 w-full h-[calc(100vh-210px)] overflow-hidden`}>
          <div className="flex flex-col space-y-3 md:space-y-4 lg:space-y-6 overflow-y-auto scrollbar-thin bg-gradient-to-br from-[#273e22aa] via-[#33451eaa] to-[#465b2590] border border-[#d9fa4a30] rounded-2xl shadow-2xl p-3 md:p-4 backdrop-blur-md">
            <WaveformDisplay 
              audioData={audioData}
              markers={markers}
              onMarkerAdd={handleAddMarker}
              onSplitAt={handleSplitAt}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 pb-5">
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
            <div className="bg-gradient-to-br from-[#212d1fce] via-[#32471ac0] to-[#212c1ed1] border border-[#b8e87c60] rounded-2xl h-full overflow-hidden flex flex-col shadow-2xl backdrop-blur-[1.5px] animate-scale-in ring-2 ring-[#d6fa3666]">
              <div className="p-3 md:p-4 border-b flex items-center justify-between flex-shrink-0 bg-gradient-to-l from-[#e1fe82]/20 via-transparent to-transparent">
                <h2 className="text-base md:text-lg font-bold text-[#d7ffb4] flex items-center gap-2 drop-shadow-glow">
                  <span className="inline-block bg-[#32471a]/90 rounded px-2 border border-[#eaff9340] text-[#eaff93] shadow-md mr-1">Detected</span>Samples
                </h2>
                {activeLibrary === 'current' && samples.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAddToLibrary(samples)}
                    className="flex items-center gap-1 border-[#eaff93] text-[#caff70] bg-[#234c20]/60 hover:bg-[#29581f]/60 hover:border-[#ffe600]"
                  >
                    <span className="hidden sm:inline font-semibold text-[#fffecd]">Save All</span>
                  </Button>
                )}
              </div>
              <div className="flex-grow overflow-hidden p-2">
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
      </main>
      {/* Footer style matches landing */}
      <footer className="relative z-20 w-full pb-8 pt-8 flex items-center justify-center text-xs text-[#bde597] tracking-wide">
        <span>
          &copy; {new Date().getFullYear()} Audio Chemist. 
          <span className="ml-1 text-[#ffe600] font-black">Say my name.</span>
        </span>
      </footer>
      <style>
        {`
          .drop-shadow-glow {
            filter: drop-shadow(0 0 7px #aef752aa);
          }
          @media (max-width: 600px) {
            .font-playfair, .text-3xl, .text-4xl, .text-5xl {
              font-size: 1.7rem !important;
              line-height: 2.3rem !important;
            }
            .md\\:pt-10 {
              padding-top: 1rem !important;
            }
            .max-w-2xl, .max-w-6xl {
              max-width: 98vw !important;
              padding: 0 0.2rem !important;
            }
            section > div {
              margin-top: 2rem !important;
              margin-bottom: 2rem !important;
            }
          }
        `}
      </style>
      {/* Hidden input and floating menus left unstyled for clarity */}
      <input
        id="file-upload"
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleFileUpload}
      />
      
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
    </div>
  );
};

export default Index;
