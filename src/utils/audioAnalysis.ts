
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
  
  return {
    lowFreq: calculateAverageEnergy(dataArray, 0, 200),      // 0-200 Hz
    midFreq: calculateAverageEnergy(dataArray, 200, 2000),   // 200-2000 Hz
    highFreq: calculateAverageEnergy(dataArray, 2000, 20000) // 2000-20000 Hz
  };
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
