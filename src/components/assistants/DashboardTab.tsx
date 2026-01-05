import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Download,
  Calendar,
  Phone,
  Globe,
  ChevronDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { agentMetricsApi, phoneNumbersApi, conversationsApi, type AgentROI, type PhoneNumber } from "@/lib/api";
import { PhoneNumberModal } from "@/components/PhoneNumberModal";
import { useOutcomeDefinition } from "@/hooks/assistants/useOutcomeDefinition";
import type { Agent } from "@/types/assistant";

type DashboardTabProps = {
  agent: Agent | null;
  agentId: string;
  onNavigateToWidget?: () => void;
};

// Map primary outcome values to human-readable labels
const getPrimaryOutcomeLabel = (primaryOutcome: string | undefined): string => {
  const outcomeMap: Record<string, string> = {
    'appointment_scheduled': 'Appointments Booked',
    'meeting_booked': 'Meetings Booked',
    'lead_qualified': 'Leads Qualified',
    'issue_resolved': 'Issues Resolved',
    'complaint_resolved': 'Complaints Resolved',
    'order_placed': 'Orders Placed',
    'information_provided': 'Information Provided',
  };
  
  return primaryOutcome ? (outcomeMap[primaryOutcome] || 'Successful Outcomes') : 'Successful Outcomes';
};

// Map primary outcome values to cost per outcome labels
const getCostPerOutcomeLabel = (primaryOutcome: string | undefined): string => {
  const costMap: Record<string, string> = {
    'appointment_scheduled': 'Cost per Booking',
    'meeting_booked': 'Cost per Booking',
    'lead_qualified': 'Cost per Deal',
    'order_placed': 'Cost per Deal',
    'issue_resolved': 'Cost per Resolution',
    'complaint_resolved': 'Cost per Resolution',
    'information_provided': 'Cost per Action',
  };
  
  return primaryOutcome ? (costMap[primaryOutcome] || 'Cost per Success') : 'Cost per Success';
};

type DateRangeOption = 'today' | 'yesterday' | '7days' | '15days' | '30days';

const getDateRangeLabel = (option: DateRangeOption): string => {
  switch (option) {
    case 'today':
      return 'Today';
    case 'yesterday':
      return 'Yesterday';
    case '7days':
      return 'Last 7 Days';
    case '15days':
      return 'Last 15 Days';
    case '30days':
      return 'Last 30 Days';
    default:
      return 'Last 30 Days';
  }
};

const calculateDateRange = (option: DateRangeOption): { start_date: string; end_date: string } => {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setUTCHours(23, 59, 59, 999); // End of today in UTC
  
  const startDate = new Date(now);
  
  switch (option) {
    case 'today':
      startDate.setUTCHours(0, 0, 0, 0);
      break;
    case 'yesterday':
      startDate.setUTCDate(startDate.getUTCDate() - 1);
      startDate.setUTCHours(0, 0, 0, 0);
      endDate.setUTCDate(endDate.getUTCDate() - 1);
      endDate.setUTCHours(23, 59, 59, 999);
      break;
    case '7days':
      startDate.setUTCDate(startDate.getUTCDate() - 7);
      startDate.setUTCHours(0, 0, 0, 0);
      break;
    case '15days':
      startDate.setUTCDate(startDate.getUTCDate() - 15);
      startDate.setUTCHours(0, 0, 0, 0);
      break;
    case '30days':
      startDate.setUTCDate(startDate.getUTCDate() - 30);
      startDate.setUTCHours(0, 0, 0, 0);
      break;
  }
  
  // Return full ISO 8601 datetime strings (backend expects Time.parse format)
  return {
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
  };
};

