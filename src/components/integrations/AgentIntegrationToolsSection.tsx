import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { ChevronDown, Edit, Plus, Trash2, Loader2, Check, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { IntegrationFunctionCard } from "../assistants/IntegrationFunctionCard";
import type { AgentFunction, Function } from "@/types/functions";
import type { UserIntegration } from "@/types/assistant";
import { functionsApi, agentFunctionsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { CreateWorkflowFromScratchModal } from "../workflows/CreateWorkflowFromScratchModal";

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
  const [showCreateWorkflowModal, setShowCreateWorkflowModal] = useState(false);
  const [workflowsExpanded, setWorkflowsExpanded] = useState<Record<number, boolean>>({});
  const [deletingWorkflowId, setDeletingWorkflowId] = useState<number | null>(null);
  const [editingWorkflowId, setEditingWorkflowId] = useState<number | null>(null);
  const [editingWorkflowName, setEditingWorkflowName] = useState<string>("");
  const [savingWorkflowName, setSavingWorkflowName] = useState<number | null>(null);
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
        // Response is now a flat array of workflows
        const workflows = Array.isArray(response.data) ? response.data : [];
        console.log(`[Functions] Loaded ${workflows.length} workflows`);
        
        // Store workflows in a map by ID for easy access
        const workflowsMap: Record<string, AgentFunction[]> = {};
        workflows.forEach((workflow) => {
          const key = workflow.is_custom_workflow ? 'custom' : (workflow.function?.integration_type || 'other');
          if (!workflowsMap[key]) {
            workflowsMap[key] = [];
          }
          workflowsMap[key].push(workflow);
        });
        setAgentFunctions(workflowsMap);
        
        // Expand all workflows by default (only for newly loaded workflows)
        setWorkflowsExpanded(prev => {
          const updated = { ...prev };
          workflows.forEach((workflow) => {
            // Only expand if this workflow hasn't been manually collapsed/expanded by the user
            // If it's undefined, it's a new workflow - expand it by default
            if (updated[workflow.id] === undefined) {
              updated[workflow.id] = true;
            }
            // If it's already set (true or false), preserve the user's choice
          });
          return updated;
        });
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
      console.log(`[AgentIntegrationToolsSection] Refresh triggered - agentId: ${agentId}, refreshKey: ${agentFunctionsRefreshKey}`);
      loadAgentFunctions();
    }
  }, [agentId, agentFunctionsRefreshKey, loadAgentFunctions]);

  // Handle function toggle
  const handleFunctionToggle = async (functionId: number | null, enabled: boolean, agentFunctionId?: number) => {
    if (!agentId) return;

    // If enabling a workflow, check if it requires SMS
    if (enabled) {
      const workflow = getAllWorkflows().find(w => 
        w.id === agentFunctionId || (functionId && w.function_id === functionId)
      );
      if (workflow) {
        const toolChain = workflow.effective_tool_chain || workflow.custom_tool_chain || [];
        const hasSmsTool = toolChain.some(tool => 
          tool.role === 'communication' && tool.type === 'twilio' && (tool.method === 'sms' || !tool.method)
        );
        
        // Note: Backend will validate Twilio configuration
        // Frontend validation is just for user feedback
        if (hasSmsTool) {
          // Backend will handle the actual validation
        }
      }
    }

    try {
      if (enabled) {
        if (functionId) {
          await agentFunctionsApi.enable(agentId, functionId, true);
        }
      } else {
        // Use provided agentFunctionId or find by function_id
        if (agentFunctionId) {
          await agentFunctionsApi.disable(agentId, agentFunctionId);
        } else if (functionId) {
          // Find the agent function to disable
          const agentFunction = Object.values(agentFunctions)
            .flat()
            .find((af) => af.function_id === functionId);
          if (agentFunction) {
            await agentFunctionsApi.disable(agentId, agentFunction.id);
          }
        }
      }
      await loadAgentFunctions();
    } catch (error: any) {
      console.error("Failed to toggle function:", error);
      // Check if error is about SMS requirement
      const errorMessage = error?.response?.data?.status?.message || error?.message || "";
      if (errorMessage.includes('SMS') || errorMessage.includes('Twilio')) {
        toast({
          title: "SMS Required",
          description: errorMessage || "SMS/Twilio is required when agent workflows need to receive user input. Please configure Twilio credentials.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to toggle workflow",
          variant: "destructive",
        });
      }
    }
  };

  // Get all workflows (custom and function-based)
  const getAllWorkflows = (): AgentFunction[] => {
    return Object.values(agentFunctions).flat();
  };

  // Get functions for an integration (both available and enabled) - kept for backward compatibility
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

  const handleDeleteWorkflow = async (workflowId: number) => {
    if (!agentId) return;
    
    if (!confirm("Are you sure you want to delete this workflow? This action cannot be undone.")) {
      return;
    }

    setDeletingWorkflowId(workflowId);
    try {
      await agentFunctionsApi.disable(agentId, workflowId);
      await loadAgentFunctions();
      toast({
        title: "Success",
        description: "Workflow deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete workflow:", error);
      toast({
        title: "Error",
        description: "Failed to delete workflow",
        variant: "destructive",
      });
    } finally {
      setDeletingWorkflowId(null);
    }
  };

  const handleStartEditWorkflowName = (workflow: AgentFunction) => {
    setEditingWorkflowId(workflow.id);
    setEditingWorkflowName(workflow.workflow_name || workflow.function?.name || "Workflow");
  };

  const handleCancelEditWorkflowName = () => {
    setEditingWorkflowId(null);
    setEditingWorkflowName("");
  };

  const handleSaveWorkflowName = async (workflowId: number) => {
    if (!agentId) return;

    const trimmedName = editingWorkflowName.trim();
    if (!trimmedName) {
      toast({
        title: "Error",
        description: "Workflow name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setSavingWorkflowName(workflowId);
    try {
      await agentFunctionsApi.updateWorkflowConfig(agentId, workflowId, { name: trimmedName });
      
      toast({
        title: "Success",
        description: "Workflow name updated successfully",
      });
      
      setEditingWorkflowId(null);
      setEditingWorkflowName("");
      await loadAgentFunctions();
    } catch (error) {
      console.error("Failed to update workflow name:", error);
      toast({
        title: "Error",
        description: "Failed to update workflow name",
        variant: "destructive",
      });
    } finally {
      setSavingWorkflowName(null);
    }
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
              {getAllWorkflows().length} workflow{getAllWorkflows().length !== 1 ? "s" : ""} configured for this agent
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowCreateWorkflowModal(true)}
              disabled={!agentId}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Workflow
            </Button>
          </div>
          {getAllWorkflows().length > 0 ? (
            <div className="space-y-3">
              {/* Show all workflows as "Workflow" containers */}
              {getAllWorkflows().map((workflow) => {
                const isExpanded = workflowsExpanded[workflow.id] || false;
                return (
                  <div
                    key={workflow.id}
                    className="border border-border rounded-lg overflow-hidden group"
                  >
                    <div className="flex items-center justify-between p-3 bg-secondary/50">
                      <div className="flex items-center gap-2 flex-1 group">
                        {editingWorkflowId === workflow.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={editingWorkflowName}
                              onChange={(e) => setEditingWorkflowName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSaveWorkflowName(workflow.id);
                                } else if (e.key === "Escape") {
                                  handleCancelEditWorkflowName();
                                }
                              }}
                              className="h-7 text-sm font-medium"
                              autoFocus
                              disabled={savingWorkflowName === workflow.id}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleSaveWorkflowName(workflow.id)}
                              disabled={savingWorkflowName === workflow.id}
                            >
                              {savingWorkflowName === workflow.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3 text-success" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={handleCancelEditWorkflowName}
                              disabled={savingWorkflowName === workflow.id}
                            >
                              <X className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {workflow.workflow_name || workflow.function?.name || "Workflow"}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleStartEditWorkflowName(workflow);
                              }}
                              title="Edit workflow name"
                            >
                              <Edit className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={deletingWorkflowId !== null}
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            await handleDeleteWorkflow(workflow.id);
                          }}
                          title="Delete workflow"
                        >
                          {deletingWorkflowId === workflow.id ? (
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
                          onClick={() => setWorkflowsExpanded(prev => ({ ...prev, [workflow.id]: !isExpanded }))}
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
                      <div className="p-4 border-t border-border">
                        <IntegrationFunctionCard
                          agentFunction={workflow}
                          agentId={agentId}
                          onToggle={(enabled) =>
                            handleFunctionToggle(workflow.function_id, enabled, workflow.id)
                          }
                          onWorkflowUpdate={loadAgentFunctions}
                          onConfigureCredentials={onOpenEditIntegrationModal}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
              <p className="text-sm">No workflows configured yet.</p>
              <p className="text-xs mt-1">
                Click &quot;Add Workflow&quot; to create a new workflow.
              </p>
            </div>
          )}
        </div>
      )}

      {agentId && (
        <CreateWorkflowFromScratchModal
          open={showCreateWorkflowModal}
          onClose={() => setShowCreateWorkflowModal(false)}
          agentId={agentId}
          onWorkflowCreated={loadAgentFunctions}
        />
      )}
    </div>
  );
};
