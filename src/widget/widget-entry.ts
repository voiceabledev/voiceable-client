/**
 * Widget Entry Point
 * 
 * This file is the entry point for the standalone widget bundle.
 * It reads configuration from the script tag's data attributes and
 * mounts the EmbeddableWidget component to the DOM.
 * 
 * Usage:
 * <script 
 *   src="https://yourdomain.com/widget.js"
 *   data-agent-id="agent_xxx"
 *   data-api-key="pk_xxx"
 *   data-position="bottom-right"
 *   data-primary-color="#000000"
 *   data-title="Need help?"
 *   async
 * ></script>
 */

import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import { EmbeddableWidget } from './EmbeddableWidget';
import type { EmbeddableWidgetConfig } from './types';

// Find the current script tag
function getCurrentScript(): HTMLScriptElement | null {
  // Try to find by known attributes
  const scripts = document.querySelectorAll('script[data-agent-id]');
  if (scripts.length > 0) {
    return scripts[scripts.length - 1] as HTMLScriptElement;
  }
  
  // Fallback to currentScript (may not work in all browsers)
  if (document.currentScript) {
    return document.currentScript as HTMLScriptElement;
  }
  
  return null;
}

// Cache for widget config to prevent repeated fetches
const configCache = new Map<string, Partial<EmbeddableWidgetConfig> | null>();
// Track ongoing fetches to prevent concurrent requests
const ongoingFetches = new Map<string, Promise<Partial<EmbeddableWidgetConfig> | null>>();
// Track failed fetches to prevent retrying immediately
const failedFetches = new Set<string>();

// Fetch widget config from API
async function fetchWidgetConfig(apiBaseUrl: string, apiKey: string, agentId: string): Promise<Partial<EmbeddableWidgetConfig> | null> {
  // Create cache key
  const cacheKey = `${apiBaseUrl}:${apiKey}:${agentId}`;
  
  // Return cached config if available
  if (configCache.has(cacheKey)) {
    return configCache.get(cacheKey) || null;
  }
  
  // If there's already an ongoing fetch for this key, return that promise
  if (ongoingFetches.has(cacheKey)) {
    return ongoingFetches.get(cacheKey)!;
  }
  
  // If this fetch recently failed, don't retry immediately (prevent infinite loops)
  if (failedFetches.has(cacheKey)) {
    console.warn('[VoiceWidget] Config fetch recently failed, using data attributes only');
    return null;
  }
  
  // Create fetch promise
  const fetchPromise = (async () => {
    try {
      const url = `${apiBaseUrl}/api/v1/widget/${apiKey}/${agentId}/config`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn('[VoiceWidget] Failed to fetch widget config from API, using data attributes only');
        configCache.set(cacheKey, null);
        failedFetches.add(cacheKey);
        // Clear the failed flag after 5 seconds to allow retry
        setTimeout(() => failedFetches.delete(cacheKey), 5000);
        return null;
      }
      
      const data = await response.json();
      const widgetConfig = data.data?.widget_config || {};
      
      // Convert flat config to nested structure expected by EmbeddableWidget
      const config: Partial<EmbeddableWidgetConfig> = {};
      
      if (widgetConfig.title) config.title = widgetConfig.title;
      if (widgetConfig.subtitle) config.subtitle = widgetConfig.subtitle;
      if (widgetConfig.buttonText) config.buttonText = widgetConfig.buttonText;
      if (widgetConfig.welcomeMessage) config.welcomeMessage = widgetConfig.welcomeMessage;
      if (widgetConfig.iconType) config.iconType = widgetConfig.iconType;
      if (widgetConfig.customIconUrl) config.customIconUrl = widgetConfig.customIconUrl;
      if (widgetConfig.position) config.position = widgetConfig.position;
      if (widgetConfig.widgetSize) config.widgetSize = widgetConfig.widgetSize;
      if (widgetConfig.borderRadius) config.borderRadius = widgetConfig.borderRadius;
      
      // Parse colors
      const colors: Partial<EmbeddableWidgetConfig['colors']> = {};
      if (widgetConfig.primaryColor) colors.primary = widgetConfig.primaryColor;
      if (widgetConfig.primaryTextColor) colors.primaryText = widgetConfig.primaryTextColor;
      if (widgetConfig.backgroundColor) colors.background = widgetConfig.backgroundColor;
      if (widgetConfig.textColor) colors.text = widgetConfig.textColor;
      if (widgetConfig.borderColor) colors.border = widgetConfig.borderColor;
      if (widgetConfig.userBubbleColor) colors.userBubble = widgetConfig.userBubbleColor;
      if (widgetConfig.agentBubbleColor) colors.agentBubble = widgetConfig.agentBubbleColor;
      
      if (Object.keys(colors).length > 0) {
        config.colors = colors as EmbeddableWidgetConfig['colors'];
      }
      
      // Cache the config
      configCache.set(cacheKey, config);
      return config;
    } catch (error) {
      console.warn('[VoiceWidget] Error fetching widget config from API:', error);
      configCache.set(cacheKey, null);
      failedFetches.add(cacheKey);
      // Clear the failed flag after 5 seconds to allow retry
      setTimeout(() => failedFetches.delete(cacheKey), 5000);
      return null;
    } finally {
      // Remove from ongoing fetches
      ongoingFetches.delete(cacheKey);
    }
  })();
  
  // Store the promise
  ongoingFetches.set(cacheKey, fetchPromise);
  
  return fetchPromise;
}

