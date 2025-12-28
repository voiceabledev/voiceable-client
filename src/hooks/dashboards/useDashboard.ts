import { useState, useEffect, useCallback } from 'react';
import { dashboardsApi, type SupportDashboardData, type SalesDashboardData, type FailureBreakdownData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface DashboardFilters {
  agent_id?: string | number;
  start_date?: string;
  end_date?: string;
}

export function useSupportDashboard(filters?: DashboardFilters) {
  const { toast } = useToast();
  const [data, setData] = useState<SupportDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await dashboardsApi.support(filters);
      if (response.data?.data) {
        setData(response.data.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load support dashboard data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}

export function useSalesDashboard(filters?: DashboardFilters) {
  const { toast } = useToast();
  const [data, setData] = useState<SalesDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await dashboardsApi.sales(filters);
      if (response.data?.data) {
        setData(response.data.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load sales dashboard data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}

export function useFailureBreakdown(filters?: DashboardFilters) {
  const { toast } = useToast();
  const [data, setData] = useState<FailureBreakdownData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await dashboardsApi.failureBreakdown(filters);
      if (response.data?.data) {
        setData(response.data.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load failure breakdown data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}

