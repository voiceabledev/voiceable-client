import type { UserIntegration, IntegrationSchema, IntegrationConfig } from '@/types/integrations';

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
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Check for runtime config (useful for Heroku where env vars might not be available at build time)
  if (typeof window !== 'undefined') {
    // Check if there's a runtime config set via a script tag or global variable
    const runtimeConfig = (window as any).__API_BASE_URL__;
    if (runtimeConfig) {
      return runtimeConfig;
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
    const url = `${this.baseURL}${endpoint}`;
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
      data = await response.json();
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
    const response = await fetch(`${API_BASE_URL}/auth/sign_in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        user: { email, password },
      }),
    });

    const data = await response.json();
    
    // Extract JWT token from response
    if (data.token) {
      apiClient.setToken(data.token);
    }

    // Also check Authorization header
    const authHeader = response.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      apiClient.setToken(token);
    }

    if (!response.ok) {
      throw new Error(data.status?.message || 'An error occurred');
    }

    return data;
  },

  signOut: async () => {
    const response = await apiClient.delete('/auth/sign_out');
    apiClient.setToken(null);
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
}

export interface UpdateAgentParams {
  name?: string;
  conversation_config?: Record<string, unknown>;
  platform_settings?: Record<string, unknown>;
  widget_config?: WidgetConfig;
  tags?: string[];
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
    // Fetch conversations for the current period
    // Use pagination to get all conversations
    const currentFilters: ConversationFilters = {
      page_size: 100, // Reasonable page size
      agent_id: filters?.agent_id,
      call_start_before_unix: filters?.call_start_before_unix,
      call_start_after_unix: filters?.call_start_after_unix,
      summary_mode: 'include',
    };

    let allConversations: Conversation[] = [];
    let cursor: string | undefined = undefined;
    let hasMore = true;

    // Fetch all conversations using pagination
    try {
      while (hasMore) {
        const response = await conversationsApi.list({
          ...currentFilters,
          cursor,
        });

        if (response.data) {
          allConversations = [...allConversations, ...response.data];
          
          // Check if there are more pages
          // Note: The response might not have has_more, so we'll check cursor
          const responseWithCursor = response as ApiResponse<Conversation[]> & { cursor?: string; has_more?: boolean };
          cursor = responseWithCursor.cursor;
          hasMore = !!cursor && response.data.length === currentFilters.page_size;
          
          // Safety limit: don't fetch more than 10,000 conversations
          if (allConversations.length >= 10000) {
            break;
          }
        } else {
          hasMore = false;
        }
      }
    } catch (error) {
      // If there's an error (e.g., no API key, API error), return empty metrics
      console.error('Error fetching conversations for metrics:', error);
      return {
        status: { code: 200, message: 'Metrics retrieved successfully.' },
        data: {
          numberOfCalls: 0,
          avgDuration: '0:00',
          totalCost: 0,
          avgCost: 0,
        },
      };
    }

    const conversations = allConversations;
    
    // Calculate metrics
    const numberOfCalls = conversations.length;
    
    // Parse durations and calculate average
    let totalDurationSecs = 0;
    let validDurations = 0;
    
    conversations.forEach((conv) => {
      // Try to get duration from metadata first
      const durationSecs = 
        (conv.metadata?.call_duration_secs as number) ||
        (conv.metadata?.['call_duration_secs'] as number);
      
      if (durationSecs && typeof durationSecs === 'number') {
        totalDurationSecs += durationSecs;
        validDurations++;
      } else if (conv.duration) {
        // Parse formatted duration string (e.g., "5:30")
        const parts = conv.duration.split(':');
        if (parts.length === 2) {
          const minutes = parseInt(parts[0], 10) || 0;
          const seconds = parseInt(parts[1], 10) || 0;
          const totalSecs = minutes * 60 + seconds;
          totalDurationSecs += totalSecs;
          validDurations++;
        }
      }
    });

    const avgDurationSecs = validDurations > 0 ? totalDurationSecs / validDurations : 0;
    const avgDuration = formatDuration(avgDurationSecs);

    // Calculate costs from credits if available
    let totalCost = 0;
    conversations.forEach((conv) => {
      // Check for credits in metadata
      const credits = conv.metadata?.credits as { call?: number; llm?: number } | undefined;
      if (credits) {
        const callCredits = credits.call || 0;
        const llmCredits = credits.llm || 0;
        totalCost += callCredits + llmCredits;
      }
    });

    const avgCost = numberOfCalls > 0 ? totalCost / numberOfCalls : 0;

    return {
      status: { code: 200, message: 'Metrics retrieved successfully.' },
      data: {
        numberOfCalls,
        avgDuration,
        totalCost,
        avgCost,
      },
    };
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
  provider: 'twilio';
  agent_id?: string;
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
    const response = await apiClient.post<PhoneNumber>('/phone_numbers', {
      phone_number: params.phone_number,
      label: params.label,
      provider: params.provider,
      agent_id: params.agent_id,
    });
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
  phone_number_id: string;
  agent_id: string;
  recipients_file: File;
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
    formData.append('phone_number_id', params.phone_number_id);
    formData.append('agent_id', params.agent_id);
    formData.append('recipients_file', params.recipients_file);
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
    const response = await apiClient.get<{ balance: number; balance_cents: number }>('/payments/credit_balance');
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
