import type {
  WebhookTool,
  WebhookHeader,
  WebhookQueryParam,
  WebhookPathParam,
  DynamicVariableAssignment,
  ClientTool,
  ClientToolParameter,
  SystemToolKey,
  TransferRule,
  HumanTransferRule,
  SystemToolSetting,
  SectionEntry,
  SectionPayload,
} from "@/types/assistant";

export type WebhookBodyParam = WebhookQueryParam; // Body params have same structure as query params
import { SYSTEM_TOOL_KEYS } from "@/types/assistant";

// Factory functions for creating empty tool objects
export const getEmptyWebhookTool = (): WebhookTool => ({
  id: crypto.randomUUID(),
  name: "",
  description: "",
  method: "GET",
  url: "",
  responseTimeout: 20,
  disableInterruptions: false,
  preToolSpeech: "auto",
  executionMode: "parallel",
  toolCallSound: "none",
  authentication: "",
  headers: [],
  queryParams: [],
  pathParams: [],
  bodyParams: [],
  dynamicVariableAssignments: [],
});

export const getEmptyWebhookHeader = (): WebhookHeader => ({
  id: crypto.randomUUID(),
  type: "secret",
  name: "",
  value: "",
});

export const getEmptyWebhookQueryParam = (): WebhookQueryParam => ({
  id: crypto.randomUUID(),
  dataType: "string",
  identifier: "",
  required: true,
  valueType: "llm_prompt",
  description: "",
  enumValues: [],
});

export const getEmptyWebhookPathParam = (): WebhookPathParam => ({
  id: crypto.randomUUID(),
  dataType: "string",
  identifier: "",
  required: true,
  valueType: "llm_prompt",
  description: "",
  enumValues: [],
});

export const getEmptyWebhookBodyParam = (): WebhookQueryParam => ({
  id: crypto.randomUUID(),
  dataType: "string",
  identifier: "",
  required: true,
  valueType: "llm_prompt",
  description: "",
  enumValues: [],
});

export const getEmptyDynamicVariableAssignment = (): DynamicVariableAssignment => ({
  id: crypto.randomUUID(),
  variableName: "",
  isNewVariable: true,
  jsonPath: "",
});

export const getEmptyClientTool = (): ClientTool => ({
  id: crypto.randomUUID(),
  name: "",
  description: "",
  waitForResponse: false,
  disableInterruptions: false,
  preToolSpeech: "auto",
  executionMode: "immediate",
  parameters: [],
  dynamicVariableAssignments: [],
});

export const getEmptyClientToolParameter = (): ClientToolParameter => ({
  id: crypto.randomUUID(),
  dataType: "string",
  identifier: "",
  required: true,
  valueType: "llm_prompt",
  description: "",
  enumValues: [],
});

export const getEmptyTransferRule = (): TransferRule => ({
  id: crypto.randomUUID(),
  agent: "",
  condition: "",
  delayMs: 0,
  transferMessage: "",
  enableFirstMessage: false,
});

export const getEmptyHumanTransferRule = (): HumanTransferRule => ({
  id: crypto.randomUUID(),
  transferType: "conference",
  destinationType: "phone_number",
  phoneNumber: "",
  condition: "",
});

export const getDefaultSystemToolsState = (): Record<SystemToolKey, boolean> => ({
  end_call: false,
  detect_language: false,
  skip_turn: false,
  transfer_to_agent: false,
  transfer_to_number: false,
  play_keypad_touch_tone: false,
  voicemail_detection: false,
});

