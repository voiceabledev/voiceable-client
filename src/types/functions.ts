export type ToolInChain = {
  type: string;
  role: string;
  method?: string;
  config?: Record<string, unknown>; // Tool-specific configuration (event_type_id, pipeline_id, stage_id, etc.)
};

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
  is_custom_workflow?: boolean;
  has_customization?: boolean;
  function?: Function;
};

export type FunctionsByIntegration = {
  integration_type: string;
  functions: AgentFunction[];
};
