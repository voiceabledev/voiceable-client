import React, { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Loader2, Upload, FileText } from "lucide-react";
import { workflowsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAgentFiles } from "@/hooks/assistants/useAgentFiles";

type AgentFile = {
  id: string;
  file_name: string;
  file_size: number;
  content_type?: string;
  elevenlabs_document_id?: string;
  synced: boolean;
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
                className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                onClick={() => handleToggleFile(file.id)}
              >
                <Checkbox
                  checked={selectedFileIds.includes(file.id)}
                  onCheckedChange={() => handleToggleFile(file.id)}
                />
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.file_size)}
                    {file.synced && (
                      <span className="ml-2 text-green-600">✓ Synced</span>
                    )}
                  </p>
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

      {/* Upload Button */}
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
          className="w-full"
          disabled={filesHook.uploadingFiles}
        >
          {filesHook.uploadingFiles ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload New Files
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Supported formats: PDF, TXT, DOCX, MD
        </p>
      </div>
    </div>
  );
};
