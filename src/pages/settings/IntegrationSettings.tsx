import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, ExternalLink, X, ChevronDown, Trash2 } from "lucide-react";
import { IntegrationForm } from "@/components/integrations/IntegrationForm";
import { integrationsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { IntegrationSchema, IntegrationConfig } from "@/types/integrations";

// Integration metadata for display (icons, colors, external links)
const INTEGRATION_METADATA: Record<string, { name: string; icon: string; iconBg: string; url?: string }> = {
  elevenlabs: {
    name: "ElevenLabs",
    icon: "⫾",
    iconBg: "bg-zinc-800",
    url: "https://elevenlabs.io"
  },
  vapi: {
    name: "Vapi",
    icon: "V",
    iconBg: "bg-zinc-800",
    url: "https://vapi.ai"
  },
  deepgram: {
    name: "Deepgram",
    icon: "D",
    iconBg: "bg-zinc-800",
    url: "https://deepgram.com"
  },
  azure: {
    name: "Azure Speech",
    icon: "A",
    iconBg: "bg-red-600",
    url: "https://azure.microsoft.com/en-us/services/cognitive-services/speech-services/"
  },
  cartesia: {
    name: "Cartesia",
    icon: "▣",
    iconBg: "bg-zinc-800",
    url: "https://cartesia.ai"
  },
  inworld: {
    name: "Inworld",
    icon: "⬡",
    iconBg: "bg-zinc-800",
    url: "https://inworld.ai"
  },
  rimeai: {
    name: "RimeAI",
    icon: "⚏",
    iconBg: "bg-zinc-800",
    url: "https://rime.ai"
  },
  smallestai: {
    name: "SmallestAI",
    icon: "⬢",
    iconBg: "bg-green-600",
    url: "https://smallest.ai"
  },
  neuphonic: {
    name: "Neuphonic",
    icon: "ω",
    iconBg: "bg-orange-500",
    url: "https://neuphonic.com"
  },
  hume: {
    name: "Hume",
    icon: "⬢",
    iconBg: "bg-purple-600",
    url: "https://hume.ai"
  },
  lmnt: {
    name: "LMNT",
    icon: "◐",
    iconBg: "bg-yellow-500",
    url: "https://lmnt.com"
  },
  minimax: {
    name: "Minimax",
    icon: "⟁",
    iconBg: "bg-zinc-800",
    url: "https://minimax.ai"
  },
  hubspot: {
    name: "HubSpot CRM",
    icon: "HS",
    iconBg: "bg-blue-600",
    url: "https://app.hubspot.com"
  },
  salesforce: {
    name: "Salesforce",
    icon: "SF",
    iconBg: "bg-sky-500",
    url: "https://www.salesforce.com"
  },
  pipedrive: {
    name: "Pipedrive",
    icon: "PD",
    iconBg: "bg-emerald-600",
    url: "https://www.pipedrive.com"
  },
  kommo: {
    name: "Kommo",
    icon: "K",
    iconBg: "bg-purple-600",
    url: "https://www.kommo.com"
  },
  google_calendar: {
    name: "Google Calendar",
    icon: "📅",
    iconBg: "bg-blue-500",
    url: "https://calendar.google.com"
  },
  outlook_calendar: {
    name: "Outlook Calendar",
    icon: "🗓️",
    iconBg: "bg-sky-700",
    url: "https://outlook.live.com/calendar/"
  },
  calendly: {
    name: "Calendly",
    icon: "C",
    iconBg: "bg-orange-500",
    url: "https://calendly.com"
  },
  calcom: {
    name: "Cal.com",
    icon: "Cal",
    iconBg: "bg-purple-600",
    url: "https://cal.com"
  }
};

// Integration descriptions for About tab
const INTEGRATION_DESCRIPTIONS: Record<string, string> = {
  hubspot: "Connect your ElevenLabs AI agents with HubSpot CRM to manage contacts, companies, and deals. This integration enables your agents to create and update CRM records, search for existing data, and automate sales and marketing workflows. Keep your customer data synchronized and let your AI agents handle routine CRM tasks.",
  salesforce: "Integrate your AI agents with Salesforce Sales Cloud to push and pull records directly. Enable your agents to access customer data, update opportunities, create leads, and automate your sales processes seamlessly.",
  pipedrive: "Keep your leads and pipelines in sync with Pipedrive CRM. Your AI agents can manage deals, update contacts, and track sales activities automatically.",
  elevenlabs: "Configure your ElevenLabs API key to enable voice synthesis and cloning capabilities for your AI agents.",
  deepgram: "Set up Deepgram for real-time speech recognition with low latency, perfect for production voice AI applications.",
  calendly: "Bring Calendly booking links into your assistant workflows. Enable your agents to schedule meetings and manage availability.",
  google_calendar: "Overlay availability and events from Google Calendar. Let your agents check schedules and book appointments.",
  outlook_calendar: "Integrate Microsoft Outlook calendars for scheduling. Enable calendar management through your AI agents.",
  calcom: "Use Cal.com event links to manage availability across calendars. Integrate scheduling capabilities into your agent workflows."
};

// Credential types for integrations
const INTEGRATION_CREDENTIAL_TYPES: Record<string, { label: string; value: string }> = {
  hubspot: {
    label: "Private App Token",
    value: "private_app_token"
  },
  salesforce: {
    label: "Connected App",
    value: "connected_app"
  },
  pipedrive: {
    label: "API Token",
    value: "api_token"
  }
};

// Integration tools mapping
const INTEGRATION_TOOLS: Record<string, string[]> = {
  hubspot: [
    "Get Contact",
    "Create Contact",
    "Update Contact",
    "Search Contacts",
    "Get Company",
    "Create Company",
    "Search Companies",
    "Get Deal",
    "Update Deal",
    "Search Deals",
    "Create Note",
    "Search Notes",
    "Get Task"
  ],
  salesforce: [
    "Get Lead",
    "Create Lead",
    "Update Lead",
    "Search Leads",
    "Get Opportunity",
    "Create Opportunity",
    "Update Opportunity",
    "Search Opportunities",
    "Get Account",
    "Create Account",
    "Update Account",
    "Search Accounts",
    "Create Task",
    "Create Event"
  ],
  pipedrive: [
    "Get Person",
    "Create Person",
    "Get Deal",
    "Create Deal",
    // "Update Deal",
    "Search Deals",
    // "Update Person",
    // "Search Persons",
    // "Get Organization",
    // "Create Organization",
    // "Update Organization",
    // "Search Organizations",
    // "Create Note",
    // "Create Activity"
  ],
  calendly: [
    "Get Event Types",
    "Get Availability",
    "Create Booking",
    "Get Scheduled Events",
    "Cancel Event",
    "Reschedule Event"
  ],
  google_calendar: [
    "List Events",
    "Create Event",
    "Update Event",
    "Delete Event",
    "Get Free/Busy",
    "Get Calendar List"
  ],
  outlook_calendar: [
    "List Events",
    "Create Event",
    "Update Event",
    "Delete Event",
    "Get Free/Busy",
    "Get Calendar List"
  ],
  calcom: [
    "Get Event Types",
    "Get Availability",
    "Create Booking",
    "Get Scheduled Events",
    "Cancel Event",
    "Reschedule Event"
  ]
};

export default function IntegrationSettings() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const { toast } = useToast();
  const [schema, setSchema] = useState<IntegrationSchema | null>(null);
  const [initialConfig, setInitialConfig] = useState<IntegrationConfig>({});
  const [hasSavedIntegration, setHasSavedIntegration] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("credentials");

  const integrationType = type || '';
  const metadata = INTEGRATION_METADATA[integrationType] || {
    name: integrationType.charAt(0).toUpperCase() + integrationType.slice(1),
    icon: "🔌",
    iconBg: "bg-zinc-800"
  };

  useEffect(() => {
    if (!integrationType) {
      toast({
        title: 'Invalid integration',
        description: 'Integration type is required.',
        variant: 'destructive',
      });
      navigate('/settings/integrations');
      return;
    }
    loadIntegration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integrationType]);

  const loadIntegration = async () => {
    setIsLoading(true);
    try {
      // Get schema for the integration type
      const schemasResponse = await integrationsApi.getSchemas();
      const integrationSchema = schemasResponse.data?.find((s) => s.type === integrationType);
      
      if (!integrationSchema) {
        toast({
          title: 'Error loading schema',
          description: `Could not find ${metadata.name} integration schema.`,
          variant: 'destructive',
        });
        setIsLoading(false);
        navigate('/settings/integrations');
        return;
      }

      setSchema(integrationSchema);

      // Try to load existing config
      try {
        const integrationResponse = await integrationsApi.get(integrationType);
        if (integrationResponse.data?.config && integrationSchema) {
          // Mark that we have a saved integration
          setHasSavedIntegration(true);
          
          // Process config values - store password values, keep others
          const config: IntegrationConfig = {};
          Object.keys(integrationSchema.fields).forEach((key) => {
            const fieldConfig = integrationSchema.fields[key];
            const apiValue = integrationResponse.data.config[key];
            
            if (fieldConfig.type === 'password') {
              // Store the masked value from API (like "****1234")
              // We'll show this masked value and allow toggling visibility
              config[key] = apiValue || '';
            } else {
              // For non-password fields, use the value from API
              // Check if it's a masked value (contains asterisks) - if so, it means it was a password that got masked
              if (apiValue && typeof apiValue === 'string' && apiValue.includes('*')) {
                // This shouldn't happen for non-password fields, but just in case
                config[key] = '';
              } else {
                config[key] = apiValue || '';
              }
            }
          });
          setInitialConfig(config);
        } else {
          // No config data, set empty config
          setHasSavedIntegration(false);
          const emptyConfig: IntegrationConfig = {};
          Object.keys(integrationSchema.fields).forEach((key) => {
            emptyConfig[key] = '';
          });
          setInitialConfig(emptyConfig);
        }
      } catch (error) {
        // Integration doesn't exist yet, that's fine
        console.log('No existing integration found');
        setHasSavedIntegration(false);
        // Set empty config based on schema
        const emptyConfig: IntegrationConfig = {};
        Object.keys(integrationSchema.fields).forEach((key) => {
          emptyConfig[key] = '';
        });
        setInitialConfig(emptyConfig);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load integration';
      toast({
        title: 'Error loading integration',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (config: IntegrationConfig) => {
    setIsSaving(true);
    try {
      // Check if integration already exists
      let response;
      let exists = false;
      try {
        await integrationsApi.get(integrationType);
        exists = true;
      } catch {
        exists = false;
      }

      if (exists) {
        // Exists, update it
        response = await integrationsApi.update(integrationType, config);
      } else {
        // Doesn't exist, create it
        response = await integrationsApi.create(integrationType, config);
      }

      toast({
        title: 'Integration saved',
        description: `Your ${metadata.name} API key has been saved successfully.`,
      });

      // Reload the integration from the API to get masked password values
      // This ensures password fields show the masked values (like "****1234")
      // instead of appearing blank
      await loadIntegration();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save integration';
      toast({
        title: 'Error saving integration',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!hasSavedIntegration) {
      return;
    }

    if (!confirm(`Are you sure you want to delete the ${metadata.name} integration? This will remove all credentials and cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await integrationsApi.delete(integrationType);
      
      toast({
        title: 'Integration deleted',
        description: `${metadata.name} integration has been removed successfully.`,
      });
      
      // Navigate back to integrations list
      navigate('/settings/integrations');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete integration';
      toast({
        title: 'Error deleting integration',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const integrationDescription = INTEGRATION_DESCRIPTIONS[integrationType] || 
    `Configure your ${metadata.name} integration settings. Connect your AI agents with ${metadata.name} to extend their capabilities.`;
  const integrationTools = INTEGRATION_TOOLS[integrationType] || [];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings/integrations")}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className={cn("w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-white font-bold text-base md:text-lg flex-shrink-0", metadata.iconBg)}>
              {metadata.icon}
            </div>
            <h1 className="text-lg md:text-xl font-semibold">{metadata.name}</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings/integrations")}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-1/2">
          <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 w-full justify-start">
            <TabsTrigger 
              value="credentials" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
            >
              Credentials
            </TabsTrigger>
            {integrationTools.length > 0 && (
              <TabsTrigger 
                value="tools" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
              >
                Tools
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="about" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
            >
              About
            </TabsTrigger>
          </TabsList>

          {/* Credentials Tab */}
          <TabsContent value="credentials" className="mt-6">
            <div className="space-y-6">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading...
                </div>
              ) : schema ? (
                <>
                  {INTEGRATION_CREDENTIAL_TYPES[integrationType] && (
                    <div className="space-y-2">
                      <h2 className="text-sm font-medium">Credential type</h2>
                      {/* <p className="text-xs text-muted-foreground mb-3">
                        Select a credential to use for this integration.
                      </p> */}
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm cursor-default"
                          value={INTEGRATION_CREDENTIAL_TYPES[integrationType].label}
                        />
                      </div>
                    </div>
                  )}
                  <IntegrationForm
                    schema={schema}
                    initialConfig={initialConfig}
                    onSubmit={handleSave}
                    isLoading={isSaving}
                    hasSavedValues={hasSavedIntegration}
                    submitButtonText={hasSavedIntegration ? "Save" : "Connect"}
                    hideSubmitButton={true}
                  />
                  <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-3 sm:justify-end">
                    {hasSavedIntegration && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting || isSaving}
                        className="w-full sm:w-auto text-xs md:text-sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="default"
                      onClick={() => {
                        const form = document.querySelector('form');
                        if (form) {
                          form.requestSubmit();
                        }
                      }}
                      disabled={isSaving || isDeleting}
                      className="w-full sm:w-auto min-w-[120px] text-xs md:text-sm"
                    >
                      {isSaving ? (hasSavedIntegration ? 'Saving...' : 'Connecting...') : (hasSavedIntegration ? 'Save' : 'Connect')}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Failed to load integration schema
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tools Tab */}
          {integrationTools.length > 0 && (
            <TabsContent value="tools" className="mt-6">
              <div className="space-y-4">
                <div className="space-y-2 mb-4">
                  <h2 className="text-sm font-medium">Tools</h2>
                  <p className="text-xs text-muted-foreground">
                    Tools available through your {metadata.name} integration.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {integrationTools.map((tool) => (
                    <div
                      key={tool}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0", metadata.iconBg)}>
                        {metadata.icon}
                      </div>
                      <span className="text-sm font-medium">{tool}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {/* About Tab */}
          <TabsContent value="about" className="mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-sm font-medium">About</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {integrationDescription}
                </p>
              </div>
              {metadata.url && (
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => window.open(metadata.url, '_blank', 'noopener,noreferrer')}
                >
                  Learn more
                  <ExternalLink className="h-3.5 w-3.5 ml-2" />
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

