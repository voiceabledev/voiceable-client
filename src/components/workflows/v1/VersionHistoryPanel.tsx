import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, History, Clock, RotateCcw } from "lucide-react";
import { workflowVersionsApi, type WorkflowVersion } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface VersionHistoryPanelProps {
  agentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVersionRestore?: () => void;
}

export function VersionHistoryPanel({
  agentId,
  open,
  onOpenChange,
  onVersionRestore,
}: VersionHistoryPanelProps) {
  const { toast } = useToast();
  const [versions, setVersions] = useState<WorkflowVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    if (open && agentId) {
      fetchVersions();
    }
  }, [open, agentId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const response = await workflowVersionsApi.list(agentId, 100, 0);
      console.log("[VersionHistoryPanel] API response:", response);
      // The API returns { status: {...}, data: WorkflowVersion[] }
      // So response.data is the array directly
      if (response.data) {
        setVersions(response.data);
        console.log("[VersionHistoryPanel] Set versions:", response.data.length);
      } else {
        console.warn("[VersionHistoryPanel] No data in response:", response);
        setVersions([]);
      }
    } catch (error) {
      console.error("Error fetching workflow versions:", error);
      toast({
        title: "Error",
        description: "Failed to load workflow versions.",
        variant: "destructive",
      });
      setVersions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (versionNumber: number) => {
    setRestoring(versionNumber.toString());
    try {
      const response = await workflowVersionsApi.restore(agentId, versionNumber);
      toast({
        title: "Success",
        description: "Workflow version restored successfully. A new version has been created.",
      });
      
      // Refresh versions list to show the new restored version
      await fetchVersions();
      
      // Notify parent to refresh workflow
      if (onVersionRestore) {
        onVersionRestore();
      }
      
      // Keep dialog open so user can see the new version was created
      // onOpenChange(false);
    } catch (error) {
      console.error("Error restoring workflow version:", error);
      toast({
        title: "Error",
        description: "Failed to restore workflow version.",
        variant: "destructive",
      });
    } finally {
      setRestoring(null);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Workflow Version History
          </DialogTitle>
          <DialogDescription>
            View and restore previous versions of your workflow
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No workflow versions found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="border border-border rounded-lg p-4 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">
                          Version {version.version_number}
                        </span>
                        {version.version_name && (
                          <span className="text-sm text-muted-foreground">
                            - {version.version_name}
                          </span>
                        )}
                        {version.is_auto_save && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded">
                            Auto-save
                          </span>
                        )}
                      </div>
                      {version.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {version.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(version.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRestore(version.version_number)}
                      disabled={restoring === version.version_number.toString()}
                      size="sm"
                      variant="outline"
                    >
                      {restoring === version.version_number.toString() ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Restoring...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restore
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}

