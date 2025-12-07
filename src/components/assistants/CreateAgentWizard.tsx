import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Code,
  AudioLines,
  Mic,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { agentsApi } from "@/lib/api";

const providers = [
  { value: "elevenlabs", label: "ElevenLabs", icon: "🎙️" },
  { value: "google", label: "Google", icon: "🔷" },
  { value: "openai", label: "OpenAI", icon: "🤖" },
  { value: "anthropic", label: "Anthropic", icon: "🧠" },
  { value: "custom", label: "Custom", icon: "⚙️" },
  { value: "meta", label: "Meta", icon: "🦙" },
  { value: "mistral", label: "Mistral", icon: "🌊" },
  { value: "cohere", label: "Cohere", icon: "⚡" },
  { value: "groq", label: "Groq", icon: "🚀" },
  { value: "perplexity", label: "Perplexity", icon: "🔍" },
];

const modelsByProvider: Record<string, { value: string; label: string }[]> = {
  elevenlabs: [
    { value: "glm-45-air-fp8", label: "GLM-4.5-Air" },
    { value: "qwen3-30b-a3b", label: "Qwen3-30B-A3B" },
    { value: "qwen3-4b", label: "Qwen3-4B" },
    { value: "gpt-oss-120b", label: "GPT-OSS-120B" },
    { value: "gpt-oss-20b", label: "GPT-OSS-20B" },
    { value: "custom-llm", label: "Custom LLM" },
  ],
  google: [
    { value: "gemini-3-pro-preview", label: "Gemini 3 Pro Preview" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
    { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  ],
  openai: [
    { value: "gpt-5", label: "GPT-5" },
    { value: "gpt-5.1", label: "GPT-5.1" },
    { value: "gpt-5-mini", label: "GPT-5 Mini" },
    { value: "gpt-5-nano", label: "GPT-5 Nano" },
    { value: "gpt-4.1", label: "GPT-4.1" },
    { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
    { value: "gpt-4.1-nano", label: "GPT-4.1 Nano" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    { value: "gpt-4o-cluster", label: "GPT 4o Cluster" },
    { value: "gpt-4", label: "GPT-4" },
  ],
  anthropic: [
    { value: "claude-sonnet-4-5", label: "Claude Sonnet 4.5" },
    { value: "claude-sonnet-4", label: "Claude Sonnet 4" },
    { value: "claude-haiku-4-5", label: "Claude Haiku 4.5" },
    { value: "claude-3-7-sonnet", label: "Claude 3.7 Sonnet" },
    { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-haiku", label: "Claude 3 Haiku" },
  ],
  meta: [
    { value: "llama-3-70b", label: "Llama 3 70B" },
    { value: "llama-3-8b", label: "Llama 3 8B" },
    { value: "llama-2-70b", label: "Llama 2 70B" },
  ],
  mistral: [
    { value: "mistral-large", label: "Mistral Large" },
    { value: "mistral-medium", label: "Mistral Medium" },
    { value: "mistral-small", label: "Mistral Small" },
  ],
  cohere: [
    { value: "command-r-plus", label: "Command R+" },
    { value: "command-r", label: "Command R" },
    { value: "command", label: "Command" },
  ],
  groq: [
    { value: "llama-3-70b-8192", label: "Llama 3 70B" },
    { value: "llama-3-8b-8192", label: "Llama 3 8B" },
    { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
  ],
  perplexity: [
    { value: "llama-3-sonar-large-32k-online", label: "Sonar Large 32k Online" },
    { value: "llama-3-sonar-small-32k-online", label: "Sonar Small 32k Online" },
  ],
  custom: [
    { value: "custom-llm", label: "Custom LLM" },
  ],
};

interface CreateAgentWizardProps {
  onComplete: (agentId: string) => void;
  voices: Array<{ id: string; name?: string }>;
  loadingVoices: boolean;
}

type StepType = {
  id: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const steps: StepType[] = [
  { id: 1, label: "Name", icon: User },
  { id: 2, label: "Model", icon: Code },
  { id: 3, label: "Voice", icon: AudioLines },
  { id: 4, label: "Transcriber", icon: Mic },
];

export default function CreateAgentWizard({ onComplete, voices, loadingVoices }: CreateAgentWizardProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);

  // Step 1: Name
  const [name, setName] = useState("");

  // Step 2: Model
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-cluster");
  const [systemPrompt, setSystemPrompt] = useState("# Customer Service & Support Agent Prompt\n");

  // Step 3: Voice
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");

  // Step 4: Transcriber
  const [selectedLanguage, setSelectedLanguage] = useState<string>("english");

  const handleSetStep = (direction: -1 | 1) => {
    if ((currentStep === 0 && direction === -1) || (currentStep === steps.length - 1 && direction === 1)) {
      return;
    }
    setCurrentStep((prev) => prev + direction);
  };

  const handleSaveStep = async () => {
    setSaving(true);
    try {
      const config: Record<string, unknown> = {
        conversation_config: {
          model: {
            model: selectedModel,
            provider: selectedProvider,
            messages: [
              {
                role: "system",
                content: systemPrompt || "# Customer Service & Support Agent Prompt\n"
              }
            ]
          },
          transcriber: {
            provider: "elevenlabs",
            language: selectedLanguage || "english",
            model: "flux-general",
          },
          // Always include voice_id if selected (required for Voice and Transcriber steps)
          ...(selectedVoiceId ? {
            voice_id: selectedVoiceId,
            voice: {
              voice_id: selectedVoiceId,
            }
          } : {})
        },
        platform_settings: {
          ...(selectedVoiceId && { voice_id: selectedVoiceId }),
          language: selectedLanguage || "english"
        }
      };

      let savedAgentId = agentId;

      if (agentId) {
        // Update existing agent
        const response = await agentsApi.update(agentId, {
          name: name.trim(),
          ...config
        });
        if (response.data) {
          savedAgentId = response.data.id;
        } else {
          throw new Error('Failed to update agent');
        }
      } else {
        // Create new agent
        const response = await agentsApi.create({
          name: name.trim(),
          ...config
        });
        if (response.data) {
          savedAgentId = response.data.id;
          setAgentId(response.data.id);
        } else {
          throw new Error('Failed to create agent');
        }
      }

      // Only sync with ElevenLabs on Voice (step 2, index 2) and Transcriber (step 3, index 3) steps
      // Steps array: [0: Name, 1: Model, 2: Voice, 3: Transcriber]
      const shouldSyncWithElevenLabs = currentStep === 2 || currentStep === 3;
      
      // Ensure voice_id is set before syncing (required for ElevenLabs)
      const hasRequiredFields = shouldSyncWithElevenLabs ? selectedVoiceId && selectedVoiceId.trim() !== "" : true;

      if (shouldSyncWithElevenLabs && savedAgentId && hasRequiredFields) {
        // Small delay to ensure database transaction is committed
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          console.log(`[CreateAgentWizard] Syncing with ElevenLabs for step ${currentStep} (${steps[currentStep].label}), agent ID: ${savedAgentId}`);
          console.log(`[CreateAgentWizard] Current config - Voice ID: ${selectedVoiceId}, Language: ${selectedLanguage}`);
          console.log(`[CreateAgentWizard] Full config being sent:`, JSON.stringify(config, null, 2));
          
          const publishResponse = await agentsApi.publish(savedAgentId);
          console.log('[CreateAgentWizard] Publish response:', publishResponse);
          
          if (publishResponse.data) {
            toast({
              title: 'Success',
              description: `${steps[currentStep].label} saved and synced with ElevenLabs successfully.`,
            });
          } else {
            throw new Error('Publish response did not return agent data');
          }
        } catch (publishErr) {
          console.error('[CreateAgentWizard] Failed to sync with ElevenLabs:', publishErr);
          const errorMessage = publishErr instanceof Error ? publishErr.message : 'Unknown error';
          // If publish fails, still show success for database save but warn about ElevenLabs
          toast({
            title: 'Partially saved',
            description: `${steps[currentStep].label} saved to database, but failed to sync with ElevenLabs: ${errorMessage}`,
            variant: 'destructive',
          });
          // Don't re-throw - allow user to continue even if sync fails
        }
      } else if (shouldSyncWithElevenLabs && !hasRequiredFields) {
        // Voice/Transcriber step but missing required fields
        toast({
          title: 'Warning',
          description: `${steps[currentStep].label} saved to database, but cannot sync with ElevenLabs: Voice ID is required.`,
          variant: 'destructive',
        });
      } else {
        // For Name and Model steps, just show success for database save
        console.log(`[CreateAgentWizard] Skipping ElevenLabs sync for step ${currentStep} (${steps[currentStep].label})`);
        toast({
          title: 'Success',
          description: `${steps[currentStep].label} saved successfully.`,
        });
      }

      if (currentStep === steps.length - 1) {
        onComplete(savedAgentId);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return name.trim() !== "" && name.trim() !== "Enter a name for your assistant.";
      case 1:
        return selectedModel.trim() !== "" && systemPrompt.trim() !== "" && systemPrompt.trim() !== "# Customer Service & Support Agent Prompt\n";
      case 2:
        return selectedVoiceId.trim() !== "";
      case 3:
        return selectedLanguage.trim() !== "";
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Assistant Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a name for your assistant"
                className="w-full"
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Provider</label>
              <Select
                value={selectedProvider}
                onValueChange={(value) => {
                  setSelectedProvider(value);
                  const models = modelsByProvider[value];
                  if (models && models.length > 0) {
                    setSelectedModel(models[0].value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      <span className="flex items-center gap-2">
                        <span>{provider.icon}</span>
                        <span>{provider.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modelsByProvider[selectedProvider]?.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">System Prompt</label>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Enter the system prompt for the assistant..."
                className="min-h-[150px] font-mono text-sm"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Voice</label>
              {loadingVoices ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-md border border-border">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Loading voices...</span>
                </div>
              ) : (
                <Select value={selectedVoiceId} onValueChange={setSelectedVoiceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.length > 0 ? (
                      voices.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          {voice.name || voice.id}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No voices available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="portuguese">Portuguese</SelectItem>
                  <SelectItem value="polish">Polish</SelectItem>
                  <SelectItem value="turkish">Turkish</SelectItem>
                  <SelectItem value="russian">Russian</SelectItem>
                  <SelectItem value="dutch">Dutch</SelectItem>
                  <SelectItem value="czech">Czech</SelectItem>
                  <SelectItem value="arabic">Arabic</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                  <SelectItem value="japanese">Japanese</SelectItem>
                  <SelectItem value="hungarian">Hungarian</SelectItem>
                  <SelectItem value="korean">Korean</SelectItem>
                  <SelectItem value="multi">Multi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-6 md:p-8 bg-card border-b border-border">
        <Steps numSteps={steps.length} currentStep={currentStep} steps={steps} />
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{steps[currentStep].label}</h2>
            <p className="text-muted-foreground">
              {currentStep === 0 && "Give your assistant a name to identify it."}
              {currentStep === 1 && "Configure the AI model and system prompt for your assistant."}
              {currentStep === 2 && "Select a voice for your assistant to use."}
              {currentStep === 3 && "Choose the language for transcription."}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            {renderStepContent()}
          </div>
        </div>
      </div>

      <div className="border-t border-border p-6 md:p-8">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => handleSetStep(-1)}
            disabled={currentStep === 0 || saving}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={handleSaveStep}
            disabled={!isStepValid() || saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {currentStep === steps.length - 1 ? "Complete" : "Save & Continue"}
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

const Steps = ({
  numSteps,
  currentStep,
  steps,
}: {
  numSteps: number;
  currentStep: number;
  steps: StepType[];
}) => {
  return (
    <div className="flex items-center justify-between gap-3 max-w-2xl mx-auto">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isActive = index <= currentStep;
        const Icon = step.icon;

        return (
          <React.Fragment key={stepNum}>
            <Step num={stepNum} isActive={isActive} icon={Icon} label={step.label} />
            {stepNum !== numSteps && (
              <div className="w-full h-1 rounded-full bg-secondary relative">
                <motion.div
                  className="absolute top-0 bottom-0 left-0 bg-primary rounded-full"
                  animate={{ width: isActive ? "100%" : 0 }}
                  transition={{ ease: "easeIn", duration: 0.3 }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Step = ({ 
  num, 
  isActive, 
  icon: Icon, 
  label 
}: { 
  num: number; 
  isActive: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) => {
  return (
    <div className="relative flex flex-col items-center gap-2">
      <div
        className={cn(
          "w-12 h-12 flex items-center justify-center shrink-0 border-2 rounded-full font-semibold text-sm relative z-10 transition-colors duration-300",
          isActive
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30 text-muted-foreground bg-card"
        )}
      >
        <AnimatePresence mode="wait">
          {isActive ? (
            <motion.div
              key="icon-check"
              initial={{ rotate: 180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -180, opacity: 0 }}
              transition={{ duration: 0.125 }}
            >
              <Check className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div
              key="icon-step"
              initial={{ rotate: 180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -180, opacity: 0 }}
              transition={{ duration: 0.125 }}
            >
              <Icon className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <span className={cn(
        "text-xs font-medium",
        isActive ? "text-foreground" : "text-muted-foreground"
      )}>
        {label}
      </span>
      {isActive && (
        <motion.div
          className="absolute z-0 -inset-1.5 bg-primary/20 rounded-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );
};
