import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Plus, Loader2 } from "lucide-react";
import type { AgentFile } from "@/types/assistant";

type ChooseFilesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loadingAvailableFiles: boolean;
  allAvailableFiles: AgentFile[];
  attachedFiles: AgentFile[];
  assigningFile: string | null;
  onSelectExistingFile: (fileId: string) => void;
};

export const ChooseFilesDialog: React.FC<ChooseFilesDialogProps> = ({
  open,
  onOpenChange,
  loadingAvailableFiles,
  allAvailableFiles,
  attachedFiles,
  assigningFile,
  onSelectExistingFile,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Existing File</DialogTitle>
          <DialogDescription>
            Select a file from your library to attach to this agent.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[300px] mt-4 pr-4">
          <div className="space-y-2">
            {loadingAvailableFiles ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : allAvailableFiles.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No files available.</p>
            ) : (
              allAvailableFiles
                .filter(f => !attachedFiles.some(af => af.id === f.id))
                .map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium leading-none">{file.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSelectExistingFile(file.id)}
                      disabled={assigningFile === file.id}
                    >
                      {assigningFile === file.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
