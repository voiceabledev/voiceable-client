import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import type { IntegrationSchema, IntegrationConfig } from "@/types/integrations";

interface IntegrationFormProps {
  schema: IntegrationSchema;
  initialConfig?: IntegrationConfig;
  onSubmit: (config: IntegrationConfig) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  hasSavedValues?: boolean;
}

export function IntegrationForm({
  schema,
  initialConfig = {},
  onSubmit,
  onCancel,
  isLoading = false,
  hasSavedValues = false,
}: IntegrationFormProps) {
  const [config, setConfig] = useState<IntegrationConfig>(initialConfig);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [maskedPasswords, setMaskedPasswords] = useState<Record<string, string>>({});

  useEffect(() => {
    setConfig(initialConfig);
    // Create masked versions of password fields
    const masked: Record<string, string> = {};
    Object.keys(initialConfig).forEach((key) => {
      const value = initialConfig[key];
      if (value && typeof value === 'string' && !value.includes('*')) {
        // It's an actual password value, create a masked version
        if (value.length > 4) {
          masked[key] = `${'*'.repeat(value.length - 4)}${value.slice(-4)}`;
        } else if (value.length > 0) {
          masked[key] = '****';
        }
      }
    });
    setMaskedPasswords(masked);
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
      if (!config[fieldName] || String(config[fieldName]).trim() === '') {
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
        const isMaskedValue = stringValue.includes('*');
        const hasMaskedVersion = maskedPasswords[fieldName];
        
        // Determine what to display:
        // - If visible: show actual value (or masked if it's a masked value from API)
        // - If hidden: show masked version (if we have one) or password dots
        let displayValue: string;
        let inputType: 'text' | 'password';
        
        if (isVisible) {
          // Show actual value (or masked value if that's what we have)
          displayValue = stringValue;
          inputType = 'text';
        } else {
          // Show masked version if available, otherwise show the value as password dots
          if (hasMaskedVersion && !isMaskedValue) {
            displayValue = hasMaskedVersion;
            inputType = 'text'; // Show masked as text so it's visible
          } else {
            displayValue = stringValue;
            inputType = 'password'; // Show as password dots
          }
        }
        
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName} className="text-xs md:text-sm">
              {fieldConfig.label}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="relative">
              <Input
                id={fieldName}
                type={inputType}
                placeholder={fieldConfig.placeholder || 'Enter your API key'}
                value={displayValue}
                onChange={(e) => {
                  // When user types, update the actual value and clear masked version
                  const newValue = e.target.value;
                  handleFieldChange(fieldName, newValue);
                  // Clear masked version when user starts typing
                  if (maskedPasswords[fieldName]) {
                    setMaskedPasswords((prev) => {
                      const updated = { ...prev };
                      delete updated[fieldName];
                      return updated;
                    });
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

  // Render fields in order: required first, then optional
  const orderedFields = [
    ...schema.required.map((name) => [name, schema.fields[name]] as const),
    ...schema.optional.map((name) => [name, schema.fields[name]] as const),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
      {orderedFields.map(([fieldName, fieldConfig]) => renderField(fieldName, fieldConfig))}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="text-xs md:text-sm"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="outline"
          disabled={isLoading}
          className="text-xs md:text-sm"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

