// Types for Assistant Detail page

export const SYSTEM_TOOL_KEYS = [
  "end_call",
  "detect_language",
  "skip_turn",
  "transfer_to_agent",
  "transfer_to_number",
  "play_keypad_touch_tone",
  "voicemail_detection"
] as const;

export type SystemToolKey = typeof SYSTEM_TOOL_KEYS[number];

export type TransferRuleSetting = {
  agent: string;
  condition: string;
  delayMs: number;
  transferMessage: string;
  enableFirstMessage: boolean;
};

export type HumanTransferRuleSetting = {
  transferType: "conference";
  destinationType: "phone_number";
  phoneNumber: string;
  condition: string;
};

export type SystemToolSetting = {
  name: string;
  description: string;
  disableInterruptions: boolean;
  transferRules?: TransferRuleSetting[];
  humanTransferRules?: HumanTransferRuleSetting[];
};

// Webhook Tool Types
export type WebhookHeader = {
  id: string;
  type: "secret" | "value";
  name: string;
  value: string; // secret key name or literal value
};

export type WebhookQueryParam = {
  id: string;
  dataType: "string" | "number" | "boolean" | "array" | "object";
  identifier: string;
  required: boolean;
  valueType: "llm_prompt" | "static";
  description: string;
  enumValues: string[];
};

export type DynamicVariableAssignment = {
  id: string;
  variableName: string;
  isNewVariable: boolean;
  jsonPath: string;
};

export type WebhookTool = {
  id: string;
  name: string;
  description: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  responseTimeout: number;
  disableInterruptions: boolean;
  preToolSpeech: "auto" | "always" | "never";
  executionMode: "parallel" | "sequential";
  toolCallSound: "none" | "beep" | "chime";
  authentication: string;
  headers: WebhookHeader[];
  queryParams: WebhookQueryParam[];
  dynamicVariableAssignments: DynamicVariableAssignment[];
};

// Client Tool Types
export type ClientToolParameter = {
  id: string;
  dataType: "string" | "number" | "boolean" | "array" | "object";
  identifier: string;
  required: boolean;
  valueType: "llm_prompt" | "static";
  description: string;
  enumValues: string[];
};

export type ClientTool = {
  id: string;
  name: string;
  description: string;
  waitForResponse: boolean;
  disableInterruptions: boolean;
  preToolSpeech: "auto" | "always" | "never";
  executionMode: "immediate" | "on_turn_end";
  parameters: ClientToolParameter[];
  dynamicVariableAssignments: DynamicVariableAssignment[];
};

export type SectionEntry = {
  id: string;
  title: string;
  description: string;
  notes?: string;
};

export type SectionPayload = {
  title: string;
  description: string;
  notes?: string;
};

export type SectionType = "scenarios" | "phases" | "voiceTone";
