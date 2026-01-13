import React from "react";
import { ChevronDown, Info, MessageSquare } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { WorkflowStyleCard } from "@/components/assistants/WorkflowStyleCard";

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
    <WorkflowStyleCard
      title="First Message Configuration"
      description="Configure how the assistant initiates conversations"
      icon={MessageSquare}
      expanded={expanded}
      onToggle={onToggleExpanded}
    >
      <div className="space-y-5">
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
    </WorkflowStyleCard>
  );
};
