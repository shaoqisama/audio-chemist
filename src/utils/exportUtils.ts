
/**
 * Utility functions for exporting audio samples in different formats
 */

/**
 * Available export formats
 */
export type ExportFormat = 'wav' | 'mp3' | 'ogg' | 'flac';

/**
 * Export settings interface
 */
export interface ExportSettings {
  format: ExportFormat;
  sampleRate?: number;
  bitDepth?: 16 | 24 | 32;
  normalization?: boolean;
  namingPattern: string; // e.g., "{type}_{index}_{name}"
}

/**
 * Export a single audio sample
 */
export const exportSample = async (
  audioBuffer: AudioBuffer,
  startTime: number,
  duration: number,
  settings: ExportSettings,
  customName?: string
): Promise<Blob> => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Create a new buffer for the sample
  const sampleLength = Math.floor(duration * audioBuffer.sampleRate);
  const exportBuffer = audioContext.createBuffer(
    audioBuffer.numberOfChannels,
    sampleLength,
    settings.sampleRate || audioBuffer.sampleRate
  );
  
  // Copy the sample data
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const sourceData = audioBuffer.getChannelData(channel);
    const destData = exportBuffer.getChannelData(channel);
    
    // Calculate start position in samples
    const startSample = Math.floor(startTime * audioBuffer.sampleRate);
    
    // Copy the data
    for (let i = 0; i < sampleLength; i++) {
      if (startSample + i < sourceData.length) {
        destData[i] = sourceData[startSample + i];
      }
    }
  }
  
  // Apply normalization if needed
  if (settings.normalization) {
    normalizeAudioBuffer(exportBuffer);
  }
  
  // Convert to the requested format
  return encodeAudioBuffer(exportBuffer, settings.format);
};

/**
 * Normalize audio data to peak at 0dB
 */
const normalizeAudioBuffer = (buffer: AudioBuffer) => {
  // Find the maximum amplitude across all channels
  let maxAmplitude = 0;
  
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < data.length; i++) {
      const abs = Math.abs(data[i]);
      if (abs > maxAmplitude) {
        maxAmplitude = abs;
      }
    }
  }
  
  // Don't normalize if the max amplitude is already at or near maximum
  if (maxAmplitude >= 0.99) return;
  
  // Normalize all channels
  const scaleFactor = 1.0 / maxAmplitude;
  
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < data.length; i++) {
      data[i] = data[i] * scaleFactor;
    }
  }
};

/**
 * Encode AudioBuffer to specified format
 */
const encodeAudioBuffer = async (buffer: AudioBuffer, format: ExportFormat): Promise<Blob> => {
  // For now, we're always using WAV format because browser
  // support for encoding to other formats requires additional libraries
  // In a production app, you would integrate encoders for mp3, ogg, etc.
  return encodeWAV(buffer);
};

/**
 * Encode AudioBuffer to WAV format
 */
const encodeWAV = (buffer: AudioBuffer): Blob => {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2; // 16-bit samples
  const sampleRate = buffer.sampleRate;
  const bitsPerSample = 16;
  
  // Create the WAV header
  const buffer1 = new ArrayBuffer(44 + length);
  const view = new DataView(buffer1);
  
  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  
  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // format (PCM)
  view.setUint16(22, numOfChan, true); // channels
  view.setUint32(24, sampleRate, true); // sample rate
  view.setUint32(28, sampleRate * numOfChan * 2, true); // byte rate
  view.setUint16(32, numOfChan * 2, true); // block align
  view.setUint16(34, bitsPerSample, true); // bits per sample
  
  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);
  
  // Write the audio data
  const channelData = [];
  for (let i = 0; i < numOfChan; i++) {
    channelData.push(buffer.getChannelData(i));
  }
  
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numOfChan; channel++) {
      // Apply 16-bit clipping
      const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
      const sample16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, sample16, true);
      offset += 2;
    }
  }
  
  return new Blob([buffer1], { type: 'audio/wav' });
};

/**
 * Helper function to write strings to DataView
 */
const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

/**
 * Apply naming pattern to create a filename
 */
export const applyNamingPattern = (
  pattern: string,
  sample: {
    name: string;
    type: string;
    index?: number;
    duration?: number;
  }
): string => {
  return pattern
    .replace(/{name}/g, sample.name.replace(/[^\w\s-]/g, ''))
    .replace(/{type}/g, sample.type)
    .replace(/{index}/g, sample.index?.toString() || '')
    .replace(/{duration}/g, sample.duration?.toFixed(2) || '')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_');
};

/**
 * Download a blob as a file
 */
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};
