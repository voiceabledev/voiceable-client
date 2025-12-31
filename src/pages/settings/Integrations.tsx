import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link2, Search, ChevronDown, ArrowLeft, ThumbsUp, Brain, Mic, CalendarDays, Users, Phone, Headphones, Cloud, MessageSquare, ShoppingCart } from "lucide-react";
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

const telephonyProviders: IntegrationProvider[] = [
  {
    id: "twilio",
    name: "Twilio",
    description: "Programmable Voice and SMS for voice calls and messaging.",
    icon: "T",
    iconBg: "bg-red-600",
    status: "upcoming",
    order: 1
  },
  {
    id: "genesys",
    name: "Genesys",
    description: "Cloud-based contact center platform.",
    icon: "G",
    iconBg: "bg-blue-600",
    status: "upcoming",
    order: 2
  },
  {
    id: "amazon-connect",
    name: "Amazon Connect",
    description: "Cloud-based contact center service.",
    icon: "A",
    iconBg: "bg-orange-600",
    status: "upcoming",
    order: 3
  }
];

const customerSupportProviders: IntegrationProvider[] = [
  {
    id: "zendesk",
    name: "Zendesk",
    description: "Customer support platform for managing tickets and customer interactions.",
    icon: "Z",
    iconBg: "bg-green-600",
    status: "upcoming",
    order: 1
  }
];

const cloudStorageProviders: IntegrationProvider[] = [
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Connect your Google account and sync files from your Google Drive. Save files to your Drive.",
    icon: "G",
    iconBg: "bg-blue-500",
    status: "upcoming",
    order: 1
  },
  {
    id: "onedrive",
    name: "OneDrive",
    description: "Connect to your OneDrive account to access, create, and update files. Increase your team's productivity.",
    icon: "O",
    iconBg: "bg-sky-600",
    status: "upcoming",
    order: 2
  }
];

const communicationProviders: IntegrationProvider[] = [
  {
    id: "slack",
    name: "Slack",
    description: "Connect your Slack workspace to receive notifications and alerts. Stay connected to important activity.",
    icon: "S",
    iconBg: "bg-purple-600",
    status: "upcoming",
    order: 1
  }
];

const ecommerceProviders: IntegrationProvider[] = [
  {
    id: "shopify",
    name: "Shopify",
    description: "Connect your Shopify store and sync customers, orders, or products. Grow your business faster.",
    icon: "🛍️",
    iconBg: "bg-green-600",
    status: "upcoming",
    order: 1
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Connect your Stripe account and sync customers, payments, or products. Grow your business faster.",
    icon: "💳",
    iconBg: "bg-indigo-600",
    status: "upcoming",
    order: 2
  }
];

