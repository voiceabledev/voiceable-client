import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft,
  Copy, 
  ChevronDown,
  Globe,
  CheckCircle2,
  Code,
  MessageSquare,
  Phone,
  Mic,
  AudioLines,
  Settings,
  X,
  Info,
  Volume2,
  VolumeX,
  Shield,
  Quote,
  Music,
  Video,
  Upload,
  Paperclip,
  Trash2,
  Send,
  User,
  FileText,
  Loader2,
  Layout,
  GitBranch,
  Plus,
  Search,
  Edit,
  MoreHorizontal,
  Play,
  Pause,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import WidgetTab from "@/components/assistants/WidgetTab";
import ConversationsTab from "@/components/assistants/ConversationsTab";
import CreateAgentWizard from "@/components/assistants/CreateAgentWizard";
import CostAndLatency from "@/components/assistants/CostAndLatency";
import { agentsApi, Agent, voicesApi, Voice, agentFilesApi, AgentFile, awsS3Api, conversationsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const tabs = [
  { id: "configuration", label: "Configuration", icon: Settings },
  { id: "prompt-logic", label: "Prompt Logic", icon: FileText },
  { id: "conversations", label: "Conversations", icon: MessageSquare },
  // { id: "widget", label: "Widget", icon: Layout },
  // { id: "advanced", label: "Advanced", icon: Settings },
];

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

export default function AssistantDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("configuration");
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const isMobile = useIsMobile();
  
  // Check if this is a new assistant - check both route param and pathname
  const isNew = location.pathname === "/assistants/create" || id === "create";
  
  // Get agent name and ID for display
  const agentName = agent?.name || "Enter a name for your assistant.";
  const agentId = agent?.id || (isNew ? "new" : "");
  
  // State for name editing
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const nameInitializedRef = useRef(false);
  const [saving, setSaving] = useState(false);
  
  // Initialize tempName when agent loads or when creating new
  useEffect(() => {
    if (!nameInitializedRef.current) {
      if (agent?.name) {
        setTempName(agent.name);
        nameInitializedRef.current = true;
      } else if (isNew) {
        // For new agents, start with empty string so validation works correctly
        setTempName("");
        nameInitializedRef.current = true;
      }
    } else if (agent?.name && !editingName) {
      // Only update tempName if it's empty or matches a default value
      // Don't reset if user just edited it (tempName will be different until save)
      const currentTemp = tempName || "";
      if (!currentTemp || currentTemp === "New Assistant" || currentTemp === "Loading...") {
        setTempName(agent.name);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent?.name, isNew, editingName]);
  
  const [modelExpanded, setModelExpanded] = useState(false);
  const [voiceConfigExpanded, setVoiceConfigExpanded] = useState(false);
  const [additionalConfigExpanded, setAdditionalConfigExpanded] = useState(true);
  const [transcriberExpanded, setTranscriberExpanded] = useState(false);
  const [backgroundDenoising, setBackgroundDenoising] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState([0.4]);
  const [keyterms, setKeyterms] = useState("");
  const [endOfTurnConfidence, setEndOfTurnConfidence] = useState([0.7]);
  const [endOfTurnTimeout, setEndOfTurnTimeout] = useState([5000]);
  const [privacyExpanded, setPrivacyExpanded] = useState(true);
  const [hipaaCompliance, setHipaaCompliance] = useState(false);
  const [audioRecording, setAudioRecording] = useState(true);
  const [logging, setLogging] = useState(true);
  const [transcript, setTranscript] = useState(true);
  const [videoRecording, setVideoRecording] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("# Customer Service & Support Agent Prompt\n");
  const [firstMessage, setFirstMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [agentFiles, setAgentFiles] = useState<AgentFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-cluster");
  const [firstMessageMode, setFirstMessageMode] = useState("assistant-speaks-first");
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("english");

  // System tools state
  const [systemTools, setSystemTools] = useState<Record<string, boolean>>({
    "end-conversation": false,
    "detect-language": false,
    "skip-turn": false,
    "transfer-to-agent": false,
    "transfer-to-number": false,
    "play-keypad-touch-tone": false,
    "voicemail-detection": false,
  });
  
  // Track saved configuration to detect changes
  const [savedConfig, setSavedConfig] = useState<{
    name: string;
    config: ReturnType<typeof buildConfiguration>;
  } | null>(null);

  // Extract system prompt and first message from agent data
  const extractAgentData = useCallback((agentData: Agent) => {
    if (agentData.conversation_config) {
      const config = agentData.conversation_config as Record<string, unknown>;
      
      // Extract system prompt from conversation_config
      let systemPromptFound = false;
      
      // First check for direct system_prompt
      if (typeof config.system_prompt === 'string' && config.system_prompt.trim()) {
        setSystemPrompt(config.system_prompt);
        systemPromptFound = true;
      } 
      // Then check in model.messages array
      else if (config.model && typeof config.model === 'object') {
        const modelConfig = config.model as Record<string, unknown>;
        
        if (Array.isArray(modelConfig.messages)) {
          const messages = modelConfig.messages as Array<Record<string, unknown>>;
          const systemMessage = messages.find((msg) => msg.role === 'system');
          if (systemMessage && typeof systemMessage.content === 'string' && systemMessage.content.trim()) {
            setSystemPrompt(systemMessage.content);
            systemPromptFound = true;
          }
        }
      }
      
      // If no system prompt found, use default
      if (!systemPromptFound) {
        setSystemPrompt("# Customer Service & Support Agent Prompt\n");
      }
      
      // Extract first message
      if (typeof config.first_message === 'string') {
        setFirstMessage(config.first_message);
      } else {
        setFirstMessage("");
      }
      
      // Extract first message mode
      if (typeof config.first_message_mode === 'string') {
        const mode = config.first_message_mode as "assistant-speaks-first" | "assistant-waits-for-user" | "assistant-speaks-first-model-generated";
        setFirstMessageMode(mode);
      } else {
        setFirstMessageMode("assistant-speaks-first");
      }
      
      // Extract system tools
      if (Array.isArray(config.system_tools)) {
        const tools = config.system_tools as string[];
        setSystemTools(prev => {
          const newTools = { ...prev };
          Object.keys(newTools).forEach(key => {
            newTools[key] = tools.includes(key);
          });
          return newTools;
        });
      }
      
      // Extract model/provider if available
      if (config.model && typeof config.model === 'object') {
        const modelConfig = config.model as Record<string, unknown>;
        if (typeof modelConfig.model === 'string') {
          setSelectedModel(modelConfig.model);
        }
        if (typeof modelConfig.provider === 'string') {
          setSelectedProvider(modelConfig.provider);
        }
      }
      
      // Extract voice information - only set if not already set to preserve user selection
      setSelectedVoiceId((currentVoiceId) => {
        // If we already have a voice selected, preserve it
        if (currentVoiceId) {
          return currentVoiceId;
        }
        // Otherwise, extract from config
        if (typeof config.voice_id === 'string') {
          return config.voice_id;
      } else if (config.voice && typeof config.voice === 'object') {
        const voiceConfig = config.voice as Record<string, unknown>;
        if (typeof voiceConfig.voice_id === 'string') {
            return voiceConfig.voice_id;
          }
        }
        return currentVoiceId;
      });
      
      // Set voice name if available
      setSelectedVoiceName((currentVoiceName) => {
        // If we already have a name, preserve it
        if (currentVoiceName) {
          return currentVoiceName;
        }
        // Otherwise, extract from config
        if (config.voice && typeof config.voice === 'object') {
          const voiceConfig = config.voice as Record<string, unknown>;
        if (typeof voiceConfig.name === 'string') {
            return voiceConfig.name;
        }
      }
        return currentVoiceName;
      });
      
      // Extract transcriber configuration
      if (config.transcriber && typeof config.transcriber === 'object') {
        const transcriberConfig = config.transcriber as Record<string, unknown>;
        if (typeof transcriberConfig.language === 'string') {
          setSelectedLanguage(transcriberConfig.language);
        }
        if (typeof transcriberConfig.background_denoising_enabled === 'boolean') {
          setBackgroundDenoising(transcriberConfig.background_denoising_enabled);
        }
        if (typeof transcriberConfig.confidence_threshold === 'number') {
          setConfidenceThreshold([transcriberConfig.confidence_threshold]);
        }
        if (Array.isArray(transcriberConfig.keyterms)) {
          setKeyterms(transcriberConfig.keyterms.join(', '));
        } else if (typeof transcriberConfig.keyterms === 'string') {
          setKeyterms(transcriberConfig.keyterms);
        }
        if (transcriberConfig.end_of_turn && typeof transcriberConfig.end_of_turn === 'object') {
          const endOfTurn = transcriberConfig.end_of_turn as Record<string, unknown>;
          if (typeof endOfTurn.confidence_threshold === 'number') {
            setEndOfTurnConfidence([endOfTurn.confidence_threshold]);
          }
          if (typeof endOfTurn.timeout_ms === 'number') {
            setEndOfTurnTimeout([endOfTurn.timeout_ms]);
          }
        }
      }
    }
    
    // Also check platform_settings for voice info
    if (agentData.platform_settings) {
      const platformSettings = agentData.platform_settings as Record<string, unknown>;
      // Only set voice_id from platform_settings if not already set
      setSelectedVoiceId((currentVoiceId) => {
        if (currentVoiceId) {
          return currentVoiceId;
        }
        if (typeof platformSettings.voice_id === 'string') {
          return platformSettings.voice_id;
      }
        return currentVoiceId;
      });
      // Check for language in platform_settings
      if (typeof platformSettings.language === 'string' && !selectedLanguage) {
        setSelectedLanguage(platformSettings.language);
      }
    }
    
    // Extract privacy settings
    if (agentData.conversation_config) {
      const config = agentData.conversation_config as Record<string, unknown>;
      if (typeof config.hipaa_compliance === 'boolean') {
        setHipaaCompliance(config.hipaa_compliance);
      }
      if (typeof config.audio_recording === 'boolean') {
        setAudioRecording(config.audio_recording);
      }
      if (typeof config.logging === 'boolean') {
        setLogging(config.logging);
      }
      if (typeof config.transcript === 'boolean') {
        setTranscript(config.transcript);
      }
      if (typeof config.video_recording === 'boolean') {
        setVideoRecording(config.video_recording);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Fetch voices list
  useEffect(() => {
    const fetchVoices = async () => {
      setLoadingVoices(true);
      try {
        const response = await voicesApi.list();
        if (response.data) {
          setVoices(response.data);
          
          // Set default voice for new assistants if no voice is selected
          if (isNew && !selectedVoiceId && response.data.length > 0) {
            const firstVoice = response.data[0];
            setSelectedVoiceId(firstVoice.id);
            if (firstVoice.name) {
              setSelectedVoiceName(firstVoice.name);
            }
          }
          
          // If we have a selectedVoiceId but no name, try to find it in the voices list
          if (selectedVoiceId && !selectedVoiceName) {
            const voice = response.data.find(v => v.id === selectedVoiceId);
            if (voice?.name) {
              setSelectedVoiceName(voice.name);
            }
          }
        }
      } catch (err) {
        toast({
          title: 'Error loading voices',
          description: err instanceof Error ? err.message : 'Failed to fetch voices',
          variant: 'destructive',
        });
      } finally {
        setLoadingVoices(false);
      }
    };
    
    fetchVoices();
  }, [toast, isNew, selectedVoiceId, selectedVoiceName]);

  // Fetch voice name if we have voice_id but no name
  useEffect(() => {
    const fetchVoiceName = async () => {
      if (selectedVoiceId && !selectedVoiceName && voices.length > 0) {
        // First try to find in voices list
        const voice = voices.find(v => v.id === selectedVoiceId);
        if (voice?.name) {
          setSelectedVoiceName(voice.name);
          return;
        }
      }
      
      // If still no name and we have a voice_id, try to fetch from API
      if (selectedVoiceId && !selectedVoiceName) {
        try {
          const response = await voicesApi.get(selectedVoiceId);
          if (response.data?.name) {
            setSelectedVoiceName(response.data.name);
          }
        } catch (err) {
          // Silently fail - voice name is optional
          console.warn('Could not fetch voice name:', err);
        }
      }
    };
    
    fetchVoiceName();
  }, [selectedVoiceId, selectedVoiceName, voices]);

  // Restore voice name when voice tab becomes active
  useEffect(() => {
    if (activeTab === "configuration" && selectedVoiceId && !selectedVoiceName) {
      // First try to find in voices list if it's loaded
      if (voices.length > 0) {
        const voice = voices.find(v => v.id === selectedVoiceId);
        if (voice?.name) {
          setSelectedVoiceName(voice.name);
          return;
        }
      }
      
      // If not found in voices list, try to fetch from API
      const fetchVoiceName = async () => {
        try {
          const response = await voicesApi.get(selectedVoiceId);
          if (response.data?.name) {
            setSelectedVoiceName(response.data.name);
          }
        } catch (err) {
          // Silently fail - voice name is optional
          console.warn('Could not fetch voice name:', err);
        }
      };
      
      fetchVoiceName();
    }
  }, [activeTab, selectedVoiceId, selectedVoiceName, voices]);

  // Fetch agent details when ID changes
  const fetchAgentDetails = useCallback(async (agentId: string) => {
    if (isNew) return;
    
    setLoading(true);
    try {
      const response = await agentsApi.get(agentId);
      if (response.data) {
        setAgent(response.data);
        // Extract agent data after setting agent to ensure state is ready
        extractAgentData(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch agent details';
      toast({
        title: 'Error loading agent',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [isNew, extractAgentData, toast]);

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }
    if (id && !isNew) {
      fetchAgentDetails(id);
      fetchAgentFiles(id);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew, fetchAgentDetails, location.pathname]);

  // Fetch agent files
  const fetchAgentFiles = useCallback(async (agentId: string) => {
    try {
      const response = await agentFilesApi.list(agentId);
      if (response.data) {
        setAgentFiles(response.data);
      }
    } catch (err) {
      console.warn('Failed to fetch agent files:', err);
    }
  }, []);

  // Load files when agent changes
  useEffect(() => {
    if (agent?.id && !isNew) {
      fetchAgentFiles(agent.id.toString());
    } else {
      setAgentFiles([]);
    }
  }, [agent?.id, isNew, fetchAgentFiles]);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: File[]) => {
    // For new agents, just add files to attachedFiles state (will be uploaded after save)
    if (isNew || !agent?.id) {
      setAttachedFiles(prev => [...prev, ...files]);
      toast({
        title: 'Files added',
        description: `Added ${files.length} file(s). They will be uploaded when you save the agent.`,
      });
      return;
    }

    const agentId = agent.id.toString();

    for (const file of files) {
      const fileKey = `${file.name}-${Date.now()}`;
      setUploadingFiles(prev => new Set(prev).add(fileKey));

      try {
        // Get presigned URL
        const presignedResponse = await awsS3Api.getPresignedUrl(
          file.name,
          file.type || 'application/octet-stream',
          fileKey
        );

        if (!presignedResponse.data) {
          throw new Error('Failed to get presigned URL');
        }

        // Upload to S3
        const uploadResponse = await fetch(presignedResponse.data.url, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file to S3');
        }

        // Associate file with agent and sync to ElevenLabs
        const associateResponse = await agentFilesApi.createAndSync(agentId.toString(), {
          s3_key: presignedResponse.data.key,
          s3_url: presignedResponse.data.public_url,
          file_name: file.name,
          file_size: file.size,
          content_type: file.type || 'application/octet-stream',
        });

        if (associateResponse.data) {
          setAgentFiles(prev => [...prev, associateResponse.data!]);
          toast({
            title: 'Success',
            description: `File "${file.name}" uploaded and synced with ElevenLabs successfully.`,
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
        toast({
          title: 'Error',
          description: `Failed to upload "${file.name}": ${errorMessage}`,
          variant: 'destructive',
        });
      } finally {
        setUploadingFiles(prev => {
          const next = new Set(prev);
          next.delete(fileKey);
          return next;
        });
      }
    }
  }, [agent?.id, isNew, toast]);

  // Handle file deletion
  const handleFileDelete = useCallback(async (fileId: number) => {
    if (!agent?.id) return;

    try {
      await agentFilesApi.delete(agent.id.toString(), fileId);
      setAgentFiles(prev => prev.filter(f => f.id !== fileId));
      toast({
        title: 'Success',
        description: 'File removed successfully.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete file';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [agent?.id, toast]);
  const [showPreviewChat, setShowPreviewChat] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "assistant" | "user"; content: string; timestamp: Date }>>([
    { role: "assistant", content: "Hello. This is Cameron. calling on behalf of Quality Metrics Research. We're conducting a brief survey about customer satisfaction. This will take approximately five minutes and help improve our services. Would you be willing to participate today?", timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [callInProgress, setCallInProgress] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset all form state when switching between assistants or creating a new one
  useEffect(() => {
    if (isNew) {
      // Reset to default values for new assistant
      setModelExpanded(true);
      setVoiceConfigExpanded(true);
      setAdditionalConfigExpanded(true);
      setTranscriberExpanded(true);
      setBackgroundDenoising(false);
      setConfidenceThreshold([0.4]);
      setKeyterms("");
      setEndOfTurnConfidence([0.7]);
      setEndOfTurnTimeout([5000]);
      setPrivacyExpanded(true);
      setHipaaCompliance(false);
      setAudioRecording(true);
      setLogging(true);
      setTranscript(true);
      setVideoRecording(false);
      setSystemPrompt("# Customer Service & Support Agent Prompt\n");
      setFirstMessage("");
      setAttachedFiles([]);
      setSelectedProvider("openai");
      setSelectedModel("gpt-4o-cluster");
      setFirstMessageMode("assistant-speaks-first");
      setShowPreviewChat(false);
      setIsMuted(false);
      setChatMessages([
        { role: "assistant", content: "Hello. This is Cameron. calling on behalf of Quality Metrics Research. We're conducting a brief survey about customer satisfaction. This will take approximately five minutes and help improve our services. Would you be willing to participate today?", timestamp: new Date() }
      ]);
      setChatInput("");
      setCallInProgress(false);
      setCallTimer(0);
      setShowConfigPanel(false);
      setEditingName(false);
      setTempName("");
      nameInitializedRef.current = false;
    }
  }, [id, isNew]);

  // Timer effect
  useEffect(() => {
    if (callInProgress) {
      timerIntervalRef.current = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [callInProgress]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Build the complete configuration payload
  const buildConfiguration = useCallback(() => {
    const conversationConfig: Record<string, unknown> = {
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
        background_denoising_enabled: backgroundDenoising,
        confidence_threshold: confidenceThreshold[0],
        ...(keyterms && { keyterms: keyterms.split(',').map(k => k.trim()).filter(k => k) }),
        end_of_turn: {
          confidence_threshold: endOfTurnConfidence[0],
          timeout_ms: endOfTurnTimeout[0]
        }
      },
      first_message_mode: firstMessageMode,
      ...(firstMessage && firstMessage.trim() && { first_message: firstMessage.trim() }),
      ...(Object.keys(systemTools).some(key => systemTools[key]) && {
        system_tools: Object.entries(systemTools)
          .filter(([_, enabled]) => enabled)
          .map(([key]) => key)
      }),
      ...(selectedVoiceId && {
        voice_id: selectedVoiceId
      }),
      ...(selectedVoiceId && {
        voice: {
          voice_id: selectedVoiceId,
          ...(selectedVoiceName && { name: selectedVoiceName })
        }
      })
    };

    const platformSettings: Record<string, unknown> = {
      ...(selectedVoiceId && { voice_id: selectedVoiceId }),
      language: selectedLanguage || "english"
    };

    const privacySettings: Record<string, unknown> = {
      hipaa_compliance: hipaaCompliance,
      audio_recording: audioRecording,
      logging: logging,
      transcript: transcript,
      video_recording: videoRecording
    };

    return {
      conversation_config: {
        ...conversationConfig,
        ...privacySettings
      },
      platform_settings: platformSettings
    };
  }, [
    selectedModel,
    selectedProvider,
    systemPrompt,
    systemTools,
    selectedLanguage,
    backgroundDenoising,
    confidenceThreshold,
    keyterms,
    endOfTurnConfidence,
    endOfTurnTimeout,
    firstMessage,
    firstMessageMode,
    selectedVoiceId,
    selectedVoiceName,
    hipaaCompliance,
    audioRecording,
    logging,
    transcript,
    videoRecording
  ]);

  // Update saved config when agent loads (only when agent ID changes)
  useEffect(() => {
    if (agent && !isNew && agent.id) {
      // Use a ref to track if we've already saved config for this agent
      const config = buildConfiguration();
      const nameToSave = agent.name || "";
      setSavedConfig({
        name: nameToSave,
        config: JSON.parse(JSON.stringify(config)) // Deep clone
      });
    } else if (isNew) {
      // For new agents, clear saved config
      setSavedConfig(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent?.id, isNew]); // Only update when agent ID changes or when switching to/from new

  // Check if form is valid for new agents (computed value, not a function)
  const isFormValid = useMemo(() => {
    // Use tempName if it exists and is not empty, otherwise fall back to agentName
    const nameToUse = tempName?.trim() || agentName?.trim() || "";
    // Check if name is valid (not empty and not one of the default placeholder values)
    const hasValidName = nameToUse !== "" && 
                        nameToUse !== "New Assistant" && 
                        nameToUse !== "Enter a name for your assistant." &&
                        nameToUse !== "Loading...";
    const hasValidVoice = selectedVoiceId && selectedVoiceId.trim() !== "";
    return hasValidName && hasValidVoice;
  }, [tempName, agentName, selectedVoiceId]);

  // Get missing fields for save button
  const getMissingSaveFields = useMemo(() => {
    if (isNew) {
      const missing: string[] = [];
      const nameToUse = tempName?.trim() || agentName?.trim() || "";
      const hasValidName = nameToUse !== "" && 
                          nameToUse !== "New Assistant" && 
                          nameToUse !== "Enter a name for your assistant." &&
                          nameToUse !== "Loading...";
      
      if (!hasValidName) {
        missing.push("Name");
      }
      if (!selectedVoiceId || selectedVoiceId.trim() === "") {
        missing.push("Voice");
      }
      return missing;
    }
    // For existing agents, if there are no unsaved changes, return empty array
    // (we don't need to show a tooltip for "no changes")
    return [];
  }, [isNew, tempName, agentName, selectedVoiceId]);

  // Check if all required fields are filled for deployment
  const isDeployValid = useMemo(() => {
    const hasLanguage = selectedLanguage && selectedLanguage.trim() !== "";
    const hasModel = selectedModel && selectedModel.trim() !== "";
    const hasFirstMessage = firstMessage && firstMessage.trim() !== "";
    const hasSystemPrompt = systemPrompt && systemPrompt.trim() !== "" && systemPrompt.trim() !== "# Customer Service & Support Agent Prompt\n";
    const hasVoice = selectedVoiceId && selectedVoiceId.trim() !== "";
    return hasLanguage && hasModel && hasFirstMessage && hasSystemPrompt && hasVoice;
  }, [selectedLanguage, selectedModel, firstMessage, systemPrompt, selectedVoiceId]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    if (isNew) {
      // For new agents, check if form is valid (all required fields filled)
      return isFormValid;
    }
    
    if (!savedConfig) {
      // No saved config yet, assume no changes
      return false;
    }
    
    // Compare name
    const nameToUse = (tempName && tempName.trim()) || agent?.name || "";
    if (nameToUse !== savedConfig.name) {
      return true;
    }
    
    // Compare configuration
    const currentConfig = buildConfiguration();
    const savedConfigStr = JSON.stringify(savedConfig.config);
    const currentConfigStr = JSON.stringify(currentConfig);
    
    return savedConfigStr !== currentConfigStr;
  }, [isNew, tempName, agent?.name, savedConfig, buildConfiguration, isFormValid]);

  const configJson = agent ? {
    "id": agent.id,
    "name": agent.name || "Unnamed Agent",
    ...buildConfiguration(),
    ...(agent.tags && {
      "tags": agent.tags
    }),
    ...(agent.created_at && {
      "created_at": agent.created_at
    }),
    ...(agent.updated_at && {
      "updated_at": agent.updated_at
    }),
    ...(attachedFiles.length > 0 && {
      "files": attachedFiles.map(file => ({
        "name": file.name,
        "size": file.size,
        "type": file.type
      }))
    })
  } : {
    "id": isNew ? "new" : agentId,
    "name": agentName,
    ...buildConfiguration()
  };

  // Handle save/update
  const handleSave = useCallback(async () => {
    const nameToUse = (tempName && tempName.trim()) || agentName;
    
    if (!nameToUse || nameToUse === "New Assistant" || nameToUse === "Enter a name for your assistant." || nameToUse.trim() === "") {
      toast({
        title: 'Name required',
        description: 'Please provide a name for the assistant.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedVoiceId) {
      toast({
        title: 'Voice required',
        description: 'Please select a voice for the assistant.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const config = buildConfiguration();
      
      if (isNew) {
        // Create new agent
        const response = await agentsApi.create({
          name: nameToUse.trim(),
          ...config
        });
        
        if (response.data) {
          // Upload and sync attached files if any
          if (attachedFiles.length > 0 && response.data.id) {
            const agentId = response.data.id.toString();
            
            for (const file of attachedFiles) {
              const fileKey = `${file.name}-${Date.now()}`;
              setUploadingFiles(prev => new Set(prev).add(fileKey));
              
              try {
                // Get presigned URL
                const presignedResponse = await awsS3Api.getPresignedUrl(
                  file.name,
                  file.type || 'application/octet-stream',
                  fileKey
                );

                if (!presignedResponse.data) {
                  throw new Error('Failed to get presigned URL');
                }

                // Upload to S3
                const uploadResponse = await fetch(presignedResponse.data.url, {
                  method: 'PUT',
                  body: file,
                  headers: {
                    'Content-Type': file.type || 'application/octet-stream',
                  },
                });

                if (!uploadResponse.ok) {
                  throw new Error('Failed to upload file to S3');
                }

                // Create file and sync to ElevenLabs
                await agentFilesApi.createAndSync(agentId, {
                  s3_key: presignedResponse.data.key,
                  s3_url: presignedResponse.data.public_url,
                  file_name: file.name,
                  file_size: file.size,
                  content_type: file.type || 'application/octet-stream',
                });
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
                toast({
                  title: 'Warning',
                  description: `Failed to upload "${file.name}": ${errorMessage}`,
                  variant: 'destructive',
                });
              } finally {
                setUploadingFiles(prev => {
                  const next = new Set(prev);
                  next.delete(fileKey);
                  return next;
                });
              }
            }
            
            // Clear attached files after upload
            setAttachedFiles([]);
          }
          
          toast({
            title: 'Success',
            description: 'Assistant created successfully.',
          });
          // Navigate to the new agent's detail page
          navigate(`/assistants/${response.data.id}`);
        }
      } else if (agent?.id) {
        // Update existing agent
        const response = await agentsApi.update(agent.id, {
          name: nameToUse.trim(),
          ...config
        });
        
        if (response.data) {
          setAgent(response.data);
          extractAgentData(response.data);
          setTempName(""); // Clear temp name after successful save
          // Update saved config after successful save (use the config that was actually saved)
          setSavedConfig({
            name: nameToUse.trim(),
            config: JSON.parse(JSON.stringify(config)) // Deep clone of the config that was saved
          });
          toast({
            title: 'Success',
            description: 'Assistant updated successfully.',
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save assistant';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }, [isNew, agent, agentName, tempName, selectedVoiceId, buildConfiguration, navigate, toast, extractAgentData, attachedFiles]);

  // Handle publish/unpublish
  const handlePublish = useCallback(async () => {
    const nameToUse = (tempName && tempName.trim()) || agentName;
    
    if (!nameToUse || nameToUse === "New Assistant" || nameToUse === "Enter a name for your assistant." || nameToUse.trim() === "") {
      toast({
        title: 'Name required',
        description: 'Please provide a name for the assistant.',
        variant: 'destructive',
      });
      return;
    }

    // Validate all required fields for deployment
    const missingFields: string[] = [];
    if (!selectedLanguage || selectedLanguage.trim() === "") {
      missingFields.push("Language");
    }
    if (!selectedModel || selectedModel.trim() === "") {
      missingFields.push("Model");
    }
    if (!firstMessage || firstMessage.trim() === "") {
      missingFields.push("First Message");
    }
    if (!systemPrompt || systemPrompt.trim() === "" || systemPrompt.trim() === "# Customer Service & Support Agent Prompt\n") {
      missingFields.push("System Prompt");
    }
    if (!selectedVoiceId || selectedVoiceId.trim() === "") {
      missingFields.push("Voice");
    }

    if (missingFields.length > 0) {
      toast({
        title: 'Missing required fields',
        description: `Please fill in the following fields before deploying: ${missingFields.join(", ")}.`,
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const config = buildConfiguration();
      let agentToPublish = agent;

      // If it's a new agent or not saved yet, save it first
      if (isNew || !agent?.id) {
        const saveResponse = await agentsApi.create({
          name: nameToUse.trim(),
          ...config
        });
        
        if (!saveResponse.data) {
          throw new Error('Failed to save agent before publishing');
        }
        
        agentToPublish = saveResponse.data;
        setAgent(agentToPublish);
        
        // Navigate to the agent's detail page if it was new
        if (isNew) {
          navigate(`/assistants/${agentToPublish.id}`);
        }
      } else {
        // Update existing agent in database first
        const updateResponse = await agentsApi.update(agent.id, {
          name: nameToUse.trim(),
          ...config
        });
        
        if (updateResponse.data) {
          agentToPublish = updateResponse.data;
          setAgent(agentToPublish);
        } else {
          throw new Error('Failed to update agent before deploying');
        }
      }

      // Small delay to ensure database update is committed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Deploy to ElevenLabs (creates a new version)
      const response = await agentsApi.publish(agentToPublish.id);
      if (response.data) {
        setAgent(response.data);
        const version = response.data.version || 1;
        toast({
          title: 'Success',
          description: `Assistant deployed successfully to ElevenLabs (Version ${version}).`,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish assistant';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }, [isNew, agent, agentName, tempName, selectedVoiceId, selectedLanguage, selectedModel, firstMessage, systemPrompt, buildConfiguration, navigate, toast]);

  // Show wizard for new agents, regular interface for existing agents
  if (isNew) {
    return (
      <div className="flex h-full overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="border-b border-border p-3 md:p-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/assistants")}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl md:text-2xl font-bold">Create New Assistant</h1>
            </div>
          </div>
          <CreateAgentWizard
            onComplete={(agentId) => {
              navigate(`/assistants/${agentId}`);
            }}
            voices={voices}
            loadingVoices={loadingVoices}
            initialData={location.state || undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Assistant Header */}
        <div className="border-b border-border p-3 md:p-4 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3 md:mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/assistants")}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <h1 className="text-xl md:text-2xl font-bold">Loading...</h1>
                </div>
              ) : editingName ? (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={async () => {
                      if (tempName.trim() && tempName.trim() !== agentName) {
                        // Name changed, save it if we have an agent
                        if (agent?.id && !isNew) {
                          try {
                            const response = await agentsApi.update(agent.id, {
                              name: tempName.trim()
                            });
                            if (response.data) {
                              setAgent(response.data);
                            }
                          } catch (err) {
                            // If save fails, revert to original name
                            setTempName(agentName);
                            toast({
                              title: 'Error',
                              description: err instanceof Error ? err.message : 'Failed to update name',
                              variant: 'destructive',
                            });
                          }
                        }
                        setEditingName(false);
                      } else if (!tempName.trim()) {
                        setTempName(agentName);
                        setEditingName(false);
                      } else {
                        setEditingName(false);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                      } else if (e.key === 'Escape') {
                        setTempName(agentName);
                        setEditingName(false);
                      }
                    }}
                    className="text-xl md:text-2xl font-bold h-auto py-1 px-2"
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  onClick={() => {
                    // When clicking to edit, use tempName if it's a valid name, otherwise use agentName
                    // But if tempName is a placeholder, start with empty string so user can type fresh
                    const currentName = tempName?.trim() || "";
                    const nameToEdit = (currentName && 
                                       currentName !== "New Assistant" && 
                                       currentName !== "Enter a name for your assistant." &&
                                       currentName !== "Loading...") 
                                      ? currentName 
                                      : "";
                    setTempName(nameToEdit);
                    setEditingName(true);
                  }}
                  className="text-left w-full"
                >
                  <h1 className="text-xl md:text-2xl font-bold truncate hover:opacity-80 transition-opacity">
                    {(tempName?.trim() && 
                      tempName !== "New Assistant" && 
                      tempName !== "Enter a name for your assistant." &&
                      tempName !== "Loading...") 
                      ? tempName 
                      : agentName}
                  </h1>
                </button>
              )}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* <Button 
                variant={showConfigPanel ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowConfigPanel(!showConfigPanel)}
                className="text-xs md:text-sm"
              >
                <Code className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden sm:inline">Code</span>
              </Button> */}
              <Button 
                variant={showPreviewChat ? "secondary" : "accent"} 
                size="sm"
                onClick={() => {
                  setShowPreviewChat(!showPreviewChat);
                  if (!showPreviewChat) {
                    // Preview chat will be opened, but call won't start automatically
                    // User needs to click "Start Call" button
                  } else {
                    setCallInProgress(false);
                    setCallTimer(0);
                  }
                }}
                className="text-xs md:text-sm"
              >
                <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden sm:inline">Preview</span>
                <span className="sm:hidden">Call</span>
              </Button>
              {agent?.published ? (
                <Button 
                  variant="subtle" 
                  size="sm" 
                  className="text-xs md:text-sm text-success"
                  disabled
                >
                  <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                  <span className="hidden sm:inline">
                    Deployed {agent.version ? `v${agent.version}` : ''}
                  </span>
                  <span className="sm:hidden">
                    {agent.version ? `v${agent.version}` : 'Deployed'}
                  </span>
              </Button>
              ) : (
                <Button 
                  variant="subtle" 
                  size="sm" 
                  className="text-xs md:text-sm text-muted-foreground"
                  disabled
                >
                  <span className="hidden sm:inline">Not Deployed</span>
                  <span className="sm:hidden">Not Deployed</span>
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!saving && !loading && (isNew ? !isFormValid : !hasUnsavedChanges()) && getMissingSaveFields.length > 0 ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-block">
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={handleSave}
                        disabled={true}
                        className="text-xs md:text-sm"
                      >
                        <span className="hidden sm:inline">{isNew ? 'Create' : 'Save'}</span>
                        <span className="sm:hidden">{isNew ? 'Create' : 'Save'}</span>
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Please fill in the following fields: {getMissingSaveFields.join(", ")}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleSave}
                  disabled={saving || loading || (isNew ? !isFormValid : !hasUnsavedChanges())}
                  className="text-xs md:text-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2 animate-spin" />
                      <span className="hidden sm:inline">Saving...</span>
                      <span className="sm:hidden">Save</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">{isNew ? 'Create' : 'Save'}</span>
                      <span className="sm:hidden">{isNew ? 'Create' : 'Save'}</span>
                    </>
                  )}
                </Button>
              )}
              {!isNew && agent?.id && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handlePublish}
                  disabled={saving || loading || !isDeployValid}
                  className="text-xs md:text-sm"
                  title={!isDeployValid ? "Please fill in all required fields (Language, Model, First Message, System Prompt, Voice) to deploy" : "Deploy agent to ElevenLabs (creates a new version)"}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2 animate-spin" />
                      <span className="hidden sm:inline">Deploying...</span>
                      <span className="sm:hidden">Deploy</span>
                    </>
                  ) : (
                    <>
                      <Globe className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                      <span className="hidden sm:inline">Deploy</span>
                      <span className="sm:hidden">Deploy</span>
                    </>
                  )}
                </Button>
              )}
              {isNew && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handlePublish}
                  disabled={saving || loading || !isDeployValid}
                  className="text-xs md:text-sm"
                  title={!isDeployValid ? "Please fill in all required fields (Language, Model, First Message, System Prompt, Voice) to deploy" : "Save and deploy agent to ElevenLabs"}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2 animate-spin" />
                      <span className="hidden sm:inline">Deploying...</span>
                      <span className="sm:hidden">Deploy</span>
                    </>
                  ) : (
                    <>
                      <Globe className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                      <span className="hidden sm:inline">Save & Deploy</span>
                      <span className="sm:hidden">Deploy</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-3 md:mt-4 overflow-x-auto scrollbar-hide -mx-3 md:mx-0 px-3 md:px-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const handleTabClick = () => {
                setActiveTab(tab.id);
              };
              return (
                <button
                  key={tab.id}
                  onClick={handleTabClick}
                  className={cn(
                    "flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-colors flex-shrink-0",
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content with optional config panel */}
        <div className="flex-1 flex overflow-hidden min-w-0 relative">
          {/* Tab Content - I'll include the key sections, but you can add the rest from the original file */}
          {activeTab === "widget" ? (
            <WidgetTab agent={agent} agentId={agentId} />
          ) : activeTab === "conversations" ? (
            <ConversationsTab assistantName={agentName} agentId={agent?.id} />
          ) : activeTab === "configuration" ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Cost & Latency Indicators */}
              <CostAndLatency
                cost={{
                  value: "~$0.14",
                  unit: "/min",
                  segments: [
                    {
                      className: "h-2 flex-1 rounded-full bg-success",
                      tooltip: { label: "Hosting", value: "Cost (USD): 0.05" }
                    },
                    {
                      className: "h-2 w-8 rounded-full bg-warning",
                      tooltip: { label: "Transcribe", value: "Cost (USD): 0.02" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-destructive/60",
                      tooltip: { label: "Model", value: "Cost (USD): 0.04" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-muted",
                      tooltip: { label: "Voice", value: "Cost (USD): 0.03" }
                    }
                  ]
                }}
                latency={{
                  value: "~1050",
                  unit: "ms",
                  segments: [
                    {
                      className: "h-2 flex-1 rounded-full bg-success",
                      tooltip: { label: "Transcriber", value: "Latency (ms): 150" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-primary",
                      tooltip: { label: "Model", value: "Latency (ms): 400" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-warning",
                      tooltip: { label: "Voice", value: "Latency (ms): 300" }
                    },
                    {
                      className: "h-2 w-12 rounded-full bg-destructive/60",
                      tooltip: { label: "Transport", value: "Latency (ms): 200" }
                    }
                  ]
                }}
              />

              <div className="space-y-6">
                {/* Model Section */}
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                    <Code className="h-4 w-4" />
                    <span>MODEL</span>
                  </div>
                  
                  <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                    <button 
                      className="w-full flex items-start justify-between gap-2"
                      onClick={() => setModelExpanded(!modelExpanded)}
                    >
                      <div className="text-left flex-1">
                        <h3 className="text-base md:text-lg font-semibold">Model</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">Configure the behavior of the assistant.</p>
                      </div>
                      <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1", modelExpanded && "rotate-180")} />
                    </button>
                    
                    {modelExpanded && (
                      <div className="mt-4 md:mt-6 space-y-4">
                        {/* Provider and Model in same row */}
                        <div className="flex flex-col md:flex-row gap-4">
                        {/* Provider */}
                          <div className="flex-1">
                          <label className="text-sm text-muted-foreground mb-2 block">Provider</label>
                          <Select 
                            value={selectedProvider || 'openai'} 
                            onValueChange={(value) => {
                                setSelectedProvider(value);
                                const models = modelsByProvider[value];
                                if (models && models.length > 0) {
                                  setSelectedModel(models[0].value);
                              }
                            }}
                          >
                            <SelectTrigger className="bg-white border-border">
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
                        {/* Model */}
                          <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <label className="text-sm text-muted-foreground">Model</label>
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <Select 
                            value={selectedModel} 
                            onValueChange={setSelectedModel}
                          >
                            <SelectTrigger className="bg-white border-border">
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
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Voice Section */}
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                    <AudioLines className="h-4 w-4" />
                    <span>VOICE</span>
                  </div>
                  
                  {/* Voice Configuration */}
                  <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                    <button 
                      className="w-full flex items-start justify-between gap-2"
                      onClick={() => setVoiceConfigExpanded(!voiceConfigExpanded)}
                    >
                      <div className="text-left flex-1">
                        <h3 className="text-base md:text-lg font-semibold">Voice Configuration</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">Select a voice from the list, or sync your voice library if it's missing. If errors persist, enable custom voice and add a voice ID.</p>
                      </div>
                      <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1", voiceConfigExpanded && "rotate-180")} />
                    </button>
                    
                    {voiceConfigExpanded && (
                      <div className="mt-4 md:mt-6 space-y-4">
                        <div>
                          <label className="text-sm text-muted-foreground mb-2 block">Voice</label>
                          {loadingVoices ? (
                            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-md border border-border">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Loading voices...</span>
                            </div>
                          ) : (
                            <Select 
                              value={selectedVoiceId || ""} 
                              onValueChange={(value) => {
                                setSelectedVoiceId(value);
                                const selectedVoice = voices.find(v => v.id === value);
                                if (selectedVoice) {
                                  setSelectedVoiceName(selectedVoice.name || "");
                                } else {
                                  // If voice not found in list, clear the name and try to fetch it
                                  setSelectedVoiceName("");
                                  // Try to fetch the voice name from API
                                  voicesApi.get(value).then((response) => {
                                    if (response.data?.name) {
                                      setSelectedVoiceName(response.data.name);
                                    }
                                  }).catch(() => {
                                    // Silently fail
                                  });
                                }
                              }}
                            >
                              <SelectTrigger className="bg-white border-border">
                                <SelectValue placeholder="Select a voice" />
                              </SelectTrigger>
                              <SelectContent>
                                {(() => {
                                  // Create a set of voice IDs to avoid duplicates
                                  const voiceIds = new Set(voices.map(v => v.id));
                                  
                                  // If we have a selected voice that's not in the list, add it
                                  const voicesToShow = [...voices];
                                  if (selectedVoiceId && !voiceIds.has(selectedVoiceId)) {
                                    voicesToShow.push({
                                      id: selectedVoiceId,
                                      name: selectedVoiceName || selectedVoiceId
                                    } as Voice);
                                  }
                                  
                                  if (voicesToShow.length > 0) {
                                    return voicesToShow.map((voice) => (
                                    <SelectItem key={voice.id} value={voice.id}>
                                      {voice.name || voice.id}
                                    </SelectItem>
                                    ));
                                  } else {
                                    return <SelectItem value="" disabled>No voices available</SelectItem>;
                                  }
                                })()}
                              </SelectContent>
                            </Select>
                          )}
                          {selectedVoiceId && selectedVoiceName && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Selected: {selectedVoiceName} ({selectedVoiceId})
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transcriber Section */}
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                    <Mic className="h-4 w-4" />
                    <span>TRANSCRIBER</span>
                  </div>
                
                <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                  <button 
                    className="w-full flex items-start justify-between gap-2"
                    onClick={() => setTranscriberExpanded(!transcriberExpanded)}
                  >
                    <div className="text-left flex-1">
                      <h3 className="text-base md:text-lg font-semibold">Transcriber</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">This section allows you to configure the transcription settings for the assistant.</p>
                    </div>
                    <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1", transcriberExpanded && "rotate-180")} />
                  </button>
                  
                  {transcriberExpanded && (
                    <div className="mt-4 md:mt-6 space-y-4 md:space-y-6">
                      {/* Language */}
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Language</label>
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                          <SelectTrigger className="bg-white border-border">
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
                        <p className="text-xs text-muted-foreground mt-2">
                          <span className="font-medium">Pro tip:</span> If you want to support both English and Spanish, you can set the language to <strong>multi</strong> and use <strong>ElevenLabs Turbo 2.5</strong> in the <strong>Voice</strong> tab.
                        </p>
                      </div>

                    </div>
                  )}
                </div>
                </div>
              </div>
            </div>
          ) : activeTab === "prompt-logic" ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <FileText className="h-4 w-4" />
                  <span>PROMPT LOGIC</span>
                </div>
                
                {/* First Message Mode */}
                <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base md:text-lg font-semibold">First Message Mode</h3>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <Select value={firstMessageMode} onValueChange={setFirstMessageMode}>
                    <SelectTrigger className="bg-white border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assistant-speaks-first">Assistant speaks first</SelectItem>
                      <SelectItem value="assistant-waits-for-user">Assistant waits for user</SelectItem>
                      <SelectItem value="assistant-speaks-first-model-generated">Assistant speaks first with model generated message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* First Message */}
                <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-semibold mb-4">First Message</h3>
                  <Textarea
                    value={firstMessage}
                    onChange={(e) => setFirstMessage(e.target.value)}
                    placeholder={agentName ? `Hi there, this is ${agentName}...` : "Enter the first message for the assistant..."}
                    className="bg-white border-border min-h-[80px] font-mono text-sm"
                  />
                </div>

                {/* System Prompt */}
                <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-semibold mb-4">System Prompt</h3>
                  <Textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Enter the system prompt for the assistant..."
                    className="bg-white border-border min-h-[350px] font-mono text-sm"
                  />
                </div>

                {/* Files */}
                <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-semibold mb-4">Files</h3>
                  <div className="space-y-3">
                    {/* Show attached files for new agents (before save) */}
                    {isNew && attachedFiles.length > 0 && (
                      <div className="space-y-2">
                        {attachedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md border border-border"
                          >
                            <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm flex-1 truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
                            </span>
                            <span className="text-xs text-muted-foreground italic">Pending</span>
                            <button
                              onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Show saved agent files for existing agents */}
                    {!isNew && agentFiles.length > 0 && (
                      <div className="space-y-2">
                        {agentFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md border border-border"
                          >
                            <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm flex-1 truncate">{file.file_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : ''}
                            </span>
                            {file.elevenlabs_document_id && (
                              <span className="text-xs text-success">Synced</span>
                            )}
                            <button
                              onClick={() => handleFileDelete(file.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              disabled={uploadingFiles.has(file.file_name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {uploadingFiles.size > 0 && (
                      <div className="space-y-2">
                        {Array.from(uploadingFiles).map((fileKey) => (
                          <div
                            key={fileKey}
                            className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md border border-border opacity-50"
                          >
                            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin flex-shrink-0" />
                            <span className="text-sm flex-1 truncate">{fileKey.split('-').slice(0, -1).join('-')}</span>
                            <span className="text-xs text-muted-foreground">Uploading...</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div
                      className="border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer hover:border-muted-foreground/50 border-border"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center text-center">
                        <Upload className="h-5 w-5 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop files
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supported formats: PDF, TXT, DOCX, MD
                        </p>
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      multiple
                      accept=".pdf,.txt,.docx,.md"
                      onChange={(e) => {
                        if (e.target.files) {
                          const newFiles = Array.from(e.target.files);
                          handleFileUpload(newFiles);
                          // Reset input
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                {/* System Tools */}
                <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                  <div className="mb-4">
                    <h3 className="text-base md:text-lg font-semibold mb-1">System tools</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Allow the agent perform built-in actions.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {Object.values(systemTools).filter(Boolean).length} active tool{Object.values(systemTools).filter(Boolean).length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {/* End conversation */}
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">End conversation</span>
                      </div>
                      <Switch
                        checked={systemTools["end-conversation"]}
                        onCheckedChange={(checked) => setSystemTools(prev => ({ ...prev, "end-conversation": checked }))}
                      />
                    </div>

                    {/* Detect language */}
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Detect language</span>
                      </div>
                      <Switch
                        checked={systemTools["detect-language"]}
                        onCheckedChange={(checked) => setSystemTools(prev => ({ ...prev, "detect-language": checked }))}
                      />
                    </div>

                    {/* Transfer to number */}
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Transfer to number</span>
                      </div>
                      <Switch
                        checked={systemTools["transfer-to-number"]}
                        onCheckedChange={(checked) => setSystemTools(prev => ({ ...prev, "transfer-to-number": checked }))}
                      />
                    </div>

                    {/* Voicemail detection */}
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Voicemail detection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {systemTools["voicemail-detection"] && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              // TODO: Open settings modal for voicemail detection
                              toast({
                                title: "Settings",
                                description: "Voicemail detection settings coming soon",
                              });
                            }}
                          >
                            <Settings className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Switch
                          checked={systemTools["voicemail-detection"]}
                          onCheckedChange={(checked) => setSystemTools(prev => ({ ...prev, "voicemail-detection": checked }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "advanced" ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Cost & Latency Indicators */}
              <CostAndLatency
                cost={{
                  value: "~$0.14",
                  unit: "/min",
                  segments: [
                    {
                      className: "h-2 flex-1 rounded-full bg-success",
                      tooltip: { label: "Hosting", value: "Cost (USD): 0.05" }
                    },
                    {
                      className: "h-2 w-8 rounded-full bg-warning",
                      tooltip: { label: "Transcribe", value: "Cost (USD): 0.02" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-destructive/60",
                      tooltip: { label: "Model", value: "Cost (USD): 0.04" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-muted",
                      tooltip: { label: "Voice", value: "Cost (USD): 0.03" }
                    }
                  ]
                }}
                latency={{
                  value: "~1050",
                  unit: "ms",
                  segments: [
                    {
                      className: "h-2 flex-1 rounded-full bg-success",
                      tooltip: { label: "Transcriber", value: "Latency (ms): 150" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-primary",
                      tooltip: { label: "Model", value: "Latency (ms): 400" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-warning",
                      tooltip: { label: "Voice", value: "Latency (ms): 300" }
                    },
                    {
                      className: "h-2 w-12 rounded-full bg-destructive/60",
                      tooltip: { label: "Transport", value: "Latency (ms): 200" }
                    }
                  ]
                }}
              />

              {/* Privacy Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Settings className="h-4 w-4" />
                  <span>PRIVACY</span>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                  <button 
                    className="w-full flex items-start justify-between gap-2"
                    onClick={() => setPrivacyExpanded(!privacyExpanded)}
                  >
                    <div className="text-left flex-1">
                      <h3 className="text-base md:text-lg font-semibold">Privacy</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">This section allows you to configure the privacy settings for the assistant.</p>
                    </div>
                    <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1", privacyExpanded && "rotate-180")} />
                  </button>
                  
                  {privacyExpanded && (
                    <div className="mt-4 md:mt-6">
                      {/* HIPAA Compliance */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Shield className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold">HIPAA Compliance</h4>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              When this is enabled, no logs, recordings, or transcriptions will be stored unless custom storage and credentials are configured.
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={hipaaCompliance}
                          onCheckedChange={setHipaaCompliance}
                        />
                      </div>

                      {/* Audio Recording */}
                      <div className="flex items-start justify-between pt-6 border-t border-border mt-6">
                        <div className="flex items-start gap-3 flex-1">
                          <Mic className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold mb-1">Audio Recording</h4>
                            <p className="text-xs text-muted-foreground">
                              Record the conversation. Disable on this assistant to keep its portion of squad conversations private.
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={audioRecording}
                          onCheckedChange={setAudioRecording}
                        />
                      </div>

                      {/* Logging */}
                      <div className="flex items-start justify-between pt-6 border-t border-border mt-6">
                        <div className="flex items-start gap-3 flex-1">
                          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold mb-1">Logging</h4>
                            <p className="text-xs text-muted-foreground">
                              Enable or disable logging during a call. Disable on this assistant to keep its portion of squad conversations private.
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={logging}
                          onCheckedChange={setLogging}
                        />
                      </div>

                      {/* Transcript */}
                      <div className="flex items-start justify-between pt-6 border-t border-border mt-6">
                        <div className="flex items-start gap-3 flex-1">
                          <Quote className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold mb-1">Transcript</h4>
                            <p className="text-xs text-muted-foreground">
                              Enable or disable transcription during a call. Disable on this assistant to keep its portion of squad conversations private.
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={transcript}
                          onCheckedChange={setTranscript}
                        />
                      </div>

                      {/* Audio Recording Format */}
                      <div className="pt-6 border-t border-border mt-6">
                        <div className="flex items-start gap-3 mb-4">
                          <Music className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold">Audio Recording Format</h4>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Choose the format for call recordings.
                            </p>
                          </div>
                        </div>
                        <Select defaultValue="wav">
                          <SelectTrigger className="bg-secondary/50 border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wav">WAV</SelectItem>
                            <SelectItem value="mp3">MP3</SelectItem>
                            <SelectItem value="ogg">OGG</SelectItem>
                            <SelectItem value="m4a">M4A</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Video Recording */}
                      <div className="flex items-start justify-between pt-6 border-t border-border mt-6">
                        <div className="flex items-start gap-3 flex-1">
                          <Video className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold">Video Recording</h4>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Enable or disable video recording during a web call. This will record the video of your user.
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={videoRecording}
                          onCheckedChange={setVideoRecording}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Cost & Latency Indicators */}
              <CostAndLatency
                cost={{
                  value: "~$0.14",
                  unit: "/min",
                  segments: [
                    {
                      className: "h-2 flex-1 rounded-full bg-success",
                      tooltip: { label: "Hosting", value: "Cost (USD): 0.05" }
                    },
                    {
                      className: "h-2 w-8 rounded-full bg-warning",
                      tooltip: { label: "Transcribe", value: "Cost (USD): 0.02" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-destructive/60",
                      tooltip: { label: "Model", value: "Cost (USD): 0.04" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-muted",
                      tooltip: { label: "Voice", value: "Cost (USD): 0.03" }
                    }
                  ]
                }}
                latency={{
                  value: "~1050",
                  unit: "ms",
                  segments: [
                    {
                      className: "h-2 flex-1 rounded-full bg-success",
                      tooltip: { label: "Transcriber", value: "Latency (ms): 150" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-primary",
                      tooltip: { label: "Model", value: "Latency (ms): 400" }
                    },
                    {
                      className: "h-2 flex-1 rounded-full bg-warning",
                      tooltip: { label: "Voice", value: "Latency (ms): 300" }
                    },
                    {
                      className: "h-2 w-12 rounded-full bg-destructive/60",
                      tooltip: { label: "Transport", value: "Latency (ms): 200" }
                    }
                  ]
                }}
              />

              {/* Model Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Code className="h-4 w-4" />
                  <span>MODEL</span>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                  <button 
                    className="w-full flex items-start justify-between gap-2"
                    onClick={() => setModelExpanded(!modelExpanded)}
                  >
                    <div className="text-left flex-1">
                      <h3 className="text-base md:text-lg font-semibold">Model</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">Configure the behavior of the assistant.</p>
                    </div>
                    <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1", modelExpanded && "rotate-180")} />
                  </button>
                  
                  {modelExpanded && (
                    <div className="mt-4 md:mt-6 space-y-4">
                      {/* Provider and Model in same row */}
                      <div className="flex flex-col md:flex-row gap-4">
                      {/* Provider */}
                        <div className="flex-1">
                        <label className="text-sm text-muted-foreground mb-2 block">Provider</label>
                        <Select 
                          value={selectedProvider || 'openai'} 
                          onValueChange={(value) => {
                              setSelectedProvider(value);
                              const models = modelsByProvider[value];
                              if (models && models.length > 0) {
                                setSelectedModel(models[0].value);
                            }
                          }}
                        >
                          <SelectTrigger className="bg-white border-border">
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
                      {/* Model */}
                        <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <label className="text-sm text-muted-foreground">Model</label>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <Select 
                          value={selectedModel} 
                          onValueChange={setSelectedModel}
                        >
                          <SelectTrigger className="bg-white border-border">
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
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Config JSON Panel */}
          {showConfigPanel && (
            <>
              {isMobile ? (
                <>
                  <div 
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={() => setShowConfigPanel(false)}
                  />
                  <div className="fixed inset-x-0 bottom-0 top-1/4 bg-card border-t border-border z-50 flex flex-col rounded-t-lg">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                      <h3 className="font-semibold text-sm md:text-base">Assistant Configuration</h3>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(configJson, null, 2));
                          }}
                          className="text-xs"
                        >
                          <Copy className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                          <span className="hidden sm:inline">Copy</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setShowConfigPanel(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 flex-1 overflow-auto">
                      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-2">
                        <Code className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        <span>JSON Format</span>
                        <span className="ml-auto">30 lines</span>
                      </div>
                      <pre className="bg-sidebar rounded-lg p-3 md:p-4 text-xs md:text-sm font-mono overflow-x-auto">
                        <code className="text-foreground">
                          {JSON.stringify(configJson, null, 2).split('\n').map((line, i) => (
                            <div key={i} className="flex">
                              <span className="text-muted-foreground w-6 md:w-8 flex-shrink-0 select-none">{i + 1}</span>
                              <span dangerouslySetInnerHTML={{ 
                                __html: line
                                  .replace(/"([^"]+)":/g, '<span class="text-purple-400">"$1"</span>:')
                                  .replace(/: "([^"]+)"/g, ': <span class="text-primary">"$1"</span>')
                              }} />
                            </div>
                          ))}
                        </code>
                      </pre>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-[450px] border-l border-border flex flex-col bg-card">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-semibold">Assistant Configuration</h3>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(configJson, null, 2));
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setShowConfigPanel(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 flex-1 overflow-auto">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Code className="h-4 w-4" />
                      <span>JSON Format</span>
                      <span className="ml-auto">30 lines</span>
                    </div>
                    <pre className="bg-sidebar rounded-lg p-4 text-sm font-mono overflow-x-auto">
                      <code className="text-foreground">
                        {JSON.stringify(configJson, null, 2).split('\n').map((line, i) => (
                          <div key={i} className="flex">
                            <span className="text-muted-foreground w-8 flex-shrink-0 select-none">{i + 1}</span>
                            <span dangerouslySetInnerHTML={{ 
                              __html: line
                                .replace(/"([^"]+)":/g, '<span class="text-purple-400">"$1"</span>:')
                                .replace(/: "([^"]+)"/g, ': <span class="text-primary">"$1"</span>')
                            }} />
                          </div>
                        ))}
                      </code>
                    </pre>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Preview Chat Panel */}
      {showPreviewChat && (
        <>
          {isMobile ? (
            <>
              <div 
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={() => {
                  setShowPreviewChat(false);
                  setCallInProgress(false);
                  setCallTimer(0);
                }}
              />
              <div className="fixed inset-x-0 bottom-0 top-1/4 bg-card border-t border-border z-50 flex flex-col rounded-t-lg overflow-hidden">
                <PreviewChatContent
                  selectedAssistant={{ id: agentId, name: agentName }}
                  showPreviewChat={showPreviewChat}
                  setShowPreviewChat={setShowPreviewChat}
                  callInProgress={callInProgress}
                  setCallInProgress={setCallInProgress}
                  callTimer={callTimer}
                  setCallTimer={setCallTimer}
                  isMuted={isMuted}
                  setIsMuted={setIsMuted}
                  chatMessages={chatMessages}
                  setChatMessages={setChatMessages}
                  chatInput={chatInput}
                  setChatInput={setChatInput}
                  messagesEndRef={messagesEndRef}
                />
              </div>
            </>
          ) : (
            <div className="w-[400px] lg:w-[400px] md:w-[350px] border-l border-border flex flex-col bg-card flex-shrink-0 h-full overflow-hidden">
              <PreviewChatContent
                selectedAssistant={{ id: agentId, name: agentName }}
                showPreviewChat={showPreviewChat}
                setShowPreviewChat={setShowPreviewChat}
                callInProgress={callInProgress}
                setCallInProgress={setCallInProgress}
                callTimer={callTimer}
                setCallTimer={setCallTimer}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                chatMessages={chatMessages}
                setChatMessages={setChatMessages}
                chatInput={chatInput}
                setChatInput={setChatInput}
                messagesEndRef={messagesEndRef}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// PreviewChatContent component - extracted from original
const PreviewChatContent = ({
  selectedAssistant,
  showPreviewChat,
  setShowPreviewChat,
  callInProgress,
  setCallInProgress,
  callTimer,
  setCallTimer,
  isMuted,
  setIsMuted,
  chatMessages,
  setChatMessages,
  chatInput,
  setChatInput,
  messagesEndRef,
}: {
  selectedAssistant: { id: string; name: string };
  showPreviewChat: boolean;
  setShowPreviewChat: (show: boolean) => void;
  callInProgress: boolean;
  setCallInProgress: (inProgress: boolean) => void;
  callTimer: number;
  setCallTimer: (timer: number) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  chatMessages: Array<{ role: "assistant" | "user"; content: string; timestamp: Date }>;
  setChatMessages: React.Dispatch<React.SetStateAction<Array<{ role: "assistant" | "user"; content: string; timestamp: Date }>>>;
  chatInput: string;
  setChatInput: (input: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}) => {
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const currentAssistantMessageRef = useRef<string>("");
  const agentAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentBlobUrlRef = useRef<string | null>(null);

  // Play audio from queue - defined early so it can be used in useEffect
  const playNextAudio = useCallback(() => {
    if (audioQueueRef.current.length > 0 && !isPlayingRef.current && agentAudioRef.current) {
      isPlayingRef.current = true;
      const audioData = audioQueueRef.current.shift()!;
      
      // Clean up previous blob URL if it exists
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
      }
      
      // Create blob and URL
      const blob = new Blob([audioData], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      currentBlobUrlRef.current = url;
      
      if (agentAudioRef.current) {
        // Set source and play
        agentAudioRef.current.src = url;
        
        // Ensure audio is ready before playing
        const playPromise = agentAudioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio playing successfully');
            })
            .catch(err => {
              console.error('Error playing audio:', err);
              isPlayingRef.current = false;
              
              // Clean up blob URL on error
              if (currentBlobUrlRef.current) {
                URL.revokeObjectURL(currentBlobUrlRef.current);
                currentBlobUrlRef.current = null;
              }
              
              // Show user-friendly error
              toast({
                title: 'Audio playback error',
                description: 'Could not play agent audio. Please check your audio settings.',
                variant: 'destructive',
              });
              
              // Try to play next audio
              playNextAudio();
            });
        }
      }
    }
  }, [toast]);

  // Initialize audio element for agent responses - do this early
  useEffect(() => {
    if (!agentAudioRef.current) {
      agentAudioRef.current = new Audio();
      agentAudioRef.current.volume = 1.0; // Set volume to maximum
      agentAudioRef.current.preload = 'auto'; // Preload audio
      
      // Handle audio ended event
      const handleEnded = () => {
        console.log('Audio ended');
        isPlayingRef.current = false;
        // Clean up the blob URL
        if (currentBlobUrlRef.current) {
          URL.revokeObjectURL(currentBlobUrlRef.current);
          currentBlobUrlRef.current = null;
        }
        // Play next audio in queue
        playNextAudio();
      };

      // Handle audio errors
      const handleError = (e: Event) => {
        console.error('Audio playback error:', e, agentAudioRef.current?.error);
        isPlayingRef.current = false;
        // Clean up the blob URL
        if (currentBlobUrlRef.current) {
          URL.revokeObjectURL(currentBlobUrlRef.current);
          currentBlobUrlRef.current = null;
        }
        // Try to play next audio
        playNextAudio();
      };

      // Handle audio can play (ready to play)
      const handleCanPlay = () => {
        console.log('Audio can play');
      };

      // Handle audio load errors
      const handleLoadStart = () => {
        console.log('Audio load started');
      };

      agentAudioRef.current.addEventListener('ended', handleEnded);
      agentAudioRef.current.addEventListener('error', handleError);
      agentAudioRef.current.addEventListener('canplay', handleCanPlay);
      agentAudioRef.current.addEventListener('loadstart', handleLoadStart);
    }
    
    return () => {
      if (agentAudioRef.current) {
        agentAudioRef.current.pause();
        agentAudioRef.current = null;
      }
      // Clean up any remaining blob URL
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
      }
    };
  }, [playNextAudio]);

  // Stop audio recording
  const stopAudioRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  // Start audio recording
  const startAudioRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextClass({
        sampleRate: 16000,
      });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (!isMuted && wsRef.current?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          // Convert float32 to int16 PCM
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          // Send audio data to WebSocket as binary
          wsRef.current.send(pcmData.buffer);
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      // Also use MediaRecorder as fallback
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && !isMuted && wsRef.current?.readyState === WebSocket.OPEN) {
          // For WebM, we'd need to convert to PCM, but the ScriptProcessor approach above is better
        }
      };

      // Start recording in small chunks
      mediaRecorder.start(100);

    } catch (error) {
      console.error('Error starting audio recording:', error);
      toast({
        title: 'Microphone Error',
        description: 'Failed to access microphone. Please check permissions.',
        variant: 'destructive',
      });
    }
  }, [isMuted, toast]);

  // Start WebSocket connection
  const startWebSocket = useCallback(async () => {
    try {
      const response = await conversationsApi.getSignedUrl(selectedAssistant.id);
      if (!response.data?.signed_url) {
        throw new Error('Failed to get signed URL');
      }

      const ws = new WebSocket(response.data.signed_url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        console.log('Audio element ready:', agentAudioRef.current !== null);
        
        // Start audio recording
        startAudioRecording();
      };

      ws.onmessage = async (event) => {
        try {
          // Check if message is binary (audio) or text (JSON)
          if (event.data instanceof ArrayBuffer) {
            // Binary audio data from agent
            audioQueueRef.current.push(event.data);
            playNextAudio();
            return;
          }
          
          // Handle Blob type (also binary)
          if (event.data instanceof Blob) {
            const arrayBuffer = await event.data.arrayBuffer();
            audioQueueRef.current.push(arrayBuffer);
            playNextAudio();
            return;
          }

          // Try to parse as JSON
          let data;
          try {
            data = JSON.parse(event.data);
          } catch {
            // If not JSON, might be text transcript
            if (typeof event.data === 'string' && event.data.trim()) {
              // Assume it's an agent transcript
              currentAssistantMessageRef.current = event.data;
              setChatMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  return [...prev.slice(0, -1), {
                    ...lastMessage,
                    content: currentAssistantMessageRef.current,
                    timestamp: new Date(),
                  }];
                } else {
                  return [...prev, {
                    role: 'assistant',
                    content: currentAssistantMessageRef.current,
                    timestamp: new Date(),
                  }];
                }
              });
            }
            return;
          }
          
          // Handle different message types
          if (data.type === 'audio' || data.event === 'audio') {
            // Agent audio response (base64 encoded)
            if (data.audio) {
              try {
                const audioData = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0));
                audioQueueRef.current.push(audioData.buffer);
                playNextAudio();
              } catch (e) {
                console.error('Error decoding audio:', e);
              }
            }
          } else if (data.type === 'transcript' || data.event === 'transcript') {
            // Agent transcript
            if (data.transcript && data.role === 'assistant') {
              currentAssistantMessageRef.current = data.transcript;
              // Update or add assistant message
              setChatMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  // Update last message
                  return [...prev.slice(0, -1), {
                    ...lastMessage,
                    content: currentAssistantMessageRef.current,
                    timestamp: new Date(),
                  }];
                } else {
                  // Add new message
                  return [...prev, {
                    role: 'assistant',
                    content: currentAssistantMessageRef.current,
                    timestamp: new Date(),
                  }];
                }
              });
            } else if (data.transcript && data.role === 'user') {
              // User transcript
              setChatMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.role === 'user' && !lastMessage.content.trim()) {
                  // Update last message
                  return [...prev.slice(0, -1), {
                    ...lastMessage,
                    content: data.transcript,
                    timestamp: new Date(),
                  }];
                } else {
                  // Add new message
                  return [...prev, {
                    role: 'user',
                    content: data.transcript,
                    timestamp: new Date(),
                  }];
                }
              });
            }
          } else if (data.type === 'conversation_initiation_metadata' || data.event === 'conversation_initiation_metadata') {
            // Conversation started
            console.log('Conversation initiated', data);
          } else if (data.type === 'agent_response' || data.event === 'agent_response') {
            // Agent response metadata
            console.log('Agent response', data);
            // Check if there's a transcript in the response
            if (data.transcript || data.text) {
              currentAssistantMessageRef.current = data.transcript || data.text;
              setChatMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  return [...prev.slice(0, -1), {
                    ...lastMessage,
                    content: currentAssistantMessageRef.current,
                    timestamp: new Date(),
                  }];
                } else {
                  return [...prev, {
                    role: 'assistant',
                    content: currentAssistantMessageRef.current,
                    timestamp: new Date(),
                  }];
                }
              });
            }
          } else if (data.type === 'user_transcript' || data.event === 'user_transcript') {
            // User transcript
            setChatMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.role === 'user' && !lastMessage.content.trim()) {
                return [...prev.slice(0, -1), {
                  ...lastMessage,
                  content: data.transcript || data.text || '',
                  timestamp: new Date(),
                }];
              } else {
                return [...prev, {
                  role: 'user',
                  content: data.transcript || data.text || '',
                  timestamp: new Date(),
                }];
              }
            });
          } else if (data.type === 'agent_transcript' || data.event === 'agent_transcript') {
            // Agent transcript
            currentAssistantMessageRef.current = data.transcript || data.text || '';
            setChatMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                return [...prev.slice(0, -1), {
                  ...lastMessage,
                  content: currentAssistantMessageRef.current,
                  timestamp: new Date(),
                }];
              } else {
                return [...prev, {
                  role: 'assistant',
                  content: currentAssistantMessageRef.current,
                  timestamp: new Date(),
                }];
              }
            });
          } else {
            // Log unknown message types for debugging
            console.log('Unknown WebSocket message type:', data);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to audio agent.',
          variant: 'destructive',
        });
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        stopAudioRecording();
      };

    } catch (error) {
      console.error('Error starting WebSocket:', error);
      toast({
        title: 'Connection Error',
        description: error instanceof Error ? error.message : 'Failed to start conversation.',
        variant: 'destructive',
      });
      setCallInProgress(false);
    }
  }, [selectedAssistant.id, setChatMessages, setCallInProgress, toast, playNextAudio, startAudioRecording, stopAudioRecording]);

  // Handle call start/stop
  useEffect(() => {
    if (callInProgress) {
      startWebSocket();
    } else {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      stopAudioRecording();
      currentAssistantMessageRef.current = "";
      
      // Clean up audio
      if (agentAudioRef.current) {
        agentAudioRef.current.pause();
        agentAudioRef.current.currentTime = 0;
      }
      // Clear audio queue
      audioQueueRef.current = [];
      isPlayingRef.current = false;
      // Clean up blob URL
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
      }
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      stopAudioRecording();
      
      // Clean up audio
      if (agentAudioRef.current) {
        agentAudioRef.current.pause();
        agentAudioRef.current.currentTime = 0;
      }
      audioQueueRef.current = [];
      isPlayingRef.current = false;
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
      }
    };
  }, [callInProgress, startWebSocket, stopAudioRecording]);

  // Handle text input
  const handleSendMessage = useCallback(() => {
    if (!chatInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const message = chatInput.trim();
    setChatMessages(prev => [...prev, {
      role: 'user',
      content: message,
      timestamp: new Date(),
    }]);
    setChatInput("");

    // Send text message to agent via WebSocket
    // ElevenLabs accepts text input as a special message type
    try {
      wsRef.current.send(JSON.stringify({
        type: 'text',
        text: message,
      }));
    } catch (error) {
      console.error('Error sending text message:', error);
      toast({
        title: 'Send Error',
        description: 'Failed to send message.',
        variant: 'destructive',
      });
    }
  }, [chatInput, setChatMessages, setChatInput, toast]);

  return (
  <>
    {/* Chat Header */}
    <div className="p-3 md:p-4 border-b border-border flex-shrink-0">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="font-semibold text-sm md:text-base">Call Transcript</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setShowPreviewChat(false);
              setCallInProgress(false);
              setCallTimer(0);
              setIsMuted(false);
              if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
              }
              stopAudioRecording();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {callInProgress ? (
          <>
            <Button variant="accent" size="sm" onClick={() => {
              setCallInProgress(false);
              setCallTimer(0);
              if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
              }
              stopAudioRecording();
            }} className="text-xs md:text-sm">
              <Phone className="h-3.5 w-3.5 mr-1.5" />
              End Call
            </Button>
            <Button
              variant={isMuted ? "destructive" : "outline"}
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? "Unmute microphone" : "Mute microphone"}
              className="text-xs md:text-sm"
            >
              {isMuted ? (
                <>
                  <VolumeX className="h-3.5 w-3.5 mr-1.5" />
                  Unmute
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5 mr-1.5" />
                  Mute
                </>
              )}
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={() => {
            setChatMessages([]); // Clear messages when starting new call
            setCallInProgress(true);
          }} className="text-xs md:text-sm">
            <Phone className="h-3.5 w-3.5 mr-1.5" />
            Start Call
          </Button>
        )}
      </div>
    </div>

    {/* Chat Messages */}
    <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 min-h-0 overscroll-contain">
      {chatMessages.map((message, index) => (
        <div
          key={index}
          className={cn(
            "flex gap-2 md:gap-3",
            message.role === "assistant" ? "flex-row" : "flex-row-reverse"
          )}
        >
          <div
            className={cn(
              "w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0",
              message.role === "assistant"
                ? "bg-primary/20 text-primary"
                : "bg-secondary text-foreground"
            )}
          >
            <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </div>
          <div
            className={cn(
              "flex-1 rounded-lg p-2 md:p-3",
              message.role === "assistant"
                ? "bg-primary/10 text-foreground"
                : "bg-secondary text-foreground"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium">
                {message.role === "assistant" ? "Assistant" : "User"}
              </span>
              <span className="text-xs text-muted-foreground">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p className="text-xs md:text-sm">{message.content}</p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>

    {/* Chat Input */}
    <div className="p-3 md:p-4 border-t border-border flex-shrink-0">
      {isMuted && callInProgress && (
        <div className="mb-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="flex items-center gap-2 text-xs text-destructive">
            <Mic className="h-3.5 w-3.5" />
            <span>Your microphone is muted. The assistant cannot hear you.</span>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Input
          placeholder={isMuted ? "Microphone is muted..." : "Speak or type your message..."}
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && chatInput.trim() && !isMuted && callInProgress) {
              handleSendMessage();
            }
          }}
          className={cn(
            "flex-1 bg-secondary/50 text-sm",
            isMuted && "opacity-50"
          )}
          disabled={!callInProgress}
        />
        <Button
          size="icon"
          onClick={handleSendMessage}
          disabled={!callInProgress || !chatInput.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Call Status */}
      {callInProgress && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary animate-ping opacity-75" />
            </div>
            <span className="text-xs text-muted-foreground">Call in progress</span>
            {isMuted && (
              <span className="text-xs text-destructive font-medium">(Microphone muted)</span>
            )}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Mic className={cn("h-4 w-4", isMuted ? "text-destructive" : "text-primary")} />
            <span className="text-xs font-mono text-foreground">
              {String(Math.floor(callTimer / 60)).padStart(2, "0")}:
              {String(callTimer % 60).padStart(2, "0")}
            </span>
          </div>
        </div>
      )}
    </div>
  </>
  );
};

