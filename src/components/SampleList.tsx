
import { Sample } from '../types/audio';

interface SampleListProps {
  samples: Sample[];
  onSampleClick: (sample: Sample) => void;
}

export const SampleList = ({ samples, onSampleClick }: SampleListProps) => {
  return (
    <div className="flex flex-col space-y-2 h-full overflow-y-auto p-4">
      {samples.map((sample, index) => (
        <div
          key={index}
          className="sample-item"
          onClick={() => onSampleClick(sample)}
        >
          <div className="flex-1">
            <h3 className="font-medium">{sample.name}</h3>
            <p className="text-sm text-muted-foreground">
              {sample.type} - {sample.duration.toFixed(2)}s
            </p>
          </div>
          <div className="w-24 h-12 bg-secondary rounded relative overflow-hidden">
            {/* Placeholder for mini waveform visualization */}
            <div 
              className="absolute inset-0 bg-primary/20"
              style={{
                clipPath: 'polygon(0 50%, 20% 20%, 40% 60%, 60% 40%, 80% 70%, 100% 30%)'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
