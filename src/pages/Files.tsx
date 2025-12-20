import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FolderOpen, 
  Plus,
  Upload,
  Paperclip,
  Trash2,
  Loader2,
  Info,
  X,
  Edit,
} from "lucide-react";
import { agentFilesApi, AgentFile, agentsApi, Agent, awsS3Api, FileUsageInfo } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Files() {
  const [agentFiles, setAgentFiles] = useState<AgentFile[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<AgentFile | null>(null);
  const [fileUsageInfo, setFileUsageInfo] = useState<FileUsageInfo | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("none");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [assigningFile, setAssigningFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchAllFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await agentFilesApi.listAll();
      if (response.data) {
        setAgentFiles(response.data);
      }
    } catch (err) {
      toast({
        title: 'Error loading files',
        description: err instanceof Error ? err.message : 'Failed to fetch files',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchAgents = useCallback(async () => {
    setLoadingAgents(true);
    try {
      const response = await agentsApi.list();
      if (response.data) {
        setAgents(response.data);
      }
    } catch (err) {
      toast({
        title: 'Error loading agents',
        description: err instanceof Error ? err.message : 'Failed to fetch agents',
        variant: 'destructive',
      });
    } finally {
      setLoadingAgents(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAllFiles();
    fetchAgents();
  }, [fetchAllFiles, fetchAgents]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setPendingFiles(droppedFiles);
      setShowUploadDialog(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setPendingFiles(selectedFiles);
      setShowUploadDialog(true);
    }
  };

  const handleUpload = useCallback(async () => {
    if (pendingFiles.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one file.',
        variant: 'destructive',
      });
      return;
    }

    for (const file of pendingFiles) {
      const fileKey = `${file.name}-${Date.now()}`;
      setUploadingFiles(prev => new Set(prev).add(fileKey));

      try {
        // Get presigned URL
        const presignedResponse = await awsS3Api.getPresignedUrl(
          file.name,
          file.type || 'application/octet-stream',
          fileKey
        );

        if (!presignedResponse.data) {
          throw new Error('Failed to get presigned URL');
        }

        // Upload to S3
        const uploadResponse = await fetch(presignedResponse.data.url, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file to S3');
        }

        // Create file and sync to ElevenLabs (agent_id is optional)
        const agentId = selectedAgentId === "none" ? "" : selectedAgentId;
        const createResponse = await agentFilesApi.createAndSync(agentId, {
          s3_key: presignedResponse.data.key,
          s3_url: presignedResponse.data.public_url,
          file_name: file.name,
          file_size: file.size,
          content_type: file.type || 'application/octet-stream',
        });

        if (createResponse.data) {
          setAgentFiles(prev => [...prev, createResponse.data!]);
          toast({
            title: 'Success',
            description: `File "${file.name}" uploaded and synced successfully.`,
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
        toast({
          title: 'Error',
          description: `Failed to upload "${file.name}": ${errorMessage}`,
          variant: 'destructive',
        });
      } finally {
        setUploadingFiles(prev => {
          const next = new Set(prev);
          next.delete(fileKey);
          return next;
        });
      }
    }

    setShowUploadDialog(false);
    setPendingFiles([]);
    setSelectedAgentId("none");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedAgentId, pendingFiles, toast]);

  const performDelete = useCallback(async (file: AgentFile) => {
    try {
      // Use direct delete endpoint that works with or without agent_id
      if (file.agent_id) {
        await agentFilesApi.delete(file.agent_id.toString(), file.id);
      } else {
        await agentFilesApi.deleteDirect(file.id);
      }
      
      setAgentFiles(prev => prev.filter(f => f.id !== file.id));
      toast({
        title: 'Success',
        description: 'File deleted successfully.',
      });
      setShowDeleteDialog(false);
      setSelectedFile(null);
      setFileUsageInfo(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete file';
      // Check if it's a "file in use" error
      if (errorMessage.includes('file_in_use') || (err as { error?: string }).error === 'file_in_use') {
        const errorData = (err as { data?: { file_name?: string; agents?: Array<{ id: number; name: string }> } }).data;
        if (errorData) {
          setFileUsageInfo({
            file_name: errorData.file_name || file.file_name,
            agents: errorData.agents || []
          });
          setShowDeleteDialog(true);
        }
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
  }, [toast]);

  const handleDeleteClick = useCallback(async (file: AgentFile) => {
    setSelectedFile(file);
    // If file has no agent, proceed with deletion directly
    if (!file.agent_id) {
      await performDelete(file);
      return;
    }
    
    try {
      const response = await agentFilesApi.checkUsage(file.id);
      if (response.data) {
        setFileUsageInfo(response.data);
        // Check if file is used by multiple agents (same s3_key)
        if (response.data.agents.length > 1) {
          setShowDeleteDialog(true);
        } else {
          // File is only used by one agent, proceed with deletion
          await performDelete(file);
        }
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to check file usage',
        variant: 'destructive',
      });
    }
  }, [toast, performDelete]);

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleAssignClick = (file: AgentFile) => {
    setSelectedFile(file);
    setSelectedAgentId(file.agent_id?.toString() || "none");
    setShowAssignDialog(true);
  };

  const handleAssignFile = useCallback(async () => {
    if (!selectedFile) return;

    setAssigningFile(true);
    try {
      const newAgentId = selectedAgentId === "none" ? "" : selectedAgentId;
      
      // If unassigning (newAgentId is empty), delete the current association
      if (!newAgentId) {
        if (selectedFile.agent_id) {
          await agentFilesApi.delete(selectedFile.agent_id.toString(), selectedFile.id);
        } else {
          await agentFilesApi.deleteDirect(selectedFile.id);
        }
        // Refresh the list
        await fetchAllFiles();
        toast({
          title: 'Success',
          description: 'File unassigned successfully.',
        });
      } else {
        // If assigning to a new agent, create a new association using the existing file's s3_key
        // First, delete the old association if it exists
        if (selectedFile.agent_id) {
          try {
            await agentFilesApi.delete(selectedFile.agent_id.toString(), selectedFile.id);
          } catch (err) {
            // If deletion fails, continue anyway - might be a shared file
            console.warn('Failed to delete old association:', err);
          }
        } else {
          try {
            await agentFilesApi.deleteDirect(selectedFile.id);
          } catch (err) {
            console.warn('Failed to delete old association:', err);
          }
        }

        // Create new association with the new agent
        const createResponse = await agentFilesApi.createAndSync(newAgentId, {
          s3_key: selectedFile.s3_key,
          s3_url: selectedFile.s3_url || '',
          file_name: selectedFile.file_name,
          file_size: selectedFile.file_size || 0,
          content_type: selectedFile.content_type || 'application/octet-stream',
        });

        if (createResponse.data) {
          // Refresh the list
          await fetchAllFiles();
          const agentName = agents.find(a => a.id.toString() === newAgentId)?.name || 'Agent';
          toast({
            title: 'Success',
            description: `File assigned to ${agentName} successfully.`,
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign file';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setAssigningFile(false);
      setShowAssignDialog(false);
      setSelectedFile(null);
      setSelectedAgentId("none");
    }
  }, [selectedFile, selectedAgentId, agents, toast, fetchAllFiles]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">Files</h1>
          </div>
          <Button 
            variant="accent" 
            onClick={() => fileInputRef.current?.click()}
            disabled={loadingAgents}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : agentFiles.length > 0 ? (
            <div className="space-y-3">
              {agentFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <Paperclip className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium truncate">{file.file_name}</span>
                      {file.elevenlabs_document_id && (
                        <span className="text-xs px-2 py-0.5 bg-success/10 text-success rounded-full">
                          Synced
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {file.file_size && (
                        <span>{formatFileSize(file.file_size)}</span>
                      )}
                      {file.agent_name ? (
                        <>
                          <span>•</span>
                          <span className="truncate">Used by {file.agent_name}</span>
                        </>
                      ) : (
                        <>
                          <span>•</span>
                          <span className="truncate italic">Unassigned</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAssignClick(file)}
                      className="text-muted-foreground hover:text-accent transition-colors p-2"
                      disabled={uploadingFiles.has(file.file_name) || assigningFile}
                      title="Assign/Unassign agent"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(file)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-2"
                      disabled={uploadingFiles.has(file.file_name) || assigningFile}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              {/* Drag and Drop Area */}
              <div 
                className={`w-full max-w-md border-2 border-dashed rounded-lg p-8 mb-6 transition-colors cursor-pointer ${
                  isDragging 
                    ? "border-accent bg-accent/5" 
                    : "border-border hover:border-muted-foreground"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-lg border-2 border-muted flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    Drag and drop a file here or click to select file locally.
                  </p>
                </div>
              </div>

              <div className="text-center max-w-md">
                <h2 className="text-xl font-semibold mb-2">Files</h2>
                <p className="text-muted-foreground mb-2">No files uploaded yet</p>
                <p className="text-muted-foreground text-sm mb-6">
                  Files allow assistants to search information in your documents.
                </p>
                
                <div className="flex items-center justify-center gap-3">
                  <Button 
                    variant="accent" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loadingAgents}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </div>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileSelect}
            multiple
            accept=".pdf,.txt,.docx,.md"
          />
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>
              Optionally select an agent to associate this file with. If no agent is selected, the file will be saved but not synced to ElevenLabs until associated with an agent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Agent (Optional)</label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No agent (unassigned)</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name || `Agent ${agent.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Files to upload</label>
              <div className="space-y-2">
                {pendingFiles.map((file, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    {file.name} ({formatFileSize(file.size)})
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowUploadDialog(false);
              setPendingFiles([]);
              setSelectedAgentId("none");
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={pendingFiles.length === 0 || uploadingFiles.size > 0}
            >
              {uploadingFiles.size > 0 ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload & Sync'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign/Unassign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign File to Agent</DialogTitle>
            <DialogDescription>
              {selectedFile && `Assign "${selectedFile.file_name}" to an agent or leave unassigned.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Agent</label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No agent (unassigned)</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name || `Agent ${agent.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAssignDialog(false);
              setSelectedFile(null);
              setSelectedAgentId("none");
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignFile} 
              disabled={assigningFile}
            >
              {assigningFile ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-muted-foreground" />
              <DialogTitle>Delete Document</DialogTitle>
            </div>
            <DialogDescription>
              {fileUsageInfo && `Cannot delete '${fileUsageInfo.file_name}'`}
            </DialogDescription>
          </DialogHeader>
          {fileUsageInfo && fileUsageInfo.agents.length > 0 && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    The following agents are using this document. Please update them before proceeding.
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Agent name</label>
                <div className="space-y-2">
                  {fileUsageInfo.agents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-2 bg-card border border-border rounded">
                      <span className="text-sm">{agent.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigate(`/assistants/${agent.id}`);
                          setShowDeleteDialog(false);
                        }}
                      >
                        Open
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDeleteDialog(false);
              setSelectedFile(null);
              setFileUsageInfo(null);
            }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedFile && performDelete(selectedFile)}
              disabled={fileUsageInfo ? fileUsageInfo.agents.length > 0 : false}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
