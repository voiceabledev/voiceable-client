import React from "react";
import { Button } from "@/components/ui/button";
import { AudioLines, Loader2 } from "lucide-react";
import { VoiceSelectorDialog } from "@/components/assistants/VoiceSelectorDialog";
import { LanguageSelectorDialog } from "@/components/assistants/LanguageSelectorDialog";
import { Voice } from "@/lib/api";

interface VoiceLanguageStepProps {
  selectedVoiceIds: string[];
  voices: Voice[];
  loadingVoices: boolean;
  showVoiceSelector: boolean;
  onShowVoiceSelectorChange: (show: boolean) => void;
  onSelectVoices: (voiceIds: string[]) => void;
  playingVoiceId: string | null;
  onPlayPreview: (voice: Voice) => void;
  voiceSearchQuery: string;
  onVoiceSearchChange: (query: string) => void;
  selectedLanguages: string[];
  showLanguageSelector: boolean;
  onShowLanguageSelectorChange: (show: boolean) => void;
  onSelectLanguages: (languages: string[]) => void;
  languageSearchQuery: string;
  onLanguageSearchChange: (query: string) => void;
}

export function VoiceLanguageStep({
  selectedVoiceIds,
  voices,
  loadingVoices,
  showVoiceSelector,
  onShowVoiceSelectorChange,
  onSelectVoices,
  playingVoiceId,
  onPlayPreview,
  voiceSearchQuery,
  onVoiceSearchChange,
  selectedLanguages,
  showLanguageSelector,
  onShowLanguageSelectorChange,
  onSelectLanguages,
  languageSearchQuery,
  onLanguageSearchChange,
}: VoiceLanguageStepProps) {
  const selectedVoices = voices.filter(v => selectedVoiceIds.includes(v.id));

  // Language flag and label helpers
  const languageFlags: Record<string, string> = {
    english: "🇺🇸",
    spanish: "🇪🇸",
    french: "🇫🇷",
    german: "🇩🇪",
    italian: "🇮🇹",
    portuguese: "🇵🇹",
    polish: "🇵🇱",
    turkish: "🇹🇷",
    russian: "🇷🇺",
    dutch: "🇳🇱",
    czech: "🇨🇿",
    arabic: "🇸🇦",
    chinese: "🇨🇳",
    japanese: "🇯🇵",
    hungarian: "🇭🇺",
    korean: "🇰🇷",
    multi: "🌍",
  };

  const languageLabels: Record<string, string> = {
    english: "English",
    spanish: "Spanish",
    french: "French",
    german: "German",
    italian: "Italian",
    portuguese: "Portuguese",
    polish: "Polish",
    turkish: "Turkish",
    russian: "Russian",
    dutch: "Dutch",
    czech: "Czech",
    arabic: "Arabic",
    chinese: "Chinese",
    japanese: "Japanese",
    hungarian: "Hungarian",
    korean: "Korean",
    multi: "Multi",
  };

  const getLanguageDisplay = () => {
    if (selectedLanguages.length === 0) {
      return <span className="text-muted-foreground">Select languages</span>;
    } else if (selectedLanguages.length === 1) {
      const lang = selectedLanguages[0];
      return (
        <span className="flex items-center gap-2">
          <span className="text-lg">{languageFlags[lang] || "🌐"}</span>
          <span>{languageLabels[lang] || lang}</span>
        </span>
      );
    } else {
      return <span>{selectedLanguages.length} languages selected</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Voice{selectedVoiceIds.length !== 1 ? 's' : ''}</label>
        {loadingVoices ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-md border border-border">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading voices...</span>
          </div>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start bg-white"
              onClick={() => onShowVoiceSelectorChange(true)}
            >
              {selectedVoiceIds.length === 0 ? (
                <span className="text-muted-foreground">Select voices</span>
              ) : selectedVoiceIds.length === 1 && selectedVoices[0] ? (
                <span className="flex items-center gap-2">
                  <AudioLines className="h-4 w-4" />
                  {selectedVoices[0].name || selectedVoices[0].id}
                </span>
              ) : (
                <span>{selectedVoiceIds.length} voices selected</span>
              )}
            </Button>
            <VoiceSelectorDialog
              open={showVoiceSelector}
              onOpenChange={onShowVoiceSelectorChange}
              voices={voices}
              selectedVoiceIds={selectedVoiceIds}
              onSelectVoices={onSelectVoices}
              playingVoiceId={playingVoiceId}
              onPlayPreview={onPlayPreview}
              searchQuery={voiceSearchQuery}
              onSearchChange={onVoiceSearchChange}
            />
          </>
        )}
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Language{selectedLanguages.length !== 1 ? 's' : ''}</label>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start bg-white"
          onClick={() => onShowLanguageSelectorChange(true)}
        >
          {getLanguageDisplay()}
        </Button>
        <LanguageSelectorDialog
          open={showLanguageSelector}
          onOpenChange={onShowLanguageSelectorChange}
          selectedLanguages={selectedLanguages}
          onSelectLanguages={onSelectLanguages}
          searchQuery={languageSearchQuery}
          onSearchChange={onLanguageSearchChange}
        />
      </div>
    </div>
  );
}
