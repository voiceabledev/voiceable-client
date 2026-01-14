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
import { Loader2, Sparkles, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { agentsApi } from "@/lib/api";

type GenerateKnowledgeBaseModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  onSave: (file: File) => Promise<void>;
};

const SUGGESTED_KNOWLEDGE_BASES = [
  {
    label: "Product FAQs",
    icon: "❓",
    prompt: "Create a comprehensive FAQ about our products including features, pricing, compatibility, and common troubleshooting."
  },
  {
    label: "Company Policies",
    icon: "📋",
    prompt: "Generate a knowledge base covering company policies including refund policy, shipping information, privacy policy, and customer support guidelines."
  },
  {
    label: "Technical Documentation",
    icon: "🔧",
    prompt: "Create technical documentation covering setup instructions, API usage, configuration options, and best practices."
  },
  {
    label: "Service Guide",
    icon: "📖",
    prompt: "Build a service guide explaining available services, how to get started, pricing tiers, and support options."
  },
];

export const GenerateKnowledgeBaseModal: React.FC<GenerateKnowledgeBaseModalProps> = ({
  open,
  onOpenChange,
  agentId,
  onSave,
}) => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating || !agentId) return;

    setIsGenerating(true);
    try {
      const response = await agentsApi.generateKnowledgeBase(agentId, prompt.trim());

      if (response.data?.content) {
        setGeneratedContent(response.data.content);

        toast({
          title: "Success",
          description: "Knowledge base content generated successfully!",
        });
      } else {
        throw new Error("No content generated");
      }
    } catch (error: any) {
      console.error("Error generating knowledge base:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.status?.message || "Failed to generate knowledge base. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent.trim() || isSaving) return;

    setIsSaving(true);
    try {
      // Create a file from the generated content
      const filename = `knowledge-base-${Date.now()}.txt`;
      const file = createFileFromText(generatedContent, filename);

      // Call the save handler passed from parent
      await onSave(file);

      // Close modal on success
      handleClose();

      toast({
        title: "Success",
        description: "Knowledge base file saved successfully!",
      });
    } catch (error: any) {
      console.error("Error saving knowledge base:", error);
      toast({
        title: "Error",
        description: "Failed to save knowledge base file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setPrompt("");
    setGeneratedContent("");
    setIsGenerating(false);
    setIsSaving(false);
    onOpenChange(false);
  };

  const handleSuggestedClick = (suggestedPrompt: string) => {
    setPrompt(suggestedPrompt);
  };

  const handleRegenerate = () => {
    setGeneratedContent("");
  };

  const createFileFromText = (content: string, filename: string): File => {
    const blob = new Blob([content], { type: 'text/plain' });
    return new File([blob], filename, { type: 'text/plain' });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="text-center space-y-3 pb-4">
          <DialogTitle className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6" />
            Create Knowledge Base with AI
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Generate comprehensive knowledge base content for your voice agent using AI.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Input Section */}
          {!generatedContent && (
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Describe the knowledge base content you need:
                  </label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., Create a FAQ about our SaaS product including pricing, features, integrations, and support options..."
                    className="min-h-[120px] text-base resize-none"
                    disabled={isGenerating}
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  className="w-full"
                  disabled={!prompt.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Knowledge Base
                    </>
                  )}
                </Button>
              </div>

              {/* Suggested Templates */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground font-medium">Suggested templates:</p>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTED_KNOWLEDGE_BASES.map((kb, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestedClick(kb.prompt)}
                      className="flex flex-col items-center gap-2 p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors text-left"
                      disabled={isGenerating}
                    >
                      <span className="text-2xl">{kb.icon}</span>
                      <span className="text-xs font-medium text-center">{kb.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Preview Section */}
          {generatedContent && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Generated Content Preview</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isSaving}
                >
                  Regenerate
                </Button>
              </div>

              <div className="border rounded-lg p-4 bg-muted/30 max-h-[400px] overflow-y-auto">
                <Textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="min-h-[350px] text-sm font-mono bg-transparent border-none resize-none focus-visible:ring-0"
                  disabled={isSaving}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSaving}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !generatedContent.trim()}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save as File"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
