"use client";

import { useState } from "react";
import { useRouterSearchParams } from "@/hooks/use-router-search-params";
import { SectionEntry } from "@/types/assistant";
import type { BehaviourConfig } from "@/components/assistants/SectionEditors";
import type { AgentTemplate, AgentBehaviour } from "@/lib/api";
import type { WebhookTool } from "@/types/assistant";
import type { UserIntegration as IntegrationUserIntegration } from "@/types/integrations";
import { CustomWidgetConfig, DEFAULT_CONFIG } from "@/utils/widgetConfig";
import type { CreateAgentWizardProps } from "../types";
import { generateSystemPrompt } from "../helpers";

export function useWizardState(initialData?: CreateAgentWizardProps["initialData"]) {
  const [searchParams] = useRouterSearchParams();
  const urlAgentSlug = searchParams.get('slug');
  const savedStep = searchParams.get('step');
  
  // Skip name step if name is already provided
  const shouldSkipNameStep = initialData?.skipNameStep && initialData?.assistantName;
  const initialStep = savedStep ? parseInt(savedStep, 10) : (shouldSkipNameStep ? 1 : 0);
  
  // Wizard navigation state
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

  // Step 3: Agent Behaviour (Scenarios, Phases, Voice & Tone)
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
  const [userIntegrations, setUserIntegrations] = useState<IntegrationUserIntegration[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);
  
  // Widget preview and phone number modals
  const [showWidgetPreview, setShowWidgetPreview] = useState(false);
  const [showPhoneNumberModal, setShowPhoneNumberModal] = useState(false);
  const [agentData, setAgentData] = useState<import("@/lib/api").Agent | null>(null);
  const [widgetConfig, setWidgetConfig] = useState<CustomWidgetConfig>(DEFAULT_CONFIG);
  const [apiKey, setApiKey] = useState<string>('');

  // Step 4: Voice
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState("");

  // Step 5: Language
  const [selectedLanguage, setSelectedLanguage] = useState<string>("english");

  // Generate system prompt
  const systemPrompt = generateSystemPrompt(initialData?.systemPrompt, scenarios, phases, voiceTone);

  return {
    // Navigation state
    currentStep,
    setCurrentStep,
    saving,
    setSaving,
    agentId,
    setAgentId,
    agentSlug,
    setAgentSlug,
    loadingAgent,
    setLoadingAgent,
    shouldSkipNameStep,
    
    // Step 1: Name
    name,
    setName,
    
    // Step 2: Model
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    firstMessage,
    setFirstMessage,
    
    // Step 3: Agent Behaviour
    scenarios,
    setScenarios,
    phases,
    setPhases,
    voiceTone,
    setVoiceTone,
    showSectionModal,
    setShowSectionModal,
    editingSectionType,
    setEditingSectionType,
    editingSectionEntry,
    setEditingSectionEntry,
    sectionForm,
    setSectionForm,
    behaviourConfig,
    setBehaviourConfig,
    template,
    setTemplate,
    currentBehaviourId,
    setCurrentBehaviourId,
    currentBehaviourName,
    setCurrentBehaviourName,
    availableBehaviours,
    setAvailableBehaviours,
    loadingBehaviours,
    setLoadingBehaviours,
    
    // Integration tools
    webhookTools,
    setWebhookTools,
    userIntegrations,
    setUserIntegrations,
    loadingIntegrations,
    setLoadingIntegrations,
    
    // Widget and modals
    showWidgetPreview,
    setShowWidgetPreview,
    showPhoneNumberModal,
    setShowPhoneNumberModal,
    agentData,
    setAgentData,
    widgetConfig,
    setWidgetConfig,
    apiKey,
    setApiKey,
    
    // Step 4: Voice
    selectedVoiceId,
    setSelectedVoiceId,
    showVoiceSelector,
    setShowVoiceSelector,
    voiceSearchQuery,
    setVoiceSearchQuery,
    
    // Step 5: Language
    selectedLanguage,
    setSelectedLanguage,
    
    // Computed
    systemPrompt,
  };
}
