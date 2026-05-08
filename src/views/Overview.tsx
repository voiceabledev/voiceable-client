"use client"

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Phone, Clock, CreditCard, TrendingDown, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { metricsApi, agentsApi, type Agent } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Metric {
  label: string;
  value: string;
  unit?: string;
  change: string;
  icon: typeof Phone;
}

export default function Overview() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");
  const [metrics, setMetrics] = useState<Metric[]>([
    {
      label: "Number of Calls",
      value: "0",
      change: "0.0%",
      icon: Phone,
    },
    {
      label: "Avg Duration",
      value: "0:00",
      change: "0.0%",
      icon: Clock,
    },
    {
      label: "Total Cost",
      value: "0",
      unit: "credits",
      change: "0.0%",
      icon: CreditCard,
    },
    {
      label: "Avg Cost",
      value: "0",
      unit: "cr/call",
      change: "0.0%",
      icon: TrendingDown,
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);

  // Calculate date range based on selected period
  const getDateRange = useCallback((period: string) => {
    const now = Math.floor(Date.now() / 1000);
    let startTime: number;

    switch (period) {
      case "week":
        startTime = now - 7 * 24 * 60 * 60;
        break;
      case "month":
        startTime = now - 30 * 24 * 60 * 60;
        break;
      case "year":
        startTime = now - 365 * 24 * 60 * 60;
        break;
      default:
        startTime = now - 30 * 24 * 60 * 60; // Default to month
    }

    return {
      call_start_after_unix: startTime,
      call_start_before_unix: now,
    };
  }, []);

  // Fetch agents for the filter dropdown
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await agentsApi.list();
        if (response.data) {
          setAgents(response.data);
        }
      } catch (err) {
        console.error("Error fetching agents:", err);
      }
    };
    fetchAgents();
  }, []);

  // Fetch metrics
  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const dateRange = getDateRange(selectedPeriod);
      const agentId = selectedAgent === "all" ? undefined : selectedAgent;

      const response = await metricsApi.get({
        agent_id: agentId,
        ...dateRange,
      });

      if (response.data) {
        const data = response.data;
        
        // Calculate percentage change (for now, we'll show 0% as we don't have previous period data)
        // In the future, you can fetch previous period metrics and calculate the change
        const change = "0.0%";

        // Safely handle undefined/null values with defaults
        const numberOfCalls = data.numberOfCalls ?? 0;
        const avgDuration = data.avgDuration ?? "0:00";
        const totalCost = data.totalCost ?? 0;
        const avgCost = data.avgCost ?? 0;

        setMetrics([
          {
            label: "Number of Calls",
            value: numberOfCalls.toString(),
            change,
            icon: Phone,
          },
          {
            label: "Avg Duration",
            value: avgDuration,
            change,
            icon: Clock,
          },
          {
            label: "Total Cost",
            value: totalCost.toFixed(2),
            unit: "credits",
            change,
            icon: CreditCard,
          },
          {
            label: "Avg Cost",
            value: avgCost.toFixed(2),
            unit: "cr/call",
            change,
            icon: TrendingDown,
          },
        ]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch metrics";
      console.error("Error fetching metrics:", err);
      toast({
        title: "Error loading metrics",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedAgent, selectedPeriod, getDateRange, toast]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0">
        <Header showDocs />
      </div>
      
      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 md:p-8">
          {/* Metrics Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 gap-4">
          <h2 className="text-lg md:text-xl font-semibold">Metrics</h2>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-full md:w-40 bg-transparent border-border text-sm">
                <SelectValue placeholder="All Assistants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assistants</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name || `Agent ${agent.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full md:w-36 bg-transparent border-border text-sm">
                <SelectValue placeholder="Last Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            metrics.map((metric) => (
              <div key={metric.label} className="metric-card animate-fade-in">
                <p className="text-muted-foreground text-xs md:text-sm mb-2 md:mb-3">{metric.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-4xl font-bold">{metric.value}</span>
                  {metric.unit && (
                    <span className="text-muted-foreground text-xs md:text-sm">{metric.unit}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-2 text-muted-foreground text-xs md:text-sm">
                  <span>—</span>
                  <span>{metric.change}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Call Success Section */}
        <div className="bg-card border border-border rounded-lg p-4 md:p-6 min-h-[300px] md:min-h-[400px]">
          <h3 className="text-base md:text-lg font-semibold mb-4">Call Success</h3>
          <p className="text-muted-foreground text-lg md:text-xl">--</p>
          
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center h-48 md:h-72">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Phone className="h-5 w-5 md:h-7 md:w-7 text-muted-foreground" />
            </div>
            <p className="text-base md:text-lg font-medium">Oops...</p>
            <p className="text-muted-foreground text-xs md:text-sm">You don't have any calls yet</p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
