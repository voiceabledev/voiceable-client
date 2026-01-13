import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Loader2, Check, MoreVertical, Trash2, Edit, Key } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { workflowsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { ToolInChain, ConditionalConfig, FieldMapping } from "@/types/functions";
import { isConditionalTool } from "@/types/functions";
import { FieldMappingModal } from "./FieldMappingModal";
import { KnowledgeBaseFileSelector } from "./KnowledgeBaseFileSelector";
import { ConditionConfiguration } from "./ConditionConfiguration";
import { getIntegrationIcon } from "@/constants/assistant";

type ToolConfigurationModalProps = {
  open: boolean;
  onClose: () => void;
  tool: ToolInChain | null;
  agentId: string;
  stepIndex?: number;
  onSave: (config: Record<string, any>) => void;
  onRemove?: () => void;
  onReplace?: () => void;
  onConfigureCredentials?: () => void;
};

// ... ToolOptions type remains the same ...
type ToolOptions = {
  calcom?: {
    methods?: Record<string, { display_name: string; description: string }>;
  };
  pipedrive?: {
    methods?: Record<string, { display_name: string; description: string }>;
    pipelines?: Array<{ id: number; name: string }>;
    stages?: Record<string, Array<{ id: number; name: string; pipeline_id: number }>>;
    activity_types?: Array<{ id: number; name: string }>;
  };
  twilio?: {
    methods: Array<{ value: string; label: string }>;
  };
  pinecone?: {
    indexes: Array<{ name: string; dimension?: number; metric?: string; host?: string; description?: string }>;
  };
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

const formatIntegrationName = (type: string): string => {
  const map: Record<string, string> = {
    calcom: "Cal.com",
    google_calendar: "Google Calendar",
    outlook_calendar: "Outlook Calendar",
    calendly: "Calendly",
    pipedrive: "Pipedrive",
    hubspot: "HubSpot",
    salesforce: "Salesforce",
    twilio: "Twilio",
    pinecone: "Pinecone",
    search_knowledge_base: "Search Knowledge Base",
  };
  return map[type] || type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatMethodName = (method: string, toolType?: string): string => {
  // Special formatting for specific methods
  const methodMap: Record<string, string> = {
    answer_questions: "Answer Questions",
    qualify_leads: "Qualify leads",
    sms: "Send SMS",
  };
  
  if (methodMap[method]) {
    return methodMap[method];
  }
  
  // Default formatting: convert snake_case to Title Case
  return method.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export const ToolConfigurationModal: React.FC<ToolConfigurationModalProps> = ({
  open,
  onClose,
  tool,
  agentId,
  stepIndex = 0,
  onSave,
  onRemove,
  onReplace,
  onConfigureCredentials,
}) => {
  const [loading, setLoading] = useState(false);
  const [toolOptions, setToolOptions] = useState<Record<string, any> | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [fieldMappingModalOpen, setFieldMappingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("setup");
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    if (open && tool && agentId) {
      // 1. Clear previous state immediately to avoid ghost content
      setToolOptions(null);
      setLoading(false);

      // 2. Load Options if needed (with race condition protection)
      // Skip loading options for tools that don't need dynamic options
      const toolsWithoutOptions = ['search_knowledge_base', 'twilio'];
      if (!isConditionalTool(tool) && !toolsWithoutOptions.includes(tool.type)) {
        setLoading(true);
        workflowsApi.getToolOptions(agentId, tool.type)
          .then((response) => {
            if (isMounted && response.data) {
              // Patch: Inject "Get All Bookings" for Cal.com if missing
              if (tool.type === 'calcom') {
                const calData = response.data as any;
                if (calData.methods && !calData.methods['list_bookings']) {
                  calData.methods['list_bookings'] = {
                    display_name: 'Get All Bookings',
                    description: 'Get all bookings from Cal.com within a time window.'
                  };
                }
              }
              setToolOptions({ [tool.type]: response.data });
            }
          })
          .catch((error) => {
            console.error("Failed to load tool options:", error);
            if (isMounted) {
              toast({
                title: "Error",
                description: "Failed to load tool configuration options",
                variant: "destructive",
              });
            }
          })
          .finally(() => {
            if (isMounted) setLoading(false);
          });
      } else if (!isConditionalTool(tool) && toolsWithoutOptions.includes(tool.type)) {
        // For tools without options, set loading to false immediately
        setLoading(false);
      }

      // 3. Initialize Config
      if (isConditionalTool(tool)) {
        setConfig(tool.config || { expression: "", description: "", then: [], else: [] });
      } else {
        const initialConfig = tool.config || {};
        // Set default method for tools that need it
        if (tool.type === 'search_knowledge_base' && !initialConfig.method && !tool.method) {
          initialConfig.method = 'answer_questions';
        }
        setConfig(initialConfig);
      }

      // 4. Reset Tab
      setActiveTab("setup");
    } else if (!open) {
      // Reset everything when closed
      setConfig({});
      setToolOptions(null);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [open, tool, agentId]);

  // Ensure default method is set for knowledge base tools (safeguard)
  useEffect(() => {
    if (open && tool && tool.type === 'search_knowledge_base' && !isConditionalTool(tool)) {
      // Only set default if method is truly missing
      if (!config.method && !tool.method) {
        setConfig((prevConfig) => {
          // Only update if method is still missing (avoid unnecessary updates)
          if (!prevConfig.method) {
            return { ...prevConfig, method: 'answer_questions' };
          }
          return prevConfig;
        });
      }
    }
  }, [open, tool?.type, tool?.method]);

  // Removed standalone loadToolOptions to prevent usage outside effect


  const handleSave = () => {
    onSave(config);
    // Don't close automatically - let user stay in the flow or navigate tabs
    // But maybe we should show a success toast?
    toast({
      title: "Configuration Saved",
      description: "Step configuration has been updated.",
    });
  };

  const isConfigured = () => {
    // Simple check if minimal config is present
    if (!tool) return false;
    if (isConditionalTool(tool)) {
      return !!config.expression;
    }
    // For other tools effectively check if a method/action is selected
    const methods = config.methods || config.method || tool.method;
    return !!methods && (Array.isArray(methods) ? methods.length > 0 : true);
  };

  // --- Render Functions for Setup Tab ---

  const renderSetupTab = () => {
    if (!tool) return null;

    // 1. App Info
    // 2. Trigger Event / Action Selection
    // 3. Account / Connection Status

    return (
      <div className="space-y-6 py-4">
        {/* App Selection (Read Only) */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">App</Label>
          <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
            <span className="text-2xl">{getToolIcon(tool.type)}</span>
            <div className="flex-1">
              <div className="font-medium">{formatIntegrationName(tool.type)}</div>
              <div className="text-xs text-muted-foreground">Premium Integration</div>
            </div>
            {onReplace && (
              <Button variant="outline" size="sm" onClick={onReplace}>
                Change
              </Button>
            )}
          </div>
        </div>

        {/* Trigger Event / Method Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase text-muted-foreground text-red-500 flex gap-1">
            Trigger Event <span className="text-red-500">*</span>
          </Label>

          {/* Reuse existing logic to render tool specific method selectors but simplified */}
          {renderMethodSelector()}
        </div>

        {/* Account / Credentials */}
        {!isConditionalTool(tool) && tool.type !== 'search_knowledge_base' && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground text-red-500 flex gap-1">
              Account <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {formatIntegrationName(tool.type)} Account
                </div>
                <div className="text-xs text-muted-foreground">
                  Using configured credentials
                </div>
              </div>
              {onConfigureCredentials && tool.type !== 'twilio' && (
                <Button variant="outline" size="sm" onClick={onConfigureCredentials}>
                  Change
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatIntegrationName(tool.type)} is a secure partner. Your credentials are encrypted.
            </p>
          </div>
        )}

        <div className="pt-4">
          <Button
            className="w-full"
            onClick={() => setActiveTab("configure")}
            disabled={!isConfigured()}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  };

  const renderConfigureTab = () => {
    // This contains the parameters mapping (fields)
    // Reuse existing logic but strip out the method selection parts

    return (
      <div className="space-y-6 py-4">
        <div className="space-y-4">
          {/* Render tool specific fields */}
          {renderToolFields()}
        </div>

        <div className="pt-4">
          <Button className="w-full" onClick={() => {
            handleSave();
            onClose();
          }}>
            Save & Close
          </Button>
        </div>
      </div>
    );
  };



  // --- Helper to extract Method Selector ---
  const renderMethodSelector = () => {
    if (!tool) return null;
    if (isConditionalTool(tool)) {
      // For condition, the "method" is basically the expression type? 
      // Or maybe just show a fixed label since it's "Branch"
      return (
        <div className="p-3 border rounded-lg bg-muted/50 cursor-not-allowed text-sm text-muted-foreground">
          Conditional Branch Logic
        </div>
      );
    }

    if (tool.type === 'calcom') {
      const calcomData = toolOptions?.calcom as any;
      const methods = calcomData?.methods || {};
      const currentMethod = config.method || tool.method;

      // Simplified generic select for method instead of grid
      return (
        <Select
          value={currentMethod}
          onValueChange={(val) => setConfig({ ...config, method: val, methods: [val] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an action" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(methods).map(([key, info]: [string, any]) => (
              <SelectItem key={key} value={key}>{info.display_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (tool.type === 'pipedrive') {
      const pipedriveData = toolOptions?.pipedrive as any;
      const methods = pipedriveData?.methods || {};
      const currentMethod = config.method || tool.method;

      return (
        <Select
          value={currentMethod}
          onValueChange={(val) => setConfig({ ...config, method: val, methods: [val] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an event" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(methods).map(([key, info]: [string, any]) => (
              <SelectItem key={key} value={key}>{info.display_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (tool.type === 'twilio') {
      return (
        <Select
          value={config.method || tool.method || "sms"}
          onValueChange={(val) => setConfig({ ...config, method: val })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sms">Send SMS</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    if (tool.type === 'search_knowledge_base') {
      const currentMethod = config.method || tool.method || "answer_questions";
      
      return (
        <div className="space-y-2">
          <Select
            value={currentMethod}
            onValueChange={(val) => setConfig({ ...config, method: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a trigger event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="answer_questions">
                Answer Questions
              </SelectItem>
              <SelectItem value="qualify_leads">
                Qualify leads
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {currentMethod === 'qualify_leads' 
              ? 'Qualify leads and guide the qualification process based on knowledge base content.'
              : 'Answer questions and provide information based on attached files (guides, policies, scripts, templates, etc.)'}
          </p>
        </div>
      );
    }

    // Fallback
    return (
      <Input value={tool.method || config.method || ""} disabled />
    );
  };



  // ... Extracted and adapted field renderers ...
  const renderPipedriveFields = () => {
    const pipedriveData = toolOptions?.pipedrive as any;
    const pipelines = pipedriveData?.pipelines || [];
    const stages = pipedriveData?.stages || {};
    const activityTypes = pipedriveData?.activity_types || [];

    // Check if method is selected
    const method = config.method || tool?.method;
    if (!method) return null;

    if (method !== 'create_deal' && method !== 'update_deal' && method !== 'create_activity') {
      return (
        <div className="space-y-4">
          {/* Show Field Mapping Button if applicable */}
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFieldMappingModalOpen(true)}
              className="w-full"
            >
              Configure Advanced Field Mappings
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {(method === 'create_deal' || method === 'update_deal') && (
          <>
            {pipelines.length > 0 && (
              <div>
                <Label htmlFor="pipeline">Pipeline</Label>
                <Select
                  value={(config.pipeline_id || (tool?.config as any)?.pipeline_id)?.toString() || ""}
                  onValueChange={(value) => {
                    setConfig({ ...config, pipeline_id: parseInt(value, 10), stage_id: undefined });
                  }}
                >                <SelectTrigger id="pipeline" className="mt-1">
                    <SelectValue placeholder="Select pipeline" />
                  </SelectTrigger>
                  <SelectContent>
                    {pipelines.map((pipeline: any) => (
                      <SelectItem key={pipeline.id} value={pipeline.id.toString()}>
                        {pipeline.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {config.pipeline_id && stages[config.pipeline_id.toString()] && (
              <div>
                <Label htmlFor="stage">Stage</Label>
                <Select
                  value={(config.stage_id || (tool?.config as any)?.stage_id)?.toString() || ""}
                  onValueChange={(value) => setConfig({ ...config, stage_id: parseInt(value, 10) })}
                >                <SelectTrigger id="stage" className="mt-1">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages[config.pipeline_id.toString()].map((stage: any) => (
                      <SelectItem key={stage.id} value={stage.id.toString()}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}

        {/* ... rest of pipedrive fields (deal value, etc) ... */}
        {method === 'create_deal' && (
          <>
            <div>
              <Label htmlFor="deal_value">Deal Value (Optional)</Label>
              <Input
                id="deal_value"
                type="number"
                value={(config.deal_value || (tool?.config as any)?.deal_value || "") as string}
                onChange={(e) => setConfig({ ...config, deal_value: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="deal_currency">Currency</Label>
              <Select
                value={(config.deal_currency || (tool?.config as any)?.deal_currency || "USD") as string}
                onValueChange={(value) => setConfig({ ...config, deal_currency: value })}
              >
                <SelectTrigger id="deal_currency" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="BRL">BRL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {method === 'create_activity' && activityTypes.length > 0 && (
          <div>
            <Label htmlFor="activity_type">Activity Type</Label>
            <Select
              value={(config.activity_type_id || (tool?.config as any)?.activity_type_id || 1)?.toString()}
              onValueChange={(value) => setConfig({ ...config, activity_type_id: parseInt(value, 10) })}
            >
              <SelectTrigger id="activity_type" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((activityType: any) => (
                  <SelectItem key={activityType.id} value={activityType.id.toString()}>
                    {activityType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFieldMappingModalOpen(true)}
            className="w-full"
          >
            Configure Advanced Field Mappings
          </Button>
        </div>
      </div>
    );
  };

  const renderTwilioFields = () => {
    // Reuse specific Twilio field logic from original
    // Just the part inside currentMethod === 'sms'
    const smsMode = config.mode || "form";

    const addQuestion = () => {
      const questions = config.questions || [];
      const newQuestion = {
        id: `question_${Date.now()}`,
        question_text: "",
        field_name: "",
        validation: { type: "text", required: false },
      };
      setConfig({ ...config, questions: [...questions, newQuestion] });
    };

    const updateQuestion = (index: number, updates: any) => {
      const questions = [...(config.questions || [])];
      questions[index] = { ...questions[index], ...updates };
      setConfig({ ...config, questions });
    };

    const removeQuestion = (index: number) => {
      const questions = [...(config.questions || [])];
      questions.splice(index, 1);
      setConfig({ ...config, questions });
    };

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="sms-mode">SMS Mode</Label>
          <Select
            value={smsMode}
            onValueChange={(value) => setConfig({ ...config, mode: value })}
          >
            <SelectTrigger id="sms-mode" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="form">Send Form Link</SelectItem>
              <SelectItem value="questions">Ask Questions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ... Form and Questions inputs ... */}
        {smsMode === "form" && (
          <>
            <div>
              <Label htmlFor="form-url">Form URL *</Label>
              <Input
                id="form-url"
                type="url"
                placeholder="https://example.com/form"
                value={config.form?.form_url || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    form: { ...config.form, form_url: e.target.value },
                  })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="form-description">Form Description (Optional)</Label>
              <Textarea
                id="form-description"
                placeholder="Please fill out this form..."
                value={config.form?.form_description || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    form: { ...config.form, form_description: e.target.value },
                  })
                }
                className="mt-1"
                rows={3}
              />
            </div>
          </>
        )}

        {smsMode === "questions" && (
          <div className="space-y-3">
            {/* ... Question list logic ... */}
            <div className="flex items-center justify-between">
              <Label>Questions</Label>
              <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                Add Question
              </Button>
            </div>
            {/* ... map questions ... */}
            {(config.questions || []).map((q: any, index: number) => (
              <div key={q.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                <Input
                  placeholder="Question"
                  value={q.question_text}
                  onChange={(e) => updateQuestion(index, { question_text: e.target.value })}
                />
                {/* ... simplified for brevity ... */}
                <div className="mt-2">
                  <Label htmlFor={`field-name-${index}`}>Field Name *</Label>
                  <Input
                    id={`field-name-${index}`}
                    placeholder="email"
                    value={q.field_name}
                    onChange={(e) =>
                      updateQuestion(index, { field_name: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeQuestion(index)}>Remove</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Original render functions for conditions and pinecone can be reused or simplified
  const renderConditionConfig = () => {
    if (!isConditionalTool(tool)) return null;

    const conditionConfig = config as ConditionalConfig;

    return (
      <ConditionConfiguration
        config={conditionConfig}
        onChange={(newConfig) => setConfig(newConfig)}
        agentId={agentId}
        stepIndex={stepIndex}
      />
    );
  };

  const renderPineconeConfig = () => {
    // ... same as original ...
    if (!tool || isConditionalTool(tool)) return null;
    const regularConfig = config as Record<string, unknown>;
    const toolConfig = tool.config as Record<string, unknown> | undefined;

    const indexes = toolOptions?.pinecone?.indexes || [];
    const currentIndexName = (regularConfig.index_name || toolConfig?.index_name) as string | undefined;
    const currentTopK = (regularConfig.top_k || toolConfig?.top_k || 10) as number;
    const currentIncludeMetadata = (regularConfig.include_metadata ?? (toolConfig?.include_metadata ?? true)) as boolean;

    return (
      <div className="space-y-4">
        <div>
          <Label>Select Index *</Label>
          <div className="mt-2 grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
            {indexes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No indexes available. Please create an index in Pinecone first.</p>
            ) : (
              indexes.map((index) => (
                <div
                  key={index.name}
                  onClick={() => setConfig({ ...regularConfig, index_name: index.name })}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-colors",
                    currentIndexName === index.name
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{index.name}</h4>
                      {index.dimension && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Dimensions: {index.dimension}
                        </p>
                      )}
                      {index.metric && (
                        <p className="text-xs text-muted-foreground">
                          Metric: {index.metric}
                        </p>
                      )}
                      {index.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {index.description}
                        </p>
                      )}
                    </div>
                    {currentIndexName === index.name && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="top_k">Top K Results</Label>
          <Input
            id="top_k"
            type="number"
            value={currentTopK}
            onChange={(e) => setConfig({ ...regularConfig, top_k: parseInt(e.target.value, 10) || 10 })}
            className="mt-1"
            min="1"
            max="100"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="include_metadata"
            checked={typeof currentIncludeMetadata === 'boolean' ? currentIncludeMetadata : true}
            onChange={(e) => setConfig({ ...regularConfig, include_metadata: e.target.checked })}
          />
          <Label htmlFor="include_metadata">Include Metadata</Label>
        </div>
      </div>
    );
  };

  const renderSearchKnowledgeBaseConfig = () => {
    // Type guard
    if (!tool || isConditionalTool(tool)) return null;
    const regularConfig = config as Record<string, unknown>;
    const toolConfig = tool.config as Record<string, unknown> | undefined;

    const selectedFileIds = (regularConfig.file_ids || toolConfig?.file_ids || []) as string[];

    return (
      <div className="space-y-4">
        <div>
          <Label>Knowledge Base Files</Label>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            Select which files the agent should search. Leave empty to search all files.
          </p>

          <KnowledgeBaseFileSelector
            agentId={agentId}
            selectedFileIds={selectedFileIds}
            onSelectionChange={(fileIds) => {
              setConfig({ ...regularConfig, file_ids: fileIds });
            }}
          />
        </div>
      </div>
    );
  };

  // --- Helper to extract Fields ---
  const renderToolFields = () => {
    if (!tool) return null;

    if (isConditionalTool(tool)) {
      return renderConditionConfig();
    }

    switch (tool.type) {
      case 'calcom':
        // No extra config for calcom currently in original code except selecting method
        return <p className="text-sm text-muted-foreground">No additional configuration required for this action.</p>;
      case 'pipedrive':
        // Reuse the logic from renderPipedriveConfig but exclude method selection
        return renderPipedriveFields();
      case 'twilio':
        return renderTwilioFields();
      case 'pinecone':
        return renderPineconeConfig();
      case 'search_knowledge_base':
        return renderSearchKnowledgeBaseConfig();
      default:
        return <p className="text-sm text-muted-foreground">No configuration fields available.</p>;
    }
  };

  if (!tool) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose} modal={true}>
        <DialogContent
          className="max-w-3xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden"
          onCloseAutoFocus={(e) => {
            // Prevent focus restoration when closing - this can cause fullscreen to exit
            // especially for knowledge base modal
            e.preventDefault();
          }}
        >

          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between bg-background z-10">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getToolIcon(tool.type)}</span>
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  {stepIndex > 0 ? `${stepIndex}. ` : ""}{config.method ? formatMethodName(config.method, tool.type) : formatIntegrationName(tool.type)}
                  <Edit className="w-3 h-3 text-muted-foreground cursor-pointer" />
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onReplace && (
                    <DropdownMenuItem onClick={() => { onClose(); onReplace(); }}>
                      <Edit className="w-4 h-4 mr-2" /> Replace
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {onRemove && (
                    <DropdownMenuItem className="text-destructive" onClick={() => { onClose(); onRemove(); }}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Main Content Area with Tabs */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="px-6 border-b bg-muted/20">
                <TabsList className="bg-transparent h-12 p-0 space-x-6 w-full justify-start rounded-none">
                  <TabsTrigger
                    value="setup"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0"
                  >
                    <span className="flex items-center gap-2">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                        activeTab === 'setup' ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
                      )}>1</div>
                      Setup
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="configure"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0"
                    disabled={!isConfigured()}
                  >
                    <span className="flex items-center gap-2">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                        activeTab === 'configure' ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
                      )}>2</div>
                      Configure
                    </span>
                  </TabsTrigger>

                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/10">
                <TabsContent value="setup" className="m-0 h-full border-none ring-0 outline-none">
                  {renderSetupTab()}
                </TabsContent>
                <TabsContent value="configure" className="m-0 h-full border-none ring-0 outline-none">
                  {renderConfigureTab()}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {fieldMappingModalOpen && tool && (
        <FieldMappingModal
          open={fieldMappingModalOpen}
          onClose={() => setFieldMappingModalOpen(false)}
          tool={tool}
          agentId={agentId}
          stepIndex={stepIndex}
          existingMappings={(config.field_mappings as FieldMapping[]) || []}
          onSave={(mappings) => setConfig({ ...config, field_mappings: mappings })}
        />
      )}
    </>
  );
};
