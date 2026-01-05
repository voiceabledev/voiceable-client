import React, { useState } from "react";
import { ModelSection } from "./sections/ModelSection";
import { VoiceSection } from "./sections/VoiceSection";
import { LanguageSection } from "./sections/LanguageSection";
import { providers, modelsByProvider } from "@/constants/assistant";
import type { Agent } from "@/types/assistant";
import { Voice } from "@/lib/api";

type ConfigurationTabProps = {
  agent: Agent | null;
  onUpdate: (updates: Partial<Agent>) => void;
  onPlayPreview: (voice: Voice) => Promise<void>;
  loadingVoices: boolean;
  selectedVoiceIds: string[];
  primaryVoiceId?: string;
  voices: Voice[];
  showVoiceSelector: boolean;
  onShowVoiceSelectorChange: (show: boolean) => void;
  onSelectVoices: (voiceIds: string[]) => void;
  onSetPrimaryVoice?: (voiceId: string) => void;
  playingVoiceId: string | null;
  voiceSearchQuery: string;
  onVoiceSearchChange: (query: string) => void;
  onVoiceDialogClose?: () => void;
  selectedLanguages: string[];
  defaultLanguage?: string;
  showLanguageSelector: boolean;
  setShowLanguageSelector: (show: boolean) => void;
  languageSearchQuery: string;
  setLanguageSearchQuery: (query: string) => void;
  onSetDefaultLanguage?: (language: string) => void;
};

export const ConfigurationTab: React.FC<ConfigurationTabProps> = ({
  agent,
  onUpdate,
  onPlayPreview,
  loadingVoices,
  selectedVoiceIds,
  primaryVoiceId,
  voices,
  showVoiceSelector,
  onShowVoiceSelectorChange,
  onSelectVoices,
  onSetPrimaryVoice,
  playingVoiceId,
  voiceSearchQuery,
  onVoiceSearchChange,
  onVoiceDialogClose,
  selectedLanguages,
  defaultLanguage,
  showLanguageSelector,
  setShowLanguageSelector,
  languageSearchQuery,
  setLanguageSearchQuery,
  onSetDefaultLanguage,
}) => {
  const [modelExpanded, setModelExpanded] = useState(true);
  const [voiceExpanded, setVoiceExpanded] = useState(true);
  const [languageExpanded, setLanguageExpanded] = useState(true);

  if (!agent) {
    return null;
  }

  // Ensure model is valid for the selected provider
  const currentProvider = agent.provider || "openai";
  const availableModels = modelsByProvider[currentProvider] || [];
  const currentModel = agent.model || "";
  const isValidModel = availableModels.some(m => m.value === currentModel);
  const defaultModel = availableModels.length > 0 ? availableModels[0].value : "";

  return (
    <div className="space-y-6">
      <ModelSection
        expanded={modelExpanded}
        onToggleExpanded={() => setModelExpanded(!modelExpanded)}
        selectedProvider={currentProvider}
        setSelectedProvider={(provider) => {
          onUpdate({ provider });
          // Reset model if current model is not valid for new provider
          const newProviderModels = modelsByProvider[provider] || [];
          if (newProviderModels.length > 0 && !newProviderModels.some(m => m.value === currentModel)) {
            onUpdate({ model: newProviderModels[0].value });
          }
        }}
        selectedModel={isValidModel ? currentModel : (defaultModel || "")}
        setSelectedModel={(model) => onUpdate({ model })}
        providers={providers}
        modelsByProvider={modelsByProvider}
      />
      <VoiceSection
        expanded={voiceExpanded}
        onToggleExpanded={() => setVoiceExpanded(!voiceExpanded)}
        loadingVoices={loadingVoices}
        selectedVoiceIds={selectedVoiceIds}
        primaryVoiceId={primaryVoiceId}
        voices={voices}
        showVoiceSelector={showVoiceSelector}
        onShowVoiceSelectorChange={onShowVoiceSelectorChange}
        onSelectVoices={onSelectVoices}
        onSetPrimaryVoice={onSetPrimaryVoice}
        playingVoiceId={playingVoiceId}
        onPlayPreview={onPlayPreview}
        voiceSearchQuery={voiceSearchQuery}
        onVoiceSearchChange={onVoiceSearchChange}
        onDialogClose={onVoiceDialogClose}
      />
      <LanguageSection
        expanded={languageExpanded}
        onToggleExpanded={() => setLanguageExpanded(!languageExpanded)}
        selectedLanguages={selectedLanguages}
        defaultLanguage={defaultLanguage}
        showLanguageSelector={showLanguageSelector}
        onShowLanguageSelectorChange={setShowLanguageSelector}
        onSetDefaultLanguage={onSetDefaultLanguage}
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
          
          // Update agent with languages array
          // Note: This will trigger a save in AssistantDetail if handleSave is called
          onUpdate({
            languages: finalLanguages,
            default_language: newDefault,
            language: newDefault, // Keep for backward compatibility
          } as any);
        }}
        languageSearchQuery={languageSearchQuery}
        onLanguageSearchChange={setLanguageSearchQuery}
      />
    </div>
  );
};
