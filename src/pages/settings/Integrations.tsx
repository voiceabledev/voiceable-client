import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link2, Search, ChevronDown, ArrowLeft, ThumbsUp, Brain, Mic, CalendarDays, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type IntegrationStatus = 'available' | 'upcoming';

interface IntegrationProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  status: IntegrationStatus;
  order: number; // For sorting - lower numbers appear first
}

const modelProviders: IntegrationProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    description: "State-of-the-art GPT and o-series models.",
    icon: "🤖",
    iconBg: "bg-zinc-800",
    status: "available",
    order: 1
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude series models focused on safe, helpful AI.",
    icon: "🧠",
    iconBg: "bg-zinc-800",
    status: "available",
    order: 2
  },
  {
    id: "google",
    name: "Google",
    description: "Gemini series models for rich AI understanding.",
    icon: "💎",
    iconBg: "bg-blue-600",
    status: "available",
    order: 3
  },
  {
    id: "azure-openai",
    name: "Azure OpenAI",
    description: "Azure-hosted OpenAI models with enterprise governance.",
    icon: "A",
    iconBg: "bg-blue-600",
    status: "upcoming",
    order: 5
  },
  {
    id: "inflection",
    name: "Inflection AI",
    description: "Inflection conversational models tuned for empathetic dialogue.",
    icon: "π",
    iconBg: "bg-green-600",
    status: "upcoming",
    order: 6
  },
  {
    id: "cerebras",
    name: "Cerebras",
    description: "High performance inference platform.",
    icon: "C",
    iconBg: "bg-zinc-800",
    status: "available",
    order: 4
  },
  {
    id: "xai",
    name: "xAI",
    description: "Grok series models with real-time knowledge access.",
    icon: "X",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 7
  },
  {
    id: "mistral",
    name: "Mistral",
    description: "Mistral family of efficient open-source models.",
    icon: "M",
    iconBg: "bg-orange-600",
    status: "upcoming",
    order: 8
  },
  {
    id: "together",
    name: "Together AI",
    description: "Hosted open-source LLMs served through Together AI.",
    icon: "🔷",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 9
  },
  {
    id: "anyscale",
    name: "Anyscale",
    description: "Anyscale platform for scalable open-source LLM hosting.",
    icon: "⬡",
    iconBg: "bg-blue-600",
    status: "upcoming",
    order: 10
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Unified API to many community LLMs via OpenRouter.",
    icon: "→",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 11
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    description: "Perplexity AI models tuned for accurate responses.",
    icon: "⭐",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 12
  }
];

const transcriberProviders: IntegrationProvider[] = [
  {
    id: "deepgram-transcriber",
    name: "Deepgram",
    description: "Real-time speech recognition with low latency for production use.",
    icon: "D",
    iconBg: "bg-zinc-800",
    status: "available",
    order: 1
  },
  {
    id: "assemblyai",
    name: "AssemblyAI",
    description: "Advanced speech recognition with speaker diarization and analysis.",
    icon: "A",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 3
  },
  {
    id: "elevenlabs-transcriber",
    name: "ElevenLabs",
    description: "High-accuracy speech-to-text transcription service.",
    icon: "⫾",
    iconBg: "bg-zinc-800",
    status: "available",
    order: 2
  },
  {
    id: "azure-transcriber",
    name: "Azure Speech",
    description: "Azure Speech Services for high-quality transcription.",
    icon: "A",
    iconBg: "bg-red-600",
    status: "upcoming",
    order: 4
  },
  {
    id: "gladia",
    name: "Gladia",
    description: "Accurate speech-to-text API with multilingual support.",
    icon: "❄️",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 5
  },
  {
    id: "speechmatics",
    name: "Speechmatics",
    description: "Enterprise-grade speech recognition with custom vocabulary.",
    icon: "🎯",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 6
  }
];

