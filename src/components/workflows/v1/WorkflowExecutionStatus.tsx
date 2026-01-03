import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertCircle, Play, Square } from "lucide-react";
import { workflowExecutionsApi, type WorkflowExecution, type WorkflowExecutionLog } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface WorkflowExecutionStatusProps {
  conversationId: string | number;
  refreshInterval?: number; // Polling interval in milliseconds
}

export function WorkflowExecutionStatus({
  conversationId,
  refreshInterval = 5000, // Default 5 seconds
}: WorkflowExecutionStatusProps) {
  const { toast } = useToast();
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [logs, setLogs] = useState<WorkflowExecutionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [stopping, setStopping] = useState(false);

  useEffect(() => {
    if (conversationId) {
      fetchStatus();
      fetchLogs();

      // Set up polling for active executions
      const interval = setInterval(() => {
        if (execution && (execution.execution_state === 'pending' || execution.execution_state === 'running')) {
          fetchStatus();
          fetchLogs();
        }
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [conversationId, execution?.execution_state, refreshInterval]);

  const fetchStatus = async () => {
    try {
      const response = await workflowExecutionsApi.status(conversationId);
      if (response.data?.data) {
        setExecution(response.data.data);
      }
    } catch (error: any) {
      // Ignore 404 errors (no execution yet)
      if (error?.response?.status !== 404) {
        console.error("Error fetching workflow execution status:", error);
      }
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await workflowExecutionsApi.logs(conversationId);
      if (response.data?.data) {
        setLogs(response.data.data);
      }
    } catch (error: any) {
      // Ignore 404 errors (no execution yet)
      if (error?.response?.status !== 404) {
        console.error("Error fetching workflow execution logs:", error);
      }
    }
  };

  const handleStop = async () => {
    setStopping(true);
    try {
      await workflowExecutionsApi.stop(conversationId);
      toast({
        title: "Success",
        description: "Workflow execution stopped.",
      });
      await fetchStatus();
    } catch (error) {
      console.error("Error stopping workflow execution:", error);
      toast({
        title: "Error",
        description: "Failed to stop workflow execution.",
        variant: "destructive",
      });
    } finally {
      setStopping(false);
    }
  };

  if (!execution) {
    return null; // Don't show anything if no execution exists
  }

  const getStateIcon = () => {
    switch (execution.execution_state) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'stopped':
        return <Square className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStateBadgeVariant = () => {
    switch (execution.execution_state) {
      case 'pending':
        return 'secondary';
      case 'running':
        return 'default';
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'stopped':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStateIcon()}
            <CardTitle className="text-sm">Workflow Execution</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStateBadgeVariant()}>
              {execution.execution_state}
            </Badge>
            {execution.execution_state === 'running' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStop}
                disabled={stopping}
              >
                {stopping ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Stopping...
                  </>
                ) : (
                  <>
                    <Square className="h-3 w-3 mr-2" />
                    Stop
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          {execution.current_node_id && (
            <span>Current node: {execution.current_node_id}</span>
          )}
          {execution.started_at && (
            <span className="ml-2">
              Started: {format(new Date(execution.started_at), "MMM d, yyyy 'at' h:mm a")}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {execution.error_message && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive font-medium">Error:</p>
            <p className="text-sm text-destructive/80">{execution.error_message}</p>
          </div>
        )}

        {logs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Execution Logs</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-2 p-2 text-xs bg-secondary/50 rounded"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {log.status === 'succeeded' && (
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    )}
                    {log.status === 'failed' && (
                      <XCircle className="h-3 w-3 text-red-600" />
                    )}
                    {log.status === 'running' && (
                      <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                    )}
                    {log.status === 'pending' && (
                      <AlertCircle className="h-3 w-3 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.node_type}</span>
                      <Badge variant="outline" className="text-xs">
                        {log.status}
                      </Badge>
                    </div>
                    {log.error_message && (
                      <p className="text-destructive text-xs mt-1">{log.error_message}</p>
                    )}
                    <p className="text-muted-foreground text-xs mt-1">
                      {format(new Date(log.executed_at), "h:mm:ss a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

