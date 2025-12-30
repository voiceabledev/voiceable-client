import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Code, AudioLines, Mic, Eye, Phone, ExternalLink } from "lucide-react";
import { providers, modelsByProvider } from "../constants";
import { Voice } from "@/lib/api";

interface PreviewStepProps {
  name: string;
  selectedProvider: string;
  selectedModel: string;
  selectedVoices: Voice[];
  selectedVoiceIds: string[];
  selectedLanguage: string;
  onLiveWidgetPreview: () => void;
  onShowPhoneNumberModal: () => void;
}

export function PreviewStep({
  name,
  selectedProvider,
  selectedModel,
  selectedVoices,
  selectedVoiceIds,
  selectedLanguage,
  onLiveWidgetPreview,
  onShowPhoneNumberModal,
}: PreviewStepProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Review your agent configuration before completing the setup.
      </p>
      
      <div className="space-y-4">
        {/* Name */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Name</h3>
          </div>
          <p className="text-sm">{name || "Not set"}</p>
        </div>

        {/* Model */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Code className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Model</h3>
          </div>
          <p className="text-sm">
            {providers.find(p => p.value === selectedProvider)?.label} - {modelsByProvider[selectedProvider]?.find(m => m.value === selectedModel)?.label || selectedModel}
          </p>
        </div>

        {/* Voice */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AudioLines className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Voice{selectedVoiceIds.length !== 1 ? 's' : ''}</h3>
          </div>
          {selectedVoiceIds.length === 0 ? (
            <p className="text-sm text-muted-foreground">Not selected</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedVoiceIds.map((voiceId) => {
                const voice = selectedVoices.find(v => v.id === voiceId);
                return (
                  <Badge
                    key={voiceId}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    <AudioLines className="h-3 w-3" />
                    <span className="text-xs">
                      {voice?.name || voiceId}
                    </span>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* Language */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mic className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Language</h3>
          </div>
          <p className="text-sm capitalize">{selectedLanguage || "Not set"}</p>
        </div>

        {/* Widget Preview */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                Widget Preview
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Preview how your widget will appear on your website
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLiveWidgetPreview}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview Widget
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Preview your custom widget design and styling
          </p>
        </div>

        {/* Phone Number */}
        <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold">Phone Number</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Connect a phone number to enable voice calls with your agent. Purchase a number from Twilio to get started.
              </p>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={onShowPhoneNumberModal}
              >
                <Phone className="h-4 w-4 mr-2" />
                Purchase Phone Number
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

