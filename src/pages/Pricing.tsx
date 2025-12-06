import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";

const footerLinks = {
  product: ["Docs", "Pricing", "Features", "Security"],
  company: ["Blog", "Careers", "Community", "Contact"],
  legal: ["Privacy Policy", "Terms"]
};

const Pricing = () => {
  const [callsPerMonth, setCallsPerMonth] = useState("1000");
  const [callLength, setCallLength] = useState("1");
  const [promptTokens, setPromptTokens] = useState("1000");
  const [transport, setTransport] = useState("");
  const [llm, setLlm] = useState("");
  const [tts, setTts] = useState("");
  const [stt, setStt] = useState("");

  const hostingCost = 0.05;
  const totalMinutes =
    (parseInt(callsPerMonth) || 0) * (parseFloat(callLength) || 0);
  const estimatedCost = totalMinutes * hostingCost;

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
      { feature: "SMS/Chat", paygo: "$0.005 / msg", enterprise: "Volume based" },
    ],
    modelProvider: [
      { feature: "Calls", paygo: "At cost", enterprise: "Included" },
      { feature: "SMS/Chat", paygo: "At cost", enterprise: "Included" },
    ],
    channels: [
      { feature: "Calls", paygo: true, enterprise: true },
      { feature: "SMS/Chat", paygo: true, enterprise: true },
      { feature: "Custom SIP", paygo: false, enterprise: true },
    ],
    dataRetention: [
      { feature: "Call history", paygo: "14 days", enterprise: "Custom" },
      { feature: "Chat history", paygo: "30 days", enterprise: "Custom" },
    ],
    security: [
      { feature: "SSO", paygo: false, enterprise: true },
      { feature: "RBAC", paygo: false, enterprise: true },
      { feature: "SOC2", paygo: false, enterprise: true },
      {
        feature: "HIPAA Zero Data Retention",
        paygo: "Add-on $1000/mo",
        enterprise: true,
      },
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
    {
      question: "How does credit equate to minutes?",
      answer:
        "Credits are based on usage. The hosting cost is $0.05 per minute, plus model provider costs which vary based on the LLM, TTS, and STT providers you choose.",
    },
    {
      question: "How much does Chat cost?",
      answer:
        "Chat messages cost $0.005 per message for hosting, plus model provider costs. Enterprise customers get volume-based pricing.",
    },
    {
      question: "How can I get more than 14 days of call and chat history?",
      answer:
        "Enterprise plans include custom data retention periods. Contact sales to discuss your requirements.",
    },
    {
      question: "What is Hosting Cost?",
      answer:
        "Hosting cost covers the infrastructure to run your voice agents, including real-time processing, low-latency connections, and reliability.",
    },
    {
      question: "Does Hosting Cost include model providers?",
      answer:
        "No, model provider costs (LLM, TTS, STT) are separate and charged at cost for pay-as-you-go, or included for enterprise customers.",
    },
    {
      question: "If I use my own Model Provider keys, am I still charged?",
      answer:
        "You'll only pay the hosting cost. Model provider charges will go directly to your provider account.",
    },
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
            <span className="font-bold text-xl text-foreground">Voice AI</span>
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
              >
                Start with $10 Free
              </Button>
            </div>

            {/* Enterprise */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-light">Enterprise</h2>
              <p className="text-primary font-medium">Annual contract</p>
              <Button className="w-full max-w-xs uppercase tracking-wider text-xs py-6">
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
                {renderSection(
                  "Model Provider Cost (STT, LLM, TTS)",
                  <Layers className="w-4 h-4 text-primary" />,
                  comparisonData.modelProvider
                )}
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
                {renderSection(
                  "Security and Compliance",
                  <Shield className="w-4 h-4 text-primary" />,
                  comparisonData.security
                )}
                {renderSection(
                  "Reliability and Support",
                  <Headphones className="w-4 h-4 text-primary" />,
                  comparisonData.support
                )}
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
            <div className="flex justify-between items-center py-4 border-b border-border/50">
              <div>
                <h3 className="font-medium">Hosting</h3>
                <p className="text-sm text-muted-foreground">
                  Container hosting for your agents
                </p>
              </div>
              <span className="font-medium">$0.05 / min</span>
            </div>

            <div className="flex justify-between items-center py-4 border-b border-border/50">
              <div>
                <h3 className="font-medium">Transport</h3>
                <p className="text-sm text-muted-foreground">
                  Network and data transport services
                </p>
              </div>
              <Select value={transport} onValueChange={setTransport}>
                <SelectTrigger className="w-48 bg-background/50">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twilio">Twilio</SelectItem>
                  <SelectItem value="vonage">Vonage</SelectItem>
                  <SelectItem value="custom">Custom SIP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center py-4 border-b border-border/50">
              <div>
                <h3 className="font-medium">Large Language Model (LLM)</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced language processing and generation
                </p>
              </div>
              <Select value={llm} onValueChange={setLlm}>
                <SelectTrigger className="w-48 bg-background/50">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt4">GPT-4</SelectItem>
                  <SelectItem value="gpt35">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude">Claude 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center py-4 border-b border-border/50">
              <div>
                <h3 className="font-medium">Text-to-Speech (TTS)</h3>
                <p className="text-sm text-muted-foreground">
                  Natural, high-quality speech synthesis
                </p>
              </div>
              <Select value={tts} onValueChange={setTts}>
                <SelectTrigger className="w-48 bg-background/50">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                  <SelectItem value="azure">Azure TTS</SelectItem>
                  <SelectItem value="google">Google TTS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center py-4 border-b border-border/50">
              <div>
                <h3 className="font-medium">Speech-to-Text (STT)</h3>
                <p className="text-sm text-muted-foreground">
                  Accurate, high-speed speech recognition
                </p>
              </div>
              <Select value={stt} onValueChange={setStt}>
                <SelectTrigger className="w-48 bg-background/50">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deepgram">Deepgram</SelectItem>
                  <SelectItem value="whisper">Whisper</SelectItem>
                  <SelectItem value="azure">Azure STT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center py-6 border-t-2 border-border">
              <h3 className="text-xl font-medium">Total Monthly Cost</h3>
              <span className="text-2xl font-semibold">
                ${estimatedCost.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <Button variant="outline" className="uppercase tracking-wider text-xs">
              Compare Services
            </Button>
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
                <span className="font-bold text-xl text-foreground">Voice AI</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Voice AI is the most configurable platform for engineering teams to deploy voice agents at scale.
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
            <p className="text-sm text-muted-foreground">© 2025 Voice AI, Inc. All rights reserved.</p>
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
    </div>
  );
};

export default Pricing;
