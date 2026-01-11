import React, { useState, useEffect, useMemo } from "react";
import { Code, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
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
const TOKENS_PER_MINUTE = 4066.667; // Average tokens per minute of conversation

const getPricingWithCommission = (model: string, pricingSettings: PricingSetting[], commissionMarkup: number): string => {
  const setting = pricingSettings.find(
    s => s.category === 'llm' && s.model_id === model && s.active
  );
  
  // Ensure commissionMarkup is a valid number, default to 0.70 if not
  const markup = typeof commissionMarkup === 'number' && !isNaN(commissionMarkup) ? commissionMarkup : 0.70;
  
  if (setting) {
    // Prefer cost_per_minute from database if available
    if (setting.cost_per_minute !== null && setting.cost_per_minute !== undefined) {
      const baseCostPerMinute = Number(setting.cost_per_minute);
      
      // Validate baseCostPerMinute is a valid number
      if (!isNaN(baseCostPerMinute) && baseCostPerMinute > 0) {
        // Apply commission markup to the base cost per minute
        const pricePerMinute = baseCostPerMinute * (1 + markup);
        
        // Format with appropriate precision - use 6 decimals for very small values
        // If value is less than 0.0001, show 6 decimals, otherwise 4
        const decimals = pricePerMinute < 0.0001 ? 6 : 4;
        return `~$${pricePerMinute.toFixed(decimals)}/min`;
      }
    }
    
    // Fallback to calculation from cost_per_million_tokens if cost_per_minute is not available
    if (setting.cost_per_million_tokens) {
      // Convert to number explicitly to avoid NaN
      const baseCost = Number(setting.cost_per_million_tokens);
      
      // Validate baseCost is a valid number
      if (!isNaN(baseCost) && baseCost > 0) {
        // Calculate price per 1M tokens with commission
        const pricePerMillionTokens = baseCost * (1 + markup);
        // Convert to per-minute: (price per 1M tokens / 1,000,000) * tokens per minute
        // Formula: (cost_per_million_tokens * (1 + markup) / 1,000,000) * TOKENS_PER_MINUTE
        const pricePerMinute = (pricePerMillionTokens / 1_000_000) * TOKENS_PER_MINUTE;
        
        // Validate result is a valid number
        if (!isNaN(pricePerMinute) && pricePerMinute > 0) {
          // Format with appropriate precision - use 6 decimals for very small values
          // If value is less than 0.0001, show 6 decimals, otherwise 4
          const decimals = pricePerMinute < 0.0001 ? 6 : 4;
          return `~$${pricePerMinute.toFixed(decimals)}/min`;
        }
      }
    }
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

// Build model list from pricing settings grouped by quality
const buildModelList = (
  pricingSettings: PricingSetting[],
  commissionMarkup: number,
  modelsByProvider: Record<string, { value: string; label: string }[]>
): {
  best: Array<{ provider: string; modelId: string; quality: ReturnType<typeof getModelQuality>; setting: PricingSetting }>;
  standard: Array<{ provider: string; modelId: string; quality: ReturnType<typeof getModelQuality>; setting: PricingSetting }>;
  economy: Array<{ provider: string; modelId: string; quality: ReturnType<typeof getModelQuality>; setting: PricingSetting }>;
} => {
  // Get all active LLM models from pricing settings
  const activeModels = pricingSettings.filter(
    (s) => s.category === "llm" && s.model_id && s.active && (s.cost_per_minute || s.cost_per_million_tokens)
  );

  // Map to model objects with provider and quality info
  const modelsWithQuality = activeModels.map((setting) => {
    const provider = setting.provider;
    const modelId = setting.model_id!;
    const quality = getModelQuality(provider, modelId, modelsByProvider, pricingSettings, commissionMarkup);
    return {
      provider,
      modelId,
      quality,
      setting,
    };
  });

  // Group by quality level
  const grouped = {
    best: modelsWithQuality.filter((m) => m.quality.level >= 4),
    standard: modelsWithQuality.filter((m) => m.quality.level === 3),
    economy: modelsWithQuality.filter((m) => m.quality.level <= 2),
  };

  return grouped;
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
  const [open, setOpen] = useState(false);
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
          const markup = Number(response.data.commission_markup);
          // Only update if it's a valid number
          if (!isNaN(markup) && markup >= 0 && markup <= 1) {
            setCommissionMarkup(markup);
          }
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

  // Build model list grouped by quality
  const modelGroups = useMemo(
    () => buildModelList(pricingSettings, commissionMarkup, modelsByProvider),
    [pricingSettings, commissionMarkup, modelsByProvider]
  );

  // Get provider label for search
  const getProviderLabel = (provider: string): string => {
    return providers.find((p) => p.value === provider)?.label || provider;
  };

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
            <div>
              <label className="text-sm font-medium mb-2 block">AI Quality</label>
              <div className="flex-1 w-full">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between bg-white border-border"
                    >
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-xs md:text-sm font-medium truncate">
                          {quality.label} - {quality.modelName}
                        </span>
                        <span className="text-[10px] md:text-xs text-muted-foreground flex-shrink-0">
                          {quality.cost}
                        </span>
                      </div>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-[280px] sm:max-w-none p-0" align="start">
                    <Command className="max-h-[400px]">
                      <CommandInput placeholder="Search models..." />
                      <CommandList>
                        <CommandEmpty>No models found.</CommandEmpty>
                        {modelGroups.best.length > 0 && (
                          <CommandGroup heading="Best (Recommended)">
                            {modelGroups.best.map((model) => {
                              const dots = "●".repeat(model.quality.level) + "○".repeat(5 - model.quality.level);
                              const providerLabel = getProviderLabel(model.provider);
                              return (
                                <CommandItem
                                  key={`${model.provider}:${model.modelId}`}
                                  value={`${model.quality.modelName} ${providerLabel} ${model.provider} ${model.modelId}`}
                                  onSelect={() => {
                                    setSelectedProvider(model.provider);
                                    setSelectedModel(model.modelId);
                                    setOpen(false);
                                  }}
                                  className="group rounded-md py-3.5 px-3 hover:bg-accent/50 data-[selected='true']:bg-accent/50 transition-all cursor-pointer"
                                >
                                  <div className="flex items-center justify-between w-full gap-3">
                                    <span className="text-sm font-medium text-foreground/90 group-hover:text-white group-data-[selected='true']:text-white transition-colors flex-1">
                                      {model.quality.modelName}
                                    </span>
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs text-foreground/60 group-hover:text-white/80 group-data-[selected='true']:text-white/80 font-mono transition-colors">
                                        {dots}
                                      </span>
                                      <span className="text-xs font-semibold text-primary group-hover:text-white group-data-[selected='true']:text-white whitespace-nowrap flex-shrink-0 transition-colors">
                                        {model.quality.cost}
                                      </span>
                                    </div>
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        )}
                        {modelGroups.standard.length > 0 && (
                          <CommandGroup heading="Standard">
                            {modelGroups.standard.map((model) => {
                              const dots = "●".repeat(model.quality.level) + "○".repeat(5 - model.quality.level);
                              const providerLabel = getProviderLabel(model.provider);
                              return (
                                <CommandItem
                                  key={`${model.provider}:${model.modelId}`}
                                  value={`${model.quality.modelName} ${providerLabel} ${model.provider} ${model.modelId}`}
                                  onSelect={() => {
                                    setSelectedProvider(model.provider);
                                    setSelectedModel(model.modelId);
                                    setOpen(false);
                                  }}
                                  className="group rounded-md py-3.5 px-3 hover:bg-accent/50 data-[selected='true']:bg-accent/50 transition-all cursor-pointer"
                                >
                                  <div className="flex items-center justify-between w-full gap-3">
                                    <span className="text-sm font-medium text-foreground/90 group-hover:text-white group-data-[selected='true']:text-white transition-colors flex-1">
                                      {model.quality.modelName}
                                    </span>
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs text-foreground/60 group-hover:text-white/80 group-data-[selected='true']:text-white/80 font-mono transition-colors">
                                        {dots}
                                      </span>
                                      <span className="text-xs font-semibold text-muted-foreground group-hover:text-white group-data-[selected='true']:text-white whitespace-nowrap flex-shrink-0 transition-colors">
                                        {model.quality.cost}
                                      </span>
                                    </div>
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        )}
                        {modelGroups.economy.length > 0 && (
                          <CommandGroup heading="Economy">
                            {modelGroups.economy.map((model) => {
                              const dots = "●".repeat(model.quality.level) + "○".repeat(5 - model.quality.level);
                              const providerLabel = getProviderLabel(model.provider);
                              return (
                                <CommandItem
                                  key={`${model.provider}:${model.modelId}`}
                                  value={`${model.quality.modelName} ${providerLabel} ${model.provider} ${model.modelId}`}
                                  onSelect={() => {
                                    setSelectedProvider(model.provider);
                                    setSelectedModel(model.modelId);
                                    setOpen(false);
                                  }}
                                  className="group rounded-md py-3.5 px-3 hover:bg-accent/50 data-[selected='true']:bg-accent/50 transition-all cursor-pointer"
                                >
                                  <div className="flex items-center justify-between w-full gap-3">
                                    <span className="text-sm font-medium text-foreground/90 group-hover:text-white group-data-[selected='true']:text-white transition-colors flex-1">
                                      {model.quality.modelName}
                                    </span>
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs text-foreground/60 group-hover:text-white/80 group-data-[selected='true']:text-white/80 font-mono transition-colors">
                                        {dots}
                                      </span>
                                      <span className="text-xs font-semibold text-muted-foreground group-hover:text-white group-data-[selected='true']:text-white whitespace-nowrap flex-shrink-0 transition-colors">
                                        {model.quality.cost}
                                      </span>
                                    </div>
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground mt-2">
                  {quality.label === "Best (Recommended)" &&
                    `${quality.modelName} - Highest quality responses, most natural conversations, best for complex tasks`}
                  {quality.label === "Standard" &&
                    `${quality.modelName} - Good balance of quality and cost, suitable for most use cases`}
                  {quality.label === "Economy" &&
                    `${quality.modelName} - Cost-effective option, suitable for simple conversations`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
