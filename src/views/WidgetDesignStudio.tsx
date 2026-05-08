"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PhoneOff } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
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
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Play,
  Loader2,
  Save,
  X,
  User,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { agentsApi, Agent, apiKeysApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { loadAndOpenWidget } from "@/utils/widgetLoader";
import { getBackendBaseUrl } from "@/utils/widgetHelpers";
import { 
  CustomWidgetConfig, 
  DEFAULT_CONFIG, 
  toFullConfig, 
  toApiConfig 
} from "@/utils/widgetConfig";

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

// Helper to generate sample messages with dynamic welcome message
const getSampleMessages = (welcomeMessage: string) => [
  { role: 'agent' as const, text: welcomeMessage || "Hi! How can I help you today?", timestamp: new Date(Date.now() - 120000) },
  { role: 'user' as const, text: "I have a question about your services.", timestamp: new Date(Date.now() - 90000) },
  { role: 'agent' as const, text: "Of course! I'd be happy to help. What would you like to know?", timestamp: new Date(Date.now() - 60000) },
];

// Widget sizes matching the actual widget
const WIDGET_SIZES = {
  small: { icon: 48, panelWidth: 320, panelHeight: 420 },
  medium: { icon: 56, panelWidth: 380, panelHeight: 500 },
  large: { icon: 64, panelWidth: 420, panelHeight: 580 },
};

interface WidgetPreviewProps {
  config: CustomWidgetConfig;
  agentName?: string;
}

// Call-only widget preview (minimal, no chat interface)
function CallOnlyWidgetPreview({ config }: WidgetPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const getIconComponent = (type: string) => {
    switch (type) {
      case 'chat': return MessageSquare;
      case 'headphones': return Headphones;
      case 'custom': return ImageIcon;
      default: return Phone;
    }
  };

  const Icon = getIconComponent(config.iconType);
  const size = WIDGET_SIZES[config.widgetSize];
  
  // Position styling - icon button at bottom
  const isBottomRight = config.position === 'bottom-right';
  const iconPosition = isBottomRight 
    ? { bottom: 24, right: 24 }
    : { bottom: 24, left: 24 };
  
  // Panel positioned above the icon button (smaller for call-only)
  const panelPosition = isBottomRight
    ? { bottom: size.icon + 32, right: 24 }
    : { bottom: size.icon + 32, left: 24 };

  // Call-only widget panel dimensions
  const callOnlyPanelHeight = 80;
  const callOnlyPanelWidth = 200;

  return (
    <div className="relative w-full h-full p-4">
      {/* Expanded Panel - Shows when clicked */}
      {isOpen && (
        <div 
          className="absolute flex items-center shadow-2xl overflow-hidden"
          style={{
            width: `${callOnlyPanelWidth}px`,
            height: `${callOnlyPanelHeight}px`,
            backgroundColor: config.backgroundColor,
            borderRadius: config.borderRadius,
            border: `1px solid ${config.borderColor}`,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            ...panelPosition,
            zIndex: 9,
          }}
        >
          {/* Person Avatar on left - Always shows User icon or custom image */}
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ml-3"
            style={{
              backgroundColor: config.iconType === 'custom' && config.customIconUrl 
                ? 'transparent' 
                : config.primaryColor,
              color: config.primaryTextColor,
            }}
          >
            {config.iconType === 'custom' && config.customIconUrl ? (
              <img 
                src={config.customIconUrl} 
                alt="Agent" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <User className="w-6 h-6" style={{ color: config.primaryTextColor }} />
            )}
          </div>

          {/* End Button on right */}
          <div className="flex-1 flex items-center justify-end pr-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="px-4 py-2 rounded-full border border-border cursor-pointer flex items-center gap-2 transition-opacity hover:opacity-90 bg-white"
              style={{
                color: config.textColor,
              }}
              aria-label="End call"
            >
              <PhoneOff className="w-4 h-4" />
              <span className="text-sm font-medium">End</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Button - Initial state (shown when panel is closed) */}
      <div 
        onClick={() => setIsOpen(true)}
        className="absolute rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-transform hover:scale-110"
        style={{
          width: `${size.icon}px`,
          height: `${size.icon}px`,
          backgroundColor: config.primaryColor,
          color: config.primaryTextColor,
          ...iconPosition,
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
        title={config.buttonText}
      >
        {config.iconType === 'custom' && config.customIconUrl ? (
          <img 
            src={config.customIconUrl} 
            alt="Widget icon" 
            style={{ width: 24, height: 24, objectFit: 'contain' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <Icon className="w-6 h-6" style={{ color: config.primaryTextColor }} />
        )}
      </div>
    </div>
  );
}

function WidgetPreview({ config, agentName }: WidgetPreviewProps) {
  const getIconComponent = (type: string) => {
    switch (type) {
      case 'chat': return MessageSquare;
      case 'headphones': return Headphones;
      case 'custom': return ImageIcon;
      default: return Phone;
    }
  };

  const Icon = getIconComponent(config.iconType);
  const size = WIDGET_SIZES[config.widgetSize];
  
  // Position styling - icon button at bottom
  const isBottomRight = config.position === 'bottom-right';
  const iconPosition = isBottomRight 
    ? { bottom: 24, right: 24 }
    : { bottom: 24, left: 24 };
  
  // Panel positioned above the icon button
  const panelPosition = isBottomRight
    ? { bottom: size.icon + 32, right: 24 }
    : { bottom: size.icon + 32, left: 24 };

  return (
    <div className="relative w-full h-full p-4">
      {/* Widget Panel Preview - Matching actual widget structure (shown when open) */}
      <div 
        className="absolute flex flex-col shadow-2xl overflow-hidden"
        style={{
          width: `${size.panelWidth}px`,
          height: `${size.panelHeight}px`,
          backgroundColor: config.backgroundColor,
          borderRadius: config.borderRadius,
          border: `1px solid ${config.borderColor}`,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          ...panelPosition,
          zIndex: 9,
        }}
      >
        {/* Header - Matching actual widget */}
        <div 
          className="flex items-center justify-between px-4 py-4 border-b"
          style={{ 
            borderColor: config.borderColor,
          }}
        >
          <div className="flex-1 min-w-0">
            <h3 
              className="font-semibold text-base m-0"
              style={{ color: config.textColor }}
            >
              {config.title}
            </h3>
            {config.subtitle && (
              <p 
                className="text-xs mt-1 mb-0 opacity-60"
                style={{ color: config.textColor }}
              >
                {config.subtitle}
              </p>
            )}
          </div>
          <button
            className="bg-transparent border-0 cursor-pointer p-1 rounded flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: config.textColor }}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Control Bar - Matching actual widget */}
        <div 
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ 
            borderColor: config.borderColor,
            backgroundColor: config.backgroundColor,
          }}
        >
          {/* Call Button */}
          <button
            className="w-9 h-9 rounded-full border-0 cursor-pointer flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: config.primaryColor,
              color: config.primaryTextColor,
            }}
            aria-label="Start call"
          >
            <Phone className="w-4 h-4" />
          </button>

          {/* Status Dot */}
          <div 
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: '#9ca3af' }}
          />

          {/* Status Text */}
          <span 
            className="text-sm flex-1"
            style={{ color: config.textColor }}
          >
            {config.buttonText}
          </span>
        </div>

        {/* Messages Area - Matching actual widget */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-4"
          style={{ 
            backgroundColor: config.backgroundColor,
          }}
        >
          {getSampleMessages(config.welcomeMessage).map((message, index) => (
            <div 
              key={index}
              className={cn(
                "flex gap-2 mb-3",
                message.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: message.role === 'agent' 
                    ? config.primaryColor 
                    : config.userBubbleColor,
                  color: message.role === 'agent' 
                    ? config.primaryTextColor 
                    : config.textColor,
                }}
              >
                {message.role === 'agent' ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Message Bubble */}
              <div 
                className="max-w-[80%] px-3.5 py-2.5 rounded-xl"
                style={{
                  backgroundColor: message.role === 'agent' 
                    ? config.agentBubbleColor 
                    : config.userBubbleColor,
                  color: config.textColor,
                }}
              >
                <p 
                  className="text-sm m-0 leading-snug"
                  style={{ color: config.textColor }}
                >
                  {message.text}
                </p>
                <p 
                  className="text-[10px] mt-1 mb-0 opacity-50"
                  style={{ color: config.textColor }}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Icon Button - Matching actual widget */}
      <div 
        className="absolute rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-transform hover:scale-110"
        style={{
          width: `${size.icon}px`,
          height: `${size.icon}px`,
          backgroundColor: config.primaryColor,
          color: config.primaryTextColor,
          ...iconPosition,
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        {config.iconType === 'custom' && config.customIconUrl ? (
          <img 
            src={config.customIconUrl} 
            alt="Widget icon" 
            style={{ width: 24, height: 24, objectFit: 'contain' }}
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <Icon className="w-6 h-6" style={{ color: config.primaryTextColor }} />
        )}
      </div>
    </div>
  );
}

export default function WidgetDesignStudio() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();
  const { toast } = useToast();
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<CustomWidgetConfig>(DEFAULT_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const initialConfigRef = useRef<string>('');
  
  const [expandedSections, setExpandedSections] = useState({
    branding: false,
    icon: false,
    styling: false,
    colors: false,
  });

  // Fetch or create API key
  const fetchOrCreateApiKey = useCallback(async () => {
    try {
      const response = await apiKeysApi.list();
      const existingKeys = response.data || [];
      
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
        }
      } else {
        setApiKey(widgetKey.key_value);
      }
    } catch (error) {
      console.error('Failed to fetch/create API key:', error);
    }
  }, []);

  // Load agent data and API key
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch agent and API key in parallel
        const [agentResponse] = await Promise.all([
          agentsApi.get(id),
          fetchOrCreateApiKey(),
        ]);

        if (agentResponse.data) {
          setAgent(agentResponse.data);
          const loadedConfig = toFullConfig(agentResponse.data.widget_config);
          setConfig(loadedConfig);
          initialConfigRef.current = JSON.stringify(loadedConfig);
        }
      } catch (error) {
        console.error('Failed to load agent:', error);
        toast({
          title: 'Error',
          description: 'Failed to load agent data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, toast, fetchOrCreateApiKey]);

  // Track changes
  useEffect(() => {
    const currentConfig = JSON.stringify(config);
    setHasChanges(currentConfig !== initialConfigRef.current);
  }, [config]);

  const updateConfig = useCallback((key: keyof CustomWidgetConfig, value: string | 'chat' | 'call-only') => {
    setConfig(prev => ({ ...prev, [key]: value }));
    
    // Clear validation error when user starts typing
    if (key === 'welcomeMessage' && typeof value === 'string' && value.trim().length > 0) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.welcomeMessage;
        return newErrors;
      });
    }
  }, []);
  
  // Validate config
  const validateConfig = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    
    if (!config.welcomeMessage || config.welcomeMessage.trim().length === 0) {
      errors.welcomeMessage = 'Welcome message is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [config.welcomeMessage]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = async () => {
    if (!id) return;

    // Validate before saving
    if (!validateConfig()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before saving.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      await agentsApi.update(id, {
        widget_config: toApiConfig(config),
      });
      initialConfigRef.current = JSON.stringify(config);
      setHasChanges(false);
      toast({
        title: 'Saved',
        description: 'Widget design saved successfully.',
      });
    } catch (error) {
      console.error('Failed to save widget config:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save widget configuration.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push(`/assistants/${id}?tab=widget`);
  };


  const handleLivePreview = async () => {
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
        title: "API Key Missing",
        description: "Could not load the widget API key. Please try again later.",
        variant: "destructive",
      });
      return;
    }

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
        customIconUrl: config.customIconUrl,
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
  };

  const getIconComponent = (type: string) => {
    switch (type) {
      case 'chat': return MessageSquare;
      case 'headphones': return Headphones;
      case 'custom': return ImageIcon;
      default: return Phone;
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Widget Design Studio</h1>
            <p className="text-sm text-muted-foreground">
              {agent?.name || 'Customize your widget appearance'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleLivePreview}
            disabled={!agent?.elevenlabs_agent_id || !apiKey}
          >
            <Play className="h-4 w-4 mr-2" />
            Live Preview
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving || Object.keys(validationErrors).length > 0}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Configuration */}
        <div className="w-[400px] border-r border-border overflow-y-auto p-6 space-y-4">
          {/* Widget Type Selection */}
          <div className="border border-border rounded-lg overflow-hidden p-4">
            <div>
              <h3 className="text-base font-semibold mb-2">Widget Type</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose between a full chat widget or a minimal call-only widget
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateConfig('widgetType', 'chat')}
                  className={cn(
                    "flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left",
                    config.widgetType === 'chat'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <MessageSquare className="h-5 w-5 mb-2" />
                  <span className="text-sm font-medium">Chat Widget</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Full interface with messages and text input
                  </span>
                </button>
                <button
                  onClick={() => updateConfig('widgetType', 'call-only')}
                  className={cn(
                    "flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left",
                    config.widgetType === 'call-only'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Phone className="h-5 w-5 mb-2" />
                  <span className="text-sm font-medium">Call Only</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Minimal widget focused on voice calls
                  </span>
                </button>
              </div>
            </div>
          </div>

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
                  className="space-y-4 pt-2"
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
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Welcome Message <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      value={config.welcomeMessage}
                      onChange={(e) => updateConfig('welcomeMessage', e.target.value)}
                      onBlur={() => {
                        // Validate on blur
                        if (!config.welcomeMessage || config.welcomeMessage.trim().length === 0) {
                          setValidationErrors(prev => ({
                            ...prev,
                            welcomeMessage: 'Welcome message is required',
                          }));
                        }
                      }}
                      placeholder="Hi! How can I help you today?"
                      className={cn(
                        "bg-secondary/50 min-h-[80px]",
                        validationErrors.welcomeMessage && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                    {validationErrors.welcomeMessage && (
                      <p className="text-xs text-destructive mt-1">
                        {validationErrors.welcomeMessage}
                      </p>
                    )}
                    {!validationErrors.welcomeMessage && (
                      <p className="text-xs text-muted-foreground mt-1">
                        This message will be displayed when the conversation starts
                      </p>
                    )}
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
                  className="space-y-4 pt-2"
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
                  className="space-y-4 pt-2"
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
                  className="divide-y divide-border/50 pt-2"
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

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
          <div className="h-full flex items-center justify-center p-8">
            <div className="relative w-full max-w-lg h-[600px] bg-white dark:bg-slate-950 rounded-xl shadow-lg overflow-hidden border border-border">
              {/* Browser Chrome */}
              <div className="h-8 bg-muted/50 border-b border-border flex items-center px-3 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-background rounded-md px-3 py-1 text-xs text-muted-foreground">
                    yourwebsite.com
                  </div>
                </div>
              </div>
              
              {/* Preview Content */}
              <div className="h-[calc(100%-32px)] relative bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
                {config.widgetType === 'call-only' ? (
                  <CallOnlyWidgetPreview config={config} agentName={agent?.name} />
                ) : (
                  <WidgetPreview config={config} agentName={agent?.name} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

