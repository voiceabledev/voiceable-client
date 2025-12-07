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
      'Content-Type': 'application/json',
      ...options.headers,
    };

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

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
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
