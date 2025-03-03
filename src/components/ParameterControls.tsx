
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { SlidersHorizontal, Wand } from "lucide-react";

interface ParameterControlsProps {
  sensitivity: number;
  attack: number;
  release: number;
  threshold: number;
  minLength: number;
  onSensitivityChange: (value: number) => void;
  onAttackChange: (value: number) => void;
  onReleaseChange: (value: number) => void;
  onThresholdChange: (value: number) => void;
  onMinLengthChange: (value: number) => void;
  onAutomaticSettings: () => void;
}

export function ParameterControls({
  sensitivity,
  attack,
  release,
  threshold,
  minLength,
  onSensitivityChange,
  onAttackChange,
  onReleaseChange,
  onThresholdChange,
  onMinLengthChange,
  onAutomaticSettings
}: ParameterControlsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Analysis Parameters</CardTitle>
            <CardDescription>Fine-tune detection settings</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAutomaticSettings}
            className="flex items-center gap-1"
          >
            <Wand className="h-3.5 w-3.5" />
            <span>Auto</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Detection Sensitivity</label>
                <span className="text-xs text-muted-foreground">{sensitivity}%</span>
              </div>
              <Slider
                value={[sensitivity]}
                onValueChange={(values) => onSensitivityChange(values[0])}
                max={100}
                step={1}
              />
            </div>
          </TabsContent>
          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Attack (ms)</label>
                <span className="text-xs text-muted-foreground">{attack} ms</span>
              </div>
              <Slider
                value={[attack]}
                onValueChange={(values) => onAttackChange(values[0])}
                min={1}
                max={100}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Release (ms)</label>
                <span className="text-xs text-muted-foreground">{release} ms</span>
              </div>
              <Slider
                value={[release]}
                onValueChange={(values) => onReleaseChange(values[0])}
                min={10}
                max={500}
                step={10}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Threshold</label>
                <span className="text-xs text-muted-foreground">{threshold.toFixed(2)}</span>
              </div>
              <Slider
                value={[threshold]}
                onValueChange={(values) => onThresholdChange(values[0])}
                min={0.01}
                max={0.5}
                step={0.01}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Min Sample Length (ms)</label>
                <span className="text-xs text-muted-foreground">{minLength} ms</span>
              </div>
              <Slider
                value={[minLength]}
                onValueChange={(values) => onMinLengthChange(values[0])}
                min={10}
                max={500}
                step={10}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
