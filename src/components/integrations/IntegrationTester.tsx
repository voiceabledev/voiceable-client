import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { integrationsApi } from "@/lib/api";
import type { IntegrationConfig } from "@/types/integrations";
import { cn } from "@/lib/utils";

interface IntegrationTesterProps {
  integrationType: string;
  integrationName: string;
  config: IntegrationConfig;
  onTestComplete?: (success: boolean) => void;
}

type TestStatus = "idle" | "testing" | "success" | "error";

export const IntegrationTester: React.FC<IntegrationTesterProps> = ({
  integrationType,
  integrationName,
  config,
  onTestComplete,
}) => {
  const { toast } = useToast();
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleTest = async () => {
    setTestStatus("testing");
    setErrorMessage("");

    try {
      const response = await integrationsApi.testConnection(integrationType, config);

      if (response.data?.success) {
        setTestStatus("success");
        toast({
          title: "Connection successful",
          description: `${integrationName} connection is working correctly.`,
        });
        onTestComplete?.(true);
      } else {
        setTestStatus("error");
        const message = response.data?.message || "Connection test failed";
        setErrorMessage(message);
        toast({
          title: "Connection failed",
          description: message,
          variant: "destructive",
        });
        onTestComplete?.(false);
      }
    } catch (error) {
      setTestStatus("error");
      const message = error instanceof Error ? error.message : "Failed to test connection";
      setErrorMessage(message);
      toast({
        title: "Connection test failed",
        description: message,
        variant: "destructive",
      });
      onTestComplete?.(false);
    }
  };

  const getStatusIcon = () => {
    switch (testStatus) {
      case "testing":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (testStatus) {
      case "testing":
        return "Testing connection...";
      case "success":
        return "Connection successful";
      case "error":
        return "Connection failed";
      default:
        return "Test Connection";
    }
  };

  // Check if config has required fields filled
  const hasRequiredFields = Object.values(config).some(
    (value) => value && String(value).trim() !== ""
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Test Connection</h4>
          <p className="text-xs text-muted-foreground">
            Validate your credentials before saving
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleTest}
          disabled={testStatus === "testing" || !hasRequiredFields}
          className={cn(
            "min-w-[120px]",
            testStatus === "success" && "border-green-200 bg-green-50",
            testStatus === "error" && "border-red-200 bg-red-50"
          )}
        >
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </div>
        </Button>
      </div>

      {testStatus === "error" && errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-red-900 mb-1">Error Details</p>
              <p className="text-xs text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {testStatus === "success" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-green-900">
                Your {integrationName} credentials are valid and working correctly.
              </p>
            </div>
          </div>
        </div>
      )}

      {!hasRequiredFields && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              Please enter your credentials before testing the connection.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
