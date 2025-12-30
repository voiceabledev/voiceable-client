import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  PhoneOutgoing, 
  Plus,
  Phone,
  Link2,
  ExternalLink,
  Search,
  Loader2,
  User,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { integrationsApi, campaignsApi, Campaign } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Outbound() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [isElevenLabsConnected, setIsElevenLabsConnected] = useState(false);
  const [isCheckingIntegration, setIsCheckingIntegration] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<number>>(new Set());
  const [loadingDetails, setLoadingDetails] = useState<Set<number>>(new Set());
  const [campaignDetails, setCampaignDetails] = useState<Record<number, Campaign>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    try {
      // Fetch with summary details included
      const response = await campaignsApi.list(true);
      if (response.data && Array.isArray(response.data)) {
        setCampaigns(response.data);
      } else {
        setCampaigns([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch campaigns';
      setCampaigns([]);
      toast({
        title: 'Error loading campaigns',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoadingCampaigns(false);
    }
  }, [toast]);

  const fetchCampaignDetails = async (campaignId: number) => {
    setLoadingDetails(prev => new Set(prev).add(campaignId));
    try {
      const response = await campaignsApi.get(campaignId);
      if (response.data) {
        setCampaignDetails(prev => ({
          ...prev,
          [campaignId]: response.data
        }));
      }
    } catch (err) {
      toast({
        title: 'Error loading campaign details',
        description: err instanceof Error ? err.message : 'Failed to fetch campaign details',
        variant: 'destructive',
      });
    } finally {
      setLoadingDetails(prev => {
        const next = new Set(prev);
        next.delete(campaignId);
        return next;
      });
    }
  };

  const toggleCampaignExpansion = (campaignId: number) => {
    setExpandedCampaigns(prev => {
      const next = new Set(prev);
      if (next.has(campaignId)) {
        // Collapse
        next.delete(campaignId);
      } else {
        // Expand
        next.add(campaignId);
        // Fetch details if not already loaded
        if (!campaignDetails[campaignId]) {
          fetchCampaignDetails(campaignId);
        }
      }
      return next;
    });
  };

  const getRecipientStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'answered':
      case 'completed':
        return 'default';
      case 'no_answer':
      case 'no_response':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'in_progress':
      case 'calling':
        return 'default';
      case 'pending':
      case 'queued':
        return 'outline';
      case 'cancelled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getRecipientStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'answered':
      case 'completed':
        return <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />;
      case 'no_answer':
      case 'no_response':
        return <AlertCircle className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />;
      case 'failed':
        return <XCircle className="h-3 w-3 text-red-600 dark:text-red-400" />;
      default:
        return null;
    }
  };

  const formatRecipientStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'answered':
      case 'completed':
        return 'Answered';
      case 'no_answer':
      case 'no_response':
        return 'No Answer';
      case 'failed':
        return 'Failed';
      case 'in_progress':
      case 'calling':
        return 'In Progress';
      case 'pending':
      case 'queued':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status || 'Unknown';
    }
  };

  const checkElevenLabsIntegration = async () => {
    setIsCheckingIntegration(true);
    try {
      const integration = await integrationsApi.get('elevenlabs');
      setIsElevenLabsConnected(!!integration.data);
    } catch (error) {
      // Integration doesn't exist
      setIsElevenLabsConnected(false);
    } finally {
      setIsCheckingIntegration(false);
    }
  };

  useEffect(() => {
    checkElevenLabsIntegration();
  }, []);

  useEffect(() => {
    if (isElevenLabsConnected) {
      fetchCampaigns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isElevenLabsConnected]);

  const handleCreateCampaign = () => {
    if (!isElevenLabsConnected) {
      toast({
        title: 'ElevenLabs connection required',
        description: 'Please connect your ElevenLabs account to create outbound campaigns.',
        variant: 'destructive',
      });
      navigate("/settings/integrations/elevenlabs");
      return;
    }
    navigate("/outbound/new");
  };

  const handleConnectElevenLabs = () => {
    navigate("/settings/integrations/elevenlabs");
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'running':
        return 'default';
      case 'scheduled':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'cancelled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'scheduled':
        return 'Scheduled';
      case 'running':
        return 'Running';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.agent_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.phone_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3">
            <PhoneOutgoing className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <h1 className="text-lg md:text-xl font-semibold">Outbound</h1>
          </div>
          {isElevenLabsConnected && (
            <Button 
              variant="accent" 
              onClick={handleCreateCampaign}
              size="icon"
              className="md:size-auto md:px-4 md:py-2"
            >
              <Plus className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Create Campaign</span>
            </Button>
          )}
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 md:p-6 pr-4 md:pr-6">
          {isCheckingIntegration ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
              <div className="text-muted-foreground text-sm">Loading...</div>
            </div>
          ) : !isElevenLabsConnected ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Link2 className="h-5 w-5 md:h-7 md:w-7 text-muted-foreground" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold mb-2 text-center">
                Connect ElevenLabs to get started
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-6 text-sm md:text-base">
                Connect your ElevenLabs account to create and manage outbound calling campaigns. 
                You'll need your ElevenLabs API key to get started.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button 
                  variant="accent" 
                  onClick={handleConnectElevenLabs}
                  className="w-full sm:w-auto"
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Connect ElevenLabs
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open("https://elevenlabs.io", "_blank")}
                  className="w-full sm:w-auto"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Learn more about ElevenLabs
                </Button>
              </div>

              <div className="mt-8 p-4 bg-secondary/50 rounded-lg border border-border max-w-lg w-full">
                <h3 className="text-sm font-semibold mb-2">What you'll need:</h3>
                <ul className="text-xs md:text-sm text-muted-foreground space-y-1">
                  <li>• Your ElevenLabs API key</li>
                  <li>• An ElevenLabs account with outbound calling enabled</li>
                  <li>• Phone numbers configured in ElevenLabs</li>
                </ul>
              </div>
            </div>
          ) : loadingCampaigns ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Phone className="h-5 w-5 md:h-7 md:w-7 text-muted-foreground" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold mb-2 text-center">No campaigns yet</h2>
              <p className="text-muted-foreground text-center max-w-md mb-6 text-sm md:text-base">
                Create your first campaign to start reaching out to customers
              </p>
              
              <Button variant="accent" onClick={handleCreateCampaign} className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative w-full sm:w-80 max-w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search campaigns..." 
                  className="pl-9 bg-secondary/50 border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                {filteredCampaigns.map((campaign) => {
                  const isExpanded = expandedCampaigns.has(campaign.id);
                  const details = campaignDetails[campaign.id] || campaign;
                  const summary = details.batch_call_summary || details.batch_call_details?.summary;
                  const recipients = details.batch_call_details?.recipients || [];
                  const isLoadingDetails = loadingDetails.has(campaign.id);
                  
                  return (
                    <div
                      key={campaign.id}
                      className="bg-card border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-start gap-3 p-4">
                        <PhoneOutgoing className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-medium">{campaign.name}</span>
                            <Badge variant={getStatusBadgeVariant(campaign.status)} className="text-xs">
                              {getStatusLabel(campaign.status)}
                            </Badge>
                            {campaign.elevenlabs_batch_call_id && (
                              <Badge variant="outline" className="text-xs">
                                Synced
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            {campaign.agent_name && (
                              <>
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span className="truncate">{campaign.agent_name}</span>
                                </div>
                                <span>•</span>
                              </>
                            )}
                            {campaign.phone_number && (
                              <>
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{campaign.phone_number}</span>
                                </div>
                                <span>•</span>
                              </>
                            )}
                            {campaign.recipients_count > 0 && (
                              <>
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span>{campaign.recipients_count} recipients</span>
                                </div>
                                <span>•</span>
                              </>
                            )}
                            {campaign.send_immediately ? (
                              <span>Send immediately</span>
                            ) : campaign.scheduled_at ? (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  Scheduled: {format(new Date(campaign.scheduled_at), "MMM d, yyyy 'at' h:mm a")}
                                </span>
                              </div>
                            ) : null}
                          </div>
                          
                          {/* Call Summary Statistics */}
                          {summary && (
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                              {summary.answered > 0 && (
                                <Badge variant="default" className="text-xs">
                                  {summary.answered} answered
                                </Badge>
                              )}
                              {summary.no_answer > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {summary.no_answer} no answer
                                </Badge>
                              )}
                              {summary.failed > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {summary.failed} failed
                                </Badge>
                              )}
                              {summary.in_progress > 0 && (
                                <Badge variant="default" className="text-xs">
                                  {summary.in_progress} in progress
                                </Badge>
                              )}
                              {summary.pending > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {summary.pending} pending
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {campaign.created_at && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Created {format(new Date(campaign.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </div>
                          )}
                        </div>
                        
                        {/* Expand/Collapse Button */}
                        {campaign.elevenlabs_batch_call_id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => toggleCampaignExpansion(campaign.id)}
                            disabled={isLoadingDetails}
                          >
                            {isLoadingDetails ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                      
                      {/* Expanded Details Section */}
                      {isExpanded && (
                        <div className="border-t border-border px-4 pb-4 pt-3">
                          {isLoadingDetails ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              <span className="ml-2 text-xs text-muted-foreground">Loading details...</span>
                            </div>
                          ) : details.details_error ? (
                            <div className="text-xs text-destructive py-2">
                              {details.details_error}
                            </div>
                          ) : recipients.length > 0 ? (
                            <div className="space-y-2">
                              <div className="text-xs font-medium text-muted-foreground mb-2">
                                Recipient Call Status
                              </div>
                              <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                                {recipients.map((recipient, index) => (
                                  <div
                                    key={recipient.id || index}
                                    className="flex items-center justify-between p-2 bg-secondary/30 rounded border border-border"
                                  >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      {getRecipientStatusIcon(recipient.status)}
                                      <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                      <span className="text-xs font-medium truncate">
                                        {recipient.phone_number}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <Badge
                                        variant={getRecipientStatusBadgeVariant(recipient.status)}
                                        className="text-xs"
                                      >
                                        {formatRecipientStatus(recipient.status)}
                                      </Badge>
                                      {recipient.updated_at && (
                                        <span className="text-xs text-muted-foreground">
                                          {format(new Date(recipient.updated_at), "MMM d, h:mm a")}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground py-2">
                              No recipient details available
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {filteredCampaigns.length === 0 && searchQuery && (
                <div className="text-center py-8 text-muted-foreground">
                  No campaigns found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
