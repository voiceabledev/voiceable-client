import React, { useState } from "react";
import { ArrowRight, Bot, Loader2, Save } from "lucide-react";
import { cn } from "../../lib/utils";
import type { AgentFunction, ToolInChain } from "@/types/functions";
import { getIntegrationIcon } from "@/constants/assistant";
import { EditableWorkflow } from "../workflows/EditableWorkflow";
import { WorkflowTriggerEditor } from "../workflows/WorkflowTriggerEditor";
import { Button } from "../ui/button";
import { agentFunctionsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type IntegrationFunctionCardProps = {
  agentFunction: AgentFunction;
  agentId?: string;
  onWorkflowUpdate?: () => void;
  onConfigureCredentials?: (integrationType: string) => void;
};

const getToolIcon = (toolType: string): string => {
  const icons: Record<string, string> = {
    twilio: "📱",
    pipedrive: "🔷",
    calendly: "📅",
    hubspot: "🟠",
    salesforce: "☁️",
    google_calendar: "📆",
    outlook_calendar: "📧",
    calcom: "📅",
  };
  return icons[toolType] || getIntegrationIcon(toolType) || "🔧";
};

const getToolDisplayName = (tool: { type: string; role: string; method?: string }): string => {
  // Special case: Twilio SMS should just show "SMS"
  if (tool.type === "twilio" && tool.method === "sms") {
    return "SMS";
  }

  if (tool.method) {
    return `${tool.type} ${tool.method.toUpperCase()}`;
  }
  return tool.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export const IntegrationFunctionCard: React.FC<IntegrationFunctionCardProps> = ({
  agentFunction,
  agentId,
  onWorkflowUpdate,
  onConfigureCredentials,
}) => {
  const { function: func, enabled } = agentFunction;
  const name = agentFunction.workflow_name || func?.name || "Unnamed Workflow";
  const description = agentFunction.workflow_description || func?.description;
  const { toast } = useToast();

  const [triggerPhrases, setTriggerPhrases] = useState<string[]>(agentFunction.trigger_phrases || []);
  const [isSavingPhrases, setIsSavingPhrases] = useState(false);
  const [hasUnsavedPhrases, setHasUnsavedPhrases] = useState(false);

  const handleToolChainUpdate = async (newToolChain: ToolInChain[]) => {
    if (!agentId) return;

    try {
      await agentFunctionsApi.updateToolChain(agentId, agentFunction.id, newToolChain);
      toast({
        title: "Workflow updated",
        description: "Tool chain has been updated successfully.",
      });
      if (onWorkflowUpdate) {
        onWorkflowUpdate();
      }
    } catch (error) {
      console.error("Failed to update tool chain:", error);
      toast({
        title: "Error",
        description: "Failed to update workflow. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePhrasesChange = (newPhrases: string[]) => {
    setTriggerPhrases(newPhrases);
    setHasUnsavedPhrases(true);
  };

  const handleSavePhrases = async () => {
    if (!agentId) return;

    setIsSavingPhrases(true);
    try {
      await agentFunctionsApi.updateWorkflowConfig(agentId, agentFunction.id, {
        trigger_phrases: triggerPhrases
      });

      toast({
        title: "Triggers updated",
        description: "Workflow trigger phrases have been updated.",
      });
      setHasUnsavedPhrases(false);
      if (onWorkflowUpdate) {
        onWorkflowUpdate();
      }
    } catch (error) {
      console.error("Failed to update trigger phrases:", error);
      toast({
        title: "Error",
        description: "Failed to update trigger phrases.",
        variant: "destructive",
      });
    } finally {
      setIsSavingPhrases(false);
    }
  };

  return (
    <div
      className={cn(
        "border border-border rounded-lg p-4 transition-colors",
        enabled ? "bg-primary/5 border-primary/20" : "bg-secondary/30"
      )}
    >
      <div className="flex flex-col gap-4">
        {/* Trigger Phrases Editor */}
        <div className="bg-secondary/20 p-4 rounded-lg border border-border">
          <WorkflowTriggerEditor
            triggerPhrases={triggerPhrases}
            onPhrasesChange={handlePhrasesChange}
          />

          {hasUnsavedPhrases && (
            <div className="flex justify-end mt-3">
              <Button
                size="sm"
                onClick={handleSavePhrases}
                disabled={isSavingPhrases}
              >
                {isSavingPhrases ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Trigger Phrases
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Editable Tool Chain Visualization */}
        <div>
          <EditableWorkflow
            agentFunction={agentFunction}
            agentId={agentId || ""}
            onToolChainUpdate={handleToolChainUpdate}
            onConfigureCredentials={onConfigureCredentials}
            readOnly={!agentId || !enabled}
          />
        </div>

        {/* Description only (name is shown in container title) */}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};
