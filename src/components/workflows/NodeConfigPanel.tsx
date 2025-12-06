import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  X, 
  Pencil, 
  ChevronDown,
  ChevronRight,
  Plus,
  Phone,
  Settings,
  KeyRound,
  Type,
  FileText,
  Trash2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { WorkflowNode } from "@/pages/WorkflowEditor";

interface NodeConfigPanelProps {
  node: WorkflowNode;
  onClose: () => void;
  onUpdate: (node: WorkflowNode) => void;
}

export function NodeConfigPanel({ node, onClose, onUpdate }: NodeConfigPanelProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["base"]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getNodeTypeIcon = () => {
    switch (node.type) {
      case "end-call":
        return <div className="p-2 rounded-lg bg-destructive"><Phone className="h-5 w-5 text-white" /></div>;
      case "transfer-call":
        return <div className="p-2 rounded-lg bg-success"><Phone className="h-5 w-5 text-white" /></div>;
      case "api-request":
        return <div className="p-2 rounded-lg bg-purple-500"><Settings className="h-5 w-5 text-white" /></div>;
      default:
        return <div className="p-2 rounded-lg bg-orange-500"><Phone className="h-5 w-5 text-white" /></div>;
    }
  };

  const getNodeTypeName = () => {
    switch (node.type) {
      case "end-call": return "End Call";
      case "transfer-call": return "Transfer Call";
      case "api-request": return "API Request";
      case "conversation": return "Conversation";
      case "tool": return "Tool";
      default: return node.type;
    }
  };

  return (
    <div className="w-[400px] border-l border-border bg-card flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {getNodeTypeIcon()}
          <div className="flex items-center gap-2">
            <span className="font-semibold">{node.name}</span>
            <button className="text-muted-foreground hover:text-foreground">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Node Type */}
        <div>
          <Label className="text-muted-foreground text-sm">Node Type</Label>
          <Select defaultValue={node.type}>
            <SelectTrigger className="mt-2 bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conversation">Conversation</SelectItem>
              <SelectItem value="api-request">API Request</SelectItem>
              <SelectItem value="transfer-call">Transfer Call</SelectItem>
              <SelectItem value="end-call">End Call</SelectItem>
              <SelectItem value="tool">Tool</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* End Call specific */}
        {node.type === "end-call" && (
          <div>
            <Label className="text-muted-foreground text-sm">Message</Label>
            <Textarea 
              className="mt-2 bg-secondary/50 min-h-[100px]"
              placeholder="Enter the message to be spoken before ending the call (leave empty for no message)"
              value={node.message || ""}
              onChange={(e) => onUpdate({ ...node, message: e.target.value })}
            />
          </div>
        )}

        {/* Transfer Call specific */}
        {node.type === "transfer-call" && (
          <>
            <div className="p-6 border border-dashed border-border rounded-lg text-center">
              <Phone className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">No destinations configured</p>
              <p className="text-muted-foreground text-xs">Click "Add Destination" to add a transfer destination</p>
            </div>

            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Message
            </Button>

            <div className="border border-border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Request Start</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <Label className="text-muted-foreground text-sm">Message Option</Label>
                <RadioGroup defaultValue="default" className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="default" />
                    <Label htmlFor="default" className="font-normal">Default (server will use default message)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none" className="font-normal">None (no message will be spoken)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom" className="font-normal">Custom</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="wait-message" />
                <Label htmlFor="wait-message" className="text-sm font-normal">
                  Wait for message to be spoken before triggering tool call
                </Label>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Conditions</span>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">No conditions defined</p>
            </div>
          </>
        )}

        {/* API Request specific */}
        {node.type === "api-request" && (
          <>
            {/* Base Configuration */}
            <div className="border border-border rounded-lg overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
                onClick={() => toggleSection("base")}
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <h3 className="font-medium">Base Configuration</h3>
                    <p className="text-sm text-muted-foreground">Configure the tool name, URL, and HTTP method</p>
                  </div>
                </div>
                {expandedSections.includes("base") ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Authorization */}
            <div className="border border-border rounded-lg overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
                onClick={() => toggleSection("auth")}
              >
                <div className="flex items-center gap-3">
                  <KeyRound className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <h3 className="font-medium">Authorization</h3>
                    <p className="text-sm text-muted-foreground">Configure authentication for API requests</p>
                  </div>
                </div>
                {expandedSections.includes("auth") ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Request Headers */}
            <div className="border border-border rounded-lg overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
                onClick={() => toggleSection("headers")}
              >
                <div className="flex items-center gap-3">
                  <Type className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <h3 className="font-medium">Request Headers</h3>
                    <p className="text-sm text-muted-foreground">Custom headers to include with the request</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Header
                </Button>
              </button>
            </div>

            {/* Request Body */}
            <div className="border border-border rounded-lg overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
                onClick={() => toggleSection("body")}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <h3 className="font-medium">Request Body</h3>
                    <p className="text-sm text-muted-foreground">Define the structure of your request body using the schema builder</p>
                  </div>
                </div>
                {expandedSections.includes("body") ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </>
        )}

        {/* Conversation specific - Prompt */}
        {(node.type === "conversation" || node.type === "start") && (
          <div>
            <Label className="text-muted-foreground text-sm">Prompt</Label>
            <Textarea 
              className="mt-2 bg-secondary/50 min-h-[150px]"
              placeholder="Enter the prompt for this conversation node..."
              value={node.prompt || ""}
              onChange={(e) => onUpdate({ ...node, prompt: e.target.value })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
