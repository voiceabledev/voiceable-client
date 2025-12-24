import React from "react";
import { ChevronDown, Paperclip, Trash2, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentFile } from "@/types/assistant";

type FilesSectionProps = {
  expanded: boolean;
  onToggleExpanded: () => void;
  isNew: boolean;
  attachedFiles: AgentFile[];
  setAttachedFiles: React.Dispatch<React.SetStateAction<AgentFile[]>>;
  agentFiles: AgentFile[];
  uploadingFiles: Set<string>;
  handleFileDelete: (fileId: string) => Promise<void>;
  handleFileUpload: (files: File[]) => Promise<void>;
  fileInputRef: React.RefObject<HTMLInputElement>;
};

export const FilesSection: React.FC<FilesSectionProps> = ({
  expanded,
  onToggleExpanded,
  isNew,
  attachedFiles,
  setAttachedFiles,
  agentFiles,
  uploadingFiles,
  handleFileDelete,
  handleFileUpload,
  fileInputRef,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <button className="w-full flex items-start justify-between gap-2" onClick={onToggleExpanded}>
        <div className="text-left flex-1">
          <h3 className="text-base md:text-lg font-semibold">Files</h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Attach files (guides, policies, scripts, templates, etc.) to the assistant to help it answer questions and
            provide information.
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
        <div className="mt-4 md:mt-6 space-y-3">
          {/* Show saved agent files for existing agents */}
          {!isNew && agentFiles.length > 0 && (
            <div className="space-y-2">
              {agentFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md border border-border"
                >
                  <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm flex-1 truncate">{file.file_name || file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(file.file_size || file.size) ? `${((file.file_size || file.size) / 1024).toFixed(1)} KB` : ""}
                  </span>
                  {file.elevenlabs_document_id && <span className="text-xs text-success">Synced</span>}
                  <button
                    onClick={() => handleFileDelete(file.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    disabled={uploadingFiles.has(file.file_name || file.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Show attached files (pending uploads for new agents, or newly added files for existing agents) */}
          {/* Filter out files that are already in agentFiles to avoid duplicates */}
          {attachedFiles.filter(file => !agentFiles.some(af => af.id === file.id)).length > 0 && (
            <div className="space-y-2">
              {attachedFiles
                .filter(file => !agentFiles.some(af => af.id === file.id))
                .map((file) => (
                  <div
                    key={file.id || `pending-${file.name}`}
                    className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md border border-border"
                  >
                    <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm flex-1 truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ""}
                    </span>
                    <span className="text-xs text-muted-foreground italic">Pending</span>
                    <button
                      onClick={() => handleFileDelete(file.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
            </div>
          )}
          {uploadingFiles.size > 0 && (
            <div className="space-y-2">
              {Array.from(uploadingFiles).map((fileKey) => (
                <div
                  key={fileKey}
                  className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md border border-border opacity-50"
                >
                  <Loader2 className="h-4 w-4 text-muted-foreground animate-spin flex-shrink-0" />
                  <span className="text-sm flex-1 truncate">{fileKey.split("-").slice(0, -1).join("-")}</span>
                  <span className="text-xs text-muted-foreground">Uploading...</span>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-2">
            <div
              className="border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer hover:border-muted-foreground/50 border-border"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center text-center">
                <Upload className="h-5 w-5 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload or drag and drop files</p>
                <p className="text-xs text-muted-foreground mt-1">Supported formats: PDF, TXT, DOCX, MD</p>
              </div>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept=".pdf,.txt,.docx,.md"
            onChange={(e) => {
              if (e.target.files) {
                const newFiles = Array.from(e.target.files);
                handleFileUpload(newFiles);
                // Reset input
                e.target.value = "";
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