const voiceProviders: IntegrationProvider[] = [
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description: "AI voice cloning and generation with natural speech synthesis.",
    icon: "⫾",
    iconBg: "bg-zinc-800",
    status: "available",
    order: 1
  },
  {
    id: "deepgram",
    name: "Deepgram",
    description: "Real-time speech recognition with low latency for production use.",
    icon: "D",
    iconBg: "bg-zinc-800",
    status: "available",
    order: 2
  },
  {
    id: "cartesia",
    name: "Cartesia",
    description: "Lightning-fast text-to-speech with ultra-low latency.",
    icon: "▣",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 3
  },
  {
    id: "azure",
    name: "Azure Speech",
    description: "Enterprise text-to-speech and speech-to-text by Microsoft.",
    icon: "A",
    iconBg: "bg-red-600",
    status: "upcoming",
    order: 4
  },
  {
    id: "inworld",
    name: "Inworld",
    description: "AI voices designed for interactive character experiences.",
    icon: "⬡",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 5
  },
  {
    id: "rimeai",
    name: "RimeAI",
    description: "Realistic text-to-speech with emotional voice control.",
    icon: "⚏",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 6
  },
  {
    id: "smallestai",
    name: "SmallestAI",
    description: "Ultra-fast, low-latency voice synthesis for real-time applications.",
    icon: "⬢",
    iconBg: "bg-green-600",
    status: "upcoming",
    order: 7
  },
  {
    id: "neuphonic",
    name: "Neuphonic",
    description: "Natural-sounding text-to-speech with emotional AI.",
    icon: "ω",
    iconBg: "bg-orange-500",
    status: "upcoming",
    order: 8
  },
  {
    id: "hume",
    name: "Hume",
    description: "Emotionally intelligent AI voices with expressive speech.",
    icon: "⬢",
    iconBg: "bg-purple-600",
    status: "upcoming",
    order: 9
  },
  {
    id: "lmnt",
    name: "LMNT",
    description: "Real-time AI voice synthesis optimized for conversational AI.",
    icon: "◐",
    iconBg: "bg-yellow-500",
    status: "upcoming",
    order: 10
  },
  {
    id: "minimax",
    name: "Minimax",
    description: "Advanced text-to-speech with multilingual voice support.",
    icon: "⟁",
    iconBg: "bg-zinc-800",
    status: "upcoming",
    order: 11
  }
];

const crmProviders: IntegrationProvider[] = [
  {
    id: "hubspot",
    name: "HubSpot CRM",
    description: "Sync contact, deal, and ticket data powered by HubSpot.",
    icon: "HS",
    iconBg: "bg-blue-600",
    status: "upcoming",
    order: 1
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Push and pull records directly from Salesforce Sales Cloud.",
    icon: "SF",
    iconBg: "bg-sky-500",
    status: "upcoming",
    order: 2
  },
  {
    id: "pipedrive",
    name: "Pipedrive",
    description: "Keep leads and pipelines in sync with Pipedrive CRM.",
    icon: "PD",
    iconBg: "bg-emerald-600",
    status: "available",
    order: 3
  },
  {
    id: "kommo",
    name: "Kommo",
    description: "Messenger-based sales CRM with WhatsApp, Instagram, and more channels.",
    icon: "K",
    iconBg: "bg-purple-600",
    status: "upcoming",
    order: 4
  },
  {
    id: "gohighlevel",
    name: "GoHighLevel",
    description: "CRM and sales automation platform for small businesses.",
    icon: "GH",
    iconBg: "bg-green-600",
    status: "upcoming",
    order: 5
  }
];

const schedulingProviders: IntegrationProvider[] = [
  {
    id: "google_calendar",
    name: "Google Calendar",
    description: "Overlay availability and events from Google Calendar.",
    icon: "📅",
    iconBg: "bg-blue-500",
    status: "upcoming",
    order: 1
  },
  {
    id: "outlook_calendar",
    name: "Outlook Calendar",
    description: "Integrate Microsoft Outlook calendars for scheduling.",
    icon: "🗓️",
    iconBg: "bg-sky-700",
    status: "upcoming",
    order: 2
  },
  {
    id: "calendly",
    name: "Calendly",
    description: "Bring Calendly booking links into your assistant workflows.",
    icon: "C",
    iconBg: "bg-orange-500",
    status: "upcoming",
    order: 3
  }
  ,
  {
    id: "calcom",
    name: "Cal.com",
    description: "Use Cal.com event links to manage availability across calendars.",
    icon: "Cal",
    iconBg: "bg-purple-600",
    status: "available",
    order: 4
  }
];

