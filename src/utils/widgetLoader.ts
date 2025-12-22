/**
 * Utility to load and trigger the voice agent widget
 */

interface WidgetConfig {
  agentId: string;
  apiKey: string;
  apiBaseUrl: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  welcomeMessage?: string;
  iconType?: string;
  position?: string;
  widgetSize?: string;
  primaryColor?: string;
  primaryTextColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  userBubbleColor?: string;
  agentBubbleColor?: string;
  borderRadius?: string;
}

let widgetScriptLoaded = false;
let widgetInitialized = false;
let widgetLoadingInProgress = false;

/**
 * Loads the widget script and triggers it to open
 */
export async function loadAndOpenWidget(config: WidgetConfig): Promise<void> {
  // Prevent multiple simultaneous loads
  if (widgetLoadingInProgress) {
    console.warn('[WidgetLoader] Widget load already in progress, skipping');
    return;
  }
  
  widgetLoadingInProgress = true;
  
  try {
  // Load the script if not already loaded
  if (!widgetScriptLoaded) {
    await loadWidgetScript(config);
  }

  // Wait for widget to be initialized
  await waitForWidgetInitialization();

  // Trigger the widget to open and start
  triggerWidgetOpen();
  } finally {
    widgetLoadingInProgress = false;
  }
}

/**
 * Loads the widget script dynamically
 */
function loadWidgetScript(config: WidgetConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script is already in the DOM
    const existingScript = document.querySelector(
      `script[src="${config.apiBaseUrl}/widget.js"]`
    );
    
    if (existingScript) {
      widgetScriptLoaded = true;
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `${config.apiBaseUrl}/widget.js`;
    script.async = true;

    // Set all data attributes
    // Use config values first, fallback to environment variables
    const agentId = config.agentId || import.meta.env.VITE_AGENT_ID || '';
    const apiKey = config.apiKey || import.meta.env.VITE_AGENT_API_KEY || '';
    
    script.setAttribute('data-agent-id', agentId);
    script.setAttribute('data-api-key', apiKey);
    script.setAttribute('data-api-base-url', config.apiBaseUrl);
    
    if (config.title) script.setAttribute('data-title', config.title);
    if (config.subtitle) script.setAttribute('data-subtitle', config.subtitle);
    if (config.buttonText) script.setAttribute('data-button-text', config.buttonText);
    if (config.welcomeMessage) script.setAttribute('data-welcome-message', config.welcomeMessage);
    if (config.iconType) script.setAttribute('data-icon-type', config.iconType);
    if (config.position) script.setAttribute('data-position', config.position);
    if (config.widgetSize) script.setAttribute('data-widget-size', config.widgetSize);
    if (config.primaryColor) script.setAttribute('data-primary-color', config.primaryColor);
    if (config.primaryTextColor) script.setAttribute('data-primary-text-color', config.primaryTextColor);
    if (config.backgroundColor) script.setAttribute('data-background-color', config.backgroundColor);
    if (config.textColor) script.setAttribute('data-text-color', config.textColor);
    if (config.borderColor) script.setAttribute('data-border-color', config.borderColor);
    if (config.userBubbleColor) script.setAttribute('data-user-bubble-color', config.userBubbleColor);
    if (config.agentBubbleColor) script.setAttribute('data-agent-bubble-color', config.agentBubbleColor);
    if (config.borderRadius) script.setAttribute('data-border-radius', config.borderRadius);

    script.onload = () => {
      widgetScriptLoaded = true;
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Failed to load widget script'));
    };

    document.head.appendChild(script);
  });
}

/**
 * Waits for the widget to be initialized
 */
function waitForWidgetInitialization(): Promise<void> {
  return new Promise((resolve) => {
    if (widgetInitialized) {
      resolve();
      return;
    }

    // Check if widget container exists
    const checkWidget = () => {
      const container = document.getElementById('voice-agent-widget-root');
      if (container) {
        widgetInitialized = true;
        resolve();
      } else {
        // Wait a bit and check again
        setTimeout(checkWidget, 100);
      }
    };

    // Start checking after a short delay to allow script to execute
    setTimeout(checkWidget, 100);
  });
}

/**
 * Triggers the widget to open and start the conversation
 */
function triggerWidgetOpen(): void {
  const container = document.getElementById('voice-agent-widget-root');
  if (!container) {
    console.error('Widget container not found');
    return;
  }

  // Try multiple times to find and click the button (widget might still be initializing)
  let attempts = 0;
  const maxAttempts = 10;
  
  const tryOpenWidget = () => {
    attempts++;
    
    // First, try to find and click the floating button to open the panel
    const widgetButton = container.querySelector('button[aria-label="Open chat"]') as HTMLButtonElement;
    if (widgetButton) {
      widgetButton.click();
      
      // Wait for the panel to open, then click the start button
      setTimeout(() => {
        const startButton = container.querySelector('button[aria-label="Start call"]') as HTMLButtonElement;
        if (startButton) {
          startButton.click();
        } else {
          // If start button not found, try again after a short delay
          if (attempts < maxAttempts) {
            setTimeout(tryOpenWidget, 200);
          }
        }
      }, 400);
    } else {
      // If floating button not found, check if panel is already open
      const startButton = container.querySelector('button[aria-label="Start call"]') as HTMLButtonElement;
      if (startButton) {
        startButton.click();
      } else {
        // Try again if we haven't exceeded max attempts
        if (attempts < maxAttempts) {
          setTimeout(tryOpenWidget, 200);
        } else {
          console.warn('Could not find widget buttons after multiple attempts');
        }
      }
    }
  };
  
  // Start trying after a short delay to ensure widget is ready
  setTimeout(tryOpenWidget, 100);
}

