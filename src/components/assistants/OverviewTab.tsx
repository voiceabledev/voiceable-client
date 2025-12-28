import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Phone, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Play, 
  CheckCircle2, 
  XCircle,
  Info,
  Zap
} from "lucide-react";
import type { Agent } from "@/types/assistant";
import { modelsByProvider } from "@/constants/assistant";
import { CostAndLatency } from "./sections/CostAndLatency";

type OverviewTabProps = {
  agent: Agent | null;
  onTestCall?: () => void;
};

// Cost calculation constants
const HOSTING_COST_PER_MIN = 0.008;
const TRANSPORT_COST_PER_MIN = 0.008;
const TTS_COST_PER_MIN = 0.01;
const STT_COST_PER_MIN = 0.006;
const TOKENS_PER_MINUTE = 1500; // Average tokens per minute of conversation

// Model cost per million tokens
const getModelCost = (provider: string, model: string): number => {
  if (provider === "openai") {
    if (model.includes("gpt-5") || model.includes("gpt-4.1")) {
      return 60; // $60 per million tokens
    }
    if (model.includes("gpt-4o") || model === "gpt-4") {
      return 15; // $15 per million tokens
    }
    if (model.includes("gpt-4")) {
      return 30; // $30 per million tokens
    }
    if (model.includes("gpt-3.5")) {
      return 0.5; // $0.5 per million tokens
    }
  }
  if (provider === "anthropic") {
    if (model.includes("sonnet-4") || model.includes("sonnet-4.5")) {
      return 75; // $75 per million tokens
    }
    if (model.includes("sonnet")) {
      return 15; // $15 per million tokens
    }
    if (model.includes("haiku")) {
      return 1.25; // $1.25 per million tokens
    }
  }
  // Default
  return 15;
};

