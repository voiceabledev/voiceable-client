import { useState, useCallback } from 'react';
import { outcomeDefinitionsApi } from '@/lib/api';
import type { OutcomeDefinition } from '@/types/outcomes';
import { useToast } from '@/hooks/use-toast';

// Type guard to check if an object is an OutcomeDefinition
const isOutcomeDefinition = (obj: unknown): obj is OutcomeDefinition => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'agent_id' in obj &&
    'primary_outcome' in obj
  );
};

// Helper to extract OutcomeDefinition from API response
// The API returns { status: {...}, data: {...} } where data might be:
// - null (when no outcome definition exists)
// - { outcome_definition: {...} } (from ActiveModel::Serializer)
// - OutcomeDefinition directly (if serializer returns it directly)
const extractOutcomeDefinition = (responseData: unknown): OutcomeDefinition | null => {
  if (!responseData || typeof responseData !== 'object') {
    return null;
  }

  const data = responseData as { data?: unknown; outcome_definition?: unknown; [key: string]: unknown };
  
  // Check if data.data exists and is an OutcomeDefinition
  if ('data' in data && data.data !== null && data.data !== undefined) {
    if (isOutcomeDefinition(data.data)) {
      return data.data;
    }
    // If data.data is an object, check if it has outcome_definition nested
    if (typeof data.data === 'object' && data.data !== null && 'outcome_definition' in data.data) {
      const nested = (data.data as { outcome_definition: unknown }).outcome_definition;
      if (isOutcomeDefinition(nested)) {
        return nested;
      }
    }
  }
  
  // Check if outcome_definition is at the top level
  if ('outcome_definition' in data && isOutcomeDefinition(data.outcome_definition)) {
    return data.outcome_definition;
  }
  
  // Check if the response itself is an OutcomeDefinition
  if (isOutcomeDefinition(data)) {
    return data;
  }
  
  return null;
};

export function useOutcomeDefinition(agentId: string | undefined) {
  const { toast } = useToast();
  const [outcomeDefinition, setOutcomeDefinition] = useState<OutcomeDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchOutcomeDefinition = useCallback(async () => {
    if (!agentId) return;

    setLoading(true);
    try {
      const response = await outcomeDefinitionsApi.get(agentId);
      // The API returns { status: {...}, data: OutcomeDefinition | null }
      // If no outcome definition exists, data will be null (200 response, not 404)
      const outcomeData = extractOutcomeDefinition(response.data);
      setOutcomeDefinition(outcomeData);
    } catch (error: unknown) {
      // Handle any unexpected errors (404 should no longer occur, but keep for backwards compatibility)
      const errorWithResponse = error as { response?: { status?: number }; status?: number };
      const status = errorWithResponse?.response?.status || errorWithResponse?.status;
      if (status !== 404) {
        console.error('Error fetching outcome definition:', error);
        toast({
          title: 'Error',
          description: 'Failed to load success criteria.',
          variant: 'destructive',
        });
      }
      setOutcomeDefinition(null);
    } finally {
      setLoading(false);
    }
  }, [agentId, toast]);

  const createOutcomeDefinition = useCallback(async (data: Omit<OutcomeDefinition, 'id' | 'agent_id' | 'created_at' | 'updated_at' | 'outcome_type'>) => {
    if (!agentId) {
      throw new Error('Agent ID is required');
    }

    setSaving(true);
    try {
      console.log('Creating outcome definition with data:', data);
      const response = await outcomeDefinitionsApi.create(agentId, data);
      console.log('Create API response:', response);
      console.log('Response data:', response.data);
      
      const outcomeData = extractOutcomeDefinition(response.data);
      if (outcomeData) {
        console.log('Setting outcome definition:', outcomeData);
        setOutcomeDefinition(outcomeData);
        toast({
          title: 'Success',
          description: 'Success criteria created successfully.',
        });
        return outcomeData;
      } else {
        console.error('Unexpected response structure. Full response:', JSON.stringify(response, null, 2));
        throw new Error('No data returned from API. Response: ' + JSON.stringify(response.data));
      }
    } catch (error: unknown) {
      console.error('Error creating outcome definition:', error);
      const errorWithResponse = error as { response?: { data?: { errors?: unknown; status?: { message?: string } } }; message?: string };
      const message = errorWithResponse?.response?.data?.errors || 
                     errorWithResponse?.response?.data?.status?.message || 
                     errorWithResponse?.message || 
                     'Failed to create success criteria.';
      toast({
        title: 'Error',
        description: Array.isArray(message) ? message.join(', ') : (typeof message === 'string' ? message : 'Failed to create success criteria.'),
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  }, [agentId, toast]);

  const updateOutcomeDefinition = useCallback(async (data: Partial<Omit<OutcomeDefinition, 'id' | 'agent_id' | 'created_at' | 'updated_at' | 'outcome_type'>>) => {
    if (!agentId) {
      throw new Error('Agent ID is required');
    }

    setSaving(true);
    try {
      console.log('Updating outcome definition with data:', data);
      const response = await outcomeDefinitionsApi.update(agentId, data);
      console.log('Update API response:', response);
      console.log('Response data:', response.data);
      
      const outcomeData = extractOutcomeDefinition(response.data);
      if (outcomeData) {
        console.log('Setting outcome definition:', outcomeData);
        setOutcomeDefinition(outcomeData);
        toast({
          title: 'Success',
          description: 'Success criteria updated successfully.',
        });
        return outcomeData;
      } else {
        console.error('Unexpected response structure. Full response:', JSON.stringify(response, null, 2));
        throw new Error('No data returned from API. Response: ' + JSON.stringify(response.data));
      }
    } catch (error: unknown) {
      console.error('Error updating outcome definition:', error);
      const errorWithResponse = error as { response?: { data?: { errors?: unknown; status?: { message?: string } } }; message?: string };
      const message = errorWithResponse?.response?.data?.errors || 
                     errorWithResponse?.response?.data?.status?.message || 
                     errorWithResponse?.message || 
                     'Failed to update success criteria.';
      toast({
        title: 'Error',
        description: Array.isArray(message) ? message.join(', ') : (typeof message === 'string' ? message : 'Failed to update success criteria.'),
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  }, [agentId, toast]);

  const deleteOutcomeDefinition = useCallback(async () => {
    if (!agentId) {
      throw new Error('Agent ID is required');
    }

    setSaving(true);
    try {
      console.log('Deleting outcome definition for agent:', agentId);
      await outcomeDefinitionsApi.delete(agentId);
      // Set to null immediately to update UI
      setOutcomeDefinition(null);
      // Refetch to ensure we're in sync with server
      await fetchOutcomeDefinition();
      toast({
        title: 'Success',
        description: 'Success criteria deleted successfully.',
      });
    } catch (error: unknown) {
      console.error('Error deleting outcome definition:', error);
      const errorWithResponse = error as { response?: { data?: { status?: { message?: string } } }; message?: string };
      const message = errorWithResponse?.response?.data?.status?.message || 
                     errorWithResponse?.message || 
                     'Failed to delete success criteria.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  }, [agentId, toast, fetchOutcomeDefinition]);

  return {
    outcomeDefinition,
    loading,
    saving,
    fetchOutcomeDefinition,
    createOutcomeDefinition,
    updateOutcomeDefinition,
    deleteOutcomeDefinition,
  };
}

