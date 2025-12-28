import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SectionEntry } from "@/types/assistant";

interface SectionEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSectionType: "scenarios" | "phases" | "voiceTone" | null;
  editingSectionEntry: SectionEntry | null;
  sectionForm: Omit<SectionEntry, "id">;
  onSectionFormChange: (form: Omit<SectionEntry, "id">) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function SectionEntryModal({
  open,
  onOpenChange,
  editingSectionType,
  editingSectionEntry,
  sectionForm,
  onSectionFormChange,
  onSave,
  onCancel,
}: SectionEntryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingSectionEntry ? "Edit Entry" : "Add Entry"}
          </DialogTitle>
          <DialogDescription>
            {editingSectionType === "scenarios" && "Define a scenario your agent should handle."}
            {editingSectionType === "phases" && "Define a conversation phase your agent should follow."}
            {editingSectionType === "voiceTone" && "Define a tone or communication style for your agent."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="section-title">Title</Label>
            <Input
              id="section-title"
              value={sectionForm.title}
              onChange={(e) => onSectionFormChange({ ...sectionForm, title: e.target.value })}
              placeholder="Enter a title..."
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="section-description">Description</Label>
            <Textarea
              id="section-description"
              value={sectionForm.description}
              onChange={(e) => onSectionFormChange({ ...sectionForm, description: e.target.value })}
              placeholder="Enter a description..."
              className="mt-1 min-h-[100px]"
            />
          </div>
          <div>
            <Label htmlFor="section-notes">Notes (optional)</Label>
            <Textarea
              id="section-notes"
              value={sectionForm.notes || ""}
              onChange={(e) => onSectionFormChange({ ...sectionForm, notes: e.target.value })}
              placeholder="Enter additional notes..."
              className="mt-1 min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            {editingSectionEntry ? "Save Changes" : (() => {
              switch (editingSectionType) {
                case "scenarios": return "Add Scenario";
                case "phases": return "Add Conversation Phase";
                case "voiceTone": return "Add Voice & Tone";
                default: return "Add Entry";
              }
            })()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
