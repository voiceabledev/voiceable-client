import React from "react";
import { ChevronDown, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FirstMessageSectionProps = {
  expanded: boolean;
  onToggleExpanded: () => void;
  firstMessageMode: string;
  setFirstMessageMode: (mode: string) => void;
  firstMessage: string;
  setFirstMessage: (message: string) => void;
  agentName: string;
};

export const FirstMessageSection: React.FC<FirstMessageSectionProps> = ({
  expanded,
  onToggleExpanded,
  firstMessageMode,
  setFirstMessageMode,
  firstMessage,
  setFirstMessage,
  agentName,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <button className="w-full flex items-start justify-between gap-2" onClick={onToggleExpanded}>
        <div className="text-left flex-1">
          <h3 className="text-base md:text-lg font-semibold">First Message Configuration</h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Configure how the assistant initiates conversations
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
          {/* First Message Mode */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-medium">Mode</h4>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <Select value={firstMessageMode} onValueChange={setFirstMessageMode}>
              <SelectTrigger className="bg-white border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assistant-speaks-first">Assistant speaks first</SelectItem>
                <SelectItem value="assistant-waits-for-user">Assistant waits for user</SelectItem>
                {/* <SelectItem value="assistant-speaks-first-model-generated">
                  Assistant speaks first with model generated message
                </SelectItem> */}
              </SelectContent>
            </Select>
          </div>

          {/* First Message */}
          <div>
            <h4 className="text-sm font-medium mb-2">Message</h4>
            <Textarea
              value={firstMessage}
              onChange={(e) => setFirstMessage(e.target.value)}
              placeholder={
                agentName ? `Hi there, this is ${agentName}...` : "Enter the first message for the assistant..."
              }
              className="bg-white border-border min-h-[80px] font-mono text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};
