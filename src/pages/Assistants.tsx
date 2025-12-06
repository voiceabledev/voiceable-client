import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  FileText, 
  Copy, 
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code,
  MessageSquare,
  Phone,
  Mic,
  AudioLines,
  Settings,
  X,
  Layout,
  Info,
  Volume2,
  VolumeX,
  GripVertical,
  Target,
  Clock,
  Shield,
  Quote,
  Music,
  Video,
  Upload,
  Paperclip,
  Trash2,
  Heart,
  User,
  Calendar,
  FileDown,
  Star,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import WidgetTab from "@/components/assistants/WidgetTab";
import ConversationsTab from "@/components/assistants/ConversationsTab";

const assistants = [
  {
    id: "9ca34dcd-1ccb-4f13-bc65-60d31553eab0",
    name: "Alex",
    providers: ["deepgram", "openai", "vapi"],
  },
  {
    id: "2f24e154-b38d-487e-b4a1-123456789abc",
    name: "Riley",
    providers: ["deepgram", "openai", "vapi"],
  },
];

const tabs = [
  { id: "model", label: "Model", icon: Code },
  { id: "voice", label: "Voice", icon: AudioLines },
  { id: "transcriber", label: "Transcriber", icon: Mic },
  { id: "conversations", label: "Conversations", icon: MessageSquare },
  { id: "widget", label: "Widget", icon: Layout },
  { id: "advanced", label: "Advanced", icon: Settings },
];

const providers = [
  { value: "openai", label: "OpenAI", icon: "🤖" },
  { value: "anthropic", label: "Anthropic", icon: "🧠" },
  { value: "google", label: "Google", icon: "🔷" },
  { value: "meta", label: "Meta", icon: "🦙" },
  { value: "mistral", label: "Mistral", icon: "🌊" },
  { value: "cohere", label: "Cohere", icon: "⚡" },
  { value: "groq", label: "Groq", icon: "🚀" },
  { value: "perplexity", label: "Perplexity", icon: "🔍" },
];

