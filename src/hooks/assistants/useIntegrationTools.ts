import { useState, useCallback, useEffect, useRef } from "react";
import type { AgentIntegrationTool, WebhookTool, WebhookHeader, WebhookQueryParam, Agent } from "@/types/assistant";
import type { UserIntegration, IntegrationSchema } from "@/types/integrations";
import { integrationsApi, agentsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { displayNameToActionName, actionNameToDisplayName, INTEGRATION_TOOLS_DISPLAY } from "@/constants/assistant";

// Helper to create empty webhook header
const getEmptyWebhookHeader = (): WebhookHeader => ({
  id: crypto.randomUUID(),
  type: "value",
  name: "",
  value: "",
});

// Helper to create empty webhook query param
const getEmptyWebhookQueryParam = (): WebhookQueryParam => ({
  id: crypto.randomUUID(),
  dataType: "string",
  identifier: "",
  required: true,
  valueType: "llm_prompt",
  description: "",
  enumValues: [],
});

// Helper to create empty webhook tool
const getEmptyWebhookTool = (): WebhookTool => ({
  id: crypto.randomUUID(),
  name: "",
  description: "",
  method: "POST",
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
  dynamicVariableAssignments: [],
});

// Get description for integration tool
const getIntegrationToolDescription = (displayName: string, integrationType: string): string => {
  const descriptions: Record<string, Record<string, string>> = {
    pipedrive: {
      "Get Deal": "Retrieve a deal from Pipedrive by ID",
      "Create Deal": "Create a new deal in Pipedrive",
      "Update Deal": "Update an existing deal in Pipedrive",
      "Search Deals": "Search for deals in Pipedrive",
      "Get Person": "Retrieve a person/contact from Pipedrive by ID",
      "Create Person": "Create a new person/contact in Pipedrive",
      "Update Person": "Update an existing person/contact in Pipedrive",
      "Search Persons": "Search for persons/contacts in Pipedrive",
      "Get Organization": "Retrieve an organization from Pipedrive by ID",
      "Create Organization": "Create a new organization in Pipedrive",
      "Update Organization": "Update an existing organization in Pipedrive",
      "Search Organizations": "Search for organizations in Pipedrive",
      "Create Note": "Create a note in Pipedrive",
      "Create Activity": "Create an activity in Pipedrive",
    },
    calendly: {
      "Get Event Types": "Get available event types from Calendly",
      "Get Availability": "Get availability for a Calendly event type",
      "Create Booking": "Create a new booking in Calendly",
      "Get Scheduled Events": "Get scheduled events from Calendly",
      "Cancel Event": "Cancel a scheduled event in Calendly",
      "Reschedule Event": "Reschedule a scheduled event in Calendly",
    },
    calcom: {
      "Get Event Types": "Get all available event types from Cal.com. Returns event type IDs needed for booking.",
      "Get Available Slots": "Check available time slots for booking on Cal.com. Returns array of available times.",
      "Create Booking": "Create a new booking/appointment on Cal.com with attendee details.",
      "Get All Bookings": "Get all bookings from Cal.com within a time window.",
      "Get Booking": "Get details of a specific booking by its unique ID (UID).",
      "Reschedule Booking": "Reschedule an existing booking to a new time.",
      "Cancel Booking": "Cancel an existing booking on Cal.com.",
    },
    hubspot: {
      "Get Contact": "Retrieve a contact from HubSpot by ID",
      "Create Contact": "Create a new contact in HubSpot",
      "Update Contact": "Update an existing contact in HubSpot",
      "Search Contacts": "Search for contacts in HubSpot",
      "Get Company": "Retrieve a company from HubSpot by ID",
      "Create Company": "Create a new company in HubSpot",
      "Search Companies": "Search for companies in HubSpot",
      "Get Deal": "Retrieve a deal from HubSpot by ID",
      "Update Deal": "Update an existing deal in HubSpot",
      "Search Deals": "Search for deals in HubSpot",
      "Create Note": "Create a note in HubSpot",
      "Search Notes": "Search for notes in HubSpot",
      "Get Task": "Retrieve a task from HubSpot",
    },
  };
  
  return descriptions[integrationType]?.[displayName] || 
    `${displayName} action for ${integrationType}`;
};

// Get body parameters for an integration action
// Returns the action parameter and a nested data object with properties
const getIntegrationBodyParams = (
  displayName: string,
  integrationType: string,
  actionName: string
): WebhookQueryParam[] => {
  const bodyParams: WebhookQueryParam[] = [];
  
  // Action parameter - always present, with constant value
  // Use webhook_action to avoid conflicts with Rails params[:action]
  const actionParam: WebhookQueryParam = {
    ...getEmptyWebhookQueryParam(),
    identifier: "webhook_action",
    description: "", // Empty description for constant values
    required: true,
    valueType: "static", // Use "static" to indicate constant value
    dataType: "string",
    enumValues: [actionName], // Use enumValues to store the constant value
  };
  bodyParams.push(actionParam);
  
  // Create data object with nested properties based on integration type and action
  if (integrationType === "pipedrive") {
    const dataProperties: WebhookQueryParam[] = [];
    
    if (actionName === "create_contact" || actionName === "create_person") {
      dataProperties.push(
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "name",
          description: "Full name of the contact",
          required: true,
          valueType: "llm_prompt",
          dataType: "string",
        },
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "email",
          description: "Email address of the contact (optional)",
          required: false,
          valueType: "llm_prompt",
          dataType: "string",
        },
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "phone",
          description: "Phone number of the contact (optional)",
          required: false,
          valueType: "llm_prompt",
          dataType: "string",
        }
      );
    } else if (actionName === "search_contact" || actionName === "search_contacts" || actionName === "search_persons") {
      dataProperties.push(
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "term",
          description: "Search term to find contacts (e.g., email, name)",
          required: true,
          valueType: "llm_prompt",
          dataType: "string",
        }
      );
    } else if (actionName === "create_deal") {
      dataProperties.push(
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "title",
          description: "Title of the deal",
          required: true,
          valueType: "llm_prompt",
          dataType: "string",
        },
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "person_id",
          description: "ID of the person to associate with the deal",
          required: true,
          valueType: "llm_prompt",
          dataType: "number",
        },
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "value",
          description: "Value of the deal (optional)",
          required: false,
          valueType: "llm_prompt",
          dataType: "number",
        },
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "currency",
          description: "Currency code (e.g., USD, EUR) (optional)",
          required: false,
          valueType: "llm_prompt",
          dataType: "string",
        }
      );
    } else if (actionName === "search_deals") {
      dataProperties.push(
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "term",
          description: "Search term to find deals. Use email",
          required: true,
          valueType: "llm_prompt",
          dataType: "string",
        }
      );
    } else if (actionName === "get_contact" || actionName === "get_person") {
      dataProperties.push(
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "person_id",
          description: "ID of the person to retrieve",
          required: true,
          valueType: "llm_prompt",
          dataType: "number",
        }
      );
    } else if (actionName === "get_deal") {
      dataProperties.push(
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "deal_id",
          description: "ID of the deal to retrieve",
          required: true,
          valueType: "llm_prompt",
          dataType: "number",
        }
      );
    } else if (actionName === "get_all_deals") {
      dataProperties.push(
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "person_id",
          description: "ID of the person to get deals for",
          required: true,
          valueType: "llm_prompt",
          dataType: "number",
        }
      );
    }
    
    // Create the data object with all properties (only if there are properties to add)
    if (dataProperties.length > 0) {
      const dataObject: WebhookQueryParam = {
        ...getEmptyWebhookQueryParam(),
        identifier: "data",
        description: "Data that needs to be sent to the webhook.",
        required: true,
        valueType: "llm_prompt",
        dataType: "object",
        properties: dataProperties,
      };
      bodyParams.push(dataObject);
    }
  } else if (integrationType === "calcom") {
    const dataProperties: WebhookQueryParam[] = [];
    
    if (actionName === "get_available_slots") {
      dataProperties.push(
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "eventTypeId",
          description: "This is going to be the event type that the user chooses",
          required: true,
          valueType: "llm_prompt",
          dataType: "number",
        },
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "timeZone",
          description: "America/Vancouver",
          required: true,
          valueType: "llm_prompt",
          dataType: "string",
        },
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "startTime",
          description: "Start time should be today.\n\nExample:\n{\"eventTypeId\": 4166361, \"timeZone\": \"America/Vancouver\", \"startTime\": \"2025-12-30T00:00:00.000Z\",\"endTime\": \"2026-01-02T00:00:00.000Z\"}",
          required: true,
          valueType: "llm_prompt",
          dataType: "string",
        },
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "endTime",
          description: "It should be in 2 weeks.\n\nExample:\n{\"eventTypeId\": 4166361, \"timeZone\": \"America/Vancouver\", \"startTime\": \"2025-12-30T00:00:00.000Z\",\"endTime\": \"2026-01-02T00:00:00.000Z\"}",
          required: true,
          valueType: "llm_prompt",
          dataType: "string",
        }
      );
    } else if (actionName === "create_booking") {
      // Create attendee object with nested properties
      const attendeeProperties: WebhookQueryParam[] = [
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "name",
          description: "Ask the person their name.",
          required: true,
          valueType: "llm_prompt",
          dataType: "string",
        },
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "email",
          description: "Ask the person their email. Ask them to say letter by letter.",
          required: true,
          valueType: "llm_prompt",
          dataType: "string",
        },
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "timeZone",
          description: "America/Vancouver",
          required: true,
          valueType: "llm_prompt",
          dataType: "string",
        }
      ];
      
      dataProperties.push(
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "eventTypeId",
          description: "We need to get the event type id in the Get Event Types tool trigger.",
          required: true,
          valueType: "llm_prompt",
          dataType: "string",
        },
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "start",
          description: "Today's date with this format \"2025-12-30T09:30:00.000-08:00\"",
          required: true,
          valueType: "llm_prompt",
          dataType: "string",
        },
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "attendee",
          description: "Name of person who is attending the meeting and sending an invite",
          required: true,
          valueType: "llm_prompt",
          dataType: "object",
          properties: attendeeProperties,
        }
      );
    } else if (actionName === "reschedule_booking") {
      dataProperties.push(
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "id",
          description: "The ID of the booking to reschedule. This is the booking ID from Cal.com.",
          required: true,
          valueType: "llm_prompt",
          dataType: "string",
        },
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "start",
          description: "The new start time for the rescheduled booking. Format: \"2025-12-30T18:00:00.000Z\"",
          required: true,
          valueType: "llm_prompt",
          dataType: "string",
        },
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "reschedulingReason",
          description: "The reason for rescheduling the booking. Example: \"User requested a new time\"",
          required: true,
          valueType: "llm_prompt",
          dataType: "string",
        }
      );
    } else if (actionName === "cancel_booking") {
      dataProperties.push(
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "id",
          description: "The ID of the booking to cancel. This is the booking ID from Cal.com.",
          required: true,
          valueType: "llm_prompt",
          dataType: "string",
        }
      );
    } else if (actionName === "get_booking") {
      dataProperties.push(
        {
          ...getEmptyWebhookQueryParam(),
          identifier: "id",
          description: "The ID of the booking to retrieve. This is the booking ID from Cal.com.",
          required: true,
          valueType: "llm_prompt",
          dataType: "string",
        }
      );
    }
    // Note: Actions like "list_bookings" (Get All Bookings) and "get_event_types" (Get Event Types)
    // don't require a data object - they only send the action parameter
    // If dataProperties is empty, no data object will be created
    
    // Create the data object with all properties (only if there are properties to add)
    if (dataProperties.length > 0) {
      const dataObject: WebhookQueryParam = {
        ...getEmptyWebhookQueryParam(),
        identifier: "data",
        description: actionName === "get_available_slots" 
          ? "Example:\n\n{\"eventTypeId\": 4166361, \"timeZone\": \"America/Vancouver\", \"startTime\": \"2025-12-30T00:00:00.000Z\",\"endTime\": \"2026-01-02T00:00:00.000Z\"}"
          : actionName === "reschedule_booking"
          ? "Example:\n\n{\"id\": \"i28Snwo9QBQJYmEGfQBXvr\", \"start\": \"2025-12-30T18:00:00.000Z\", \"reschedulingReason\": \"User requested a new time\"}"
          : actionName === "cancel_booking"
          ? "Example:\n\n{\"id\": \"i28Snwo9QBQJYmEGfQBXvr\"}"
          : actionName === "get_booking"
          ? "Example:\n\n{\"id\": \"i28Snwo9QBQJYmEGfQBXvr\"}"
          : "Data that needs to be sent to the webhook.",
        required: true,
        valueType: "llm_prompt",
        dataType: "object",
        properties: dataProperties,
      };
      bodyParams.push(dataObject);
    }
  }
  
  return bodyParams;
};

