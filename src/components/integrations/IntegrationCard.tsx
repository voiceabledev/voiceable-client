import React from 'react';
import { IntegrationProvider } from '../../constants/integrations';
import { UserIntegration } from '../../types/integrations';

export type IntegrationCardStatus = 'available' | 'connecting' | 'connected' | 'error';

interface IntegrationCardProps {
  integration: IntegrationProvider;
  userIntegration?: UserIntegration | null;
  status: IntegrationCardStatus;
  onConnect: (integrationId: string) => void;
  onManage: (integrationId: string) => void;
  onViewCapabilities?: (integrationId: string) => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  userIntegration,
  status,
  onConnect,
  onManage,
  onViewCapabilities,
}) => {
  const isAvailable = integration.status === 'available';
  const isConnected = status === 'connected' && userIntegration;
  const isConnecting = status === 'connecting';
  const hasError = status === 'error';

  const getStatusBadge = () => {
    if (isConnecting) {
      return (
        <div className="flex items-center gap-1.5 text-xs text-blue-600">
          <div className="h-2 w-2 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span>Connecting...</span>
        </div>
      );
    }

    if (isConnected) {
      return (
        <div className="flex items-center gap-1.5 text-xs text-green-600">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">Connected</span>
        </div>
      );
    }

    if (hasError) {
      return (
        <div className="flex items-center gap-1.5 text-xs text-red-600">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">Error</span>
        </div>
      );
    }

    return null;
  };

  const handleClick = () => {
    if (!isAvailable) return;

    if (isConnected) {
      onManage(integration.id);
    } else {
      onConnect(integration.id);
    }
  };

  return (
    <div
      className={`
        relative rounded-lg border bg-white p-6 shadow-sm transition-all
        ${hasError ? 'border-red-300' : 'border-zinc-200'}
        ${isConnected ? 'border-green-200 bg-green-50/30' : ''}
        ${!isAvailable ? 'opacity-60' : 'hover:shadow-md'}
      `}
    >
      {/* Popular Badge */}
      {integration.popular && (
        <div className="absolute -right-2 -top-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
          Popular
        </div>
      )}

      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg ${integration.iconBg} text-white`}
          >
            <span className="text-lg font-bold">{integration.icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">{integration.name}</h3>
            {!isAvailable && (
              <span className="text-xs text-zinc-500">Coming Soon</span>
            )}
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Description */}
      <p className="mb-4 text-sm text-zinc-600">{integration.description}</p>

      {/* Capabilities */}
      {integration.capabilities && integration.capabilities.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {integration.capabilities.slice(0, 3).map((capability, index) => (
              <span
                key={index}
                className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-700"
              >
                {capability}
              </span>
            ))}
            {integration.capabilities.length > 3 && (
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-700">
                +{integration.capabilities.length - 3} more
              </span>
            )}
          </div>
          {onViewCapabilities && integration.capabilities.length > 3 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewCapabilities(integration.id);
              }}
              className="mt-2 text-xs text-blue-600 hover:text-blue-700"
            >
              View all capabilities
            </button>
          )}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleClick}
        disabled={!isAvailable || isConnecting}
        className={`
          w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors
          ${
            isConnected
              ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              : !isAvailable || isConnecting
              ? 'cursor-not-allowed bg-zinc-100 text-zinc-400'
              : hasError
              ? 'bg-red-50 text-red-700 hover:bg-red-100'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }
        `}
      >
        {isConnecting
          ? 'Connecting...'
          : isConnected
          ? 'Manage Integration'
          : hasError
          ? 'Fix Connection'
          : !isAvailable
          ? 'Coming Soon'
          : '+ Connect'}
      </button>
    </div>
  );
};
