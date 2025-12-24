import React from "react";
import { AudioLines, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type VoiceSectionProps = {
  expanded: boolean;
  onToggleExpanded: () => void;
  loadingVoices: boolean;
  selectedVoiceId: string | null;
  selectedVoiceName: string;
  setShowVoiceSelector: (show: boolean) => void;
};

export const VoiceSection: React.FC<VoiceSectionProps> = ({
  expanded,
  onToggleExpanded,
  loadingVoices,
  selectedVoiceId,
  selectedVoiceName,
  setShowVoiceSelector,
}) => {
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
              Select a voice from the list, or sync your voice library if it's missing. If errors persist, enable
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
              <label className="text-sm text-muted-foreground mb-2 block">Voice</label>
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
                      {selectedVoiceName || selectedVoiceId || "Select a voice"}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                  </Button>
                  {selectedVoiceId && selectedVoiceName && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {selectedVoiceName} ({selectedVoiceId})
                    </p>
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
