import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { IntegrationForm } from "@/components/integrations/IntegrationForm";
import { integrationsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
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

export default function IntegrationSettings() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const { toast } = useToast();
  const [schema, setSchema] = useState<IntegrationSchema | null>(null);
  const [initialConfig, setInitialConfig] = useState<IntegrationConfig>({});
  const [hasSavedIntegration, setHasSavedIntegration] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  return (
    <div className="max-w-2xl pt-4 md:pt-6 pl-4 md:pl-6">
      {/* Header */}
      <div className="flex items-center gap-2 md:gap-4 mb-6 md:mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/settings/integrations")}
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${metadata.iconBg} flex items-center justify-center text-white font-bold text-base md:text-lg flex-shrink-0`}>
          {metadata.icon}
        </div>
        <h1 className="text-lg md:text-xl font-semibold">{metadata.name}</h1>
      </div>

      {/* Integration Card */}
      <div className="bg-card border border-border rounded-lg p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 md:mb-4">
          <div>
            <h2 className="text-base md:text-lg font-semibold mb-1">{metadata.name}</h2>
            {schema && (
              <p className="text-xs md:text-sm text-muted-foreground">
                {Object.values(schema.fields)[0]?.description || `Configure your ${metadata.name} integration settings.`}
              </p>
            )}
          </div>
          {metadata.url && (
            <a
              href={metadata.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              <ExternalLink className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </a>
          )}
        </div>

        <div className="space-y-3 md:space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : schema ? (
            <IntegrationForm
              schema={schema}
              initialConfig={initialConfig}
              onSubmit={handleSave}
              isLoading={isSaving}
              hasSavedValues={hasSavedIntegration}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load integration schema
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

