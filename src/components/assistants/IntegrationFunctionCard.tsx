import React from "react";
import { Switch } from "../ui/switch";
import { ArrowRight, Bot } from "lucide-react";
import { cn } from "../../lib/utils";
import type { AgentFunction } from "@/types/functions";
import { getIntegrationIcon } from "@/constants/assistant";

type IntegrationFunctionCardProps = {
  agentFunction: AgentFunction;
  onToggle: (enabled: boolean) => void;
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
}) => {
  const { function: func, enabled } = agentFunction;
  const { tool_chain, name, description } = func;

  // Sort tool chain by role order: communication -> scheduling -> crm
  const sortedToolChain = [...tool_chain].sort((a, b) => {
    const roleOrder: Record<string, number> = {
      communication: 1,
      scheduling: 2,
      crm: 3,
    };
    const aOrder = roleOrder[a.role] || 99;
    const bOrder = roleOrder[b.role] || 99;
    return aOrder - bOrder;
  });

  return (
    <div
      className={cn(
        "border border-border rounded-lg p-4 transition-colors",
        enabled ? "bg-primary/5 border-primary/20" : "bg-secondary/30"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Tool Chain Visualization */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {/* Always start with Agent */}
            <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-md">
              <Bot className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium">Agent</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            
            {/* Then show the sorted tool chain */}
            {sortedToolChain.map((tool, index) => (
              <React.Fragment key={index}>
                <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-md">
                  <span className="text-lg">{getToolIcon(tool.type)}</span>
                  <span className="text-xs font-medium">
                    {getToolDisplayName(tool)}
                  </span>
                </div>
                {index < sortedToolChain.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Function Name and Description */}
          <h4 className="text-sm font-semibold mb-1">{name}</h4>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
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
