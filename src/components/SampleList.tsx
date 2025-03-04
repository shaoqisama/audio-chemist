import { useState, useEffect } from 'react';
import { Sample } from '../types/audio';
import { Button } from './ui/button';
import { Check, Scissors, Merge, Play, Heart, Pencil, Tag, Download } from 'lucide-react';
import { Badge } from './ui/badge';
import { toast } from './ui/use-toast';
import { ExportDialog } from './ExportDialog';
import { TagInput } from './TagInput';
import { SearchBar, SearchFilters } from './SearchBar';

interface SampleListProps {
  samples: Sample[];
  onSampleClick: (sample: Sample) => void;
  onSampleMerge?: (samples: Sample[]) => void;
  onSampleSplit?: (sample: Sample, position: number) => void;
  onSampleRename?: (sample: Sample, newName: string) => void;
  onSampleUpdate?: (sample: Sample) => void;
}

export const SampleList = ({ 
  samples, 
  onSampleClick,
  onSampleMerge,
  onSampleSplit,
  onSampleRename,
  onSampleUpdate
}: SampleListProps) => {
  const [selectedSamples, setSelectedSamples] = useState<string[]>([]);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [filteredSamples, setFilteredSamples] = useState<Sample[]>(samples);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    types: {},
    tags: [],
    favorites: false
  });
  
  const [commonTags, setCommonTags] = useState<string[]>([]);

  useEffect(() => {
    applySearchFilters(searchQuery, searchFilters);
    
    const allTags = new Set<string>();
    samples.forEach(sample => {
      sample.tags?.forEach(tag => allTags.add(tag));
    });
    setCommonTags(Array.from(allTags));
  }, [samples]);

  const applySearchFilters = (query: string, filters: SearchFilters) => {
    let filtered = [...samples];
    
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(sample => 
        sample.name.toLowerCase().includes(lowercaseQuery) ||
        sample.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    }
    
    const activeTypes = Object.entries(filters.types)
      .filter(([_, isActive]) => isActive)
      .map(([type]) => type);
      
    if (activeTypes.length > 0) {
      filtered = filtered.filter(sample => activeTypes.includes(sample.type));
    }
    
    if (filters.tags.length > 0) {
      filtered = filtered.filter(sample => 
        filters.tags.some(tag => sample.tags?.includes(tag))
      );
    }
    
    if (filters.favorites) {
      filtered = filtered.filter(sample => sample.favorite);
    }
    
    setFilteredSamples(filtered);
    setSearchQuery(query);
    setSearchFilters(filters);
  };

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

  const handleTagEdit = (sample: Sample) => {
    setEditingTags(sample.id);
  };

  const handleTagUpdate = (sample: Sample, newTags: string[]) => {
    if (onSampleUpdate) {
      onSampleUpdate({
        ...sample,
        tags: newTags
      });
    }
  };

  const handleToggleFavorite = (sample: Sample) => {
    if (onSampleUpdate) {
      onSampleUpdate({
        ...sample,
        favorite: !sample.favorite
      });
    }
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
    <div className="flex flex-col space-y-2 max-h-[calc(100vh-172px)] md:max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin p-2 sm:p-4">
      <SearchBar onSearch={applySearchFilters} />
      
      {searchQuery || Object.values(searchFilters.types).some(Boolean) || searchFilters.favorites ? (
        <div className="text-sm text-muted-foreground">
          Found {filteredSamples.length} samples
          <Button 
            variant="link" 
            className="px-1 h-auto" 
            onClick={() => applySearchFilters('', { types: {}, tags: [], favorites: false })}
          >
            Clear filters
          </Button>
        </div>
      ) : null}
      
      {selectedSamples.length > 0 && (
        <div className="flex items-center justify-between bg-secondary/80 p-2 rounded-md mb-2">
          <span className="text-sm">{selectedSamples.length} selected</span>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedSamples([])}
              className="text-xs"
            >
              Clear
            </Button>
            {onSampleMerge && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleMergeSamples}
                className="flex items-center gap-1 text-xs"
              >
                <Merge className="h-3 w-3" />
                <span className="hidden sm:inline">Merge</span>
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={handleExportClick}
              className="flex items-center gap-1 text-xs"
            >
              <Download className="h-3 w-3" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
      )}
      
      {filteredSamples.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
          <p>No samples found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSamples.map((sample) => (
            <div
              key={sample.id}
              className={`sample-item bg-card border rounded-md p-2 sm:p-3 ${selectedSamples.includes(sample.id) ? 'ring-2 ring-primary' : ''}`}
            >
              <div className="flex items-start w-full space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 mt-0.5"
                  onClick={() => handleSelectSample(sample.id)}
                >
                  {selectedSamples.includes(sample.id) ? (
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  ) : (
                    <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-sm border border-muted-foreground" />
                  )}
                </Button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    {isRenaming === sample.id ? (
                      <div className="flex items-center space-x-2 w-full">
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
                      <h3 className="font-medium truncate flex items-center text-sm sm:text-base">
                        {sample.name}
                        <Button
                          variant="ghost" 
                          size="icon"
                          className={`h-6 w-6 ml-1 ${sample.favorite ? 'text-red-500' : ''}`}
                          onClick={() => handleToggleFavorite(sample)}
                        >
                          <Heart className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${sample.favorite ? 'fill-current' : ''}`} />
                        </Button>
                      </h3>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center text-xs space-x-2 mt-1">
                    <Badge variant="outline" className={`text-xs ${getTypeColor(sample.type)}`}>
                      {sample.type}
                    </Badge>
                    <span className="text-muted-foreground">{sample.duration.toFixed(2)}s</span>
                  </div>
                  
                  {editingTags === sample.id ? (
                    <div className="mt-2">
                      <TagInput 
                        tags={sample.tags || []}
                        onChange={(newTags) => handleTagUpdate(sample, newTags)}
                        suggestions={commonTags}
                      />
                      <div className="flex justify-end mt-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditingTags(null)}
                          className="text-xs"
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {sample.tags?.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {(!sample.tags || sample.tags.length === 0) && (
                        <span className="text-xs text-muted-foreground">No tags</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-1">
                  <Button
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onSampleClick(sample)}
                    title="Play"
                  >
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                  
                  {onSampleRename && (
                    <Button
                      variant="ghost" 
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleRename(sample)}
                      title="Rename"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleTagEdit(sample)}
                    title="Edit tags"
                  >
                    <Tag className="h-3.5 w-3.5" />
                  </Button>
                  
                  <Button
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      setSelectedSamples([sample.id]);
                      setShowExportDialog(true);
                    }}
                    title="Export"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