// Create a webhook tool for an integration action
const createIntegrationWebhookTool = (
  displayName: string,
  integrationType: string,
  agentId: string
): WebhookTool => {
  const actionName = displayNameToActionName(displayName, integrationType);
  
  // Use the backend webhook endpoint for this integration
  // Route: POST /api/v1/webhooks/:integration_type
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api/v1";
  const webhookUrl = `${baseUrl.replace(/\/api\/v1\/?$/, "")}/api/v1/webhooks/${integrationType}`;
  
  // Create header with agent ID
  const agentIdHeader: WebhookHeader = {
    ...getEmptyWebhookHeader(),
    type: "value",
    name: "X-Agent-ID",
    value: agentId,
  };
  
  // Get body parameters (action + data parameters if any)
  const bodyParams = getIntegrationBodyParams(displayName, integrationType, actionName);
  
  return {
    ...getEmptyWebhookTool(),
    id: crypto.randomUUID(),
    name: displayName, // Keep display name format - backend will convert to underscore format
    description: getIntegrationToolDescription(displayName, integrationType),
    method: "POST",
    url: webhookUrl,
    headers: [agentIdHeader],
    queryParams: [], // No query params - action goes in body
    bodyParams: bodyParams, // Action + data parameters in request body
    executionMode: "parallel", // Will be converted to "immediate" by backend
    disableInterruptions: false,
    preToolSpeech: "auto",
    responseTimeout: 20,
  };
};