const modelsByProvider: Record<string, { value: string; label: string }[]> = {
  openai: [
    { value: "gpt-4o-cluster", label: "GPT 4o Cluster" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  ],
  anthropic: [
    { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
    { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" },
    { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" },
  ],
  google: [
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
    { value: "gemini-pro", label: "Gemini Pro" },
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
};

const AssistantsListContent = ({ 
  selectedAssistant, 
  setSelectedAssistant, 
  setShowCreatePanel,
  showFullContent
}: { 
  selectedAssistant: typeof assistants[0]; 
  setSelectedAssistant: (assistant: typeof assistants[0]) => void;
  setShowCreatePanel: (show: boolean) => void;
  showFullContent: boolean;
}) => (
  <>
    <div className="p-3 md:p-4 border-b border-border flex-shrink-0">
      <div className="flex items-center gap-2 mb-3 md:mb-4">
        {showFullContent && (
          <>
            <h2 className="text-base md:text-lg font-semibold">Assistants</h2>
            <a href="https://contextor.mintlify.app/" className="text-muted-foreground hover:text-foreground ml-auto">
              <span className="flex items-center gap-1 text-xs">
                Docs <ExternalLink className="h-3 w-3" />
              </span>
            </a>
          </>
        )}
      </div>
      
      {showFullContent && (
        <>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 mb-3 text-xs md:text-sm"
            onClick={() => setShowCreatePanel(true)}
          >
            <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Create Assistant
            <FileText className="h-3.5 w-3.5 md:h-4 md:w-4 ml-auto" />
          </Button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
            <Input 
              placeholder="Search Assistants" 
              className="pl-8 md:pl-9 bg-secondary/50 border-border h-8 md:h-10 text-xs md:text-sm"
            />
          </div>
        </>
      )}
    </div>

    <div className="flex-1 overflow-y-auto p-2 min-h-0">
      {showFullContent ? (
        assistants.map((assistant) => (
          <button
            key={assistant.id}
            onClick={() => setSelectedAssistant(assistant)}
            className={cn(
              "w-full text-left p-2 md:p-3 rounded-lg transition-colors",
              selectedAssistant.id === assistant.id 
                ? "bg-sidebar-accent" 
                : "hover:bg-secondary/50"
            )}
          >
            <p className="font-medium text-sm md:text-base">{assistant.name}</p>
            <p className="text-xs text-muted-foreground">
              {assistant.providers.join(" · ")}
            </p>
          </button>
        ))
      ) : (
        <div className="flex flex-col items-center gap-2">
          {assistants.map((assistant) => (
            <button
              key={assistant.id}
              onClick={() => setSelectedAssistant(assistant)}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors text-xs font-semibold",
                selectedAssistant.id === assistant.id 
                  ? "bg-sidebar-accent text-foreground" 
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              )}
              title={assistant.name}
            >
              {assistant.name.charAt(0).toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  </>
);

const assistantTemplates = [
  {
    id: "blank",
    title: "Blank Template",
    description: "This blank slate template with minimal configurations. It's a starting point for creating your custom assistant.",
    icon: Plus,
  },
  {
    id: "customer-support",
    title: "Customer Support Specialist",
    description: "A comprehensive template for resolving product issues, answering questions, and ensuring satisfying customer experiences with technical knowledge and empathy.",
    icon: Heart,
  },
  {
    id: "lead-qualification",
    title: "Lead Qualification Specialist",
    description: "A consultative template designed to identify qualified prospects, understand business challenges, and connect them with appropriate sales representatives.",
    icon: User,
  },
  {
    id: "appointment-scheduler",
    title: "Appointment Scheduler",
    description: "A specialized template for efficiently booking, confirming, rescheduling, or canceling appointments while providing clear service information.",
    icon: Calendar,
  },
  {
    id: "info-collector",
    title: "Info Collector",
    description: "A methodical template for gathering accurate and complete information from customers while ensuring data quality and regulatory compliance.",
    icon: FileDown,
  },
  {
    id: "care-coordinator",
    title: "Care Coordinator",
    description: "A compassionate template for scheduling medical appointments, answering health questions, and coordinating patient services with HIPAA compliance.",
    icon: Heart,
  },
  {
    id: "feedback-gatherer",
    title: "Feedback Gatherer",
    description: "An engaging template for conducting surveys, collecting customer feedback, and gathering market research with high completion rates.",
    icon: Star,
  },
];

export default function Assistants() {
  const [selectedAssistant, setSelectedAssistant] = useState(assistants[0]);
  const [activeTab, setActiveTab] = useState("model");
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();
  
  const showFullContent = !isMobile || isExpanded;
  const [assistantName, setAssistantName] = useState("New Assistant");
  const [selectedTemplate, setSelectedTemplate] = useState("blank");
  const [modelExpanded, setModelExpanded] = useState(true);
  const [voiceConfigExpanded, setVoiceConfigExpanded] = useState(true);
  const [additionalConfigExpanded, setAdditionalConfigExpanded] = useState(true);
  const [transcriberExpanded, setTranscriberExpanded] = useState(true);
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
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-cluster");
  const [firstMessageMode, setFirstMessageMode] = useState("assistant-speaks-first");
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

  const configJson = {
    "id": selectedAssistant.id,
    "orgId": "c9a0e480-7a37-4470-9ef7-a84995517924",
    "name": selectedAssistant.name,
    "voice": {
      "voiceId": "Elliot",
      "provider": "vapi"
    },
    "createdAt": "2025-12-06T02:51:35.891Z",
    "updatedAt": "2025-12-06T02:51:35.891Z",
    "model": {
      "model": "gpt-4o",
      "messages": [
        {
          "role": "system",
          "content": systemPrompt
        }
      ],
      "provider": "openai"
    },
    ...(attachedFiles.length > 0 && {
      "files": attachedFiles.map(file => ({
        "name": file.name,
        "size": file.size,
        "type": file.type
      }))
    })
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Create Assistant Panel Overlay */}
      {showCreatePanel && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setShowCreatePanel(false)}
          />
          <div 
            className={cn(
              "fixed left-0 top-0 bottom-0 bg-card border-r border-border z-50 shadow-xl flex flex-col",
              "transform transition-transform duration-300 ease-in-out",
              showCreatePanel ? "translate-x-0" : "-translate-x-full",
              isMobile ? "w-full" : "w-[600px]"
            )}
          >
            {/* Panel Header */}
            <div className="p-4 md:p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 md:h-5 md:w-5 text-foreground" />
                  <h2 className="text-lg md:text-xl font-semibold">Create Assistant</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCreatePanel(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Choose a template description */}
              <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">
                Here's a few templates to get you started, or you can create your own template and use it to create a new assistant.
              </p>

              {/* Assistant Name Input */}
              <div className="space-y-2">
                <Label className="text-sm">Assistant Name</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  (This can be adjusted at any time after creation.)
                </p>
                <Input
                  value={assistantName}
                  onChange={(e) => setAssistantName(e.target.value)}
                  placeholder="New Assistant"
                  className="bg-secondary/50 border-border text-sm md:text-base"
                />
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Blank Template */}
              <div className="mb-6 md:mb-8">
                <button
                  onClick={() => setSelectedTemplate("blank")}
                  className={cn(
                    "w-full p-3 md:p-4 rounded-lg border-2 transition-all text-left",
                    selectedTemplate === "blank"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50 bg-card"
                  )}
                >
                  <div className="flex items-start gap-2 md:gap-3">
                    <div className={cn(
                      "p-2 rounded-md flex-shrink-0",
                      selectedTemplate === "blank" ? "bg-primary/10" : "bg-secondary/50"
                    )}>
                      <Plus className={cn(
                        "h-4 w-4 md:h-5 md:w-5",
                        selectedTemplate === "blank" ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 text-sm md:text-base">Blank Template</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        This blank slate template with minimal configurations. It's a starting point for creating your custom assistant.
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Quickstart Templates */}
              <div>
                <h3 className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 md:mb-4">
                  QUICKSTART
                </h3>
                <div className="grid grid-cols-1 gap-3 md:gap-4">
                  {assistantTemplates.slice(1).map((template) => {
                    const Icon = template.icon;
                    return (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={cn(
                          "w-full p-3 md:p-4 rounded-lg border-2 transition-all text-left",
                          selectedTemplate === template.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground/50 bg-card"
                        )}
                      >
                        <div className="flex items-start gap-2 md:gap-3">
                          <div className={cn(
                            "p-2 rounded-md flex-shrink-0",
                            selectedTemplate === template.id ? "bg-primary/10" : "bg-secondary/50"
                          )}>
                            <Icon className={cn(
                              "h-4 w-4 md:h-5 md:w-5",
                              selectedTemplate === template.id ? "text-primary" : "text-muted-foreground"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold mb-1 text-sm md:text-base">{template.title}</h3>
                            <p className="text-xs md:text-sm text-muted-foreground">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Panel Footer */}
            <div className="p-4 md:p-6 border-t border-border flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCreatePanel(false)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
              <Button
                variant="accent"
                onClick={() => {
                  // Handle create assistant logic here
                  console.log("Creating assistant:", { name: assistantName, template: selectedTemplate });
                  setShowCreatePanel(false);
                }}
                className="w-full sm:w-auto"
              >
                Create Assistant
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Assistants List Panel - Always visible, collapsible on mobile */}
      <div className={cn(
        "border-r border-border flex flex-col transition-all duration-300 overflow-hidden flex-shrink-0",
        isMobile 
          ? (isExpanded ? "w-64" : "w-16")
          : "w-80"
      )}>
        <div className="flex flex-col h-full overflow-hidden">
          <AssistantsListContent 
            selectedAssistant={selectedAssistant}
            setSelectedAssistant={setSelectedAssistant}
            setShowCreatePanel={setShowCreatePanel}
            showFullContent={showFullContent}
          />
          
          {/* Expand/Collapse Button - Fixed at Bottom */}
          {isMobile && (
            <div className="mt-auto pt-3 md:pt-4 pb-3 md:pb-4 border-t border-border flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-full h-9 md:h-8 flex items-center justify-center",
                  !showFullContent ? "px-0" : "px-3 md:px-4"
                )}
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Collapse menu" : "Expand menu"}
              >
                {isExpanded ? (
                  <>
                    <ChevronLeft className="h-4 w-4 flex-shrink-0" />
                    {showFullContent && <span className="ml-2 text-sm">Collapse</span>}
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    {showFullContent && <span className="ml-2 text-sm">Expand</span>}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Assistant Header */}
        <div className="border-b border-border p-3 md:p-4">
          {/* Mobile: Assistant name only (no menu button since sidebar is always visible) */}
          {isMobile && (
            <div className="mb-3">
              <h1 className="text-lg font-bold truncate">{selectedAssistant.name}</h1>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {!isMobile && (
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold">{selectedAssistant.name}</h1>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mt-1">
                  <span className="truncate">{selectedAssistant.id.slice(0, 20)}...</span>
                  <button className="hover:text-foreground">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button className="hover:text-foreground">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                variant={showConfigPanel ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowConfigPanel(!showConfigPanel)}
                className="text-xs md:text-sm"
              >
                <Code className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden sm:inline">Code</span>
              </Button>
              <Button 
                variant={showPreviewChat ? "secondary" : "accent"} 
                size="sm"
                onClick={() => {
                  setShowPreviewChat(!showPreviewChat);
                  if (!showPreviewChat) {
                    setCallInProgress(true);
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
              <Button variant="subtle" size="sm" className="text-xs md:text-sm">
                <span className="hidden sm:inline">Published</span>
                <span className="sm:hidden">Pub</span>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-3 md:mt-4 overflow-x-auto scrollbar-hide -mx-3 md:mx-0 px-3 md:px-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
          {/* Tab Content */}
          {activeTab === "widget" ? (
            <WidgetTab />
          ) : activeTab === "conversations" ? (
            <ConversationsTab assistantName={selectedAssistant.name} />
          ) : activeTab === "voice" ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Cost & Latency Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="bg-card border border-border rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-sm text-muted-foreground">Cost</span>
                    <span className="text-base md:text-lg font-semibold">~$0.14 <span className="text-xs md:text-sm text-muted-foreground font-normal">/min</span></span>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-2 flex-1 rounded-full bg-success" />
                    <div className="h-2 w-8 rounded-full bg-warning" />
                    <div className="h-2 flex-1 rounded-full bg-destructive/60" />
                    <div className="h-2 flex-1 rounded-full bg-muted" />
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-sm text-muted-foreground">Latency</span>
                    <span className="text-base md:text-lg font-semibold">~1050 <span className="text-xs md:text-sm text-muted-foreground font-normal">ms</span></span>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-2 flex-1 rounded-full bg-success" />
                    <div className="h-2 flex-1 rounded-full bg-primary" />
                    <div className="h-2 flex-1 rounded-full bg-warning" />
                    <div className="h-2 w-12 rounded-full bg-destructive/60" />
                  </div>
                </div>
              </div>

              {/* Voice Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
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
                        <label className="text-sm text-muted-foreground mb-2 block">Provider</label>
                        <Select defaultValue="vapi">
                          <SelectTrigger className="bg-secondary/50 border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vapi">Vapi</SelectItem>
                            <SelectItem value="openai">OpenAI</SelectItem>
                            <SelectItem value="deepgram">Deepgram</SelectItem>
                            <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Voice</label>
                        <Select defaultValue="elliot">
                          <SelectTrigger className="bg-secondary/50 border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="elliot">Elliot</SelectItem>
                            <SelectItem value="sarah">Sarah</SelectItem>
                            <SelectItem value="michael">Michael</SelectItem>
                            <SelectItem value="emily">Emily</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Configuration */}
                <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                  <button 
                    className="w-full flex items-start justify-between gap-2"
                    onClick={() => setAdditionalConfigExpanded(!additionalConfigExpanded)}
                  >
                    <div className="text-left flex-1">
                      <h3 className="text-base md:text-lg font-semibold">Additional Configuration</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">Configure additional settings for the voice of your assistant.</p>
                    </div>
                    <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1", additionalConfigExpanded && "rotate-180")} />
                  </button>
                  
                  {additionalConfigExpanded && (
                    <div className="mt-4 md:mt-6 space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <label className="text-sm text-muted-foreground">Background Sound</label>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <Select defaultValue="default">
                          <SelectTrigger className="bg-secondary/50 border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <label className="text-sm text-muted-foreground">Background Sound URL</label>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <Input 
                          defaultValue="https://www.soundjay.com/ar"
                          className="bg-secondary/50 border-border"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <label className="text-sm text-muted-foreground">Input Min Characters</label>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <Input 
                          type="number"
                          defaultValue="30"
                          className="bg-secondary/50 border-border"
                        />
                      </div>
                      
                      {/* Punctuation Boundaries */}
                      <div className="pt-4 border-t border-border">
                        <div className="mb-2">
                          <h4 className="text-sm font-semibold mb-1">Punctuation Boundaries</h4>
                          <p className="text-xs text-muted-foreground">
                            These are the punctuations that are considered valid boundaries or delimiters. This helps decides the chunks that are sent to the voice provider for the voice generation as the LLM tokens are streaming in.
                          </p>
                        </div>
                        <Select defaultValue="none">
                          <SelectTrigger className="bg-secondary/50 border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Punctuation Boundaries Added</SelectItem>
                            <SelectItem value="period">Period (.)</SelectItem>
                            <SelectItem value="comma">Comma (,)</SelectItem>
                            <SelectItem value="question">Question Mark (?)</SelectItem>
                            <SelectItem value="exclamation">Exclamation Mark (!)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === "transcriber" ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Cost & Latency Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="bg-card border border-border rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-sm text-muted-foreground">Cost</span>
                    <span className="text-base md:text-lg font-semibold">~$0.14 <span className="text-xs md:text-sm text-muted-foreground font-normal">/min</span></span>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-2 flex-1 rounded-full bg-success" />
                    <div className="h-2 w-8 rounded-full bg-warning" />
                    <div className="h-2 flex-1 rounded-full bg-destructive/60" />
                    <div className="h-2 flex-1 rounded-full bg-muted" />
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-sm text-muted-foreground">Latency</span>
                    <span className="text-base md:text-lg font-semibold">~1050 <span className="text-xs md:text-sm text-muted-foreground font-normal">ms</span></span>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-2 flex-1 rounded-full bg-success" />
                    <div className="h-2 flex-1 rounded-full bg-primary" />
                    <div className="h-2 flex-1 rounded-full bg-warning" />
                    <div className="h-2 w-12 rounded-full bg-destructive/60" />
                  </div>
                </div>
              </div>

              {/* Transcriber Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
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
                      {/* Provider */}
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Provider</label>
                        <Select defaultValue="deepgram">
                          <SelectTrigger className="bg-secondary/50 border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="deepgram">Deepgram</SelectItem>
                            <SelectItem value="openai">OpenAI</SelectItem>
                            <SelectItem value="vapi">Vapi</SelectItem>
                            <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Language */}
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Language</label>
                        <Select defaultValue="english">
                          <SelectTrigger className="bg-secondary/50 border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="spanish">Spanish</SelectItem>
                            <SelectItem value="french">French</SelectItem>
                            <SelectItem value="german">German</SelectItem>
                            <SelectItem value="multi">Multi</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-2">
                          <span className="font-medium">Pro tip:</span> If you want to support both English and Spanish, you can set the language to <strong>multi</strong> and use <strong>ElevenLabs Turbo 2.5</strong> in the <strong>Voice</strong> tab.
                        </p>
                      </div>

                      {/* Model */}
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Model</label>
                        <Select defaultValue="flux-general">
                          <SelectTrigger className="bg-secondary/50 border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flux-general">Flux General English</SelectItem>
                            <SelectItem value="nova-2">Nova 2</SelectItem>
                            <SelectItem value="enhanced">Enhanced</SelectItem>
                            <SelectItem value="base">Base</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-start gap-2 mt-2 p-3 bg-secondary/30 rounded-md border border-border">
                          <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground">
                            Make sure your Smart Endpointing Plan in Advanced &gt; Start Speaking Plan is disabled to leverage Flux end-of-turn detection.
                          </p>
                        </div>
                      </div>

                      {/* Background Denoising Enabled */}
                      <div className="flex items-start justify-between pt-4 border-t border-border">
                        <div className="flex items-start gap-3 flex-1">
                          <Volume2 className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold mb-1">Background Denoising Enabled</h4>
                            <p className="text-xs text-muted-foreground">
                              Filter background noise while the user is talking.
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={backgroundDenoising}
                          onCheckedChange={setBackgroundDenoising}
                        />
                      </div>

                      {/* Confidence Threshold */}
                      <div className="pt-4 border-t border-border">
                        <div className="flex items-start gap-3 mb-4">
                          <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold mb-1">Confidence Threshold</h4>
                            <p className="text-xs text-muted-foreground">
                              Transcripts with a confidence score below this threshold will be filtered out.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={confidenceThreshold}
                            onValueChange={setConfidenceThreshold}
                            min={0}
                            max={1}
                            step={0.1}
                            className="flex-1"
                          />
                          <div className="w-16 px-3 py-1.5 bg-secondary/50 rounded-md border border-border text-sm font-medium text-center">
                            {confidenceThreshold[0].toFixed(1)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                          <span>0</span>
                          <span>1.0</span>
                        </div>
                      </div>

                      {/* Keyterms */}
                      <div className="pt-4 border-t border-border">
                        <div className="flex items-start gap-3 mb-4">
                          <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold mb-1">Keyterms</h4>
                          </div>
                        </div>
                        <Textarea
                          value={keyterms}
                          onChange={(e) => setKeyterms(e.target.value)}
                          placeholder="Enter keywords separated by commas. These will be used as key terms for transcription."
                          className="bg-secondary/50 border-border min-h-[100px]"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          ~{Math.ceil(keyterms.length / 4)} tokens
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter keywords separated by commas. These will be used as key terms for transcription.
                        </p>
                      </div>

                      {/* End of turn confidence threshold */}
                      <div className="pt-4 border-t border-border">
                        <div className="flex items-start gap-3 mb-4">
                          <Target className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold mb-1">End of turn confidence threshold</h4>
                            <p className="text-xs text-muted-foreground">
                              Confidence threshold required to finish a turn.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={endOfTurnConfidence}
                            onValueChange={setEndOfTurnConfidence}
                            min={0.5}
                            max={0.9}
                            step={0.1}
                            className="flex-1"
                          />
                          <div className="w-16 px-3 py-1.5 bg-secondary/50 rounded-md border border-border text-sm font-medium text-center">
                            {endOfTurnConfidence[0].toFixed(1)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                          <span>0.5</span>
                          <span>0.9</span>
                        </div>
                      </div>

                      {/* End of turn timeout */}
                      <div className="pt-4 border-t border-border">
                        <div className="flex items-start gap-3 mb-4">
                          <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold mb-1">End of turn timeout</h4>
                            <p className="text-xs text-muted-foreground">
                              Maximum time to wait after speech before finishing a turn.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={endOfTurnTimeout}
                            onValueChange={setEndOfTurnTimeout}
                            min={500}
                            max={10000}
                            step={100}
                            className="flex-1"
                          />
                          <div className="w-20 px-3 py-1.5 bg-secondary/50 rounded-md border border-border text-sm font-medium text-center">
                            {endOfTurnTimeout[0] >= 1000 ? `${(endOfTurnTimeout[0] / 1000).toFixed(1)}s` : `${endOfTurnTimeout[0]}ms`}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                          <span>500ms</span>
                          <span>10s</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === "advanced" ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Cost & Latency Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="bg-card border border-border rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-sm text-muted-foreground">Cost</span>
                    <span className="text-base md:text-lg font-semibold">~$0.14 <span className="text-xs md:text-sm text-muted-foreground font-normal">/min</span></span>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-2 flex-1 rounded-full bg-success" />
                    <div className="h-2 w-8 rounded-full bg-warning" />
                    <div className="h-2 flex-1 rounded-full bg-destructive/60" />
                    <div className="h-2 flex-1 rounded-full bg-muted" />
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-sm text-muted-foreground">Latency</span>
                    <span className="text-base md:text-lg font-semibold">~1050 <span className="text-xs md:text-sm text-muted-foreground font-normal">ms</span></span>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-2 flex-1 rounded-full bg-success" />
                    <div className="h-2 flex-1 rounded-full bg-primary" />
                    <div className="h-2 flex-1 rounded-full bg-warning" />
                    <div className="h-2 w-12 rounded-full bg-destructive/60" />
                  </div>
                </div>
              </div>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 md:mb-8">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Cost</span>
                  <span className="text-lg font-semibold">~$0.14 <span className="text-sm text-muted-foreground font-normal">/min</span></span>
                </div>
                <div className="flex gap-1">
                  <div className="h-2 flex-1 rounded-full bg-success" />
                  <div className="h-2 w-8 rounded-full bg-warning" />
                  <div className="h-2 flex-1 rounded-full bg-destructive/60" />
                  <div className="h-2 flex-1 rounded-full bg-muted" />
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Latency</span>
                  <span className="text-lg font-semibold">~1050 <span className="text-sm text-muted-foreground font-normal">ms</span></span>
                </div>
                <div className="flex gap-1">
                  <div className="h-2 flex-1 rounded-full bg-success" />
                  <div className="h-2 flex-1 rounded-full bg-primary" />
                  <div className="h-2 flex-1 rounded-full bg-warning" />
                  <div className="h-2 w-12 rounded-full bg-destructive/60" />
                </div>
              </div>
            </div>

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
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Provider</label>
                    <Select value={selectedProvider} onValueChange={(value) => {
                      setSelectedProvider(value);
                      // Reset to first model of new provider
                      const models = modelsByProvider[value];
                      if (models && models.length > 0) {
                        setSelectedModel(models[0].value);
                      }
                    }}>
                      <SelectTrigger className="bg-secondary/50 border-border">
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
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-sm text-muted-foreground">Model</label>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="bg-secondary/50 border-border">
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
                    <label className="text-sm text-muted-foreground mb-2 block">System Prompt</label>
                    <Textarea
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder="Enter the system prompt for the assistant..."
                      className="bg-secondary/50 border-border min-h-[150px] font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Files</label>
                    <div className="space-y-3">
                      {attachedFiles.length > 0 && (
                        <div className="space-y-2">
                          {attachedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md border border-border"
                            >
                              <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm flex-1 truncate">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(1)} KB
                              </span>
                              <button
                                onClick={() => setAttachedFiles(attachedFiles.filter((_, i) => i !== index))}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
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
                        onChange={(e) => {
                          if (e.target.files) {
                            const newFiles = Array.from(e.target.files);
                            setAttachedFiles([...attachedFiles, ...newFiles]);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-sm text-muted-foreground">First Message Mode</label>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <Select value={firstMessageMode} onValueChange={setFirstMessageMode}>
                      <SelectTrigger className="bg-secondary/50 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assistant-speaks-first">Assistant speaks first</SelectItem>
                        <SelectItem value="assistant-waits-for-user">Assistant waits for user</SelectItem>
                        <SelectItem value="assistant-speaks-first-model-generated">Assistant speaks first with model generated message</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">First Message</label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-md border border-border">
                      <span className="text-sm">Hi there, this is {selectedAssistant.name} from TechSolutions customer su...</span>
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
                  selectedAssistant={selectedAssistant}
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
                selectedAssistant={selectedAssistant}
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
  selectedAssistant: typeof assistants[0];
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
}) => (
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
            if (e.key === "Enter" && chatInput.trim() && !isMuted) {
              setChatMessages([
                ...chatMessages,
                {
                  role: "user",
                  content: chatInput,
                  timestamp: new Date(),
                },
              ]);
              setChatInput("");
              // Simulate assistant response
              setTimeout(() => {
                setChatMessages((prev) => [
                  ...prev,
                  {
                    role: "assistant",
                    content: "Thank you for your response. How can I help you further?",
                    timestamp: new Date(),
                  },
                ]);
              }, 1000);
            }
          }}
          className={cn(
            "flex-1 bg-secondary/50 text-sm",
            isMuted && "opacity-50"
          )}
          disabled={!callInProgress || isMuted}
        />
        <Button
          size="icon"
          onClick={() => {
            if (chatInput.trim()) {
              setChatMessages([
                ...chatMessages,
                {
                  role: "user",
                  content: chatInput,
                  timestamp: new Date(),
                },
              ]);
              setChatInput("");
              // Simulate assistant response
              setTimeout(() => {
                setChatMessages((prev) => [
                  ...prev,
                  {
                    role: "assistant",
                    content: "Thank you for your response. How can I help you further?",
                    timestamp: new Date(),
                  },
                ]);
              }, 1000);
            }
          }}
          disabled={!callInProgress || !chatInput.trim() || isMuted}
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
