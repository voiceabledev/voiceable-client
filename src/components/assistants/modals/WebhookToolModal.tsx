import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Globe,
  Plus,
  X,
  Settings2,
  FileCode,
  Braces,
  MessageSquare,
  HelpCircle,
  Camera,
  Trash2,
  Key,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WebhookTool, WebhookHeader, WebhookQueryParam, WebhookPathParam } from "@/types/assistant";
import { getEmptyWebhookHeader, getEmptyWebhookQueryParam, getEmptyWebhookPathParam, getEmptyWebhookBodyParam } from "@/utils/assistantHelpers";
import { cn } from "@/lib/utils";
import { secretsApi, type ElevenLabsSecret } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type WebhookToolModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingWebhookTool: WebhookTool | null;
  webhookForm: WebhookTool;
  setWebhookForm: React.Dispatch<React.SetStateAction<WebhookTool>>;
  onSave: () => void;
  onClose: () => void;
};

export const WebhookToolModal: React.FC<WebhookToolModalProps> = ({
  open,
  onOpenChange,
  editingWebhookTool,
  webhookForm,
  setWebhookForm,
  onSave,
  onClose,
}) => {
  const { toast } = useToast();
  const [secrets, setSecrets] = useState<ElevenLabsSecret[]>([]);
  const [showCreateSecretModal, setShowCreateSecretModal] = useState(false);
  const [newSecretName, setNewSecretName] = useState("");
  const [newSecretValue, setNewSecretValue] = useState("");
  const [loadingSecrets, setLoadingSecrets] = useState(false);
  const [creatingSecret, setCreatingSecret] = useState(false);
  // Track enum input values for each parameter type
  const [enumInputValues, setEnumInputValues] = useState<{
    query: { [paramIndex: number]: string };
    path: { [paramIndex: number]: string };
    body: { [paramIndex: number]: string };
  }>({ query: {}, path: {}, body: {} });

  // Fetch secrets when modal opens
  const fetchSecrets = async () => {
    try {
      setLoadingSecrets(true);
      const response = await secretsApi.list();
      if (response.data?.secrets) {
        setSecrets(response.data.secrets);
      }
    } catch (error) {
      console.error("Failed to fetch secrets:", error);
      toast({
        title: "Error",
        description: "Failed to load secrets.",
        variant: "destructive",
      });
    } finally {
      setLoadingSecrets(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSecrets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleCreateSecret = async () => {
    if (!newSecretName.trim() || !newSecretValue.trim()) {
      toast({
        title: "Error",
        description: "Please provide both name and value for the secret.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreatingSecret(true);
      const response = await secretsApi.create({
        name: newSecretName.trim(),
        value: newSecretValue.trim(),
      });
      
      if (response.data) {
        setSecrets(prev => [...prev, response.data!]);
        setNewSecretName("");
        setNewSecretValue("");
        setShowCreateSecretModal(false);
        toast({
          title: "Success",
          description: "Secret created successfully.",
        });
      }
    } catch (error) {
      console.error("Failed to create secret:", error);
      toast({
        title: "Error",
        description: "Failed to create secret.",
        variant: "destructive",
      });
    } finally {
      setCreatingSecret(false);
    }
  };

  // Ensure pathParams, headers, queryParams, and bodyParams are always defined
  const safeWebhookForm = useMemo(() => ({
    ...webhookForm,
    pathParams: webhookForm.pathParams || [],
    headers: webhookForm.headers || [],
    queryParams: webhookForm.queryParams || [],
    bodyParams: webhookForm.bodyParams || [],
  }), [webhookForm]);

  // Automatically extract path parameters from URL
  useEffect(() => {
    const url = webhookForm.url || "";
    const currentPathParams = webhookForm.pathParams || [];
    
    // Match all {paramName} patterns in the URL
    const pathParamMatches = url.match(/\{([^}]+)\}/g) || [];
    const paramNames = pathParamMatches.map(match => match.slice(1, -1)); // Remove { and }

    // Get current path params identifiers
    const currentParamIdentifiers = currentPathParams.map(p => p.identifier);

    // Find new params that need to be added
    const newParamNames = paramNames.filter(name => !currentParamIdentifiers.includes(name));
    
    // Find params that should be removed (no longer in URL)
    const paramsToRemove = currentParamIdentifiers.filter(identifier => !paramNames.includes(identifier));

    // Only update if there are changes
    if (newParamNames.length > 0 || paramsToRemove.length > 0) {
      let updatedPathParams = [...currentPathParams];

      // Remove params that are no longer in the URL
      if (paramsToRemove.length > 0) {
        updatedPathParams = updatedPathParams.filter(p => !paramsToRemove.includes(p.identifier));
      }

      // Add new params found in the URL
      newParamNames.forEach(paramName => {
        const newParam = getEmptyWebhookPathParam();
        newParam.identifier = paramName;
        newParam.description = "the identifier";
        updatedPathParams.push(newParam);
      });

      // Update the form
      setWebhookForm(prev => ({
        ...prev,
        pathParams: updatedPathParams,
      }));
    }
  }, [webhookForm.url, webhookForm.pathParams, setWebhookForm]);
  const addHeader = () => {
    setWebhookForm({
      ...safeWebhookForm,
      headers: [...(safeWebhookForm.headers || []), getEmptyWebhookHeader()],
    });
  };

  const updateHeader = (index: number, updates: Partial<WebhookHeader>) => {
    const newHeaders = [...(safeWebhookForm.headers || [])];
    newHeaders[index] = { ...newHeaders[index], ...updates };
    setWebhookForm({ ...safeWebhookForm, headers: newHeaders });
  };

  const removeHeader = (index: number) => {
    setWebhookForm({
      ...safeWebhookForm,
      headers: (safeWebhookForm.headers || []).filter((_, i) => i !== index),
    });
  };

  const addQueryParam = () => {
    setWebhookForm({
      ...safeWebhookForm,
      queryParams: [...(safeWebhookForm.queryParams || []), getEmptyWebhookQueryParam()],
    });
  };

  const updateQueryParam = (index: number, updates: Partial<WebhookQueryParam>) => {
    const newParams = [...(safeWebhookForm.queryParams || [])];
    newParams[index] = { ...newParams[index], ...updates };
    setWebhookForm({ ...safeWebhookForm, queryParams: newParams });
  };

  const removeQueryParam = (index: number) => {
    setWebhookForm({
      ...safeWebhookForm,
      queryParams: (safeWebhookForm.queryParams || []).filter((_, i) => i !== index),
    });
  };

  const updatePathParam = (index: number, updates: Partial<WebhookPathParam>) => {
    const newParams = [...safeWebhookForm.pathParams];
    newParams[index] = { ...newParams[index], ...updates };
    setWebhookForm({ ...safeWebhookForm, pathParams: newParams });
  };

  const removePathParam = (index: number) => {
    setWebhookForm({
      ...safeWebhookForm,
      pathParams: safeWebhookForm.pathParams.filter((_, i) => i !== index),
    });
  };

  const addBodyParam = () => {
    setWebhookForm({
      ...safeWebhookForm,
      bodyParams: [...(safeWebhookForm.bodyParams || []), getEmptyWebhookBodyParam()],
    });
  };

  const updateBodyParam = (index: number, updates: Partial<WebhookQueryParam>) => {
    const newParams = [...(safeWebhookForm.bodyParams || [])];
    newParams[index] = { ...newParams[index], ...updates };
    setWebhookForm({ ...safeWebhookForm, bodyParams: newParams });
  };

  const removeBodyParam = (index: number) => {
    setWebhookForm({
      ...safeWebhookForm,
      bodyParams: (safeWebhookForm.bodyParams || []).filter((_, i) => i !== index),
    });
  };

  const addEnumValue = (paramIndex: number, paramType: "query" | "path" | "body", inputValue?: string) => {
    const value = inputValue || enumInputValues[paramType][paramIndex] || "";
    if (!value.trim()) return;

    if (paramType === "query") {
      const newParams = [...(safeWebhookForm.queryParams || [])];
      newParams[paramIndex].enumValues = [...(newParams[paramIndex].enumValues || []), value.trim()];
      setWebhookForm({ ...safeWebhookForm, queryParams: newParams });
      // Clear the input
      setEnumInputValues({ ...enumInputValues, query: { ...enumInputValues.query, [paramIndex]: "" } });
    } else if (paramType === "path") {
      const newParams = [...safeWebhookForm.pathParams];
      newParams[paramIndex].enumValues = [...(newParams[paramIndex].enumValues || []), value.trim()];
      setWebhookForm({ ...safeWebhookForm, pathParams: newParams });
      // Clear the input
      setEnumInputValues({ ...enumInputValues, path: { ...enumInputValues.path, [paramIndex]: "" } });
    } else {
      const newParams = [...(safeWebhookForm.bodyParams || [])];
      newParams[paramIndex].enumValues = [...(newParams[paramIndex].enumValues || []), value.trim()];
      setWebhookForm({ ...safeWebhookForm, bodyParams: newParams });
      // Clear the input
      setEnumInputValues({ ...enumInputValues, body: { ...enumInputValues.body, [paramIndex]: "" } });
    }
  };

  const updateEnumValue = (paramIndex: number, enumIndex: number, value: string, paramType: "query" | "path" | "body") => {
    if (paramType === "query") {
      const newParams = [...(safeWebhookForm.queryParams || [])];
      newParams[paramIndex].enumValues[enumIndex] = value;
      setWebhookForm({ ...safeWebhookForm, queryParams: newParams });
    } else if (paramType === "path") {
      const newParams = [...safeWebhookForm.pathParams];
      newParams[paramIndex].enumValues[enumIndex] = value;
      setWebhookForm({ ...safeWebhookForm, pathParams: newParams });
    } else {
      const newParams = [...(safeWebhookForm.bodyParams || [])];
      newParams[paramIndex].enumValues[enumIndex] = value;
      setWebhookForm({ ...safeWebhookForm, bodyParams: newParams });
    }
  };

  const removeEnumValue = (paramIndex: number, enumIndex: number, paramType: "query" | "path" | "body") => {
    if (paramType === "query") {
      const newParams = [...(safeWebhookForm.queryParams || [])];
      newParams[paramIndex].enumValues = (newParams[paramIndex].enumValues || []).filter((_, i) => i !== enumIndex);
      setWebhookForm({ ...safeWebhookForm, queryParams: newParams });
    } else if (paramType === "path") {
      const newParams = [...safeWebhookForm.pathParams];
      newParams[paramIndex].enumValues = (newParams[paramIndex].enumValues || []).filter((_, i) => i !== enumIndex);
      setWebhookForm({ ...safeWebhookForm, pathParams: newParams });
    } else {
      const newParams = [...(safeWebhookForm.bodyParams || [])];
      newParams[paramIndex].enumValues = (newParams[paramIndex].enumValues || []).filter((_, i) => i !== enumIndex);
      setWebhookForm({ ...safeWebhookForm, bodyParams: newParams });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <div className="p-6 border-b">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>{editingWebhookTool ? "Edit Webhook Tool" : "Add Webhook Tool"}</DialogTitle>
                <DialogDescription>
                  Define a webhook that the assistant can call during a conversation.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <Tabs defaultValue="configuration" className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="px-6 border-b bg-secondary/20 flex-shrink-0">
              <TabsList className="h-12 bg-transparent gap-6">
                <TabsTrigger
                  value="configuration"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full px-1"
                >
                  Configuration
                </TabsTrigger>
                <TabsTrigger
                  value="headers"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full px-1"
                >
                  Headers
                </TabsTrigger>
                <TabsTrigger
                  value="query-parameters"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full px-1"
                >
                  Query parameters
                </TabsTrigger>
                <TabsTrigger
                  value="path-parameters"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full px-1"
                >
                  Path parameters
                </TabsTrigger>
                <TabsTrigger
                  value="body-parameters"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full px-1"
                >
                  Body parameters
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <TabsContent value="configuration" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-base font-semibold">Configuration</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Describe to the LLM how and when to use the tool.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={safeWebhookForm.name}
                      onChange={(e) => setWebhookForm({ ...safeWebhookForm, name: e.target.value })}
                      placeholder="e.g., check_order_status"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Method</Label>
                    <Select
                      value={safeWebhookForm.method}
                      onValueChange={(val: "GET" | "POST" | "PUT" | "DELETE" | "PATCH") => setWebhookForm({ ...safeWebhookForm, method: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    value={safeWebhookForm.url}
                    onChange={(e) => setWebhookForm({ ...safeWebhookForm, url: e.target.value })}
                    placeholder="https://api.example.com/v1/orders"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={safeWebhookForm.description}
                    onChange={(e) => setWebhookForm({ ...safeWebhookForm, description: e.target.value })}
                    placeholder="Explain what this tool does and when the LLM should use it..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Response timeout (seconds)</Label>
                      <span className="text-sm text-muted-foreground">{safeWebhookForm.responseTimeout}s</span>
                    </div>
                    <Slider
                      value={[safeWebhookForm.responseTimeout]}
                      onValueChange={([value]) => setWebhookForm({ ...safeWebhookForm, responseTimeout: value })}
                      min={1}
                      max={120}
                      step={1}
                    />
                    <p className="text-xs text-muted-foreground">
                      How long to wait for the client tool to respond before timing out. Default is 20 seconds.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="disable-interruptions"
                      checked={safeWebhookForm.disableInterruptions}
                      onCheckedChange={(checked) =>
                        setWebhookForm({ ...safeWebhookForm, disableInterruptions: checked === true })
                      }
                    />
                    <Label htmlFor="disable-interruptions" className="text-sm font-normal cursor-pointer">
                      Disable interruptions
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    Select this box to disable interruptions while the tool is running.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="headers" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Headers</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Define headers that will be sent with the request
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={addHeader}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add header
                    </Button>
                  </div>

                  {(safeWebhookForm.headers || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No headers defined. Click "Add header" to create one.</p>
                  ) : (
                    <div className="space-y-4">
                      {(safeWebhookForm.headers || []).map((header, index) => (
                        <div key={header.id} className="border rounded-lg p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Type</Label>
                              <Select
                                value={header.type}
                                onValueChange={(val: "secret" | "value") => updateHeader(index, { type: val })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="secret">Secret</SelectItem>
                                  <SelectItem value="value">Value</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Name</Label>
                              <Input
                                value={header.name}
                                onChange={(e) => updateHeader(index, { name: e.target.value })}
                                placeholder="Header name"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>{header.type === "secret" ? "Secret" : "Value"}</Label>
                            {header.type === "secret" ? (
                              <div className="flex gap-2">
                                <Select
                                  value={header.value}
                                  onValueChange={(val) => updateHeader(index, { value: val })}
                                  disabled={loadingSecrets}
                                >
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select a secret" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {secrets.length === 0 ? (
                                      <SelectItem value="" disabled>
                                        {loadingSecrets ? "Loading secrets..." : "No secrets available"}
                                      </SelectItem>
                                    ) : (
                                      secrets.map((secret) => (
                                        <SelectItem key={secret.secret_id} value={secret.secret_id}>
                                          {secret.name}
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setShowCreateSecretModal(true)}
                                  title="Create new secret"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Input
                                value={header.value}
                                onChange={(e) => updateHeader(index, { value: e.target.value })}
                                placeholder="Header value"
                              />
                            )}
                          </div>
                          <div className="flex justify-end">
                            <Button variant="ghost" size="sm" onClick={() => removeHeader(index)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="query-parameters" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Query parameters</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Define parameters that will be collected by the LLM and sent as the query of the request.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={addQueryParam}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add param
                    </Button>
                  </div>

                  {(safeWebhookForm.queryParams || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No query parameters defined. Click "Add param" to create one.</p>
                  ) : (
                    <div className="space-y-6">
                      {(safeWebhookForm.queryParams || []).map((param, index) => (
                        <div key={param.id} className="border rounded-lg p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Data type</Label>
                              <Select
                                value={param.dataType}
                                onValueChange={(val: "string" | "number" | "boolean" | "array" | "object") => updateQueryParam(index, { dataType: val })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {["string", "number", "boolean", "array", "object"].map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Identifier</Label>
                              <Input
                                value={param.identifier}
                                onChange={(e) => updateQueryParam(index, { identifier: e.target.value })}
                                placeholder="Parameter identifier"
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`query-required-${index}`}
                              checked={param.required}
                              onCheckedChange={(checked) => updateQueryParam(index, { required: checked === true })}
                            />
                            <Label htmlFor={`query-required-${index}`} className="text-sm font-normal cursor-pointer">
                              Required
                            </Label>
                          </div>

                          <div className="space-y-2">
                            <Label>Value Type</Label>
                            <Select
                              value={param.valueType}
                              onValueChange={(val: "llm_prompt" | "static") => updateQueryParam(index, { valueType: val })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="llm_prompt">LLM Prompt</SelectItem>
                                <SelectItem value="static">Static</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={param.description}
                              onChange={(e) => updateQueryParam(index, { description: e.target.value })}
                              placeholder="Describe how to extract this data from the transcript..."
                              className="min-h-[80px]"
                            />
                            <p className="text-xs text-muted-foreground">
                              This field will be passed to the LLM and should describe in detail how to extract the data from the transcript.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label>Enum Values (optional)</Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Enter an enum value"
                                value={enumInputValues.query[index] || ""}
                                onChange={(e) => setEnumInputValues({
                                  ...enumInputValues,
                                  query: { ...enumInputValues.query, [index]: e.target.value }
                                })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addEnumValue(index, "query");
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => addEnumValue(index, "query")}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            {param.enumValues.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {param.enumValues.map((value, enumIndex) => (
                                  <div
                                    key={enumIndex}
                                    className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm"
                                  >
                                    <span>{value}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeEnumValue(index, enumIndex, "query")}
                                      className="ml-1 hover:text-destructive"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Add predefined values that the LLM can select from. If no values are provided, the LLM can use any string value.
                            </p>
                          </div>

                          <div className="flex justify-end">
                            <Button variant="ghost" size="sm" onClick={() => removeQueryParam(index)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="path-parameters" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">Path parameters</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure how the path parameters from the URL should be collected by the LLM. Path parameters are automatically detected from the URL when you use curly braces (e.g., {`{id}`}).
                    </p>
                  </div>

                  {safeWebhookForm.pathParams.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Add path wrapped in curly braces to the URL to configure them here.
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {safeWebhookForm.pathParams.map((param, index) => (
                        <div key={param.id} className="border rounded-lg p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Data type</Label>
                              <Select
                                value={param.dataType}
                                onValueChange={(val: "string" | "number" | "boolean" | "array" | "object") => updatePathParam(index, { dataType: val })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {["string", "number", "boolean", "array", "object"].map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Identifier</Label>
                              <Input
                                value={param.identifier}
                                onChange={(e) => updatePathParam(index, { identifier: e.target.value })}
                                placeholder="Parameter identifier"
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`path-required-${index}`}
                              checked={param.required}
                              onCheckedChange={(checked) => updatePathParam(index, { required: checked === true })}
                            />
                            <Label htmlFor={`path-required-${index}`} className="text-sm font-normal cursor-pointer">
                              Required
                            </Label>
                          </div>

                          <div className="space-y-2">
                            <Label>Value Type</Label>
                            <Select
                              value={param.valueType}
                              onValueChange={(val: "llm_prompt" | "static") => updatePathParam(index, { valueType: val })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="llm_prompt">LLM Prompt</SelectItem>
                                <SelectItem value="static">Static</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={param.description}
                              onChange={(e) => updatePathParam(index, { description: e.target.value })}
                              placeholder="Describe how to extract this data from the transcript..."
                              className="min-h-[80px]"
                            />
                            <p className="text-xs text-muted-foreground">
                              This field will be passed to the LLM and should describe in detail how to extract the data from the transcript.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label>Enum Values (optional)</Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Enter an enum value"
                                value={enumInputValues.path[index] || ""}
                                onChange={(e) => setEnumInputValues({
                                  ...enumInputValues,
                                  path: { ...enumInputValues.path, [index]: e.target.value }
                                })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addEnumValue(index, "path");
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => addEnumValue(index, "path")}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            {param.enumValues.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {param.enumValues.map((value, enumIndex) => (
                                  <div
                                    key={enumIndex}
                                    className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm"
                                  >
                                    <span>{value}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeEnumValue(index, enumIndex, "path")}
                                      className="ml-1 hover:text-destructive"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                              The LLM will only be able to select from these predefined values.
                            </p>
                          </div>

                          <div className="flex justify-end">
                            <Button variant="ghost" size="sm" onClick={() => removePathParam(index)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="body-parameters" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">Body parameters</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Define parameters that will be collected by the LLM and sent as the body of the request.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={safeWebhookForm.description || ""}
                      onChange={(e) => setWebhookForm({ ...safeWebhookForm, description: e.target.value })}
                      placeholder="Describe how the LLM should extract data from the transcript for the request body..."
                      className="min-h-[100px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      This field will be passed to the LLM and should describe in detail how to extract the data from the transcript.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Properties</Label>
                    </div>
                    <Button variant="outline" size="sm" onClick={addBodyParam}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add property
                    </Button>
                  </div>

                  {(safeWebhookForm.bodyParams || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No body parameters defined. Click "Add property" to create one.</p>
                  ) : (
                    <div className="space-y-6">
                      {(safeWebhookForm.bodyParams || []).map((param, index) => (
                        <div key={param.id} className="border rounded-lg p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Data type</Label>
                              <Select
                                value={param.dataType}
                                onValueChange={(val: "string" | "number" | "boolean" | "array" | "object") => updateBodyParam(index, { dataType: val })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {["string", "number", "boolean", "array", "object"].map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Identifier</Label>
                              <Input
                                value={param.identifier}
                                onChange={(e) => updateBodyParam(index, { identifier: e.target.value })}
                                placeholder="Parameter identifier"
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`body-required-${index}`}
                              checked={param.required}
                              onCheckedChange={(checked) => updateBodyParam(index, { required: checked === true })}
                            />
                            <Label htmlFor={`body-required-${index}`} className="cursor-pointer">
                              Required
                            </Label>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Value Type</Label>
                              <Select
                                value={param.valueType}
                                onValueChange={(val: "llm_prompt" | "static") => updateBodyParam(index, { valueType: val })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="llm_prompt">LLM Prompt</SelectItem>
                                  <SelectItem value="static">Static</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={param.description}
                              onChange={(e) => updateBodyParam(index, { description: e.target.value })}
                              placeholder="Describe how to extract this data from the transcript..."
                              className="min-h-[80px]"
                            />
                            <p className="text-xs text-muted-foreground">
                              This field will be passed to the LLM and should describe in detail how to extract the data from the transcript.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label>Enum Values (optional)</Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Enter an enum value"
                                value={enumInputValues.body[index] || ""}
                                onChange={(e) => setEnumInputValues({
                                  ...enumInputValues,
                                  body: { ...enumInputValues.body, [index]: e.target.value }
                                })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addEnumValue(index, "body");
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => addEnumValue(index, "body")}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            {param.enumValues.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {param.enumValues.map((value, enumIndex) => (
                                  <div
                                    key={enumIndex}
                                    className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm"
                                  >
                                    <span>{value}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeEnumValue(index, enumIndex, "body")}
                                      className="ml-1 hover:text-destructive"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Add predefined values that the LLM can select from. If no values are provided, the LLM can use any string value.
                            </p>
                          </div>

                          <div className="flex justify-end">
                            <Button variant="ghost" size="sm" onClick={() => removeBodyParam(index)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>

        <div className="p-6 border-t bg-secondary/10">
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={!safeWebhookForm.name || !safeWebhookForm.url}>
              {editingWebhookTool ? "Save changes" : "Add tool"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>

      {/* Create Secret Modal */}
      <Dialog open={showCreateSecretModal} onOpenChange={setShowCreateSecretModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Create Secret</DialogTitle>
                <DialogDescription>
                  Create a new secret that can be used in webhook headers.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newSecretName}
                onChange={(e) => setNewSecretName(e.target.value)}
                placeholder="e.g., API Key"
              />
            </div>
            <div className="space-y-2">
              <Label>Value</Label>
              <Input
                type="password"
                value={newSecretValue}
                onChange={(e) => setNewSecretValue(e.target.value)}
                placeholder="Enter secret value"
              />
              <p className="text-xs text-muted-foreground">
                This value will be stored securely in ElevenLabs.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateSecretModal(false);
              setNewSecretName("");
              setNewSecretValue("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateSecret} disabled={creatingSecret || !newSecretName.trim() || !newSecretValue.trim()}>
              {creatingSecret ? "Creating..." : "Create Secret"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