export const DashboardTab: React.FC<DashboardTabProps> = ({ agent, agentId, onNavigateToWidget }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [roiData, setRoiData] = useState<AgentROI | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeOption>('30days');
  const [dateRange, setDateRange] = useState<{ start_date?: string; end_date?: string }>(() => 
    calculateDateRange('30days')
  );
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [loadingPhoneNumbers, setLoadingPhoneNumbers] = useState(false);
  const [showPhoneNumberModal, setShowPhoneNumberModal] = useState(false);
  const [hasConversations, setHasConversations] = useState<boolean | null>(null);
  const { outcomeDefinition } = useOutcomeDefinition(agentId);

  const fetchMetrics = useCallback(async () => {
    if (!agentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await agentMetricsApi.getROI(agentId, dateRange);
      if (response.data) {
        setRoiData(response.data);
      } else {
        // API returned successfully but no data - check if we have conversations
        setRoiData(null);
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
      // Don't show error toast if we have conversations - metrics might just not be ready yet
      const errorWithStatus = error as { response?: { status?: number }; status?: number };
      const status = errorWithStatus?.response?.status || errorWithStatus?.status;
      if (status !== 404 && status !== 200) {
        toast({
          title: "Error loading metrics",
          description: "Failed to load dashboard data.",
          variant: "destructive",
        });
      }
      setRoiData(null);
    } finally {
      setLoading(false);
    }
  }, [agentId, dateRange, toast]);

  const fetchPhoneNumbers = useCallback(async () => {
    if (!agentId) return;
    
    setLoadingPhoneNumbers(true);
    try {
      const response = await phoneNumbersApi.list();
      if (response.data) {
        // Filter phone numbers assigned to this agent
        const agentPhoneNumbers = response.data.filter(
          (pn) => pn.agent_id?.toString() === agentId
        );
        setPhoneNumbers(agentPhoneNumbers);
      }
    } catch (error) {
      console.error("Error fetching phone numbers:", error);
    } finally {
      setLoadingPhoneNumbers(false);
    }
  }, [agentId]);

  const checkConversations = useCallback(async () => {
    if (!agentId) {
      setHasConversations(false);
      return;
    }

    try {
      const response = await conversationsApi.list({ 
        agent_id: agentId,
        page_size: 1 // Just check if any exist
      });
      setHasConversations(response.data && response.data.length > 0);
    } catch (error) {
      console.error("Error checking conversations:", error);
      setHasConversations(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchMetrics();
    fetchPhoneNumbers();
    checkConversations();
  }, [fetchMetrics, fetchPhoneNumbers, checkConversations]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!roiData) {
    const hasPhoneNumber = phoneNumbers.length > 0;
    const hasWidget = !!(agent?.elevenlabs_agent_id);

    // If we have conversations but no ROI data, show a message that metrics are being calculated
    if (hasConversations === true) {
      return (
        <div className="flex flex-col items-center py-16 px-4">
          <div className="text-center space-y-4 mb-10 max-w-xl">
            <div className="relative mx-auto mb-6">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-50"></div>
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shadow-lg">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold tracking-tight">Calculating Metrics</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                We're processing your call data to generate performance metrics, ROI analysis, and detailed insights. This may take a few moments.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center py-16 px-4">
        {/* Main Empty State */}
        <div className="text-center space-y-4 mb-10 max-w-xl">
          <div className="relative mx-auto mb-6">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-50"></div>
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shadow-lg">
              <Calendar className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight">No metrics data available yet</h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              Start receiving calls or widget interactions to see performance metrics, ROI analysis, and detailed insights here.
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="w-full max-w-3xl space-y-4">
          {!hasPhoneNumber && (
            <Card className="group border-2 border-dashed border-primary/30 hover:border-primary/60 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-card to-primary/5">
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/30 shadow-md group-hover:scale-105 transition-transform">
                      <Phone className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg">Add a Phone Number</h4>
                        <Badge variant="secondary" className="text-xs">Recommended</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Connect a phone number to enable voice calls. Track call volume, success rates, revenue, and ROI metrics in real-time.
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowPhoneNumberModal(true)}
                      size="lg"
                      className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Add Phone Number
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {hasWidget && (
            <Card className="group border hover:border-blue-500/30 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-card to-blue-500/5">
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center border border-blue-500/30 shadow-md group-hover:scale-105 transition-transform">
                      <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg">Web Widget Active</h4>
                        <Badge variant="outline" className="text-xs border-green-500/50 text-green-600 dark:text-green-400">
                          Live
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Your agent is published and ready to receive conversations through the web widget. All interaction metrics will be tracked and displayed here.
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        if (onNavigateToWidget) {
                          onNavigateToWidget();
                        }
                      }}
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow border-blue-500/50 hover:border-blue-500 hover:bg-blue-500/10"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      View Widget Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {hasPhoneNumber && !hasWidget && (
            <Card className="group border hover:border-green-500/30 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-card to-green-500/5">
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center border border-green-500/30 shadow-md group-hover:scale-105 transition-transform">
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="font-bold text-lg">Phone Number Connected</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Your agent is ready to receive calls. Metrics including call volume, success rates, costs, and revenue will appear here once calls start coming in.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!hasWidget && (
            <Card className="group border-2 border-dashed border-blue-500/30 hover:border-blue-500/60 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-card to-blue-500/5">
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center border border-blue-500/30 shadow-md group-hover:scale-105 transition-transform">
                      <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg">Set Up Web Widget</h4>
                        <Badge variant="secondary" className="text-xs">Recommended</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Add a web widget to your website to enable chat conversations. Track interaction metrics, engagement rates, and conversion data in real-time.
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        if (onNavigateToWidget) {
                          onNavigateToWidget();
                        }
                      }}
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow border-blue-500/50 hover:border-blue-500 hover:bg-blue-500/10"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Set Up Widget
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Section */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center mx-auto">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium">Performance Metrics</p>
                <p className="text-xs text-muted-foreground">Track success rates and escalations</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center mx-auto">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium">Revenue & ROI</p>
                <p className="text-xs text-muted-foreground">Monitor financial impact</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium">Call Analytics</p>
                <p className="text-xs text-muted-foreground">Detailed call breakdown</p>
              </div>
            </div>
          </div>
        </div>

        <PhoneNumberModal
          open={showPhoneNumberModal}
          onOpenChange={(open) => {
            setShowPhoneNumberModal(open);
            if (!open) {
              // Refetch phone numbers when modal closes
              fetchPhoneNumbers();
            }
          }}
          defaultAgentId={agentId}
        />
      </div>
    );
  }

  const { calls, success_rate, escalation_rate, costs, revenue, roi, savings } = roiData;

  return (
    <div className="space-y-6">
      {/* Header with Date Range */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Last {roiData.period.days} days
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                {getDateRangeLabel(selectedDateRange)}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  const option: DateRangeOption = 'today';
                  setSelectedDateRange(option);
                  setDateRange(calculateDateRange(option));
                }}
              >
                Today
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const option: DateRangeOption = 'yesterday';
                  setSelectedDateRange(option);
                  setDateRange(calculateDateRange(option));
                }}
              >
                Yesterday
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const option: DateRangeOption = '7days';
                  setSelectedDateRange(option);
                  setDateRange(calculateDateRange(option));
                }}
              >
                Last 7 Days
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const option: DateRangeOption = '15days';
                  setSelectedDateRange(option);
                  setDateRange(calculateDateRange(option));
                }}
              >
                Last 15 Days
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const option: DateRangeOption = '30days';
                  setSelectedDateRange(option);
                  setDateRange(calculateDateRange(option));
                }}
              >
                Last 30 Days
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Business Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenue.estimated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {calls.successful} successful calls × ${revenue.revenue_per_success}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {getPrimaryOutcomeLabel(outcomeDefinition?.primary_outcome)}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calls.successful}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {success_rate}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{success_rate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {calls.successful} of {calls.total} calls
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Efficiency */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costs.total.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${costs.avg_cost_per_call.toFixed(2)} avg per call
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {getCostPerOutcomeLabel(outcomeDefinition?.primary_outcome)}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costs.cost_per_success.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per successful call
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">vs Human Cost</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${savings.vs_human.toFixed(2)} saved
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((savings.vs_human / savings.human_cost_for_period) * 100).toFixed(0)}% cheaper
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ROI Section */}
      {/* <Card>
        <CardHeader>
          <CardTitle>ROI Analysis</CardTitle>
          <CardDescription>Return on investment for this period</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Cost this period</p>
              <p className="text-2xl font-bold">${costs.total.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenue generated</p>
              <p className="text-2xl font-bold">${revenue.estimated.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ROI</p>
              <p className="text-2xl font-bold">{roi.multiplier.toFixed(1)}x</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Savings vs Human</p>
              <p className="text-2xl font-bold text-green-600">${savings.vs_human.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Escalation Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Escalation Analysis</CardTitle>
          <CardDescription>Human handoff metrics and costs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Escalations</p>
              <p className="text-2xl font-bold">{calls.escalated}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Escalation Rate</p>
              <p className="text-2xl font-bold">{escalation_rate}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Target</p>
              <p className="text-2xl font-bold text-muted-foreground">&lt;10%</p>
            </div>
          </div>
          {escalation_rate > 10 && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    Escalation rate is above target
                  </p>
                  <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-1">
                    Consider reviewing escalation patterns and adding knowledge base documents to reduce escalations.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{calls.total}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Calls</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{calls.successful}</div>
              <div className="text-xs text-muted-foreground mt-1">Successful</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{calls.escalated}</div>
              <div className="text-xs text-muted-foreground mt-1">Escalated</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{calls.failed}</div>
              <div className="text-xs text-muted-foreground mt-1">Failed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

