import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowTriggerEditorProps {
  triggerPhrases: string[];
  onPhrasesChange: (phrases: string[]) => void;
  placeholder?: string;
}

const EXAMPLE_PHRASES: Record<string, string[]> = {
  booking: ["I want to schedule", "book appointment", "set up a meeting", "find available time"],
  crm: ["I'm interested", "create a deal", "add to pipeline", "qualify this lead"],
  support: ["I need help", "create a ticket", "report an issue", "support request"],
};

export const WorkflowTriggerEditor: React.FC<WorkflowTriggerEditorProps> = ({
  triggerPhrases,
  onPhrasesChange,
  placeholder = "Enter trigger phrases (e.g., 'I want to schedule', 'book appointment')",
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleAddPhrase = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !triggerPhrases.includes(trimmed)) {
      onPhrasesChange([...triggerPhrases, trimmed]);
      setInputValue("");
    }
  };

  const handleRemovePhrase = (phrase: string) => {
    onPhrasesChange(triggerPhrases.filter((p) => p !== phrase));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddPhrase();
    }
  };

  const handleExampleClick = (phrase: string) => {
    if (!triggerPhrases.includes(phrase)) {
      onPhrasesChange([...triggerPhrases, phrase]);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="trigger-phrases" className="text-sm font-medium">
          When the caller says:
        </Label>
        <p className="text-xs text-muted-foreground mt-1">
          Add phrases that should trigger this workflow. The agent will recognize these phrases and activate the workflow.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            id="trigger-phrases"
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <button
            type="button"
            onClick={handleAddPhrase}
            disabled={!inputValue.trim()}
            className="px-4 py-2 text-sm font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>

        {triggerPhrases.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {triggerPhrases.map((phrase) => (
              <Badge
                key={phrase}
                variant="secondary"
                className="flex items-center gap-1.5 px-2 py-1"
              >
                <span className="text-xs">{phrase}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePhrase(phrase)}
                  className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {triggerPhrases.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-4 text-center">
            <p className="text-xs text-muted-foreground">
              No trigger phrases added yet. Add phrases to activate this workflow.
            </p>
          </div>
        )}
      </div>

      {/* Example phrases */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Example phrases:</p>
        <div className="flex flex-wrap gap-2">
          {Object.values(EXAMPLE_PHRASES)
            .flat()
            .slice(0, 6)
            .map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => handleExampleClick(example)}
                disabled={triggerPhrases.includes(example)}
                className={cn(
                  "text-xs px-2 py-1 rounded border transition-colors",
                  triggerPhrases.includes(example)
                    ? "border-muted bg-muted text-muted-foreground cursor-not-allowed"
                    : "border-border bg-card hover:bg-muted cursor-pointer"
                )}
              >
                {example}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

