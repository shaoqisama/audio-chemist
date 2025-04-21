
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
    <Card className="w-full border-none bg-gradient-to-tr from-[#243813dd] via-[#1e2721dd] to-[#2e3a1ed0] shadow-xl backdrop-blur-[3.5px] rounded-2xl ring-2 ring-[#b6e33760] animate-fade-in">
      <CardHeader className="pb-2 pt-4 bg-gradient-to-bl from-[#caff7055] via-transparent to-[#d9fa4a11] rounded-t-xl shadow-sm border-b border-[#b6e33730]">
        <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-[#e1fe82] drop-shadow-glow flex items-center gap-2">
          <span className="inline-block bg-[#2d5324]/70 rounded px-2 border border-[#b6e337] text-[#f8ffb4] shadow-sm animate-fade-in">Playback</span>
          <span>Controls</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center space-x-3 sm:space-x-6 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:h-12 sm:w-12 rounded-full bg-[#2b3723]/80 border border-[#b6e33770] shadow-lg hover:bg-[#5af77a33] hover:scale-105 transition duration-150"
            onClick={onSkipBack}
          >
            <SkipBack className="h-5 w-5 sm:h-7 sm:w-7 text-[#fcf196]" />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="h-12 w-12 sm:h-16 sm:w-16 rounded-full shadow-xl border-2 border-[#ffe600] bg-gradient-to-br from-[#cbff6c] via-[#ffe600] to-[#6ee7b7] hover:scale-105 transition"
            onClick={onPlayPause}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 sm:h-8 sm:w-8 text-[#18381d]" />
            ) : (
              <Play className="h-6 w-6 sm:h-8 sm:w-8 text-[#18381d] ml-0.5 sm:ml-1" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:h-12 sm:w-12 rounded-full bg-[#2b3723]/80 border border-[#b6e33770] shadow-lg hover:bg-[#5af77a33] hover:scale-105 transition duration-150"
            onClick={onSkipForward}
          >
            <SkipForward className="h-5 w-5 sm:h-7 sm:w-7 text-[#fcf196]" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
