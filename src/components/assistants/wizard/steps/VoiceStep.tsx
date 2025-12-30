import React from "react";
import { Button } from "@/components/ui/button";
import { AudioLines, Loader2 } from "lucide-react";
import { VoiceSelectorDialog } from "@/components/assistants/VoiceSelectorDialog";
import { Voice } from "@/lib/api";

interface VoiceStepProps {
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
}

export function VoiceStep({
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
}: VoiceStepProps) {
  const selectedVoices = voices.filter(v => selectedVoiceIds.includes(v.id));

  return (
    <div className="space-y-4">
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
    </div>
  );
}
