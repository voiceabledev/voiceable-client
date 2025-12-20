import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Phone, 
  MessageSquare, 
  Headphones, 
  ImageIcon,
  Copy,
  Check,
  Code,
  Eye,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Key,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Agent, apiKeysApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface CustomWidgetConfig {
  title: string;
  subtitle: string;
  buttonText: string;
  welcomeMessage: string;
  iconType: 'phone' | 'chat' | 'headphones' | 'custom';
  customIconUrl: string;
  position: 'bottom-right' | 'bottom-left';
  widgetSize: 'small' | 'medium' | 'large';
  primaryColor: string;
  primaryTextColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  userBubbleColor: string;
  agentBubbleColor: string;
  borderRadius: string;
}

const DEFAULT_CONFIG: CustomWidgetConfig = {
  title: 'Need help?',
  subtitle: 'Talk to our AI assistant',
  buttonText: 'Start a call',
  welcomeMessage: 'Hi! How can I help you today?',
  iconType: 'phone',
  customIconUrl: '',
  position: 'bottom-right',
  widgetSize: 'medium',
  primaryColor: '#000000',
  primaryTextColor: '#ffffff',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  borderColor: '#e5e7eb',
  userBubbleColor: '#f3f4f6',
  agentBubbleColor: '#eff6ff',
  borderRadius: '16px',
};

const WIDGET_SIZES = {
  small: { icon: 48, panelWidth: 320, panelHeight: 420 },
  medium: { icon: 56, panelWidth: 380, panelHeight: 500 },
  large: { icon: 64, panelWidth: 420, panelHeight: 580 },
};

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2 w-40">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-5 h-5 rounded border-0 cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent border-0 p-0 h-auto text-sm focus-visible:ring-0 flex-1 font-mono"
        />
      </div>
    </div>
  );
}

interface WidgetTabProps {
  agent?: Agent | null;
  agentId?: string;
}

