import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { agentTemplatesApi, AgentTemplate } from "@/lib/api";

interface Template {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | string;
  systemPrompt?: string;
  firstMessage?: string;
}

interface TemplateStepProps {
  assistantName: string;
  onAssistantNameChange: (name: string) => void;
  selectedTemplate: string | null;
  onTemplateSelect: (templateId: string) => void;
  templates: Template[];
  templatesLoading: boolean;
  iconMap: Record<string, React.ComponentType<{ className?: string }>>;
}

export function TemplateStep({
  assistantName,
  onAssistantNameChange,
  selectedTemplate,
  onTemplateSelect,
  templates,
  templatesLoading,
  iconMap,
}: TemplateStepProps) {
  return (
    <div className="space-y-6">
      {/* Assistant Name Input */}
      <div className="space-y-2">
        <Label htmlFor="assistant-name">Assistant Name</Label>
        <p className="text-xs text-muted-foreground">
          (This can be adjusted at any time after creation.)
        </p>
        <Input
          id="assistant-name"
          value={assistantName}
          onChange={(e) => onAssistantNameChange(e.target.value)}
          placeholder="New Assistant"
          className="bg-secondary/50 border-border"
          data-wizard-field="name"
        />
      </div>

      {/* Templates List */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Choose a template</h3>
          <p className="text-sm text-muted-foreground">
            Here's a few templates to get you started, or you can create your own template and use it to create a new assistant.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templatesLoading ? (
            <div className="col-span-2 flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            [...templates].sort((a, b) => {
              // Put blank template last
              if (a.title === "Blank Template") return 1;
              if (b.title === "Blank Template") return -1;
              return 0;
            }).map((template) => {
              const Icon = typeof template.icon === 'string' ? null : template.icon;
              const iconUrl = typeof template.icon === 'string' ? template.icon : null;
              const isBlank = template.title === "Blank Template";
              
              return (
                <button
                  key={template.id}
                  onClick={() => onTemplateSelect(template.id)}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 transition-all text-left",
                    selectedTemplate === template.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 bg-card"
                  )}
                  data-wizard-action="select-template"
                  data-wizard-value={template.id}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      isBlank ? "w-12 h-12 rounded-full" : "w-10 h-10 rounded-md",
                      "flex items-center justify-center flex-shrink-0",
                      selectedTemplate === template.id ? "bg-primary/10" : "bg-secondary/50"
                    )}>
                      {Icon ? (
                        <Icon className={cn(
                          isBlank ? "h-6 w-6" : "h-5 w-5",
                          selectedTemplate === template.id ? "text-primary" : "text-muted-foreground"
                        )} />
                      ) : iconUrl ? (
                        <img 
                          src={iconUrl} 
                          alt={template.title}
                          className={cn(
                            isBlank ? "h-6 w-6" : "h-5 w-5",
                            "object-contain",
                            selectedTemplate === template.id ? "opacity-100" : "opacity-70"
                          )}
                        />
                      ) : (
                        <Plus className={cn(
                          isBlank ? "h-6 w-6" : "h-5 w-5",
                          selectedTemplate === template.id ? "text-primary" : "text-muted-foreground"
                        )} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 text-sm">{template.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
