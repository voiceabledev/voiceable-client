import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2, Search } from "lucide-react";
import { Input } from "../ui/input";
import { workflowsApi } from "@/lib/api";
import { getIntegrationIcon } from "@/constants/assistant";
import type { ToolInChain } from "@/types/functions";

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

  useEffect(() => {
    if (open && agentId) {
      loadAvailableTools();
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
    const toolInChain: ToolInChain = {
      type: tool.type,
      role: tool.role,
      method: tool.method,
      config: {}, // Initialize empty config
    };
    
    // If tool needs configuration and callback is provided, use it
    // Otherwise, just select the tool
    if (onConfigureAfterSelect && (tool.type === 'calcom' || tool.type === 'pipedrive')) {
      onConfigureAfterSelect(toolInChain);
      onClose();
    } else {
      onSelect(toolInChain);
      onClose();
    }
  };

  const filterTools = (tools: Array<{ type: string; role: string; method?: string; name: string; description: string; integration_connected: boolean }>) => {
    if (!searchQuery) return tools;
    const query = searchQuery.toLowerCase();
    return tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.type.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        (tool.method && tool.method.toLowerCase().includes(query))
    );
  };

  const getToolsToShow = () => {
    if (!availableTools) return { communication: [], knowledge: [], scheduling: [], crm: [] };

    // If currentRole is specified, only show tools of that role
    if (currentRole) {
      const roleMap: Record<string, keyof typeof availableTools> = {
        communication: "communication",
        knowledge: "knowledge",
        scheduling: "scheduling",
        crm: "crm",
      };
      const roleKey = roleMap[currentRole];
      if (roleKey) {
        return {
          [roleKey]: filterTools(availableTools[roleKey] || []),
        };
      }
    }

    return {
      communication: filterTools(availableTools.communication || []),
      knowledge: filterTools(availableTools.knowledge || []),
      scheduling: filterTools(availableTools.scheduling || []),
      crm: filterTools(availableTools.crm || []),
    };
  };

  const toolsToShow = getToolsToShow();

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

            <div className="space-y-6">
              {toolsToShow.communication && toolsToShow.communication.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">Communication Tools</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {toolsToShow.communication.map((tool) => (
                      <button
                        key={`${tool.type}-${tool.method || ''}`}
                        onClick={() => handleToolSelect({ type: tool.type, role: tool.role, method: tool.method || (tool.type === "twilio" ? "sms" : undefined), name: tool.name })}
                        disabled={!tool.integration_connected}
                        className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-secondary transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-2xl">{getToolIcon(tool.type)}</span>
                        <div className="flex-1">
                          <div className="font-medium">{getToolDisplayName(tool)}</div>
                          <div className="text-sm text-muted-foreground">{tool.description}</div>
                        </div>
                        {!tool.integration_connected && (
                          <span className="text-xs text-muted-foreground">Not connected</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {toolsToShow.knowledge && toolsToShow.knowledge.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">Knowledge Base Tools</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {toolsToShow.knowledge.map((tool) => (
                      <button
                        key={tool.type}
                        onClick={() => handleToolSelect({ type: tool.type, role: tool.role })}
                        disabled={!tool.integration_connected}
                        className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-secondary transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-2xl">{getToolIcon(tool.type)}</span>
                        <div className="flex-1">
                          <div className="font-medium">{tool.name}</div>
                          <div className="text-sm text-muted-foreground">{tool.description}</div>
                        </div>
                        {!tool.integration_connected && (
                          <span className="text-xs text-muted-foreground">Not connected</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {toolsToShow.scheduling && toolsToShow.scheduling.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">Scheduling Tools</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {toolsToShow.scheduling.map((tool) => (
                      <button
                        key={`${tool.type}-${tool.method || ''}`}
                        onClick={() => handleToolSelect({ type: tool.type, role: tool.role, method: tool.method, name: tool.name })}
                        disabled={!tool.integration_connected}
                        className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-secondary transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-2xl">{getToolIcon(tool.type)}</span>
                        <div className="flex-1">
                          <div className="font-medium">{getToolDisplayName(tool)}</div>
                          <div className="text-sm text-muted-foreground">{tool.description}</div>
                        </div>
                        {!tool.integration_connected && (
                          <span className="text-xs text-muted-foreground">Not connected</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {toolsToShow.crm && toolsToShow.crm.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">CRM Tools</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {toolsToShow.crm.map((tool) => (
                      <button
                        key={tool.type}
                        onClick={() => handleToolSelect({ type: tool.type, role: tool.role })}
                        disabled={!tool.integration_connected}
                        className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-secondary transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-2xl">{getToolIcon(tool.type)}</span>
                        <div className="flex-1">
                          <div className="font-medium">{tool.name}</div>
                          <div className="text-sm text-muted-foreground">{tool.description}</div>
                        </div>
                        {!tool.integration_connected && (
                          <span className="text-xs text-muted-foreground">Not connected</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {Object.values(toolsToShow).every((tools) => tools.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tools available{searchQuery ? " matching your search" : ""}.</p>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
