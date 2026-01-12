import React from "react";
import { CheckCircle2, XCircle, Loader2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface WorkflowExecution {
  workflowId: number;
  workflowName: string;
  matchedPhrase: string;
  status: "triggered" | "executing" | "success" | "error";
  error?: string;
}

interface WorkflowExecutionStatusProps {
  executions: WorkflowExecution[];
}

export const WorkflowExecutionStatus: React.FC<WorkflowExecutionStatusProps> = ({
  executions,
}) => {
  if (executions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-medium">Workflows Triggered</h4>
      </div>
      <div className="space-y-2">
        {executions.map((execution) => (
          <div
            key={execution.workflowId}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border",
              execution.status === "success" && "border-green-200 bg-green-50/50",
              execution.status === "error" && "border-red-200 bg-red-50/50",
              execution.status === "triggered" && "border-blue-200 bg-blue-50/50",
              execution.status === "executing" && "border-amber-200 bg-amber-50/50"
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {execution.status === "success" && (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
              {execution.status === "error" && (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              {execution.status === "executing" && (
                <Loader2 className="h-4 w-4 text-amber-600 animate-spin" />
              )}
              {execution.status === "triggered" && (
                <Zap className="h-4 w-4 text-blue-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{execution.workflowName}</span>
                <Badge
                  variant={
                    execution.status === "success"
                      ? "default"
                      : execution.status === "error"
                      ? "destructive"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {execution.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Triggered by: &quot;{execution.matchedPhrase}&quot;
              </p>
              {execution.error && (
                <p className="text-xs text-red-600 mt-1">{execution.error}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
