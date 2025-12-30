import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Zap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { 
  WorkflowNodeV1, 
  NodeConfig,
  GoogleSheetsTriggerConfig,
  MakeCallActionConfig,
  KnowledgeBaseConfig,
  GoogleSheetsActionConfig,
  ApiRequestConfig,
  AgentStepConfig as AgentStepConfigType
} from "@/types/workflow-v1";
import {
  isGoogleSheetsTriggerConfig,
  isMakeCallActionConfig,
  isKnowledgeBaseConfig,
  isConditionConfig,
  isGoogleSheetsActionConfig,
  isApiRequestConfig,
  isAgentStepConfig
} from "@/types/workflow-v1";
import { ConditionEditor } from "./ConditionEditor";
import { agentsApi } from "@/lib/api";
import type { Agent } from "@/lib/api";

interface NodeConfigPanelV1Props {
  node: WorkflowNodeV1;
  onClose: () => void;
  onUpdate: (node: WorkflowNodeV1) => void;
  onOpenTriggerModal?: () => void;
  onOpenActionModal?: () => void;
}

export function NodeConfigPanelV1({ node, onUpdate, onClose, onOpenTriggerModal, onOpenActionModal }: NodeConfigPanelV1Props) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  useEffect(() => {
    // Fetch agents if needed for agent selection
    if (node.type === "make-call" || node.type === "agent-step") {
      setLoadingAgents(true);
      agentsApi.list()
        .then(response => {
          if (response.data && Array.isArray(response.data)) {
            setAgents(response.data);
          }
        })
        .catch(err => {
          console.error("Failed to fetch agents:", err);
        })
        .finally(() => {
          setLoadingAgents(false);
        });
    }
  }, [node.type]);

  const handleConfigUpdate = (updates: Partial<WorkflowNodeV1['config']>) => {
    onUpdate({
      ...node,
      config: {
        ...node.config,
        ...updates
      } as WorkflowNodeV1['config']
    });
  };

  const renderGoogleSheetsTrigger = () => {
    if (!isGoogleSheetsTriggerConfig(node.config)) return null;
    const config = node.config;

    return (
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Connection (required)</Label>
          <Select
            value={config.connection}
            onValueChange={(value) => handleConfigUpdate({ connection: value })}
          >
            <SelectTrigger className="mt-2 bg-secondary/50">
              <SelectValue placeholder="Select Google account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">vbrazo@gmail.com</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Spreadsheet ID or URL (required)</Label>
          <Input
            value={config.spreadsheetId}
            onChange={(e) => handleConfigUpdate({ spreadsheetId: e.target.value })}
            placeholder="Enter spreadsheet ID or URL"
            className="mt-2 bg-secondary/50"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Sheet title</Label>
          <Input
            value={config.sheetTitle || ""}
            onChange={(e) => handleConfigUpdate({ sheetTitle: e.target.value })}
            placeholder="Leave empty if there is only one sheet"
            className="mt-2 bg-secondary/50"
          />
        </div>
      </div>
    );
  };

  const renderMakeCallAction = () => {
    if (!isMakeCallActionConfig(node.config)) return null;
    const config = node.config;

    return (
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Agent (required)</Label>
          <Select
            value={config.agentId}
            onValueChange={(value) => handleConfigUpdate({ agentId: value })}
            disabled={loadingAgents}
          >
            <SelectTrigger className="mt-2 bg-secondary/50">
              <SelectValue placeholder="Select an agent" />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Phone Number</Label>
          <Input
            value={config.phoneNumber || ""}
            onChange={(e) => handleConfigUpdate({ phoneNumber: e.target.value })}
            placeholder="AI will automatically fill this field"
            className="mt-2 bg-secondary/50"
          />
          <div className="flex items-center gap-2 mt-2">
            <Switch defaultChecked />
            <Label className="text-xs text-muted-foreground">Auto</Label>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Initial Message</Label>
          <Textarea
            value={config.message || ""}
            onChange={(e) => handleConfigUpdate({ message: e.target.value })}
            placeholder="Optional message to start the call"
            className="mt-2 bg-secondary/50 min-h-[100px]"
          />
        </div>
      </div>
    );
  };

  const renderKnowledgeBase = () => {
    if (!isKnowledgeBaseConfig(node.config)) return null;
    const config = node.config as KnowledgeBaseConfig;

    return (
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Query (required)</Label>
          <Input
            value={config.query}
            onChange={(e) => handleConfigUpdate({ query: e.target.value })}
            placeholder="AI will automatically fill this field"
            className="mt-2 bg-secondary/50"
          />
          <div className="flex items-center gap-2 mt-2">
            <Switch
              checked={config.autoFillQuery}
              onCheckedChange={(checked) => handleConfigUpdate({ autoFillQuery: checked })}
            />
            <Label className="text-xs text-muted-foreground">Auto</Label>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Max Results (required)</Label>
          <Input
            type="number"
            value={config.maxResults}
            onChange={(e) => handleConfigUpdate({ maxResults: parseInt(e.target.value) || 5 })}
            placeholder="AI will automatically fill this field"
            className="mt-2 bg-secondary/50"
          />
          <div className="flex items-center gap-2 mt-2">
            <Switch
              checked={config.autoFillMaxResults}
              onCheckedChange={(checked) => handleConfigUpdate({ autoFillMaxResults: checked })}
            />
            <Label className="text-xs text-muted-foreground">Auto</Label>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Search Fuzziness</Label>
          <div className="mt-2 space-y-2">
            <Slider
              value={[config.searchFuzziness]}
              onValueChange={([value]) => handleConfigUpdate({ searchFuzziness: value })}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 (Keyword)</span>
              <span>{config.searchFuzziness}</span>
              <span>100 (Semantic)</span>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Knowledge Base</Label>
          <div className="mt-2 p-4 border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded">
                  <span className="text-xs">📄</span>
                </div>
                <span className="text-sm font-medium">Files</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <span className="text-xs">⚙️</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Syncing</p>
          </div>
        </div>
      </div>
    );
  };

  const renderCondition = () => {
    if (!isConditionConfig(node.config)) return null;
    const config = node.config;

    return (
      <ConditionEditor
        config={config}
        onUpdate={(updatedConfig) => handleConfigUpdate(updatedConfig)}
      />
    );
  };

  const renderGoogleSheetsAction = () => {
    if (!isGoogleSheetsActionConfig(node.config)) return null;
    const config = node.config as GoogleSheetsActionConfig;

    return (
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Connection (required)</Label>
          <Select
            value={config.connection}
            onValueChange={(value) => handleConfigUpdate({ connection: value })}
          >
            <SelectTrigger className="mt-2 bg-secondary/50">
              <SelectValue placeholder="Select Google account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">vbrazo@gmail.com</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Action (required)</Label>
          <Select
            value={config.action}
            onValueChange={(value: GoogleSheetsActionConfig["action"]) => handleConfigUpdate({ action: value })}
          >
            <SelectTrigger className="mt-2 bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="append-row">Append row</SelectItem>
              <SelectItem value="append-rows">Append rows</SelectItem>
              <SelectItem value="update-cell">Update cell</SelectItem>
              <SelectItem value="clear-cell">Clear cell</SelectItem>
              <SelectItem value="create-column">Create column</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Spreadsheet (required)</Label>
          <Input
            value={config.spreadsheetId}
            onChange={(e) => handleConfigUpdate({ spreadsheetId: e.target.value })}
            placeholder="Select an option"
            className="mt-2 bg-secondary/50"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Sheet Title (required)</Label>
          <Input
            value={config.sheetTitle}
            onChange={(e) => handleConfigUpdate({ sheetTitle: e.target.value })}
            placeholder="AI will automatically fill this field"
            className="mt-2 bg-secondary/50"
          />
          <div className="flex items-center gap-2 mt-2">
            <Switch defaultChecked />
            <Label className="text-xs text-muted-foreground">Auto</Label>
          </div>
        </div>
      </div>
    );
  };

  const renderApiRequest = () => {
    if (!isApiRequestConfig(node.config)) return null;
    const config = node.config as ApiRequestConfig;

    return (
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">URL (required)</Label>
          <Input
            value={config.url}
            onChange={(e) => handleConfigUpdate({ url: e.target.value })}
            placeholder="https://api.example.com/endpoint"
            className="mt-2 bg-secondary/50"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Method (required)</Label>
          <Select
            value={config.method}
            onValueChange={(value: ApiRequestConfig["method"]) => handleConfigUpdate({ method: value })}
          >
            <SelectTrigger className="mt-2 bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Headers</Label>
          <Textarea
            value={JSON.stringify(config.headers || {}, null, 2)}
            onChange={(e) => {
              try {
                const headers = JSON.parse(e.target.value);
                handleConfigUpdate({ headers });
              } catch {
                // Invalid JSON, ignore
              }
            }}
            placeholder='{"Content-Type": "application/json"}'
            className="mt-2 bg-secondary/50 min-h-[100px] font-mono text-xs"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Body</Label>
          <Textarea
            value={JSON.stringify(config.body || {}, null, 2)}
            onChange={(e) => {
              try {
                const body = JSON.parse(e.target.value);
                handleConfigUpdate({ body });
              } catch {
                // Invalid JSON, ignore
              }
            }}
            placeholder='{"key": "value"}'
            className="mt-2 bg-secondary/50 min-h-[100px] font-mono text-xs"
          />
        </div>
      </div>
    );
  };

  const renderAgentStep = () => {
    if (!isAgentStepConfig(node.config)) return null;
    const config = node.config as AgentStepConfigType;

    return (
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Agent (required)</Label>
          <Select
            value={config.agentId}
            onValueChange={(value) => handleConfigUpdate({ agentId: value })}
            disabled={loadingAgents}
          >
            <SelectTrigger className="mt-2 bg-secondary/50">
              <SelectValue placeholder="Select an agent" />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Prompt (required)</Label>
          <Textarea
            value={config.prompt || ""}
            onChange={(e) => handleConfigUpdate({ prompt: e.target.value })}
            placeholder="You are a polite customer support agent. Your job is to help the customer."
            className="mt-2 bg-secondary/50 min-h-[120px]"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Model (required)</Label>
          <Select
            value={config.model || "Default - Currently Gemini 3.0 Flash"}
            onValueChange={(value) => handleConfigUpdate({ model: value })}
          >
            <SelectTrigger className="mt-2 bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Default - Currently Gemini 3.0 Flash">
                Default - Currently Gemini 3.0 Flash
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Ask for Confirmation (required)</Label>
          <p className="text-xs text-muted-foreground mt-1 mb-2">
            Require this agent step to ask for confirmation before using any skills with side effects
          </p>
          <Select
            value={config.askForConfirmation || "never"}
            onValueChange={(value: AgentStepConfigType["askForConfirmation"]) => handleConfigUpdate({ askForConfirmation: value })}
          >
            <SelectTrigger className="mt-2 bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="always">Always</SelectItem>
              <SelectItem value="on-side-effects">On Side Effects</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Skills</Label>
          <p className="text-xs text-muted-foreground mt-1 mb-2">
            Add actions for this agent to access when needed.
          </p>
          <div className="space-y-2 mt-2">
            {(config.skills || []).map((skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <span className="text-sm font-medium">{skill.name}</span>
              </div>
            ))}
            {(!config.skills || config.skills.length === 0) && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No skills added yet
              </p>
            )}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Exit Conditions</Label>
          <div className="space-y-2 mt-2">
            {(config.exitConditions || []).map((condition) => (
              <div
                key={condition.id}
                className="p-3 border border-border rounded-lg"
              >
                <span className="text-sm">{condition.condition || "Empty condition"}</span>
              </div>
            ))}
            {(!config.exitConditions || config.exitConditions.length === 0) && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No exit conditions added yet
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderConfig = () => {
    switch (node.type) {
      case "select-trigger":
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="p-4 rounded-lg bg-yellow-500">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">Select a trigger</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Triggers are events that start your agent workflows
              </p>
              <Button
                onClick={() => {
                  if (onOpenTriggerModal) {
                    onOpenTriggerModal();
                  }
                }}
                className="bg-primary text-primary-foreground"
              >
                Select trigger
              </Button>
            </div>
          </div>
        );
      case "select-action":
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="p-4 rounded-lg bg-pink-500">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">Select an action</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Actions are steps your agent will perform in the workflow
              </p>
              <Button
                onClick={() => {
                  if (onOpenActionModal) {
                    onOpenActionModal();
                  }
                }}
                className="bg-primary text-primary-foreground"
              >
                Select action
              </Button>
            </div>
          </div>
        );
      case "google-sheets-new-row":
      case "google-sheets-row-updated":
        return renderGoogleSheetsTrigger();
      case "make-call":
        return renderMakeCallAction();
      case "knowledge-base":
        return renderKnowledgeBase();
      case "condition":
        return renderCondition();
      case "google-sheets-action":
        return renderGoogleSheetsAction();
      case "api-request":
        return renderApiRequest();
      case "agent-step":
        return renderAgentStep();
      default:
        return <div className="text-sm text-muted-foreground">No configuration available</div>;
    }
  };

  return (
    <div className="w-[400px] border-l border-border bg-card flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="font-semibold">{node.name}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderConfig()}
      </div>
    </div>
  );
}

