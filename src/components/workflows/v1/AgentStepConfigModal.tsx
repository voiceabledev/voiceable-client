import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentStepConfig, ActionType } from "@/types/workflow-v1";
import { agentsApi } from "@/lib/api";
import type { Agent } from "@/lib/api";
import { AddActionModal } from "./AddActionModal";

interface AgentStepConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: AgentStepConfig) => void;
  initialConfig?: AgentStepConfig;
}

export function AgentStepConfigModal({
  isOpen,
  onClose,
  onSave,
  initialConfig
}: AgentStepConfigModalProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [isAddActionOpen, setIsAddActionOpen] = useState(false);
  
  const [config, setConfig] = useState<AgentStepConfig>({
    agentId: initialConfig?.agentId || "",
    prompt: initialConfig?.prompt || "",
    model: initialConfig?.model || "Default - Currently Gemini 3.0 Flash",
    askForConfirmation: initialConfig?.askForConfirmation || "never",
    skills: initialConfig?.skills || [],
    exitConditions: initialConfig?.exitConditions || []
  });

  useEffect(() => {
    if (isOpen) {
      setLoadingAgents(true);
      agentsApi.list()
        .then(response => {
          if (response.data && Array.isArray(response.data)) {
            setAgents(response.data);
          }
        })
        .catch(err => {
          console.error("Failed to fetch agents:", err);
        })
        .finally(() => {
          setLoadingAgents(false);
        });
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!config.agentId || !config.prompt.trim()) {
      return;
    }
    onSave(config);
    onClose();
  };

  const handleAddSkill = (actionType: ActionType) => {
    const newSkill = {
      id: `skill-${Date.now()}`,
      type: actionType,
      name: actionType.replace(/-/g, " "),
      config: {}
    };
    setConfig({
      ...config,
      skills: [...(config.skills || []), newSkill]
    });
    setIsAddActionOpen(false);
  };

  const handleRemoveSkill = (skillId: string) => {
    setConfig({
      ...config,
      skills: (config.skills || []).filter(s => s.id !== skillId)
    });
  };

  const handleAddExitCondition = () => {
    const newCondition = {
      id: `exit-${Date.now()}`,
      condition: ""
    };
    setConfig({
      ...config,
      exitConditions: [...(config.exitConditions || []), newCondition]
    });
  };

  const handleUpdateExitCondition = (id: string, condition: string) => {
    setConfig({
      ...config,
      exitConditions: (config.exitConditions || []).map(ec =>
        ec.id === id ? { ...ec, condition } : ec
      )
    });
  };

  const handleRemoveExitCondition = (id: string) => {
    setConfig({
      ...config,
      exitConditions: (config.exitConditions || []).filter(ec => ec.id !== id)
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Agent Step</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Let AI decide what to do, until an exit condition is met.
            </p>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {/* Agent Selector */}
            <div>
              <Label className="text-sm font-medium">Agent (required)</Label>
              <Select
                value={config.agentId}
                onValueChange={(value) => setConfig({ ...config, agentId: value })}
                disabled={loadingAgents}
              >
                <SelectTrigger className="mt-2 bg-secondary/50">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prompt */}
            <div>
              <Label className="text-sm font-medium">Prompt (required)</Label>
              <Textarea
                value={config.prompt}
                onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
                placeholder="You are a polite customer support agent. Your job is to help the customer."
                className={cn(
                  "mt-2 bg-secondary/50 min-h-[120px]",
                  "focus:border-purple-500 focus:ring-purple-500"
                )}
              />
            </div>

            {/* Model */}
            <div>
              <Label className="text-sm font-medium">Model (required)</Label>
              <Select
                value={config.model}
                onValueChange={(value) => setConfig({ ...config, model: value })}
              >
                <SelectTrigger className="mt-2 bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Default - Currently Gemini 3.0 Flash">
                    Default - Currently Gemini 3.0 Flash
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ask for Confirmation */}
            <div>
              <Label className="text-sm font-medium">Ask for Confirmation (required)</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Require this agent step to ask for confirmation before using any skills with side effects
              </p>
              <Select
                value={config.askForConfirmation}
                onValueChange={(value: any) => setConfig({ ...config, askForConfirmation: value })}
              >
                <SelectTrigger className="mt-2 bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="always">Always</SelectItem>
                  <SelectItem value="on-side-effects">On Side Effects</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Skills */}
            <div>
              <Label className="text-sm font-medium">Skills</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Add actions for this agent to access when needed.
              </p>
              <div className="space-y-2 mt-2">
                {(config.skills || []).map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{skill.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveSkill(skill.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddActionOpen(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add skill
                </Button>
              </div>
            </div>

            {/* Exit Conditions */}
            <div>
              <Label className="text-sm font-medium">Exit Conditions</Label>
              <div className="space-y-2 mt-2">
                {(config.exitConditions || []).map((condition) => (
                  <div
                    key={condition.id}
                    className="flex items-center gap-2 p-3 border border-border rounded-lg"
                  >
                    <Input
                      value={condition.condition}
                      onChange={(e) => handleUpdateExitCondition(condition.id, e.target.value)}
                      placeholder="Exit condition..."
                      className="flex-1 bg-secondary/50"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveExitCondition(condition.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddExitCondition}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add exit condition
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!config.agentId || !config.prompt.trim()}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddActionModal
        isOpen={isAddActionOpen}
        onClose={() => setIsAddActionOpen(false)}
        onSelect={handleAddSkill}
      />
    </>
  );
}

