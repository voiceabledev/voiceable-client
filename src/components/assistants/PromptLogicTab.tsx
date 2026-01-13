import React, { useState } from "react";
import { MessageSquare, FileText, Brain } from "lucide-react";
import { FirstMessageSection } from "./sections/FirstMessageSection";
import { AgentTemplateSection } from "./sections/AgentTemplateSection";
import { SectionEditors, type BehaviourConfig } from "./SectionEditors";
import type { Agent, SectionEntry, SectionType } from "@/types/assistant";

type PromptLogicTabProps = {
  agent: Agent | null;
  onUpdate: (updates: Partial<Agent>) => void;
  scenarios: SectionEntry[];
  phases: SectionEntry[];
  voiceTone: SectionEntry[];
  onAddSectionEntry: (type: SectionType) => void;
  onEditSectionEntry: (type: SectionType, entry: SectionEntry) => void;
  onRemoveSectionEntry: (type: SectionType, id: string) => void;
  onApplyGeneratedBehaviour?: (data: {
    scenarios?: SectionEntry[];
    phases?: SectionEntry[];
    voiceTone?: SectionEntry[];
  }) => void;
  behaviourConfig?: BehaviourConfig;
  conversationConfig?: Record<string, unknown> | null;
  onUpdateConversationConfig?: (updates: Record<string, unknown>) => void;
};

export const PromptLogicTab: React.FC<PromptLogicTabProps> = ({
  agent,
  onUpdate,
  scenarios,
  phases,
  voiceTone,
  onAddSectionEntry,
  onEditSectionEntry,
  onRemoveSectionEntry,
  onApplyGeneratedBehaviour,
  behaviourConfig,
  conversationConfig,
  onUpdateConversationConfig,
}) => {
  const [firstMessageExpanded, setFirstMessageExpanded] = useState(false);
  const [agentTemplateExpanded, setAgentTemplateExpanded] = useState(false);
  const [agentBehaviourExpanded, setAgentBehaviourExpanded] = useState(false);

  if (!agent) {
    return null;
  }

  // Map first_message_mode from API format to component format
  // API might return "text" | "audio" but component expects the mode strings
  const getFirstMessageMode = (mode: string | undefined): string => {
    if (!mode) return "assistant-speaks-first";
    // If it's already in the correct format, return it
    if (["assistant-speaks-first", "assistant-waits-for-user", "assistant-speaks-first-model-generated"].includes(mode)) {
      return mode;
    }
    // Otherwise default
    return "assistant-speaks-first";
  };

  // Extract system_prompt_template from conversationConfig
  const systemPromptTemplate = (conversationConfig?.system_prompt_template as string) || "";

  // Handle system prompt template updates
  const handleSystemPromptTemplateUpdate = (newTemplate: string) => {
    if (onUpdateConversationConfig) {
      onUpdateConversationConfig({
        system_prompt_template: newTemplate,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <FirstMessageSection
          expanded={firstMessageExpanded}
          onToggleExpanded={() => setFirstMessageExpanded(!firstMessageExpanded)}
          firstMessageMode={getFirstMessageMode(agent.first_message_mode as string)}
          setFirstMessageMode={(mode) => {
            // Map back to API format if needed, or store as-is
            // The API accepts the mode string directly
            onUpdate({ first_message_mode: mode as "text" | "audio" });
          }}
          firstMessage={agent.first_message || ""}
          setFirstMessage={(message) => onUpdate({ first_message: message })}
          agentName={agent.name || ""}
        />
      </div>

      {false && conversationConfig !== undefined && onUpdateConversationConfig && (
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
            <FileText className="h-4 w-4" />
            <span>AGENT TEMPLATE</span>
          </div>
          <AgentTemplateSection
            expanded={agentTemplateExpanded}
            onToggleExpanded={() => setAgentTemplateExpanded(!agentTemplateExpanded)}
            systemPromptTemplate={systemPromptTemplate}
            setSystemPromptTemplate={handleSystemPromptTemplateUpdate}
          />
        </div>
      )}
      
      <div>
        <SectionEditors
          expanded={agentBehaviourExpanded}
          onToggleExpanded={() => setAgentBehaviourExpanded(!agentBehaviourExpanded)}
          cenarios={scenarios}
          etapas={phases}
          tomDeVoz={voiceTone}
          onAddEntry={onAddSectionEntry}
          onEditEntry={(type, entryId) => {
            let entry: SectionEntry | undefined;
            if (type === "scenarios") entry = scenarios.find(e => e.id === entryId);
            else if (type === "phases") entry = phases.find(e => e.id === entryId);
            else if (type === "voiceTone") entry = voiceTone.find(e => e.id === entryId);
            if (entry) onEditSectionEntry(type, entry);
          }}
          onRemoveEntry={onRemoveSectionEntry}
          onApplyGeneratedBehaviour={onApplyGeneratedBehaviour}
          agentId={agent?.id}
          behaviourConfig={behaviourConfig}
        />
      </div>

    </div>
  );
};
