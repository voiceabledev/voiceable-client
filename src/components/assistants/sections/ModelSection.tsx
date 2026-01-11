import React, { useState, useEffect } from "react";
import { Code, ChevronDown, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { pricingSettingsApi, PricingSetting } from "@/lib/api";

type ModelSectionProps = {
  expanded: boolean;
  onToggleExpanded: () => void;
  selectedProvider: string;
  setSelectedProvider: (provider: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  providers: { value: string; label: string; icon: string }[];
  modelsByProvider: Record<string, { value: string; label: string }[]>;
};

// Default fallback pricing (used if API fails)
const DEFAULT_MODEL_PRICING: Record<string, string> = {
  "glm-45-air-fp8": "~$0.0131/min",
  "qwen3-30b-a3b": "~$0.0040/min",
  "gpt-oss-120b": "~$0.0035/min",
  "gemini-3-pro-preview": "~$0.0245/min",
  "gemini-3-flash-preview": "~$0.0061/min",
  "gemini-2.5-flash": "~$0.0018/min",
  "gemini-2.5-flash-lite": "~$0.0012/min",
  "gemini-2.0-flash": "~$0.0012/min",
  "gemini-2.0-flash-lite": "~$0.0009/min",
  "gpt-5": "~$0.0161/min",
  "gpt-5.1": "~$0.0161/min",
  "gpt-5.2": "~$0.0225/min",
  "gpt-5-mini": "~$0.0032/min",
  "gpt-5-nano": "~$0.0006/min",
  "gpt-4.1": "~$0.0233/min",
  "gpt-4.1-mini": "~$0.0047/min",
  "gpt-4.1-nano": "~$0.0012/min",
  "gpt-4o": "~$0.0292/min",
  "gpt-4o-mini": "~$0.0018/min",
  "gpt-4-turbo": "~$0.1137/min",
  "gpt-3.5-turbo": "~$0.0057/min",
  "claude-sonnet-4-5": "~$0.0359/min",
  "claude-sonnet-4": "~$0.0359/min",
  "claude-haiku-4-5": "~$0.0120/min",
  "claude-3-7-sonnet": "~$0.0359/min",
  "claude-3-5-sonnet": "~$0.0359/min",
  "claude-3-haiku": "~$0.0030/min",
};

// Get model name from modelsByProvider
const getModelName = (provider: string, modelId: string, modelsByProvider: Record<string, { value: string; label: string }[]>): string => {
  const models = modelsByProvider[provider];
  return models?.find(m => m.value === modelId)?.label || modelId;
};

// Helper to get pricing with commission from API data
const getPricingWithCommission = (model: string, pricingSettings: PricingSetting[]): string => {
  const setting = pricingSettings.find(
    s => s.category === 'llm' && s.model_id === model && s.active && s.cost_per_million_tokens
  );
  
  if (setting && setting.cost_per_million_tokens) {
    // Convert per-million-tokens to per-minute (approximate)
    // Based on ~4066 tokens per minute average
    const costPerMinute = (setting.cost_per_million_tokens / 1000000) * 4066.667;
    const priceWithCommission = costPerMinute * (1 + COMMISSION_MARKUP);
    return `~$${priceWithCommission.toFixed(4)}/min`;
  }
  
  // Fallback to default pricing
  return DEFAULT_MODEL_PRICING[model] || "~$0.01/min";
};

// Map models to quality levels for business users
const getModelQuality = (provider: string, model: string, modelsByProvider: Record<string, { value: string; label: string }[]>, pricingSettings: PricingSetting[], commissionMarkup: number): { level: number; label: string; cost: string; modelName: string } => {
  const pricing = getPricingWithCommission(model, pricingSettings, commissionMarkup);
  const modelName = getModelName(provider, model, modelsByProvider);
  
  // Determine quality level based on provider and model
  if (provider === "anthropic") {
    if (model.includes("sonnet-4") || model.includes("sonnet-4.5") || model === "claude-sonnet-4-5" || model === "claude-sonnet-4") {
      return { level: 5, label: "Best (Recommended)", cost: pricing, modelName };
    }
    if (model.includes("sonnet") || model.includes("3-7") || model.includes("3-5")) {
      return { level: 4, label: "Best (Recommended)", cost: pricing, modelName };
    }
    if (model.includes("haiku")) {
      return { level: 3, label: "Standard", cost: pricing, modelName };
    }
  }
  if (provider === "openai") {
    if (model === "gpt-5.2" || model === "gpt-5" || model === "gpt-5.1" || model.includes("gpt-4.1")) {
      return { level: 5, label: "Best (Recommended)", cost: pricing, modelName };
    }
    if (model === "gpt-4o" || model === "gpt-4-turbo") {
      return { level: 4, label: "Best (Recommended)", cost: pricing, modelName };
    }
    if (model === "gpt-4o-mini") {
      return { level: 3, label: "Standard", cost: pricing, modelName };
    }
    if (model === "gpt-3.5-turbo" || model === "gpt-5-mini" || model === "gpt-4.1-mini") {
      return { level: 2, label: "Economy", cost: pricing, modelName };
    }
    if (model === "gpt-5-nano" || model === "gpt-4.1-nano") {
      return { level: 1, label: "Economy", cost: pricing, modelName };
    }
  }
  if (provider === "google") {
    if (model === "gemini-3-pro-preview") {
      return { level: 5, label: "Best (Recommended)", cost: pricing, modelName };
    }
    if (model === "gemini-3-flash-preview" || model === "gemini-2.5-flash") {
      return { level: 3, label: "Standard", cost: pricing, modelName };
    }
    if (model === "gemini-2.5-flash-lite" || model === "gemini-2.0-flash") {
      return { level: 2, label: "Economy", cost: pricing, modelName };
    }
    if (model === "gemini-2.0-flash-lite") {
      return { level: 1, label: "Economy", cost: pricing, modelName };
    }
  }
  if (provider === "elevenlabs") {
    if (model === "glm-45-air-fp8") {
      return { level: 3, label: "Standard", cost: pricing, modelName };
    }
    if (model === "qwen3-30b-a3b" || model === "gpt-oss-120b") {
      return { level: 2, label: "Economy", cost: pricing, modelName };
    }
  }
  // Default
  return { level: 3, label: "Standard", cost: pricing, modelName };
};

export const ModelSection: React.FC<ModelSectionProps> = ({
  expanded,
  onToggleExpanded,
  selectedProvider,
  setSelectedProvider,
  selectedModel,
  setSelectedModel,
  providers,
  modelsByProvider,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pricingSettings, setPricingSettings] = useState<PricingSetting[]>([]);
  const [commissionMarkup, setCommissionMarkup] = useState<number>(0.70); // Default fallback

  // Fetch pricing settings
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await pricingSettingsApi.list({ category: 'llm' });
        if (response.data) {
          setPricingSettings(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching pricing settings:", error);
        // Continue with default pricing if API fails
      }
    };
    fetchPricing();
  }, []);

  // Fetch commission markup
  useEffect(() => {
    const fetchCommissionMarkup = async () => {
      try {
        const response = await pricingSettingsApi.getCommissionMarkup();
        if (response.data?.commission_markup !== undefined) {
          setCommissionMarkup(response.data.commission_markup);
        }
      } catch (error) {
        console.error("Error fetching commission markup:", error);
        // Fallback to default 0.70 if API fails
        setCommissionMarkup(0.70);
      }
    };
    fetchCommissionMarkup();
  }, []);
  
  const quality = getModelQuality(selectedProvider, selectedModel, modelsByProvider, pricingSettings, commissionMarkup);
  const qualityDots = "●".repeat(quality.level) + "○".repeat(5 - quality.level);

  return (
    <div>
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
        <Code className="h-4 w-4" />
        <span>AI PERFORMANCE</span>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 md:p-6">
        <button className="w-full flex items-start justify-between gap-2" onClick={onToggleExpanded}>
          <div className="text-left flex-1">
            <h3 className="text-base md:text-lg font-semibold">AI Performance</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              Configure the AI model quality for your agent. Higher quality = better conversations.
            </p>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1",
              expanded && "rotate-180"
            )}
          />
        </button>

        {expanded && (
          <div className="mt-4 md:mt-6 space-y-4">
            {!showAdvanced ? (
              <>
                {/* Simple Mode: Quality Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">AI Quality</label>
                  <div className="flex flex-col md:flex-row items-stretch md:items-start gap-3">
                    <div className="flex-1 w-full">
                      <Select
                        value={`${selectedProvider}:${selectedModel}`}
                        onValueChange={(value) => {
                          const [provider, model] = value.split(":");
                          setSelectedProvider(provider);
                          setSelectedModel(model);
                        }}
                      >
                        <SelectTrigger className="bg-white border-border w-full">
                          <SelectValue>
                            {(() => {
                              const q = getModelQuality(selectedProvider, selectedModel, modelsByProvider, pricingSettings, commissionMarkup);
                              return (
                                <div className="flex items-center justify-between w-full gap-2">
                                  <span className="text-xs md:text-sm font-medium truncate">
                                    {q.label} - {q.modelName}
                                  </span>
                                  <span className="text-[10px] md:text-xs text-muted-foreground flex-shrink-0">
                                    {q.cost}
                                  </span>
                                </div>
                              );
                            })()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-[400px] shadow-xl border border-border/50 rounded-lg p-1.5 bg-popover">
                          <SelectItem 
                            value="anthropic:claude-sonnet-4-5" 
                            className="group rounded-md py-3.5 px-3 hover:bg-accent/50 data-[highlighted]:bg-accent/50 transition-all cursor-pointer border-b border-border/30 last:border-b-0"
                          >
                            <div className="flex flex-col w-full gap-2">
                              <div className="flex items-center justify-between w-full gap-3">
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <span className="text-sm font-bold text-foreground group-hover:text-white group-data-[highlighted]:text-white whitespace-nowrap transition-colors">Best</span>
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary group-hover:bg-primary/40 group-hover:text-white group-data-[highlighted]:bg-primary/40 group-data-[highlighted]:text-white font-medium transition-colors">Recommended</span>
                                </div>
                                <span className="text-xs font-semibold text-primary group-hover:text-white group-data-[highlighted]:text-white whitespace-nowrap flex-shrink-0 transition-colors">
                                  {getPricingWithCommission("claude-sonnet-4-5", pricingSettings)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between w-full">
                                <span className="text-sm font-medium text-foreground/90 group-hover:text-white group-data-[highlighted]:text-white transition-colors">Claude Sonnet 4.5</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-foreground/60 group-hover:text-white/80 group-data-[highlighted]:text-white/80 font-mono transition-colors">●●●●●</span>
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem 
                            value="openai:gpt-4o-mini" 
                            className="group rounded-md py-3.5 px-3 hover:bg-accent/50 data-[highlighted]:bg-accent/50 transition-all cursor-pointer border-b border-border/30 last:border-b-0"
                          >
                            <div className="flex flex-col w-full gap-2">
                              <div className="flex items-center justify-between w-full gap-3">
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <span className="text-sm font-bold text-foreground group-hover:text-white group-data-[highlighted]:text-white whitespace-nowrap transition-colors">Standard</span>
                                </div>
                                <span className="text-xs font-semibold text-muted-foreground group-hover:text-white group-data-[highlighted]:text-white whitespace-nowrap flex-shrink-0 transition-colors">
                                  {getPricingWithCommission("gpt-4o-mini", pricingSettings)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between w-full">
                                <span className="text-sm font-medium text-foreground/90 group-hover:text-white group-data-[highlighted]:text-white transition-colors">GPT-4o Mini</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-foreground/60 group-hover:text-white/80 group-data-[highlighted]:text-white/80 font-mono transition-colors">●●●○○</span>
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem 
                            value="openai:gpt-5-nano" 
                            className="group rounded-md py-3.5 px-3 hover:bg-accent/50 data-[highlighted]:bg-accent/50 transition-all cursor-pointer border-b border-border/30 last:border-b-0"
                          >
                            <div className="flex flex-col w-full gap-2">
                              <div className="flex items-center justify-between w-full gap-3">
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <span className="text-sm font-bold text-foreground group-hover:text-white group-data-[highlighted]:text-white whitespace-nowrap transition-colors">Economy</span>
                                </div>
                                <span className="text-xs font-semibold text-muted-foreground group-hover:text-white group-data-[highlighted]:text-white whitespace-nowrap flex-shrink-0 transition-colors">
                                  {getPricingWithCommission("gpt-5-nano", pricingSettings)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between w-full">
                                <span className="text-sm font-medium text-foreground/90 group-hover:text-white group-data-[highlighted]:text-white transition-colors">GPT-5 Nano</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-foreground/60 group-hover:text-white/80 group-data-[highlighted]:text-white/80 font-mono transition-colors">●●○○○</span>
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-2">
                        {quality.label === "Best (Recommended)" && `${quality.modelName} - Highest quality responses, most natural conversations, best for complex tasks`}
                        {quality.label === "Standard" && `${quality.modelName} - Good balance of quality and cost, suitable for most use cases`}
                        {quality.label === "Economy" && `${quality.modelName} - Cost-effective option, suitable for simple conversations`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvanced(true)}
                      className="w-full md:w-auto whitespace-nowrap border border-border"
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
                        setSelectedProvider(value);
                        const models = modelsByProvider[value];
                        if (models && models.length > 0) {
                          setSelectedModel(models[0].value);
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
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
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
        )}
      </div>
    </div>
  );
};
