// Field Mapping Types
export interface FieldMapping {
  target_field: string; // e.g., "title", "person_id"
  source_type: "static" | "context" | "previous_step" | "computed";

  // For static values
  static_value?: string | number | boolean;

  // For conversation context
  context_path?: string; // e.g., "caller.phone_number"

  // For previous step results
  step_reference?: {
    step_index: number;
    result_path: string; // e.g., "person_id"
  };

  // For computed/templates
  transformation?: {
    type: "template" | "function" | "lookup";
    template?: string; // e.g., "Deal - {{caller.name}}"
  };
}

export interface CRMActionConfig {
  method: string;
  field_mappings?: FieldMapping[];
  // Backward compatibility
  pipeline_id?: number;
  stage_id?: number;
}

export interface SMSActionConfig {
  mode: "form" | "questions";
  form?: {
    form_url: string;
    form_description?: string;
  };
  questions?: Array<{
    id: string;
    question_text: string;
    field_name: string;
    validation?: {
      type: "text" | "email" | "phone" | "number";
      required?: boolean;
    };
  }>;
}

export interface ConditionalConfig {
  expression: string; // e.g., "result.length === 0" or "!result.person_id"
  description?: string; // Optional user-friendly description of the rule
  then: ToolInChain[]; // Tools to execute if condition is true
  else: ToolInChain[]; // Tools to execute if condition is false
}

export type ToolInChain = {
  type: string;
  role: string;
  method?: string;
  config?: Record<string, unknown> | ConditionalConfig; // Tool-specific configuration or conditional branching
};

// Type guard to check if a tool is a conditional tool
export function isConditionalTool(tool: ToolInChain): tool is ToolInChain & {
  type: "condition";
  role: "control";
  method: "branch";
  config: ConditionalConfig;
} {
  return tool.type === "condition" &&
    tool.role === "control" &&
    tool.method === "branch" &&
    tool.config !== undefined &&
    typeof tool.config === "object" &&
    "expression" in tool.config &&
    "then" in tool.config &&
    "else" in tool.config;
}

export type Function = {
  id: number;
  integration_type: string;
  name: string;
  description: string;
  tool_chain: ToolInChain[];
  required_data: Record<string, {
    type: string;
    required: boolean;
    description: string;
  }>;
  enabled: boolean;
};

export type AgentFunction = {
  id: number;
  function_id: number | null;
  enabled: boolean;
  custom_tool_chain?: ToolInChain[];
  effective_tool_chain?: ToolInChain[];
  workflow_name?: string;
  workflow_description?: string;
  trigger_phrases?: string[];
  is_custom_workflow?: boolean;
  has_customization?: boolean;
  function?: Function;
};

export type FunctionsByIntegration = {
  integration_type: string;
  functions: AgentFunction[];
};

// Field Schema Types
export interface FieldSchemaField {
  key: string;
  label: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  required: boolean;
  description?: string;
  options_endpoint?: string;
  options_path?: string;
}

export interface FieldSchemaResponse {
  tool_type: string;
  method: string;
  fields: FieldSchemaField[];
}

// Conversation Context Types
export interface ConversationContextField {
  path: string;
  label: string;
  type: string;
  example?: string;
  description?: string;
}

export interface ConversationContextResponse {
  available_fields: ConversationContextField[];
}
