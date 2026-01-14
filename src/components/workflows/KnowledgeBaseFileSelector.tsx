import React, { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Loader2, Upload, FileText, Sparkles, Trash2, Pencil, Download } from "lucide-react";
import { workflowsApi, agentFilesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAgentFiles } from "@/hooks/assistants/useAgentFiles";
import { GenerateKnowledgeBaseModal } from "./GenerateKnowledgeBaseModal";

type AgentFile = {
  id: string;
  file_name: string;
  file_size: number;
  content_type?: string;
  elevenlabs_document_id?: string;
  synced: boolean;
  s3_url?: string;
};

type KnowledgeBaseFileSelectorProps = {
  agentId: string;
  selectedFileIds: string[];
  onSelectionChange: (fileIds: string[]) => void;
};

export const KnowledgeBaseFileSelector: React.FC<KnowledgeBaseFileSelectorProps> = ({
  agentId,
  selectedFileIds,
  onSelectionChange,
}) => {
  const [files, setFiles] = useState<AgentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [deleteFile, setDeleteFile] = useState<AgentFile | null>(null);
  const [renameFile, setRenameFile] = useState<AgentFile | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const filesHook = useAgentFiles();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
  }, [agentId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await workflowsApi.getAgentFiles(agentId);
      if (response.data?.files) {
        setFiles(response.data.files);
      }
    } catch (error) {
      console.error("Failed to load agent files:", error);
      toast({
        title: "Error",
        description: "Failed to load knowledge base files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFile = (fileId: string) => {
    const newSelection = selectedFileIds.includes(fileId)
      ? selectedFileIds.filter(id => id !== fileId)
      : [...selectedFileIds, fileId];
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedFileIds.length === files.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(files.map(f => f.id));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles?.length) return;

    try {
      await filesHook.handleFileUpload(e, agentId);
      await loadFiles(); // Reload files after upload

      // Reset file input to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: "Success",
        description: `${selectedFiles.length} file(s) uploaded successfully`,
      });
    } catch (error) {
      console.error("File upload failed:", error);

      // Reset file input even on error
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    }
  };

  const handleSaveGeneratedFile = async (file: File) => {
    try {
      // Create a synthetic file input event to reuse existing upload logic
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const syntheticEvent = {
        target: {
          files: dataTransfer.files,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      await filesHook.handleFileUpload(syntheticEvent, agentId);
      await loadFiles(); // Reload files after upload
    } catch (error) {
      console.error("Failed to save generated file:", error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDelete = async (file: AgentFile) => {
    setIsDeleting(true);
    try {
      await agentFilesApi.delete(agentId, parseInt(file.id));
      await loadFiles();
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
      setDeleteFile(null);
    } catch (error: any) {
      console.error("Failed to delete file:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.status?.message || "Failed to delete file",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRename = async () => {
    if (!renameFile || !renameValue.trim()) return;

    setIsRenaming(true);
    try {
      await agentFilesApi.update(agentId, parseInt(renameFile.id), renameValue.trim());
      await loadFiles();
      toast({
        title: "Success",
        description: "File renamed successfully",
      });
      setRenameFile(null);
      setRenameValue("");
    } catch (error: any) {
      console.error("Failed to rename file:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.status?.message || "Failed to rename file",
        variant: "destructive",
      });
    } finally {
      setIsRenaming(false);
    }
  };

  const openRenameDialog = (file: AgentFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenameFile(file);
    setRenameValue(file.file_name);
  };

  const handleDownload = (file: AgentFile) => {
    if (!file.s3_url) {
      toast({
        title: "Error",
        description: "File URL not available",
        variant: "destructive",
      });
      return;
    }

    // Open file in a new tab
    window.open(file.s3_url, '_blank');
  };

  const openDeleteDialog = (file: AgentFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteFile(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* File List */}
      {files.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedFileIds.length === files.length ? "Deselect All" : "Select All"}
            </Button>
            <span className="text-xs text-muted-foreground">
              {selectedFileIds.length} of {files.length} selected
            </span>
          </div>

          <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 hover:bg-muted/50 group"
              >
                <Checkbox
                  checked={selectedFileIds.includes(file.id)}
                  onCheckedChange={() => handleToggleFile(file.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleToggleFile(file.id)}
                >
                  <p className="text-sm font-medium truncate">{file.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.file_size)}
                    {file.synced && (
                      <span className="ml-2 text-green-600">✓ Synced</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => handleDownload(file)}
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => openRenameDialog(file, e)}
                    title="Rename"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => openDeleteDialog(file, e)}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-6 text-muted-foreground text-sm">
          No files uploaded yet
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 border-t">
        <div className="grid grid-cols-2 gap-3">
          {/* AI Generation Button - Primary Action */}
          <Button
            type="button"
            variant="accent"
            onClick={() => setShowGenerateModal(true)}
            className="h-11 font-semibold"
            disabled={filesHook.uploadingFiles}
          >
            <Sparkles className="w-4 h-4" />
            Create Knowledge Base with AI
          </Button>

          {/* File Upload Button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.docx,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-11 border-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
              disabled={filesHook.uploadingFiles}
            >
              {filesHook.uploadingFiles ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Files
                </>
              )}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Supported: PDF, TXT, DOCX, MD
        </p>
      </div>

      {/* Generate Knowledge Base Modal */}
      <GenerateKnowledgeBaseModal
        open={showGenerateModal}
        onOpenChange={setShowGenerateModal}
        agentId={agentId}
        onSave={handleSaveGeneratedFile}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteFile} onOpenChange={(open) => !open && setDeleteFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteFile?.file_name}"? This will also remove it and this action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteFile && handleDelete(deleteFile)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <Dialog open={!!renameFile} onOpenChange={(open) => !open && setRenameFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
            <DialogDescription>
              Enter a new name for "{renameFile?.file_name}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="File name"
              disabled={isRenaming}
              onKeyDown={(e) => {
                if (e.key === "Enter" && renameValue.trim()) {
                  handleRename();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRenameFile(null);
                setRenameValue("");
              }}
              disabled={isRenaming}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={!renameValue.trim() || isRenaming}
            >
              {isRenaming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Renaming...
                </>
              ) : (
                "Rename"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
