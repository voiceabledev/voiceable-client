import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Layout,
} from "lucide-react";
import { TabSectionHeader } from "@/components/assistants/TabSectionHeader";
import { WorkflowStyleCard } from "@/components/assistants/WorkflowStyleCard";
import { Agent, apiKeysApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { loadAndOpenWidget } from "@/utils/widgetLoader";
import { toFullConfig } from "@/utils/widgetConfig";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building2 } from "lucide-react";

interface WidgetTabProps {
  agent?: Agent | null;
  agentId?: string;
}

export default function WidgetTab({ agent, agentId }: WidgetTabProps) {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeyId, setApiKeyId] = useState<number | null>(null);
  const [apiKeyLoading, setApiKeyLoading] = useState(true);
  const [apiKeyRefreshing, setApiKeyRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewTriggered, setPreviewTriggered] = useState(false);
  const [showContactSalesModal, setShowContactSalesModal] = useState(false);
  const [designStudioExpanded, setDesignStudioExpanded] = useState(true);
  const [integrationExpanded, setIntegrationExpanded] = useState(true);
  const [guideExpanded, setGuideExpanded] = useState(false);

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

  // Auto-open preview if preview parameter is set
  useEffect(() => {
    const shouldPreview = searchParams.get('preview') === 'true';
    if (shouldPreview && !previewTriggered && !apiKeyLoading && apiKey && agent?.elevenlabs_agent_id) {
      setPreviewTriggered(true);
      // Remove the preview parameter from URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('preview');
      setSearchParams(newSearchParams, { replace: true });
      // Trigger preview after a short delay to ensure everything is ready
      setTimeout(() => {
        handlePreviewWidget();
      }, 100);
    }
  }, [searchParams, previewTriggered, apiKeyLoading, apiKey, agent?.elevenlabs_agent_id, handlePreviewWidget, setSearchParams]);

  const handleOpenDesignStudio = () => {
    if (agent?.id) {
      navigate(`/assistants/${agent.id}/widget/design`);
    } else if (agentId) {
      navigate(`/assistants/${agentId}/widget/design`);
    }
  };

  // Check membership status
  const membershipStatus = user?.membership_status || 'free';

  // Show status page for cancelled or suspended users
  if (authLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (membershipStatus === 'cancelled' || membershipStatus === 'suspended') {
    const title = membershipStatus === 'cancelled' 
      ? 'Widget Access Unavailable' 
      : 'Account Suspended';
    const description = membershipStatus === 'cancelled'
      ? 'Your membership has been cancelled. Please contact support to reactivate your account and restore widget access.'
      : 'Your account has been suspended. Please contact support for assistance with your account.';

    return (
      <>
        <div className="flex md:items-center justify-center min-h-[calc(100vh-300px)] py-4 md:py-8 px-4">
          <div className="max-w-2xl w-full bg-card border border-border rounded-xl p-6 sm:p-8 md:p-12 text-center">
            <div className="flex justify-center mb-4 md:mb-6">
              <div className="p-3 md:p-4 bg-primary/10 rounded-full">
                <Layout className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 md:mb-4">{title}</h2>
            <p className="text-muted-foreground mb-6 md:mb-8 text-sm sm:text-base md:text-lg leading-relaxed px-2 sm:px-0">
              {description}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Button
                variant="default"
                size="lg"
                onClick={() => setShowContactSalesModal(true)}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Sales Modal */}
        <Dialog open={showContactSalesModal} onOpenChange={setShowContactSalesModal}>
          <DialogContent className="max-w-4xl w-full h-[90vh] max-h-[800px] p-0 flex flex-col">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
              <DialogTitle>Schedule a Meeting</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden min-h-0">
              <iframe
                src="https://calendly.com/imvitoroliveira"
                className="w-full h-full border-0"
                title="Calendly Scheduling"
                allow="camera; microphone; geolocation"
              />
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deployment Warning */}
      {!agent?.elevenlabs_agent_id && (
        <div className="p-4 bg-warning/10 border border-warning/30 rounded-xl flex items-start gap-3 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-warning font-semibold">
              Deploy your agent first to use the widget
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              The widget requires a deployed agent. Click "Deploy" in the header to publish your agent.
            </p>
          </div>
        </div>
      )}

      {/* Design Studio Card */}
      <WorkflowStyleCard
        title="Design Studio"
        description="Customize your widget's appearance, colors, branding, and styling"
        icon={Palette}
        expanded={designStudioExpanded}
        onToggle={() => setDesignStudioExpanded(!designStudioExpanded)}
        actionButton={
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviewWidget}
            disabled={!agent?.elevenlabs_agent_id || !apiKey || apiKeyLoading}
          >
            <Phone className="h-4 w-4 mr-2" />
            Preview Widget
          </Button>
        }
      >
        {/* Design Studio Content */}
        <div className="relative text-center py-8 px-4">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl" />

          {/* Content */}
          <div className="relative z-10">
            <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4 shadow-sm">
              <Palette className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Customize Your Widget</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
              Open the Design Studio to customize colors, branding, positioning, and more. See live previews as you make changes.
            </p>
            <Button
              variant="default"
              size="lg"
              onClick={handleOpenDesignStudio}
              disabled={!agent?.id && !agentId}
              className="shadow-sm hover:shadow-md transition-all"
            >
              Open Design Studio
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </WorkflowStyleCard>

      {/* Integration Setup Card */}
      <WorkflowStyleCard
        title="Integration Setup"
        description="API key and embed code for your website"
        icon={Code}
        expanded={integrationExpanded}
        onToggle={() => setIntegrationExpanded(!integrationExpanded)}
      >
        <div className="space-y-6">
          {/* API Key Subsection */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">Widget API Key</h4>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshApiKey}
                disabled={apiKeyLoading || apiKeyRefreshing}
                className="h-8"
              >
                {apiKeyRefreshing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                <span className="ml-2">Refresh</span>
              </Button>
            </div>

            <div className="p-4">
              {apiKeyLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating API key...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={apiKey}
                      readOnly
                      className="bg-secondary/50 font-mono text-sm h-10"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={async () => {
                        await navigator.clipboard.writeText(apiKey);
                        toast({ title: 'Copied!', description: 'API key copied to clipboard' });
                      }}
                      className="h-10 w-10 flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This key authenticates widget requests. Keep it secure and refresh if compromised.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Embed Code Subsection */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">Embed Code</h4>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                disabled={!agent?.elevenlabs_agent_id || !apiKey}
                className="h-8"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>

            <div className="p-4">
              <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs font-mono shadow-sm">
                <code>{generateEmbedCode()}</code>
              </pre>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                Add this code to your website before the closing <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">&lt;/body&gt;</code> tag to embed the widget.
              </p>
            </div>
          </div>
        </div>
      </WorkflowStyleCard>

      {/* Quick Start Guide Card */}
      <WorkflowStyleCard
        title="Quick Start Guide"
        description="Get started with your widget in 3 simple steps"
        icon={Layout}
        expanded={guideExpanded}
        onToggle={() => setGuideExpanded(!guideExpanded)}
      >
        <div className="space-y-4">
          <ol className="space-y-4">
            <li className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center mt-0.5">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Deploy Your Agent</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Click the "Deploy" button in the header to publish your agent and make it available for the widget.
                </p>
              </div>
            </li>

            <li className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center mt-0.5">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Customize Appearance</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Open the Design Studio to customize colors, branding, positioning, and styling. Preview changes in real-time.
                </p>
              </div>
            </li>

            <li className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center mt-0.5">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Embed on Your Website</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Copy the embed code from the Integration Setup section and paste it into your website's HTML before the closing <code className="bg-muted px-1.5 py-0.5 rounded text-xs">&lt;/body&gt;</code> tag.
                </p>
              </div>
            </li>
          </ol>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Note:</strong> An API key is automatically generated for widget authentication. You can refresh it anytime if it's compromised.
            </p>
          </div>
        </div>
      </WorkflowStyleCard>
    </div>
  );
}
