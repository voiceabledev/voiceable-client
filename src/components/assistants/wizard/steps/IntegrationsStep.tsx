import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Users, CalendarDays, ChevronDown, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UserIntegration as IntegrationUserIntegration } from "@/types/integrations";

interface IntegrationProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  status: "available" | "upcoming";
  order: number;
}

// CRM Providers - matching Integrations.tsx
const crmProviders: IntegrationProvider[] = [
  {
    id: "hubspot",
    name: "HubSpot CRM",
    description: "Sync contact, deal, and ticket data powered by HubSpot.",
    icon: "HS",
    iconBg: "bg-blue-600",
    status: "upcoming",
    order: 1
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Push and pull records directly from Salesforce Sales Cloud.",
    icon: "SF",
    iconBg: "bg-sky-500",
    status: "upcoming",
    order: 2
  },
  {
    id: "pipedrive",
    name: "Pipedrive",
    description: "Keep leads and pipelines in sync with Pipedrive CRM.",
    icon: "PD",
    iconBg: "bg-emerald-600",
    status: "upcoming",
    order: 3
  },
  {
    id: "kommo",
    name: "Kommo",
    description: "Messenger-based sales CRM with WhatsApp, Instagram, and more channels.",
    icon: "K",
    iconBg: "bg-purple-600",
    status: "upcoming",
    order: 4
  },
  {
    id: "gohighlevel",
    name: "GoHighLevel",
    description: "CRM and sales automation platform for small businesses.",
    icon: "GH",
    iconBg: "bg-green-600",
    status: "upcoming",
    order: 5
  }
];

// Scheduling Providers - matching Integrations.tsx
const schedulingProviders: IntegrationProvider[] = [
  {
    id: "google_calendar",
    name: "Google Calendar",
    description: "Overlay availability and events from Google Calendar.",
    icon: "📅",
    iconBg: "bg-blue-500",
    status: "upcoming",
    order: 1
  },
  {
    id: "outlook_calendar",
    name: "Outlook Calendar",
    description: "Integrate Microsoft Outlook calendars for scheduling.",
    icon: "🗓️",
    iconBg: "bg-sky-700",
    status: "upcoming",
    order: 2
  },
  {
    id: "calendly",
    name: "Calendly",
    description: "Bring Calendly booking links into your assistant workflows.",
    icon: "C",
    iconBg: "bg-orange-500",
    status: "upcoming",
    order: 3
  },
  {
    id: "calcom",
    name: "Cal.com",
    description: "Use Cal.com event links to manage availability across calendars.",
    icon: "Cal",
    iconBg: "bg-purple-600",
    status: "available",
    order: 4
  }
];

interface IntegrationsStepProps {
  requiredIntegrations: string[];
  userIntegrations: IntegrationUserIntegration[];
  agentIntegrationTools?: Array<{ integration_type: string; tool_name: string; enabled: boolean }>;
  loadingIntegrations: boolean;
  onConnectIntegration: (integrationType: string, userIntegration?: IntegrationUserIntegration) => Promise<void>;
  onRemoveIntegration?: (integrationType: string) => Promise<void>;
}

// Helper function to sort providers: available first (by order), then upcoming (by order), required ones prioritized
const sortProviders = (providers: IntegrationProvider[], requiredIntegrations: string[]) => {
  return [...providers].sort((a, b) => {
    const aRequired = requiredIntegrations.includes(a.id);
    const bRequired = requiredIntegrations.includes(b.id);
    
    // Required integrations first
    if (aRequired && !bRequired) return -1;
    if (!aRequired && bRequired) return 1;
    
    // Then by status: available before upcoming
    if (a.status === 'available' && b.status === 'upcoming') return -1;
    if (a.status === 'upcoming' && b.status === 'available') return 1;
    
    // Finally by order
    return a.order - b.order;
  });
};

export function IntegrationsStep({
  requiredIntegrations,
  userIntegrations,
  agentIntegrationTools = [],
  loadingIntegrations,
  onConnectIntegration,
  onRemoveIntegration,
}: IntegrationsStepProps) {
  const [isCrmOpen, setIsCrmOpen] = useState(false);
  const [isSchedulingOpen, setIsSchedulingOpen] = useState(false);
  
  const sortedCrmProviders = sortProviders(crmProviders, requiredIntegrations);
  const sortedSchedulingProviders = sortProviders(schedulingProviders, requiredIntegrations);

  const renderIntegrationCard = (provider: IntegrationProvider) => {
    const userIntegration = userIntegrations.find(i => i.integration_type === provider.id);
    // Check if agent has this integration (has at least one enabled tool for this integration type)
    const agentHasIntegration = agentIntegrationTools.some(
      tool => tool.integration_type === provider.id && tool.enabled
    );
    // Integration is "connected" only if the agent has it, not just if the user has it
    const isConnected = agentHasIntegration;
    const isRequired = requiredIntegrations.includes(provider.id);
    const isAvailable = provider.status === 'available';

    return (
      <div 
        key={provider.id} 
        className={`border rounded-lg p-4 transition-colors ${
          isRequired ? 'border-primary/50 bg-primary/5' : ''
        } ${!isAvailable ? 'opacity-75' : ''}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-md ${provider.iconBg} flex items-center justify-center text-white font-bold text-base flex-shrink-0`}>
              {provider.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium">{provider.name}</p>
                {isRequired && (
                  <Badge variant="secondary" className="text-xs">
                    Required
                  </Badge>
                )}
                {!isAvailable && (
                  <Badge variant="outline" className="text-xs bg-muted/50">
                    Soon
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {provider.description}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isConnected ? "Connected" : "Not connected"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {isConnected && onRemoveIntegration && provider.id !== 'twilio' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (window.confirm(`Are you sure you want to remove ${provider.name} from this agent? This will disable all tools for this integration.`)) {
                    await onRemoveIntegration(provider.id);
                  }
                }}
                title="Remove integration from agent"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              variant={isConnected ? "outline" : "default"}
              size="sm"
              disabled={!isAvailable}
              onClick={async () => {
                if (isAvailable) {
                  await onConnectIntegration(provider.id, userIntegration);
                }
              }}
            >
              {isConnected ? "Update" : "Connect"}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium">Connect Your Integrations</p>
        <p className="text-sm text-muted-foreground">
          {requiredIntegrations.length > 0 
            ? "Connect integrations to enable additional features. Required integrations for this template are marked below."
            : "Connect integrations to enable additional features for your assistant."}
        </p>
      </div>
      
      {/* CRM Providers Section */}
      <div className="space-y-3">
        <button
          onClick={() => setIsCrmOpen(!isCrmOpen)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full text-left py-2"
        >
          <Users className="h-5 w-5" />
          <span>CRM Providers</span>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform ml-auto",
            !isCrmOpen && "-rotate-90"
          )} />
        </button>
        {isCrmOpen && (
          <div className="space-y-3">
            {sortedCrmProviders.map(renderIntegrationCard)}
          </div>
        )}
      </div>

      {/* Scheduling Providers Section */}
      <div className="space-y-3">
        <button
          onClick={() => setIsSchedulingOpen(!isSchedulingOpen)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full text-left py-2"
        >
          <CalendarDays className="h-5 w-5" />
          <span>Scheduling Providers</span>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform ml-auto",
            !isSchedulingOpen && "-rotate-90"
          )} />
        </button>
        {isSchedulingOpen && (
          <div className="space-y-3">
            {sortedSchedulingProviders.map(renderIntegrationCard)}
          </div>
        )}
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

