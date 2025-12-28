import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { agentMetricsApi, type AgentROI } from "@/lib/api";
import type { Agent } from "@/types/assistant";

type DashboardTabProps = {
  agent: Agent | null;
  agentId: string;
};

export const DashboardTab: React.FC<DashboardTabProps> = ({ agent, agentId }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [roiData, setRoiData] = useState<AgentROI | null>(null);
  const [dateRange, setDateRange] = useState<{ start_date?: string; end_date?: string }>({});

  const fetchMetrics = useCallback(async () => {
    if (!agentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await agentMetricsApi.getROI(agentId, dateRange);
      if (response.data?.data) {
        setRoiData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
      toast({
        title: "Error loading metrics",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [agentId, dateRange, toast]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!roiData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-muted-foreground">No metrics data available yet.</p>
        <p className="text-sm text-muted-foreground">
          Metrics will appear here once your agent starts receiving calls.
        </p>
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
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
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
            <CardTitle className="text-sm font-medium">Appointments Booked</CardTitle>
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
            <CardTitle className="text-sm font-medium">Cost per Booking</CardTitle>
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
      <Card>
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
      </Card>

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

