import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Clock,
  FolderOpen,
  ExternalLink,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import WidgetTab from "@/components/assistants/WidgetTab";
import ConversationsTab from "@/components/assistants/ConversationsTab";
import CreateAgentWizard from "@/components/assistants/CreateAgentWizard";
import CostAndLatency from "@/components/assistants/CostAndLatency";
import { VoiceSelectorDialog } from "@/components/assistants/VoiceSelectorDialog";
import { agentsApi, Agent, voicesApi, Voice, agentFilesApi, AgentFile, awsS3Api, conversationsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const tabs = [
  { id: "configuration", label: "Configuration", icon: Settings },
  { id: "prompt-logic", label: "Prompt Logic", icon: FileText },
  { id: "conversations", label: "Conversations", icon: MessageSquare },
  { id: "widget", label: "Widget", icon: Layout },
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

const SYSTEM_TOOL_KEYS = [
  "end_call",
  "detect_language",
  "skip_turn",
  "transfer_to_agent",
  "transfer_to_number",
  "play_keypad_touch_tone",
  "voicemail_detection"
] as const;

type SystemToolKey = typeof SYSTEM_TOOL_KEYS[number];

type TransferRuleSetting = {
  agent: string;
  condition: string;
  delayMs: number;
  transferMessage: string;
  enableFirstMessage: boolean;
};

type HumanTransferRuleSetting = {
  transferType: "conference";
  destinationType: "phone_number";
  phoneNumber: string;
  condition: string;
};

type SystemToolSetting = {
  name: string;
  description: string;
  disableInterruptions: boolean;
  transferRules?: TransferRuleSetting[];
  humanTransferRules?: HumanTransferRuleSetting[];
};

const normalizeSystemToolKey = (key: string): SystemToolKey | null => {
  const normalized = key.replace(/-/g, "_");
  return (SYSTEM_TOOL_KEYS as readonly string[]).includes(normalized)
    ? (normalized as SystemToolKey)
    : null;
};

const getEmptyTransferRule = (): TransferRuleSetting => ({
  agent: "",
  condition: "",
  delayMs: 0,
  transferMessage: "",
  enableFirstMessage: false
});

const getEmptyHumanTransferRule = (): HumanTransferRuleSetting => ({
  transferType: "conference",
  destinationType: "phone_number",
  phoneNumber: "",
  condition: ""
});

const getDefaultSystemToolsState = (): Record<SystemToolKey, boolean> => ({
  end_call: false,
  detect_language: false,
  skip_turn: false,
  transfer_to_agent: false,
  transfer_to_number: false,
  play_keypad_touch_tone: false,
  voicemail_detection: false
});

const getDefaultSystemToolSettings = (): Record<SystemToolKey, SystemToolSetting> => ({
  end_call: { name: "end_call", description: "", disableInterruptions: false },
  detect_language: { name: "detect_language", description: "", disableInterruptions: false },
  skip_turn: { name: "skip_turn", description: "", disableInterruptions: false },
  transfer_to_agent: { name: "transfer_to_agent", description: "", disableInterruptions: false, transferRules: [getEmptyTransferRule()] },
  transfer_to_number: { name: "transfer_to_number", description: "", disableInterruptions: false, humanTransferRules: [getEmptyHumanTransferRule()] },
  play_keypad_touch_tone: { name: "play_keypad_touch_tone", description: "", disableInterruptions: false },
  voicemail_detection: { name: "voicemail_detection", description: "", disableInterruptions: false },
});

const getDefaultSystemToolExpanded = (): Record<SystemToolKey, boolean> => ({
  end_call: false,
  detect_language: false,
  skip_turn: false,
  transfer_to_agent: false, // Collapsed by default
  transfer_to_number: false, // Collapsed by default
  play_keypad_touch_tone: false,
  voicemail_detection: false
});

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
  
  const handleSystemToolToggle = (key: SystemToolKey, checked: boolean) => {
    setSystemTools(prev => ({ ...prev, [key]: checked }));
    // Don't auto-expand transfer sections - they should stay collapsed by default
  };

  const toggleSystemToolSection = (key: SystemToolKey) => {
    setSystemToolExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSystemToolSettingChange = (key: SystemToolKey, updates: Partial<SystemToolSetting>) => {
    setSystemToolSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...updates
      }
    }));
  };

  const updateTransferRule = (index: number, updates: Partial<TransferRuleSetting>) => {
    setSystemToolSettings(prev => {
      const current = prev.transfer_to_agent?.transferRules || [getEmptyTransferRule()];
      const nextRules = [...current];
      nextRules[index] = { ...nextRules[index], ...updates };
      return {
        ...prev,
        transfer_to_agent: {
          ...prev.transfer_to_agent,
          transferRules: nextRules
        }
      };
    });
  };

  const addTransferRule = () => {
    setSystemToolSettings(prev => {
      const current = prev.transfer_to_agent?.transferRules || [];
      return {
        ...prev,
        transfer_to_agent: {
          ...prev.transfer_to_agent,
          transferRules: [...current, getEmptyTransferRule()]
        }
      };
    });
  };

  const removeTransferRule = (index: number) => {
    setSystemToolSettings(prev => {
      const current = prev.transfer_to_agent?.transferRules || [];
      if (current.length === 0) return prev;
      const nextRules = current.filter((_, i) => i !== index);
      return {
        ...prev,
        transfer_to_agent: {
          ...prev.transfer_to_agent,
          transferRules: nextRules.length ? nextRules : [getEmptyTransferRule()]
        }
      };
    });
  };

  const updateHumanTransferRule = (index: number, updates: Partial<HumanTransferRuleSetting>) => {
    setSystemToolSettings(prev => {
      const current = prev.transfer_to_number?.humanTransferRules || [getEmptyHumanTransferRule()];
      const nextRules = [...current];
      nextRules[index] = { ...nextRules[index], ...updates };
      return {
        ...prev,
        transfer_to_number: {
          ...prev.transfer_to_number,
          humanTransferRules: nextRules
        }
      };
    });
  };

  const addHumanTransferRule = () => {
    setSystemToolSettings(prev => {
      const current = prev.transfer_to_number?.humanTransferRules || [];
      return {
        ...prev,
        transfer_to_number: {
          ...prev.transfer_to_number,
          humanTransferRules: [...current, getEmptyHumanTransferRule()]
        }
      };
    });
  };

  const removeHumanTransferRule = (index: number) => {
    setSystemToolSettings(prev => {
      const current = prev.transfer_to_number?.humanTransferRules || [];
      if (current.length === 0) return prev;
      const nextRules = current.filter((_, i) => i !== index);
      return {
        ...prev,
        transfer_to_number: {
          ...prev.transfer_to_number,
          humanTransferRules: nextRules.length ? nextRules : [getEmptyHumanTransferRule()]
        }
      };
    });
  };

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
  const [allAvailableFiles, setAllAvailableFiles] = useState<AgentFile[]>([]);
  const [showChooseFilesDialog, setShowChooseFilesDialog] = useState(false);
  const [loadingAvailableFiles, setLoadingAvailableFiles] = useState(false);
  const [assigningFile, setAssigningFile] = useState(false);
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
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState("");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // System tools state
  const [systemTools, setSystemTools] = useState<Record<SystemToolKey, boolean>>(() => getDefaultSystemToolsState());
  const [systemToolSettings, setSystemToolSettings] = useState<Record<SystemToolKey, SystemToolSetting>>(() => getDefaultSystemToolSettings());
  const [systemToolExpanded, setSystemToolExpanded] = useState<Record<SystemToolKey, boolean>>(() => getDefaultSystemToolExpanded());
  
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
      
      // Extract system tools - Check both agent level and conversation_config for backward compatibility
      const agentDataRecord = agentData as unknown as Record<string, unknown>;
      const systemToolsData = (agentDataRecord.system_tools || config.system_tools) as Record<string, unknown> | undefined;
      
      if (systemToolsData && typeof systemToolsData === 'object') {
        const defaults = getDefaultSystemToolSettings();
        const parsedSettings: Record<SystemToolKey, SystemToolSetting> = { ...defaults };
        const toolsState = { ...getDefaultSystemToolsState() };

        SYSTEM_TOOL_KEYS.forEach((key) => {
          const toolData = systemToolsData[key] as Record<string, unknown> | undefined;
          
          if (toolData && typeof toolData === 'object') {
            // Extract active state
            const isActive = toolData.active === true || toolData.active === 'true' || toolData.active === 1;
            toolsState[key] = isActive;

            // Extract settings
            const nextSetting: SystemToolSetting = { ...defaults[key] };
            
            if (typeof toolData.description === 'string') {
              nextSetting.description = toolData.description;
            }
            if (typeof toolData.disable_interruptions === 'boolean') {
              nextSetting.disableInterruptions = toolData.disable_interruptions;
            }

            // Extract params for transfer tools
            if (key === "transfer_to_agent" && toolData.params && typeof toolData.params === 'object') {
              const params = toolData.params as Record<string, unknown>;
              if (Array.isArray(params.transfers)) {
                nextSetting.transferRules = (params.transfers as Array<Record<string, unknown>>).map(transfer => ({
                  // ElevenLabs uses agent_id, but we store it as agent in our state
                  agent: typeof transfer.agent_id === 'string' ? transfer.agent_id : 
                         typeof transfer.agent === 'string' ? transfer.agent : "",
                  condition: typeof transfer.condition === 'string' ? transfer.condition : "",
                  delayMs: typeof transfer.delay_ms === 'number' ? transfer.delay_ms : 0,
                  transferMessage: typeof transfer.transfer_message === 'string' ? transfer.transfer_message : "",
                  enableFirstMessage: typeof transfer.enable_first_message === 'boolean' ? transfer.enable_first_message : false
                }));
              }
            }

            if (key === "transfer_to_number" && toolData.params && typeof toolData.params === 'object') {
              const params = toolData.params as Record<string, unknown>;
              if (Array.isArray(params.transfers)) {
                nextSetting.humanTransferRules = (params.transfers as Array<Record<string, unknown>>).map(transfer => ({
                  transferType: "conference" as const, // Only conference is supported
                  destinationType: "phone_number",
                  phoneNumber: typeof transfer.phone_number === 'string' ? transfer.phone_number : "",
                  condition: typeof transfer.condition === 'string' ? transfer.condition : ""
                }));
              }
            }

            parsedSettings[key] = nextSetting;
          }
        });

        setSystemTools(toolsState);
        setSystemToolSettings(parsedSettings);
        
        // Auto-expand transfer tools if they are active
        setSystemToolExpanded(prev => {
          const next = { ...prev };
          if (toolsState.transfer_to_agent) {
            next.transfer_to_agent = true;
          }
          if (toolsState.transfer_to_number) {
            next.transfer_to_number = true;
          }
          return next;
        });
      }
      
      // Legacy format support - if system_tools is an array
      else if (Array.isArray(config.system_tools)) {
        const tools = config.system_tools as string[];
        const normalizedTools = tools
          .map(tool => normalizeSystemToolKey(String(tool)))
          .filter(Boolean) as SystemToolKey[];

        setSystemTools(prev => {
          const newTools = { ...prev };
          SYSTEM_TOOL_KEYS.forEach(key => {
            newTools[key] = normalizedTools.includes(key);
          });
          return newTools;
        });

        setSystemToolExpanded(prev => {
          const next = { ...prev };
          if (normalizedTools.includes("transfer_to_agent")) {
            next.transfer_to_agent = true;
          }
          if (normalizedTools.includes("transfer_to_number")) {
            next.transfer_to_number = true;
          }
          return next;
        });
        
        // Try to extract settings from old format
        if (config.system_tools_settings && typeof config.system_tools_settings === 'object') {
          const settings = config.system_tools_settings as Record<string, unknown>;
          const defaults = getDefaultSystemToolSettings();
          const parsedSettings: Record<SystemToolKey, SystemToolSetting> = { ...defaults };

        SYSTEM_TOOL_KEYS.forEach((key) => {
          const incoming = (settings[key] || settings[key.replace(/_/g, "-")]) as Record<string, unknown> | undefined;
          if (incoming && typeof incoming === 'object') {
            const nextSetting: SystemToolSetting = { ...defaults[key] };
            if (typeof incoming.name === 'string') {
              nextSetting.name = incoming.name;
            }
            if (typeof incoming.description === 'string') {
              nextSetting.description = incoming.description;
            }
            if (typeof incoming.disable_interruptions === 'boolean') {
              nextSetting.disableInterruptions = incoming.disable_interruptions;
            }

            if (key === "transfer_to_agent" && Array.isArray(incoming.transfer_rules)) {
              nextSetting.transferRules = (incoming.transfer_rules as Array<Record<string, unknown>>).map(rule => ({
                // Handle both agent and agent_id for backward compatibility
                agent: typeof rule.agent_id === 'string' ? rule.agent_id :
                       typeof rule.agent === 'string' ? rule.agent : "",
                condition: typeof rule.condition === 'string' ? rule.condition : "",
                delayMs: typeof rule.delay_ms === 'number' ? rule.delay_ms : 0,
                transferMessage: typeof rule.transfer_message === 'string' ? rule.transfer_message : "",
                enableFirstMessage: typeof rule.enable_first_message === 'boolean' ? rule.enable_first_message : false
              }));
            }

            if (key === "transfer_to_number" && Array.isArray(incoming.human_transfer_rules)) {
              nextSetting.humanTransferRules = (incoming.human_transfer_rules as Array<Record<string, unknown>>).map(rule => ({
                transferType: "conference" as const, // Only conference is supported
                destinationType: "phone_number",
                phoneNumber: typeof rule.phone_number === 'string' ? rule.phone_number : "",
                condition: typeof rule.condition === 'string' ? rule.condition : ""
              }));
            }

            parsedSettings[key] = nextSetting;
          }
        });

          setSystemToolSettings(parsedSettings);
        }
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

  // Handle voice preview playback
  const handlePlayPreview = useCallback((voice: Voice) => {
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
  }, [playingVoiceId, toast]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);


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

  // Fetch all available files for selection
  const fetchAllAvailableFiles = useCallback(async () => {
    setLoadingAvailableFiles(true);
    try {
      const response = await agentFilesApi.listAll();
      if (response.data) {
        setAllAvailableFiles(response.data);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load available files',
        variant: 'destructive',
      });
    } finally {
      setLoadingAvailableFiles(false);
    }
  }, [toast]);

  // Handle selecting existing file
  const handleSelectExistingFile = useCallback(async (file: AgentFile, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (assigningFile) return; // Prevent multiple clicks
    
    if (isNew || !agent?.id) {
      // For new agents, we can't assign yet - show message
      toast({
        title: 'Info',
        description: 'Please save the agent first, then you can assign existing files.',
      });
      return;
    }

    setAssigningFile(true);
    try {
      const agentId = agent.id.toString();
      // Create association using existing file's s3_key
      const associateResponse = await agentFilesApi.createAndSync(agentId, {
        s3_key: file.s3_key,
        s3_url: file.s3_url || '',
        file_name: file.file_name,
        file_size: file.file_size || 0,
        content_type: file.content_type || 'application/octet-stream',
      });

      if (associateResponse.data) {
        setAgentFiles(prev => [...prev, associateResponse.data!]);
        toast({
          title: 'Success',
          description: `File "${file.file_name}" assigned to agent successfully.`,
        });
        // Close the dialog after successful assignment
        setShowChooseFilesDialog(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign file';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setAssigningFile(false);
    }
  }, [agent?.id, isNew, toast, assigningFile]);
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
      setSystemTools(getDefaultSystemToolsState());
      setSystemToolSettings(getDefaultSystemToolSettings());
      setSystemToolExpanded(getDefaultSystemToolExpanded());
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
    // Build system tools payload in the format the backend expects
    const systemToolsPayload = SYSTEM_TOOL_KEYS.reduce<Record<string, unknown>>((acc, key) => {
      const isActive = systemTools[key];
      const settings = systemToolSettings[key];
      
      const toolData: Record<string, unknown> = {
        active: isActive,
        ...(settings?.description?.trim() ? { description: settings.description.trim() } : {}),
        ...(typeof settings?.disableInterruptions === 'boolean' ? { disable_interruptions: settings.disableInterruptions } : {}),
      };

      if (key === "transfer_to_agent" && isActive) {
        const rules = (settings?.transferRules || []).map(rule => ({
          agent_id: rule.agent, // ElevenLabs expects agent_id, not agent
          ...(rule.condition?.trim() && { condition: rule.condition.trim() }),
          delay_ms: Number.isFinite(rule.delayMs) ? rule.delayMs : 0,
          ...(rule.transferMessage?.trim() && { transfer_message: rule.transferMessage.trim() }),
          enable_first_message: !!rule.enableFirstMessage
        })).filter(rule => rule.agent_id || rule.condition || rule.transfer_message);

        if (rules.length > 0) {
          toolData.params = {
            system_tool_type: "transfer_to_agent",
            transfers: rules,
            voicemail_message: "",
            use_out_of_band_dtmf: false
          };
        }
      }

      if (key === "transfer_to_number" && isActive) {
        const humanRules = (settings?.humanTransferRules || []).map(rule => ({
          transfer_type: rule.transferType,
          destination_type: rule.destinationType,
          phone_number: rule.phoneNumber,
          ...(rule.condition?.trim() && { condition: rule.condition.trim() })
        })).filter(rule => rule.phone_number || rule.condition);

        if (humanRules.length > 0) {
          toolData.params = {
            system_tool_type: "transfer_to_number",
            transfers: humanRules,
            voicemail_message: "",
            use_out_of_band_dtmf: false
          };
        }
      }

      acc[key] = toolData;
      return acc;
    }, {});

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
      platform_settings: platformSettings,
      system_tools: systemToolsPayload
    };
  }, [
    selectedModel,
    selectedProvider,
    systemPrompt,
    systemTools,
    systemToolSettings,
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
                            <div className="space-y-2">
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-between bg-white border-border"
                                onClick={() => setShowVoiceSelector(true)}
                              >
                                <span className="truncate">
                                  {selectedVoiceName || selectedVoiceId || "Select a voice"}
                                </span>
                                <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                              </Button>
                              {selectedVoiceId && selectedVoiceName && (
                                <p className="text-xs text-muted-foreground">
                                  Selected: {selectedVoiceName} ({selectedVoiceId})
                                </p>
                              )}
                            </div>
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
                    <div className="space-y-2">
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={loadingAvailableFiles || assigningFile || isNew}
                          onClick={() => {
                            if (!loadingAvailableFiles && !assigningFile && !isNew) {
                              fetchAllAvailableFiles();
                              setShowChooseFilesDialog(true);
                            }
                          }}
                        >
                          {loadingAvailableFiles || assigningFile ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {assigningFile ? 'Assigning...' : 'Loading...'}
                            </>
                          ) : (
                            <>
                              <FolderOpen className="h-4 w-4 mr-2" />
                              Choose from existing files
                            </>
                          )}
                        </Button>
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
                    {/* End call */}
                    <div className="border border-border rounded-lg">
                      <div className="flex items-center justify-between p-3 bg-secondary/50">
                        <div className="flex items-center gap-3 flex-1">
                          <Settings className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">End call</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {systemTools.end_call && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => toggleSystemToolSection("end_call")}
                            >
                              <ChevronDown className={cn("h-4 w-4 transition-transform", systemToolExpanded.end_call && "rotate-180")} />
                            </Button>
                          )}
                          <Switch
                            checked={systemTools.end_call}
                            onCheckedChange={(checked) => handleSystemToolToggle("end_call", checked)}
                          />
                        </div>
                      </div>
                      {systemTools.end_call && systemToolExpanded.end_call && (
                        <div className="p-4 space-y-4 border-t border-border">
                          <h4 className="text-sm font-semibold">Configuration</h4>
                          <p className="text-xs text-muted-foreground">Describe to the LLM how and when to use the tool.</p>
                          <div>
                            <label className="text-sm text-muted-foreground mb-2 block">Name</label>
                            <Input
                              value={systemToolSettings.end_call.name}
                              readOnly
                              disabled
                              className="bg-secondary/50 border-border text-muted-foreground cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground mb-2 block">Description (optional)</label>
                            <Textarea
                              value={systemToolSettings.end_call.description}
                              onChange={(e) => handleSystemToolSettingChange("end_call", { description: e.target.value })}
                              placeholder="Leave blank to use the default optimized LLM prompt."
                              className="bg-white border-border min-h-[80px] text-sm"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium">Disable interruptions</div>
                              <p className="text-xs text-muted-foreground">Select this box to disable interruptions while the tool is running.</p>
                            </div>
                            <Switch
                              checked={systemToolSettings.end_call.disableInterruptions}
                              onCheckedChange={(checked) => handleSystemToolSettingChange("end_call", { disableInterruptions: checked })}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Detect language */}
                    <div className="border border-border rounded-lg">
                      <div className="flex items-center justify-between p-3 bg-secondary/50">
                        <div className="flex items-center gap-3 flex-1">
                          <Settings className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Detect language</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {systemTools.detect_language && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => toggleSystemToolSection("detect_language")}
                            >
                              <ChevronDown className={cn("h-4 w-4 transition-transform", systemToolExpanded.detect_language && "rotate-180")} />
                            </Button>
                          )}
                          <Switch
                            checked={systemTools.detect_language}
                            onCheckedChange={(checked) => handleSystemToolToggle("detect_language", checked)}
                          />
                        </div>
                      </div>
                      {systemTools.detect_language && systemToolExpanded.detect_language && (
                        <div className="p-4 space-y-4 border-t border-border">
                          <h4 className="text-sm font-semibold">Configuration</h4>
                          <p className="text-xs text-muted-foreground">Describe to the LLM how and when to use the tool.</p>
                          <div>
                            <label className="text-sm text-muted-foreground mb-2 block">Name</label>
                            <Input
                              value={systemToolSettings.detect_language.name}
                              readOnly
                              disabled
                              className="bg-secondary/50 border-border text-muted-foreground cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground mb-2 block">Description (optional)</label>
                            <Textarea
                              value={systemToolSettings.detect_language.description}
                              onChange={(e) => handleSystemToolSettingChange("detect_language", { description: e.target.value })}
                              placeholder="Leave blank to use the default optimized LLM prompt."
                              className="bg-white border-border min-h-[80px] text-sm"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium">Disable interruptions</div>
                              <p className="text-xs text-muted-foreground">Select this box to disable interruptions while the tool is running.</p>
                            </div>
                            <Switch
                              checked={systemToolSettings.detect_language.disableInterruptions}
                              onCheckedChange={(checked) => handleSystemToolSettingChange("detect_language", { disableInterruptions: checked })}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Transfer to agent */}
                    <div className="border border-border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-3 bg-secondary/50">
                        <div className="flex items-center gap-3 flex-1">
                          <Settings className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Transfer to agent</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {systemTools.transfer_to_agent && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => toggleSystemToolSection("transfer_to_agent")}
                            >
                              <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", systemToolExpanded.transfer_to_agent && "rotate-180")} />
                            </Button>
                          )}
                          <Switch
                            checked={systemTools.transfer_to_agent}
                            onCheckedChange={(checked) => handleSystemToolToggle("transfer_to_agent", checked)}
                          />
                        </div>
                      </div>
                      {systemTools.transfer_to_agent && (
                        <div className={cn(
                          "overflow-hidden transition-all duration-300 ease-in-out",
                          systemToolExpanded.transfer_to_agent ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
                        )}>
                          <div className="p-4 space-y-6 border-t border-border">
                          {/* Configuration Section */}
                          <div className="space-y-4 pb-4 border-b border-border">
                            <h4 className="text-sm font-semibold">Configuration</h4>
                            <p className="text-xs text-muted-foreground">Describe to the LLM how and when to use the tool.</p>
                            <div>
                              <label className="text-sm text-muted-foreground mb-2 block">Name</label>
                              <Input
                                value={systemToolSettings.transfer_to_agent.name}
                                readOnly
                                disabled
                                className="bg-secondary/50 border-border text-muted-foreground cursor-not-allowed"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-muted-foreground mb-2 block">Description (optional)</label>
                              <Textarea
                                value={systemToolSettings.transfer_to_agent.description}
                                onChange={(e) => handleSystemToolSettingChange("transfer_to_agent", { description: e.target.value })}
                                placeholder="Leave blank to use the default optimized LLM prompt."
                                className="bg-white border-border min-h-[80px] text-sm"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium">Disable interruptions</div>
                                <p className="text-xs text-muted-foreground">Select this box to disable interruptions while the tool is running.</p>
                              </div>
                              <Switch
                                checked={systemToolSettings.transfer_to_agent.disableInterruptions}
                                onCheckedChange={(checked) => handleSystemToolSettingChange("transfer_to_agent", { disableInterruptions: checked })}
                              />
                            </div>
                          </div>

                          {/* Transfer Rules Section */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-semibold">Transfer Rules</h4>
                                <p className="text-xs text-muted-foreground mt-1">Define the conditions for transferring to different agents.</p>
                              </div>
                            </div>
                          {(systemToolSettings.transfer_to_agent.transferRules || []).map((rule, index) => (
                            <div key={index} className="border border-border rounded-lg p-4 space-y-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium">Transfer Rule {index + 1}</h4>
                                {(systemToolSettings.transfer_to_agent.transferRules || []).length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => removeTransferRule(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Agent</label>
                                <Select 
                                  value={rule.agent} 
                                  onValueChange={(value) => updateTransferRule(index, { agent: value })}
                                >
                                  <SelectTrigger className="bg-white border-border">
                                    <SelectValue placeholder="Select agent" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="agent-1">Agent 1</SelectItem>
                                    <SelectItem value="agent-2">Agent 2</SelectItem>
                                    <SelectItem value="agent-3">Agent 3</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Condition</label>
                                <Textarea
                                  value={rule.condition}
                                  onChange={(e) => updateTransferRule(index, { condition: e.target.value })}
                                  placeholder="Enter the condition for transferring to this agent"
                                  className="bg-white border-border min-h-[80px] text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Delay before transfer (milliseconds)</label>
                                <Input
                                  type="number"
                                  value={rule.delayMs}
                                  onChange={(e) => updateTransferRule(index, { delayMs: parseInt(e.target.value) || 0 })}
                                  className="bg-white border-border"
                                />
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Transfer Message</label>
                                <Textarea
                                  value={rule.transferMessage}
                                  onChange={(e) => updateTransferRule(index, { transferMessage: e.target.value })}
                                  placeholder="Enter transfer message (optional)"
                                  className="bg-white border-border min-h-[60px] text-sm"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-medium">Enable First Message</div>
                                  <p className="text-xs text-muted-foreground">Play the transferred agent's first message after transfer</p>
                                </div>
                                <Switch
                                  checked={rule.enableFirstMessage}
                                  onCheckedChange={(checked) => updateTransferRule(index, { enableFirstMessage: checked })}
                                />
                              </div>
                            </div>
                          ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={addTransferRule}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Rule
                            </Button>
                          </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Transfer to number */}
                    <div className="border border-border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-3 bg-secondary/50">
                        <div className="flex items-center gap-3 flex-1">
                          <Settings className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Transfer to number</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {systemTools.transfer_to_number && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => toggleSystemToolSection("transfer_to_number")}
                            >
                              <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", systemToolExpanded.transfer_to_number && "rotate-180")} />
                            </Button>
                          )}
                          <Switch
                            checked={systemTools.transfer_to_number}
                            onCheckedChange={(checked) => handleSystemToolToggle("transfer_to_number", checked)}
                          />
                        </div>
                      </div>
                      {systemTools.transfer_to_number && (
                        <div className={cn(
                          "overflow-hidden transition-all duration-300 ease-in-out",
                          systemToolExpanded.transfer_to_number ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
                        )}>
                          <div className="p-4 space-y-6 border-t border-border">
                          {/* Configuration Section */}
                          <div className="space-y-4 pb-4 border-b border-border">
                            <h4 className="text-sm font-semibold">Configuration</h4>
                            <p className="text-xs text-muted-foreground">Describe to the LLM how and when to use the tool.</p>
                            <div>
                              <label className="text-sm text-muted-foreground mb-2 block">Name</label>
                              <Input
                                value={systemToolSettings.transfer_to_number.name}
                                readOnly
                                disabled
                                className="bg-secondary/50 border-border text-muted-foreground cursor-not-allowed"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-muted-foreground mb-2 block">Description (optional)</label>
                              <Textarea
                                value={systemToolSettings.transfer_to_number.description}
                                onChange={(e) => handleSystemToolSettingChange("transfer_to_number", { description: e.target.value })}
                                placeholder="Leave blank to use the default optimized LLM prompt."
                                className="bg-white border-border min-h-[80px] text-sm"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium">Disable interruptions</div>
                                <p className="text-xs text-muted-foreground">Select this box to disable interruptions while the tool is running.</p>
                              </div>
                              <Switch
                                checked={systemToolSettings.transfer_to_number.disableInterruptions}
                                onCheckedChange={(checked) => handleSystemToolSettingChange("transfer_to_number", { disableInterruptions: checked })}
                              />
                            </div>
                          </div>

                          {/* Human Transfer Rules Section */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-semibold">Human Transfer Rules</h4>
                                <p className="text-xs text-muted-foreground mt-1">Define the conditions for transferring to human operators.</p>
                              </div>
                            </div>
                          {(systemToolSettings.transfer_to_number.humanTransferRules || []).map((rule, index) => (
                            <div key={index} className="border border-border rounded-lg p-4 space-y-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium">Human Transfer Rule {index + 1}</h4>
                                {(systemToolSettings.transfer_to_number.humanTransferRules || []).length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => removeHumanTransferRule(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Transfer type</label>
                                <div className="px-3 py-2 bg-secondary/50 rounded-md border border-border text-sm">
                                  Conference
                                </div>
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Destination type</label>
                                <Select 
                                  value={rule.destinationType} 
                                  onValueChange={(value: "phone_number") => updateHumanTransferRule(index, { destinationType: value })}
                                >
                                  <SelectTrigger className="bg-white border-border">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="phone_number">Phone Number</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Phone Number</label>
                                <Input
                                  type="text"
                                  value={rule.phoneNumber}
                                  onChange={(e) => updateHumanTransferRule(index, { phoneNumber: e.target.value })}
                                  placeholder="+15551234567"
                                  className="bg-white border-border"
                                />
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Condition</label>
                                <Textarea
                                  value={rule.condition}
                                  onChange={(e) => updateHumanTransferRule(index, { condition: e.target.value })}
                                  placeholder="Enter the condition for transferring to this phone number"
                                  className="bg-white border-border min-h-[100px] text-sm"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Type {"{{{"} to add variables</p>
                              </div>
                            </div>
                          ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={addHumanTransferRule}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Rule
                            </Button>
                          </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Voicemail detection */}
                    <div className="border border-border rounded-lg">
                      <div className="flex items-center justify-between p-3 bg-secondary/50">
                        <div className="flex items-center gap-3 flex-1">
                          <Settings className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Voicemail detection</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {systemTools.voicemail_detection && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => toggleSystemToolSection("voicemail_detection")}
                            >
                              <ChevronDown className={cn("h-4 w-4 transition-transform", systemToolExpanded.voicemail_detection && "rotate-180")} />
                            </Button>
                          )}
                          <Switch
                            checked={systemTools.voicemail_detection}
                            onCheckedChange={(checked) => handleSystemToolToggle("voicemail_detection", checked)}
                          />
                        </div>
                      </div>
                      {systemTools.voicemail_detection && systemToolExpanded.voicemail_detection && (
                        <div className="p-4 space-y-4 border-t border-border">
                          <h4 className="text-sm font-semibold">Configuration</h4>
                          <p className="text-xs text-muted-foreground">Describe to the LLM how and when to use the tool.</p>
                          <div>
                            <label className="text-sm text-muted-foreground mb-2 block">Name</label>
                            <Input
                              value={systemToolSettings.voicemail_detection.name}
                              readOnly
                              disabled
                              className="bg-secondary/50 border-border text-muted-foreground cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground mb-2 block">Description (optional)</label>
                            <Textarea
                              value={systemToolSettings.voicemail_detection.description}
                              onChange={(e) => handleSystemToolSettingChange("voicemail_detection", { description: e.target.value })}
                              placeholder="Leave blank to use the default optimized LLM prompt."
                              className="bg-white border-border min-h-[80px] text-sm"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium">Disable interruptions</div>
                              <p className="text-xs text-muted-foreground">Select this box to disable interruptions while the tool is running.</p>
                            </div>
                            <Switch
                              checked={systemToolSettings.voicemail_detection.disableInterruptions}
                              onCheckedChange={(checked) => handleSystemToolSettingChange("voicemail_detection", { disableInterruptions: checked })}
                            />
                          </div>
                        </div>
                      )}
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
                  setShowPreviewChat={setShowPreviewChat}
                  elevenlabsAgentId={agent?.elevenlabs_agent_id}
                />
              </div>
            </>
          ) : (
            <div className="w-[400px] lg:w-[400px] md:w-[350px] border-l border-border flex flex-col bg-card flex-shrink-0 h-full overflow-hidden">
              <PreviewChatContent
                selectedAssistant={{ id: agentId, name: agentName }}
                setShowPreviewChat={setShowPreviewChat}
                elevenlabsAgentId={agent?.elevenlabs_agent_id}
              />
            </div>
          )}
        </>
      )}

      {/* Voice Selector Dialog */}
      <VoiceSelectorDialog
        open={showVoiceSelector}
        onOpenChange={(open) => {
          setShowVoiceSelector(open);
          if (!open) {
            // Reset search query when dialog closes
            setVoiceSearchQuery("");
            // Stop any playing audio
            if (currentAudioRef.current) {
              currentAudioRef.current.pause();
              currentAudioRef.current = null;
              setPlayingVoiceId(null);
            }
          }
        }}
        voices={voices}
        selectedVoiceId={selectedVoiceId || ""}
        onSelectVoice={(voiceId) => {
          setSelectedVoiceId(voiceId);
          const selectedVoice = voices.find(v => v.id === voiceId);
          if (selectedVoice) {
            setSelectedVoiceName(selectedVoice.name || "");
          } else {
            // If voice not found in list, clear the name and try to fetch it
            setSelectedVoiceName("");
            // Try to fetch the voice name from API
            voicesApi.get(voiceId).then((response) => {
              if (response.data?.name) {
                setSelectedVoiceName(response.data.name);
              }
            }).catch(() => {
              // Silently fail
            });
          }
          setShowVoiceSelector(false);
        }}
        playingVoiceId={playingVoiceId}
        onPlayPreview={handlePlayPreview}
        searchQuery={voiceSearchQuery}
        onSearchChange={setVoiceSearchQuery}
      />

      {/* Choose Existing Files Dialog */}
      <Dialog open={showChooseFilesDialog} onOpenChange={(open) => {
        if (!assigningFile) {
          setShowChooseFilesDialog(open);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose from Existing Files</DialogTitle>
            <DialogDescription>
              Select files from your knowledge base to add to this agent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {loadingAvailableFiles ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : allAvailableFiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No files available in your knowledge base.</p>
                <p className="text-sm mt-2">Upload files first to use them here.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {allAvailableFiles
                  .filter(file => {
                    // Filter out files already assigned to this agent
                    if (isNew || !agent?.id) return true;
                    return !agentFiles.some(af => af.s3_key === file.s3_key);
                  })
                  .map((file) => (
                    <div
                      key={file.id}
                      className={cn(
                        "flex items-center gap-3 p-3 bg-card border border-border rounded-lg transition-colors",
                        assigningFile ? "opacity-50 cursor-not-allowed" : "hover:bg-secondary/50 cursor-pointer"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!assigningFile) {
                          handleSelectExistingFile(file, e);
                        }
                      }}
                    >
                      <Paperclip className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium truncate">{file.file_name}</span>
                          {file.elevenlabs_document_id && (
                            <span className="text-xs px-2 py-0.5 bg-success/10 text-success rounded-full">
                              Synced
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {file.file_size && (
                            <span>{file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : ''}</span>
                          )}
                          {file.agent_name ? (
                            <>
                              <span>•</span>
                              <span className="truncate">Used by {file.agent_name}</span>
                            </>
                          ) : (
                            <>
                              <span>•</span>
                              <span className="truncate italic">Unassigned</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={assigningFile}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!assigningFile) {
                            handleSelectExistingFile(file, e);
                          }
                        }}
                      >
                        {assigningFile ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChooseFilesDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// PreviewChatContent component - with compact voice control bar
const PreviewChatContent = ({
  selectedAssistant,
  setShowPreviewChat,
  elevenlabsAgentId,
}: {
  selectedAssistant: { id: string; name: string };
  setShowPreviewChat: (show: boolean) => void;
  elevenlabsAgentId?: string;
}) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent'; text: string; timestamp: Date }>>([]);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'connecting' | 'connected' | 'speaking' | 'listening'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Import VoiceControlBar dynamically to avoid SSR issues
  const VoiceControlBar = React.lazy(() => 
    import('@/components/assistants/VoiceControlBar').then(mod => ({ default: mod.VoiceControlBar }))
  );

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMessage = useCallback((message: { role: 'user' | 'agent'; text: string }) => {
    setMessages(prev => [...prev, { ...message, timestamp: new Date() }]);
  }, []);

  const handleError = useCallback((error: Error) => {
    toast({
      title: 'Voice Error',
      description: error.message,
      variant: 'destructive',
    });
  }, [toast]);

  const isNotDeployed = !elevenlabsAgentId;
  const isActive = voiceStatus !== 'idle';

  return (
  <>
    {/* Compact Header with Voice Controls */}
    <div className="flex-shrink-0 border-b border-border bg-card">
      {/* Title Row */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
        <h3 className="font-semibold text-sm">Test Assistant</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            setShowPreviewChat(false);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Voice Control Bar */}
      {isNotDeployed ? (
        <div className="flex items-center gap-2 px-4 py-3 bg-warning/10">
          <Info className="h-4 w-4 text-warning flex-shrink-0" />
          <span className="text-xs text-warning">Deploy your assistant to enable voice testing</span>
        </div>
      ) : (
        <React.Suspense fallback={
          <div className="flex items-center justify-center py-3">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        }>
          <VoiceControlBar
            agentId={elevenlabsAgentId}
            onMessage={handleMessage}
            onStatusChange={setVoiceStatus}
            onError={handleError}
          />
        </React.Suspense>
      )}
    </div>

    {/* Conversation Transcript - Takes most of the space */}
    <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 min-h-0">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <MessageSquare className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm font-medium mb-1">No messages yet</p>
          <p className="text-xs max-w-[200px]">
            {isNotDeployed 
              ? "Deploy your assistant first, then start a voice conversation"
              : isActive 
                ? "Speak to your assistant - the transcript will appear here"
                : "Click the phone button above to start a voice conversation"
            }
          </p>
        </div>
      ) : (
        messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-2 md:gap-3",
              message.role === "agent" ? "flex-row" : "flex-row-reverse"
            )}
          >
            <div
              className={cn(
                "w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0",
                message.role === "agent"
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary text-foreground"
              )}
            >
              {message.role === "agent" ? (
                <AudioLines className="h-3.5 w-3.5 md:h-4 md:w-4" />
              ) : (
                <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
              )}
            </div>
            <div
              className={cn(
                "flex-1 rounded-lg p-2 md:p-3 max-w-[85%]",
                message.role === "agent"
                  ? "bg-primary/10 text-foreground"
                  : "bg-secondary text-foreground"
              )}
            >
              <p className="text-xs md:text-sm">{message.text}</p>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  </>
  );
};
