import React, { useState } from "react";
import { Code, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { providers, modelsByProvider } from "../constants";

interface ModelStepProps {
  selectedProvider: string;
  selectedModel: string;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
}

// Map models to quality levels for business users
const getModelQuality = (provider: string, model: string): { level: number; label: string; cost: string } => {
  // Default to best quality
  if (provider === "openai") {
    if (model.includes("gpt-5") || model.includes("gpt-4.1")) {
      return { level: 5, label: "Best (Recommended)", cost: "~$0.15 per minute" };
    }
    if (model.includes("gpt-4o") || model === "gpt-4") {
      return { level: 4, label: "Best (Recommended)", cost: "~$0.15 per minute" };
    }
    if (model.includes("gpt-4")) {
      return { level: 4, label: "Best (Recommended)", cost: "~$0.15 per minute" };
    }
    if (model.includes("gpt-3.5")) {
      return { level: 3, label: "Standard", cost: "~$0.05 per minute" };
    }
  }
  if (provider === "anthropic") {
    if (model.includes("sonnet-4") || model.includes("sonnet-4.5")) {
      return { level: 5, label: "Best (Recommended)", cost: "~$0.20 per minute" };
    }
    if (model.includes("sonnet")) {
      return { level: 4, label: "Best (Recommended)", cost: "~$0.15 per minute" };
    }
    if (model.includes("haiku")) {
      return { level: 3, label: "Standard", cost: "~$0.08 per minute" };
    }
  }
  // Default
  return { level: 4, label: "Best (Recommended)", cost: "~$0.15 per minute" };
};

export function ModelStep({
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
}: ModelStepProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const quality = getModelQuality(selectedProvider, selectedModel);
  const qualityDots = "●".repeat(quality.level) + "○".repeat(5 - quality.level);

  return (
    <div>
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
        <Code className="h-4 w-4" />
        <span>AI PERFORMANCE</span>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 md:p-6">
        <div className="text-left flex-1">
          <h3 className="text-base md:text-lg font-semibold">AI Performance</h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Configure the AI model quality for your agent. Higher quality = better conversations.
          </p>
        </div>

        <div className="mt-4 md:mt-6 space-y-4">
          {!showAdvanced ? (
            <>
              {/* Simple Mode: Quality Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">AI Quality</label>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <Select
                      value={`${selectedProvider}:${selectedModel}`}
                      onValueChange={(value) => {
                        const [provider, model] = value.split(":");
                        onProviderChange(provider);
                        onModelChange(model);
                      }}
                    >
                      <SelectTrigger className="bg-white border-border focus:ring-muted focus:ring-offset-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai:gpt-4o" className="group">
                          <div className="flex items-center justify-between w-full">
                            <span>●●●●○ Best (Recommended)</span>
                            <span className="text-xs text-muted-foreground group-focus:text-white ml-2">~$0.15/min</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="openai:gpt-4o-mini" className="group">
                          <div className="flex items-center justify-between w-full">
                            <span>●●●○○ Standard</span>
                            <span className="text-xs text-muted-foreground group-focus:text-accent-foreground ml-2">~$0.05/min</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="openai:gpt-3.5-turbo" className="group">
                          <div className="flex items-center justify-between w-full">
                            <span>●●○○○ Economy</span>
                            <span className="text-xs text-muted-foreground group-focus:text-accent-foreground ml-2">~$0.02/min</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2">
                      {quality.label === "Best (Recommended)" && "Fastest responses, most natural conversations"}
                      {quality.label === "Standard" && "Good quality, lower cost"}
                      {quality.label === "Economy" && "Basic conversations, lowest cost"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(true)}
                    className="mt-0 whitespace-nowrap border border-border"
                  >
                    Show Advanced Options
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Advanced Mode: Full Provider/Model Selection */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-2 block">Provider</label>
                  <Select
                    value={selectedProvider || "openai"}
                    onValueChange={(value) => {
                      onProviderChange(value);
                      const models = modelsByProvider[value];
                      if (models && models.length > 0) {
                        onModelChange(models[0].value);
                      }
                    }}
                  >
                    <SelectTrigger className="bg-white border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.value} value={provider.value}>
                          <span className="flex items-center gap-2">
                            <span>{provider.icon}</span>
                            <span>{provider.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm text-muted-foreground">Model</label>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <Select value={selectedModel} onValueChange={onModelChange}>
                    <SelectTrigger className="bg-white border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {modelsByProvider[selectedProvider]?.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(false)}
                className="w-full border border-border"
              >
                Hide Advanced Options
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
