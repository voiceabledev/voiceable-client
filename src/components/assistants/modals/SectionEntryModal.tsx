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
import { AudioLines, Clock, GitBranch } from "lucide-react";
import type { SectionEntry, SectionType } from "@/types/assistant";

type SectionEntryModalProps = {
  open: boolean;
  onClose: () => void;
  editingSectionEntry: SectionEntry | null;
  sectionForm: Omit<SectionEntry, "id">;
  setSectionForm: React.Dispatch<React.SetStateAction<Omit<SectionEntry, "id">>>;
  onSave: () => void;
};

export const SectionEntryModal: React.FC<SectionEntryModalProps> = ({
  open,
  onClose,
  editingSectionEntry,
  sectionForm,
  setSectionForm,
  onSave,
}) => {
  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <AudioLines className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>
                {editingSectionEntry ? "Edit Entry" : "Add Entry"}
              </DialogTitle>
              <DialogDescription>
                Define a section for the assistant behavior.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Title
            </label>
            <Input
              value={sectionForm.title}
              onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
              placeholder="e.g., Greeting"
              className="bg-white border-border"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              value={sectionForm.description}
              onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
              placeholder="Describe the content..."
              className="bg-white border-border min-h-[100px] text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Notes <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              value={sectionForm.notes || ""}
              onChange={(e) => setSectionForm({ ...sectionForm, notes: e.target.value })}
              placeholder="Optional notes..."
              className="bg-white border-border min-h-[80px] text-sm"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={!sectionForm.title.trim()}>
            {editingSectionEntry ? "Save changes" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