export const getDefaultSystemToolSettings = (): Record<SystemToolKey, SystemToolSetting> => ({
  end_call: { name: "end_call", description: "", disableInterruptions: false },
  detect_language: { name: "detect_language", description: "", disableInterruptions: false },
  skip_turn: { name: "skip_turn", description: "", disableInterruptions: false },
  transfer_to_agent: {
    name: "transfer_to_agent",
    description: "",
    disableInterruptions: false,
    transferRules: [getEmptyTransferRule()],
  },
  transfer_to_number: {
    name: "transfer_to_number",
    description: "",
    disableInterruptions: false,
    humanTransferRules: [getEmptyHumanTransferRule()],
  },
  play_keypad_touch_tone: { name: "play_keypad_touch_tone", description: "", disableInterruptions: false },
  voicemail_detection: { name: "voicemail_detection", description: "", disableInterruptions: false },
});

export const getDefaultSystemToolExpanded = (): Record<SystemToolKey, boolean> => ({
  end_call: false,
  detect_language: false,
  skip_turn: false,
  transfer_to_agent: false,
  transfer_to_number: false,
  play_keypad_touch_tone: false,
  voicemail_detection: false,
});

// Normalizer function
export const normalizeSystemToolKey = (key: string): SystemToolKey | null => {
  const normalized = key.replace(/-/g, "_");
  return (SYSTEM_TOOL_KEYS as readonly string[]).includes(normalized)
    ? (normalized as SystemToolKey)
    : null;
};

// Section entry utilities
export const generateSectionEntryId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

export const createSectionEntry = (overrides: Partial<SectionEntry> = {}): SectionEntry => ({
  id: overrides.id || generateSectionEntryId(),
  title: overrides.title || "",
  description: overrides.description || "",
  notes: overrides.notes || "",
});

export const parseSectionEntries = (value: unknown): SectionEntry[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    if (typeof item !== "object" || item === null) {
      return createSectionEntry();
    }

    const entry = item as Record<string, unknown>;
    return createSectionEntry({
      title: typeof entry.title === "string" ? entry.title : "",
      description: typeof entry.description === "string" ? entry.description : "",
      notes: typeof entry.notes === "string" ? entry.notes : "",
    });
  });
};

export const serializeSectionEntries = (entries: SectionEntry[]): SectionPayload[] =>
  entries
    .map((entry) => {
      const serialized: SectionPayload = {
        title: entry.title.trim(),
        description: entry.description.trim(),
      };
      if (entry.notes?.trim()) {
        serialized.notes = entry.notes.trim();
      }

      return serialized.title || serialized.description || serialized.notes ? serialized : null;
    })
    .filter((value): value is SectionPayload => value !== null);

// Parser functions for tools
export const parseClientToolFromOurFormat = (tool: Record<string, unknown>): ClientTool => ({
  id: typeof tool.id === "string" ? tool.id : crypto.randomUUID(),
  name: typeof tool.name === "string" ? tool.name : "",
  description: typeof tool.description === "string" ? tool.description : "",
  waitForResponse: tool.wait_for_response === true,
  disableInterruptions: tool.disable_interruptions === true,
  preToolSpeech: (tool.pre_tool_speech as "auto" | "always" | "never") || "auto",
  executionMode: (tool.execution_mode as "immediate" | "on_turn_end") || "immediate",
  parameters: Array.isArray(tool.parameters)
    ? (tool.parameters as Array<Record<string, unknown>>).map((p) => ({
        id: typeof p.id === "string" ? p.id : crypto.randomUUID(),
        dataType: (p.data_type as "string" | "number" | "boolean" | "array" | "object") || "string",
        identifier: typeof p.identifier === "string" ? p.identifier : "",
        required: p.required === true,
        valueType: (p.value_type as "llm_prompt" | "static") || "llm_prompt",
        description: typeof p.description === "string" ? p.description : "",
        enumValues: Array.isArray(p.enum_values) ? (p.enum_values as string[]) : [],
      }))
    : [],
  dynamicVariableAssignments: Array.isArray(tool.dynamic_variable_assignments)
    ? (tool.dynamic_variable_assignments as Array<Record<string, unknown>>).map((a) => ({
        id: crypto.randomUUID(),
        variableName: typeof a.variable_name === "string" ? a.variable_name : "",
        isNewVariable: a.is_new_variable !== false,
        jsonPath: typeof a.json_path === "string" ? a.json_path : "",
      }))
    : [],
});