export function useIntegrationTools(
  webhookTools: WebhookTool[],
  setWebhookTools: React.Dispatch<React.SetStateAction<WebhookTool[]>>
) {
  const [agentIntegrationTools, setAgentIntegrationTools] = useState<AgentIntegrationTool[]>([]);
  const [userIntegrations, setUserIntegrations] = useState<UserIntegration[]>([]);
  const [integrationToolsExpanded, setIntegrationToolsExpanded] = useState<Record<string, boolean>>({});
  const [showIntegrationModal, setShowIntegrationModalRaw] = useState(false);
  const showIntegrationModalRef = useRef(showIntegrationModal);
  
  // Update ref when state changes
  useEffect(() => {
    showIntegrationModalRef.current = showIntegrationModal;
  }, [showIntegrationModal]);
  
  const setShowIntegrationModal = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setShowIntegrationModalRaw(value);
  }, []);
  const [integrationModalStep, setIntegrationModalStep] = useState<"select" | "connect" | "tools">("select");
  const [integrationModalTab, setIntegrationModalTab] = useState<"about" | "credentials" | "tools">("about");
  const [connectingIntegrationType, setConnectingIntegrationType] = useState<string | null>(null);
  const [integrationSchemas, setIntegrationSchemas] = useState<IntegrationSchema | null>(null);
  const [connectingIntegrationLoading, setConnectingIntegrationLoading] = useState(false);
  const [editingIntegrationConfig, setEditingIntegrationConfig] = useState<UserIntegration | null>(null);
  const [selectedIntegrationToolsForModal, setSelectedIntegrationToolsForModal] = useState<string[]>([]);
  
  const { toast } = useToast();

  // Fetch user integrations on mount
  useEffect(() => {
    const fetchUserIntegrations = async () => {
      try {
        const response = await integrationsApi.list();
        if (response.data) {
          setUserIntegrations(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch user integrations:", error);
      }
    };

    fetchUserIntegrations();
  }, []);

  const toggleIntegrationToolsExpanded = useCallback((id: string) => {
    setIntegrationToolsExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleIntegrationToolToggleWithWebhook = useCallback(async (
    integrationType: string,
    toolName: string,
    enabled: boolean,
    agent: Agent | null
  ) => {
    if (!agent) return;

    try {
      if (enabled) {
        // Implementation for enabling tool...
      } else {
        // Implementation for disabling tool...
      }
      
      setAgentIntegrationTools(prev => {
        const existing = prev.find(t => t.integration_type === integrationType && t.tool_name === toolName);
        if (existing) {
          return prev.map(t => 
            t.integration_type === integrationType && t.tool_name === toolName 
              ? { ...t, enabled } 
              : t
          );
        }
        return [...prev, { integration_type: integrationType, tool_name: toolName, enabled }];
      });

    } catch (error) {
      console.error("Failed to toggle integration tool:", error);
    }
  }, []);

  const handleDeleteIntegrationTool = useCallback((id: string) => {
    // Logic to delete an integration tool assignment
    // (Actual implementation depends on how they are stored)
  }, []);

  const openAddIntegrationModal = useCallback(() => {
    if (showIntegrationModalRef.current) {
      return; // Already open
    }
    setIntegrationModalStep("select");
    setShowIntegrationModal(true);
  }, [setShowIntegrationModal]);

  const selectIntegrationToAdd = useCallback(async (type: string) => {
    setConnectingIntegrationType(type);
    setIntegrationModalStep("connect");
    setIntegrationModalTab("credentials");
    setConnectingIntegrationLoading(true);
    setShowIntegrationModal(true); // Open the modal
    
    try {
      // Fetch schema for the integration type
      const schemasResponse = await integrationsApi.getSchemas();
      const integrationSchema = schemasResponse.data?.find((s: IntegrationSchema) => s.type === type);
      
      if (integrationSchema) {
        setIntegrationSchemas(integrationSchema);
      } else {
        console.warn(`Schema not found for integration type: ${type}`);
        setIntegrationSchemas(null);
      }
      
      // Check if integration already exists
      const existingIntegration = userIntegrations.find(i => i.integration_type === type);
      if (existingIntegration) {
        setEditingIntegrationConfig(existingIntegration);
        // For existing integrations, don't pre-select all tools - let the useEffect handle it
      } else {
        setEditingIntegrationConfig(null);
        // For new integrations, pre-select all available tools
        const availableTools = INTEGRATION_TOOLS_DISPLAY[type as keyof typeof INTEGRATION_TOOLS_DISPLAY] || [];
        setSelectedIntegrationToolsForModal(availableTools);
      }
    } catch (error) {
      console.error("Failed to fetch integration schema:", error);
      setIntegrationSchemas(null);
      toast({
        title: "Error",
        description: "Failed to load integration configuration.",
        variant: "destructive",
      });
    } finally {
      setConnectingIntegrationLoading(false);
    }
  }, [userIntegrations, toast, setShowIntegrationModal]);

  const goBackToIntegrationSelect = useCallback(() => {
    setIntegrationModalStep("select");
    setConnectingIntegrationType(null);
  }, []);

  const handleIntegrationConnect = useCallback(async (config: Record<string, string | number | undefined>) => {
    setConnectingIntegrationLoading(true);
    try {
      if (!connectingIntegrationType) {
        throw new Error("No integration type selected");
      }

      // Check if integration already exists
      const existingIntegration = userIntegrations.find(i => i.integration_type === connectingIntegrationType);
      
      if (existingIntegration) {
        // Update existing integration
        await integrationsApi.update(connectingIntegrationType, config);
        // Refresh user integrations
        const response = await integrationsApi.list();
        if (response.data) {
          setUserIntegrations(response.data);
        }
        toast({
          title: "Success",
          description: "Integration updated successfully.",
        });
      } else {
        // Create new integration
        await integrationsApi.create(connectingIntegrationType, config);
        // Refresh user integrations
        const response = await integrationsApi.list();
        if (response.data) {
          setUserIntegrations(response.data);
        }
        toast({
          title: "Success",
          description: "Integration connected successfully.",
        });
      }
      // Don't change step - let the button handler change the tab instead
    } catch (error) {
      console.error("Failed to connect integration:", error);
      toast({
        title: "Error",
        description: "Failed to connect integration.",
        variant: "destructive",
      });
      throw error; // Re-throw so button handler knows it failed
    } finally {
      setConnectingIntegrationLoading(false);
    }
  }, [connectingIntegrationType, userIntegrations, toast]);

  const openEditIntegrationModal = useCallback(async (integration: UserIntegration | string): Promise<void> => {
    const integrationType = typeof integration === 'string' ? integration : integration.integration_type;
    
    // Always fetch the latest integration data from the API to ensure we have the most up-to-date config
    let integrationData: UserIntegration | null = null;
    
    try {
      const response = await integrationsApi.get(integrationType);
      if (response.data) {
        integrationData = response.data;
        // Update userIntegrations with the latest data
        setUserIntegrations(prev => {
          const existingIndex = prev.findIndex(i => i.id === integrationData!.id);
          if (existingIndex >= 0) {
            // Update existing integration
            const updated = [...prev];
            updated[existingIndex] = integrationData!;
            return updated;
          } else {
            // Add new integration
            return [...prev, integrationData!] as UserIntegration[];
          }
        });
      }
    } catch (error) {
      // If API call fails, try to use existing data from userIntegrations
      if (typeof integration === 'string') {
        integrationData = userIntegrations.find(i => i.integration_type === integration) || null;
      } else {
        integrationData = integration;
      }
    }

    // Find currently enabled tools for this integration type
    const enabledToolsForIntegration = agentIntegrationTools
      .filter(tool => tool.integration_type === integrationType && tool.enabled)
      .map(tool => {
        const displayName = actionNameToDisplayName(tool.tool_name, integrationType);
        return displayName;
      })
      .filter(displayName => {
        const availableTools = INTEGRATION_TOOLS_DISPLAY[integrationType as keyof typeof INTEGRATION_TOOLS_DISPLAY] || [];
        return availableTools.includes(displayName);
      });

    // Open the modal with available data
    setConnectingIntegrationType(integrationType);
    setIntegrationModalStep("connect");
    setIntegrationModalTab("credentials");
    setEditingIntegrationConfig(integrationData);
    setSelectedIntegrationToolsForModal(enabledToolsForIntegration);
    setShowIntegrationModal(true);
  }, [userIntegrations, agentIntegrationTools, setShowIntegrationModal]);

  const closeIntegrationConnectionModal = useCallback(() => {
    setShowIntegrationModal(false);
    setConnectingIntegrationType(null);
    setEditingIntegrationConfig(null);
    setSelectedIntegrationToolsForModal([]);
    setIntegrationModalStep("select");
    setIntegrationModalTab("about");
  }, [setShowIntegrationModal]);

  const handleDeleteIntegration = useCallback(async (
    id: string | number,
    agent: Agent | null,
    onSave?: (updatedTools: AgentIntegrationTool[], updatedWebhookTools: WebhookTool[]) => Promise<void>,
    onPublish?: () => Promise<void>
  ) => {
    try {
      const idNum = typeof id === 'string' ? parseInt(id, 10) : id;
      
      // Find the integration being deleted to get its type
      const integrationToDelete = userIntegrations.find(i => i.id === idNum);
      const integrationType = integrationToDelete?.integration_type || connectingIntegrationType;
      
      if (!agent || !agent.id || agent.id === "create") {
        toast({
          title: "Error",
          description: "No agent selected.",
          variant: "destructive",
        });
        return;
      }
      
      // Delete AgentIntegration records from backend (keeps UserIntegration/credentials)
      await integrationsApi.deleteFromAgent(String(agent.id), integrationType || String(id));
      
      // Don't remove from userIntegrations - keep credentials
      // setUserIntegrations(prev => prev.filter(i => i.id !== idNum));
      
      // Remove all agent integration tools for this integration type
      const updatedIntegrationTools = agentIntegrationTools.filter(
        tool => tool.integration_type !== integrationType
      );
      setAgentIntegrationTools(updatedIntegrationTools);
      
      // Get the display names for tools of this integration type
      const toolDisplayNames = INTEGRATION_TOOLS_DISPLAY[integrationType as keyof typeof INTEGRATION_TOOLS_DISPLAY] || [];
      
      // Remove all webhook tools associated with this integration
      const updatedWebhookTools = webhookTools.filter(
        wt => !toolDisplayNames.includes(wt.name)
      );
      setWebhookTools(updatedWebhookTools);
      
      // Save the agent with updated tools
      if (onSave) {
        await onSave(updatedIntegrationTools, updatedWebhookTools);
      }
      
      // Publish to sync with ElevenLabs
      if (onPublish) {
        await onPublish();
      }
      
      toast({ title: "Success", description: "Integration removed from agent. Credentials kept." });
    } catch (error) {
      console.error("Failed to delete integration:", error);
      toast({ 
        title: "Error", 
        description: "Failed to remove integration.", 
        variant: "destructive" 
      });
    }
  }, [toast, userIntegrations, connectingIntegrationType, agentIntegrationTools, setAgentIntegrationTools, webhookTools, setWebhookTools]);

  const toggleModalToolSelection = useCallback((toolName: string) => {
    setSelectedIntegrationToolsForModal(prev => 
      prev.includes(toolName) ? prev.filter(t => t !== toolName) : [...prev, toolName]
    );
  }, []);

  const saveSelectedIntegrationTools = useCallback(async (
    agent: Agent | null,
    onSave?: (updatedTools: AgentIntegrationTool[], updatedWebhookTools: WebhookTool[]) => Promise<void>,
    onPublish?: () => Promise<void>
  ) => {
    if (!agent || !connectingIntegrationType) {
      toast({
        title: "Error",
        description: "No agent or integration type selected.",
        variant: "destructive",
      });
      return;
    }

    const agentId = agent.id || "new";
    
    // Convert display names to action names (snake_case)
    const toolActionNames = selectedIntegrationToolsForModal.map(displayName => 
      displayNameToActionName(displayName, connectingIntegrationType)
    );

    // Find tools that are being removed
    const currentToolsForIntegration = agentIntegrationTools.filter(
      tool => tool.integration_type === connectingIntegrationType
    );
    const currentToolNames = currentToolsForIntegration.map(t => t.tool_name);
    const removedToolNames = currentToolNames.filter(name => !toolActionNames.includes(name));

    // Get display names for removed tools (for webhook matching)
    const removedDisplayNames = INTEGRATION_TOOLS_DISPLAY[connectingIntegrationType]?.filter(displayName => {
      const actionName = displayNameToActionName(displayName, connectingIntegrationType);
      return removedToolNames.includes(actionName);
    }) || [];

    // Remove webhook tools that correspond to removed integration tools
    let updatedWebhookTools = [...webhookTools];
    if (removedDisplayNames.length > 0) {
      updatedWebhookTools = updatedWebhookTools.filter(
        wt => !removedDisplayNames.includes(wt.name)
      );
    }

    // Create webhook tools for newly selected tools
    const existingWebhookNames = new Set(updatedWebhookTools.map(wt => wt.name));
    const newWebhookTools: WebhookTool[] = [];
    
    selectedIntegrationToolsForModal.forEach(displayName => {
      if (!existingWebhookNames.has(displayName)) {
        const webhookTool = createIntegrationWebhookTool(displayName, connectingIntegrationType, agentId);
        newWebhookTools.push(webhookTool);
      }
    });

    // Add new webhook tools
    if (newWebhookTools.length > 0) {
      updatedWebhookTools = [...updatedWebhookTools, ...newWebhookTools];
    }

    // Update webhook tools state
    setWebhookTools(updatedWebhookTools);

    // Remove existing integration tool entries for this integration type
    const otherIntegrationTools = agentIntegrationTools.filter(
      tool => tool.integration_type !== connectingIntegrationType
    );

    // Add new tools for this integration type
    const newTools: AgentIntegrationTool[] = toolActionNames.map(toolName => ({
      integration_type: connectingIntegrationType,
      tool_name: toolName,
      enabled: true,
    }));

    // Update the agent integration tools state
    const updatedIntegrationTools = [...otherIntegrationTools, ...newTools];
    setAgentIntegrationTools(updatedIntegrationTools);

    // Save and publish
    if (onSave) {
      await onSave(updatedIntegrationTools, updatedWebhookTools);
    }

    if (onPublish && agent.id && agent.id !== "create") {
      await onPublish();
    }

    toast({
      title: "Success",
      description: `${toolActionNames.length} tool(s) enabled${newWebhookTools.length > 0 ? ` and ${newWebhookTools.length} webhook tool(s) created` : ""}.`,
    });
  }, [
    connectingIntegrationType,
    selectedIntegrationToolsForModal,
    agentIntegrationTools,
    webhookTools,
    setAgentIntegrationTools,
    setWebhookTools,
    toast,
  ]);

  return {
    agentIntegrationTools,
    setAgentIntegrationTools,
    userIntegrations,
    setUserIntegrations,
    integrationToolsExpanded,
    toggleIntegrationToolsExpanded,
    showIntegrationModal,
    setShowIntegrationModal,
    integrationModalStep,
    integrationModalTab,
    setIntegrationModalTab,
    connectingIntegrationType,
    integrationSchemas,
    connectingIntegrationLoading,
    editingIntegrationConfig,
    selectedIntegrationToolsForModal,
    setSelectedIntegrationToolsForModal,
    handleIntegrationToolToggleWithWebhook,
    handleDeleteIntegrationTool,
    openAddIntegrationModal,
    selectIntegrationToAdd,
    goBackToIntegrationSelect,
    handleIntegrationConnect,
    openEditIntegrationModal,
    closeIntegrationConnectionModal,
    handleDeleteIntegration,
    toggleModalToolSelection,
    saveSelectedIntegrationTools,
  };
}
