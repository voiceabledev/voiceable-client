import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Wrench, Edit, Info, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

type PromptPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  systemPromptTemplate: string;
  systemPromptTools: string;
  systemPromptBehaviours: string;
  systemPromptOutcomeCriteria?: string;
  promptToolsSummary: string;
  onSaveTemplate?: (template: string) => Promise<void>;
  saving?: boolean;
};

export const PromptPreviewModal: React.FC<PromptPreviewModalProps> = ({
  open,
  onOpenChange,
  systemPromptTemplate,
  systemPromptTools,
  systemPromptBehaviours,
  systemPromptOutcomeCriteria,
  promptToolsSummary,
  onSaveTemplate,
  saving = false,
}) => {
  const [editedTemplate, setEditedTemplate] = useState(systemPromptTemplate);
  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when prop changes
  useEffect(() => {
    setEditedTemplate(systemPromptTemplate);
    setHasChanges(false);
  }, [systemPromptTemplate, open]);

  const handleTemplateChange = (value: string) => {
    setEditedTemplate(value);
    setHasChanges(value !== systemPromptTemplate);
  };

  const handleSave = async () => {
    if (onSaveTemplate && hasChanges) {
      await onSaveTemplate(editedTemplate);
      setHasChanges(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        setEditedTemplate(systemPromptTemplate);
        setHasChanges(false);
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <div className="p-6 pb-4 border-b flex-shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <DialogTitle>Full Prompt Preview</DialogTitle>
                <DialogDescription>
                  Edit the system prompt template. Agent behaviors should be edited in the Agent Behaviour section.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* System Prompt Template Section - Editable */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4 text-primary" />
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    System Prompt Template (Editable)
                  </Badge>
                </div>
                {hasChanges && (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                    Unsaved changes
                  </Badge>
                )}
              </div>
              <Textarea
                value={editedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="min-h-[300px] font-mono text-sm leading-relaxed"
                placeholder="Enter the system prompt template..."
              />
            </div>

            {/* Integration Tools Prompt Section - Read-only */}
            {systemPromptTools && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className="bg-secondary/50 text-foreground/70 border-border">
                    Integration Tools (Auto-generated)
                  </Badge>
                </div>
                <div className="bg-secondary/20 rounded-xl p-5 border border-border/50">
                  <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-foreground/80">
                    {systemPromptTools}
                  </pre>
                </div>
              </div>
            )}

            {/* Agent Behaviours Section - Read-only with note */}
            {systemPromptBehaviours && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className="bg-secondary/50 text-foreground/70 border-border">
                    Agent Behaviours (Edit in Agent Behaviour section)
                  </Badge>
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    To edit scenarios, phases, or voice tone, please use the Agent Behaviour section in the main interface.
                  </AlertDescription>
                </Alert>
                <div className="bg-secondary/20 rounded-xl p-5 border border-border/50">
                  <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-foreground/80">
                    {systemPromptBehaviours}
                  </pre>
                </div>
              </div>
            )}

            {/* Outcome Criteria Section - Read-only */}
            {systemPromptOutcomeCriteria && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className="bg-secondary/50 text-foreground/70 border-border">
                    Outcome Criteria (Edit in Outcomes section)
                  </Badge>
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    To edit success criteria and outcome reporting instructions, please use the Outcomes section in the main interface.
                  </AlertDescription>
                </Alert>
                <div className="bg-secondary/20 rounded-xl p-5 border border-border/50">
                  <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-foreground/80">
                    {systemPromptOutcomeCriteria}
                  </pre>
                </div>
              </div>
            )}

            {/* Tools Summary Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-secondary">
                  <Wrench className="h-3.5 w-3.5" />
                </div>
                <Badge variant="outline" className="bg-secondary/50 text-foreground/70 border-border">
                  Available Tools
                </Badge>
              </div>
              <div className="bg-secondary/20 rounded-xl p-5 border border-border/50">
                <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-foreground/80">
                  {promptToolsSummary || "No tools enabled."}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || saving || !onSaveTemplate}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Template"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
