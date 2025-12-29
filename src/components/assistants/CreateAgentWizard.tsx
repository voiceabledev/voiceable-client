import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { agentsApi, voicesApi, Voice, agentTemplatesApi, AgentTemplate, AgentBehaviour, adminApi, integrationsApi, apiKeysApi, outcomeDefinitionsApi } from "@/lib/api";
import { SectionEntry, SectionPayload, Agent } from "@/types/assistant";
import type { BehaviourConfig } from "@/components/assistants/SectionEditors";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useIntegrationTools } from "@/hooks/assistants/useIntegrationTools";
import { IntegrationConnectionModal } from "@/components/assistants/modals/IntegrationConnectionModal";
import { INTEGRATION_METADATA, INTEGRATION_TOOLS_DISPLAY } from "@/constants/assistant";
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
import { NameStep } from "./wizard/steps/NameStep";
import { ModelStep } from "./wizard/steps/ModelStep";
import { CallOutcomesStep } from "./wizard/steps/CallOutcomesStep";
import { AgentBehaviourStep } from "./wizard/steps/AgentBehaviourStep";
import { VoiceLanguageStep } from "./wizard/steps/VoiceLanguageStep";
import { IntegrationsStep } from "./wizard/steps/IntegrationsStep";
import type { EscalationRuleSettings } from "@/components/assistants/EscalationRulesPanel";

// Helper functions are now imported from ./wizard/helpers
// Constants are now imported from ./wizard/constants
// CustomWidgetPreviewModal is now imported from ./wizard/CustomWidgetPreviewModal
// steps and templateDefaults are now imported from ./wizard/constants

