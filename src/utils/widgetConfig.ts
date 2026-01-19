/**
 * Shared widget configuration utilities
 * Used by WidgetTab and WidgetDesignStudio
 */

import type { WidgetConfig } from '@/lib/api';

// Re-export the type for convenience
export type { WidgetConfig };

// Extended config with all required fields (for internal use)
export interface CustomWidgetConfig {
  widgetType: 'chat' | 'call-only';
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

export const DEFAULT_CONFIG: CustomWidgetConfig = {
  widgetType: 'chat',
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

/**
 * Convert API WidgetConfig (partial) to full CustomWidgetConfig (with defaults)
 */
export function toFullConfig(config?: WidgetConfig | null): CustomWidgetConfig {
  if (!config) {
    return { ...DEFAULT_CONFIG };
  }

  return {
    widgetType: config.widgetType ?? DEFAULT_CONFIG.widgetType,
    title: config.title ?? DEFAULT_CONFIG.title,
    subtitle: config.subtitle ?? DEFAULT_CONFIG.subtitle,
    buttonText: config.buttonText ?? DEFAULT_CONFIG.buttonText,
    welcomeMessage: config.welcomeMessage ?? DEFAULT_CONFIG.welcomeMessage,
    iconType: config.iconType ?? DEFAULT_CONFIG.iconType,
    customIconUrl: config.customIconUrl ?? DEFAULT_CONFIG.customIconUrl,
    position: config.position ?? DEFAULT_CONFIG.position,
    widgetSize: config.widgetSize ?? DEFAULT_CONFIG.widgetSize,
    primaryColor: config.primaryColor ?? DEFAULT_CONFIG.primaryColor,
    primaryTextColor: config.primaryTextColor ?? DEFAULT_CONFIG.primaryTextColor,
    backgroundColor: config.backgroundColor ?? DEFAULT_CONFIG.backgroundColor,
    textColor: config.textColor ?? DEFAULT_CONFIG.textColor,
    borderColor: config.borderColor ?? DEFAULT_CONFIG.borderColor,
    userBubbleColor: config.userBubbleColor ?? DEFAULT_CONFIG.userBubbleColor,
    agentBubbleColor: config.agentBubbleColor ?? DEFAULT_CONFIG.agentBubbleColor,
    borderRadius: config.borderRadius ?? DEFAULT_CONFIG.borderRadius,
  };
}

/**
 * Convert CustomWidgetConfig to API WidgetConfig format
 */
export function toApiConfig(config: CustomWidgetConfig): WidgetConfig {
  return {
    widgetType: config.widgetType,
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
  };
}
