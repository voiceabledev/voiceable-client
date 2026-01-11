import React, { useState } from "react";
import { ArrowRight, Bot, Plus } from "lucide-react";
import { cn } from "../../lib/utils";
import type { AgentFunction, ToolInChain } from "@/types/functions";
import { getIntegrationIcon } from "@/constants/assistant";
import { ToolSelectionModal } from "./ToolSelectionModal";
import { ToolActionModal } from "./ToolActionModal";
import { ToolConfigurationModal } from "./ToolConfigurationModal";
import { ToolChainConfigurationWizard } from "./ToolChainConfigurationWizard";

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
  };
  return icons[toolType] || getIntegrationIcon(toolType) || "🔧";
};

const getToolDisplayName = (tool: { type: string; role: string; method?: string }): string => {
  // Just show the tool type, no method names
  if (tool.type === "twilio" && tool.method === "sms") {
    return "SMS";
  }
  return tool.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatMethodName = (methodKey: string): string => {
  // Convert method keys like "get_event_types" to "Get Event Types"
  return methodKey
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const getToolMethodNames = (tool: ToolInChain): string[] => {
  // Get method names from tool config or method property
  const methods: string[] = Array.isArray(tool.config?.methods)
    ? tool.config.methods
    : tool.config?.method
      ? [tool.config.method]
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
    const methodNames = getToolMethodNames(tool);
    const toolType = tool.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    
    // Get method keys (not formatted names) for description lookup
    const methodKeys: string[] = Array.isArray(tool.config?.methods)
      ? tool.config.methods
      : tool.config?.method
        ? [tool.config.method]
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
  const [showToolModal, setShowToolModal] = useState(false);
  const [showToolActionModal, setShowToolActionModal] = useState(false);
  const [showToolConfigModal, setShowToolConfigModal] = useState(false);
  const [showToolChainWizard, setShowToolChainWizard] = useState(false);
  const [insertPosition, setInsertPosition] = useState<number | null>(null);
  const [selectedToolIndex, setSelectedToolIndex] = useState<number | null>(null);
  const [pendingToolForConfig, setPendingToolForConfig] = useState<ToolInChain | null>(null);
  const [hoveredInsertPosition, setHoveredInsertPosition] = useState<number | null>(null);

  // Get effective tool chain (custom or from function)
  // For custom workflows, use custom_tool_chain; for function-based, use function.tool_chain
  const toolChain: ToolInChain[] = 
    agentFunction.custom_tool_chain || 
    agentFunction.effective_tool_chain || 
    agentFunction.function?.tool_chain || 
    [];

  // Sort tool chain by role order: communication -> knowledge -> scheduling -> crm
  const sortedToolChain = [...toolChain].sort((a, b) => {
    const roleOrder: Record<string, number> = {
      communication: 1,
      knowledge: 2,
      scheduling: 3,
      crm: 4,
    };
    const aOrder = roleOrder[a.role] || 99;
    const bOrder = roleOrder[b.role] || 99;
    return aOrder - bOrder;
  });

  const handleAddTool = (position: number) => {
    if (readOnly) return;
    setInsertPosition(position);
    setShowToolModal(true);
  };

  const handleToolSelected = (newTool: ToolInChain) => {
    if (insertPosition === null || !onToolChainUpdate) return;

    // If tool needs configuration (Cal.com or Pipedrive), open config modal first
    if ((newTool.type === 'calcom' || newTool.type === 'pipedrive') && !newTool.config) {
      setPendingToolForConfig(newTool);
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
    if (!pendingToolForConfig || insertPosition === null || !onToolChainUpdate) return;

    // Merge config into the pending tool
    const configuredTool: ToolInChain = {
      ...pendingToolForConfig,
      config: { ...pendingToolForConfig.config, ...config }
    };

    // Insert the configured tool at the specified position
    const newToolChain = [...sortedToolChain];
    newToolChain.splice(insertPosition, 0, configuredTool);

    // Update the workflow
    onToolChainUpdate(newToolChain);
    setInsertPosition(null);
    setPendingToolForConfig(null);
    setShowToolConfigModal(false);
  };

  const handleToolClick = (toolIndex: number) => {
    if (readOnly) return;
    setSelectedToolIndex(toolIndex);
    setShowToolActionModal(true);
  };

  const handleRemoveTool = () => {
    if (selectedToolIndex === null || !onToolChainUpdate) return;

    const newToolChain = [...sortedToolChain];
    newToolChain.splice(selectedToolIndex, 1);

    onToolChainUpdate(newToolChain);
    setSelectedToolIndex(null);
  };

  const handleReplaceTool = () => {
    if (selectedToolIndex === null) return;
    setInsertPosition(selectedToolIndex);
    setShowToolActionModal(false);
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

  const handleConfigureTool = () => {
    // Open wizard to configure all tools
    setShowToolChainWizard(true);
  };

  const handleConfigureAllTools = () => {
    setShowToolChainWizard(true);
  };

  const handleSaveToolChainConfig = (configuredToolChain: ToolInChain[]) => {
    if (!onToolChainUpdate) return;
    
    // Update entire tool chain with configurations
    onToolChainUpdate(configuredToolChain);
    setShowToolChainWizard(false);
  };

  const handleSaveToolConfig = (config: Record<string, any>) => {
    if (selectedToolIndex === null || !onToolChainUpdate) {
      // If no selectedToolIndex, we're configuring a pending tool
      handleSavePendingToolConfig(config);
      return;
    }

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
  };

  const handleConfigureCredentials = () => {
    if (!onConfigureCredentials || selectedToolIndex === null) return;
    
    const tool = sortedToolChain[selectedToolIndex];
    // Map tool type to integration type
    const integrationType = tool.type === 'twilio' ? 'twilio' : tool.type;
    onConfigureCredentials(integrationType);
  };

  // Determine the role that should come next based on position
  const getExpectedRoleForPosition = (position: number): string | undefined => {
    if (position === 0) return "communication"; // After Agent, first tool should be communication
    if (position <= sortedToolChain.length) {
      const prevTool = sortedToolChain[position - 1];
      if (prevTool) {
        // Determine next role based on previous tool's role
        if (prevTool.role === "communication") return "knowledge";
        if (prevTool.role === "knowledge") return "scheduling";
        if (prevTool.role === "scheduling") return "crm";
        return undefined; // After CRM, no specific role required
      }
    }
    return undefined;
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Always start with Agent */}
        <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-md">
          <Bot className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium">Agent</span>
        </div>

        {/* Insert point after Agent */}
        {!readOnly && (
          <button
            type="button"
            onClick={() => handleAddTool(0)}
            onMouseEnter={() => setHoveredInsertPosition(0)}
            onMouseLeave={() => setHoveredInsertPosition(null)}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-md border-2 border-dashed transition-colors",
              hoveredInsertPosition === 0
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/30 hover:border-primary/50"
            )}
            title="Add tool"
          >
            <Plus className="h-3 w-3 text-muted-foreground" />
          </button>
        )}

        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

        {/* Render tools with insert points between them */}
        {sortedToolChain.map((tool, index) => (
          <React.Fragment key={index}>
            <button
              type="button"
              onClick={() => handleToolClick(index)}
              disabled={readOnly}
              className={cn(
                "flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-md transition-colors",
                !readOnly && "hover:bg-secondary cursor-pointer",
                readOnly && "cursor-default"
              )}
              title={readOnly ? undefined : "Click to manage this tool"}
            >
              <span className="text-lg">{getToolIcon(tool.type)}</span>
              <span className="text-xs font-medium">{getToolDisplayName(tool)}</span>
            </button>

            {/* Insert point after each tool */}
            {!readOnly && (
              <button
                type="button"
                onClick={() => handleAddTool(index + 1)}
                onMouseEnter={() => setHoveredInsertPosition(index + 1)}
                onMouseLeave={() => setHoveredInsertPosition(null)}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-md border-2 border-dashed transition-colors",
                  hoveredInsertPosition === index + 1
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/30 hover:border-primary/50"
                )}
                title="Add tool"
              >
                <Plus className="h-3 w-3 text-muted-foreground" />
              </button>
            )}

            {index < sortedToolChain.length - 1 && (
              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Workflow description summarizing all tools */}
      <div className="mt-3">
        <div className="text-xs text-muted-foreground whitespace-pre-line">
          {generateWorkflowDescription(sortedToolChain)}
        </div>
      </div>

      {!readOnly && (
        <>
          <ToolSelectionModal
            open={showToolModal}
            onClose={() => {
              setShowToolModal(false);
              setInsertPosition(null);
              // If we were replacing, clear the selected tool index
              if (selectedToolIndex !== null) {
                setSelectedToolIndex(null);
              }
            }}
            onSelect={selectedToolIndex !== null ? handleReplaceToolSelected : handleToolSelected}
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
          <ToolActionModal
            open={showToolActionModal}
            onClose={() => {
              setShowToolActionModal(false);
              setSelectedToolIndex(null);
            }}
            tool={selectedToolIndex !== null ? sortedToolChain[selectedToolIndex] : null}
            toolIndex={selectedToolIndex}
            onRemove={handleRemoveTool}
            onReplace={handleReplaceTool}
            onConfigureCredentials={handleConfigureCredentials}
            onConfigureTool={handleConfigureTool}
          />
          <ToolConfigurationModal
            open={showToolConfigModal}
            onClose={() => {
              setShowToolConfigModal(false);
              if (pendingToolForConfig) {
                setPendingToolForConfig(null);
                setInsertPosition(null);
              }
            }}
            tool={pendingToolForConfig || (selectedToolIndex !== null ? sortedToolChain[selectedToolIndex] : null)}
            agentId={agentId}
            onSave={handleSaveToolConfig}
          />
          <ToolChainConfigurationWizard
            open={showToolChainWizard}
            onClose={() => {
              setShowToolChainWizard(false);
            }}
            toolChain={sortedToolChain}
            agentId={agentId}
            onSave={handleSaveToolChainConfig}
          />
        </>
      )}
    </>
  );
};
