import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import type { IntegrationSchema, IntegrationConfig } from "@/types/integrations";
import { integrationsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface IntegrationFormProps {
  schema: IntegrationSchema;
  initialConfig?: IntegrationConfig;
  onSubmit: (config: IntegrationConfig) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  hasSavedValues?: boolean;
  submitButtonText?: string;
  hideSubmitButton?: boolean;
  integrationType?: string;
}

export function IntegrationForm({
  schema,
  initialConfig = {},
  onSubmit,
  onCancel,
  isLoading = false,
  hasSavedValues = false,
  submitButtonText,
  hideSubmitButton = false,
  integrationType,
}: IntegrationFormProps) {
  const [config, setConfig] = useState<IntegrationConfig>(initialConfig);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [oauthLoading, setOAuthLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const togglePasswordVisibility = (fieldName: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const handleFieldChange = (fieldName: string, value: string | number) => {
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
    const newErrors: Record<string, string> = {};

    // Check required fields
    schema.required.forEach((fieldName) => {
      const value = config[fieldName];
      
      if (!value || String(value).trim() === '') {
        newErrors[fieldName] = 'This field is required';
      }
    });

    // Validate field types
    Object.entries(schema.fields).forEach(([fieldName, fieldConfig]) => {
      const value = config[fieldName];
      if (!value) return;

      switch (fieldConfig.type) {
      case 'url':
        try {
          new URL(String(value));
        } catch {
          newErrors[fieldName] = 'Please enter a valid URL';
        }
        break;
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          newErrors[fieldName] = 'Please enter a valid email address';
        }
        break;
      }
      case 'number': {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          newErrors[fieldName] = 'Please enter a valid number';
        } else {
          if (fieldConfig.min !== undefined && numValue < fieldConfig.min) {
            newErrors[fieldName] = `Value must be at least ${fieldConfig.min}`;
          }
          if (fieldConfig.max !== undefined && numValue > fieldConfig.max) {
            newErrors[fieldName] = `Value must be at most ${fieldConfig.max}`;
          }
        }
        break;
      }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validate()) {
      return;
    }

    try {
      await onSubmit(config);
    } catch (error) {
      console.error('Error submitting integration:', error);
    }
  };

  const renderField = (fieldName: string, fieldConfig: IntegrationSchema['fields'][string]) => {
    const value = config[fieldName] || '';
    const error = errors[fieldName];
    const isRequired = schema.required.includes(fieldName);

    switch (fieldConfig.type) {
      case 'password': {
        const isVisible = visiblePasswords[fieldName] || false;
        const stringValue = String(value || '');
        
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName} className="text-xs md:text-sm">
              {fieldConfig.label}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="relative">
            <Input
              id={fieldName}
              type={isVisible ? 'text' : 'password'}
              placeholder={fieldConfig.placeholder || 'Enter your API key'}
              value={stringValue}
              onChange={(e) => {
                handleFieldChange(fieldName, e.target.value);
              }}
              onKeyDown={(e) => {
                // Prevent form submission on Enter unless it's the submit button
                if (e.key === 'Enter' && !hideSubmitButton) {
                  // Allow Enter to submit the form normally
                  return;
                }
                if (e.key === 'Enter' && hideSubmitButton) {
                  e.preventDefault();
                }
              }}
              className={`bg-secondary/50 border-border h-9 md:h-10 text-xs md:text-sm pr-10 ${
                error ? 'border-destructive' : ''
              }`}
              disabled={isLoading}
            />
              {stringValue && (
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility(fieldName)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-secondary/50"
                  tabIndex={-1}
                  aria-label={isVisible ? 'Hide password' : 'Show password'}
                >
                  {isVisible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
            {fieldConfig.description && (
              <p className="text-xs text-muted-foreground">{fieldConfig.description}</p>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );
      }

      case 'select': {
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName} className="text-xs md:text-sm">
              {fieldConfig.label}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={String(value)}
              onValueChange={(val) => handleFieldChange(fieldName, val)}
              disabled={isLoading}
            >
              <SelectTrigger
                className={`bg-secondary/50 border-border h-9 md:h-10 text-xs md:text-sm ${
                  error ? 'border-destructive' : ''
                }`}
              >
                <SelectValue placeholder={fieldConfig.placeholder || 'Select an option'} />
              </SelectTrigger>
              <SelectContent>
                {fieldConfig.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldConfig.description && (
              <p className="text-xs text-muted-foreground">{fieldConfig.description}</p>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );
      }

      case 'url':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName} className="text-xs md:text-sm">
              {fieldConfig.label}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={fieldName}
              type="url"
              placeholder={fieldConfig.placeholder}
              value={String(value)}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              onKeyDown={(e) => {
                // Prevent form submission on Enter if submit button is hidden
                if (e.key === 'Enter' && hideSubmitButton) {
                  e.preventDefault();
                }
              }}
              className={`bg-secondary/50 border-border h-9 md:h-10 text-xs md:text-sm ${
                error ? 'border-destructive' : ''
              }`}
              disabled={isLoading}
            />
            {fieldConfig.description && (
              <p className="text-xs text-muted-foreground">{fieldConfig.description}</p>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );

      case 'number': {
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName} className="text-xs md:text-sm">
              {fieldConfig.label}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={fieldName}
              type="number"
              placeholder={fieldConfig.placeholder}
              value={value ? Number(value) : ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value ? Number(e.target.value) : '')}
              onKeyDown={(e) => {
                // Prevent form submission on Enter if submit button is hidden
                if (e.key === 'Enter' && hideSubmitButton) {
                  e.preventDefault();
                }
              }}
              min={fieldConfig.min}
              max={fieldConfig.max}
              className={`bg-secondary/50 border-border h-9 md:h-10 text-xs md:text-sm ${
                error ? 'border-destructive' : ''
              }`}
              disabled={isLoading}
            />
            {fieldConfig.description && (
              <p className="text-xs text-muted-foreground">{fieldConfig.description}</p>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );
      }

      default:
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName} className="text-xs md:text-sm">
              {fieldConfig.label}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={fieldName}
              type={fieldConfig.type === 'email' ? 'email' : 'text'}
              placeholder={fieldConfig.placeholder}
              value={String(value)}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              onKeyDown={(e) => {
                // Prevent form submission on Enter if submit button is hidden
                if (e.key === 'Enter' && hideSubmitButton) {
                  e.preventDefault();
                }
              }}
              className={`bg-secondary/50 border-border h-9 md:h-10 text-xs md:text-sm ${
                error ? 'border-destructive' : ''
              }`}
              disabled={isLoading}
            />
            {fieldConfig.description && (
              <p className="text-xs text-muted-foreground">{fieldConfig.description}</p>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );
    }
  };

  // Handle OAuth connection for Google Calendar
  const handleOAuthConnect = async () => {
    if (integrationType === 'google_calendar') {
      setOAuthLoading(true);
      try {
        // Make authenticated API call to get OAuth URL
        const response = await integrationsApi.getOAuthUrl('google_calendar');
        if (response.data?.authorization_url) {
          // Redirect to Google OAuth consent screen
          window.location.href = response.data.authorization_url;
        } else {
          toast({
            title: "Error",
            description: "Failed to get OAuth authorization URL.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('OAuth error:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to initiate OAuth flow.",
          variant: "destructive",
        });
      } finally {
        setOAuthLoading(false);
      }
    }
  };

  // Check if this is an OAuth integration
  const isOAuthIntegration = schema.auth_type === 'oauth' || integrationType === 'google_calendar';
  const hasOAuthToken = initialConfig?.api_key || initialConfig?.access_token;

  // Render fields in order: required first, then optional
  const orderedFields = [
    ...schema.required.map((name) => [name, schema.fields[name]] as const),
    ...schema.optional.map((name) => [name, schema.fields[name]] as const),
  ];

  // For OAuth integrations, show OAuth button instead of API key field
  const shouldShowOAuthButton = isOAuthIntegration && !hasOAuthToken && integrationType === 'google_calendar';

  return (
    <form 
      onSubmit={handleSubmit} 
      onKeyDown={(e) => {
        // Prevent form submission on Enter if submit button is hidden
        if (e.key === 'Enter' && hideSubmitButton) {
          e.preventDefault();
        }
      }}
      className="space-y-3 md:space-y-4"
    >
      {shouldShowOAuthButton ? (
        <div className="space-y-2">
          <Label className="text-xs md:text-sm">Connect with Google</Label>
          <Button
            type="button"
            variant="default"
            onClick={handleOAuthConnect}
            disabled={isLoading || oauthLoading}
            className="w-full text-xs md:text-sm"
          >
            {oauthLoading ? "Connecting..." : "Connect with Google Calendar"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Click to authorize access to your Google Calendar. You'll be redirected to Google to sign in.
          </p>
        </div>
      ) : (
        orderedFields.map(([fieldName, fieldConfig]) => {
          // For OAuth integrations with existing token, show read-only fields
          if (isOAuthIntegration && (fieldName === 'api_key' || fieldName === 'access_token' || fieldName === 'refresh_token')) {
            return (
              <div key={fieldName} className="space-y-2">
                <Label htmlFor={fieldName} className="text-xs md:text-sm">
                  {fieldConfig.label}
                </Label>
                <Input
                  id={fieldName}
                  type="password"
                  value="••••••••••••••••"
                  readOnly
                  disabled
                  className="bg-secondary/50 border-border h-9 md:h-10 text-xs md:text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  OAuth token (auto-populated). Reconnect to refresh.
                </p>
              </div>
            );
          }
          return renderField(fieldName, fieldConfig);
        })
      )}

      {!hideSubmitButton && (
        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            variant="default"
            disabled={isLoading}
            className="w-full sm:w-auto min-w-[120px] text-xs md:text-sm"
          >
            {isLoading ? (hasSavedValues ? 'Saving...' : 'Connecting...') : (submitButtonText || (hasSavedValues ? 'Save' : 'Connect'))}
          </Button>
        </div>
      )}
    </form>
  );
}
