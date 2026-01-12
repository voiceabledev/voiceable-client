import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Loader2 } from "lucide-react";
import { workflowsApi, integrationsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { ToolInChain } from "@/types/functions";
import { ToolSelectionModal } from "./ToolSelectionModal";
import { WorkflowTemplates } from "./WorkflowTemplates";
import { WorkflowTriggerEditor } from "./WorkflowTriggerEditor";
import type { UserIntegration } from "@/types/integrations";
import type { AgentFunction } from "@/types/functions";

type CreateWorkflowFromScratchModalProps = {
  open: boolean;
  onClose: () => void;
  agentId: string;
  onWorkflowCreated: () => void;
  initialToolChain?: ToolInChain[];
  initialName?: string;
  initialDescription?: string;
};

export const CreateWorkflowFromScratchModal: React.FC<CreateWorkflowFromScratchModalProps> = ({
  open,
  onClose,
  agentId,
  onWorkflowCreated,
  initialToolChain,
  initialName,
  initialDescription,
}) => {
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [toolChain, setToolChain] = useState<ToolInChain[]>([]);
  const [showToolModal, setShowToolModal] = useState(false);
  const [insertPosition, setInsertPosition] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [triggerPhrases, setTriggerPhrases] = useState<string[]>([]);
  const [availableIntegrations, setAvailableIntegrations] = useState<string[]>([]);
  const { toast } = useToast();

  // Load available integrations
  useEffect(() => {
    const loadIntegrations = async () => {
      try {
        const response = await integrationsApi.list();
        if (response.data) {
          const types = response.data.map((i: UserIntegration) => i.integration_type);
          setAvailableIntegrations(types);
        }
      } catch (error) {
        console.error("Failed to load integrations:", error);
      }
    };
    if (open) {
      loadIntegrations();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setWorkflowName("");
      setWorkflowDescription("");
      setToolChain([]);
      setShowTemplates(true);
      setSelectedTemplate(null);
      setTriggerPhrases([]);
    } else if (open && initialToolChain) {
      // Pre-populate with initial data if provided
      setToolChain(initialToolChain);
      if (initialName) {
        setWorkflowName(initialName);
      }
      if (initialDescription) {
        setWorkflowDescription(initialDescription);
      }
      // Skip template selection if initial tools are provided
      setShowTemplates(false);
    }
  }, [open, initialToolChain, initialName, initialDescription]);

  // Apply template when selected
  useEffect(() => {
    if (selectedTemplate && selectedTemplate.toolChain) {
      setToolChain(selectedTemplate.toolChain);
      if (selectedTemplate.triggerPhrases) {
        setTriggerPhrases(selectedTemplate.triggerPhrases);
      }
      if (selectedTemplate.name && !workflowName) {
        setWorkflowName(selectedTemplate.name);
      }
      setShowTemplates(false);
    }
  }, [selectedTemplate]);

  const handleAddTool = (position: number) => {
    setInsertPosition(position);
    setShowToolModal(true);
  };

  const handleToolSelected = (tool: ToolInChain) => {
    const newToolChain = [...toolChain];
    
    // Check if this is a CRM or Calendar tool
    const isCRM = ['pipedrive', 'hubspot', 'kommo'].includes(tool.type);
    const isCalendar = ['calcom', 'calendly', 'google_calendar'].includes(tool.type);
    
    // If adding CRM or Calendar tool, ensure SMS is present
    if ((isCRM || isCalendar) && !newToolChain.some(t => t.type === 'twilio')) {
      // Add SMS first
      const smsTool: ToolInChain = {
        type: 'twilio',
        role: 'communication',
        method: 'sms',
        config: {}
      };
      newToolChain.unshift(smsTool);
      
      toast({
        title: "SMS Added",
        description: "SMS has been automatically added as it's required for CRM/Calendar tools to collect data.",
      });
    }
    
    newToolChain.splice(insertPosition, 0, tool);
    setToolChain(newToolChain);
    setShowToolModal(false);
  };

  const handleRemoveTool = (index: number) => {
    const newToolChain = [...toolChain];
    newToolChain.splice(index, 1);
    setToolChain(newToolChain);
  };

  const handleCreate = async () => {
    if (!workflowName.trim()) {
      toast({
        title: "Error",
        description: "Workflow name is required",
        variant: "destructive",
      });
      return;
    }

    if (toolChain.length === 0) {
      toast({
        title: "Error",
        description: "At least one tool is required",
        variant: "destructive",
      });
      return;
    }

    // Validate SMS requirement for CRM/Calendar tools
    const hasCRM = toolChain.some(t => ['pipedrive', 'hubspot', 'kommo'].includes(t.type));
    const hasCalendar = toolChain.some(t => ['calcom', 'calendly', 'google_calendar'].includes(t.type));
    const hasSMS = toolChain.some(t => t.type === 'twilio');
    
    if ((hasCRM || hasCalendar) && !hasSMS) {
      toast({
        title: "SMS Required",
        description: "SMS/Twilio is required when using CRM or Calendar tools to collect data. Please add SMS to your workflow.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await workflowsApi.create(agentId, {
        name: workflowName,
        description: workflowDescription,
        tool_chain: toolChain,
        trigger_phrases: triggerPhrases,
        enabled: true,
      });

      toast({
        title: "Success",
        description: "Workflow created successfully",
      });

      onWorkflowCreated();
      onClose();
    } catch (error: any) {
      console.error("Failed to create workflow:", error);
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
          description: errorMessage || "Failed to create workflow. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getToolDisplayName = (tool: ToolInChain): string => {
    if (tool.type === "twilio" && tool.method === "sms") {
      return "SMS";
    }
    if (tool.method) {
      return `${tool.type} ${tool.method.toUpperCase()}`;
    }
    return tool.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getToolName = (tool: ToolInChain): string => {
    if (tool.type === "twilio" && tool.method === "sms") {
      return "SMS";
    }
    return tool.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getToolMethod = (tool: ToolInChain): string | null => {
    // SMS always shows "Request user data"
    if (tool.type === "twilio" && tool.method === "sms") {
      return "Request user data";
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
    };
    return icons[toolType] || "🔧";
  };

  // Show templates first if not selected
  if (showTemplates) {
    return (
      <WorkflowTemplates
        open={open}
        onClose={onClose}
        onSelectTemplate={(template) => {
          if (template) {
            setSelectedTemplate(template);
            // Template selection will trigger useEffect to set showTemplates to false
          } else {
            // Custom workflow selected
            setShowTemplates(false);
          }
        }}
        availableIntegrations={availableIntegrations}
      />
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>
              {selectedTemplate
                ? `Configure the ${selectedTemplate.name} workflow`
                : "Build a custom workflow by adding tools step by step"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Trigger Phrases */}
            <WorkflowTriggerEditor
              triggerPhrases={triggerPhrases}
              onPhrasesChange={setTriggerPhrases}
            />

            <div>
              <Label htmlFor="workflow-name">Workflow Name *</Label>
              <Input
                id="workflow-name"
                placeholder="e.g., SMS Booking with CRM Sync"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="workflow-description">Description (Optional)</Label>
              <Textarea
                id="workflow-description"
                placeholder="Describe what this workflow does..."
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label>Tool Chain</Label>
              <div className="mt-2 p-4 border border-border rounded-lg bg-secondary/30">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-md">
                    <span className="text-xs font-medium">Agent</span>
                  </div>
                  
                  {toolChain.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => handleAddTool(0)}
                      className="px-4 py-2 border-2 border-dashed border-muted-foreground/30 rounded-md hover:border-primary/50 transition-colors text-sm text-muted-foreground"
                    >
                      + Add Tool
                    </button>
                  ) : (
                    <>
                      {toolChain.map((tool, index) => {
                        const toolMethod = getToolMethod(tool);
                        return (
                          <React.Fragment key={index}>
                            <span className="text-muted-foreground">→</span>
                            <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-md">
                              <span>{getToolIcon(tool.type)}</span>
                              <div className="flex flex-col text-left">
                                <span className="text-xs font-medium">{getToolName(tool)}</span>
                                {toolMethod && (
                                  <span className="text-xs text-muted-foreground">{toolMethod}</span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveTool(index)}
                                className="ml-2 text-destructive hover:text-destructive/80"
                              >
                                ×
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddTool(index + 1)}
                              className="px-2 py-1 border border-dashed border-muted-foreground/30 rounded hover:border-primary/50 transition-colors text-xs text-muted-foreground"
                            >
                              +
                            </button>
                          </React.Fragment>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowTemplates(true)} disabled={loading}>
                Back to Templates
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={loading || !workflowName.trim() || toolChain.length === 0}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Workflow"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ToolSelectionModal
        open={showToolModal}
        onClose={() => setShowToolModal(false)}
        onSelect={handleToolSelected}
        agentId={agentId}
        insertPosition={insertPosition}
      />
    </>
  );
};
