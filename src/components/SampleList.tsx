
import { useState } from 'react';
import { Sample } from '../types/audio';
import { Button } from './ui/button';
import { Check, Scissors, Merge, Play, Flag, Pencil, Tag, Download } from 'lucide-react';
import { Badge } from './ui/badge';
import { toast } from './ui/use-toast';
import { ExportDialog } from './ExportDialog';

interface SampleListProps {
  samples: Sample[];
  onSampleClick: (sample: Sample) => void;
  onSampleMerge?: (samples: Sample[]) => void;
  onSampleSplit?: (sample: Sample, position: number) => void;
  onSampleRename?: (sample: Sample, newName: string) => void;
}

export const SampleList = ({ 
  samples, 
  onSampleClick,
  onSampleMerge,
  onSampleSplit,
  onSampleRename
}: SampleListProps) => {
  const [selectedSamples, setSelectedSamples] = useState<string[]>([]);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);

  const handleSelectSample = (id: string) => {
    setSelectedSamples(prev => {
      if (prev.includes(id)) {
        return prev.filter(sampleId => sampleId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleMergeSamples = () => {
    if (selectedSamples.length < 2) {
      toast({
        title: "Selection Error",
        description: "Select at least two samples to merge",
        variant: "destructive"
      });
      return;
    }

    const samplesToMerge = samples.filter(sample => 
      selectedSamples.includes(sample.id)
    );
    
    if (onSampleMerge) {
      onSampleMerge(samplesToMerge);
      setSelectedSamples([]);
    }
  };

  const handleRename = (sample: Sample) => {
    setIsRenaming(sample.id);
    setRenameValue(sample.name);
  };

  const submitRename = (sample: Sample) => {
    if (onSampleRename && renameValue.trim()) {
      onSampleRename(sample, renameValue);
    }
    setIsRenaming(null);
  };

  const handleExportClick = () => {
    if (selectedSamples.length === 0) {
      toast({
        title: "Selection Required",
        description: "Select at least one sample to export",
      });
      return;
    }
    setShowExportDialog(true);
  };

  const getSelectedSamples = () => {
    return samples.filter(sample => selectedSamples.includes(sample.id));
  };

  const getTypeColor = (type: Sample['type']) => {
    switch (type) {
      case 'kick': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'snare': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'hihat': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'melody': return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      case 'bass': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  return (
    <div className="flex flex-col space-y-2 h-full overflow-y-auto p-4">
      {selectedSamples.length > 0 && (
        <div className="flex items-center justify-between bg-secondary/80 p-2 rounded-md mb-2">
          <span className="text-sm">{selectedSamples.length} selected</span>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedSamples([])}
            >
              Clear
            </Button>
            {onSampleMerge && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleMergeSamples}
                className="flex items-center gap-1"
              >
                <Merge className="h-3.5 w-3.5" />
                <span>Merge</span>
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={handleExportClick}
              className="flex items-center gap-1"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </Button>
          </div>
        </div>
      )}
      
      {samples.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
          <p>No samples detected</p>
          <p className="text-sm">Upload audio to start analyzing</p>
        </div>
      ) : (
        samples.map((sample) => (
          <div
            key={sample.id}
            className={`sample-item ${selectedSamples.includes(sample.id) ? 'ring-2 ring-primary' : ''}`}
          >
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleSelectSample(sample.id)}
              >
                {selectedSamples.includes(sample.id) ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <div className="h-4 w-4 rounded-sm border border-muted-foreground" />
                )}
              </Button>
              
              <div className="flex-1 min-w-0">
                {isRenaming === sample.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="bg-background border border-input rounded px-2 py-1 text-sm w-full"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') submitRename(sample);
                        if (e.key === 'Escape') setIsRenaming(null);
                      }}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => submitRename(sample)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <h3 className="font-medium truncate">{sample.name}</h3>
                )}
                <div className="flex items-center text-sm space-x-2">
                  <Badge variant="outline" className={`${getTypeColor(sample.type)}`}>
                    {sample.type}
                  </Badge>
                  <span className="text-muted-foreground">{sample.duration.toFixed(2)}s</span>
                </div>
              </div>
              
              <div className="flex space-x-1">
                <Button
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onSampleClick(sample)}
                >
                  <Play className="h-4 w-4" />
                </Button>
                
                {onSampleRename && (
                  <Button
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleRename(sample)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                
                <Button
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setSelectedSamples([sample.id]);
                    setShowExportDialog(true);
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))
      )}

      {showExportDialog && (
        <ExportDialog
          samples={getSelectedSamples()}
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </div>
  );
};