export default function WidgetTab({ agent, agentId }: WidgetTabProps) {
  const { toast } = useToast();
  const [config, setConfig] = useState<CustomWidgetConfig>(DEFAULT_CONFIG);
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeyId, setApiKeyId] = useState<number | null>(null);
  const [apiKeyLoading, setApiKeyLoading] = useState(true);
  const [apiKeyRefreshing, setApiKeyRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    branding: true,
    icon: true,
    styling: false,
    colors: false,
  });

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

  const updateConfig = useCallback((key: keyof CustomWidgetConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Generate embed code
  const generateEmbedCode = useCallback(() => {
    if (!apiKey) {
      return '<!-- Loading API key... -->';
    }
    
    if (!agent?.elevenlabs_agent_id) {
      return `<!-- Deploy your agent to get the embed code -->`;
    }

    const baseUrl = window.location.origin;
    const dataAttrs = [
      `data-agent-id="${agent.elevenlabs_agent_id}"`,
      `data-api-key="${apiKey}"`,
      `data-api-base-url="${baseUrl}"`,
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
  src="${baseUrl}/widget.js"
  ${dataAttrs}
  async
></script>`;
  }, [agent?.elevenlabs_agent_id, apiKey, config]);

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

  const getIconComponent = (type: string) => {
    switch (type) {
      case 'chat': return MessageSquare;
      case 'headphones': return Headphones;
      case 'custom': return ImageIcon;
      default: return Phone;
    }
  };

  const size = WIDGET_SIZES[config.widgetSize];

  // Section header component
  const SectionHeader = ({ 
    title, 
    description, 
    section 
  }: { 
    title: string; 
    description: string; 
    section: keyof typeof expandedSections;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between py-3 text-left"
    >
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="h-5 w-5 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Custom Widget</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure and embed a custom voice widget on your website
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-4">
            {/* Branding Section */}
            <div className="border border-border rounded-lg overflow-hidden p-4">
              <SectionHeader
                title="Branding"
                description="Customize text and messages"
                section="branding"
              />
              <AnimatePresence>
                {expandedSections.branding && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 space-y-4"
                  >
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Title</label>
                      <Input
                        value={config.title}
                        onChange={(e) => updateConfig('title', e.target.value)}
                        placeholder="Need help?"
                        className="bg-secondary/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Subtitle</label>
                      <Input
                        value={config.subtitle}
                        onChange={(e) => updateConfig('subtitle', e.target.value)}
                        placeholder="Talk to our AI assistant"
                        className="bg-secondary/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Button Text</label>
                      <Input
                        value={config.buttonText}
                        onChange={(e) => updateConfig('buttonText', e.target.value)}
                        placeholder="Start a call"
                        className="bg-secondary/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Welcome Message</label>
                      <Textarea
                        value={config.welcomeMessage}
                        onChange={(e) => updateConfig('welcomeMessage', e.target.value)}
                        placeholder="Hi! How can I help you today?"
                        className="bg-secondary/50 min-h-[80px]"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Icon Section */}
            <div className="border border-border rounded-lg overflow-hidden p-4">
              <SectionHeader
                title="Icon"
                description="Choose the widget icon"
                section="icon"
              />
              <AnimatePresence>
                {expandedSections.icon && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 space-y-4"
                  >
                    <div className="grid grid-cols-4 gap-2">
                      {(['phone', 'chat', 'headphones', 'custom'] as const).map((type) => {
                        const Icon = getIconComponent(type);
                        return (
                          <button
                            key={type}
                            onClick={() => updateConfig('iconType', type)}
                            className={cn(
                              "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors",
                              config.iconType === type
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <Icon className="h-6 w-6 mb-2" />
                            <span className="text-xs capitalize">{type}</span>
                          </button>
                        );
                      })}
                    </div>
                    {config.iconType === 'custom' && (
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Icon URL</label>
                        <Input
                          value={config.customIconUrl}
                          onChange={(e) => updateConfig('customIconUrl', e.target.value)}
                          placeholder="https://example.com/icon.svg"
                          className="bg-secondary/50"
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Styling Section */}
            <div className="border border-border rounded-lg overflow-hidden p-4">
              <SectionHeader
                title="Styling"
                description="Position and size options"
                section="styling"
              />
              <AnimatePresence>
                {expandedSections.styling && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 space-y-4"
                  >
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Position</label>
                      <Select
                        value={config.position}
                        onValueChange={(v) => updateConfig('position', v as 'bottom-right' | 'bottom-left')}
                      >
                        <SelectTrigger className="bg-secondary/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bottom-right">Bottom Right</SelectItem>
                          <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Size</label>
                      <div className="flex rounded-lg border border-border overflow-hidden">
                        {(['small', 'medium', 'large'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => updateConfig('widgetSize', s)}
                            className={cn(
                              "flex-1 py-2 text-sm font-medium transition-colors capitalize",
                              config.widgetSize === s
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-secondary"
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Border Radius</label>
                      <Input
                        value={config.borderRadius}
                        onChange={(e) => updateConfig('borderRadius', e.target.value)}
                        placeholder="16px"
                        className="bg-secondary/50"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Colors Section */}
            <div className="border border-border rounded-lg overflow-hidden p-4">
              <SectionHeader
                title="Colors"
                description="Customize the color scheme"
                section="colors"
              />
              <AnimatePresence>
                {expandedSections.colors && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 divide-y divide-border/50"
                  >
                    <ColorInput
                      label="Primary"
                      value={config.primaryColor}
                      onChange={(v) => updateConfig('primaryColor', v)}
                    />
                    <ColorInput
                      label="Primary Text"
                      value={config.primaryTextColor}
                      onChange={(v) => updateConfig('primaryTextColor', v)}
                    />
                    <ColorInput
                      label="Background"
                      value={config.backgroundColor}
                      onChange={(v) => updateConfig('backgroundColor', v)}
                    />
                    <ColorInput
                      label="Text"
                      value={config.textColor}
                      onChange={(v) => updateConfig('textColor', v)}
                    />
                    <ColorInput
                      label="Border"
                      value={config.borderColor}
                      onChange={(v) => updateConfig('borderColor', v)}
                    />
                    <ColorInput
                      label="User Bubble"
                      value={config.userBubbleColor}
                      onChange={(v) => updateConfig('userBubbleColor', v)}
                    />
                    <ColorInput
                      label="Agent Bubble"
                      value={config.agentBubbleColor}
                      onChange={(v) => updateConfig('agentBubbleColor', v)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Preview & Embed Code Panel */}
          <div className="space-y-4">
            {/* Live Preview */}
            {showPreview && (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <h3 className="font-semibold text-sm">Live Preview</h3>
                </div>
                <div 
                  className="relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900"
                  style={{ height: size.panelHeight + 100 }}
                >
                  {/* Simulated website content */}
                  <div className="absolute inset-0 p-6 opacity-30">
                    <div className="h-4 w-32 bg-slate-400 rounded mb-4" />
                    <div className="h-3 w-full bg-slate-300 rounded mb-2" />
                    <div className="h-3 w-4/5 bg-slate-300 rounded mb-2" />
                    <div className="h-3 w-2/3 bg-slate-300 rounded" />
                  </div>

                  {/* Widget Preview */}
                  <div 
                    className="absolute"
                    style={{
                      [config.position === 'bottom-right' ? 'right' : 'left']: 16,
                      bottom: 16,
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {!showPreview ? null : (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          style={{
                            width: size.panelWidth,
                            backgroundColor: config.backgroundColor,
                            borderRadius: config.borderRadius,
                            border: `1px solid ${config.borderColor}`,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                            overflow: 'hidden',
                          }}
                        >
                          {/* Header */}
                          <div 
                            style={{ 
                              padding: '16px',
                              borderBottom: `1px solid ${config.borderColor}`,
                            }}
                          >
                            <h3 style={{ 
                              margin: 0, 
                              fontSize: '16px', 
                              fontWeight: 600,
                              color: config.textColor,
                            }}>
                              {config.title}
                            </h3>
                            {config.subtitle && (
                              <p style={{ 
                                margin: '4px 0 0 0', 
                                fontSize: '12px',
                                color: config.textColor,
                                opacity: 0.6,
                              }}>
                                {config.subtitle}
                              </p>
                            )}
                          </div>

                          {/* Control Bar Preview */}
                          <div style={{
                            padding: '12px 16px',
                            borderBottom: `1px solid ${config.borderColor}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                          }}>
                            <div style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              backgroundColor: config.primaryColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: config.primaryTextColor,
                            }}>
                              <Phone className="h-4 w-4" />
                            </div>
                            <span style={{ fontSize: '13px', color: config.textColor }}>
                              {config.buttonText}
                            </span>
                          </div>

                          {/* Messages Preview */}
                          <div style={{ padding: '16px', minHeight: 150 }}>
                            {config.welcomeMessage && (
                              <div style={{
                                display: 'flex',
                                gap: '8px',
                              }}>
                                <div style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  backgroundColor: config.primaryColor,
                                  flexShrink: 0,
                                }} />
                                <div style={{
                                  backgroundColor: config.agentBubbleColor,
                                  padding: '10px 14px',
                                  borderRadius: '12px',
                                  maxWidth: '80%',
                                }}>
                                  <p style={{ 
                                    margin: 0, 
                                    fontSize: '14px',
                                    color: config.textColor,
                                  }}>
                                    {config.welcomeMessage}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

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
                  <span>Customize the widget appearance on the left</span>
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
      </div>
    </div>
  );
}
