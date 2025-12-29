import React from "react";
import { Plus, ChevronDown, Edit, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

export type SectionEntry = {
  id: string;
  title: string;
  description: string;
  notes?: string;
};

export type SectionType = "scenarios" | "phases" | "voiceTone";

export type BehaviourSectionConfig = {
  label: string;
  description?: string;
  add_label?: string;
  title_placeholder?: string;
  description_placeholder?: string;
  notes_placeholder?: string;
  notes_label?: string;
};

export type BehaviourConfig = {
  scenarios?: BehaviourSectionConfig;
  phases?: BehaviourSectionConfig;
  voiceTone?: BehaviourSectionConfig;
};

export type SectionEditorConfig = {
  title: string;
  description: string;
  entries: SectionEntry[];
  sectionType: SectionType;
  addLabel: string;
  titlePlaceholder: string;
  descriptionPlaceholder: string;
  notesPlaceholder: string;
  notesLabel?: string;
};

type SectionEditorsProps = {
  expanded: boolean;
  onToggleExpanded: () => void;
  cenarios: SectionEntry[];
  etapas: SectionEntry[];
  tomDeVoz: SectionEntry[];
  onAddEntry: (type: SectionType) => void;
  onEditEntry: (type: SectionType, entryId: string) => void;
  onRemoveEntry: (type: SectionType, id: string) => void;
  behaviourConfig?: BehaviourConfig;
};

export const SectionEditors: React.FC<SectionEditorsProps> = ({
  expanded,
  onToggleExpanded,
  cenarios,
  etapas,
  tomDeVoz,
  onAddEntry,
  onEditEntry,
  onRemoveEntry,
  behaviourConfig,
}) => {
  // Default configurations (fallback)
  const defaultConfigs = {
    scenarios: {
      title: "Scenarios",
      description: "List the main scenarios the assistant should cover (e.g., Catolog, Service).",
      addLabel: "Add scenario",
      titlePlaceholder: "Scenario name",
      descriptionPlaceholder: "Describe what should happen in this scenario",
      notesPlaceholder: "Optional instructions, edge cases, or requirements",
      notesLabel: "Optional guidance for this scenario",
    },
    phases: {
      title: "Conversation Phases",
      description: "Break down the stages or flow steps the assistant should follow.",
      addLabel: "Add phase",
      titlePlaceholder: "Stage name",
      descriptionPlaceholder: "Explain what happens in this stage",
      notesPlaceholder: "Optional transition tips or reminders for operators",
      notesLabel: "Optional flow guidance",
    },
    voiceTone: {
      title: "Voice Tone",
      description: "Describe how the assistant should sound, including restrictions or tone preferences.",
      addLabel: "Add tone",
      titlePlaceholder: "Tone label (e.g., Professional)",
      descriptionPlaceholder: "Describe the desired tone",
      notesPlaceholder: "Optional vocabulary restrictions or style notes",
      notesLabel: "Optional tone rules",
    },
  };

  // Get configuration for a section type, using behaviour config if available
  const getSectionConfig = (type: SectionType) => {
    const defaultConfig = defaultConfigs[type];
    const behaviourSection = behaviourConfig?.[type];

    console.log(`SectionEditors - getSectionConfig for ${type}:`, {
      behaviourConfig,
      behaviourSection,
      defaultConfig
    });

    if (behaviourSection) {
      return {
        title: behaviourSection.label || defaultConfig.title,
        description: behaviourSection.description || defaultConfig.description,
        addLabel: behaviourSection.add_label || defaultConfig.addLabel,
        titlePlaceholder: behaviourSection.title_placeholder || defaultConfig.titlePlaceholder,
        descriptionPlaceholder: behaviourSection.description_placeholder || defaultConfig.descriptionPlaceholder,
        notesPlaceholder: behaviourSection.notes_placeholder || defaultConfig.notesPlaceholder,
        notesLabel: behaviourSection.notes_label || defaultConfig.notesLabel,
      };
    }

    return defaultConfig;
  };
  const renderSectionEditor = ({
    title,
    description,
    entries,
    sectionType,
    addLabel,
  }: SectionEditorConfig) => (
    <div className="border border-border rounded-lg overflow-hidden bg-muted/10">
      <div className="p-4 border-b border-border bg-muted/20">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold">{title}</h4>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-primary"
            onClick={() => onAddEntry(sectionType)}
          >
            <Plus className="h-3 w-3 mr-1" />
            {addLabel}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="p-4 space-y-3">
        {entries.length === 0 ? (
          <p className="text-xs text-muted-foreground italic text-center py-2">
            No entries added yet. Click {addLabel} to start.
          </p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="group p-3 border border-border rounded-lg bg-card hover:border-primary/50 transition-colors cursor-pointer relative"
              onClick={() => onEditEntry(sectionType, entry.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium truncate mb-1">{entry.title}</h5>
                  <p className="text-xs text-muted-foreground line-clamp-2">{entry.description}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditEntry(sectionType, entry.id);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveEntry(sectionType, entry.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <button className="w-full flex items-start justify-between gap-2" onClick={onToggleExpanded}>
        <div className="text-left flex-1">
          <h3 className="text-base md:text-lg font-semibold">Agent Behaviour</h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Define how the assistant should behave by describing the scenarios, stages, and voice tone it must handle.
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
        <div className="mt-4 md:mt-6 space-y-5">
          <div className="space-y-5">
            {(() => {
              const config = getSectionConfig("scenarios");
              return renderSectionEditor({
                title: config.title,
                description: config.description,
                entries: cenarios,
                sectionType: "scenarios",
                addLabel: config.addLabel,
                titlePlaceholder: config.titlePlaceholder,
                descriptionPlaceholder: config.descriptionPlaceholder,
                notesPlaceholder: config.notesPlaceholder,
                notesLabel: config.notesLabel,
              });
            })()}
            {(() => {
              const config = getSectionConfig("phases");
              return renderSectionEditor({
                title: config.title,
                description: config.description,
                entries: etapas,
                sectionType: "phases",
                addLabel: config.addLabel,
                titlePlaceholder: config.titlePlaceholder,
                descriptionPlaceholder: config.descriptionPlaceholder,
                notesPlaceholder: config.notesPlaceholder,
                notesLabel: config.notesLabel,
              });
            })()}
            {(() => {
              const config = getSectionConfig("voiceTone");
              return renderSectionEditor({
                title: config.title,
                description: config.description,
                entries: tomDeVoz,
                sectionType: "voiceTone",
                addLabel: config.addLabel,
                titlePlaceholder: config.titlePlaceholder,
                descriptionPlaceholder: config.descriptionPlaceholder,
                notesPlaceholder: config.notesPlaceholder,
                notesLabel: config.notesLabel,
              });
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
