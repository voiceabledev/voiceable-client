import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pricingSettingsApi, PricingSetting } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Check,
  Minus,
  TrendingUp,
  DollarSign,
  Layers,
  Phone,
  Database,
  Shield,
  Headphones,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Header from "@/components/landing-page/Header";
import Footer from "@/components/landing-page/Footer";

// Constants
const TOKENS_PER_MINUTE = 4066.667; // Average tokens per minute of conversation

// Default fallback values (used if API fails)
const DEFAULT_HOSTING_COST_PER_MIN = 0.05;
const DEFAULT_TTS_COST_PER_MIN = 0.036;
const DEFAULT_STT_COST_PER_MIN = 0.00667;
const DEFAULT_TRANSPORT_COSTS: Record<string, number> = {
  "twilio-inbound": 0.008,
  "twilio-outbound": 0.014,
};

const Pricing = () => {
  const navigate = useNavigate();
  const [callsPerMonth, setCallsPerMonth] = useState("100");
  const [callLength, setCallLength] = useState("10");
  const [promptTokens, setPromptTokens] = useState("1000");
  const [commissionMarkup, setCommissionMarkup] = useState<number>(0.70); // Default fallback
  const [selectedTransport, setSelectedTransport] = useState("twilio-inbound");
  const [selectedLLM, setSelectedLLM] = useState<string>("gpt-4.1");
  const [showContactSalesModal, setShowContactSalesModal] = useState(false);

  // Collapsible sections state
  const [isTransportOpen, setIsTransportOpen] = useState(true);
  const [isLLMOpen, setIsLLMOpen] = useState(true);

  // Pricing settings from API
  const [pricingSettings, setPricingSettings] = useState<PricingSetting[]>([]);
  const [loadingPricing, setLoadingPricing] = useState(true);

  // Fetch pricing settings
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await pricingSettingsApi.list();
        if (response.data) {
          const settings = response.data || [];
          console.log("Response:", response);
          console.log("Fetched pricing settings:", settings.length, "items");
          console.log("LLM settings:", settings.filter(s => s.category === 'llm').length);
          setPricingSettings(settings);
        }
      } catch (error) {
        console.error("Error fetching pricing settings:", error);
        // Continue with default values if API fails
      } finally {
        setLoadingPricing(false);
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

  // Organize pricing settings by category and provider
  const organizePricingSettings = () => {
    const organized: {
      llm: Record<string, Array<{ id: string; name: string; cost: number }>>;
      transport: Array<{ id: string; name: string; cost: number }>;
      hosting: number;
      tts: number;
      stt: number;
    } = {
      llm: {},
      transport: [],
      hosting: DEFAULT_HOSTING_COST_PER_MIN,
      tts: DEFAULT_TTS_COST_PER_MIN,
      stt: DEFAULT_STT_COST_PER_MIN,
    };

    pricingSettings.forEach((setting) => {
      if (!setting.active) return;

      if (setting.category === 'llm' && setting.model_id && setting.cost_per_million_tokens !== null && setting.cost_per_million_tokens !== undefined) {
        // Capitalize provider name properly (e.g., "elevenlabs" -> "ElevenLabs", "openai" -> "OpenAI")
        const providerName = setting.provider;
        const provider = providerName === 'elevenlabs' ? 'ElevenLabs' :
          providerName === 'openai' ? 'OpenAI' :
            providerName === 'anthropic' ? 'Anthropic' :
              providerName === 'google' ? 'Google' :
                providerName === 'meta' ? 'Meta' :
                  providerName === 'mistral' ? 'Mistral' :
                    providerName === 'cohere' ? 'Cohere' :
                      providerName === 'groq' ? 'Groq' :
                        providerName === 'perplexity' ? 'Perplexity' :
                          providerName.charAt(0).toUpperCase() + providerName.slice(1);
        if (!organized.llm[provider]) {
          organized.llm[provider] = [];
        }
        organized.llm[provider].push({
          id: setting.model_id,
          name: setting.name,
          cost: setting.cost_per_million_tokens,
        });
      } else if (setting.category === 'transport' && setting.cost_per_minute) {
        organized.transport.push({
          id: setting.model_id || setting.provider,
          name: setting.name,
          cost: setting.cost_per_minute,
        });
      } else if (setting.category === 'hosting' && setting.cost_per_minute) {
        organized.hosting = setting.cost_per_minute;
      } else if (setting.category === 'tts' && setting.cost_per_minute) {
        organized.tts = setting.cost_per_minute;
      } else if (setting.category === 'stt' && setting.cost_per_minute) {
        organized.stt = setting.cost_per_minute;
      }
    });

    return organized;
  };

  const pricingData = organizePricingSettings();

  // Debug logging
  useEffect(() => {
    if (pricingSettings.length > 0) {
      console.log("Pricing data organized:", {
        llmProviders: Object.keys(pricingData.llm),
        llmCount: Object.values(pricingData.llm).reduce((sum, models) => sum + models.length, 0),
        transportCount: pricingData.transport.length,
      });
    }
  }, [pricingSettings, pricingData]);

  // Calculate costs
  const calculateCosts = () => {
    const calls = parseInt(callsPerMonth) || 0;
    const length = parseFloat(callLength) || 0;
    const tokens = parseInt(promptTokens) || 0;

    const totalMinutes = calls * length;

    // Find selected LLM cost per million tokens
    let llmCostPerMillion = 0.0057; // Default fallback
    for (const providerModels of Object.values(pricingData.llm)) {
      const llm = providerModels.find(l => l.id === selectedLLM);
      if (llm) {
        llmCostPerMillion = llm.cost;
        break;
      }
    }

    // Find selected transport
    const transport = pricingData.transport.find(t => t.id === selectedTransport);
    const transportCostPerMin = transport?.cost || DEFAULT_TRANSPORT_COSTS[selectedTransport] || 0.008;

    // Base costs (at cost)
    const hostingCost = totalMinutes * pricingData.hosting;
    const transportCostBase = totalMinutes * transportCostPerMin;
    const ttsCostBase = totalMinutes * pricingData.tts;
    const sttCostBase = totalMinutes * pricingData.stt;

    // Calculate LLM tokens: (total minutes * tokens per minute) + (calls * prompt tokens)
    const llmTokens = (totalMinutes * TOKENS_PER_MINUTE) + (calls * tokens);
    const llmCostBase = (llmTokens / 1_000_000) * llmCostPerMillion;

    // Apply commission markup to provider costs
    const providerCostsBase = transportCostBase + ttsCostBase + sttCostBase + llmCostBase;
    const providerRevenue = providerCostsBase * (1 + commissionMarkup);

    // Total cost includes hosting (no commission) + provider revenue (with commission)
    const totalCost = hostingCost + providerRevenue;

    return {
      hostingCost,
      transportCostBase,
      ttsCostBase,
      sttCostBase,
      llmCostBase,
      providerCostsBase,
      providerRevenue,
      transportCost: transportCostBase * (1 + commissionMarkup),
      ttsCost: ttsCostBase * (1 + commissionMarkup),
      sttCost: sttCostBase * (1 + commissionMarkup),
      llmCost: llmCostBase * (1 + commissionMarkup),
      totalCost,
      totalMinutes,
      llmTokens,
    };
  };

  const costs = calculateCosts();

  const comparisonData = {
    usageAndScale: [
      { feature: "Call Minutes", paygo: "Usage based", enterprise: "Custom" },
      {
        feature: "Call Concurrency",
        paygo: "10 included + $5 / line / mo",
        enterprise: "Custom",
      },
    ],
    hostingCost: [
      { feature: "Calls", paygo: "$0.05 / min", enterprise: "Volume based" },
      // { feature: "SMS/Chat", paygo: "$0.005 / msg", enterprise: "Volume based" },
    ],
    modelProvider: [
      { feature: "Calls", paygo: "At cost", enterprise: "Included" },
      // { feature: "SMS/Chat", paygo: "At cost", enterprise: "Included" },
    ],
    channels: [
      { feature: "Calls", paygo: true, enterprise: true },
      // { feature: "SMS/Chat", paygo: true, enterprise: true },
      // { feature: "Custom SIP", paygo: false, enterprise: true },
    ],
    dataRetention: [
      { feature: "Call history", paygo: "14 days", enterprise: "Custom" },
      // { feature: "Chat history", paygo: "30 days", enterprise: "Custom" },
    ],
    security: [
      // { feature: "SSO", paygo: false, enterprise: true },
      // { feature: "RBAC", paygo: false, enterprise: true },
      // { feature: "SOC2", paygo: false, enterprise: true },
      // {
      //   feature: "HIPAA Zero Data Retention",
      //   paygo: "Add-on $1000/mo",
      //   enterprise: true,
      // },
    ],
    support: [
      { feature: "Infra SLA", paygo: "—", enterprise: "Enterprise Grade, 99.99%" },
      { feature: "Support SLA", paygo: "—", enterprise: "Custom Support SLA" },
      { feature: "Named Support Engineer", paygo: false, enterprise: true },
      { feature: "Account Manager", paygo: false, enterprise: true },
      { feature: "Priority Support", paygo: false, enterprise: true },
      {
        feature: "Support",
        paygo: "Community Discord, Email",
        enterprise: "Private Slack, Email",
      },
    ],
  };

  const faqs = [
    {
      question: "Can I try for free?",
      answer:
        "Yes! You can start with $10 free credit to test our platform. No credit card required.",
    },
    {
      question: "Can I get fixed monthly pricing instead of pay-as-you-go?",
      answer:
        "Yes, we offer enterprise plans with fixed monthly pricing. Contact our sales team to discuss your needs.",
    },
    {
      question: "Can I get volume discounts?",
      answer:
        "Absolutely! Enterprise customers receive volume-based pricing. The more you use, the more you save.",
    },
    {
      question: "What does pricing look like at scale?",
      answer:
        "At scale, enterprise customers benefit from custom pricing, dedicated support, and volume discounts. Contact sales for a personalized quote.",
    },
    // {
    //   question: "How does credit equate to minutes?",
    //   answer:
    //     "Credits are based on usage. The hosting cost is $0.05 per minute, plus model provider costs which vary based on the LLM, TTS, and STT providers you choose.",
    // },
    // {
    //   question: "How much does Chat cost?",
    //   answer:
    //     "Chat messages cost $0.005 per message for hosting, plus model provider costs. Enterprise customers get volume-based pricing.",
    // },
    {
      question: "How can I get more than 14 days of call history?",
      answer:
        "Enterprise plans include custom data retention periods. Contact sales to discuss your requirements.",
    },
    // {
    //   question: "What is Hosting Cost?",
    //   answer:
    //     "Hosting cost covers the infrastructure to run your voice agents, including real-time processing, low-latency connections, and reliability.",
    // },
    // {
    //   question: "Does Hosting Cost include model providers?",
    //   answer:
    //     "No, model provider costs (LLM, TTS, STT) are separate and charged at cost for pay-as-you-go, or included for enterprise customers.",
    // },
    // {
    //   question: "If I use my own Model Provider keys, am I still charged?",
    //   answer:
    //     "You'll only pay the hosting cost. Model provider charges will go directly to your provider account.",
    // },
  ];

  const renderValue = (value: boolean | string) => {
    if (value === true) {
      return (
        <div className="flex justify-center">
          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
            <Check className="w-3 h-3 text-primary" />
          </div>
        </div>
      );
    }
    if (value === false) {
      return (
        <div className="flex justify-center">
          <Minus className="w-4 h-4 text-muted-foreground" />
        </div>
      );
    }
    return <span className="text-muted-foreground">{value}</span>;
  };

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    items: { feature: string; paygo: boolean | string; enterprise: boolean | string }[]
  ) => (
    <>
      <tr className="bg-muted/30">
        <td className="py-4 px-6 font-semibold flex items-center gap-2">
          {icon}
          {title}
        </td>
        <td></td>
        <td></td>
      </tr>
      {items.map((item, index) => (
        <tr key={index} className="border-b border-border/50">
          <td className="py-4 px-6 text-foreground/80">{item.feature}</td>
          <td className="py-4 px-6 text-center">{renderValue(item.paygo)}</td>
          <td className="py-4 px-6 text-center">{renderValue(item.enterprise)}</td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-8">
            <div className="w-4 h-4 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary-foreground">$</span>
            </div>
            <span className="text-sm text-primary font-medium">Transparent Pricing</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto">
            Simple, scalable{" "}
            <span className="text-gradient-amber">pricing</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Pay only for what you use. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Plan Headers */}
      <section className="py-16 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Pay As You Go */}
            <div className="text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">Pay As You Go</h2>
              <p className="text-lg text-muted-foreground">Usage based pricing</p>
              <Button
                variant="outline"
                className="rounded-full px-8 py-6 text-base border-2 border-foreground hover:bg-secondary/50"
                onClick={() => navigate("/sign-up")}
              >
                Start with $10 Free
              </Button>
            </div>

            {/* Enterprise */}
            <div className="text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">Enterprise</h2>
              <p className="text-lg text-muted-foreground">Annual contract with custom pricing</p>
              <Button
                className="rounded-full px-8 py-6 text-base bg-foreground text-background hover:bg-foreground/90"
                onClick={() => setShowContactSalesModal(true)}
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground w-1/2"></th>
                  <th className="text-center py-4 px-6 font-medium text-muted-foreground">
                    Pay As You Go
                  </th>
                  <th className="text-center py-4 px-6 font-medium text-muted-foreground">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {renderSection(
                  "Usage and Scale",
                  <TrendingUp className="w-4 h-4 text-primary" />,
                  comparisonData.usageAndScale
                )}
                {renderSection(
                  "Hosting Cost",
                  <DollarSign className="w-4 h-4 text-primary" />,
                  comparisonData.hostingCost
                )}
                {/* {renderSection(
                  "Model Provider Cost (STT, LLM, TTS)",
                  <Layers className="w-4 h-4 text-primary" />,
                  comparisonData.modelProvider
                )} */}
                {renderSection(
                  "Channels",
                  <Phone className="w-4 h-4 text-primary" />,
                  comparisonData.channels
                )}
                {renderSection(
                  "Data Retention",
                  <Database className="w-4 h-4 text-primary" />,
                  comparisonData.dataRetention
                )}
                {/* {renderSection(
                  "Security and Compliance",
                  <Shield className="w-4 h-4 text-primary" />,
                  comparisonData.security
                )} */}
                {/* {renderSection(
                  "Reliability and Support",
                  <Headphones className="w-4 h-4 text-primary" />,
                  comparisonData.support
                )} */}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Usage Calculator */}
      <section className="py-24 px-6 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-primary font-semibold uppercase tracking-wider text-sm">
              Usage Calculator
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4">
              Estimate your <span className="text-gradient-amber">cost</span>
            </h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              Calculate your monthly costs based on your expected usage
            </p>
          </div>

          {/* Calculator Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Calls per month</label>
              <Input
                type="number"
                value={callsPerMonth}
                onChange={(e) => setCallsPerMonth(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Call length (mins)</label>
              <Input
                type="number"
                value={callLength}
                onChange={(e) => setCallLength(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Prompt tokens</label>
              <Input
                type="number"
                value={promptTokens}
                onChange={(e) => setPromptTokens(e.target.value)}
                className="bg-background/50"
              />
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-6">
            {/* Hosting */}
            <div className="flex justify-between items-center py-4 border-b border-border/50">
              <div>
                <h3 className="font-medium">Voiceable Hosting</h3>
                <p className="text-sm text-muted-foreground">
                  Container hosting for your agents
                </p>
              </div>
              <span className="font-medium">${pricingData.hosting.toFixed(4)} / min</span>
            </div>

            {/* Transport */}
            <div className="py-4 border-b border-border/50">
              <button
                onClick={() => setIsTransportOpen(!isTransportOpen)}
                className="flex items-start w-full mb-4 hover:opacity-80 transition-opacity text-left"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-left">Transport</h3>
                  {!isTransportOpen && selectedTransport ? (
                    <div className="mt-1">
                      <p className="text-sm font-medium text-foreground">
                        {pricingData.transport.find(t => t.id === selectedTransport)?.name || 'Transport'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${(() => {
                          const transport = pricingData.transport.find(t => t.id === selectedTransport);
                          const baseCost = transport?.cost || DEFAULT_TRANSPORT_COSTS[selectedTransport] || 0.008;
                          return (baseCost * (1 + commissionMarkup)).toFixed(4);
                        })()} / min (includes commission)
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-left">
                      Network and data transport services (Charged by provider)
                    </p>
                  )}
                </div>
                {isTransportOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground ml-4 flex-shrink-0 mt-1" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground ml-4 flex-shrink-0 mt-1" />
                )}
              </button>
              {isTransportOpen && (
                <RadioGroup
                  value={selectedTransport}
                  onValueChange={(value) => {
                    setSelectedTransport(value);
                    setIsTransportOpen(false);
                  }}
                >
                  <div className="space-y-2">
                    {pricingData.transport.length > 0 ? (
                      pricingData.transport.map((option) => {
                        const priceWithCommission = option.cost * (1 + commissionMarkup);
                        return (
                          <div key={option.id} className="flex items-center justify-between px-5 py-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors">
                            <Label htmlFor={option.id} className="flex items-center gap-2 cursor-pointer flex-1">
                              <RadioGroupItem value={option.id} id={option.id} />
                              <span>{option.name}</span>
                            </Label>
                            <span className="font-medium">${priceWithCommission.toFixed(4)} / min</span>
                          </div>
                        );
                      })
                    ) : (
                      // Fallback to default transport options if API data not available
                      Object.entries(DEFAULT_TRANSPORT_COSTS).map(([id, cost]) => {
                        const priceWithCommission = cost * (1 + commissionMarkup);
                        return (
                          <div key={id} className="flex items-center justify-between px-5 py-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors">
                            <Label htmlFor={id} className="flex items-center gap-2 cursor-pointer flex-1">
                              <RadioGroupItem value={id} id={id} />
                              <span>{id === 'twilio-inbound' ? 'Inbound' : 'Outbound'}</span>
                            </Label>
                            <span className="font-medium">${priceWithCommission.toFixed(4)} / min</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </RadioGroup>
              )}
            </div>

            {/* LLM */}
            <div className="py-4 border-b border-border/50">
              <button
                onClick={() => setIsLLMOpen(!isLLMOpen)}
                className="flex items-start w-full mb-4 hover:opacity-80 transition-opacity text-left"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-left">Large Language Model (LLM)</h3>
                  {!isLLMOpen && selectedLLM ? (
                    <div className="mt-1">
                      <p className="text-sm font-medium text-foreground">
                        {(() => {
                          for (const providerModels of Object.values(pricingData.llm)) {
                            const model = providerModels.find(m => m.id === selectedLLM);
                            if (model) return model.name;
                          }
                          return "";
                        })()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${(() => {
                          for (const providerModels of Object.values(pricingData.llm)) {
                            const model = providerModels.find(m => m.id === selectedLLM);
                            if (model) return (model.cost * (1 + commissionMarkup)).toFixed(4);
                          }
                          return "0.00";
                        })()} / 1M tokens (includes commission)
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-left">
                      Advanced language processing and generation
                    </p>
                  )}
                </div>
                {isLLMOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground ml-4 flex-shrink-0 mt-1" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground ml-4 flex-shrink-0 mt-1" />
                )}
              </button>
              {isLLMOpen && (
                <RadioGroup
                  value={selectedLLM}
                  onValueChange={(value) => {
                    setSelectedLLM(value);
                    setIsLLMOpen(false);
                  }}
                >
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {Object.keys(pricingData.llm).length > 0 ? (
                      Object.entries(pricingData.llm).map(([provider, models]) => (
                        <fieldset key={provider} className="border-0 p-0 m-0">
                          <legend className="text-sm font-semibold text-muted-foreground mb-2 pl-1">
                            {provider}
                          </legend>
                          <div className="space-y-2 ml-4">
                            {models.map((model) => {
                              const priceWithCommission = model.cost * (1 + commissionMarkup);
                              return (
                                <div
                                  key={model.id}
                                  className="flex items-center justify-between px-5 py-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors"
                                >
                                  <Label htmlFor={model.id} className="flex items-center gap-2 cursor-pointer flex-1">
                                    <RadioGroupItem value={model.id} id={model.id} />
                                    <span>{model.name}</span>
                                  </Label>
                                  <span className="font-medium">${priceWithCommission.toFixed(4)} / 1M tokens</span>
                                </div>
                              );
                            })}
                          </div>
                        </fieldset>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        {loadingPricing ? "Loading pricing..." : "No LLM models available. Please configure pricing in admin settings."}
                      </div>
                    )}
                  </div>
                </RadioGroup>
              )}
            </div>

            {/* TTS */}
            <div className="flex justify-between items-center py-4 border-b border-border/50">
              <div>
                <h3 className="font-medium">Text-to-Speech (TTS)</h3>
                <p className="text-sm text-muted-foreground">
                  Natural, high-quality speech synthesis
                </p>
              </div>
              <span className="font-medium">${(pricingData.tts * (1 + commissionMarkup)).toFixed(4)} / min</span>
            </div>

            {/* STT */}
            <div className="flex justify-between items-center py-4 border-b border-border/50">
              <div>
                <h3 className="font-medium">Speech-to-Text (STT)</h3>
                <p className="text-sm text-muted-foreground">
                  Accurate, high-speed speech recognition
                </p>
              </div>
              <span className="font-medium">${(pricingData.stt * (1 + commissionMarkup)).toFixed(4)} / min</span>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center py-6 border-t-2 border-border">
              <h3 className="text-xl font-medium">Total Monthly Cost</h3>
              <span className="text-2xl font-semibold">
                ${costs.totalCost.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-border/50 pb-4"
              >
                <AccordionTrigger className="text-left hover:no-underline text-lg font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />

      {/* Contact Sales Modal */}
      <Dialog open={showContactSalesModal} onOpenChange={setShowContactSalesModal}>
        <DialogContent className="max-w-7xl w-full h-[90vh] max-h-[800px] p-0 flex flex-col">
          <div className="flex-1 overflow-hidden min-h-0">
            <iframe
              src="https://cal.com/vitoroliveira/30min?overlayCalendar=true"
              className="w-full h-full border-0"
              title="Calendly Scheduling"
              allow="camera; microphone; geolocation"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;