export const parseClientToolFromElevenLabs = (tool: Record<string, unknown>): ClientTool => {
  const params = tool.parameters as Record<string, unknown> | undefined;
  const properties = params?.properties as Record<string, Record<string, unknown>> | undefined;
  const requiredParams = (params?.required as string[]) || [];
  const assignments = (tool.assignments as Array<Record<string, unknown>>) || [];

  return {
    id: crypto.randomUUID(),
    name: typeof tool.name === "string" ? tool.name : "",
    description: typeof tool.description === "string" ? tool.description : "",
    waitForResponse: tool.expects_response === true,
    disableInterruptions: tool.disable_interruptions === true,
    preToolSpeech: tool.force_pre_tool_speech === true ? "always" : "auto",
    executionMode: (tool.execution_mode as "immediate" | "on_turn_end") || "immediate",
    parameters: properties
      ? Object.entries(properties).map(([key, prop]) => ({
          id: crypto.randomUUID(),
          dataType: (prop.type as "string" | "number" | "boolean" | "array" | "object") || "string",
          identifier: key,
          required: requiredParams.includes(key),
          valueType: prop.is_system_provided ? "static" : "llm_prompt",
          description: typeof prop.description === "string" ? prop.description : "",
          enumValues: Array.isArray(prop.enum) ? (prop.enum as string[]) : [],
        }))
      : [],
    dynamicVariableAssignments: assignments.map((a) => ({
      id: crypto.randomUUID(),
      variableName: typeof a.dynamic_variable === "string" ? a.dynamic_variable : "",
      isNewVariable: true,
      jsonPath: typeof a.value_path === "string" ? a.value_path : "",
    })),
  };
};

