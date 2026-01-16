import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Heart,
  Star,
  Calendar,
  MessageCircle,
  Target,
  ClipboardList,
  UserCheck,
  ShoppingBag,
  UtensilsCrossed,
  Phone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { agentsApi, voicesApi, Voice, agentTemplatesApi, AgentTemplate, AgentBehaviour, adminApi, integrationsApi, apiKeysApi, outcomeDefinitionsApi, workflowsApi } from "@/lib/api";
import { SectionEntry, SectionPayload, Agent } from "@/types/assistant";
import type { OutcomeDefinition } from "@/types/outcomes";
import type { BehaviourConfig } from "@/components/assistants/SectionEditors";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useIntegrationTools } from "@/hooks/assistants/useIntegrationTools";
import { IntegrationConnectionModal } from "@/components/assistants/modals/IntegrationConnectionModal";
import { INTEGRATION_TOOLS_DISPLAY, getIntegrationIcon, formatToolName, displayNameToActionName } from "@/constants/assistant";
import { getAvailableIntegrationTypes } from "@/constants/integrations";
import type { AgentIntegrationTool, WebhookTool } from "@/types/assistant";
import type { UserIntegration as IntegrationUserIntegration } from "@/types/integrations";
import { PhoneNumberModal } from "@/components/PhoneNumberModal";
import { CustomWidgetConfig, DEFAULT_CONFIG, toFullConfig } from "@/utils/widgetConfig";
import { loadAndOpenWidget } from "@/utils/widgetLoader";
import { getBackendBaseUrl } from "@/utils/widgetHelpers";
import { providers, modelsByProvider, steps, WIDGET_SIZES, templateDefaults } from "./wizard/constants";
import { getTemplateIntegrationTools, getSampleMessages, generateSystemPrompt as generateSystemPromptHelper, generateSectionEntryId, createSectionEntry, inferTemplateFromName, serializeSectionEntries } from "./wizard/helpers";
import type { CreateAgentWizardProps, StepType } from "./wizard/types";
import { CustomWidgetPreviewModal } from "./wizard/CustomWidgetPreviewModal";
import { Steps } from "./wizard/WizardSteps";
import { SectionEntryModal } from "./wizard/SectionEntryModal";
import { useWizardState } from "./wizard/hooks/useWizardState";
import { useVoicePreview } from "./wizard/hooks/useVoicePreview";
import { useTemplateDefaults } from "./wizard/hooks/useTemplateDefaults";
import { WizardContextProvider, WizardContextValue } from "./wizard/WizardContextProvider";
import { NameStep } from "./wizard/steps/NameStep";
import { TemplateStep } from "./wizard/steps/TemplateStep";
import { ModelStep } from "./wizard/steps/ModelStep";
import { CallOutcomesStep } from "./wizard/steps/CallOutcomesStep";
import { AgentBehaviourStep } from "./wizard/steps/AgentBehaviourStep";
import { VoiceLanguageStep } from "./wizard/steps/VoiceLanguageStep";
import { AgentIntegrationToolsSection } from "@/components/integrations/AgentIntegrationToolsSection";
import { IntegrationSuggestions } from "@/components/integrations/IntegrationSuggestions";
import { CreateWorkflowFromScratchModal } from "@/components/workflows/CreateWorkflowFromScratchModal";
import type { EscalationRuleSettings } from "@/components/assistants/EscalationRulesPanel";
import { normalizeLanguage } from "@/constants/languages";
import { inferWorkflowFromAgentType } from "@/utils/workflowInference";

