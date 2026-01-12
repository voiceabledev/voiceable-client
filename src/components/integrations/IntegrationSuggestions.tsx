import React, { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Lightbulb, MessageSquare, Calendar, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntegrationSuggestion {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  actions: {
    label: string;
    onClick: () => void;
  }[];
}

interface IntegrationSuggestionsProps {
  connectedIntegrations: string[];
  onDismiss?: (suggestionId: string) => void;
  onActionClick?: (action: string, integrationType?: string) => void;
}

const SUGGESTIONS: Record<string, IntegrationSuggestion[]> = {
  calcom: [
    {
      id: "add-sms",
      title: "Add SMS Confirmations",
      description: "Send SMS confirmations when appointments are booked",
      icon: <MessageSquare className="h-4 w-4" />,
      actions: [
        { label: "Set up SMS", onClick: () => {} },
        { label: "Maybe Later", onClick: () => {} },
      ],
    },
  ],
  pipedrive: [
    {
      id: "add-calendar",
      title: "Connect Calendar",
      description: "Track booked meetings in your CRM",
      icon: <Calendar className="h-4 w-4" />,
      actions: [
        { label: "Add Calendar", onClick: () => {} },
        { label: "Maybe Later", onClick: () => {} },
      ],
    },
  ],
  "calcom+pipedrive": [
    {
      id: "pipeline-automation",
      title: "Create Pipeline Automation",
      description: "Automatically create deals when appointments are confirmed",
      icon: <Database className="h-4 w-4" />,
      actions: [
        { label: "Create Workflow", onClick: () => {} },
        { label: "Maybe Later", onClick: () => {} },
      ],
    },
  ],
};

export const IntegrationSuggestions: React.FC<IntegrationSuggestionsProps> = ({
  connectedIntegrations,
  onDismiss,
  onActionClick,
}) => {
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  const handleDismiss = (suggestionId: string) => {
    setDismissedSuggestions((prev) => new Set([...prev, suggestionId]));
    onDismiss?.(suggestionId);
  };

  const handleAction = (action: IntegrationSuggestion["actions"][0], suggestion: IntegrationSuggestion) => {
    action.onClick();
    onActionClick?.(action.label, suggestion.id);
  };

  // Determine which suggestions to show
  const getActiveSuggestions = (): IntegrationSuggestion[] => {
    const active: IntegrationSuggestion[] = [];

    // Check for individual integration suggestions
    connectedIntegrations.forEach((integration) => {
      const suggestions = SUGGESTIONS[integration];
      if (suggestions) {
        active.push(...suggestions);
      }
    });

    // Check for combination suggestions
    const hasCalcom = connectedIntegrations.includes("calcom");
    const hasPipedrive = connectedIntegrations.includes("pipedrive");
    if (hasCalcom && hasPipedrive) {
      const combo = SUGGESTIONS["calcom+pipedrive"];
      if (combo) {
        active.push(...combo);
      }
    }

    // Filter out dismissed suggestions
    return active.filter((s) => !dismissedSuggestions.has(s.id));
  };

  const activeSuggestions = getActiveSuggestions();

  if (activeSuggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {activeSuggestions.map((suggestion) => (
        <Alert
          key={suggestion.id}
          className={cn(
            "border-primary/20 bg-primary/5 relative",
            "animate-in slide-in-from-top-2 duration-300"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="text-primary mt-0.5">{suggestion.icon}</div>
            <div className="flex-1 min-w-0">
              <AlertTitle className="flex items-center gap-2 mb-1">
                <Lightbulb className="h-4 w-4" />
                {suggestion.title}
              </AlertTitle>
              <AlertDescription className="text-sm">
                {suggestion.description}
              </AlertDescription>
              <div className="flex items-center gap-2 mt-3">
                {suggestion.actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={index === 0 ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAction(action, suggestion)}
                    className="text-xs"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
            <button
              onClick={() => handleDismiss(suggestion.id)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted"
              aria-label="Dismiss suggestion"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </Alert>
      ))}
    </div>
  );
};
