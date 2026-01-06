export type IntegrationFieldType = 'text' | 'password' | 'url' | 'email' | 'select' | 'number';

export interface IntegrationFieldConfig {
  type: IntegrationFieldType;
  label: string;
  placeholder?: string;
  description?: string;
  options?: string[]; // For select type
  min?: number; // For number type
  max?: number; // For number type
}

export interface IntegrationSchema {
  type: string;
  required: string[];
  optional: string[];
  fields: Record<string, IntegrationFieldConfig>;
  auth_type?: 'oauth' | 'api_key';
}

export interface IntegrationConfig {
  [key: string]: string | number | undefined;
}

export interface UserIntegration {
  id: number;
  integration_type: string;
  config: IntegrationConfig;
  schema: {
    required: string[];
    optional: string[];
    fields: Record<string, IntegrationFieldConfig>;
  };
  created_at: string;
  updated_at: string;
}
