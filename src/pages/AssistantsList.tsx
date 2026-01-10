import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Loader2,
  Bot,
  ArrowUp
} from "lucide-react";
import { IconType } from "react-icons";
import { 
  FiHeadphones, 
  FiTrendingUp, 
  FiPhone, 
  FiCalendar, 
  FiPackage, 
  FiSettings 
} from "react-icons/fi";
import { agentsApi, Agent, voicesApi, Voice } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { generateSectionEntryId } from "@/utils/assistantHelpers";
import {
  animate,
  useMotionTemplate,
  useMotionValue,
  motion,
} from "framer-motion";
import type { Transition } from "framer-motion";
import { FiArrowRight, FiEye, FiWatch } from "react-icons/fi";

// Template-related code moved to wizard

// Background Grid and Beams for textfield
const GRID_BOX_SIZE = 32;
const BEAM_WIDTH_OFFSET = 1;

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<{ width: number | undefined; height: number | undefined }>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return windowSize;
};

const BGGrid = () => {
  return (
    <div
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke-width='2' stroke='rgb(148 163 184 / 0.3)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
      }}
      className="absolute bottom-0 left-0 right-0 top-0 pointer-events-none"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-50/80 via-neutral-50/0 to-neutral-50/80" />
      <Beams />
    </div>
  );
};

const Beams = () => {
  const { width } = useWindowSize();
  const numColumns = width ? Math.floor(width / GRID_BOX_SIZE) : 0;

  const placements = [
    {
      top: GRID_BOX_SIZE * 0,
      left: Math.floor(numColumns * 0.05) * GRID_BOX_SIZE,
      transition: {
        duration: 3.5,
        repeatDelay: 5,
        delay: 2,
      },
    },
    {
      top: GRID_BOX_SIZE * 12,
      left: Math.floor(numColumns * 0.15) * GRID_BOX_SIZE,
      transition: {
        duration: 3.5,
        repeatDelay: 10,
        delay: 4,
      },
    },
    {
      top: GRID_BOX_SIZE * 3,
      left: Math.floor(numColumns * 0.25) * GRID_BOX_SIZE,
    },
    {
      top: GRID_BOX_SIZE * 9,
      left: Math.floor(numColumns * 0.75) * GRID_BOX_SIZE,
      transition: {
        duration: 2,
        repeatDelay: 7.5,
        delay: 3.5,
      },
    },
    {
      top: 0,
      left: Math.floor(numColumns * 0.7) * GRID_BOX_SIZE,
      transition: {
        duration: 3,
        repeatDelay: 2,
        delay: 1,
      },
    },
    {
      top: GRID_BOX_SIZE * 2,
      left: Math.floor(numColumns * 1) * GRID_BOX_SIZE - GRID_BOX_SIZE,
      transition: {
        duration: 5,
        repeatDelay: 5,
        delay: 5,
      },
    },
  ];

  return (
    <>
      {placements.map((p, i) => (
        <Beam
          key={i}
          top={p.top}
          left={p.left - BEAM_WIDTH_OFFSET}
          transition={p.transition || {}}
        />
      ))}
    </>
  );
};

const Beam = ({
  top,
  left,
  transition = {},
}: {
  top: number;
  left: number;
  transition?: Transition;
}) => {
  return (
    <motion.div
      initial={{
        y: 0,
        opacity: 0,
      }}
      animate={{
        opacity: [0, 1, 0],
        y: 32 * 8,
      }}
      transition={{
        ease: "easeInOut",
        duration: 3,
        repeat: Infinity,
        repeatDelay: 1.5,
        ...transition,
      }}
      style={{
        top,
        left,
      }}
      className="absolute z-10 h-[64px] w-[1px] bg-gradient-to-b from-primary/0 to-primary/30"
    />
  );
};

