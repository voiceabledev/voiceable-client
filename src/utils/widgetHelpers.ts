/**
 * Shared utilities for widget loading across landing pages
 */

import { loadAndOpenWidget } from "@/utils/widgetLoader";
import { toFullConfig } from "@/utils/widgetConfig";

/**
 * Get the backend base URL for widget.js and API calls
 * Uses the same logic as the API client to ensure consistency
 */
function getApiBaseUrlForBackend(): string {
  // Use env var if available (set at build time)
  if (import.meta.env.VITE_API_BASE_URL) {
    const url = import.meta.env.VITE_API_BASE_URL;
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }

  // Check for runtime config (useful for Heroku/dynamic configs)
  if (typeof window !== 'undefined') {
    const runtimeConfig = (window as any).__API_BASE_URL__;
    if (runtimeConfig) {
      return runtimeConfig.endsWith('/') ? runtimeConfig.slice(0, -1) : runtimeConfig;
    }

    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // If on Heroku or production domain, construct API URL
    if (hostname.includes('herokuapp.com') || hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
      return '/api/v1';
    }
    
    // For localhost development - check what port the frontend is on and infer backend
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Default to 3000, but can be overridden with VITE_API_BASE_URL
      return 'http://localhost:3000/api/v1';
    }
    
    // For other production domains, try to construct API URL
    return `${protocol}//${hostname}/api/v1`;
  }

  // Default fallback
  return 'http://localhost:3000/api/v1';
}

/**
 * Get the backend base URL for widget.js and API calls
 * Derives from API base URL to ensure consistency
 */
export function getBackendBaseUrl(): string {
  const apiBaseUrl = getApiBaseUrlForBackend();
  // Remove /api/v1 suffix to get the base URL
  return apiBaseUrl.replace(/\/api\/v1\/?$/, '');
}

/**
 * Widget configuration for demo agents
 */
export interface WidgetAgentConfig {
  agentId: string;
  apiKey: string;
}

/**
 * Default demo agent configuration
 */
export const DEFAULT_DEMO_AGENT: WidgetAgentConfig = {
  agentId: "agent_6601kcwx1v6pf87b60mvr05edzzh",
  apiKey: "pk_live_6cc5dc096e0317aadd8fd91bc4732795a00d91fdc57768a38c4de72ab353f930",
};

/**
 * Fetches widget config from API and opens the widget with all configuration parameters
 * Falls back to default config if API fetch fails
 */
export async function openWidgetWithConfig(
  agentConfig: WidgetAgentConfig = DEFAULT_DEMO_AGENT
): Promise<void> {
  const { agentId, apiKey } = agentConfig;
  const apiBaseUrl = getBackendBaseUrl();

  try {
    // Fetch widget config from API
    const configUrl = `${apiBaseUrl}/api/v1/widget/${apiKey}/${agentId}/config`;
    const response = await fetch(configUrl);
    
    let config;
    if (response.ok) {
      const data = await response.json();
      const widgetConfig = data.data?.widget_config || {};
      config = toFullConfig(widgetConfig);
    } else {
      // Fallback to default config if fetch fails
      config = toFullConfig(null);
    }

    // Pass all config parameters to loadAndOpenWidget
    await loadAndOpenWidget({
      agentId: agentId,
      apiKey: apiKey,
      apiBaseUrl: apiBaseUrl,
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
    console.error("Failed to load widget config:", error);
    // Fallback: load widget with default config
    const defaultConfig = toFullConfig(null);
    await loadAndOpenWidget({
      agentId: agentId,
      apiKey: apiKey,
      apiBaseUrl: apiBaseUrl,
      title: defaultConfig.title,
      subtitle: defaultConfig.subtitle,
      buttonText: defaultConfig.buttonText,
      welcomeMessage: defaultConfig.welcomeMessage,
      iconType: defaultConfig.iconType,
      customIconUrl: defaultConfig.customIconUrl,
      position: defaultConfig.position,
      widgetSize: defaultConfig.widgetSize,
      primaryColor: defaultConfig.primaryColor,
      primaryTextColor: defaultConfig.primaryTextColor,
      backgroundColor: defaultConfig.backgroundColor,
      textColor: defaultConfig.textColor,
      borderColor: defaultConfig.borderColor,
      userBubbleColor: defaultConfig.userBubbleColor,
      agentBubbleColor: defaultConfig.agentBubbleColor,
      borderRadius: defaultConfig.borderRadius,
    });
  }
}

