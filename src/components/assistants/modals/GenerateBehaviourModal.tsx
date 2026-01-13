import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { agentsApi } from "@/lib/api";
import { generateSectionEntryId } from "@/utils/assistantHelpers";
import type { SectionEntry } from "@/components/assistants/SectionEditors";

type GenerateBehaviourModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  onApply: (data: {
    scenarios?: SectionEntry[];
    phases?: SectionEntry[];
    voiceTone?: SectionEntry[];
  }) => void;
};

const SUGGESTED_BEHAVIORS = [
  // { label: "Customer Support", icon: "🛠️", prompt: "Create a customer support agent that can handle inquiries, troubleshoot issues, and escalate complex problems to human agents." },
  { label: "Lead Qualification", icon: "📊", prompt: "Build a lead qualification specialist that qualifies prospects, collects contact information, and schedules follow-up meetings." },
  // { label: "Sales Calls", icon: "📞", prompt: "Design a sales agent that presents products, answers questions, handles objections, and closes deals over the phone." },
  { label: "Appointment Booking", icon: "📅", prompt: "Create an appointment booking agent that checks availability, schedules meetings, sends confirmations, and handles rescheduling." },
  { label: "Product Information", icon: "📦", prompt: "Build a product information agent that provides detailed product specs, pricing, availability, and recommendations." },
  // { label: "Technical Support", icon: "💻", prompt: "Design a technical support agent that troubleshoots issues, provides step-by-step solutions, and escalates when needed." },
];

export const GenerateBehaviourModal: React.FC<GenerateBehaviourModalProps> = ({
  open,
  onOpenChange,
  agentId,
  onApply,
}) => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isGenerating || !agentId) return;

    setIsGenerating(true);
    try {
      const response = await agentsApi.generateBehaviour(agentId, prompt.trim());
      
      if (response.data) {
        // Add IDs to each entry
        const data = {
          scenarios: response.data.scenarios?.map((s) => ({
            ...s,
            id: generateSectionEntryId(),
          })) || [],
          phases: response.data.phases?.map((p) => ({
            ...p,
            id: generateSectionEntryId(),
          })) || [],
          voiceTone: response.data.voiceTone?.map((v) => ({
            ...v,
            id: generateSectionEntryId(),
          })) || [],
        };

        // Auto-apply the generated data
        onApply(data);
        
        // Close modal
        handleClose();
        
        // Show success toast
        toast({
          title: "Success",
          description: "Agent behavior generated and applied successfully!",
        });
      }
    } catch (error: any) {
      console.error("Error generating behavior:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.status?.message || "Failed to generate behavior. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setPrompt("");
    setIsGenerating(false);
    onOpenChange(false);
  };

  const handleSuggestedClick = (suggestedPrompt: string) => {
    setPrompt(suggestedPrompt);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-3 pb-4">
          <DialogTitle className="text-2xl md:text-3xl font-bold">
            Meet your AI voice agent
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Voiceable is the simplest way for businesses to create, manage, and share voice agents. Now with just a prompt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="How can I help? Describe your agent and I'll build it."
                className="min-h-[120px] text-base pr-12 resize-none"
                disabled={isGenerating}
              />
              <Button
                type="submit"
                size="icon"
                className={cn(
                  "absolute right-2 bottom-2 h-10 w-10 rounded-full",
                  !prompt.trim() || isGenerating ? "opacity-50 cursor-not-allowed" : ""
                )}
                disabled={!prompt.trim() || isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-medium">Suggested behaviors:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SUGGESTED_BEHAVIORS.map((behavior, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestedClick(behavior.prompt)}
                  className="flex flex-col items-center gap-2 p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors text-left"
                  disabled={isGenerating}
                >
                  <span className="text-2xl">{behavior.icon}</span>
                  <span className="text-xs font-medium text-center">{behavior.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