export const parseWebhookToolFromOurFormat = (tool: Record<string, unknown>): WebhookTool => ({
  id: typeof tool.id === "string" ? tool.id : crypto.randomUUID(),
  name: typeof tool.name === "string" ? tool.name : "",
  description: typeof tool.description === "string" ? tool.description : "",
  method: (tool.method as "GET" | "POST" | "PUT" | "DELETE" | "PATCH") || "GET",
  url: typeof tool.url === "string" ? tool.url : "",
  responseTimeout: typeof tool.response_timeout === "number" ? tool.response_timeout : 20,
  disableInterruptions: tool.disable_interruptions === true,
  preToolSpeech: (tool.pre_tool_speech as "auto" | "always" | "never") || "auto",
  executionMode: (tool.execution_mode as "parallel" | "sequential") || "parallel",
  toolCallSound: (tool.tool_call_sound as "none" | "beep" | "chime") || "none",
  authentication: typeof tool.authentication === "string" ? tool.authentication : "",
  headers: Array.isArray(tool.headers)
    ? (tool.headers as Array<Record<string, unknown>>).map((h) => ({
        id: crypto.randomUUID(),
        type: (h.type as "secret" | "value") || "value",
        name: typeof h.name === "string" ? h.name : "",
        value: typeof h.value === "string" ? h.value : "",
      }))
    : [],
  queryParams: Array.isArray(tool.query_params)
    ? (tool.query_params as Array<Record<string, unknown>>).map((p) => ({
        id: crypto.randomUUID(),
        dataType: (p.data_type as "string" | "number" | "boolean" | "array" | "object") || "string",
        identifier: typeof p.identifier === "string" ? p.identifier : "",
        required: p.required === true,
        valueType: (p.value_type as "llm_prompt" | "static") || "llm_prompt",
        description: typeof p.description === "string" ? p.description : "",
        enumValues: Array.isArray(p.enum_values) ? (p.enum_values as string[]) : [],
      }))
    : [],
  pathParams: Array.isArray(tool.path_params)
    ? (tool.path_params as Array<Record<string, unknown>>).map((p) => ({
        id: crypto.randomUUID(),
        dataType: (p.data_type as "string" | "number" | "boolean" | "array" | "object") || "string",
        identifier: typeof p.identifier === "string" ? p.identifier : "",
        required: p.required === true,
        valueType: (p.value_type as "llm_prompt" | "static") || "llm_prompt",
        description: typeof p.description === "string" ? p.description : "",
        enumValues: Array.isArray(p.enum_values) ? (p.enum_values as string[]) : [],
      }))
    : [],
  bodyParams: Array.isArray(tool.body_params)
    ? (tool.body_params as Array<Record<string, unknown>>).map((p) => {
        const dataType = (p.data_type as "string" | "number" | "boolean" | "array" | "object") || "string";
        const baseParam = {
          id: crypto.randomUUID(),
          dataType,
          identifier: typeof p.identifier === "string" ? p.identifier : "",
          required: p.required === true,
          valueType: (p.value_type as "llm_prompt" | "static") || "llm_prompt",
          description: typeof p.description === "string" ? p.description : "",
          enumValues: Array.isArray(p.enum_values) ? (p.enum_values as string[]) : [],
        };
        
        // Handle nested properties for object types
        if (dataType === "object" && Array.isArray(p.properties)) {
          return {
            ...baseParam,
            properties: (p.properties as Array<Record<string, unknown>>).map((prop) => ({
              id: crypto.randomUUID(),
              dataType: (prop.data_type as "string" | "number" | "boolean" | "array" | "object") || "string",
              identifier: typeof prop.identifier === "string" ? prop.identifier : "",
              required: prop.required === true,
              valueType: (prop.value_type as "llm_prompt" | "static" | "dynamic_variable") || "llm_prompt",
              description: typeof prop.description === "string" ? prop.description : "",
              enumValues: Array.isArray(prop.enum_values) ? (prop.enum_values as string[]) : [],
              // Handle dynamic_variable type
              dynamicVariable: typeof prop.dynamic_variable === "string" ? prop.dynamic_variable : undefined,
              // Handle constant_value for static types
              constantValue: prop.constant_value !== undefined ? prop.constant_value : undefined,
            })),
          };
        }
        
        // Handle constant_value for static types
        if (baseParam.valueType === "static" && p.constant_value !== undefined) {
          return {
            ...baseParam,
            constantValue: p.constant_value,
          };
        }
        
        // Handle dynamic_variable type
        if (p.value_type === "dynamic_variable" && typeof p.dynamic_variable === "string") {
          return {
            ...baseParam,
            valueType: "dynamic_variable" as const,
            dynamicVariable: p.dynamic_variable,
          };
        }
        
        return baseParam;
      })
    : [],
  dynamicVariableAssignments: Array.isArray(tool.dynamic_variable_assignments)
    ? (tool.dynamic_variable_assignments as Array<Record<string, unknown>>).map((a) => ({
        id: crypto.randomUUID(),
        variableName: typeof a.variable_name === "string" ? a.variable_name : "",
        isNewVariable: a.is_new_variable !== false,
        jsonPath: typeof a.json_path === "string" ? a.json_path : "",
      }))
    : [],
});

