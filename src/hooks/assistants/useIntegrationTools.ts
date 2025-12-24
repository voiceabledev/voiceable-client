import { useState, useCallback, useEffect } from "react";
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

// Create a webhook tool for an integration action
const createIntegrationWebhookTool = (
  displayName: string,
  integrationType: string,
  agentId: string
): WebhookTool => {
  const actionName = displayNameToActionName(displayName, integrationType);
  
  // Use the backend webhook endpoint for this integration
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api/v1";
  const webhookUrl = `${baseUrl.replace(/\/api\/v1\/?$/, "")}/api/v1/integrations/${integrationType}/webhook`;
  
  // Create header with agent ID
  const agentIdHeader: WebhookHeader = {
    ...getEmptyWebhookHeader(),
    type: "value",
    name: "X-Agent-ID",
    value: agentId,
  };
  
  // Create action query parameter
  const actionParam: WebhookQueryParam = {
    ...getEmptyWebhookQueryParam(),
    identifier: "action",
    description: `The action to perform. Must be: ${actionName}`,
    required: true,
    valueType: "llm_prompt",
  };
  
  return {
    ...getEmptyWebhookTool(),
    id: crypto.randomUUID(),
    name: displayName,
    description: getIntegrationToolDescription(displayName, integrationType),
    method: "POST",
    url: webhookUrl,
    headers: [agentIdHeader],
    queryParams: [actionParam],
  };
};

export function useIntegrationTools(
  webhookTools: WebhookTool[],
  setWebhookTools: React.Dispatch<React.SetStateAction<WebhookTool[]>>
) {
  const [agentIntegrationTools, setAgentIntegrationTools] = useState<AgentIntegrationTool[]>([]);
  const [userIntegrations, setUserIntegrations] = useState<UserIntegration[]>([]);
  const [integrationToolsExpanded, setIntegrationToolsExpanded] = useState<Record<string, boolean>>({});
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
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
    setIntegrationModalStep("select");
    setShowIntegrationModal(true);
  }, []);

  const selectIntegrationToAdd = useCallback(async (type: string) => {
    setConnectingIntegrationType(type);
    setIntegrationModalStep("connect");
    setIntegrationModalTab("credentials");
    setConnectingIntegrationLoading(true);
    
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
      } else {
        setEditingIntegrationConfig(null);
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
  }, [userIntegrations, toast]);

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
    // Determine integration type immediately
    const integrationType = typeof integration === 'string' ? integration : integration.integration_type;
    
    // Try to find integration data in the list first (synchronous)
    let integrationData: UserIntegration | null = null;
    if (typeof integration === 'string') {
      integrationData = userIntegrations.find(i => i.integration_type === integration) || null;
    } else {
      integrationData = integration;
    }

    // Find currently enabled tools for this integration type
    const enabledToolsForIntegration = agentIntegrationTools
      .filter(tool => tool.integration_type === integrationType && tool.enabled)
      .map(tool => {
        // Convert action name (snake_case) back to display name
        const displayName = actionNameToDisplayName(tool.tool_name, integrationType);
        return displayName;
      })
      .filter(displayName => {
        // Only include display names that exist in INTEGRATION_TOOLS_DISPLAY
        const availableTools = INTEGRATION_TOOLS_DISPLAY[integrationType as keyof typeof INTEGRATION_TOOLS_DISPLAY] || [];
        return availableTools.includes(displayName);
      });

    // Open the modal immediately with available data
    setConnectingIntegrationType(integrationType);
    setIntegrationModalStep("connect");
    setIntegrationModalTab("credentials");
    setEditingIntegrationConfig(integrationData);
    setSelectedIntegrationToolsForModal(enabledToolsForIntegration);
    setShowIntegrationModal(true);
    
    // If integration not found in the list, try to fetch it from the API (async, after modal opens)
    if (!integrationData && typeof integration === 'string') {
      try {
        const response = await integrationsApi.get(integrationType);
        if (response.data) {
          const fetchedIntegration = response.data;
          // Update the editing config with fetched data
          setEditingIntegrationConfig(fetchedIntegration);
          // Update the userIntegrations list with the fetched integration
          setUserIntegrations(prev => {
            const existing = prev.find(i => i.id === fetchedIntegration.id);
            if (!existing) {
              return [...prev, fetchedIntegration] as UserIntegration[];
            }
            return prev;
          });
        }
      } catch (error) {
        // Integration not found or not configured - modal is already open in connect mode
        console.log(`Integration ${integrationType} not found, modal opened in connect mode`);
      }
    }
  }, [userIntegrations, agentIntegrationTools]);

  const closeIntegrationConnectionModal = useCallback(() => {
    setShowIntegrationModal(false);
    setConnectingIntegrationType(null);
    setEditingIntegrationConfig(null);
    setSelectedIntegrationToolsForModal([]);
    setIntegrationModalStep("select");
    setIntegrationModalTab("about");
  }, []);

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

    // Close the modal immediately to prevent flickering
    closeIntegrationConnectionModal();

    try {
      const agentId = agent.id || "new";
      
      // Convert display names to action names (snake_case)
      const toolActionNames = selectedIntegrationToolsForModal.map(displayName => 
        displayNameToActionName(displayName, connectingIntegrationType)
      );

      // Find tools that are being removed (were in agentIntegrationTools but not in new selection)
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
      // Integration webhook tools use the display name as their name (e.g., "Get Deal", "Create Deal")
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
        // Only create if it doesn't already exist
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

      // Save the agent with updated integration tools and webhook tools
      if (onSave) {
        await onSave(updatedIntegrationTools, updatedWebhookTools);
      }

      // Publish to sync with ElevenLabs (creates webhook tools)
      if (onPublish && agent.id && agent.id !== "create") {
        await onPublish();
      }

      toast({
        title: "Success",
        description: `${toolActionNames.length} tool(s) enabled${newWebhookTools.length > 0 ? ` and ${newWebhookTools.length} webhook tool(s) created` : ""}.`,
      });
    } catch (error) {
      console.error("Failed to save integration tools:", error);
      toast({
        title: "Error",
        description: "Failed to save integration tools.",
        variant: "destructive",
      });
    }
  }, [
    connectingIntegrationType,
    selectedIntegrationToolsForModal,
    agentIntegrationTools,
    webhookTools,
    setAgentIntegrationTools,
    setWebhookTools,
    closeIntegrationConnectionModal,
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
