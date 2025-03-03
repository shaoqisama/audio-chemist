
/**
 * Detects transients in an audio buffer
 * @param audioBuffer - The audio buffer to analyze
 * @param sensitivity - Sensitivity threshold (0-100)
 * @returns Array of detected transient positions
 */
export const detectTransients = (audioBuffer: AudioBuffer, sensitivity: number): number[] => {
  const data = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const threshold = (100 - sensitivity) / 1000; // Convert sensitivity to threshold
  const transients: number[] = [];
  
  // Calculate energy over time
  const windowSize = Math.floor(0.01 * sampleRate); // 10ms window
  let prevEnergy = 0;
  
  for (let i = 0; i < data.length - windowSize; i += windowSize) {
    let energy = 0;
    // Calculate RMS energy for current window
    for (let j = 0; j < windowSize; j++) {
      energy += data[i + j] * data[i + j];
    }
    energy = Math.sqrt(energy / windowSize);
    
    // Detect sudden energy increases
    if (energy > prevEnergy + threshold && energy > threshold * 2) {
      transients.push(i / sampleRate);
    }
    
    prevEnergy = energy;
  }
  
  return transients;
};

/**
 * Performs spectral analysis on an audio buffer
 * @param audioBuffer - The audio buffer to analyze
 * @returns Frequency bands and their energies
 */
export const analyzeSpectrum = async (audioBuffer: AudioBuffer) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(analyser);
  
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);
  
  // Define frequency ranges for different instruments
  const frequencyRanges = {
    kick: { low: 40, high: 120 },
    snare: { low: 120, high: 500 },
    hihat: { low: 800, high: 10000 },
    bass: { low: 60, high: 250 },
    piano: { low: 27, high: 4200 },
    guitar: { low: 80, high: 1200 },
    synth: { low: 200, high: 8000 }
  };
  
  const result = {
    lowFreq: calculateAverageEnergy(dataArray, 0, 200),
    midFreq: calculateAverageEnergy(dataArray, 200, 2000),
    highFreq: calculateAverageEnergy(dataArray, 2000, 20000),
    instrumentEnergies: {
      kick: calculateAverageEnergy(dataArray, frequencyRanges.kick.low, frequencyRanges.kick.high),
      snare: calculateAverageEnergy(dataArray, frequencyRanges.snare.low, frequencyRanges.snare.high),
      hihat: calculateAverageEnergy(dataArray, frequencyRanges.hihat.low, frequencyRanges.hihat.high),
      bass: calculateAverageEnergy(dataArray, frequencyRanges.bass.low, frequencyRanges.bass.high),
      piano: calculateAverageEnergy(dataArray, frequencyRanges.piano.low, frequencyRanges.piano.high),
      guitar: calculateAverageEnergy(dataArray, frequencyRanges.guitar.low, frequencyRanges.guitar.high),
      synth: calculateAverageEnergy(dataArray, frequencyRanges.synth.low, frequencyRanges.synth.high)
    }
  };
  
  return result;
};

/**
 * Analyzes harmonic content to identify musical instruments
 * @param audioBuffer - The audio buffer to analyze
 * @param startTime - Start time for analysis
 * @param duration - Duration to analyze
 * @returns The detected instrument type
 */
