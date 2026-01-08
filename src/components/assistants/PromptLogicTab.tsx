import React, { useState, useRef } from "react";
import { MessageSquare, FileText, Brain, Paperclip } from "lucide-react";
import { FirstMessageSection } from "./sections/FirstMessageSection";
import { AgentTemplateSection } from "./sections/AgentTemplateSection";
import { SectionEditors, type BehaviourConfig } from "./SectionEditors";
import { FilesSection } from "./sections/FilesSection";
import type { Agent, SectionEntry, AgentFile, SectionType } from "@/types/assistant";

type PromptLogicTabProps = {
  agent: Agent | null;
  onUpdate: (updates: Partial<Agent>) => void;
  scenarios: SectionEntry[];
  phases: SectionEntry[];
  voiceTone: SectionEntry[];
  onAddSectionEntry: (type: SectionType) => void;
  onEditSectionEntry: (type: SectionType, entry: SectionEntry) => void;
  onRemoveSectionEntry: (type: SectionType, id: string) => void;
  attachedFiles: AgentFile[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, agentId?: string) => Promise<void>;
  onFileDelete: (fileId: string) => Promise<void>;
  onOpenChooseFiles: () => void;
  uploadingFiles: boolean;
  isNew: boolean;
  agentFiles: AgentFile[];
  loadingAvailableFiles: boolean;
  assigningFile: string | null;
  fetchAllAvailableFiles: () => Promise<void>;
  setShowChooseFilesDialog: (show: boolean) => void;
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
  attachedFiles,
  onFileUpload,
  onFileDelete,
  onOpenChooseFiles,
  uploadingFiles,
  isNew,
  agentFiles,
  loadingAvailableFiles,
  assigningFile,
  fetchAllAvailableFiles,
  setShowChooseFilesDialog,
  behaviourConfig,
  conversationConfig,
  onUpdateConversationConfig,
}) => {
  const [firstMessageExpanded, setFirstMessageExpanded] = useState(false);
  const [agentTemplateExpanded, setAgentTemplateExpanded] = useState(false);
  const [agentBehaviourExpanded, setAgentBehaviourExpanded] = useState(false);
  const [filesExpanded, setFilesExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert uploadingFiles boolean to Set<string> for FilesSection
  const uploadingFilesSet = new Set<string>();

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
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
          <MessageSquare className="h-4 w-4" />
          <span>FIRST MESSAGE</span>
        </div>
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
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
          <Brain className="h-4 w-4" />
          <span>AGENT BEHAVIOUR</span>
        </div>
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
          behaviourConfig={behaviourConfig}
        />
      </div>

      <div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
          <Paperclip className="h-4 w-4" />
          <span>FILES</span>
        </div>
        <FilesSection
          expanded={filesExpanded}
          onToggleExpanded={() => setFilesExpanded(!filesExpanded)}
          isNew={isNew}
          attachedFiles={attachedFiles}
          setAttachedFiles={() => {}} // This is handled by the parent
          agentFiles={agentFiles}
          uploadingFiles={uploadingFilesSet}
          handleFileDelete={onFileDelete}
          handleFileUpload={async (files) => {
            // Create a synthetic ChangeEvent from File[]
            const dataTransfer = new DataTransfer();
            files.forEach(file => dataTransfer.items.add(file));
            const syntheticEvent = {
              target: { files: dataTransfer.files }
            } as React.ChangeEvent<HTMLInputElement>;
            // Pass agentId if available
            await onFileUpload(syntheticEvent, agent?.id);
          }}
          fileInputRef={fileInputRef}
        />
      </div>
    </div>
  );
};
