import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { ChevronDown, Edit, Plus, Trash2, Loader2, Check, X, Maximize2, Minimize2, Bot, Calendar, Database, Phone, Mail, MessageSquare, Zap, Workflow as WorkflowIcon, BookOpen } from "lucide-react";
import { cn } from "../../lib/utils";
import { IntegrationFunctionCard } from "../assistants/IntegrationFunctionCard";
import type { AgentFunction, Function } from "@/types/functions";
import type { UserIntegration, SystemToolsState } from "@/types/assistant";
import { functionsApi, agentFunctionsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { CreateWorkflowFromScratchModal } from "../workflows/CreateWorkflowFromScratchModal";
import { motion, AnimatePresence } from "framer-motion";

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
  systemTools?: SystemToolsState;
  onToggleSystemTool?: (key: string, enabled: boolean) => void;
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
  systemTools,
  onToggleSystemTool,
}) => {
  const connectedCount = Object.keys(agentIntegrationTools).length;
  const [deletingIntegrationType, setDeletingIntegrationType] = useState<string | null>(null);
  const [availableFunctions, setAvailableFunctions] = useState<Record<string, Function[]>>({});
  const [agentFunctions, setAgentFunctions] = useState<Record<string, AgentFunction[]>>({});
  const [loadingFunctions, setLoadingFunctions] = useState<Record<string, boolean>>({});
  const [loadingAgentFunctions, setLoadingAgentFunctions] = useState<boolean>(false);
  const [functionErrors, setFunctionErrors] = useState<Record<string, string>>({});
  const [showCreateWorkflowModal, setShowCreateWorkflowModal] = useState(false);
  const [deletingWorkflowId, setDeletingWorkflowId] = useState<number | null>(null);
  const [editingWorkflowId, setEditingWorkflowId] = useState<number | null>(null);
  const [editingWorkflowName, setEditingWorkflowName] = useState<string>("");
  const [savingWorkflowName, setSavingWorkflowName] = useState<number | null>(null);
  const [fullscreenWorkflowId, setFullscreenWorkflowId] = useState<number | null>(null);
  const { toast } = useToast();

  // Track section expansion state with ref to access actual value in callbacks
  const isSectionExpandedRef = useRef(integrationToolsSectionExpanded);
  useEffect(() => {
    isSectionExpandedRef.current = integrationToolsSectionExpanded;
  }, [integrationToolsSectionExpanded]);

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
    setLoadingAgentFunctions(true);
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
      } else {
        setAgentFunctions({});
      }
    } catch (error) {
      console.error("[Functions] Failed to load agent functions:", error);
      toast({
        title: "Error",
        description: "Failed to load agent functions",
        variant: "destructive",
      });
      setAgentFunctions({});
    } finally {
      setLoadingAgentFunctions(false);
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

  // Helper to get category-specific styling
  const getCategoryConfig = (category: string) => {
    const configs: Record<string, { icon: React.ReactNode; color: string; bgColor: string; borderColor: string }> = {
      "Scheduling": {
        icon: <Calendar className="h-4 w-4" />,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200"
      },
      "CRM": {
        icon: <Database className="h-4 w-4" />,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200"
      },
      "Communication": {
        icon: <MessageSquare className="h-4 w-4" />,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      },
      "Information": {
        icon: <Zap className="h-4 w-4" />,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200"
      },
      "Knowledge Base": {
        icon: <BookOpen className="h-4 w-4" />,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200"
      },
      "Other": {
        icon: <WorkflowIcon className="h-4 w-4" />,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200"
      }
    };

    return configs[category] || configs["Other"];
  };

  // Helper to categorize and group workflows
  const getGroupedWorkflows = () => {
    const workflows = getAllWorkflows();
    const groups: Record<string, AgentFunction[]> = {
      "Scheduling": [],
      "CRM": [],
      "Communication": [],
      "Information": [],
      "Knowledge Base": [],
      "Other": []
    };

    const schedulingTypes = ['calcom', 'calendly', 'google_calendar', 'outlook_calendar'];
    const crmTypes = ['hubspot', 'salesforce', 'pipedrive', 'kommo'];
    const commTypes = ['twilio'];
    const knowledgeTypes = ['pinecone', 'search_knowledge_base'];

    workflows.forEach(workflow => {
      // Check if this is a Knowledge Base workflow by name or description
      const workflowName = workflow.workflow_name || workflow.workflow_config?.name || '';
      const workflowDescription = workflow.workflow_description || workflow.workflow_config?.description || '';
      const isKnowledgeBaseWorkflow = 
        workflowName.toLowerCase().includes('product information') ||
        workflowDescription.toLowerCase().includes('product information') ||
        workflowName.toLowerCase().includes('qualification process') ||
        workflowDescription.toLowerCase().includes('qualification process');

      // If it's a Knowledge Base workflow, categorize it as Knowledge Base
      if (isKnowledgeBaseWorkflow) {
        groups["Knowledge Base"].push(workflow);
        return;
      }

      let type = workflow.function?.integration_type;

      // If custom workflow, try to guess type from tool chain
      if (!type || type === 'custom') {
        const toolChain = workflow.effective_tool_chain || workflow.custom_tool_chain || [];

        // Prioritize Scheduling, CRM, and Knowledge tools over Communication
        // (since SMS/Twilio is often prepended to other workflows)
        const significantTool = toolChain.find(t =>
          [...schedulingTypes, ...crmTypes, ...knowledgeTypes].includes(t.type)
        );

        if (significantTool) {
          type = significantTool.type;
        } else {
          // Fallback to checking all types including communication
          const anyKnown = toolChain.find(t =>
            [...schedulingTypes, ...crmTypes, ...commTypes, ...knowledgeTypes].includes(t.type)
          );
          type = anyKnown?.type;
        }
      }

      if (type && schedulingTypes.includes(type)) {
        groups["Scheduling"].push(workflow);
      } else if (type && crmTypes.includes(type)) {
        groups["CRM"].push(workflow);
      } else if (type && commTypes.includes(type)) {
        groups["Communication"].push(workflow);
      } else if (type && knowledgeTypes.includes(type)) {
        groups["Information"].push(workflow);
      } else {
        groups["Other"].push(workflow);
      }
    });

    // Remove empty groups and sort order
    const orderedGroups: Record<string, AgentFunction[]> = {};
    const order = ["Scheduling", "CRM", "Communication", "Information", "Knowledge Base", "Other"];

    order.forEach(key => {
      if (groups[key].length > 0) {
        orderedGroups[key] = groups[key];
      }
    });

    return orderedGroups;
  };

  const renderWorkflowItem = (workflow: AgentFunction) => {
    // Determine category characteristics for the badge
    let category = "Other";
    const groups = getGroupedWorkflows();

    for (const [cat, workflows] of Object.entries(groups)) {
      if (workflows.find(w => w.id === workflow.id)) {
        category = cat;
        break;
      }
    }

    const categoryConfig = getCategoryConfig(category);

    return (
      <div
        key={workflow.id}
        className={cn(
          "relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden group h-full flex flex-col",
          "bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300",
          "hover:border-primary/40 hover:-translate-y-0.5"
        )}
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="relative flex items-center justify-between p-4 pl-0">
          {/* Left colored accent bar */}
          <div className={cn(
            "absolute left-0 top-0 bottom-0 w-1",
            categoryConfig.bgColor.replace('bg-', 'bg-').replace('50', '500')
          )} />

          <div className="flex items-center gap-4 flex-1 pl-5">
            {/* Category Icon */}
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
              categoryConfig.bgColor,
              categoryConfig.color
            )}>
              {categoryConfig.icon}
            </div>

            <div className="flex-1 min-w-0">
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
                    className="h-8 text-sm font-medium bg-background/80 backdrop-blur-sm max-w-[240px]"
                    autoFocus
                    disabled={savingWorkflowName === workflow.id}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-green-50 text-green-600"
                    onClick={() => handleSaveWorkflowName(workflow.id)}
                    disabled={savingWorkflowName === workflow.id}
                  >
                    {savingWorkflowName === workflow.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-red-50 text-red-600"
                    onClick={handleCancelEditWorkflowName}
                    disabled={savingWorkflowName === workflow.id}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                      {workflow.workflow_name || workflow.function?.name || "Workflow"}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleStartEditWorkflowName(workflow);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn("text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded", categoryConfig.bgColor, categoryConfig.color)}>
                      {category}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                      {workflow.enabled ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pr-2">
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
              <Switch
                checked={workflow.enabled}
                onCheckedChange={(checked) => handleFunctionToggle(workflow.function_id, checked, workflow.id)}
                className="scale-90 data-[state=checked]:bg-primary mr-2"
                aria-label="Toggle workflow"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs font-medium dark:bg-slate-800 dark:border-slate-700"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setFullscreenWorkflowId(workflow.id);
                }}
              >
                <Maximize2 className="h-3.5 w-3.5" />
                Open Editor
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (confirm("Are you sure you want to delete this workflow? This action cannot be undone.")) {
                    await handleDeleteWorkflow(workflow.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <button
        className={cn(
          "w-full relative flex items-center justify-between gap-4 p-5 cursor-pointer transition-all duration-300 group",
          "hover:bg-slate-50 dark:hover:bg-slate-900/50",
          integrationToolsSectionExpanded
            ? "bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800"
            : "bg-transparent"
        )}
        onClick={onToggleSectionExpanded}
      >
        <div className="flex items-center gap-4 relative z-10 flex-1 text-left">
          <div className={cn(
            "p-3 rounded-xl transition-all duration-300 flex-shrink-0 shadow-sm ring-1 ring-inset",
            integrationToolsSectionExpanded
              ? "bg-gradient-to-br from-primary to-primary/80 text-white ring-primary/20 shadow-primary/20"
              : "bg-white dark:bg-slate-900 text-slate-500 ring-slate-200 dark:ring-slate-800 group-hover:text-primary group-hover:ring-primary/20"
          )}>
            <WorkflowIcon className={cn(
              "h-5 w-5 transition-colors duration-300"
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Agent Workflows
              </h3>
              {getAllWorkflows().length > 0 && (
                <span className={cn(
                  "inline-flex items-center justify-center min-w-[24px] h-6 px-2.5 text-xs font-bold rounded-full transition-all duration-300",
                  integrationToolsSectionExpanded
                    ? "bg-primary/10 text-primary"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                )}>
                  {getAllWorkflows().length}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Manage automation workflows for scheduling, CRM, and communication.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {integrationToolsSectionExpanded && (
            <Button
              variant="default"
              size="sm"
              className="h-9 px-4 shadow-sm active:scale-95 transition-all text-xs font-bold rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                setShowCreateWorkflowModal(true);
              }}
              disabled={!agentId}
            >
              <Plus className="h-3.5 w-3.5 mr-2 stroke-[3]" />
              New Workflow
            </Button>
          )}
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
            integrationToolsSectionExpanded
              ? "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rotate-180"
              : "bg-transparent text-slate-400"
          )}>
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>
      </button>

      {integrationToolsSectionExpanded && (
        <div className="p-5 bg-slate-50/30 dark:bg-slate-900/10">
          {getAllWorkflows().length > 0 ? (
            <div className="space-y-8 animate-in slide-in-from-top-2 duration-300 fade-in">
              {Object.entries(getGroupedWorkflows()).map(([category, workflows]) => {
                const config = getCategoryConfig(category);
                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-4 px-1">
                      <div className={cn("p-1.5 rounded-md", config.bgColor, config.color)}>
                        {config.icon}
                      </div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-tight">
                        {category}
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {workflows.map((workflow) => renderWorkflowItem(workflow))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : loadingAgentFunctions ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Loading Workflows...</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                Please wait while we load your workflows.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4 ring-8 ring-primary/5">
                <WorkflowIcon className="w-8 h-8 text-primary/40" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">No Workflows Yet</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                Create a workflow to automate tasks like booking appointments, updating CRMs, or sending messages.
              </p>
              <Button
                onClick={() => setShowCreateWorkflowModal(true)}
                disabled={!agentId}
                className="font-semibold shadow-md active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Workflow
              </Button>
            </div>
          )}
        </div>
      )}

      {agentId && (
        <>
          <CreateWorkflowFromScratchModal
            open={showCreateWorkflowModal}
            onClose={() => setShowCreateWorkflowModal(false)}
            agentId={agentId}
            onWorkflowCreated={loadAgentFunctions}
          />
        </>
      )}

      {/* Fullscreen Workflow Editor */}
      <AnimatePresence>
        {fullscreenWorkflowId && (() => {
          const workflow = getAllWorkflows().find(w => w.id === fullscreenWorkflowId);
          if (!workflow) return null;

          return (
            <motion.div
              key="fullscreen-workflow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[50] bg-slate-50 dark:bg-slate-950 flex flex-col pt-24 pb-32 overflow-y-auto overflow-x-hidden"
            >
              <div className="fixed top-0 left-0 right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-[110] flex items-center justify-between px-8 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center ring-4 ring-primary/5">
                    <Bot className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {workflow.workflow_name || workflow.function?.name || "Workflow"}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-tight">Workflow Editor</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete this workflow? This action cannot be undone.")) {
                        await handleDeleteWorkflow(workflow.id);
                        setFullscreenWorkflowId(null);
                      }
                    }}
                    disabled={deletingWorkflowId !== null}
                    className="group flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-2xl transition-all font-bold text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete workflow"
                  >
                    {deletingWorkflowId === workflow.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    )}
                    Delete
                  </button>
                  <button
                    onClick={() => setFullscreenWorkflowId(null)}
                    className="group flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl transition-all font-bold text-sm text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95"
                  >
                    <Minimize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Exit Fullscreen
                  </button>
                </div>
              </div>
              <div className="flex-1 w-full max-w-7xl mx-auto px-8 pt-8">
                <IntegrationFunctionCard
                  agentFunction={workflow}
                  agentId={agentId}
                  onWorkflowUpdate={() => {
                    loadAgentFunctions();
                    // Don't exit fullscreen when workflow is updated - keep user in fullscreen view
                    // setFullscreenWorkflowId(null);
                  }}
                  onConfigureCredentials={onOpenEditIntegrationModal}
                />
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};
