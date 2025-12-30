import React from "react";
import { Button } from "@/components/ui/button";
import { AudioLines, Loader2, Mic } from "lucide-react";
import { VoiceSelectorDialog } from "@/components/assistants/VoiceSelectorDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Voice } from "@/lib/api";

// Language to flag emoji mapping
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
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
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
  selectedLanguage,
  onLanguageChange,
}: VoiceLanguageStepProps) {
  const selectedVoices = voices.filter(v => selectedVoiceIds.includes(v.id));

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
        <label className="text-sm font-medium mb-2 block">Language</label>
        <Select value={selectedLanguage} onValueChange={onLanguageChange}>
          <SelectTrigger className="bg-white">
            <SelectValue>
              {selectedLanguage && (
                <span className="flex items-center gap-2">
                  <span className="text-lg">{languageFlags[selectedLanguage] || "🌐"}</span>
                  <span>{languageLabels[selectedLanguage] || selectedLanguage}</span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">
              <span className="flex items-center gap-2">
                <span className="text-lg">{languageFlags.english}</span>
                <span>{languageLabels.english}</span>
              </span>
            </SelectItem>
            <SelectItem value="spanish">
              <span className="flex items-center gap-2">
                <span className="text-lg">{languageFlags.spanish}</span>
                <span>{languageLabels.spanish}</span>
              </span>
            </SelectItem>
            <SelectItem value="french">
              <span className="flex items-center gap-2">
                <span className="text-lg">{languageFlags.french}</span>
                <span>{languageLabels.french}</span>
              </span>
            </SelectItem>
            <SelectItem value="german">
              <span className="flex items-center gap-2">
                <span className="text-lg">{languageFlags.german}</span>
                <span>{languageLabels.german}</span>
              </span>
            </SelectItem>
            <SelectItem value="italian">
              <span className="flex items-center gap-2">
                <span className="text-lg">{languageFlags.italian}</span>
                <span>{languageLabels.italian}</span>
              </span>
            </SelectItem>
            <SelectItem value="portuguese">
              <span className="flex items-center gap-2">
                <span className="text-lg">{languageFlags.portuguese}</span>
                <span>{languageLabels.portuguese}</span>
              </span>
            </SelectItem>
            <SelectItem value="polish">
              <span className="flex items-center gap-2">
                <span className="text-lg">{languageFlags.polish}</span>
                <span>{languageLabels.polish}</span>
              </span>
            </SelectItem>
            <SelectItem value="turkish">
              <span className="flex items-center gap-2">
                <span className="text-lg">{languageFlags.turkish}</span>
                <span>{languageLabels.turkish}</span>
              </span>
            </SelectItem>
            <SelectItem value="russian">
              <span className="flex items-center gap-2">
                <span className="text-lg">{languageFlags.russian}</span>
                <span>{languageLabels.russian}</span>
              </span>
            </SelectItem>
            <SelectItem value="dutch">
              <span className="flex items-center gap-2">
                <span className="text-lg">{languageFlags.dutch}</span>
                <span>{languageLabels.dutch}</span>
              </span>
            </SelectItem>
            <SelectItem value="czech">
              <span className="flex items-center gap-2">
                <span className="text-lg">{languageFlags.czech}</span>
                <span>{languageLabels.czech}</span>
              </span>
            </SelectItem>
            <SelectItem value="arabic">
              <span className="flex items-center gap-2">
                <span className="text-lg">{languageFlags.arabic}</span>
                <span>{languageLabels.arabic}</span>
              </span>
            </SelectItem>
            <SelectItem value="chinese">
              <span className="flex items-center gap-2">
                <span className="text-lg">{languageFlags.chinese}</span>
                <span>{languageLabels.chinese}</span>
              </span>
            </SelectItem>
            <SelectItem value="japanese">
              <span className="flex items-center gap-2">
                <span className="text-lg">{languageFlags.japanese}</span>
                <span>{languageLabels.japanese}</span>
              </span>
            </SelectItem>
            <SelectItem value="hungarian">
              <span className="flex items-center gap-2">
                <span className="text-lg">{languageFlags.hungarian}</span>
                <span>{languageLabels.hungarian}</span>
              </span>
            </SelectItem>
            <SelectItem value="korean">
              <span className="flex items-center gap-2">
                <span className="text-lg">{languageFlags.korean}</span>
                <span>{languageLabels.korean}</span>
              </span>
            </SelectItem>
            <SelectItem value="multi">
              <span className="flex items-center gap-2">
                <span className="text-lg">{languageFlags.multi}</span>
                <span>{languageLabels.multi}</span>
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