export default function Integrations() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModelProvidersOpen, setIsModelProvidersOpen] = useState(false);
  const [isTranscriberProvidersOpen, setIsTranscriberProvidersOpen] = useState(false);
  const [isVoiceProvidersOpen, setIsVoiceProvidersOpen] = useState(false);
  const [isCrmProvidersOpen, setIsCrmProvidersOpen] = useState(false);
  const [isSchedulingProvidersOpen, setIsSchedulingProvidersOpen] = useState(false);
  const [isTelephonyProvidersOpen, setIsTelephonyProvidersOpen] = useState(false);
  const [isCustomerSupportProvidersOpen, setIsCustomerSupportProvidersOpen] = useState(false);
  const [isCloudStorageProvidersOpen, setIsCloudStorageProvidersOpen] = useState(false);
  const [isCommunicationProvidersOpen, setIsCommunicationProvidersOpen] = useState(false);
  const [isEcommerceProvidersOpen, setIsEcommerceProvidersOpen] = useState(false);
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
  const filteredTelephonyProviders = filterProviders(sortProviders(telephonyProviders));
  const filteredCustomerSupportProviders = filterProviders(sortProviders(customerSupportProviders));
  const filteredCloudStorageProviders = filterProviders(sortProviders(cloudStorageProviders));
  const filteredCommunicationProviders = filterProviders(sortProviders(communicationProviders));
  const filteredEcommerceProviders = filterProviders(sortProviders(ecommerceProviders));

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
      <div className="mb-6 md:mb-8" key={title}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 text-foreground text-sm md:text-base mb-4 md:mb-5 hover:text-foreground transition-colors group w-full"
        >
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            {icon}
          </div>
          <span className="font-semibold">{title}</span>
          <span className="text-xs text-muted-foreground font-normal ml-auto">
            {providers.length} {providers.length === 1 ? 'integration' : 'integrations'}
          </span>
          <ChevronDown className={cn(
            "h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 ease-in-out text-muted-foreground",
            !isOpen && "-rotate-90"
          )} />
        </button>

        <div
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 overflow-hidden transition-all duration-500 ease-in-out",
            isOpen 
              ? "max-h-[5000px] opacity-100 translate-y-0 pointer-events-auto" 
              : "max-h-0 opacity-0 -translate-y-4 pointer-events-none"
          )}
          style={{
            transitionProperty: 'max-height, opacity, transform',
          }}
        >
            {providers.map((provider) => {
              const voteCount = votes[provider.id] || 0;
              const hasVoted = userVotes.has(provider.id);
              const isAvailable = provider.status === 'available';

              return (
                <div
                  key={provider.id}
                  className={cn(
                    "group flex flex-col p-4 md:p-5 rounded-xl border bg-card transition-all duration-200",
                    isAvailable 
                      ? "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer hover:-translate-y-0.5" 
                      : "opacity-90 hover:opacity-100"
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
                    <div className="flex items-start justify-between w-full mb-3">
                      <div className={cn(
                        "w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-md transition-transform duration-200",
                        provider.iconBg,
                        isAvailable && "group-hover:scale-110"
                      )}>
                        {provider.icon}
                      </div>
                      <div className="flex items-center gap-2">
                        {voteCount > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-foreground bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                            <ThumbsUp className="h-3 w-3 fill-primary text-primary" />
                            <span className="font-semibold">{voteCount}</span>
                          </div>
                        )}
                        {isAvailable && (
                          <Badge className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                            Available
                          </Badge>
                        )}
                        {!isAvailable && (
                          <Badge variant="outline" className="text-xs bg-muted/80 border-muted-foreground/20">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2 text-base md:text-lg">{provider.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                      {provider.description}
                    </p>
                  </button>
                  
                  {!isAvailable && (
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
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
                          "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-200",
                          hasVoted 
                            ? "bg-secondary/50 text-muted-foreground cursor-not-allowed" 
                            : "bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 active:scale-95"
                        )}
                        title={hasVoted ? 'You already voted for this' : 'Vote for this integration'}
                      >
                        <ThumbsUp className={cn(
                          "h-3.5 w-3.5 transition-all",
                          hasVoted && "fill-primary text-primary"
                        )} />
                        <span className="font-medium">{hasVoted ? 'Voted' : 'Vote'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border/50 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm flex-shrink-0 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="flex-shrink-0 hover:bg-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Link2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Integrations</h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                  Connect your favorite tools and services
                </p>
              </div>
            </div>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-secondary/50 pl-10 pr-4 h-10 md:h-11 text-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Model Providers Section */}
          {renderProviderSection(
            "Model Providers",
            <Brain className="h-4 w-4" />,
            isModelProvidersOpen,
            setIsModelProvidersOpen,
            filteredModelProviders
          )}

          {/* Transcriber Providers Section */}
          {renderProviderSection(
            "Transcriber Providers",
            <Mic className="h-4 w-4" />,
            isTranscriberProvidersOpen,
            setIsTranscriberProvidersOpen,
            filteredTranscriberProviders
          )}

          {/* Voice Providers Section */}
          {renderProviderSection(
            "Voice Providers",
            <span className="text-base md:text-lg">🎙️</span>,
            isVoiceProvidersOpen,
            setIsVoiceProvidersOpen,
            filteredVoiceProviders
          )}

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

          {/* Telephony Providers Section */}
          {renderProviderSection(
            "Telephony Providers",
            <Phone className="h-4 w-4" />,
            isTelephonyProvidersOpen,
            setIsTelephonyProvidersOpen,
            filteredTelephonyProviders
          )}

          {/* Customer Support Providers Section */}
          {renderProviderSection(
            "Customer Support Providers",
            <Headphones className="h-4 w-4" />,
            isCustomerSupportProvidersOpen,
            setIsCustomerSupportProvidersOpen,
            filteredCustomerSupportProviders
          )}

          {/* Cloud Storage Providers Section */}
          {renderProviderSection(
            "Cloud Storage Providers",
            <Cloud className="h-4 w-4" />,
            isCloudStorageProvidersOpen,
            setIsCloudStorageProvidersOpen,
            filteredCloudStorageProviders
          )}

          {/* Communication Providers Section */}
          {renderProviderSection(
            "Communication Providers",
            <MessageSquare className="h-4 w-4" />,
            isCommunicationProvidersOpen,
            setIsCommunicationProvidersOpen,
            filteredCommunicationProviders
          )}

          {/* E-commerce Providers Section */}
          {renderProviderSection(
            "E-commerce Providers",
            <ShoppingCart className="h-4 w-4" />,
            isEcommerceProvidersOpen,
            setIsEcommerceProvidersOpen,
            filteredEcommerceProviders
          )}
        </div>
      </div>
    </div>
  );
}
