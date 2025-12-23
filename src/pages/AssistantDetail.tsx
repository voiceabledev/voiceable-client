import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  Copy, 
  ChevronDown,
  Globe,
  CheckCircle2,
  Check,
  Code,
  MessageSquare,
  Phone,
  Mic,
  AudioLines,
  Settings,
  X,
  Info,
  Volume2,
  VolumeX,
  Shield,
  Quote,
  Music,
  Video,
  Upload,
  Paperclip,
  Trash2,
  Send,
  User,
  FileText,
  Loader2,
  Layout,
  GitBranch,
  Plus,
  Search,
  Edit,
  MoreHorizontal,
  Play,
  Pause,
  Clock,
  FolderOpen,
  ExternalLink,
  Link2,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import WidgetTab from "@/components/assistants/WidgetTab";
import ConversationsTab from "@/components/assistants/ConversationsTab";
import PhoneNumbersTab from "@/components/assistants/PhoneNumbersTab";
import CreateAgentWizard from "@/components/assistants/CreateAgentWizard";
import CostAndLatency from "@/components/assistants/CostAndLatency";
import { VoiceSelectorDialog } from "@/components/assistants/VoiceSelectorDialog";
import { TabSectionHeader } from "@/components/assistants/TabSectionHeader";
import { TabSectionCard } from "@/components/assistants/TabSectionCard";
import { tabs, VALID_TABS, providers, modelsByProvider, WIDGET_API_KEY_NAME, PROMPT_TEMPLATE, DEFAULT_SYSTEM_PROMPT } from "@/constants/assistant";
import type { SystemToolKey, TransferRuleSetting, HumanTransferRuleSetting, SystemToolSetting, WebhookTool, WebhookHeader, WebhookQueryParam, DynamicVariableAssignment, ClientTool, ClientToolParameter, SectionEntry, SectionPayload, SectionType } from "@/types/assistant";
import { loadAndOpenWidget } from "@/utils/widgetLoader";
import { agentsApi, Agent, voicesApi, Voice, agentFilesApi, AgentFile, awsS3Api, conversationsApi, secretsApi, ElevenLabsSecret, apiKeysApi, integrationsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { IntegrationForm } from "@/components/integrations/IntegrationForm";
import type { IntegrationSchema, IntegrationConfig } from "@/types/integrations";

// Import SYSTEM_TOOL_KEYS from types
import { SYSTEM_TOOL_KEYS } from "@/types/assistant";

const getEmptyWebhookTool = (): WebhookTool => ({
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
  dynamicVariableAssignments: [],
});

const getEmptyWebhookHeader = (): WebhookHeader => ({
  id: crypto.randomUUID(),
  type: "secret",
  name: "",
  value: "",
});

const getEmptyWebhookQueryParam = (): WebhookQueryParam => ({
  id: crypto.randomUUID(),
  dataType: "string",
  identifier: "",
  required: true,
  valueType: "llm_prompt",
  description: "",
  enumValues: [],
});

const getEmptyDynamicVariableAssignment = (): DynamicVariableAssignment => ({
  id: crypto.randomUUID(),
  variableName: "",
  isNewVariable: true,
  jsonPath: "",
});

// Client Tool Types are now imported from types file

const getEmptyClientTool = (): ClientTool => ({
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

const getEmptyClientToolParameter = (): ClientToolParameter => ({
  id: crypto.randomUUID(),
  dataType: "string",
  identifier: "",
  required: true,
  valueType: "llm_prompt",
  description: "",
  enumValues: [],
});

const normalizeSystemToolKey = (key: string): SystemToolKey | null => {
  const normalized = key.replace(/-/g, "_");
  return (SYSTEM_TOOL_KEYS as readonly string[]).includes(normalized)
    ? (normalized as SystemToolKey)
    : null;
};

const getEmptyTransferRule = (): TransferRuleSetting => ({
  agent: "",
  condition: "",
  delayMs: 0,
  transferMessage: "",
  enableFirstMessage: false
});

const getEmptyHumanTransferRule = (): HumanTransferRuleSetting => ({
  transferType: "conference",
  destinationType: "phone_number",
  phoneNumber: "",
  condition: ""
});

const getDefaultSystemToolsState = (): Record<SystemToolKey, boolean> => ({
  end_call: false,
  detect_language: false,
  skip_turn: false,
  transfer_to_agent: false,
  transfer_to_number: false,
  play_keypad_touch_tone: false,
  voicemail_detection: false
});

const getDefaultSystemToolSettings = (): Record<SystemToolKey, SystemToolSetting> => ({
  end_call: { name: "end_call", description: "", disableInterruptions: false },
  detect_language: { name: "detect_language", description: "", disableInterruptions: false },
  skip_turn: { name: "skip_turn", description: "", disableInterruptions: false },
  transfer_to_agent: { name: "transfer_to_agent", description: "", disableInterruptions: false, transferRules: [getEmptyTransferRule()] },
  transfer_to_number: { name: "transfer_to_number", description: "", disableInterruptions: false, humanTransferRules: [getEmptyHumanTransferRule()] },
  play_keypad_touch_tone: { name: "play_keypad_touch_tone", description: "", disableInterruptions: false },
  voicemail_detection: { name: "voicemail_detection", description: "", disableInterruptions: false },
});

const getDefaultSystemToolExpanded = (): Record<SystemToolKey, boolean> => ({
  end_call: false,
  detect_language: false,
  skip_turn: false,
  transfer_to_agent: false, // Collapsed by default
  transfer_to_number: false, // Collapsed by default
  play_keypad_touch_tone: false,
  voicemail_detection: false
});

// Prompt templates and section types are now imported from constants/types files

const generateSectionEntryId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 10);
};

const createSectionEntry = (overrides: Partial<SectionEntry> = {}): SectionEntry => ({
  id: overrides.id || generateSectionEntryId(),
  title: overrides.title || "",
  description: overrides.description || "",
  notes: overrides.notes || "",
});

const parseSectionEntries = (value: unknown): SectionEntry[] => {
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

export default function AssistantDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize activeTab from URL search params, default to "configuration"
  const tabFromUrl = searchParams.get("tab");
  const initialTab = tabFromUrl && VALID_TABS.includes(tabFromUrl as typeof VALID_TABS[number]) ? tabFromUrl : "configuration";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const isMobile = useIsMobile();
  
  // Track the last tab we set to prevent loops
  const lastSetTabRef = useRef<string | null>(null);
  
  // Sync activeTab with URL when URL changes externally (e.g., browser back/forward)
  // Only sync if the URL tab is different from what we last set
  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab && VALID_TABS.includes(currentTab as typeof VALID_TABS[number])) {
      // If this is the tab we just set, ignore it (we already updated state)
      if (currentTab === lastSetTabRef.current) {
        lastSetTabRef.current = null; // Reset after processing
        return;
      }
      // If URL has a different tab than our state, sync (browser navigation)
      if (currentTab !== activeTab) {
        setActiveTab(currentTab);
      }
    }
  }, [searchParams, activeTab]);
  
  // Check if this is a new assistant - check both route param and pathname
  const isNew = location.pathname === "/assistants/create" || id === "create";
  
  // Get agent name and ID for display
  const agentName = agent?.name || "Enter a name for your assistant.";
  const agentId = agent?.id || (isNew ? "new" : "");
  
  // State for name editing
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const nameInitializedRef = useRef(false);
  const [saving, setSaving] = useState(false);
  
  // Initialize tempName when agent loads or when creating new
  useEffect(() => {
    if (!nameInitializedRef.current) {
      if (agent?.name) {
        setTempName(agent.name);
        nameInitializedRef.current = true;
      } else if (isNew) {
        // For new agents, start with empty string so validation works correctly
        setTempName("");
        nameInitializedRef.current = true;
      }
    } else if (agent?.name && !editingName) {
      // Only update tempName if it's empty or matches a default value
      // Don't reset if user just edited it (tempName will be different until save)
      const currentTemp = tempName || "";
      if (!currentTemp || currentTemp === "New Assistant" || currentTemp === "Loading...") {
        setTempName(agent.name);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent?.name, isNew, editingName]);
  
  const handleSystemToolToggle = (key: SystemToolKey, checked: boolean) => {
    setSystemTools(prev => ({ ...prev, [key]: checked }));
    // Open right panel for tools with configurable settings when toggled on
    if (checked && (key === "transfer_to_agent" || key === "transfer_to_number")) {
      setSelectedSystemTool(key);
    } else if (!checked && selectedSystemTool === key) {
      setSelectedSystemTool(null);
    }
  };

  const toggleSystemToolSection = (key: SystemToolKey) => {
    setSystemToolExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSystemToolSettingChange = (key: SystemToolKey, updates: Partial<SystemToolSetting>) => {
    setSystemToolSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...updates
      }
    }));
  };

  const updateTransferRule = (index: number, updates: Partial<TransferRuleSetting>) => {
    setSystemToolSettings(prev => {
      const current = prev.transfer_to_agent?.transferRules || [getEmptyTransferRule()];
      const nextRules = [...current];
      nextRules[index] = { ...nextRules[index], ...updates };
      return {
        ...prev,
        transfer_to_agent: {
          ...prev.transfer_to_agent,
          transferRules: nextRules
        }
      };
    });
  };

  const addTransferRule = () => {
    setSystemToolSettings(prev => {
      const current = prev.transfer_to_agent?.transferRules || [];
      return {
        ...prev,
        transfer_to_agent: {
          ...prev.transfer_to_agent,
          transferRules: [...current, getEmptyTransferRule()]
        }
      };
    });
  };

  const removeTransferRule = (index: number) => {
    setSystemToolSettings(prev => {
      const current = prev.transfer_to_agent?.transferRules || [];
      if (current.length === 0) return prev;
      const nextRules = current.filter((_, i) => i !== index);
      return {
        ...prev,
        transfer_to_agent: {
          ...prev.transfer_to_agent,
          transferRules: nextRules.length ? nextRules : [getEmptyTransferRule()]
        }
      };
    });
  };

  const updateHumanTransferRule = (index: number, updates: Partial<HumanTransferRuleSetting>) => {
    setSystemToolSettings(prev => {
      const current = prev.transfer_to_number?.humanTransferRules || [getEmptyHumanTransferRule()];
      const nextRules = [...current];
      nextRules[index] = { ...nextRules[index], ...updates };
      return {
        ...prev,
        transfer_to_number: {
          ...prev.transfer_to_number,
          humanTransferRules: nextRules
        }
      };
    });
  };

  const addHumanTransferRule = () => {
    setSystemToolSettings(prev => {
      const current = prev.transfer_to_number?.humanTransferRules || [];
      return {
        ...prev,
        transfer_to_number: {
          ...prev.transfer_to_number,
          humanTransferRules: [...current, getEmptyHumanTransferRule()]
        }
      };
    });
  };

  const removeHumanTransferRule = (index: number) => {
    setSystemToolSettings(prev => {
      const current = prev.transfer_to_number?.humanTransferRules || [];
      if (current.length === 0) return prev;
      const nextRules = current.filter((_, i) => i !== index);
      return {
        ...prev,
        transfer_to_number: {
          ...prev.transfer_to_number,
          humanTransferRules: nextRules.length ? nextRules : [getEmptyHumanTransferRule()]
        }
      };
    });
  };

  // Helper function to check if a webhook is an integration webhook (managed by us)
  const isIntegrationWebhook = (tool: WebhookTool): boolean => {
    // Integration webhooks have URLs matching the pattern: /api/v1/integrations/{integration_type}/webhook
    const integrationWebhookPattern = /\/api\/v1\/integrations\/[^/]+\/webhook/;
    return integrationWebhookPattern.test(tool.url);
  };

  // Get user-defined webhooks (excluding integration webhooks)
  const getUserDefinedWebhooks = (): WebhookTool[] => {
    return webhookTools.filter(tool => !isIntegrationWebhook(tool));
  };

  // Webhook tool management functions
  const openWebhookModal = (tool?: WebhookTool) => {
    if (tool) {
      setEditingWebhookTool(tool);
      setWebhookForm({ ...tool });
    } else {
      setEditingWebhookTool(null);
      setWebhookForm(getEmptyWebhookTool());
    }
    setShowJsonEditor(false);
    setShowWebhookModal(true);
  };

  const closeWebhookModal = () => {
    setShowWebhookModal(false);
    setEditingWebhookTool(null);
    setWebhookForm(getEmptyWebhookTool());
    setShowJsonEditor(false);
    setNewEnumValue({});
  };

  const saveWebhookTool = () => {
    if (!webhookForm.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the webhook tool.",
        variant: "destructive",
      });
      return;
    }
    if (!webhookForm.url.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a URL for the webhook tool.",
        variant: "destructive",
      });
      return;
    }

    // Prevent editing integration webhooks (managed by us)
    if (editingWebhookTool && isIntegrationWebhook(editingWebhookTool)) {
      toast({
        title: "Cannot edit",
        description: "Integration webhooks are managed automatically and cannot be edited manually.",
        variant: "destructive",
      });
      return;
    }

    // Prevent creating new webhooks with integration webhook URL pattern
    if (!editingWebhookTool && isIntegrationWebhook(webhookForm)) {
      toast({
        title: "Invalid URL",
        description: "This URL pattern is reserved for integration webhooks. Please use a different URL.",
        variant: "destructive",
      });
      return;
    }

    if (editingWebhookTool) {
      setWebhookTools(prev => prev.map(t => t.id === editingWebhookTool.id ? webhookForm : t));
    } else {
      setWebhookTools(prev => [...prev, webhookForm]);
    }
    closeWebhookModal();
    toast({
      title: editingWebhookTool ? "Tool updated" : "Tool added",
      description: `${webhookForm.name} has been ${editingWebhookTool ? "updated" : "added"} successfully.`,
    });
  };

  const deleteWebhookTool = (toolId: string) => {
    const toolToDelete = webhookTools.find(t => t.id === toolId);
    // Prevent deletion of integration webhooks (managed by us)
    if (toolToDelete && isIntegrationWebhook(toolToDelete)) {
      toast({
        title: "Cannot delete",
        description: "Integration webhooks are managed automatically and cannot be deleted manually.",
        variant: "destructive",
      });
      return;
    }
    setWebhookTools(prev => prev.filter(t => t.id !== toolId));
    toast({
      title: "Tool deleted",
      description: "The webhook tool has been removed.",
    });
  };

  const updateWebhookForm = <K extends keyof WebhookTool>(key: K, value: WebhookTool[K]) => {
    setWebhookForm(prev => ({ ...prev, [key]: value }));
  };

  // Header management
  const addWebhookHeader = () => {
    setWebhookForm(prev => ({
      ...prev,
      headers: [...prev.headers, getEmptyWebhookHeader()]
    }));
  };

  const updateWebhookHeader = (id: string, updates: Partial<WebhookHeader>) => {
    setWebhookForm(prev => ({
      ...prev,
      headers: prev.headers.map(h => h.id === id ? { ...h, ...updates } : h)
    }));
  };

  const removeWebhookHeader = (id: string) => {
    setWebhookForm(prev => ({
      ...prev,
      headers: prev.headers.filter(h => h.id !== id)
    }));
  };

  // Query param management
  const addWebhookQueryParam = () => {
    setWebhookForm(prev => ({
      ...prev,
      queryParams: [...prev.queryParams, getEmptyWebhookQueryParam()]
    }));
  };

  const updateWebhookQueryParam = (id: string, updates: Partial<WebhookQueryParam>) => {
    setWebhookForm(prev => ({
      ...prev,
      queryParams: prev.queryParams.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const removeWebhookQueryParam = (id: string) => {
    setWebhookForm(prev => ({
      ...prev,
      queryParams: prev.queryParams.filter(p => p.id !== id)
    }));
  };

  const addEnumValue = (paramId: string) => {
    const value = newEnumValue[paramId]?.trim();
    if (!value) return;
    
    setWebhookForm(prev => ({
      ...prev,
      queryParams: prev.queryParams.map(p => 
        p.id === paramId 
          ? { ...p, enumValues: [...p.enumValues, value] }
          : p
      )
    }));
    setNewEnumValue(prev => ({ ...prev, [paramId]: "" }));
  };

  const removeEnumValue = (paramId: string, valueIndex: number) => {
    setWebhookForm(prev => ({
      ...prev,
      queryParams: prev.queryParams.map(p => 
        p.id === paramId 
          ? { ...p, enumValues: p.enumValues.filter((_, i) => i !== valueIndex) }
          : p
      )
    }));
  };

  // Dynamic variable assignment management
  const addDynamicVariableAssignment = () => {
    setWebhookForm(prev => ({
      ...prev,
      dynamicVariableAssignments: [...prev.dynamicVariableAssignments, getEmptyDynamicVariableAssignment()]
    }));
  };

  const updateDynamicVariableAssignment = (id: string, updates: Partial<DynamicVariableAssignment>) => {
    setWebhookForm(prev => ({
      ...prev,
      dynamicVariableAssignments: prev.dynamicVariableAssignments.map(a => a.id === id ? { ...a, ...updates } : a)
    }));
  };

  const removeDynamicVariableAssignment = (id: string) => {
    setWebhookForm(prev => ({
      ...prev,
      dynamicVariableAssignments: prev.dynamicVariableAssignments.filter(a => a.id !== id)
    }));
  };

  // Integration tools helper functions
  const getIntegrationIcon = (integrationType: string): string => {
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

  // Integration tools mapping for display
  const INTEGRATION_TOOLS_DISPLAY: Record<string, string[]> = {
    pipedrive: [
      "Get Deal",
      "Create Deal",
      "Update Deal",
      "Search Deals",
      "Get Person",
      "Create Person",
      "Update Person",
      "Search Persons",
      "Get Organization",
      "Create Organization",
      "Update Organization",
      "Search Organizations",
      "Create Note",
      "Create Activity"
    ],
    calendly: [
      "Get Event Types",
      "Get Availability",
      "Create Booking",
      "Get Scheduled Events",
      "Cancel Event",
      "Reschedule Event"
    ],
    hubspot: [
      "Get Contact",
      "Create Contact",
      "Update Contact",
      "Search Contacts",
      "Get Company",
      "Create Company",
      "Search Companies",
      "Get Deal",
      "Update Deal",
      "Search Deals",
      "Create Note",
      "Search Notes",
      "Get Task"
    ],
    salesforce: [
      "Get Lead",
      "Create Lead",
      "Update Lead",
      "Search Leads",
      "Get Opportunity",
      "Create Opportunity",
      "Update Opportunity",
      "Search Opportunities",
      "Get Account",
      "Create Account",
      "Update Account",
      "Search Accounts",
      "Create Task",
      "Create Event"
    ]
  };

  // Map display names to action names (snake_case)
  const displayNameToActionName = (displayName: string, integrationType: string): string => {
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

  // Integration metadata for display
  const INTEGRATION_METADATA: Record<string, { name: string; icon: string; iconBg: string; url?: string }> = {
    pipedrive: {
      name: "Pipedrive",
      icon: "PD",
      iconBg: "bg-emerald-600",
      url: "https://www.pipedrive.com"
    },
    calendly: {
      name: "Calendly",
      icon: "C",
      iconBg: "bg-orange-500",
      url: "https://calendly.com"
    },
    hubspot: {
      name: "HubSpot CRM",
      icon: "HS",
      iconBg: "bg-blue-600",
      url: "https://app.hubspot.com"
    },
    salesforce: {
      name: "Salesforce",
      icon: "SF",
      iconBg: "bg-sky-500",
      url: "https://www.salesforce.com"
    }
  };

  const getAvailableToolsForIntegration = (integrationType: string): string[] => {
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
      calcom: ["get_event_types", "create_booking", "get_bookings"]
    };
    return toolsMap[integrationType] || [];
  };

  const formatToolName = (toolName: string): string => {
    return toolName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const toggleIntegrationToolsExpanded = (integrationType: string) => {
    setIntegrationToolsExpanded(prev => ({
      ...prev,
      [integrationType]: !prev[integrationType]
    }));
  };


  const handleIntegrationToolToggle = (integrationType: string, toolName: string, enabled: boolean) => {
    setAgentIntegrationTools(prev => {
      const current = prev[integrationType] || { enabled: false, enabledTools: [] };
      const currentTools = current.enabledTools || [];
      
      const nextTools = enabled
        ? [...currentTools, toolName]
        : currentTools.filter(t => t !== toolName);
      
      return {
        ...prev,
        [integrationType]: {
          ...current,
          enabledTools: nextTools
        }
      };
    });
  };

  const handleDeleteIntegrationTool = async (integrationType: string, skipConfirmation: boolean = false) => {
    if (!agent?.id) {
      toast({
        title: "Cannot delete",
        description: "Please save the agent first before removing integration tools.",
        variant: "destructive",
      });
      return;
    }

    // Show confirmation dialog unless skipped (e.g., when called from handleDeleteIntegration)
    if (!skipConfirmation) {
      if (!confirm(`Are you sure you want to remove ${formatToolName(integrationType)} from this agent? This will also remove any associated webhook tools.`)) {
        return;
      }
    }

    // Store the current values for potential revert
    const currentIntegrationTool = agentIntegrationTools[integrationType];
    
    // Find all associated webhook tools for this integration type
    // These are the individual action tools (e.g., "Get Deal", "Create Deal", etc.)
    const integrationToolNames = INTEGRATION_TOOLS_DISPLAY[integrationType] || [];
    const associatedWebhookTools = webhookTools.filter(tool => 
      integrationToolNames.includes(tool.name)
    );

    // For backend: include the integration with enabled: false so it gets deleted
    // The backend only processes integration types that are present in the hash
    // We need to include ALL existing integrations from the agent data, not just state
    // Load current agent data to ensure we have all integrations
    const currentAgentIntegrationTools = { ...agentIntegrationTools };
    
    // If agent has integration_tools in its data, merge them to ensure we have everything
    if (agent?.integration_tools && typeof agent.integration_tools === 'object') {
      const agentIntegrationToolsData = agent.integration_tools as Record<string, { enabled: boolean; enabled_tools: string[] }>;
      // Convert backend format to frontend format and merge
      for (const [key, value] of Object.entries(agentIntegrationToolsData)) {
        if (!currentAgentIntegrationTools[key]) {
          currentAgentIntegrationTools[key] = {
            enabled: value.enabled,
            enabledTools: value.enabled_tools || []
          };
        }
      }
    }
    
    // Build the payload with ALL integrations except the one we're deleting
    const updatedIntegrationToolsForBackend = { ...currentAgentIntegrationTools };
    // Remove the integration we're deleting
    delete updatedIntegrationToolsForBackend[integrationType];

    // Remove integration tool from state (for UI)
    setAgentIntegrationTools(prev => {
      const next = { ...prev };
      delete next[integrationType];
      return next;
    });

    // Remove all associated webhook tools from state if they exist
    let updatedWebhookTools = webhookTools;
    if (associatedWebhookTools.length > 0) {
      const associatedToolNames = new Set(associatedWebhookTools.map(tool => tool.name));
      updatedWebhookTools = webhookTools.filter(tool => !associatedToolNames.has(tool.name));
      setWebhookTools(updatedWebhookTools);
    }

    // Save to database
    try {
      // Build webhook tools payload with the associated webhook removed
      const webhookToolsPayload = updatedWebhookTools.map(tool => ({
        id: tool.id,
        type: "webhook",
        name: tool.name,
        description: tool.description,
        method: tool.method,
        url: tool.url,
        response_timeout: tool.responseTimeout,
        disable_interruptions: tool.disableInterruptions,
        pre_tool_speech: tool.preToolSpeech,
        execution_mode: tool.executionMode,
        tool_call_sound: tool.toolCallSound,
        authentication: tool.authentication || undefined,
        headers: tool.headers.map(h => ({
          type: h.type,
          name: h.name,
          value: h.value
        })),
        query_params: tool.queryParams.map(p => ({
          data_type: p.dataType,
          identifier: p.identifier,
          required: p.required,
          value_type: p.valueType,
          description: p.description,
          enum_values: p.enumValues.length > 0 ? p.enumValues : undefined
        })),
        dynamic_variable_assignments: tool.dynamicVariableAssignments.map(a => ({
          variable_name: a.variableName,
          is_new_variable: a.isNewVariable,
          json_path: a.jsonPath
        }))
      }));
      
      // Convert integration tools format for backend (enabled_tools instead of enabledTools)
      // All integrations are always enabled, so we just send the ones that exist
      const integrationToolsForBackend: Record<string, { enabled: boolean; enabled_tools: string[] }> = {};
      for (const [key, value] of Object.entries(updatedIntegrationToolsForBackend)) {
        integrationToolsForBackend[key] = {
          enabled: true, // Always enabled
          enabled_tools: value.enabledTools || []
        };
      }
      
      // Build the full config, but override integration_tools and webhook_tools with our updated values
      const config = buildConfiguration();
      
      await agentsApi.update(agent.id, {
        ...config,
        integration_tools: integrationToolsForBackend,
        webhook_tools: webhookToolsPayload
      } as Parameters<typeof agentsApi.update>[1]);
      
      // Reload agent data to reflect changes
      if (agent.id) {
        const updatedAgent = await agentsApi.get(agent.id);
        if (updatedAgent.data) {
          setAgent(updatedAgent.data);
          extractAgentData(updatedAgent.data);
        }
      }
      
      const webhookMessage = associatedWebhookTools.length > 0
        ? ` and ${associatedWebhookTools.length} associated webhook tool${associatedWebhookTools.length > 1 ? 's' : ''} ${associatedWebhookTools.length > 1 ? 'have' : 'has'} been removed`
        : ` has been removed`;
      
      toast({
        title: "Integration tool removed",
        description: `${formatToolName(integrationType)}${webhookMessage} from this agent.`,
      });
    } catch (error) {
      // Revert state if save failed
      if (currentIntegrationTool) {
        setAgentIntegrationTools(prev => ({
          ...prev,
          [integrationType]: currentIntegrationTool
        }));
      }
      // Revert webhook tools if save failed
      if (associatedWebhookTools && associatedWebhookTools.length > 0) {
        setWebhookTools(prev => [...prev, ...associatedWebhookTools]);
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove integration tool';
      toast({
        title: "Removal failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const openAddIntegrationModal = () => {
    setIntegrationModalStep('select');
    setConnectingIntegrationType(null);
    setEditingIntegrationConfig({});
    setShowIntegrationModal(true);
  };

  const selectIntegrationToAdd = async (integrationType: string) => {
    setConnectingIntegrationType(integrationType);
    
    // If integration is already configured for the user, enable it for this agent directly
    const isAlreadyConfigured = userIntegrations.some(i => i.type === integrationType);
    if (isAlreadyConfigured && agent?.id) {
      setConnectingIntegrationLoading(true);
      try {
        // Enable the integration for this agent
        const availableTools = getAvailableToolsForIntegration(integrationType);
        const integrationToolsForBackend: Record<string, { enabled: boolean; enabled_tools: string[] }> = {
          ...Object.fromEntries(
            Object.entries(agentIntegrationTools).map(([key, value]) => [
              key,
              { enabled: true, enabled_tools: value.enabledTools }
            ])
          ),
          [integrationType]: {
            enabled: true,
            enabled_tools: availableTools
          }
        };

        await agentsApi.update(agent.id, {
          integration_tools: integrationToolsForBackend
        });

        // Update local state
        setAgentIntegrationTools(prev => ({
          ...prev,
          [integrationType]: {
            enabled: true,
            enabledTools: availableTools
          }
        }));

        toast({
          title: 'Success',
          description: `${formatToolName(integrationType)} has been enabled for this agent.`,
        });

        closeIntegrationConnectionModal();
      } catch (err) {
        console.error('Failed to enable integration for agent:', err);
        toast({
          title: 'Error',
          description: `Failed to enable ${formatToolName(integrationType)} for this agent.`,
          variant: 'destructive',
        });
      } finally {
        setConnectingIntegrationLoading(false);
      }
    } else {
      // New integration - show credentials form
      setEditingIntegrationConfig({});
      setIntegrationModalStep('credentials');
    }
  };

  const openEditIntegrationModal = async (integrationType: string) => {
    setConnectingIntegrationType(integrationType);
    setIntegrationModalStep('credentials');
    setConnectingIntegrationLoading(true);
    setShowIntegrationModal(true);
    
    try {
      // Fetch existing config
      const response = await integrationsApi.get(integrationType);
      if (response.data?.config) {
        setEditingIntegrationConfig(response.data.config);
      }
    } catch (err) {
      console.warn('Failed to fetch integration config:', err);
      setEditingIntegrationConfig({});
    } finally {
      setConnectingIntegrationLoading(false);
    }
  };

  const closeIntegrationConnectionModal = () => {
    setShowIntegrationModal(false);
    setConnectingIntegrationType(null);
    setIntegrationModalStep('select');
    setIntegrationModalTab('credentials');
    setConnectingIntegrationLoading(false);
    setEditingIntegrationConfig({});
  };

  const goBackToIntegrationSelect = () => {
    setConnectingIntegrationType(null);
    setEditingIntegrationConfig({});
    setIntegrationModalStep('select');
    setIntegrationModalTab('credentials');
  };

  const handleDeleteIntegration = async () => {
    if (!connectingIntegrationType) return;
    
    if (!confirm(`Are you sure you want to delete the ${formatToolName(connectingIntegrationType)} integration? This will remove all credentials and cannot be undone.`)) {
      return;
    }

    setConnectingIntegrationLoading(true);
    try {
      await integrationsApi.delete(connectingIntegrationType);
      
      // Remove from user integrations list
      setUserIntegrations(prev => prev.filter(i => i.type !== connectingIntegrationType));
      
      // Also remove from agent integration tools if it exists
      // This will also handle deleting associated webhook tools
      if (agent?.id) {
        // Always call handleDeleteIntegrationTool if agent is saved, even if not in state
        // This ensures webhook tools are deleted
        // Skip confirmation since we already confirmed in handleDeleteIntegration
        if (agentIntegrationTools[connectingIntegrationType]) {
          await handleDeleteIntegrationTool(connectingIntegrationType, true);
        } else {
          // Integration not in state but might have webhook tools, delete them
          const integrationToolNames = INTEGRATION_TOOLS_DISPLAY[connectingIntegrationType] || [];
          const associatedWebhookTools = webhookTools.filter(tool => 
            integrationToolNames.includes(tool.name)
          );
          
          if (associatedWebhookTools.length > 0) {
            const associatedToolNames = new Set(associatedWebhookTools.map(tool => tool.name));
            const updatedWebhookTools = webhookTools.filter(tool => !associatedToolNames.has(tool.name));
            setWebhookTools(updatedWebhookTools);
            
            const webhookToolsPayload = updatedWebhookTools.map(tool => ({
              id: tool.id,
              type: "webhook",
              name: tool.name,
              description: tool.description,
              method: tool.method,
              url: tool.url,
              response_timeout: tool.responseTimeout,
              disable_interruptions: tool.disableInterruptions,
              pre_tool_speech: tool.preToolSpeech,
              execution_mode: tool.executionMode,
              tool_call_sound: tool.toolCallSound,
              authentication: tool.authentication || undefined,
              headers: tool.headers.map(h => ({
                type: h.type,
                name: h.name,
                value: h.value
              })),
              query_params: tool.queryParams.map(p => ({
                data_type: p.dataType,
                identifier: p.identifier,
                required: p.required,
                value_type: p.valueType,
                description: p.description,
                enum_values: p.enumValues.length > 0 ? p.enumValues : undefined
              })),
              dynamic_variable_assignments: tool.dynamicVariableAssignments.map(a => ({
                variable_name: a.variableName,
                is_new_variable: a.isNewVariable,
                json_path: a.jsonPath
              }))
            }));
            
            const config = buildConfiguration();
            await agentsApi.update(agent.id, {
              ...config,
              webhook_tools: webhookToolsPayload
            } as Parameters<typeof agentsApi.update>[1]);
          }
        }
      } else {
        // If agent isn't saved yet or integration not enabled on agent,
        // still need to remove webhook tools if they exist
        const integrationToolNames = INTEGRATION_TOOLS_DISPLAY[connectingIntegrationType] || [];
        const associatedWebhookTools = webhookTools.filter(tool => 
          integrationToolNames.includes(tool.name)
        );
        
        if (associatedWebhookTools.length > 0) {
          const associatedToolNames = new Set(associatedWebhookTools.map(tool => tool.name));
          const updatedWebhookTools = webhookTools.filter(tool => !associatedToolNames.has(tool.name));
          setWebhookTools(updatedWebhookTools);
          
          // If agent is saved, also update the backend
          if (agent?.id) {
            try {
              const webhookToolsPayload = updatedWebhookTools.map(tool => ({
                id: tool.id,
                type: "webhook",
                name: tool.name,
                description: tool.description,
                method: tool.method,
                url: tool.url,
                response_timeout: tool.responseTimeout,
                disable_interruptions: tool.disableInterruptions,
                pre_tool_speech: tool.preToolSpeech,
                execution_mode: tool.executionMode,
                tool_call_sound: tool.toolCallSound,
                authentication: tool.authentication || undefined,
                headers: tool.headers.map(h => ({
                  type: h.type,
                  name: h.name,
                  value: h.value
                })),
                query_params: tool.queryParams.map(p => ({
                  data_type: p.dataType,
                  identifier: p.identifier,
                  required: p.required,
                  value_type: p.valueType,
                  description: p.description,
                  enum_values: p.enumValues.length > 0 ? p.enumValues : undefined
                })),
                dynamic_variable_assignments: tool.dynamicVariableAssignments.map(a => ({
                  variable_name: a.variableName,
                  is_new_variable: a.isNewVariable,
                  json_path: a.jsonPath
                }))
              }));
              
              const config = buildConfiguration();
              await agentsApi.update(agent.id, {
                ...config,
                webhook_tools: webhookToolsPayload
              } as Parameters<typeof agentsApi.update>[1]);
            } catch (error) {
              // Revert state if save failed
              setWebhookTools(webhookTools);
              console.error('Failed to delete webhook tools:', error);
            }
          }
        }
        
        // Remove from agent integration tools state if it exists
        if (agentIntegrationTools[connectingIntegrationType]) {
          setAgentIntegrationTools(prev => {
            const next = { ...prev };
            delete next[connectingIntegrationType];
            return next;
          });
        }
      }
      
      toast({
        title: "Integration deleted",
        description: `${formatToolName(connectingIntegrationType)} integration has been removed.`,
      });
      
      closeIntegrationConnectionModal();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete integration';
      toast({
        title: "Deletion failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setConnectingIntegrationLoading(false);
    }
  };

  const handleIntegrationConnect = async (config: IntegrationConfig) => {
    if (!connectingIntegrationType) return;
    
    const isEditing = userIntegrations.some(i => i.type === connectingIntegrationType);
    
    setConnectingIntegrationLoading(true);
    try {
      if (isEditing) {
        await integrationsApi.update(connectingIntegrationType, config);
      } else {
        await integrationsApi.create(connectingIntegrationType, config);
      }
      
      // Update the user integrations to show this one as connected
      if (!isEditing) {
        setUserIntegrations(prev => [...prev, { type: connectingIntegrationType, connected: true }]);
        
        // Automatically create individual webhook tools for each action in Pipedrive and Calendly
        if (connectingIntegrationType === 'pipedrive' || connectingIntegrationType === 'calendly') {
          const toolDisplayNames = INTEGRATION_TOOLS_DISPLAY[connectingIntegrationType] || [];
          
          // Create a webhook tool for each action
          const newWebhookTools: WebhookTool[] = toolDisplayNames.map(displayName => {
            const actionName = displayNameToActionName(displayName, connectingIntegrationType);
            
            // Create webhook URL with action name
            const webhookUrl = `https://api.voiceable.dev/webhook/${actionName}`;
            
            // Create authorization header with secret type
            const authHeader: WebhookHeader = {
              ...getEmptyWebhookHeader(),
              type: 'secret',
              name: 'authorization',
              value: 'Bearer',
            };
            
            // Create id query parameter with LLM prompt value type
            const idParam: WebhookQueryParam = {
              ...getEmptyWebhookQueryParam(),
              identifier: 'id',
              description: 'The ID parameter',
              required: true,
              valueType: 'llm_prompt',
            };
            
            // Get description based on action
            const getDescription = (name: string): string => {
              const descriptions: Record<string, string> = {
                'Get Deal': 'Retrieve a deal from Pipedrive by ID',
                'Create Deal': 'Create a new deal in Pipedrive',
                'Update Deal': 'Update an existing deal in Pipedrive',
                'Search Deals': 'Search for deals in Pipedrive',
                'Get Person': 'Retrieve a person/contact from Pipedrive by ID',
                'Create Person': 'Create a new person/contact in Pipedrive',
                'Update Person': 'Update an existing person/contact in Pipedrive',
                'Search Persons': 'Search for persons/contacts in Pipedrive',
                'Get Organization': 'Retrieve an organization from Pipedrive by ID',
                'Create Organization': 'Create a new organization in Pipedrive',
                'Update Organization': 'Update an existing organization in Pipedrive',
                'Search Organizations': 'Search for organizations in Pipedrive',
                'Create Note': 'Create a note in Pipedrive',
                'Create Activity': 'Create an activity in Pipedrive',
                'Get Event Types': 'Get available event types from Calendly',
                'Get Availability': 'Get availability for a Calendly event type',
                'Create Booking': 'Create a new booking in Calendly',
                'Get Scheduled Events': 'Get scheduled events from Calendly',
                'Cancel Event': 'Cancel a scheduled event in Calendly',
                'Reschedule Event': 'Reschedule a scheduled event in Calendly',
              };
              return descriptions[name] || `${name} action for ${connectingIntegrationType}`;
            };
            
            return {
              ...getEmptyWebhookTool(),
              id: crypto.randomUUID(),
              name: displayName,
              description: getDescription(displayName),
              method: 'POST',
              url: webhookUrl,
              headers: [authHeader],
              queryParams: [idParam],
            };
          });
          
          // Filter out tools that already exist (by name)
          const existingToolNames = new Set(webhookTools.map(tool => tool.name));
          const toolsToAdd = newWebhookTools.filter(tool => !existingToolNames.has(tool.name));
          
          if (toolsToAdd.length > 0 && agent?.id) {
            // Add to state
            setWebhookTools(prev => [...prev, ...toolsToAdd]);
            
            // Save to database by updating the agent
            try {
              // Build webhook tools payload with the new tools included
              const updatedWebhookTools = [...webhookTools, ...toolsToAdd];
              const webhookToolsPayload = updatedWebhookTools.map(tool => {
                // For action parameter, we need to set the constant value
                const queryParams = tool.queryParams.map(p => {
                  if (p.identifier === 'action' && p.valueType === 'static' && p.enumValues.length > 0) {
                    // For static values in ElevenLabs format, we might need to handle this differently
                    // For now, we'll keep it as enum with a single value
                    return {
                      data_type: p.dataType,
                      identifier: p.identifier,
                      required: p.required,
                      value_type: p.valueType,
                      description: p.description,
                      enum_values: p.enumValues.length > 0 ? p.enumValues : undefined
                    };
                  }
                  return {
                    data_type: p.dataType,
                    identifier: p.identifier,
                    required: p.required,
                    value_type: p.valueType,
                    description: p.description,
                    enum_values: p.enumValues.length > 0 ? p.enumValues : undefined
                  };
                });
                
                return {
                  id: tool.id,
                  type: "webhook",
                  name: tool.name,
                  description: tool.description,
                  method: tool.method,
                  url: tool.url,
                  response_timeout: tool.responseTimeout,
                  disable_interruptions: tool.disableInterruptions,
                  pre_tool_speech: tool.preToolSpeech,
                  execution_mode: tool.executionMode,
                  tool_call_sound: tool.toolCallSound,
                  authentication: tool.authentication || undefined,
                  headers: tool.headers.map(h => ({
                    type: h.type,
                    name: h.name,
                    value: h.value
                  })),
                  query_params: queryParams,
                  dynamic_variable_assignments: tool.dynamicVariableAssignments.map(a => ({
                    variable_name: a.variableName,
                    is_new_variable: a.isNewVariable,
                    json_path: a.jsonPath
                  }))
                };
              });
              
              // Build config and override webhook_tools with the updated list
              const config = buildConfiguration();
              await agentsApi.update(agent.id, {
                ...config,
                webhook_tools: webhookToolsPayload
              } as Parameters<typeof agentsApi.update>[1]);
              
              toast({
                title: "Webhook tools created",
                description: `${toolsToAdd.length} ${connectingIntegrationType} webhook tool${toolsToAdd.length > 1 ? 's' : ''} have been automatically added and saved.`,
              });
            } catch (error) {
              // Revert state if save failed
              setWebhookTools(webhookTools);
              const errorMessage = error instanceof Error ? error.message : 'Failed to save webhook tools';
              toast({
                title: "Webhook tool creation failed",
                description: `Failed to save webhook tools: ${errorMessage}. Please try saving the assistant manually.`,
                variant: "destructive",
              });
            }
          } else if (toolsToAdd.length > 0 && !agent?.id) {
            // Agent doesn't exist yet (new agent), just add to state
            setWebhookTools(prev => [...prev, ...toolsToAdd]);
          } else if (toolsToAdd.length === 0) {
            // All tools already exist
            toast({
              title: "Webhook tools already exist",
              description: `All ${connectingIntegrationType} webhook tools are already configured.`,
            });
          }
        }
      }
      
      // Automatically enable the integration for this agent
      const availableTools = getAvailableToolsForIntegration(connectingIntegrationType);
      setAgentIntegrationTools(prev => ({
        ...prev,
        [connectingIntegrationType]: {
          enabled: true,
          enabledTools: availableTools
        }
      }));
      
      // Auto-expand when connected
      setIntegrationToolsExpanded(prev => ({
        ...prev,
        [connectingIntegrationType]: true
      }));
      
      // If agent is saved, also save the integration tools to backend
      if (agent?.id) {
        try {
          const currentIntegrationTools = { ...agentIntegrationTools };
          currentIntegrationTools[connectingIntegrationType] = {
            enabled: true,
            enabledTools: availableTools
          };
          
          const integrationToolsForBackend: Record<string, { enabled: boolean; enabled_tools: string[] }> = {};
          for (const [key, value] of Object.entries(currentIntegrationTools)) {
            integrationToolsForBackend[key] = {
              enabled: value.enabled,
              enabled_tools: value.enabledTools || []
            };
          }
          
          const config = buildConfiguration();
          await agentsApi.update(agent.id, {
            ...config,
            integration_tools: integrationToolsForBackend
          } as Parameters<typeof agentsApi.update>[1]);
        } catch (error) {
          console.error('Failed to enable integration on agent:', error);
          // Don't show error toast as the integration was still connected successfully
        }
      }
      
      toast({
        title: isEditing ? "Integration updated" : "Integration connected",
        description: `${formatToolName(connectingIntegrationType)} has been ${isEditing ? 'updated' : 'connected'} and enabled successfully.`,
      });
      
      // Close the modal
      closeIntegrationConnectionModal();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save integration';
      toast({
        title: isEditing ? "Update failed" : "Connection failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setConnectingIntegrationLoading(false);
    }
  };

  // Client tool management functions
  const openClientToolModal = (tool?: ClientTool) => {
    if (tool) {
      setEditingClientTool(tool);
      setClientToolForm({ ...tool });
    } else {
      setEditingClientTool(null);
      setClientToolForm(getEmptyClientTool());
    }
    setShowClientToolModal(true);
  };

  const closeClientToolModal = () => {
    setShowClientToolModal(false);
    setEditingClientTool(null);
    setClientToolForm(getEmptyClientTool());
    setClientParamEnumValue({});
  };

  const saveClientTool = () => {
    if (!clientToolForm.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the client tool.",
        variant: "destructive",
      });
      return;
    }

    if (editingClientTool) {
      setClientTools(prev => prev.map(t => t.id === editingClientTool.id ? clientToolForm : t));
    } else {
      setClientTools(prev => [...prev, clientToolForm]);
    }
    closeClientToolModal();
    toast({
      title: editingClientTool ? "Tool updated" : "Tool added",
      description: `${clientToolForm.name} has been ${editingClientTool ? "updated" : "added"} successfully.`,
    });
  };

  const deleteClientTool = (toolId: string) => {
    setClientTools(prev => prev.filter(t => t.id !== toolId));
    toast({
      title: "Tool deleted",
      description: "The client tool has been removed.",
    });
  };

  const updateClientToolForm = <K extends keyof ClientTool>(key: K, value: ClientTool[K]) => {
    setClientToolForm(prev => ({ ...prev, [key]: value }));
  };

  // Client tool parameter management
  const addClientToolParameter = () => {
    setClientToolForm(prev => ({
      ...prev,
      parameters: [...prev.parameters, getEmptyClientToolParameter()]
    }));
  };

  const updateClientToolParameter = (id: string, updates: Partial<ClientToolParameter>) => {
    setClientToolForm(prev => ({
      ...prev,
      parameters: prev.parameters.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const removeClientToolParameter = (id: string) => {
    setClientToolForm(prev => ({
      ...prev,
      parameters: prev.parameters.filter(p => p.id !== id)
    }));
  };

  const addClientParamEnumValue = (paramId: string) => {
    const value = clientParamEnumValue[paramId]?.trim();
    if (!value) return;
    
    setClientToolForm(prev => ({
      ...prev,
      parameters: prev.parameters.map(p => 
        p.id === paramId 
          ? { ...p, enumValues: [...p.enumValues, value] }
          : p
      )
    }));
    setClientParamEnumValue(prev => ({ ...prev, [paramId]: "" }));
  };

  const removeClientParamEnumValue = (paramId: string, valueIndex: number) => {
    setClientToolForm(prev => ({
      ...prev,
      parameters: prev.parameters.map(p => 
        p.id === paramId 
          ? { ...p, enumValues: p.enumValues.filter((_, i) => i !== valueIndex) }
          : p
      )
    }));
  };

  // Client tool dynamic variable assignment management
  const addClientDynamicVariableAssignment = () => {
    setClientToolForm(prev => ({
      ...prev,
      dynamicVariableAssignments: [...prev.dynamicVariableAssignments, getEmptyDynamicVariableAssignment()]
    }));
  };

  const updateClientDynamicVariableAssignment = (id: string, updates: Partial<DynamicVariableAssignment>) => {
    setClientToolForm(prev => ({
      ...prev,
      dynamicVariableAssignments: prev.dynamicVariableAssignments.map(a => a.id === id ? { ...a, ...updates } : a)
    }));
  };

  const removeClientDynamicVariableAssignment = (id: string) => {
    setClientToolForm(prev => ({
      ...prev,
      dynamicVariableAssignments: prev.dynamicVariableAssignments.filter(a => a.id !== id)
    }));
  };

  const [modelExpanded, setModelExpanded] = useState(false);
  const [voiceConfigExpanded, setVoiceConfigExpanded] = useState(false);
  const [additionalConfigExpanded, setAdditionalConfigExpanded] = useState(true);
  const [transcriberExpanded, setTranscriberExpanded] = useState(false);
  const [backgroundDenoising, setBackgroundDenoising] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState([0.4]);
  const [keyterms, setKeyterms] = useState("");
  const [endOfTurnConfidence, setEndOfTurnConfidence] = useState([0.7]);
  const [endOfTurnTimeout, setEndOfTurnTimeout] = useState([5000]);
  const [privacyExpanded, setPrivacyExpanded] = useState(true);
  const [hipaaCompliance, setHipaaCompliance] = useState(false);
  const [audioRecording, setAudioRecording] = useState(true);
  const [logging, setLogging] = useState(true);
  const [transcript, setTranscript] = useState(true);
  const [videoRecording, setVideoRecording] = useState(false);
  // Note: systemPrompt is generated from a fixed template + section variables
  // Users cannot edit the template directly - only define content for scenarios, phases, voice tone
  const [cenarios, setCenarios] = useState<SectionEntry[]>([]);
  const [etapas, setEtapas] = useState<SectionEntry[]>([]);
  const [tomDeVoz, setTomDeVoz] = useState<SectionEntry[]>([]);
  const [showPromptPreviewModal, setShowPromptPreviewModal] = useState(false);
  const [firstMessageExpanded, setFirstMessageExpanded] = useState(false);
  const [agentBehaviourExpanded, setAgentBehaviourExpanded] = useState(false);
  const [filesExpanded, setFilesExpanded] = useState(false);
  const [systemToolsSectionExpanded, setSystemToolsSectionExpanded] = useState(false);
  const [externalIntegrationToolsSectionExpanded, setExternalIntegrationToolsSectionExpanded] = useState(false);
  const [integrationToolsSectionExpanded, setIntegrationToolsSectionExpanded] = useState(false);

  // Section Editor Modal State
  type SectionType = "scenarios" | "phases" | "voiceTone";
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSectionType, setEditingSectionType] = useState<SectionType | null>(null);
  const [editingSectionEntry, setEditingSectionEntry] = useState<SectionEntry | null>(null);
  const [sectionForm, setSectionForm] = useState<Omit<SectionEntry, "id">>({
    title: "",
    description: "",
    notes: "",
  });

  const getSectionSetter = (type: SectionType): React.Dispatch<React.SetStateAction<SectionEntry[]>> => {
    switch (type) {
      case "scenarios":
        return setCenarios;
      case "phases":
        return setEtapas;
      case "voiceTone":
        return setTomDeVoz;
    }
  };

  const openSectionModal = (type: SectionType, entry?: SectionEntry) => {
    setEditingSectionType(type);
    if (entry) {
      setEditingSectionEntry(entry);
      setSectionForm({
        title: entry.title,
        description: entry.description,
        notes: entry.notes || "",
      });
    } else {
      setEditingSectionEntry(null);
      setSectionForm({ title: "", description: "", notes: "" });
    }
    setShowSectionModal(true);
  };

  const closeSectionModal = () => {
    setShowSectionModal(false);
    setEditingSectionType(null);
    setEditingSectionEntry(null);
    setSectionForm({ title: "", description: "", notes: "" });
  };

  const saveSectionEntry = () => {
    if (!editingSectionType) return;
    const setter = getSectionSetter(editingSectionType);
    
    if (editingSectionEntry) {
      // Update existing entry
      setter((prev) =>
        prev.map((entry) =>
          entry.id === editingSectionEntry.id
            ? { ...entry, ...sectionForm }
            : entry
        )
      );
    } else {
      // Add new entry
      setter((prev) => [...prev, createSectionEntry(sectionForm)]);
    }
    closeSectionModal();
  };

  const deleteSectionEntry = (type: SectionType, id: string) => {
    const setter = getSectionSetter(type);
    setter((prev) => prev.filter((entry) => entry.id !== id));
  };

  const addSectionEntry = (
    setter: React.Dispatch<React.SetStateAction<SectionEntry[]>>,
    defaults: Partial<SectionEntry> = {}
  ) => {
    setter((prev) => [...prev, createSectionEntry(defaults)]);
  };

  const updateSectionEntryField = (
    setter: React.Dispatch<React.SetStateAction<SectionEntry[]>>,
    id: string,
    field: keyof SectionEntry,
    value: string
  ) => {
    setter((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
    );
  };

  const removeSectionEntryById = (
    setter: React.Dispatch<React.SetStateAction<SectionEntry[]>>,
    id: string
  ) => {
    setter((prev) => prev.filter((entry) => entry.id !== id));
  };
  const [firstMessage, setFirstMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [agentFiles, setAgentFiles] = useState<AgentFile[]>([]);
  const [allAvailableFiles, setAllAvailableFiles] = useState<AgentFile[]>([]);
  const [showChooseFilesDialog, setShowChooseFilesDialog] = useState(false);
  const [loadingAvailableFiles, setLoadingAvailableFiles] = useState(false);
  const [assigningFile, setAssigningFile] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-cluster");
  const [firstMessageMode, setFirstMessageMode] = useState("assistant-speaks-first");
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("english");
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState("");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const derivedSystemPrompt = useMemo(() => {
    // Helper to format entries as markdown list items for a section
    const formatSectionContent = (sectionTitle: string, sectionDescription: string, entries: SectionEntry[]): string => {
      if (entries.length === 0) return "";

      const formattedEntries = entries
        .map((entry) => {
          const title = entry.title.trim();
          const description = entry.description.trim();
          const notes = entry.notes?.trim();

          if (!title && !description) return null;

          let content = `- **${title || "Untitled"}**`;
          if (description) {
            content += `\n  ${description}`;
          }
          if (notes) {
            content += `\n  _Note: ${notes}_`;
          }
          return content;
        })
        .filter(Boolean)
        .join("\n\n");

      if (!formattedEntries) return "";

      return `## ${sectionTitle}\n\n${sectionDescription}\n\n${formattedEntries}`;
    };

    // Check if we have any sections defined
    const hasScenarios = cenarios.length > 0;
    const hasPhases = etapas.length > 0;
    const hasVoiceTone = tomDeVoz.length > 0;
    const hasSections = hasScenarios || hasPhases || hasVoiceTone;

    // If no sections defined, use the default fallback prompt
    if (!hasSections) {
      return DEFAULT_SYSTEM_PROMPT;
    }

    // Build the variable values
    const scenariosContent = formatSectionContent(
      "Scenarios",
      "These are the main scenarios you should be prepared to handle:",
      cenarios
    );

    const phasesContent = formatSectionContent(
      "Conversation Phases", 
      "Follow these phases during the conversation:",
      etapas
    );

    const voiceToneContent = formatSectionContent(
      "Voice & Tone",
      "Maintain the following tone and communication style:",
      tomDeVoz
    );

    // Replace template variables with actual content
    // Empty sections are replaced with empty string (removed from template)
    const prompt = PROMPT_TEMPLATE
      .replace("{{SCENARIOS}}", scenariosContent)
      .replace("{{PHASES}}", phasesContent)
      .replace("{{VOICE_TONE}}", voiceToneContent)
      // Clean up multiple consecutive newlines that may result from empty sections
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return prompt;
  }, [cenarios, etapas, tomDeVoz]);

  type SectionEditorConfig = {
    title: string;
    description: string;
    entries: SectionEntry[];
    sectionType: SectionType;
    addLabel: string;
    titlePlaceholder: string;
    descriptionPlaceholder: string;
    notesPlaceholder: string;
    notesLabel?: string;
  };

  const renderSectionEditor = ({
    title,
    description,
    entries,
    sectionType,
    addLabel,
  }: SectionEditorConfig) => (
    <div className="border border-border rounded-lg bg-white p-4 space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h4 className="text-sm font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => openSectionModal(sectionType)}
          className="flex items-center gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </Button>
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No {title.toLowerCase()} defined yet. Use the button above to add one.
        </p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="group flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
            >
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => openSectionModal(sectionType, entry)}
              >
                <h5 className="text-sm font-medium truncate">
                  {entry.title || <span className="text-muted-foreground italic">Untitled</span>}
                </h5>
                {entry.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {entry.description.length > 80
                      ? `${entry.description.slice(0, 80)}...`
                      : entry.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => openSectionModal(sectionType, entry)}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => deleteSectionEntry(sectionType, entry.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // System tools state
  const [systemTools, setSystemTools] = useState<Record<SystemToolKey, boolean>>(() => getDefaultSystemToolsState());
  const [systemToolSettings, setSystemToolSettings] = useState<Record<SystemToolKey, SystemToolSetting>>(() => getDefaultSystemToolSettings());
  const [systemToolExpanded, setSystemToolExpanded] = useState<Record<SystemToolKey, boolean>>(() => getDefaultSystemToolExpanded());
  const [selectedSystemTool, setSelectedSystemTool] = useState<SystemToolKey | null>(null);
  
  // Webhook/Integration tools state
  const [webhookTools, setWebhookTools] = useState<WebhookTool[]>([]);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [editingWebhookTool, setEditingWebhookTool] = useState<WebhookTool | null>(null);
  const [webhookForm, setWebhookForm] = useState<WebhookTool>(() => getEmptyWebhookTool());
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [webhookJsonValue, setWebhookJsonValue] = useState("");
  const [newEnumValue, setNewEnumValue] = useState<Record<string, string>>({});
  
  // Client tools state
  const [clientTools, setClientTools] = useState<ClientTool[]>([]);
  const [showClientToolModal, setShowClientToolModal] = useState(false);
  const [editingClientTool, setEditingClientTool] = useState<ClientTool | null>(null);
  const [clientToolForm, setClientToolForm] = useState<ClientTool>(() => getEmptyClientTool());
  const [clientParamEnumValue, setClientParamEnumValue] = useState<Record<string, string>>({});

  // Integration tools state (CRM/Scheduling integrations like Pipedrive, Calendly)
  const [agentIntegrationTools, setAgentIntegrationTools] = useState<Record<string, { enabled: boolean; enabledTools: string[] }>>({});
  const [userIntegrations, setUserIntegrations] = useState<Array<{ type: string; connected: boolean }>>([]);
  const [integrationToolsExpanded, setIntegrationToolsExpanded] = useState<Record<string, boolean>>({});
  
  // Integration connection modal state
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [integrationModalStep, setIntegrationModalStep] = useState<'select' | 'credentials'>('select');
  const [integrationModalTab, setIntegrationModalTab] = useState<'credentials' | 'tools' | 'about'>('credentials');
  const [connectingIntegrationType, setConnectingIntegrationType] = useState<string | null>(null);
  const [integrationSchemas, setIntegrationSchemas] = useState<Record<string, IntegrationSchema>>({});
  const [connectingIntegrationLoading, setConnectingIntegrationLoading] = useState(false);
  const [editingIntegrationConfig, setEditingIntegrationConfig] = useState<IntegrationConfig>({});
  
  // Available integrations that can be added
  const availableIntegrationTypes = ['pipedrive', 'calendly'];

  const promptToolsSummary = useMemo(() => {
    const activeSystemTools = SYSTEM_TOOL_KEYS.filter((key) => !!systemTools[key]).map((key) => formatToolName(key));
    const clientToolNames = clientTools
      .map((t) => t.name?.trim())
      .filter((name): name is string => !!name);
    // Filter out integration webhooks (managed by us) from user-defined webhooks
    const webhookToolNames = webhookTools
      .filter(tool => !isIntegrationWebhook(tool))
      .map((t) => t.name?.trim())
      .filter((name): name is string => !!name);

    const enabledIntegrations = Object.entries(agentIntegrationTools)
      .filter(([, value]) => !!value?.enabled)
      .map(([integrationType, value]) => ({
        integrationType,
        enabledTools: (value?.enabledTools || []).filter((t) => t && t.trim()),
      }));

    return {
      activeSystemTools,
      clientToolNames,
      webhookToolNames,
      enabledIntegrations,
    };
  }, [systemTools, clientTools, webhookTools, agentIntegrationTools]);
  
  // Get integration description (full description for About tab)
  const getIntegrationFullDescription = (integrationType: string): string => {
    const descriptions: Record<string, string> = {
      pipedrive: "Keep your leads and pipelines in sync with Pipedrive CRM. Your AI agents can manage deals, update contacts, and track sales activities automatically.",
      calendly: "Bring Calendly booking links into your assistant workflows. Enable your agents to schedule meetings and manage availability.",
      hubspot: "Connect your ElevenLabs AI agents with HubSpot CRM to manage contacts, companies, and deals. This integration enables your agents to create and update CRM records, search for existing data, and automate sales and marketing workflows. Keep your customer data synchronized and let your AI agents handle routine CRM tasks.",
      salesforce: "Integrate your AI agents with Salesforce Sales Cloud to push and pull records directly. Enable your agents to access customer data, update opportunities, create leads, and automate your sales processes seamlessly.",
      google_calendar: "Overlay availability and events from Google Calendar. Let your agents check schedules and book appointments.",
      outlook_calendar: "Integrate Microsoft Outlook calendars for scheduling. Enable calendar management through your AI agents.",
      calcom: "Use Cal.com event links to manage availability across calendars. Integrate scheduling capabilities into your agent workflows."
    };
    return descriptions[integrationType] || `Configure your ${formatToolName(integrationType)} integration settings.`;
  };

  // Get integration description (short version)
  const getIntegrationDescription = (integrationType: string): string => {
    const descriptions: Record<string, string> = {
      pipedrive: "CRM to manage contacts and deals",
      calendly: "Scheduling and appointment booking",
      hubspot: "CRM and marketing automation",
      salesforce: "Enterprise CRM platform",
      google_calendar: "Google Calendar integration",
      calcom: "Open source scheduling",
    };
    return descriptions[integrationType] || "Business integration";
  };
  
  // Secrets state for ElevenLabs secrets management
  const [secrets, setSecrets] = useState<ElevenLabsSecret[]>([]);
  const [secretsLoading, setSecretsLoading] = useState(false);
  const [showCreateSecretModal, setShowCreateSecretModal] = useState(false);
  const [newSecretName, setNewSecretName] = useState("");
  const [newSecretValue, setNewSecretValue] = useState("");
  const [creatingSecret, setCreatingSecret] = useState(false);
  const [creatingSecretForHeaderId, setCreatingSecretForHeaderId] = useState<string | null>(null);
  
  // Track saved configuration to detect changes
  const [savedConfig, setSavedConfig] = useState<{
    name: string;
    config: ReturnType<typeof buildConfiguration>;
  } | null>(null);

  // Extract system prompt and first message from agent data
  const extractAgentData = useCallback((agentData: Agent) => {
    setCenarios([]);
    setEtapas([]);
    setTomDeVoz([]);
    if (agentData.conversation_config) {
      const config = agentData.conversation_config as Record<string, unknown>;
      
      // Load section variables from stored JSON
      // The system prompt is generated from a fixed template + these variables
      // Support both English (from CreateAgentWizard) and Portuguese (legacy) field names
      setCenarios(parseSectionEntries(config.scenarios ?? config.cenarios));
      setEtapas(parseSectionEntries(config.phases ?? config.etapas));
      setTomDeVoz(parseSectionEntries(config.voice_tone ?? config.tom_de_voz ?? config.tone_of_voice));
      
      // Extract first message
      if (typeof config.first_message === 'string') {
        setFirstMessage(config.first_message);
      } else {
        setFirstMessage("");
      }
      
      // Extract first message mode
      if (typeof config.first_message_mode === 'string') {
        const mode = config.first_message_mode as "assistant-speaks-first" | "assistant-waits-for-user" | "assistant-speaks-first-model-generated";
        setFirstMessageMode(mode);
      } else {
        setFirstMessageMode("assistant-speaks-first");
      }
      
      // Extract system tools - Check both agent level and conversation_config for backward compatibility
      const agentDataRecord = agentData as unknown as Record<string, unknown>;
      const systemToolsData = (agentDataRecord.system_tools || config.system_tools) as Record<string, unknown> | undefined;
      
      if (systemToolsData && typeof systemToolsData === 'object') {
        const defaults = getDefaultSystemToolSettings();
        const parsedSettings: Record<SystemToolKey, SystemToolSetting> = { ...defaults };
        const toolsState = { ...getDefaultSystemToolsState() };

        SYSTEM_TOOL_KEYS.forEach((key) => {
          const toolData = systemToolsData[key] as Record<string, unknown> | undefined;
          
          if (toolData && typeof toolData === 'object') {
            // Extract active state
            const isActive = toolData.active === true || toolData.active === 'true' || toolData.active === 1;
            toolsState[key] = isActive;

            // Extract settings
            const nextSetting: SystemToolSetting = { ...defaults[key] };
            
            if (typeof toolData.description === 'string') {
              nextSetting.description = toolData.description;
            }
            if (typeof toolData.disable_interruptions === 'boolean') {
              nextSetting.disableInterruptions = toolData.disable_interruptions;
            }

            // Extract params for transfer tools
            if (key === "transfer_to_agent" && toolData.params && typeof toolData.params === 'object') {
              const params = toolData.params as Record<string, unknown>;
              if (Array.isArray(params.transfers)) {
                nextSetting.transferRules = (params.transfers as Array<Record<string, unknown>>).map(transfer => ({
                  // ElevenLabs uses agent_id, but we store it as agent in our state
                  agent: typeof transfer.agent_id === 'string' ? transfer.agent_id : 
                         typeof transfer.agent === 'string' ? transfer.agent : "",
                  condition: typeof transfer.condition === 'string' ? transfer.condition : "",
                  delayMs: typeof transfer.delay_ms === 'number' ? transfer.delay_ms : 0,
                  transferMessage: typeof transfer.transfer_message === 'string' ? transfer.transfer_message : "",
                  enableFirstMessage: typeof transfer.enable_first_message === 'boolean' ? transfer.enable_first_message : false
                }));
              }
            }

            if (key === "transfer_to_number" && toolData.params && typeof toolData.params === 'object') {
              const params = toolData.params as Record<string, unknown>;
              if (Array.isArray(params.transfers)) {
                nextSetting.humanTransferRules = (params.transfers as Array<Record<string, unknown>>).map(transfer => ({
                  transferType: "conference" as const, // Only conference is supported
                  destinationType: "phone_number",
                  phoneNumber: typeof transfer.phone_number === 'string' ? transfer.phone_number : "",
                  condition: typeof transfer.condition === 'string' ? transfer.condition : ""
                }));
              }
            }

            parsedSettings[key] = nextSetting;
          }
        });

        setSystemTools(toolsState);
        setSystemToolSettings(parsedSettings);
        
        // Auto-expand transfer tools if they are active
        setSystemToolExpanded(prev => {
          const next = { ...prev };
          if (toolsState.transfer_to_agent) {
            next.transfer_to_agent = true;
          }
          if (toolsState.transfer_to_number) {
            next.transfer_to_number = true;
          }
          return next;
        });
      }
      
      // Legacy format support - if system_tools is an array
      else if (Array.isArray(config.system_tools)) {
        const tools = config.system_tools as string[];
        const normalizedTools = tools
          .map(tool => normalizeSystemToolKey(String(tool)))
          .filter(Boolean) as SystemToolKey[];

        setSystemTools(prev => {
          const newTools = { ...prev };
          SYSTEM_TOOL_KEYS.forEach(key => {
            newTools[key] = normalizedTools.includes(key);
          });
          return newTools;
        });

        setSystemToolExpanded(prev => {
          const next = { ...prev };
          if (normalizedTools.includes("transfer_to_agent")) {
            next.transfer_to_agent = true;
          }
          if (normalizedTools.includes("transfer_to_number")) {
            next.transfer_to_number = true;
          }
          return next;
        });
        
        // Try to extract settings from old format
        if (config.system_tools_settings && typeof config.system_tools_settings === 'object') {
          const settings = config.system_tools_settings as Record<string, unknown>;
          const defaults = getDefaultSystemToolSettings();
          const parsedSettings: Record<SystemToolKey, SystemToolSetting> = { ...defaults };

        SYSTEM_TOOL_KEYS.forEach((key) => {
          const incoming = (settings[key] || settings[key.replace(/_/g, "-")]) as Record<string, unknown> | undefined;
          if (incoming && typeof incoming === 'object') {
            const nextSetting: SystemToolSetting = { ...defaults[key] };
            if (typeof incoming.name === 'string') {
              nextSetting.name = incoming.name;
            }
            if (typeof incoming.description === 'string') {
              nextSetting.description = incoming.description;
            }
            if (typeof incoming.disable_interruptions === 'boolean') {
              nextSetting.disableInterruptions = incoming.disable_interruptions;
            }

            if (key === "transfer_to_agent" && Array.isArray(incoming.transfer_rules)) {
              nextSetting.transferRules = (incoming.transfer_rules as Array<Record<string, unknown>>).map(rule => ({
                // Handle both agent and agent_id for backward compatibility
                agent: typeof rule.agent_id === 'string' ? rule.agent_id :
                       typeof rule.agent === 'string' ? rule.agent : "",
                condition: typeof rule.condition === 'string' ? rule.condition : "",
                delayMs: typeof rule.delay_ms === 'number' ? rule.delay_ms : 0,
                transferMessage: typeof rule.transfer_message === 'string' ? rule.transfer_message : "",
                enableFirstMessage: typeof rule.enable_first_message === 'boolean' ? rule.enable_first_message : false
              }));
            }

            if (key === "transfer_to_number" && Array.isArray(incoming.human_transfer_rules)) {
              nextSetting.humanTransferRules = (incoming.human_transfer_rules as Array<Record<string, unknown>>).map(rule => ({
                transferType: "conference" as const, // Only conference is supported
                destinationType: "phone_number",
                phoneNumber: typeof rule.phone_number === 'string' ? rule.phone_number : "",
                condition: typeof rule.condition === 'string' ? rule.condition : ""
              }));
            }

            parsedSettings[key] = nextSetting;
          }
        });

          setSystemToolSettings(parsedSettings);
        }
      }
      
      // Extract model/provider if available
      if (config.model && typeof config.model === 'object') {
        const modelConfig = config.model as Record<string, unknown>;
        if (typeof modelConfig.model === 'string') {
          setSelectedModel(modelConfig.model);
        }
        if (typeof modelConfig.provider === 'string') {
          setSelectedProvider(modelConfig.provider);
        }
      }
      
      // Extract voice information - only set if not already set to preserve user selection
      setSelectedVoiceId((currentVoiceId) => {
        // If we already have a voice selected, preserve it
        if (currentVoiceId) {
          return currentVoiceId;
        }
        // Otherwise, extract from config
        if (typeof config.voice_id === 'string') {
          return config.voice_id;
      } else if (config.voice && typeof config.voice === 'object') {
        const voiceConfig = config.voice as Record<string, unknown>;
        if (typeof voiceConfig.voice_id === 'string') {
            return voiceConfig.voice_id;
          }
        }
        return currentVoiceId;
      });
      
      // Set voice name if available
      setSelectedVoiceName((currentVoiceName) => {
        // If we already have a name, preserve it
        if (currentVoiceName) {
          return currentVoiceName;
        }
        // Otherwise, extract from config
        if (config.voice && typeof config.voice === 'object') {
          const voiceConfig = config.voice as Record<string, unknown>;
        if (typeof voiceConfig.name === 'string') {
            return voiceConfig.name;
        }
      }
        return currentVoiceName;
      });
      
      // Extract transcriber configuration
      if (config.transcriber && typeof config.transcriber === 'object') {
        const transcriberConfig = config.transcriber as Record<string, unknown>;
        if (typeof transcriberConfig.language === 'string') {
          setSelectedLanguage(transcriberConfig.language);
        }
        if (typeof transcriberConfig.background_denoising_enabled === 'boolean') {
          setBackgroundDenoising(transcriberConfig.background_denoising_enabled);
        }
        if (typeof transcriberConfig.confidence_threshold === 'number') {
          setConfidenceThreshold([transcriberConfig.confidence_threshold]);
        }
        if (Array.isArray(transcriberConfig.keyterms)) {
          setKeyterms(transcriberConfig.keyterms.join(', '));
        } else if (typeof transcriberConfig.keyterms === 'string') {
          setKeyterms(transcriberConfig.keyterms);
        }
        if (transcriberConfig.end_of_turn && typeof transcriberConfig.end_of_turn === 'object') {
          const endOfTurn = transcriberConfig.end_of_turn as Record<string, unknown>;
          if (typeof endOfTurn.confidence_threshold === 'number') {
            setEndOfTurnConfidence([endOfTurn.confidence_threshold]);
          }
          if (typeof endOfTurn.timeout_ms === 'number') {
            setEndOfTurnTimeout([endOfTurn.timeout_ms]);
          }
        }
      }
    }
    
    // Also check platform_settings for voice info
    if (agentData.platform_settings) {
      const platformSettings = agentData.platform_settings as Record<string, unknown>;
      // Only set voice_id from platform_settings if not already set
      setSelectedVoiceId((currentVoiceId) => {
        if (currentVoiceId) {
          return currentVoiceId;
        }
        if (typeof platformSettings.voice_id === 'string') {
          return platformSettings.voice_id;
      }
        return currentVoiceId;
      });
      // Check for language in platform_settings
      if (typeof platformSettings.language === 'string' && !selectedLanguage) {
        setSelectedLanguage(platformSettings.language);
      }
    }
    
    // Extract privacy settings
    if (agentData.conversation_config) {
      const config = agentData.conversation_config as Record<string, unknown>;
      if (typeof config.hipaa_compliance === 'boolean') {
        setHipaaCompliance(config.hipaa_compliance);
      }
      if (typeof config.audio_recording === 'boolean') {
        setAudioRecording(config.audio_recording);
      }
      if (typeof config.logging === 'boolean') {
        setLogging(config.logging);
      }
      if (typeof config.transcript === 'boolean') {
        setTranscript(config.transcript);
      }
      if (typeof config.video_recording === 'boolean') {
        setVideoRecording(config.video_recording);
      }
    }

    // Extract client and webhook tools from multiple possible sources
    const agentRecord = agentData as unknown as Record<string, unknown>;
    const loadedClientTools: ClientTool[] = [];
    const loadedWebhookTools: WebhookTool[] = [];

    // Helper to parse client tool from our format
    const parseClientToolFromOurFormat = (tool: Record<string, unknown>): ClientTool => ({
      id: typeof tool.id === 'string' ? tool.id : crypto.randomUUID(),
      name: typeof tool.name === 'string' ? tool.name : "",
      description: typeof tool.description === 'string' ? tool.description : "",
      waitForResponse: tool.wait_for_response === true,
      disableInterruptions: tool.disable_interruptions === true,
      preToolSpeech: (tool.pre_tool_speech as "auto" | "always" | "never") || "auto",
      executionMode: (tool.execution_mode as "immediate" | "on_turn_end") || "immediate",
      parameters: Array.isArray(tool.parameters) 
        ? (tool.parameters as Array<Record<string, unknown>>).map(p => ({
            id: typeof p.id === 'string' ? p.id : crypto.randomUUID(),
            dataType: (p.data_type as "string" | "number" | "boolean" | "array" | "object") || "string",
            identifier: typeof p.identifier === 'string' ? p.identifier : "",
            required: p.required === true,
            valueType: (p.value_type as "llm_prompt" | "static") || "llm_prompt",
            description: typeof p.description === 'string' ? p.description : "",
            enumValues: Array.isArray(p.enum_values) ? (p.enum_values as string[]) : []
          }))
        : [],
      dynamicVariableAssignments: Array.isArray(tool.dynamic_variable_assignments)
        ? (tool.dynamic_variable_assignments as Array<Record<string, unknown>>).map(a => ({
            id: crypto.randomUUID(),
            variableName: typeof a.variable_name === 'string' ? a.variable_name : "",
            isNewVariable: a.is_new_variable !== false,
            jsonPath: typeof a.json_path === 'string' ? a.json_path : ""
          }))
        : []
    });

    // Helper to parse client tool from ElevenLabs format
    const parseClientToolFromElevenLabs = (tool: Record<string, unknown>): ClientTool => {
      const params = tool.parameters as Record<string, unknown> | undefined;
      const properties = params?.properties as Record<string, Record<string, unknown>> | undefined;
      const requiredParams = (params?.required as string[]) || [];
      const assignments = (tool.assignments as Array<Record<string, unknown>>) || [];
      
      return {
        id: crypto.randomUUID(),
        name: typeof tool.name === 'string' ? tool.name : "",
        description: typeof tool.description === 'string' ? tool.description : "",
        waitForResponse: tool.expects_response === true,
        disableInterruptions: tool.disable_interruptions === true,
        preToolSpeech: tool.force_pre_tool_speech === true ? "always" : "auto",
        executionMode: (tool.execution_mode as "immediate" | "on_turn_end") || "immediate",
        parameters: properties ? Object.entries(properties).map(([key, prop]) => ({
          id: crypto.randomUUID(),
          dataType: (prop.type as "string" | "number" | "boolean" | "array" | "object") || "string",
          identifier: key,
          required: requiredParams.includes(key),
          valueType: prop.is_system_provided ? "static" : "llm_prompt",
          description: typeof prop.description === 'string' ? prop.description : "",
          enumValues: Array.isArray(prop.enum) ? (prop.enum as string[]) : []
        })) : [],
        dynamicVariableAssignments: assignments.map(a => ({
          id: crypto.randomUUID(),
          variableName: typeof a.dynamic_variable === 'string' ? a.dynamic_variable : "",
          isNewVariable: true,
          jsonPath: typeof a.value_path === 'string' ? a.value_path : ""
        }))
      };
    };

    // Helper to parse webhook tool from our format
    const parseWebhookToolFromOurFormat = (tool: Record<string, unknown>): WebhookTool => ({
      id: typeof tool.id === 'string' ? tool.id : crypto.randomUUID(),
      name: typeof tool.name === 'string' ? tool.name : "",
      description: typeof tool.description === 'string' ? tool.description : "",
      method: (tool.method as "GET" | "POST" | "PUT" | "DELETE" | "PATCH") || "GET",
      url: typeof tool.url === 'string' ? tool.url : "",
      responseTimeout: typeof tool.response_timeout === 'number' ? tool.response_timeout : 20,
      disableInterruptions: tool.disable_interruptions === true,
      preToolSpeech: (tool.pre_tool_speech as "auto" | "always" | "never") || "auto",
      executionMode: (tool.execution_mode as "parallel" | "sequential") || "parallel",
      toolCallSound: (tool.tool_call_sound as "none" | "beep" | "chime") || "none",
      authentication: typeof tool.authentication === 'string' ? tool.authentication : "",
      headers: Array.isArray(tool.headers)
        ? (tool.headers as Array<Record<string, unknown>>).map(h => ({
            id: crypto.randomUUID(),
            type: (h.type as "secret" | "value") || "value",
            name: typeof h.name === 'string' ? h.name : "",
            value: typeof h.value === 'string' ? h.value : ""
          }))
        : [],
      queryParams: Array.isArray(tool.query_params)
        ? (tool.query_params as Array<Record<string, unknown>>).map(p => ({
            id: crypto.randomUUID(),
            dataType: (p.data_type as "string" | "number" | "boolean" | "array" | "object") || "string",
            identifier: typeof p.identifier === 'string' ? p.identifier : "",
            required: p.required === true,
            valueType: (p.value_type as "llm_prompt" | "static") || "llm_prompt",
            description: typeof p.description === 'string' ? p.description : "",
            enumValues: Array.isArray(p.enum_values) ? (p.enum_values as string[]) : []
          }))
        : [],
      dynamicVariableAssignments: Array.isArray(tool.dynamic_variable_assignments)
        ? (tool.dynamic_variable_assignments as Array<Record<string, unknown>>).map(a => ({
            id: crypto.randomUUID(),
            variableName: typeof a.variable_name === 'string' ? a.variable_name : "",
            isNewVariable: a.is_new_variable !== false,
            jsonPath: typeof a.json_path === 'string' ? a.json_path : ""
          }))
        : []
    });

    // Helper to parse webhook tool from ElevenLabs format
    const parseWebhookToolFromElevenLabs = (tool: Record<string, unknown>): WebhookTool => {
      const apiSchema = tool.api_schema as Record<string, unknown> | undefined;
      const queryParamsSchema = apiSchema?.query_params_schema as Record<string, unknown> | undefined;
      const properties = queryParamsSchema?.properties as Record<string, Record<string, unknown>> | undefined;
      const requiredParams = (queryParamsSchema?.required as string[]) || [];
      const requestHeaders = apiSchema?.request_headers as Record<string, unknown> | undefined;
      const assignments = (tool.assignments as Array<Record<string, unknown>>) || [];
      
      return {
        id: crypto.randomUUID(),
        name: typeof tool.name === 'string' ? tool.name : "",
        description: typeof tool.description === 'string' ? tool.description : "",
        method: (apiSchema?.method as "GET" | "POST" | "PUT" | "DELETE" | "PATCH") || "GET",
        url: typeof apiSchema?.url === 'string' ? apiSchema.url : "",
        responseTimeout: typeof tool.response_timeout_secs === 'number' ? tool.response_timeout_secs : 20,
        disableInterruptions: tool.disable_interruptions === true,
        preToolSpeech: tool.force_pre_tool_speech === true ? "always" : "auto",
        executionMode: tool.execution_mode === 'on_turn_end' ? "sequential" : "parallel",
        toolCallSound: "none",
        authentication: typeof apiSchema?.auth_connection === 'string' ? apiSchema.auth_connection : "",
        headers: requestHeaders ? Object.entries(requestHeaders).map(([name, value]) => ({
          id: crypto.randomUUID(),
          type: (typeof value === 'object' && value !== null && 'secret_id' in value) ? "secret" : "value",
          name,
          value: typeof value === 'object' && value !== null && 'secret_id' in value 
            ? (value as Record<string, string>).secret_id 
            : String(value || "")
        })) : [],
        queryParams: properties ? Object.entries(properties).map(([key, prop]) => ({
          id: crypto.randomUUID(),
          dataType: (prop.type as "string" | "number" | "boolean" | "array" | "object") || "string",
          identifier: key,
          required: requiredParams.includes(key),
          valueType: prop.is_system_provided ? "static" : "llm_prompt",
          description: typeof prop.description === 'string' ? prop.description : "",
          enumValues: Array.isArray(prop.enum) ? (prop.enum as string[]) : []
        })) : [],
        dynamicVariableAssignments: assignments.map(a => ({
          id: crypto.randomUUID(),
          variableName: typeof a.dynamic_variable === 'string' ? a.dynamic_variable : "",
          isNewVariable: true,
          jsonPath: typeof a.value_path === 'string' ? a.value_path : ""
        }))
      };
    };

    // First check our serializer format (client_tools and webhook_tools at root)
    if (Array.isArray(agentRecord.client_tools)) {
      (agentRecord.client_tools as Array<Record<string, unknown>>).forEach(tool => {
        loadedClientTools.push(parseClientToolFromOurFormat(tool));
      });
    }

    if (Array.isArray(agentRecord.webhook_tools)) {
      (agentRecord.webhook_tools as Array<Record<string, unknown>>).forEach(tool => {
        loadedWebhookTools.push(parseWebhookToolFromOurFormat(tool));
      });
    }

    // Also check ElevenLabs format (tools array in conversation_config.agent.prompt.tools)
    if (agentData.conversation_config) {
      const convConfig = agentData.conversation_config as Record<string, unknown>;
      const agentConfig = convConfig.agent as Record<string, unknown> | undefined;
      const promptConfig = agentConfig?.prompt as Record<string, unknown> | undefined;
      const toolsArray = promptConfig?.tools as Array<Record<string, unknown>> | undefined;
      
      if (Array.isArray(toolsArray)) {
        toolsArray.forEach(tool => {
          if (tool.type === 'client') {
            loadedClientTools.push(parseClientToolFromElevenLabs(tool));
          } else if (tool.type === 'webhook') {
            loadedWebhookTools.push(parseWebhookToolFromElevenLabs(tool));
          }
          // Skip 'system' tools as they're handled separately
        });
      }
    }

    if (loadedClientTools.length > 0) {
      setClientTools(loadedClientTools);
    }
    if (loadedWebhookTools.length > 0) {
      setWebhookTools(loadedWebhookTools);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch user integrations and schemas for integration tools section
  useEffect(() => {
    const fetchUserIntegrationsAndSchemas = async () => {
      try {
        // Fetch user integrations
        const response = await integrationsApi.list();
        if (response.data) {
          // Filter to only CRM and scheduling integrations
          const relevantIntegrations = response.data.filter((integration) => 
            ['pipedrive', 'calendly', 'hubspot'].includes(integration.integration_type)
          );
          setUserIntegrations(relevantIntegrations.map((i) => ({ type: i.integration_type, connected: true })));
        }
        
        // Fetch integration schemas
        const schemasResponse = await integrationsApi.getSchemas();
        if (schemasResponse.data) {
          const schemasMap: Record<string, IntegrationSchema> = {};
          schemasResponse.data.forEach((schema: IntegrationSchema) => {
            schemasMap[schema.type] = schema;
          });
          setIntegrationSchemas(schemasMap);
        }
      } catch (err) {
        console.warn('Failed to fetch user integrations:', err);
      }
    };
    
    fetchUserIntegrationsAndSchemas();
  }, []);

  // Load agent integration tools from agent data
  // Use a ref to track the last loaded integration_tools to avoid unnecessary updates
  const lastLoadedIntegrationToolsRef = useRef<string>('');
  
  useEffect(() => {
    // Also check userIntegrations to auto-enable any connected integrations
    if (agent?.integration_tools && typeof agent.integration_tools === 'object') {
      const integrationToolsData = agent.integration_tools as Record<string, { enabled: boolean; enabled_tools: string[] }>;
      // Convert enabled_tools to enabledTools for frontend consistency
      // Always set enabled: true for any integration that exists
      const converted: Record<string, { enabled: boolean; enabledTools: string[] }> = {};
      for (const [key, value] of Object.entries(integrationToolsData)) {
        const availableTools = getAvailableToolsForIntegration(key);
        converted[key] = {
          enabled: true, // Always enabled
          enabledTools: value.enabled_tools && value.enabled_tools.length > 0 ? value.enabled_tools : availableTools
        };
      }
      
      // Only include integrations that are actually in the agent's integration_tools
      // Don't auto-add user integrations that aren't associated with this agent
      
      // Only update state if the data actually changed (compare JSON strings to avoid unnecessary updates)
      const newDataStr = JSON.stringify(converted);
      if (lastLoadedIntegrationToolsRef.current !== newDataStr) {
        lastLoadedIntegrationToolsRef.current = newDataStr;
        setAgentIntegrationTools(converted);
      }
    } else {
      // If agent has no integration_tools, clear the state (don't auto-enable user integrations)
      if (lastLoadedIntegrationToolsRef.current !== '') {
        lastLoadedIntegrationToolsRef.current = '';
        setAgentIntegrationTools({});
      }
    }
  }, [agent?.integration_tools, agent?.id, userIntegrations]);
  
  // Fetch voices list
  useEffect(() => {
    const fetchVoices = async () => {
      setLoadingVoices(true);
      try {
        const response = await voicesApi.list();
        if (response.data) {
          setVoices(response.data);
          
          // Set default voice for new assistants if no voice is selected
          if (isNew && !selectedVoiceId && response.data.length > 0) {
            const firstVoice = response.data[0];
            setSelectedVoiceId(firstVoice.id);
            if (firstVoice.name) {
              setSelectedVoiceName(firstVoice.name);
            }
          }
          
          // If we have a selectedVoiceId but no name, try to find it in the voices list
          if (selectedVoiceId && !selectedVoiceName) {
            const voice = response.data.find(v => v.id === selectedVoiceId);
            if (voice?.name) {
              setSelectedVoiceName(voice.name);
            }
          }
        }
      } catch (err) {
        toast({
          title: 'Error loading voices',
          description: err instanceof Error ? err.message : 'Failed to fetch voices',
          variant: 'destructive',
        });
      } finally {
        setLoadingVoices(false);
      }
    };
    
    fetchVoices();
  }, [toast, isNew, selectedVoiceId, selectedVoiceName]);

  // Fetch secrets from ElevenLabs
  const fetchSecrets = useCallback(async () => {
    setSecretsLoading(true);
    try {
      const response = await secretsApi.list();
      if (response.data?.secrets) {
        setSecrets(response.data.secrets);
      }
    } catch (err) {
      console.warn('Could not fetch secrets:', err);
      // Don't show error toast - secrets are optional
    } finally {
      setSecretsLoading(false);
    }
  }, []);

  // Fetch secrets on component mount
  useEffect(() => {
    fetchSecrets();
  }, [fetchSecrets]);

  // Create a new secret
  const handleCreateSecret = async () => {
    if (!newSecretName.trim() || !newSecretValue.trim()) {
      toast({
        title: "Error",
        description: "Both secret name and value are required.",
        variant: "destructive",
      });
      return;
    }

    setCreatingSecret(true);
    try {
      const response = await secretsApi.create({
        name: newSecretName.trim(),
        value: newSecretValue.trim(),
      });
      
      const createdSecretId = response.data?.secret_id || newSecretName.trim();
      
      toast({
        title: "Success",
        description: `Secret "${newSecretName}" created successfully.`,
      });
      
      // Refresh secrets list
      await fetchSecrets();
      
      // Update the header that triggered the secret creation
      if (creatingSecretForHeaderId) {
        updateWebhookHeader(creatingSecretForHeaderId, { value: createdSecretId });
      } else {
        // Fallback: If there's a webhook header with the same value as the secret name, update it to the secret_id
        if (webhookForm.headers) {
          webhookForm.headers.forEach((header) => {
            if (header.type === "secret" && header.value === newSecretName.trim()) {
              updateWebhookHeader(header.id, { value: createdSecretId });
            }
          });
        }
      }
      
      // Reset form and close modal
      setNewSecretName("");
      setNewSecretValue("");
      setCreatingSecretForHeaderId(null);
      setShowCreateSecretModal(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create secret.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCreatingSecret(false);
    }
  };

  // Fetch voice name if we have voice_id but no name
  useEffect(() => {
    const fetchVoiceName = async () => {
      if (selectedVoiceId && !selectedVoiceName && voices.length > 0) {
        // First try to find in voices list
        const voice = voices.find(v => v.id === selectedVoiceId);
        if (voice?.name) {
          setSelectedVoiceName(voice.name);
          return;
        }
      }
      
      // If still no name and we have a voice_id, try to fetch from API
      if (selectedVoiceId && !selectedVoiceName) {
        try {
          const response = await voicesApi.get(selectedVoiceId);
          if (response.data?.name) {
            setSelectedVoiceName(response.data.name);
          }
        } catch (err) {
          // Silently fail - voice name is optional
          console.warn('Could not fetch voice name:', err);
        }
      }
    };
    
    fetchVoiceName();
  }, [selectedVoiceId, selectedVoiceName, voices]);

  // Restore voice name when voice tab becomes active
  useEffect(() => {
    if (activeTab === "configuration" && selectedVoiceId && !selectedVoiceName) {
      // First try to find in voices list if it's loaded
      if (voices.length > 0) {
        const voice = voices.find(v => v.id === selectedVoiceId);
        if (voice?.name) {
          setSelectedVoiceName(voice.name);
          return;
        }
      }
      
      // If not found in voices list, try to fetch from API
      const fetchVoiceName = async () => {
        try {
          const response = await voicesApi.get(selectedVoiceId);
          if (response.data?.name) {
            setSelectedVoiceName(response.data.name);
          }
        } catch (err) {
          // Silently fail - voice name is optional
          console.warn('Could not fetch voice name:', err);
        }
      };
      
      fetchVoiceName();
    }
  }, [activeTab, selectedVoiceId, selectedVoiceName, voices]);

  // Handle voice preview playback
  const handlePlayPreview = useCallback((voice: Voice) => {
    if (!voice.preview_url) {
      console.warn('No preview_url for voice:', voice.id, voice);
      toast({
        title: 'Preview unavailable',
        description: 'This voice does not have a preview available.',
        variant: 'destructive',
      });
      return;
    }

    console.log('Playing preview for voice:', voice.id, 'URL:', voice.preview_url);

    // Stop currently playing audio if any
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
      setPlayingVoiceId(null);
    }

    // If clicking the same voice that's playing, just stop it
    if (playingVoiceId === voice.id) {
      setPlayingVoiceId(null);
      return;
    }

    // Create and play new audio
    const audio = new Audio(voice.preview_url);
    currentAudioRef.current = audio;
    setPlayingVoiceId(voice.id || null);

    // Handle when audio ends
    audio.addEventListener('ended', () => {
      console.log('Audio ended for voice:', voice.id);
      setPlayingVoiceId(null);
      currentAudioRef.current = null;
    });

    // Handle errors
    audio.addEventListener('error', (e) => {
      console.error('Audio error for voice:', voice.id, e);
      setPlayingVoiceId(null);
      currentAudioRef.current = null;
      toast({
        title: 'Preview unavailable',
        description: 'Could not play voice preview.',
        variant: 'destructive',
      });
    });

    audio.play().catch((err) => {
      console.error('Error playing preview:', err, 'Voice:', voice.id, 'URL:', voice.preview_url);
      setPlayingVoiceId(null);
      currentAudioRef.current = null;
      toast({
        title: 'Preview unavailable',
        description: 'Could not play voice preview. Please check your browser audio settings.',
        variant: 'destructive',
      });
    });
  }, [playingVoiceId, toast]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);


  // Fetch agent details when ID changes
  const fetchAgentDetails = useCallback(async (agentId: string) => {
    if (isNew) return;
    
    setLoading(true);
    try {
      const response = await agentsApi.get(agentId);
      if (response.data) {
        setAgent(response.data);
        // Extract agent data after setting agent to ensure state is ready
        extractAgentData(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch agent details';
      toast({
        title: 'Error loading agent',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [isNew, extractAgentData, toast]);

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }
    if (id && !isNew) {
      fetchAgentDetails(id);
      fetchAgentFiles(id);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew, fetchAgentDetails, location.pathname]);

  // Fetch agent files
  const fetchAgentFiles = useCallback(async (agentId: string) => {
    try {
      const response = await agentFilesApi.list(agentId);
      if (response.data) {
        setAgentFiles(response.data);
      }
    } catch (err) {
      console.warn('Failed to fetch agent files:', err);
    }
  }, []);

  // Load files when agent changes
  useEffect(() => {
    if (agent?.id && !isNew) {
      fetchAgentFiles(agent.id.toString());
    } else {
      setAgentFiles([]);
    }
  }, [agent?.id, isNew, fetchAgentFiles]);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: File[]) => {
    // For new agents, just add files to attachedFiles state (will be uploaded after save)
    if (isNew || !agent?.id) {
      setAttachedFiles(prev => [...prev, ...files]);
      toast({
        title: 'Files added',
        description: `Added ${files.length} file(s). They will be uploaded when you save the agent.`,
      });
      return;
    }

    const agentId = agent.id.toString();

    for (const file of files) {
      const fileKey = `${file.name}-${Date.now()}`;
      setUploadingFiles(prev => new Set(prev).add(fileKey));

      try {
        // Get presigned URL
        const presignedResponse = await awsS3Api.getPresignedUrl(
          file.name,
          file.type || 'application/octet-stream',
          fileKey
        );

        if (!presignedResponse.data) {
          throw new Error('Failed to get presigned URL');
        }

        // Upload to S3
        const uploadResponse = await fetch(presignedResponse.data.url, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file to S3');
        }

        // Associate file with agent and sync to ElevenLabs
        const associateResponse = await agentFilesApi.createAndSync(agentId.toString(), {
          s3_key: presignedResponse.data.key,
          s3_url: presignedResponse.data.public_url,
          file_name: file.name,
          file_size: file.size,
          content_type: file.type || 'application/octet-stream',
        });

        if (associateResponse.data) {
          setAgentFiles(prev => [...prev, associateResponse.data!]);
          toast({
            title: 'Success',
            description: `File "${file.name}" uploaded and synced with ElevenLabs successfully.`,
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
        toast({
          title: 'Error',
          description: `Failed to upload "${file.name}": ${errorMessage}`,
          variant: 'destructive',
        });
      } finally {
        setUploadingFiles(prev => {
          const next = new Set(prev);
          next.delete(fileKey);
          return next;
        });
      }
    }
  }, [agent?.id, isNew, toast]);

  // Handle file deletion
  const handleFileDelete = useCallback(async (fileId: number) => {
    if (!agent?.id) return;

    try {
      await agentFilesApi.delete(agent.id.toString(), fileId);
      setAgentFiles(prev => prev.filter(f => f.id !== fileId));
      toast({
        title: 'Success',
        description: 'File removed successfully.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete file';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [agent?.id, toast]);

  // Fetch all available files for selection
  const fetchAllAvailableFiles = useCallback(async () => {
    setLoadingAvailableFiles(true);
    try {
      const response = await agentFilesApi.listAll();
      if (response.data) {
        setAllAvailableFiles(response.data);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load available files',
        variant: 'destructive',
      });
    } finally {
      setLoadingAvailableFiles(false);
    }
  }, [toast]);

  // Handle selecting existing file
  const handleSelectExistingFile = useCallback(async (file: AgentFile, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (assigningFile) return; // Prevent multiple clicks
    
    if (isNew || !agent?.id) {
      // For new agents, we can't assign yet - show message
      toast({
        title: 'Info',
        description: 'Please save the agent first, then you can assign existing files.',
      });
      return;
    }

    setAssigningFile(true);
    try {
      const agentId = agent.id.toString();
      // Create association using existing file's s3_key
      const associateResponse = await agentFilesApi.createAndSync(agentId, {
        s3_key: file.s3_key,
        s3_url: file.s3_url || '',
        file_name: file.file_name,
        file_size: file.file_size || 0,
        content_type: file.content_type || 'application/octet-stream',
      });

      if (associateResponse.data) {
        setAgentFiles(prev => [...prev, associateResponse.data!]);
        toast({
          title: 'Success',
          description: `File "${file.file_name}" assigned to agent successfully.`,
        });
        // Close the dialog after successful assignment
        setShowChooseFilesDialog(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign file';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setAssigningFile(false);
    }
  }, [agent?.id, isNew, toast, assigningFile]);
  const [widgetApiKey, setWidgetApiKey] = useState<string | null>(null);
  const [widgetKeyLoading, setWidgetKeyLoading] = useState(true);

  const getBackendBaseUrl = useCallback(() => {
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1\/?$/, "");
    }

    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:3000";
    }

    return `${protocol}//${hostname}`;
  }, []);

  const handleOpenWidget = useCallback(async () => {
    if (!agent?.elevenlabs_agent_id) {
      toast({
        title: "Deploy first",
        description: "Publish the agent before previewing the widget.",
        variant: "destructive",
      });
      return;
    }

    if (!widgetApiKey) {
      toast({
        title: "Widget preview unavailable",
        description: "Could not load the widget API key. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    try {
      await loadAndOpenWidget({
        agentId: agent.elevenlabs_agent_id,
        apiKey: widgetApiKey,
        apiBaseUrl: getBackendBaseUrl(),
        title: agent.name || "Need help?",
        subtitle: "Talk to your AI assistant",
        buttonText: "Start a call",
        welcomeMessage: "Hi! How can I help?",
        iconType: "phone",
        position: "bottom-right",
        widgetSize: "medium",
        primaryColor: "#000000",
        primaryTextColor: "#ffffff",
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
        borderColor: "#e5e7eb",
        userBubbleColor: "#f3f4f6",
        agentBubbleColor: "#eff6ff",
        borderRadius: "16px",
      });
    } catch (error) {
      console.error("Failed to open widget preview:", error);
      toast({
        title: "Preview failed",
        description: error instanceof Error ? error.message : "Could not open the widget preview.",
        variant: "destructive",
      });
    }
  }, [agent?.elevenlabs_agent_id, agent?.name, toast, widgetApiKey, getBackendBaseUrl]);

  useEffect(() => {
    let isMounted = true;

    const loadKey = async () => {
      setWidgetKeyLoading(true);
      try {
        const response = await apiKeysApi.list();
        const existingKeys = response.data || [];
        let widgetKey = existingKeys.find((key) => key.name === WIDGET_API_KEY_NAME);

        if (!widgetKey && existingKeys.length > 0) {
          widgetKey = existingKeys[0];
        }

        if (!widgetKey) {
          const createResponse = await apiKeysApi.create({
            name: WIDGET_API_KEY_NAME,
            key_type: "public",
            transient_assistant: false,
          });
          if (createResponse.data) {
            widgetKey = createResponse.data;
            toast({
              title: "API Key Created",
              description: "A widget API key was generated for preview.",
            });
          }
        }

        if (widgetKey && isMounted) {
          setWidgetApiKey(widgetKey.key_value);
        }
      } catch (error) {
        console.error("Failed to fetch widget API key:", error);
        if (isMounted) {
          toast({
            title: "Widget preview unavailable",
            description: "Could not load the widget API key. Please try again later.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setWidgetKeyLoading(false);
        }
      }
    };

    loadKey();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  // Reset all form state when switching between assistants or creating a new one
  useEffect(() => {
    if (isNew) {
      // Reset to default values for new assistant
      setModelExpanded(true);
      setVoiceConfigExpanded(true);
      setAdditionalConfigExpanded(true);
      setTranscriberExpanded(true);
      setBackgroundDenoising(false);
      setConfidenceThreshold([0.4]);
      setKeyterms("");
      setEndOfTurnConfidence([0.7]);
      setEndOfTurnTimeout([5000]);
      setPrivacyExpanded(true);
      setHipaaCompliance(false);
      setAudioRecording(true);
      setLogging(true);
      setTranscript(true);
      setVideoRecording(false);
      // Reset section variables (system prompt is generated from fixed template)
      setCenarios([]);
      setEtapas([]);
      setTomDeVoz([]);
      setFirstMessage("");
      setAttachedFiles([]);
      setSelectedProvider("openai");
      setSelectedModel("gpt-4o-cluster");
      setFirstMessageMode("assistant-speaks-first");
      setShowConfigPanel(false);
      setEditingName(false);
      setTempName("");
      nameInitializedRef.current = false;
      setSystemTools(getDefaultSystemToolsState());
      setSystemToolSettings(getDefaultSystemToolSettings());
      setSystemToolExpanded(getDefaultSystemToolExpanded());
      setFirstMessageExpanded(false);
      setAgentBehaviourExpanded(false);
      setFilesExpanded(false);
      setSystemToolsSectionExpanded(false);
      setExternalIntegrationToolsSectionExpanded(false);
      setIntegrationToolsSectionExpanded(false);
    }
  }, [id, isNew]);

  // Build the complete configuration payload
  const buildConfiguration = useCallback(() => {
    // Build system tools payload in the format the backend expects
    const systemToolsPayload = SYSTEM_TOOL_KEYS.reduce<Record<string, unknown>>((acc, key) => {
      const isActive = systemTools[key];
      const settings = systemToolSettings[key];
      
      const toolData: Record<string, unknown> = {
        active: isActive,
        ...(settings?.description?.trim() ? { description: settings.description.trim() } : {}),
        ...(typeof settings?.disableInterruptions === 'boolean' ? { disable_interruptions: settings.disableInterruptions } : {}),
      };

      if (key === "transfer_to_agent" && isActive) {
        const rules = (settings?.transferRules || []).map(rule => ({
          agent_id: rule.agent, // ElevenLabs expects agent_id, not agent
          ...(rule.condition?.trim() && { condition: rule.condition.trim() }),
          delay_ms: Number.isFinite(rule.delayMs) ? rule.delayMs : 0,
          ...(rule.transferMessage?.trim() && { transfer_message: rule.transferMessage.trim() }),
          enable_first_message: !!rule.enableFirstMessage
        })).filter(rule => rule.agent_id || rule.condition || rule.transfer_message);

        if (rules.length > 0) {
          toolData.params = {
            system_tool_type: "transfer_to_agent",
            transfers: rules,
            voicemail_message: "",
            use_out_of_band_dtmf: false
          };
        }
      }

      if (key === "transfer_to_number" && isActive) {
        const humanRules = (settings?.humanTransferRules || []).map(rule => ({
          transfer_type: rule.transferType,
          destination_type: rule.destinationType,
          phone_number: rule.phoneNumber,
          ...(rule.condition?.trim() && { condition: rule.condition.trim() })
        })).filter(rule => rule.phone_number || rule.condition);

        if (humanRules.length > 0) {
          toolData.params = {
            system_tool_type: "transfer_to_number",
            transfers: humanRules,
            voicemail_message: "",
            use_out_of_band_dtmf: false
          };
        }
      }

      acc[key] = toolData;
      return acc;
    }, {});

    const serializeSectionEntries = (entries: SectionEntry[]): SectionPayload[] =>
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

    const serializedCenarios = serializeSectionEntries(cenarios);
    const serializedEtapas = serializeSectionEntries(etapas);
    const serializedTone = serializeSectionEntries(tomDeVoz);

    const conversationConfig: Record<string, unknown> = {
      model: {
        model: selectedModel,
        provider: selectedProvider,
        messages: [
          {
            role: "system",
            content: derivedSystemPrompt
          }
        ]
      },
      transcriber: {
        provider: "elevenlabs",
        language: selectedLanguage || "english",
        model: "flux-general",
        background_denoising_enabled: backgroundDenoising,
        confidence_threshold: confidenceThreshold[0],
        ...(keyterms && { keyterms: keyterms.split(',').map(k => k.trim()).filter(k => k) }),
        end_of_turn: {
          confidence_threshold: endOfTurnConfidence[0],
          timeout_ms: endOfTurnTimeout[0]
        }
      },
      first_message_mode: firstMessageMode,
      ...(firstMessage && firstMessage.trim() && { first_message: firstMessage.trim() }),
      ...(selectedVoiceId && {
        voice_id: selectedVoiceId
      }),
      ...(selectedVoiceId && {
        voice: {
          voice_id: selectedVoiceId,
          ...(selectedVoiceName && { name: selectedVoiceName })
        }
      }),
      system_prompt: derivedSystemPrompt,
      ...(serializedCenarios.length > 0 && { cenarios: serializedCenarios }),
      ...(serializedEtapas.length > 0 && { etapas: serializedEtapas }),
      ...(serializedTone.length > 0 && { tom_de_voz: serializedTone }),
    };

    const platformSettings: Record<string, unknown> = {
      ...(selectedVoiceId && { voice_id: selectedVoiceId }),
      language: selectedLanguage || "english"
    };

    const privacySettings: Record<string, unknown> = {
      hipaa_compliance: hipaaCompliance,
      audio_recording: audioRecording,
      logging: logging,
      transcript: transcript,
      video_recording: videoRecording
    };

    // Build client tools payload for ElevenLabs sync
    const clientToolsPayload = clientTools.map(tool => ({
      id: tool.id,
      type: "client",
      name: tool.name,
      description: tool.description,
      wait_for_response: tool.waitForResponse,
      disable_interruptions: tool.disableInterruptions,
      pre_tool_speech: tool.preToolSpeech,
      execution_mode: tool.executionMode,
      parameters: tool.parameters.map(param => ({
        id: param.id,
        data_type: param.dataType,
        identifier: param.identifier,
        required: param.required,
        value_type: param.valueType,
        description: param.description,
        enum_values: param.enumValues.length > 0 ? param.enumValues : undefined
      })),
      dynamic_variable_assignments: tool.dynamicVariableAssignments.map(a => ({
        variable_name: a.variableName,
        is_new_variable: a.isNewVariable,
        json_path: a.jsonPath
      }))
    }));

    // Build webhook tools payload for ElevenLabs sync
    const webhookToolsPayload = webhookTools.map(tool => ({
      id: tool.id,
      type: "webhook",
      name: tool.name,
      description: tool.description,
      method: tool.method,
      url: tool.url,
      response_timeout: tool.responseTimeout,
      disable_interruptions: tool.disableInterruptions,
      pre_tool_speech: tool.preToolSpeech,
      execution_mode: tool.executionMode,
      tool_call_sound: tool.toolCallSound,
      authentication: tool.authentication || undefined,
      headers: tool.headers.map(h => ({
        type: h.type,
        name: h.name,
        value: h.value
      })),
      query_params: tool.queryParams.map(p => ({
        data_type: p.dataType,
        identifier: p.identifier,
        required: p.required,
        value_type: p.valueType,
        description: p.description,
        enum_values: p.enumValues.length > 0 ? p.enumValues : undefined
      })),
      dynamic_variable_assignments: tool.dynamicVariableAssignments.map(a => ({
        variable_name: a.variableName,
        is_new_variable: a.isNewVariable,
        json_path: a.jsonPath
      }))
    }));

    return {
      conversation_config: {
        ...conversationConfig,
        ...privacySettings
      },
      platform_settings: platformSettings,
      system_tools: systemToolsPayload,
      client_tools: clientToolsPayload,
      webhook_tools: webhookToolsPayload,
      integration_tools: Object.fromEntries(
        Object.entries(agentIntegrationTools).map(([key, value]) => [
          key,
          {
            enabled: true, // Always enabled
            enabled_tools: value.enabledTools || []
          }
        ])
      )
    };
  }, [
    selectedModel,
    selectedProvider,
    derivedSystemPrompt,
    cenarios,
    etapas,
    tomDeVoz,
    systemTools,
    systemToolSettings,
    selectedLanguage,
    backgroundDenoising,
    confidenceThreshold,
    keyterms,
    endOfTurnConfidence,
    endOfTurnTimeout,
    firstMessage,
    firstMessageMode,
    selectedVoiceId,
    selectedVoiceName,
    hipaaCompliance,
    audioRecording,
    logging,
    transcript,
    videoRecording,
    clientTools,
    webhookTools,
    agentIntegrationTools
  ]);

  // Update saved config when agent loads (only when agent ID changes)
  useEffect(() => {
    if (agent && !isNew && agent.id) {
      // Use a ref to track if we've already saved config for this agent
      const config = buildConfiguration();
      const nameToSave = agent.name || "";
      setSavedConfig({
        name: nameToSave,
        config: JSON.parse(JSON.stringify(config)) // Deep clone
      });
    } else if (isNew) {
      // For new agents, clear saved config
      setSavedConfig(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent?.id, isNew]); // Only update when agent ID changes or when switching to/from new

  // Check if form is valid for new agents (computed value, not a function)
  const isFormValid = useMemo(() => {
    // Use tempName if it exists and is not empty, otherwise fall back to agentName
    const nameToUse = tempName?.trim() || agentName?.trim() || "";
    // Check if name is valid (not empty and not one of the default placeholder values)
    const hasValidName = nameToUse !== "" && 
                        nameToUse !== "New Assistant" && 
                        nameToUse !== "Enter a name for your assistant." &&
                        nameToUse !== "Loading...";
    const hasValidVoice = selectedVoiceId && selectedVoiceId.trim() !== "";
    return hasValidName && hasValidVoice;
  }, [tempName, agentName, selectedVoiceId]);

  // Get missing fields for save button
  const getMissingSaveFields = useMemo(() => {
    if (isNew) {
      const missing: string[] = [];
      const nameToUse = tempName?.trim() || agentName?.trim() || "";
      const hasValidName = nameToUse !== "" && 
                          nameToUse !== "New Assistant" && 
                          nameToUse !== "Enter a name for your assistant." &&
                          nameToUse !== "Loading...";
      
      if (!hasValidName) {
        missing.push("Name");
      }
      if (!selectedVoiceId || selectedVoiceId.trim() === "") {
        missing.push("Voice");
      }
      return missing;
    }
    // For existing agents, if there are no unsaved changes, return empty array
    // (we don't need to show a tooltip for "no changes")
    return [];
  }, [isNew, tempName, agentName, selectedVoiceId]);

  // Check if all required fields are filled for deployment
  const isDeployValid = useMemo(() => {
    const hasLanguage = selectedLanguage && selectedLanguage.trim() !== "";
    const hasModel = selectedModel && selectedModel.trim() !== "";
    const hasFirstMessage = firstMessage && firstMessage.trim() !== "";
    const trimmedPrompt = derivedSystemPrompt.trim();
    const hasSystemPrompt = trimmedPrompt !== "" && trimmedPrompt !== DEFAULT_SYSTEM_PROMPT.trim();
    const hasVoice = selectedVoiceId && selectedVoiceId.trim() !== "";
    return hasLanguage && hasModel && hasFirstMessage && hasSystemPrompt && hasVoice;
  }, [selectedLanguage, selectedModel, firstMessage, derivedSystemPrompt, selectedVoiceId]);

  const previewButtonTitle = widgetKeyLoading
    ? "Loading widget preview..."
    : agent?.elevenlabs_agent_id
      ? "Preview widget"
      : "Deploy the agent before previewing";

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    if (isNew) {
      // For new agents, check if form is valid (all required fields filled)
      return isFormValid;
    }
    
    if (!savedConfig) {
      // No saved config yet, assume no changes
      return false;
    }
    
    // Compare name
    const nameToUse = (tempName && tempName.trim()) || agent?.name || "";
    if (nameToUse !== savedConfig.name) {
      return true;
    }
    
    // Compare configuration
    const currentConfig = buildConfiguration();
    const savedConfigStr = JSON.stringify(savedConfig.config);
    const currentConfigStr = JSON.stringify(currentConfig);
    
    return savedConfigStr !== currentConfigStr;
  }, [isNew, tempName, agent?.name, savedConfig, buildConfiguration, isFormValid]);

  const configJson = agent ? {
    "id": agent.id,
    "name": agent.name || "Unnamed Agent",
    ...buildConfiguration(),
    ...(agent.tags && {
      "tags": agent.tags
    }),
    ...(agent.created_at && {
      "created_at": agent.created_at
    }),
    ...(agent.updated_at && {
      "updated_at": agent.updated_at
    }),
    ...(attachedFiles.length > 0 && {
      "files": attachedFiles.map(file => ({
        "name": file.name,
        "size": file.size,
        "type": file.type
      }))
    })
  } : {
    "id": isNew ? "new" : agentId,
    "name": agentName,
    ...buildConfiguration()
  };

  // Handle save/update
  const handleSave = useCallback(async () => {
    const nameToUse = (tempName && tempName.trim()) || agentName;
    
    if (!nameToUse || nameToUse === "New Assistant" || nameToUse === "Enter a name for your assistant." || nameToUse.trim() === "") {
      toast({
        title: 'Name required',
        description: 'Please provide a name for the assistant.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedVoiceId) {
      toast({
        title: 'Voice required',
        description: 'Please select a voice for the assistant.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const config = buildConfiguration();
      
      if (isNew) {
        // Create new agent
        const response = await agentsApi.create({
          name: nameToUse.trim(),
          ...config
        });
        
        if (response.data) {
          // Upload and sync attached files if any
          if (attachedFiles.length > 0 && response.data.id) {
            const agentId = response.data.id.toString();
            
            for (const file of attachedFiles) {
              const fileKey = `${file.name}-${Date.now()}`;
              setUploadingFiles(prev => new Set(prev).add(fileKey));
              
              try {
                // Get presigned URL
                const presignedResponse = await awsS3Api.getPresignedUrl(
                  file.name,
                  file.type || 'application/octet-stream',
                  fileKey
                );

                if (!presignedResponse.data) {
                  throw new Error('Failed to get presigned URL');
                }

                // Upload to S3
                const uploadResponse = await fetch(presignedResponse.data.url, {
                  method: 'PUT',
                  body: file,
                  headers: {
                    'Content-Type': file.type || 'application/octet-stream',
                  },
                });

                if (!uploadResponse.ok) {
                  throw new Error('Failed to upload file to S3');
                }

                // Create file and sync to ElevenLabs
                await agentFilesApi.createAndSync(agentId, {
                  s3_key: presignedResponse.data.key,
                  s3_url: presignedResponse.data.public_url,
                  file_name: file.name,
                  file_size: file.size,
                  content_type: file.type || 'application/octet-stream',
                });
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
                toast({
                  title: 'Warning',
                  description: `Failed to upload "${file.name}": ${errorMessage}`,
                  variant: 'destructive',
                });
              } finally {
                setUploadingFiles(prev => {
                  const next = new Set(prev);
                  next.delete(fileKey);
                  return next;
                });
              }
            }
            
            // Clear attached files after upload
            setAttachedFiles([]);
          }
          
          toast({
            title: 'Success',
            description: 'Assistant created successfully.',
          });
          // Navigate to the new agent's detail page
          navigate(`/assistants/${response.data.id}`);
        }
      } else if (agent?.id) {
        // Update existing agent
        const response = await agentsApi.update(agent.id, {
          name: nameToUse.trim(),
          ...config
        });
        
        if (response.data) {
          setAgent(response.data);
          extractAgentData(response.data);
          setTempName(""); // Clear temp name after successful save
          // Update saved config after successful save (use the config that was actually saved)
          setSavedConfig({
            name: nameToUse.trim(),
            config: JSON.parse(JSON.stringify(config)) // Deep clone of the config that was saved
          });
          toast({
            title: 'Success',
            description: 'Assistant updated successfully.',
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save assistant';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }, [isNew, agent, agentName, tempName, selectedVoiceId, buildConfiguration, navigate, toast, extractAgentData, attachedFiles]);

  // Handle publish/unpublish
  const handlePublish = useCallback(async () => {
    const nameToUse = (tempName && tempName.trim()) || agentName;
    
    if (!nameToUse || nameToUse === "New Assistant" || nameToUse === "Enter a name for your assistant." || nameToUse.trim() === "") {
      toast({
        title: 'Name required',
        description: 'Please provide a name for the assistant.',
        variant: 'destructive',
      });
      return;
    }

    // Validate all required fields for deployment
    const missingFields: string[] = [];
    if (!selectedLanguage || selectedLanguage.trim() === "") {
      missingFields.push("Language");
    }
    if (!selectedModel || selectedModel.trim() === "") {
      missingFields.push("Model");
    }
    if (!firstMessage || firstMessage.trim() === "") {
      missingFields.push("First Message");
    }
    const trimmedDerivedPrompt = derivedSystemPrompt.trim();
    if (!trimmedDerivedPrompt || trimmedDerivedPrompt === DEFAULT_SYSTEM_PROMPT.trim()) {
      missingFields.push("System Prompt");
    }
    if (!selectedVoiceId || selectedVoiceId.trim() === "") {
      missingFields.push("Voice");
    }

    if (missingFields.length > 0) {
      toast({
        title: 'Missing required fields',
        description: `Please fill in the following fields before deploying: ${missingFields.join(", ")}.`,
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const config = buildConfiguration();
      let agentToPublish = agent;

      // If it's a new agent or not saved yet, save it first
      if (isNew || !agent?.id) {
        const saveResponse = await agentsApi.create({
          name: nameToUse.trim(),
          ...config
        });
        
        if (!saveResponse.data) {
          throw new Error('Failed to save agent before publishing');
        }
        
        agentToPublish = saveResponse.data;
        setAgent(agentToPublish);
        
        // Navigate to the agent's detail page if it was new
        if (isNew) {
          navigate(`/assistants/${agentToPublish.id}`);
        }
      } else {
        // Update existing agent in database first
        const updateResponse = await agentsApi.update(agent.id, {
          name: nameToUse.trim(),
          ...config
        });
        
        if (updateResponse.data) {
          agentToPublish = updateResponse.data;
          setAgent(agentToPublish);
        } else {
          throw new Error('Failed to update agent before deploying');
        }
      }

      // Small delay to ensure database update is committed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Deploy to ElevenLabs (creates a new version)
      const response = await agentsApi.publish(agentToPublish.id);
      if (response.data) {
        setAgent(response.data);
        const version = response.data.version || 1;
        toast({
          title: 'Success',
          description: `Assistant deployed successfully to ElevenLabs (Version ${version}).`,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish assistant';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }, [isNew, agent, agentName, tempName, selectedVoiceId, selectedLanguage, selectedModel, firstMessage, derivedSystemPrompt, buildConfiguration, navigate, toast]);

  // Show wizard for new agents, regular interface for existing agents
  if (isNew) {
    return (
      <div className="flex h-full overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="border-b border-border p-3 md:p-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/assistants")}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl md:text-2xl font-bold">Create New Assistant</h1>
            </div>
          </div>
          <CreateAgentWizard
            onComplete={(agentId) => {
              navigate(`/assistants/${agentId}`);
            }}
            voices={voices}
            loadingVoices={loadingVoices}
            initialData={location.state || undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Assistant Header */}
        <div className="border-b border-border p-3 md:p-4 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3 md:mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/assistants")}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <h1 className="text-xl md:text-2xl font-bold">Loading...</h1>
                </div>
              ) : editingName ? (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={async () => {
                      if (tempName.trim() && tempName.trim() !== agentName) {
                        // Name changed, save it if we have an agent
                        if (agent?.id && !isNew) {
                          try {
                            const response = await agentsApi.update(agent.id, {
                              name: tempName.trim()
                            });
                            if (response.data) {
                              setAgent(response.data);
                            }
                          } catch (err) {
                            // If save fails, revert to original name
                            setTempName(agentName);
                            toast({
                              title: 'Error',
                              description: err instanceof Error ? err.message : 'Failed to update name',
                              variant: 'destructive',
                            });
                          }
                        }
                        setEditingName(false);
                      } else if (!tempName.trim()) {
                        setTempName(agentName);
                        setEditingName(false);
                      } else {
                        setEditingName(false);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                      } else if (e.key === 'Escape') {
                        setTempName(agentName);
                        setEditingName(false);
                      }
                    }}
                    className="text-xl md:text-2xl font-bold h-auto py-1 px-2"
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  onClick={() => {
                    // When clicking to edit, use tempName if it's a valid name, otherwise use agentName
                    // But if tempName is a placeholder, start with empty string so user can type fresh
                    const currentName = tempName?.trim() || "";
                    const nameToEdit = (currentName && 
                                       currentName !== "New Assistant" && 
                                       currentName !== "Enter a name for your assistant." &&
                                       currentName !== "Loading...") 
                                      ? currentName 
                                      : "";
                    setTempName(nameToEdit);
                    setEditingName(true);
                  }}
                  className="text-left w-full"
                >
                  <h1 className="text-xl md:text-2xl font-bold truncate hover:opacity-80 transition-opacity">
                    {(tempName?.trim() && 
                      tempName !== "New Assistant" && 
                      tempName !== "Enter a name for your assistant." &&
                      tempName !== "Loading...") 
                      ? tempName 
                      : agentName}
                  </h1>
                </button>
              )}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* <Button 
                variant={showConfigPanel ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowConfigPanel(!showConfigPanel)}
                className="text-xs md:text-sm"
              >
                <Code className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden sm:inline">Code</span>
              </Button> */}
              <Button 
                variant="accent" 
                size="sm"
                onClick={handleOpenWidget}
                disabled={widgetKeyLoading}
                title={previewButtonTitle}
                className="text-xs md:text-sm"
              >
                <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden sm:inline">Preview</span>
                <span className="sm:hidden">Call</span>
              </Button>
              {agent?.published ? (
                <Button 
                  variant="subtle" 
                  size="sm" 
                  className="text-xs md:text-sm text-success"
                  disabled
                >
                  <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                  <span className="hidden sm:inline">
                    Deployed {agent.version ? `v${agent.version}` : ''}
                  </span>
                  <span className="sm:hidden">
                    {agent.version ? `v${agent.version}` : 'Deployed'}
                  </span>
              </Button>
              ) : (
                <Button 
                  variant="subtle" 
                  size="sm" 
                  className="text-xs md:text-sm text-muted-foreground"
                  disabled
                >
                  <span className="hidden sm:inline">Not Deployed</span>
                  <span className="sm:hidden">Not Deployed</span>
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPromptPreviewModal(true)}
                className="text-xs md:text-sm"
                title="View full prompt (template + variables) and associated tools"
              >
                <Code className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden sm:inline">Summary</span>
                <span className="sm:hidden">Summary</span>
              </Button> */}
              {!saving && !loading && (isNew ? !isFormValid : !hasUnsavedChanges()) && getMissingSaveFields.length > 0 ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-block">
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={handleSave}
                        disabled={true}
                        className="text-xs md:text-sm"
                      >
                        <span className="hidden sm:inline">{isNew ? 'Create' : 'Save'}</span>
                        <span className="sm:hidden">{isNew ? 'Create' : 'Save'}</span>
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Please fill in the following fields: {getMissingSaveFields.join(", ")}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleSave}
                  disabled={saving || loading || (isNew ? !isFormValid : !hasUnsavedChanges())}
                  className="text-xs md:text-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2 animate-spin" />
                      <span className="hidden sm:inline">Saving...</span>
                      <span className="sm:hidden">Save</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">{isNew ? 'Create' : 'Save'}</span>
                      <span className="sm:hidden">{isNew ? 'Create' : 'Save'}</span>
                    </>
                  )}
                </Button>
              )}
              {!isNew && agent?.id && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handlePublish}
                  disabled={saving || loading || !isDeployValid}
                  className="text-xs md:text-sm"
                  title={!isDeployValid ? "Please fill in all required fields (Language, Model, First Message, System Prompt, Voice) to deploy" : "Deploy agent to ElevenLabs (creates a new version)"}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2 animate-spin" />
                      <span className="hidden sm:inline">Deploying...</span>
                      <span className="sm:hidden">Deploy</span>
                    </>
                  ) : (
                    <>
                      <Globe className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                      <span className="hidden sm:inline">Deploy</span>
                      <span className="sm:hidden">Deploy</span>
                    </>
                  )}
                </Button>
              )}
              {isNew && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handlePublish}
                  disabled={saving || loading || !isDeployValid}
                  className="text-xs md:text-sm"
                  title={!isDeployValid ? "Please fill in all required fields (Language, Model, First Message, System Prompt, Voice) to deploy" : "Save and deploy agent to ElevenLabs"}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2 animate-spin" />
                      <span className="hidden sm:inline">Deploying...</span>
                      <span className="sm:hidden">Deploy</span>
                    </>
                  ) : (
                    <>
                      <Globe className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                      <span className="hidden sm:inline">Save & Deploy</span>
                      <span className="sm:hidden">Deploy</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-3 md:mt-4 overflow-x-auto scrollbar-hide -mx-3 md:mx-0 px-3 md:px-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const handleTabClick = () => {
                setActiveTab(tab.id);
                // Update URL directly in click handler to avoid useEffect loops
                lastSetTabRef.current = tab.id;
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set("tab", tab.id);
                setSearchParams(newSearchParams, { replace: true });
              };
              return (
                <button
                  key={tab.id}
                  onClick={handleTabClick}
                  className={cn(
                    "flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-colors flex-shrink-0",
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content with optional config panel */}
        <div className="flex-1 flex overflow-hidden min-w-0 relative">
          {/* Tab Content - I'll include the key sections, but you can add the rest from the original file */}
          {activeTab === "widget" ? (
            <WidgetTab agent={agent} agentId={agentId} />
          ) : activeTab === "conversations" ? (
            <ConversationsTab assistantName={agentName} agentId={agent?.id} />
          ) : activeTab === "phone-numbers" ? (
            <PhoneNumbersTab agent={agent} agentId={agentId} />
          ) : activeTab === "tools" ? (
            <div className="flex-1 flex overflow-hidden min-w-0">
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="space-y-6">
                  <TabSectionHeader icon={Wrench} label="TOOLS" />
                
                {/* System Tools */}
                <TabSectionCard
                  title="System tools"
                  description="Allow the agent to perform built-in actions."
                  count={`${Object.values(systemTools).filter(Boolean).length} active tool${Object.values(systemTools).filter(Boolean).length !== 1 ? 's' : ''}`}
                  collapsible
                  expanded={systemToolsSectionExpanded}
                  onToggle={() => setSystemToolsSectionExpanded(!systemToolsSectionExpanded)}
                >
                  <div className="space-y-3">
                    {/* End call */}
                    <div className="border border-border rounded-lg">
                      <div className="flex items-center justify-between p-3 bg-secondary/50">
                        <div className="flex items-center gap-3 flex-1">
                          <Settings className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">End call</span>
                        </div>
                        <Switch
                          checked={systemTools.end_call}
                          onCheckedChange={(checked) => handleSystemToolToggle("end_call", checked)}
                        />
                      </div>
                    </div>
                    {/* Detect language */}
                    <div className="border border-border rounded-lg">
                      <div className="flex items-center justify-between p-3 bg-secondary/50">
                        <div className="flex items-center gap-3 flex-1">
                          <Settings className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Detect language</span>
                        </div>
                        <Switch
                          checked={systemTools.detect_language}
                          onCheckedChange={(checked) => handleSystemToolToggle("detect_language", checked)}
                        />
                      </div>
                    </div>
                    {/* Transfer to agent */}
                    <div className="border border-border rounded-lg">
                      <div className="flex items-center justify-between p-3 bg-secondary/50">
                        <div className="flex items-center gap-3 flex-1">
                          <Settings className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Transfer to agent</span>
                        </div>
                        <Switch
                          checked={systemTools.transfer_to_agent}
                          onCheckedChange={(checked) => handleSystemToolToggle("transfer_to_agent", checked)}
                        />
                      </div>
                    </div>
                    {/* Transfer to number */}
                    <div className="border border-border rounded-lg">
                      <div className="flex items-center justify-between p-3 bg-secondary/50">
                        <div className="flex items-center gap-3 flex-1">
                          <Settings className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Transfer to number</span>
                        </div>
                        <Switch
                          checked={systemTools.transfer_to_number}
                          onCheckedChange={(checked) => handleSystemToolToggle("transfer_to_number", checked)}
                        />
                      </div>
                    </div>
                    {/* Voicemail detection */}
                    <div className="border border-border rounded-lg">
                      <div className="flex items-center justify-between p-3 bg-secondary/50">
                        <div className="flex items-center gap-3 flex-1">
                          <Settings className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Voicemail detection</span>
                        </div>
                        <Switch
                          checked={systemTools.voicemail_detection}
                          onCheckedChange={(checked) => handleSystemToolToggle("voicemail_detection", checked)}
                        />
                      </div>
                    </div>
                  </div>
                </TabSectionCard>

                {/* External Integration Tools */}
                <TabSectionCard
                  title="External integration tools"
                  description="Allow the agent to perform client-side and external integrations."
                  count={`${getUserDefinedWebhooks().length + clientTools.length} tool${(getUserDefinedWebhooks().length + clientTools.length) !== 1 ? 's' : ''} configured`}
                  collapsible
                  expanded={externalIntegrationToolsSectionExpanded}
                  onToggle={() => setExternalIntegrationToolsSectionExpanded(!externalIntegrationToolsSectionExpanded)}
                  actionButtons={
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openWebhookModal()}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Webhook Tool
                      </Button>
                    </div>
                  }
                >
                  <div>
                      {/* List existing tools */}
                  {(getUserDefinedWebhooks().length > 0 || clientTools.length > 0) && (
                    <div className="space-y-2">
                      {getUserDefinedWebhooks().map((tool) => (
                        <div key={tool.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border">
                          <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <span className="text-sm font-medium">{tool.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">Webhook</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openWebhookModal(tool)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteWebhookTool(tool.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {clientTools.map((tool) => (
                        <div key={tool.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border">
                          <div className="flex items-center gap-3">
                            <Code className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <span className="text-sm font-medium">{tool.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">Client</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openClientToolModal(tool)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteClientTool(tool.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                    {getUserDefinedWebhooks().length === 0 && clientTools.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No external tools configured yet.</p>
                        <p className="text-xs mt-1">Add webhook or client tools to extend your agent's capabilities.</p>
                      </div>
                    )}
                  </div>
                </TabSectionCard>

                {/* CRM/Scheduling Integration Tools */}
                <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <button 
                      className="flex-1 flex items-start justify-between gap-2"
                      onClick={() => setIntegrationToolsSectionExpanded(!integrationToolsSectionExpanded)}
                    >
                      <div className="text-left flex-1">
                        <h3 className="text-base md:text-lg font-semibold">Integration tools</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Connect your agent to CRM and scheduling integrations. Integration credentials are shared across all your agents.
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {Object.keys(agentIntegrationTools).length} integration{Object.keys(agentIntegrationTools).length !== 1 ? 's' : ''} connected to this agent
                        </p>
                      </div>
                      <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1", integrationToolsSectionExpanded && "rotate-180")} />
                    </button>
                  </div>

                  <div className="flex mt-3 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAddIntegrationModal()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Integration
                    </Button>
                  </div>
                  
                  {integrationToolsSectionExpanded && (
                    <div className="mt-4 md:mt-6">
                      {/* Connected Integrations */}
                  {Object.keys(agentIntegrationTools).length > 0 ? (
                    <div className="space-y-3">
                      {Object.keys(agentIntegrationTools).map((integrationType) => {
                        const availableTools = getAvailableToolsForIntegration(integrationType);
                        const enabledTools = agentIntegrationTools[integrationType]?.enabledTools || availableTools;
                        const isExpanded = integrationToolsExpanded[integrationType] || false;
                        
                        return (
                          <div key={integrationType} className="border border-border rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between p-3 bg-secondary/50">
                              <div className="flex items-center gap-3 flex-1">
                                <span className="text-xl">{getIntegrationIcon(integrationType)}</span>
                                <div>
                                  <span className="text-sm font-medium">{formatToolName(integrationType)}</span>
                                  <span className="text-xs text-success ml-2">Connected & Active</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => openEditIntegrationModal(integrationType)}
                                  title="Edit credentials"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => toggleIntegrationToolsExpanded(integrationType)}
                                >
                                  <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                                </Button>
                              </div>
                            </div>
                            
                            {isExpanded && (
                              <div className="p-4 border-t border-border space-y-3">
                                <p className="text-xs text-muted-foreground mb-3">
                                  All tools are enabled for this integration:
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  {availableTools.map((toolName) => (
                                    <div
                                      key={toolName}
                                      className="flex items-center gap-2 p-2 rounded-md bg-secondary/30"
                                    >
                                      <Check className="h-4 w-4 text-success" />
                                      <span className="text-sm">{formatToolName(toolName)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                          <p className="text-sm">No integrations connected yet.</p>
                          <p className="text-xs mt-1">Click "Add Integration" to connect your CRM or scheduling tools.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                </div>
              </div>

              {/* System Tool Settings Right Panel */}
              {selectedSystemTool && (
                <>
                  {isMobile ? (
                    <>
                      <div 
                        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                        onClick={() => setSelectedSystemTool(null)}
                      />
                      <div className="fixed inset-x-0 bottom-0 top-1/4 bg-card border-t border-border z-50 flex flex-col rounded-t-lg">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                          <h3 className="font-semibold text-sm md:text-base">
                            {selectedSystemTool === "transfer_to_agent" ? "Transfer to Agent Settings" : "Transfer to Number Settings"}
                          </h3>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedSystemTool(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="p-4 flex-1 overflow-auto">
                          {selectedSystemTool === "transfer_to_agent" && (
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium mb-2 block">Transfer Rules</label>
                                {(systemToolSettings.transfer_to_agent?.transferRules || []).map((rule, index) => (
                                  <div key={index} className="border border-border rounded-lg p-4 mb-4 space-y-3">
                                    <div>
                                      <label className="text-xs text-muted-foreground mb-1 block">Agent</label>
                                      <Input
                                        value={rule.agent}
                                        onChange={(e) => updateTransferRule(index, { agent: e.target.value })}
                                        placeholder="Agent name or ID"
                                        className="bg-white border-border"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-muted-foreground mb-1 block">Condition</label>
                                      <Input
                                        value={rule.condition}
                                        onChange={(e) => updateTransferRule(index, { condition: e.target.value })}
                                        placeholder="Transfer condition"
                                        className="bg-white border-border"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-muted-foreground mb-1 block">Delay (ms)</label>
                                      <Input
                                        type="number"
                                        value={rule.delayMs}
                                        onChange={(e) => updateTransferRule(index, { delayMs: parseInt(e.target.value) || 0 })}
                                        className="bg-white border-border"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-muted-foreground mb-1 block">Transfer Message</label>
                                      <Textarea
                                        value={rule.transferMessage}
                                        onChange={(e) => updateTransferRule(index, { transferMessage: e.target.value })}
                                        placeholder="Message to play before transfer"
                                        className="bg-white border-border min-h-[60px]"
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={rule.enableFirstMessage}
                                        onChange={(e) => updateTransferRule(index, { enableFirstMessage: e.target.checked })}
                                        className="rounded"
                                      />
                                      <label className="text-xs text-muted-foreground">Enable first message</label>
                                    </div>
                                    {(systemToolSettings.transfer_to_agent?.transferRules || []).length > 1 && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeTransferRule(index)}
                                        className="w-full text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remove Rule
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={addTransferRule}
                                  className="w-full"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Transfer Rule
                                </Button>
                              </div>
                            </div>
                          )}
                          {selectedSystemTool === "transfer_to_number" && (
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium mb-2 block">Human Transfer Rules</label>
                                {(systemToolSettings.transfer_to_number?.humanTransferRules || []).map((rule, index) => (
                                  <div key={index} className="border border-border rounded-lg p-4 mb-4 space-y-3">
                                    <div>
                                      <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
                                      <Input
                                        value={rule.phoneNumber}
                                        onChange={(e) => updateHumanTransferRule(index, { phoneNumber: e.target.value })}
                                        placeholder="+1234567890"
                                        className="bg-white border-border"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-muted-foreground mb-1 block">Condition</label>
                                      <Input
                                        value={rule.condition}
                                        onChange={(e) => updateHumanTransferRule(index, { condition: e.target.value })}
                                        placeholder="Transfer condition"
                                        className="bg-white border-border"
                                      />
                                    </div>
                                    {(systemToolSettings.transfer_to_number?.humanTransferRules || []).length > 1 && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeHumanTransferRule(index)}
                                        className="w-full text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remove Rule
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={addHumanTransferRule}
                                  className="w-full"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Transfer Rule
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-[450px] border-l border-border flex flex-col bg-card">
                      <div className="flex items-center justify-between p-4 border-b border-border">
                        <h3 className="font-semibold">
                          {selectedSystemTool === "transfer_to_agent" ? "Transfer to Agent Settings" : "Transfer to Number Settings"}
                        </h3>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedSystemTool(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-4 flex-1 overflow-auto">
                        {selectedSystemTool === "transfer_to_agent" && (
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Transfer Rules</label>
                              {(systemToolSettings.transfer_to_agent?.transferRules || []).map((rule, index) => (
                                <div key={index} className="border border-border rounded-lg p-4 mb-4 space-y-3">
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Agent</label>
                                    <Input
                                      value={rule.agent}
                                      onChange={(e) => updateTransferRule(index, { agent: e.target.value })}
                                      placeholder="Agent name or ID"
                                      className="bg-white border-border"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Condition</label>
                                    <Input
                                      value={rule.condition}
                                      onChange={(e) => updateTransferRule(index, { condition: e.target.value })}
                                      placeholder="Transfer condition"
                                      className="bg-white border-border"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Delay (ms)</label>
                                    <Input
                                      type="number"
                                      value={rule.delayMs}
                                      onChange={(e) => updateTransferRule(index, { delayMs: parseInt(e.target.value) || 0 })}
                                      className="bg-white border-border"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Transfer Message</label>
                                    <Textarea
                                      value={rule.transferMessage}
                                      onChange={(e) => updateTransferRule(index, { transferMessage: e.target.value })}
                                      placeholder="Message to play before transfer"
                                      className="bg-white border-border min-h-[60px]"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={rule.enableFirstMessage}
                                      onChange={(e) => updateTransferRule(index, { enableFirstMessage: e.target.checked })}
                                      className="rounded"
                                    />
                                    <label className="text-xs text-muted-foreground">Enable first message</label>
                                  </div>
                                  {(systemToolSettings.transfer_to_agent?.transferRules || []).length > 1 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeTransferRule(index)}
                                      className="w-full text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Remove Rule
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={addTransferRule}
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Transfer Rule
                              </Button>
                            </div>
                          </div>
                        )}
                        {selectedSystemTool === "transfer_to_number" && (
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Human Transfer Rules</label>
                              {(systemToolSettings.transfer_to_number?.humanTransferRules || []).map((rule, index) => (
                                <div key={index} className="border border-border rounded-lg p-4 mb-4 space-y-3">
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
                                    <Input
                                      value={rule.phoneNumber}
                                      onChange={(e) => updateHumanTransferRule(index, { phoneNumber: e.target.value })}
                                      placeholder="+1234567890"
                                      className="bg-white border-border"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Condition</label>
                                    <Input
                                      value={rule.condition}
                                      onChange={(e) => updateHumanTransferRule(index, { condition: e.target.value })}
                                      placeholder="Transfer condition"
                                      className="bg-white border-border"
                                    />
                                  </div>
                                  {(systemToolSettings.transfer_to_number?.humanTransferRules || []).length > 1 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeHumanTransferRule(index)}
                                      className="w-full text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Remove Rule
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={addHumanTransferRule}
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Transfer Rule
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : activeTab === "configuration" ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Cost & Latency Indicators */}
              <CostAndLatency
                cost={{
                  value: "~$0.14",
                  unit: "/min",
                  segments: [
                    {
                      className: "h-2 flex-1 rounded-full bg-success",
                      tooltip: { label: "Hosting", value: "Cost (USD): 0.05" }
                    },
                    {
                      className: "h-2 w-8 rounded-full bg-warning",
                      tooltip: { label: "Transcribe", value: "Cost (USD): 0.02" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-destructive/60",
                      tooltip: { label: "Model", value: "Cost (USD): 0.04" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-muted",
                      tooltip: { label: "Voice", value: "Cost (USD): 0.03" }
                    }
                  ]
                }}
                latency={{
                  value: "~1050",
                  unit: "ms",
                  segments: [
                    {
                      className: "h-2 flex-1 rounded-full bg-success",
                      tooltip: { label: "Transcriber", value: "Latency (ms): 150" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-primary",
                      tooltip: { label: "Model", value: "Latency (ms): 400" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-warning",
                      tooltip: { label: "Voice", value: "Latency (ms): 300" }
                    },
                    {
                      className: "h-2 w-12 rounded-full bg-destructive/60",
                      tooltip: { label: "Transport", value: "Latency (ms): 200" }
                    }
                  ]
                }}
              />

              <div className="space-y-6">
                {/* Model Section */}
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                    <Code className="h-4 w-4" />
                    <span>MODEL</span>
                  </div>
                  
                  <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                    <button 
                      className="w-full flex items-start justify-between gap-2"
                      onClick={() => setModelExpanded(!modelExpanded)}
                    >
                      <div className="text-left flex-1">
                        <h3 className="text-base md:text-lg font-semibold">Model</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">Configure the behavior of the assistant.</p>
                      </div>
                      <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1", modelExpanded && "rotate-180")} />
                    </button>
                    
                    {modelExpanded && (
                      <div className="mt-4 md:mt-6 space-y-4">
                        {/* Provider and Model in same row */}
                        <div className="flex flex-col md:flex-row gap-4">
                        {/* Provider */}
                          <div className="flex-1">
                          <label className="text-sm text-muted-foreground mb-2 block">Provider</label>
                          <Select 
                            value={selectedProvider || 'openai'} 
                            onValueChange={(value) => {
                                setSelectedProvider(value);
                                const models = modelsByProvider[value];
                                if (models && models.length > 0) {
                                  setSelectedModel(models[0].value);
                              }
                            }}
                          >
                            <SelectTrigger className="bg-white border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {providers.map((provider) => (
                                <SelectItem key={provider.value} value={provider.value}>
                                  <span className="flex items-center gap-2">
                                    <span>{provider.icon}</span>
                                    <span>{provider.label}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Model */}
                          <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <label className="text-sm text-muted-foreground">Model</label>
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <Select 
                            value={selectedModel} 
                            onValueChange={setSelectedModel}
                          >
                            <SelectTrigger className="bg-white border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {modelsByProvider[selectedProvider]?.map((model) => (
                                <SelectItem key={model.value} value={model.value}>
                                  {model.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Voice Section */}
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                    <AudioLines className="h-4 w-4" />
                    <span>VOICE</span>
                  </div>
                  
                  {/* Voice Configuration */}
                  <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                    <button 
                      className="w-full flex items-start justify-between gap-2"
                      onClick={() => setVoiceConfigExpanded(!voiceConfigExpanded)}
                    >
                      <div className="text-left flex-1">
                        <h3 className="text-base md:text-lg font-semibold">Voice Configuration</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">Select a voice from the list, or sync your voice library if it's missing. If errors persist, enable custom voice and add a voice ID.</p>
                      </div>
                      <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1", voiceConfigExpanded && "rotate-180")} />
                    </button>
                    
                    {voiceConfigExpanded && (
                      <div className="mt-4 md:mt-6 space-y-4">
                        <div>
                          <label className="text-sm text-muted-foreground mb-2 block">Voice</label>
                          {loadingVoices ? (
                            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-md border border-border">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Loading voices...</span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-between bg-white border-border"
                                onClick={() => setShowVoiceSelector(true)}
                              >
                                <span className="truncate">
                                  {selectedVoiceName || selectedVoiceId || "Select a voice"}
                                </span>
                                <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                              </Button>
                              {selectedVoiceId && selectedVoiceName && (
                                <p className="text-xs text-muted-foreground">
                                  Selected: {selectedVoiceName} ({selectedVoiceId})
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transcriber Section */}
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                    <Mic className="h-4 w-4" />
                    <span>TRANSCRIBER</span>
                  </div>
                
                <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                  <button 
                    className="w-full flex items-start justify-between gap-2"
                    onClick={() => setTranscriberExpanded(!transcriberExpanded)}
                  >
                    <div className="text-left flex-1">
                      <h3 className="text-base md:text-lg font-semibold">Transcriber</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">This section allows you to configure the transcription settings for the assistant.</p>
                    </div>
                    <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1", transcriberExpanded && "rotate-180")} />
                  </button>
                  
                  {transcriberExpanded && (
                    <div className="mt-4 md:mt-6 space-y-4 md:space-y-6">
                      {/* Language */}
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Language</label>
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                          <SelectTrigger className="bg-white border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="spanish">Spanish</SelectItem>
                            <SelectItem value="french">French</SelectItem>
                            <SelectItem value="german">German</SelectItem>
                            <SelectItem value="italian">Italian</SelectItem>
                            <SelectItem value="portuguese">Portuguese</SelectItem>
                            <SelectItem value="polish">Polish</SelectItem>
                            <SelectItem value="turkish">Turkish</SelectItem>
                            <SelectItem value="russian">Russian</SelectItem>
                            <SelectItem value="dutch">Dutch</SelectItem>
                            <SelectItem value="czech">Czech</SelectItem>
                            <SelectItem value="arabic">Arabic</SelectItem>
                            <SelectItem value="chinese">Chinese</SelectItem>
                            <SelectItem value="japanese">Japanese</SelectItem>
                            <SelectItem value="hungarian">Hungarian</SelectItem>
                            <SelectItem value="korean">Korean</SelectItem>
                            <SelectItem value="multi">Multi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                    </div>
                  )}
                </div>
                </div>
              </div>
            </div>
          ) : activeTab === "prompt-logic" ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="space-y-6">
                <TabSectionHeader icon={FileText} label="PROMPT LOGIC" />
                
                {/* First Message Configuration */}
                <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                  <button 
                    className="w-full flex items-start justify-between gap-2"
                    onClick={() => setFirstMessageExpanded(!firstMessageExpanded)}
                  >
                    <div className="text-left flex-1">
                      <h3 className="text-base md:text-lg font-semibold">First Message Configuration</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Configure how the assistant initiates conversations
                      </p>
                    </div>
                    <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1", firstMessageExpanded && "rotate-180")} />
                  </button>
                  
                  {firstMessageExpanded && (
                    <div className="mt-4 md:mt-6 space-y-5">
                      {/* First Message Mode */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-sm font-medium">Mode</h4>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <Select value={firstMessageMode} onValueChange={setFirstMessageMode}>
                          <SelectTrigger className="bg-white border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="assistant-speaks-first">Assistant speaks first</SelectItem>
                            <SelectItem value="assistant-waits-for-user">Assistant waits for user</SelectItem>
                            <SelectItem value="assistant-speaks-first-model-generated">Assistant speaks first with model generated message</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* First Message */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Message</h4>
                        <Textarea
                          value={firstMessage}
                          onChange={(e) => setFirstMessage(e.target.value)}
                          placeholder={agentName ? `Hi there, this is ${agentName}...` : "Enter the first message for the assistant..."}
                          className="bg-white border-border min-h-[80px] font-mono text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* System Prompt */}
                <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                  <button 
                    className="w-full flex items-start justify-between gap-2"
                    onClick={() => setAgentBehaviourExpanded(!agentBehaviourExpanded)}
                  >
                    <div className="text-left flex-1">
                      <h3 className="text-base md:text-lg font-semibold">Agent Behaviour</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Define how the assistant should behave by describing the scenarios, etapas, and tom de voz it must handle.
                      </p>
                    </div>
                    <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1", agentBehaviourExpanded && "rotate-180")} />
                  </button>
                  
                  {agentBehaviourExpanded && (
                    <div className="mt-4 md:mt-6 space-y-5">
                      <p className="text-xs text-muted-foreground">
                        Prompt generated automatically based on the sections below.
                      </p>
                      <div className="space-y-5">
                        {renderSectionEditor({
                          title: "Scenarios",
                          description: "List the main scenarios the assistant should cover (e.g., Catálogo, Serviço).",
                          entries: cenarios,
                          sectionType: "scenarios",
                          addLabel: "Add scenario",
                          titlePlaceholder: "Scenario name",
                          descriptionPlaceholder: "Describe what should happen in this scenario",
                          notesPlaceholder: "Optional instructions, edge cases, or requirements",
                          notesLabel: "Optional guidance for this scenario",
                        })}
                        {renderSectionEditor({
                          title: "Phases",
                          description: "Break down the stages or flow steps the assistant should follow.",
                          entries: etapas,
                          sectionType: "phases",
                          addLabel: "Add phase",
                          titlePlaceholder: "Stage name",
                          descriptionPlaceholder: "Explain what happens in this stage",
                          notesPlaceholder: "Optional transition tips or reminders for operators",
                          notesLabel: "Optional flow guidance",
                        })}
                        {renderSectionEditor({
                          title: "Voice Tone",
                          description: "Describe how the assistant should sound, including restrictions or tone preferences.",
                          entries: tomDeVoz,
                          sectionType: "voiceTone",
                          addLabel: "Add tone",
                          titlePlaceholder: "Tone label (e.g., WhatsApp)",
                          descriptionPlaceholder: "Describe the desired tone",
                          notesPlaceholder: "Optional vocabulary restrictions or style notes",
                          notesLabel: "Optional tone rules",
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Files */}
                <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                  <button 
                    className="w-full flex items-start justify-between gap-2"
                    onClick={() => setFilesExpanded(!filesExpanded)}
                  >
                    <div className="text-left flex-1">
                      <h3 className="text-base md:text-lg font-semibold">Files</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Attach files (guides, policies, scripts, templates, etc.) to the assistant to help it answer questions and provide information.
                      </p>
                    </div>
                    <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1", filesExpanded && "rotate-180")} />
                  </button>
                  
                  {filesExpanded && (
                    <div className="mt-4 md:mt-6 space-y-3">
                    {/* Show attached files for new agents (before save) */}
                    {isNew && attachedFiles.length > 0 && (
                      <div className="space-y-2">
                        {attachedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md border border-border"
                          >
                            <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm flex-1 truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
                            </span>
                            <span className="text-xs text-muted-foreground italic">Pending</span>
                            <button
                              onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Show saved agent files for existing agents */}
                    {!isNew && agentFiles.length > 0 && (
                      <div className="space-y-2">
                        {agentFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md border border-border"
                          >
                            <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm flex-1 truncate">{file.file_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : ''}
                            </span>
                            {file.elevenlabs_document_id && (
                              <span className="text-xs text-success">Synced</span>
                            )}
                            <button
                              onClick={() => handleFileDelete(file.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              disabled={uploadingFiles.has(file.file_name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {uploadingFiles.size > 0 && (
                      <div className="space-y-2">
                        {Array.from(uploadingFiles).map((fileKey) => (
                          <div
                            key={fileKey}
                            className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md border border-border opacity-50"
                          >
                            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin flex-shrink-0" />
                            <span className="text-sm flex-1 truncate">{fileKey.split('-').slice(0, -1).join('-')}</span>
                            <span className="text-xs text-muted-foreground">Uploading...</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="space-y-2">
                      <div
                        className="border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer hover:border-muted-foreground/50 border-border"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="flex flex-col items-center text-center">
                          <Upload className="h-5 w-5 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload or drag and drop files
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Supported formats: PDF, TXT, DOCX, MD
                          </p>
                        </div>
                      </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={loadingAvailableFiles || assigningFile || isNew}
                          onClick={() => {
                            if (!loadingAvailableFiles && !assigningFile && !isNew) {
                              fetchAllAvailableFiles();
                              setShowChooseFilesDialog(true);
                            }
                          }}
                        >
                          {loadingAvailableFiles || assigningFile ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {assigningFile ? 'Assigning...' : 'Loading...'}
                            </>
                          ) : (
                            <>
                              <FolderOpen className="h-4 w-4 mr-2" />
                              Choose from existing files
                            </>
                          )}
                        </Button>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      multiple
                      accept=".pdf,.txt,.docx,.md"
                      onChange={(e) => {
                        if (e.target.files) {
                          const newFiles = Array.from(e.target.files);
                          handleFileUpload(newFiles);
                          // Reset input
                          e.target.value = '';
                        }
                      }}
                    />
                    </div>
                  )}
                </div>

               
              </div>
            </div>
          ) : activeTab === "advanced" ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Cost & Latency Indicators */}
              <CostAndLatency
                cost={{
                  value: "~$0.14",
                  unit: "/min",
                  segments: [
                    {
                      className: "h-2 flex-1 rounded-full bg-success",
                      tooltip: { label: "Hosting", value: "Cost (USD): 0.05" }
                    },
                    {
                      className: "h-2 w-8 rounded-full bg-warning",
                      tooltip: { label: "Transcribe", value: "Cost (USD): 0.02" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-destructive/60",
                      tooltip: { label: "Model", value: "Cost (USD): 0.04" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-muted",
                      tooltip: { label: "Voice", value: "Cost (USD): 0.03" }
                    }
                  ]
                }}
                latency={{
                  value: "~1050",
                  unit: "ms",
                  segments: [
                    {
                      className: "h-2 flex-1 rounded-full bg-success",
                      tooltip: { label: "Transcriber", value: "Latency (ms): 150" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-primary",
                      tooltip: { label: "Model", value: "Latency (ms): 400" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-warning",
                      tooltip: { label: "Voice", value: "Latency (ms): 300" }
                    },
                    {
                      className: "h-2 w-12 rounded-full bg-destructive/60",
                      tooltip: { label: "Transport", value: "Latency (ms): 200" }
                    }
                  ]
                }}
              />

              {/* Privacy Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Settings className="h-4 w-4" />
                  <span>PRIVACY</span>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                  <button 
                    className="w-full flex items-start justify-between gap-2"
                    onClick={() => setPrivacyExpanded(!privacyExpanded)}
                  >
                    <div className="text-left flex-1">
                      <h3 className="text-base md:text-lg font-semibold">Privacy</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">This section allows you to configure the privacy settings for the assistant.</p>
                    </div>
                    <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1", privacyExpanded && "rotate-180")} />
                  </button>
                  
                  {privacyExpanded && (
                    <div className="mt-4 md:mt-6">
                      {/* HIPAA Compliance */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Shield className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold">HIPAA Compliance</h4>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              When this is enabled, no logs, recordings, or transcriptions will be stored unless custom storage and credentials are configured.
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={hipaaCompliance}
                          onCheckedChange={setHipaaCompliance}
                        />
                      </div>

                      {/* Audio Recording */}
                      <div className="flex items-start justify-between pt-6 border-t border-border mt-6">
                        <div className="flex items-start gap-3 flex-1">
                          <Mic className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold mb-1">Audio Recording</h4>
                            <p className="text-xs text-muted-foreground">
                              Record the conversation. Disable on this assistant to keep its portion of squad conversations private.
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={audioRecording}
                          onCheckedChange={setAudioRecording}
                        />
                      </div>

                      {/* Logging */}
                      <div className="flex items-start justify-between pt-6 border-t border-border mt-6">
                        <div className="flex items-start gap-3 flex-1">
                          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold mb-1">Logging</h4>
                            <p className="text-xs text-muted-foreground">
                              Enable or disable logging during a call. Disable on this assistant to keep its portion of squad conversations private.
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={logging}
                          onCheckedChange={setLogging}
                        />
                      </div>

                      {/* Transcript */}
                      <div className="flex items-start justify-between pt-6 border-t border-border mt-6">
                        <div className="flex items-start gap-3 flex-1">
                          <Quote className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold mb-1">Transcript</h4>
                            <p className="text-xs text-muted-foreground">
                              Enable or disable transcription during a call. Disable on this assistant to keep its portion of squad conversations private.
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={transcript}
                          onCheckedChange={setTranscript}
                        />
                      </div>

                      {/* Audio Recording Format */}
                      <div className="pt-6 border-t border-border mt-6">
                        <div className="flex items-start gap-3 mb-4">
                          <Music className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold">Audio Recording Format</h4>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Choose the format for call recordings.
                            </p>
                          </div>
                        </div>
                        <Select defaultValue="wav">
                          <SelectTrigger className="bg-secondary/50 border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wav">WAV</SelectItem>
                            <SelectItem value="mp3">MP3</SelectItem>
                            <SelectItem value="ogg">OGG</SelectItem>
                            <SelectItem value="m4a">M4A</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Video Recording */}
                      <div className="flex items-start justify-between pt-6 border-t border-border mt-6">
                        <div className="flex items-start gap-3 flex-1">
                          <Video className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold">Video Recording</h4>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Enable or disable video recording during a web call. This will record the video of your user.
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={videoRecording}
                          onCheckedChange={setVideoRecording}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Cost & Latency Indicators */}
              <CostAndLatency
                cost={{
                  value: "~$0.14",
                  unit: "/min",
                  segments: [
                    {
                      className: "h-2 flex-1 rounded-full bg-success",
                      tooltip: { label: "Hosting", value: "Cost (USD): 0.05" }
                    },
                    {
                      className: "h-2 w-8 rounded-full bg-warning",
                      tooltip: { label: "Transcribe", value: "Cost (USD): 0.02" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-destructive/60",
                      tooltip: { label: "Model", value: "Cost (USD): 0.04" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-muted",
                      tooltip: { label: "Voice", value: "Cost (USD): 0.03" }
                    }
                  ]
                }}
                latency={{
                  value: "~1050",
                  unit: "ms",
                  segments: [
                    {
                      className: "h-2 flex-1 rounded-full bg-success",
                      tooltip: { label: "Transcriber", value: "Latency (ms): 150" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-primary",
                      tooltip: { label: "Model", value: "Latency (ms): 400" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-warning",
                      tooltip: { label: "Voice", value: "Latency (ms): 300" }
                    },
                    {
                      className: "h-2 w-12 rounded-full bg-destructive/60",
                      tooltip: { label: "Transport", value: "Latency (ms): 200" }
                    }
                  ]
                }}
              />

              {/* Model Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Code className="h-4 w-4" />
                  <span>MODEL</span>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                  <button 
                    className="w-full flex items-start justify-between gap-2"
                    onClick={() => setModelExpanded(!modelExpanded)}
                  >
                    <div className="text-left flex-1">
                      <h3 className="text-base md:text-lg font-semibold">Model</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">Configure the behavior of the assistant.</p>
                    </div>
                    <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1", modelExpanded && "rotate-180")} />
                  </button>
                  
                  {modelExpanded && (
                    <div className="mt-4 md:mt-6 space-y-4">
                      {/* Provider and Model in same row */}
                      <div className="flex flex-col md:flex-row gap-4">
                      {/* Provider */}
                        <div className="flex-1">
                        <label className="text-sm text-muted-foreground mb-2 block">Provider</label>
                        <Select 
                          value={selectedProvider || 'openai'} 
                          onValueChange={(value) => {
                              setSelectedProvider(value);
                              const models = modelsByProvider[value];
                              if (models && models.length > 0) {
                                setSelectedModel(models[0].value);
                            }
                          }}
                        >
                          <SelectTrigger className="bg-white border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {providers.map((provider) => (
                              <SelectItem key={provider.value} value={provider.value}>
                                <span className="flex items-center gap-2">
                                  <span>{provider.icon}</span>
                                  <span>{provider.label}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Model */}
                        <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <label className="text-sm text-muted-foreground">Model</label>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <Select 
                          value={selectedModel} 
                          onValueChange={setSelectedModel}
                        >
                          <SelectTrigger className="bg-white border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {modelsByProvider[selectedProvider]?.map((model) => (
                              <SelectItem key={model.value} value={model.value}>
                                {model.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Config JSON Panel */}
          {showConfigPanel && (
            <>
              {isMobile ? (
                <>
                  <div 
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={() => setShowConfigPanel(false)}
                  />
                  <div className="fixed inset-x-0 bottom-0 top-1/4 bg-card border-t border-border z-50 flex flex-col rounded-t-lg">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                      <h3 className="font-semibold text-sm md:text-base">Assistant Configuration</h3>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(configJson, null, 2));
                          }}
                          className="text-xs"
                        >
                          <Copy className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                          <span className="hidden sm:inline">Copy</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setShowConfigPanel(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 flex-1 overflow-auto">
                      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-2">
                        <Code className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        <span>JSON Format</span>
                        <span className="ml-auto">30 lines</span>
                      </div>
                      <pre className="bg-sidebar rounded-lg p-3 md:p-4 text-xs md:text-sm font-mono overflow-x-auto">
                        <code className="text-foreground">
                          {JSON.stringify(configJson, null, 2).split('\n').map((line, i) => (
                            <div key={i} className="flex">
                              <span className="text-muted-foreground w-6 md:w-8 flex-shrink-0 select-none">{i + 1}</span>
                              <span dangerouslySetInnerHTML={{ 
                                __html: line
                                  .replace(/"([^"]+)":/g, '<span class="text-purple-400">"$1"</span>:')
                                  .replace(/: "([^"]+)"/g, ': <span class="text-primary">"$1"</span>')
                              }} />
                            </div>
                          ))}
                        </code>
                      </pre>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-[450px] border-l border-border flex flex-col bg-card">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-semibold">Assistant Configuration</h3>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(configJson, null, 2));
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setShowConfigPanel(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 flex-1 overflow-auto">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Code className="h-4 w-4" />
                      <span>JSON Format</span>
                      <span className="ml-auto">30 lines</span>
                    </div>
                    <pre className="bg-sidebar rounded-lg p-4 text-sm font-mono overflow-x-auto">
                      <code className="text-foreground">
                        {JSON.stringify(configJson, null, 2).split('\n').map((line, i) => (
                          <div key={i} className="flex">
                            <span className="text-muted-foreground w-8 flex-shrink-0 select-none">{i + 1}</span>
                            <span dangerouslySetInnerHTML={{ 
                              __html: line
                                .replace(/"([^"]+)":/g, '<span class="text-purple-400">"$1"</span>:')
                                .replace(/: "([^"]+)"/g, ': <span class="text-primary">"$1"</span>')
                            }} />
                          </div>
                        ))}
                      </code>
                    </pre>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Webhook Tool Modal */}
      <Dialog open={showWebhookModal} onOpenChange={(open) => {
        if (!open) closeWebhookModal();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Link2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>
                  {editingWebhookTool ? "Edit webhook tool" : "Add webhook tool"}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>
          
          {showJsonEditor ? (
            <div className="space-y-4 py-4">
              <Textarea
                value={webhookJsonValue}
                onChange={(e) => setWebhookJsonValue(e.target.value)}
                className="font-mono text-sm min-h-[400px]"
                placeholder="Enter JSON configuration..."
              />
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {/* Configuration Section */}
              <div className="border border-border rounded-lg p-4 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold">Configuration</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Describe to the LLM how and when to use the tool.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Name</label>
                  <Input
                    value={webhookForm.name}
                    onChange={(e) => updateWebhookForm("name", e.target.value)}
                    placeholder="Enter tool name"
                    className="bg-white border-border"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    value={webhookForm.description}
                    onChange={(e) => updateWebhookForm("description", e.target.value)}
                    placeholder="Describe what this tool does and when to use it"
                    className="bg-white border-border min-h-[80px] text-sm"
                  />
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Method</label>
                    <Select
                      value={webhookForm.method}
                      onValueChange={(value: "GET" | "POST" | "PUT" | "DELETE" | "PATCH") => updateWebhookForm("method", value)}
                    >
                      <SelectTrigger className="bg-white border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">URL</label>
                    <Input
                      value={webhookForm.url}
                      onChange={(e) => updateWebhookForm("url", e.target.value)}
                      placeholder="https://api.example.com/endpoint"
                      className="bg-white border-border"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Response timeout (seconds)</label>
                  <p className="text-xs text-muted-foreground mb-3">
                    How long to wait for the client tool to respond before timing out. Default is 20 seconds.
                  </p>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="120"
                      value={webhookForm.responseTimeout}
                      onChange={(e) => updateWebhookForm("responseTimeout", parseInt(e.target.value))}
                      className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="text-sm font-medium w-12 text-right">{webhookForm.responseTimeout}s</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Disable interruptions</div>
                    <p className="text-xs text-muted-foreground">Select this box to disable interruptions while the tool is running.</p>
                  </div>
                  <Switch
                    checked={webhookForm.disableInterruptions}
                    onCheckedChange={(checked) => updateWebhookForm("disableInterruptions", checked)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Pre-tool speech</label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Force agent speech before tool execution or let it decide automatically based on recent execution times.
                  </p>
                  <Select
                    value={webhookForm.preToolSpeech}
                    onValueChange={(value: "auto" | "always" | "never") => updateWebhookForm("preToolSpeech", value)}
                  >
                    <SelectTrigger className="bg-white border-border">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="always">Always speak first</SelectItem>
                      <SelectItem value="never">Never speak first</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Execution mode</label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Determines when and how the tool executes relative to agent speech.
                  </p>
                  <Select
                    value={webhookForm.executionMode}
                    onValueChange={(value: "parallel" | "sequential") => updateWebhookForm("executionMode", value)}
                  >
                    <SelectTrigger className="bg-white border-border">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parallel">Parallel</SelectItem>
                      <SelectItem value="sequential">Sequential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tool call sound</label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Optional sound effect that plays during tool execution.
                  </p>
                  <Select
                    value={webhookForm.toolCallSound}
                    onValueChange={(value: "none" | "beep" | "chime") => updateWebhookForm("toolCallSound", value)}
                  >
                    <SelectTrigger className="bg-white border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="beep">Beep</SelectItem>
                      <SelectItem value="chime">Chime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Authentication</label>
                  <Select
                    value={webhookForm.authentication || "none"}
                    onValueChange={(value) => updateWebhookForm("authentication", value === "none" ? "" : value)}
                  >
                    <SelectTrigger className="bg-white border-border">
                      <SelectValue placeholder="Select auth connection" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="api_key">API Key</SelectItem>
                      <SelectItem value="bearer_token">Bearer Token</SelectItem>
                      <SelectItem value="basic_auth">Basic Auth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Headers Section */}
              <div className="border border-border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Headers</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Define headers that will be sent with the request
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addWebhookHeader}
                  >
                    Add header
                  </Button>
                </div>

                {webhookForm.headers.map((header) => (
                  <div key={header.id} className="border border-border rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-[120px_1fr] gap-3">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Type</label>
                        <Select
                          value={header.type}
                          onValueChange={(value: "secret" | "value") => updateWebhookHeader(header.id, { type: value })}
                        >
                          <SelectTrigger className="bg-white border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="secret">Secret</SelectItem>
                            <SelectItem value="value">Value</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Name</label>
                        <Input
                          value={header.name}
                          onChange={(e) => updateWebhookHeader(header.id, { name: e.target.value })}
                          placeholder="Header name"
                          className="bg-white border-border"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        {header.type === "secret" ? "Secret" : "Value"}
                      </label>
                      {header.type === "secret" ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Input
                                value={header.value ? (secrets.find(s => s.secret_id === header.value)?.name || header.value) : ""}
                                onChange={(e) => {
                                  const inputValue = e.target.value;
                                  // If user types a name that matches a secret, use the secret_id
                                  const matchingSecret = secrets.find(s => s.name === inputValue);
                                  if (matchingSecret) {
                                    updateWebhookHeader(header.id, { value: matchingSecret.secret_id });
                                  } else {
                                    // Otherwise, allow typing (will be validated on blur or when creating)
                                    updateWebhookHeader(header.id, { value: inputValue });
                                  }
                                }}
                                onBlur={(e) => {
                                  const inputValue = e.target.value;
                                  // On blur, if the value is a name, convert it to secret_id
                                  const matchingSecret = secrets.find(s => s.name === inputValue);
                                  if (matchingSecret && header.value !== matchingSecret.secret_id) {
                                    updateWebhookHeader(header.id, { value: matchingSecret.secret_id });
                                  }
                                }}
                                placeholder="Type or select secret"
                                className="bg-white border-border"
                                list={`secret-list-${header.id}`}
                              />
                              <datalist id={`secret-list-${header.id}`}>
                                {secrets.map((secret) => (
                                  <option key={secret.secret_id} value={secret.name}>
                                    {secret.secret_id}
                                  </option>
                                ))}
                              </datalist>
                            </div>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="shrink-0"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[300px] p-0" align="start">
                                <div className="max-h-[300px] overflow-y-auto">
                                  {secretsLoading ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                      Loading secrets...
                                    </div>
                                  ) : secrets.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                      No secrets found
                                    </div>
                                  ) : (
                                    <div className="p-1">
                                      {secrets.map((secret) => (
                                        <button
                                          key={secret.secret_id}
                                          type="button"
                                          className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground flex items-center justify-between"
                                          onClick={() => {
                                            updateWebhookHeader(header.id, { value: secret.secret_id });
                                          }}
                                        >
                                          <div>
                                            <div className="font-medium">{secret.name}</div>
                                            <div className="text-xs text-muted-foreground">{secret.secret_id}</div>
                                          </div>
                                          {header.value === secret.secret_id && (
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                          )}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                  <div className="border-t p-1">
                                    <button
                                      type="button"
                                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-primary font-medium flex items-center gap-2"
                                      onClick={() => {
                                        setCreatingSecretForHeaderId(header.id);
                                        setShowCreateSecretModal(true);
                                      }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                                        <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
                                      </svg>
                                      Create new secret
                                    </button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => fetchSecrets()}
                              disabled={secretsLoading}
                              className="shrink-0"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={`w-4 h-4 ${secretsLoading ? 'animate-spin' : ''}`}>
                                <path fillRule="evenodd" d="M13.836 2.477a.75.75 0 0 1 .75.75v3.182a.75.75 0 0 1-.75.75h-3.182a.75.75 0 0 1 0-1.5h1.37l-.84-.841a4.5 4.5 0 0 0-7.08.932.75.75 0 0 1-1.3-.75 6 6 0 0 1 9.44-1.242l.842.84V3.227a.75.75 0 0 1 .75-.75Zm-.911 7.5A.75.75 0 0 1 13.199 11a6 6 0 0 1-9.44 1.241l-.84-.84v1.371a.75.75 0 0 1-1.5 0V9.591a.75.75 0 0 1 .75-.75h3.182a.75.75 0 0 1 0 1.5h-1.37l.84.84a4.5 4.5 0 0 0 7.08-.932.75.75 0 0 1 1.274.478Z" clipRule="evenodd" />
                              </svg>
                            </Button>
                          </div>
                          {header.value && !secrets.find(s => s.secret_id === header.value || s.name === header.value) && (
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground">
                                Secret "{header.value}" not found.
                              </p>
                              <Button
                                type="button"
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-primary text-xs"
                                onClick={() => {
                                  // Use the displayed value (name) or the stored value (ID)
                                  const secretName = secrets.find(s => s.secret_id === header.value)?.name || header.value;
                                  setNewSecretName(secretName);
                                  setCreatingSecretForHeaderId(header.id);
                                  setShowCreateSecretModal(true);
                                }}
                              >
                                Create it
                              </Button>
                            </div>
                          )}
                          {header.value && secrets.find(s => s.secret_id === header.value) && (
                            <p className="text-xs text-muted-foreground">
                              Secret: <span className="font-medium">{secrets.find(s => s.secret_id === header.value)?.name}</span>
                            </p>
                          )}
                        </div>
                      ) : (
                        <Input
                          value={header.value}
                          onChange={(e) => updateWebhookHeader(header.id, { value: e.target.value })}
                          placeholder="Enter value"
                          className="bg-white border-border"
                        />
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWebhookHeader(header.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Query Parameters Section */}
              <div className="border border-border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Query parameters</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Define parameters that will be collected by the LLM and sent as the query of the request.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addWebhookQueryParam}
                  >
                    Add param
                  </Button>
                </div>

                {webhookForm.queryParams.map((param) => (
                  <div key={param.id} className="border border-border rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-[120px_1fr] gap-3">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Data type</label>
                        <Select
                          value={param.dataType}
                          onValueChange={(value: "string" | "number" | "boolean" | "array" | "object") => 
                            updateWebhookQueryParam(param.id, { dataType: value })
                          }
                        >
                          <SelectTrigger className="bg-white border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">String</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                            <SelectItem value="array">Array</SelectItem>
                            <SelectItem value="object">Object</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Identifier</label>
                        <Input
                          value={param.identifier}
                          onChange={(e) => updateWebhookQueryParam(param.id, { identifier: e.target.value })}
                          placeholder="Parameter name"
                          className="bg-white border-border"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={param.required}
                        onCheckedChange={(checked) => updateWebhookQueryParam(param.id, { required: checked })}
                      />
                      <label className="text-sm font-medium">Required</label>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Value Type</label>
                      <Select
                        value={param.valueType}
                        onValueChange={(value: "llm_prompt" | "static") => 
                          updateWebhookQueryParam(param.id, { valueType: value })
                        }
                      >
                        <SelectTrigger className="bg-white border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="llm_prompt">LLM Prompt</SelectItem>
                          <SelectItem value="static">Static Value</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Description</label>
                      <Textarea
                        value={param.description}
                        onChange={(e) => updateWebhookQueryParam(param.id, { description: e.target.value })}
                        placeholder="Describe how to extract the data from the transcript"
                        className="bg-white border-border min-h-[80px] text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        This field will be passed to the LLM and should describe in detail how to extract the data from the transcript.
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Enum Values (optional)</label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={newEnumValue[param.id] || ""}
                          onChange={(e) => setNewEnumValue(prev => ({ ...prev, [param.id]: e.target.value }))}
                          placeholder="Enter an enum value"
                          className="bg-white border-border flex-1"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addEnumValue(param.id);
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => addEnumValue(param.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {param.enumValues.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {param.enumValues.map((value, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-xs"
                            >
                              {value}
                              <button
                                onClick={() => removeEnumValue(param.id, index)}
                                className="hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Add predefined values that the LLM can select from. If no values are provided, the LLM can use any string value.
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWebhookQueryParam(param.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Variables Section */}
              <div className="border border-border rounded-lg p-4">
                <h4 className="text-sm font-semibold">Dynamic Variables</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Variables in tool parameters will be replaced with actual values when the conversation starts.{" "}
                  <a href="#" className="text-primary hover:underline">Learn more</a>
                </p>
              </div>

              {/* Dynamic Variable Assignments Section */}
              <div className="border border-border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Dynamic Variable Assignments</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Configure which dynamic variables can be updated when this tool returns a response.{" "}
                      <a href="#" className="text-primary hover:underline">Learn more</a>
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addDynamicVariableAssignment}
                  >
                    Add assignment
                  </Button>
                </div>

                {webhookForm.dynamicVariableAssignments.map((assignment) => (
                  <div key={assignment.id} className="border border-border rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Variable Name</label>
                        <div className="flex gap-2">
                          <Input
                            value={assignment.variableName}
                            onChange={(e) => updateDynamicVariableAssignment(assignment.id, { variableName: e.target.value })}
                            placeholder="New variable name"
                            className="bg-white border-border flex-1"
                          />
                          <Select
                            value={assignment.isNewVariable ? "new" : "existing"}
                            onValueChange={(value) => updateDynamicVariableAssignment(assignment.id, { isNewVariable: value === "new" })}
                          >
                            <SelectTrigger className="w-[50px] bg-white border-border">
                              <ChevronDown className="h-4 w-4" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New variable</SelectItem>
                              <SelectItem value="existing">Existing variable</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">JSON Path</label>
                        <Input
                          value={assignment.jsonPath}
                          onChange={(e) => updateDynamicVariableAssignment(assignment.id, { jsonPath: e.target.value })}
                          placeholder="e.g., user.name"
                          className="bg-white border-border"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDynamicVariableAssignment(assignment.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={closeWebhookModal}>
                Cancel
              </Button>
              <Button onClick={saveWebhookTool}>
                {editingWebhookTool ? "Save changes" : "Add tool"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Tool Modal */}
      <Dialog open={showClientToolModal} onOpenChange={(open) => {
        if (!open) closeClientToolModal();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>
                  {editingClientTool ? "Edit client tool" : "Add client tool"}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Configuration Section */}
            <div className="border border-border rounded-lg p-4 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold">Configuration</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Describe to the LLM how and when to use the tool.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  value={clientToolForm.name}
                  onChange={(e) => updateClientToolForm("name", e.target.value)}
                  placeholder="Enter tool name"
                  className="bg-white border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={clientToolForm.description}
                  onChange={(e) => updateClientToolForm("description", e.target.value)}
                  placeholder="Describe what this tool does and when to use it"
                  className="bg-white border-border min-h-[80px] text-sm"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Wait for response</div>
                  <p className="text-xs text-muted-foreground">Select this box to make the agent wait for the tool to finish executing before resuming the conversation.</p>
                </div>
                <Switch
                  checked={clientToolForm.waitForResponse}
                  onCheckedChange={(checked) => updateClientToolForm("waitForResponse", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Disable interruptions</div>
                  <p className="text-xs text-muted-foreground">Select this box to disable interruptions while the tool is running.</p>
                </div>
                <Switch
                  checked={clientToolForm.disableInterruptions}
                  onCheckedChange={(checked) => updateClientToolForm("disableInterruptions", checked)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Pre-tool speech</label>
                <p className="text-xs text-muted-foreground mb-2">
                  Force agent speech before tool execution or let it decide automatically based on recent execution times.
                </p>
                <Select
                  value={clientToolForm.preToolSpeech}
                  onValueChange={(value: "auto" | "always" | "never") => updateClientToolForm("preToolSpeech", value)}
                >
                  <SelectTrigger className="bg-white border-border w-[200px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="always">Always speak first</SelectItem>
                    <SelectItem value="never">Never speak first</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Execution mode</label>
                <p className="text-xs text-muted-foreground mb-2">
                  Determines when and how the tool executes relative to agent speech.
                </p>
                <Select
                  value={clientToolForm.executionMode}
                  onValueChange={(value: "immediate" | "on_turn_end") => updateClientToolForm("executionMode", value)}
                >
                  <SelectTrigger className="bg-white border-border w-[200px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="on_turn_end">On Turn End</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Parameters Section */}
            <div className="border border-border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold">Parameters</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Define the parameters that will be sent with the event.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addClientToolParameter}
                >
                  Add param
                </Button>
              </div>

              {clientToolForm.parameters.map((param) => (
                <div key={param.id} className="border border-border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-[120px_1fr] gap-3">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Data type</label>
                      <Select
                        value={param.dataType}
                        onValueChange={(value: "string" | "number" | "boolean" | "array" | "object") => 
                          updateClientToolParameter(param.id, { dataType: value })
                        }
                      >
                        <SelectTrigger className="bg-white border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="array">Array</SelectItem>
                          <SelectItem value="object">Object</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Identifier</label>
                      <Input
                        value={param.identifier}
                        onChange={(e) => updateClientToolParameter(param.id, { identifier: e.target.value })}
                        placeholder="Parameter name"
                        className="bg-white border-border"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={param.required}
                      onCheckedChange={(checked) => updateClientToolParameter(param.id, { required: checked })}
                    />
                    <label className="text-sm font-medium">Required</label>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Value Type</label>
                    <Select
                      value={param.valueType}
                      onValueChange={(value: "llm_prompt" | "static") => 
                        updateClientToolParameter(param.id, { valueType: value })
                      }
                    >
                      <SelectTrigger className="bg-white border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="llm_prompt">LLM Prompt</SelectItem>
                        <SelectItem value="static">Static Value</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Description</label>
                    <Textarea
                      value={param.description}
                      onChange={(e) => updateClientToolParameter(param.id, { description: e.target.value })}
                      placeholder="Describe how to extract the data from the transcript"
                      className="bg-white border-border min-h-[80px] text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This field will be passed to the LLM and should describe in detail how to extract the data from the transcript.
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Enum Values (optional)</label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={clientParamEnumValue[param.id] || ""}
                        onChange={(e) => setClientParamEnumValue(prev => ({ ...prev, [param.id]: e.target.value }))}
                        placeholder="Enter an enum value"
                        className="bg-white border-border flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addClientParamEnumValue(param.id);
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => addClientParamEnumValue(param.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {param.enumValues.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {param.enumValues.map((value, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-xs"
                          >
                            {value}
                            <button
                              onClick={() => removeClientParamEnumValue(param.id, index)}
                              className="hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Add predefined values that the LLM can select from. If no values are provided, the LLM can use any string value.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeClientToolParameter(param.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Variables Section */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="text-sm font-semibold">Dynamic Variables</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Variables in tool parameters will be replaced with actual values when the conversation starts.{" "}
                <a href="#" className="text-primary hover:underline">Learn more</a>
              </p>
            </div>

            {/* Dynamic Variable Assignments Section */}
            <div className="border border-border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold">Dynamic Variable Assignments</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure which dynamic variables can be updated when this tool returns a response.{" "}
                    <a href="#" className="text-primary hover:underline">Learn more</a>
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addClientDynamicVariableAssignment}
                >
                  Add assignment
                </Button>
              </div>

              {clientToolForm.dynamicVariableAssignments.map((assignment) => (
                <div key={assignment.id} className="border border-border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Variable Name</label>
                      <div className="flex gap-2">
                        <Input
                          value={assignment.variableName}
                          onChange={(e) => updateClientDynamicVariableAssignment(assignment.id, { variableName: e.target.value })}
                          placeholder="New variable name"
                          className="bg-white border-border flex-1"
                        />
                        <Select
                          value={assignment.isNewVariable ? "new" : "existing"}
                          onValueChange={(value) => updateClientDynamicVariableAssignment(assignment.id, { isNewVariable: value === "new" })}
                        >
                          <SelectTrigger className="w-[50px] bg-white border-border">
                            <ChevronDown className="h-4 w-4" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New variable</SelectItem>
                            <SelectItem value="existing">Existing variable</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">JSON Path</label>
                      <Input
                        value={assignment.jsonPath}
                        onChange={(e) => updateClientDynamicVariableAssignment(assignment.id, { jsonPath: e.target.value })}
                        placeholder="e.g., user.name"
                        className="bg-white border-border"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeClientDynamicVariableAssignment(assignment.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={closeClientToolModal}>
                Cancel
              </Button>
              <Button onClick={saveClientTool}>
                {editingClientTool ? "Save changes" : "Add tool"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Secret Modal */}
      <Dialog open={showCreateSecretModal} onOpenChange={(open) => {
        if (!open && !creatingSecret) {
          setShowCreateSecretModal(false);
          setNewSecretName("");
          setNewSecretValue("");
          setCreatingSecretForHeaderId(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Secret</DialogTitle>
            <DialogDescription>
              Create a secret in ElevenLabs to securely store sensitive values like API keys.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Secret Name</label>
              <Input
                value={newSecretName}
                onChange={(e) => setNewSecretName(e.target.value)}
                placeholder="e.g., my_api_key"
                className="bg-white border-border"
                disabled={creatingSecret}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will be the identifier used to reference this secret.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Secret Value</label>
              <Input
                type="password"
                value={newSecretValue}
                onChange={(e) => setNewSecretValue(e.target.value)}
                placeholder="Enter secret value"
                className="bg-white border-border"
                disabled={creatingSecret}
              />
              <p className="text-xs text-muted-foreground mt-1">
                The actual value that will be securely stored.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateSecretModal(false);
                setNewSecretName("");
                setNewSecretValue("");
                setCreatingSecretForHeaderId(null);
              }}
              disabled={creatingSecret}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSecret}
              disabled={creatingSecret || !newSecretName.trim() || !newSecretValue.trim()}
            >
              {creatingSecret ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Secret"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Voice Selector Dialog */}
      <VoiceSelectorDialog
        open={showVoiceSelector}
        onOpenChange={(open) => {
          setShowVoiceSelector(open);
          if (!open) {
            // Reset search query when dialog closes
            setVoiceSearchQuery("");
            // Stop any playing audio
            if (currentAudioRef.current) {
              currentAudioRef.current.pause();
              currentAudioRef.current = null;
              setPlayingVoiceId(null);
            }
          }
        }}
        voices={voices}
        selectedVoiceId={selectedVoiceId || ""}
        onSelectVoice={(voiceId) => {
          setSelectedVoiceId(voiceId);
          const selectedVoice = voices.find(v => v.id === voiceId);
          if (selectedVoice) {
            setSelectedVoiceName(selectedVoice.name || "");
          } else {
            // If voice not found in list, clear the name and try to fetch it
            setSelectedVoiceName("");
            // Try to fetch the voice name from API
            voicesApi.get(voiceId).then((response) => {
              if (response.data?.name) {
                setSelectedVoiceName(response.data.name);
              }
            }).catch(() => {
              // Silently fail
            });
          }
          setShowVoiceSelector(false);
        }}
        playingVoiceId={playingVoiceId}
        onPlayPreview={handlePlayPreview}
        searchQuery={voiceSearchQuery}
        onSearchChange={setVoiceSearchQuery}
      />

      {/* Choose Existing Files Dialog */}
      <Dialog open={showChooseFilesDialog} onOpenChange={(open) => {
        if (!assigningFile) {
          setShowChooseFilesDialog(open);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose from Existing Files</DialogTitle>
            <DialogDescription>
              Select files from your knowledge base to add to this agent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {loadingAvailableFiles ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : allAvailableFiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No files available in your knowledge base.</p>
                <p className="text-sm mt-2">Upload files first to use them here.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {allAvailableFiles
                  .filter(file => {
                    // Filter out files already assigned to this agent
                    if (isNew || !agent?.id) return true;
                    return !agentFiles.some(af => af.s3_key === file.s3_key);
                  })
                  .map((file) => (
                    <div
                      key={file.id}
                      className={cn(
                        "flex items-center gap-3 p-3 bg-card border border-border rounded-lg transition-colors",
                        assigningFile ? "opacity-50 cursor-not-allowed" : "hover:bg-secondary/50 cursor-pointer"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!assigningFile) {
                          handleSelectExistingFile(file, e);
                        }
                      }}
                    >
                      <Paperclip className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium truncate">{file.file_name}</span>
                          {file.elevenlabs_document_id && (
                            <span className="text-xs px-2 py-0.5 bg-success/10 text-success rounded-full">
                              Synced
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {file.file_size && (
                            <span>{file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : ''}</span>
                          )}
                          {file.agent_name ? (
                            <>
                              <span>•</span>
                              <span className="truncate">Used by {file.agent_name}</span>
                            </>
                          ) : (
                            <>
                              <span>•</span>
                              <span className="truncate italic">Unassigned</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={assigningFile}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!assigningFile) {
                            handleSelectExistingFile(file, e);
                          }
                        }}
                      >
                        {assigningFile ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChooseFilesDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Integration Connection Modal */}
      <Dialog open={showIntegrationModal} onOpenChange={(open) => {
        if (!open && !connectingIntegrationLoading) closeIntegrationConnectionModal();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          {integrationModalStep === 'select' ? (
            <>
              <DialogHeader>
                <DialogTitle>Add Integration</DialogTitle>
                <DialogDescription>
                  Choose an integration to connect with your agent.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-3 py-4">
                {availableIntegrationTypes
                  .filter(type => !agentIntegrationTools[type])
                  .map((integrationType) => (
                    <button
                      key={integrationType}
                      type="button"
                      onClick={() => selectIntegrationToAdd(integrationType)}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-left"
                    >
                      <span className="text-2xl">{getIntegrationIcon(integrationType)}</span>
                      <div className="flex-1">
                        <div className="font-medium">{formatToolName(integrationType)}</div>
                        <div className="text-xs text-muted-foreground">{getIntegrationDescription(integrationType)}</div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground -rotate-90" />
                    </button>
                  ))}
                
                {availableIntegrationTypes.filter(type => !agentIntegrationTools[type]).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">All available integrations are already connected to this agent.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {!userIntegrations.some(i => i.type === connectingIntegrationType) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 -ml-2"
                      onClick={goBackToIntegrationSelect}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <span className="text-xl">{connectingIntegrationType ? getIntegrationIcon(connectingIntegrationType) : ''}</span>
                  {userIntegrations.some(i => i.type === connectingIntegrationType) ? 'Edit' : 'Connect'} {connectingIntegrationType ? formatToolName(connectingIntegrationType) : 'Integration'}
                </DialogTitle>
                <DialogDescription>
                  {userIntegrations.some(i => i.type === connectingIntegrationType) 
                    ? 'Update your integration credentials.'
                    : 'Enter your credentials to connect this integration.'}
                </DialogDescription>
              </DialogHeader>
              
              {connectingIntegrationType && integrationSchemas[connectingIntegrationType] && !connectingIntegrationLoading ? (
                <>
                  <Tabs value={integrationModalTab} onValueChange={(value) => setIntegrationModalTab(value as 'credentials' | 'tools' | 'about')} className="w-full">
                    <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 w-full justify-start">
                      <TabsTrigger 
                        value="credentials" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-xs md:text-sm"
                      >
                        Credentials
                      </TabsTrigger>
                      {INTEGRATION_TOOLS_DISPLAY[connectingIntegrationType] && INTEGRATION_TOOLS_DISPLAY[connectingIntegrationType].length > 0 && (
                        <TabsTrigger 
                          value="tools" 
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-xs md:text-sm"
                        >
                          Tools
                        </TabsTrigger>
                      )}
                      <TabsTrigger 
                        value="about" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-xs md:text-sm"
                      >
                        About
                      </TabsTrigger>
                    </TabsList>

                    {/* Credentials Tab */}
                    <TabsContent value="credentials" className="mt-6">
                      <IntegrationForm
                        schema={integrationSchemas[connectingIntegrationType]}
                        initialConfig={editingIntegrationConfig}
                        onSubmit={handleIntegrationConnect}
                        onCancel={closeIntegrationConnectionModal}
                        isLoading={connectingIntegrationLoading}
                        hasSavedValues={userIntegrations.some(i => i.type === connectingIntegrationType)}
                        hideSubmitButton={userIntegrations.some(i => i.type === connectingIntegrationType)}
                      />
                      {userIntegrations.some(i => i.type === connectingIntegrationType) && (
                        <div className="pt-4 border-t border-border flex gap-2">
                          <Button
                            type="button"
                            variant="default"
                            onClick={async () => {
                              const form = document.querySelector('form');
                              if (form) {
                                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                                form.dispatchEvent(submitEvent);
                              }
                            }}
                            disabled={connectingIntegrationLoading}
                            className="flex-1 text-xs md:text-sm"
                          >
                            {connectingIntegrationLoading ? 'Saving...' : 'Save'}
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDeleteIntegration}
                            disabled={connectingIntegrationLoading}
                            className="flex-1 text-xs md:text-sm"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </TabsContent>

                    {/* Tools Tab */}
                    {INTEGRATION_TOOLS_DISPLAY[connectingIntegrationType] && INTEGRATION_TOOLS_DISPLAY[connectingIntegrationType].length > 0 && (
                      <TabsContent value="tools" className="mt-6">
                        <div className="space-y-4">
                          <div className="space-y-2 mb-4">
                            <h2 className="text-sm font-medium">Tools</h2>
                            <p className="text-xs text-muted-foreground">
                              Tools available through your {formatToolName(connectingIntegrationType)} integration.
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                            {INTEGRATION_TOOLS_DISPLAY[connectingIntegrationType].map((tool) => {
                              const metadata = INTEGRATION_METADATA[connectingIntegrationType] || { icon: getIntegrationIcon(connectingIntegrationType), iconBg: "bg-zinc-800" };
                              return (
                                <div
                                  key={tool}
                                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                                >
                                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0", metadata.iconBg)}>
                                    {metadata.icon}
                                  </div>
                                  <span className="text-sm font-medium">{tool}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </TabsContent>
                    )}

                    {/* About Tab */}
                    <TabsContent value="about" className="mt-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h2 className="text-sm font-medium">About</h2>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {getIntegrationFullDescription(connectingIntegrationType)}
                          </p>
                        </div>
                        {INTEGRATION_METADATA[connectingIntegrationType]?.url && (
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => window.open(INTEGRATION_METADATA[connectingIntegrationType].url, '_blank', 'noopener,noreferrer')}
                          >
                            Learn more
                            <ExternalLink className="h-3.5 w-3.5 ml-2" />
                          </Button>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Loading integration configuration...</p>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Section Editor Modal (Scenarios, Phases, Voice Tone) */}
      <Dialog open={showSectionModal} onOpenChange={(open) => {
        if (!open) closeSectionModal();
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                {editingSectionType === "scenarios" && <GitBranch className="h-5 w-5" />}
                {editingSectionType === "phases" && <Clock className="h-5 w-5" />}
                {editingSectionType === "voiceTone" && <AudioLines className="h-5 w-5" />}
              </div>
              <div>
                <DialogTitle>
                  {editingSectionEntry ? "Edit" : "Add"}{" "}
                  {editingSectionType === "scenarios" && "Scenario"}
                  {editingSectionType === "phases" && "Phase"}
                  {editingSectionType === "voiceTone" && "Voice Tone"}
                </DialogTitle>
                <DialogDescription>
                  {editingSectionType === "scenarios" && "Define a scenario the assistant should cover."}
                  {editingSectionType === "phases" && "Define a phase or stage in the conversation flow."}
                  {editingSectionType === "voiceTone" && "Define the tone and voice style for the assistant."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {editingSectionType === "scenarios" && "Scenario name"}
                {editingSectionType === "phases" && "Phase name"}
                {editingSectionType === "voiceTone" && "Tone label"}
              </label>
              <Input
                value={sectionForm.title}
                onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                placeholder={
                  editingSectionType === "scenarios" ? "e.g., Product Inquiry" :
                  editingSectionType === "phases" ? "e.g., Greeting" :
                  "e.g., Professional"
                }
                className="bg-white border-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={sectionForm.description}
                onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                placeholder={
                  editingSectionType === "scenarios" ? "Describe what should happen in this scenario..." :
                  editingSectionType === "phases" ? "Explain what happens in this phase..." :
                  "Describe the desired tone and voice style..."
                }
                className="bg-white border-border min-h-[100px] text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Notes <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Textarea
                value={sectionForm.notes || ""}
                onChange={(e) => setSectionForm({ ...sectionForm, notes: e.target.value })}
                placeholder={
                  editingSectionType === "scenarios" ? "Optional instructions, edge cases, or requirements..." :
                  editingSectionType === "phases" ? "Optional transition tips or reminders..." :
                  "Optional vocabulary restrictions or style notes..."
                }
                className="bg-white border-border min-h-[80px] text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeSectionModal}>
              Cancel
            </Button>
            <Button onClick={saveSectionEntry} disabled={!sectionForm.title.trim()}>
              {editingSectionEntry ? "Save changes" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Prompt Preview Modal */}
      <Dialog
        open={showPromptPreviewModal}
        onOpenChange={(open) => setShowPromptPreviewModal(open)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Code className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle>Summary</DialogTitle>
                  <DialogDescription>
                    Scenarios, phases, voice tone and the tools available to the assistant.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="border border-border rounded-lg p-4 bg-muted/20">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold">Tools included</h4>
                <p className="text-xs text-muted-foreground">
                  {promptToolsSummary.activeSystemTools.length +
                    promptToolsSummary.clientToolNames.length +
                    promptToolsSummary.webhookToolNames.length +
                    promptToolsSummary.enabledIntegrations.length}{" "}
                  total (high-level)
                </p>
              </div>

              <div className="mt-3 grid gap-2 text-xs">
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">System</span>:{" "}
                  {promptToolsSummary.activeSystemTools.length > 0
                    ? promptToolsSummary.activeSystemTools.join(", ")
                    : "None"}
                </div>
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">Client tools</span>:{" "}
                  {promptToolsSummary.clientToolNames.length > 0
                    ? `${promptToolsSummary.clientToolNames.length} (${promptToolsSummary.clientToolNames
                        .slice(0, 5)
                        .join(", ")}${promptToolsSummary.clientToolNames.length > 5 ? ", …" : ""})`
                    : "None"}
                </div>
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">Webhook tools</span>:{" "}
                  {promptToolsSummary.webhookToolNames.length > 0
                    ? `${promptToolsSummary.webhookToolNames.length} (${promptToolsSummary.webhookToolNames
                        .slice(0, 5)
                        .join(", ")}${promptToolsSummary.webhookToolNames.length > 5 ? ", …" : ""})`
                    : "None"}
                </div>
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">Integrations</span>:{" "}
                  {promptToolsSummary.enabledIntegrations.length > 0
                    ? `${promptToolsSummary.enabledIntegrations.length} (${promptToolsSummary.enabledIntegrations
                        .slice(0, 3)
                        .map((i) => {
                          const toolCount = i.enabledTools.length;
                          return `${formatToolName(i.integrationType)}${toolCount ? ` (${toolCount})` : ""}`;
                        })
                        .join(", ")}${promptToolsSummary.enabledIntegrations.length > 3 ? ", …" : ""})`
                    : "None"}
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-white">
                <h4 className="text-sm font-semibold">Generated prompt</h4>
                <p className="text-xs text-muted-foreground">
                  {derivedSystemPrompt.length.toLocaleString()} chars
                </p>
              </div>
              <pre className="p-4 text-xs font-mono whitespace-pre-wrap bg-white max-h-[60vh] overflow-y-auto">
{derivedSystemPrompt}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
