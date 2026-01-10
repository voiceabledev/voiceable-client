import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link2, Search, ChevronDown, ThumbsUp, Brain, Mic, CalendarDays, Users, Phone, Headphones, Cloud, MessageSquare, ShoppingCart, Volume2, CreditCard, UtensilsCrossed, Store, Database, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { integrationsApi } from "@/lib/api";
import type { UserIntegration } from "@/types/integrations";
import {
  type IntegrationProvider,
  modelProviders,
  transcriberProviders,
  voiceProviders,
  crmProviders,
  schedulingProviders,
  telephonyProviders,
  customerSupportProviders,
  cloudStorageProviders,
  communicationProviders,
  ecommerceProviders,
  atsProviders,
  paymentProcessingProviders,
  restaurantReservationProviders,
  posProviders,
  databaseProviders,
} from "@/constants/integrations";

export default function Integrations() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModelProvidersOpen, setIsModelProvidersOpen] = useState(true);
  const [isTranscriberProvidersOpen, setIsTranscriberProvidersOpen] = useState(true);
  const [isVoiceProvidersOpen, setIsVoiceProvidersOpen] = useState(true);
  const [isCrmProvidersOpen, setIsCrmProvidersOpen] = useState(true);
  const [isSchedulingProvidersOpen, setIsSchedulingProvidersOpen] = useState(true);
  const [isTelephonyProvidersOpen, setIsTelephonyProvidersOpen] = useState(true);
  const [isCustomerSupportProvidersOpen, setIsCustomerSupportProvidersOpen] = useState(true);
  const [isCloudStorageProvidersOpen, setIsCloudStorageProvidersOpen] = useState(true);
  const [isCommunicationProvidersOpen, setIsCommunicationProvidersOpen] = useState(true);
  const [isEcommerceProvidersOpen, setIsEcommerceProvidersOpen] = useState(true);
  const [isAtsProvidersOpen, setIsAtsProvidersOpen] = useState(true);
  const [isPaymentProcessingProvidersOpen, setIsPaymentProcessingProvidersOpen] = useState(true);
  const [isRestaurantReservationProvidersOpen, setIsRestaurantReservationProvidersOpen] = useState(true);
  const [isPosProvidersOpen, setIsPosProvidersOpen] = useState(true);
  const [isDatabaseProvidersOpen, setIsDatabaseProvidersOpen] = useState(true);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [connectedIntegrations, setConnectedIntegrations] = useState<Set<string>>(new Set());
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);

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

  // Load connected integrations
  useEffect(() => {
    const loadConnectedIntegrations = async () => {
      try {
        setLoadingIntegrations(true);
        const response = await integrationsApi.list();
        if (response.data) {
          const connected = new Set<string>();
          response.data.forEach((integration: UserIntegration) => {
            connected.add(integration.integration_type);
          });
          setConnectedIntegrations(connected);
        }
      } catch (error) {
        console.error('Error loading connected integrations:', error);
      } finally {
        setLoadingIntegrations(false);
      }
    };

    loadConnectedIntegrations();
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
  const filteredAtsProviders = filterProviders(sortProviders(atsProviders));
  const filteredPaymentProcessingProviders = filterProviders(sortProviders(paymentProcessingProviders));
  const filteredRestaurantReservationProviders = filterProviders(sortProviders(restaurantReservationProviders));
  const filteredPosProviders = filterProviders(sortProviders(posProviders));
  const filteredDatabaseProviders = filterProviders(sortProviders(databaseProviders));

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
              const isConnected = connectedIntegrations.has(provider.id);

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
                      <div className="flex items-center gap-2 flex-wrap">
                        {voteCount > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-foreground bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                            <ThumbsUp className="h-3 w-3 fill-primary text-primary" />
                            <span className="font-semibold">{voteCount}</span>
                          </div>
                        )}
                        {isAvailable && isConnected && (
                          <Badge className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Connected
                          </Badge>
                        )}
                        {isAvailable && !isConnected && (
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
          {/* Scheduling Providers Section */}
          {renderProviderSection(
            "Scheduling Providers",
            <CalendarDays className="h-4 w-4" />,
            isSchedulingProvidersOpen,
            setIsSchedulingProvidersOpen,
            filteredSchedulingProviders
          )}

          {/* CRM Providers Section */}
          {renderProviderSection(
            "CRM Providers",
            <Users className="h-4 w-4" />,
            isCrmProvidersOpen,
            setIsCrmProvidersOpen,
            filteredCrmProviders
          )}

          {/* E-commerce Providers Section */}
          {/* {renderProviderSection(
            "E-commerce Providers",
            <ShoppingCart className="h-4 w-4" />,
            isEcommerceProvidersOpen,
            setIsEcommerceProvidersOpen,
            filteredEcommerceProviders
          )} */}

          {/* POS Providers Section */}
          {/* {renderProviderSection(
            "POS Systems",
            <Store className="h-4 w-4" />,
            isPosProvidersOpen,
            setIsPosProvidersOpen,
            filteredPosProviders
          )} */}

          {/* ATS Providers Section */}
          {/* {renderProviderSection(
            "ATS Providers",
            <Users className="h-4 w-4" />,
            isAtsProvidersOpen,
            setIsAtsProvidersOpen,
            filteredAtsProviders
          )} */}

          {/* Restaurant Reservations Section */}
          {/* {renderProviderSection(
            "Restaurant Reservations",
            <UtensilsCrossed className="h-4 w-4" />,
            isRestaurantReservationProvidersOpen,
            setIsRestaurantReservationProvidersOpen,
            filteredRestaurantReservationProviders
          )} */}

          {/* Telephony Providers Section */}
          {/* {renderProviderSection(
            "Telephony Providers",
            <Phone className="h-4 w-4" />,
            isTelephonyProvidersOpen,
            setIsTelephonyProvidersOpen,
            filteredTelephonyProviders
          )} */}

          {/* Payment Processing Providers Section */}
          {/* {renderProviderSection(
            "Payment Processing Providers",
            <CreditCard className="h-4 w-4" />,
            isPaymentProcessingProvidersOpen,
            setIsPaymentProcessingProvidersOpen,
            filteredPaymentProcessingProviders
          )} */}

          {/* Communication Providers Section */}
          {/* {renderProviderSection(
            "Communication Providers",
            <MessageSquare className="h-4 w-4" />,
            isCommunicationProvidersOpen,
            setIsCommunicationProvidersOpen,
            filteredCommunicationProviders
          )} */}

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
            <Mic className="h-4 w-4 text-primary" />,
            isTranscriberProvidersOpen,
            setIsTranscriberProvidersOpen,
            filteredTranscriberProviders
          )} */}

          {/* Voice Providers Section */}
          {/* {renderProviderSection(
            "Voice Providers",
            <Volume2 className="h-4 w-4 text-primary" />,
            isVoiceProvidersOpen,
            setIsVoiceProvidersOpen,
            filteredVoiceProviders
          )} */}

          {/* Customer Support Providers Section */}
          {/* {renderProviderSection(
            "Customer Support Providers",
            <Headphones className="h-4 w-4" />,
            isCustomerSupportProvidersOpen,
            setIsCustomerSupportProvidersOpen,
            filteredCustomerSupportProviders
          )} */}

          {/* Cloud Storage Providers Section */}
          {/* {renderProviderSection(
            "Cloud Storage Providers",
            <Cloud className="h-4 w-4" />,
            isCloudStorageProvidersOpen,
            setIsCloudStorageProvidersOpen,
            filteredCloudStorageProviders
          )} */}

          {/* Database Providers Section */}
          {/* {renderProviderSection(
            "Database Providers",
            <Database className="h-4 w-4" />,
            isDatabaseProvidersOpen,
            setIsDatabaseProvidersOpen,
            filteredDatabaseProviders
          )} */}
        </div>
      </div>
    </div>
  );
}
