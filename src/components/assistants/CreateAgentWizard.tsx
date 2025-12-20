import React, { useState, useRef, useEffect } from "react";
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
import { agentsApi, voicesApi, Voice } from "@/lib/api";
import { VoiceSelectorDialog } from "@/components/assistants/VoiceSelectorDialog";

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
  voices?: Array<{ id: string; name?: string }>; // Optional, will fetch if not provided
  loadingVoices?: boolean;
  initialData?: {
    templateId?: string;
    assistantName?: string;
    systemPrompt?: string;
    firstMessage?: string;
    skipNameStep?: boolean;
  };
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


export default function CreateAgentWizard({ onComplete, voices: propVoices, loadingVoices: propLoadingVoices, initialData }: CreateAgentWizardProps) {
  const { toast } = useToast();
  // Skip name step if name is already provided
  const shouldSkipNameStep = initialData?.skipNameStep && initialData?.assistantName;
  const [currentStep, setCurrentStep] = useState(shouldSkipNameStep ? 1 : 0);
  const [saving, setSaving] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);

  // Step 1: Name
  const [name, setName] = useState(initialData?.assistantName || "");

  // Step 2: Model
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-cluster");
  const [systemPrompt, setSystemPrompt] = useState(
    initialData?.systemPrompt || "# Customer Service & Support Agent Prompt\n"
  );
  const [firstMessage, setFirstMessage] = useState(initialData?.firstMessage || "");

  // Step 3: Voice
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(propLoadingVoices || false);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState("");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Step 4: Transcriber
  const [selectedLanguage, setSelectedLanguage] = useState<string>("english");

  // Fetch voices if not provided
  useEffect(() => {
    const fetchVoices = async () => {
      // Always fetch from API to get full voice data including preview_url
      setLoadingVoices(true);
      try {
        const response = await voicesApi.list();
        if (response.data) {
          setVoices(response.data);
        }
      } catch (err) {
        console.error('Error fetching voices:', err);
        // Fallback to prop voices if API fails
        if (propVoices && propVoices.length > 0) {
          const convertedVoices: Voice[] = propVoices.map(v => ({
            id: v.id,
            name: v.name || v.id,
          }));
          setVoices(convertedVoices);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to load voices. Please try again.',
            variant: 'destructive',
          });
        }
      } finally {
        setLoadingVoices(false);
      }
    };

    fetchVoices();
  }, [propVoices, toast]);

  const handleSetStep = (direction: -1 | 1) => {
    const minStep = shouldSkipNameStep ? 1 : 0;
    const maxStep = shouldSkipNameStep ? steps.length - 2 : steps.length - 1;
    
    if ((currentStep === minStep && direction === -1) || (currentStep === maxStep && direction === 1)) {
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
          } : {}),
          // Include first message if provided
          ...(firstMessage && firstMessage.trim() ? {
            first_message: firstMessage.trim(),
            first_message_mode: "assistant-speaks-first"
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

      const maxStep = shouldSkipNameStep ? steps.length - 2 : steps.length - 1;
      if (currentStep === maxStep) {
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
    // If name step is skipped, currentStep 0 = Model, 1 = Voice, 2 = Transcriber
    // If name step is not skipped, currentStep 0 = Name, 1 = Model, 2 = Voice, 3 = Transcriber
    if (shouldSkipNameStep) {
      switch (currentStep) {
        case 1: // Model step
          return selectedModel.trim() !== "" && systemPrompt.trim() !== "" && systemPrompt.trim() !== "# Customer Service & Support Agent Prompt\n";
        case 2: // Voice step
          return selectedVoiceId.trim() !== "";
        case 3: // Transcriber step
          return selectedLanguage.trim() !== "";
        default:
          return false;
      }
    } else {
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
    }
  };

  const handlePlayPreview = (voice: Voice) => {
    if (!voice.preview_url) {
      console.warn('No preview_url for voice:', voice.id, voice);
      toast({
        title: 'Preview unavailable',
        description: 'This voice does not have a preview available.',
        variant: 'destructive',
      });
      return;
    }

    console.log('Playing preview for voice:', voice.id, 'URL:', voice.preview_url);

    // Stop currently playing audio if any
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
      setPlayingVoiceId(null);
    }

    // If clicking the same voice that's playing, just stop it
    if (playingVoiceId === voice.id) {
      setPlayingVoiceId(null);
      return;
    }

    // Create and play new audio
    const audio = new Audio(voice.preview_url);
    currentAudioRef.current = audio;
    setPlayingVoiceId(voice.id || null);

    // Handle when audio ends
    audio.addEventListener('ended', () => {
      console.log('Audio ended for voice:', voice.id);
      setPlayingVoiceId(null);
      currentAudioRef.current = null;
    });

    // Handle errors
    audio.addEventListener('error', (e) => {
      console.error('Audio error for voice:', voice.id, e);
      setPlayingVoiceId(null);
      currentAudioRef.current = null;
      toast({
        title: 'Preview unavailable',
        description: 'Could not play voice preview.',
        variant: 'destructive',
      });
    });

    audio.play().catch((err) => {
      console.error('Error playing preview:', err, 'Voice:', voice.id, 'URL:', voice.preview_url);
      setPlayingVoiceId(null);
      currentAudioRef.current = null;
      toast({
        title: 'Preview unavailable',
        description: 'Could not play voice preview. Please check your browser audio settings.',
        variant: 'destructive',
      });
    });
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);


  const selectedVoice = voices.find(v => v.id === selectedVoiceId);

  const renderStepContent = () => {
    // If name step is skipped, currentStep 1 = Model, 2 = Voice, 3 = Transcriber
    // If name step is not skipped, currentStep 0 = Name, 1 = Model, 2 = Voice, 3 = Transcriber
    if (shouldSkipNameStep) {
      switch (currentStep) {
        case 1: // Model step
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
                  <SelectTrigger className="bg-white">
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
                  <SelectTrigger className="bg-white">
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
                  className="min-h-[250px] font-mono text-sm bg-white"
                />
              </div>
            </div>
          );
        case 2: // Voice step
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
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start bg-white"
                      onClick={() => setShowVoiceSelector(true)}
                    >
                      {selectedVoice ? (
                        <span className="flex items-center gap-2">
                          <AudioLines className="h-4 w-4" />
                          {selectedVoice.name || selectedVoice.id}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Select a voice</span>
                      )}
                    </Button>
                    <VoiceSelectorDialog
                      open={showVoiceSelector}
                      onOpenChange={setShowVoiceSelector}
                      voices={voices}
                      selectedVoiceId={selectedVoiceId}
                      onSelectVoice={(voiceId) => {
                        setSelectedVoiceId(voiceId);
                        setShowVoiceSelector(false);
                      }}
                      playingVoiceId={playingVoiceId}
                      onPlayPreview={handlePlayPreview}
                      searchQuery={voiceSearchQuery}
                      onSearchChange={setVoiceSearchQuery}
                    />
                  </>
                )}
              </div>
            </div>
          );
        case 3: // Transcriber step
          return (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="bg-white">
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
    } else {
      // Normal flow with name step
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
                  className="w-full bg-white"
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
                  <SelectTrigger className="bg-white">
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
                  <SelectTrigger className="bg-white">
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
                  className="min-h-[350px] font-mono text-sm bg-white"
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
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start bg-white"
                      onClick={() => setShowVoiceSelector(true)}
                    >
                      {selectedVoice ? (
                        <span className="flex items-center gap-2">
                          <AudioLines className="h-4 w-4" />
                          {selectedVoice.name || selectedVoice.id}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Select a voice</span>
                      )}
                    </Button>
                    <VoiceSelectorDialog
                      open={showVoiceSelector}
                      onOpenChange={setShowVoiceSelector}
                      voices={voices}
                      selectedVoiceId={selectedVoiceId}
                      onSelectVoice={(voiceId) => {
                        setSelectedVoiceId(voiceId);
                        setShowVoiceSelector(false);
                      }}
                      playingVoiceId={playingVoiceId}
                      onPlayPreview={handlePlayPreview}
                      searchQuery={voiceSearchQuery}
                      onSearchChange={setVoiceSearchQuery}
                    />
                  </>
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
                  <SelectTrigger className="bg-white">
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
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-6 md:p-8 bg-card border-b border-border">
        <Steps 
          numSteps={steps.length} 
          currentStep={shouldSkipNameStep ? currentStep : currentStep}
          steps={steps} 
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {shouldSkipNameStep 
                ? steps[currentStep]?.label
                : steps[currentStep]?.label
              }
            </h2>
            <p className="text-muted-foreground">
              {(() => {
                if (shouldSkipNameStep) {
                  if (currentStep === 1) return "Configure the AI model and system prompt for your assistant.";
                  if (currentStep === 2) return "Select a voice for your assistant to use.";
                  if (currentStep === 3) return "Choose the language for transcription.";
                  return "";
                } else {
                  if (currentStep === 0) return "Give your assistant a name to identify it.";
                  if (currentStep === 1) return "Configure the AI model and system prompt for your assistant.";
                  if (currentStep === 2) return "Select a voice for your assistant to use.";
                  if (currentStep === 3) return "Choose the language for transcription.";
                  return "";
                }
              })()}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            {renderStepContent()}
          </div>
        </div>
      </div>

      <div className="border-t border-border p-6 md:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => handleSetStep(-1)}
            disabled={(shouldSkipNameStep ? currentStep === 1 : currentStep === 0) || saving}
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
                {(shouldSkipNameStep ? currentStep === steps.length - 2 : currentStep === steps.length - 1) ? "Complete" : "Save & Continue"}
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
    <div className="flex items-center justify-center gap-2 max-w-2xl mx-auto">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isActive = isCompleted || isCurrent;
        const Icon = step.icon;

        return (
          <React.Fragment key={stepNum}>
            <Step 
              num={stepNum} 
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              icon={Icon} 
              label={step.label} 
            />
            {stepNum !== numSteps && (
              <div className={cn(
                "flex-1 h-0.5 rounded-full relative transition-colors",
                isCompleted ? "bg-primary" : "bg-muted"
              )}>
                {/* Thick line for completed connections */}
                {isCompleted && (
                  <div className="absolute top-0 bottom-0 left-0 right-0 bg-primary h-1 -top-0.5 rounded-full" />
                )}
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
  isCompleted,
  isCurrent,
  icon: Icon, 
  label 
}: { 
  num: number; 
  isCompleted: boolean;
  isCurrent: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) => {
  const isActive = isCompleted || isCurrent;
  
  return (
    <div className="relative flex flex-col items-center gap-2 min-w-[80px]">
      <div className="relative">
        {/* Glow effect for current step */}
        {isCurrent && (
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20 blur-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {/* Step circle */}
        <div
          className={cn(
            "w-10 h-10 flex items-center justify-center shrink-0 rounded-full font-semibold text-sm relative z-10 transition-all duration-300",
            isCompleted
              ? "bg-primary border-2 border-primary text-primary-foreground"
              : isCurrent
              ? "bg-primary border-2 border-primary text-primary-foreground shadow-lg shadow-primary/30 ring-2 ring-primary/20"
              : "border-2 border-muted-foreground/30 text-muted-foreground bg-background"
          )}
        >
          <AnimatePresence mode="wait">
            {isCompleted ? (
              <motion.div
                key="icon-check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Check className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div
                key="icon-step"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  isCurrent ? "text-primary-foreground" : "text-muted-foreground"
                )} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <span className={cn(
        "text-xs font-medium text-center",
        isActive ? "text-foreground font-semibold" : "text-muted-foreground"
      )}>
        {label}
      </span>
    </div>
  );
};
