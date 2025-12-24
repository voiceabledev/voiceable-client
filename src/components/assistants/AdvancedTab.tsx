import React from "react";
import { PrivacySection } from "./sections/PrivacySection";
import type { Agent } from "@/types/assistant";

type AdvancedTabProps = {
  agent: Agent;
  onUpdate: (updates: Partial<Agent>) => void;
};

export const AdvancedTab: React.FC<AdvancedTabProps> = ({
  agent,
  onUpdate,
}) => {
  return (
    <div className="space-y-6">
      <PrivacySection
        hipaa={agent.hipaa_compliance}
        audioRecording={agent.audio_recording}
        logging={agent.logging}
        transcript={agent.transcript}
        videoRecording={agent.video_recording}
        onUpdate={onUpdate}
      />
    </div>
  );
};
