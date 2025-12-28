import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { INTEGRATION_METADATA } from "@/constants/assistant";
import type { UserIntegration as IntegrationUserIntegration } from "@/types/integrations";

interface IntegrationsStepProps {
  requiredIntegrations: string[];
  userIntegrations: IntegrationUserIntegration[];
  loadingIntegrations: boolean;
  onConnectIntegration: (integrationType: string, userIntegration?: IntegrationUserIntegration) => Promise<void>;
}

export function IntegrationsStep({
  requiredIntegrations,
  userIntegrations,
  loadingIntegrations,
  onConnectIntegration,
}: IntegrationsStepProps) {
  if (requiredIntegrations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium">Connect Your Integrations</p>
        <p className="text-sm text-muted-foreground">
          This template requires the following integrations to work properly. Please connect them by entering your API keys.
        </p>
      </div>
      
      <div className="space-y-3">
        {requiredIntegrations.map((integrationType) => {
          const integrationMeta = INTEGRATION_METADATA[integrationType] || { name: integrationType, icon: '🔌', iconBg: 'bg-gray-500' };
          const userIntegration = userIntegrations.find(i => i.integration_type === integrationType);
          const isConnected = !!userIntegration;
          
          return (
            <div key={integrationType} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-md ${integrationMeta.iconBg} flex items-center justify-center text-xl`}>
                    {integrationMeta.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{integrationMeta.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {isConnected ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant={isConnected ? "outline" : "default"}
                  size="sm"
                  onClick={async () => {
                    await onConnectIntegration(integrationType, userIntegration);
                  }}
                >
                  {isConnected ? "Update" : "Connect"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      
      {loadingIntegrations && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading integrations...
        </div>
      )}
    </div>
  );
}

