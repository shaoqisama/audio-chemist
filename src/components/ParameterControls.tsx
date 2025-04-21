
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
import { Wand } from "lucide-react";

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
    <Card className="border-none bg-gradient-to-bl from-[#222c19dd] via-[#32471ad0] to-[#5ebd3477] shadow-2xl backdrop-blur [3.5px] rounded-2xl ring-2 ring-[#99fa2f46] animate-fade-in">
      <CardHeader className="pb-3 bg-gradient-to-tr from-[#cbff6c88] via-transparent to-[#fffec011] rounded-t-xl shadow-sm border-b border-[#b6e33740]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-[#eeffbb] tracking-tight drop-shadow-glow">
              <span className="pr-2 bg-[#25381b]/80 border border-[#afde35] rounded text-[#dffe62] shadow-lg">Analysis</span>Parameters
            </CardTitle>
            <CardDescription className="text-[#f3f1bd] opacity-70 font-semibold">Fine-tune detection settings</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAutomaticSettings}
            className="flex items-center gap-1 border-[#c9f631] text-[#caff70] bg-[#233813]/70 hover:bg-[#2c521d] hover:border-[#ffe600] shadow"
          >
            <Wand className="h-3.5 w-3.5" />
            <span>Auto</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-[#223a1998] border border-[#beff8570] shadow rounded">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[#deff78]">Detection Sensitivity</label>
                <span className="text-xs text-[#fffec0]">{sensitivity}%</span>
              </div>
              <Slider
                value={[sensitivity]}
                onValueChange={(values) => onSensitivityChange(values[0])}
                max={100}
                step={1}
                className="accent-[#deff78]"
              />
              <p className="text-xs text-[#fffec0bb]">Controls the sensitivity of sample detection algorithm. Higher values detect more samples.</p>
            </div>
          </TabsContent>
          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[#deff78]">Attack (ms)</label>
                <span className="text-xs text-[#fffec0]">{attack} ms</span>
              </div>
              <Slider
                value={[attack]}
                onValueChange={(values) => onAttackChange(values[0])}
                min={1}
                max={100}
                step={1}
                className="accent-[#cbff6c]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[#deff78]">Release (ms)</label>
                <span className="text-xs text-[#fffec0]">{release} ms</span>
              </div>
              <Slider
                value={[release]}
                onValueChange={(values) => onReleaseChange(values[0])}
                min={10}
                max={500}
                step={10}
                className="accent-[#cbff6c]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[#deff78]">Threshold</label>
                <span className="text-xs text-[#fffec0]">{threshold.toFixed(2)}</span>
              </div>
              <Slider
                value={[threshold]}
                onValueChange={(values) => onThresholdChange(values[0])}
                min={0.01}
                max={0.5}
                step={0.01}
                className="accent-[#ffe600]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[#deff78]">Min Sample Length (ms)</label>
                <span className="text-xs text-[#fffec0]">{minLength} ms</span>
              </div>
              <Slider
                value={[minLength]}
                onValueChange={(values) => onMinLengthChange(values[0])}
                min={10}
                max={500}
                step={10}
                className="accent-[#ffe600]"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
