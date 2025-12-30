import React from "react";
import { AudioLines, ChevronDown, Loader2, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Voice } from "@/lib/api";

type VoiceSectionProps = {
  expanded: boolean;
  onToggleExpanded: () => void;
  loadingVoices: boolean;
  selectedVoiceIds: string[];
  primaryVoiceId?: string;
  voices: Voice[];
  setShowVoiceSelector: (show: boolean) => void;
  onSetPrimaryVoice?: (voiceId: string) => void;
};

export const VoiceSection: React.FC<VoiceSectionProps> = ({
  expanded,
  onToggleExpanded,
  loadingVoices,
  selectedVoiceIds,
  primaryVoiceId,
  voices,
  setShowVoiceSelector,
  onSetPrimaryVoice,
}) => {
  const selectedVoices = voices.filter(v => selectedVoiceIds.includes(v.id));
  const getVoiceDisplayName = (voiceId: string) => {
    const voice = voices.find(v => v.id === voiceId);
    return voice?.name || voiceId;
  };

  const handleSetPrimary = (voiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSetPrimaryVoice) {
      onSetPrimaryVoice(voiceId);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
        <AudioLines className="h-4 w-4" />
        <span>VOICE</span>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 md:p-6">
        <button className="w-full flex items-start justify-between gap-2" onClick={onToggleExpanded}>
          <div className="text-left flex-1">
            <h3 className="text-base md:text-lg font-semibold">Voice Configuration</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              Select voices from the list, or sync your voice library if it's missing. If errors persist, enable
              custom voice and add a voice ID.
            </p>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1",
              expanded && "rotate-180"
            )}
          />
        </button>

        {expanded && (
          <div className="mt-4 md:mt-6 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Voice{selectedVoiceIds.length !== 1 ? 's' : ''}</label>
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
                      {selectedVoiceIds.length === 0
                        ? "Select voices"
                        : selectedVoiceIds.length === 1
                        ? getVoiceDisplayName(selectedVoiceIds[0])
                        : `${selectedVoiceIds.length} voices selected`}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                  </Button>
                  
                  {/* Display selected voices as badges */}
                  {selectedVoiceIds.length > 0 && (
                    <div className="space-y-2 mt-2">
                      <div className="flex flex-wrap gap-2">
                        {selectedVoiceIds.map((voiceId) => {
                          const voice = voices.find(v => v.id === voiceId);
                          const isPrimary = voiceId === primaryVoiceId;
                          return (
                            <Badge
                              key={voiceId}
                              variant={isPrimary ? "default" : "secondary"}
                              className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={(e) => handleSetPrimary(voiceId, e)}
                              title={isPrimary ? "Primary voice (click to change)" : "Click to set as primary"}
                            >
                              {isPrimary && <Star className="h-3 w-3 fill-current" />}
                              <AudioLines className="h-3 w-3" />
                              <span className="text-xs">
                                {voice?.name || voiceId}
                              </span>
                              {isPrimary && (
                                <span className="text-xs ml-1">(Primary)</span>
                              )}
                            </Badge>
                          );
                        })}
                      </div>
                      {selectedVoiceIds.length > 1 && !primaryVoiceId && (
                        <p className="text-xs text-muted-foreground">
                          Click a voice badge to set it as primary for ElevenLabs
                        </p>
                      )}
                      {primaryVoiceId && (
                        <p className="text-xs text-muted-foreground">
                          Primary voice: {getVoiceDisplayName(primaryVoiceId)} (used for ElevenLabs)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
