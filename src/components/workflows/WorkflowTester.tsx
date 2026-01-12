import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Loader2, Phone, MessageSquare, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { agentsApi, agentFunctionsApi } from "@/lib/api";
import type { AgentFunction } from "@/types/functions";
import { detectWorkflowTriggers, highlightTriggerPhrases } from "@/utils/workflowTriggerDetector";
import { WorkflowExecutionStatus, type WorkflowExecution } from "./WorkflowExecutionStatus";
import { cn } from "@/lib/utils";

interface WorkflowTesterProps {
  open: boolean;
  onClose: () => void;
  agentId: string;
  workflows?: AgentFunction[]; // Optional: if not provided, will fetch
  onWorkflowTriggered?: (workflowId: number, userMessage: string) => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
  workflowsTriggered?: Array<{
    workflow_id: number;
    workflow_name: string;
    matched_phrase: string;
    status: string;
  }>;
}

export const WorkflowTester: React.FC<WorkflowTesterProps> = ({
  open,
  onClose,
  agentId,
  workflows: initialWorkflows,
  onWorkflowTriggered,
}) => {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<AgentFunction[]>(initialWorkflows || []);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const [activeTab, setActiveTab] = useState<"text" | "voice">("text");
  const [workflowExecutions, setWorkflowExecutions] = useState<WorkflowExecution[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load workflows if not provided
  useEffect(() => {
    if (open && (!initialWorkflows || initialWorkflows.length === 0)) {
      loadWorkflows();
    } else if (initialWorkflows) {
      setWorkflows(initialWorkflows);
    }
  }, [open, agentId, initialWorkflows]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setMessages([]);
      setInputValue("");
      setWorkflowExecutions([]);
    }
  }, [open]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadWorkflows = async () => {
    setIsLoadingWorkflows(true);
    try {
      const response = await agentFunctionsApi.list(agentId);
      if (response.data) {
        setWorkflows(response.data);
      }
    } catch (error) {
      console.error("Failed to load workflows:", error);
      toast({
        title: "Error",
        description: "Failed to load workflows",
        variant: "destructive",
      });
    } finally {
      setIsLoadingWorkflows(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Detect triggers on frontend
      const triggerMatches = detectWorkflowTriggers(inputValue, workflows);

      // Call agent chat API
      const response = await agentsApi.chat(agentId, inputValue, activeTab);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: response.data?.data?.response || response.data?.response || "I'm here to help!",
        timestamp: new Date(),
        workflowsTriggered: response.data?.data?.workflows_triggered || response.data?.workflows_triggered || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update workflow executions
      const workflowsTriggered = response.data?.data?.workflows_triggered || response.data?.workflows_triggered || [];
      if (workflowsTriggered.length > 0) {
        const executions: WorkflowExecution[] = workflowsTriggered.map((w: any) => ({
          workflowId: w.workflow_id,
          workflowName: w.workflow_name,
          matchedPhrase: w.matched_phrase,
          status: w.status === "triggered" ? "triggered" : "success",
        }));
        setWorkflowExecutions((prev) => [...prev, ...executions]);

        // Notify parent
        workflowsTriggered.forEach((w: any) => {
          onWorkflowTriggered?.(w.workflow_id, inputValue);
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === "user";
    const highlightSegments = isUser
      ? highlightTriggerPhrases(message.text, detectWorkflowTriggers(message.text, workflows))
      : null;

    return (
      <div
        key={message.id}
        className={cn(
          "flex gap-3",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
        )}
        <div
          className={cn(
            "max-w-[80%] rounded-lg px-4 py-2",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          {highlightSegments ? (
            <p className="text-sm whitespace-pre-wrap">
              {highlightSegments.map((segment, idx) => (
                <span
                  key={idx}
                  className={cn(
                    segment.isHighlighted && "bg-yellow-200/30 dark:bg-yellow-900/30 font-medium px-0.5 rounded"
                  )}
                >
                  {segment.text}
                </span>
              ))}
            </p>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          )}
          {message.workflowsTriggered && message.workflowsTriggered.length > 0 && (
            <div className="mt-2 pt-2 border-t border-current/20">
              <p className="text-xs opacity-80 mb-1">Workflows triggered:</p>
              <div className="flex flex-wrap gap-1">
                {message.workflowsTriggered.map((w) => (
                  <span key={w.workflow_id} className="text-xs opacity-80">
                    {w.workflow_name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">You</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Test Workflows</span>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogTitle>
          <DialogDescription>
            Test your workflows by chatting with the assistant. Workflows will automatically trigger when you use configured trigger phrases.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "text" | "voice")} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Text Simulation
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2" disabled>
              <Phone className="h-4 w-4" />
              Voice Call (Coming Soon)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="flex-1 flex flex-col min-h-0 mt-4">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 border rounded-lg bg-muted/30">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Start a conversation to test your workflows
                    </p>
                    {workflows.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {workflows.filter((w) => w.trigger_phrases && w.trigger_phrases.length > 0).length} workflow(s) with trigger phrases configured
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map(renderMessage)}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Workflow Execution Status */}
            {workflowExecutions.length > 0 && (
              <div className="mb-4">
                <WorkflowExecutionStatus executions={workflowExecutions} />
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message to test workflows..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="voice" className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Phone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Voice call testing coming soon
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