export const identifyInstrument = async (
  audioBuffer: AudioBuffer,
  startTime: number,
  duration: number
): Promise<string> => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 4096; // Higher resolution for better instrument detection
  
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(analyser);
  
  const sampleStart = Math.floor(startTime * audioBuffer.sampleRate);
  const sampleDuration = Math.floor(duration * audioBuffer.sampleRate);
  
  // Extract the segment we want to analyze
  const segment = audioBuffer.getChannelData(0).slice(
    sampleStart,
    Math.min(sampleStart + sampleDuration, audioBuffer.length)
  );
  
  // Calculate spectral features
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);
  
  // Calculate spectral centroid (brightness)
  const spectralCentroid = calculateSpectralCentroid(dataArray, audioBuffer.sampleRate);
  
  // Calculate spectral flux (rate of change of the spectrum)
  const spectralFlux = calculateSpectralFlux(segment, audioBuffer.sampleRate);
  
  // Calculate the attack time
  const attackTime = calculateAttackTime(segment, audioBuffer.sampleRate);
  
  // Calculate harmonicity (ratio of harmonic to inharmonic content)
  const harmonicity = calculateHarmonicity(dataArray);
  
  // Instrument identification logic based on spectral and temporal features
  if (spectralCentroid < 500 && attackTime < 0.05) {
    return 'kick';
  } else if (spectralCentroid > 3000 && attackTime < 0.03) {
    return 'hihat';
  } else if (spectralCentroid < 2000 && spectralCentroid > 500 && attackTime < 0.08) {
    return 'snare';
  } else if (spectralCentroid < 500 && attackTime > 0.1 && harmonicity > 0.7) {
    return 'bass';
  } else if (harmonicity > 0.8 && spectralFlux < 0.3 && spectralCentroid > 800) {
    return 'piano';
  } else if (harmonicity > 0.6 && harmonicity < 0.8 && spectralFlux > 0.3) {
    return 'guitar';
  } else if (spectralFlux > 0.5 || (spectralCentroid > 2000 && harmonicity < 0.6)) {
    return 'synth';
  } else {
    return 'other';
  }
};

/**
 * Detects the envelope of an audio signal
 * @param audioBuffer - The audio buffer to analyze
 * @returns Envelope data points
 */
export const detectEnvelope = (audioBuffer: AudioBuffer): Float32Array => {
  const data = audioBuffer.getChannelData(0);
  const envelopeData = new Float32Array(data.length);
  const attackTime = 0.01; // 10ms attack
  const releaseTime = 0.1; // 100ms release
  
  const attackSamples = Math.floor(attackTime * audioBuffer.sampleRate);
  const releaseSamples = Math.floor(releaseTime * audioBuffer.sampleRate);
  
  let envelope = 0;
  
  for (let i = 0; i < data.length; i++) {
    const absValue = Math.abs(data[i]);
    
    if (absValue > envelope) {
      envelope += (absValue - envelope) / attackSamples;
    } else {
      envelope += (absValue - envelope) / releaseSamples;
    }
    
    envelopeData[i] = envelope;
  }
  
  return envelopeData;
};

/**
 * Calculates note onset times from an audio buffer
 * @param audioBuffer - The audio buffer to analyze
 * @param sensitivity - Sensitivity threshold (0-100)
 * @returns Array of detected onset positions
 */
export const detectOnsets = (audioBuffer: AudioBuffer, sensitivity: number): number[] => {
  const data = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const threshold = (100 - sensitivity) / 1000;
  const onsets: number[] = [];
  
  // Calculate spectral flux over time
  const windowSize = Math.floor(0.02 * sampleRate); // 20ms window
  const hopSize = Math.floor(0.01 * sampleRate); // 10ms hop
  
  let prevSpectrum: number[] = Array(windowSize).fill(0);
  
  for (let i = 0; i < data.length - windowSize; i += hopSize) {
    // Extract window
    const window = data.slice(i, i + windowSize);
    
    // Calculate FFT (simplified version)
    const spectrum: number[] = [];
    for (let j = 0; j < windowSize; j++) {
      spectrum[j] = Math.abs(window[j]); // Simple magnitude approximation
    }
    
    // Calculate spectral flux
    let flux = 0;
    for (let j = 0; j < windowSize; j++) {
      // Only count increases in energy
      const diff = spectrum[j] - prevSpectrum[j];
      flux += diff > 0 ? diff : 0;
    }
    
    // Detection using adaptive threshold
    if (flux > threshold) {
      onsets.push(i / sampleRate);
    }
    
    prevSpectrum = spectrum;
  }
  
  return onsets;
};

// Helper function to calculate average energy in a frequency range
const calculateAverageEnergy = (
  dataArray: Uint8Array,
  startFreq: number,
  endFreq: number
): number => {
  const startBin = Math.floor(startFreq / 22050 * dataArray.length);
  const endBin = Math.floor(endFreq / 22050 * dataArray.length);
  let sum = 0;
  
  for (let i = startBin; i < endBin; i++) {
    sum += dataArray[i];
  }
  
  return sum / (endBin - startBin);
};

