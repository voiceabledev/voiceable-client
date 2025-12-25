import React from "react";
import { Settings } from "lucide-react";
import { Switch } from "../ui/switch";
import { TabSectionCard } from "./TabSectionCard";

type SystemTools = Record<string, boolean>;

type SystemToolsSectionProps = {
  systemTools: SystemTools;
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleTool: (key: string, checked: boolean) => void;
  onOpenSettings?: (key: string) => void;
};

const TOOL_CONFIG = [
  { key: "end_call", label: "End call" },
  { key: "detect_language", label: "Detect language" },
  { key: "transfer_to_agent", label: "Transfer to agent" },
  { key: "transfer_to_number", label: "Transfer to number" },
  { key: "voicemail_detection", label: "Voicemail detection" },
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
      <div className="space-y-3">
        {TOOL_CONFIG.map((tool) => {
          const isEnabled = Boolean(systemTools[tool.key]);
          return (
            <div key={tool.key} className="border border-border rounded-lg">
              <div 
                className="flex items-center justify-between p-3 bg-secondary/50"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-sm font-medium">{tool.label}</span>
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
    </TabSectionCard>
  );
};


