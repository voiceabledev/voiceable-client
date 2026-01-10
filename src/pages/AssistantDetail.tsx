import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Globe,
  Loader2,
  Edit,
  FileText,
  Phone,
  CreditCard,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { compareValues } from "@/utils/changeTracker";

// Components
import WidgetTab from "@/components/assistants/WidgetTab";
import ConversationsTab from "@/components/assistants/ConversationsTab";
import PhoneNumbersTab from "@/components/assistants/PhoneNumbersTab";
import { OverviewTab } from "@/components/assistants/OverviewTab";
import { ConfigurationTab } from "@/components/assistants/ConfigurationTab";
import { PromptLogicTab } from "@/components/assistants/PromptLogicTab";
import { AdvancedTab } from "@/components/assistants/AdvancedTab";
import { ToolsTab } from "@/components/assistants/ToolsTab";
import { SystemToolSettingsPanel } from "@/components/assistants/SystemToolSettingsPanel";
import { EscalationRulesPanel, type EscalationRuleSettings } from "@/components/assistants/EscalationRulesPanel";
import { LanguageSelectorDialog } from "@/components/assistants/LanguageSelectorDialog";
import CreateAgentWizard from "@/components/assistants/CreateAgentWizard";
import OutcomeConfigTab, { type OutcomeConfigTabRef } from "@/components/assistants/OutcomeConfigTab";
import { DashboardTab } from "@/components/assistants/DashboardTab";
import { AssistantDetailTour, type TourStep } from "@/components/assistants/AssistantDetailTour";
import { GuidedSetupChat } from "@/components/assistants/GuidedSetupChat";

// Modals
import { WebhookToolModal } from "@/components/assistants/modals/WebhookToolModal";
import { ClientToolModal } from "@/components/assistants/modals/ClientToolModal";
import { IntegrationConnectionModal } from "@/components/assistants/modals/IntegrationConnectionModal";
import { SectionEntryModal } from "@/components/assistants/modals/SectionEntryModal";
import { PromptPreviewModal } from "@/components/assistants/modals/PromptPreviewModal";
import { ChooseFilesDialog } from "@/components/assistants/modals/ChooseFilesDialog";
import { PaymentMethodModal } from "@/components/PaymentMethodModal";

// Hooks
import { useWebhookTools } from "@/hooks/assistants/useWebhookTools";
import { useClientTools } from "@/hooks/assistants/useClientTools";
import { useIntegrationTools } from "@/hooks/assistants/useIntegrationTools";
import { useSectionEntries } from "@/hooks/assistants/useSectionEntries";
import { useAgentFiles } from "@/hooks/assistants/useAgentFiles";
import { useAgentData } from "@/hooks/assistants/useAgentData";
import { useChangeTracker, type OutcomeState } from "@/hooks/assistants/useChangeTracker";

// Constants/Types/Utils
import {
  tabs,
  VALID_TABS,
  displayNameToActionName,
  INTEGRATION_TOOLS_DISPLAY,
} from "@/constants/assistant";
import { getAvailableIntegrationTypes } from "@/constants/integrations";
import { voicesApi, type Voice, adminApi, type AgentBehaviour, paymentsApi, agentsApi, authApi } from "@/lib/api";
import type { SystemToolsState, SystemToolSetting, SystemToolKey, TransferRule, HumanTransferRule, Agent } from "@/types/assistant";
import type { BehaviourConfig } from "@/components/assistants/SectionEditors";

