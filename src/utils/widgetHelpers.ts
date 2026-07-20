/**
 * Shared utilities for widget loading across landing pages
 */

import { getApiBaseUrl } from "@/lib/api";
import { loadAndOpenWidget } from "@/utils/widgetLoader";
import { toFullConfig } from "@/utils/widgetConfig";

/**
 * Get the backend base URL for widget.js and API calls.
 * Uses the shared API client resolver so Netlify/marketing hosts hit Rails.
 */
function getApiBaseUrlForBackend(): string {
  return getApiBaseUrl();
}

/**
 * Get the backend base URL for widget.js and API calls
 * Derives from API base URL to ensure consistency
 */
export function getBackendBaseUrl(): string {
  const apiBaseUrl = getApiBaseUrlForBackend();
  // Remove API path suffix (/voiceable-api or legacy /api/v1) to get the origin
  return apiBaseUrl.replace(/\/(api\/v1|voiceable-api|voiceable_api)\/?$/, '');
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
    const configUrl = `${apiBaseUrl}/voiceable-api/widget/${apiKey}/${agentId}/config`;
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

