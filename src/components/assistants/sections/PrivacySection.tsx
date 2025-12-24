import React from "react";
import { Settings, ChevronDown, Shield, Info, Mic, FileText, Quote, Music, Video } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type PrivacySectionProps = {
  expanded: boolean;
  onToggleExpanded: () => void;
  hipaaCompliance: boolean;
  setHipaaCompliance: (enabled: boolean) => void;
  audioRecording: boolean;
  setAudioRecording: (enabled: boolean) => void;
  logging: boolean;
  setLogging: (enabled: boolean) => void;
  transcript: boolean;
  setTranscript: (enabled: boolean) => void;
  videoRecording: boolean;
  setVideoRecording: (enabled: boolean) => void;
};

export const PrivacySection: React.FC<PrivacySectionProps> = ({
  expanded,
  onToggleExpanded,
  hipaaCompliance,
  setHipaaCompliance,
  audioRecording,
  setAudioRecording,
  logging,
  setLogging,
  transcript,
  setTranscript,
  videoRecording,
  setVideoRecording,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Settings className="h-4 w-4" />
        <span>PRIVACY</span>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 md:p-6">
        <button className="w-full flex items-start justify-between gap-2" onClick={onToggleExpanded}>
          <div className="text-left flex-1">
            <h3 className="text-base md:text-lg font-semibold">Privacy</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              This section allows you to configure the privacy settings for the assistant.
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
          <div className="mt-4 md:mt-6">
            {/* HIPAA Compliance */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Shield className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold">HIPAA Compliance</h4>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    When this is enabled, no logs, recordings, or transcriptions will be stored unless custom storage
                    and credentials are configured.
                  </p>
                </div>
              </div>
              <Switch checked={hipaaCompliance} onCheckedChange={setHipaaCompliance} />
            </div>

            {/* Audio Recording */}
            <div className="flex items-start justify-between pt-6 border-t border-border mt-6">
              <div className="flex items-start gap-3 flex-1">
                <Mic className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold mb-1">Audio Recording</h4>
                  <p className="text-xs text-muted-foreground">
                    Record the conversation. Disable on this assistant to keep its portion of squad conversations
                    private.
                  </p>
                </div>
              </div>
              <Switch checked={audioRecording} onCheckedChange={setAudioRecording} />
            </div>

            {/* Logging */}
            <div className="flex items-start justify-between pt-6 border-t border-border mt-6">
              <div className="flex items-start gap-3 flex-1">
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold mb-1">Logging</h4>
                  <p className="text-xs text-muted-foreground">
                    Enable or disable logging during a call. Disable on this assistant to keep its portion of squad
                    conversations private.
                  </p>
                </div>
              </div>
              <Switch checked={logging} onCheckedChange={setLogging} />
            </div>

            {/* Transcript */}
            <div className="flex items-start justify-between pt-6 border-t border-border mt-6">
              <div className="flex items-start gap-3 flex-1">
                <Quote className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold mb-1">Transcript</h4>
                  <p className="text-xs text-muted-foreground">
                    Enable or disable transcription during a call. Disable on this assistant to keep its portion of
                    squad conversations private.
                  </p>
                </div>
              </div>
              <Switch checked={transcript} onCheckedChange={setTranscript} />
            </div>

            {/* Audio Recording Format */}
            <div className="pt-6 border-t border-border mt-6">
              <div className="flex items-start gap-3 mb-4">
                <Music className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold">Audio Recording Format</h4>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">Choose the format for call recordings.</p>
                </div>
              </div>
              <Select defaultValue="wav">
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wav">WAV</SelectItem>
                  <SelectItem value="mp3">MP3</SelectItem>
                  <SelectItem value="ogg">OGG</SelectItem>
                  <SelectItem value="m4a">M4A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Video Recording */}
            <div className="flex items-start justify-between pt-6 border-t border-border mt-6">
              <div className="flex items-start gap-3 flex-1">
                <Video className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold">Video Recording</h4>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enable or disable video recording during a web call. This will record the video of your user.
                  </p>
                </div>
              </div>
              <Switch checked={videoRecording} onCheckedChange={setVideoRecording} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
