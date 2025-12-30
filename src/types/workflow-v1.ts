// Node types
export type TriggerType = 
  | "google-sheets-new-row" 
  | "google-sheets-row-updated" 
  | "webhook" 
  | "manual"
  | "select-trigger"; // Placeholder for unselected trigger

export type ActionType = 
  | "make-call" 
  | "knowledge-base" 
  | "condition" 
  | "agent-step" 
  | "google-sheets-action" 
  | "api-request"
  | "select-action"; // Placeholder for unselected action

export type NodeType = TriggerType | ActionType;

// Node-specific configurations
export interface GoogleSheetsTriggerConfig {
  connection: string; // Google account connection
  spreadsheetId: string;
  sheetTitle?: string;
}

export interface MakeCallActionConfig {
  agentId: string;
  phoneNumber?: string; // Auto-filled or manual
  message?: string;
}

export interface KnowledgeBaseConfig {
  query: string; // Auto-filled by AI or manual
  maxResults: number;
  searchFuzziness: number; // 0-100
  knowledgeBaseIds: string[];
  autoFillQuery?: boolean;
  autoFillMaxResults?: boolean;
}

export interface ConditionConfig {
  conditions: Array<{
    id: string;
    expression: string; // e.g., "Go down this path if test"
    examples?: string[];
  }>;
  forceSelection: boolean; // Stop if no condition met
}

export interface GoogleSheetsActionConfig {
  connection: string;
  action: "append-row" | "update-cell" | "clear-cell" | "create-column" | "append-rows";
  spreadsheetId: string;
  sheetTitle: string;
  data?: Record<string, any>; // Auto-filled or manual
}

export interface ApiRequestConfig {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
}

export interface AgentStepConfig {
  agentId: string;
  prompt: string;
  model?: string;
  askForConfirmation?: "never" | "always" | "on-side-effects";
  skills?: Array<{
    id: string;
    type: ActionType;
    name: string;
    config?: any;
  }>;
  exitConditions?: Array<{
    id: string;
    condition: string;
  }>;
}

export type NodeConfig = 
  | GoogleSheetsTriggerConfig 
  | MakeCallActionConfig 
  | KnowledgeBaseConfig 
  | ConditionConfig 
  | GoogleSheetsActionConfig 
  | ApiRequestConfig 
  | AgentStepConfig;

// Workflow Node
export interface WorkflowNodeV1 {
  id: string;
  type: NodeType;
  name: string;
  position: { x: number; y: number };
  config: NodeConfig; // Type-specific configuration
  connections?: string[]; // IDs of connected nodes (deprecated, use connections array in WorkflowV1)
}

// Connection between nodes
export interface WorkflowConnectionV1 {
  from: string; // Source node ID
  to: string; // Target node ID
  condition?: string; // For condition nodes - condition ID that triggers this connection
}

// Workflow structure
export interface WorkflowV1 {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNodeV1[];
  connections: WorkflowConnectionV1[];
  created_at?: string;
  updated_at?: string;
  status?: "draft" | "published";
  // Settings
  greetingMessage?: string; // Greeting message for the workflow
  context?: string; // Agent prompts/context
  memories?: Array<{ id: string; content: string }>; // Memories for the agent
  defaultModel?: string; // Default model selection
  safeMode?: boolean; // Safe mode toggle
}

// Type guards
export function isTriggerType(type: NodeType): type is TriggerType {
  return [
    "google-sheets-new-row",
    "google-sheets-row-updated",
    "webhook",
    "manual"
  ].includes(type);
}

export function isActionType(type: NodeType): type is ActionType {
  return [
    "make-call",
    "knowledge-base",
    "condition",
    "agent-step",
    "google-sheets-action",
    "api-request"
  ].includes(type);
}

export function isGoogleSheetsTriggerConfig(config: NodeConfig): config is GoogleSheetsTriggerConfig {
  return "spreadsheetId" in config && "connection" in config;
}

export function isMakeCallActionConfig(config: NodeConfig): config is MakeCallActionConfig {
  return "agentId" in config && !("spreadsheetId" in config);
}

export function isKnowledgeBaseConfig(config: NodeConfig): config is KnowledgeBaseConfig {
  return "query" in config && "maxResults" in config && "searchFuzziness" in config;
}

export function isConditionConfig(config: NodeConfig): config is ConditionConfig {
  return "conditions" in config && Array.isArray((config as ConditionConfig).conditions);
}

export function isGoogleSheetsActionConfig(config: NodeConfig): config is GoogleSheetsActionConfig {
  return "action" in config && "spreadsheetId" in config && (config as GoogleSheetsActionConfig).action?.startsWith("append") || (config as GoogleSheetsActionConfig).action === "update-cell" || (config as GoogleSheetsActionConfig).action === "clear-cell" || (config as GoogleSheetsActionConfig).action === "create-column";
}

export function isApiRequestConfig(config: NodeConfig): config is ApiRequestConfig {
  return "url" in config && "method" in config;
}

export function isAgentStepConfig(config: NodeConfig): config is AgentStepConfig {
  return "agentId" in config && !("spreadsheetId" in config) && !("url" in config) && !("query" in config);
}

// Helper to get default config for a node type
export function getDefaultConfigForNodeType(type: NodeType): NodeConfig {
  switch (type) {
    case "google-sheets-new-row":
    case "google-sheets-row-updated":
      return {
        connection: "",
        spreadsheetId: "",
        sheetTitle: ""
      } as GoogleSheetsTriggerConfig;
    
    case "make-call":
      return {
        agentId: "",
        phoneNumber: "",
        message: ""
      } as MakeCallActionConfig;
    
    case "knowledge-base":
      return {
        query: "",
        maxResults: 5,
        searchFuzziness: 100,
        knowledgeBaseIds: [],
        autoFillQuery: true,
        autoFillMaxResults: true
      } as KnowledgeBaseConfig;
    
    case "condition":
      return {
        conditions: [
          { id: "1", expression: "Go down this path if test" }
        ],
        forceSelection: false
      } as ConditionConfig;
    
    case "google-sheets-action":
      return {
        connection: "",
        action: "append-row",
        spreadsheetId: "",
        sheetTitle: "",
        data: {}
      } as GoogleSheetsActionConfig;
    
    case "api-request":
      return {
        url: "",
        method: "GET",
        headers: {},
        body: {}
      } as ApiRequestConfig;
    
    case "agent-step":
      return {
        agentId: "",
        prompt: "",
        model: "Default - Currently Gemini 3.0 Flash",
        askForConfirmation: "never",
        skills: [],
        exitConditions: []
      } as AgentStepConfig;
    
    default:
      return {} as NodeConfig;
  }
}

// Helper to get default name for a node type
export function getDefaultNameForNodeType(type: NodeType): string {
  switch (type) {
    case "google-sheets-new-row":
      return "New row added";
    case "google-sheets-row-updated":
      return "Row updated";
    case "webhook":
      return "Webhook trigger";
    case "manual":
      return "Manual trigger";
    case "make-call":
      return "Make Call";
    case "knowledge-base":
      return "Search knowledge base";
    case "condition":
      return "Condition";
    case "agent-step":
      return "Agent Step";
    case "google-sheets-action":
      return "Append row";
    case "api-request":
      return "API Request";
    default:
      return "Untitled";
  }
}