// Parse data attributes from script tag
function parseConfig(script: HTMLScriptElement): Partial<EmbeddableWidgetConfig> & { agentId: string; apiKey: string } {
  const dataset = script.dataset;
  
  // Required fields
  const agentId = dataset.agentId || '';
  const apiKey = dataset.apiKey || '';
  
  if (!agentId || !apiKey) {
    console.error('[VoiceWidget] Missing required data-agent-id or data-api-key attributes');
  }
  
  // Parse colors
  const colors: Partial<EmbeddableWidgetConfig['colors']> = {};
  if (dataset.primaryColor) colors.primary = dataset.primaryColor;
  if (dataset.primaryTextColor) colors.primaryText = dataset.primaryTextColor;
  if (dataset.backgroundColor) colors.background = dataset.backgroundColor;
  if (dataset.textColor) colors.text = dataset.textColor;
  if (dataset.borderColor) colors.border = dataset.borderColor;
  if (dataset.userBubbleColor) colors.userBubble = dataset.userBubbleColor;
  if (dataset.agentBubbleColor) colors.agentBubble = dataset.agentBubbleColor;
  
  // Build config object
  const config: Partial<EmbeddableWidgetConfig> & { agentId: string; apiKey: string } = {
    agentId,
    apiKey,
  };
  
  // Optional string fields
  if (dataset.title) config.title = dataset.title;
  if (dataset.subtitle) config.subtitle = dataset.subtitle;
  if (dataset.buttonText) config.buttonText = dataset.buttonText;
  if (dataset.welcomeMessage) config.welcomeMessage = dataset.welcomeMessage;
  if (dataset.customIconUrl) config.customIconUrl = dataset.customIconUrl;
  if (dataset.borderRadius) config.borderRadius = dataset.borderRadius;
  
  // Position
  if (dataset.position && (dataset.position === 'bottom-right' || dataset.position === 'bottom-left')) {
    config.position = dataset.position;
  }
  
  // Icon type
  if (dataset.iconType && ['phone', 'chat', 'headphones', 'custom'].includes(dataset.iconType)) {
    config.iconType = dataset.iconType as EmbeddableWidgetConfig['iconType'];
  }
  
  // Widget size
  if (dataset.widgetSize && ['small', 'medium', 'large'].includes(dataset.widgetSize)) {
    config.widgetSize = dataset.widgetSize as EmbeddableWidgetConfig['widgetSize'];
  }
  
  // Boolean fields
  if (dataset.autoOpen !== undefined) {
    config.autoOpen = dataset.autoOpen === 'true';
  }
  
  // Numeric fields
  if (dataset.openDelay) {
    const delay = parseInt(dataset.openDelay, 10);
    if (!isNaN(delay)) config.openDelay = delay;
  }
  
  // Add colors if any were specified
  if (Object.keys(colors).length > 0) {
    config.colors = colors as EmbeddableWidgetConfig['colors'];
  }
  
  return config;
}

