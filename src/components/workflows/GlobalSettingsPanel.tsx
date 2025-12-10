import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlobalSettingsPanelProps {
  onClose: () => void;
  preventInfiniteLoops: boolean;
  onPreventInfiniteLoopsChange: (value: boolean) => void;
}

export function GlobalSettingsPanel({ 
  onClose, 
  preventInfiniteLoops, 
  onPreventInfiniteLoopsChange 
}: GlobalSettingsPanelProps) {
  return (
    <div className="w-[400px] border-l border-border bg-card flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold">Global settings</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Info Box */}
        <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg border border-border">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            To disable a workflow, disconnect the start node.
          </p>
        </div>

        {/* Prevent Infinite Loops Toggle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="prevent-loops" className="text-sm font-medium">
                Prevent infinite loops
              </Label>
              <p className="text-xs text-muted-foreground">
                Prevents the workflow from continuously transiting in a loop when all conditions are true.
              </p>
            </div>
            <Switch
              id="prevent-loops"
              checked={preventInfiniteLoops}
              onCheckedChange={onPreventInfiniteLoopsChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
