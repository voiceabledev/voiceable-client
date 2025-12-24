import { useState, useCallback } from "react";
import { agentFilesApi, awsS3Api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { AgentFile } from "@/types/assistant";
import type { AgentFile as ApiAgentFile } from "@/lib/api";

export function useAgentFiles() {
  const [attachedFiles, setAttachedFiles] = useState<AgentFile[]>([]);
  const [agentFiles, setAgentFiles] = useState<AgentFile[]>([]);
  const [allAvailableFiles, setAllAvailableFiles] = useState<AgentFile[]>([]);
  const [showChooseFilesDialog, setShowChooseFilesDialog] = useState(false);
  const [loadingAvailableFiles, setLoadingAvailableFiles] = useState(false);
  const [assigningFile, setAssigningFile] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, agentId?: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    try {
      for (const file of Array.from(files)) {
        // 1. Get presigned URL
        const presignedResponse = await awsS3Api.getPresignedUrl(
          file.name,
          file.type || 'application/octet-stream'
        );

        if (!presignedResponse.data) {
          throw new Error('Failed to get presigned URL');
        }

        // 2. Upload to S3 using direct fetch
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

        // 3. Create AgentFile record and sync to ElevenLabs
        const agentIdForSync = agentId && agentId !== "new" && agentId !== "create" ? agentId : "";
        const fileResponse = await agentFilesApi.createAndSync(agentIdForSync, {
          s3_key: presignedResponse.data.key,
          s3_url: presignedResponse.data.public_url,
          file_name: file.name,
          file_size: file.size,
          content_type: file.type || 'application/octet-stream',
        });

        if (fileResponse.data) {
          // Normalize API response to match AgentFile type
          const normalizedFile: AgentFile = {
            id: fileResponse.data.id.toString(),
            name: fileResponse.data.file_name,
            size: fileResponse.data.file_size || 0,
            type: fileResponse.data.content_type,
            file_name: fileResponse.data.file_name,
            file_size: fileResponse.data.file_size,
            elevenlabs_document_id: fileResponse.data.elevenlabs_document_id,
          };
          // Only add to agentFiles since the file is already created and synced
          // Don't add to attachedFiles to avoid duplication
          setAgentFiles((prev) => {
            // Check if file already exists to avoid duplicates
            if (prev.some(f => f.id === normalizedFile.id)) {
              return prev;
            }
            return [...prev, normalizedFile];
          });
        }
      }

      toast({
        title: "Success",
        description: "Files uploaded successfully.",
      });
    } catch (error) {
      console.error("Failed to upload files:", error);
      toast({
        title: "Error",
        description: "Failed to upload one or more files.",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(false);
    }
  }, [toast]);

  const handleFileDelete = useCallback(async (fileId: string) => {
    try {
      // Remove from both attachedFiles and agentFiles
      setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
      setAgentFiles((prev) => prev.filter((f) => f.id !== fileId));
      toast({
        title: "File removed",
        description: "The file will be detached upon saving.",
      });
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  }, [toast]);

  const fetchAllAvailableFiles = useCallback(async () => {
    setLoadingAvailableFiles(true);
    try {
      const response = await agentFilesApi.listAll();
      // Normalize API response to match AgentFile type
      const normalizedFiles: AgentFile[] = (response.data || []).map((file: ApiAgentFile) => ({
        id: file.id.toString(),
        name: file.file_name,
        size: file.file_size || 0,
        type: file.content_type,
        file_name: file.file_name,
        file_size: file.file_size,
        elevenlabs_document_id: file.elevenlabs_document_id,
      }));
      setAllAvailableFiles(normalizedFiles);
    } catch (error) {
      console.error("Failed to fetch available files:", error);
    } finally {
      setLoadingAvailableFiles(false);
    }
  }, []);

  const handleSelectExistingFile = useCallback(async (fileId: string, agentId: string) => {
    setAssigningFile(fileId);
    try {
      const file = allAvailableFiles.find((f) => f.id === fileId);
      if (file) {
        setAttachedFiles((prev) => [...prev, file]);
        toast({
          title: "File attached",
          description: `${file.name} has been added to the assistant.`,
        });
      }
    } catch (error) {
      console.error("Failed to assign file:", error);
    } finally {
      setAssigningFile(null);
    }
  }, [allAvailableFiles, toast]);

  return {
    attachedFiles,
    setAttachedFiles,
    agentFiles,
    setAgentFiles,
    allAvailableFiles,
    showChooseFilesDialog,
    setShowChooseFilesDialog,
    loadingAvailableFiles,
    assigningFile,
    uploadingFiles,
    handleFileUpload,
    handleFileDelete,
    fetchAllAvailableFiles,
    handleSelectExistingFile,
  };
}