export default function CreateAgentWizard({ onComplete, voices: propVoices, loadingVoices: propLoadingVoices, initialData }: CreateAgentWizardProps) {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get agent slug from URL params (for persistence across refreshes)
  const urlAgentSlug = searchParams.get('slug');
  const savedStep = searchParams.get('step');
  
  // Skip name step if name is already provided
  const shouldSkipNameStep = initialData?.skipNameStep && initialData?.assistantName;
  const initialStep = savedStep ? parseInt(savedStep, 10) : (shouldSkipNameStep ? 1 : 0);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [saving, setSaving] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [agentSlug, setAgentSlug] = useState<string | null>(urlAgentSlug || null);
  const [loadingAgent, setLoadingAgent] = useState(!!urlAgentSlug);

  // Step 1: Name
  const [name, setName] = useState(initialData?.assistantName || "");

  // Step 2: Model
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [firstMessage, setFirstMessage] = useState(initialData?.firstMessage || "");

  // Step 3: Voice & Language
  const [primaryOutcome, setPrimaryOutcome] = useState<string>("");
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
  const [currentBehaviourId, setCurrentBehaviourId] = useState<number | undefined>(undefined);
  const [currentBehaviourName, setCurrentBehaviourName] = useState<string | undefined>(undefined);
  const [availableBehaviours, setAvailableBehaviours] = useState<AgentBehaviour[]>([]);
  const [loadingBehaviours, setLoadingBehaviours] = useState(false);

  // Integration tools state
  const [webhookTools, setWebhookTools] = useState<WebhookTool[]>([]);
  const integrationHook = useIntegrationTools(webhookTools, setWebhookTools);
  const [userIntegrations, setUserIntegrations] = useState<IntegrationUserIntegration[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);
  
  // Widget preview and phone number modals
  const [showWidgetPreview, setShowWidgetPreview] = useState(false);
  const [showPhoneNumberModal, setShowPhoneNumberModal] = useState(false);
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
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(propLoadingVoices || false);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState("");
  
  // Use voice preview hook
  const { playingVoiceId, handlePlayPreview } = useVoicePreview();

  // Step 2: Voice & Language (merged, moved before Call Outcomes)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("english");

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
            if (platformSettings.voice_id) setSelectedVoiceId(platformSettings.voice_id);
            if (platformSettings.language) setSelectedLanguage(platformSettings.language);
          }
          
          // Restore section entries from prompt_sections
          if (agent.conversation_config?.prompt_sections) {
            const sections = agent.conversation_config.prompt_sections as {
              scenarios?: SectionPayload[];
              phases?: SectionPayload[];
              voiceTone?: SectionPayload[];
            };
            if (sections.scenarios) {
              setScenarios(sections.scenarios.map((s, idx) => ({
                id: `restored_scenario_${idx}_${Date.now()}`,
                title: s.title || "",
                description: s.description || "",
                notes: s.notes || "",
              })));
            }
            if (sections.phases) {
              setPhases(sections.phases.map((s, idx) => ({
                id: `restored_phase_${idx}_${Date.now()}`,
                title: s.title || "",
                description: s.description || "",
                notes: s.notes || "",
              })));
            }
            if (sections.voiceTone) {
              setVoiceTone(sections.voiceTone.map((s, idx) => ({
                id: `restored_tone_${idx}_${Date.now()}`,
                title: s.title || "",
                description: s.description || "",
                notes: s.notes || "",
              })));
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
                
                // Pre-populate first message if template has one and initialData doesn't override it
                if (foundTemplate.first_message && !initialData?.firstMessage) {
                  setFirstMessage(foundTemplate.first_message);
                }
              } else if (foundTemplate.first_message && !initialData?.firstMessage) {
                // Even without template defaults, pre-populate first message
                setFirstMessage(foundTemplate.first_message);
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
    if (template && voices.length > 0 && !selectedVoiceId) {
      const templateDefault = templateDefaults[template.title];
      if (templateDefault && templateDefault.recommendedVoiceIds && templateDefault.recommendedVoiceIds.length > 0) {
        // Try to find a recommended voice
        const recommendedVoice = voices.find(v => templateDefault.recommendedVoiceIds!.includes(v.id));
        if (recommendedVoice) {
          setSelectedVoiceId(recommendedVoice.id);
        }
      } else {
        // Default: Select first professional-sounding voice (prioritize voices with names containing professional keywords)
        const professionalKeywords = ['charlie', 'sarah', 'david', 'emily', 'james', 'professional', 'confident'];
        const professionalVoice = voices.find(v => 
          v.name && professionalKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
        ) || voices[0];
        
        if (professionalVoice) {
          setSelectedVoiceId(professionalVoice.id);
        }
      }
    }
  }, [template, voices, selectedVoiceId]);

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
    const minStep = shouldSkipNameStep ? 1 : 0;
    const maxStep = 5; // Integrations step is the last step (after merging Voice & Language)
    
    if ((currentStep === minStep && direction === -1) || (currentStep === maxStep && direction === 1)) {
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
          // Save the template prompt if provided (from template selection)
          ...(initialData?.systemPrompt ? {
            system_prompt_template: initialData.systemPrompt
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
            language: selectedLanguage || "english",
            model: "flux-general",
          },
          // Always include voice_id if selected (required for Voice and Language steps)
          ...(selectedVoiceId ? {
            voice_id: selectedVoiceId,
            voice: {
              voice_id: selectedVoiceId,
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
        },
        platform_settings: {
          ...(selectedVoiceId && { voice_id: selectedVoiceId }),
          language: selectedLanguage || "english"
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
        } else {
          throw new Error('Failed to create agent');
        }
      }

      // Only sync with ElevenLabs on Voice & Language step (step 3, index 2)
      // Steps array: [0: Name, 1: Model, 2: Voice & Language, 3: Call Outcomes, 4: Agent Behaviour, 5: Integrations]
      const shouldSyncWithElevenLabs = currentStep === 2;
      
      // Ensure voice_id is set before syncing (required for ElevenLabs)
      const hasRequiredFields = shouldSyncWithElevenLabs ? selectedVoiceId && selectedVoiceId.trim() !== "" : true;

      if (shouldSyncWithElevenLabs && savedAgentId && hasRequiredFields) {
        // Small delay to ensure database transaction is committed
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          console.log(`[CreateAgentWizard] Syncing with ElevenLabs for step ${currentStep} (${steps[currentStep].label}), agent ID: ${savedAgentId}`);
          console.log(`[CreateAgentWizard] Current config - Voice ID: ${selectedVoiceId}, Language: ${selectedLanguage}`);
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
          // Save outcome definition if primary outcome is set
          if (primaryOutcome) {
            const outcomeData = {
              primary_outcome: primaryOutcome,
              secondary_outcomes: [],
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
    // If name step is skipped, currentStep 1 = Model, 2 = Voice & Language, 3 = Call Outcomes, 4 = Agent Behaviour, 5 = Integrations
    // If name step is not skipped, currentStep 0 = Name, 1 = Model, 2 = Voice & Language, 3 = Call Outcomes, 4 = Agent Behaviour, 5 = Integrations
    if (shouldSkipNameStep) {
      switch (currentStep) {
        case 1: // Model step
          return selectedModel.trim() !== "" && systemPrompt.trim() !== "";
        case 2: // Voice & Language step
          return selectedVoiceId.trim() !== "" && selectedLanguage.trim() !== "";
        case 3: { // Call Outcomes step
          // Primary outcome is required
          if (!primaryOutcome || primaryOutcome.trim() === "") {
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
    } else {
      switch (currentStep) {
        case 0:
          return name.trim() !== "" && name.trim() !== "Enter a name for your assistant.";
        case 1:
          return selectedModel.trim() !== "" && systemPrompt.trim() !== "";
        case 2: // Voice & Language step
          return selectedVoiceId.trim() !== "" && selectedLanguage.trim() !== "";
        case 3: { // Call Outcomes step
          // Primary outcome is required
          if (!primaryOutcome || primaryOutcome.trim() === "") {
            return false;
          }
          // Validate escalation rules if any exist
          const hasEscalationRulesNormal = escalationRuleSettings.humanTransferRules && escalationRuleSettings.humanTransferRules.length > 0;
          if (hasEscalationRulesNormal) {
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
    }
  };

  // handlePlayPreview is now provided by useVoicePreview hook


  const selectedVoice = voices.find(v => v.id === selectedVoiceId);

  const renderStepContent = () => {
    // If name step is skipped, currentStep 1 = Model, 2 = Voice & Language, 3 = Call Outcomes, 4 = Agent Behaviour, 5 = Integrations
    // If name step is not skipped, currentStep 0 = Name, 1 = Model, 2 = Voice & Language, 3 = Call Outcomes, 4 = Agent Behaviour, 5 = Integrations
    if (shouldSkipNameStep) {
      switch (currentStep) {
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
              selectedVoiceId={selectedVoiceId}
              voices={voices}
              loadingVoices={loadingVoices}
              showVoiceSelector={showVoiceSelector}
              onShowVoiceSelectorChange={setShowVoiceSelector}
              onSelectVoice={(voiceId) => {
                setSelectedVoiceId(voiceId);
                setShowVoiceSelector(false);
              }}
              playingVoiceId={playingVoiceId}
              onPlayPreview={handlePlayPreview}
              voiceSearchQuery={voiceSearchQuery}
              onVoiceSearchChange={setVoiceSearchQuery}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          );
        case 3: // Call Outcomes step
          return (
            <CallOutcomesStep
              primaryOutcome={primaryOutcome}
              onPrimaryOutcomeChange={setPrimaryOutcome}
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
            <AgentBehaviourStep
              scenarios={scenarios}
              phases={phases}
              voiceTone={voiceTone}
              behaviourConfig={behaviourConfig}
              onOpenSectionModal={openSectionModal}
              onDeleteSectionEntry={deleteSectionEntry}
            />
          );
        case 5: // Integrations step
          return (
            <IntegrationsStep
              requiredIntegrations={requiredIntegrations}
              userIntegrations={userIntegrations}
              agentIntegrationTools={integrationHook.agentIntegrationTools}
              loadingIntegrations={loadingIntegrations}
              onConnectIntegration={async (integrationType, userIntegration) => {
                if (userIntegration) {
                  await integrationHook.openEditIntegrationModal(userIntegration);
                } else {
                  await integrationHook.selectIntegrationToAdd(integrationType);
                }
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
                  
                  toast({ 
                    title: "Success", 
                    description: "Integration removed from agent." 
                  });
                }
              }}
            />
          );
        // Preview step removed - redirect to assistant details after integrations
        default:
          return null;
      }
    } else {
      // Normal flow with name step
      switch (currentStep) {
        case 0:
          return <NameStep name={name} onNameChange={setName} />;
        case 1:
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
              selectedVoiceId={selectedVoiceId}
              voices={voices}
              loadingVoices={loadingVoices}
              showVoiceSelector={showVoiceSelector}
              onShowVoiceSelectorChange={setShowVoiceSelector}
              onSelectVoice={(voiceId) => {
                setSelectedVoiceId(voiceId);
                setShowVoiceSelector(false);
              }}
              playingVoiceId={playingVoiceId}
              onPlayPreview={handlePlayPreview}
              voiceSearchQuery={voiceSearchQuery}
              onVoiceSearchChange={setVoiceSearchQuery}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          );
        case 3: // Call Outcomes step
          return (
            <CallOutcomesStep
              primaryOutcome={primaryOutcome}
              onPrimaryOutcomeChange={setPrimaryOutcome}
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
            <AgentBehaviourStep
              scenarios={scenarios}
              phases={phases}
              voiceTone={voiceTone}
              behaviourConfig={behaviourConfig}
              onOpenSectionModal={openSectionModal}
              onDeleteSectionEntry={deleteSectionEntry}
            />
          );
        case 5: // Integrations step
          return (
            <IntegrationsStep
              requiredIntegrations={requiredIntegrations}
              userIntegrations={userIntegrations}
              agentIntegrationTools={integrationHook.agentIntegrationTools}
              loadingIntegrations={loadingIntegrations}
              onConnectIntegration={async (integrationType, userIntegration) => {
                if (userIntegration) {
                  await integrationHook.openEditIntegrationModal(userIntegration);
                } else {
                  await integrationHook.selectIntegrationToAdd(integrationType);
                }
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
                  
                  toast({ 
                    title: "Success", 
                    description: "Integration removed from agent." 
                  });
                }
              }}
            />
          );
        // Preview step removed - redirect to assistant details after integrations
        default:
          return null;
      }
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-6 md:p-8 bg-card border-b border-border">
        <Steps 
          numSteps={steps.length} 
          currentStep={shouldSkipNameStep ? currentStep : currentStep}
          steps={steps} 
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {shouldSkipNameStep 
                ? steps[currentStep]?.label
                : steps[currentStep]?.label
              }
            </h2>
            <p className="text-muted-foreground">
              {(() => {
                if (shouldSkipNameStep) {
                  if (currentStep === 1) return "Configure the AI model for your assistant.";
                  if (currentStep === 2) return "Select a voice and language for your assistant.";
                  if (currentStep === 3) return "Define what success means for your agent's calls.";
                  if (currentStep === 4) return "Define scenarios, phases, and voice tone to customize your agent's behavior.";
                  if (currentStep === 5) return "Connect integrations to enable additional features for your assistant.";
                  return "";
                } else {
                  if (currentStep === 0) return "Give your assistant a name to identify it.";
                  if (currentStep === 1) return "Configure the AI model for your assistant.";
                  if (currentStep === 2) return "Select a voice and language for your assistant.";
                  if (currentStep === 3) return "Define what success means for your agent's calls.";
                  if (currentStep === 4) return "Define scenarios, phases, and voice tone to customize your agent's behavior.";
                  if (currentStep === 5) return "Connect integrations to enable additional features for your assistant.";
                  return "";
                }
              })()}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            {renderStepContent()}
          </div>
        </div>
      </div>

      <div className="border-t border-border p-6 md:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => handleSetStep(-1)}
            disabled={(shouldSkipNameStep ? currentStep === 1 : currentStep === 0) || saving}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={handleSaveStep}
            disabled={!isStepValid() || saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {(shouldSkipNameStep ? currentStep === steps.length - 1 : currentStep === steps.length - 1) ? "Complete" : "Save & Continue"}
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
        availableIntegrationTypes={Object.keys(INTEGRATION_METADATA).map(type => ({
          id: type,
          name: INTEGRATION_METADATA[type].name,
          icon: INTEGRATION_METADATA[type].icon,
          iconBg: INTEGRATION_METADATA[type].iconBg,
        }))}
        agentIntegrationTools={integrationHook.agentIntegrationTools}
        selectIntegrationToAdd={integrationHook.selectIntegrationToAdd}
        userIntegrations={userIntegrations}
        connectingIntegrationType={integrationHook.connectingIntegrationType}
        goBackToIntegrationSelect={integrationHook.goBackToIntegrationSelect}
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
    </div>
  );
}
