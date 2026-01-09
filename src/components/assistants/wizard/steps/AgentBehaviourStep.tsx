import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Sparkles } from "lucide-react";
import { SectionEntry } from "@/types/assistant";
import type { BehaviourConfig } from "@/components/assistants/SectionEditors";
import { AgentTemplateSection } from "@/components/assistants/sections/AgentTemplateSection";
import { GenerateBehaviourModal } from "@/components/assistants/modals/GenerateBehaviourModal";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AgentBehaviourStepProps {
  scenarios: SectionEntry[];
  phases: SectionEntry[];
  voiceTone: SectionEntry[];
  behaviourConfig?: BehaviourConfig;
  onOpenSectionModal: (type: "scenarios" | "phases" | "voiceTone", entry?: SectionEntry) => void;
  onDeleteSectionEntry: (type: "scenarios" | "phases" | "voiceTone", id: string) => void;
  onApplyGeneratedBehaviour?: (data: {
    scenarios?: SectionEntry[];
    phases?: SectionEntry[];
    voiceTone?: SectionEntry[];
  }) => void;
  agentId?: string | null;
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
  onApplyGeneratedBehaviour,
  agentId,
  systemPromptTemplate = "",
  onSystemPromptTemplateChange,
}: AgentBehaviourStepProps) {
  const [agentTemplateExpanded, setAgentTemplateExpanded] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Check if there are existing behaviors
  const hasExistingBehaviors = scenarios.length > 0 || phases.length > 0 || voiceTone.length > 0;

  const handleGenerateClick = () => {
    if (!agentId || agentId === "new") {
      // Agent doesn't exist yet, can't generate
      return;
    }
    if (hasExistingBehaviors) {
      setShowConfirmDialog(true);
    } else {
      setShowGenerateModal(true);
    }
  };

  const handleConfirmGenerate = () => {
    setShowConfirmDialog(false);
    setShowGenerateModal(true);
  };

  const handleApply = (data: {
    scenarios?: SectionEntry[];
    phases?: SectionEntry[];
    voiceTone?: SectionEntry[];
  }) => {
    if (onApplyGeneratedBehaviour) {
      onApplyGeneratedBehaviour(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Define scenarios, conversation phases, and voice tone to customize your agent's behavior. These are optional but help create a more tailored experience.
          </p>
        </div>
        {agentId && agentId !== "new" && (
          <div className="flex items-center justify-end">
            <button
              onClick={handleGenerateClick}
              className="text-white font-medium px-4 py-2 rounded-md overflow-hidden relative transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="h-3.5 w-3.5 relative z-10" />
              <span className="relative z-10">Generate with AI</span>
              <motion.div
                initial={{ left: 0 }}
                animate={{ left: "-300%" }}
                transition={{
                  repeat: Infinity,
                  repeatType: "mirror",
                  duration: 4,
                  ease: "linear",
                }}
                className="bg-[linear-gradient(to_right,#8f14e6,#e614dc,#e61453,#e68414,#e6e614)] absolute z-0 inset-0 w-[400%]"
              />
            </button>
          </div>
        )}
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

      {agentId && agentId !== "new" && (
        <>
          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Replace Existing Behaviors?</AlertDialogTitle>
                <AlertDialogDescription>
                  You have existing behaviors configured. Generating new behaviors will replace all current scenarios, phases, and voice tones. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmGenerate}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <GenerateBehaviourModal
            open={showGenerateModal}
            onOpenChange={setShowGenerateModal}
            agentId={agentId}
            onApply={handleApply}
          />
        </>
      )}
    </div>
  );
}
