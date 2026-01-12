import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowDown, Bot, Plus, GitBranch, Check, X, Trash2, Settings, Sparkles, GripVertical, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "../../lib/utils";
import type { AgentFunction, ToolInChain, ConditionalConfig } from "@/types/functions";
import { isConditionalTool } from "@/types/functions";
import { getIntegrationIcon, INTEGRATION_METADATA } from "@/constants/assistant";
import { ToolSelectionModal } from "./ToolSelectionModal";
import { ToolConfigurationModal } from "./ToolConfigurationModal";
import { ToolChainConfigurationWizard } from "./ToolChainConfigurationWizard";
import { EnhancedToolCard } from "./EnhancedToolCard";
import { LinearConnector, BranchConnector, BranchHeader, MergeConnector } from "./WorkflowConnector";
import { WebhookToolModal } from "../assistants/modals/WebhookToolModal";
import type { WebhookTool } from "@/types/assistant";
import { getEmptyWebhookTool } from "@/utils/assistantHelpers";
import { SystemToolsModal } from "./SystemToolsModal";
import { SystemToolSettingsPanel } from "../assistants/SystemToolSettingsPanel";
import { agentsApi } from "@/lib/api";
import { SYSTEM_TOOL_KEYS, type SystemToolKey, type SystemToolsState, type SystemToolSetting } from "@/types/assistant";
import { PhoneOff, Languages, Voicemail, Settings2 } from "lucide-react";

type EditableWorkflowProps = {
  agentFunction: AgentFunction;
  agentId: string;
  onToolChainUpdate?: (toolChain: ToolInChain[]) => void;
  onConfigureCredentials?: (integrationType: string) => void;
  readOnly?: boolean;
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
    pinecone: "🔍",
    condition: "🔀",
  };
  return icons[toolType] || getIntegrationIcon(toolType) || "🔧";
};

