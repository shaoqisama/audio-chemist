
import * as Slider from '@radix-ui/react-slider';
import { Button } from './ui/button';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface ControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  sensitivity: number;
  onSensitivityChange: (value: number) => void;
}

export const Controls = ({
  isPlaying,
  onPlayPause,
  onSkipBack,
  onSkipForward,
  sensitivity,
  onSensitivityChange,
}: ControlsProps) => {
  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Playback Controls</span>
      </div>
      
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={onSkipBack}
        >
          <SkipBack className="h-6 w-6" />
        </Button>
        <Button
          variant="default"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={onPlayPause}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-1" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={onSkipForward}
        >
          <SkipForward className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};
