import React from "react";
import { Button } from "@/components/ui/button";
import { AudioLines, Loader2 } from "lucide-react";
import { VoiceSelectorDialog } from "@/components/assistants/VoiceSelectorDialog";
import { Voice } from "@/lib/api";

interface VoiceStepProps {
  selectedVoiceId: string;
  voices: Voice[];
  loadingVoices: boolean;
  showVoiceSelector: boolean;
  onShowVoiceSelectorChange: (show: boolean) => void;
  onSelectVoice: (voiceId: string) => void;
  playingVoiceId: string | null;
  onPlayPreview: (voice: Voice) => void;
  voiceSearchQuery: string;
  onVoiceSearchChange: (query: string) => void;
}

export function VoiceStep({
  selectedVoiceId,
  voices,
  loadingVoices,
  showVoiceSelector,
  onShowVoiceSelectorChange,
  onSelectVoice,
  playingVoiceId,
  onPlayPreview,
  voiceSearchQuery,
  onVoiceSearchChange,
}: VoiceStepProps) {
  const selectedVoice = voices.find(v => v.id === selectedVoiceId);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Voice</label>
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
              {selectedVoice ? (
                <span className="flex items-center gap-2">
                  <AudioLines className="h-4 w-4" />
                  {selectedVoice.name || selectedVoice.id}
                </span>
              ) : (
                <span className="text-muted-foreground">Select a voice</span>
              )}
            </Button>
            <VoiceSelectorDialog
              open={showVoiceSelector}
              onOpenChange={onShowVoiceSelectorChange}
              voices={voices}
              selectedVoiceId={selectedVoiceId}
              onSelectVoice={(voiceId) => {
                onSelectVoice(voiceId);
                onShowVoiceSelectorChange(false);
              }}
              playingVoiceId={playingVoiceId}
              onPlayPreview={onPlayPreview}
              searchQuery={voiceSearchQuery}
              onSearchChange={onVoiceSearchChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
