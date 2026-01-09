export type ToolInChain = {
  type: string;
  role: string;
  method?: string;
  config?: Record<string, unknown>;
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
  function_id: number;
  enabled: boolean;
  function: Function;
};

export type FunctionsByIntegration = {
  integration_type: string;
  functions: AgentFunction[];
};
