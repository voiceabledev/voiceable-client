import React, { useState } from "react";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { ChevronDown, Edit, Plus, Trash2, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

type AgentIntegrationToolsState = Record<
  string,
  {
    enabled: boolean;
    enabledTools: string[];
  }
>;

type AgentIntegrationToolsSectionProps = {
  agentIntegrationTools: AgentIntegrationToolsState;
  integrationToolsSectionExpanded: boolean;
  integrationToolsExpanded: Record<string, boolean>;
  onToggleSectionExpanded: () => void;
  onToggleIntegrationExpanded: (integrationType: string) => void;
  onOpenAddIntegrationModal: () => void;
  onOpenEditIntegrationModal: (integrationType: string) => void;
  onDeleteIntegration: (integrationType: string) => Promise<void>;
  onToggleTool: (integrationType: string, displayName: string, enabled: boolean) => void;
  INTEGRATION_TOOLS_DISPLAY: Record<string, string[]>;
  getIntegrationIcon: (integrationType: string) => string;
  formatToolName: (name: string) => string;
  displayNameToActionName: (displayName: string, integrationType: string) => string;
};

export const AgentIntegrationToolsSection: React.FC<AgentIntegrationToolsSectionProps> = ({
  agentIntegrationTools,
  integrationToolsSectionExpanded,
  integrationToolsExpanded,
  onToggleSectionExpanded,
  onToggleIntegrationExpanded,
  onOpenAddIntegrationModal,
  onOpenEditIntegrationModal,
  onDeleteIntegration,
  onToggleTool,
  INTEGRATION_TOOLS_DISPLAY,
  getIntegrationIcon,
  formatToolName,
  displayNameToActionName,
}) => {
  const connectedCount = Object.keys(agentIntegrationTools).length;
  const [deletingIntegrationType, setDeletingIntegrationType] = useState<string | null>(null);

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-start justify-between gap-2">
        <button
          className="flex-1 flex items-start justify-between gap-2"
          onClick={onToggleSectionExpanded}
        >
          <div className="text-left flex-1">
            <h3 className="text-base md:text-lg font-semibold">Integration tools</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              Connect your agent to CRM and scheduling integrations. Integration credentials are
              shared across all your agents.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {connectedCount} integration{connectedCount !== 1 ? "s" : ""} connected to this agent
            </p>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1",
              integrationToolsSectionExpanded && "rotate-180",
            )}
          />
        </button>
      </div>

      {integrationToolsSectionExpanded && (
        <div className="mt-4 md:mt-6">
          <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" onClick={onOpenAddIntegrationModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>
          {connectedCount > 0 ? (
            <div className="space-y-3">
              {Object.keys(agentIntegrationTools).map((integrationType) => {
                const enabledTools = agentIntegrationTools[integrationType]?.enabledTools || [];
                const enabledToolsSet = new Set(enabledTools);
                const isExpanded = integrationToolsExpanded[integrationType] || false;

                return (
                  <div
                    key={integrationType}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-3 bg-secondary/50">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-xl">{getIntegrationIcon(integrationType)}</span>
                        <div>
                          <span className="text-sm font-medium">
                            {formatToolName(integrationType)}
                          </span>
                          <span className="text-xs text-success ml-2">Connected & Active</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onOpenEditIntegrationModal(integrationType);
                          }}
                          title="Edit credentials"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={deletingIntegrationType !== null}
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to remove ${formatToolName(integrationType)} from this agent? This will disable all tools for this integration.`)) {
                              setDeletingIntegrationType(integrationType);
                              try {
                                await onDeleteIntegration(integrationType);
                              } finally {
                                setDeletingIntegrationType(null);
                              }
                            }
                          }}
                          title="Remove integration from agent"
                        >
                          {deletingIntegrationType === integrationType ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onToggleIntegrationExpanded(integrationType)}
                        >
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              isExpanded && "rotate-180",
                            )}
                          />
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 border-t border-border space-y-3">
                        <p className="text-xs text-muted-foreground mb-3">
                          Toggle tools on/off to control which {formatToolName(integrationType)}{" "}
                          actions are available:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(INTEGRATION_TOOLS_DISPLAY[integrationType] || [])
                            .filter((displayName) => {
                              const actionName = displayNameToActionName(
                                displayName,
                                integrationType,
                              );
                              return enabledToolsSet.has(actionName);
                            })
                            .map((displayName) => {
                              const actionName = displayNameToActionName(
                                displayName,
                                integrationType,
                              );
                              const isEnabled = enabledTools.includes(actionName);
                              return (
                                <div
                                  key={displayName}
                                  className={cn(
                                    "flex items-center justify-between gap-2 p-2 rounded-md transition-colors",
                                    isEnabled
                                      ? "bg-primary/5 border border-primary/20"
                                      : "bg-secondary/30 border border-transparent",
                                  )}
                                >
                                  <span className="text-sm">{displayName}</span>
                                  <Switch
                                    checked={isEnabled}
                                    onCheckedChange={(checked) =>
                                      onToggleTool(integrationType, displayName, checked)
                                    }
                                    className="flex-shrink-0"
                                  />
                                </div>
                              );
                            })}
                        </div>
                        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                          {enabledTools.length} of{" "}
                          {(INTEGRATION_TOOLS_DISPLAY[integrationType] || []).length} tools enabled
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
              <p className="text-sm">No integrations connected yet.</p>
              <p className="text-xs mt-1">
                Click &quot;Add Integration&quot; to connect your CRM or scheduling tools.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
