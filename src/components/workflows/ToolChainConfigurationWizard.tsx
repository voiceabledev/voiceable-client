import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Loader2, Check, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
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

type ToolChainConfigurationWizardProps = {
  open: boolean;
  onClose: () => void;
  toolChain: ToolInChain[];
  agentId: string;
  onSave: (configuredToolChain: ToolInChain[]) => void;
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

export const ToolChainConfigurationWizard: React.FC<ToolChainConfigurationWizardProps> = ({
  open,
  onClose,
  toolChain,
  agentId,
  onSave,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [configurations, setConfigurations] = useState<Record<number, Record<string, any>>>({});
  const [toolOptions, setToolOptions] = useState<Record<string, ToolOptions>>({});
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const { toast } = useToast();

  // Filter out SMS/Twilio tools since they're configured in the backend
  const toolsNeedingConfig = toolChain.filter(tool => tool.type !== "twilio");
  // Create a mapping from filtered index to original tool chain index
  const originalIndexMap = toolChain
    .map((tool, index) => ({ tool, originalIndex: index }))
    .filter(({ tool }) => tool.type !== "twilio")
    .map(({ originalIndex }, filteredIndex) => ({ filteredIndex, originalIndex }))
    .reduce((acc, { filteredIndex, originalIndex }) => {
      acc[filteredIndex] = originalIndex;
      return acc;
    }, {} as Record<number, number>);

  // Step 0 is overview, steps 1-N are tool configurations (only for tools needing config)
  const totalSteps = toolsNeedingConfig.length;
  const isOverviewStep = currentStep === 0;
  const isReviewStep = currentStep > totalSteps;
  const currentToolIndex = currentStep - 1;

  useEffect(() => {
    if (open && toolChain.length > 0) {
      // Initialize configurations from existing tool configs and methods
      // This ensures that when the modal reopens, all previous selections are restored
      // Only initialize for tools that need configuration (exclude SMS/Twilio)
      const initialConfigs: Record<number, Record<string, any>> = {};
      toolsNeedingConfig.forEach((tool, filteredIndex) => {
        const originalIndex = originalIndexMap[filteredIndex];
        // Start with existing config if it exists
        initialConfigs[originalIndex] = tool.config ? { ...tool.config } : {};
        
        // Load methods - support both single method and multiple methods
        if (tool.config?.methods && Array.isArray(tool.config.methods)) {
          // Multiple methods saved in config
          initialConfigs[originalIndex].methods = [...tool.config.methods];
        } else if (tool.method) {
          // Single method on tool itself
          initialConfigs[originalIndex].methods = [tool.method];
          initialConfigs[originalIndex].method = tool.method; // Also set for backward compatibility
        } else if (tool.config?.method) {
          // Single method in config
          const method = Array.isArray(tool.config.method) ? tool.config.method[0] : tool.config.method;
          initialConfigs[originalIndex].methods = [method];
          initialConfigs[originalIndex].method = method; // Also set for backward compatibility
        }
      });
      setConfigurations(initialConfigs);
      setCurrentStep(0);
      
      // Load tool options for all tools that need configuration
      loadAllToolOptions();
    } else if (!open) {
      // Don't reset configurations when modal closes - keep them for next time
      // Only reset step so user starts at overview when reopening
      setCurrentStep(0);
    }
  }, [open, toolChain, agentId]);

  const loadAllToolOptions = async () => {
    setLoadingOptions(true);
    try {
      const options: Record<string, ToolOptions> = {};
      
      // Load options for each unique tool type (excluding SMS/Twilio)
      const uniqueToolTypes = [...new Set(toolsNeedingConfig.map(tool => tool.type))];
      
      await Promise.all(
        uniqueToolTypes.map(async (toolType) => {
          try {
            const response = await workflowsApi.getToolOptions(agentId, toolType);
            if (response.data) {
              options[toolType] = { [toolType]: response.data };
            } else {
              console.warn(`No data returned for ${toolType} tool options`);
            }
          } catch (error: any) {
            console.error(`Failed to load options for ${toolType}:`, error);
          }
        })
      );
      
      setToolOptions(options);
    } catch (error) {
      console.error("Failed to load tool options:", error);
      toast({
        title: "Error",
        description: "Failed to load tool configuration options",
        variant: "destructive",
      });
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleNext = () => {
    if (isOverviewStep) {
      setCurrentStep(1);
    } else if (currentStep <= totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setCurrentStep(0);
    }
  };

  const handleSave = () => {
    // Apply all configurations to tool chain
    const configuredToolChain = toolChain.map((tool, index) => {
      const toolConfig = configurations[index] || {};
      const updatedTool = { ...tool };
      
      // Handle methods - support both single method and multiple methods
      if (toolConfig.methods && Array.isArray(toolConfig.methods)) {
        // Multiple methods selected
        updatedTool.method = toolConfig.methods.length === 1 ? toolConfig.methods[0] : undefined;
        toolConfig.method = undefined; // Remove single method if we have multiple
      } else if (toolConfig.method) {
        // Single method selected (backward compatibility)
        updatedTool.method = toolConfig.method;
      }
      
      // Merge existing config with new config, preserving all settings
      const mergedConfig = { ...(tool.config || {}), ...toolConfig };
      return {
        ...updatedTool,
        config: mergedConfig
      };
    });
    
    onSave(configuredToolChain);
    onClose();
  };

  const updateConfiguration = (filteredIndex: number, config: Record<string, any>) => {
    // Map filtered index to original tool chain index
    const originalIndex = originalIndexMap[filteredIndex];
    setConfigurations(prev => ({
      ...prev,
      [originalIndex]: { ...prev[originalIndex], ...config }
    }));
  };

  const getToolDisplayName = (tool: ToolInChain): string => {
    if (tool.type === "twilio" && tool.method === "sms") {
      return "SMS";
    }
    // Just return the tool type name, not the method
    return tool.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const isToolConfigured = (toolIndex: number): boolean => {
    const tool = toolChain[toolIndex];
    const config = configurations[toolIndex] || {};
    
    // Check if tool has required configuration
    switch (tool.type) {
      case "calcom":
        // Method is required - check both single method and multiple methods array
        const calcomMethods = config.methods || (config.method ? [config.method] : tool.method ? [tool.method] : tool.config?.method ? (Array.isArray(tool.config.method) ? tool.config.method : [tool.config.method]) : []);
        return calcomMethods.length > 0;
      case "pipedrive":
        // At least one method is required (support both single and multiple)
        const pipedriveMethods = config.methods || (config.method ? [config.method] : tool.method ? [tool.method] : tool.config?.method ? (Array.isArray(tool.config.method) ? tool.config.method : [tool.config.method]) : []);
        if (pipedriveMethods.length === 0) return false;
        // For create_deal/update_deal, pipeline and stage might be required
        const hasDealMethod = pipedriveMethods.some((m: string) => m === 'create_deal' || m === 'update_deal');
        if (hasDealMethod) {
          return !!(config.pipeline_id && config.stage_id);
        }
        return true; // Other methods don't require pipeline/stage
      case "pinecone":
        return !!config.index_name;
      case "twilio":
        return true; // Twilio doesn't require configuration
      default:
        return true; // Assume configured if no specific requirements
    }
  };

  const renderOverview = () => {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Configure all tools in your workflow. You'll configure each tool one by one.
        </p>
        
        <div className="space-y-2">
          {toolChain.map((tool, originalIndex) => {
            // Check if this tool needs configuration (not SMS)
            const filteredIndex = toolsNeedingConfig.findIndex((t, idx) => {
              const origIdx = originalIndexMap[idx];
              return origIdx === originalIndex;
            });
            const needsConfig = filteredIndex !== -1;
            const isConfigured = needsConfig ? isToolConfigured(filteredIndex) : tool.type === "twilio";
            const isBackendConfigured = tool.type === "twilio";
            
            return (
              <div
                key={originalIndex}
                className={cn(
                  "flex items-center justify-between p-3 border rounded-lg",
                  isConfigured
                    ? "border-green-200 bg-green-50"
                    : "border-border"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getToolIcon(tool.type)}</span>
                  <div>
                    <div className="font-medium text-sm">{getToolDisplayName(tool)}</div>
                    <div className="text-xs text-muted-foreground">
                      {tool.role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isConfigured ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600">
                        Configured
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">Needs configuration</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderToolConfiguration = (filteredIndex: number) => {
    // Map filtered index to original tool chain index
    const originalIndex = originalIndexMap[filteredIndex];
    const tool = toolsNeedingConfig[filteredIndex];
    const config = configurations[originalIndex] || {};
    // toolOptions structure: { calcom: { calcom: { tool_type: 'calcom', methods: {...} } } }
    // So toolOptions[tool.type]?.[tool.type] gives us the data object
    const options = toolOptions[tool.type]?.[tool.type];

    const renderCalcomConfig = () => {
      // Use filteredIndex for updateConfiguration calls
      // Backend returns: { tool_type: 'calcom', methods: {...} }
      // options is the data object from toolOptions[tool.type]?.[tool.type]
      // options structure: { tool_type: 'calcom', methods: { 'get_event_types': {...}, ... } }
      const methods = (options as any)?.methods || {};
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
            {Object.keys(methods).length === 0 && loadingOptions && (
              <p className="text-sm text-muted-foreground mt-2">
                Loading available Cal.com tools...
              </p>
            )}
            {Object.keys(methods).length === 0 && !loadingOptions && (
              <div className="mt-2 p-3 border border-destructive/50 rounded-lg bg-destructive/10">
                <p className="text-sm text-destructive font-medium">
                  Failed to load Cal.com tools
                </p>
                <p className="text-xs text-destructive/80 mt-1">
                  {options 
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
                        updateConfiguration(filteredIndex, { methods: newMethods, method: newMethods.length === 1 ? newMethods[0] : undefined });
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
      const methods = (options as any)?.methods || {};
      const pipelines = (options as any)?.pipelines || [];
      const stages = (options as any)?.stages || {};
      const activityTypes = (options as any)?.activity_types || [];

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
            {Object.keys(methods).length === 0 && loadingOptions && (
              <p className="text-sm text-muted-foreground mt-2">
                Loading available Pipedrive tools...
              </p>
            )}
            {Object.keys(methods).length === 0 && !loadingOptions && (
              <div className="mt-2 p-3 border border-destructive/50 rounded-lg bg-destructive/10">
                <p className="text-sm text-destructive font-medium">
                  Failed to load Pipedrive tools
                </p>
                <p className="text-xs text-destructive/80 mt-1">
                  {options 
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
                        updateConfiguration(filteredIndex, { methods: newMethods, method: newMethods.length === 1 ? newMethods[0] : undefined });
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
          {currentMethod && (currentMethod === 'create_deal' || currentMethod === 'update_deal') && (
            <>
              {pipelines.length > 0 && (
                <div>
                  <Label htmlFor="pipeline">Pipeline</Label>
                  <Select
                    value={(config.pipeline_id || tool?.config?.pipeline_id)?.toString() || ""}
                    onValueChange={(value) => {
                      updateConfiguration(filteredIndex, { pipeline_id: parseInt(value, 10), stage_id: undefined });
                    }}
                  >
                    <SelectTrigger id="pipeline" className="mt-1">
                      <SelectValue placeholder="Select pipeline" />
                    </SelectTrigger>
                    <SelectContent>
                      {pipelines.map((pipeline) => (
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
                    onValueChange={(value) => updateConfiguration(filteredIndex, { stage_id: parseInt(value, 10) })}
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

              {currentMethod === 'create_deal' && (
                <>
                  <div>
                    <Label htmlFor="deal_value">Deal Value (Optional)</Label>
                    <Input
                      id="deal_value"
                      type="number"
                      value={(config.deal_value || tool?.config?.deal_value || "") as string}
                      onChange={(e) => updateConfiguration(filteredIndex, { deal_value: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="mt-1"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="deal_currency">Currency</Label>
                    <Select
                      value={(config.deal_currency || tool?.config?.deal_currency || "USD") as string}
                      onValueChange={(value) => updateConfiguration(filteredIndex, { deal_currency: value })}
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
                    onValueChange={(value) => updateConfiguration(filteredIndex, { activity_type_id: parseInt(value, 10) })}
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

    const renderPineconeConfig = () => {
      const indexes = options?.pinecone?.indexes || [];
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
                    onClick={() => updateConfiguration(filteredIndex, { index_name: index.name })}
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
              onChange={(e) => updateConfiguration(filteredIndex, { top_k: parseInt(e.target.value, 10) || 10 })}
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
              onChange={(e) => updateConfiguration(filteredIndex, { include_metadata: e.target.checked })}
            />
            <Label htmlFor="include_metadata">Include Metadata</Label>
          </div>
        </div>
      );
    };

    switch (tool.type) {
      case "calcom":
        return renderCalcomConfig();
      case "pipedrive":
        return renderPipedriveConfig();
      case "pinecone":
        return renderPineconeConfig();
      default:
        return <p className="text-sm text-muted-foreground">No configuration options available for this tool.</p>;
    }
  };

  const renderReview = () => {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Review your configurations. Click on any tool to edit its configuration.
        </p>
        
        <div className="space-y-3">
          {toolChain.map((tool, originalIndex) => {
            // Check if this tool needs configuration (not SMS)
            const filteredIndex = toolsNeedingConfig.findIndex((t, idx) => {
              const origIdx = originalIndexMap[idx];
              return origIdx === originalIndex;
            });
            const needsConfig = filteredIndex !== -1;
            
            return (
              <div
                key={originalIndex}
                className="p-4 border rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getToolIcon(tool.type)}</span>
                    <span className="font-medium text-sm">{getToolDisplayName(tool)}</span>
                  </div>
                  {needsConfig ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(filteredIndex + 1)}
                    >
                      Edit
                    </Button>
                  ) : null}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <>
                    {Object.entries(configurations[originalIndex] || {}).map(([key, value]) => {
                      // Format arrays nicely (for multiple methods)
                      if (Array.isArray(value)) {
                        return (
                          <div key={key}>
                            <span className="font-medium">{key}:</span> {value.join(', ')}
                          </div>
                        );
                      }
                      return (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      );
                    })}
                    {Object.keys(configurations[originalIndex] || {}).length === 0 && (
                      <span>No configuration</span>
                    )}
                  </>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
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
    return icons[toolType] || "🔧";
  };

  if (toolChain.length === 0) {
    return null;
  }

  // If all tools are SMS (no tools need configuration), close the modal
  if (toolsNeedingConfig.length === 0) {
    // All tools are SMS, which is configured in the backend
    // Just close the modal without showing it
    if (open) {
      // Use setTimeout to avoid state update during render
      setTimeout(() => {
        onClose();
      }, 0);
    }
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isOverviewStep
              ? "Configure Workflow Tools"
              : isReviewStep
              ? "Review Configurations"
              : `Step ${currentStep} of ${totalSteps + 1}: ${getToolDisplayName(toolsNeedingConfig[currentToolIndex])}`}
          </DialogTitle>
          <DialogDescription>
            {isOverviewStep
              ? "Configure all tools in your workflow"
              : isReviewStep
              ? "Review and save all configurations"
              : `Configure ${getToolDisplayName(toolChain[currentToolIndex])}`}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="mt-4 mb-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span>
              {isOverviewStep
                ? "Overview"
                : isReviewStep
                ? "Review"
                : `${currentStep} of ${totalSteps + 1}`}
            </span>
          </div>
          <div className="flex gap-1">
            {[0, ...Array.from({ length: totalSteps }, (_, i) => i + 1), totalSteps + 1].map((step) => {
              const stepIndex = step;
              const isActive = currentStep === stepIndex;
              const isCompleted = currentStep > stepIndex;
              
              return (
                <div
                  key={stepIndex}
                  className={cn(
                    "h-2 flex-1 rounded",
                    isActive
                      ? "bg-primary"
                      : isCompleted
                      ? "bg-green-500"
                      : "bg-muted"
                  )}
                />
              );
            })}
          </div>
        </div>

        {loadingOptions ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {isOverviewStep && renderOverview()}
            {!isOverviewStep && !isReviewStep && currentToolIndex >= 0 && renderToolConfiguration(currentToolIndex)}
            {isReviewStep && renderReview()}

            <div className="flex justify-between gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={currentStep === 0 ? onClose : handlePrevious}
                disabled={loading}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                {currentStep === 0 ? "Cancel" : "Previous"}
              </Button>
              
              <div className="flex gap-2">
                {isReviewStep ? (
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save All Configurations"
                    )}
                  </Button>
                ) : (
                  <Button onClick={handleNext} disabled={loading}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
