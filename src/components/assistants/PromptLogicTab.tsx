import React, { useState, useRef } from "react";
import { FirstMessageSection } from "./sections/FirstMessageSection";
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
}) => {
  const [firstMessageExpanded, setFirstMessageExpanded] = useState(true);
  const [agentBehaviourExpanded, setAgentBehaviourExpanded] = useState(true);
  const [filesExpanded, setFilesExpanded] = useState(true);
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

  return (
    <div className="space-y-6">
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
  );
};
