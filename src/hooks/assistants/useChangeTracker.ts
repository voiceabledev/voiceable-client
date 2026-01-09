import { useState, useCallback, useRef, useEffect } from 'react';
import { compareValues } from '@/utils/changeTracker';
import type {
  WebhookTool,
  ClientTool,
  AgentIntegrationTool,
  SectionEntry,
  SystemToolsState,
  SystemToolSetting,
  AgentFile,
  Agent,
} from '@/types/assistant';
import type { OutcomeDefinition } from '@/types/outcomes';

import type { EscalationRuleSettings } from '@/components/assistants/EscalationRulesPanel';

export interface OutcomeState {
  primaryOutcomes: string[];
  successKeywords: string[];
  failureKeywords: string[];
  escalationRuleSettings: EscalationRuleSettings;
}

export interface TrackedState {
  webhookTools: WebhookTool[];
  clientTools: ClientTool[];
  agentIntegrationTools: AgentIntegrationTool[];
  scenarios: SectionEntry[];
  phases: SectionEntry[];
  voiceTone: SectionEntry[];
  systemTools: SystemToolsState;
  systemToolSettings: SystemToolSetting;
  systemToolSettingsMap: Record<string, SystemToolSetting>;
  attachedFiles: AgentFile[];
  agent: Agent | null;
  conversationConfig: Record<string, unknown> | null;
  outcomeState: OutcomeState | null;
}

export interface UseChangeTrackerReturn {
  hasChanges: boolean;
  updateBaseline: () => void;
  setTrackedState: (state: TrackedState) => void;
}

/**
 * Hook to track changes in assistant configuration
 * Compares current state against last saved baseline
 */
export function useChangeTracker(): UseChangeTrackerReturn {
  const [baseline, setBaseline] = useState<TrackedState | null>(null);
  const [currentState, setCurrentState] = useState<TrackedState | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Use ref to store current state for comparison (avoids stale closures)
  const currentStateRef = useRef<TrackedState | null>(null);
  const baselineRef = useRef<TrackedState | null>(null);

  // Update refs when state changes
  useEffect(() => {
    currentStateRef.current = currentState;
    baselineRef.current = baseline;
  }, [currentState, baseline]);

  // Compare current state with baseline
  useEffect(() => {
    // If no baseline yet, no changes can be detected
    if (!baseline) {
      setHasChanges(false);
      return;
    }
    // If no current state, no changes
    if (!currentState) {
      setHasChanges(false);
      return;
    }

    // Compare each tracked field
    const changes = [
      !compareValues(currentState.webhookTools, baseline.webhookTools),
      !compareValues(currentState.clientTools, baseline.clientTools),
      !compareValues(currentState.agentIntegrationTools, baseline.agentIntegrationTools),
      !compareValues(currentState.scenarios, baseline.scenarios),
      !compareValues(currentState.phases, baseline.phases),
      !compareValues(currentState.voiceTone, baseline.voiceTone),
      !compareValues(currentState.systemTools, baseline.systemTools),
      !compareValues(currentState.systemToolSettings, baseline.systemToolSettings),
      !compareValues(currentState.systemToolSettingsMap, baseline.systemToolSettingsMap),
      !compareValues(currentState.attachedFiles, baseline.attachedFiles),
      // Compare agent fields that matter for save
      !compareValues(currentState.agent?.name, baseline.agent?.name),
      !compareValues(currentState.agent?.first_message, baseline.agent?.first_message),
      !compareValues(currentState.agent?.first_message_mode, baseline.agent?.first_message_mode),
      !compareValues(currentState.agent?.provider, baseline.agent?.provider),
      !compareValues(currentState.agent?.model, baseline.agent?.model),
      !compareValues(currentState.agent?.voice_ids, baseline.agent?.voice_ids),
      !compareValues(currentState.agent?.primary_voice_id, baseline.agent?.primary_voice_id),
      !compareValues(currentState.agent?.languages, baseline.agent?.languages),
      !compareValues(currentState.agent?.default_language, baseline.agent?.default_language),
      // Compare conversation config (for system prompt template and other config)
      !compareValues(currentState.conversationConfig?.system_prompt_template, baseline.conversationConfig?.system_prompt_template),
      // Compare outcome state
      !compareValues(currentState.outcomeState, baseline.outcomeState),
    ];

    setHasChanges(changes.some(hasChange => hasChange));
  }, [baseline, currentState]);

  const setTrackedState = useCallback((state: TrackedState) => {
    setCurrentState(state);
  }, []);

  const updateBaseline = useCallback(() => {
    if (currentStateRef.current) {
      // Deep clone the current state to use as new baseline
      const newBaseline: TrackedState = {
        webhookTools: JSON.parse(JSON.stringify(currentStateRef.current.webhookTools)),
        clientTools: JSON.parse(JSON.stringify(currentStateRef.current.clientTools)),
        agentIntegrationTools: JSON.parse(JSON.stringify(currentStateRef.current.agentIntegrationTools)),
        scenarios: JSON.parse(JSON.stringify(currentStateRef.current.scenarios)),
        phases: JSON.parse(JSON.stringify(currentStateRef.current.phases)),
        voiceTone: JSON.parse(JSON.stringify(currentStateRef.current.voiceTone)),
        systemTools: JSON.parse(JSON.stringify(currentStateRef.current.systemTools)),
        systemToolSettings: JSON.parse(JSON.stringify(currentStateRef.current.systemToolSettings)),
        systemToolSettingsMap: JSON.parse(JSON.stringify(currentStateRef.current.systemToolSettingsMap)),
        attachedFiles: JSON.parse(JSON.stringify(currentStateRef.current.attachedFiles)),
        agent: currentStateRef.current.agent ? JSON.parse(JSON.stringify(currentStateRef.current.agent)) : null,
        conversationConfig: currentStateRef.current.conversationConfig ? JSON.parse(JSON.stringify(currentStateRef.current.conversationConfig)) : null,
        outcomeState: currentStateRef.current.outcomeState ? JSON.parse(JSON.stringify(currentStateRef.current.outcomeState)) : null,
      };
      setBaseline(newBaseline);
      setHasChanges(false);
    }
  }, []);

  return {
    hasChanges,
    updateBaseline,
    setTrackedState,
  };
}