export const parseWebhookToolFromElevenLabs = (tool: Record<string, unknown>): WebhookTool => {
  const apiSchema = tool.api_schema as Record<string, unknown> | undefined;
  const queryParamsSchema = apiSchema?.query_params_schema as Record<string, unknown> | undefined;
  const pathParamsSchema = apiSchema?.path_params_schema as Record<string, unknown> | undefined;
  const requestBodySchema = apiSchema?.request_body_schema as Record<string, unknown> | undefined;
  const properties = queryParamsSchema?.properties as Record<string, Record<string, unknown>> | undefined;
  const pathProperties = pathParamsSchema?.properties as Record<string, Record<string, unknown>> | undefined;
  const bodyProperties = requestBodySchema?.properties as Record<string, Record<string, unknown>> | undefined;
  const requiredParams = (queryParamsSchema?.required as string[]) || [];
  const requiredPathParams = (pathParamsSchema?.required as string[]) || [];
  const requiredBodyParams = (requestBodySchema?.required as string[]) || [];
  const requestHeaders = apiSchema?.request_headers as Record<string, unknown> | undefined;
  const assignments = (tool.assignments as Array<Record<string, unknown>>) || [];

  // Check if this is an integration webhook (URL contains /webhooks/)
  const url = typeof apiSchema?.url === "string" ? apiSchema.url : "";
  const isIntegrationWebhook = url.includes("/webhooks/");

  // Parse body params, converting "action" to "webhook_action" for integration webhooks
  const bodyParams: WebhookQueryParam[] = [];
  
  if (bodyProperties) {
    for (const [key, prop] of Object.entries(bodyProperties)) {
      // For integration webhooks, convert "action" to "webhook_action"
      const identifier = isIntegrationWebhook && key === "action" ? "webhook_action" : key;
      
      // Handle nested "data" object structure for integration webhooks
      if (isIntegrationWebhook && key === "data" && prop.type === "object") {
        const dataProps = prop.properties as Record<string, Record<string, unknown>> | undefined;
        const dataRequired = (prop.required as string[]) || [];
        
        // Create the data object parameter with nested properties
        bodyParams.push({
          id: crypto.randomUUID(),
          dataType: "object",
          identifier: "data",
          required: requiredBodyParams.includes("data"),
          valueType: "llm_prompt",
          description: typeof prop.description === "string" ? prop.description : "",
          enumValues: [],
          properties: dataProps
            ? Object.entries(dataProps).map(([dataKey, dataProp]) => ({
                id: crypto.randomUUID(),
                dataType: (dataProp.type as "string" | "number" | "boolean" | "array" | "object") || "string",
                identifier: dataKey,
                required: dataRequired.includes(dataKey),
                valueType: dataProp.is_system_provided ? "static" : "llm_prompt",
                description: typeof dataProp.description === "string" ? dataProp.description : "",
                enumValues: Array.isArray(dataProp.enum) ? (dataProp.enum as string[]) : [],
              }))
            : [],
        });
      } else {
        // Regular parameter
        bodyParams.push({
          id: crypto.randomUUID(),
          dataType: (prop.type as "string" | "number" | "boolean" | "array" | "object") || "string",
          identifier,
          required: requiredBodyParams.includes(key),
          valueType: prop.is_system_provided ? "static" : "llm_prompt",
          description: typeof prop.description === "string" ? prop.description : "",
          enumValues: Array.isArray(prop.enum) ? (prop.enum as string[]) : [],
        });
      }
    }
  }

  return {
    id: crypto.randomUUID(),
    name: typeof tool.name === "string" ? tool.name : "",
    description: typeof tool.description === "string" ? tool.description : "",
    method: (apiSchema?.method as "GET" | "POST" | "PUT" | "DELETE" | "PATCH") || "GET",
    url,
    responseTimeout: typeof tool.response_timeout_secs === "number" ? tool.response_timeout_secs : 20,
    disableInterruptions: tool.disable_interruptions === true,
    preToolSpeech: tool.force_pre_tool_speech === true ? "always" : "auto",
    executionMode: tool.execution_mode === "on_turn_end" ? "sequential" : "parallel",
    toolCallSound: "none",
    authentication: typeof apiSchema?.auth_connection === "string" ? apiSchema.auth_connection : "",
    headers: requestHeaders
      ? Object.entries(requestHeaders).map(([name, value]) => ({
          id: crypto.randomUUID(),
          type: typeof value === "object" && value !== null && "secret_id" in value ? "secret" : "value",
          name,
          value:
            typeof value === "object" && value !== null && "secret_id" in value
              ? (value as Record<string, string>).secret_id
              : String(value || ""),
        }))
      : [],
    queryParams: properties
      ? Object.entries(properties).map(([key, prop]) => ({
          id: crypto.randomUUID(),
          dataType: (prop.type as "string" | "number" | "boolean" | "array" | "object") || "string",
          identifier: key,
          required: requiredParams.includes(key),
          valueType: prop.is_system_provided ? "static" : "llm_prompt",
          description: typeof prop.description === "string" ? prop.description : "",
          enumValues: Array.isArray(prop.enum) ? (prop.enum as string[]) : [],
        }))
      : [],
    pathParams: pathProperties
      ? Object.entries(pathProperties).map(([key, prop]) => ({
          id: crypto.randomUUID(),
          dataType: (prop.type as "string" | "number" | "boolean" | "array" | "object") || "string",
          identifier: key,
          required: requiredPathParams.includes(key),
          valueType: prop.is_system_provided ? "static" : "llm_prompt",
          description: typeof prop.description === "string" ? prop.description : "",
          enumValues: Array.isArray(prop.enum) ? (prop.enum as string[]) : [],
        }))
      : [],
    bodyParams,
    dynamicVariableAssignments: assignments.map((a) => ({
      id: crypto.randomUUID(),
      variableName: typeof a.dynamic_variable === "string" ? a.dynamic_variable : "",
      isNewVariable: true,
      jsonPath: typeof a.value_path === "string" ? a.value_path : "",
    })),
  };
};

