import React, { useState } from "react";
import { Switch } from "../ui/switch";
import { ArrowRight, Bot } from "lucide-react";
import { cn } from "../../lib/utils";
import type { AgentFunction, ToolInChain } from "@/types/functions";
import { getIntegrationIcon } from "@/constants/assistant";
import { EditableWorkflow } from "../workflows/EditableWorkflow";
import { agentFunctionsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type IntegrationFunctionCardProps = {
  agentFunction: AgentFunction;
  onToggle: (enabled: boolean) => void;
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
  onToggle,
  agentId,
  onWorkflowUpdate,
  onConfigureCredentials,
}) => {
  const { function: func, enabled } = agentFunction;
  const name = agentFunction.workflow_name || func?.name || "Unnamed Workflow";
  const description = agentFunction.workflow_description || func?.description;
  const { toast } = useToast();

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

  return (
    <div
      className={cn(
        "border border-border rounded-lg p-4 transition-colors",
        enabled ? "bg-primary/5 border-primary/20" : "bg-secondary/30"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
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
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          )}
        </div>

        {/* Toggle Switch */}
        <div className="flex-shrink-0">
          <Switch
            checked={enabled}
            onCheckedChange={onToggle}
            className="flex-shrink-0"
          />
        </div>
      </div>
    </div>
  );
};
