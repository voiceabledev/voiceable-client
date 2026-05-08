/**
 * Replaces React Router location.state for /assistants/create (Next.js has no location.state).
 */
const STORAGE_KEY = "voiceable_create_agent_wizard_state";

/** Survives React Strict Mode double-mount so consume() is idempotent until stash clears it. */
let memoryHold: CreateAgentWizardLocationState | null | undefined = undefined;

export type CreateAgentWizardLocationState = {
  templateId?: string | null;
  assistantName?: string;
  systemPrompt?: string;
  firstMessage?: string;
  skipNameStep?: boolean;
  integrationTools?: Record<string, { enabled: boolean; enabled_tools: string[] }>;
  agentType?: string;
  agentTypeConfig?: import("@/constants/agentTypeConfigs").AgentTypeConfig;
  autoGenerateBehavior?: boolean;
  preSelectedVoices?: string[];
  preSelectedGoals?: string[];
};

export function stashCreateAgentWizardState(data: CreateAgentWizardLocationState): void {
  memoryHold = undefined;
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota */
  }
}

export function consumeCreateAgentWizardState(): CreateAgentWizardLocationState | null {
  if (memoryHold !== undefined) return memoryHold;
  if (typeof sessionStorage === "undefined") {
    memoryHold = null;
    return null;
  }
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    memoryHold = null;
    return null;
  }
  sessionStorage.removeItem(STORAGE_KEY);
  try {
    memoryHold = JSON.parse(raw) as CreateAgentWizardLocationState;
    return memoryHold;
  } catch {
    memoryHold = null;
    return null;
  }
}
