import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Loader2, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { workflowsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { ToolInChain } from "@/types/functions";

type ToolConfigurationModalProps = {
  open: boolean;
  onClose: () => void;
  tool: ToolInChain | null;
  agentId: string;
  onSave: (config: Record<string, any>) => void;
};

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

export const ToolConfigurationModal: React.FC<ToolConfigurationModalProps> = ({
  open,
  onClose,
  tool,
  agentId,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [toolOptions, setToolOptions] = useState<Record<string, any> | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (open && tool && agentId) {
      loadToolOptions();
      // Initialize config from existing tool config
      setConfig(tool.config || {});
    } else if (!open) {
      // Reset when modal closes
      setConfig({});
      setToolOptions(null);
    }
  }, [open, tool, agentId]);

  const loadToolOptions = async () => {
    if (!tool) return;

    setLoading(true);
    try {
      const response = await workflowsApi.getToolOptions(agentId, tool.type);
      if (response.data) {
        setToolOptions({ [tool.type]: response.data });
      }
    } catch (error) {
      console.error("Failed to load tool options:", error);
      toast({
        title: "Error",
        description: "Failed to load tool configuration options",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const renderCalcomConfig = () => {
    // Backend returns: { tool_type: 'calcom', methods: {...} }
    // toolOptions structure: { calcom: { tool_type: 'calcom', methods: {...} } }
    // So toolOptions.calcom is the data object directly
    const calcomData = toolOptions?.calcom as any;
    const methods = calcomData?.methods || {};
    // Get selected methods from config - support both single method (string) and multiple methods (array)
    const selectedMethods = Array.isArray(config.methods) 
      ? config.methods 
      : config.method 
        ? [config.method] 
        : tool?.method 
          ? [tool.method] 
          : tool?.config?.method
            ? Array.isArray(tool.config.method) ? tool.config.method : [tool.config.method]
            : [];

    return (
      <div className="space-y-4">
        <div>
          <Label>Select Cal.com Tools *</Label>
          <p className="text-xs text-muted-foreground mt-1 mb-2">
            Select one or more Cal.com tools to use in this workflow step
          </p>
          {Object.keys(methods).length === 0 && loading && (
            <p className="text-sm text-muted-foreground mt-2">
              Loading available Cal.com tools...
            </p>
          )}
          {Object.keys(methods).length === 0 && !loading && (
            <p className="text-sm text-destructive mt-2">
              Failed to load Cal.com tools. Please check your integration credentials.
            </p>
          )}
          {Object.keys(methods).length > 0 && (
            <div className="mt-2 grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
              {Object.entries(methods).map(([methodKey, methodInfo]: [string, any]) => {
                const isSelected = selectedMethods.includes(methodKey);
                return (
                  <div
                    key={methodKey}
                    onClick={() => {
                      const newMethods = isSelected
                        ? selectedMethods.filter((m: string) => m !== methodKey)
                        : [...selectedMethods, methodKey];
                      setConfig({ ...config, methods: newMethods, method: newMethods.length === 1 ? newMethods[0] : undefined });
                    }}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{(methodInfo as any).display_name}</h4>
                        {(methodInfo as any).description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {(methodInfo as any).description}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </div>
      );
    };

  const renderPipedriveConfig = () => {
    // Backend returns: { tool_type: 'pipedrive', methods: {...}, pipelines: [...], stages: {...}, activity_types: [...] }
    // toolOptions structure: { pipedrive: { tool_type: 'pipedrive', methods: {...}, ... } }
    // So toolOptions.pipedrive is the data object directly
    const pipedriveData = toolOptions?.pipedrive as any;
    const methods = pipedriveData?.methods || {};
    const pipelines = pipedriveData?.pipelines || [];
    const stages = pipedriveData?.stages || {};
    const activityTypes = pipedriveData?.activity_types || [];

    // Get selected methods from config - support both single method (string) and multiple methods (array)
    const selectedMethods = Array.isArray(config.methods) 
      ? config.methods 
      : config.method 
        ? [config.method] 
        : tool?.method 
          ? [tool.method] 
          : tool?.config?.method
            ? Array.isArray(tool.config.method) ? tool.config.method : [tool.config.method]
            : [];
    
    // For backward compatibility, also check single method
    const currentMethod = selectedMethods.length > 0 ? selectedMethods[0] : "";

    return (
      <div className="space-y-4">
        <div>
          <Label>Select Pipedrive Tools *</Label>
          <p className="text-xs text-muted-foreground mt-1 mb-2">
            Select one or more Pipedrive tools to use in this workflow step
          </p>
          {Object.keys(methods).length === 0 && loading && (
            <p className="text-sm text-muted-foreground mt-2">
              Loading available Pipedrive tools...
            </p>
          )}
          {Object.keys(methods).length === 0 && !loading && (
            <div className="mt-2 p-3 border border-destructive/50 rounded-lg bg-destructive/10">
              <p className="text-sm text-destructive font-medium">
                Failed to load Pipedrive tools
              </p>
              <p className="text-xs text-destructive/80 mt-1">
                {pipedriveData 
                  ? 'Methods not found in the API response. Please try refreshing or contact support.'
                  : 'Unable to connect to the API. Please check your network connection and try again.'}
              </p>
            </div>
          )}
            {Object.keys(methods).length > 0 && (
              <div className="mt-2 grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {Object.entries(methods).map(([methodKey, methodInfo]: [string, any]) => {
                  const isSelected = selectedMethods.includes(methodKey);
                  return (
                    <div
                      key={methodKey}
                      onClick={() => {
                        const newMethods = isSelected
                          ? selectedMethods.filter((m: string) => m !== methodKey)
                          : [...selectedMethods, methodKey];
                        setConfig({ ...config, methods: newMethods, method: newMethods.length === 1 ? newMethods[0] : undefined });
                      }}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-colors",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{(methodInfo as any).display_name}</h4>
                          {(methodInfo as any).description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {(methodInfo as any).description}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>

        {/* Show additional configuration only for methods that need it (e.g., create_deal) */}
        {selectedMethods.length > 0 && selectedMethods.some((m: string) => m === 'create_deal' || m === 'update_deal') && (
          <>
            {pipelines.length > 0 && (
              <div>
                <Label htmlFor="pipeline">Pipeline</Label>
                <Select
                  value={(config.pipeline_id || tool?.config?.pipeline_id)?.toString() || ""}
                  onValueChange={(value) => {
                    const newConfig = { ...config, pipeline_id: parseInt(value, 10), stage_id: undefined };
                    setConfig(newConfig);
                  }}
                >
                  <SelectTrigger id="pipeline" className="mt-1">
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

            {config.pipeline_id && stages[config.pipeline_id.toString()] && stages[config.pipeline_id.toString()].length > 0 && (
              <div>
                <Label htmlFor="stage">Stage</Label>
                <Select
                  value={(config.stage_id || tool?.config?.stage_id)?.toString() || ""}
                  onValueChange={(value) => setConfig({ ...config, stage_id: parseInt(value, 10) })}
                >
                  <SelectTrigger id="stage" className="mt-1">
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

            {selectedMethods.includes('create_deal') && (
              <>
                <div>
                  <Label htmlFor="deal_value">Deal Value (Optional)</Label>
                  <Input
                    id="deal_value"
                    type="number"
                    value={(config.deal_value || tool?.config?.deal_value || "") as string}
                    onChange={(e) => setConfig({ ...config, deal_value: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="mt-1"
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="deal_currency">Currency</Label>
                  <Select
                    value={(config.deal_currency || tool?.config?.deal_currency || "USD") as string}
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

            {activityTypes.length > 0 && (
              <div>
                <Label htmlFor="activity_type">Activity Type</Label>
                <Select
                  value={(config.activity_type_id || tool?.config?.activity_type_id || 1)?.toString()}
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
          </>
        )}
      </div>
    );
  };

  const renderTwilioConfig = () => {
    const methods = toolOptions?.twilio?.methods || [
      { value: "sms", label: "SMS" },
      { value: "voice", label: "Voice" },
    ];
    const currentMethod = config.method || tool?.method || "sms";

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="method">Method</Label>
          <Select
            value={currentMethod}
            onValueChange={(value) => setConfig({ ...config, method: value })}
          >
            <SelectTrigger id="method" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {methods.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderPineconeConfig = () => {
    const indexes = toolOptions?.pinecone?.indexes || [];
    const currentIndexName = config.index_name || tool?.config?.index_name;
    const currentTopK = config.top_k || tool?.config?.top_k || 10;
    const currentIncludeMetadata = config.include_metadata ?? (tool?.config?.include_metadata ?? true);

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
                  onClick={() => setConfig({ ...config, index_name: index.name })}
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
            onChange={(e) => setConfig({ ...config, top_k: parseInt(e.target.value, 10) || 10 })}
            className="mt-1"
            min="1"
            max="100"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="include_metadata"
            checked={currentIncludeMetadata}
            onChange={(e) => setConfig({ ...config, include_metadata: e.target.checked })}
          />
          <Label htmlFor="include_metadata">Include Metadata</Label>
        </div>
      </div>
    );
  };

  const renderConfigForm = () => {
    if (!tool) return null;

    switch (tool.type) {
      case "calcom":
        return renderCalcomConfig();
      case "pipedrive":
        return renderPipedriveConfig();
      case "twilio":
        return renderTwilioConfig();
      case "pinecone":
        return renderPineconeConfig();
      default:
        return <p className="text-sm text-muted-foreground">No configuration options available for this tool.</p>;
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

  if (!tool) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Tool</DialogTitle>
          <DialogDescription>
            Configure settings for <strong>{getToolDisplayName(tool)}</strong>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {renderConfigForm()}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Configuration
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
