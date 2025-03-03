
import React, { useState } from 'react';
import { Sample } from '@/types/audio';
import { ExportFormat, ExportSettings, exportSample, applyNamingPattern, downloadBlob } from '@/utils/exportUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Copy, Save, FileAudio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

interface ExportDialogProps {
  samples: Sample[];
  onClose: () => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ samples, onClose }) => {
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'wav',
    sampleRate: 44100,
    bitDepth: 16,
    normalization: true,
    namingPattern: '{type}_{index}_{name}'
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  
  const handleFormatChange = (format: ExportFormat) => {
    setExportSettings({ ...exportSettings, format });
  };
  
  const handleSampleRateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setExportSettings({ ...exportSettings, sampleRate: parseInt(e.target.value) });
  };
  
  const handleBitDepthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setExportSettings({ ...exportSettings, bitDepth: parseInt(e.target.value) as 16 | 24 | 32 });
  };
  
  const handleNormalizationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExportSettings({ ...exportSettings, normalization: e.target.checked });
  };
  
  const handleNamingPatternChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExportSettings({ ...exportSettings, namingPattern: e.target.value });
  };
  
  const exportSelectedSamples = async () => {
    if (samples.length === 0) {
      toast({
        title: "No samples selected",
        description: "Please select at least one sample to export",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsExporting(true);
      
      // Export each sample
      for (let i = 0; i < samples.length; i++) {
        const sample = samples[i];
        
        // Update progress
        setExportProgress(Math.round((i / samples.length) * 100));
        
        // Generate filename from pattern
        const filename = applyNamingPattern(
          exportSettings.namingPattern, 
          { 
            name: sample.name, 
            type: sample.type, 
            index: i + 1,
            duration: sample.duration
          }
        ) + '.' + exportSettings.format;
        
        // Export the sample
        const blob = await exportSample(
          sample.buffer,
          sample.start,
          sample.duration,
          exportSettings
        );
        
        // Download the file
        downloadBlob(blob, filename);
        
        // Small delay between downloads to prevent browser issues
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      toast({
        title: "Export Complete",
        description: `Successfully exported ${samples.length} samples`
      });
      
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the samples",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };
  
  const renderNamingPatternPreview = () => {
    if (samples.length === 0) return 'No samples selected';
    
    const sample = samples[0];
    return applyNamingPattern(
      exportSettings.namingPattern,
      { name: sample.name, type: sample.type, index: 1, duration: sample.duration }
    ) + '.' + exportSettings.format;
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileAudio className="h-5 w-5" />
              Export Samples
            </span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
          <CardDescription>
            Exporting {samples.length} {samples.length === 1 ? 'sample' : 'samples'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <div className="flex flex-wrap gap-2">
              {(['wav', 'mp3', 'ogg', 'flac'] as ExportFormat[]).map(format => (
                <Badge
                  key={format}
                  variant={exportSettings.format === format ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleFormatChange(format)}
                >
                  {format.toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sample Rate</label>
              <select 
                value={exportSettings.sampleRate} 
                onChange={handleSampleRateChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value={44100}>44.1 kHz</option>
                <option value={48000}>48 kHz</option>
                <option value={96000}>96 kHz</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Bit Depth</label>
              <select 
                value={exportSettings.bitDepth} 
                onChange={handleBitDepthChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value={16}>16-bit</option>
                <option value={24}>24-bit</option>
                <option value={32}>32-bit</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="normalize"
              checked={exportSettings.normalization}
              onChange={handleNormalizationChange}
              className="rounded border-gray-300"
            />
            <label htmlFor="normalize" className="text-sm">Normalize audio (maximize volume)</label>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Naming Pattern</label>
            <input
              type="text"
              value={exportSettings.namingPattern}
              onChange={handleNamingPatternChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="e.g., {type}_{index}_{name}"
            />
            <div className="text-xs text-muted-foreground">
              Available variables: {'{name}'}, {'{type}'}, {'{index}'}, {'{duration}'}
            </div>
            <div className="text-xs mt-1">
              Preview: <span className="font-mono bg-muted px-1 py-0.5 rounded">{renderNamingPatternPreview()}</span>
            </div>
          </div>
          
          {isExporting && (
            <div className="space-y-2">
              <div className="text-sm">Exporting... {exportProgress}%</div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary rounded-full h-2 transition-all duration-300" 
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={exportSelectedSamples} disabled={isExporting} className="gap-2">
            <Download className="h-4 w-4" />
            Export {samples.length > 0 ? `(${samples.length})` : ''}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