export default function Integrations() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModelProvidersOpen, setIsModelProvidersOpen] = useState(true);
  const [isTranscriberProvidersOpen, setIsTranscriberProvidersOpen] = useState(true);
  const [isVoiceProvidersOpen, setIsVoiceProvidersOpen] = useState(true);
  const [isCrmProvidersOpen, setIsCrmProvidersOpen] = useState(true);
  const [isSchedulingProvidersOpen, setIsSchedulingProvidersOpen] = useState(true);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());

  // Load votes from localStorage on mount
  useEffect(() => {
    const savedVotes = localStorage.getItem('integration_votes');
    const savedUserVotes = localStorage.getItem('integration_user_votes');
    
    if (savedVotes) {
      try {
        setVotes(JSON.parse(savedVotes));
      } catch (e) {
        console.error('Error loading votes:', e);
      }
    }
    
    if (savedUserVotes) {
      try {
        setUserVotes(new Set(JSON.parse(savedUserVotes)));
      } catch (e) {
        console.error('Error loading user votes:', e);
      }
    }
  }, []);

  // Helper function to sort providers: available first (by order), then upcoming (by order)
  const sortProviders = (providers: IntegrationProvider[]) => {
    return [...providers].sort((a, b) => {
      if (a.status === 'available' && b.status === 'upcoming') return -1;
      if (a.status === 'upcoming' && b.status === 'available') return 1;
      return a.order - b.order;
    });
  };

  // Helper function to filter providers
  const filterProviders = (providers: IntegrationProvider[]) => {
    return providers.filter(provider =>
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredModelProviders = filterProviders(sortProviders(modelProviders));
  const filteredTranscriberProviders = filterProviders(sortProviders(transcriberProviders));
  const filteredVoiceProviders = filterProviders(sortProviders(voiceProviders));
  const filteredCrmProviders = filterProviders(sortProviders(crmProviders));
  const filteredSchedulingProviders = filterProviders(sortProviders(schedulingProviders));

  const handleVote = (providerId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking vote button
    
    if (userVotes.has(providerId)) {
      toast({
        title: 'Already voted',
        description: 'You have already voted for this integration.',
        variant: 'default',
      });
      return;
    }

    const newVotes = { ...votes };
    newVotes[providerId] = (newVotes[providerId] || 0) + 1;
    setVotes(newVotes);
    setUserVotes(new Set([...userVotes, providerId]));

    // Save to localStorage
    localStorage.setItem('integration_votes', JSON.stringify(newVotes));
    localStorage.setItem('integration_user_votes', JSON.stringify([...userVotes, providerId]));

    toast({
      title: 'Vote recorded',
      description: 'Thank you for your feedback! We\'ll prioritize integrations with the most votes.',
    });
  };

  // Helper function to render a provider section
  const renderProviderSection = (
    title: string,
    icon: React.ReactNode,
    isOpen: boolean,
    setIsOpen: (open: boolean) => void,
    providers: IntegrationProvider[]
  ) => {
    if (providers.length === 0 && searchQuery) {
      return null; // Don't show empty sections when searching
    }

    return (
      <div className="mb-4 md:mb-6" key={title}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-muted-foreground text-xs md:text-sm mb-3 md:mb-4 hover:text-foreground"
        >
          {icon}
          <span className="font-medium">{title}</span>
          <ChevronDown className={cn(
            "h-3.5 w-3.5 md:h-4 md:w-4 transition-transform",
            !isOpen && "-rotate-90"
          )} />
        </button>

        {isOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {providers.map((provider) => {
              const voteCount = votes[provider.id] || 0;
              const hasVoted = userVotes.has(provider.id);
              const isAvailable = provider.status === 'available';

              return (
                <div
                  key={provider.id}
                  className={cn(
                    "flex flex-col p-3 md:p-4 rounded-lg border border-border bg-card transition-colors",
                    isAvailable ? "hover:bg-secondary/30 cursor-pointer" : "opacity-75"
                  )}
                >
                  <button
                    onClick={() => {
                      if (isAvailable) {
                        navigate(`/settings/integrations/${provider.id}`);
                      }
                    }}
                    className="flex flex-col items-start text-left w-full"
                    disabled={!isAvailable}
                  >
                    <div className="flex items-start justify-between w-full mb-2 md:mb-3">
                      <div className={cn(
                        "w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-white font-bold text-base md:text-lg",
                        provider.iconBg
                      )}>
                        {provider.icon}
                      </div>
                      <div className="flex items-center gap-2">
                        {voteCount > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                            <ThumbsUp className="h-3 w-3" />
                            <span className="font-medium">{voteCount}</span>
                          </div>
                        )}
                        {!isAvailable && (
                          <Badge variant="outline" className="text-xs bg-muted/50">
                            Soon
                          </Badge>
                        )}
                      </div>
                    </div>
                    <h3 className="font-medium mb-1 text-sm md:text-base">{provider.name}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-2">
                      {provider.description}
                    </p>
                  </button>
                  
                  {!isAvailable && (
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        {voteCount > 0 ? (
                          <span className="font-medium">{voteCount} {voteCount === 1 ? 'person wants' : 'people want'} this</span>
                        ) : (
                          <span>Be the first to vote!</span>
                        )}
                      </span>
                      <button
                        onClick={(e) => handleVote(provider.id, e)}
                        disabled={hasVoted}
                        className={cn(
                          "flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors",
                          hasVoted 
                            ? "bg-secondary/50 text-muted-foreground cursor-not-allowed" 
                            : "bg-primary/10 text-primary hover:bg-primary/20"
                        )}
                        title={hasVoted ? 'You already voted for this' : 'Vote for this integration'}
                      >
                        <ThumbsUp className={cn(
                          "h-3.5 w-3.5",
                          hasVoted && "fill-current"
                        )} />
                        <span>{hasVoted ? 'Voted' : 'Vote'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Link2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <h1 className="text-lg md:text-xl font-semibold">Integrations</h1>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-secondary/50 pr-9 h-9 md:h-10 text-xs md:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 md:p-6 pr-4 md:pr-6">
          {/* Model Providers Section */}
          
          {/* {renderProviderSection(
            "Model Providers",
            <Brain className="h-4 w-4" />,
            isModelProvidersOpen,
            setIsModelProvidersOpen,
            filteredModelProviders
          )} */}

          {/* Transcriber Providers Section */}
          {/* {renderProviderSection(
            "Transcriber Providers",
            <Mic className="h-4 w-4" />,
            isTranscriberProvidersOpen,
            setIsTranscriberProvidersOpen,
            filteredTranscriberProviders
          )} */}

          {/* Voice Providers Section */}
          {/* {renderProviderSection(
            "Voice Providers",
            <span className="text-base md:text-lg">🎙️</span>,
            isVoiceProvidersOpen,
            setIsVoiceProvidersOpen,
            filteredVoiceProviders
          )} */}

          {/* CRM Providers Section */}
          {renderProviderSection(
            "CRM Providers",
            <Users className="h-4 w-4" />,
            isCrmProvidersOpen,
            setIsCrmProvidersOpen,
            filteredCrmProviders
          )}

          {/* Scheduling Providers Section */}
          {renderProviderSection(
            "Scheduling Providers",
            <CalendarDays className="h-4 w-4" />,
            isSchedulingProvidersOpen,
            setIsSchedulingProvidersOpen,
            filteredSchedulingProviders
          )}
        </div>
      </div>
    </div>
  );
}
