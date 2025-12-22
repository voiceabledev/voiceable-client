import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Copy,
  Check,
  Code,
  RefreshCw,
  Key,
  Loader2,
  AlertTriangle,
  Palette,
  ArrowRight,
} from "lucide-react";
import { Agent, apiKeysApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { loadAndOpenWidget } from "@/utils/widgetLoader";
import { toFullConfig } from "@/utils/widgetConfig";

interface WidgetTabProps {
  agent?: Agent | null;
  agentId?: string;
}

export default function WidgetTab({ agent, agentId }: WidgetTabProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeyId, setApiKeyId] = useState<number | null>(null);
  const [apiKeyLoading, setApiKeyLoading] = useState(true);
  const [apiKeyRefreshing, setApiKeyRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch or create API key on mount
  const fetchOrCreateApiKey = useCallback(async (forceCreate = false) => {
    try {
      setApiKeyLoading(true);
      const response = await apiKeysApi.list();
      const existingKeys = response.data || [];
      
      // If forcing create (refresh), create a new key
      if (forceCreate) {
        const createResponse = await apiKeysApi.create({
          name: 'Widget API Key',
          key_type: 'public',
          transient_assistant: false,
        });
        if (createResponse.data) {
          setApiKey(createResponse.data.key_value);
          setApiKeyId(createResponse.data.id);
          toast({
            title: 'API Key Created',
            description: 'A new API key has been generated for your widget.',
          });
        }
        return;
      }
      
      // Look for an existing widget API key by name first
      let widgetKey = existingKeys.find(
        (key) => key.name === 'Widget API Key'
      );
      
      // If no widget key exists, use any existing key
      if (!widgetKey && existingKeys.length > 0) {
        widgetKey = existingKeys[0]; // Use the first available key
      }
      
      // Only create if no keys exist at all
      if (!widgetKey) {
        const createResponse = await apiKeysApi.create({
          name: 'Widget API Key',
          key_type: 'public',
          transient_assistant: false,
        });
        if (createResponse.data) {
          setApiKey(createResponse.data.key_value);
          setApiKeyId(createResponse.data.id);
          toast({
            title: 'API Key Created',
            description: 'A new API key has been generated for your widget.',
          });
        }
      } else {
        setApiKey(widgetKey.key_value);
        setApiKeyId(widgetKey.id);
      }
    } catch (error) {
      console.error('Failed to fetch/create API key:', error);
      toast({
        title: 'API Key Error',
        description: 'Failed to create API key. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setApiKeyLoading(false);
    }
  }, [toast]);

  // Fetch API key on mount
  useEffect(() => {
    fetchOrCreateApiKey();
  }, [fetchOrCreateApiKey]);

  // Refresh API key - deletes old and creates new
  const handleRefreshApiKey = useCallback(async () => {
    try {
      setApiKeyRefreshing(true);
      
      // Delete the old key if it exists
      if (apiKeyId) {
        try {
          await apiKeysApi.delete(apiKeyId);
        } catch (e) {
          console.error('Failed to delete old key:', e);
        }
      }
      
      // Create a new key
      await fetchOrCreateApiKey(true);
      
      toast({
        title: 'API Key Refreshed',
        description: 'A new API key has been generated. Update your widget code.',
      });
    } catch (error) {
      console.error('Failed to refresh API key:', error);
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh API key. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setApiKeyRefreshing(false);
    }
  }, [apiKeyId, fetchOrCreateApiKey, toast]);

  // Get the backend base URL for widget.js and API calls
  const getBackendBaseUrl = useCallback(() => {
    // Use env var if available (set at build time)
    if (import.meta.env.VITE_API_BASE_URL) {
      // Remove /api/v1 suffix to get the base URL
      return import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    }

    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // For localhost development, Rails runs on port 3000
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }

    // For production, assume same domain (widget.js is served from backend)
    return `${protocol}//${hostname}`;
  }, []);

  // Generate embed code using agent's saved widget_config
  const generateEmbedCode = useCallback(() => {
    if (!apiKey) {
      return '<!-- Loading API key... -->';
    }
    
    if (!agent?.elevenlabs_agent_id) {
      return `<!-- Deploy your agent to get the embed code -->`;
    }

    const backendUrl = getBackendBaseUrl();
    const config = toFullConfig(agent?.widget_config);
    
    const dataAttrs = [
      `data-agent-id="${agent.elevenlabs_agent_id}"`,
      `data-api-key="${apiKey}"`,
      `data-api-base-url="${backendUrl}"`,
      `data-title="${config.title}"`,
      config.subtitle && `data-subtitle="${config.subtitle}"`,
      `data-button-text="${config.buttonText}"`,
      config.welcomeMessage && `data-welcome-message="${config.welcomeMessage}"`,
      `data-icon-type="${config.iconType}"`,
      config.iconType === 'custom' && config.customIconUrl && `data-custom-icon-url="${config.customIconUrl}"`,
      `data-position="${config.position}"`,
      `data-widget-size="${config.widgetSize}"`,
      `data-primary-color="${config.primaryColor}"`,
      `data-primary-text-color="${config.primaryTextColor}"`,
      `data-background-color="${config.backgroundColor}"`,
      `data-text-color="${config.textColor}"`,
      `data-border-color="${config.borderColor}"`,
      `data-user-bubble-color="${config.userBubbleColor}"`,
      `data-agent-bubble-color="${config.agentBubbleColor}"`,
      `data-border-radius="${config.borderRadius}"`,
    ].filter(Boolean).join('\n  ');

    return `<!-- Voice Agent Widget -->
<script
  src="${backendUrl}/widget.js"
  ${dataAttrs}
  async
></script>`;
  }, [agent?.elevenlabs_agent_id, agent?.widget_config, apiKey, getBackendBaseUrl]);

  const handleCopyCode = useCallback(async () => {
    const code = generateEmbedCode();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Embed code copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', description: 'Please copy manually', variant: 'destructive' });
    }
  }, [generateEmbedCode, toast]);

  const handlePreviewWidget = useCallback(async () => {
    if (!agent?.elevenlabs_agent_id) {
      toast({
        title: "Deploy first",
        description: "Publish the agent before previewing the widget.",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "Widget preview unavailable",
        description: "Could not load the widget API key. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    const config = toFullConfig(agent?.widget_config);

    try {
      await loadAndOpenWidget({
        agentId: agent.elevenlabs_agent_id,
        apiKey: apiKey,
        apiBaseUrl: getBackendBaseUrl(),
        title: config.title,
        subtitle: config.subtitle,
        buttonText: config.buttonText,
        welcomeMessage: config.welcomeMessage,
        iconType: config.iconType,
        position: config.position,
        widgetSize: config.widgetSize,
        primaryColor: config.primaryColor,
        primaryTextColor: config.primaryTextColor,
        backgroundColor: config.backgroundColor,
        textColor: config.textColor,
        borderColor: config.borderColor,
        userBubbleColor: config.userBubbleColor,
        agentBubbleColor: config.agentBubbleColor,
        borderRadius: config.borderRadius,
      });
    } catch (error) {
      console.error("Failed to open widget preview:", error);
      toast({
        title: "Preview failed",
        description: error instanceof Error ? error.message : "Could not open the widget preview.",
        variant: "destructive",
      });
    }
  }, [agent?.elevenlabs_agent_id, agent?.widget_config, apiKey, getBackendBaseUrl, toast]);

  const handleOpenDesignStudio = () => {
    if (agent?.id) {
      navigate(`/assistants/${agent.id}/widget/design`);
    } else if (agentId) {
      navigate(`/assistants/${agentId}/widget/design`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Custom Widget</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Embed a voice widget on your website
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviewWidget}
            disabled={!agent?.elevenlabs_agent_id || !apiKey || apiKeyLoading}
          >
            <Phone className="h-4 w-4 mr-2" />
            Preview Widget
          </Button>
        </div>

        {/* Deployment Warning */}
        {!agent?.elevenlabs_agent_id && (
          <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-warning font-medium">
                Deploy your agent first to use the widget
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                The widget requires a deployed agent. Click "Deploy" in the header to publish your agent.
              </p>
            </div>
          </div>
        )}

        {/* Design Studio Section */}
        <div className="border border-border rounded-lg p-6 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Design Studio</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Customize your widget's appearance, colors, branding, and styling. 
                See live previews as you make changes.
              </p>
              <Button
                className="mt-4"
                onClick={handleOpenDesignStudio}
                disabled={!agent?.id && !agentId}
              >
                Open Design Studio
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* API Key Section */}
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Widget API Key</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshApiKey}
              disabled={apiKeyLoading || apiKeyRefreshing}
            >
              {apiKeyRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
          </div>
          
          {apiKeyLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating API key...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={apiKey}
                  readOnly
                  className="bg-secondary/50 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={async () => {
                    await navigator.clipboard.writeText(apiKey);
                    toast({ title: 'Copied!', description: 'API key copied to clipboard' });
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This key is used to authenticate widget requests. Keep it secure and refresh if compromised.
              </p>
            </div>
          )}
        </div>

            {/* Embed Code */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Embed Code</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                  disabled={!agent?.elevenlabs_agent_id || !apiKey}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
              <div className="p-4">
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                  <code>{generateEmbedCode()}</code>
                </pre>
                <p className="text-xs text-muted-foreground mt-3">
                  Add this code to your website before the closing <code className="bg-muted px-1 rounded">&lt;/body&gt;</code> tag.
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-3">How to use</h4>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">1</span>
                  <span>Deploy your agent using the "Deploy" button</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">2</span>
              <span>Customize the widget appearance in the Design Studio</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">3</span>
                  <span>Copy the embed code and paste it into your website</span>
                </li>
              </ol>
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                An API key is automatically generated for widget authentication. Refresh it if compromised.
              </p>
        </div>
      </div>
    </div>
  );
}
