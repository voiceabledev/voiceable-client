import React from "react";
import { ChevronDown, Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type AgentTemplateSectionProps = {
  expanded: boolean;
  onToggleExpanded: () => void;
  systemPromptTemplate: string;
  setSystemPromptTemplate: (template: string) => void;
};

export const AgentTemplateSection: React.FC<AgentTemplateSectionProps> = ({
  expanded,
  onToggleExpanded,
  systemPromptTemplate,
  setSystemPromptTemplate,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <button className="w-full flex items-start justify-between gap-2" onClick={onToggleExpanded}>
        <div className="text-left flex-1">
          <h3 className="text-base md:text-lg font-semibold">Agent Template</h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Customize the base system prompt template for your agent
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="mt-4 md:mt-6 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-medium">System Prompt Template</h4>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <Textarea
              value={systemPromptTemplate}
              onChange={(e) => setSystemPromptTemplate(e.target.value)}
              placeholder="Enter the system prompt template that defines your agent's base behavior, personality, and instructions..."
              className="bg-white border-border min-h-[200px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              This template forms the foundation of your agent's system prompt. It will be combined with integration tools, behavior sections, and outcome criteria.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

