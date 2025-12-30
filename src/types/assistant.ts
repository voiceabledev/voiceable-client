// Types for Assistant Detail page
import type { WidgetConfig } from "@/lib/api";

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

export type SystemToolsState = Record<SystemToolKey, boolean>;

export type TransferRule = {
  id: string;
  agent: string;
  condition: string;
  delayMs: number;
  transferMessage: string;
  enableFirstMessage: boolean;
};

export type HumanTransferRule = {
  id: string;
  phoneNumber: string;
  condition: string;
  transferType?: string;
  destinationType?: string;
};

export type SystemToolSetting = {
  name?: string;
  description?: string;
  disableInterruptions?: boolean;
  transferRules?: TransferRule[];
  humanTransferRules?: HumanTransferRule[];
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
  valueType: "llm_prompt" | "static" | "dynamic_variable";
  description: string;
  enumValues: string[];
  // For object type: nested properties
  properties?: WebhookQueryParam[];
  // For array type: item configuration
  itemType?: "string" | "number" | "boolean" | "object";
  itemDescription?: string;
  itemEnumValues?: string[];
  itemProperties?: WebhookQueryParam[]; // For array of objects
  // For static value type: constant value
  constantValue?: unknown;
  // For dynamic_variable value type: variable name
  dynamicVariable?: string;
};

export type WebhookPathParam = {
  id: string;
  dataType: "string" | "number" | "boolean" | "array" | "object";
  identifier: string;
  required: boolean;
  valueType: "llm_prompt" | "static";
  description: string;
  enumValues: string[];
  // For object type: nested properties
  properties?: WebhookPathParam[];
  // For array type: item configuration
  itemType?: "string" | "number" | "boolean" | "object";
  itemDescription?: string;
  itemEnumValues?: string[];
  itemProperties?: WebhookPathParam[]; // For array of objects
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
  pathParams: WebhookPathParam[];
  bodyParams?: WebhookQueryParam[]; // Body parameters have same structure as query params
  dynamicVariableAssignments: DynamicVariableAssignment[];
  webhook_tool_type?: 'user' | 'system';
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

export type AgentFile = {
  id: string;
  name: string;
  size: number;
  type?: string;
  // Fields that may come from API
  file_name?: string;
  file_size?: number;
  elevenlabs_document_id?: string;
};

export type AgentIntegrationTool = {
  integration_type: string;
  tool_name: string;
  enabled: boolean;
};

export type UserIntegration = {
  id: string;
  integration_type: string;
  status: string;
};

export type Agent = {
  id: string;
  name: string;
  provider: string;
  model: string;
  language: string; // Deprecated: use languages instead, kept for backward compatibility
  languages?: string[]; // Array of languages
  default_language?: string; // Default language (first in languages array)
  first_message_mode: "text" | "audio";
  first_message: string;
  voice_id?: string; // Deprecated: use voice_ids instead, kept for backward compatibility
  voice_ids?: string[]; // Array of voice IDs
  primary_voice_id?: string; // Primary voice ID to use for ElevenLabs (must be in voice_ids array)
  hipaa_compliance: boolean;
  audio_recording: boolean;
  logging: boolean;
  transcript: boolean;
  video_recording: boolean;
  // Optional fields from API response
  elevenlabs_agent_id?: string;
  widget_config?: WidgetConfig;
  webhook_tools?: WebhookTool[];
  client_tools?: ClientTool[];
  agent_integrations?: AgentIntegrationTool[];
  agent_files?: AgentFile[];
  prompt_sections?: {
    scenarios?: SectionEntry[];
    phases?: SectionEntry[];
    voiceTone?: SectionEntry[];
  };
  system_tools?: {
    end_call?: boolean;
    detect_language?: boolean;
    skip_turn?: boolean;
    transfer_to_agent?: {
      enabled?: boolean;
      transferRules?: TransferRule[];
    };
    transfer_to_number?: {
      enabled?: boolean;
      humanTransferRules?: HumanTransferRule[];
    };
    play_keypad_touch_tone?: boolean;
    voicemail_detection?: boolean;
  };
};
