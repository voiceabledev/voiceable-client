import React from "react";
import { Phone, MessageSquare, Headphones, ImageIcon, User, AudioLines, X } from "lucide-react";
import { CustomWidgetConfig } from "@/utils/widgetConfig";
import { WIDGET_SIZES } from "./constants";
import { getSampleMessages } from "./helpers";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CustomWidgetPreviewModalProps {
  config: CustomWidgetConfig;
  agentName?: string;
  onClose: () => void;
}

export function CustomWidgetPreviewModal({ config, agentName, onClose }: CustomWidgetPreviewModalProps) {
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-base">Widget Preview</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Preview of how your custom widget will appear on your website
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 relative min-h-0 overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="relative w-full h-full p-4">
          {/* Widget Panel Preview */}
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
            {/* Header */}
            <div 
              className="flex items-center justify-between px-4 py-4 border-b"
              style={{ borderColor: config.borderColor }}
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

            {/* Control Bar */}
            <div 
              className="flex items-center gap-3 px-4 py-3 border-b"
              style={{ 
                borderColor: config.borderColor,
                backgroundColor: config.backgroundColor,
              }}
            >
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
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: '#9ca3af' }}
              />
              <span 
                className="text-sm flex-1"
                style={{ color: config.textColor }}
              >
                {config.buttonText}
              </span>
            </div>

            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto px-4 py-4"
              style={{ backgroundColor: config.backgroundColor }}
            >
              {getSampleMessages(config.welcomeMessage).map((message, index) => (
                <div 
                  key={index}
                  className={cn(
                    "flex gap-2 mb-3",
                    message.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
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
                      <AudioLines className="w-4 h-4" />
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                  </div>
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

          {/* Floating Icon Button */}
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
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <Icon className="w-6 h-6" style={{ color: config.primaryTextColor }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
