
export interface Sample {
  id: string;
  name: string;
  type: 'kick' | 'snare' | 'hihat' | 'melody' | 'bass' | 'other';
  start: number;
  duration: number;
  buffer: AudioBuffer;
}

export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  sensitivity: number;
}