// Get API base URL from script src
function getApiBaseUrl(script: HTMLScriptElement): string {
  // If explicitly provided
  if (script.dataset.apiBaseUrl) {
    return script.dataset.apiBaseUrl;
  }
  
  // Try to extract from script src
  if (script.src) {
    try {
      const url = new URL(script.src);
      return `${url.protocol}//${url.host}`;
    } catch {
      // Fallback to empty (same origin)
      return '';
    }
  }
  
  return '';
}

// Track if widget is already initialized to prevent multiple initializations
let isInitialized = false;

// Initialize the widget
async function init() {
  // Prevent multiple initializations
  if (isInitialized) {
    return;
  }
  
  // Check if container already exists
  if (document.getElementById('voice-agent-widget-root')) {
    console.warn('[VoiceWidget] Widget already initialized, skipping');
    isInitialized = true;
    return;
  }
  
  const script = getCurrentScript();
  
  if (!script) {
    console.error('[VoiceWidget] Could not find script tag with data-agent-id');
    return;
  }
  
  const dataAttributesConfig = parseConfig(script);
  const apiBaseUrl = getApiBaseUrl(script);
  
  if (!dataAttributesConfig.agentId || !dataAttributesConfig.apiKey) {
    console.error('[VoiceWidget] Missing required configuration. Please provide data-agent-id and data-api-key attributes.');
    return;
  }
  
  // Mark as initializing
  isInitialized = true;
  
  // Fetch widget config from API (saved in database)
  let apiConfig: Partial<EmbeddableWidgetConfig> | null = null;
  if (apiBaseUrl) {
    apiConfig = await fetchWidgetConfig(apiBaseUrl, dataAttributesConfig.apiKey, dataAttributesConfig.agentId);
  }
  
  // Merge configs: API config as base, data attributes override
  const finalConfig: Partial<EmbeddableWidgetConfig> & { agentId: string; apiKey: string } = {
    agentId: dataAttributesConfig.agentId,
    apiKey: dataAttributesConfig.apiKey,
    ...(apiConfig || {}),
    // Data attributes override API config
    ...(dataAttributesConfig.title && { title: dataAttributesConfig.title }),
    ...(dataAttributesConfig.subtitle && { subtitle: dataAttributesConfig.subtitle }),
    ...(dataAttributesConfig.buttonText && { buttonText: dataAttributesConfig.buttonText }),
    ...(dataAttributesConfig.welcomeMessage && { welcomeMessage: dataAttributesConfig.welcomeMessage }),
    ...(dataAttributesConfig.iconType && { iconType: dataAttributesConfig.iconType }),
    ...(dataAttributesConfig.customIconUrl && { customIconUrl: dataAttributesConfig.customIconUrl }),
    ...(dataAttributesConfig.position && { position: dataAttributesConfig.position }),
    ...(dataAttributesConfig.widgetSize && { widgetSize: dataAttributesConfig.widgetSize }),
    ...(dataAttributesConfig.borderRadius && { borderRadius: dataAttributesConfig.borderRadius }),
    ...(dataAttributesConfig.autoOpen !== undefined && { autoOpen: dataAttributesConfig.autoOpen }),
    ...(dataAttributesConfig.openDelay !== undefined && { openDelay: dataAttributesConfig.openDelay }),
  };
  
  // Merge colors: API colors as base, data attribute colors override
  if (apiConfig?.colors || dataAttributesConfig.colors) {
    finalConfig.colors = {
      ...(apiConfig?.colors || {}),
      ...(dataAttributesConfig.colors || {}),
    } as EmbeddableWidgetConfig['colors'];
  }
  
  // Check again if container exists (might have been created while fetching config)
  let container = document.getElementById('voice-agent-widget-root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'voice-agent-widget-root';
    document.body.appendChild(container);
  }
  
  // Mount React component
  console.log('[VoiceWidget] About to mount EmbeddableWidget', { finalConfig, apiBaseUrl });
  const root = createRoot(container);
  
  try {
    root.render(
      createElement(EmbeddableWidget, { config: finalConfig, apiBaseUrl })
    );
    console.log('[VoiceWidget] EmbeddableWidget mounted successfully');
  } catch (error) {
    console.error('[VoiceWidget] Error mounting widget:', error);
    throw error;
  }

  console.log('[VoiceWidget] Initialized successfully');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for potential programmatic usage
export { EmbeddableWidget };
export type { EmbeddableWidgetConfig } from './types';

