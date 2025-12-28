import React from "react";

export interface CreateAgentWizardProps {
  onComplete: (agentId: string) => void;
  voices?: Array<{ id: string; name?: string }>; // Optional, will fetch if not provided
  loadingVoices?: boolean;
  initialData?: {
    templateId?: string;
    assistantName?: string;
    systemPrompt?: string;
    firstMessage?: string;
    skipNameStep?: boolean;
    integrationTools?: Record<string, { enabled: boolean; enabled_tools: string[] }>;
  };
}

export type StepType = {
  id: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};