export default function CreateAgentWizard({ onComplete, voices: propVoices, loadingVoices: propLoadingVoices, initialData }: CreateAgentWizardProps) {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get agent slug from URL params (for persistence across refreshes)
  const urlAgentSlug = searchParams.get('slug');
  const savedStep = searchParams.get('step');

  // Start at template step (step 0)
  const initialStep = savedStep ? parseInt(savedStep, 10) : 0;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [saving, setSaving] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [agentSlug, setAgentSlug] = useState<string | null>(urlAgentSlug || null);
  const [loadingAgent, setLoadingAgent] = useState(!!urlAgentSlug);

  // Step 0: Template & Name
  const [name, setName] = useState(initialData?.assistantName || "");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(initialData?.templateId || null);
  const [templates, setTemplates] = useState<Array<{
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }> | string;
    systemPrompt?: string;
    firstMessage?: string;
  }>>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  // Icon mapping for templates
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'plus': Plus,
    'heart': Heart,
    'star': Star,
    'calendar': Calendar,
    'message-circle': MessageCircle,
    'target': Target,
    'clipboard-list': ClipboardList,
    'user-check': UserCheck,
    'shopping-bag': ShoppingBag,
    'utensils-crossed': UtensilsCrossed,
    'phone': Phone,
  };

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      setTemplatesLoading(true);
      try {
        const response = await agentTemplatesApi.list();
        if (response.data && Array.isArray(response.data)) {
          const mappedTemplates = response.data.map((template: AgentTemplate) => {
            let icon: React.ComponentType<{ className?: string }> | string = Plus;
            if (template.icon_name && iconMap[template.icon_name]) {
              icon = iconMap[template.icon_name];
            } else if (template.icon_url) {
              icon = template.icon_url;
            }
            return {
              id: template.id.toString(),
              title: template.title,
              description: template.description,
              icon: icon,
              systemPrompt: template.system_prompt || undefined,
              firstMessage: template.first_message || undefined,
            };
          });
          setTemplates(mappedTemplates);
        } else {
          setTemplates([]);
        }
      } catch (err) {
        console.error('Failed to fetch templates:', err);
        setTemplates([]);
        toast({
          title: 'Error',
          description: 'Failed to load templates. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setTemplatesLoading(false);
      }
    };
    fetchTemplates();
  }, [toast]);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(templateId);

    // Auto-generate name based on template
    if (template && template.title !== "Blank Template") {
      setName(template.title);
    }

    // Apply template defaults if available
    if (template) {
      const templateDefault = templateDefaults[template.title];
      if (templateDefault) {
        // Pre-populate model
        setSelectedProvider(templateDefault.provider);
        setSelectedModel(templateDefault.model);

        // Pre-populate scenarios, phases, and voice tone with fresh IDs
        const generateId = () => `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setScenarios(templateDefault.scenarios.map(s => ({ ...s, id: generateId() })));
        setPhases(templateDefault.phases.map(p => ({ ...p, id: generateId() })));
        setVoiceTone(templateDefault.voiceTone.map(v => ({ ...v, id: generateId() })));

        // Pre-populate first message if template has one
        if (template.firstMessage && !firstMessage) {
          setFirstMessage(template.firstMessage);
        }

        // Pre-populate system prompt if template has one
        if (template.systemPrompt && !systemPromptTemplate) {
          setSystemPromptTemplate(template.systemPrompt);
        }
      } else if (template.firstMessage && !firstMessage) {
        // Even without template defaults, pre-populate first message
        setFirstMessage(template.firstMessage);
      }
    }
  };

  // Step 2: Model
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [firstMessage, setFirstMessage] = useState(initialData?.firstMessage || "");

  // Step 3: Voice & Language
  const [primaryOutcomes, setPrimaryOutcomes] = useState<string[]>([]);
  const [escalationRuleSettings, setEscalationRuleSettings] = useState<EscalationRuleSettings>({
    name: 'transfer_to_number',
    description: '',
    disableInterruptions: false,
    humanTransferRules: [],
    escalation_keywords: [],
  });
  const [successKeywords, setSuccessKeywords] = useState<string[]>([]);
  const [failureKeywords, setFailureKeywords] = useState<string[]>([]);
  const [showCallOutcomesValidation, setShowCallOutcomesValidation] = useState(false);

  // Reset validation errors when step changes
  useEffect(() => {
    if (currentStep !== 3) {
      setShowCallOutcomesValidation(false);
    }
  }, [currentStep]);

  // Step 4: Agent Behaviour (Scenarios, Phases, Voice & Tone)
  const [scenarios, setScenarios] = useState<SectionEntry[]>([]);
  const [phases, setPhases] = useState<SectionEntry[]>([]);
  const [voiceTone, setVoiceTone] = useState<SectionEntry[]>([]);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSectionType, setEditingSectionType] = useState<"scenarios" | "phases" | "voiceTone" | null>(null);
  const [editingSectionEntry, setEditingSectionEntry] = useState<SectionEntry | null>(null);
  const [sectionForm, setSectionForm] = useState<Omit<SectionEntry, "id">>({
    title: "",
    description: "",
    notes: "",
  });
  const [behaviourConfig, setBehaviourConfig] = useState<BehaviourConfig | undefined>(undefined);
  const [template, setTemplate] = useState<AgentTemplate | null>(null);
  const [templateSystemPrompt, setTemplateSystemPrompt] = useState<string>("");
  const [systemPromptTemplate, setSystemPromptTemplate] = useState<string>(initialData?.systemPrompt || "");
  const [currentBehaviourId, setCurrentBehaviourId] = useState<number | undefined>(undefined);
  const [currentBehaviourName, setCurrentBehaviourName] = useState<string | undefined>(undefined);
  const [availableBehaviours, setAvailableBehaviours] = useState<AgentBehaviour[]>([]);
  const [loadingBehaviours, setLoadingBehaviours] = useState(false);

  // Integration tools state
  const [webhookTools, setWebhookTools] = useState<WebhookTool[]>([]);
  const integrationHook = useIntegrationTools(webhookTools, setWebhookTools);
  const [userIntegrations, setUserIntegrations] = useState<IntegrationUserIntegration[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);
  const [integrationToolsSectionExpanded, setIntegrationToolsSectionExpanded] = useState(true);
  const [integrationToolsExpanded, setIntegrationToolsExpanded] = useState<Record<string, boolean>>({});
  const previousIntegrationToolsRef = React.useRef<Set<string>>(new Set());
  const [agentFunctionsRefreshKey, setAgentFunctionsRefreshKey] = useState(0);

  // Widget preview and phone number modals
  const [showWidgetPreview, setShowWidgetPreview] = useState(false);
  const [showPhoneNumberModal, setShowPhoneNumberModal] = useState(false);
  const [showCreateWorkflowModal, setShowCreateWorkflowModal] = useState(false);
  const [workflowModalInitialData, setWorkflowModalInitialData] = useState<{
    toolChain?: import("@/types/functions").ToolInChain[];
    name?: string;
    description?: string;
  } | null>(null);
  const [agentData, setAgentData] = useState<import("@/lib/api").Agent | null>(null);
  const [widgetConfig, setWidgetConfig] = useState<CustomWidgetConfig>(DEFAULT_CONFIG);
  const [apiKey, setApiKey] = useState<string>('');

  // inferTemplateFromName is now imported from ./wizard/helpers

  // Get required integrations from template
  // Priority: 1) initialData.integrationTools, 2) agentData.integration_tools (for existing agents), 3) template title, 4) inferred from agent name
  const requiredIntegrations = React.useMemo(() => {
    // Check initialData first (this is passed from AssistantsList when creating from template)
    if (initialData?.integrationTools) {
      const keys = Object.keys(initialData.integrationTools);
      if (keys.length > 0) {
        console.log('[CreateAgentWizard] Using integrations from initialData:', keys);
        return keys;
      } else {
        console.log('[CreateAgentWizard] initialData.integrationTools exists but is empty:', initialData.integrationTools);
      }
    }

    // Check agentData for existing integrations (when editing an existing agent)
    if (agentData?.integration_tools) {
      const keys = Object.keys(agentData.integration_tools);
      if (keys.length > 0) {
        console.log('[CreateAgentWizard] Using integrations from agentData:', keys);
        return keys;
      }
    }

    // Fallback: check template title if template is loaded
    if (template?.title) {
      const templateTools = getTemplateIntegrationTools(template.title);
      const integrationKeys = Object.keys(templateTools);
      console.log('[CreateAgentWizard] Template integrations:', {
        templateTitle: template.title,
        templateTools,
        integrationKeys,
        hasTools: integrationKeys.length > 0,
        keysLength: integrationKeys.length
      });
      if (integrationKeys.length > 0) {
        return integrationKeys;
      }
    }

    // If template not loaded but we have agent name, try to infer template from name
    if (!template && agentData?.name) {
      const inferredTemplate = inferTemplateFromName(agentData.name);
      if (inferredTemplate) {
        console.log('[CreateAgentWizard] Inferred template from agent name:', inferredTemplate, 'agent name:', agentData.name);
        const templateTools = getTemplateIntegrationTools(inferredTemplate);
        const integrationKeys = Object.keys(templateTools);
        if (integrationKeys.length > 0) {
          console.log('[CreateAgentWizard] Using integrations from inferred template:', integrationKeys);
          return integrationKeys;
        }
      }
    }

    // If we have a templateId but template isn't loaded yet, try to get integrations from the mapping
    // This is a fallback for when template is still loading
    if (initialData?.templateId && !template) {
      console.log('[CreateAgentWizard] Template not loaded yet, but we have templateId:', initialData.templateId);
      // We can't get the title without the template, so return empty for now
      // The template will be loaded in useEffect and then this will recalculate
    }

    console.log('[CreateAgentWizard] No integrations found - template:', template?.title, 'templateId:', initialData?.templateId, 'agentData.integration_tools:', agentData?.integration_tools, 'agentData.name:', agentData?.name, 'initialData.integrationTools:', initialData?.integrationTools);
    return [];
  }, [template, initialData?.integrationTools, initialData?.templateId, agentData?.integration_tools, agentData?.name]);

  const hasRequiredIntegrations = requiredIntegrations.length > 0;

  // Generate system prompt using imported helper
  const systemPrompt = generateSystemPromptHelper(initialData?.systemPrompt, scenarios, phases, voiceTone);

  // generateSectionEntryId and createSectionEntry are now imported from ./wizard/helpers

  const openSectionModal = (type: "scenarios" | "phases" | "voiceTone", entry?: SectionEntry) => {
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

    const getSetter = () => {
      switch (editingSectionType) {
        case "scenarios": return setScenarios;
        case "phases": return setPhases;
        case "voiceTone": return setVoiceTone;
      }
    };

    const setter = getSetter();

    if (editingSectionEntry) {
      setter((prev) =>
        prev.map((entry) =>
          entry.id === editingSectionEntry.id
            ? { ...entry, ...sectionForm }
            : entry
        )
      );
    } else {
      setter((prev) => [...prev, createSectionEntry(sectionForm)]);
    }
    closeSectionModal();
  };

  const deleteSectionEntry = (type: "scenarios" | "phases" | "voiceTone", id: string) => {
    const getSetter = () => {
      switch (type) {
        case "scenarios": return setScenarios;
        case "phases": return setPhases;
        case "voiceTone": return setVoiceTone;
      }
    };
    const setter = getSetter();
    setter((prev) => prev.filter((entry) => entry.id !== id));
  };

  // getSectionConfig and renderSectionEditor are now handled by AgentBehaviourStep component

  // Step 4: Voice
  const [selectedVoiceIds, setSelectedVoiceIds] = useState<string[]>([]);
  const [primaryVoiceId, setPrimaryVoiceId] = useState<string | undefined>(undefined);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(propLoadingVoices || false);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState("");

  // Use voice preview hook
  const { playingVoiceId, handlePlayPreview } = useVoicePreview();

  // Step 2: Voice & Language (merged, moved before Call Outcomes)
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["en"]);
  const [defaultLanguage, setDefaultLanguage] = useState<string>("en");
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [languageSearchQuery, setLanguageSearchQuery] = useState("");

  // Handle behaviour change
  const handleBehaviourChange = async (behaviourId: string) => {
    const newBehaviourId = behaviourId === "none" ? undefined : parseInt(behaviourId, 10);

    if (newBehaviourId) {
      try {
        setLoadingBehaviours(true);
        const response = await adminApi.behaviours.show(newBehaviourId);
        if (response.data) {
          const behaviour = response.data;
          const config: BehaviourConfig = {};
          behaviour.sections?.forEach(section => {
            if (section.section_type === "scenarios") {
              config.scenarios = {
                label: section.label,
                description: section.description,
                add_label: section.add_label,
                title_placeholder: section.title_placeholder,
                description_placeholder: section.description_placeholder,
                notes_placeholder: section.notes_placeholder,
                notes_label: section.notes_label,
              };
            } else if (section.section_type === "phases") {
              config.phases = {
                label: section.label,
                description: section.description,
                add_label: section.add_label,
                title_placeholder: section.title_placeholder,
                description_placeholder: section.description_placeholder,
                notes_placeholder: section.notes_placeholder,
                notes_label: section.notes_label,
              };
            } else if (section.section_type === "voice_tone") {
              config.voiceTone = {
                label: section.label,
                description: section.description,
                add_label: section.add_label,
                title_placeholder: section.title_placeholder,
                description_placeholder: section.description_placeholder,
                notes_placeholder: section.notes_placeholder,
                notes_label: section.notes_label,
              };
            }
          });
          setBehaviourConfig(config);
          setCurrentBehaviourId(behaviour.id);
          setCurrentBehaviourName(behaviour.name);
        }
      } catch (error) {
        console.error("Error loading behaviour:", error);
        toast({
          title: "Error",
          description: "Failed to load behaviour template.",
          variant: "destructive",
        });
      } finally {
        setLoadingBehaviours(false);
      }
    } else {
      // Reset to default behaviour
      const defaultBehaviour = availableBehaviours.find(b => b.name === "Default");
      if (defaultBehaviour) {
        const config: BehaviourConfig = {};
        defaultBehaviour.sections?.forEach(section => {
          if (section.section_type === "scenarios") {
            config.scenarios = {
              label: section.label,
              description: section.description,
              add_label: section.add_label,
              title_placeholder: section.title_placeholder,
              description_placeholder: section.description_placeholder,
              notes_placeholder: section.notes_placeholder,
              notes_label: section.notes_label,
            };
          } else if (section.section_type === "phases") {
            config.phases = {
              label: section.label,
              description: section.description,
              add_label: section.add_label,
              title_placeholder: section.title_placeholder,
              description_placeholder: section.description_placeholder,
              notes_placeholder: section.notes_placeholder,
              notes_label: section.notes_label,
            };
          } else if (section.section_type === "voice_tone") {
            config.voiceTone = {
              label: section.label,
              description: section.description,
              add_label: section.add_label,
              title_placeholder: section.title_placeholder,
              description_placeholder: section.description_placeholder,
              notes_placeholder: section.notes_placeholder,
              notes_label: section.notes_label,
            };
          }
        });
        setBehaviourConfig(config);
        setCurrentBehaviourId(defaultBehaviour.id);
        setCurrentBehaviourName(defaultBehaviour.name);
      } else {
        setBehaviourConfig(undefined);
        setCurrentBehaviourId(undefined);
        setCurrentBehaviourName(undefined);
      }
    }
  };

  // Fetch available behaviours and automatically set default
  useEffect(() => {
    const fetchBehaviours = async () => {
      setLoadingBehaviours(true);
      try {
        const response = await adminApi.behaviours.list();
        if (response.data) {
          const behaviours = Array.isArray(response.data) ? response.data : [];
          setAvailableBehaviours(behaviours);

          // Automatically set default behaviour if not already set and no template is being loaded
          if (!currentBehaviourId && !initialData?.templateId) {
            const defaultBehaviour = behaviours.find(b => b.name === "Default");
            if (defaultBehaviour) {
              try {
                const behaviourResponse = await adminApi.behaviours.show(defaultBehaviour.id);
                if (behaviourResponse.data) {
                  const behaviour = behaviourResponse.data;
                  const config: BehaviourConfig = {};
                  behaviour.sections?.forEach(section => {
                    if (section.section_type === "scenarios") {
                      config.scenarios = {
                        label: section.label,
                        description: section.description,
                        add_label: section.add_label,
                        title_placeholder: section.title_placeholder,
                        description_placeholder: section.description_placeholder,
                        notes_placeholder: section.notes_placeholder,
                        notes_label: section.notes_label,
                      };
                    } else if (section.section_type === "phases") {
                      config.phases = {
                        label: section.label,
                        description: section.description,
                        add_label: section.add_label,
                        title_placeholder: section.title_placeholder,
                        description_placeholder: section.description_placeholder,
                        notes_placeholder: section.notes_placeholder,
                        notes_label: section.notes_label,
                      };
                    } else if (section.section_type === "voice_tone") {
                      config.voiceTone = {
                        label: section.label,
                        description: section.description,
                        add_label: section.add_label,
                        title_placeholder: section.title_placeholder,
                        description_placeholder: section.description_placeholder,
                        notes_placeholder: section.notes_placeholder,
                        notes_label: section.notes_label,
                      };
                    }
                  });
                  setBehaviourConfig(config);
                  setCurrentBehaviourId(behaviour.id);
                  setCurrentBehaviourName(behaviour.name);
                }
              } catch (error) {
                console.error("Error loading default behaviour:", error);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching behaviours:", error);
      } finally {
        setLoadingBehaviours(false);
      }
    };

    fetchBehaviours();
  }, [currentBehaviourId, initialData?.templateId]);

  // Load agent data if agentSlug exists in URL (for page refresh persistence)
  useEffect(() => {
    const loadAgentData = async () => {
      if (!urlAgentSlug) {
        setLoadingAgent(false);
        return;
      }

      try {
        setLoadingAgent(true);
        const agentResponse = await agentsApi.get(urlAgentSlug);
        if (agentResponse.data) {
          const agent = agentResponse.data;
          setAgentId(agent.id);
          setAgentSlug(agent.slug || urlAgentSlug);
          setAgentData(agent);

          // Restore form state from agent
          setName(agent.name || "");

          // Restore model/provider from conversation config
          if (agent.conversation_config?.model) {
            const modelConfig = agent.conversation_config.model as { provider?: string; model?: string };
            if (modelConfig.provider) setSelectedProvider(modelConfig.provider);
            if (modelConfig.model) setSelectedModel(modelConfig.model);
          }

          // Restore platform settings (voice, language)
          if (agent.platform_settings) {
            const platformSettings = agent.platform_settings as { voice_id?: string; language?: string };
            if (platformSettings.voice_id) {
              // Support both single voice_id (backward compatibility) and voice_ids array
              if (Array.isArray(platformSettings.voice_id)) {
                setSelectedVoiceIds(platformSettings.voice_id);
              } else {
                setSelectedVoiceIds([platformSettings.voice_id]);
              }
            }
            if (platformSettings.language) {
              // Support both single language (backward compatibility) and languages array
              if (Array.isArray(platformSettings.language)) {
                const languages = platformSettings.language.filter((l): l is string => typeof l === 'string');
                // Normalize languages to codes
                setSelectedLanguages(languages.map(normalizeLanguage));
              } else {
                // Normalize single language to code
                setSelectedLanguages([normalizeLanguage(platformSettings.language as string)]);
              }
            }

            // Also check conversation_config for languages array and default_language
            if (agent.conversation_config) {
              const conversationConfig = agent.conversation_config as Record<string, unknown>;
              if (conversationConfig.languages && Array.isArray(conversationConfig.languages)) {
                const languages = conversationConfig.languages.filter((l): l is string => typeof l === 'string');
                // Normalize languages to codes
                const normalizedLanguages = languages.map(normalizeLanguage);
                setSelectedLanguages(normalizedLanguages);
                // Set default language from config or use first language
                if (conversationConfig.default_language) {
                  setDefaultLanguage(normalizeLanguage(conversationConfig.default_language as string));
                } else if (normalizedLanguages.length > 0) {
                  setDefaultLanguage(normalizedLanguages[0]);
                }
              }
            }
          }

          // Also check conversation_config for voice_ids and primary_voice_id
          if (agent.conversation_config) {
            const conversationConfig = agent.conversation_config as Record<string, unknown>;
            if (conversationConfig.voice_ids && Array.isArray(conversationConfig.voice_ids)) {
              const voiceIds = conversationConfig.voice_ids.filter((id): id is string => typeof id === 'string');
              setSelectedVoiceIds(voiceIds);
              // Set primary voice from config or use first voice
              if (conversationConfig.primary_voice_id) {
                const primaryId = conversationConfig.primary_voice_id as string;
                // Only set if it's in the voice_ids array
                if (voiceIds.includes(primaryId)) {
                  setPrimaryVoiceId(primaryId);
                } else if (voiceIds.length > 0) {
                  setPrimaryVoiceId(voiceIds[0]);
                }
              } else if (voiceIds.length > 0) {
                setPrimaryVoiceId(voiceIds[0]);
              }
            } else if (conversationConfig.voice_id && typeof conversationConfig.voice_id === 'string') {
              const voiceId = conversationConfig.voice_id;
              setSelectedVoiceIds([voiceId]);
              setPrimaryVoiceId(voiceId);
            }
          }

          // Also check top-level primary_voice_id (if it exists in the agent object)
          const agentWithPrimary = agent as unknown as Record<string, unknown>;
          if (agentWithPrimary.primary_voice_id && typeof agentWithPrimary.primary_voice_id === 'string') {
            // Only set if it's in the selected voice IDs
            if (selectedVoiceIds.length > 0 && selectedVoiceIds.includes(agentWithPrimary.primary_voice_id)) {
              setPrimaryVoiceId(agentWithPrimary.primary_voice_id);
            }
          }

          // Restore section entries from prompt_sections
          if (agent.conversation_config?.prompt_sections) {
            const sections = agent.conversation_config.prompt_sections as {
              scenarios?: SectionPayload[];
              phases?: SectionPayload[];
              voiceTone?: SectionPayload[];
            };
            if (sections.scenarios && sections.scenarios.length > 0) {
              setScenarios(sections.scenarios.map((s, idx) => ({
                id: `restored_scenario_${idx}_${Date.now()}`,
                title: s.title || "",
                description: s.description || "",
                notes: s.notes || "",
              })));
            }
            if (sections.phases && sections.phases.length > 0) {
              setPhases(sections.phases.map((s, idx) => ({
                id: `restored_phase_${idx}_${Date.now()}`,
                title: s.title || "",
                description: s.description || "",
                notes: s.notes || "",
              })));
            }
            if (sections.voiceTone && sections.voiceTone.length > 0) {
              setVoiceTone(sections.voiceTone.map((s, idx) => ({
                id: `restored_tone_${idx}_${Date.now()}`,
                title: s.title || "",
                description: s.description || "",
                notes: s.notes || "",
              })));
            }
          }

          // If no behavior sections were loaded and we have auto-generation config, trigger generation
          const hasNoBehavior = scenarios.length === 0 && phases.length === 0 && voiceTone.length === 0;
          if (hasNoBehavior && agent.id) {
            const storageKey = `agent_auto_generate_${agent.id}`;
            const stored = sessionStorage.getItem(storageKey);
            if (stored) {
              console.log("[Behavior Generation] Agent loaded with no behavior, will generate when on step 4");
            }
          }

          // Restore widget config
          if (agent.widget_config) {
            const loadedConfig = toFullConfig(agent.widget_config);
            setWidgetConfig(loadedConfig);
          }

          // Restore first message if available
          if (agent.conversation_config?.first_message) {
            setFirstMessage(agent.conversation_config.first_message as string);
          }

          // Restore webhook tools
          if (agent.conversation_config?.webhook_tools) {
            const webhookToolsData = agent.conversation_config.webhook_tools as WebhookTool[];
            setWebhookTools(webhookToolsData);
          }

          // Restore integration tools
          if (agent.integration_tools) {
            const integrationTools: AgentIntegrationTool[] = [];
            const integrationHash = agent.integration_tools as Record<
              string,
              { enabled: boolean; enabled_tools: string[] }
            >;
            Object.entries(integrationHash).forEach(([integration_type, cfg]) => {
              (cfg.enabled_tools || []).forEach((tool_name) => {
                integrationTools.push({
                  integration_type,
                  tool_name,
                  enabled: !!cfg.enabled,
                });
              });
            });
            integrationHook.setAgentIntegrationTools(integrationTools);
          }

          // Restore outcome definitions
          try {
            const outcomeResponse = await outcomeDefinitionsApi.get(agent.id);
            // The API returns { data: OutcomeDefinition | null } or nested structure
            // Extract the actual OutcomeDefinition from the response
            const responseData = outcomeResponse.data as OutcomeDefinition | { outcome_definition?: OutcomeDefinition } | null;
            const outcomeDef = (responseData && typeof responseData === 'object' && 'outcome_definition' in responseData)
              ? responseData.outcome_definition
              : (responseData as OutcomeDefinition | null);
            if (outcomeDef && typeof outcomeDef === 'object' && 'primary_outcome' in outcomeDef) {
              // Combine primary_outcome and secondary_outcomes into primaryOutcomes array
              const allOutcomes = [
                outcomeDef.primary_outcome,
                ...(outcomeDef.secondary_outcomes || [])
              ].filter((outcome): outcome is string => typeof outcome === 'string' && outcome.trim() !== '');
              setPrimaryOutcomes(allOutcomes);

              // Restore success and failure keywords
              if (outcomeDef.success_conditions?.keywords) {
                setSuccessKeywords(outcomeDef.success_conditions.keywords);
              }
              if (outcomeDef.failure_conditions?.failure_keywords) {
                setFailureKeywords(outcomeDef.failure_conditions.failure_keywords);
              }

              // Restore escalation rules
              if (outcomeDef.escalation_rules) {
                setEscalationRuleSettings({
                  name: outcomeDef.escalation_rules.name || 'transfer_to_number',
                  description: outcomeDef.escalation_rules.description || '',
                  disableInterruptions: outcomeDef.escalation_rules.disableInterruptions || false,
                  humanTransferRules: outcomeDef.escalation_rules.humanTransferRules || [],
                  escalation_keywords: outcomeDef.escalation_rules.escalation_keywords || [],
                });
              }
            }
          } catch (outcomeError) {
            console.error('Failed to load outcome definitions:', outcomeError);
            // Don't show error toast - outcome definitions might not exist yet
          }
        }
      } catch (error) {
        console.error('Failed to load agent data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load agent data. Starting fresh.',
          variant: 'destructive',
        });
        // Clear invalid agent slug from URL
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          newParams.delete('slug');
          newParams.delete('step');
          return newParams;
        });
      } finally {
        setLoadingAgent(false);
      }
    };

    loadAgentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlAgentSlug, setSearchParams, toast]);

  // Update URL when step or agentSlug changes
  useEffect(() => {
    if (agentSlug) {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('slug', agentSlug);
        newParams.set('step', currentStep.toString());
        return newParams;
      });
    }
  }, [agentSlug, currentStep, setSearchParams]);

  // Load template and behaviour (or default behaviour if no template)
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        if (initialData?.templateId) {
          // Load template and its associated behaviour
          const response = await agentTemplatesApi.list();
          if (response.data) {
            const templates = Array.isArray(response.data) ? response.data : [];
            const foundTemplate = templates.find(t => t.id.toString() === initialData.templateId);
            if (foundTemplate) {
              setTemplate(foundTemplate);

              // Capture template's system_prompt if initialData.systemPrompt is not available
              if (foundTemplate.system_prompt && !initialData?.systemPrompt) {
                setTemplateSystemPrompt(foundTemplate.system_prompt);
                setSystemPromptTemplate(foundTemplate.system_prompt);
              } else if (foundTemplate.system_prompt && initialData?.systemPrompt) {
                // If initialData has systemPrompt, use it, but also store template's for reference
                setTemplateSystemPrompt(foundTemplate.system_prompt);
                // Keep initialData.systemPrompt as the editable value
              } else if (foundTemplate.system_prompt) {
                // If template has system_prompt but no initialData, use template's
                setTemplateSystemPrompt(foundTemplate.system_prompt);
                setSystemPromptTemplate(foundTemplate.system_prompt);
              }

              // Pre-populate from template defaults if available
              const templateDefault = templateDefaults[foundTemplate.title];
              if (templateDefault) {
                // Pre-populate model
                setSelectedProvider(templateDefault.provider);
                setSelectedModel(templateDefault.model);

                // Pre-populate scenarios, phases, and voice tone with fresh IDs
                const generateId = () => `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                setScenarios(templateDefault.scenarios.map(s => ({ ...s, id: generateId() })));
                setPhases(templateDefault.phases.map(p => ({ ...p, id: generateId() })));
                setVoiceTone(templateDefault.voiceTone.map(v => ({ ...v, id: generateId() })));

                // Pre-populate first message from template if available
                // Always use template's first message if it exists, unless initialData explicitly provides a non-empty value
                if (foundTemplate.first_message) {
                  if (!initialData?.firstMessage || !initialData.firstMessage.trim()) {
                    setFirstMessage(foundTemplate.first_message);
                  }
                }
              } else if (foundTemplate.first_message) {
                // Even without template defaults, pre-populate first message from template
                // Always use template's first message if it exists, unless initialData explicitly provides a non-empty value
                if (!initialData?.firstMessage || !initialData.firstMessage.trim()) {
                  setFirstMessage(foundTemplate.first_message);
                }
              }

              // If template has a behaviour ID, load the full behaviour with sections
              if (foundTemplate.agent_behaviour_id && foundTemplate.agent_behaviour) {
                // Check if sections are already loaded in the response
                if (foundTemplate.agent_behaviour.sections && foundTemplate.agent_behaviour.sections.length > 0) {
                  // Sections are included, use them
                  const config: BehaviourConfig = {};
                  foundTemplate.agent_behaviour.sections.forEach(section => {
                    if (section.section_type === "scenarios") {
                      config.scenarios = {
                        label: section.label,
                        description: section.description,
                        add_label: section.add_label,
                        title_placeholder: section.title_placeholder,
                        description_placeholder: section.description_placeholder,
                        notes_placeholder: section.notes_placeholder,
                        notes_label: section.notes_label,
                      };
                    } else if (section.section_type === "phases") {
                      config.phases = {
                        label: section.label,
                        description: section.description,
                        add_label: section.add_label,
                        title_placeholder: section.title_placeholder,
                        description_placeholder: section.description_placeholder,
                        notes_placeholder: section.notes_placeholder,
                        notes_label: section.notes_label,
                      };
                    } else if (section.section_type === "voice_tone") {
                      config.voiceTone = {
                        label: section.label,
                        description: section.description,
                        add_label: section.add_label,
                        title_placeholder: section.title_placeholder,
                        description_placeholder: section.description_placeholder,
                        notes_placeholder: section.notes_placeholder,
                        notes_label: section.notes_label,
                      };
                    }
                  });
                  setBehaviourConfig(config);
                  setCurrentBehaviourId(foundTemplate.agent_behaviour.id);
                  setCurrentBehaviourName(foundTemplate.agent_behaviour.name);
                } else {
                  // Sections not included, fetch the full behaviour
                  try {
                    const behaviourResponse = await adminApi.behaviours.show(foundTemplate.agent_behaviour_id);
                    if (behaviourResponse.data) {
                      const behaviour = behaviourResponse.data;
                      if (behaviour.sections && behaviour.sections.length > 0) {
                        const config: BehaviourConfig = {};
                        behaviour.sections.forEach((section) => {
                          if (section.section_type === "scenarios") {
                            config.scenarios = {
                              label: section.label,
                              description: section.description,
                              add_label: section.add_label,
                              title_placeholder: section.title_placeholder,
                              description_placeholder: section.description_placeholder,
                              notes_placeholder: section.notes_placeholder,
                              notes_label: section.notes_label,
                            };
                          } else if (section.section_type === "phases") {
                            config.phases = {
                              label: section.label,
                              description: section.description,
                              add_label: section.add_label,
                              title_placeholder: section.title_placeholder,
                              description_placeholder: section.description_placeholder,
                              notes_placeholder: section.notes_placeholder,
                              notes_label: section.notes_label,
                            };
                          } else if (section.section_type === "voice_tone") {
                            config.voiceTone = {
                              label: section.label,
                              description: section.description,
                              add_label: section.add_label,
                              title_placeholder: section.title_placeholder,
                              description_placeholder: section.description_placeholder,
                              notes_placeholder: section.notes_placeholder,
                              notes_label: section.notes_label,
                            };
                          }
                        });
                        setBehaviourConfig(config);
                        setCurrentBehaviourId(behaviour.id);
                        setCurrentBehaviourName(behaviour.name);
                      }
                    }
                  } catch (error) {
                    console.error("Error loading template behaviour:", error);
                    // Fallback to default behaviour
                    await loadDefaultBehaviour();
                  }
                }
              } else {
                // Template has no behaviour, load default
                await loadDefaultBehaviour();
              }
            }
          }
        } else {
          // No template selected, load default behaviour
          await loadDefaultBehaviour();
        }
      } catch (error) {
        console.error("Error loading template/behaviour:", error);
        // Fallback to default behaviour on error
        await loadDefaultBehaviour();
      }
    };

    const loadDefaultBehaviour = async () => {
      try {
        const response = await adminApi.behaviours.list();
        if (response.data) {
          const behaviours = Array.isArray(response.data) ? response.data : [];
          const defaultBehaviour = behaviours.find(b => b.name === "Default");
          if (defaultBehaviour?.sections) {
            const config: BehaviourConfig = {};
            defaultBehaviour.sections.forEach(section => {
              if (section.section_type === "scenarios") {
                config.scenarios = {
                  label: section.label,
                  description: section.description,
                  add_label: section.add_label,
                  title_placeholder: section.title_placeholder,
                  description_placeholder: section.description_placeholder,
                  notes_placeholder: section.notes_placeholder,
                  notes_label: section.notes_label,
                };
              } else if (section.section_type === "phases") {
                config.phases = {
                  label: section.label,
                  description: section.description,
                  add_label: section.add_label,
                  title_placeholder: section.title_placeholder,
                  description_placeholder: section.description_placeholder,
                  notes_placeholder: section.notes_placeholder,
                  notes_label: section.notes_label,
                };
              } else if (section.section_type === "voice_tone") {
                config.voiceTone = {
                  label: section.label,
                  description: section.description,
                  add_label: section.add_label,
                  title_placeholder: section.title_placeholder,
                  description_placeholder: section.description_placeholder,
                  notes_placeholder: section.notes_placeholder,
                  notes_label: section.notes_label,
                };
              }
            });
            setBehaviourConfig(config);
            setCurrentBehaviourId(defaultBehaviour.id);
            setCurrentBehaviourName(defaultBehaviour.name);
            // Set template to null to indicate no template selected
            setTemplate(null);
          }
        }
      } catch (error) {
        console.error("Error loading default behaviour:", error);
      }
    };

    loadTemplate();
  }, [initialData?.templateId, initialData?.firstMessage]);

  // Fetch voices if not provided
  useEffect(() => {
    const fetchVoices = async () => {
      // Always fetch from API to get full voice data including preview_url
      setLoadingVoices(true);
      try {
        const response = await voicesApi.list();
        if (response.data) {
          setVoices(response.data);
        }
      } catch (err) {
        console.error('Error fetching voices:', err);
        // Fallback to prop voices if API fails
        if (propVoices && propVoices.length > 0) {
          const convertedVoices: Voice[] = propVoices.map(v => ({
            id: v.id,
            name: v.name || v.id,
          }));
          setVoices(convertedVoices);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to load voices. Please try again.',
            variant: 'destructive',
          });
        }
      } finally {
        setLoadingVoices(false);
      }
    };

    fetchVoices();
  }, [propVoices, toast]);

  // Pre-populate voice when template and voices are both loaded
  useEffect(() => {
    if (template && voices.length > 0 && selectedVoiceIds.length === 0) {
      const templateDefault = templateDefaults[template.title];
      if (templateDefault && templateDefault.recommendedVoiceIds && templateDefault.recommendedVoiceIds.length > 0) {
        // Find recommended voices that exist in the voices list
        const recommendedVoices = voices.filter(v => templateDefault.recommendedVoiceIds!.includes(v.id));
        if (recommendedVoices.length > 0) {
          setSelectedVoiceIds(recommendedVoices.map(v => v.id));
        }
      } else {
        // Default: Select first professional-sounding voice (prioritize voices with names containing professional keywords)
        const professionalKeywords = ['charlie', 'sarah', 'david', 'emily', 'james', 'professional', 'confident'];
        const professionalVoice = voices.find(v =>
          v.name && professionalKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
        ) || voices[0];

        if (professionalVoice) {
          setSelectedVoiceIds([professionalVoice.id]);
        }
      }
    }
  }, [template, voices, selectedVoiceIds.length]);

  // Handle pre-selected voices from agent type detection
  useEffect(() => {
    if (initialData?.preSelectedVoices && voices.length > 0 && selectedVoiceIds.length === 0) {
      // Filter available voices by pre-selected IDs
      const availablePreSelectedVoices = voices.filter(v =>
        initialData.preSelectedVoices!.includes(v.id)
      );

      if (availablePreSelectedVoices.length > 0) {
        setSelectedVoiceIds(availablePreSelectedVoices.map(v => v.id));
        setPrimaryVoiceId(availablePreSelectedVoices[0].id);
      } else if (voices.length > 0) {
        // Fallback: use first available voice if pre-selected voices don't exist
        setSelectedVoiceIds([voices[0].id]);
        setPrimaryVoiceId(voices[0].id);
      }
    }
  }, [initialData?.preSelectedVoices, voices, selectedVoiceIds.length]);

  // Handle pre-selected primary goals from agent type detection
  useEffect(() => {
    if (initialData?.preSelectedGoals && initialData.preSelectedGoals.length > 0 && primaryOutcomes.length === 0) {
      setPrimaryOutcomes(initialData.preSelectedGoals);
    }
  }, [initialData?.preSelectedGoals, primaryOutcomes.length]);

  // Handle auto-generation of behavior when agent is created
  const [isGeneratingBehavior, setIsGeneratingBehavior] = useState(false);
  const behaviorGeneratedRef = React.useRef(false);

  // Store auto-generation config in sessionStorage when initialData is available
  useEffect(() => {
    if (initialData?.autoGenerateBehavior && initialData?.agentTypeConfig) {
      // Store with a pending key first, then update when agentId is available
      const pendingKey = 'agent_auto_generate_pending';
      sessionStorage.setItem(pendingKey, JSON.stringify({
        autoGenerateBehavior: true,
        agentTypeConfig: initialData.agentTypeConfig,
      }));
    }
  }, [initialData?.autoGenerateBehavior, initialData?.agentTypeConfig]);

  // Move pending config to agent-specific key when agentId is set
  useEffect(() => {
    if (agentId && agentId !== "new") {
      const pendingKey = 'agent_auto_generate_pending';
      const pending = sessionStorage.getItem(pendingKey);
      if (pending) {
        const storageKey = `agent_auto_generate_${agentId}`;
        sessionStorage.setItem(storageKey, pending);
        sessionStorage.removeItem(pendingKey);
      }
    }
  }, [agentId]);

  // Force behavior generation check when navigating to step 4
  const [forceBehaviorCheck, setForceBehaviorCheck] = useState(0);

  useEffect(() => {
    if (currentStep === 4 && agentId && agentId !== "new") {
      // Check if we should generate behavior
      const storageKey = `agent_auto_generate_${agentId}`;
      const stored = sessionStorage.getItem(storageKey);
      const shouldGenerate = stored && scenarios.length === 0 && phases.length === 0 && voiceTone.length === 0 && !behaviorGeneratedRef.current && !isGeneratingBehavior;

      if (shouldGenerate) {
        console.log("[Behavior Generation] Step 4 detected, forcing behavior check...");
        setForceBehaviorCheck(prev => prev + 1);
      }
    }
  }, [currentStep, agentId, scenarios.length, phases.length, voiceTone.length, isGeneratingBehavior]);

  useEffect(() => {
    const generateBehavior = async () => {
      // Get auto-generation config from initialData or sessionStorage
      let autoGenerateBehavior = initialData?.autoGenerateBehavior;
      let agentTypeConfig = initialData?.agentTypeConfig;

      // If not in initialData, try to get from sessionStorage
      if (!autoGenerateBehavior && agentId) {
        const storageKey = `agent_auto_generate_${agentId}`;
        const stored = sessionStorage.getItem(storageKey);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            autoGenerateBehavior = parsed.autoGenerateBehavior;
            agentTypeConfig = parsed.agentTypeConfig;
          } catch (e) {
            console.error("[Behavior Generation] Failed to parse stored config:", e);
          }
        }
      }

      console.log("[Behavior Generation] Checking conditions:", {
        agentId,
        autoGenerateBehavior,
        hasAgentTypeConfig: !!agentTypeConfig,
        behaviorGeneratedRef: behaviorGeneratedRef.current,
        isGeneratingBehavior,
        hasExistingBehaviors: scenarios.length > 0 || phases.length > 0 || voiceTone.length > 0,
        currentStep,
      });

      if (
        !agentId ||
        agentId === "new" ||
        !autoGenerateBehavior ||
        !agentTypeConfig ||
        behaviorGeneratedRef.current ||
        isGeneratingBehavior
      ) {
        console.log("[Behavior Generation] Skipping - conditions not met");
        return;
      }

      // Only generate if we don't have existing behaviors
      if (scenarios.length > 0 || phases.length > 0 || voiceTone.length > 0) {
        console.log("[Behavior Generation] Skipping - existing behaviors found");
        return;
      }

      // Generate when on step 4 OR if agent was just created (no behaviors exist)
      const shouldGenerate = currentStep === 4 || (scenarios.length === 0 && phases.length === 0 && voiceTone.length === 0);

      if (!shouldGenerate) {
        console.log("[Behavior Generation] Skipping - not on step 4 and behaviors exist");
        return;
      }

      console.log("[Behavior Generation] Starting behavior generation...");
      behaviorGeneratedRef.current = true;
      setIsGeneratingBehavior(true);

      try {
        const behaviorPrompt = agentTypeConfig.behaviorPrompt;
        console.log("[Behavior Generation] Calling generateBehaviour with:", { agentId, behaviorPrompt });
        const response = await agentsApi.generateBehaviour(agentId, behaviorPrompt);

        console.log("[Behavior Generation] Response received:", response);

        if (response.data) {
          // Add IDs to each entry
          const generatedData = {
            scenarios: response.data.scenarios?.map((s) => ({
              ...s,
              id: generateSectionEntryId(),
            })) || [],
            phases: response.data.phases?.map((p) => ({
              ...p,
              id: generateSectionEntryId(),
            })) || [],
            voiceTone: response.data.voiceTone?.map((v) => ({
              ...v,
              id: generateSectionEntryId(),
            })) || [],
          };

          console.log("[Behavior Generation] Generated data:", generatedData);

          // Apply generated behavior
          if (generatedData.scenarios.length > 0) {
            setScenarios(generatedData.scenarios);
          }
          if (generatedData.phases.length > 0) {
            setPhases(generatedData.phases);
          }
          if (generatedData.voiceTone.length > 0) {
            setVoiceTone(generatedData.voiceTone);
          }

          // Clear the stored config after successful generation
          if (agentId) {
            const storageKey = `agent_auto_generate_${agentId}`;
            sessionStorage.removeItem(storageKey);
          }

          toast({
            title: "Success",
            description: "Agent behavior generated successfully!",
          });
        } else {
          console.warn("[Behavior Generation] No data in response");
        }
      } catch (error: any) {
        console.error("[Behavior Generation] Error generating behavior:", error);
        behaviorGeneratedRef.current = false; // Allow retry on error
        toast({
          title: "Error",
          description: error?.response?.data?.status?.message || "Failed to generate behavior. You can generate it manually later.",
          variant: "destructive",
        });
      } finally {
        setIsGeneratingBehavior(false);
      }
    };

    generateBehavior();
  }, [agentId, initialData?.autoGenerateBehavior, initialData?.agentTypeConfig, scenarios.length, phases.length, voiceTone.length, isGeneratingBehavior, currentStep, forceBehaviorCheck, toast]);

  // Fetch user integrations
  useEffect(() => {
    const fetchIntegrations = async () => {
      setLoadingIntegrations(true);
      try {
        const response = await integrationsApi.list();
        if (response.data) {
          setUserIntegrations(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch integrations:', error);
      } finally {
        setLoadingIntegrations(false);
      }
    };
    fetchIntegrations();
  }, []);

  // Handle OAuth callback - restore wizard step and reopen integration modal
  useEffect(() => {
    const oauthSuccess = searchParams.get("oauth_success");
    const integrationType = searchParams.get("integration_type");

    if (oauthSuccess === "true" && integrationType) {
      // Restore the step from URL (should be step 5 for integrations)
      const stepFromUrl = searchParams.get("step");
      if (stepFromUrl) {
        const stepNum = parseInt(stepFromUrl, 10);
        if (!isNaN(stepNum)) {
          setCurrentStep(stepNum);
        }
      } else {
        // Default to integrations step (step 5) if not in URL
        setCurrentStep(5);
      }

      // Remove OAuth query parameters after handling
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("oauth_success");
        newParams.delete("integration_type");
        // Keep step and slug parameters
        return newParams;
      });

      // Open the integration modal and select the integration
      // Small delay to ensure state is updated
      setTimeout(async () => {
        await integrationHook.selectIntegrationToAdd(integrationType);
      }, 300);
    }
  }, [searchParams, setSearchParams, integrationHook]);

  // Fetch or create API key for widget preview
  useEffect(() => {
    const fetchOrCreateApiKey = async () => {
      try {
        const response = await apiKeysApi.list();
        const existingKeys = response.data || [];

        // Look for an existing widget API key by name first
        let widgetKey = existingKeys.find(
          (key) => key.name === 'Widget API Key'
        );

        // If no widget key exists, use any existing key
        if (!widgetKey && existingKeys.length > 0) {
          widgetKey = existingKeys[0]; // Use the first available key
        }

        // Only create if no keys exist at all
        if (!widgetKey) {
          const createResponse = await apiKeysApi.create({
            name: 'Widget API Key',
            key_type: 'public',
            transient_assistant: false,
          });
          if (createResponse.data) {
            setApiKey(createResponse.data.key_value);
          }
        } else {
          setApiKey(widgetKey.key_value);
        }
      } catch (error) {
        console.error('Failed to fetch/create API key:', error);
      }
    };
    fetchOrCreateApiKey();
  }, []);

  // Handle live widget preview
  const handleLiveWidgetPreview = async () => {
    if (!agentData?.elevenlabs_agent_id) {
      toast({
        title: "Deploy first",
        description: "Publish the agent before previewing the widget.",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "Widget preview unavailable",
        description: "Could not load the widget API key. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    try {
      await loadAndOpenWidget({
        agentId: agentData.elevenlabs_agent_id,
        apiKey: apiKey,
        apiBaseUrl: getBackendBaseUrl(),
        title: widgetConfig.title,
        subtitle: widgetConfig.subtitle,
        buttonText: widgetConfig.buttonText,
        welcomeMessage: widgetConfig.welcomeMessage,
        iconType: widgetConfig.iconType,
        customIconUrl: widgetConfig.customIconUrl,
        position: widgetConfig.position,
        widgetSize: widgetConfig.widgetSize,
        primaryColor: widgetConfig.primaryColor,
        primaryTextColor: widgetConfig.primaryTextColor,
        backgroundColor: widgetConfig.backgroundColor,
        textColor: widgetConfig.textColor,
        borderColor: widgetConfig.borderColor,
        userBubbleColor: widgetConfig.userBubbleColor,
        agentBubbleColor: widgetConfig.agentBubbleColor,
        borderRadius: widgetConfig.borderRadius,
      });
    } catch (error) {
      console.error("Failed to open widget preview:", error);
      toast({
        title: "Preview failed",
        description: error instanceof Error ? error.message : "Could not open the widget preview.",
        variant: "destructive",
      });
    }
  };

  const handleSetStep = (direction: -1 | 1) => {
    const minStep = 0; // Template step is first
    const maxStep = 5; // Integrations step is the last step

    // Prevent going back from step 0 or step 1 to step 0
    if ((currentStep === minStep && direction === -1) || (currentStep === 1 && direction === -1) || (currentStep === maxStep && direction === 1)) {
      return;
    }

    const nextStep = currentStep + direction;
    setCurrentStep(nextStep);
  };

  const handleSaveStep = async () => {
    // Show validation errors for Call Outcomes step if on that step
    if (currentStep === 3) {
      setShowCallOutcomesValidation(true);
      if (!isStepValid()) {
        setSaving(false);
        return;
      }
    }
    setSaving(true);
    try {
      // Serialize section entries using imported helper
      const serializedScenarios = serializeSectionEntries(scenarios);
      const serializedPhases = serializeSectionEntries(phases);
      const serializedTone = serializeSectionEntries(voiceTone);

      // Format integration tools for API
      const integrationToolsPayload: Record<string, { enabled: boolean; enabled_tools: string[] }> = {};
      integrationHook.agentIntegrationTools.forEach(tool => {
        if (tool.enabled) {
          if (!integrationToolsPayload[tool.integration_type]) {
            integrationToolsPayload[tool.integration_type] = { enabled: true, enabled_tools: [] };
          }
          integrationToolsPayload[tool.integration_type].enabled_tools.push(tool.tool_name);
        }
      });

      const config: Record<string, unknown> = {
        conversation_config: {
          model: {
            model: selectedModel,
            provider: selectedProvider,
            messages: [
              {
                role: "system",
                content: systemPrompt
              }
            ]
          },
          // Save the template prompt if provided (from template selection, loaded template, or user edits)
          ...(systemPromptTemplate && systemPromptTemplate.trim() ? {
            system_prompt_template: systemPromptTemplate.trim()
          } : {}),
          // Store behaviour reference and config (either from template or default)
          ...(behaviourConfig && currentBehaviourId ? {
            agent_behaviour_id: currentBehaviourId,
            // Also store the config for useAgentData to use section labels
            agent_behaviour_config: behaviourConfig,
          } : {}),
          // Include section entries in prompt_sections (matching useAgentData.ts structure)
          prompt_sections: {
            scenarios: serializedScenarios,
            phases: serializedPhases,
            voiceTone: serializedTone,
          },
          transcriber: {
            provider: "elevenlabs",
            languages: selectedLanguages.length > 0 ? selectedLanguages.map(normalizeLanguage) : ["en"],
            default_language: defaultLanguage ? normalizeLanguage(defaultLanguage) : (selectedLanguages.length > 0 ? normalizeLanguage(selectedLanguages[0]) : "en"),
            // Keep language for backward compatibility
            language: defaultLanguage ? normalizeLanguage(defaultLanguage) : (selectedLanguages.length > 0 ? normalizeLanguage(selectedLanguages[0]) : "en"),
            model: "flux-general",
          },
          // Always include languages array at top level (required for Voice and Language steps)
          ...(selectedLanguages.length > 0 ? {
            languages: selectedLanguages.map(normalizeLanguage),
            default_language: defaultLanguage ? normalizeLanguage(defaultLanguage) : normalizeLanguage(selectedLanguages[0]),
            // Keep language for backward compatibility
            language: defaultLanguage ? normalizeLanguage(defaultLanguage) : normalizeLanguage(selectedLanguages[0]),
          } : {}),
          // Always include voice_ids array if selected (required for Voice and Language steps)
          ...(selectedVoiceIds.length > 0 ? {
            voice_ids: selectedVoiceIds,
            // Use primary voice if set, otherwise use first voice
            primary_voice_id: primaryVoiceId || selectedVoiceIds[0],
            // Keep voice_id for backward compatibility (use primary voice)
            voice_id: primaryVoiceId || selectedVoiceIds[0],
            voice: {
              voice_id: primaryVoiceId || selectedVoiceIds[0],
            }
          } : {}),
          // Include first message if provided
          ...(firstMessage && firstMessage.trim() ? {
            first_message: firstMessage.trim(),
            first_message_mode: "assistant-speaks-first"
          } : {}),
          // Include webhook tools and integration tools in conversation_config
          ...(webhookTools.length > 0 ? { webhook_tools: webhookTools } : {}),
          ...(Object.keys(integrationToolsPayload).length > 0 ? { integration_tools: integrationToolsPayload } : {}),
          system_tools: {
            end_call: { active: true, description: "Ends the call when the conversation is finished.", disable_interruptions: false },
            voicemail_detection: { active: true, description: "Detects if the call was answered by a voicemail.", disable_interruptions: false }
          },
        },
        system_tools: {
          end_call: { active: true, description: "Ends the call when the conversation is finished.", disable_interruptions: false },
          voicemail_detection: { active: true, description: "Detects if the call was answered by a voicemail.", disable_interruptions: false }
        },
        platform_settings: {
          ...(selectedVoiceIds.length > 0 && { voice_id: primaryVoiceId || selectedVoiceIds[0] }),
          language: defaultLanguage ? normalizeLanguage(defaultLanguage) : (selectedLanguages.length > 0 ? normalizeLanguage(selectedLanguages[0]) : "en")
        },
        // Also include at top level for backward compatibility
        ...(webhookTools.length > 0 ? { webhook_tools: webhookTools } : {}),
        ...(Object.keys(integrationToolsPayload).length > 0 ? { integration_tools: integrationToolsPayload } : {}),
      };

      let savedAgentId = agentId;

      if (agentId) {
        // Update existing agent
        const response = await agentsApi.update(agentId, {
          name: name.trim(),
          ...config
        });
        if (response.data) {
          savedAgentId = response.data.id;
          // Update slug if available
          if (response.data.slug) {
            setAgentSlug(response.data.slug);
          }
          // Fetch full agent data for preview
          try {
            const agentResponse = await agentsApi.get(response.data.id);
            if (agentResponse.data) {
              setAgentData(agentResponse.data);
              // Update slug if it's now available
              if (agentResponse.data.slug) {
                setAgentSlug(agentResponse.data.slug);
              }
              // Load widget config from agent
              const loadedConfig = toFullConfig(agentResponse.data.widget_config);
              setWidgetConfig(loadedConfig);
            }
          } catch (err) {
            console.error('Failed to fetch agent data:', err);
          }
        } else {
          throw new Error('Failed to update agent');
        }
      } else {
        // Create new agent
        // Note: We don't add integration_tools here even if initialData.integrationTools exists
        // because those are just "required" integrations for the template, not actually connected yet
        // The user needs to connect them manually in the integrations step
        const createParams = {
          name: name.trim(),
          ...config,
        };

        const response = await agentsApi.create(createParams);
        if (response.data) {
          savedAgentId = response.data.id;
          setAgentId(response.data.id);
          // Update URL with agent slug for persistence
          const slug = response.data.slug || response.data.id; // Fallback to ID if slug not available yet
          setAgentSlug(slug);
          setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('slug', slug);
            newParams.set('step', currentStep.toString());
            return newParams;
          });
          // Fetch full agent data for preview
          try {
            const agentResponse = await agentsApi.get(response.data.id);
            if (agentResponse.data) {
              setAgentData(agentResponse.data);
              // Update slug if it's now available
              if (agentResponse.data.slug) {
                setAgentSlug(agentResponse.data.slug);
              }
              // Load widget config from agent
              const loadedConfig = toFullConfig(agentResponse.data.widget_config);
              setWidgetConfig(loadedConfig);
            }
          } catch (err) {
            console.error('Failed to fetch agent data:', err);
          }

          // Auto-generate workflow if agent was created from AssistantsList with agent type
          // Skip workflow inference for types that have backend defaults
          if (initialData?.agentType && savedAgentId) {
            const typesWithBackendDefaults = ['appointment_booking', 'lead_generation', 'product_information'];
            if (typesWithBackendDefaults.includes(initialData.agentType)) {
              // Backend will create default workflows, skip frontend inference
              console.log('[CreateAgentWizard] Skipping frontend workflow inference for', initialData.agentType, '- backend will create defaults');
            } else {
              try {
                // Type guard to ensure agentType is a valid AgentType
                const validAgentTypes = [
                  "customer_support",
                  "sales_calls",
                  "technical_support",
                ] as const;

                if (validAgentTypes.includes(initialData.agentType as any)) {
                  const workflow = inferWorkflowFromAgentType(
                    initialData.agentType as import("@/utils/agentTypeDetection").AgentType,
                    name.trim()
                  );
                  await workflowsApi.create(savedAgentId, {
                    name: workflow.name,
                    description: workflow.description,
                    tool_chain: workflow.toolChain,
                    trigger_phrases: workflow.triggerPhrases,
                    enabled: true,
                  });
                  console.log('[CreateAgentWizard] Auto-generated workflow for agent type:', initialData.agentType);
                }
              } catch (error) {
                console.error('[CreateAgentWizard] Failed to create workflow:', error);
                // Don't block agent creation if workflow fails
              }
            }
          }
        } else {
          throw new Error('Failed to create agent');
        }
      }

      // Only sync with ElevenLabs on Voice & Language step (step 3, index 2)
      // Steps array: [0: Name, 1: Model, 2: Voice & Language, 3: Call Outcomes, 4: Agent Behaviour, 5: Integrations]
      const shouldSyncWithElevenLabs = currentStep === 2;

      // Ensure voice_ids are set before syncing (required for ElevenLabs)
      const hasRequiredFields = shouldSyncWithElevenLabs ? selectedVoiceIds.length > 0 : true;

      if (shouldSyncWithElevenLabs && savedAgentId && hasRequiredFields) {
        // Small delay to ensure database transaction is committed
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
          console.log(`[CreateAgentWizard] Syncing with ElevenLabs for step ${currentStep} (${steps[currentStep].label}), agent ID: ${savedAgentId}`);
          console.log(`[CreateAgentWizard] Current config - Voice IDs: ${selectedVoiceIds.join(', ')}, Languages: ${selectedLanguages.join(', ')}`);
          console.log(`[CreateAgentWizard] Full config being sent:`, JSON.stringify(config, null, 2));

          const publishResponse = await agentsApi.publish(savedAgentId);
          console.log('[CreateAgentWizard] Publish response:', publishResponse);

          if (publishResponse.data) {
            toast({
              title: 'Success',
              description: `${steps[currentStep].label} saved successfully.`,
            });
          } else {
            throw new Error('Publish response did not return agent data');
          }
        } catch (publishErr) {
          console.error('[CreateAgentWizard] Failed to save data:', publishErr);
          const errorMessage = publishErr instanceof Error ? publishErr.message : 'Unknown error';
          // If publish fails, still show success for database save but warn about ElevenLabs
          toast({
            title: 'Partially saved',
            description: `${steps[currentStep].label} saved to database, but failed to sync with ElevenLabs: ${errorMessage}`,
            variant: 'destructive',
          });
          // Don't re-throw - allow user to continue even if sync fails
        }

      } else if (shouldSyncWithElevenLabs && !hasRequiredFields) {
        // Voice/Language step but missing required fields
        toast({
          title: 'Warning',
          description: `${steps[currentStep].label} saved to database, but cannot sync with ElevenLabs: Voice ID is required.`,
          variant: 'destructive',
        });
      } else if (currentStep === 3) {
        // Call Outcomes step - save outcome definition and escalation rules
        console.log(`[CreateAgentWizard] Saving Call Outcomes data for step ${currentStep}, agent ID: ${savedAgentId}`);

        try {
          // Save outcome definition if at least one primary outcome is set
          if (primaryOutcomes && primaryOutcomes.length > 0) {
            const outcomeData = {
              primary_outcome: primaryOutcomes[0],
              secondary_outcomes: primaryOutcomes.slice(1),
              success_conditions: {
                keywords: successKeywords.filter(k => k.trim()),
              },
              failure_conditions: {
                failure_keywords: failureKeywords.filter(k => k.trim()),
              },
              escalation_rules: {
                escalation_keywords: escalationRuleSettings.escalation_keywords?.filter(k => k.trim()) || [],
                name: escalationRuleSettings.name,
                description: escalationRuleSettings.description,
                disableInterruptions: escalationRuleSettings.disableInterruptions,
                humanTransferRules: escalationRuleSettings.humanTransferRules || [],
              },
            };

            try {
              await outcomeDefinitionsApi.create(savedAgentId, outcomeData);
              console.log('[CreateAgentWizard] Outcome definition created successfully');
            } catch (outcomeErr: unknown) {
              // If it already exists, try to update it
              const errorWithStatus = outcomeErr as { response?: { status?: number }; status?: number };
              const status = errorWithStatus?.response?.status || errorWithStatus?.status;
              if (status === 422 || status === 409) {
                // Try to update existing outcome definition
                try {
                  await outcomeDefinitionsApi.update(savedAgentId, outcomeData);
                  console.log('[CreateAgentWizard] Outcome definition updated successfully');
                } catch (updateErr) {
                  console.error('[CreateAgentWizard] Failed to update outcome definition:', updateErr);
                }
              } else {
                console.error('[CreateAgentWizard] Failed to create outcome definition:', outcomeErr);
              }
            }
          }

          // Save escalation rules to system_tools if human transfer rules exist
          const hasHumanTransferRules = escalationRuleSettings.humanTransferRules &&
            escalationRuleSettings.humanTransferRules.length > 0 &&
            escalationRuleSettings.humanTransferRules.some(rule =>
              rule.phoneNumber && rule.phoneNumber.trim() !== ''
            );

          if (hasHumanTransferRules) {
            // Enable transfer_to_number system tool and save settings in the correct format
            const systemToolsPayload = {
              transfer_to_number: {
                active: true,
                description: escalationRuleSettings.description || '',
                disable_interruptions: escalationRuleSettings.disableInterruptions || false,
                human_transfer_rules: escalationRuleSettings.humanTransferRules || [],
              },
            };

            // Update agent with system tools (cast as unknown since UpdateAgentParams doesn't include system_tools)
            await agentsApi.update(savedAgentId, {
              system_tools: systemToolsPayload,
            } as unknown as Parameters<typeof agentsApi.update>[1]);

            // Sync with ElevenLabs after saving escalation rules
            await new Promise(resolve => setTimeout(resolve, 100));
            try {
              const publishResponse = await agentsApi.publish(savedAgentId);
              console.log('[CreateAgentWizard] Published with escalation rules:', publishResponse);
            } catch (publishErr) {
              console.error('[CreateAgentWizard] Failed to sync escalation rules with ElevenLabs:', publishErr);
            }
          }

          toast({
            title: 'Success',
            description: `${steps[currentStep].label} saved successfully.`,
          });
        } catch (err) {
          console.error('[CreateAgentWizard] Error saving call outcomes data:', err);
          toast({
            title: 'Warning',
            description: `${steps[currentStep].label} saved, but some data may not have been saved correctly.`,
            variant: 'destructive',
          });
        }
      } else {
        // For Name and Model steps, just show success for database save
        console.log(`[CreateAgentWizard] Skipping ElevenLabs sync for step ${currentStep} (${steps[currentStep].label})`);
        toast({
          title: 'Success',
          description: `${steps[currentStep].label} saved successfully.`,
        });
      }

      // Steps: [0: Name, 1: Model, 2: Voice & Language, 3: Call Outcomes, 4: Agent Behaviour, 5: Integrations]
      // Integrations step is at index 5 (step 6 when counting from 1)
      const integrationsStep = 5;

      console.log('[CreateAgentWizard] Step navigation:', {
        currentStep,
        integrationsStep,
        hasRequiredIntegrations,
        requiredIntegrations,
        templateTitle: template?.title,
        initialDataIntegrationTools: initialData?.integrationTools
      });

      if (currentStep === integrationsStep) {
        // On integrations step, save the final configuration, publish, and then redirect to assistant details
        // The agent should already be saved, but ensure we publish with latest config
        if (savedAgentId) {
          // Publish the agent with the latest configuration (including integrations)
          try {
            console.log(`[CreateAgentWizard] Publishing agent on integrations step completion, agent ID: ${savedAgentId}`);
            const publishResponse = await agentsApi.publish(savedAgentId);
            console.log('[CreateAgentWizard] Publish response:', publishResponse);

            if (publishResponse.data) {
              // Fetch the latest agent data to get the slug
              const agentResponse = await agentsApi.get(savedAgentId);
              if (agentResponse.data) {
                const finalSlug = agentResponse.data.slug || savedAgentId;
                setAgentSlug(finalSlug);
                toast({
                  title: 'Success',
                  description: 'Agent saved and published successfully.',
                });
                // Redirect to assistant detail page
                onComplete(finalSlug);
                return; // Exit early after redirect
              }
            } else {
              throw new Error('Publish response did not return agent data');
            }
          } catch (publishErr) {
            console.error('[CreateAgentWizard] Failed to publish agent:', publishErr);
            const errorMessage = publishErr instanceof Error ? publishErr.message : 'Unknown error';

            // Still try to redirect even if publish fails
            try {
              const agentResponse = await agentsApi.get(savedAgentId);
              if (agentResponse.data) {
                const finalSlug = agentResponse.data.slug || savedAgentId;
                setAgentSlug(finalSlug);
                toast({
                  title: 'Partially saved',
                  description: `Agent saved to database, but failed to publish: ${errorMessage}. You can publish manually from the assistant details page.`,
                  variant: 'destructive',
                });
                onComplete(finalSlug);
                return;
              }
            } catch (err) {
              console.error('Failed to fetch agent for redirect:', err);
            }

            // Fall back to using what we have
            const agentIdentifier = agentSlug || savedAgentId;
            if (agentIdentifier) {
              toast({
                title: 'Partially saved',
                description: `Agent saved to database, but failed to publish: ${errorMessage}. You can publish manually from the assistant details page.`,
                variant: 'destructive',
              });
              onComplete(agentIdentifier);
              return;
            }
          }
        }

        // If we get here, something went wrong
        toast({
          title: 'Error',
          description: 'Agent identifier not found. Please try again.',
          variant: 'destructive',
        });
        return; // Don't continue if we can't redirect
      } else {
        // Move to next step
        const nextStep = currentStep + 1;
        console.log('[CreateAgentWizard] Moving to next step:', nextStep);
        setCurrentStep(nextStep);
        // Reset validation errors when changing steps
        setShowCallOutcomesValidation(false);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const isStepValid = () => {
    // Step 0 = Template, 1 = Model, 2 = Voice & Language, 3 = Call Outcomes, 4 = Agent Behaviour, 5 = Integrations
    switch (currentStep) {
      case 0: // Template step
        return name.trim() !== "";
      case 1: // Model step
        return selectedModel.trim() !== "" && systemPrompt.trim() !== "";
      case 2: // Voice & Language step
        return selectedVoiceIds.length > 0 && selectedLanguages.length > 0;
      case 3: { // Call Outcomes step
        // At least one primary outcome is required
        if (!primaryOutcomes || primaryOutcomes.length === 0) {
          return false;
        }
        // Validate escalation rules if any exist
        const hasEscalationRules = escalationRuleSettings.humanTransferRules && escalationRuleSettings.humanTransferRules.length > 0;
        if (hasEscalationRules) {
          return escalationRuleSettings.humanTransferRules.every(rule =>
            rule.phoneNumber.trim() !== "" && rule.condition.trim() !== ""
          );
        }
        return true;
      }
      case 4: // Agent Behaviour step (optional - can skip)
        return true; // Agent behaviour is optional
      case 5: // Integrations step
        return true; // Integrations step is always valid (optional to connect)
      default:
        return false;
    }
  };

  const selectedVoices = voices.filter(v => selectedVoiceIds.includes(v.id));

  // Transform agentIntegrationTools array to Record format for AgentIntegrationToolsSection
  const agentIntegrationToolsRecord = React.useMemo(() => {
    const record: Record<string, { enabled: boolean; enabledTools: string[] }> = {};

    integrationHook.agentIntegrationTools.forEach(tool => {
      if (!record[tool.integration_type]) {
        record[tool.integration_type] = {
          enabled: true,
          enabledTools: [],
        };
      }
      if (tool.enabled) {
        record[tool.integration_type].enabledTools.push(tool.tool_name);
      }
    });

    return record;
  }, [integrationHook.agentIntegrationTools]);

  // Auto-expand newly added integrations
  React.useEffect(() => {
    const currentIntegrationTypes = new Set(Object.keys(agentIntegrationToolsRecord));
    const previousIntegrationTypes = previousIntegrationToolsRef.current;

    // Find newly added integrations
    currentIntegrationTypes.forEach(integrationType => {
      if (!previousIntegrationTypes.has(integrationType)) {
        // New integration added, expand it
        setIntegrationToolsExpanded(prev => ({
          ...prev,
          [integrationType]: true
        }));
        // Also ensure the section is expanded
        setIntegrationToolsSectionExpanded(true);
      }
    });

    // Update ref for next comparison
    previousIntegrationToolsRef.current = currentIntegrationTypes;
  }, [agentIntegrationToolsRecord]);

  const renderStepContent = () => {
    // Step 0 = Template, 1 = Model, 2 = Voice & Language, 3 = Call Outcomes, 4 = Agent Behaviour, 5 = Integrations
    switch (currentStep) {
      case 0: // Template step
        return (
          <TemplateStep
            assistantName={name}
            onAssistantNameChange={setName}
            selectedTemplate={selectedTemplate}
            onTemplateSelect={handleTemplateSelect}
            templates={templates}
            templatesLoading={templatesLoading}
            iconMap={iconMap}
          />
        );
      case 1: // Model step
        return (
          <ModelStep
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onProviderChange={setSelectedProvider}
            onModelChange={setSelectedModel}
          />
        );
      case 2: // Voice & Language step
        return (
          <VoiceLanguageStep
            selectedVoiceIds={selectedVoiceIds}
            primaryVoiceId={primaryVoiceId}
            voices={voices}
            loadingVoices={loadingVoices}
            showVoiceSelector={showVoiceSelector}
            onShowVoiceSelectorChange={setShowVoiceSelector}
            onSelectVoices={(voiceIds) => {
              setSelectedVoiceIds(voiceIds);
              // If current primary voice is still in the list, keep it; otherwise use first voice
              const newPrimary = primaryVoiceId && voiceIds.includes(primaryVoiceId)
                ? primaryVoiceId
                : (voiceIds.length > 0 ? voiceIds[0] : undefined);
              setPrimaryVoiceId(newPrimary);
              setShowVoiceSelector(false);
            }}
            onSetPrimaryVoice={(voiceId) => {
              if (selectedVoiceIds.includes(voiceId)) {
                setPrimaryVoiceId(voiceId);
              }
            }}
            playingVoiceId={playingVoiceId}
            onPlayPreview={handlePlayPreview}
            voiceSearchQuery={voiceSearchQuery}
            onVoiceSearchChange={setVoiceSearchQuery}
            selectedLanguages={selectedLanguages}
            defaultLanguage={defaultLanguage}
            showLanguageSelector={showLanguageSelector}
            onShowLanguageSelectorChange={setShowLanguageSelector}
            onSelectLanguages={(languages, defaultLang) => {
              setSelectedLanguages(languages);
              setDefaultLanguage(defaultLang);
            }}
            onSetDefaultLanguage={(lang) => {
              if (selectedLanguages.some(l => normalizeLanguage(l) === lang)) {
                setDefaultLanguage(lang);
              }
            }}
            languageSearchQuery={languageSearchQuery}
            onLanguageSearchChange={setLanguageSearchQuery}
          />
        );
      case 3: // Call Outcomes step
        return (
          <CallOutcomesStep
            primaryOutcomes={primaryOutcomes}
            onPrimaryOutcomesChange={setPrimaryOutcomes}
            escalationRuleSettings={escalationRuleSettings}
            onEscalationRuleSettingsChange={setEscalationRuleSettings}
            successKeywords={successKeywords}
            onSuccessKeywordsChange={setSuccessKeywords}
            failureKeywords={failureKeywords}
            onFailureKeywordsChange={setFailureKeywords}
            showValidationErrors={showCallOutcomesValidation}
          />
        );
      case 4: // Agent Behaviour step
        return (
          <>
            {isGeneratingBehavior && (
              <div className="flex items-center justify-center py-8 mb-4 bg-primary/5 rounded-lg border border-primary/20">
                <Loader2 className="h-5 w-5 animate-spin text-primary mr-3" />
                <span className="text-sm text-muted-foreground">Generating agent behavior...</span>
              </div>
            )}
            <AgentBehaviourStep
              scenarios={scenarios}
              phases={phases}
              voiceTone={voiceTone}
              behaviourConfig={behaviourConfig}
              onOpenSectionModal={openSectionModal}
              onDeleteSectionEntry={deleteSectionEntry}
              onApplyGeneratedBehaviour={(data) => {
                // Replace existing behaviors with generated ones
                if (data.scenarios) {
                  setScenarios(data.scenarios);
                }
                if (data.phases) {
                  setPhases(data.phases);
                }
                if (data.voiceTone) {
                  setVoiceTone(data.voiceTone);
                }
              }}
              agentId={agentId || undefined}
              systemPromptTemplate={systemPromptTemplate}
              onSystemPromptTemplateChange={setSystemPromptTemplate}
            />
          </>
        );
      case 5: // Integrations step
        // Get connected integration types for suggestions
        const connectedIntegrationTypes = Object.keys(agentIntegrationToolsRecord);

        return (
          <div className="space-y-4">
            {/* Integration Suggestions */}
            <IntegrationSuggestions
              connectedIntegrations={connectedIntegrationTypes}
              onActionClick={(action, integrationType) => {
                // Handle suggestion actions
                if (action === "Set up SMS" || action === "Add SMS") {
                  integrationHook.selectIntegrationToAdd("twilio");
                } else if (action === "Add Calendar" || action === "Connect Calendar") {
                  integrationHook.selectIntegrationToAdd("calcom");
                } else if (action === "Create Workflow") {
                  // Could open workflow creation modal
                  toast({
                    title: "Workflow Creation",
                    description: "Use 'Add Workflow' button to create automated workflows.",
                  });
                }
              }}
            />

            <AgentIntegrationToolsSection
              agentIntegrationTools={agentIntegrationToolsRecord}
              integrationToolsSectionExpanded={integrationToolsSectionExpanded}
              integrationToolsExpanded={integrationToolsExpanded}
              agentFunctionsRefreshKey={agentFunctionsRefreshKey}
              onToggleSectionExpanded={() => setIntegrationToolsSectionExpanded(prev => !prev)}
              onToggleIntegrationExpanded={(integrationType) => {
                setIntegrationToolsExpanded(prev => ({
                  ...prev,
                  [integrationType]: !prev[integrationType]
                }));
              }}
              onOpenAddIntegrationModal={async () => {
                // The AgentIntegrationToolsSection now handles workflow creation internally
                // This handler is kept for backward compatibility but workflow creation
                // is handled by the CreateWorkflowFromScratchModal in AgentIntegrationToolsSection
                // If agent is not saved yet, prompt user to save first
                if (!agentId || agentId === "new") {
                  toast({
                    title: "Save agent first",
                    description: "Please save the agent before creating workflows.",
                    variant: "default",
                  });
                }
              }}
              onOpenEditIntegrationModal={async (integrationType) => {
                const userIntegration = userIntegrations.find(i => i.integration_type === integrationType);
                if (userIntegration) {
                  await integrationHook.openEditIntegrationModal(userIntegration);
                } else {
                  // If integration doesn't exist, open add modal
                  await integrationHook.selectIntegrationToAdd(integrationType);
                }
              }}
              onDeleteIntegration={async (integrationType) => {
                // Remove integration from agent (local state only if no agentId, or via API if agentId exists)
                if (agentId && agentId !== "new") {
                  try {
                    // Delete from backend if agent exists
                    await integrationsApi.deleteFromAgent(agentId, integrationType);

                    // Remove from local state
                    const updatedIntegrationTools = integrationHook.agentIntegrationTools.filter(
                      tool => tool.integration_type !== integrationType
                    );
                    integrationHook.setAgentIntegrationTools(updatedIntegrationTools);

                    // Get the display names for tools of this integration type
                    const toolDisplayNames = INTEGRATION_TOOLS_DISPLAY[integrationType as keyof typeof INTEGRATION_TOOLS_DISPLAY] || [];

                    // Remove all webhook tools associated with this integration
                    const updatedWebhookTools = webhookTools.filter(
                      wt => !toolDisplayNames.includes(wt.name)
                    );
                    setWebhookTools(updatedWebhookTools);

                    toast({
                      title: "Success",
                      description: "Integration removed from agent. Credentials kept."
                    });
                  } catch (error) {
                    console.error("Failed to remove integration:", error);
                    toast({
                      title: "Error",
                      description: "Failed to remove integration.",
                      variant: "destructive"
                    });
                  }
                } else {
                  // For new agents, just remove from local state
                  const updatedIntegrationTools = integrationHook.agentIntegrationTools.filter(
                    tool => tool.integration_type !== integrationType
                  );
                  integrationHook.setAgentIntegrationTools(updatedIntegrationTools);

                  // Get the display names for tools of this integration type
                  const toolDisplayNames = INTEGRATION_TOOLS_DISPLAY[integrationType as keyof typeof INTEGRATION_TOOLS_DISPLAY] || [];

                  // Remove all webhook tools associated with this integration
                  const updatedWebhookTools = webhookTools.filter(
                    wt => !toolDisplayNames.includes(wt.name)
                  );
                  setWebhookTools(updatedWebhookTools);

                  toast({
                    title: "Success",
                    description: "Integration removed from agent."
                  });
                }
              }}
              onToggleTool={async (integrationType, displayName, enabled) => {
                // Toggle tool enable/disable
                const actionName = displayNameToActionName(displayName, integrationType);
                const updatedTools = integrationHook.agentIntegrationTools.map(tool => {
                  if (tool.integration_type === integrationType && tool.tool_name === actionName) {
                    return { ...tool, enabled };
                  }
                  return tool;
                });

                // If tool doesn't exist, add it
                const existingTool = updatedTools.find(
                  t => t.integration_type === integrationType && t.tool_name === actionName
                );

                if (!existingTool) {
                  updatedTools.push({
                    integration_type: integrationType,
                    tool_name: actionName,
                    enabled: true,
                  });
                }

                integrationHook.setAgentIntegrationTools(updatedTools);

                // Update webhook tools if agent exists
                if (agentId && agentId !== "new") {
                  // Save to backend
                  const integrationToolsPayload: Record<string, { enabled: boolean; enabled_tools: string[] }> = {};
                  updatedTools.forEach(tool => {
                    if (tool.enabled) {
                      if (!integrationToolsPayload[tool.integration_type]) {
                        integrationToolsPayload[tool.integration_type] = { enabled: true, enabled_tools: [] };
                      }
                      integrationToolsPayload[tool.integration_type].enabled_tools.push(tool.tool_name);
                    }
                  });

                  try {
                    await agentsApi.update(agentId, {
                      integration_tools: integrationToolsPayload,
                    } as any);
                  } catch (error) {
                    console.error("Failed to update integration tools:", error);
                  }
                }
              }}
              INTEGRATION_TOOLS_DISPLAY={INTEGRATION_TOOLS_DISPLAY}
              getIntegrationIcon={getIntegrationIcon}
              formatToolName={formatToolName}
              displayNameToActionName={displayNameToActionName}
              userIntegrations={userIntegrations as any}
              agentId={agentId || undefined}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // Show loading state when restoring agent data
  if (loadingAgent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 h-full w-full">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground mt-4">Loading your assistant...</p>
        </div>
      </div>
    );
  }

  // Build wizard context value
  const wizardContextValue: WizardContextValue = {
    currentStep,
    formValues: {
      name,
      templateId: selectedTemplate,
      provider: selectedProvider,
      model: selectedModel,
      voiceIds: selectedVoiceIds,
      languages: selectedLanguages,
      scenarios,
      phases,
      voiceTone,
      callOutcomes: primaryOutcomes,
      integrationTools: integrationHook.agentIntegrationTools.reduce((acc, tool) => {
        if (!acc[tool.integration_type]) {
          acc[tool.integration_type] = { enabled: tool.enabled, enabled_tools: [] };
        }
        if (tool.enabled) {
          acc[tool.integration_type].enabled_tools.push(tool.tool_name);
        }
        return acc;
      }, {} as Record<string, { enabled: boolean; enabled_tools: string[] }>),
    },
    isAgentCreated: !!agentId && agentId !== "new",
    agentId: agentId || null,
    agentSlug: agentSlug || null,
    availableActions: (() => {
      const actions = ["back", "save"];
      if (currentStep === 0) {
        actions.push("select-template", "name");
      } else if (currentStep === 1) {
        actions.push("provider", "model");
      } else if (currentStep === 2) {
        actions.push("voice", "language");
      } else if (currentStep === 5) {
        actions.push("open-integration-modal", "integration_modal");
      }
      return actions;
    })(),
    navigateToStep: (step: number) => {
      // Prevent navigating to step 0 from step 1
      if (currentStep === 1 && step === 0) {
        return;
      }
      if (step >= 0 && step < steps.length) {
        setCurrentStep(step);
      }
    },
    goToNextStep: () => handleSetStep(1),
    goToPreviousStep: () => handleSetStep(-1),
    updateFormValue: (key: string, value: any) => {
      switch (key) {
        case "name":
          setName(value);
          break;
        case "templateId":
          setSelectedTemplate(value);
          break;
        case "provider":
          setSelectedProvider(value);
          break;
        case "model":
          setSelectedModel(value);
          break;
        // Add more cases as needed
      }
    },
    updateFormValues: (values: any) => {
      Object.entries(values).forEach(([key, value]) => {
        wizardContextValue.updateFormValue(key, value);
      });
    },
    clickButton: async (buttonId: string) => {
      if (buttonId === "back") {
        handleSetStep(-1);
      } else if (buttonId === "save" || buttonId === "next") {
        await handleSaveStep();
      } else {
        // Try to find and click button via DOM
        const button = document.querySelector(`[data-wizard-action="${buttonId}"]`) as HTMLElement;
        if (button) {
          button.click();
        }
      }
    },
    fillField: async (fieldId: string, value: any) => {
      wizardContextValue.updateFormValue(fieldId, value);
      // Also trigger DOM update
      const field = document.querySelector(`[data-wizard-field="${fieldId}"]`) as HTMLInputElement;
      if (field) {
        field.value = String(value);
        field.dispatchEvent(new Event("input", { bubbles: true }));
        field.dispatchEvent(new Event("change", { bubbles: true }));
      }
    },
    selectOption: async (fieldId: string, value: any) => {
      wizardContextValue.updateFormValue(fieldId, value);
      // Also trigger DOM update
      const select = document.querySelector(`[data-wizard-field="${fieldId}"]`) as HTMLSelectElement;
      if (select) {
        select.value = String(value);
        select.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        // Try button selection
        const button = document.querySelector(`[data-wizard-action="${fieldId}"][data-wizard-value="${value}"]`) as HTMLElement;
        if (button) {
          button.click();
        }
      }
    },
    openIntegrationModal: async (integrationType: string) => {
      // Check if integration already exists
      const existingIntegration = userIntegrations.find(i => i.integration_type === integrationType);
      if (existingIntegration) {
        // Open edit modal for existing integration
        await integrationHook.openEditIntegrationModal(existingIntegration);
      } else {
        // Open add modal for new integration
        await integrationHook.selectIntegrationToAdd(integrationType);
      }
    },
    openWorkflowModal: async (initialData?: { toolChain?: any[]; name?: string; description?: string }) => {
      if (initialData) {
        setWorkflowModalInitialData(initialData);
      }
      setShowCreateWorkflowModal(true);
    },
    getStepName: (step: number) => steps[step]?.label || "Unknown",
    getAvailableActionsForStep: (step: number) => {
      const actions = ["back", "save"];
      if (step === 0) {
        actions.push("select-template", "name");
      } else if (step === 1) {
        actions.push("provider", "model");
      } else if (step === 2) {
        actions.push("voice", "language");
      }
      return actions;
    },
  };

  return (
    <WizardContextProvider value={wizardContextValue}>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 md:p-8 bg-card border-b border-border">
          <Steps
            numSteps={steps.length}
            currentStep={currentStep}
            steps={steps}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {currentStep === 5 ? (
            // Main content
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  {steps[currentStep]?.label}
                </h2>
                <p className="text-muted-foreground">
                  Connect integrations to enable additional features for your assistant.
                </p>
              </div>
              <div className="">
                {renderStepContent()}
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  {steps[currentStep]?.label}
                </h2>
                <p className="text-muted-foreground">
                  {(() => {
                    if (currentStep === 0) return "Choose a template and name your assistant.";
                    if (currentStep === 1) return "Configure the AI model for your assistant.";
                    if (currentStep === 2) return "Select a voice and language for your assistant.";
                    if (currentStep === 3) return "Define what success means for your agent's calls.";
                    if (currentStep === 4) return "Define scenarios, phases, and voice tone to customize your agent's behavior.";
                    return "";
                  })()}
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                {renderStepContent()}
              </div>
            </div>
          )}
        </div>


        <div className="sticky bottom-0 border-t border-border p-6 md:p-8 bg-background shadow-lg z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => handleSetStep(-1)}
              disabled={currentStep === 0 || currentStep === 1 || saving}
              data-wizard-action="back"
              id="wizard-back-button"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleSaveStep}
              disabled={!isStepValid() || saving}
              data-wizard-action="save"
              id="wizard-save-button"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {currentStep === steps.length - 1 ? "Complete" : "Save & Continue"}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Section Entry Modal */}
        <SectionEntryModal
          open={showSectionModal}
          onOpenChange={setShowSectionModal}
          editingSectionType={editingSectionType}
          editingSectionEntry={editingSectionEntry}
          sectionForm={sectionForm}
          onSectionFormChange={(form) => setSectionForm(form)}
          onSave={saveSectionEntry}
          onCancel={closeSectionModal}
        />

        {/* Integration Connection Modal */}
        <IntegrationConnectionModal
          open={integrationHook.showIntegrationModal}
          onOpenChange={integrationHook.setShowIntegrationModal}
          connectingIntegrationLoading={integrationHook.connectingIntegrationLoading}
          integrationModalStep={integrationHook.integrationModalStep}
          availableIntegrationTypes={getAvailableIntegrationTypes()}
          agentIntegrationTools={integrationHook.agentIntegrationTools}
          selectIntegrationToAdd={integrationHook.selectIntegrationToAdd}
          userIntegrations={userIntegrations}
          connectingIntegrationType={integrationHook.connectingIntegrationType}
          integrationSchemas={integrationHook.integrationSchemas
            ? { [integrationHook.connectingIntegrationType || '']: integrationHook.integrationSchemas }
            : {}}
          integrationModalTab={integrationHook.integrationModalTab}
          setIntegrationModalTab={integrationHook.setIntegrationModalTab}
          editingIntegrationConfig={integrationHook.editingIntegrationConfig}
          handleIntegrationConnect={async (config) => {
            await integrationHook.handleIntegrationConnect(config);
            // Refresh user integrations after connecting
            const response = await integrationsApi.list();
            if (response.data) {
              setUserIntegrations(response.data);
            }
          }}
          closeIntegrationConnectionModal={integrationHook.closeIntegrationConnectionModal}
          selectedIntegrationToolsForModal={integrationHook.selectedIntegrationToolsForModal}
          toggleModalToolSelection={integrationHook.toggleModalToolSelection}
          setSelectedIntegrationToolsForModal={integrationHook.setSelectedIntegrationToolsForModal}
          isWizardMode={true}
          onIntegrationSaved={async (integrationType: string) => {
            console.log('[CreateAgentWizard] Integration saved in modal:', integrationType);

            // Trigger the refresh to ensure UI updates
            setAgentFunctionsRefreshKey(prev => {
              const newKey = prev + 1;
              console.log('[CreateAgentWizard] Workflow refresh key updated:', prev, '->', newKey);
              return newKey;
            });
          }}
          onRemoveIntegration={async (integrationType) => {
            // Remove integration from agent (local state only if no agentId, or via API if agentId exists)
            if (agentId && agentId !== "new") {
              try {
                // Delete from backend if agent exists
                await integrationsApi.deleteFromAgent(agentId, integrationType);

                // Remove from local state
                const updatedIntegrationTools = integrationHook.agentIntegrationTools.filter(
                  tool => tool.integration_type !== integrationType
                );
                integrationHook.setAgentIntegrationTools(updatedIntegrationTools);

                // Get the display names for tools of this integration type
                const toolDisplayNames = INTEGRATION_TOOLS_DISPLAY[integrationType as keyof typeof INTEGRATION_TOOLS_DISPLAY] || [];

                // Remove all webhook tools associated with this integration
                const updatedWebhookTools = webhookTools.filter(
                  wt => !toolDisplayNames.includes(wt.name)
                );
                setWebhookTools(updatedWebhookTools);

                toast({
                  title: "Success",
                  description: "Integration removed from agent. Credentials kept."
                });
              } catch (error) {
                console.error("Failed to remove integration:", error);
                toast({
                  title: "Error",
                  description: "Failed to remove integration.",
                  variant: "destructive"
                });
              }
            } else {
              // For new agents, just remove from local state
              const updatedIntegrationTools = integrationHook.agentIntegrationTools.filter(
                tool => tool.integration_type !== integrationType
              );
              integrationHook.setAgentIntegrationTools(updatedIntegrationTools);

              // Get the display names for tools of this integration type
              const toolDisplayNames = INTEGRATION_TOOLS_DISPLAY[integrationType as keyof typeof INTEGRATION_TOOLS_DISPLAY] || [];

              // Remove all webhook tools associated with this integration
              const updatedWebhookTools = webhookTools.filter(
                wt => !toolDisplayNames.includes(wt.name)
              );
              setWebhookTools(updatedWebhookTools);
            }
          }}
          agentId={agentId}
          fetchUserIntegrations={integrationHook.fetchUserIntegrations}
          saveSelectedIntegrationTools={async () => {
            if (!agentId) {
              toast({
                title: "Error",
                description: "Please save the agent first before adding integrations.",
                variant: "destructive",
              });
              return;
            }

            // Save integration tools to agent and sync with ElevenLabs
            await integrationHook.saveSelectedIntegrationTools(
              { id: agentId, name: name } as Agent,
              async (updatedIntegrationTools, updatedWebhookTools) => {
                // Format integration tools for API
                const integrationToolsPayload: Record<string, { enabled: boolean; enabled_tools: string[] }> = {};
                updatedIntegrationTools.forEach(tool => {
                  if (tool.enabled) {
                    if (!integrationToolsPayload[tool.integration_type]) {
                      integrationToolsPayload[tool.integration_type] = { enabled: true, enabled_tools: [] };
                    }
                    integrationToolsPayload[tool.integration_type].enabled_tools.push(tool.tool_name);
                  }
                });

                // Get current agent data to merge with existing conversation_config
                let currentConversationConfig: Record<string, unknown> = {};
                if (agentData?.conversation_config) {
                  currentConversationConfig = { ...agentData.conversation_config } as Record<string, unknown>;
                }

                // Update agent with integration tools and webhook tools in both conversation_config and top level
                const updateParams: Record<string, unknown> = {
                  conversation_config: {
                    ...currentConversationConfig,
                    webhook_tools: updatedWebhookTools,
                    ...(Object.keys(integrationToolsPayload).length > 0 ? { integration_tools: integrationToolsPayload } : {}),
                  },
                  integration_tools: integrationToolsPayload,
                  webhook_tools: updatedWebhookTools,
                };

                await agentsApi.update(agentId, updateParams);

                // Refresh agent data
                try {
                  const agentResponse = await agentsApi.get(agentId);
                  if (agentResponse.data) {
                    setAgentData(agentResponse.data);
                    if (agentResponse.data.slug) {
                      setAgentSlug(agentResponse.data.slug);
                    }
                  }
                } catch (err) {
                  console.error('Failed to fetch agent data after saving integration tools:', err);
                }
              },
              async () => {
                // Publish to sync with ElevenLabs
                if (agentId) {
                  try {
                    await agentsApi.publish(agentId);
                    // Refresh agent data after publish
                    const agentResponse = await agentsApi.get(agentId);
                    if (agentResponse.data) {
                      setAgentData(agentResponse.data);
                      if (agentResponse.data.slug) {
                        setAgentSlug(agentResponse.data.slug);
                      }
                    }
                  } catch (err) {
                    console.error('Failed to publish agent after adding integration tools:', err);
                    toast({
                      title: "Warning",
                      description: "Integration tools saved, but failed to sync with ElevenLabs. Please try publishing manually.",
                      variant: "destructive",
                    });
                  }
                }
              }
            );

            // Refresh user integrations to ensure we have the latest data including API keys
            try {
              const response = await integrationsApi.list();
              if (response.data) {
                setUserIntegrations(response.data);
              }
            } catch (err) {
              console.error('Failed to refresh user integrations:', err);
            }
          }}
        />

        {/* Widget Preview Modal */}
        <Dialog open={showWidgetPreview} onOpenChange={setShowWidgetPreview}>
          <DialogContent className="max-w-4xl h-[80vh] p-0">
            <CustomWidgetPreviewModal
              config={widgetConfig}
              agentName={agentData?.name}
              onClose={() => setShowWidgetPreview(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Phone Number Modal */}
        <PhoneNumberModal
          open={showPhoneNumberModal}
          onOpenChange={setShowPhoneNumberModal}
          defaultAgentId={agentId || undefined}
        />

        {/* Workflow Creation Modal */}
        {agentId && agentId !== "new" && (
          <CreateWorkflowFromScratchModal
            open={showCreateWorkflowModal}
            onClose={() => {
              setShowCreateWorkflowModal(false);
              setWorkflowModalInitialData(null);
            }}
            agentId={agentId}
            onWorkflowCreated={() => {
              setAgentFunctionsRefreshKey(prev => prev + 1);
              setShowCreateWorkflowModal(false);
              setWorkflowModalInitialData(null);
              toast({
                title: "Success",
                description: "Workflow created successfully!",
              });
            }}
            initialToolChain={workflowModalInitialData?.toolChain}
            initialName={workflowModalInitialData?.name}
            initialDescription={workflowModalInitialData?.description}
          />
        )}

      </div>
    </WizardContextProvider>
  );
}
