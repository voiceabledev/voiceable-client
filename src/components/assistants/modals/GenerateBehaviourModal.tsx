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
import { Loader2, ArrowUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionEntry } from "@/components/assistants/SectionEditors";

type GenerateBehaviourModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (prompt: string) => Promise<{
    scenarios?: SectionEntry[];
    phases?: SectionEntry[];
    voiceTone?: SectionEntry[];
  }>;
  onApply: (data: {
    scenarios?: SectionEntry[];
    phases?: SectionEntry[];
    voiceTone?: SectionEntry[];
  }) => void;
};

const SUGGESTED_BEHAVIORS = [
  { label: "Customer Support", icon: "🛠️", prompt: "Create a customer support agent that can handle inquiries, troubleshoot issues, and escalate complex problems to human agents." },
  { label: "Lead Generation", icon: "📊", prompt: "Build a lead generation agent that qualifies prospects, collects contact information, and schedules follow-up meetings." },
  { label: "Sales Calls", icon: "📞", prompt: "Design a sales agent that presents products, answers questions, handles objections, and closes deals over the phone." },
  { label: "Appointment Booking", icon: "📅", prompt: "Create an appointment booking agent that checks availability, schedules meetings, sends confirmations, and handles rescheduling." },
  { label: "Product Information", icon: "📦", prompt: "Build a product information agent that provides detailed product specs, pricing, availability, and recommendations." },
  { label: "Technical Support", icon: "💻", prompt: "Design a technical support agent that troubleshoots issues, provides step-by-step solutions, and escalates when needed." },
];

export const GenerateBehaviourModal: React.FC<GenerateBehaviourModalProps> = ({
  open,
  onOpenChange,
  onGenerate,
  onApply,
}) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<{
    scenarios?: SectionEntry[];
    phases?: SectionEntry[];
    voiceTone?: SectionEntry[];
  } | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const data = await onGenerate(prompt);
      setGeneratedData(data);
    } catch (error) {
      console.error("Error generating behavior:", error);
      // TODO: Show error toast
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedData) {
      onApply(generatedData);
      handleClose();
    }
  };

  const handleClose = () => {
    setPrompt("");
    setGeneratedData(null);
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

          {!generatedData && (
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
          )}

          {generatedData && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>Generated Behavior</span>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {generatedData.scenarios && generatedData.scenarios.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Scenarios ({generatedData.scenarios.length})</h4>
                    <div className="space-y-2">
                      {generatedData.scenarios.map((scenario, idx) => (
                        <div key={idx} className="p-2 bg-muted/50 rounded text-xs">
                          <div className="font-medium">{scenario.title}</div>
                          {scenario.description && (
                            <div className="text-muted-foreground mt-1">{scenario.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {generatedData.phases && generatedData.phases.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Phases ({generatedData.phases.length})</h4>
                    <div className="space-y-2">
                      {generatedData.phases.map((phase, idx) => (
                        <div key={idx} className="p-2 bg-muted/50 rounded text-xs">
                          <div className="font-medium">{phase.title}</div>
                          {phase.description && (
                            <div className="text-muted-foreground mt-1">{phase.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {generatedData.voiceTone && generatedData.voiceTone.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Voice Tone ({generatedData.voiceTone.length})</h4>
                    <div className="space-y-2">
                      {generatedData.voiceTone.map((tone, idx) => (
                        <div key={idx} className="p-2 bg-muted/50 rounded text-xs">
                          <div className="font-medium">{tone.title}</div>
                          {tone.description && (
                            <div className="text-muted-foreground mt-1">{tone.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleApply}
                  className="flex-1"
                >
                  Apply Generated Behavior
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setGeneratedData(null);
                    setPrompt("");
                  }}
                >
                  Regenerate
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
