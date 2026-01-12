import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2, Search, ChevronDown, ChevronRight, GitBranch, Globe } from "lucide-react";
import { Input } from "../ui/input";
import { workflowsApi } from "@/lib/api";
import { getIntegrationIcon } from "@/constants/assistant";
import type { ToolInChain, ConditionalConfig } from "@/types/functions";

type ToolSelectionModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (tool: ToolInChain) => void;
  agentId: string;
  currentRole?: string; // Filter tools by role
  insertPosition?: number; // Position in workflow where tool will be inserted
  onConfigureAfterSelect?: (tool: ToolInChain) => void; // Optional callback to configure tool after selection
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
    webhook: "🌐",
  };
  return icons[toolType] || getIntegrationIcon(toolType) || "🔧";
};

const getToolDisplayName = (tool: { type: string; role: string; method?: string; name?: string }): string => {
  // If tool has a name (from API), use it
  if (tool.name) {
    return tool.name;
  }
  if (tool.type === "twilio" && tool.method === "sms") {
    return "SMS";
  }
  if (tool.method) {
    return `${tool.type} ${tool.method.toUpperCase()}`;
  }
  return tool.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

// Format integration type names for display
const formatIntegrationName = (integrationType: string): string => {
  const nameMap: Record<string, string> = {
    calcom: "Cal.com",
    google_calendar: "Google Calendar",
    outlook_calendar: "Outlook Calendar",
    calendly: "Calendly",
    pipedrive: "Pipedrive",
    hubspot: "HubSpot",
    salesforce: "Salesforce",
    twilio: "Twilio",
    pinecone: "Pinecone",
  };

  return nameMap[integrationType] || integrationType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

// Format method names to Title Case
const formatMethodName = (method: string): string => {
  return method
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

type Tool = {
  type: string;
  role: string;
  method?: string;
  name: string;
  description: string;
  integration_connected: boolean;
};

type IntegrationGroup = {
  name: string;
  icon: string;
  actions: Tool[];
  allConnected: boolean;
};

// Transform role-based tool data into integration-based grouped structure
const groupToolsByIntegration = (
  tools: {
    communication: Tool[];
    knowledge: Tool[];
    scheduling: Tool[];
    crm: Tool[];
  }
): Record<string, IntegrationGroup> => {
  const grouped: Record<string, IntegrationGroup> = {};

  // Combine all tools from all roles
  const allTools = [
    ...tools.communication,
    ...tools.knowledge,
    ...tools.scheduling,
    ...tools.crm,
  ];

  // Group by integration type
  allTools.forEach((tool) => {
    const integrationType = tool.type;

    if (!grouped[integrationType]) {
      grouped[integrationType] = {
        name: formatIntegrationName(integrationType),
        icon: getToolIcon(integrationType),
        actions: [],
        allConnected: true,
      };
    }

    grouped[integrationType].actions.push(tool);

    // Update connection status - if any action is not connected, mark as not all connected
    if (!tool.integration_connected) {
      grouped[integrationType].allConnected = false;
    }
  });

  return grouped;
};

export const ToolSelectionModal: React.FC<ToolSelectionModalProps> = ({
  open,
  onClose,
  onSelect,
  agentId,
  currentRole,
  insertPosition,
  onConfigureAfterSelect,
}) => {
  const [availableTools, setAvailableTools] = useState<{
    communication: Array<{ type: string; role: string; method?: string; name: string; description: string; integration_connected: boolean }>;
    knowledge: Array<{ type: string; role: string; method?: string; name: string; description: string; integration_connected: boolean }>;
    scheduling: Array<{ type: string; role: string; method?: string; name: string; description: string; integration_connected: boolean }>;
    crm: Array<{ type: string; role: string; method?: string; name: string; description: string; integration_connected: boolean }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIntegrations, setExpandedIntegrations] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && agentId) {
      loadAvailableTools();
      // Reset expanded state when modal opens
      setExpandedIntegrations(new Set());
    } else if (!open) {
      // Clear expanded state when modal closes
      setExpandedIntegrations(new Set());
      setSearchQuery("");
    }
  }, [open, agentId]);

  const loadAvailableTools = async () => {
    setLoading(true);
    try {
      const response = await workflowsApi.getAvailableTools(agentId);
      if (response.data) {
        // Ensure all required fields exist (for backward compatibility)
        const data = response.data as {
          communication?: Array<{ type: string; role: string; method?: string; name: string; description: string; integration_connected: boolean }>;
          knowledge?: Array<{ type: string; role: string; method?: string; name: string; description: string; integration_connected: boolean }>;
          scheduling?: Array<{ type: string; role: string; method?: string; name: string; description: string; integration_connected: boolean }>;
          crm?: Array<{ type: string; role: string; method?: string; name: string; description: string; integration_connected: boolean }>;
        };
        // Patch: Inject "Get All Bookings" if missing from backend
        if (data.scheduling) {
          const hasGetAllBookings = data.scheduling.some(t => t.type === 'calcom' && t.method === 'list_bookings');
          if (!hasGetAllBookings) {
            // Find if Cal.com is connected by checking other calcom tools
            const isCalcomConnected = data.scheduling.some(t => t.type === 'calcom' && t.integration_connected);

            if (isCalcomConnected) {
              data.scheduling.push({
                type: 'calcom',
                role: 'scheduling',
                method: 'list_bookings',
                name: 'Get All Bookings',
                description: 'Get all bookings from Cal.com within a time window.',
                integration_connected: true
              });
            }
          }
        }

        setAvailableTools({
          communication: data.communication || [],
          knowledge: data.knowledge || [],
          scheduling: data.scheduling || [],
          crm: data.crm || []
        });
      }
    } catch (error) {
      console.error("Failed to load available tools:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToolSelect = (tool: { type: string; role: string; method?: string; name?: string }) => {
    let toolInChain: ToolInChain;

    // Special handling for condition tool
    if (tool.type === "condition") {
      const defaultCondition: ConditionalConfig = {
        expression: "result.length === 0",
        then: [],
        else: []
      };
      toolInChain = {
        type: "condition",
        role: "control",
        method: "branch",
        config: defaultCondition,
      };
      // Conditions always need configuration
      if (onConfigureAfterSelect) {
        onConfigureAfterSelect(toolInChain);
        onClose();
        return;
      }
    } else {
      toolInChain = {
        type: tool.type,
        role: tool.role,
        method: tool.method,
        config: {}, // Initialize empty config
      };
    }

    // If tool needs configuration and callback is provided, use it
    // Otherwise, just select the tool
    if (onConfigureAfterSelect && (tool.type === 'calcom' || tool.type === 'pipedrive' || tool.type === 'condition')) {
      onConfigureAfterSelect(toolInChain);
      onClose();
    } else {
      onSelect(toolInChain);
      onClose();
    }
  };

  const toggleIntegration = (integrationType: string) => {
    setExpandedIntegrations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(integrationType)) {
        newSet.delete(integrationType);
      } else {
        newSet.add(integrationType);
      }
      return newSet;
    });
  };

  // Auto-expand integrations when search is active
  useEffect(() => {
    if (searchQuery && availableTools) {
      const query = searchQuery.toLowerCase();
      const newExpanded = new Set<string>();

      // Check all integrations for matches
      const allTools = [
        ...(availableTools.communication || []),
        ...(availableTools.knowledge || []),
        ...(availableTools.scheduling || []),
        ...(availableTools.crm || []),
      ];

      const integrationTypes = new Set(allTools.map(t => t.type));

      integrationTypes.forEach((integrationType) => {
        const integrationName = formatIntegrationName(integrationType).toLowerCase();
        const toolsForIntegration = allTools.filter(t => t.type === integrationType);

        // Check if integration name matches
        if (integrationName.includes(query) || integrationType.toLowerCase().includes(query)) {
          newExpanded.add(integrationType);
        } else {
          // Check if any action matches
          const hasMatchingAction = toolsForIntegration.some(
            (tool) =>
              tool.name.toLowerCase().includes(query) ||
              tool.description.toLowerCase().includes(query) ||
              (tool.method && tool.method.toLowerCase().includes(query))
          );
          if (hasMatchingAction) {
            newExpanded.add(integrationType);
          }
        }
      });

      setExpandedIntegrations(newExpanded);
    } else if (!searchQuery) {
      // Collapse all when search is cleared
      setExpandedIntegrations(new Set());
    }
  }, [searchQuery, availableTools]);

  // Filter and group tools by integration
  const getGroupedTools = (): Record<string, IntegrationGroup> => {
    if (!availableTools) return {};

    // Filter tools based on currentRole if specified
    let toolsToFilter = availableTools;
    if (currentRole) {
      const roleMap: Record<string, keyof typeof availableTools> = {
        communication: "communication",
        knowledge: "knowledge",
        scheduling: "scheduling",
        crm: "crm",
      };
      const roleKey = roleMap[currentRole];
      if (roleKey) {
        toolsToFilter = {
          communication: roleKey === "communication" ? availableTools.communication : [],
          knowledge: roleKey === "knowledge" ? availableTools.knowledge : [],
          scheduling: roleKey === "scheduling" ? availableTools.scheduling : [],
          crm: roleKey === "crm" ? availableTools.crm : [],
        };
      }
    }

    // Group by integration
    const grouped = groupToolsByIntegration(toolsToFilter);

    // Inject Webhook tool
    if (!grouped['webhook']) {
      grouped['webhook'] = {
        name: "Webhook",
        icon: getToolIcon("webhook"),
        actions: [{
          type: "webhook",
          role: "external",
          method: "call",
          name: "Webhook",
          description: "Trigger an external webhook",
          integration_connected: true
        }],
        allConnected: true
      };
    }

    // Apply search filter if query exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered: Record<string, IntegrationGroup> = {};

      Object.entries(grouped).forEach(([integrationType, group]) => {
        // Check if integration name matches
        const nameMatches = group.name.toLowerCase().includes(query) ||
          integrationType.toLowerCase().includes(query);

        // Filter actions that match
        const matchingActions = group.actions.filter(
          (tool) =>
            tool.name.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query) ||
            (tool.method && tool.method.toLowerCase().includes(query))
        );

        // If integration name matches or has matching actions, include it
        if (nameMatches || matchingActions.length > 0) {
          filtered[integrationType] = {
            ...group,
            actions: nameMatches ? group.actions : matchingActions,
          };
        }
      });

      return filtered;
    }

    return grouped;
  };

  const groupedTools = getGroupedTools();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Tool to Add</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              {/* Control Flow Tools Section */}
              {(!searchQuery || "condition".includes(searchQuery.toLowerCase())) && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="w-full flex items-center gap-3 p-3 bg-muted/30">
                    <GitBranch className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <div className="font-medium">Control Flow</div>
                      <div className="text-xs text-muted-foreground">Workflow control and branching</div>
                    </div>
                  </div>
                  <div className="border-t border-border bg-muted/30">
                    <div className="p-2">
                      <button
                        onClick={() => handleToolSelect({
                          type: "condition",
                          role: "control",
                          method: "branch",
                          name: "Condition",
                        })}
                        className="w-full flex items-center gap-3 p-2 rounded hover:bg-secondary transition-colors text-left"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm">Condition</div>
                          <div className="text-xs text-muted-foreground">
                            Branch workflow based on previous step results
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}



              {Object.keys(groupedTools).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tools available{searchQuery ? " matching your search" : ""}.</p>
                </div>
              ) : (
                Object.entries(groupedTools).map(([integrationType, group]) => {
                  const isExpanded = expandedIntegrations.has(integrationType);
                  const actionCount = group.actions.length;

                  return (
                    <div key={integrationType} className="border border-border rounded-lg overflow-hidden">
                      {/* Integration Header - Collapsible */}
                      <button
                        onClick={() => toggleIntegration(integrationType)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-secondary transition-colors text-left"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-xl">{group.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium">{group.name}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              ({actionCount} {actionCount === 1 ? "action" : "actions"})
                            </span>
                            {!group.allConnected && (
                              <span className="text-xs text-muted-foreground">Not connected</span>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Actions List - Expanded */}
                      {isExpanded && (
                        <div className="border-t border-border bg-muted/30">
                          <div className="p-2 space-y-1">
                            {group.actions.map((tool, index) => {
                              // For SMS/Twilio, show special handling
                              const isSMS = tool.type === "twilio" && tool.method === "sms";
                              const actionName = tool.method
                                ? formatMethodName(tool.method)
                                : (isSMS ? "Request user data" : tool.name);

                              return (
                                <button
                                  key={`${tool.type}-${tool.method || index}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToolSelect({
                                      type: tool.type,
                                      role: tool.role,
                                      method: tool.method || (isSMS ? "sms" : undefined),
                                      name: tool.name,
                                    });
                                  }}
                                  className="w-full flex items-center gap-3 p-2 rounded hover:bg-secondary transition-colors text-left"
                                >
                                  <div className="flex-1">
                                    <div className="font-medium text-sm flex items-center gap-2">
                                      {actionName}
                                      {!tool.integration_connected && (
                                        <span className="text-xs text-muted-foreground font-normal">(Not connected)</span>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{tool.description}</div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
