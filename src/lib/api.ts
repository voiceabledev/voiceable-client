import type { UserIntegration, IntegrationSchema, IntegrationConfig } from '@/types/integrations';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

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
      const errorMessage = data.status?.message || (Array.isArray(data.errors) ? data.errors.join(', ') : 'An error occurred');
      throw new Error(errorMessage);
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

export interface Agent {
  id: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  conversation_config?: Record<string, unknown>;
  platform_settings?: Record<string, unknown>;
  published?: boolean;
  published_at?: string;
  elevenlabs_agent_id?: string;
  version?: number;
}

export interface CreateAgentParams {
  name: string;
  conversation_config?: Record<string, unknown>;
  platform_settings?: Record<string, unknown>;
  tags?: string[];
}

export interface UpdateAgentParams {
  name?: string;
  conversation_config?: Record<string, unknown>;
  platform_settings?: Record<string, unknown>;
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
    const requestBody: any = {
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
};
