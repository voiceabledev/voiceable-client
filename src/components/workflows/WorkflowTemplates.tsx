import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar, Users, HeadphonesIcon } from "lucide-react";
import type { ToolInChain, ConditionalConfig } from "@/types/functions";

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  toolChain: ToolInChain[];
  triggerPhrases?: string[];
}

interface WorkflowTemplatesProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: WorkflowTemplate | null) => void;
  availableIntegrations?: string[]; // List of connected integration types
}

const TEMPLATES: WorkflowTemplate[] = [
  {
    id: "lead-qualification",
    name: "Lead Qualification",
    description: "Qualify leads and create deals in your CRM",
    icon: <Users className="h-5 w-5" />,
    toolChain: [
      {
        type: "twilio",
        role: "communication",
        method: "sms",
        config: {},
      },
      {
        type: "pipedrive",
        role: "crm",
        method: "search_persons",
        config: {},
      },
      {
        type: "condition",
        role: "control",
        method: "branch",
        config: {
          expression: "result.length === 0",
          then: [
            {
              type: "pipedrive",
              role: "crm",
              method: "create_person",
              config: {},
            }
          ],
          else: []
        } as ConditionalConfig,
      },
      {
        type: "pipedrive",
        role: "crm",
        method: "create_deal",
        config: {},
      },
    ],
    triggerPhrases: ["interested", "qualify", "lead", "prospect"],
  },
  {
    id: "appointment-booking",
    name: "Appointment Booking",
    description: "Schedule appointments and send confirmations",
    icon: <Calendar className="h-5 w-5" />,
    toolChain: [
      {
        type: "twilio",
        role: "communication",
        method: "sms",
        config: {},
      },
      {
        type: "calcom",
        role: "scheduling",
        method: "get_event_types",
        config: {},
      },
      {
        type: "calcom",
        role: "scheduling",
        method: "get_available_slots",
        config: {},
      },
      {
        type: "calcom",
        role: "scheduling",
        method: "create_booking",
        config: {},
      },
    ],
    triggerPhrases: ["schedule", "book", "appointment", "meeting"],
  },
  {
    id: "support-ticket",
    name: "Support Ticket Creation",
    description: "Create support tickets from customer inquiries",
    icon: <HeadphonesIcon className="h-5 w-5" />,
    toolChain: [
      {
        type: "twilio",
        role: "communication",
        method: "sms",
        config: {},
      },
      {
        type: "pipedrive",
        role: "crm",
        method: "search_persons",
        config: {},
      },
      {
        type: "condition",
        role: "control",
        method: "branch",
        config: {
          expression: "result.length === 0",
          then: [
            {
              type: "pipedrive",
              role: "crm",
              method: "create_person",
              config: {},
            }
          ],
          else: []
        } as ConditionalConfig,
      },
      {
        type: "pipedrive",
        role: "crm",
        method: "create_activity",
        config: {},
      },
    ],
    triggerPhrases: ["support", "help", "issue", "problem"],
  },
];

export const WorkflowTemplates: React.FC<WorkflowTemplatesProps> = ({
  open,
  onClose,
  onSelectTemplate,
  availableIntegrations = [],
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("custom");

  // Filter templates based on available integrations
  // Note: SMS/Twilio is excluded from filtering as it's often auto-added or handled separately
  const availableTemplates = TEMPLATES.filter((template) => {
    const requiredIntegrations = template.toolChain
      .map((tool) => tool.type)
      .filter((type) => type !== "twilio"); // Exclude Twilio from required integrations
    // If no non-Twilio integrations are required, show the template
    if (requiredIntegrations.length === 0) return true;
    // Otherwise, check if all required integrations are available
    return requiredIntegrations.every((integration) =>
      availableIntegrations.includes(integration)
    );
  });

  const handleContinue = () => {
    if (selectedTemplateId === "custom") {
      onSelectTemplate(null);
    } else {
      const template = TEMPLATES.find((t) => t.id === selectedTemplateId);
      onSelectTemplate(template || null);
    }
    // Don't call onClose here - let parent handle the transition to next step
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Workflow</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Start from a template or build a custom workflow
          </p>

          <RadioGroup value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
            <div className="space-y-3">
              {availableTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem value={template.id} id={template.id} className="mt-1" />
                  <Label
                    htmlFor={template.id}
                    className="flex-1 cursor-pointer space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-muted-foreground">{template.icon}</div>
                      <span className="font-medium">{template.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    {template.toolChain.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.toolChain.map((tool, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                          >
                            {tool.type === "twilio" ? "SMS" : tool.type.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    )}
                  </Label>
                </div>
              ))}

              <div className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="custom" id="custom" className="mt-1" />
                <Label htmlFor="custom" className="flex-1 cursor-pointer space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Custom Workflow</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Build a workflow from scratch with your own tools and triggers
                  </p>
                </Label>
              </div>
            </div>
          </RadioGroup>

          {availableTemplates.length === 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
              <p className="text-xs text-amber-800">
                No templates available. Connect the required integrations first, or create a custom workflow.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleContinue}>Continue</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
