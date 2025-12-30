import type { UserIntegration, IntegrationSchema, IntegrationConfig } from '@/types/integrations';
import type { WorkflowNode } from '@/pages/WorkflowEditor';
import type { WorkflowConnection } from '@/components/workflows/WorkflowCanvas';
import type {
  OutcomeDefinition,
  ConversationOutcome,
  EscalationPolicy,
  HumanHandoffEvent,
  FailureReason,
  SupportDashboardData,
  SalesDashboardData,
  FailureBreakdownData,
} from '@/types/outcomes';

/**
 * Determines the API base URL at runtime.
 * Priority:
 * 1. VITE_API_BASE_URL env var (if set at build time)
 * 2. Runtime env var from window (for Heroku/dynamic configs)
 * 3. Auto-detect based on current hostname (for production)
 * 4. Localhost fallback (for development)
 */
function getApiBaseUrl(): string {
  // Use env var if available (set at build time)
  if (import.meta.env.VITE_API_BASE_URL) {
    // Remove trailing slash if present
    const url = import.meta.env.VITE_API_BASE_URL;
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }

  // Check for runtime config (useful for Heroku where env vars might not be available at build time)
  if (typeof window !== 'undefined') {
    // Check if there's a runtime config set via a script tag or global variable
    const runtimeConfig = (window as any).__API_BASE_URL__;
    if (runtimeConfig) {
      // Remove trailing slash if present
      return runtimeConfig.endsWith('/') ? runtimeConfig.slice(0, -1) : runtimeConfig;
    }

    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // If on Heroku or production domain, construct API URL
    if (hostname.includes('herokuapp.com') || hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
      // For same-domain deployments, use relative path
      // If your backend is on a different Heroku app, you'll need to set VITE_API_BASE_URL
      // or use a runtime config. For now, assume same domain or set via env var.
      return '/api/v1';
    }
    
    // For localhost development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000/api/v1';
    }
    
    // For other production domains, try to construct API URL
    // Assumes API is on same domain with /api/v1 path
    return `${protocol}//${hostname}/api/v1`;
  }

  // Default fallback
  return 'http://localhost:3000/api/v1';
}

const API_BASE_URL = getApiBaseUrl();

interface ApiResponse<T> {
  status: {
    code: number;
    message: string;
  };
  data?: T;
  errors?: string[];
  token?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Remove leading slash from endpoint if present, and ensure baseURL doesn't end with slash
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const cleanBaseURL = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
    const url = `${cleanBaseURL}${cleanEndpoint}`;
    const token = this.getToken();

    const headers: HeadersInit = {
      ...options.headers,
    };

