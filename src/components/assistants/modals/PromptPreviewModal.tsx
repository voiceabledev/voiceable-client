import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type PromptPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  derivedSystemPrompt: string;
  promptToolsSummary: string;
};

export const PromptPreviewModal: React.FC<PromptPreviewModalProps> = ({
  open,
  onOpenChange,
  derivedSystemPrompt,
  promptToolsSummary,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <div className="p-6 pb-4 border-b">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Full Prompt Preview</DialogTitle>
                <DialogDescription>
                  This is how the final prompt and tools will be sent to the model.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-8">
            {/* System Prompt Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                  System Prompt
                </Badge>
              </div>
              <div className="bg-secondary/30 rounded-xl p-5 border border-border/50">
                <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-foreground/80">
                  {derivedSystemPrompt || "No prompt logic defined yet."}
                </pre>
              </div>
            </div>

            {/* Tools Summary Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-secondary">
                  <Wrench className="h-3.5 w-3.5" />
                </div>
                <Badge variant="outline" className="bg-secondary/50 text-foreground/70 border-border">
                  Available Tools
                </Badge>
              </div>
              <div className="bg-secondary/20 rounded-xl p-5 border border-border/50">
                <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-muted-foreground italic">
                  {promptToolsSummary || "No tools enabled."}
                </pre>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
