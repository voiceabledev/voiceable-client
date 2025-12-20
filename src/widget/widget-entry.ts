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

// Initialize the widget
function init() {
  const script = getCurrentScript();
  
  if (!script) {
    console.error('[VoiceWidget] Could not find script tag with data-agent-id');
    return;
  }
  
  const config = parseConfig(script);
  const apiBaseUrl = getApiBaseUrl(script);
  
  if (!config.agentId || !config.apiKey) {
    console.error('[VoiceWidget] Missing required configuration. Please provide data-agent-id and data-api-key attributes.');
    return;
  }
  
  // Create container element
  const container = document.createElement('div');
  container.id = 'voice-agent-widget-root';
  document.body.appendChild(container);
  
  // Mount React component
  const root = createRoot(container);
  root.render(
    createElement(EmbeddableWidget, { config, apiBaseUrl })
  );
  
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

