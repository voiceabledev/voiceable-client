import React from "react";
import { Settings } from "lucide-react";
import { Switch } from "../ui/switch";
import { TabSectionCard } from "./TabSectionCard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type SystemTools = Record<string, boolean>;

type SystemToolsSectionProps = {
  systemTools: SystemTools;
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleTool: (key: string, checked: boolean) => void;
  onOpenSettings?: (key: string) => void;
};

const TOOL_CONFIG = [
  { 
    key: "end_call", 
    label: "End call",
    tooltip: "Gives agent the ability to end the conversation with the user."
  },
  { 
    key: "detect_language", 
    label: "Detect language",
    tooltip: "Gives agent the ability to change the language during conversation."
  },
  // { key: "transfer_to_agent", label: "Transfer to agent" },
  // { key: "transfer_to_number", label: "Transfer to number" },
  { 
    key: "voicemail_detection", 
    label: "Voicemail detection",
    tooltip: "Allows agent to detect voicemail systems and optionally leave a message."
  },
];

export const SystemToolsSection: React.FC<SystemToolsSectionProps> = ({
  systemTools = {},
  expanded,
  onToggleExpanded,
  onToggleTool,
  onOpenSettings,
}) => {
  const activeCount = Object.values(systemTools || {}).filter(Boolean).length;

  return (
    <TabSectionCard
      title="System tools"
      description="Allow the agent to perform built-in actions."
      count={`${activeCount} active tool${activeCount !== 1 ? "s" : ""}`}
      collapsible
      expanded={expanded}
      onToggle={onToggleExpanded}
    >
      <TooltipProvider>
        <div className="space-y-3">
          {TOOL_CONFIG.map((tool) => {
            const isEnabled = Boolean(systemTools[tool.key]);
            return (
              <div key={tool.key} className="border border-border rounded-lg">
                <div 
                  className="flex items-center justify-between p-3 bg-secondary/50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-sm font-medium cursor-help underline decoration-dotted decoration-muted-foreground hover:text-primary hover:decoration-primary transition-colors">
                        {tool.label}
                      </span>
                    </TooltipTrigger>
                    {tool.tooltip && (
                      <TooltipContent>
                        <p className="text-xs max-w-xs">{tool.tooltip}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                  <div className="flex items-center gap-2">
                    {isEnabled && onOpenSettings ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenSettings(tool.key);
                        }}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Open settings"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    ) : (
                      <Settings className="h-4 w-4 text-muted-foreground opacity-30" />
                    )}
                    <div onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => onToggleTool(tool.key, checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </TooltipProvider>
    </TabSectionCard>
  );
};


