"use client"

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  AlertCircle,
  PlayCircle,
  Calendar,
  TrendingUp,
  Activity
} from "lucide-react";
import { integrationsApi, campaignsApi, Campaign } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type StatusFilter = 'all' | 'running' | 'scheduled' | 'completed' | 'failed';

export default function Outbound() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [isElevenLabsConnected, setIsElevenLabsConnected] = useState(false);
  const [isCheckingIntegration, setIsCheckingIntegration] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<number>>(new Set());
  const [loadingDetails, setLoadingDetails] = useState<Set<number>>(new Set());
  const [campaignDetails, setCampaignDetails] = useState<Record<number, Campaign>>({});
  const router = useRouter();
  const { toast } = useToast();

  const fetchCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    try {
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
        next.delete(campaignId);
      } else {
        next.add(campaignId);
        if (!campaignDetails[campaignId]) {
          fetchCampaignDetails(campaignId);
        }
      }
      return next;
    });
  };

  const checkElevenLabsIntegration = async () => {
    setIsCheckingIntegration(true);
    try {
      const integration = await integrationsApi.get('elevenlabs');
      setIsElevenLabsConnected(!!integration.data);
    } catch {
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
      router.push("/settings/integrations/elevenlabs");
      return;
    }
    router.push("/outbound/new");
  };

  const handleConnectElevenLabs = () => {
    router.push("/settings/integrations/elevenlabs");
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = campaigns.length;
    const running = campaigns.filter(c => c.status === 'running').length;
    const scheduled = campaigns.filter(c => c.status === 'scheduled' || c.status === 'pending').length;
    const completed = campaigns.filter(c => c.status === 'completed').length;
    const totalRecipients = campaigns.reduce((sum, c) => sum + (c.recipients_count || 0), 0);

    return { total, running, scheduled, completed, totalRecipients };
  }, [campaigns]);

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns;

    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'scheduled') {
        filtered = filtered.filter(c => c.status === 'scheduled' || c.status === 'pending');
      } else {
        filtered = filtered.filter(c => c.status === statusFilter);
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(campaign =>
        campaign.name.toLowerCase().includes(query) ||
        campaign.agent_name?.toLowerCase().includes(query) ||
        campaign.phone_number?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [campaigns, statusFilter, searchQuery]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          variant: 'default' as const,
          label: 'Completed',
          icon: CheckCircle2,
          className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
        };
      case 'running':
        return {
          variant: 'default' as const,
          label: 'Running',
          icon: PlayCircle,
          className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 animate-pulse'
        };
      case 'scheduled':
        return {
          variant: 'secondary' as const,
          label: 'Scheduled',
          icon: Calendar,
          className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20'
        };
      case 'pending':
        return {
          variant: 'secondary' as const,
          label: 'Pending',
          icon: Clock,
          className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
        };
      case 'failed':
        return {
          variant: 'destructive' as const,
          label: 'Failed',
          icon: XCircle,
          className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
        };
      case 'cancelled':
        return {
          variant: 'outline' as const,
          label: 'Cancelled',
          icon: XCircle,
          className: 'bg-muted text-muted-foreground'
        };
      default:
        return {
          variant: 'secondary' as const,
          label: status,
          icon: AlertCircle,
          className: ''
        };
    }
  };

  const getRecipientStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'answered':
      case 'completed':
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
      case 'no_answer':
      case 'no_response':
        return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />;
      case 'failed':
        return <XCircle className="h-3.5 w-3.5 text-red-500" />;
      case 'in_progress':
      case 'calling':
        return <Activity className="h-3.5 w-3.5 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
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

  const getRecipientStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'answered':
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'no_answer':
      case 'no_response':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'failed':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      case 'in_progress':
      case 'calling':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCampaignProgress = (campaign: Campaign) => {
    const summary = campaign.batch_call_summary || campaign.batch_call_details?.summary;
    if (!summary) return null;

    const total = (summary.answered || 0) + (summary.no_answer || 0) +
                  (summary.failed || 0) + (summary.in_progress || 0) + (summary.pending || 0);
    if (total === 0) return null;

    const completed = (summary.answered || 0) + (summary.no_answer || 0) + (summary.failed || 0);
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0 bg-gradient-to-r from-background to-muted/30">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-violet-light flex items-center justify-center shadow-lg shadow-accent/20">
              <PhoneOutgoing className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Outbound Campaigns</h1>
              <p className="text-sm text-muted-foreground">Manage your automated calling campaigns</p>
            </div>
          </div>
          {isElevenLabsConnected && (
            <Button
              variant="accent"
              onClick={handleCreateCampaign}
              className="shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">New Campaign</span>
              <span className="sm:hidden">New</span>
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 md:p-6">
          {isCheckingIntegration ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <Loader2 className="h-8 w-8 animate-spin text-accent mb-3" />
              <p className="text-sm text-muted-foreground">Checking integrations...</p>
            </div>
          ) : !isElevenLabsConnected ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-violet-light/20 flex items-center justify-center mb-6 shadow-lg">
                <Link2 className="h-10 w-10 text-accent" />
              </div>
              <h2 className="text-2xl font-semibold mb-3 text-center">
                Connect ElevenLabs to get started
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-8">
                Connect your ElevenLabs account to create and manage outbound calling campaigns
                with AI-powered voice agents.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                  variant="accent"
                  size="lg"
                  onClick={handleConnectElevenLabs}
                  className="shadow-lg shadow-accent/20"
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Connect ElevenLabs
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.open("https://elevenlabs.io", "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Learn more
                </Button>
              </div>

              <Card className="mt-10 max-w-lg w-full bg-muted/30">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    What you'll need
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Your ElevenLabs API key
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      An ElevenLabs account with outbound calling enabled
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Phone numbers configured in ElevenLabs
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : loadingCampaigns ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <Loader2 className="h-8 w-8 animate-spin text-accent mb-3" />
              <p className="text-sm text-muted-foreground">Loading campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-violet-light/20 flex items-center justify-center mb-6 shadow-lg">
                <Phone className="h-10 w-10 text-accent" />
              </div>
              <h2 className="text-2xl font-semibold mb-3 text-center">No campaigns yet</h2>
              <p className="text-muted-foreground text-center max-w-md mb-8">
                Create your first campaign to start reaching out to customers with AI-powered voice calls.
              </p>

              <Button
                variant="accent"
                size="lg"
                onClick={handleCreateCampaign}
                className="shadow-lg shadow-accent/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create your first campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card className="bg-gradient-to-br from-card to-muted/20 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Total Campaigns</p>
                        <p className="text-2xl font-bold mt-1">{stats.total}</p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <PhoneOutgoing className="h-5 w-5 text-accent" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card to-blue-500/5 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Running</p>
                        <p className="text-2xl font-bold mt-1">{stats.running}</p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <PlayCircle className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card to-emerald-500/5 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Completed</p>
                        <p className="text-2xl font-bold mt-1">{stats.completed}</p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card to-violet-500/5 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Total Recipients</p>
                        <p className="text-2xl font-bold mt-1">{stats.totalRecipients.toLocaleString()}</p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-violet-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                  <TabsList className="h-9">
                    <TabsTrigger value="all" className="text-xs px-3">
                      All
                      <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                        {campaigns.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="running" className="text-xs px-3">
                      Running
                      {stats.running > 0 && (
                        <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                          {stats.running}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="scheduled" className="text-xs px-3">
                      Scheduled
                      {stats.scheduled > 0 && (
                        <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                          {stats.scheduled}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="text-xs px-3">
                      Completed
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search campaigns..."
                    className="pl-9 bg-muted/50 border-border h-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Campaign List */}
              <div className="space-y-3">
                {filteredCampaigns.map((campaign) => {
                  const isExpanded = expandedCampaigns.has(campaign.id);
                  const details = campaignDetails[campaign.id] || campaign;
                  const recipients = details.batch_call_details?.recipients || [];
                  const isLoadingDetails = loadingDetails.has(campaign.id);
                  const statusConfig = getStatusConfig(campaign.status);
                  const StatusIcon = statusConfig.icon;
                  const progress = getCampaignProgress(campaign);
                  const summary = campaign.batch_call_summary || campaign.batch_call_details?.summary;

                  return (
                    <Card
                      key={campaign.id}
                      className="overflow-hidden hover:shadow-md transition-all duration-200 hover:border-accent/30"
                    >
                      <CardContent className="p-0">
                        <div className="p-4 md:p-5">
                          <div className="flex items-start gap-4">
                            {/* Campaign Icon */}
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              campaign.status === 'running'
                                ? 'bg-blue-500/10'
                                : campaign.status === 'completed'
                                ? 'bg-emerald-500/10'
                                : 'bg-accent/10'
                            }`}>
                              <PhoneOutgoing className={`h-6 w-6 ${
                                campaign.status === 'running'
                                  ? 'text-blue-500'
                                  : campaign.status === 'completed'
                                  ? 'text-emerald-500'
                                  : 'text-accent'
                              }`} />
                            </div>

                            {/* Campaign Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-base">{campaign.name}</h3>
                                  <Badge
                                    variant={statusConfig.variant}
                                    className={`text-xs flex items-center gap-1 ${statusConfig.className}`}
                                  >
                                    <StatusIcon className="h-3 w-3" />
                                    {statusConfig.label}
                                  </Badge>
                                </div>

                                {/* Expand Button */}
                                {campaign.elevenlabs_batch_call_id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 flex-shrink-0"
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

                              {/* Campaign Meta */}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                {campaign.agent_name && (
                                  <div className="flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5" />
                                    <span className="truncate max-w-[120px]">{campaign.agent_name}</span>
                                  </div>
                                )}
                                {campaign.phone_number && (
                                  <div className="flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5" />
                                    <span>{campaign.phone_number}</span>
                                  </div>
                                )}
                                {campaign.recipients_count > 0 && (
                                  <div className="flex items-center gap-1.5">
                                    <Users className="h-3.5 w-3.5" />
                                    <span>{campaign.recipients_count} recipients</span>
                                  </div>
                                )}
                              </div>

                              {/* Schedule / Created info */}
                              <div className="mt-2 text-xs text-muted-foreground">
                                {campaign.send_immediately ? (
                                  <span className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    Sent immediately
                                  </span>
                                ) : campaign.scheduled_at ? (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Scheduled: {format(new Date(campaign.scheduled_at), "MMM d, yyyy 'at' h:mm a")}
                                  </span>
                                ) : campaign.created_at ? (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Created {format(new Date(campaign.created_at), "MMM d, yyyy 'at' h:mm a")}
                                  </span>
                                ) : null}
                              </div>

                              {/* Progress Bar and Summary */}
                              {(progress !== null || summary) && (
                                <div className="mt-4 space-y-2">
                                  {progress !== null && (
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="font-medium">{progress}%</span>
                                      </div>
                                      <Progress value={progress} className="h-1.5" />
                                    </div>
                                  )}

                                  {summary && (
                                    <div className="flex items-center gap-2 flex-wrap pt-1">
                                      {summary.answered > 0 && (
                                        <div className="flex items-center gap-1 text-xs">
                                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                            {summary.answered} answered
                                          </span>
                                        </div>
                                      )}
                                      {summary.no_answer > 0 && (
                                        <div className="flex items-center gap-1 text-xs">
                                          <AlertCircle className="h-3 w-3 text-amber-500" />
                                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                                            {summary.no_answer} no answer
                                          </span>
                                        </div>
                                      )}
                                      {summary.failed > 0 && (
                                        <div className="flex items-center gap-1 text-xs">
                                          <XCircle className="h-3 w-3 text-red-500" />
                                          <span className="text-red-600 dark:text-red-400 font-medium">
                                            {summary.failed} failed
                                          </span>
                                        </div>
                                      )}
                                      {summary.in_progress > 0 && (
                                        <div className="flex items-center gap-1 text-xs">
                                          <Activity className="h-3 w-3 text-blue-500 animate-pulse" />
                                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                                            {summary.in_progress} in progress
                                          </span>
                                        </div>
                                      )}
                                      {summary.pending > 0 && (
                                        <div className="flex items-center gap-1 text-xs">
                                          <Clock className="h-3 w-3 text-muted-foreground" />
                                          <span className="text-muted-foreground font-medium">
                                            {summary.pending} pending
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Recipients Section */}
                        {isExpanded && (
                          <div className="border-t border-border bg-muted/30 p-4 md:p-5">
                            {isLoadingDetails ? (
                              <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-5 w-5 animate-spin text-accent mr-2" />
                                <span className="text-sm text-muted-foreground">Loading recipient details...</span>
                              </div>
                            ) : details.details_error ? (
                              <div className="flex items-center gap-2 text-sm text-destructive py-4">
                                <XCircle className="h-4 w-4" />
                                {details.details_error}
                              </div>
                            ) : recipients.length > 0 ? (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium">Recipient Call Status</h4>
                                  <span className="text-xs text-muted-foreground">{recipients.length} recipients</span>
                                </div>
                                <div className="grid gap-2 max-h-[350px] overflow-y-auto pr-1">
                                  {recipients.map((recipient, index) => (
                                    <div
                                      key={recipient.id || index}
                                      className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:border-accent/30 transition-colors"
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        {getRecipientStatusIcon(recipient.status)}
                                        <div className="flex items-center gap-2">
                                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                          <span className="text-sm font-medium">{recipient.phone_number}</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3 flex-shrink-0">
                                        <Badge
                                          variant="secondary"
                                          className={`text-xs ${getRecipientStatusColor(recipient.status)}`}
                                        >
                                          {formatRecipientStatus(recipient.status)}
                                        </Badge>
                                        {recipient.updated_at && (
                                          <span className="text-xs text-muted-foreground hidden sm:inline">
                                            {format(new Date(recipient.updated_at), "MMM d, h:mm a")}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                No recipient details available
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Empty State for filtered results */}
              {filteredCampaigns.length === 0 && (searchQuery || statusFilter !== 'all') && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? `No campaigns found matching "${searchQuery}"`
                      : `No ${statusFilter} campaigns`}
                  </p>
                  <Button
                    variant="ghost"
                    className="mt-3"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