// Helper function to calculate spectral centroid
const calculateSpectralCentroid = (
  dataArray: Uint8Array,
  sampleRate: number
): number => {
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < dataArray.length; i++) {
    const frequency = i * sampleRate / (dataArray.length * 2);
    numerator += frequency * dataArray[i];
    denominator += dataArray[i];
  }
  
  return denominator !== 0 ? numerator / denominator : 0;
};

// Helper function to calculate spectral flux
const calculateSpectralFlux = (
  data: Float32Array,
  sampleRate: number
): number => {
  const windowSize = Math.floor(0.02 * sampleRate); // 20ms window
  const hopSize = Math.floor(0.01 * sampleRate); // 10ms hop
  
  let totalFlux = 0;
  let count = 0;
  
  let prevSpectrum: number[] = Array(windowSize).fill(0);
  
  for (let i = 0; i < data.length - windowSize; i += hopSize) {
    // Extract window
    const window = data.slice(i, i + windowSize);
    
    // Calculate FFT (simplified version)
    const spectrum: number[] = [];
    for (let j = 0; j < windowSize; j++) {
      spectrum[j] = Math.abs(window[j]); // Simple magnitude approximation
    }
    
    // Calculate flux
    let flux = 0;
    for (let j = 0; j < windowSize; j++) {
      flux += Math.abs(spectrum[j] - prevSpectrum[j]);
    }
    
    totalFlux += flux / windowSize;
    count++;
    
    prevSpectrum = spectrum;
  }
  
  return count > 0 ? totalFlux / count : 0;
};

// Helper function to calculate attack time
const calculateAttackTime = (
  data: Float32Array,
  sampleRate: number
): number => {
  const threshold = 0.1; // 10% of peak amplitude
  const peakIndex = findPeakIndex(data);
  const peakAmplitude = data[peakIndex];
  
  let attackStart = 0;
  // Find first sample that exceeds threshold
  for (let i = 0; i < peakIndex; i++) {
    if (Math.abs(data[i]) > threshold * peakAmplitude) {
      attackStart = i;
      break;
    }
  }
  
  return (peakIndex - attackStart) / sampleRate;
};

// Helper function to find peak index
const findPeakIndex = (data: Float32Array): number => {
  let maxIndex = 0;
  let maxValue = Math.abs(data[0]);
  
  for (let i = 1; i < data.length; i++) {
    const absValue = Math.abs(data[i]);
    if (absValue > maxValue) {
      maxValue = absValue;
      maxIndex = i;
    }
  }
  
  return maxIndex;
};

// Helper function to calculate harmonicity
const calculateHarmonicity = (dataArray: Uint8Array): number => {
  // Simplified harmonicity calculation
  // Compares energy in expected harmonic bins to total energy
  
  let harmonicEnergy = 0;
  let totalEnergy = 0;
  
  // Find the fundamental frequency (approximation - find first peak)
  let fundamentalBin = 0;
  let maxEnergy = 0;
  for (let i = 1; i < dataArray.length / 8; i++) { // Look only in lower eighth of spectrum
    if (dataArray[i] > maxEnergy) {
      maxEnergy = dataArray[i];
      fundamentalBin = i;
    }
  }
  
  // If we found a fundamental, check harmonics
  if (fundamentalBin > 0) {
    // Check first 10 harmonics
    for (let h = 1; h <= 10; h++) {
      const harmonicBin = h * fundamentalBin;
      if (harmonicBin < dataArray.length) {
        // Allow for slight deviations (+/- 3% of bin width)
        const binWidth = Math.ceil(0.03 * harmonicBin);
        let harmonicPeakEnergy = 0;
        
        for (let i = Math.max(0, harmonicBin - binWidth); 
             i <= Math.min(dataArray.length - 1, harmonicBin + binWidth); i++) {
          harmonicPeakEnergy = Math.max(harmonicPeakEnergy, dataArray[i]);
        }
        
        harmonicEnergy += harmonicPeakEnergy;
      }
    }
  }
  
  // Calculate total energy
  for (let i = 0; i < dataArray.length; i++) {
    totalEnergy += dataArray[i];
  }
  
  return totalEnergy > 0 ? harmonicEnergy / totalEnergy : 0;
};
