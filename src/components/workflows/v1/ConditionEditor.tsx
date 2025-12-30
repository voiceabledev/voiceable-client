import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import type { ConditionConfig } from "@/types/workflow-v1";

interface ConditionEditorProps {
  config: ConditionConfig;
  onUpdate: (config: ConditionConfig) => void;
}

export function ConditionEditor({ config, onUpdate }: ConditionEditorProps) {
  const [conditions, setConditions] = useState(config.conditions || []);
  const [forceSelection, setForceSelection] = useState(config.forceSelection || false);

  const handleAddCondition = () => {
    const newCondition = {
      id: Date.now().toString(),
      expression: "Go down this path if test"
    };
    const updated = [...conditions, newCondition];
    setConditions(updated);
    onUpdate({ ...config, conditions: updated, forceSelection });
  };

  const handleRemoveCondition = (id: string) => {
    const updated = conditions.filter(c => c.id !== id);
    setConditions(updated);
    onUpdate({ ...config, conditions: updated, forceSelection });
  };

  const handleConditionChange = (id: string, expression: string) => {
    const updated = conditions.map(c =>
      c.id === id ? { ...c, expression } : c
    );
    setConditions(updated);
    onUpdate({ ...config, conditions: updated, forceSelection });
  };

  const handleForceSelectionChange = (checked: boolean) => {
    setForceSelection(checked);
    onUpdate({ ...config, conditions, forceSelection: checked });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Force the agent to select a branch</Label>
        <Switch
          checked={forceSelection}
          onCheckedChange={handleForceSelectionChange}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        If disabled, the agent will stop the task if none of the conditions are met.
      </p>

      <div className="space-y-3">
        {conditions.map((condition, index) => (
          <div key={condition.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Condition {index + 1}</Label>
              {conditions.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemoveCondition(condition.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Input
              value={condition.expression}
              onChange={(e) => handleConditionChange(condition.id, e.target.value)}
              placeholder="Go down this path if..."
              className="bg-secondary/50"
            />
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleAddCondition}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Condition
      </Button>

      <p className="text-xs text-muted-foreground">
        Please define each condition. The agent will follow the first path which condition is met. Add examples to improve performance.
      </p>
    </div>
  );
}

