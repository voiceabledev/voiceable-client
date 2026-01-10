import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { ChevronDown, Edit, Plus, Trash2, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { IntegrationFunctionCard } from "../assistants/IntegrationFunctionCard";
import type { AgentFunction, Function } from "@/types/functions";
import type { UserIntegration } from "@/types/assistant";
import { functionsApi, agentFunctionsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
  userIntegrations: UserIntegration[];
  agentId?: string;
  agentFunctionsRefreshKey?: number; // When this changes, refresh agent functions
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
  userIntegrations,
  agentId,
  agentFunctionsRefreshKey,
}) => {
  const connectedCount = Object.keys(agentIntegrationTools).length;
  const [deletingIntegrationType, setDeletingIntegrationType] = useState<string | null>(null);
  const [availableFunctions, setAvailableFunctions] = useState<Record<string, Function[]>>({});
  const [agentFunctions, setAgentFunctions] = useState<Record<string, AgentFunction[]>>({});
  const [loadingFunctions, setLoadingFunctions] = useState<Record<string, boolean>>({});
  const [functionErrors, setFunctionErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Load functions for an integration
  const loadFunctionsForIntegration = useCallback(async (integrationType: string) => {
    if (loadingFunctions[integrationType] || availableFunctions[integrationType]) {
      console.log(`[Functions] Skipping load for ${integrationType} - already loading or loaded`);
      return;
    }

    console.log(`[Functions] Loading functions for integration: ${integrationType}`);
    setLoadingFunctions((prev) => ({ ...prev, [integrationType]: true }));
    setFunctionErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[integrationType];
      return newErrors;
    });

    try {
      const response = await functionsApi.listByIntegration(integrationType);
      console.log(`[Functions] API response for ${integrationType}:`, response);
      
      if (response.data) {
        console.log(`[Functions] Setting ${response.data.length} functions for ${integrationType}`);
        setAvailableFunctions((prev) => ({ ...prev, [integrationType]: response.data || [] }));
      } else {
        console.warn(`[Functions] No data in response for ${integrationType}`);
        setAvailableFunctions((prev) => ({ ...prev, [integrationType]: [] }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to load functions for ${integrationType}`;
      console.error(`[Functions] Error loading functions for ${integrationType}:`, error);
      setFunctionErrors((prev) => ({ ...prev, [integrationType]: errorMessage }));
      setAvailableFunctions((prev) => ({ ...prev, [integrationType]: [] }));
      
      toast({
        title: "Error loading functions",
        description: `Failed to load functions for ${formatToolName(integrationType)}`,
        variant: "destructive",
      });
    } finally {
      setLoadingFunctions((prev) => ({ ...prev, [integrationType]: false }));
    }
  }, [loadingFunctions, availableFunctions, formatToolName, toast]);

  // Load agent functions
  const loadAgentFunctions = useCallback(async () => {
    if (!agentId) return;

    console.log(`[Functions] Loading agent functions for agent: ${agentId}`);
    try {
      const response = await agentFunctionsApi.list(agentId);
      console.log(`[Functions] Agent functions response:`, response);
      
      if (response.data) {
        const grouped: Record<string, AgentFunction[]> = {};
        response.data.forEach((group) => {
          grouped[group.integration_type] = group.functions;
        });
        console.log(`[Functions] Grouped agent functions:`, grouped);
        setAgentFunctions(grouped);
      }
    } catch (error) {
      console.error("[Functions] Failed to load agent functions:", error);
      toast({
        title: "Error",
        description: "Failed to load agent functions",
        variant: "destructive",
      });
    }
  }, [agentId, toast]);

  // Load functions when integration is expanded
  useEffect(() => {
    Object.keys(integrationToolsExpanded).forEach((integrationType) => {
      if (integrationToolsExpanded[integrationType]) {
        loadFunctionsForIntegration(integrationType);
      }
    });
  }, [integrationToolsExpanded, loadFunctionsForIntegration]);

  // Load agent functions on mount and when agentId changes or refresh key changes
  useEffect(() => {
    if (agentId) {
      loadAgentFunctions();
    }
  }, [agentId, agentFunctionsRefreshKey, loadAgentFunctions]);

  // Handle function toggle
  const handleFunctionToggle = async (functionId: number, enabled: boolean) => {
    if (!agentId) return;

    try {
      if (enabled) {
        await agentFunctionsApi.enable(agentId, functionId, true);
      } else {
        // Find the agent function to disable
        const agentFunction = Object.values(agentFunctions)
          .flat()
          .find((af) => af.function_id === functionId);
        if (agentFunction) {
          await agentFunctionsApi.disable(agentId, agentFunction.id);
        }
      }
      await loadAgentFunctions();
    } catch (error) {
      console.error("Failed to toggle function:", error);
    }
  };

  // Get functions for an integration (both available and enabled)
  const getFunctionsForIntegration = (integrationType: string): AgentFunction[] => {
    const available = availableFunctions[integrationType] || [];
    const enabled = agentFunctions[integrationType] || [];

    // Create a map of enabled function IDs
    const enabledMap = new Map(enabled.map((af) => [af.function_id, af]));

    // Return functions with their enabled state
    return available.map((func) => {
      const agentFunc = enabledMap.get(func.id);
      return agentFunc || {
        id: 0,
        function_id: func.id,
        enabled: false,
        function: func,
      };
    });
  };

  // Helper to get required integrations from enabled functions
  const getRequiredIntegrationsForIntegration = (integrationType: string) => {
    const enabledFunctions = getFunctionsForIntegration(integrationType)
      .filter(af => af.enabled);
    
    const requiredTools = new Set<string>();
    const functionMap = new Map<string, string[]>(); // integration_type -> function names
    
    enabledFunctions.forEach(af => {
      af.function.tool_chain.forEach(tool => {
        // Skip the primary integration and already connected integrations
        // Also skip 'twilio' as it's typically environment-based
        if (tool.type !== integrationType && 
            !agentIntegrationTools[tool.type] &&
            tool.type !== 'twilio') {
          requiredTools.add(tool.type);
          if (!functionMap.has(tool.type)) {
            functionMap.set(tool.type, []);
          }
          functionMap.get(tool.type)!.push(af.function.name);
        }
      });
    });
    
    return Array.from(requiredTools).map(type => ({
      integrationType: type,
      requiredBy: functionMap.get(type) || []
    }));
  };

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
                        {integrationType !== 'twilio' && (
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
                        )}
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
                        {/* Functions Section */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-3 font-medium">
                            Functions
                          </p>
                          <p className="text-xs text-muted-foreground mb-3">
                            Predefined workflows that connect {formatToolName(integrationType)} with other tools:
                          </p>
                          
                          {loadingFunctions[integrationType] ? (
                            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Loading functions...</span>
                            </div>
                          ) : functionErrors[integrationType] ? (
                            <div className="py-4 text-sm text-destructive">
                              <p>Error loading functions: {functionErrors[integrationType]}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => loadFunctionsForIntegration(integrationType)}
                              >
                                Retry
                              </Button>
                            </div>
                          ) : availableFunctions[integrationType] && availableFunctions[integrationType].length > 0 ? (
                            <div className="space-y-2">
                              {getFunctionsForIntegration(integrationType).map((agentFunction) => (
                                <IntegrationFunctionCard
                                  key={agentFunction.function_id}
                                  agentFunction={agentFunction}
                                  onToggle={(enabled) =>
                                    handleFunctionToggle(agentFunction.function_id, enabled)
                                  }
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="py-4 text-sm text-muted-foreground">
                              <p>No functions available for this integration.</p>
                            </div>
                          )}
                        </div>

                        {/* Required Integrations Section */}
                        {(() => {
                          const requiredIntegrations = getRequiredIntegrationsForIntegration(integrationType);
                          if (requiredIntegrations.length === 0) return null;

                          return (
                            <div className="mt-4 pt-4 border-t border-border">
                              <p className="text-xs text-muted-foreground mb-3 font-medium">
                                Required Integrations
                              </p>
                              <p className="text-xs text-muted-foreground mb-3">
                                These integrations are required by enabled functions:
                              </p>
                              <div className="space-y-2">
                                {requiredIntegrations.map(({ integrationType: requiredType, requiredBy }) => {
                                  const userIntegration = userIntegrations.find(
                                    ui => ui.integration_type === requiredType
                                  );
                                  const isConnected = !!agentIntegrationTools[requiredType];
                                  
                                  return (
                                    <div
                                      key={requiredType}
                                      className="border border-border rounded-lg overflow-hidden bg-secondary/30"
                                    >
                                      <div className="flex items-center justify-between p-3">
                                        <div className="flex items-center gap-3 flex-1">
                                          <span className="text-xl">{getIntegrationIcon(requiredType)}</span>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-medium">
                                                {formatToolName(requiredType)}
                                              </span>
                                              {isConnected && (
                                                <span className="text-xs text-success">Connected & Active</span>
                                              )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                              Required by: {requiredBy.join(", ")}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {!isConnected && (
                                            <Button
                                              variant="default"
                                              size="sm"
                                              onClick={() => onOpenEditIntegrationModal(requiredType)}
                                            >
                                              Connect to Agent
                                            </Button>
                                          )}
                                          {isConnected && (
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              className="h-7 w-7"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onOpenEditIntegrationModal(requiredType);
                                              }}
                                              title="Edit credentials"
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
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
