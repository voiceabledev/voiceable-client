import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Sparkles,
  Linkedin,
  Github,
  Twitter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const footerLinks = {
  product: ["Docs", "Pricing", "Features", "Security"],
  company: ["Blog", "Careers", "Community", "Contact"],
  legal: ["Privacy Policy", "Terms"]
};

// LLM Options organized by provider
const llmOptions = {
  OpenAI: [
    { id: "gpt-4.1", name: "GPT-4.1", cost: 0.06 },
    { id: "gpt-4.1-mini", name: "GPT-4.1 Mini", cost: 0.01 },
    { id: "gpt-4.1-nano", name: "GPT-4.1 Nano", cost: 0.01 },
    { id: "gpt-4.5-preview", name: "GPT-4.5 Preview", cost: 2.12 },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", cost: 0.01 },
    { id: "gpt-4o", name: "GPT-4o", cost: 0.07 },
    { id: "chatgpt-4o", name: "ChatGPT-4o (Latest)", cost: 0.14 },
    { id: "gpt-4o-realtime-preview", name: "GPT-4o Mini Realtime Preview", cost: 0.28 },
    { id: "gpt-4o-realtime", name: "GPT-4o Realtime Preview", cost: 1.14 },
    { id: "o3", name: "O3", cost: 0.28 },
    { id: "o3-mini", name: "O3 Mini", cost: 0.03 },
    { id: "o4-mini", name: "O4 Mini", cost: 0.04 },
    { id: "o1-preview", name: "O1 Preview", cost: 0.43 },
    { id: "o1-mini", name: "O1 Mini", cost: 0.03 },
  ],
  Anthropic: [
    { id: "claude-3-opus", name: "Claude 3 Opus", cost: 0.09 },
    { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", cost: 0.09 },
    { id: "claude-3.5-haiku", name: "Claude 3.5 Haiku", cost: 0.09 },
    { id: "claude-3.7-sonnet", name: "Claude 3.7 Sonnet", cost: 0.09 },
  ],
  XAI: [
    { id: "grok-beta", name: "Grok Beta", cost: 0.14 },
    { id: "grok-2", name: "Grok 2", cost: 0.06 },
    { id: "grok-3", name: "Grok 3", cost: 0.06 },
  ],
  Mistral: [
    { id: "mistral-large", name: "Mistral Large", cost: 0.002 },
    { id: "pixtral-large", name: "Pixtral Large", cost: 0.002 },
    { id: "mistral-small", name: "Mistral Small", cost: 0.0001 },
  ],
  Google: [
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", cost: 0.09 },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", cost: 0.09 },
    { id: "gemini-1.0-pro", name: "Gemini 1.0 Pro", cost: 0.09 },
    { id: "gemini-2.0-flash-thinking", name: "Gemini 2.0 Flash Thinking (Experimental)", cost: 0.09 },
    { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite Preview", cost: 0.09 },
    { id: "gemini-2.0-pro", name: "Gemini 2.0 Pro", cost: 0.09 },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", cost: 0.09 },
    { id: "gemma-3", name: "Gemma-3 via OpenRouter", cost: 0.09 },
  ],
  "Inflection AI": [
    { id: "inflection-3-pi", name: "Inflection 3 Pi", cost: 0.01 },
  ],
  "Together AI": [
    { id: "together-default", name: "Default", cost: 0.0009 },
  ],
  Anyscale: [
    { id: "anyscale-default", name: "Default", cost: 0.001 },
  ],
  OpenRouter: [
    { id: "openrouter-default", name: "Default", cost: 0.0005 },
  ],
  "Perplexity AI": [
    { id: "perplexity-default", name: "Default", cost: 0.001 },
  ],
  DeepInfra: [
    { id: "deepinfra-default", name: "Default", cost: 0.0007 },
  ],
  Groq: [
    { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B Instant", cost: 0.001 },
    { id: "llama3-8b-8192", name: "Llama3 8B 8192", cost: 0.001 },
    { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B 32768", cost: 0.01 },
    { id: "gemma2-9b-it", name: "Gemma2 9B IT", cost: 0.01 },
    { id: "deepseek-r1-distill-llama-70b", name: "Deepseek R1 Distill Llama 70B", cost: 0.02 },
    { id: "llama-3.3-70b-versatile", name: "Llama-3.3 70B Versatile", cost: 0.02 },
    { id: "llama-3.1-70b-versatile", name: "Llama-3.1 70B Versatile", cost: 0.02 },
  ],
  DeepSeek: [
    { id: "deepseek-v3", name: "DeepSeek V3", cost: 0.01 },
    { id: "deepseek-r1", name: "DeepSeek R1", cost: 0.02 },
  ],
  Cerebras: [
    { id: "llama-3.3-70b", name: "Llama 3.3 70B", cost: 0.02 },
    { id: "llama-3.1-8b", name: "Llama 3.1 8B", cost: 0.0001 },
  ],
};

// Transport options
const transportOptions = [
  { id: "twilio-inbound", name: "Twilio Inbound", cost: 0.008 },
  { id: "twilio-outbound", name: "Twilio Outbound", cost: 0.014 },
];

// Constants
const HOSTING_COST_PER_MIN = 0.05;
const TTS_COST_PER_MIN = 0.036; // ElevenLabs default
const STT_COST_PER_MIN = 0.00667; // ElevenLabs default
const TOKENS_PER_MINUTE = 4066.667; // Average tokens per minute of conversation

const Pricing = () => {
  const navigate = useNavigate();
  const [callsPerMonth, setCallsPerMonth] = useState("100");
  const [callLength, setCallLength] = useState("10");
  const [promptTokens, setPromptTokens] = useState("1000");
  const [selectedTransport, setSelectedTransport] = useState("twilio-inbound");
  const [selectedLLM, setSelectedLLM] = useState("gpt-4.1");
  const [showContactSalesModal, setShowContactSalesModal] = useState(false);
  
  // Collapsible sections state
  const [isTransportOpen, setIsTransportOpen] = useState(true);
  const [isLLMOpen, setIsLLMOpen] = useState(true);

  // Calculate costs
  const calculateCosts = () => {
    const calls = parseInt(callsPerMonth) || 0;
    const length = parseFloat(callLength) || 0;
    const tokens = parseInt(promptTokens) || 0;
    
    const totalMinutes = calls * length;
    
    // Find selected LLM
    let llmCostPerMillion = 0.06; // Default to GPT-4.1
    for (const provider of Object.values(llmOptions)) {
      const llm = provider.find(l => l.id === selectedLLM);
      if (llm) {
        llmCostPerMillion = llm.cost;
        break;
      }
    }
    
    // Find selected transport
    const transport = transportOptions.find(t => t.id === selectedTransport);
    const transportCostPerMin = transport?.cost || 0.008;
    
    // Calculate individual costs
    const hostingCost = totalMinutes * HOSTING_COST_PER_MIN;
    const transportCost = totalMinutes * transportCostPerMin;
    const ttsCost = totalMinutes * TTS_COST_PER_MIN;
    const sttCost = totalMinutes * STT_COST_PER_MIN;
    
    // Calculate LLM tokens: (total minutes * tokens per minute) + (calls * prompt tokens)
    const llmTokens = (totalMinutes * TOKENS_PER_MINUTE) + (calls * tokens);
    const llmCost = (llmTokens / 1_000_000) * llmCostPerMillion;
    
    const totalCost = hostingCost + transportCost + ttsCost + sttCost + llmCost;
    
    return {
      hostingCost,
      transportCost,
      ttsCost,
      sttCost,
      llmCost,
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
        paygo: "10 included + $10 / line / mo",
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
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">Voiceable</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="/custom-agents" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Custom Agents</a>
            <a href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="https://contextor.mintlify.app/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Docs</a>
          </div>
          
          <Link to="/overview">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
              Open Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <span className="text-primary font-semibold uppercase tracking-wider text-sm">
            Pricing
          </span>
          <h1 className="text-5xl md:text-7xl font-light mt-4 max-w-4xl leading-tight">
            Simple, scalable pricing
          </h1>
        </div>
      </section>

      {/* Plan Headers */}
      <section className="py-12 px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Pay As You Go */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-light">Pay As You Go</h2>
              <p className="text-primary font-medium">Usage based</p>
              <Button
                variant="outline"
                className="w-full max-w-xs uppercase tracking-wider text-xs py-6"
                onClick={() => navigate("/sign-up")}
              >
                Start with $10 Free
              </Button>
            </div>

            {/* Enterprise */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-light">Enterprise</h2>
              <p className="text-primary font-medium">Annual contract</p>
              <Button 
                className="w-full max-w-xs uppercase tracking-wider text-xs py-6"
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
        <div className="max-w-5xl mx-auto">
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
        <div className="max-w-5xl mx-auto">
          <span className="text-muted-foreground uppercase tracking-wider text-sm">
            Usage Calculator
          </span>
          <h2 className="text-4xl md:text-5xl font-light mt-4 mb-16">
            Estimate your cost
          </h2>

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
              <span className="font-medium">${HOSTING_COST_PER_MIN.toFixed(2)} / min</span>
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
                        {transportOptions.find(t => t.id === selectedTransport)?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${transportOptions.find(t => t.id === selectedTransport)?.cost.toFixed(3)} / min
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
                    {transportOptions.map((option) => (
                      <div key={option.id} className="flex items-center justify-between px-5 py-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors">
                        <Label htmlFor={option.id} className="flex items-center gap-2 cursor-pointer flex-1">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <span>{option.name}</span>
                        </Label>
                        <span className="font-medium">${option.cost.toFixed(3)} / min</span>
                      </div>
                    ))}
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
                          for (const provider of Object.values(llmOptions)) {
                            const model = provider.find(m => m.id === selectedLLM);
                            if (model) return model.name;
                          }
                          return "";
                        })()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${(() => {
                          for (const provider of Object.values(llmOptions)) {
                            const model = provider.find(m => m.id === selectedLLM);
                            if (model) return model.cost.toFixed(2);
                          }
                          return "0.00";
                        })()} / 1M tokens
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
                    {Object.entries(llmOptions).map(([provider, models]) => (
                      <fieldset key={provider} className="border-0 p-0 m-0">
                        <legend className="text-sm font-semibold text-muted-foreground mb-2 pl-1">
                          {provider}
                        </legend>
                        <div className="space-y-2 ml-4">
                          {models.map((model) => (
                            <div
                              key={model.id}
                              className="flex items-center justify-between px-5 py-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors"
                            >
                              <Label htmlFor={model.id} className="flex items-center gap-2 cursor-pointer flex-1">
                                <RadioGroupItem value={model.id} id={model.id} />
                                <span>{model.name}</span>
                              </Label>
                              <span className="font-medium">${model.cost.toFixed(2)} / 1M tokens</span>
                            </div>
                          ))}
                        </div>
                      </fieldset>
                    ))}
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
              <span className="font-medium">${TTS_COST_PER_MIN.toFixed(3)} / min</span>
            </div>

            {/* STT */}
            <div className="flex justify-between items-center py-4 border-b border-border/50">
              <div>
                <h3 className="font-medium">Speech-to-Text (STT)</h3>
                <p className="text-sm text-muted-foreground">
                  Accurate, high-speed speech recognition
                </p>
              </div>
              <span className="font-medium">${STT_COST_PER_MIN.toFixed(5)} / min</span>
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
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light mb-12">
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

      {/* Footer */}
      <footer className="py-16 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl text-foreground">Voiceable</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Voiceable is the most configurable platform for engineering teams to deploy voice agents at scale.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-xs tracking-widest text-muted-foreground mb-4">PRODUCT</h4>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-foreground hover:text-primary transition-colors text-sm">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-xs tracking-widest text-muted-foreground mb-4">COMPANY</h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-foreground hover:text-primary transition-colors text-sm">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-xs tracking-widest text-muted-foreground mb-4">LEGAL</h4>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-foreground hover:text-primary transition-colors text-sm">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* World map placeholder */}
          <div className="border-t border-border pt-8 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">© 2025 Voiceable, Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Sales Modal */}
      <Dialog open={showContactSalesModal} onOpenChange={setShowContactSalesModal}>
        <DialogContent className="max-w-4xl w-full h-[90vh] max-h-[800px] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
            <DialogTitle>Schedule a Meeting</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden min-h-0">
            <iframe
              src="https://calendly.com/imvitoroliveira"
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
