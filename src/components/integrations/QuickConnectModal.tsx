import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { IntegrationSchema, IntegrationConfig } from "@/types/integrations";
import { integrationsApi } from "@/lib/api";

interface QuickConnectModalProps {
  open: boolean;
  onClose: () => void;
  integrationType: string;
  integrationName: string;
  schema: IntegrationSchema | null;
  onSuccess: (config: IntegrationConfig) => void;
}

// Help text for finding API keys
const API_KEY_HELP: Record<string, { text: string; url?: string }> = {
  pipedrive: {
    text: "Settings → Personal Preferences → API",
    url: "https://support.pipedrive.com/en/article/finding-your-api-token",
  },
  hubspot: {
    text: "Settings → Integrations → Private Apps → Create a private app",
    url: "https://developers.hubspot.com/docs/api/working-with-oauth",
  },
  calcom: {
    text: "Settings → Developers → API Keys → Create API Key",
    url: "https://cal.com/docs/enterprise/features/api-keys",
  },
  calendly: {
    text: "Settings → Integrations → API → Personal Access Token",
    url: "https://help.calendly.com/hc/en-us/articles/223147027-Getting-started-with-the-Calendly-API",
  },
};

export const QuickConnectModal: React.FC<QuickConnectModalProps> = ({
  open,
  onClose,
  integrationType,
  integrationName,
  schema,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<IntegrationConfig>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize config based on schema
  React.useEffect(() => {
    if (schema && open) {
      const initialConfig: IntegrationConfig = {};
      Object.keys(schema.fields).forEach((key) => {
        initialConfig[key] = "";
      });
      setConfig(initialConfig);
      setErrors({});
    }
  }, [schema, open]);

  const handleFieldChange = (fieldName: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    if (!schema) return false;

    const newErrors: Record<string, string> = {};

    // Check required fields
    schema.required.forEach((fieldName) => {
      const value = config[fieldName];
      if (!value || String(value).trim() === "") {
        const fieldConfig = schema.fields[fieldName];
        newErrors[fieldName] = `${fieldConfig?.label || fieldName} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConnect = async () => {
    if (!schema || !validate()) {
      return;
    }

    setIsConnecting(true);
    try {
      // Check if integration already exists
      let response;
      try {
        await integrationsApi.get(integrationType);
        // Exists, update it
        response = await integrationsApi.update(integrationType, config);
      } catch {
        // Doesn't exist, create it
        response = await integrationsApi.create(integrationType, config);
      }

      toast({
        title: "Connected successfully",
        description: `${integrationName} has been connected.`,
      });

      onSuccess(config);
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to connect integration";
      toast({
        title: "Connection failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const helpText = API_KEY_HELP[integrationType];
  const firstRequiredField = schema?.required?.[0];
  const firstFieldConfig = firstRequiredField ? schema.fields[firstRequiredField] : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Connect {integrationName}</span>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {schema && firstFieldConfig && (
            <div className="space-y-2">
              <Label htmlFor={firstRequiredField}>
                {firstFieldConfig.label}
                {schema.required.includes(firstRequiredField) && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              <Input
                id={firstRequiredField}
                type={firstFieldConfig.type === "password" ? "password" : "text"}
                placeholder={firstFieldConfig.placeholder || `Enter your ${firstFieldConfig.label}`}
                value={String(config[firstRequiredField] || "")}
                onChange={(e) => handleFieldChange(firstRequiredField, e.target.value)}
                className={errors[firstRequiredField] ? "border-destructive" : ""}
                disabled={isConnecting}
                autoFocus
              />
              {firstFieldConfig.description && (
                <p className="text-xs text-muted-foreground">{firstFieldConfig.description}</p>
              )}
              {errors[firstRequiredField] && (
                <p className="text-xs text-destructive">{errors[firstRequiredField]}</p>
              )}
            </div>
          )}

          {helpText && (
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <p className="text-xs font-medium mb-1">Where to find your API key:</p>
              <p className="text-xs text-muted-foreground mb-2">{helpText.text}</p>
              {helpText.url && (
                <a
                  href={helpText.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  Learn more <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isConnecting}>
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