const getToolDisplayName = (tool: { type: string; role: string; method?: string }): string => {
  // Just show the tool type, no method names
  if (tool.type === "twilio" && tool.method === "sms") {
    return "SMS";
  }
  if (tool.type === "condition") {
    return "Condition";
  }
  return tool.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const getToolName = (tool: { type: string; role: string; method?: string }): string => {
  if (tool.type === "twilio" && tool.method === "sms") {
    return "SMS";
  }
  if (tool.type === "condition") {
    return "Condition";
  }
  return tool.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const getToolMethod = (tool: ToolInChain): string | null => {
  // SMS always shows "Request user data"
  if (tool.type === "twilio" && tool.method === "sms") {
    return "Request user data";
  }
  // Conditional tools show the expression
  if (isConditionalTool(tool)) {
    return tool.config.expression || "Branch";
  }
  if (!tool.method) {
    return null;
  }
  // Convert method from snake_case to Title Case
  return tool.method
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const formatMethodName = (methodKey: string): string => {
  // Convert method keys like "get_event_types" to "Get Event Types"
  return methodKey
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const getConditionLabel = (expression: string): string => {
  // Map common expressions to user-friendly labels
  const expressionMap: Record<string, string> = {
    "result.length === 0": "if the user does not exist",
    "result.length === 0 || !result": "if the user does not exist",
    "!result || result.length === 0": "if the user does not exist",
    "result.length > 0": "if the user exists",
    "result && result.length > 0": "if the user exists",
    "!result": "if no result",
    "result": "if result exists",
  };

  // Check for exact match first
  if (expressionMap[expression]) {
    return expressionMap[expression];
  }

  // Check for partial matches (case-insensitive)
  const normalizedExpression = expression.trim();
  for (const [key, label] of Object.entries(expressionMap)) {
    if (normalizedExpression.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(normalizedExpression.toLowerCase())) {
      return label;
    }
  }

  // Default: return the expression as-is but formatted
  return expression;
};

// Compact version of ToolCard for branches
const BranchToolCard: React.FC<{
  tool: ToolInChain;
  onClick: () => void;
  onRemove: () => void;
  readOnly?: boolean;
  isDragging?: boolean;
}> = ({ tool, onClick, onRemove, readOnly, isDragging }) => {
  const metadata = INTEGRATION_METADATA[tool.type];
  const method = getToolMethod(tool);

  return (
    <div className="relative group w-full">
      <button
        type="button"
        onClick={onClick}
        disabled={readOnly}
        className={cn(
          "flex flex-col gap-2 p-3 bg-white dark:bg-slate-900 border-2 rounded-xl w-full text-left transition-all duration-200",
          "shadow-[var(--shadow-workflow-sm)] border-slate-100 dark:border-slate-800",
          !readOnly && "hover:shadow-[var(--shadow-workflow-md)] hover:-translate-y-0.5 hover:border-primary/30 cursor-pointer",
          isDragging && "opacity-50"
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm",
            metadata?.iconBg || "bg-slate-500"
          )}>
            {metadata?.icon || tool.type.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {metadata?.name || getToolName(tool)}
            </span>
            {method && (
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                {method}
              </span>
            )}
          </div>
          {!readOnly && (
            <div className="opacity-40 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
              <GripVertical className="w-3 h-3 text-slate-400" />
            </div>
          )}
        </div>
      </button>

      {!readOnly && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-all bg-white dark:bg-slate-900 rounded-full w-6 h-6 flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-800 z-10 hover:scale-110"
          title="Remove tool"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

const getToolMethodNames = (tool: ToolInChain): string[] => {
  // Skip conditional tools - they don't have methods
  if (isConditionalTool(tool)) {
    return [];
  }

  // Get method names from tool config or method property
  const config = tool.config as Record<string, unknown> | undefined;
  const methods: string[] = Array.isArray(config?.methods)
    ? config.methods as string[]
    : config?.method
      ? [config.method as string]
      : tool.method
        ? [tool.method]
        : [];

  if (methods.length === 0) {
    // No methods configured, return empty array
    return [];
  }

  // Return formatted method names
  return methods.map((m: string) => formatMethodName(m));
};

// Method descriptions mapping - explains what each method does
const getMethodDescription = (toolType: string, methodKey: string): string => {
  const methodKeyLower = methodKey.toLowerCase();

  // Cal.com method descriptions
  if (toolType === "calcom") {
    if (methodKeyLower.includes("create_booking") || methodKeyLower === "create booking") {
      return "Creates new appointments and bookings with attendee details, sending confirmation notifications";
    } else if (methodKeyLower.includes("get_available_slots") || methodKeyLower === "get available slots") {
      return "Checks available time slots for booking to find the best meeting times";
    } else if (methodKeyLower.includes("get_event_types") || methodKeyLower === "get event types") {
      return "Retrieves all available event types and their configurations needed for scheduling";
    } else if (methodKeyLower.includes("list_bookings") || methodKeyLower.includes("get_all_bookings") || methodKeyLower === "get all bookings") {
      return "Retrieves all scheduled bookings within a time window for calendar management";
    } else if (methodKeyLower.includes("get_booking") || methodKeyLower === "get booking") {
      return "Fetches detailed information about a specific booking by its unique identifier";
    } else if (methodKeyLower.includes("reschedule") || methodKeyLower === "reschedule booking") {
      return "Updates existing booking times and sends rescheduling notifications to all participants";
    } else if (methodKeyLower.includes("cancel") || methodKeyLower === "cancel booking") {
      return "Cancels scheduled appointments and notifies all participants of the cancellation";
    }
  }

  // Pipedrive method descriptions
  if (toolType === "pipedrive") {
    if (methodKeyLower.includes("create_deal") || methodKeyLower === "create deal") {
      return "Creates a new deal in Pipedrive with pipeline, stage, and value information";
    } else if (methodKeyLower.includes("update_deal") || methodKeyLower === "update deal") {
      return "Updates an existing deal with new information like stage, value, or custom fields";
      // } else if (methodKeyLower.includes("get_deal") || methodKeyLower === "get deal") {
      //   return "Retrieves detailed information about a specific deal by its ID";
      // } else if (methodKeyLower.includes("search_deals") || methodKeyLower === "search deals") {
      //   return "Searches for deals in Pipedrive based on criteria like name, stage, or custom fields";
    } else if (methodKeyLower.includes("create_contact") || methodKeyLower === "create contact") {
      return "Creates a new person or contact in Pipedrive with name, email, phone, and other details";
    } else if (methodKeyLower.includes("update_contact") || methodKeyLower === "update contact") {
      return "Updates an existing contact's information in Pipedrive";
      // } else if (methodKeyLower.includes("get_contact") || methodKeyLower === "get contact") {
      //   return "Retrieves detailed information about a specific contact or person by ID";
      // } else if (methodKeyLower.includes("search_contacts") || methodKeyLower === "search contacts") {
      //   return "Searches for contacts in Pipedrive by name, email, phone, or other criteria";
      // } else if (methodKeyLower.includes("create_company") || methodKeyLower === "create company") {
      //   return "Creates a new organization or company in Pipedrive";
      // } else if (methodKeyLower.includes("get_company") || methodKeyLower === "get company") {
      //   return "Retrieves detailed information about a specific company or organization by ID";
      // } else if (methodKeyLower.includes("update_organization") || methodKeyLower === "update organization") {
      //   return "Updates an existing organization's information in Pipedrive";
      // } else if (methodKeyLower.includes("search_companies") || methodKeyLower === "search companies") {
      //   return "Searches for companies or organizations in Pipedrive";
    } else if (methodKeyLower.includes("create_activity") || methodKeyLower === "create activity") {
      return "Creates an activity in Pipedrive like meetings, calls, or tasks linked to deals or contacts";
    } else if (methodKeyLower.includes("create_note") || methodKeyLower === "create note") {
      return "Creates a note in Pipedrive to log important information about deals or contacts";
    }
  }

  // Default description
  return "Performs operations in the workflow";
};

const generateWorkflowDescription = (toolChain: ToolInChain[]): string => {
  if (toolChain.length === 0) {
    return "No tools configured";
  }

  const toolSections: string[] = [];

  toolChain.forEach((tool) => {
    // Handle conditional tools
    if (isConditionalTool(tool)) {
      const conditionDesc = `Condition: ${tool.config.expression}`;
      const thenDesc = tool.config.then.length > 0
        ? `  If true: ${tool.config.then.map(t => getToolName(t)).join(", ")}`
        : "  If true: (skip)";
      const elseDesc = tool.config.else.length > 0
        ? `  If false: ${tool.config.else.map(t => getToolName(t)).join(", ")}`
        : "  If false: (skip)";
      toolSections.push(`${conditionDesc}\n${thenDesc}\n${elseDesc}`);
      return;
    }

    const methodNames = getToolMethodNames(tool);
    const toolType = tool.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

    // Skip conditional tools in description generation
    if (isConditionalTool(tool)) {
      return;
    }

    // Get method keys (not formatted names) for description lookup
    const config = tool.config as Record<string, unknown> | undefined;
    const methodKeys: string[] = Array.isArray(config?.methods)
      ? config.methods as string[]
      : config?.method
        ? [config.method as string]
        : tool.method
          ? [tool.method]
          : [];

    if (methodKeys.length > 0) {
      // Format as: ToolName\n- Method1: description\n- Method2: description
      const methodLines = methodKeys.map((methodKey, index) => {
        const methodName = methodNames[index] || formatMethodName(methodKey);
        const description = getMethodDescription(tool.type, methodKey);
        return `- ${methodName}: ${description}`;
      });
      toolSections.push(`${toolType}\n${methodLines.join("\n")}`);
    } else {
      // No methods, just show tool type
      toolSections.push(toolType);
    }
  });

  return toolSections.join("\n\n");
};

export const EditableWorkflow: React.FC<EditableWorkflowProps> = ({
  agentFunction,
  agentId,
  onToolChainUpdate,
  onConfigureCredentials,
  readOnly = false,
}) => {
  const [webhookForm, setWebhookForm] = useState<WebhookTool>(getEmptyWebhookTool());

  const handleSaveWebhookTool = () => {
    handleSaveToolConfig(webhookForm);
  };
  const [showToolModal, setShowToolModal] = useState(false);
  const [showToolConfigModal, setShowToolConfigModal] = useState(false);
  const [showToolChainWizard, setShowToolChainWizard] = useState(false);
  const [insertPosition, setInsertPosition] = useState<number | null>(null);
  const [selectedToolIndex, setSelectedToolIndex] = useState<number | null>(null);
  const [pendingToolForConfig, setPendingToolForConfig] = useState<ToolInChain | null>(null);
  const [hoveredInsertPosition, setHoveredInsertPosition] = useState<number | null>(null);
  // Branch insertion state: { conditionIndex, branch: 'then' | 'else', position: number }
  const [branchInsertPosition, setBranchInsertPosition] = useState<{
    conditionIndex: number;
    branch: 'then' | 'else';
    position: number;
  } | null>(null);
  const [selectedBranchTool, setSelectedBranchTool] = useState<{
    conditionIndex: number;
    branch: 'then' | 'else';
    toolIndex: number;
  } | null>(null);

  // System Tools State
  const [systemTools, setSystemTools] = useState<SystemToolsState>({} as SystemToolsState);
  const [systemToolSettings, setSystemToolSettings] = useState<Record<string, SystemToolSetting>>({});
  const [showSystemToolsModal, setShowSystemToolsModal] = useState(false);
  const [selectedSystemTool, setSelectedSystemTool] = useState<SystemToolKey | null>(null);
  const [isSavingSystemTools, setIsSavingSystemTools] = useState(false);

  // Fetch Agent Data for System Tools
  useEffect(() => {
    if (!agentId) return;

    const fetchAgent = async () => {
      try {
        const response = await agentsApi.get(agentId);
        const agent = response.data;

        // Initialize system tools state - always initialize all keys, even if system_tools is undefined
        const toolsState: SystemToolsState = {} as SystemToolsState;
        const settingsState: Record<string, SystemToolSetting> = {};

        SYSTEM_TOOL_KEYS.forEach(key => {
          // Check if tool is enabled (boolean or object with active/enabled prop)
          const toolConfig = agent.system_tools?.[key] || agent.conversation_config?.system_tools?.[key];
          if (typeof toolConfig === 'boolean') {
            toolsState[key] = toolConfig;
            settingsState[key] = {};
          } else if (typeof toolConfig === 'object' && toolConfig !== null) {
            const config = toolConfig as any;
            toolsState[key] = config.active || config.enabled || false;
            settingsState[key] = {
              name: config.name,
              description: config.description,
              disableInterruptions: config.disable_interruptions || config.disableInterruptions,
              transferRules: config.transfer_rules || config.transferRules,
              humanTransferRules: config.human_transfer_rules || config.humanTransferRules,
            };
          } else {
            // Default to false if not configured
            toolsState[key] = false;
            settingsState[key] = {};
          }
        });

        setSystemTools(toolsState);
        setSystemToolSettings(settingsState);
      } catch (error) {
        console.error("Failed to fetch agent system tools:", error);
      }
    };

    fetchAgent();
  }, [agentId]);

  const handleToggleSystemTool = async (key: SystemToolKey, enabled: boolean) => {
    const newSystemTools = { ...systemTools, [key]: enabled };
    setSystemTools(newSystemTools);

    // Optimistic update, actual save happens below
    await saveSystemTools(newSystemTools, systemToolSettings);
  };

  const handleUpdateSystemToolSettings = (key: SystemToolKey, updates: Partial<SystemToolSetting>) => {
    setSystemToolSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updates }
    }));
  };

  const saveSystemTools = async (
    tools: SystemToolsState,
    settings: Record<string, SystemToolSetting>
  ) => {
    if (!agentId || isSavingSystemTools) return;

    setIsSavingSystemTools(true);
    try {
      // 1. Fetch latest agent data to get current conversation_config
      const response = await agentsApi.get(agentId);
      const agent = response.data;
      const currentConfig = agent.conversation_config || {};

      // 2. Build system tools payload (using 'active' instead of 'enabled' to match backend/ElevenLabs)
      const systemToolsPayload: Record<string, any> = {};

      SYSTEM_TOOL_KEYS.forEach(key => {
        const isEnabled = tools[key];
        const toolSettings = settings[key] || {};

        if (!isEnabled) {
          systemToolsPayload[key] = false;
          return;
        }

        if (key === 'transfer_to_agent') {
          systemToolsPayload[key] = {
            active: true,
            description: toolSettings.description || "",
            disable_interruptions: toolSettings.disableInterruptions || false,
            transfer_rules: toolSettings.transferRules || [],
          };
        } else if (key === 'transfer_to_number') {
          systemToolsPayload[key] = {
            active: true,
            description: toolSettings.description || "",
            disable_interruptions: toolSettings.disableInterruptions || false,
            human_transfer_rules: toolSettings.humanTransferRules || [],
          };
        } else {
          systemToolsPayload[key] = {
            active: true,
            description: toolSettings.description || "",
            disable_interruptions: toolSettings.disableInterruptions || false,
          };
        }
      });

      // 3. Update both top-level and conversation_config to ensure sync
      const updatedConfig = {
        ...currentConfig,
        system_tools: systemToolsPayload
      };

      console.log("Saving system tools to agent:", agentId, systemToolsPayload);

      // Include other fields to ensure we don't overwrite them with undefined on PUT
      await agentsApi.update(agentId, {
        name: agent.name,
        system_tools: systemToolsPayload,
        conversation_config: updatedConfig,
        webhook_tools: agent.webhook_tools || [],
        client_tools: agent.client_tools || []
      });

      console.log("System tools saved successfully");

    } catch (error: any) {
      console.error("Failed to save system tools:", error);
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to save system tools";
      alert(`Error saving system tools: ${errorMessage}`);
    } finally {
      setIsSavingSystemTools(false);
    }
  };
  const [configStepIndex, setConfigStepIndex] = useState<number | null>(null);
  const [savedInsertPosition, setSavedInsertPosition] = useState<number | null>(null);
  // Use ref to track insert position to avoid closure issues
  const insertPositionRef = useRef<number | null>(null);
  // Use ref to track configuration state synchronously (avoids async state race conditions)
  const isConfiguringRef = useRef<boolean>(false);
  // Drag and drop state
  const [draggedTool, setDraggedTool] = useState<{
    source: 'main' | 'branch';
    mainIndex?: number;
    conditionIndex?: number;
    branch?: 'then' | 'else';
    branchIndex?: number;
  } | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<{
    target: 'main' | 'branch';
    mainIndex?: number;
    conditionIndex?: number;
    branch?: 'then' | 'else';
    branchIndex?: number;
  } | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get effective tool chain (custom or from function)
  // For custom workflows, use custom_tool_chain; for function-based, use function.tool_chain
  const toolChain: ToolInChain[] =
    agentFunction.custom_tool_chain ||
    agentFunction.effective_tool_chain ||
    agentFunction.function?.tool_chain ||
    [];

  // For custom workflows, use original order. Reordering is handled by drag and drop.
  const sortedToolChain = [...toolChain];

  // Helper to get the tool currently being configured
  const getActiveToolToConfigure = () => {
    if (pendingToolForConfig) return pendingToolForConfig;

    if (selectedBranchTool) {
      const conditionTool = sortedToolChain[selectedBranchTool.conditionIndex];
      return isConditionalTool(conditionTool)
        ? conditionTool.config[selectedBranchTool.branch][selectedBranchTool.toolIndex]
        : null;
    }

    if (selectedToolIndex !== null) {
      return sortedToolChain[selectedToolIndex];
    }

    return null;
  };

  const activeToolToConfigure = getActiveToolToConfigure();

  // Sync webhook form when opening modal for a webhook tool
  useEffect(() => {
    if (showToolConfigModal && activeToolToConfigure?.type === 'webhook') {
      const config = (activeToolToConfigure.config || {}) as any;
      setWebhookForm({
        ...getEmptyWebhookTool(),
        ...config,
      });
    }
  }, [showToolConfigModal, activeToolToConfigure, pendingToolForConfig, selectedBranchTool, selectedToolIndex, sortedToolChain]);

  const handleAddTool = (position: number) => {
    if (readOnly) return;
    setInsertPosition(position);
    insertPositionRef.current = position; // Also store in ref for reliable access
    setSelectedToolIndex(null); // Clear any previously selected tool
    setShowToolModal(true);
  };

  const handleToolSelected = (newTool: ToolInChain) => {
    if (!onToolChainUpdate) return;

    // Handle branch insertion
    if (branchInsertPosition) {
      const { conditionIndex, branch, position } = branchInsertPosition;
      const newToolChain = [...sortedToolChain];
      const conditionTool = newToolChain[conditionIndex];

      if (isConditionalTool(conditionTool)) {
        const updatedConfig = {
          ...conditionTool.config,
          [branch]: [...conditionTool.config[branch]]
        };

        // If tool needs configuration, handle it
        if ((newTool.type === 'calcom' || newTool.type === 'pipedrive') && !newTool.config) {
          setPendingToolForConfig(newTool);
          setBranchInsertPosition({ conditionIndex, branch, position });
          setConfigStepIndex(conditionIndex); // Branch tool step index is the condition's index
          setShowToolModal(false);
          setShowToolConfigModal(true);
          return;
        }

        updatedConfig[branch].splice(position, 0, newTool);

        newToolChain[conditionIndex] = {
          ...conditionTool,
          config: updatedConfig
        };

        onToolChainUpdate(newToolChain);
        setBranchInsertPosition(null);
        setShowToolModal(false);
        return;
      }
    }

    // Handle main tool chain insertion
    if (insertPosition === null) return;

    // Special handling for condition tools - ensure they have proper structure
    if (newTool.type === 'condition') {
      // Ensure condition has proper structure with then and else arrays
      let conditionTool: ToolInChain;
      if (isConditionalTool(newTool)) {
        conditionTool = newTool;
      } else {
        // If condition doesn't have proper structure, initialize it
        conditionTool = {
          type: 'condition',
          role: 'control',
          method: 'branch',
          config: {
            expression: (newTool.config as any)?.expression || "result.length === 0",
            then: (newTool.config as any)?.then || [],
            else: (newTool.config as any)?.else || []
          }
        };
      }

      // Condition always needs configuration, so open config modal
      setPendingToolForConfig(conditionTool);
      setConfigStepIndex(insertPosition ?? 0); // Use insert position for step index
      setShowToolModal(false);
      setShowToolConfigModal(true);
      return;
    }

    // If tool needs configuration (Cal.com or Pipedrive), open config modal first
    if ((newTool.type === 'calcom' || newTool.type === 'pipedrive') && !newTool.config) {
      setPendingToolForConfig(newTool);
      setConfigStepIndex(insertPosition ?? 0); // Use insert position for step index
      setShowToolModal(false);
      setShowToolConfigModal(true);
      return;
    }

    // Insert the new tool at the specified position
    const newToolChain = [...sortedToolChain];
    newToolChain.splice(insertPosition, 0, newTool);

    // Update the workflow
    onToolChainUpdate(newToolChain);
    setInsertPosition(null);
  };

  const handleSavePendingToolConfig = (config: Record<string, any>) => {
    if (!pendingToolForConfig || !onToolChainUpdate) return;

    // Special handling for conditional tools
    if (isConditionalTool(pendingToolForConfig)) {
      // For conditions, ensure the config has the proper structure
      const conditionalConfig: ConditionalConfig = {
        expression: config.expression || pendingToolForConfig.config.expression || "result.length === 0",
        then: config.then || pendingToolForConfig.config.then || [],
        else: config.else || pendingToolForConfig.config.else || []
      };

      const configuredTool: ToolInChain = {
        ...pendingToolForConfig,
        config: conditionalConfig
      };

      // Handle branch insertion
      if (branchInsertPosition) {
        const { conditionIndex, branch, position } = branchInsertPosition;
        const newToolChain = [...sortedToolChain];
        const conditionTool = newToolChain[conditionIndex];

        if (isConditionalTool(conditionTool)) {
          const updatedConfig = {
            ...conditionTool.config,
            [branch]: [...conditionTool.config[branch]]
          };

          updatedConfig[branch].splice(position, 0, configuredTool);

          newToolChain[conditionIndex] = {
            ...conditionTool,
            config: updatedConfig
          };

          onToolChainUpdate(newToolChain);
          setBranchInsertPosition(null);
          setPendingToolForConfig(null);
          setShowToolConfigModal(false);
          return;
        }
      }

      // Handle main tool chain insertion
      if (insertPosition !== null) {
        const newToolChain = [...sortedToolChain];
        newToolChain.splice(insertPosition, 0, configuredTool);
        onToolChainUpdate(newToolChain);
        setInsertPosition(null);
        insertPositionRef.current = null;
        setPendingToolForConfig(null);
        isConfiguringRef.current = false; // Clear configuration flag
        setShowToolConfigModal(false);
        return;
      }

      setPendingToolForConfig(null);
      setShowToolConfigModal(false);
      return;
    }

    // Merge config into the pending tool
    const configuredTool: ToolInChain = {
      ...pendingToolForConfig,
      config: { ...pendingToolForConfig.config, ...config }
    };

    // Handle branch insertion
    if (branchInsertPosition) {
      const { conditionIndex, branch, position } = branchInsertPosition;
      const newToolChain = [...sortedToolChain];
      const conditionTool = newToolChain[conditionIndex];

      if (isConditionalTool(conditionTool)) {
        const updatedConfig = {
          ...conditionTool.config,
          [branch]: [...conditionTool.config[branch]]
        };

        updatedConfig[branch].splice(position, 0, configuredTool);

        newToolChain[conditionIndex] = {
          ...conditionTool,
          config: updatedConfig
        };

        onToolChainUpdate(newToolChain);
        setBranchInsertPosition(null);
        setPendingToolForConfig(null);
        isConfiguringRef.current = false; // Clear configuration flag
        setShowToolConfigModal(false);
        return;
      }
    }

    // Handle main tool chain insertion
    // Use insertPosition if available, otherwise use savedInsertPosition as fallback
    const positionToInsert = insertPosition !== null ? insertPosition : savedInsertPosition;

    // Defensive validation
    if (positionToInsert === null) {
      console.error("No insert position available for tool configuration. Both insertPosition and savedInsertPosition are null.");
      console.log("Debug info:", {
        insertPosition,
        savedInsertPosition,
        insertPositionRef: insertPositionRef.current,
        pendingTool: pendingToolForConfig
      });
      setPendingToolForConfig(null);
      isConfiguringRef.current = false;
      setShowToolConfigModal(false);
      return;
    }

    // Validate position is within bounds
    if (positionToInsert < 0 || positionToInsert > sortedToolChain.length) {
      console.error(`Invalid insert position: ${positionToInsert}. Chain length: ${sortedToolChain.length}`);
      setPendingToolForConfig(null);
      isConfiguringRef.current = false;
      setShowToolConfigModal(false);
      return;
    }

    // Log position for debugging (can be removed later)
    console.log("Inserting tool at position:", positionToInsert, "of", sortedToolChain.length, "tools");

    // Insert the configured tool at the specified position
    const newToolChain = [...sortedToolChain];
    newToolChain.splice(positionToInsert, 0, configuredTool);

    // Update the workflow
    onToolChainUpdate(newToolChain);
    setInsertPosition(null);
    insertPositionRef.current = null;
    setSavedInsertPosition(null);
    setPendingToolForConfig(null);
    isConfiguringRef.current = false; // Clear configuration flag
    setShowToolConfigModal(false);
  };

  const handleAddBranchTool = (conditionIndex: number, branch: 'then' | 'else', position: number) => {
    if (readOnly) return;
    setBranchInsertPosition({ conditionIndex, branch, position });
    setShowToolModal(true);
  };

  const handleRemoveBranchTool = (conditionIndex: number, branch: 'then' | 'else', toolIndex: number) => {
    if (!onToolChainUpdate) return;

    const newToolChain = [...sortedToolChain];
    const conditionTool = newToolChain[conditionIndex];

    if (isConditionalTool(conditionTool)) {
      const updatedConfig = {
        ...conditionTool.config,
        [branch]: conditionTool.config[branch].filter((_, i) => i !== toolIndex)
      };

      newToolChain[conditionIndex] = {
        ...conditionTool,
        config: updatedConfig
      };

      onToolChainUpdate(newToolChain);
    }
  };

  const handleBranchToolClick = (conditionIndex: number, branch: 'then' | 'else', toolIndex: number) => {
    if (readOnly) return;
    setSelectedBranchTool({ conditionIndex, branch, toolIndex });
    setSelectedToolIndex(null); // Clear main tool selection

    // Calculate step index for the branch tool
    // Branch tools are sub-steps of the condition tool step
    // Using conditionIndex is a reasonable approximation for display
    setConfigStepIndex(conditionIndex);
    setShowToolConfigModal(true);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, source: 'main' | 'branch', mainIndex?: number, conditionIndex?: number, branch?: 'then' | 'else', branchIndex?: number) => {
    if (readOnly) return;
    setDraggedTool({ source, mainIndex, conditionIndex, branch, branchIndex });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Required for Firefox
  };

  const handleDragEnd = () => {
    setDraggedTool(null);
    setDragOverPosition(null);
  };

  const handleDragOver = (e: React.DragEvent, target: 'main' | 'branch', mainIndex?: number, conditionIndex?: number, branch?: 'then' | 'else', branchIndex?: number) => {
    if (readOnly || !draggedTool) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverPosition({ target, mainIndex, conditionIndex, branch, branchIndex });
  };

  const handleDrop = (e: React.DragEvent, target: 'main' | 'branch', targetMainIndex?: number, targetConditionIndex?: number, targetBranch?: 'then' | 'else', targetBranchIndex?: number) => {
    if (readOnly || !draggedTool || !onToolChainUpdate) return;
    e.preventDefault();
    e.stopPropagation();

    const newToolChain = [...sortedToolChain];

    // Get the tool being moved
    let toolToMove: ToolInChain | null = null;

    if (draggedTool.source === 'main' && draggedTool.mainIndex !== undefined) {
      toolToMove = newToolChain[draggedTool.mainIndex];
    } else if (draggedTool.source === 'branch' && draggedTool.conditionIndex !== undefined && draggedTool.branch && draggedTool.branchIndex !== undefined) {
      const conditionTool = newToolChain[draggedTool.conditionIndex];
      if (isConditionalTool(conditionTool)) {
        toolToMove = conditionTool.config[draggedTool.branch][draggedTool.branchIndex];
      }
    }

    if (!toolToMove) return;

    // Remove tool from source first, then adjust target indices
    let sourceRemoved = false;

    if (draggedTool.source === 'main' && draggedTool.mainIndex !== undefined) {
      // Adjust target main index if dragging from before target in main chain
      if (target === 'main' && targetMainIndex !== undefined && draggedTool.mainIndex < targetMainIndex) {
        targetMainIndex -= 1;
      }
      // Adjust target main index if dragging from main to main and source is after target
      // (No adjustment needed if source is before target, already handled above)
      newToolChain.splice(draggedTool.mainIndex, 1);
      sourceRemoved = true;
    } else if (draggedTool.source === 'branch' && draggedTool.conditionIndex !== undefined && draggedTool.branch && draggedTool.branchIndex !== undefined) {
      const conditionTool = newToolChain[draggedTool.conditionIndex];
      if (isConditionalTool(conditionTool)) {
        // Adjust target branch index if dragging within same branch
        if (target === 'branch' &&
          targetConditionIndex === draggedTool.conditionIndex &&
          targetBranch === draggedTool.branch &&
          targetBranchIndex !== undefined &&
          draggedTool.branchIndex < targetBranchIndex) {
          targetBranchIndex -= 1;
        }
        // Note: No adjustment needed when dragging from branch to main
        // The condition stays in place, so main indices don't shift


        const updatedConfig = {
          ...conditionTool.config,
          [draggedTool.branch]: conditionTool.config[draggedTool.branch].filter((_, i) => i !== draggedTool.branchIndex)
        };
        newToolChain[draggedTool.conditionIndex] = {
          ...conditionTool,
          config: updatedConfig
        };
        sourceRemoved = true;
      }
    }

    if (!sourceRemoved) return;

    // Insert tool at target
    if (target === 'main' && targetMainIndex !== undefined) {
      newToolChain.splice(targetMainIndex, 0, toolToMove);
    } else if (target === 'branch' && targetConditionIndex !== undefined && targetBranch && targetBranchIndex !== undefined) {
      const conditionTool = newToolChain[targetConditionIndex];
      if (isConditionalTool(conditionTool)) {
        const updatedConfig = {
          ...conditionTool.config,
          [targetBranch]: [...conditionTool.config[targetBranch]]
        };
        updatedConfig[targetBranch].splice(targetBranchIndex, 0, toolToMove);
        newToolChain[targetConditionIndex] = {
          ...conditionTool,
          config: updatedConfig
        };
      }
    }

    onToolChainUpdate(newToolChain);
    setDraggedTool(null);
    setDragOverPosition(null);
  };

  const handleDragLeave = () => {
    setDragOverPosition(null);
  };

  // Helper function to calculate step index for a tool being configured
  const calculateStepIndex = (): number => {
    // If configuring a main chain tool, use its index
    if (selectedToolIndex !== null) {
      return selectedToolIndex;
    }
    // If configuring a branch tool, use the condition's index
    if (selectedBranchTool !== null) {
      return selectedBranchTool.conditionIndex;
    }
    // If configuring a pending tool with insert position, use that
    if (pendingToolForConfig && insertPosition !== null) {
      return insertPosition;
    }
    // Default fallback
    return 0;
  };

  const handleToolClick = (toolIndex: number) => {
    if (readOnly) return;
    setSelectedToolIndex(toolIndex);
    setSelectedBranchTool(null); // Clear branch selection
    setConfigStepIndex(toolIndex);
    setShowToolConfigModal(true);
  };



  const handleRemoveTool = () => {
    if (!onToolChainUpdate) return;

    // Handle branch tool removal
    if (selectedBranchTool) {
      const { conditionIndex, branch, toolIndex } = selectedBranchTool;
      const newToolChain = [...sortedToolChain];
      const conditionTool = newToolChain[conditionIndex];

      if (isConditionalTool(conditionTool)) {
        const updatedConfig = {
          ...conditionTool.config,
          [branch]: conditionTool.config[branch].filter((_, i) => i !== toolIndex)
        };

        newToolChain[conditionIndex] = {
          ...conditionTool,
          config: updatedConfig
        };

        onToolChainUpdate(newToolChain);
        setSelectedBranchTool(null);
        setShowToolConfigModal(false);
        return;
      }
    }

    // Handle main tool chain removal
    if (selectedToolIndex === null) return;

    const newToolChain = [...sortedToolChain];
    newToolChain.splice(selectedToolIndex, 1);

    onToolChainUpdate(newToolChain);
    setSelectedToolIndex(null);
    setShowToolConfigModal(false);
  };
  const handleRemoveMainTool = (index: number) => {
    if (!onToolChainUpdate || readOnly) return;
    const newToolChain = [...sortedToolChain];
    newToolChain.splice(index, 1);
    onToolChainUpdate(newToolChain);
  };

  const handleReplaceTool = () => {
    if (selectedToolIndex === null) return;
    setInsertPosition(selectedToolIndex);
    insertPositionRef.current = selectedToolIndex; // Ensure ref is synced for replace
    setShowToolConfigModal(false);
    setShowToolModal(true);
  };

  const handleReplaceToolSelected = (newTool: ToolInChain) => {
    if (selectedToolIndex === null || !onToolChainUpdate) return;

    const newToolChain = [...sortedToolChain];
    newToolChain[selectedToolIndex] = newTool;

    onToolChainUpdate(newToolChain);
    setSelectedToolIndex(null);
    setInsertPosition(null);
  };


  const handleSaveToolChainConfig = (configuredToolChain: ToolInChain[]) => {
    if (!onToolChainUpdate) return;

    // Update entire tool chain with configurations
    onToolChainUpdate(configuredToolChain);
    setShowToolChainWizard(false);
  };

  const handleSaveToolConfig = (config: Record<string, any>) => {
    if (!onToolChainUpdate) {
      handleSavePendingToolConfig(config);
      return;
    }

    // Handle branch tool configuration
    if (selectedBranchTool !== null) {
      const { conditionIndex, branch, toolIndex } = selectedBranchTool;
      const newToolChain = [...sortedToolChain];
      const conditionTool = newToolChain[conditionIndex];

      if (isConditionalTool(conditionTool)) {
        const branchTools = [...conditionTool.config[branch]];
        const branchTool = branchTools[toolIndex];

        // Update the branch tool's config
        const updatedBranchTool: ToolInChain = { ...branchTool };
        if (config.method) {
          updatedBranchTool.method = config.method;
        }

        branchTools[toolIndex] = {
          ...updatedBranchTool,
          config: { ...(branchTool.config || {}), ...config }
        };

        // Update the condition tool with the modified branch
        const updatedConfig = {
          ...conditionTool.config,
          [branch]: branchTools
        };

        newToolChain[conditionIndex] = {
          ...conditionTool,
          config: updatedConfig
        };

        onToolChainUpdate(newToolChain);
        setShowToolConfigModal(false);
        setSelectedBranchTool(null);
        setConfigStepIndex(null);
        isConfiguringRef.current = false; // Clear configuration flag
        return;
      }
    }

    // Handle main chain tool configuration
    if (selectedToolIndex !== null) {
      const newToolChain = [...sortedToolChain];
      const tool = newToolChain[selectedToolIndex];

      // If method is in config, also set it on the tool itself
      const updatedTool: ToolInChain = { ...tool };
      if (config.method) {
        updatedTool.method = config.method;
      }

      newToolChain[selectedToolIndex] = {
        ...updatedTool,
        config: { ...(tool.config || {}), ...config }
      };

      onToolChainUpdate(newToolChain);
      setShowToolConfigModal(false);
      setSelectedToolIndex(null);
      setConfigStepIndex(null);
      isConfiguringRef.current = false; // Clear configuration flag
      return;
    }

    // If no selectedToolIndex or selectedBranchTool, we're configuring a pending tool
    handleSavePendingToolConfig(config);
  };

  const handleConfigureCredentials = () => {
    if (!onConfigureCredentials) return;

    let toolType = '';
    if (selectedToolIndex !== null) {
      toolType = sortedToolChain[selectedToolIndex].type;
    } else if (selectedBranchTool) {
      const conditionTool = sortedToolChain[selectedBranchTool.conditionIndex];
      if (isConditionalTool(conditionTool)) {
        toolType = conditionTool.config[selectedBranchTool.branch][selectedBranchTool.toolIndex].type;
      }
    } else if (pendingToolForConfig) {
      toolType = pendingToolForConfig.type;
    }

    if (!toolType) return;

    // Map tool type to integration type
    const integrationType = toolType === 'twilio' ? 'twilio' : toolType;
    onConfigureCredentials(integrationType);
  };

  // Determine the role that should come next based on position
  const getExpectedRoleForPosition = (position: number): string | undefined => {
    // Allow any tools at any position
    return undefined;
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isFullscreen ? "fullscreen" : "normal"}
        initial={{ opacity: 0, y: isFullscreen ? 20 : 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: isFullscreen ? -20 : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={cn(
          "relative w-full",
          isFullscreen ? "fixed inset-0 z-[40] bg-slate-50 dark:bg-slate-950 flex flex-col pt-24 pb-32 overflow-y-auto overflow-x-hidden" : ""
        )}
      >
        {isFullscreen && (
          <div className="fixed top-0 left-0 right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-[110] flex items-center justify-between px-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center ring-4 ring-primary/5">
                <Bot className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Workflow Editor</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-tight">Immersive view for complex agent configurations</p>
              </div>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="group flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl transition-all font-bold text-sm text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95"
            >
              <Minimize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Exit Fullscreen
            </button>
          </div>
        )}

        {!isFullscreen && !readOnly && (
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-0 right-0 p-3 bg-white/50 dark:bg-slate-900/50 hover:bg-primary/10 text-slate-400 hover:text-primary rounded-2xl transition-all z-10 border border-transparent hover:border-primary/20 backdrop-blur-sm"
            title="Fullscreen Mode"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col items-center gap-3">
          {/* Enhanced Agent Starting Node */}
          <div
            className={cn(
              "relative group flex items-center gap-3 px-6 py-4 rounded-2xl",
              "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent",
              "border-2 border-primary/20",
              "shadow-[var(--shadow-workflow-md)]",
              "hover:shadow-[var(--shadow-workflow-lg)] hover:border-primary/30",
              !readOnly && "cursor-pointer hover:-translate-y-0.5 active:scale-95",
              "transition-all duration-200",
              !readOnly && "animate-pulse-slow"
            )}
            onClick={readOnly ? undefined : () => setShowSystemToolsModal(true)}
            title={readOnly ? undefined : "Click to configure system tools"}
          >
            {/* Pulsing glow effect */}
            {!readOnly && (
              <div className="absolute inset-0 rounded-2xl bg-primary/10 opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300" />
            )}

            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Icon with status indicator */}
            <div className="relative w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Bot className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
              {/* Click indicator icon */}
              {!readOnly && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
                  <Settings className="w-2.5 h-2.5 text-primary" />
                </div>
              )}
            </div>

            {/* Text */}
            <div className="relative">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI Agent</span>
                {!readOnly && (
                  <Sparkles className="w-3.5 h-3.5 text-primary opacity-60 group-hover:opacity-100 group-hover:animate-pulse transition-opacity" />
                )}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {readOnly ? "Workflow starting point" : "Click to configure system tools"}
              </div>
            </div>
          </div>

          {/* System Tool Connections */}
          <div className="flex justify-center gap-4 w-full px-8">
            {(['end_call', 'detect_language', 'voicemail_detection'] as SystemToolKey[]).map((key) => {
              if (!systemTools[key]) return null;

              const getToolConfig = (key: SystemToolKey) => {
                switch (key) {
                  case 'end_call': return { icon: PhoneOff, label: 'End Call', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-900' };
                  case 'detect_language': return { icon: Languages, label: 'Detect Lang', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-900' };
                  case 'voicemail_detection': return { icon: Voicemail, label: 'Voicemail', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-900' };
                  default: return { icon: Settings2, label: key, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' };
                }
              };

              const config = getToolConfig(key);
              const Icon = config.icon;

              return (
                <div
                  key={key}
                  className="flex flex-col items-center relative group"
                >
                  {/* Connection Line from Agent */}
                  <div className="h-6 w-0.5 bg-slate-200 dark:bg-slate-700 absolute -top-6 left-1/2 -translate-x-1/2" />

                  {/* Tool Node */}
                  <div
                    onClick={() => setSelectedSystemTool(key)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all cursor-pointer z-10",
                      config.bg, config.border,
                      "hover:shadow-md hover:scale-105"
                    )}
                  >
                    <Icon className={cn("w-3.5 h-3.5", config.color)} />
                    <span className={cn("text-xs font-medium", config.color)}>{config.label}</span>
                  </div>

                  {/* Merge back line (visual only, fades out) */}
                  <div className="h-4 w-0.5 bg-gradient-to-b from-slate-200 to-transparent dark:from-slate-700 absolute -bottom-4 left-1/2 -translate-x-1/2" />
                </div>
              );
            })}
          </div>

          {/* Drop zone after Agent and System Tools (only for drag and drop, no visible button) */}
          {!readOnly && (
            <div
              onDragOver={(e) => handleDragOver(e, 'main', 0)}
              onDrop={(e) => handleDrop(e, 'main', 0)}
              onDragLeave={handleDragLeave}
              onMouseEnter={() => setHoveredInsertPosition(0)}
              onMouseLeave={() => setHoveredInsertPosition(null)}
              className={cn(
                "w-full transition-all duration-200 cursor-pointer",
                dragOverPosition?.target === 'main' && dragOverPosition.mainIndex === 0
                  ? "bg-primary/10 border-t-2 border-primary border-dashed py-8"
                  : draggedTool
                    ? "py-4"
                    : "py-2"
              )}
              title="Drop tool here"
            >
              {draggedTool && (
                <div className={cn(
                  "flex items-center justify-center transition-all duration-200",
                  (dragOverPosition?.target === 'main' && dragOverPosition.mainIndex === 0) || hoveredInsertPosition === 0
                    ? "opacity-100"
                    : "opacity-50"
                )}>
                  <div className="w-full max-w-[280px] border-2 border-dashed border-primary/40 rounded-2xl bg-primary/5 h-16 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Drop zone before first tool (position 0) - shown when first tool exists */}
          {!readOnly && sortedToolChain.length > 0 && (
            <div
              onDragOver={(e) => handleDragOver(e, 'main', 0)}
              onDrop={(e) => handleDrop(e, 'main', 0)}
              onDragLeave={handleDragLeave}
              onClick={() => handleAddTool(0)}
              onMouseEnter={() => setHoveredInsertPosition(0)}
              onMouseLeave={() => setHoveredInsertPosition(null)}
              className={cn(
                "relative group cursor-pointer w-full flex flex-col items-center transition-all duration-300",
                "py-8 -my-4 min-h-[80px]"
              )}
            >
              {/* Connector inside the hit area */}
              <LinearConnector distance="sm" variant="primary" animated />

              {/* Expanded Insert/Ghost Card Indicator */}
              <div className={cn(
                "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[280px] transition-all duration-300 pointer-events-none",
                (hoveredInsertPosition === 0 || (dragOverPosition?.target === 'main' && dragOverPosition.mainIndex === 0))
                  ? "opacity-100 scale-100 h-24"
                  : draggedTool
                    ? "opacity-60 scale-95 h-16"
                    : "opacity-0 scale-95 h-0"
              )}>
                <div className="w-full h-full border-2 border-dashed border-primary/40 rounded-2xl bg-primary/5 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>

              {/* Fallback subtle indicator when not hovered but in drag mode */}
              {draggedTool && !((hoveredInsertPosition === 0 || (dragOverPosition?.target === 'main' && dragOverPosition.mainIndex === 0))) && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center animate-pulse">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
              )}
            </div>
          )}

          {/* Spacer if no tools */}
          {sortedToolChain.length === 0 && (
            <div className="h-8" />
          )}

          {/* Render tools with insert points between them */}
          {sortedToolChain.map((tool, index) => {
            const isCondition = isConditionalTool(tool);
            const isLast = index === sortedToolChain.length - 1;
            const nextTool = !isLast ? sortedToolChain[index + 1] : null;
            const isNextCondition = nextTool ? isConditionalTool(nextTool) : false;

            return (
              <React.Fragment key={index}>
                {isCondition ? (
                  <div className="flex flex-col items-center gap-3 w-full my-4">
                    {/* Drop zone before condition (to insert before this condition) - only show if not first tool (position 0 is handled after Agent) */}
                    {!readOnly && index > 0 && (
                      <div
                        onDragOver={(e) => handleDragOver(e, 'main', index)}
                        onDrop={(e) => handleDrop(e, 'main', index)}
                        onDragLeave={handleDragLeave}
                        onClick={() => handleAddTool(index)}
                        onMouseEnter={() => setHoveredInsertPosition(index)}
                        onMouseLeave={() => setHoveredInsertPosition(null)}
                        className={cn(
                          "relative group cursor-pointer w-full flex flex-col items-center transition-all duration-300",
                          "py-8 -my-4 min-h-[80px]"
                        )}
                      >
                        {/* Connector inside the hit area */}
                        <LinearConnector distance="md" variant="primary" />

                        {/* Expanded Insert/Ghost Card Indicator */}
                        <div className={cn(
                          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[280px] transition-all duration-300 pointer-events-none",
                          (hoveredInsertPosition === index || (dragOverPosition?.target === 'main' && dragOverPosition.mainIndex === index))
                            ? "opacity-100 scale-100 h-24"
                            : draggedTool
                              ? "opacity-60 scale-95 h-16"
                              : "opacity-0 scale-95 h-0"
                        )}>
                          <div className="w-full h-full border-2 border-dashed border-primary/40 rounded-2xl bg-primary/5 flex items-center justify-center">
                            <Plus className="w-6 h-6 text-primary animate-pulse" />
                          </div>
                        </div>

                        {/* Fallback subtle indicator when not hovered but in drag mode */}
                        {draggedTool && !((hoveredInsertPosition === index || (dragOverPosition?.target === 'main' && dragOverPosition.mainIndex === index))) && (
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center animate-pulse">
                            <Plus className="w-5 h-5 text-primary" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Connector from previous node to condition */}
                    {index > 0 && (
                      <ArrowDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}

                    {/* Enhanced Condition Decision Node */}
                    <div
                      onClick={readOnly ? undefined : () => handleToolClick(index)}
                      className={cn(
                        "relative group px-6 py-5 rounded-2xl",
                        "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800",
                        "shadow-[var(--shadow-workflow-md)]",
                        "bg-gradient-to-br from-slate-50/50 via-transparent to-transparent",
                        !readOnly && "hover:shadow-[var(--shadow-workflow-lg)] hover:-translate-y-1 hover:border-primary/40 cursor-pointer",
                        "transition-all duration-300"
                      )}
                    >
                      {/* Corner glow */}
                      <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-primary/15 to-transparent rounded-tl-2xl opacity-50 transition-opacity group-hover:opacity-80" />

                      {/* Header */}
                      <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center ring-4 ring-primary/5 transition-transform group-hover:scale-110">
                          <GitBranch className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">Conditional Branch</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.1em] mt-0.5">Control Flow</div>
                        </div>
                      </div>

                      {/* Expression */}
                      <div className="relative z-10 py-3 px-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors group-hover:bg-white dark:group-hover:bg-slate-800">
                        <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-1.5 flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-primary/40" />
                          Branch Condition
                        </div>
                        <code className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200 block truncate">
                          {getConditionLabel(tool.config.expression)}
                        </code>
                      </div>

                      {/* Active sparkle */}
                      {!readOnly && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                          <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                        </div>
                      )}
                    </div>

                    {/* Branch Connector */}
                    <BranchConnector branchLabels={{ left: "If True", right: "If False" }} />

                    {/* Branching structure - Two paths side by side (responsive) */}
                    <div className="relative flex flex-col md:flex-row gap-4 md:gap-8 w-full px-4">
                      {/* Path background indicators */}
                      <div className="absolute inset-0 pointer-events-none hidden md:flex">
                        <div className="w-1/2 h-full bg-green-50/30 dark:bg-green-950/10 rounded-l-xl" />
                        <div className="w-1/2 h-full bg-red-50/30 dark:bg-red-950/10 rounded-r-xl" />
                      </div>

                      {/* If True Branch - Left side */}
                      <div className="flex flex-col flex-1 relative">
                        {/* Branch Header */}
                        <BranchHeader
                          label="If True"
                          icon={<Check className="w-3 h-3" />}
                          color="green"
                        />

                        {/* Tools in then branch - displayed as sequential vertical flow */}
                        <div className="space-y-3 mt-4 relative pl-4 flex flex-col justify-center items-center w-full">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-300 dark:bg-green-700" />

                          {/* Initial Insert Point (at the start of the branch) */}
                          {!readOnly && (
                            <div
                              onDragOver={(e) => handleDragOver(e, 'branch', undefined, index, 'then', 0)}
                              onDrop={(e) => handleDrop(e, 'branch', undefined, index, 'then', 0)}
                              onDragLeave={handleDragLeave}
                              onClick={() => handleAddBranchTool(index, 'then', 0)}
                              onMouseEnter={() => setHoveredInsertPosition(index + 5000)} // Unique hover ID
                              onMouseLeave={() => setHoveredInsertPosition(null)}
                              className={cn(
                                "relative group cursor-pointer w-full flex flex-col items-center transition-all duration-300",
                                tool.config.then.length === 0 ? "py-10" : "py-6 -mb-2"
                              )}
                            >
                              <div className={cn(
                                "w-full max-w-[240px] transition-all duration-300 pointer-events-none flex items-center justify-center",
                                (hoveredInsertPosition === index + 5000 || (dragOverPosition?.target === 'branch' && dragOverPosition.conditionIndex === index && dragOverPosition.branch === 'then' && dragOverPosition.branchIndex === 0))
                                  ? "h-20 opacity-100 scale-100"
                                  : tool.config.then.length === 0 ? "h-14 opacity-70 border-2 border-dashed border-green-200 dark:border-green-800 rounded-lg" : "h-0 opacity-0 scale-95"
                              )}>
                                <div className={cn(
                                  "w-full h-full border-2 border-dashed rounded-xl flex items-center justify-center transition-colors",
                                  (hoveredInsertPosition === index + 5000 || (dragOverPosition?.target === 'branch' && dragOverPosition.conditionIndex === index && dragOverPosition.branch === 'then' && dragOverPosition.branchIndex === 0))
                                    ? "border-green-500 bg-green-50/50"
                                    : "border-transparent"
                                )}>
                                  <Plus className={cn(
                                    "transition-all duration-300",
                                    (hoveredInsertPosition === index + 5000 || (dragOverPosition?.target === 'branch' && dragOverPosition.conditionIndex === index && dragOverPosition.branch === 'then' && dragOverPosition.branchIndex === 0))
                                      ? "w-6 h-6 text-green-600 animate-pulse"
                                      : "w-4 h-4 text-green-400"
                                  )} />
                                  {tool.config.then.length === 0 && !(hoveredInsertPosition === index + 5000 || (dragOverPosition?.target === 'branch' && dragOverPosition.conditionIndex === index && dragOverPosition.branch === 'then' && dragOverPosition.branchIndex === 0)) && (
                                    <span className="ml-2 text-xs font-medium text-green-600/70">Add Step</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {tool.config.then.map((branchTool, branchIndex) => (
                            <React.Fragment key={`condition-${index}-then-${branchIndex}`}>
                              <div
                                draggable={!readOnly}
                                onDragStart={(e) => handleDragStart(e, 'branch', undefined, index, 'then', branchIndex)}
                                onDragEnd={handleDragEnd}
                                className="w-full"
                              >
                                <BranchToolCard
                                  tool={branchTool}
                                  onClick={() => handleBranchToolClick(index, 'then', branchIndex)}
                                  onRemove={() => handleRemoveBranchTool(index, 'then', branchIndex)}
                                  readOnly={readOnly}
                                  isDragging={draggedTool?.source === 'branch' && draggedTool.conditionIndex === index && draggedTool.branch === 'then' && draggedTool.branchIndex === branchIndex}
                                />
                              </div>

                              {/* Insert point after tool */}
                              {!readOnly && (
                                <div
                                  onDragOver={(e) => handleDragOver(e, 'branch', undefined, index, 'then', branchIndex + 1)}
                                  onDrop={(e) => handleDrop(e, 'branch', undefined, index, 'then', branchIndex + 1)}
                                  onDragLeave={handleDragLeave}
                                  onClick={() => handleAddBranchTool(index, 'then', branchIndex + 1)}
                                  onMouseEnter={() => setHoveredInsertPosition(branchIndex + index * 100 + 6000)} // Unique hover ID
                                  onMouseLeave={() => setHoveredInsertPosition(null)}
                                  className="relative group cursor-pointer w-full py-6 -my-2 flex flex-col items-center transition-all duration-300"
                                >
                                  {/* Connector/Arrow */}
                                  {branchIndex < tool.config.then.length - 1 && (
                                    <ArrowDown className="h-4 w-4 text-green-300/60 mb-1" />
                                  )}

                                  {/* Ghost Card Indicator */}
                                  <div className={cn(
                                    "w-full max-w-[240px] transition-all duration-300 pointer-events-none",
                                    (hoveredInsertPosition === branchIndex + index * 100 + 6000 || (dragOverPosition?.target === 'branch' && dragOverPosition.conditionIndex === index && dragOverPosition.branch === 'then' && dragOverPosition.branchIndex === branchIndex + 1))
                                      ? "h-20 opacity-100 scale-100"
                                      : "h-0 opacity-0 scale-95"
                                  )}>
                                    <div className="w-full h-full border-2 border-dashed border-green-400 rounded-xl bg-green-50/50 flex items-center justify-center">
                                      <Plus className="w-6 h-6 text-green-600 animate-pulse" />
                                    </div>
                                  </div>

                                  {/* Fallback subtle indicator */}
                                  {draggedTool && !(hoveredInsertPosition === branchIndex + index * 100 + 6000 || (dragOverPosition?.target === 'branch' && dragOverPosition.conditionIndex === index && dragOverPosition.branch === 'then' && dragOverPosition.branchIndex === branchIndex + 1)) && (
                                    <Plus className="w-4 h-4 text-green-300/40" />
                                  )}
                                </div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Branch line continuing down to merge */}
                        {tool.config.then.length > 0 && (
                          <ArrowDown className="h-4 w-4 text-green-300/40 mt-2" />
                        )}
                        {tool.config.then.length === 0 && !readOnly && (
                          <div className="h-4"></div>
                        )}
                      </div>

                      {/* Vertical divider */}
                      <div className="w-px bg-gradient-to-b from-transparent via-slate-200 dark:via-slate-700 to-transparent"></div>

                      {/* If False Branch - Right side */}
                      <div className="flex flex-col flex-1 relative">
                        {/* Branch Header */}
                        <BranchHeader
                          label="If False"
                          icon={<X className="w-3 h-3" />}
                          color="red"
                        />

                        {/* Tools in else branch - displayed as sequential vertical flow */}
                        <div className="space-y-3 mt-4 relative pl-4 flex flex-col justify-center items-center w-full">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-300 dark:bg-red-700" />

                          {/* Initial Insert Point (at the start of the branch) */}
                          {!readOnly && (
                            <div
                              onDragOver={(e) => handleDragOver(e, 'branch', undefined, index, 'else', 0)}
                              onDrop={(e) => handleDrop(e, 'branch', undefined, index, 'else', 0)}
                              onDragLeave={handleDragLeave}
                              onClick={() => handleAddBranchTool(index, 'else', 0)}
                              onMouseEnter={() => setHoveredInsertPosition(index + 7000)} // Unique hover ID
                              onMouseLeave={() => setHoveredInsertPosition(null)}
                              className={cn(
                                "relative group cursor-pointer w-full flex flex-col items-center transition-all duration-300",
                                tool.config.else.length === 0 ? "py-10" : "py-6 -mb-2"
                              )}
                            >
                              <div className={cn(
                                "w-full max-w-[240px] transition-all duration-300 pointer-events-none flex items-center justify-center",
                                (hoveredInsertPosition === index + 7000 || (dragOverPosition?.target === 'branch' && dragOverPosition.conditionIndex === index && dragOverPosition.branch === 'else' && dragOverPosition.branchIndex === 0))
                                  ? "h-20 opacity-100 scale-100"
                                  : tool.config.else.length === 0 ? "h-14 opacity-70 border-2 border-dashed border-red-200 dark:border-red-800 rounded-lg" : "h-0 opacity-0 scale-95"
                              )}>
                                <div className={cn(
                                  "w-full h-full border-2 border-dashed rounded-xl flex items-center justify-center transition-colors",
                                  (hoveredInsertPosition === index + 7000 || (dragOverPosition?.target === 'branch' && dragOverPosition.conditionIndex === index && dragOverPosition.branch === 'else' && dragOverPosition.branchIndex === 0))
                                    ? "border-red-500 bg-red-50/50"
                                    : "border-transparent"
                                )}>
                                  <Plus className={cn(
                                    "transition-all duration-300",
                                    (hoveredInsertPosition === index + 7000 || (dragOverPosition?.target === 'branch' && dragOverPosition.conditionIndex === index && dragOverPosition.branch === 'else' && dragOverPosition.branchIndex === 0))
                                      ? "w-6 h-6 text-red-600 animate-pulse"
                                      : "w-4 h-4 text-red-400"
                                  )} />
                                  {tool.config.else.length === 0 && !(hoveredInsertPosition === index + 7000 || (dragOverPosition?.target === 'branch' && dragOverPosition.conditionIndex === index && dragOverPosition.branch === 'else' && dragOverPosition.branchIndex === 0)) && (
                                    <span className="ml-2 text-xs font-medium text-red-600/70">Add Step</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {tool.config.else.map((branchTool, branchIndex) => (
                            <React.Fragment key={`condition-${index}-else-${branchIndex}`}>
                              <div
                                draggable={!readOnly}
                                onDragStart={(e) => handleDragStart(e, 'branch', undefined, index, 'else', branchIndex)}
                                onDragEnd={handleDragEnd}
                                className="w-full"
                              >
                                <BranchToolCard
                                  tool={branchTool}
                                  onClick={() => handleBranchToolClick(index, 'else', branchIndex)}
                                  onRemove={() => handleRemoveBranchTool(index, 'else', branchIndex)}
                                  readOnly={readOnly}
                                  isDragging={draggedTool?.source === 'branch' && draggedTool.conditionIndex === index && draggedTool.branch === 'else' && draggedTool.branchIndex === branchIndex}
                                />
                              </div>

                              {/* Insert point after tool */}
                              {!readOnly && (
                                <div
                                  onDragOver={(e) => handleDragOver(e, 'branch', undefined, index, 'else', branchIndex + 1)}
                                  onDrop={(e) => handleDrop(e, 'branch', undefined, index, 'else', branchIndex + 1)}
                                  onDragLeave={handleDragLeave}
                                  onClick={() => handleAddBranchTool(index, 'else', branchIndex + 1)}
                                  onMouseEnter={() => setHoveredInsertPosition(branchIndex + index * 100 + 8000)} // Unique hover ID
                                  onMouseLeave={() => setHoveredInsertPosition(null)}
                                  className="relative group cursor-pointer w-full py-6 -my-2 flex flex-col items-center transition-all duration-300"
                                >
                                  {/* Connector/Arrow */}
                                  {branchIndex < tool.config.else.length - 1 && (
                                    <ArrowDown className="h-4 w-4 text-red-300/60 mb-1" />
                                  )}

                                  {/* Ghost Card Indicator */}
                                  <div className={cn(
                                    "w-full max-w-[240px] transition-all duration-300 pointer-events-none",
                                    (hoveredInsertPosition === branchIndex + index * 100 + 8000 || (dragOverPosition?.target === 'branch' && dragOverPosition.conditionIndex === index && dragOverPosition.branch === 'else' && dragOverPosition.branchIndex === branchIndex + 1))
                                      ? "h-20 opacity-100 scale-100"
                                      : "h-0 opacity-0 scale-95"
                                  )}>
                                    <div className="w-full h-full border-2 border-dashed border-red-400 rounded-xl bg-red-50/50 flex items-center justify-center">
                                      <Plus className="w-6 h-6 text-red-600 animate-pulse" />
                                    </div>
                                  </div>

                                  {/* Fallback subtle indicator */}
                                  {draggedTool && !(hoveredInsertPosition === branchIndex + index * 100 + 8000 || (dragOverPosition?.target === 'branch' && dragOverPosition.conditionIndex === index && dragOverPosition.branch === 'else' && dragOverPosition.branchIndex === branchIndex + 1)) && (
                                    <Plus className="w-4 h-4 text-red-300/40" />
                                  )}
                                </div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Branch line continuing down to merge */}
                        {tool.config.else.length > 0 && (
                          <ArrowDown className="h-4 w-4 text-red-300/40 mt-2" />
                        )}
                        {tool.config.else.length === 0 && !readOnly && (
                          <div className="h-4"></div>
                        )}
                      </div>
                    </div>

                    {/* Merge point - End of condition, continue main flow */}
                    {!isLast && <MergeConnector />}

                    {/* Drop zone after condition if it's the last item */}
                    {isLast && !readOnly && (
                      <div
                        onDragOver={(e) => handleDragOver(e, 'main', index + 1)}
                        onDrop={(e) => handleDrop(e, 'main', index + 1)}
                        onDragLeave={handleDragLeave}
                        onClick={() => handleAddTool(index + 1)}
                        onMouseEnter={() => setHoveredInsertPosition(index + 1)}
                        onMouseLeave={() => setHoveredInsertPosition(null)}
                        className="relative group cursor-pointer py-6 mt-4 w-full max-w-2xl mx-auto"
                      >
                        {/* Subtle line indicator */}
                        <div className={cn(
                          "h-px w-full transition-all duration-200",
                          (hoveredInsertPosition === index + 1 || (dragOverPosition?.target === 'main' && dragOverPosition.mainIndex === index + 1))
                            ? "bg-primary/40 scale-x-100"
                            : "bg-slate-200 dark:bg-slate-700 scale-x-50"
                        )} />

                        {/* Insert button */}
                        <div className={cn(
                          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                          "flex items-center gap-2 px-3 py-1.5 rounded-full",
                          "transition-all duration-200 whitespace-nowrap",
                          (hoveredInsertPosition === index + 1 || (dragOverPosition?.target === 'main' && dragOverPosition.mainIndex === index + 1)) ? [
                            "bg-primary text-white shadow-md scale-100 opacity-100"
                          ] : [
                            "bg-slate-100 dark:bg-slate-800 text-slate-400 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100"
                          ]
                        )}>
                          <Plus className="w-3.5 h-3.5" />
                          {(hoveredInsertPosition === index + 1 || (dragOverPosition?.target === 'main' && dragOverPosition.mainIndex === index + 1)) && (
                            <span className="text-xs font-medium">Add tool</span>
                          )}
                        </div>
                      </div>
                    )
                    }
                  </div >
                ) : (
                  <>
                    {/* Drop zone above tool (to insert before this tool) - only show if not first tool (position 0 is handled after Agent) */}
                    {!readOnly && index > 0 && (
                      <div
                        onDragOver={(e) => handleDragOver(e, 'main', index)}
                        onDrop={(e) => handleDrop(e, 'main', index)}
                        onDragLeave={handleDragLeave}
                        onClick={() => handleAddTool(index)}
                        onMouseEnter={() => setHoveredInsertPosition(index)}
                        onMouseLeave={() => setHoveredInsertPosition(null)}
                        className={cn(
                          "relative group cursor-pointer w-full flex flex-col items-center transition-all duration-300",
                          "py-8 -my-4 min-h-[80px]"
                        )}
                      >
                        {/* Connector inside the hit area */}
                        <LinearConnector distance="md" variant="primary" />

                        {/* Expanded Insert/Ghost Card Indicator */}
                        <div className={cn(
                          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[280px] transition-all duration-300 pointer-events-none",
                          (hoveredInsertPosition === index || (dragOverPosition?.target === 'main' && dragOverPosition.mainIndex === index))
                            ? "opacity-100 scale-100 h-24"
                            : draggedTool
                              ? "opacity-60 scale-95 h-16"
                              : "opacity-0 scale-95 h-0"
                        )}>
                          <div className="w-full h-full border-2 border-dashed border-primary/40 rounded-2xl bg-primary/5 flex items-center justify-center">
                            <Plus className="w-6 h-6 text-primary animate-pulse" />
                          </div>
                        </div>

                        {/* Fallback subtle indicator when not hovered but in drag mode */}
                        {draggedTool && !((hoveredInsertPosition === index || (dragOverPosition?.target === 'main' && dragOverPosition.mainIndex === index))) && (
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center animate-pulse">
                            <Plus className="w-5 h-5 text-primary" />
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      draggable={!readOnly}
                      onDragStart={(e) => handleDragStart(e, 'main', index)}
                      onDragEnd={handleDragEnd}
                    >
                      <EnhancedToolCard
                        tool={tool}
                        index={index}
                        onClick={() => handleToolClick(index)}
                        onRemove={() => handleRemoveMainTool(index)}
                        draggable={!readOnly}
                        readOnly={readOnly}
                        isDragging={draggedTool?.source === 'main' && draggedTool.mainIndex === index}
                        methods={getToolMethodNames(tool)}
                      />
                    </div>

                    {/* Arrow to next tool (unless next is a condition, which handles its own connector) */}
                    {!isLast && !isNextCondition && (
                      <div className="relative w-full flex flex-col items-center">
                        {/* The Drop Zone now encompasses the connector area */}
                        <div
                          onDragOver={(e) => handleDragOver(e, 'main', index + 1)}
                          onDrop={(e) => handleDrop(e, 'main', index + 1)}
                          onDragLeave={handleDragLeave}
                          onClick={() => handleAddTool(index + 1)}
                          onMouseEnter={() => setHoveredInsertPosition(index + 1)}
                          onMouseLeave={() => setHoveredInsertPosition(null)}
                          className={cn(
                            "relative group cursor-pointer w-full flex flex-col items-center transition-all duration-300",
                            !readOnly ? "py-8 -my-4 min-h-[80px]" : "py-2"
                          )}
                        >
                          {/* Connector inside the hit area */}
                          <LinearConnector distance="md" variant="primary" />

                          {/* Expanded Insert/Ghost Card Indicator */}
                          {!readOnly && (
                            <div className={cn(
                              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[280px] transition-all duration-300 pointer-events-none",
                              (hoveredInsertPosition === index + 1 || (dragOverPosition?.target === 'main' && dragOverPosition.mainIndex === index + 1))
                                ? "opacity-100 scale-100 h-24"
                                : draggedTool
                                  ? "opacity-60 scale-95 h-16"
                                  : "opacity-0 scale-95 h-0"
                            )}>
                              <div className="w-full h-full border-2 border-dashed border-primary/40 rounded-2xl bg-primary/5 flex items-center justify-center">
                                <Plus className="w-6 h-6 text-primary animate-pulse" />
                              </div>
                            </div>
                          )}

                          {/* Fallback subtle indicator when not hovered but in drag mode */}
                          {draggedTool && !((hoveredInsertPosition === index + 1 || (dragOverPosition?.target === 'main' && dragOverPosition.mainIndex === index + 1))) && (
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center animate-pulse">
                              <Plus className="w-5 h-5 text-primary" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Enhanced Insert Point at the end if this is the last tool */}
                    {isLast && !readOnly && (
                      <div
                        onDragOver={(e) => handleDragOver(e, 'main', index + 1)}
                        onDrop={(e) => handleDrop(e, 'main', index + 1)}
                        onDragLeave={handleDragLeave}
                        onClick={() => handleAddTool(index + 1)}
                        onMouseEnter={() => setHoveredInsertPosition(index + 1)}
                        onMouseLeave={() => setHoveredInsertPosition(null)}
                        className="relative group cursor-pointer w-full py-12 -my-2 flex flex-col items-center justify-center transition-all duration-300"
                      >
                        {/* Ghost Card Indicator */}
                        <div className={cn(
                          "w-full max-w-[280px] transition-all duration-300 flex flex-col items-center",
                          (hoveredInsertPosition === index + 1 || (dragOverPosition?.target === 'main' && dragOverPosition.mainIndex === index + 1))
                            ? "h-24 opacity-100 scale-100"
                            : "h-12 opacity-60 scale-95"
                        )}>
                          <div className={cn(
                            "w-full h-full border-2 border-dashed rounded-2xl flex items-center justify-center transition-colors",
                            (hoveredInsertPosition === index + 1 || (dragOverPosition?.target === 'main' && dragOverPosition.mainIndex === index + 1))
                              ? "border-primary bg-primary/5"
                              : "border-slate-200 dark:border-slate-800 bg-transparent"
                          )}>
                            <Plus className={cn(
                              "transition-all duration-300",
                              (hoveredInsertPosition === index + 1 || (dragOverPosition?.target === 'main' && dragOverPosition.mainIndex === index + 1))
                                ? "w-8 h-8 text-primary animate-pulse"
                                : "w-5 h-5 text-slate-400"
                            )} />
                            {(hoveredInsertPosition === index + 1 || (dragOverPosition?.target === 'main' && dragOverPosition.mainIndex === index + 1)) && (
                              <span className="absolute mt-16 text-xs font-bold text-primary tracking-tight">Drop to insert here</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </React.Fragment >
            );
          })}
        </div >
      </motion.div >

      {/* Modals outside motion.div to ensure correct stacking context/z-index */}
      {
        !readOnly && (
          <>
            {showToolModal && (
              <ToolSelectionModal
                open={showToolModal}
                onClose={() => {
                  setShowToolModal(false);
                  if (!isConfiguringRef.current && !pendingToolForConfig) {
                    setInsertPosition(null);
                    setBranchInsertPosition(null);
                  }
                  if (selectedToolIndex !== null) {
                    setSelectedToolIndex(null);
                  }
                }}
                onSelect={selectedToolIndex !== null ? handleReplaceToolSelected : handleToolSelected}
                onConfigureAfterSelect={(tool) => {
                  if (isConditionalTool(tool) || tool.type === 'calcom' || tool.type === 'pipedrive') {
                    isConfiguringRef.current = true;
                    const currentInsertPosition = insertPositionRef.current ?? insertPosition;
                    const positionToUse = currentInsertPosition !== null
                      ? currentInsertPosition
                      : selectedToolIndex !== null
                        ? selectedToolIndex
                        : sortedToolChain.length;

                    if (currentInsertPosition !== null) {
                      setInsertPosition(currentInsertPosition);
                      insertPositionRef.current = currentInsertPosition;
                    } else if (selectedToolIndex === null && !branchInsertPosition) {
                      setInsertPosition(positionToUse);
                      insertPositionRef.current = positionToUse;
                    }

                    setSavedInsertPosition(positionToUse);
                    setConfigStepIndex(positionToUse);
                    setPendingToolForConfig(tool);
                    setShowToolModal(false);
                    setShowToolConfigModal(true);
                  }
                }}
                agentId={agentId}
                currentRole={
                  selectedToolIndex !== null && sortedToolChain[selectedToolIndex]
                    ? sortedToolChain[selectedToolIndex].role
                    : insertPosition !== null
                      ? getExpectedRoleForPosition(insertPosition)
                      : undefined
                }
                insertPosition={insertPosition || undefined}
              />
            )}

            {showToolConfigModal && activeToolToConfigure && (
              <>
                {activeToolToConfigure.type === 'webhook' ? (
                  <WebhookToolModal
                    open={showToolConfigModal}
                    onOpenChange={(open) => {
                      if (!open) {
                        setShowToolConfigModal(false);
                        setConfigStepIndex(null);
                        if (pendingToolForConfig) {
                          setPendingToolForConfig(null);
                          setInsertPosition(null);
                          insertPositionRef.current = null;
                          setSavedInsertPosition(null);
                          isConfiguringRef.current = false;
                        }
                      }
                    }}
                    editingWebhookTool={null}
                    webhookForm={webhookForm}
                    setWebhookForm={setWebhookForm}
                    onSave={handleSaveWebhookTool}
                    onClose={() => {
                      setShowToolConfigModal(false);
                      setConfigStepIndex(null);
                      if (pendingToolForConfig) {
                        setPendingToolForConfig(null);
                        setInsertPosition(null);
                        insertPositionRef.current = null;
                        setSavedInsertPosition(null);
                        isConfiguringRef.current = false;
                      }
                    }}
                  />
                ) : (
                  <ToolConfigurationModal
                    open={showToolConfigModal}
                    onClose={() => {
                      setShowToolConfigModal(false);
                      setConfigStepIndex(null);
                      if (pendingToolForConfig) {
                        setPendingToolForConfig(null);
                        setInsertPosition(null);
                        insertPositionRef.current = null;
                        setSavedInsertPosition(null);
                        isConfiguringRef.current = false;
                      }
                    }}
                    tool={activeToolToConfigure}
                    agentId={agentId}
                    stepIndex={configStepIndex ?? calculateStepIndex()}
                    onSave={handleSaveToolConfig}
                    onRemove={handleRemoveTool}
                    onReplace={selectedToolIndex !== null ? handleReplaceTool : undefined}
                    onConfigureCredentials={handleConfigureCredentials}
                  />
                )}
              </>
            )}

            <ToolChainConfigurationWizard
              open={showToolChainWizard}
              onClose={() => setShowToolChainWizard(false)}
              toolChain={sortedToolChain}
              agentId={agentId}
              onSave={handleSaveToolChainConfig}
            />
          </>
        )
      }

      <SystemToolsModal
        open={showSystemToolsModal}
        onClose={() => setShowSystemToolsModal(false)}
        systemTools={systemTools}
        systemToolSettings={systemToolSettings}
        onToggleSystemTool={handleToggleSystemTool}
        onOpenSettings={(key) => {
          setSelectedSystemTool(key);
          setShowSystemToolsModal(false);
        }}
      />

      {
        selectedSystemTool && (
          <div className="fixed inset-y-0 right-0 w-[500px] z-[60] shadow-2xl animate-in slide-in-from-right duration-300">
            <SystemToolSettingsPanel
              toolKey={selectedSystemTool}
              settings={systemToolSettings[selectedSystemTool] || {}}
              onUpdate={(updates) => handleUpdateSystemToolSettings(selectedSystemTool, updates)}
              onClose={() => setSelectedSystemTool(null)}
              onSave={() => {
                saveSystemTools(systemTools, systemToolSettings);
                setSelectedSystemTool(null);
              }}
              saving={isSavingSystemTools}
              hasChanges={true}
              currentAgentId={agentId}
            />
          </div>
        )
      }
    </AnimatePresence >
  );
};
