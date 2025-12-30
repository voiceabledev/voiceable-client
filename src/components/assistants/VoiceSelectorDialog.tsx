import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Search, Play, Square, AudioLines, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Voice } from "@/lib/api";

interface VoiceSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voices: Voice[];
  selectedVoiceIds: string[];
  onSelectVoices: (voiceIds: string[]) => void;
  playingVoiceId: string | null;
  onPlayPreview: (voice: Voice) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const VoiceSelectorDialog = ({
  open,
  onOpenChange,
  voices,
  selectedVoiceIds,
  onSelectVoices,
  playingVoiceId,
  onPlayPreview,
  searchQuery,
  onSearchChange,
}: VoiceSelectorDialogProps) => {
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedVoiceIds);

  // Sync local state when prop changes or dialog opens
  useEffect(() => {
    if (open) {
      setLocalSelectedIds(selectedVoiceIds);
    }
  }, [open, selectedVoiceIds]);

  const getVoiceLabels = (voice: Voice): string[] => {
    const labels: string[] = [];
    if (voice.labels?.gender) {
      labels.push(voice.labels.gender);
    }
    if (voice.labels?.accent) {
      labels.push(voice.labels.accent);
    }
    if (voice.category) {
      labels.push(voice.category);
    }
    return labels;
  };

  const toggleVoiceSelection = (voiceId: string) => {
    setLocalSelectedIds(prev => {
      if (prev.includes(voiceId)) {
        return prev.filter(id => id !== voiceId);
      } else {
        return [...prev, voiceId];
      }
    });
  };

  const handleConfirm = () => {
    onSelectVoices(localSelectedIds);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalSelectedIds(selectedVoiceIds);
    onOpenChange(false);
  };

  const filteredVoices = voices.filter(voice => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      voice.name?.toLowerCase().includes(query) ||
      voice.description?.toLowerCase().includes(query) ||
      voice.id.toLowerCase().includes(query)
    );
  });

  const allSelected = filteredVoices.length > 0 && filteredVoices.every(v => localSelectedIds.includes(v.id));
  const someSelected = filteredVoices.some(v => localSelectedIds.includes(v.id));

  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all filtered voices
      setLocalSelectedIds(prev => prev.filter(id => !filteredVoices.some(v => v.id === id)));
    } else {
      // Select all filtered voices
      const filteredIds = filteredVoices.map(v => v.id);
      setLocalSelectedIds(prev => {
        const newIds = [...prev];
        filteredIds.forEach(id => {
          if (!newIds.includes(id)) {
            newIds.push(id);
          }
        });
        return newIds;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Voices</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Search Bar and Select All */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for a voice..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            {filteredVoices.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="whitespace-nowrap"
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>

          {/* Voices List */}
          <div className="flex-1 overflow-y-auto">
            {filteredVoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No voices found matching your search.' : 'No voices available.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredVoices.map((voice) => {
                  const isSelected = localSelectedIds.includes(voice.id);
                  const isPlaying = playingVoiceId === voice.id;
                  const labels = getVoiceLabels(voice);

                  return (
                    <div
                      key={voice.id}
                      className={cn(
                        "relative p-4 rounded-lg border-2 transition-all cursor-pointer",
                        isSelected
                          ? "border-primary bg-primary/5 hover:bg-primary/10"
                          : "border-border hover:border-primary/30 hover:bg-secondary/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleVoiceSelection(voice.id)}
                          className="mt-1"
                        />

                        {/* Play Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlayPreview(voice);
                          }}
                          disabled={!voice.preview_url}
                          className={cn(
                            "shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                            !voice.preview_url
                              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                              : isPlaying
                              ? "bg-primary text-primary-foreground hover:bg-primary/80"
                              : "bg-secondary hover:bg-secondary/70 text-foreground"
                          )}
                          title={
                            !voice.preview_url
                              ? "No preview available"
                              : isPlaying
                              ? "Stop preview"
                              : "Play preview"
                          }
                        >
                          {isPlaying ? (
                            <Square className="h-5 w-5 fill-current" />
                          ) : voice.preview_url ? (
                            <Play className="h-5 w-5" />
                          ) : (
                            <AudioLines className="h-5 w-5" />
                          )}
                        </button>

                        {/* Voice Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm truncate">
                              {voice.name || voice.id}
                            </h3>
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary shrink-0" />
                            )}
                          </div>
                          
                          {voice.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {voice.description}
                            </p>
                          )}

                          {/* Labels */}
                          {labels.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {labels.slice(0, 3).map((label, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground"
                                >
                                  {label}
                                </span>
                              ))}
                              {labels.length > 3 && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground">
                                  +{labels.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with selection count and buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {localSelectedIds.length} voice{localSelectedIds.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

