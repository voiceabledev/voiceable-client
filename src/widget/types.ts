/**
 * Configuration for the embeddable voice widget
 */
export interface EmbeddableWidgetConfig {
  // Agent configuration
  agentId: string;
  apiKey: string;
  
  // Branding
  title: string;
  subtitle?: string;
  buttonText: string;
  welcomeMessage?: string;
  
  // Icon configuration
  iconType: 'phone' | 'chat' | 'headphones' | 'custom';
  customIconUrl?: string;
  
  // Positioning
  position: 'bottom-right' | 'bottom-left';
  
  // Sizing
  widgetSize: 'small' | 'medium' | 'large';
  
  // Colors
  colors: {
    primary: string;       // Main accent color (button, icon background)
    primaryText: string;   // Text on primary color
    background: string;    // Panel background
    text: string;          // Main text color
    border: string;        // Border color
    userBubble: string;    // User message background
    agentBubble: string;   // Agent message background
  };
  
  // Additional styling
  borderRadius?: string;
  
  // Behavior
  autoOpen?: boolean;      // Auto-open on page load
  openDelay?: number;      // Delay before auto-open (ms)
}

/**
 * Default configuration values
 */
export const DEFAULT_WIDGET_CONFIG: Omit<EmbeddableWidgetConfig, 'agentId' | 'apiKey'> = {
  title: 'Need help?',
  subtitle: 'Talk to our AI assistant',
  buttonText: 'Start a call',
  welcomeMessage: 'Hi! How can I help you today?',
  iconType: 'phone',
  position: 'bottom-right',
  widgetSize: 'medium',
  colors: {
    primary: '#000000',
    primaryText: '#ffffff',
    background: '#ffffff',
    text: '#1f2937',
    border: '#e5e7eb',
    userBubble: '#f3f4f6',
    agentBubble: '#eff6ff',
  },
  borderRadius: '16px',
  autoOpen: false,
  openDelay: 3000,
};

/**
 * Size configurations for the widget
 */
export const WIDGET_SIZES = {
  small: {
    icon: 48,
    panelWidth: 320,
    panelHeight: 420,
  },
  medium: {
    icon: 56,
    panelWidth: 380,
    panelHeight: 500,
  },
  large: {
    icon: 64,
    panelWidth: 420,
    panelHeight: 580,
  },
} as const;

/**
 * Position configurations
 */
export const WIDGET_POSITIONS = {
  'bottom-right': {
    bottom: 24,
    right: 24,
  },
  'bottom-left': {
    bottom: 24,
    left: 24,
  },
} as const;

/**
 * Message type for chat transcript
 */
export interface WidgetMessage {
  id: string;
  role: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

/**
 * Widget state for managing the conversation
 */
export type WidgetStatus = 'idle' | 'connecting' | 'connected' | 'speaking' | 'listening';