    // Only set Content-Type for JSON, let browser set it for FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    let data;
    try {
      // Handle 204 No Content responses (empty body)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        data = {};
      } else {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      }
    } catch (error) {
      // If response is not JSON, throw a generic error
      throw new Error('An error occurred while processing the request');
    }

    if (!response.ok) {
      // Handle 401 Unauthorized - redirect to login only for user authentication errors
      if (response.status === 401) {
        const errorMessage = data.status?.message || (Array.isArray(data.errors) ? data.errors.join(', ') : 'An error occurred');
        
        // Only redirect to login if it's a user authentication error, not an ElevenLabs API key error
        // User auth errors: "Authentication required."
        // ElevenLabs API key errors: "Invalid ElevenLabs API key." or similar
        const isUserAuthError = errorMessage === 'Authentication required.' || 
                                errorMessage.toLowerCase().includes('authentication required');
        
        if (isUserAuthError) {
          // Clear token if present
          this.setToken(null);
          // Redirect to login page
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        
        const error = new Error(errorMessage);
        // Attach additional error details if available
        if (data.details) {
          (error as any).details = data.details;
        }
        if (data.error) {
          (error as any).errorCode = data.error;
        }
        throw error;
      }
      
      const errorMessage = data.status?.message || (Array.isArray(data.errors) ? data.errors.join(', ') : 'An error occurred');
      const error = new Error(errorMessage);
      // Attach response status and data to error for better error handling
      (error as any).response = {
        status: response.status,
        statusText: response.statusText,
        data: data
      };
      // Attach additional error details if available
      if (data.details) {
        (error as any).details = data.details;
      }
      if (data.error) {
        (error as any).errorCode = data.error;
      }
      throw error;
    }

    return data;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
      ...options,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Auth API methods
export const authApi = {
  signUp: async (email: string, password: string, passwordConfirmation: string) => {
    const response = await apiClient.post('/auth/sign_up', {
      user: { email, password, password_confirmation: passwordConfirmation },
    });
    // Store token if provided
    if (response.token) {
      apiClient.setToken(response.token);
    }
    return response;
  },

  signIn: async (email: string, password: string) => {
    // Use apiClient instead of direct fetch to ensure proper CORS handling
    const response = await apiClient.post('/auth/sign_in', {
      user: { email, password },
    });
    
    // Extract JWT token from response
    if (response.token) {
      apiClient.setToken(response.token);
    }

    return response;
  },

  signOut: async () => {
    const response = await apiClient.delete('/auth/sign_out');
    apiClient.setToken(null);
    return response;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/user/current');
    return response;
  },

  updateTourCompletion: async () => {
    const response = await apiClient.patch('/user/tour_completion');
    return response;
  },

  resetPassword: async (email: string) => {
    return apiClient.post('/auth/password/reset', {
      user: { email },
    });
  },

  updatePassword: async (resetToken: string, password: string, passwordConfirmation: string) => {
    return apiClient.put('/auth/password/reset', {
      user: {
        reset_password_token: resetToken,
        password,
        password_confirmation: passwordConfirmation,
      },
    });
  },

  // Update password when logged in (requires backend implementation)
  updatePasswordLoggedIn: async (currentPassword: string, newPassword: string, passwordConfirmation: string) => {
    return apiClient.put('/user/password', {
      user: {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: passwordConfirmation,
      },
    });
  },

  // Discard/deactivate account
  discardAccount: async () => {
    return apiClient.delete('/user/account');
  },
};

// Voices API methods
export interface VoiceFilters {
  search?: string;
  gender?: string;
  accent?: string;
  category?: string;
}

export interface Voice {
  id: string;
  name: string;
  category?: string;
  description?: string;
  preview_url?: string;
  labels?: Record<string, string>;
  settings?: Record<string, unknown>;
  safety_control?: string;
}

export const voicesApi = {
  list: async (filters?: VoiceFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.gender) params.append('gender', filters.gender);
    if (filters?.accent) params.append('accent', filters.accent);
    if (filters?.category) params.append('category', filters.category);

    const queryString = params.toString();
    const endpoint = `/voices${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<Voice[]>(endpoint);
    return response;
  },

  get: async (id: string) => {
    const response = await apiClient.get<Voice>(`/voices/${id}`);
    return response;
  },
};

// Integrations API methods
export const integrationsApi = {
  list: async () => {
    const response = await apiClient.get<UserIntegration[]>('/integrations');
    return response;
  },

  get: async (type: string) => {
    const response = await apiClient.get<UserIntegration>(`/integrations/${type}`);
    return response;
  },

  create: async (type: string, config: IntegrationConfig) => {
    const response = await apiClient.post<UserIntegration>('/integrations', {
      integration: {
        integration_type: type,
        config: config,
      },
    });
    return response;
  },

  update: async (type: string, config: IntegrationConfig) => {
    const response = await apiClient.put<UserIntegration>(`/integrations/${type}`, {
      integration: {
        config: config,
      },
    });
    return response;
  },

  delete: async (type: string) => {
    const response = await apiClient.delete(`/integrations/${type}`);
    return response;
  },

  deleteFromAgent: async (agentId: string, integrationType: string) => {
    const response = await apiClient.delete(`/agents/${agentId}/integrations/${integrationType}`);
    return response;
  },

  getSchemas: async () => {
    const response = await apiClient.get<IntegrationSchema[]>('/integrations/schemas');
    return response;
  },
};

// Agents API methods
export interface AgentFilters {
  page_size?: number;
  search?: string;
  sort_direction?: 'asc' | 'desc';
  sort_by?: 'name' | 'created_at';
  cursor?: string;
}

export interface WidgetConfig {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  welcomeMessage?: string;
  iconType?: 'phone' | 'chat' | 'headphones' | 'custom';
  customIconUrl?: string;
  position?: 'bottom-right' | 'bottom-left';
  widgetSize?: 'small' | 'medium' | 'large';
  primaryColor?: string;
  primaryTextColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  userBubbleColor?: string;
  agentBubbleColor?: string;
  borderRadius?: string;
}

export interface Agent {
  id: string;
  slug?: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  conversation_config?: Record<string, unknown>;
  platform_settings?: Record<string, unknown>;
  widget_config?: WidgetConfig;
  published?: boolean;
  published_at?: string;
  elevenlabs_agent_id?: string;
  version?: number;
  integration_tools?: Record<string, { enabled: boolean; enabled_tools: string[] }>;
}

export interface CreateAgentParams {
  name: string;
  conversation_config?: Record<string, unknown>;
  platform_settings?: Record<string, unknown>;
  widget_config?: WidgetConfig;
  tags?: string[];
  integration_tools?: Record<string, { enabled: boolean; enabled_tools: string[] }>;
}

export interface UpdateAgentParams {
  name?: string;
  conversation_config?: Record<string, unknown>;
  platform_settings?: Record<string, unknown>;
  widget_config?: WidgetConfig;
  tags?: string[];
  webhook_tools?: Array<Record<string, unknown>>;
  integration_tools?: Record<string, { enabled: boolean; enabled_tools: string[] }>;
}

export const agentsApi = {
  list: async (filters?: AgentFilters) => {
    const params = new URLSearchParams();
    if (filters?.page_size) params.append('page_size', filters.page_size.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sort_direction) params.append('sort_direction', filters.sort_direction);
    if (filters?.sort_by) params.append('sort_by', filters.sort_by);
    if (filters?.cursor) params.append('cursor', filters.cursor);

    const queryString = params.toString();
    const endpoint = `/agents${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<Agent[]>(endpoint);
    return response;
  },

  get: async (id: string) => {
    const response = await apiClient.get<Agent>(`/agents/${id}`);
    return response;
  },

  create: async (params: CreateAgentParams) => {
    const response = await apiClient.post<Agent>('/agents', {
      agent: params,
    });
    return response;
  },

  update: async (id: string, params: UpdateAgentParams) => {
    const response = await apiClient.put<Agent>(`/agents/${id}`, {
      agent: params,
    });
    return response;
  },

  publish: async (id: string) => {
    const response = await apiClient.post<Agent>(`/agents/${id}/publish`);
    return response;
  },

  getPreviewLink: async (id: string) => {
    const response = await apiClient.get<{ signed_url?: string; agent_id?: string }>(`/agents/${id}/preview_link`);
    return response;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/agents/${id}`);
    return response;
  },
};

// Agent Behaviours API
export interface AgentBehaviourSection {
  id: number;
  section_type: "scenarios" | "phases" | "voice_tone";
  label: string;
  description?: string;
  add_label?: string;
  title_placeholder?: string;
  description_placeholder?: string;
  notes_placeholder?: string;
  notes_label?: string;
  position?: number;
}

export interface AgentBehaviour {
  id: number;
  name: string;
  description?: string;
  active?: boolean;
  position?: number;
  sections?: AgentBehaviourSection[];
  created_at?: string;
  updated_at?: string;
}

// Agent Templates API
export interface AgentTemplate {
  id: number;
  title: string;
  description: string;
  system_prompt: string;
  first_message: string;
  icon_name?: string;
  icon_url?: string;
  active?: boolean;
  position?: number;
  agent_behaviour_id?: number;
  agent_behaviour?: AgentBehaviour;
  created_at?: string;
  updated_at?: string;
}

export const agentTemplatesApi = {
  list: async () => {
    const response = await apiClient.get<AgentTemplate[]>('/agent_templates');
    return response;
  },
};

// Agent Files API
export interface AgentFile {
  id: number;
  file_name: string;
  s3_key: string;
  s3_url?: string;
  elevenlabs_document_id?: string;
  file_size?: number;
  content_type?: string;
  agent_id?: number;
  agent_name?: string;
}

export interface PresignedUploadResponse {
  url: string;
  key: string;
  public_url: string;
}

export interface FileUsageInfo {
  file_name: string;
  agents: Array<{
    id: number;
    name: string;
    agent_file_id?: number;
  }>;
}

export const agentFilesApi = {
  list: async (agentId: string) => {
    const response = await apiClient.get<AgentFile[]>(`/agents/${agentId}/agent_files`);
    return response;
  },

  listAll: async () => {
    const response = await apiClient.get<AgentFile[]>(`/agent_files`);
    return response;
  },

  checkUsage: async (fileId: number) => {
    const response = await apiClient.get<FileUsageInfo>(`/agent_files/${fileId}/usage`);
    return response;
  },

  create: async (agentId: string, params: {
    s3_key: string;
    s3_url: string;
    file_name: string;
    file_size: number;
    content_type: string;
  }) => {
    const response = await apiClient.post<AgentFile>(`/agents/${agentId}/agent_files`, {
      s3_key: params.s3_key,
      s3_url: params.s3_url,
      file_name: params.file_name,
      file_size: params.file_size,
      content_type: params.content_type,
    });
    return response;
  },

  createAndSync: async (agentId: string, params: {
    s3_key: string;
    s3_url: string;
    file_name: string;
    file_size: number;
    content_type: string;
  }) => {
    const requestBody: {
      s3_key: string;
      s3_url: string;
      file_name: string;
      file_size: number;
      content_type: string;
      agent_id?: string;
    } = {
      s3_key: params.s3_key,
      s3_url: params.s3_url,
      file_name: params.file_name,
      file_size: params.file_size,
      content_type: params.content_type,
    };
    
    // Only include agent_id if it's provided
    if (agentId && agentId.trim() !== "") {
      requestBody.agent_id = agentId;
    }
    
    const response = await apiClient.post<AgentFile>(`/agent_files/create_and_sync`, requestBody);
    return response;
  },

  delete: async (agentId: string, fileId: number) => {
    const response = await apiClient.delete(`/agents/${agentId}/agent_files/${fileId}`);
    return response;
  },

  deleteDirect: async (fileId: number) => {
    const response = await apiClient.delete(`/agent_files/${fileId}`);
    return response;
  },
};

export const awsS3Api = {
  getPresignedUrl: async (filename: string, content_type: string, key_name?: string) => {
    const url = `${API_BASE_URL}/aws_s3/direct_upload`;
    const token = apiClient.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        filename,
        content_type,
        key_name,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || 'Failed to get presigned URL';
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return {
      status: { code: response.status, message: 'OK' },
      data: data as PresignedUploadResponse,
    };
  },
};

// Conversations API methods
export interface ConversationFilters {
  page_size?: number;
  agent_id?: string;
  call_successful?: 'success' | 'failure' | 'unknown';
  call_start_before_unix?: number;
  call_start_after_unix?: number;
  user_id?: string;
  summary_mode?: 'exclude' | 'include';
  cursor?: string;
}

export interface Conversation {
  id: string;
  agent_id?: string;
  agent_name?: string;
  status?: string;
  call_successful?: string;
  duration?: string;
  messages?: number;
  date?: string;
  summary?: string;
  user_id?: string;
  direction?: string;
  has_audio?: boolean;
  transcript?: Array<{
    role: 'user' | 'assistant';
    message: string;
    time_in_call_secs?: number;
  }>;
  metadata?: Record<string, unknown>;
  outcome?: import('./types/outcomes').ConversationOutcome | null;
  cost?: {
    amount_cents: number;
    amount_dollars: number;
    formatted: string;
  } | null;
}

export const conversationsApi = {
  list: async (filters?: ConversationFilters) => {
    const params = new URLSearchParams();
    if (filters?.page_size) params.append('page_size', filters.page_size.toString());
    if (filters?.agent_id) params.append('agent_id', filters.agent_id);
    if (filters?.call_successful) params.append('call_successful', filters.call_successful);
    if (filters?.call_start_before_unix) params.append('call_start_before_unix', filters.call_start_before_unix.toString());
    if (filters?.call_start_after_unix) params.append('call_start_after_unix', filters.call_start_after_unix.toString());
    if (filters?.user_id) params.append('user_id', filters.user_id);
    if (filters?.summary_mode) params.append('summary_mode', filters.summary_mode);
    if (filters?.cursor) params.append('cursor', filters.cursor);

    const queryString = params.toString();
    const endpoint = `/conversations${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<Conversation[]>(endpoint);
    return response;
  },

  get: async (id: string) => {
    const response = await apiClient.get<Conversation>(`/conversations/${id}`);
    return response;
  },

  getSignedUrl: async (agentId: string) => {
    const params = new URLSearchParams();
    params.append('agent_id', agentId);
    const response = await apiClient.get<{ signed_url: string }>(`/conversations/get_signed_url?${params.toString()}`);
    return response;
  },
};

// Metrics API methods
export interface MetricsFilters {
  agent_id?: string;
  call_start_before_unix?: number;
  call_start_after_unix?: number;
}

export interface Metrics {
  numberOfCalls: number;
  avgDuration: string;
  totalCost: number;
  avgCost: number;
  previousPeriodMetrics?: {
    numberOfCalls: number;
    avgDuration: string;
    totalCost: number;
    avgCost: number;
  };
}

// Helper function to format duration
function formatDuration(seconds: number): string {
  if (!seconds || seconds === 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export const metricsApi = {
  get: async (filters?: MetricsFilters) => {
    const params = new URLSearchParams();
    if (filters?.agent_id) params.append('agent_id', filters.agent_id);
    if (filters?.call_start_before_unix) params.append('call_start_before_unix', filters.call_start_before_unix.toString());
    if (filters?.call_start_after_unix) params.append('call_start_after_unix', filters.call_start_after_unix.toString());

    const queryString = params.toString();
    const endpoint = `/metrics${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<Metrics>(endpoint);
    return response;
  },
};

export interface ApiKey {
  id: number;
  key_type: 'private' | 'public';
  name: string;
  key_value: string;
  allowed_origins: string[];
  allowed_assistants: string[];
  transient_assistant: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateApiKeyParams {
  key_type: 'private' | 'public';
  name: string;
  allowed_origins?: string[];
  allowed_assistants?: string[];
  transient_assistant?: boolean;
}

export interface UpdateApiKeyParams {
  name?: string;
  allowed_origins?: string[];
  allowed_assistants?: string[];
  transient_assistant?: boolean;
}

export const apiKeysApi = {
  list: async () => {
    const response = await apiClient.get<ApiKey[]>('/api_keys');
    return response;
  },

  get: async (id: number) => {
    const response = await apiClient.get<ApiKey>(`/api_keys/${id}`);
    return response;
  },

  create: async (params: CreateApiKeyParams) => {
    const response = await apiClient.post<ApiKey>('/api_keys', {
      api_key: params,
    });
    return response;
  },

  update: async (id: number, params: UpdateApiKeyParams) => {
    const response = await apiClient.put<ApiKey>(`/api_keys/${id}`, {
      api_key: params,
    });
    return response;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/api_keys/${id}`);
    return response;
  },
};

// Phone Numbers API methods
export interface PhoneNumber {
  id: number;
  phone_number: string;
  label: string;
  provider: string;
  elevenlabs_phone_number_id?: string;
  agent_id?: number;
  agent_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AvailablePhoneNumber {
  phone_number: string;
  friendly_name?: string;
  region?: string;
  iso_country?: string;
  capabilities?: {
    voice?: boolean;
    sms?: boolean;
    mms?: boolean;
  };
  monthly_price?: string;
}

export interface CreatePhoneNumberParams {
  phone_number: string;
  label: string;
  provider: 'twilio' | 'manual';
  agent_id?: string;
  language?: string;
}

export interface UpdatePhoneNumberParams {
  agent_id?: string;
  label?: string;
}

export const phoneNumbersApi = {
  list: async () => {
    const response = await apiClient.get<PhoneNumber[]>('/phone_numbers');
    return response;
  },

  get: async (id: number) => {
    const response = await apiClient.get<PhoneNumber>(`/phone_numbers/${id}`);
    return response;
  },

  // Fetch phone numbers available in the user's Twilio account (already purchased, not assigned)
  getAccountNumbers: async () => {
    const response = await apiClient.get<AvailablePhoneNumber[]>('/phone_numbers/account');
    return response;
  },

  // Fetch available Twilio numbers for purchase
  getAvailable: async (countryCode?: string, areaCode?: string) => {
    const params = new URLSearchParams();
    if (countryCode) params.append('country_code', countryCode);
    if (areaCode) params.append('area_code', areaCode);
    
    const queryString = params.toString();
    const endpoint = `/phone_numbers/available${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<AvailablePhoneNumber[]>(endpoint);
    return response;
  },

  // Purchase and assign a phone number
  create: async (params: CreatePhoneNumberParams) => {
    // Send params at top level to match backend expectations
    const requestBody: any = {
      phone_number: params.phone_number,
      label: params.label,
      provider: params.provider,
    };
    if (params.agent_id) {
      requestBody.agent_id = params.agent_id;
    }
    if (params.language) {
      requestBody.language = params.language;
    }
    const response = await apiClient.post<PhoneNumber>('/phone_numbers', requestBody);
    return response;
  },

  update: async (id: number, params: UpdatePhoneNumberParams) => {
    // Send params at top level to match backend expectations
    const response = await apiClient.put<PhoneNumber>(`/phone_numbers/${id}`, {
      agent_id: params.agent_id,
      label: params.label,
    });
    return response;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/phone_numbers/${id}`);
    return response;
  },
};

// Campaigns API
export interface Campaign {
  id: number;
  name: string;
  status: string;
  elevenlabs_batch_call_id?: string;
  agent_id: number;
  agent_name?: string;
  phone_number_id: number;
  phone_number?: string;
  recipients_count: number;
  scheduled_at?: string;
  send_immediately: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCampaignParams {
  name: string;
  phone_number_ids: string[];
  manual_phone_numbers?: Array<{
    name: string;
    phone_number: string;
    language: string;
  }>;
  agent_id: string;
  send_immediately: boolean;
  schedule_date?: string;
  schedule_time?: string;
}

export const campaignsApi = {
  list: async () => {
    const response = await apiClient.get<Campaign[]>('/campaigns');
    return response;
  },

  get: async (id: number) => {
    const response = await apiClient.get<Campaign>(`/campaigns/${id}`);
    return response;
  },

  create: async (params: CreateCampaignParams) => {
    const formData = new FormData();
    formData.append('name', params.name);
    params.phone_number_ids.forEach(id => {
      formData.append('phone_number_ids[]', id);
    });
    if (params.manual_phone_numbers && params.manual_phone_numbers.length > 0) {
      formData.append('manual_phone_numbers', JSON.stringify(params.manual_phone_numbers));
    }
    formData.append('agent_id', params.agent_id);
    formData.append('send_immediately', params.send_immediately.toString());
    if (!params.send_immediately && params.schedule_date && params.schedule_time) {
      formData.append('schedule_date', params.schedule_date);
      formData.append('schedule_time', params.schedule_time);
    }

    const response = await apiClient.post<Campaign>('/campaigns', formData);
    return response;
  },
};

export interface Payment {
  id: number;
  amount_cents: string;
  amount_dollars: number;
  currency: string;
  status: string;
  description?: string;
  stripe_payment_intent_id: string;
  payment_method?: {
    id: number;
    last4: string;
    brand: string;
  };
  created_at: string;
}

export interface CreditTransaction {
  id: number;
  conversation_id: string;
  agent_name?: string;
  amount_cents: number;
  amount_dollars: number;
  created_at: string;
  duration_seconds?: number;
  message_count?: number;
  model_provider?: string;
  llm_model_name?: string;
  voice_name?: string;
  transport_type?: string;
  cost_breakdown: {
    hosting: number;
    transport: number;
    tts: number;
    stt: number;
    llm: number;
  };
}

export interface PaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
}

export interface CreatePaymentIntentParams {
  amount_cents: number;
  currency?: string;
}

export interface ConfirmPaymentParams {
  payment_intent_id: string;
  payment_method_id?: string;
  amount_cents: string;
  save_payment_method?: boolean;
}

export interface SavePaymentMethodParams {
  payment_method_id: string;
}

export const paymentsApi = {
  list: async () => {
    const response = await apiClient.get<Payment[]>('/payments');
    return response;
  },

  createIntent: async (params: CreatePaymentIntentParams) => {
    const response = await apiClient.post<PaymentIntentResponse>('/payments/create_intent', {
      amount_cents: params.amount_cents,
      currency: params.currency || 'usd',
    });
    return response;
  },

  confirm: async (params: ConfirmPaymentParams) => {
    const response = await apiClient.post<Payment>('/payments/confirm', {
      payment_intent_id: params.payment_intent_id,
      payment_method_id: params.payment_method_id,
      amount_cents: params.amount_cents,
      save_payment_method: params.save_payment_method || false,
    });
    return response;
  },

  saveMethod: async (params: SavePaymentMethodParams) => {
    const response = await apiClient.post('/payments/save_method', {
      payment_method_id: params.payment_method_id,
    });
    return response;
  },

  creditBalance: async () => {
    const response = await apiClient.get<{ 
      balance: number; 
      balance_cents: number;
      total_payments_cents: number;
      total_refunds_cents: number;
      total_deductions_cents: number;
    }>('/payments/credit_balance');
    return response;
  },

  creditTransactions: async (params?: { limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    const queryString = queryParams.toString();
    const endpoint = `/payments/credit_transactions${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<{
      transactions: CreditTransaction[];
      total: number;
    }>(endpoint);
    return response;
  },
};

// Secrets API methods (for ElevenLabs secrets management)
export interface ElevenLabsSecret {
  secret_id: string;
  name: string;
  created_at_unix_secs?: number;
}

export interface SecretsListResponse {
  secrets: ElevenLabsSecret[];
}

export interface CreateSecretParams {
  name: string;
  value: string;
}

export const secretsApi = {
  list: async () => {
    const response = await apiClient.get<SecretsListResponse>('/secrets');
    return response;
  },

  create: async (params: CreateSecretParams) => {
    const response = await apiClient.post<ElevenLabsSecret>('/secrets', {
      name: params.name,
      value: params.value,
    });
    return response;
  },

  delete: async (secretId: string) => {
    const response = await apiClient.delete(`/secrets/${secretId}`);
    return response;
  },
};

// Admin API types
export interface AdminUser {
  id: number;
  email: string;
  role: 'user' | 'admin' | 'enterprise';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  total_credits?: number;
  total_spent?: number;
}

export interface AdminAgent {
  id: number;
  name: string;
  user_id: number;
  user_email?: string;
  elevenlabs_agent_id?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  conversation_config?: Record<string, unknown>;
  client_tools?: Array<Record<string, unknown>>;
  webhook_tools?: Array<Record<string, unknown>>;
  integration_tools?: Record<string, { enabled: boolean; enabled_tools: string[] }>;
  phone_numbers?: Array<{
    id: number;
    phone_number: string;
    provider: string;
    elevenlabs_phone_number_id?: string;
  }>;
}

export interface AdminIntegration {
  id: number;
  user_id: number;
  user_email?: string;
  integration_type: string;
  config?: Record<string, unknown>; // For user integrations
  enabled_tools?: string[]; // For agent integrations
  agent_id?: number; // For agent integrations
  agent_name?: string; // For agent integrations
  integration_category?: 'agent' | 'user'; // Added by backend when fetching all
  created_at: string;
  updated_at: string;
}

export interface AdminCampaign {
  id: number;
  name: string;
  user_id: number;
  agent_id: number;
  phone_number_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AdminPhoneNumber {
  id: number;
  phone_number: string;
  user_id: number;
  user_email?: string;
  agent_id?: number;
  agent_name?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AdminApiKey {
  id: number;
  user_id: number;
  user_email?: string;
  key_type: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_more: boolean;
}

export const adminApi = {
  users: {
    list: async (params?: { page?: number; per_page?: number }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
      const queryString = queryParams.toString();
      const endpoint = `/admin/users${queryString ? `?${queryString}` : ''}`;
      const response = await apiClient.get<{
        data: AdminUser[];
        pagination: PaginationMeta;
      }>(endpoint);
      return response;
    },
    show: async (id: number) => {
      const response = await apiClient.get<{ data: AdminUser }>(`/admin/users/${id}`);
      return response;
    },
    update: async (id: number, data: { role?: 'user' | 'admin' | 'enterprise'; email?: string }) => {
      const response = await apiClient.put<{ data: AdminUser }>(`/admin/users/${id}`, {
        user: data,
      });
      return response;
    },
    destroy: async (id: number) => {
      const response = await apiClient.delete(`/admin/users/${id}`);
      return response;
    },
  },
  agents: {
    list: async (params?: { page?: number; per_page?: number }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
      const queryString = queryParams.toString();
      const endpoint = `/admin/agents${queryString ? `?${queryString}` : ''}`;
      const response = await apiClient.get<{
        data: AdminAgent[];
        pagination: PaginationMeta;
      }>(endpoint);
      return response;
    },
    show: async (id: number) => {
      const response = await apiClient.get<{ data: AdminAgent }>(`/admin/agents/${id}`);
      return response;
    },
  },
  conversations: {
    list: async (params?: { page?: number; per_page?: number }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
      const queryString = queryParams.toString();
      const endpoint = `/admin/conversations${queryString ? `?${queryString}` : ''}`;
      const response = await apiClient.get<{ data: unknown[] }>(endpoint);
      return response;
    },
    show: async (id: string) => {
      const response = await apiClient.get<{ data: unknown }>(`/admin/conversations/${id}`);
      return response;
    },
  },
  integrations: {
    list: async (params?: { page?: number; per_page?: number; type?: 'agent' | 'user' }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params?.type) queryParams.append('type', params.type);
      const queryString = queryParams.toString();
      const endpoint = `/admin/integrations${queryString ? `?${queryString}` : ''}`;
      const response = await apiClient.get<{
        data: AdminIntegration[];
        pagination: PaginationMeta;
      }>(endpoint);
      return response;
    },
    show: async (id: number) => {
      const response = await apiClient.get<{ data: AdminIntegration }>(`/admin/integrations/${id}`);
      return response;
    },
  },
  campaigns: {
    list: async (params?: { page?: number; per_page?: number }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
      const queryString = queryParams.toString();
      const endpoint = `/admin/campaigns${queryString ? `?${queryString}` : ''}`;
      const response = await apiClient.get<{
        data: AdminCampaign[];
        pagination: PaginationMeta;
      }>(endpoint);
      return response;
    },
    show: async (id: number) => {
      const response = await apiClient.get<{ data: AdminCampaign }>(`/admin/campaigns/${id}`);
      return response;
    },
  },
  phoneNumbers: {
    list: async (params?: { page?: number; per_page?: number }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
      const queryString = queryParams.toString();
      const endpoint = `/admin/phone_numbers${queryString ? `?${queryString}` : ''}`;
      const response = await apiClient.get<{
        data: AdminPhoneNumber[];
        pagination: PaginationMeta;
      }>(endpoint);
      return response;
    },
    show: async (id: number) => {
      const response = await apiClient.get<{ data: AdminPhoneNumber }>(`/admin/phone_numbers/${id}`);
      return response;
    },
  },
  apiKeys: {
    list: async (params?: { page?: number; per_page?: number }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
      const queryString = queryParams.toString();
      const endpoint = `/admin/api_keys${queryString ? `?${queryString}` : ''}`;
      const response = await apiClient.get<{
        data: AdminApiKey[];
        pagination: PaginationMeta;
      }>(endpoint);
      return response;
    },
    show: async (id: number) => {
      const response = await apiClient.get<{ data: AdminApiKey }>(`/admin/api_keys/${id}`);
      return response;
    },
  },
  payments: {
    list: async (params?: { page?: number; per_page?: number; user_id?: number }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
      const queryString = queryParams.toString();
      const endpoint = `/admin/payments${queryString ? `?${queryString}` : ''}`;
      const response = await apiClient.get<{
        data: unknown[];
        pagination: PaginationMeta;
      }>(endpoint);
      return response;
    },
    show: async (id: number) => {
      const response = await apiClient.get<{ data: unknown }>(`/admin/payments/${id}`);
      return response;
    },
  },
  creditTransactions: {
    list: async (params?: { page?: number; per_page?: number; user_id?: number; transaction_type?: 'deduction' | 'refund' }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
      if (params?.transaction_type) queryParams.append('transaction_type', params.transaction_type);
      const queryString = queryParams.toString();
      const endpoint = `/admin/credit_transactions${queryString ? `?${queryString}` : ''}`;
      const response = await apiClient.get<{
        data: unknown[];
        pagination: PaginationMeta;
        summary?: {
          total_deductions_cents: number;
          total_deductions_dollars: number;
          total_refunds_cents: number;
          total_refunds_dollars: number;
          total_spending_cents: number;
          total_spending_dollars: number;
          net_balance_cents: number;
          net_balance_dollars: number;
        };
      }>(endpoint);
      return response;
    },
    show: async (id: number) => {
      const response = await apiClient.get<{ data: unknown }>(`/admin/credit_transactions/${id}`);
      return response;
    },
  },
  templates: {
    list: async () => {
      const response = await apiClient.get<AgentTemplate[]>('/admin/agent_templates');
      return response;
    },
    show: async (id: number) => {
      const response = await apiClient.get<{ data: AgentTemplate }>(`/admin/agent_templates/${id}`);
      return response;
    },
    create: async (data: Omit<AgentTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await apiClient.post<{ data: AgentTemplate }>('/admin/agent_templates', {
        agent_template: data,
      });
      return response;
    },
    update: async (id: number, data: Partial<Omit<AgentTemplate, 'id' | 'created_at' | 'updated_at'>>) => {
      const response = await apiClient.put<{ data: AgentTemplate }>(`/admin/agent_templates/${id}`, {
        agent_template: data,
      });
      return response;
    },
    destroy: async (id: number) => {
      const response = await apiClient.delete(`/admin/agent_templates/${id}`);
      return response;
    },
  },
  behaviours: {
    list: async () => {
      // Try user-level endpoint first, fallback to admin only for 404 (not 403 - permission denied)
      try {
        const response = await apiClient.get<AgentBehaviour[]>('/agent_behaviours');
        return response;
      } catch (error: any) {
        // Only fallback to admin endpoint if user endpoint returns 404 (not found)
        // Don't fallback on 403 (forbidden) - that means user doesn't have permission
        if (error?.response?.status === 404) {
          try {
            const response = await apiClient.get<AgentBehaviour[]>('/admin/agent_behaviours');
            return response;
          } catch (adminError: any) {
            // If admin endpoint also fails, throw the original error
            throw error;
          }
        }
        throw error;
      }
    },
    show: async (id: number) => {
      // Try user-level endpoint first, fallback to admin only for 404 (not 403 - permission denied)
      try {
        const response = await apiClient.get<AgentBehaviour>(`/agent_behaviours/${id}`);
        return response;
      } catch (error: any) {
        // Only fallback to admin endpoint if user endpoint returns 404 (not found)
        // Don't fallback on 403 (forbidden) - that means user doesn't have permission
        if (error?.response?.status === 404) {
          try {
            const response = await apiClient.get<AgentBehaviour>(`/admin/agent_behaviours/${id}`);
            return response;
          } catch (adminError: any) {
            // If admin endpoint also fails, throw the original error
            throw error;
          }
        }
        throw error;
      }
    },
    create: async (data: Omit<AgentBehaviour, 'id' | 'created_at' | 'updated_at'> & { sections?: Omit<AgentBehaviourSection, 'id'>[] }) => {
      const response = await apiClient.post<{ data: AgentBehaviour }>('/admin/agent_behaviours', {
        agent_behaviour: data,
      });
      return response;
    },
    update: async (id: number, data: Partial<Omit<AgentBehaviour, 'id' | 'created_at' | 'updated_at'>> & { sections?: Omit<AgentBehaviourSection, 'id'>[] }) => {
      const response = await apiClient.put<{ data: AgentBehaviour }>(`/admin/agent_behaviours/${id}`, {
        agent_behaviour: data,
      });
      return response;
    },
    destroy: async (id: number) => {
      const response = await apiClient.delete(`/admin/agent_behaviours/${id}`);
      return response;
    },
  },
};

// Outcome Definitions API
export const outcomeDefinitionsApi = {
  get: async (agentId: string | number) => {
    const response = await apiClient.get<{ data: OutcomeDefinition }>(`/agents/${agentId}/outcome_definition`);
    return response;
  },
  create: async (agentId: string | number, data: Omit<OutcomeDefinition, 'id' | 'agent_id' | 'created_at' | 'updated_at' | 'outcome_type'>) => {
    const response = await apiClient.post<{ data: OutcomeDefinition }>(`/agents/${agentId}/outcome_definition`, {
      outcome_definition: data,
    });
    return response;
  },
  update: async (agentId: string | number, data: Partial<Omit<OutcomeDefinition, 'id' | 'agent_id' | 'created_at' | 'updated_at' | 'outcome_type'>>) => {
    const response = await apiClient.put<{ data: OutcomeDefinition }>(`/agents/${agentId}/outcome_definition`, {
      outcome_definition: data,
    });
    return response;
  },
  delete: async (agentId: string | number) => {
    const response = await apiClient.delete(`/agents/${agentId}/outcome_definition`);
    return response;
  },
};

// Conversation Outcomes API
export const conversationOutcomesApi = {
  get: async (conversationId: string) => {
    const response = await apiClient.get<ConversationOutcome>(`/conversations/${conversationId}/outcome`);
    return response;
  },
  update: async (conversationId: string, data: Partial<Pick<ConversationOutcome, 'outcome' | 'reason_code' | 'expected_outcome' | 'actual_outcome' | 'notes'>>) => {
    const response = await apiClient.patch<ConversationOutcome>(`/conversations/${conversationId}/outcome`, {
      conversation_outcome: data,
    });
    return response;
  },
};

// Escalations API
export const escalationsApi = {
  list: async (filters?: { agent_id?: string | number; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.agent_id) params.append('agent_id', filters.agent_id.toString());
    if (filters?.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const endpoint = `/escalations${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<{ data: HumanHandoffEvent[] }>(endpoint);
    return response;
  },
  show: async (id: number) => {
    const response = await apiClient.get<{ data: HumanHandoffEvent }>(`/escalations/${id}`);
    return response;
  },
  update: async (id: number, data: Partial<Pick<HumanHandoffEvent, 'handoff_status' | 'handled_by'>>) => {
    const response = await apiClient.patch<{ data: HumanHandoffEvent }>(`/escalations/${id}`, {
      handoff_event: data,
    });
    return response;
  },
  escalate: async (conversationId: string) => {
    const response = await apiClient.post(`/conversations/${conversationId}/escalate`);
    return response;
  },
};

// Failure Reasons API
export const failureReasonsApi = {
  list: async (filters?: { agent_id?: string | number; category?: string; reason_code?: string }) => {
    const params = new URLSearchParams();
    if (filters?.agent_id) params.append('agent_id', filters.agent_id.toString());
    if (filters?.category) params.append('category', filters.category);
    if (filters?.reason_code) params.append('reason_code', filters.reason_code);
    
    const queryString = params.toString();
    const endpoint = `/failure_reasons${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<{ data: FailureReason[] }>(endpoint);
    return response;
  },
};

// Dashboards API
export const dashboardsApi = {
  support: async (filters?: { agent_id?: string | number; start_date?: string; end_date?: string }) => {
    const params = new URLSearchParams();
    if (filters?.agent_id) params.append('agent_id', filters.agent_id.toString());
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    
    const queryString = params.toString();
    const endpoint = `/dashboards/support${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<{ data: SupportDashboardData }>(endpoint);
    return response;
  },
  sales: async (filters?: { agent_id?: string | number; start_date?: string; end_date?: string }) => {
    const params = new URLSearchParams();
    if (filters?.agent_id) params.append('agent_id', filters.agent_id.toString());
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    
    const queryString = params.toString();
    const endpoint = `/dashboards/sales${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<{ data: SalesDashboardData }>(endpoint);
    return response;
  },
  failureBreakdown: async (filters?: { agent_id?: string | number; start_date?: string; end_date?: string }) => {
    const params = new URLSearchParams();
    if (filters?.agent_id) params.append('agent_id', filters.agent_id.toString());
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    
    const queryString = params.toString();
    const endpoint = `/dashboards/failure_breakdown${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<{ data: FailureBreakdownData[] }>(endpoint);
    return response;
  },
};

// Business Goals API
export interface BusinessGoal {
  id: number;
  name: string;
  description: string;
  success_criteria: Record<string, any>;
  avg_cost_per_success: number;
  typical_roi: number;
  default_config: Record<string, any>;
  required_integrations: string[];
  active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export const businessGoalsApi = {
  list: async () => {
    const response = await apiClient.get<{ data: BusinessGoal[] }>('/business_goals');
    return response;
  },
  get: async (id: number) => {
    const response = await apiClient.get<{ data: BusinessGoal }>(`/business_goals/${id}`);
    return response;
  },
};

// Enhanced Metrics API for Agents
export interface AgentMetrics {
  roi: {
    period: { start_date: string; end_date: string; days: number };
    calls: { total: number; successful: number; escalated: number; failed: number };
    success_rate: number;
    escalation_rate: number;
    costs: { total: number; cost_per_success: number; avg_cost_per_call: number; total_cents: number };
    revenue: { estimated: number; revenue_per_success: number };
    roi: { percentage: number; multiplier: number };
    savings: { vs_human: number; human_cost_for_period: number };
  };
  performance: {
    summary: { total_calls: number; successful: number; escalated: number; failed: number; success_rate: number; escalation_rate: number };
    averages: { duration: { success: number; escalated: number; failed: number }; cost: { success: number; escalated: number; failed: number } };
    escalation_analysis: { total: number; rate: number; top_reasons: Array<{ reason: string; count: number; percentage: number }>; avg_cost: number };
    trends: Array<{ date: string; total: number; successful: number; success_rate: number }>;
    insights: { whats_working: Array<any>; needs_improvement: Array<any> };
  };
}

export interface AgentROI {
  period: { start_date: string; end_date: string; days: number };
  calls: { total: number; successful: number; escalated: number; failed: number };
  success_rate: number;
  escalation_rate: number;
  costs: { total: number; cost_per_success: number; avg_cost_per_call: number; total_cents: number };
  revenue: { estimated: number; revenue_per_success: number };
  roi: { percentage: number; multiplier: number };
  savings: { vs_human: number; human_cost_for_period: number };
}

export interface OptimizationSuggestion {
  priority: 'high' | 'medium';
  category: string;
  title: string;
  description: string;
  impact: string;
  estimated_savings?: number;
  setup_time: string;
  action: string;
}

export const agentMetricsApi = {
  getMetrics: async (agentId: string | number, filters?: { start_date?: string; end_date?: string }) => {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    
    const queryString = params.toString();
    const endpoint = `/agents/${agentId}/metrics${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<{ data: AgentMetrics }>(endpoint);
    return response;
  },
  getROI: async (agentId: string | number, filters?: { start_date?: string; end_date?: string }) => {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    
    const queryString = params.toString();
    const endpoint = `/agents/${agentId}/roi${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<AgentROI>(endpoint);
    return response;
  },
  getPerformance: async (agentId: string | number, filters?: { start_date?: string; end_date?: string }) => {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    
    const queryString = params.toString();
    const endpoint = `/agents/${agentId}/performance${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<{ data: any }>(endpoint);
    return response;
  },
  getEscalations: async (agentId: string | number, filters?: { start_date?: string; end_date?: string }) => {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    
    const queryString = params.toString();
    const endpoint = `/agents/${agentId}/escalations${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<{ data: any }>(endpoint);
    return response;
  },
  getOptimizationSuggestions: async (agentId: string | number, filters?: { start_date?: string; end_date?: string }) => {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    
    const queryString = params.toString();
    const endpoint = `/agents/${agentId}/optimization_suggestions${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<{ data: { high_impact: OptimizationSuggestion[]; medium_impact: OptimizationSuggestion[] } }>(endpoint);
    return response;
  },
};
