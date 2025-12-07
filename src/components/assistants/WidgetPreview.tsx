import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, AlertCircle } from "lucide-react";
import { Agent } from "@/lib/api";
import { generateWidgetPreviewHTML, WidgetConfig } from "@/utils/widgetPreview";
import { useIsMobile } from "@/hooks/use-mobile";

interface WidgetPreviewProps {
  agent: Agent | null;
  config: WidgetConfig;
  onClose: () => void;
}

export default function WidgetPreview({ agent, config, onClose }: WidgetPreviewProps) {
  const isMobile = useIsMobile();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!agent?.elevenlabs_agent_id || !iframeRef.current) return;

    // Generate the HTML content
    const htmlContent = generateWidgetPreviewHTML(agent.elevenlabs_agent_id, config);

    // Create a blob URL for the HTML content
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    // Set the iframe source
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }

    // Cleanup: revoke the blob URL when component unmounts or agent/config changes
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [agent?.elevenlabs_agent_id, config]);

  // Show error if agent is not published or missing agent ID
  if (!agent?.elevenlabs_agent_id) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-3 md:p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm md:text-base">Widget Preview</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-6">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">Agent Not Published</h4>
            <p className="text-sm text-muted-foreground mb-4">
              This agent needs to be published and deployed to ElevenLabs before you can preview the widget.
            </p>
            <p className="text-xs text-muted-foreground">
              Please deploy the agent using the "Deploy" button in the assistant detail page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm md:text-base">Widget Preview</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Interactive preview of how your widget will appear on your website
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Iframe Container */}
      <div className="flex-1 relative min-h-0 overflow-hidden">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          title="Widget Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          allow="microphone; camera"
        />
      </div>
    </div>
  );
}
