import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { workflowsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type {
  FieldMapping,
  FieldSchemaField,
  ConversationContextField,
  ToolInChain,
} from "@/types/functions";

interface FieldMappingModalProps {
  open: boolean;
  onClose: () => void;
  tool: ToolInChain;
  agentId: string;
  stepIndex: number;
  onSave: (mappings: FieldMapping[]) => void;
  existingMappings?: FieldMapping[];
}

export const FieldMappingModal: React.FC<FieldMappingModalProps> = ({
  open,
  onClose,
  tool,
  agentId,
  stepIndex,
  onSave,
  existingMappings = [],
}) => {
  const { toast } = useToast();
  const [fields, setFields] = useState<FieldSchemaField[]>([]);
  const [contextFields, setContextFields] = useState<ConversationContextField[]>([]);
  const [mappings, setMappings] = useState<FieldMapping[]>(existingMappings);
  const [loading, setLoading] = useState(true);

  // Update mappings when existingMappings changes
  useEffect(() => {
    if (existingMappings && existingMappings.length > 0) {
      setMappings(existingMappings);
    }
  }, [existingMappings]);

  // Fetch field schema and conversation context when modal opens
  useEffect(() => {
    if (open && tool.type && tool.method && agentId) {
      fetchFieldSchema();
      fetchConversationContext();
    }
  }, [open, tool.type, tool.method, agentId]);

  const fetchFieldSchema = async () => {
    try {
      setLoading(true);
      const response = await workflowsApi.getFieldSchema(
        agentId,
        tool.type,
        tool.method!
      );
      if (response.data?.fields) {
        setFields(response.data.fields);
        // Initialize mappings for fields that don't have one yet
        // Use functional update to access current mappings state
        setMappings((currentMappings) => {
          const newMappings: FieldMapping[] = response.data.fields.map((field: FieldSchemaField) => {
            // Check if mapping already exists in current mappings or existingMappings
            const existing = currentMappings.find((m) => m.target_field === field.key) ||
                            existingMappings.find((m) => m.target_field === field.key);
            if (existing) return existing;

            // Create default mapping based on field type
            return {
              target_field: field.key,
              source_type: "static",
              static_value: "",
            };
          });
          return newMappings;
        });
      }
    } catch (error) {
      console.error("Failed to fetch field schema:", error);
      toast({
        title: "Error",
        description: "Failed to load field schema",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationContext = async () => {
    try {
      const response = await workflowsApi.getConversationContext(agentId);
      if (response.data?.available_fields) {
        setContextFields(response.data.available_fields);
      }
    } catch (error) {
      console.error("Failed to fetch conversation context:", error);
    }
  };


  const updateMapping = (targetField: string, updates: Partial<FieldMapping>) => {
    setMappings((prev) =>
      prev.map((m) =>
        m.target_field === targetField ? { ...m, ...updates } : m
      )
    );
  };

  const handleSourceTypeChange = (targetField: string, sourceType: FieldMapping["source_type"]) => {
    const updates: Partial<FieldMapping> = {
      source_type: sourceType,
      // Clear previous source-specific fields
      static_value: undefined,
      context_path: undefined,
      step_reference: undefined,
      transformation: undefined,
    };

    // Set defaults for new source type
    if (sourceType === "static") {
      updates.static_value = "";
    } else if (sourceType === "computed") {
      updates.transformation = { type: "template", template: "" };
    }

    updateMapping(targetField, updates);
  };

  const handleSave = () => {
    // Filter out empty mappings
    const validMappings = mappings.filter((m) => {
      if (m.source_type === "static") return m.static_value !== "" && m.static_value !== undefined;
      if (m.source_type === "context") return m.context_path;
      if (m.source_type === "previous_step") return m.step_reference;
      if (m.source_type === "computed") return m.transformation?.template;
      return false;
    });

    onSave(validMappings);
    onClose();
  };

  const renderSourceInput = (mapping: FieldMapping, field: FieldSchemaField) => {
    switch (mapping.source_type) {
      case "static":
        return (
          <Input
            value={mapping.static_value?.toString() || ""}
            onChange={(e) => {
              const value = field.type === "number" ? Number(e.target.value) : e.target.value;
              updateMapping(field.key, { static_value: value });
            }}
            type={field.type === "number" ? "number" : "text"}
            placeholder="Enter static value"
          />
        );

      case "context":
        return (
          <Select
            value={mapping.context_path || ""}
            onValueChange={(value) => updateMapping(field.key, { context_path: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select conversation field" />
            </SelectTrigger>
            <SelectContent>
              {contextFields.map((cf) => (
                <SelectItem key={cf.path} value={cf.path}>
                  {cf.label} ({cf.example})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "previous_step":
        return (
          <div className="space-y-2">
            <Select
              value={mapping.step_reference?.step_index?.toString() || ""}
              onValueChange={(value) => {
                const stepIndex = Number(value);
                updateMapping(field.key, {
                  step_reference: {
                    step_index: stepIndex,
                    result_path: mapping.step_reference?.result_path || "",
                  },
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select previous step" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: stepIndex }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    Step {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={mapping.step_reference?.result_path || ""}
              onChange={(e) =>
                updateMapping(field.key, {
                  step_reference: {
                    step_index: mapping.step_reference?.step_index || 0,
                    result_path: e.target.value,
                  },
                })
              }
              placeholder="Result field path (e.g., person_id)"
            />
          </div>
        );

      case "computed":
        return (
          <Textarea
            value={mapping.transformation?.template || ""}
            onChange={(e) =>
              updateMapping(field.key, {
                transformation: {
                  type: "template",
                  template: e.target.value,
                },
              })
            }
            placeholder="Template: Deal with {{caller.name}} - {{current_date}}"
            rows={3}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Configure Field Mappings: {tool.type} - {tool.method}
          </DialogTitle>
          <DialogDescription>
            Map data from conversation context, previous steps, or static values to {tool.type} fields
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading field schema...</div>
        ) : (
          <div className="space-y-6">
            {fields.map((field) => {
              const mapping = mappings.find((m) => m.target_field === field.key);
              if (!mapping) return null;

              return (
                <div
                  key={field.key}
                  className="border border-border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <Label className="text-sm font-medium">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {field.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {field.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Source Type Selector */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Data Source
                    </Label>
                    <Select
                      value={mapping.source_type}
                      onValueChange={(value) =>
                        handleSourceTypeChange(field.key, value as FieldMapping["source_type"])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="static">Static Value</SelectItem>
                        <SelectItem value="context">From Conversation</SelectItem>
                        {stepIndex > 0 && (
                          <SelectItem value="previous_step">From Previous Step</SelectItem>
                        )}
                        <SelectItem value="computed">Computed/Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Source-specific Input */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Value
                    </Label>
                    {renderSourceInput(mapping, field)}
                  </div>
                </div>
              );
            })}

            {fields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No fields available for this tool/method combination
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Save Mappings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
