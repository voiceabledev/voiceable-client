export interface WidgetConfig {
  variant: "tiny" | "compact" | "full";
  placement: string;
  avatarType: "orb" | "link" | "image";
  orbFirstColor: string;
  orbSecondColor: string;
  termsEnabled: boolean;
  termsContent: string;
  colors: {
    base: string;
    baseHover: string;
    baseActive: string;
    baseBorder: string;
    baseSubtle: string;
    basePrimary: string;
    baseError: string;
    accent: string;
    accentHover: string;
    accentActive: string;
    accentBorder: string;
    accentSubtle: string;
    accentPrimary: string;
  };
  overlayPadding: string;
  buttonRadius: string;
  
  // Custom widget configuration
  customWidget?: {
    enabled: boolean;
    title: string;
    subtitle: string;
    buttonText: string;
    welcomeMessage: string;
    iconType: 'phone' | 'chat' | 'headphones' | 'custom';
    customIconUrl?: string;
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
  };
}

/**
 * Generates HTML content for the ElevenLabs widget preview
 * @param agentId - The ElevenLabs agent ID
 * @param config - Widget configuration object
 * @returns Complete HTML document as string
 */
export function generateWidgetPreviewHTML(agentId: string, config: WidgetConfig): string {
  // Build widget attributes
  const widgetAttributes: string[] = [`agent-id="${agentId}"`];
  
  // Add variant if specified
  if (config.variant) {
    widgetAttributes.push(`variant="${config.variant}"`);
  }
  
  // Add avatar configuration
  if (config.avatarType === "orb") {
    // For orb, we can use CSS custom properties to style it
    // The widget will use the orb colors from CSS
  } else if (config.avatarType === "image") {
    // If image URL is provided, it would go here
    // For now, we'll rely on CSS styling
  }
  
  // Helper function to get placement styles
  function getPlacementStyles(placement: string): string {
    switch (placement) {
      case "bottom-left":
        return "bottom: 20px; left: 20px;";
      case "top-right":
        return "top: 20px; right: 20px;";
      case "top-left":
        return "top: 20px; left: 20px;";
      case "bottom-right":
      default:
        return "bottom: 20px; right: 20px;";
    }
  }
  
  // Build CSS custom properties for styling
  const cssVariables = `
    --widget-base: ${config.colors.base};
    --widget-base-hover: ${config.colors.baseHover};
    --widget-base-active: ${config.colors.baseActive};
    --widget-base-border: ${config.colors.baseBorder};
    --widget-base-subtle: ${config.colors.baseSubtle};
    --widget-base-primary: ${config.colors.basePrimary};
    --widget-base-error: ${config.colors.baseError};
    --widget-accent: ${config.colors.accent};
    --widget-accent-hover: ${config.colors.accentHover};
    --widget-accent-active: ${config.colors.accentActive};
    --widget-accent-border: ${config.colors.accentBorder};
    --widget-accent-subtle: ${config.colors.accentSubtle};
    --widget-accent-primary: ${config.colors.accentPrimary};
    --widget-button-radius: ${config.buttonRadius};
    --widget-overlay-padding: ${config.overlayPadding};
    --widget-orb-first-color: ${config.orbFirstColor};
    --widget-orb-second-color: ${config.orbSecondColor};
  `;
  
  // Build CSS for custom styling
  const customStyles = `
    <style>
      :root {
        ${cssVariables}
      }
      
      * {
        box-sizing: border-box;
      }
      
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
          sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      
      .preview-container {
        width: 100%;
        height: 100vh;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      
      .preview-content {
        text-align: center;
        color: white;
        padding: 2rem;
        max-width: 600px;
        z-index: 1;
      }
      
      .preview-content h1 {
        font-size: 2rem;
        margin-bottom: 1rem;
        font-weight: 600;
      }
      
      .preview-content p {
        font-size: 1rem;
        opacity: 0.9;
        margin-bottom: 2rem;
      }
      
      /* Style the ElevenLabs widget */
      elevenlabs-convai {
        position: fixed;
        z-index: 9999;
        ${getPlacementStyles(config.placement)}
      }
      
      /* Apply widget color customization via CSS variables */
      /* Note: These may need to be adjusted based on actual ElevenLabs widget CSS variable names */
      elevenlabs-convai {
        --widget-primary-color: var(--widget-accent);
        --widget-primary-text: var(--widget-accent-primary);
        --widget-background: var(--widget-base);
        --widget-border-color: var(--widget-base-border);
        --widget-text-color: var(--widget-base-primary);
        --widget-hover-background: var(--widget-base-hover);
        --widget-active-background: var(--widget-base-active);
        --widget-error-color: var(--widget-base-error);
        --widget-subtle-color: var(--widget-base-subtle);
      }
      
      /* Apply custom button radius */
      elevenlabs-convai button,
      elevenlabs-convai .widget-button,
      elevenlabs-convai [class*="button"],
      elevenlabs-convai [class*="Button"] {
        border-radius: var(--widget-button-radius) !important;
      }
      
      /* Apply overlay padding */
      elevenlabs-convai [class*="overlay"],
      elevenlabs-convai [class*="Overlay"],
      elevenlabs-convai [class*="modal"],
      elevenlabs-convai [class*="Modal"] {
        padding: var(--widget-overlay-padding) !important;
      }
      
      /* Style for orb avatar if applicable */
      ${config.avatarType === "orb" ? `
        elevenlabs-convai .widget-avatar,
        elevenlabs-convai [class*="avatar"],
        elevenlabs-convai [class*="Avatar"] {
          background: conic-gradient(from 180deg, var(--widget-orb-first-color), var(--widget-orb-second-color), var(--widget-orb-first-color)) !important;
        }
      ` : ""}
      
      /* Apply accent colors to primary buttons and interactive elements */
      elevenlabs-convai button[class*="primary"],
      elevenlabs-convai button[class*="Primary"],
      elevenlabs-convai [class*="primary-button"],
      elevenlabs-convai [class*="PrimaryButton"] {
        background-color: var(--widget-accent) !important;
        color: var(--widget-accent-primary) !important;
        border-color: var(--widget-accent-border) !important;
      }
      
      elevenlabs-convai button[class*="primary"]:hover,
      elevenlabs-convai button[class*="Primary"]:hover,
      elevenlabs-convai [class*="primary-button"]:hover,
      elevenlabs-convai [class*="PrimaryButton"]:hover {
        background-color: var(--widget-accent-hover) !important;
      }
      
      elevenlabs-convai button[class*="primary"]:active,
      elevenlabs-convai button[class*="Primary"]:active,
      elevenlabs-convai [class*="primary-button"]:active,
      elevenlabs-convai [class*="PrimaryButton"]:active {
        background-color: var(--widget-accent-active) !important;
      }
    </style>
  `;
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Widget Preview</title>
  ${customStyles}
</head>
<body>
  <div class="preview-container">
    <div class="preview-content">
      <h1>Widget Preview</h1>
      <p>This is how your ElevenLabs widget will appear on your website. The widget is positioned in the ${config.placement} corner.</p>
      <p style="font-size: 0.875rem; opacity: 0.7;">Interact with the widget to test the conversation experience.</p>
    </div>
  </div>
  
  <!-- ElevenLabs Widget -->
  <elevenlabs-convai ${widgetAttributes.join(" ")}></elevenlabs-convai>
  
  <!-- ElevenLabs Widget Script -->
  <script
    src="https://unpkg.com/@elevenlabs/convai-widget-embed"
    async
    type="text/javascript"
  ></script>
</body>
</html>`;

  return html;
}