const SUGGESTED_BEHAVIORS = [
  { label: "Customer Support", icon: FiHeadphones, prompt: "Create a customer support agent that can handle inquiries, troubleshoot issues, and escalate complex problems to human agents." },
  { label: "Lead Generation", icon: FiTrendingUp, prompt: "Build a lead generation agent that qualifies prospects, collects contact information, and schedules follow-up meetings." },
  { label: "Sales Calls", icon: FiPhone, prompt: "Design a sales agent that presents products, answers questions, handles objections, and closes deals over the phone." },
  { label: "Appointment Booking", icon: FiCalendar, prompt: "Create an appointment booking agent that checks availability, schedules meetings, sends confirmations, and handles rescheduling." },
  { label: "Product Information", icon: FiPackage, prompt: "Build a product information agent that provides detailed product specs, pricing, availability, and recommendations." },
  { label: "Technical Support", icon: FiSettings, prompt: "Design a technical support agent that troubleshoots issues, provides step-by-step solutions, and escalates when needed." },
];

export default function AssistantsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [assistants, setAssistants] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [voiceNameMap, setVoiceNameMap] = useState<Record<string, string>>({});
  const [prompt, setPrompt] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await agentsApi.list();
      
      if (response.data && Array.isArray(response.data)) {
        setAssistants(response.data);
      } else {
        setAssistants([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch agents';
      setAssistants([]);
      toast({
        title: 'Error loading agents',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchVoices = useCallback(async () => {
    try {
      const response = await voicesApi.list();
      if (response.data && Array.isArray(response.data)) {
        const map: Record<string, string> = {};
        response.data.forEach((voice: Voice) => {
          map[voice.id] = voice.name;
        });
        setVoiceNameMap(map);
      }
    } catch (err) {
      // Silently fail - voice names are not critical for the list view
      console.error('Failed to fetch voices:', err);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
    fetchVoices();
  }, [fetchAgents, fetchVoices]);

  const filteredAssistants = assistants.filter((assistant) =>
    (assistant.name || 'Unnamed Agent').toLowerCase().includes(searchQuery.toLowerCase()) ||
    assistant.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assistant.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAssistantClick = (assistant: Agent) => {
    const identifier = assistant.slug || assistant.id;
    navigate(`/assistants/${identifier}`);
  };

  const handleCreateAssistant = () => {
    // Navigate directly to wizard instead of showing modal
    navigate("/assistants/create", {
      state: {
        templateId: null,
        assistantName: "New Assistant",
      }
    });
  };

  const handleCreateFromPrompt = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isCreating) return;

    // Extract name from prompt (first few words or default)
    const promptWords = prompt.trim().split(/\s+/);
    const assistantName = promptWords.slice(0, 4).join(" ") || "New Assistant";

    // Navigate to wizard at step 1 (second step) with the prompt data
    navigate("/assistants/create?step=1", {
      state: {
        assistantName: assistantName,
        systemPrompt: prompt.trim(),
        skipNameStep: true,
      }
    });
  };

  const handleSuggestedClick = (suggestedPrompt: string) => {
    setPrompt(suggestedPrompt);
  };

  // Corners Component for card hover effect
  const Corners = () => (
    <>
      <span className="absolute left-[1px] top-[1px] z-10 h-3 w-[1px] origin-top scale-0 bg-emerald-300 transition-all duration-500 group-hover:scale-100" />
      <span className="absolute left-[1px] top-[1px] z-10 h-[1px] w-3 origin-left scale-0 bg-emerald-300 transition-all duration-500 group-hover:scale-100" />
      <span className="absolute bottom-[1px] right-[1px] z-10 h-3 w-[1px] origin-bottom scale-0 bg-emerald-300 transition-all duration-500 group-hover:scale-100" />
      <span className="absolute bottom-[1px] right-[1px] z-10 h-[1px] w-3 origin-right scale-0 bg-emerald-300 transition-all duration-500 group-hover:scale-100" />
      <span className="absolute bottom-[1px] left-[1px] z-10 h-3 w-[1px] origin-bottom scale-0 bg-emerald-300 transition-all duration-500 group-hover:scale-100" />
      <span className="absolute bottom-[1px] left-[1px] z-10 h-[1px] w-3 origin-left scale-0 bg-emerald-300 transition-all duration-500 group-hover:scale-100" />
      <span className="absolute right-[1px] top-[1px] z-10 h-3 w-[1px] origin-top scale-0 bg-emerald-300 transition-all duration-500 group-hover:scale-100" />
      <span className="absolute right-[1px] top-[1px] z-10 h-[1px] w-3 origin-right scale-0 bg-emerald-300 transition-all duration-500 group-hover:scale-100" />
    </>
  );

  // Assistant Card Component
  interface AssistantCardProps {
    assistant: Agent;
    voiceNameMap: Record<string, string>;
    gradientClass: string;
    onEdit: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
    onClick: () => void;
  }

  const AssistantCard = ({ assistant, voiceNameMap, gradientClass, onEdit, onDelete, onClick }: AssistantCardProps) => {
    const config = assistant.conversation_config as Record<string, unknown> | undefined;
    const platformSettings = assistant.platform_settings as Record<string, unknown> | undefined;
    
    // Extract model info
    let modelInfo = "N/A";
    if (config?.model && typeof config.model === 'object') {
      const modelConfig = config.model as Record<string, unknown>;
      if (typeof modelConfig.model === 'string') {
        modelInfo = modelConfig.model;
      }
    }
    
    // Extract transcriber info
    let transcriberInfo = "N/A";
    if (config?.transcriber && typeof config.transcriber === 'object') {
      const transcriberConfig = config.transcriber as Record<string, unknown>;
      if (typeof transcriberConfig.language === 'string') {
        const language = transcriberConfig.language;
        const capitalizedLanguage = language.charAt(0).toUpperCase() + language.slice(1);
        transcriberInfo = capitalizedLanguage;
      } else if (typeof transcriberConfig.provider === 'string') {
        transcriberInfo = transcriberConfig.provider;
      }
    }
    
    // Extract voice info
    let voiceInfo = "N/A";
    let voiceId: string | undefined;
    let hasNameFromConfig = false;
    
    if (config?.voice_id && typeof config.voice_id === 'string') {
      voiceId = config.voice_id;
    } else if (config?.voice && typeof config.voice === 'object') {
      const voiceConfig = config.voice as Record<string, unknown>;
      if (typeof voiceConfig.voice_id === 'string') {
        voiceId = voiceConfig.voice_id;
      }
      if (typeof voiceConfig.name === 'string') {
        voiceInfo = voiceConfig.name;
        hasNameFromConfig = true;
      }
    } else if (platformSettings?.voice_id && typeof platformSettings.voice_id === 'string') {
      voiceId = platformSettings.voice_id;
    }
    
    if (voiceId && !hasNameFromConfig) {
      voiceInfo = voiceNameMap[voiceId] || voiceId.slice(0, 15) + '...';
    }

    const tags = assistant.tags && assistant.tags.length > 0 ? assistant.tags.join(" · ") : null;

    return (
      <div
        onClick={onClick}
        className="group relative flex h-48 sm:h-56 md:h-72 lg:h-80 flex-col justify-end overflow-hidden p-4 sm:p-6 md:p-8 lg:p-9 transition-colors hover:bg-neutral-600 cursor-pointer"
      >
        <div className="absolute left-3 top-5 z-10 flex items-center gap-1.5 text-xs sm:text-sm uppercase text-neutral-400 transition-colors duration-500 group-hover:text-neutral-50">
          <FiWatch className="text-sm sm:text-base" />
          <span>{modelInfo}</span>
        </div>
        
        <h2 className="relative z-10 text-xl sm:text-2xl md:text-3xl leading-tight text-neutral-50 transition-transform duration-500 group-hover:-translate-y-3 line-clamp-2">
          {assistant.name || 'Unnamed Agent'}
        </h2>

        {tags && (
          <p className="relative z-10 text-xs sm:text-sm text-neutral-400 mt-2 transition-colors duration-500 group-hover:text-neutral-300 line-clamp-1">
            {tags}
          </p>
        )}

        <div className="absolute right-3 top-4 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:h-8 sm:w-8 text-neutral-400 hover:text-neutral-50"
            onClick={onEdit}
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:h-8 sm:w-8 text-neutral-400 hover:text-destructive"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <FiEye className="absolute right-3 top-4 z-10 text-2xl text-neutral-400 transition-colors group-hover:text-neutral-50 group-hover:opacity-0" />

        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 top-0 opacity-0 blur-sm grayscale transition-all group-hover:opacity-10 group-active:scale-105 group-active:opacity-30 group-active:blur-0 group-active:grayscale-0 bg-gradient-to-br",
            gradientClass
          )}
        />

        <Corners />
      </div>
    );
  };

  // Behavior Card Component
  interface BehaviorCardProps {
    title: string;
    subtitle: string;
    Icon: IconType;
    onClick: () => void;
    disabled?: boolean;
  }

  const BehaviorCard = ({ title, subtitle, Icon, onClick, disabled }: BehaviorCardProps) => {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="w-full p-4 rounded border-[1px] border-border relative overflow-hidden group bg-card hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300" />

        <Icon className="absolute z-10 -top-12 -right-12 text-9xl text-muted-foreground/20 group-hover:text-primary-foreground/20 group-hover:rotate-12 transition-transform duration-300" />
        <Icon className="mb-2 text-2xl text-primary group-hover:text-primary-foreground transition-colors relative z-10 duration-300" />
        <h3 className="font-medium text-lg text-foreground group-hover:text-primary-foreground relative z-10 duration-300">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground group-hover:text-primary-foreground/80 relative z-10 duration-300 line-clamp-2 mt-1">
          {subtitle}
        </p>
      </button>
    );
  };

  // BeamInput component
  const BeamInput = () => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const turn = useMotionValue(0);

    useEffect(() => {
      animate(turn, 1, {
        ease: "linear",
        duration: 5,
        repeat: Infinity,
      });
    }, [turn]);

    // Auto-resize textarea
    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [prompt]);

    const backgroundImage = useMotionTemplate`conic-gradient(from ${turn}turn, hsl(var(--primary) / 0) 75%, hsl(var(--primary) / 0.8) 100%)`;

    return (
      <form
        onSubmit={handleCreateFromPrompt}
        onClick={() => {
          textareaRef.current?.focus();
        }}
        className={cn(
          "relative flex w-full gap-2 border-1 border-foreground/50 bg-gradient-to-br from-background/80 to-background/40 py-2 pl-6 pr-1.5 backdrop-blur-sm shadow-sm min-h-[3rem] transition-all",
          prompt && prompt.split('\n').length > 1 ? "items-start" : "items-center",
          prompt ? "rounded-2xl" : "rounded-full"
        )}
      >
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="How can I help? Describe your agent and I'll build it."
          className="w-full bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-0 resize-none overflow-hidden min-h-[1.5rem] max-h-32 leading-relaxed"
          disabled={isCreating}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleCreateFromPrompt(e);
            }
          }}
        />

        <button
          onClick={(e) => e.stopPropagation()}
          type="submit"
          disabled={!prompt.trim() || isCreating}
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full bg-[#2A66FF] size-8 sm:size-9 p-2 transition-all active:scale-[0.985] self-end mb-1",
            prompt.trim() 
              ? "opacity-100 hover:opacity-90" 
              : "opacity-50 hover:opacity-70",
            isCreating && "opacity-50 cursor-not-allowed"
          )}
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" aria-hidden="true" className="w-full h-full">
              <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <div className="pointer-events-none absolute inset-0 z-10 rounded-full">
          <motion.div
            style={{
              backgroundImage,
            }}
            className="mask-with-browser-support absolute -inset-[1px] rounded-full border border-transparent bg-origin-border"
          />
        </div>
      </form>
    );
  };

  // Template selection and modal logic removed - now handled in wizard

  const handleDeleteAssistant = async (assistant: Agent, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete "${assistant.name || 'this assistant'}"? This will delete the agent from both ElevenLabs and your local database.`)) {
      return;
    }

    try {
      const identifier = assistant.slug || assistant.id;
      await agentsApi.delete(identifier);
      toast({
        title: 'Success',
        description: 'Agent deleted successfully.',
      });
      // Refresh the list
      fetchAgents();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete agent',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">

      {/* Prompt Input Section - 70% of viewport height */}
      <div className="relative flex items-center justify-center min-h-[50vh] md:h-[70vh] p-4 sm:p-6 md:p-8 border-b border-border bg-neutral-50 overflow-hidden">
        <BGGrid />
        <div className="relative z-10 w-full max-w-6xl space-y-4">
          <BeamInput />

        <div className="space-y-3 mt-4 flex flex-col items-center justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 w-full">
            {SUGGESTED_BEHAVIORS.map((behavior, index) => (
              <BehaviorCard
                key={index}
                title={behavior.label}
                subtitle={behavior.prompt}
                Icon={behavior.icon}
                onClick={() => handleSuggestedClick(behavior.prompt)}
                disabled={isCreating}
              />
            ))}
          </div>
        </div>
        </div>
      </div>

      {/* Assistants List Section - starts at 70% of viewport */}
      <div className="p-4 sm:p-6 md:p-8 lg:p-12 bg-neutral-500 text-neutral-50">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-300 mb-4" />
            <p className="text-sm text-neutral-400">Loading agents...</p>
          </div>
        ) : filteredAssistants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            {searchQuery ? (
              // Search results empty state
              <>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-neutral-600 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 sm:h-8 sm:w-8 text-neutral-200" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-neutral-50">No assistants found</h3>
                <p className="text-sm text-neutral-200 mb-4">
                  Try adjusting your search query
                </p>
              </>
            ) : (
              // Simple empty state message
              <>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-neutral-600 flex items-center justify-center mb-4">
                  <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-neutral-200" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-neutral-50">No assistants yet</h3>
                <p className="text-sm text-neutral-200">
                  Create your first assistant using the prompt above
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            {(() => {
              // Group assistants into rows of 3
              const rows: Agent[][] = [];
              for (let i = 0; i < filteredAssistants.length; i += 3) {
                rows.push(filteredAssistants.slice(i, i + 3));
              }
              
              return rows.map((row, rowIndex) => {
                const isFirstRow = rowIndex === 0;
                const borderClasses = isFirstRow 
                  ? "border border-neutral-400" 
                  : "border-x border-b border-neutral-400";
                
                return (
                  <div 
                    key={rowIndex}
                    className={cn(
                      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y divide-neutral-400 sm:divide-x sm:divide-y-0",
                      borderClasses
                    )}
                  >
                    {row.map((assistant, cardIndex) => {
                      const config = assistant.conversation_config as Record<string, unknown> | undefined;
                      const platformSettings = assistant.platform_settings as Record<string, unknown> | undefined;
                      
                      // Extract voice info for background gradient
                      let voiceId: string | undefined;
                      if (config?.voice_id && typeof config.voice_id === 'string') {
                        voiceId = config.voice_id;
                      } else if (config?.voice && typeof config.voice === 'object') {
                        const voiceConfig = config.voice as Record<string, unknown>;
                        if (typeof voiceConfig.voice_id === 'string') {
                          voiceId = voiceConfig.voice_id;
                        }
                      } else if (platformSettings?.voice_id && typeof platformSettings.voice_id === 'string') {
                        voiceId = platformSettings.voice_id;
                      }
                      
                      // Create a gradient based on assistant ID for background
                      const gradientColors = [
                        'from-emerald-500/20 via-violet-500/20 to-rose-500/20',
                        'from-violet-500/20 via-rose-500/20 to-amber-500/20',
                        'from-rose-500/20 via-amber-500/20 to-emerald-500/20',
                      ];
                      const globalIndex = rowIndex * 3 + cardIndex;
                      const gradientIndex = globalIndex % gradientColors.length;
                      
                      return (
                        <AssistantCard
                          key={assistant.id}
                          assistant={assistant}
                          voiceNameMap={voiceNameMap}
                          gradientClass={gradientColors[gradientIndex]}
                          onEdit={(e) => {
                            e.stopPropagation();
                            handleAssistantClick(assistant);
                          }}
                          onDelete={(e) => handleDeleteAssistant(assistant, e)}
                          onClick={() => handleAssistantClick(assistant)}
                        />
                      );
                    })}
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>

      {/* Modal and confirmation dialogs removed - template selection now happens in wizard */}
    </div>
  );
}