export default function AssistantDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // Tab State - Map old tab names to new ones for backward compatibility
  const tabFromUrl = searchParams.get("tab");
  const mapOldTabToNew = (tab: string | null): string => {
    if (!tab) return "calls";
    const mapping: Record<string, string> = {
      "overview": "dashboard",
      "conversations": "calls",
      "outcomes": "performance",
      "configuration": "settings",
      "prompt-logic": "call-script"
    };
    return mapping[tab] || tab;
  };
  const mappedTab = mapOldTabToNew(tabFromUrl);
  const initialTab =
    mappedTab && VALID_TABS.includes(mappedTab as (typeof VALID_TABS)[number]) ? mappedTab : "calls";
  const [activeTab, setActiveTab] = useState(initialTab);
  const lastSetTabRef = useRef<string | null>(null);
  const outcomeConfigTabRef = useRef<OutcomeConfigTabRef>(null);
  
  // Track if there are undeployed changes (saved but not deployed)
  const [hasUndeployedChanges, setHasUndeployedChanges] = useState(false);

  // Sync activeTab with URL
  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab && VALID_TABS.includes(currentTab as (typeof VALID_TABS)[number])) {
      if (currentTab === lastSetTabRef.current) {
        lastSetTabRef.current = null;
        return;
      }
      if (currentTab !== activeTab) {
        setActiveTab(currentTab);
      }
    }
  }, [searchParams, activeTab]);

  const isNew = location.pathname === "/assistants/create" || id === "create";

  // Initialize Hooks
  const webhookHook = useWebhookTools();
  const clientHook = useClientTools();
  const sectionHook = useSectionEntries();
  const filesHook = useAgentFiles();
  const integrationHook = useIntegrationTools(webhookHook.webhookTools, webhookHook.setWebhookTools);

  // Handle OAuth callback - keep modal open and switch to tools tab
  const oauthHandledRef = useRef(false);
  useEffect(() => {
    const oauthSuccess = searchParams.get("oauth_success");
    const integrationType = searchParams.get("integration_type");
    
    if (oauthSuccess === "true" && integrationType && !isNew && !oauthHandledRef.current) {
      oauthHandledRef.current = true; // Mark as handled to prevent duplicate execution
      
      // Refresh user integrations and open modal
      const handleOAuthReturn = async () => {
        try {
          // Refresh user integrations to get the newly connected integration
          await integrationHook.fetchUserIntegrations();
          
          // Small delay to ensure integrations are loaded
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Open the modal - selectIntegrationToAdd will load the integration
          await integrationHook.selectIntegrationToAdd(integrationType);
          
          // Wait a bit more for the modal to open and integration config to be set
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Get all available tools for this integration and automatically select them
          const availableTools = INTEGRATION_TOOLS_DISPLAY[integrationType as keyof typeof INTEGRATION_TOOLS_DISPLAY] || [];
          if (availableTools.length > 0 && agentData.agent) {
            integrationHook.setSelectedIntegrationToolsForModal(availableTools);
            
            // Wait a bit for state to update
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Automatically save the integration tools to the agent
            await integrationHook.saveSelectedIntegrationTools(
              agentData.agent,
              async (updatedIntegrationTools, updatedWebhookTools) => {
                // Save agent with updated integration tools and webhook tools
                // Don't publish automatically - just save to avoid page refresh
                await agentData.handleSave(
                  updatedWebhookTools,
                  clientHook.clientTools,
                  updatedIntegrationTools,
                  sectionHook.cenarios,
                  sectionHook.etapas,
                  sectionHook.tomDeVoz,
                  systemTools,
                  systemToolSettings,
                  filesHook.attachedFiles,
                  systemToolSettingsMap
                );
              },
              undefined // Don't auto-publish to avoid page refresh
            );
            
            // Close the modal after successfully adding the integration
            integrationHook.closeIntegrationConnectionModal();
            
            toast({
              title: "Success",
              description: `Integration connected and ${availableTools.length} tool(s) added successfully.`,
            });
          } else {
            // No tools available or agent not loaded, just switch to tools tab
            integrationHook.setIntegrationModalTab("tools");
          }
          
          // Remove the query parameters after modal is opened/closed
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.delete("oauth_success");
          newSearchParams.delete("integration_type");
          setSearchParams(newSearchParams, { replace: true });
        } catch (error) {
          console.error("Error handling OAuth return:", error);
          oauthHandledRef.current = false; // Reset on error so it can retry
        }
      };
      
      handleOAuthReturn();
    }
  }, [searchParams, isNew, integrationHook, setSearchParams]);

  const [systemTools, setSystemTools] = useState<SystemToolsState>({
    end_call: false,
    detect_language: false,
    skip_turn: false,
    transfer_to_agent: false,
    transfer_to_number: false,
    play_keypad_touch_tone: false,
    voicemail_detection: false,
  });
  const [systemToolSettings, setSystemToolSettings] = useState<SystemToolSetting>({
    transferRules: [],
    humanTransferRules: [],
  });
  // Store settings per tool to preserve description and disableInterruptions for all tools
  const [systemToolSettingsMap, setSystemToolSettingsMap] = useState<Record<string, SystemToolSetting>>({});
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [selectedSystemTool, setSelectedSystemTool] = useState<string | null>(null);
  const [initialSystemToolSettings, setInitialSystemToolSettings] = useState<SystemToolSetting | null>(null);
  const initialSystemToolSettingsToolRef = useRef<string | null>(null);
  const [showEscalationPanel, setShowEscalationPanel] = useState(false);
  const panelClosingRef = useRef(false);
  const [escalationRuleSettings, setEscalationRuleSettings] = useState<EscalationRuleSettings>({
    name: 'transfer_to_number',
    description: '',
    disableInterruptions: false,
    humanTransferRules: [],
    escalation_keywords: [],
  });
  const [outcomeStateUpdateTrigger, setOutcomeStateUpdateTrigger] = useState(0);
  const [behaviourConfig, setBehaviourConfig] = useState<BehaviourConfig | undefined>(undefined);
  const [availableBehaviours, setAvailableBehaviours] = useState<AgentBehaviour[]>([]);
  const [loadingBehaviours, setLoadingBehaviours] = useState(false);
  const [selectedBehaviourId, setSelectedBehaviourId] = useState<number | undefined>(undefined);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);

  // Fetch credit balance when phone-number tab is active
  useEffect(() => {
    if (activeTab === "phone-number") {
      const fetchCredits = async () => {
        setLoadingCredits(true);
        try {
          const response = await paymentsApi.creditBalance();
          if (response.data) {
            setCreditBalance(response.data.balance || 0);
          } else {
            setCreditBalance(0);
          }
        } catch (error) {
          console.error("Error fetching credit balance:", error);
          setCreditBalance(0);
        } finally {
          setLoadingCredits(false);
        }
      };
      fetchCredits();
    }
  }, [activeTab]);

  // Refresh balance when payment modal closes (in case a payment was made)
  useEffect(() => {
    if (!showPaymentMethodModal && activeTab === "phone-number") {
      const fetchCredits = async () => {
        try {
          const response = await paymentsApi.creditBalance();
          if (response.data) {
            setCreditBalance(response.data.balance || 0);
          }
        } catch (error) {
          console.error("Error fetching credit balance:", error);
        }
      };
      fetchCredits();
    }
  }, [showPaymentMethodModal, activeTab]);

  const agentData = useAgentData(
    id,
    webhookHook.setWebhookTools,
    clientHook.setClientTools,
    integrationHook.setAgentIntegrationTools,
    filesHook.setAttachedFiles,
    filesHook.setAgentFiles,
    sectionHook.setCenarios,
    sectionHook.setEtapas,
    sectionHook.setTomDeVoz,
    setSystemTools,
    setSystemToolSettings
  );

  const { fetchAgentDetails } = agentData;

  // Change tracking
  const { hasChanges, updateBaseline, setTrackedState } = useChangeTracker();

  // Debounce timer for auto-save
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track baseline initialization status (moved earlier for auto-save access)
  const baselineInitializedRef = useRef(false);

  // Update tracked state whenever relevant state changes
  useEffect(() => {
    // Get outcome state from OutcomeConfigTab ref
    const outcomeState = outcomeConfigTabRef.current?.getOutcomeState();
    
    const trackedState = {
      webhookTools: webhookHook.webhookTools,
      clientTools: clientHook.clientTools,
      agentIntegrationTools: integrationHook.agentIntegrationTools,
      scenarios: sectionHook.cenarios,
      phases: sectionHook.etapas,
      voiceTone: sectionHook.tomDeVoz,
      systemTools,
      systemToolSettings,
      systemToolSettingsMap,
      attachedFiles: filesHook.attachedFiles,
      agent: agentData.agent,
      conversationConfig: agentData.conversationConfig,
      outcomeState: outcomeState ? {
        primaryOutcomes: outcomeState.primaryOutcomes,
        successKeywords: outcomeState.successKeywords,
        failureKeywords: outcomeState.failureKeywords,
        escalationRuleSettings: outcomeState.escalationRuleSettings,
      } : null,
    };
    
    setTrackedState(trackedState);
  }, [
    webhookHook.webhookTools,
    clientHook.clientTools,
    integrationHook.agentIntegrationTools,
    sectionHook.cenarios,
    sectionHook.etapas,
    sectionHook.tomDeVoz,
    systemTools,
    systemToolSettings,
    systemToolSettingsMap,
    filesHook.attachedFiles,
    agentData.agent,
    agentData.conversationConfig, // Track conversation config changes (system prompt template, etc.)
    escalationRuleSettings, // Track escalation rule settings changes
    outcomeStateUpdateTrigger, // Trigger update when outcome state changes
    setTrackedState,
  ]);

  // Check for undeployed changes on page load by comparing updated_at and published_at
  useEffect(() => {
    if (!agentData.agentTimestamps || agentData.loading) {
      return;
    }

    const { updated_at, published_at } = agentData.agentTimestamps;
    
    // If no updated_at, no changes to deploy
    if (!updated_at) {
      setHasUndeployedChanges(false);
      return;
    }

    // If never published, there are undeployed changes
    if (!published_at) {
      setHasUndeployedChanges(true);
      return;
    }

    // Compare timestamps: if updated_at is after published_at, there are undeployed changes
    const updatedAt = new Date(updated_at).getTime();
    const publishedAt = new Date(published_at).getTime();
    
    // If published_at is equal to or after updated_at, all changes are deployed
    // Only show undeployed changes if updated_at is strictly after published_at
    // (with a small buffer of 2 seconds to account for timing differences in API responses)
    const timeDifference = updatedAt - publishedAt;
    // If updated_at is more than 2 seconds after published_at, there are undeployed changes
    setHasUndeployedChanges(timeDifference > 2000);
  }, [agentData.agentTimestamps, agentData.loading]);

  // Reset baseline when agent data is first loaded (only on agent ID change, not on every load)
  const previousAgentIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const currentAgentId = agentData.agent?.id;
    // Only reset baseline if agent ID actually changed (new agent loaded) and we haven't initialized yet
    if (currentAgentId && currentAgentId !== previousAgentIdRef.current && !agentData.loading && !baselineInitializedRef.current) {
      previousAgentIdRef.current = currentAgentId;
      baselineInitializedRef.current = true;
      // Small delay to ensure all state is initialized (especially outcome state from ref)
      const timer = setTimeout(() => {
        updateBaseline();
      }, 300);
      return () => clearTimeout(timer);
    } else if (currentAgentId && currentAgentId !== previousAgentIdRef.current) {
      // Agent ID changed - reset the initialization flag
      previousAgentIdRef.current = currentAgentId;
      baselineInitializedRef.current = false;
    }
  }, [agentData.agent?.id, agentData.loading, updateBaseline]);

  // Core save function that performs the actual save
  const performSave = useCallback(async (showToast = true, toastMessage?: string) => {
    // Only save if there are changes
    if (!hasChanges) {
      return;
    }

    try {
      await agentData.handleSave(
        webhookHook.webhookTools,
        clientHook.clientTools,
        integrationHook.agentIntegrationTools,
        sectionHook.cenarios,
        sectionHook.etapas,
        sectionHook.tomDeVoz,
        systemTools,
        systemToolSettings,
        filesHook.attachedFiles,
        systemToolSettingsMap
      );
      // Update baseline after successful save
      updateBaseline();
      // Mark that there are undeployed changes
      setHasUndeployedChanges(true);
      
      if (showToast) {
        toast({
          title: "Saved",
          description: toastMessage || "Your changes have been saved automatically.",
        });
      }
    } catch (error) {
      console.error("Save failed:", error);
      if (showToast) {
        toast({
          title: "Save failed",
          description: "Failed to save changes.",
          variant: "destructive",
        });
      }
    }
  }, [
    hasChanges,
    agentData,
    webhookHook.webhookTools,
    clientHook.clientTools,
    integrationHook.agentIntegrationTools,
    sectionHook.cenarios,
    sectionHook.etapas,
    sectionHook.tomDeVoz,
    systemTools,
    systemToolSettings,
    filesHook.attachedFiles,
    systemToolSettingsMap,
    updateBaseline,
    toast,
  ]);

  // Auto-save function that triggers on user interactions
  const autoSave = useCallback(async (showToast = true) => {
    // Don't auto-save if system tool settings panel is open (it has its own save button)
    if (selectedSystemTool) {
      return;
    }

    // Don't auto-save if escalation rules panel is open (it has its own save button)
    if (showEscalationPanel) {
      return;
    }

    await performSave(showToast, "Your changes have been saved automatically.");
  }, [selectedSystemTool, showEscalationPanel, performSave]);

  // Manual save function (for the Save button) - bypasses panel checks
  const handleSaveWithBaselineUpdate = useCallback(async () => {
    await performSave(true, "Your changes have been saved.");
  }, [performSave]);

  // Track last toast time to prevent too many notifications
  const lastToastTimeRef = useRef<number>(0);
  const TOAST_COOLDOWN_MS = 3000; // Don't show another toast within 3 seconds

  // Auto-save when changes are detected (debounced)
  useEffect(() => {
    // Don't auto-save if:
    // - No changes detected
    // - Already saving
    // - Baseline not initialized yet (wait for baseline to be set)
    // - System tool settings panel is open (it has its own save button)
    // - Escalation rules panel is open (it has its own save button)
    // - Panel is currently closing (to prevent auto-save during panel close operations)
    if (!hasChanges || agentData.saving || !baselineInitializedRef.current || selectedSystemTool || showEscalationPanel || panelClosingRef.current) {
      // Clear timer if conditions aren't met
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
      return;
    }

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer to auto-save after 1 second of no changes
    // Only show toast if enough time has passed since last toast
    autoSaveTimerRef.current = setTimeout(() => {
      const now = Date.now();
      const showToast = now - lastToastTimeRef.current > TOAST_COOLDOWN_MS;
      if (showToast) {
        lastToastTimeRef.current = now;
      }
      autoSave(showToast);
    }, 1000);

    // Cleanup timer on unmount or when dependencies change
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [hasChanges, agentData.saving, selectedSystemTool, showEscalationPanel, autoSave]);

  // Handle publish with undeployed changes tracking
  const handlePublishWithTracking = useCallback(async () => {
    try {
      await agentData.handlePublish();
      // Clear undeployed changes flag after successful deploy
      // The timestamps will be updated in handlePublish, which will trigger the useEffect
      // But we also set it here immediately to ensure the message disappears right away
      setHasUndeployedChanges(false);
    } catch (error) {
      // If publish fails, keep the undeployed changes flag
      console.error("Failed to publish:", error);
    }
  }, [agentData]);

  // Fetch available behaviours
  useEffect(() => {
    const fetchBehaviours = async () => {
      setLoadingBehaviours(true);
      try {
        const response = await adminApi.behaviours.list();
        if (response.data) {
          setAvailableBehaviours(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error("Error fetching behaviours:", error);
      } finally {
        setLoadingBehaviours(false);
      }
    };
    
    fetchBehaviours();
  }, []);

  // Load behaviour config when agent is loaded
  useEffect(() => {
    const loadBehaviour = async () => {
      if (!agentData.conversationConfig) return;
      
      const behaviourId = agentData.conversationConfig.agent_behaviour_id as number | undefined;
      setSelectedBehaviourId(behaviourId);
      
      // First, check if we have the config saved in conversation_config (faster, no API call needed)
      const savedConfig = agentData.conversationConfig.agent_behaviour_config as BehaviourConfig | undefined;
      
      if (behaviourId) {
        // If we have saved config with all sections, use it immediately for instant UI update
        if (savedConfig && savedConfig.scenarios && savedConfig.phases && savedConfig.voiceTone) {
          setBehaviourConfig(savedConfig);
          // Still fetch from API in the background to ensure we have the latest, but don't wait
          adminApi.behaviours.show(behaviourId).then(response => {
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
              // Only update if the fetched config is different (to avoid unnecessary re-renders)
              setBehaviourConfig(config);
            }
          }).catch(error => {
            console.error("Error loading behaviour from API:", error);
            // Keep using saved config if API fails
          });
        } else {
          // No saved config, fetch from API
          try {
            const response = await adminApi.behaviours.show(behaviourId);
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
            }
          } catch (error) {
            console.error("Error loading behaviour:", error);
            setBehaviourConfig(undefined);
          }
        }
      } else {
        setBehaviourConfig(undefined);
      }
    };
    
    loadBehaviour();
  }, [agentData.conversationConfig]);

  // Handle behaviour change
  const handleBehaviourChange = async (behaviourId: string) => {
    if (!agentData.agent) return;
    
    const newBehaviourId = behaviourId === "none" ? undefined : parseInt(behaviourId, 10);
    
    try {
      let newConfig: BehaviourConfig | undefined = undefined;
      
      if (newBehaviourId) {
        // Load the new behaviour config
        try {
          console.log("Fetching behaviour with ID:", newBehaviourId);
          const response = await adminApi.behaviours.show(newBehaviourId);
          console.log("Behaviour API response:", response);
          console.log("Response data:", response.data);
          
          if (response.data) {
            const behaviour = response.data;
            console.log("Behaviour object:", behaviour);
            console.log("Behaviour sections:", behaviour.sections);
            
            newConfig = {};
            if (behaviour.sections && behaviour.sections.length > 0) {
              behaviour.sections.forEach(section => {
                console.log("Processing section:", section);
                if (section.section_type === "scenarios") {
                  newConfig!.scenarios = {
                    label: section.label,
                    description: section.description,
                    add_label: section.add_label,
                    title_placeholder: section.title_placeholder,
                    description_placeholder: section.description_placeholder,
                    notes_placeholder: section.notes_placeholder,
                    notes_label: section.notes_label,
                  };
                } else if (section.section_type === "phases") {
                  newConfig!.phases = {
                    label: section.label,
                    description: section.description,
                    add_label: section.add_label,
                    title_placeholder: section.title_placeholder,
                    description_placeholder: section.description_placeholder,
                    notes_placeholder: section.notes_placeholder,
                    notes_label: section.notes_label,
                  };
                } else if (section.section_type === "voice_tone") {
                  newConfig!.voiceTone = {
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
              console.log("Built newConfig:", newConfig);
            } else {
              console.warn("No sections found in behaviour:", behaviour);
            }
          } else {
            console.error("No data in response:", response);
          }
        } catch (error) {
          console.error("Error fetching behaviour:", error);
          throw error; // Re-throw to be caught by outer try-catch
        }
      }
      
      // Update conversation config in local state first
      const currentConfig = agentData.conversationConfig || {};
      const updatedConfig = {
        ...currentConfig,
        agent_behaviour_id: newBehaviourId,
        agent_behaviour_config: newConfig, // This will be undefined if no behaviour selected, or the config object if one is selected
      };
      
      console.log("handleBehaviourChange - updatedConfig:", {
        agent_behaviour_id: updatedConfig.agent_behaviour_id,
        agent_behaviour_config: updatedConfig.agent_behaviour_config,
        newConfig
      });
      
      // Update conversationConfig state directly FIRST (handleSave reads from this)
      // This ensures handleSave will see the updated values
      if (agentData.setConversationConfig) {
        agentData.setConversationConfig(updatedConfig);
      }
      
      // Update local UI state immediately for responsiveness
      setSelectedBehaviourId(newBehaviourId);
      setBehaviourConfig(newConfig);
      
      console.log("Setting behaviour config:", newConfig);
      
      // Save to backend using handleSave with all current values
      // handleSave will use the updated conversationConfig via ref (which we just set above)
      await agentData.handleSave(
        webhookHook.webhookTools,
        clientHook.clientTools,
        integrationHook.agentIntegrationTools,
        sectionHook.cenarios,
        sectionHook.etapas,
        sectionHook.tomDeVoz,
        systemTools,
        systemToolSettings,
        filesHook.attachedFiles,
        systemToolSettingsMap
      );
      
      // Refresh agent data to ensure we have the latest from backend
      // This will trigger the useEffect to reload the behaviour config
      await agentData.fetchAgentDetails();
      
      toast({
        title: "Success",
        description: "Agent behaviour updated successfully.",
      });
    } catch (error) {
      console.error("Error updating behaviour:", error);
      // Revert local state on error
      const currentBehaviourId = agentData.conversationConfig?.agent_behaviour_id as number | undefined;
      setSelectedBehaviourId(currentBehaviourId);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update behaviour.",
        variant: "destructive",
      });
    }
  };

  // Core Data Loading
  useEffect(() => {
    fetchAgentDetails();
  }, [id, fetchAgentDetails]);

  // Tour state
  const [showTour, setShowTour] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [checkingTour, setCheckingTour] = useState(true);

  // Check if tour should be shown (tour not completed)
  useEffect(() => {
    const checkTourEligibility = async () => {
      if (isNew || !agentData.agent) {
        setCheckingTour(false);
        return;
      }

      // Check local storage first as a quick check
      const localTourCompleted = localStorage.getItem('assistant_detail_tour_completed') === 'true';
      if (localTourCompleted) {
        setTourCompleted(true);
        setCheckingTour(false);
        return;
      }

      try {
        // Fetch user data to check tour completion status
        const userResponse = await authApi.getCurrentUser();
        const userData = userResponse.data as { assistant_detail_tour_completed?: boolean } | undefined;
        
        if (userData?.assistant_detail_tour_completed) {
          // Update local storage to match server state
          localStorage.setItem('assistant_detail_tour_completed', 'true');
          setTourCompleted(true);
          setCheckingTour(false);
          return;
        }

        // Show tour if tour not completed (regardless of agent count)
        // The tour should appear once after creating the first agent, but can be viewed on any agent detail page
        if (!userData?.assistant_detail_tour_completed) {
          console.log("Tour eligibility met: showing tour", { tourCompleted: userData?.assistant_detail_tour_completed });
          setShowTour(true);
        } else {
          console.log("Tour eligibility not met - tour already completed", { tourCompleted: userData?.assistant_detail_tour_completed });
        }
      } catch (error) {
        console.error("Error checking tour eligibility:", error);
        // If API fails, check local storage as fallback
        if (localTourCompleted) {
          setTourCompleted(true);
        }
      } finally {
        setCheckingTour(false);
      }
    };

    checkTourEligibility();
  }, [isNew, agentData.agent]);

  // Tour steps configuration
  const tourSteps: TourStep[] = [
    // {
    //   id: "dashboard",
    //   target: "tab-dashboard",
    //   title: "Dashboard",
    //   description: "Get an overview of your agent's performance, metrics, and key insights. Monitor call volume, success rates, and track your agent's effectiveness at a glance.",
    // },
    {
      id: "calls",
      target: "tab-calls",
      title: "Calls",
      description: "View and manage all your agent's conversations and call history. Review transcripts, listen to recordings, and analyze call outcomes.",
    },
    {
      id: "performance",
      target: "tab-performance",
      title: "Performance",
      description: "Track success rates, ROI, and detailed performance metrics. Monitor escalations, analyze outcomes, and optimize your agent's effectiveness.",
    },
    {
      id: "settings",
      target: "tab-settings",
      title: "Settings",
      description: "Configure voice, language, and other agent settings. Customize your agent's voice, model, and platform preferences.",
    },
    {
      id: "call-script",
      target: "tab-call-script",
      title: "Call Script",
      description: "Customize your agent's behavior, scenarios, and voice tone. Define how your agent should respond in different situations and maintain consistent communication style.",
    },
    {
      id: "tools",
      target: "tab-tools",
      title: "Tools",
      description: "Add integrations, webhooks, and custom tools to extend functionality. Connect CRM systems, scheduling tools, and custom APIs to enhance your agent's capabilities.",
    },
    {
      id: "widget",
      target: "tab-widget",
      title: "Widget",
      description: "Configure and embed the web widget for chat conversations. Customize the appearance and behavior of your chat widget to match your brand.",
    },
    {
      id: "phone-number",
      target: "tab-phone-number",
      title: "Phone Number",
      description: "Add and manage phone number for voice calls. Connect a phone number to enable voice conversations with your agent.",
    },
  ];

  const handleTourComplete = async () => {
    try {
      await authApi.updateTourCompletion();
      // Save to local storage as backup
      localStorage.setItem('assistant_detail_tour_completed', 'true');
      setTourCompleted(true);
      setShowTour(false);
    } catch (error) {
      console.error("Error updating tour completion:", error);
      // Still mark as completed locally even if API call fails
      localStorage.setItem('assistant_detail_tour_completed', 'true');
      setTourCompleted(true);
      setShowTour(false);
    }
  };

  // Derived Values
  const agentId = agentData.agent?.id || (isNew ? "new" : "");

  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    if (agentData.agent?.name && !tempName) {
      setTempName(agentData.agent.name);
    }
  }, [agentData.agent?.name, tempName]);

  // Voice Selector State
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState("");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [selectedVoiceNameState, setSelectedVoiceNameState] = useState<string>("");
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const fetchedVoiceRef = useRef<string | null>(null);

  // Language Selector State
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [languageSearchQuery, setLanguageSearchQuery] = useState("");

  useEffect(() => {
    const fetchVoices = async () => {
      setLoadingVoices(true);
      try {
        const response = await voicesApi.list();
        setVoices(response.data || []);
      } catch (error) {
        console.error("Failed to fetch voices:", error);
      } finally {
        setLoadingVoices(false);
      }
    };
    fetchVoices();
  }, []);

  // Get voice_ids and primary_voice_id from conversation_config or fallback to voice_id (backward compatibility)
  const getVoiceIds = (): string[] => {
    if (!agentData.agent) return [];
    
    // First try to get from top-level voice_ids (most reliable)
    if (Array.isArray(agentData.agent.voice_ids) && agentData.agent.voice_ids.length > 0) {
      return agentData.agent.voice_ids.filter((id): id is string => typeof id === 'string');
    }
    
    // Try to get voice_ids from conversation_config
    const conversationConfig = (agentData.agent as any).conversation_config as Record<string, unknown> | undefined;
    if (conversationConfig?.voice_ids) {
      const voiceIds = conversationConfig.voice_ids;
      if (Array.isArray(voiceIds) && voiceIds.length > 0) {
        return voiceIds.filter((id): id is string => typeof id === 'string');
      }
    }
    
    // Fallback to voice_id for backward compatibility
    if (agentData.agent.voice_id) {
      return [agentData.agent.voice_id];
    }
    
    return [];
  };

  const getPrimaryVoiceId = (): string | undefined => {
    if (!agentData.agent) return undefined;
    
    // First try to get from top-level primary_voice_id (most reliable)
    if (agentData.agent.primary_voice_id) {
      return agentData.agent.primary_voice_id;
    }
    
    // Try to get from conversation_config
    const conversationConfig = (agentData.agent as any).conversation_config as Record<string, unknown> | undefined;
    const primaryVoiceId = conversationConfig?.primary_voice_id as string | undefined;
    if (primaryVoiceId) return primaryVoiceId;
    
    // Fallback: use first voice_id if available
    const voiceIds = getVoiceIds();
    return voiceIds.length > 0 ? voiceIds[0] : undefined;
  };

  const selectedVoiceIds = getVoiceIds();
  const primaryVoiceId = getPrimaryVoiceId();

  // Get languages array from conversation_config or fallback to single language (backward compatibility)
  const getLanguages = (): string[] => {
    if (!agentData.agent) return ["en"]; // Default to English
    
    // First try to get from top-level languages (most reliable)
    if (Array.isArray(agentData.agent.languages) && agentData.agent.languages.length > 0) {
      return agentData.agent.languages.filter((l): l is string => typeof l === 'string');
    }
    
    // Try to get languages from conversation_config
    const conversationConfig = (agentData.agent as any).conversation_config as Record<string, unknown> | undefined;
    if (conversationConfig?.languages) {
      const languages = conversationConfig.languages;
      if (Array.isArray(languages) && languages.length > 0) {
        return languages.filter((l): l is string => typeof l === 'string');
      }
    }
    
    // Fallback to single language for backward compatibility
    if (agentData.agent.language) {
      // Convert old language names to codes
      const langMap: Record<string, string> = {
        'english': 'en',
        'spanish': 'es',
        'french': 'fr',
        'german': 'de',
        'italian': 'it',
        'portuguese': 'pt',
        'polish': 'pl',
        'turkish': 'tr',
        'russian': 'ru',
        'dutch': 'nl',
        'czech': 'cs',
        'arabic': 'ar',
        'chinese': 'zh',
        'japanese': 'ja',
        'hungarian': 'hu',
        'korean': 'ko',
      };
      const lang = agentData.agent.language.toLowerCase();
      return [langMap[lang] || lang];
    }
    
    return ["en"]; // Default to English
  };

  const selectedLanguages = getLanguages();

  // Get default language from conversation_config or fallback to first language or 'en'
  const getDefaultLanguage = (): string => {
    if (!agentData.agent) return 'en';
    
    const conversationConfig = (agentData.agent as any).conversation_config as Record<string, unknown> | undefined;
    if (conversationConfig?.default_language) {
      const defaultLang = conversationConfig.default_language as string;
      // Normalize old language names to codes
      const langMap: Record<string, string> = {
        'english': 'en',
        'spanish': 'es',
        'french': 'fr',
        'german': 'de',
        'italian': 'it',
        'portuguese': 'pt',
        'polish': 'pl',
        'turkish': 'tr',
        'russian': 'ru',
        'dutch': 'nl',
        'czech': 'cs',
        'arabic': 'ar',
        'chinese': 'zh',
        'japanese': 'ja',
        'hungarian': 'hu',
        'korean': 'ko',
      };
      return langMap[defaultLang.toLowerCase()] || defaultLang;
    }
    
    // Fallback to agent.default_language or first language or 'en'
    if (agentData.agent.default_language) {
      return agentData.agent.default_language;
    }
    
    const languages = getLanguages();
    return languages.length > 0 ? languages[0] : 'en';
  };

  const defaultLanguage = getDefaultLanguage();

  const handleSetPrimaryVoice = async (voiceId: string) => {
    if (!selectedVoiceIds.includes(voiceId)) return;
    
    const currentConfig = (agentData.agent as any)?.conversation_config || {};
    
    // Preserve voice_ids array
    const currentVoiceIds = Array.isArray(currentConfig.voice_ids) 
      ? currentConfig.voice_ids 
      : (selectedVoiceIds.length > 0 ? selectedVoiceIds : []);
    
    // Update local state immediately - update both conversation_config AND top-level properties
    agentData.handleUpdate({
      // Update top-level primary_voice_id and voice_id so handleSave can read them
      primary_voice_id: voiceId,
      voice_id: voiceId, // Keep for backward compatibility
      voice_ids: currentVoiceIds, // Preserve all voice IDs
      conversation_config: {
        ...currentConfig,
        primary_voice_id: voiceId,
        voice_ids: currentVoiceIds, // Preserve all voice IDs
        // Keep voice_id for backward compatibility
        voice_id: voiceId,
      }
    } as any);
    
    // Save to backend immediately to ensure data persists
    try {
      await agentData.handleSave(
        webhookHook.webhookTools,
        clientHook.clientTools,
        integrationHook.agentIntegrationTools,
        sectionHook.cenarios,
        sectionHook.etapas,
        sectionHook.tomDeVoz,
        systemTools,
        systemToolSettings,
        filesHook.attachedFiles,
        systemToolSettingsMap
      );
      
      // Refresh agent data from backend to ensure we have the latest saved data
      await agentData.fetchAgentDetails();
    } catch (error) {
      console.error("Failed to save primary voice selection:", error);
      // Don't show error toast here as it might be annoying, but log it
    }
  };

  const handleSetDefaultLanguage = async (languageCode: string) => {
    // Ensure the language is in the selected languages
    const normalized = normalizeLanguageForDefault(languageCode);
    if (!selectedLanguages.some(lang => normalizeLanguageForDefault(lang) === normalized)) {
      return;
    }
    
    const currentConfig = (agentData.agent as any)?.conversation_config || {};
    
    // Update local state immediately - update both conversation_config AND top-level properties
    agentData.handleUpdate({
      // Update top-level default_language so handleSave can read it
      default_language: normalized,
      language: normalized, // Keep for backward compatibility
      conversation_config: {
        ...currentConfig,
        default_language: normalized,
        // Keep language for backward compatibility
        language: normalized,
        // Preserve languages array
        languages: currentConfig.languages || selectedLanguages,
      }
    } as any);
    
    // Save to backend immediately to ensure data persists
    try {
      await agentData.handleSave(
        webhookHook.webhookTools,
        clientHook.clientTools,
        integrationHook.agentIntegrationTools,
        sectionHook.cenarios,
        sectionHook.etapas,
        sectionHook.tomDeVoz,
        systemTools,
        systemToolSettings,
        filesHook.attachedFiles,
        systemToolSettingsMap
      );
    } catch (error) {
      console.error("Failed to save default language selection:", error);
      // Don't show error toast here as it might be annoying, but log it
    }
  };

  // Helper to normalize language (convert old names to codes)
  // This matches the logic in LanguageSection
  const normalizeLanguageForDefault = (lang: string): string => {
    const langMap: Record<string, string> = {
      'english': 'en',
      'spanish': 'es',
      'french': 'fr',
      'german': 'de',
      'italian': 'it',
      'portuguese': 'pt',
      'polish': 'pl',
      'turkish': 'tr',
      'russian': 'ru',
      'dutch': 'nl',
      'czech': 'cs',
      'arabic': 'ar',
      'chinese': 'zh',
      'japanese': 'ja',
      'hungarian': 'hu',
      'korean': 'ko',
    };
    
    // If it's already a code (short and no spaces), return as-is
    if (lang.length <= 5 && !lang.includes(' ')) {
      return lang.toLowerCase();
    }
    // Convert old language names to codes
    return langMap[lang.toLowerCase()] || lang.toLowerCase();
  };

  // Fetch voice details if voice_id is set but voice is not in the list
  useEffect(() => {
    const voiceId = agentData.agent?.voice_id;
    if (!voiceId || loadingVoices) return;
    
    // Check if voice is already in the list
    const voiceExists = voices.some(v => v.id === voiceId);
    if (voiceExists) {
      fetchedVoiceRef.current = voiceId;
      return;
    }
    
    // Don't fetch if we've already attempted to fetch this voice
    if (fetchedVoiceRef.current === voiceId) return;
    
    // Fetch the voice
    const fetchVoice = async () => {
      try {
        fetchedVoiceRef.current = voiceId; // Mark as attempted
        const response = await voicesApi.get(voiceId);
        if (response.data) {
          setVoices(prev => {
            // Check if voice is already in the list to avoid duplicates
            if (prev.some(v => v.id === response.data.id)) {
              return prev;
            }
            return [...prev, response.data];
          });
          // Voice name will be set by the effect above when voices updates
        }
      } catch (error) {
        console.error("Failed to fetch voice details:", error);
        // Reset fetched ref on error so we can retry
        if (fetchedVoiceRef.current === voiceId) {
          fetchedVoiceRef.current = null;
        }
      }
    };
    
    fetchVoice();
  }, [agentData.agent?.voice_id, loadingVoices, voices]);

  // Use state for selected voice name
  const selectedVoiceName = selectedVoiceNameState;

  const handlePlayPreview = async (voiceId: string) => {
    const voice = voices.find(v => v.id === voiceId);
    if (!voice?.preview_url) return;

    if (playingVoiceId === voiceId) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setPlayingVoiceId(null);
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }

    const audio = new Audio(voice.preview_url);
    await audio.play();
    currentAudioRef.current = audio;
    setPlayingVoiceId(voiceId);

    audio.onended = () => {
      setPlayingVoiceId(null);
      currentAudioRef.current = null;
    };
  };

  // Handlers
  const handleSystemToolToggle = (key: keyof SystemToolsState) => {
    setSystemTools((prev) => ({ ...prev, [key]: !prev[key] }));
    // Only open the settings panel automatically for transfer_to_agent and transfer_to_number
    const toolsWithSettings = ["transfer_to_agent", "transfer_to_number"];
    if (!systemTools[key]) {
      // Only set selected tool if it's one that has settings
      if (toolsWithSettings.includes(key)) {
        // Set flag to prevent auto-save during panel open
        panelClosingRef.current = true;
        
        // Close escalation panel if open
        if (showEscalationPanel) {
          setShowEscalationPanel(false);
        }
        setSelectedSystemTool(key);
        // Reset the ref so initial settings will be stored when settings are loaded
        initialSystemToolSettingsToolRef.current = null;
        setInitialSystemToolSettings(null);
        
        // Clear the flag after a delay to allow state updates to complete
        setTimeout(() => {
          panelClosingRef.current = false;
        }, 300);
      }
    } else if (selectedSystemTool === key) {
      // Set flag to prevent auto-save during panel close
      panelClosingRef.current = true;
      setSelectedSystemTool(null);
      setInitialSystemToolSettings(null);
      initialSystemToolSettingsToolRef.current = null;
      // Clear the flag after a delay to allow state updates to complete
      setTimeout(() => {
        panelClosingRef.current = false;
      }, 300);
    }
  };

  const handleOpenSystemToolSettings = (key: keyof SystemToolsState) => {
    // Set flag to prevent auto-save during panel open
    panelClosingRef.current = true;
    
    // Close escalation panel if open
    if (showEscalationPanel) {
      setShowEscalationPanel(false);
    }
    setSelectedSystemTool(key);
    // Reset the ref so initial settings will be stored when settings are loaded
    initialSystemToolSettingsToolRef.current = null;
    setInitialSystemToolSettings(null);
    
    // Clear the flag after a delay to allow state updates to complete
    setTimeout(() => {
      panelClosingRef.current = false;
    }, 300);
  };

  // Load all tool settings into map when agent data is loaded
  useEffect(() => {
    if (!agentData.agent?.system_tools) return;

    const systemToolsData = agentData.agent.system_tools;
    const settingsMap: Record<string, SystemToolSetting> = {};

    // Extract settings for all tools
    Object.entries(systemToolsData).forEach(([toolKey, toolData]) => {
      const settings: SystemToolSetting = {
        name: toolKey,
        description: "",
        disableInterruptions: false,
      };

      if (typeof toolData === "object" && toolData !== null) {
        if ("description" in toolData) {
          settings.description = toolData.description as string || "";
        }
        if ("disable_interruptions" in toolData) {
          settings.disableInterruptions = toolData.disable_interruptions as boolean || false;
        }

        if (toolKey === "transfer_to_agent") {
          const transferData = toolData as { transferRules?: TransferRule[]; transfer_rules?: TransferRule[] };
          settings.transferRules = (transferData.transferRules || transferData.transfer_rules || []) as TransferRule[];
        } else if (toolKey === "transfer_to_number") {
          const humanTransferData = toolData as { humanTransferRules?: HumanTransferRule[]; human_transfer_rules?: HumanTransferRule[] };
          settings.humanTransferRules = (humanTransferData.humanTransferRules || humanTransferData.human_transfer_rules || []) as HumanTransferRule[];
        }
      }

      settingsMap[toolKey] = settings;
    });

    setSystemToolSettingsMap(settingsMap);
  }, [agentData.agent?.system_tools]);

  // Sync settings when a tool is selected
  useEffect(() => {
    if (!selectedSystemTool || !agentData.agent?.system_tools) return;

    const toolKey = selectedSystemTool as keyof SystemToolsState;
    const systemToolsData = agentData.agent.system_tools;
    
    // Set flag to prevent auto-save during settings loading
    panelClosingRef.current = true;
    
    // Check if we already have settings for this tool in the map
    // If map has settings, use them (they're the most up-to-date, including unsaved changes)
    const existingSettings = systemToolSettingsMap[toolKey];
    if (existingSettings) {
      setSystemToolSettings(existingSettings);
      // Store initial settings for change tracking when panel opens (only once per tool)
      if (initialSystemToolSettingsToolRef.current !== toolKey) {
        setInitialSystemToolSettings(JSON.parse(JSON.stringify(existingSettings)));
        initialSystemToolSettingsToolRef.current = toolKey;
      }
      // Clear flag after settings are loaded
      setTimeout(() => {
        panelClosingRef.current = false;
      }, 200);
      return;
    }
    
    // If no settings in map, initialize from agent data
    const newSettings: SystemToolSetting = {
      name: toolKey,
      description: "",
      disableInterruptions: false,
    };

    if (toolKey === "transfer_to_agent" && systemToolsData.transfer_to_agent) {
      const toolData = systemToolsData.transfer_to_agent;
      if (typeof toolData === "object") {
        const transferData = toolData as { transferRules?: TransferRule[]; transfer_rules?: TransferRule[] };
        newSettings.transferRules = (transferData.transferRules || transferData.transfer_rules || []) as TransferRule[];
      }
      // Load description and disableInterruptions if they exist
      if (typeof toolData === "object" && "description" in toolData) {
        newSettings.description = toolData.description as string || "";
      }
      if (typeof toolData === "object" && "disable_interruptions" in toolData) {
        newSettings.disableInterruptions = toolData.disable_interruptions as boolean || false;
      }
    } else if (toolKey === "transfer_to_number" && systemToolsData.transfer_to_number) {
      const toolData = systemToolsData.transfer_to_number;
      if (typeof toolData === "object") {
        const humanTransferData = toolData as { humanTransferRules?: HumanTransferRule[]; human_transfer_rules?: HumanTransferRule[] };
        newSettings.humanTransferRules = (humanTransferData.humanTransferRules || humanTransferData.human_transfer_rules || []) as HumanTransferRule[];
      }
      // Load description and disableInterruptions if they exist
      if (typeof toolData === "object" && "description" in toolData) {
        newSettings.description = toolData.description as string || "";
      }
      if (typeof toolData === "object" && "disable_interruptions" in toolData) {
        newSettings.disableInterruptions = toolData.disable_interruptions as boolean || false;
      }
    } else {
      // For other tools, try to load description and disableInterruptions from the tool data
      const toolData = systemToolsData[toolKey];
      if (typeof toolData === "object" && toolData !== null) {
        if ("description" in toolData) {
          newSettings.description = toolData.description as string || "";
        }
        if ("disable_interruptions" in toolData) {
          newSettings.disableInterruptions = toolData.disable_interruptions as boolean || false;
        }
      }
    }

    setSystemToolSettings(newSettings);
    // Store initial settings for change tracking when panel opens (only once per tool, after settings are fully loaded)
    if (initialSystemToolSettingsToolRef.current !== toolKey) {
      // Wait for settings to be fully constructed before storing
      const finalSettings = { ...newSettings };
      setInitialSystemToolSettings(JSON.parse(JSON.stringify(finalSettings)));
      initialSystemToolSettingsToolRef.current = toolKey;
    }
  }, [selectedSystemTool, agentData.agent?.system_tools, systemToolSettingsMap]);


  const promptToolsSummary = useMemo(() => {
    const activeSystemTools = Object.entries(systemTools)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key);
    const clientToolNames = clientHook.clientTools.map((t) => t.name);
    const webhookToolNames = webhookHook.webhookTools.map((t) => t.name);
    // Get unique integration types only (one per integration, not per tool)
    const enabledIntegrations = Array.from(new Set(
      integrationHook.agentIntegrationTools
        .filter((t) => t.enabled)
        .map((t) => t.integration_type)
    ));

    return JSON.stringify({
      activeSystemTools,
      clientToolNames,
      webhookToolNames,
      enabledIntegrations,
    }, null, 2);
  }, [systemTools, clientHook.clientTools, webhookHook.webhookTools, integrationHook.agentIntegrationTools]);

  // Extract the three prompt components separately
  const promptComponents = useMemo(() => {
    if (!agentData.agent || !agentData.conversationConfig) {
      return {
        template: "",
        tools: "",
        behaviours: "",
      };
    }

    const conversationConfig = agentData.conversationConfig;
    const template = (conversationConfig.system_prompt_template as string) || "";
    const tools = (conversationConfig.system_prompt_tools as string) || "";
    const behaviours = (conversationConfig.system_prompt_behaviours as string) || "";
    const outcomeCriteria = (conversationConfig.system_prompt_outcome_criteria as string) || "";

    return {
      template,
      tools,
      behaviours,
      outcomeCriteria,
    };
  }, [agentData.agent, agentData.conversationConfig]);

  // Get full system prompt for backward compatibility (combined from components)
  const fullSystemPrompt = useMemo(() => {
    const parts: string[] = [];
    if (promptComponents.template) parts.push(promptComponents.template);
    if (promptComponents.tools) parts.push(promptComponents.tools);
    if (promptComponents.behaviours) parts.push(promptComponents.behaviours);
    
    if (parts.length > 0) {
      return parts.join("\n\n").trim();
    }

    // Fallback: try to read from model.messages
    if (agentData.conversationConfig?.model) {
      const modelConfig = agentData.conversationConfig.model as Record<string, unknown>;
      if (modelConfig.messages && Array.isArray(modelConfig.messages)) {
        const systemMessage = modelConfig.messages.find(
          (msg: unknown) => 
            typeof msg === 'object' && 
            msg !== null && 
            (msg as Record<string, unknown>).role === 'system'
        ) as { role: string; content: string } | undefined;
        
        if (systemMessage?.content) {
          return systemMessage.content;
        }
      }
    }

    return "No system prompt found in agent configuration.";
  }, [agentData.conversationConfig, promptComponents]);

  // Show wizard for new assistants
  if (isNew) {
    const locationState = location.state as { 
      templateId?: string; 
      assistantName?: string; 
      systemPrompt?: string; 
      firstMessage?: string;
      skipNameStep?: boolean;
      integrationTools?: Record<string, { enabled: boolean; enabled_tools: string[] }>;
      agentType?: string;
      agentTypeConfig?: import("@/constants/agentTypeConfigs").AgentTypeConfig;
      autoGenerateBehavior?: boolean;
      preSelectedVoices?: string[];
      preSelectedGoals?: string[];
    } | null;
    return (
      <CreateAgentWizard
        onComplete={(agentId) => {
          if (agentId) {
            navigate(`/assistants/${agentId}`);
          } else {
            navigate("/assistants");
          }
        }}
        voices={voices}
        loadingVoices={loadingVoices}
        initialData={{
          templateId: locationState?.templateId,
          assistantName: locationState?.assistantName || "New Assistant",
          systemPrompt: locationState?.systemPrompt,
          firstMessage: locationState?.firstMessage,
          skipNameStep: locationState?.skipNameStep ?? !!locationState?.assistantName,
          integrationTools: locationState?.integrationTools,
          agentType: locationState?.agentType,
          agentTypeConfig: locationState?.agentTypeConfig,
          autoGenerateBehavior: locationState?.autoGenerateBehavior,
          preSelectedVoices: locationState?.preSelectedVoices,
          preSelectedGoals: locationState?.preSelectedGoals,
        }}
      />
    );
  }

  if (agentData.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading assistant details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card px-4 py-3 md:px-6 md:py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/assistants")}
              className="h-8 w-8 md:h-9 md:w-9 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 group">
                {editingName ? (
                  <div className="flex items-center gap-2 w-full max-w-md">
                    <Input
                      autoFocus
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          agentData.handleUpdate({ name: tempName });
                          setEditingName(false);
                        } else if (e.key === "Escape") {
                          setTempName(agentData.agent?.name || "");
                          setEditingName(false);
                        }
                      }}
                      onBlur={() => {
                        agentData.handleUpdate({ name: tempName });
                        setEditingName(false);
                      }}
                      className="h-8 md:h-9 text-lg md:text-xl font-bold bg-background border-primary"
                    />
                  </div>
                ) : (
                  <>
                    <h1
                      className="text-lg md:text-xl font-bold truncate cursor-pointer hover:text-primary transition-colors"
                      onClick={() => {
                        setTempName(agentData.agent?.name || "");
                        setEditingName(true);
                      }}
                    >
                      {agentData.agent?.name || "Untitled Assistant"}
                    </h1>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
                      onClick={() => {
                        setTempName(agentData.agent?.name || "");
                        setEditingName(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground">
                <span className="truncate">ID: {agentId}</span>
                {!isNew && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Public
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {/* Row 1: Save and Deploy Changes buttons */}
            <div className="flex items-center justify-end gap-2">
              {/* <Button
                variant="outline"
                size="sm"
                onClick={() => sectionHook.setShowPromptPreviewModal(true)}
                className="h-8 md:h-9 text-xs md:text-sm"
              >
                <FileText className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                Preview Prompt
              </Button> */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSaveWithBaselineUpdate()}
              disabled={agentData.saving || !hasChanges}
              className="h-8 md:h-9 text-xs md:text-sm"
            >
              {agentData.saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2 animate-spin" />
                  Saving...
                </>
              ) : hasChanges ? (
                "Save"
              ) : (
                "Saved"
              )}
            </Button>
              <Button
                size="sm"
                onClick={handlePublishWithTracking}
                disabled={agentData.publishing || isNew}
                className="h-8 md:h-9 text-xs md:text-sm"
              >
                {agentData.publishing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  "Deploy Changes"
                )}
              </Button>
            </div>
            {/* Row 2: Undeployed Changes Message - aligned to the right */}
            {hasUndeployedChanges && (
              <div className="flex justify-end animate-fade-in">
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>You have undeployed changes. Click "Deploy Changes" to release them.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-4 md:mt-6 overflow-x-auto no-scrollbar">
          <div className="flex gap-4 md:gap-8 border-b border-border min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                data-tour-target={`tab-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  lastSetTabRef.current = tab.id;
                  setSearchParams({ tab: tab.id });
                }}
                className={cn(
                  "pb-3 md:pb-4 text-xs md:text-sm font-medium transition-all relative whitespace-nowrap",
                  activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2 px-1">
                  <tab.icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  {tab.label}
                </div>
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-w-0 relative">
        <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
          {agentData.agent && (
            <>
              {activeTab === "dashboard" || activeTab === "overview" ? (
                // <DashboardTab 
                //   agent={agentData.agent}
                //   agentId={agentId}
                //   onNavigateToWidget={() => {
                //     setActiveTab("widget");
                //     lastSetTabRef.current = "widget";
                //     setSearchParams({ tab: "widget" });
                //   }}
                // />
                <></>
              ) : activeTab === "calls" || activeTab === "conversations" ? (
                <ConversationsTab 
                  assistantName={agentData.agent.name} 
                  agentId={agentData.agent.id}
                  onNavigateToPhoneNumber={() => {
                    setActiveTab("phone-number");
                    lastSetTabRef.current = "phone-number";
                    setSearchParams({ tab: "phone-number" });
                  }}
                  onNavigateToWidget={() => {
                    setActiveTab("widget");
                    lastSetTabRef.current = "widget";
                    setSearchParams({ tab: "widget" });
                  }}
                  onMakeFirstCall={() => {
                    setActiveTab("widget");
                    lastSetTabRef.current = "widget";
                    setSearchParams({ tab: "widget", preview: "true" });
                  }}
                />
              ) : activeTab === "performance" || activeTab === "outcomes" ? (
                <OutcomeConfigTab 
                  ref={outcomeConfigTabRef}
                  agentId={agentId} 
                  onAgentDataChange={fetchAgentDetails}
                  onOutcomeStateChange={() => {
                    // Trigger tracked state update by incrementing trigger
                    setOutcomeStateUpdateTrigger(prev => prev + 1);
                  }}
                  onOpenEscalationPanel={() => {
                    if (selectedSystemTool) {
                      setSelectedSystemTool(null);
                    }
                    setShowEscalationPanel(true);
                  }}
                  escalationRuleSettings={escalationRuleSettings}
                  onEscalationRuleSettingsChange={setEscalationRuleSettings}
                  onEnableTransferToNumber={async (settings: EscalationRuleSettings) => {
                    setSystemTools(prev => ({
                      ...prev,
                      transfer_to_number: true,
                    }));
                    
                    const updatedSettings: SystemToolSetting = {
                      name: settings.name || 'transfer_to_number',
                      description: settings.description || '',
                      disableInterruptions: settings.disableInterruptions || false,
                      humanTransferRules: settings.humanTransferRules || [],
                    };
                    
                    setSystemToolSettings(updatedSettings);
                    setSystemToolSettingsMap(prev => ({
                      ...prev,
                      transfer_to_number: updatedSettings,
                    }));
                    
                    await agentData.handleSave(
                      webhookHook.webhookTools,
                      clientHook.clientTools,
                      integrationHook.agentIntegrationTools,
                      sectionHook.cenarios,
                      sectionHook.etapas,
                      sectionHook.tomDeVoz,
                      {
                        ...systemTools,
                        transfer_to_number: true,
                      },
                      updatedSettings,
                      filesHook.attachedFiles,
                      {
                        ...systemToolSettingsMap,
                        transfer_to_number: updatedSettings,
                      }
                    );
                  }}
                />
              ) : activeTab === "settings" || activeTab === "configuration" ? (
                <ConfigurationTab
                  agent={agentData.agent}
                  onUpdate={agentData.handleUpdate}
                  onPlayPreview={(voice) => handlePlayPreview(voice.id)}
                  loadingVoices={loadingVoices}
                  selectedVoiceIds={selectedVoiceIds}
                  primaryVoiceId={primaryVoiceId}
                  voices={voices}
                  showVoiceSelector={showVoiceSelector}
                  onShowVoiceSelectorChange={setShowVoiceSelector}
                  onSelectVoices={async (voiceIds) => {
                    // Update conversation_config with voice_ids array
                    const currentConfig = (agentData.agent as any)?.conversation_config || {};
                    const currentPrimary = currentConfig.primary_voice_id as string | undefined;
                    
                    // If current primary is still in the new list, keep it; otherwise use first voice
                    const newPrimary = currentPrimary && voiceIds.includes(currentPrimary) 
                      ? currentPrimary 
                      : (voiceIds.length > 0 ? voiceIds[0] : undefined);
                    
                    // Build updated conversation_config
                    const updatedConfig = {
                      ...currentConfig,
                      voice_ids: voiceIds, // Always set as array, even if empty
                      primary_voice_id: newPrimary,
                      // Keep voice_id for backward compatibility (use primary voice)
                      voice_id: newPrimary,
                    };
                    
                    // Update local state immediately - update both conversation_config AND top-level properties
                    agentData.handleUpdate({
                      // Update top-level voice_ids and primary_voice_id so handleSave can read them
                      voice_ids: voiceIds, // Always set as array
                      primary_voice_id: newPrimary,
                      voice_id: newPrimary, // Keep for backward compatibility
                      conversation_config: updatedConfig,
                    } as any);
                  }}
                  onSetPrimaryVoice={handleSetPrimaryVoice}
                  playingVoiceId={playingVoiceId}
                  voiceSearchQuery={voiceSearchQuery}
                  onVoiceSearchChange={setVoiceSearchQuery}
                  onVoiceDialogClose={() => {
                    if (currentAudioRef.current) {
                      currentAudioRef.current.pause();
                      currentAudioRef.current = null;
                      setPlayingVoiceId(null);
                    }
                  }}
                  selectedLanguages={selectedLanguages}
                  defaultLanguage={defaultLanguage}
                  showLanguageSelector={showLanguageSelector}
                  setShowLanguageSelector={setShowLanguageSelector}
                  languageSearchQuery={languageSearchQuery}
                  setLanguageSearchQuery={setLanguageSearchQuery}
                  onSetDefaultLanguage={handleSetDefaultLanguage}
                />
              ) : activeTab === "call-script" || activeTab === "prompt-logic" ? (
                <PromptLogicTab
                  agent={agentData.agent}
                  onUpdate={agentData.handleUpdate}
                  scenarios={sectionHook.cenarios}
                  phases={sectionHook.etapas}
                  voiceTone={sectionHook.tomDeVoz}
                  onAddSectionEntry={sectionHook.addSectionEntry}
                  onEditSectionEntry={sectionHook.openSectionModal}
                  onRemoveSectionEntry={sectionHook.removeSectionEntryById}
                  onApplyGeneratedBehaviour={(data) => {
                    // Replace existing behaviors with generated ones
                    if (data.scenarios) {
                      sectionHook.setCenarios(data.scenarios);
                    }
                    if (data.phases) {
                      sectionHook.setEtapas(data.phases);
                    }
                    if (data.voiceTone) {
                      sectionHook.setTomDeVoz(data.voiceTone);
                    }
                  }}
                  attachedFiles={filesHook.attachedFiles}
                  onFileUpload={(e) => filesHook.handleFileUpload(e, agentId)}
                  onFileDelete={filesHook.handleFileDelete}
                  onOpenChooseFiles={() => filesHook.setShowChooseFilesDialog(true)}
                  uploadingFiles={filesHook.uploadingFiles}
                  isNew={isNew}
                  agentFiles={filesHook.agentFiles}
                  loadingAvailableFiles={filesHook.loadingAvailableFiles}
                  assigningFile={filesHook.assigningFile}
                  fetchAllAvailableFiles={filesHook.fetchAllAvailableFiles}
                  setShowChooseFilesDialog={filesHook.setShowChooseFilesDialog}
                  behaviourConfig={behaviourConfig}
                  conversationConfig={agentData.conversationConfig}
                  onUpdateConversationConfig={async (updates: Record<string, unknown>) => {
                    if (!agentData.agent) return;
                    
                    const currentConfig = agentData.conversationConfig || {};
                    const updatedConfig = {
                      ...currentConfig,
                      ...updates,
                    };
                    
                    // Update conversationConfig state first
                    if (agentData.setConversationConfig) {
                      agentData.setConversationConfig(updatedConfig);
                    }
                    
                    // Save to backend using handleSave
                    await agentData.handleSave(
                      webhookHook.webhookTools,
                      clientHook.clientTools,
                      integrationHook.agentIntegrationTools,
                      sectionHook.cenarios,
                      sectionHook.etapas,
                      sectionHook.tomDeVoz,
                      systemTools,
                      systemToolSettings,
                      filesHook.attachedFiles,
                      systemToolSettingsMap
                    );
                  }}
                />
              ) : activeTab === "widget" ? (
                <WidgetTab agent={agentData.agent} agentId={agentId} />
              ) : activeTab === "phone-number" ? (
                loadingCredits ? (
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Checking credits...</p>
                    </div>
                  </div>
                ) : (creditBalance !== null && creditBalance > 0) ? (
                  <PhoneNumbersTab agent={agentData.agent} agentId={agentId} />
                ) : (
                  <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="bg-card border border-border rounded-lg p-8 md:p-12 max-w-2xl mx-auto">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-4 bg-muted/50 rounded-full">
                          <Lock className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl md:text-2xl font-semibold">Phone Numbers Available for Paid Customers</h3>
                          <p className="text-sm md:text-base text-muted-foreground max-w-md">
                            Phone numbers are currently available for paid customers only. Please add credits to gain access to add a phone number to your agent.
                          </p>
                        </div>
                        <Button
                          onClick={() => setShowPaymentMethodModal(true)}
                          className="mt-4"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Add Credits
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              ) : activeTab === "tools" ? (
                <ToolsTab
                  systemTools={systemTools}
                  onToggleSystemTool={handleSystemToolToggle}
                  onOpenSystemToolSettings={handleOpenSystemToolSettings}
                  webhookTools={webhookHook.webhookTools}
                  clientTools={clientHook.clientTools}
                  onAddWebhook={() => webhookHook.openWebhookModal()}
                  onEditWebhook={(tool) => webhookHook.openWebhookModal(tool)}
                  onDeleteWebhook={webhookHook.deleteWebhookTool}
                  onAddClientTool={() => clientHook.openClientToolModal()}
                  onEditClientTool={(tool) => clientHook.openClientToolModal(tool)}
                  onDeleteClientTool={clientHook.deleteClientTool}
                  agentIntegrationTools={integrationHook.agentIntegrationTools}
                  userIntegrations={integrationHook.userIntegrations}
                  integrationToolsExpanded={integrationHook.integrationToolsExpanded}
                  onToggleIntegrationExpand={integrationHook.toggleIntegrationToolsExpanded}
                  onToggleIntegrationTool={(type, displayName, enabled) => {
                    // Convert display name to action name
                    const actionName = displayNameToActionName(displayName, type);
                    integrationHook.handleIntegrationToolToggleWithWebhook(type, actionName, enabled, agentData.agent);
                  }}
                  onDeleteIntegrationTool={integrationHook.handleDeleteIntegrationTool}
                  onAddIntegration={integrationHook.openAddIntegrationModal}
                  onEditIntegration={integrationHook.openEditIntegrationModal}
                  onDeleteIntegration={async (id) => {
                    await integrationHook.handleDeleteIntegration(
                      id,
                      agentData.agent,
                      async (updatedIntegrationTools, updatedWebhookTools) => {
                        await agentData.handleSave(
                          updatedWebhookTools,
                          clientHook.clientTools,
                          updatedIntegrationTools,
                          sectionHook.cenarios,
                          sectionHook.etapas,
                          sectionHook.tomDeVoz,
                          systemTools,
                          systemToolSettings,
                          filesHook.attachedFiles,
                          systemToolSettingsMap
                        );
                      },
                      handlePublishWithTracking
                    );
                  }}
                  agentId={agentData.agent?.id}
                />
              ) : activeTab === "advanced" ? (
                <AdvancedTab
                  agent={agentData.agent}
                  onUpdate={agentData.handleUpdate}
                />
              ) : null}
            </>
          )}
        </div>

        {/* System Tool Settings Right Panel */}
        {selectedSystemTool && (
          <div className="w-[400px]">
            <SystemToolSettingsPanel
              toolKey={selectedSystemTool as SystemToolKey}
              settings={systemToolSettings}
              currentAgentId={agentData.agent?.id}
              onUpdate={(updates) => {
                const updatedSettings = { ...systemToolSettings, ...updates };
                setSystemToolSettings(updatedSettings);
                // Always save to map for all tools so description and disableInterruptions are preserved
                if (selectedSystemTool) {
                  setSystemToolSettingsMap(prev => ({
                    ...prev,
                    [selectedSystemTool]: updatedSettings
                  }));
                }
              }}
              onSave={async () => {
                // If this is transfer_to_number, sync to escalation rules
                if (selectedSystemTool === "transfer_to_number") {
                  const updatedEscalationSettings: EscalationRuleSettings = {
                    name: systemToolSettings.name || 'transfer_to_number',
                    description: systemToolSettings.description || '',
                    disableInterruptions: systemToolSettings.disableInterruptions || false,
                    humanTransferRules: systemToolSettings.humanTransferRules || [],
                    escalation_keywords: escalationRuleSettings.escalation_keywords || [],
                  };
                  setEscalationRuleSettings(updatedEscalationSettings);
                }
                
                // Manual save - bypasses panel checks
                await handleSaveWithBaselineUpdate();
                // Reset initial settings after save to reflect the new baseline
                const currentSettings = systemToolSettingsMap[selectedSystemTool] || systemToolSettings;
                setInitialSystemToolSettings(JSON.parse(JSON.stringify(currentSettings)));
              }}
              saving={agentData.saving}
              hasChanges={initialSystemToolSettings ? !compareValues(systemToolSettings, initialSystemToolSettings) : false}
              onClose={() => {
                // Set flag to prevent auto-save during panel close
                panelClosingRef.current = true;
                
                // If user closes the panel without adding any info for transfer tools, toggle them off.
                // If there is already configuration (rules), keep the toggle on.
                if (selectedSystemTool === "transfer_to_agent") {
                  const hasRules =
                    (systemToolSettings.transferRules || []).length > 0;
                  if (!hasRules) {
                    setSystemTools(prev => ({
                      ...prev,
                      transfer_to_agent: false,
                    }));
                  }
                } else if (selectedSystemTool === "transfer_to_number") {
                  const hasHumanRules =
                    (systemToolSettings.humanTransferRules || []).length > 0;
                  if (!hasHumanRules) {
                    setSystemTools(prev => ({
                      ...prev,
                      transfer_to_number: false,
                    }));
                  }
                }
                setSelectedSystemTool(null);
                setInitialSystemToolSettings(null);
                initialSystemToolSettingsToolRef.current = null;
                
                // Clear the flag after a short delay to allow state updates to complete
                setTimeout(() => {
                  panelClosingRef.current = false;
                }, 100);
              }}
            />
          </div>
        )}

        {/* Escalation Rules Right Panel */}
        {showEscalationPanel && (activeTab === "performance" || activeTab === "outcomes") && (
          <div className="w-[400px]">
            <EscalationRulesPanel
              settings={escalationRuleSettings}
              onUpdate={(updates) => {
                setEscalationRuleSettings(prev => ({ ...prev, ...updates }));
              }}
              onClose={() => {
                // Set flag to prevent auto-save during panel close
                panelClosingRef.current = true;
                setShowEscalationPanel(false);
                // Clear the flag after a delay to allow state updates to complete
                setTimeout(() => {
                  panelClosingRef.current = false;
                }, 300);
              }}
              onSave={async () => {
                try {
                  // Save escalation rules to outcome definition first
                  if (outcomeConfigTabRef.current) {
                    await outcomeConfigTabRef.current.saveEscalationRules(escalationRuleSettings);
                  }
                  
                  // Enable transfer_to_number system tool if we have human transfer rules
                  const hasHumanTransferRules = escalationRuleSettings.humanTransferRules && 
                                              escalationRuleSettings.humanTransferRules.length > 0 &&
                                              escalationRuleSettings.humanTransferRules.some(rule => 
                                                rule.phoneNumber && rule.phoneNumber.trim() !== ''
                                              );
                  
                  if (hasHumanTransferRules) {
                    // Enable transfer_to_number system tool
                    setSystemTools(prev => ({
                      ...prev,
                      transfer_to_number: true,
                    }));
                    
                    // Update system tool settings with escalation rule settings
                    const updatedSettings: SystemToolSetting = {
                      name: escalationRuleSettings.name || 'transfer_to_number',
                      description: escalationRuleSettings.description || '',
                      disableInterruptions: escalationRuleSettings.disableInterruptions || false,
                      humanTransferRules: escalationRuleSettings.humanTransferRules || [],
                    };
                    
                    setSystemToolSettings(updatedSettings);
                    setSystemToolSettingsMap(prev => ({
                      ...prev,
                      transfer_to_number: updatedSettings,
                    }));
                    
                    // Save the agent with updated system tools (this will sync to ElevenLabs)
                    await agentData.handleSave(
                      webhookHook.webhookTools,
                      clientHook.clientTools,
                      integrationHook.agentIntegrationTools,
                      sectionHook.cenarios,
                      sectionHook.etapas,
                      sectionHook.tomDeVoz,
                      {
                        ...systemTools,
                        transfer_to_number: true,
                      },
                      updatedSettings,
                      filesHook.attachedFiles,
                      {
                        ...systemToolSettingsMap,
                        transfer_to_number: updatedSettings,
                      }
                    );
                  } else {
                    toast({
                      title: "Success",
                      description: "Escalation rules saved successfully.",
                    });
                  }
                  
                  // Close panel
                  setShowEscalationPanel(false);
                } catch (error) {
                  console.error("Failed to save escalation rules:", error);
                  toast({
                    title: "Error",
                    description: "Failed to save escalation rules. Please try again.",
                    variant: "destructive",
                  });
                }
              }}
              saving={agentData.saving}
            />
          </div>
        )}

      </div>


      <LanguageSelectorDialog
        open={showLanguageSelector}
        onOpenChange={(open) => {
          setShowLanguageSelector(open);
          if (!open) {
            setLanguageSearchQuery("");
          }
        }}
        selectedLanguages={selectedLanguages}
        defaultLanguage={defaultLanguage}
        onSelectLanguages={async (languages, defaultLang) => {
          // Languages coming from dialog are already normalized codes (e.g., 'en', 'es', 'fr')
          // Just ensure 'en' is always in the list
          const finalLanguages = languages.includes('en') 
            ? languages 
            : ['en', ...languages];
          
          // Use the default language from the dialog
          // Ensure it's in the selected languages
          const newDefault = finalLanguages.includes(defaultLang) 
            ? defaultLang 
            : (finalLanguages.length > 0 ? finalLanguages[0] : 'en');
          
          const currentConfig = (agentData.agent as any)?.conversation_config || {};
          
          // Build updated conversation_config
          const updatedConfig = {
            ...currentConfig,
            languages: finalLanguages,
            default_language: newDefault,
            // Keep language for backward compatibility
            language: newDefault,
          };
          
          // Update conversationConfigRef FIRST to ensure handleSave uses latest config
          if (agentData.setConversationConfig) {
            agentData.setConversationConfig(updatedConfig);
          }
          
          // Update local state - update both conversation_config AND top-level properties
          agentData.handleUpdate({
            // Update top-level languages and default_language so handleSave can read them
            languages: finalLanguages,
            default_language: newDefault,
            language: newDefault, // Keep for backward compatibility
            conversation_config: updatedConfig,
          } as any);
          
          // Save to backend immediately to ensure data persists
          // Use setTimeout to ensure state has updated
          try {
            // Wait a tick to ensure handleUpdate has processed
            await new Promise(resolve => setTimeout(resolve, 0));
            
            // Update last toast time to prevent auto-save from showing toast immediately after
            lastToastTimeRef.current = Date.now();
            
            await agentData.handleSave(
              webhookHook.webhookTools,
              clientHook.clientTools,
              integrationHook.agentIntegrationTools,
              sectionHook.cenarios,
              sectionHook.etapas,
              sectionHook.tomDeVoz,
              systemTools,
              systemToolSettings,
              filesHook.attachedFiles,
              systemToolSettingsMap
            );
            
            // Refresh agent data from backend to ensure we have the latest saved data
            await agentData.fetchAgentDetails();
            
            toast({
              title: "Success",
              description: "Languages saved successfully.",
            });
          } catch (error) {
            console.error("Failed to save language selection:", error);
            toast({
              title: "Error",
              description: error instanceof Error ? error.message : "Failed to save languages.",
              variant: "destructive",
            });
          }
          
          setShowLanguageSelector(false);
        }}
        searchQuery={languageSearchQuery}
        onSearchChange={setLanguageSearchQuery}
      />

      {/* Modals */}
      <WebhookToolModal
        open={webhookHook.showWebhookModal}
        onOpenChange={webhookHook.setShowWebhookModal}
        editingWebhookTool={webhookHook.editingWebhookTool}
        webhookForm={webhookHook.webhookForm}
        setWebhookForm={webhookHook.setWebhookForm}
        onSave={webhookHook.saveWebhookTool}
        onClose={webhookHook.closeWebhookModal}
      />

      <ClientToolModal
        open={clientHook.showClientToolModal}
        onOpenChange={clientHook.setShowClientToolModal}
        editingClientTool={clientHook.editingClientTool}
        clientToolForm={clientHook.clientToolForm}
        setClientToolForm={clientHook.setClientToolForm}
        onSave={clientHook.saveClientTool}
        onClose={clientHook.closeClientToolModal}
      />

      <IntegrationConnectionModal
        open={integrationHook.showIntegrationModal}
        onOpenChange={integrationHook.setShowIntegrationModal}
        connectingIntegrationLoading={integrationHook.connectingIntegrationLoading}
        integrationModalStep={integrationHook.integrationModalStep}
        availableIntegrationTypes={getAvailableIntegrationTypes()}
        agentIntegrationTools={integrationHook.agentIntegrationTools}
        selectIntegrationToAdd={integrationHook.selectIntegrationToAdd}
        userIntegrations={integrationHook.userIntegrations}
        setUserIntegrations={integrationHook.setUserIntegrations}
        connectingIntegrationType={integrationHook.connectingIntegrationType}
        integrationSchemas={integrationHook.integrationSchemas 
          ? { [integrationHook.connectingIntegrationType || '']: integrationHook.integrationSchemas }
          : {}}
        integrationModalTab={integrationHook.integrationModalTab}
        setIntegrationModalTab={integrationHook.setIntegrationModalTab}
        editingIntegrationConfig={integrationHook.editingIntegrationConfig}
        setEditingIntegrationConfig={integrationHook.setEditingIntegrationConfig}
        handleIntegrationConnect={integrationHook.handleIntegrationConnect}
        closeIntegrationConnectionModal={integrationHook.closeIntegrationConnectionModal}
        selectedIntegrationToolsForModal={integrationHook.selectedIntegrationToolsForModal}
        toggleModalToolSelection={integrationHook.toggleModalToolSelection}
        setSelectedIntegrationToolsForModal={integrationHook.setSelectedIntegrationToolsForModal}
        saveSelectedIntegrationTools={async () => {
          await integrationHook.saveSelectedIntegrationTools(
            agentData.agent,
            async (updatedIntegrationTools, updatedWebhookTools) => {
              // Save agent with updated integration tools and webhook tools
              await agentData.handleSave(
                updatedWebhookTools, // Use the updated webhook tools that include new integration webhooks
                clientHook.clientTools,
                updatedIntegrationTools,
                sectionHook.cenarios,
                sectionHook.etapas,
                sectionHook.tomDeVoz,
                systemTools,
                systemToolSettings,
                filesHook.attachedFiles,
                systemToolSettingsMap
              );
            },
                    handlePublishWithTracking
          );
        }}
        fetchUserIntegrations={integrationHook.fetchUserIntegrations}
        onRemoveIntegration={async (integrationType) => {
          // Find the user integration for this type to get its ID
          const userIntegration = integrationHook.userIntegrations.find(
            i => i.integration_type === integrationType
          );
          const integrationId = userIntegration?.id || integrationType;
          
          await integrationHook.handleDeleteIntegration(
            integrationId,
            agentData.agent,
            async (updatedIntegrationTools, updatedWebhookTools) => {
              await agentData.handleSave(
                updatedWebhookTools,
                clientHook.clientTools,
                updatedIntegrationTools,
                sectionHook.cenarios,
                sectionHook.etapas,
                sectionHook.tomDeVoz,
                systemTools,
                systemToolSettings,
                filesHook.attachedFiles,
                systemToolSettingsMap
              );
            },
                    handlePublishWithTracking
          );
        }}
        agentId={agentData.agent?.id}
      />

      <SectionEntryModal
        open={sectionHook.showSectionModal}
        onClose={sectionHook.closeSectionModal}
        editingSectionEntry={sectionHook.editingSectionEntry}
        sectionForm={sectionHook.sectionForm}
        setSectionForm={sectionHook.setSectionForm}
        onSave={sectionHook.saveSectionEntry}
        sectionType={sectionHook.editingSectionType}
      />

      <PromptPreviewModal
        open={sectionHook.showPromptPreviewModal}
        onOpenChange={sectionHook.setShowPromptPreviewModal}
        systemPromptTemplate={promptComponents.template}
        systemPromptTools={promptComponents.tools}
        systemPromptBehaviours={promptComponents.behaviours}
        systemPromptOutcomeCriteria={promptComponents.outcomeCriteria}
        promptToolsSummary={promptToolsSummary}
        onSaveTemplate={async (newTemplate: string) => {
          if (!agentData.agent) return;
          
          setSavingTemplate(true);
          try {
            // Update only the system_prompt_template and rebuild the combined prompt
            const currentConfig = agentData.conversationConfig || {};
            const updatedConfig = {
              ...currentConfig,
              system_prompt_template: newTemplate,
            };
            
            // Rebuild the combined prompt from all components
            const promptParts: string[] = [];
            if (newTemplate) promptParts.push(newTemplate.trim());
            if (promptComponents.tools) promptParts.push(promptComponents.tools.trim());
            if (promptComponents.behaviours) promptParts.push(promptComponents.behaviours.trim());
            if (promptComponents.outcomeCriteria) promptParts.push(promptComponents.outcomeCriteria.trim());
            const combinedPrompt = promptParts.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
            
            // Update the model messages with the combined prompt
            const modelConfig = (currentConfig.model as Record<string, unknown>) || {};
            const messages = (modelConfig.messages as Array<{ role: string; content: string }>) || [];
            const updatedMessages = messages.filter(m => m.role !== 'system');
            updatedMessages.unshift({
              role: 'system',
              content: combinedPrompt
            });
            
            updatedConfig.model = {
              ...modelConfig,
              messages: updatedMessages,
            };
            
            // Save directly to backend
            const { agentsApi } = await import("@/lib/api");
            await agentsApi.update(agentData.agent.id, {
              conversation_config: updatedConfig,
            } as unknown as Parameters<typeof agentsApi.update>[1]);
            
            // Refresh agent data to get the updated config
            await agentData.fetchAgentDetails();
            
            toast({
              title: "Success",
              description: "System prompt template updated successfully.",
            });
          } catch (error) {
            console.error("Failed to save template:", error);
            toast({
              title: "Error",
              description: error instanceof Error ? error.message : "Failed to save template.",
              variant: "destructive",
            });
            throw error;
          } finally {
            setSavingTemplate(false);
          }
        }}
        saving={savingTemplate}
      />

      <ChooseFilesDialog
        open={filesHook.showChooseFilesDialog}
        onOpenChange={filesHook.setShowChooseFilesDialog}
        assigningFile={filesHook.assigningFile}
        loadingAvailableFiles={filesHook.loadingAvailableFiles}
        allAvailableFiles={filesHook.allAvailableFiles}
        attachedFiles={filesHook.attachedFiles}
        onSelectExistingFile={(fileId) => filesHook.handleSelectExistingFile(fileId, agentId)}
      />

      <PaymentMethodModal
        open={showPaymentMethodModal}
        onOpenChange={setShowPaymentMethodModal}
      />

      {/* Guided Tour */}
      {!checkingTour && (
        <AssistantDetailTour
          open={showTour && !tourCompleted}
          onClose={handleTourComplete}
          onComplete={handleTourComplete}
          steps={tourSteps}
        />
      )}

      {/* Guided Setup Chat - Show on all tabs */}
      {agentData.agent && !isNew && (
        <GuidedSetupChat
          agentId={agentId}
          agent={agentData.agent}
          renderMode="inline"
          startMinimized={true}
          onComplete={async () => {
            // Remove setup parameter from URL if it exists
            if (searchParams.get("setup") === "true") {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.delete("setup");
              setSearchParams(newSearchParams, { replace: true });
            }
            
            // Refresh agent data to show new integrations
            await agentData.fetchAgentDetails();
            
            toast({
              title: "Success",
              description: "Assistant setup completed!",
            });
          }}
          onClose={() => {
            // Remove setup parameter from URL if it exists
            if (searchParams.get("setup") === "true") {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.delete("setup");
              setSearchParams(newSearchParams, { replace: true });
            }
          }}
        />
      )}
    </div>
  );
}
