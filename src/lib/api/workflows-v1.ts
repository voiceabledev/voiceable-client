import { apiClient } from '@/lib/api';
import type { WorkflowV1 } from '@/types/workflow-v1';

export interface WorkflowListResponse {
  workflows: WorkflowV1[];
  total?: number;
}

export interface CreateWorkflowParams {
  name: string;
  description?: string;
  nodes?: WorkflowV1['nodes'];
  connections?: WorkflowV1['connections'];
  greetingMessage?: string;
  context?: string;
  memories?: Array<{ id: string; content: string }>;
  defaultModel?: string;
  safeMode?: boolean;
}

export interface UpdateWorkflowParams {
  name?: string;
  description?: string;
  nodes?: WorkflowV1['nodes'];
  connections?: WorkflowV1['connections'];
  status?: WorkflowV1['status'];
  greetingMessage?: string;
  context?: string;
  memories?: Array<{ id: string; content: string }>;
  defaultModel?: string;
  safeMode?: boolean;
}

export const workflowsV1Api = {
  list: async (): Promise<WorkflowListResponse> => {
    const response = await apiClient.get<WorkflowV1[]>('/workflows');
    // Transform response to match expected format
    return {
      workflows: Array.isArray(response.data) ? response.data : [],
      total: Array.isArray(response.data) ? response.data.length : 0
    };
  },

  get: async (id: string): Promise<WorkflowV1> => {
    // URL encode the ID to handle special characters like colons
    const encodedId = encodeURIComponent(id);
    const response = await apiClient.get<WorkflowV1>(`/workflows/${encodedId}`);
    if (!response.data) {
      throw new Error('Workflow not found');
    }
    return response.data;
  },

  create: async (params: CreateWorkflowParams): Promise<WorkflowV1> => {
    const response = await apiClient.post<WorkflowV1>('/workflows', {
      workflow: {
        name: params.name,
        description: params.description,
        nodes: params.nodes || [],
        connections: params.connections || [],
        greetingMessage: params.greetingMessage,
        context: params.context,
        memories: params.memories,
        defaultModel: params.defaultModel,
        safeMode: params.safeMode,
        status: 'draft'
      }
    });
    if (!response.data) {
      throw new Error('Failed to create workflow');
    }
    return response.data;
  },

  update: async (id: string, params: UpdateWorkflowParams): Promise<WorkflowV1> => {
    // URL encode the ID to handle special characters like colons
    const encodedId = encodeURIComponent(id);
    const response = await apiClient.put<WorkflowV1>(`/workflows/${encodedId}`, {
      workflow: params
    });
    if (!response.data) {
      throw new Error('Failed to update workflow');
    }
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    // URL encode the ID to handle special characters like colons
    const encodedId = encodeURIComponent(id);
    await apiClient.delete(`/workflows/${encodedId}`);
  },

  publish: async (id: string): Promise<WorkflowV1> => {
    // URL encode the ID to handle special characters like colons
    const encodedId = encodeURIComponent(id);
    const response = await apiClient.post<WorkflowV1>(`/workflows/${encodedId}/publish`, {});
    if (!response.data) {
      throw new Error('Failed to publish workflow');
    }
    return response.data;
  }
};