// Integration helper functions
export const getIntegrationIcon = (integrationType: string): string => {
  const icons: Record<string, string> = {
    pipedrive: "🔷",
    calendly: "📅",
    hubspot: "🟠",
    salesforce: "☁️",
    google_calendar: "📆",
    outlook_calendar: "📧",
    calcom: "📅"
  };
  return icons[integrationType] || "🔌";
};

export const displayNameToActionName = (displayName: string, integrationType: string): string => {
  const mapping: Record<string, Record<string, string>> = {
    pipedrive: {
      "Get Deal": "get_deal",
      "Create Deal": "create_deal",
      "Update Deal": "update_deal",
      "Search Deals": "search_deals",
      "Get Person": "get_contact",
      "Create Person": "create_contact",
      "Update Person": "update_contact",
      "Search Persons": "search_contacts",
      "Get Organization": "get_company",
      "Create Organization": "create_company",
      "Update Organization": "update_organization",
      "Search Organizations": "search_companies",
      "Create Note": "create_note",
      "Create Activity": "create_activity"
    },
    calendly: {
      "Get Event Types": "get_event_types",
      "Get Availability": "get_availability",
      "Create Booking": "create_booking",
      "Get Scheduled Events": "get_scheduled_events",
      "Cancel Event": "cancel_event",
      "Reschedule Event": "reschedule_event"
    }
  };
  return mapping[integrationType]?.[displayName] || displayName.toLowerCase().replace(/\s+/g, '_');
};

export const getAvailableToolsForIntegration = (integrationType: string): string[] => {
  const toolsMap: Record<string, string[]> = {
    pipedrive: [
      "get_contact",
      "create_contact",
      "update_contact",
      "search_contacts",
      "get_deal",
      "create_deal",
      "update_deal",
      "search_deals",
      "create_note",
      "create_activity"
    ],
    calendly: [
      "get_event_types",
      "get_availability",
      "create_booking",
      "get_scheduled_events",
      "cancel_event",
      "reschedule_event"
    ],
    hubspot: ["get_contact", "create_contact", "update_contact", "search_contacts"],
    salesforce: ["get_contact", "create_contact", "update_contact", "search_contacts"],
    google_calendar: ["get_events", "create_event", "update_event", "delete_event"],
    outlook_calendar: ["get_events", "create_event", "update_event", "delete_event"],
    calcom: ["get_event_types", "get_available_slots", "create_booking", "list_bookings", "get_booking", "reschedule_booking", "cancel_booking"]
  };
  return toolsMap[integrationType] || [];
};

export const formatToolName = (toolName: string): string => {
  return toolName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

