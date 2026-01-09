import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AudioLines, Clock, GitBranch, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionEntry, SectionType } from "@/types/assistant";

type SectionEntryModalProps = {
  open: boolean;
  onClose: () => void;
  editingSectionEntry: SectionEntry | null;
  sectionForm: Omit<SectionEntry, "id">;
  setSectionForm: React.Dispatch<React.SetStateAction<Omit<SectionEntry, "id">>>;
  onSave: () => void;
  sectionType: SectionType | null;
};

export const SectionEntryModal: React.FC<SectionEntryModalProps> = ({
  open,
  onClose,
  editingSectionEntry,
  sectionForm,
  setSectionForm,
  onSave,
  sectionType,
}) => {
  const getTitleAndDescription = () => {
    switch (sectionType) {
      case "scenarios":
        return {
          title: "Define a scenario for the assistant behavior.",
          description: "List the main scenarios the assistant should cover (e.g., Catalog, Service)."
        };
      case "phases":
        return {
          title: "Define a phase for the assistant behavior.",
          description: "Break down the stages or flow steps the assistant should follow."
        };
      case "voiceTone":
        return {
          title: "Define a voice tone for the assistant behavior.",
          description: "Describe how the assistant should sound, including restrictions or tone preferences."
        };
      default:
        return {
          title: "Define a section for the assistant behavior.",
          description: ""
        };
    }
  };

  const { title: modalTitle, description: modalDescription } = getTitleAndDescription();
  
  const getDialogTitle = () => {
    if (editingSectionEntry) {
      switch (sectionType) {
        case "scenarios":
          return "Edit Scenario";
        case "phases":
          return "Edit Phase";
        case "voiceTone":
          return "Edit Voice & Tone";
        default:
          return "Edit Entry";
      }
    } else {
      switch (sectionType) {
        case "scenarios":
          return "Add Scenario";
        case "phases":
          return "Add Phase";
        case "voiceTone":
          return "Add Voice & Tone";
        default:
          return "Add Entry";
      }
    }
  };

  const getIcon = () => {
    switch (sectionType) {
      case "scenarios":
        return GitBranch;
      case "phases":
        return Clock;
      case "voiceTone":
        return AudioLines;
      default:
        return Sparkles;
    }
  };

  const getIconColor = () => {
    switch (sectionType) {
      case "scenarios":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "phases":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      case "voiceTone":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  const IconComponent = getIcon();

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-lg sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-3 rounded-xl transition-colors",
              getIconColor()
            )}>
              <IconComponent className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-1">
              <DialogTitle className="text-xl font-semibold leading-tight">
                {getDialogTitle()}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                {modalTitle}
              </DialogDescription>
              {modalDescription && (
                <p className="text-xs text-muted-foreground/80 mt-1.5 leading-relaxed">
                  {modalDescription}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <label htmlFor="section-title" className="text-sm font-medium text-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="section-title"
              value={sectionForm.title}
              onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
              placeholder="e.g., Greeting, Product Inquiry, Checkout"
              className="h-10"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="section-description" className="text-sm font-medium text-foreground">
              Description
            </label>
            <Textarea
              id="section-description"
              value={sectionForm.description}
              onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
              placeholder="Describe the content, behavior, or requirements..."
              className="min-h-[100px] resize-y text-sm leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="section-notes" className="text-sm font-medium text-foreground">
              Notes <span className="text-muted-foreground font-normal text-xs">(optional)</span>
            </label>
            <Textarea
              id="section-notes"
              value={sectionForm.notes || ""}
              onChange={(e) => setSectionForm({ ...sectionForm, notes: e.target.value })}
              placeholder="Additional notes or reminders..."
              className="min-h-[80px] resize-y text-sm leading-relaxed"
            />
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
          <Button 
            onClick={onSave} 
            disabled={!sectionForm.title.trim()}
            className="flex-1 sm:flex-initial bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {editingSectionEntry ? "Save Changes" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
