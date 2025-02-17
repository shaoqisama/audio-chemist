
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
        <span className="text-sm font-medium">Detection Sensitivity</span>
        <span className="text-sm text-muted-foreground">{sensitivity}%</span>
      </div>
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={[sensitivity]}
        onValueChange={(values) => onSensitivityChange(values[0])}
        max={100}
        step={1}
      >
        <Slider.Track className="bg-secondary relative grow rounded-full h-[3px]">
          <Slider.Range className="absolute bg-primary rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-5 h-5 bg-primary shadow-lg rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Sensitivity"
        />
      </Slider.Root>
      
      <div className="playback-controls">
        <Button
          variant="ghost"
          size="icon"
          className="playback-button"
          onClick={onSkipBack}
        >
          <SkipBack className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="playback-button"
          onClick={onPlayPause}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="playback-button"
          onClick={onSkipForward}
        >
          <SkipForward className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};
