import { useState, useEffect, useMemo, useImperativeHandle, forwardRef, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IntegrationSchema, IntegrationConfig } from "@/types/integrations";
import { integrationsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface IntegrationFormProps {
  schema: IntegrationSchema;
  initialConfig?: IntegrationConfig;
  onSubmit: (config: IntegrationConfig) => Promise<void>;
  onCancel?: () => void;
  onDisconnect?: () => Promise<void>;
  isLoading?: boolean;
  hasSavedValues?: boolean;
  submitButtonText?: string;
  hideSubmitButton?: boolean;
  integrationType?: string;
  onValidationChange?: (isValid: boolean) => void; // Callback to notify parent when form validity changes
}

export interface IntegrationFormRef {
  submit: () => Promise<void>;
}

export const IntegrationForm = forwardRef<IntegrationFormRef, IntegrationFormProps>(({
  schema,
  initialConfig = {},
  onSubmit,
  onCancel,
  onDisconnect,
  isLoading = false,
  hasSavedValues = false,
  submitButtonText,
  hideSubmitButton = false,
  integrationType,
  onValidationChange,
}, ref) => {
  const [config, setConfig] = useState<IntegrationConfig>(() => {
    // Initialize config only once on mount
    const maskedConfig: IntegrationConfig = { ...initialConfig };
    const originals: Record<string, string> = {};
    
    // First, copy all non-password fields as-is
    Object.entries(initialConfig).forEach(([key, value]) => {
      const fieldConfig = schema.fields[key];
      if (fieldConfig?.type !== 'password') {
        maskedConfig[key] = value;
      }
    });
    
    // Then handle password fields
    Object.entries(initialConfig).forEach(([key, value]) => {
      const fieldConfig = schema.fields[key];
      if (fieldConfig?.type === 'password') {
        const stringValue = value ? String(value).trim() : '';
        
        if (stringValue !== '') {
          // Check if the value is already masked (contains asterisks)
          const isAlreadyMasked = stringValue.includes('*');
          
          if (isAlreadyMasked) {
            // Value is already masked from API - we don't have the original
            // Store the masked value as-is, but don't store an "original"
            // This means we can't show/hide it, but we can still allow updating
            maskedConfig[key] = stringValue;
            // Don't store in originals - we don't have the actual value
          } else {
            // Value is the actual API key - mask it for display
            // Store original value
            originals[key] = stringValue;
            // Mask the value (show first 4 and last 4 chars if length > 8, otherwise all asterisks)
            const masked = stringValue.length > 8 
              ? stringValue.substring(0, 4) + '*'.repeat(stringValue.length - 8) + stringValue.substring(stringValue.length - 4)
              : '*'.repeat(stringValue.length);
            maskedConfig[key] = masked;
          }
        } else {
          // Empty value - keep it empty
          maskedConfig[key] = '';
        }
      }
    });
    
    return maskedConfig;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [originalValues, setOriginalValues] = useState<Record<string, string>>(() => {
    // Initialize originalValues only once on mount
    const originals: Record<string, string> = {};
    Object.entries(initialConfig).forEach(([key, value]) => {
      const fieldConfig = schema.fields[key];
      if (fieldConfig?.type === 'password') {
        const stringValue = value ? String(value).trim() : '';
        if (stringValue !== '' && !stringValue.includes('*')) {
          originals[key] = stringValue;
        }
      }
    });
    return originals;
  });
  const [oauthLoading, setOAuthLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const { toast } = useToast();
  const onValidationChangeRef = useRef(onValidationChange);
  const prevIntegrationTypeRef = useRef(integrationType);
  const hasInitializedRef = useRef(false);
  
  // Keep ref in sync with prop
  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
  }, [onValidationChange]);

  // Only reset config when integration type changes (new integration selected)
  useEffect(() => {
    // If integration type changed, reset the form
    if (prevIntegrationTypeRef.current !== integrationType) {
      prevIntegrationTypeRef.current = integrationType;
      hasInitializedRef.current = false;
      
      // Store original values and mask password fields
      const maskedConfig: IntegrationConfig = { ...initialConfig };
      const originals: Record<string, string> = {};
      
      // First, copy all non-password fields as-is
      Object.entries(initialConfig).forEach(([key, value]) => {
        const fieldConfig = schema.fields[key];
        if (fieldConfig?.type !== 'password') {
          maskedConfig[key] = value;
        }
      });
      
      // Then handle password fields
      Object.entries(initialConfig).forEach(([key, value]) => {
        const fieldConfig = schema.fields[key];
        if (fieldConfig?.type === 'password') {
          const stringValue = value ? String(value).trim() : '';
          
          if (stringValue !== '') {
            // Check if the value is already masked (contains asterisks)
            const isAlreadyMasked = stringValue.includes('*');
            
            if (isAlreadyMasked) {
              // Value is already masked from API - we don't have the original
              // Store the masked value as-is, but don't store an "original"
              // This means we can't show/hide it, but we can still allow updating
              maskedConfig[key] = stringValue;
              // Don't store in originals - we don't have the actual value
            } else {
              // Value is the actual API key - mask it for display
              // Store original value
              originals[key] = stringValue;
              // Mask the value (show first 4 and last 4 chars if length > 8, otherwise all asterisks)
              const masked = stringValue.length > 8 
                ? stringValue.substring(0, 4) + '*'.repeat(stringValue.length - 8) + stringValue.substring(stringValue.length - 4)
                : '*'.repeat(stringValue.length);
              maskedConfig[key] = masked;
            }
          } else {
            // Empty value - keep it empty
            maskedConfig[key] = '';
          }
        }
      });
      
      setConfig(maskedConfig);
      setOriginalValues(originals);
      hasInitializedRef.current = true;
    }
    // Only depend on integrationType - don't reset when initialConfig changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integrationType]);

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

  // Validate form and notify parent when config or schema changes
  useEffect(() => {
    if (!onValidationChangeRef.current) return;

    // Check if integration has no fields
    const orderedFields = [
      ...schema.required.map((name) => [name, schema.fields[name]] as const),
      ...schema.optional
        .map((name) => [name, schema.fields[name]] as const)
        .filter(([, fieldConfig]) => fieldConfig !== undefined),
    ];
    const hasNoFields = orderedFields.length === 0;

    // If integration has no fields, validation always passes
    if (hasNoFields) {
      onValidationChangeRef.current(true);
      return;
    }

    // Validate required fields
    let isValid = true;
    schema.required.forEach((fieldName) => {
      const value = config[fieldName];
      // For password fields, check if we have an original value or a non-masked value
      const fieldConfig = schema.fields[fieldName];
      if (fieldConfig?.type === 'password') {
        // If it's masked (contains asterisks), it means there's a saved value, so it's valid
        const stringValue = String(value || '').trim();
        const isMasked = stringValue.includes('*');
        if (isMasked) {
          // Masked value means there's a saved value, so it's valid
          // We don't need to check originalValues because masked = previously saved
        } else if (!stringValue) {
          // Not masked and empty = invalid
          isValid = false;
        }
        // If not masked and has a value, it's valid (user entered a new value)
      } else {
        if (!value || String(value).trim() === '') {
          isValid = false;
        }
      }
    });

    // Validate field types for non-empty fields
    Object.entries(schema.fields).forEach(([fieldName, fieldConfig]) => {
      const value = config[fieldName];
      if (!value) return;

      switch (fieldConfig.type) {
      case 'url':
        try {
          new URL(String(value));
        } catch {
          isValid = false;
        }
        break;
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          isValid = false;
        }
        break;
      }
      case 'number': {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          isValid = false;
        } else {
          if (fieldConfig.min !== undefined && numValue < fieldConfig.min) {
            isValid = false;
          }
          if (fieldConfig.max !== undefined && numValue > fieldConfig.max) {
            isValid = false;
          }
        }
        break;
      }
      }
    });

    onValidationChangeRef.current(isValid);
  }, [config, schema, originalValues]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // If integration has no fields, validation always passes
    if (hasNoFields) {
      setErrors({});
      return true;
    }

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
    
    // Prevent any default form behavior
    if (e.defaultPrevented === false) {
      e.preventDefault();
    }
    
    if (!validate()) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    try {
      // Convert config values to strings for API
      // Only include fields that have actually changed from original values
      const submitConfig: Record<string, string> = {};
      Object.entries(config).forEach(([key, value]) => {
        const stringValue = String(value);
        const originalValue = originalValues[key];
        const fieldConfig = schema.fields[key];
        
        // If there's an original value, only include if it's been changed
        if (originalValue) {
          // Check if the current value is masked (contains asterisks)
          const isMasked = stringValue.includes('*');
          const actualValue = isMasked ? originalValue : stringValue;
          
          // Only include if the value is different from original
          if (actualValue !== originalValue) {
            submitConfig[key] = actualValue;
          }
          // If value hasn't changed, don't include it (will keep existing value)
        } else {
          // New value - check if it's a password field that's masked (from API)
          // If it's masked, we don't have the original, so don't send it
          // Otherwise, include it if it has a value
          if (fieldConfig?.type === 'password' && stringValue.includes('*')) {
            // This is a masked value from API - we don't have the original
            // Don't include it unless the user has typed something new
            // (which would mean it's not masked anymore)
            // Skip it - we can't update what we don't know
          } else if (stringValue.trim() !== '') {
            // Non-empty value, include it
            submitConfig[key] = stringValue;
          }
        }
      });
      
      // Validate that required fields are present in submitConfig
      // If we're creating a new integration (no originalValues), all required fields must be present
      const hasOriginalValues = Object.keys(originalValues).length > 0;
      if (!hasOriginalValues) {
        // Creating new integration - ensure required fields are included
        schema.required?.forEach((fieldName) => {
          const fieldConfig = schema.fields[fieldName];
          if (fieldConfig && !(fieldName in submitConfig)) {
            const currentValue = config[fieldName];
            const stringValue = currentValue ? String(currentValue).trim() : '';
            if (stringValue === '') {
              throw new Error(`Required field "${fieldConfig.label || fieldName}" is missing`);
            }
            // If it's a password field that's masked, we can't use it - user must enter a new value
            if (fieldConfig.type === 'password' && stringValue.includes('*')) {
              throw new Error(`Please enter a value for "${fieldConfig.label || fieldName}"`);
            }
            submitConfig[fieldName] = stringValue;
          }
        });
      }
      
      // Log submitConfig for debugging (remove in production)
      if (Object.keys(submitConfig).length === 0 && schema.required && schema.required.length > 0) {
        console.warn('IntegrationForm: submitConfig is empty but required fields exist', {
          required: schema.required,
          config,
          originalValues,
          hasOriginalValues
        });
      }
      
      await onSubmit(submitConfig);
      // Don't reset form or navigate - let the parent handle the next step
      // Explicitly prevent any form submission
      e.preventDefault();
      e.stopPropagation();
    } catch (error) {
      console.error('Error submitting integration:', error);
      // Ensure we prevent default even on error
      e.preventDefault();
      e.stopPropagation();
      // Re-throw so parent can handle the error
      throw error;
    }
  };

  const renderField = (fieldName: string, fieldConfig: IntegrationSchema['fields'][string]) => {
    // Guard against undefined fieldConfig
    if (!fieldConfig) {
      console.warn(`Field config is undefined for field: ${fieldName}`);
      return null;
    }

    const value = config[fieldName] || '';
    const error = errors[fieldName];
    const isRequired = schema.required.includes(fieldName);

    switch (fieldConfig.type) {
      case 'password': {
        const isVisible = visiblePasswords[fieldName] || false;
        const originalValue = originalValues[fieldName];
        const hasOriginalValue = !!originalValue;
        const stringValue = String(value || '');
        const isMasked = stringValue.includes('*');
        
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName} className="text-xs md:text-sm">
              {fieldConfig.label}
              {isRequired && <span className="text-destructive ml-1">*</span>}
              {hasOriginalValue && (
                <span className="text-xs text-muted-foreground font-normal ml-2">(configured)</span>
              )}
            </Label>
            <div className="relative">
            <Input
              id={fieldName}
              type={isVisible ? 'text' : 'password'}
              placeholder={fieldConfig.placeholder || 'Enter your API key'}
              value={stringValue}
              onChange={(e) => {
                const newValue = e.target.value;
                
                // If we have an original value and user is typing, they're changing it
                if (hasOriginalValue) {
                  // If user clears the field, reset to masked original
                  if (newValue === '') {
                    const masked = originalValue.length > 8 
                      ? originalValue.substring(0, 4) + '*'.repeat(originalValue.length - 8) + originalValue.substring(originalValue.length - 4)
                      : '*'.repeat(originalValue.length);
                    handleFieldChange(fieldName, masked);
                    setVisiblePasswords(prev => ({ ...prev, [fieldName]: false }));
                  } else {
                    // User is typing a new value
                    handleFieldChange(fieldName, newValue);
                    setVisiblePasswords(prev => ({ ...prev, [fieldName]: true }));
                  }
                } else {
                  // New value entry
                  handleFieldChange(fieldName, newValue);
                }
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
                              {(hasOriginalValue || isMasked) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!hasOriginalValue) {
                                      // No original value (API returned masked value) - can't show/hide
                                      // Just toggle visibility of the masked value
                                      setVisiblePasswords(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
                                      return;
                                    }
                                    
                                    const currentlyMasked = stringValue.includes('*');
                                    if (currentlyMasked) {
                                      // Show: display actual key
                                      handleFieldChange(fieldName, originalValue);
                                      setVisiblePasswords(prev => ({ ...prev, [fieldName]: true }));
                                    } else {
                                      // Hide: check if value has been modified
                                      if (stringValue === originalValue) {
                                        // Not modified, just hide it
                                        const masked = originalValue.length > 8 
                                          ? originalValue.substring(0, 4) + '*'.repeat(originalValue.length - 8) + originalValue.substring(originalValue.length - 4)
                                          : '*'.repeat(originalValue.length);
                                        handleFieldChange(fieldName, masked);
                                        setVisiblePasswords(prev => ({ ...prev, [fieldName]: false }));
                                      } else {
                                        // User has modified it, keep showing the modified value
                                        setVisiblePasswords(prev => ({ ...prev, [fieldName]: true }));
                                      }
                                    }
                                  }}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-secondary/50"
                                  tabIndex={-1}
                                  aria-label={isVisible && (!hasOriginalValue || stringValue === originalValue) ? 'Hide password' : 'Show password'}
                                  disabled={!hasOriginalValue}
                                  title={!hasOriginalValue ? 'Original value not available (masked from API)' : undefined}
                                >
                                  {isVisible && (!hasOriginalValue || stringValue === originalValue) ? (
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

  // Handle OAuth connection for OAuth-enabled integrations
  const handleOAuthConnect = async () => {
    const oauthIntegrations = ['google_calendar', 'calendly', 'outlook_calendar'];
    if (oauthIntegrations.includes(integrationType || '')) {
      setOAuthLoading(true);
      try {
        // Get current page URL to redirect back after OAuth
        // Preserve the tab parameter so user returns to the same tab
        // Also preserve step parameter for wizard mode
        // Use the full frontend URL (not backend URL)
        const currentUrl = new URL(window.location.href);
        const tab = currentUrl.searchParams.get('tab');
        const step = currentUrl.searchParams.get('step');
        const slug = currentUrl.searchParams.get('slug');
        // Build return URL with full frontend URL and all relevant parameters
        let returnUrl = `${currentUrl.origin}${currentUrl.pathname}`;
        const params = new URLSearchParams();
        if (tab) {
          params.append('tab', tab);
        }
        if (step) {
          params.append('step', step);
        }
        if (slug) {
          params.append('slug', slug);
        }
        if (params.toString()) {
          returnUrl += `?${params.toString()}`;
        }
        
        // Make authenticated API call to get OAuth URL
        const response = await integrationsApi.getOAuthUrl(integrationType || '', returnUrl);
        if (response.data?.authorization_url) {
          // Redirect to OAuth consent screen
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
  const oauthIntegrations = ['google_calendar', 'calendly', 'outlook_calendar'];
  const isOAuthIntegration = schema.auth_type === 'oauth' || oauthIntegrations.includes(integrationType || '');
  // Check for OAuth token - could be stored as api_key, access_token, or refresh_token
  // Masked values (like "****1234") indicate a token exists, so check for any non-empty value
  // Also check hasSavedValues - if integration is saved and it's OAuth, assume token exists (even if masked)
  const hasOAuthToken = Boolean(
    (hasSavedValues && isOAuthIntegration && oauthIntegrations.includes(integrationType || '')) ||
    (initialConfig?.api_key && String(initialConfig.api_key).trim() !== '' && String(initialConfig.api_key) !== 'undefined') ||
    (initialConfig?.access_token && String(initialConfig.access_token).trim() !== '' && String(initialConfig.access_token) !== 'undefined') ||
    (initialConfig?.refresh_token && String(initialConfig.refresh_token).trim() !== '' && String(initialConfig.refresh_token) !== 'undefined')
  );

  // Render fields in order: required first, then optional
  // Filter out any fields that don't exist in schema.fields to prevent undefined errors
  const orderedFields = [
    ...schema.required
      .map((name) => [name, schema.fields[name]] as const)
      .filter(([, fieldConfig]) => fieldConfig !== undefined),
    ...schema.optional
      .map((name) => [name, schema.fields[name]] as const)
      .filter(([, fieldConfig]) => fieldConfig !== undefined),
  ];

  // Check if integration has no fields (like Twilio - uses environment variables)
  const hasNoFields = orderedFields.length === 0;

  // For OAuth integrations, show OAuth button instead of API key field
  const shouldShowOAuthButton = isOAuthIntegration && !hasOAuthToken && oauthIntegrations.includes(integrationType || '');

  // Get OAuth button text and description based on integration type
  const getOAuthButtonText = () => {
    switch (integrationType) {
      case 'google_calendar':
        return { label: 'Connect with Google', button: 'Connect with Google Calendar', description: 'Click to authorize access to your Google Calendar. You\'ll be redirected to Google to sign in.' };
      case 'calendly':
        return { label: 'Connect with Calendly', button: 'Connect with Calendly', description: 'Click to authorize access to your Calendly account. You\'ll be redirected to Calendly to sign in.' };
      case 'outlook_calendar':
        return { label: 'Connect with Microsoft', button: 'Connect with Outlook Calendar', description: 'Click to authorize access to your Outlook Calendar. You\'ll be redirected to Microsoft to sign in.' };
      default:
        return { label: 'Connect', button: 'Connect', description: 'Click to authorize access. You\'ll be redirected to sign in.' };
    }
  };

  const oauthButtonText = getOAuthButtonText();

  // Expose submit method to parent via ref
  useImperativeHandle(ref, () => ({
    submit: async () => {
      // Create a synthetic event for handleSubmit
      const syntheticEvent = {
        preventDefault: () => {},
        stopPropagation: () => {},
        defaultPrevented: false,
      } as React.FormEvent<HTMLFormElement>;
      
      await handleSubmit(syntheticEvent);
    },
  }));

  return (
    <form 
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          await handleSubmit(e);
        } catch (error) {
          // Error is already handled in handleSubmit, just prevent default form submission
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onKeyDown={(e) => {
        // Prevent form submission on Enter if submit button is hidden
        if (e.key === 'Enter' && hideSubmitButton) {
          e.preventDefault();
        }
      }}
      className="space-y-3 md:space-y-4"
      noValidate
    >
      {shouldShowOAuthButton ? (
        <div className="space-y-2">
          <Label className="text-xs md:text-sm">{oauthButtonText.label}</Label>
          <Button
            type="button"
            variant="outline"
            onClick={handleOAuthConnect}
            disabled={isLoading || oauthLoading}
            className={cn(
              "w-full text-xs md:text-sm font-medium h-11 relative overflow-hidden",
              integrationType === 'google_calendar' && "bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900 shadow-sm",
              integrationType === 'calendly' && "bg-[#0069FF] hover:bg-[#0052CC] text-white border-[#0069FF] hover:border-[#0052CC] shadow-sm",
              integrationType === 'outlook_calendar' && "bg-[#0078D4] hover:bg-[#0064B8] text-white border-[#0078D4] hover:border-[#0064B8] shadow-sm"
            )}
          >
            {oauthLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                {integrationType === 'google_calendar' && (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.99 7.28-2.69l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {integrationType === 'calendly' && (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10S2 17.514 2 12 6.486 2 12 2zm-1 3v6h6V5h-6zm2 2h2v2h-2V7z"/>
                  </svg>
                )}
                {integrationType === 'outlook_calendar' && (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 2v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-2V2h-2v2H9V2H7zm0 4H5v14h14V6h-2v2H7V6zm2 4v2h2v-2H9zm4 0v2h2v-2h-2zm-4 4v2h2v-2H9zm4 0v2h2v-2h-2z"/>
                  </svg>
                )}
                <span>{oauthButtonText.button}</span>
              </span>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            {oauthButtonText.description}
          </p>
        </div>
      ) : hasNoFields ? (
        // For integrations with no fields (like Twilio using environment variables)
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-4 rounded-lg border-l-4 border-primary/30 bg-primary/5">
            <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">No Configuration Required</p>
              <p className="text-muted-foreground">
                This integration uses environment variables configured on the server. Click "Connect" to enable the integration and select available tools.
              </p>
            </div>
          </div>
          {/* Show disconnect button if already connected, but not for default integrations like Twilio */}
          {hasSavedValues && onDisconnect && integrationType !== 'twilio' && (
            <div className="space-y-2 pt-2">
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  if (confirm(`Are you sure you want to disconnect ${integrationType === 'twilio' ? 'Twilio' : 'this integration'}?`)) {
                    setDisconnecting(true);
                    try {
                      await onDisconnect();
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: error instanceof Error ? error.message : "Failed to disconnect integration.",
                        variant: "destructive",
                      });
                    } finally {
                      setDisconnecting(false);
                    }
                  }
                }}
                disabled={isLoading || disconnecting}
                className="w-full text-xs md:text-sm"
              >
                {disconnecting ? "Disconnecting..." : `Disconnect ${integrationType === 'twilio' ? 'Twilio' : 'Integration'}`}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          {orderedFields.map(([fieldName, fieldConfig]) => {
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
          })}
          {/* Show disconnect button for OAuth integrations when connected */}
          {isOAuthIntegration && hasOAuthToken && onDisconnect && (
            <div className="space-y-2 pt-2">
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  if (confirm(`Are you sure you want to disconnect ${integrationType === 'calendly' ? 'Calendly' : integrationType === 'google_calendar' ? 'Google Calendar' : integrationType === 'outlook_calendar' ? 'Outlook Calendar' : 'this integration'}? This will remove all credentials.`)) {
                    setDisconnecting(true);
                    try {
                      await onDisconnect();
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: error instanceof Error ? error.message : "Failed to disconnect integration.",
                        variant: "destructive",
                      });
                    } finally {
                      setDisconnecting(false);
                    }
                  }
                }}
                disabled={isLoading || disconnecting}
                className="w-full text-xs md:text-sm"
              >
                {disconnecting ? "Disconnecting..." : `Disconnect ${integrationType === 'calendly' ? 'Calendly' : integrationType === 'google_calendar' ? 'Google Calendar' : integrationType === 'outlook_calendar' ? 'Outlook Calendar' : 'Integration'}`}
              </Button>
            </div>
          )}
        </>
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
});

IntegrationForm.displayName = "IntegrationForm";
