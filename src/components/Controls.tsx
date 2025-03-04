
import { Button } from './ui/button';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

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
}: ControlsProps) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-sm sm:text-base">Playback Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center space-x-2 sm:space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-10 sm:w-10"
            onClick={onSkipBack}
          >
            <SkipBack className="h-4 w-4 sm:h-6 sm:w-6" />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full"
            onClick={onPlayPause}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 sm:h-6 sm:w-6" />
            ) : (
              <Play className="h-4 w-4 sm:h-6 sm:w-6 ml-0.5 sm:ml-1" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-10 sm:w-10"
            onClick={onSkipForward}
          >
            <SkipForward className="h-4 w-4 sm:h-6 sm:w-6" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
