import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { SectionEntry } from "@/types/assistant";
import type { BehaviourConfig } from "@/components/assistants/SectionEditors";
import { AgentTemplateSection } from "@/components/assistants/sections/AgentTemplateSection";

interface AgentBehaviourStepProps {
  scenarios: SectionEntry[];
  phases: SectionEntry[];
  voiceTone: SectionEntry[];
  behaviourConfig?: BehaviourConfig;
  onOpenSectionModal: (type: "scenarios" | "phases" | "voiceTone", entry?: SectionEntry) => void;
  onDeleteSectionEntry: (type: "scenarios" | "phases" | "voiceTone", id: string) => void;
  systemPromptTemplate?: string;
  onSystemPromptTemplateChange?: (template: string) => void;
}

const getSectionConfig = (
  sectionType: "scenarios" | "phases" | "voiceTone",
  behaviourConfig?: BehaviourConfig
) => {
  const defaultConfigs = {
    scenarios: {
      title: "Scenarios",
      description: "Define the main scenarios your agent should handle",
      addLabel: "Add Scenario",
    },
    phases: {
      title: "Conversation Phases",
      description: "Define the phases your agent should follow during conversations",
      addLabel: "Add Phase",
    },
    voiceTone: {
      title: "Voice & Tone",
      description: "Define the tone and communication style your agent should maintain",
      addLabel: "Add Tone",
    },
  };

  const defaultConfig = defaultConfigs[sectionType];
  const behaviourSection = behaviourConfig?.[sectionType];

  if (behaviourSection) {
    return {
      title: behaviourSection.label || defaultConfig.title,
      description: behaviourSection.description || defaultConfig.description,
      addLabel: behaviourSection.add_label || defaultConfig.addLabel,
    };
  }

  return defaultConfig;
};

const renderSectionEditor = (
  entries: SectionEntry[],
  sectionType: "scenarios" | "phases" | "voiceTone",
  behaviourConfig: BehaviourConfig | undefined,
  onOpenSectionModal: (type: "scenarios" | "phases" | "voiceTone", entry?: SectionEntry) => void,
  onDeleteSectionEntry: (type: "scenarios" | "phases" | "voiceTone", id: string) => void
) => {
  const config = getSectionConfig(sectionType, behaviourConfig);
  return (
    <div className="border border-border rounded-lg bg-white p-4 space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h4 className="text-sm font-semibold">{config.title}</h4>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onOpenSectionModal(sectionType)}
          className="flex items-center gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          {config.addLabel}
        </Button>
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No {config.title.toLowerCase()} defined yet. Use the button above to add one.
        </p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="group flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
            >
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => onOpenSectionModal(sectionType, entry)}
              >
                <h5 className="text-sm font-medium truncate">
                  {entry.title || <span className="text-muted-foreground italic">Untitled</span>}
                </h5>
                {entry.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {entry.description.length > 80
                      ? `${entry.description.slice(0, 80)}...`
                      : entry.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onOpenSectionModal(sectionType, entry)}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => onDeleteSectionEntry(sectionType, entry.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function AgentBehaviourStep({
  scenarios,
  phases,
  voiceTone,
  behaviourConfig,
  onOpenSectionModal,
  onDeleteSectionEntry,
  systemPromptTemplate = "",
  onSystemPromptTemplateChange,
}: AgentBehaviourStepProps) {
  const [agentTemplateExpanded, setAgentTemplateExpanded] = useState(true);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Define scenarios, conversation phases, and voice tone to customize your agent's behavior. These are optional but help create a more tailored experience.
          </p>
        </div>
      </div>

      {/* Agent Template Section */}
      {false && onSystemPromptTemplateChange && (
        <AgentTemplateSection
          expanded={agentTemplateExpanded}
          onToggleExpanded={() => setAgentTemplateExpanded(!agentTemplateExpanded)}
          systemPromptTemplate={systemPromptTemplate}
          setSystemPromptTemplate={onSystemPromptTemplateChange}
        />
      )}
      
      {renderSectionEditor(scenarios, "scenarios", behaviourConfig, onOpenSectionModal, onDeleteSectionEntry)}
      {renderSectionEditor(phases, "phases", behaviourConfig, onOpenSectionModal, onDeleteSectionEntry)}
      {renderSectionEditor(voiceTone, "voiceTone", behaviourConfig, onOpenSectionModal, onDeleteSectionEntry)}
    </div>
  );
}