export const OverviewTab: React.FC<OverviewTabProps> = ({ agent, onTestCall }) => {
  const [callsPerMonth, setCallsPerMonth] = useState("100");
  const [avgCallLength, setAvgCallLength] = useState("5");

  const costPerMinute = useMemo(() => {
    if (!agent) return 0;

    const provider = agent.provider || "openai";
    const model = agent.model || "gpt-4o";
    const modelCostPerMillion = getModelCost(provider, model);
    
    // Calculate cost per minute
    const hostingCost = HOSTING_COST_PER_MIN;
    const transportCost = TRANSPORT_COST_PER_MIN;
    const ttsCost = TTS_COST_PER_MIN;
    const sttCost = STT_COST_PER_MIN;
    
    // LLM cost: (tokens per minute / 1M) * cost per million
    const llmCost = (TOKENS_PER_MINUTE / 1_000_000) * modelCostPerMillion;
    
    return hostingCost + transportCost + ttsCost + sttCost + llmCost;
  }, [agent]);

  const monthlyCost = useMemo(() => {
    const calls = parseInt(callsPerMonth) || 0;
    const length = parseFloat(avgCallLength) || 0;
    const totalMinutes = calls * length;
    return totalMinutes * costPerMinute;
  }, [callsPerMonth, avgCallLength, costPerMinute]);

  const costSegments = useMemo(() => {
    if (!agent) return [];
    
    const provider = agent.provider || "openai";
    const model = agent.model || "gpt-4o";
    const modelCostPerMillion = getModelCost(provider, model);
    const llmCost = (TOKENS_PER_MINUTE / 1_000_000) * modelCostPerMillion;
    
    const hostingCost = HOSTING_COST_PER_MIN;
    const transportCost = TRANSPORT_COST_PER_MIN;
    const ttsCost = TTS_COST_PER_MIN;
    const sttCost = STT_COST_PER_MIN;
    
    const total = hostingCost + transportCost + ttsCost + sttCost + llmCost;
    
    return [
      {
        className: "bg-blue-500",
        tooltip: { 
          label: "AI Model (LLM)", 
          value: `$${llmCost.toFixed(4)}/min - Cost for AI language model processing` 
        },
        width: `${(llmCost / total) * 100}%`,
      },
      {
        className: "bg-green-500",
        tooltip: { 
          label: "Voice (Text-to-Speech)", 
          value: `$${ttsCost.toFixed(4)}/min - Cost for converting text to speech` 
        },
        width: `${(ttsCost / total) * 100}%`,
      },
      {
        className: "bg-yellow-500",
        tooltip: { 
          label: "Transcription (Speech-to-Text)", 
          value: `$${sttCost.toFixed(4)}/min - Cost for converting speech to text` 
        },
        width: `${(sttCost / total) * 100}%`,
      },
      {
        className: "bg-purple-500",
        tooltip: { 
          label: "Transport", 
          value: `$${transportCost.toFixed(4)}/min - Cost for call routing and network transport` 
        },
        width: `${(transportCost / total) * 100}%`,
      },
      {
        className: "bg-gray-500",
        tooltip: { 
          label: "Hosting", 
          value: `$${hostingCost.toFixed(4)}/min - Infrastructure and platform hosting costs` 
        },
        width: `${(hostingCost / total) * 100}%`,
      },
    ];
  }, [agent]);

  if (!agent) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No agent selected</p>
      </div>
    );
  }

  const modelLabel = modelsByProvider[agent.provider || "openai"]?.find(
    m => m.value === agent.model
  )?.label || agent.model;

  return (
    <div className="space-y-6">
      {/* Agent Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Summary</CardTitle>
          <CardDescription>Quick overview of your agent configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Name</Label>
              <p className="text-sm font-medium mt-1">{agent.name || "Unnamed Agent"}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">AI Model</Label>
              <p className="text-sm font-medium mt-1">{modelLabel}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Voice</Label>
              <p className="text-sm font-medium mt-1">{agent.voice_id || "Not set"}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Language</Label>
              <p className="text-sm font-medium mt-1 capitalize">{agent.language || "english"}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex flex-wrap gap-2">
            <Badge variant={agent.published ? "default" : "secondary"}>
              {agent.published ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Published
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Draft
                </>
              )}
            </Badge>
            {agent.hipaa_compliance && (
              <Badge variant="outline">HIPAA Compliant</Badge>
            )}
            {agent.logging && (
              <Badge variant="outline">Logging Enabled</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cost Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost Calculator
          </CardTitle>
          <CardDescription>
            Estimate your monthly costs based on usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cost per minute indicator */}
          <div>
            <CostAndLatency
              cost={{
                value: costPerMinute.toFixed(3),
                unit: "/min",
                segments: costSegments,
              }}
              latency={{
                value: "1.2",
                unit: "s",
                segments: [
                  {
                    className: "bg-green-500",
                    tooltip: { 
                      label: "Average Response Time", 
                      value: "1.2 seconds - Time from user speech to AI response" 
                    },
                    width: "100%",
                  },
                ],
              }}
            />
          </div>

          {/* Usage inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="calls-per-month">Calls per Month</Label>
              <Input
                id="calls-per-month"
                type="number"
                value={callsPerMonth}
                onChange={(e) => setCallsPerMonth(e.target.value)}
                className="mt-2"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="avg-call-length">Average Call Length (minutes)</Label>
              <Input
                id="avg-call-length"
                type="number"
                value={avgCallLength}
                onChange={(e) => setAvgCallLength(e.target.value)}
                className="mt-2"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          {/* Monthly estimate */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Estimated Monthly Cost</span>
              <span className="text-2xl font-bold">
                ${monthlyCost.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {callsPerMonth} calls × {avgCallLength} min × ${costPerMinute.toFixed(3)}/min
            </p>
          </div>

          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-900 dark:text-blue-100">
              Costs are estimates based on average usage patterns. Actual costs may vary based on conversation complexity, 
              actual token usage, and provider pricing changes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test Agent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Test Your Agent
          </CardTitle>
          <CardDescription>
            Make a test call to verify your agent is working correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the button below to initiate a test call. This will connect you to your agent so you can verify 
              it's responding correctly and handling conversations as expected.
            </p>
            <Button 
              onClick={onTestCall}
              className="w-full md:w-auto"
              size="lg"
            >
              <Phone className="h-4 w-4 mr-2" />
              Start Test Call
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Stats
          </CardTitle>
          <CardDescription>
            Overview of your agent's performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">-</div>
              <div className="text-xs text-muted-foreground mt-1">Total Calls</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">-</div>
              <div className="text-xs text-muted-foreground mt-1">Success Rate</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">-</div>
              <div className="text-xs text-muted-foreground mt-1">Avg Duration</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Stats will appear here once your agent starts receiving calls
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

