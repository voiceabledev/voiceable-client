import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { INTEGRATION_TOOLS_DISPLAY } from "@/constants/assistant";

interface Capability {
  name: string;
  description: string;
  recommended?: boolean;
}

interface CapabilitySelectorProps {
  integrationType: string;
  selectedCapabilities: string[];
  onSelectionChange: (capabilities: string[]) => void;
  recommendedCapabilities?: string[];
}

// Get descriptions for capabilities
const getCapabilityDescription = (capabilityName: string, integrationType: string): string => {
  // Map capability names to user-friendly descriptions
  const descriptions: Record<string, Record<string, string>> = {
    pipedrive: {
      "Create Deal": "Add new deals when prospects show interest",
      "Search Deals": "Find existing deals by name, email, or phone",
      "Get Person": "Look up contact information",
      "Update Deal Stage": "Move deals through your pipeline",
      "Create Person": "Add new contacts to your CRM",
      "Create Note": "Log important information about deals or contacts",
      "Create Activity": "Record meetings, calls, or tasks",
    },
    calcom: {
      "Get Event Types": "Retrieve all available event types for booking",
      "Get Available Slots": "Check available time slots for appointments",
      "Create Booking": "Schedule new appointments with attendee details",
      "Reschedule Booking": "Update existing booking times",
      "Cancel Booking": "Cancel scheduled appointments",
    },
    calendly: {
      "Get Event Types": "Get available event types from Calendly",
      "Get Availability": "Check availability for a Calendly event type",
      "Create Booking": "Create a new booking in Calendly",
      "Get Scheduled Events": "Get scheduled events from Calendly",
      "Cancel Event": "Cancel a scheduled event in Calendly",
      "Reschedule Event": "Reschedule a scheduled event in Calendly",
    },
    hubspot: {
      "Create Contact": "Add new contacts to HubSpot",
      "Search Contacts": "Find contacts by name, email, or phone",
      "Get Contact": "Retrieve detailed contact information",
      "Create Deal": "Create new deals in HubSpot",
      "Search Deals": "Find deals by criteria",
      "Update Deal": "Update existing deal information",
      "Create Company": "Add new companies to HubSpot",
      "Search Companies": "Find companies by name or domain",
      "Create Note": "Add notes to contacts or deals",
      "Get Task": "Retrieve task information",
    },
  };

  return descriptions[integrationType]?.[capabilityName] || `${capabilityName} action for ${integrationType}`;
};

export const CapabilitySelector: React.FC<CapabilitySelectorProps> = ({
  integrationType,
  selectedCapabilities,
  onSelectionChange,
  recommendedCapabilities = [],
}) => {
  // Get available capabilities for this integration
  const availableCapabilities = INTEGRATION_TOOLS_DISPLAY[integrationType as keyof typeof INTEGRATION_TOOLS_DISPLAY] || [];

  // Determine recommended capabilities (first 2-3 most common ones)
  const defaultRecommended = recommendedCapabilities.length > 0 
    ? recommendedCapabilities 
    : availableCapabilities.slice(0, 2);

  const handleCapabilityToggle = (capabilityName: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedCapabilities, capabilityName]);
    } else {
      onSelectionChange(selectedCapabilities.filter((c) => c !== capabilityName));
    }
  };

  if (availableCapabilities.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          No capabilities available for this integration.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-1">What should your agent be able to do?</h3>
        <p className="text-xs text-muted-foreground">
          Select the capabilities you want to enable for this integration.
        </p>
      </div>

      <div className="space-y-3">
        {availableCapabilities.map((capabilityName) => {
          const isSelected = selectedCapabilities.includes(capabilityName);
          const isRecommended = defaultRecommended.includes(capabilityName);
          const description = getCapabilityDescription(capabilityName, integrationType);

          return (
            <div
              key={capabilityName}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-muted/50"
              )}
            >
              <Checkbox
                id={capabilityName}
                checked={isSelected}
                onCheckedChange={(checked) =>
                  handleCapabilityToggle(capabilityName, checked === true)
                }
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Label
                    htmlFor={capabilityName}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {capabilityName}
                  </Label>
                  {isRecommended && (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      Popular
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {selectedCapabilities.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
          <p className="text-xs text-amber-800">
            Select at least one capability to enable this integration.
          </p>
        </div>
      )}
    </div>
  );
};
