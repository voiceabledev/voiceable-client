"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { integrationsApi } from '@/lib/api';
import type { UserIntegration } from '@/types/integrations';
import {
  getAllIntegrationProviders,
  getIntegrationsByCategory,
  getCategoryDisplayName,
  type IntegrationProvider,
  type IntegrationCategory,
} from '@/constants/integrations';
import {
  IntegrationCard,
  type IntegrationCardStatus,
} from '@/components/integrations/IntegrationCard';

export default function IntegrationLibrary() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [userIntegrations, setUserIntegrations] = useState<UserIntegration[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);
  const [connectingIntegration, setConnectingIntegration] = useState<string | null>(null);

  // Load connected integrations
  useEffect(() => {
    const loadUserIntegrations = async () => {
      try {
        setLoadingIntegrations(true);
        const response = await integrationsApi.list();
        if (response.data) {
          setUserIntegrations(response.data);
        }
      } catch (error) {
        console.error('Error loading user integrations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your integrations.',
          variant: 'destructive',
        });
      } finally {
        setLoadingIntegrations(false);
      }
    };

    loadUserIntegrations();
  }, [toast]);

  // Get integration status
  const getIntegrationStatus = (integrationId: string): IntegrationCardStatus => {
    if (connectingIntegration === integrationId) {
      return 'connecting';
    }

    const userIntegration = userIntegrations.find(
      (ui) => ui.integration_type === integrationId
    );

    if (userIntegration) {
      return 'connected';
    }

    return 'available';
  };

  // Get user integration for a provider
  const getUserIntegration = (integrationId: string): UserIntegration | null => {
    return userIntegrations.find((ui) => ui.integration_type === integrationId) || null;
  };

  // Handle connect integration
  const handleConnect = async (integrationId: string) => {
    setConnectingIntegration(integrationId);
    // Navigate to integration settings page for connection
    // The new QuickConnectModal can be used here in the future
    router.push(`/settings/integrations/${integrationId}`);
  };

  // Handle manage integration
  const handleManage = (integrationId: string) => {
    router.push(`/settings/integrations/${integrationId}`);
  };

  // Filter providers by search query
  const filterProviders = (providers: IntegrationProvider[]) => {
    if (!searchQuery) return providers;

    const query = searchQuery.toLowerCase();
    return providers.filter(
      (provider) =>
        provider.name.toLowerCase().includes(query) ||
        provider.description.toLowerCase().includes(query) ||
        provider.capabilities?.some((cap) => cap.toLowerCase().includes(query))
    );
  };

  // Group integrations by category
  const integrationsByCategory = getIntegrationsByCategory();

  // Filter and sort categories
  const categories = Object.keys(integrationsByCategory) as (IntegrationCategory | 'other')[];
  const filteredCategories = categories
    .map((category) => ({
      category,
      providers: filterProviders(integrationsByCategory[category]),
    }))
    .filter((item) => item.providers.length > 0)
    .sort((a, b) => {
      // Sort by: connected integrations first, then available, then upcoming
      const aHasConnected = a.providers.some((p) => getIntegrationStatus(p.id) === 'connected');
      const bHasConnected = b.providers.some((p) => getIntegrationStatus(p.id) === 'connected');
      const aHasAvailable = a.providers.some((p) => p.status === 'available');
      const bHasAvailable = b.providers.some((p) => p.status === 'available');

      if (aHasConnected && !bHasConnected) return -1;
      if (!aHasConnected && bHasConnected) return 1;
      if (aHasAvailable && !bHasAvailable) return -1;
      if (!aHasAvailable && bHasAvailable) return 1;

      return 0;
    });

  // Count stats
  const totalIntegrations = getAllIntegrationProviders().length;
  const connectedCount = userIntegrations.length;
  const availableCount = getAllIntegrationProviders().filter((p) => p.status === 'available')
    .length;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-zinc-900">Integrations</h1>
        <p className="text-zinc-600">
          Connect your favorite tools to automate workflows and enhance your voice agents.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-2xl font-bold text-zinc-900">{connectedCount}</div>
          <div className="text-sm text-zinc-600">Connected</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-2xl font-bold text-zinc-900">{availableCount}</div>
          <div className="text-sm text-zinc-600">Available Now</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-2xl font-bold text-zinc-900">{totalIntegrations}</div>
          <div className="text-sm text-zinc-600">Total Integrations</div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search integrations by name, description, or capability..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Integration Categories */}
      {loadingIntegrations ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center">
          <p className="text-zinc-600">
            No integrations found matching &quot;{searchQuery}&quot;
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {filteredCategories.map(({ category, providers }) => (
            <div key={category}>
              {/* Category Header */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-zinc-900">
                  {getCategoryDisplayName(category)}
                </h2>
                <p className="text-sm text-zinc-600">
                  {providers.length} {providers.length === 1 ? 'integration' : 'integrations'}
                </p>
              </div>

              {/* Integration Cards Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {providers.map((provider) => (
                  <IntegrationCard
                    key={provider.id}
                    integration={provider}
                    userIntegration={getUserIntegration(provider.id)}
                    status={getIntegrationStatus(provider.id)}
                    onConnect={handleConnect}
                    onManage={handleManage}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
