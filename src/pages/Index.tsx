import { Button } from "@/components/ui/button";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Phone, 
  PhoneOutgoing, 
  Globe, 
  Layers, 
  TestTube, 
  Code, 
  Terminal,
  Beaker,
  ArrowRight,
  Shield,
  Rocket,
  Clock,
  FileCheck,
  BookOpen,
  Users,
  Linkedin,
  Github,
  Twitter,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";

const faqs = [
  {
    question: "What is Voice AI Studio?",
    answer: "Voice AI Studio is a comprehensive platform for building, deploying, and managing AI-powered voice agents. It provides everything you need to create natural-sounding voice interactions at scale."
  },
  {
    question: "How is this more cost-effective for my organisation?",
    answer: "Our platform reduces development time by 80% with pre-built components and templates. You only pay for what you use, with no hidden infrastructure costs."
  },
  {
    question: "What is the difference from other AI voice competitors?",
    answer: "We offer sub-500ms latency, 99.99% uptime, and complete API flexibility. Unlike competitors, we let you bring your own models and customize every aspect of the voice experience."
  },
  {
    question: "I need holistic customization, what types of support does your platform offer?",
    answer: "We provide dedicated engineering support, custom voice cloning, enterprise SLAs, and forward-deployed teams to help you go live quickly with full customization."
  },
  {
    question: "Is it difficult to set up?",
    answer: "Not at all. You can deploy your first voice agent in minutes with our quickstart templates, or build a custom solution in days with our comprehensive SDK."
  }
];

const features = [
  {
    icon: Globe,
    title: "Multilingual",
    description: "Talk to agents in English, Spanish, Mandarin, or one of 100+ other supported languages."
  },
  {
    icon: Layers,
    title: "API-native",
    description: "Everything is exposed as an API, with 1000s of configurations and integrations."
  },
  {
    icon: TestTube,
    title: "Automated testing",
    description: "Design test suites of simulated voice agents to identify hallucination risks before going to production."
  },
  {
    icon: Code,
    title: "Bring your own models",
    description: "Bring your own API keys for transcription, LLM, or text-to-speech models. Or, plug in your own self-hosted models."
  },
  {
    icon: Terminal,
    title: "Tool calling",
    description: "Plug in your APIs as tools to intelligently fetch data and perform actions on your server."
  },
  {
    icon: Beaker,
    title: "A/B experiments",
    description: "Test different variations of prompts, voices, and flows to continuously optimize performance."
  }
];

const enterpriseFeatures = [
  {
    icon: Clock,
    title: "99.99% uptime",
    description: "Our custom real-time audio infrastructure operates with enterprise-grade reliability.",
    color: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
  },
  {
    icon: Rocket,
    title: "Forward-deployed team",
    description: "Get deployment assistance and a dedicated forward-deployed engineer to go live in a week.",
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
  },
  {
    icon: Phone,
    title: "Sub-500ms latency",
    description: "Scale up and down to millions of calls in minutes with ultra-low latency interactions.",
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
  },
  {
    icon: Shield,
    title: "AI guardrails",
    description: "Built-in conversation guardrails prevent model hallucinations and ensure data integrity.",
    color: "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400"
  },
  {
    icon: FileCheck,
    title: "SOC2, HIPAA, PCI compliant",
    description: "Enterprise-level security for even the most regulated healthcare and financial services.",
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
  }
];

const steps = [
  {
    number: "001",
    title: "Choose your workflow.",
    description: "Pick from 1000s of pre-made templates, or build one yourself."
  },
  {
    number: "002",
    title: "Plug it in.",
    description: "Whether it's in your telephony, website, or in your app, we have it covered."
  },
  {
    number: "003",
    title: "Done.",
    description: "Handle millions of calls and watch how they perform."
  }
];

const communityStats = [
  { label: "CONFIGURATION POINTS", value: "4.2K+" },
  { label: "SUPPORT TOPICS", value: "13K+" },
  { label: "FOLLOWERS", value: "9.6K+" }
];

const communityLinks = [
  { icon: BookOpen, title: "Docs", href: "#" },
  { icon: Users, title: "Community", href: "#" },
  { icon: Linkedin, title: "LinkedIn", href: "#" }
];

const footerLinks = {
  product: ["Docs", "Pricing", "Features", "Security"],
  company: ["Blog", "Careers", "Community", "Contact"],
  legal: ["Privacy Policy", "Terms"]
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
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
            <a href="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Docs</a>
          </div>
          
          <Link to="/overview">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
              Open Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Voice AI agents<br />for developers
          </h1>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-6 text-base rounded-full" asChild>
              <Link to="/sign-up">
                SIGN UP <Sparkles className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="font-semibold px-8 py-6 text-base rounded-full border-2">
              READ THE DOCS <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          
          {/* Animated wave visualization placeholder */}
          <div className="relative h-64 md:h-80 flex items-center justify-center">
            <div className="flex gap-1 items-end">
              {Array.from({ length: 40 }).map((_, i) => (
                <div 
                  key={i}
                  className="w-2 md:w-3 rounded-full animate-pulse"
                  style={{ 
                    height: `${Math.sin(i * 0.3) * 60 + 80}px`,
                    backgroundColor: `hsl(${(i * 9) % 360}, 70%, 60%)`,
                    animationDelay: `${i * 0.05}s`
                  }}
                />
              ))}
            </div>
            
            {/* Talk button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button size="lg" variant="secondary" className="rounded-full px-8 py-6 bg-card shadow-lg border border-border">
                TALK TO AI <span className="ml-2">🎤</span>
              </Button>
            </div>
          </div>
          
          {/* Trusted by logos placeholder */}
          <div className="mt-16 border-t border-border pt-8">
            <div className="flex items-center justify-center gap-12 flex-wrap opacity-60">
              <span className="text-lg font-semibold text-muted-foreground">unity<sup>AI</sup></span>
              <span className="text-lg font-semibold text-muted-foreground">Intuit</span>
              <span className="text-lg font-semibold text-muted-foreground">Delphi</span>
              <span className="text-lg font-semibold text-muted-foreground">Housecall Pro</span>
              <span className="text-lg font-semibold text-muted-foreground">Cherry</span>
            </div>
          </div>
        </div>
      </section>

      {/* API Section */}
      <section className="py-24 px-6 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto">
          <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-4 text-center">API</p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-12">
            Making voice AI simple<br />and accessible.
          </h2>
          
          <div className="bg-muted/50 rounded-2xl border border-border overflow-hidden max-w-4xl mx-auto">
            <div className="flex gap-4 p-4 border-b border-border bg-muted/30">
              <span className="px-4 py-2 bg-background rounded-lg text-sm font-medium flex items-center gap-2">
                <Code className="w-4 h-4 text-primary" /> TypeScript
              </span>
              <span className="px-4 py-2 text-muted-foreground text-sm">Python</span>
              <span className="px-4 py-2 text-muted-foreground text-sm">cURL</span>
              <span className="px-4 py-2 text-muted-foreground text-sm">React (web SDK)</span>
            </div>
            
            <div className="p-6 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">
{`# npm install @voice-ai/server-sdk
import { VoiceClient } from '@voice-ai/server-sdk';

const client = new VoiceClient({
  token: 'YOUR_PRIVATE_API_KEY' // Get from dashboard
});

async function createCall() {
  const call = await client.calls.create({
    phoneNumberId: 'YOUR_PHONE_NUMBER_ID',
    customer: { number: '+1234567890' },
    assistant: {
      model: {
        provider: 'openai',
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant.'
          }
        ]
      }
    }
  });
}`}
              </pre>
            </div>
            
            <div className="flex items-center gap-4 p-4 border-t border-border">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Github className="w-4 h-4 mr-2" /> View on Github
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Client SDK
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Server SDK
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-muted-foreground font-semibold text-sm tracking-widest uppercase mb-4">USE CASES</p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-12">
            Feels human.<br />Moves the needle.
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Tabs */}
            <div>
              <div className="flex gap-4 mb-8">
                <Button className="bg-primary text-primary-foreground rounded-full px-6">
                  <Phone className="w-4 h-4 mr-2" /> Inbound calls
                </Button>
                <Button variant="ghost" className="text-muted-foreground rounded-full px-6">
                  <PhoneOutgoing className="w-4 h-4 mr-2" /> Outbound calls
                </Button>
              </div>
              
              <div className="space-y-6">
                <p className="text-primary font-medium">Inbound calls</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  <span className="text-primary">Voice AI</span> powers 400,000+ daily calls.<br />
                  <span className="font-normal text-muted-foreground">FleetWorks saves 100s<br />of engineering hours monthly.</span>
                </p>
                
                <div className="flex gap-4">
                  <Button variant="outline" className="rounded-full">
                    CASE STUDY <Sparkles className="ml-2 w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="rounded-full">
                    TRY IT NOW <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
                
                <div className="border-t border-border pt-6 mt-8">
                  <blockquote className="text-muted-foreground italic">
                    "A key technical requirement was the ability to bring our own stack — Voice AI's developer-friendly API-first approach made this possible."
                  </blockquote>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20" />
                    <div>
                      <p className="font-medium text-foreground">Quang Tran</p>
                      <p className="text-sm text-muted-foreground">CTO, FLEETWORKS</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Visual */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 flex items-center justify-center">
              <div className="space-y-4">
                <div className="bg-card rounded-xl p-4 shadow-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium text-foreground">Receive call</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">SHIPPER INFO</span>
                  </div>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-lg border border-border ml-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">Use tool</span>
                  </div>
                  <p className="text-xs text-muted-foreground">🔗 Fetch_available_jobs_from_broker</p>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-lg border border-border ml-16">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500">💡</span>
                    <span className="font-medium text-foreground">Condition</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">JOB AVAILABLE?</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-24 px-6 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto">
          <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-4">HOW IT WORKS</p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16">
            Try in minutes.<br />Deploy in days.
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="bg-background rounded-2xl border border-border p-8 hover:shadow-lg transition-shadow">
                <span className="inline-block px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium mb-6">
                  {step.number}
                </span>
                
                {/* Abstract visual */}
                <div className="h-40 flex items-center justify-center mb-6">
                  <div className="flex gap-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div 
                        key={i}
                        className="w-2 rounded-full"
                        style={{ 
                          height: `${Math.sin(i * 0.5 + index * 2) * 30 + 50}px`,
                          backgroundColor: `hsl(${(i * 20 + index * 60) % 360}, 60%, 60%)`
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-amber-500 font-semibold text-sm tracking-widest uppercase mb-4">FEATURES</p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16">
            Flexible for engineers.<br />Easy for business users.
          </h2>
          
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4 pb-8 border-b border-border">
                <div className="flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-background to-card">
        <div className="max-w-7xl mx-auto">
          <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-4">ENTERPRISE</p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16 flex items-center flex-wrap gap-4">
            Reliable. <Shield className="w-10 h-10 text-primary" /> Scalable. <Sparkles className="w-10 h-10 text-accent" /> Secure.
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-6">
              {enterpriseFeatures.map((feature, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${feature.color}`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Lock visualization */}
            <div className="flex items-center justify-center">
              <div className="grid grid-cols-12 gap-1">
                {Array.from({ length: 144 }).map((_, i) => {
                  const row = Math.floor(i / 12);
                  const col = i % 12;
                  const isLockShape = (
                    (row >= 0 && row <= 4 && col >= 3 && col <= 8 && (col <= 4 || col >= 7 || row >= 3)) ||
                    (row >= 4 && row <= 11 && col >= 1 && col <= 10)
                  );
                  return (
                    <div 
                      key={i}
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        backgroundColor: isLockShape 
                          ? `hsl(${(i * 7) % 360}, 60%, 55%)` 
                          : 'transparent'
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-24 px-6 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto">
          <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-4">COMMUNITY</p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16">
            250,000+ devs are already<br />here. Join the movement.
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {communityStats.map((stat, index) => (
              <div key={index} className="bg-background rounded-2xl border border-border p-8">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs font-semibold tracking-widest text-muted-foreground">{stat.label}</span>
                  <span className="text-lg font-bold text-primary">{stat.value}</span>
                </div>
                
                {/* Icon grid */}
                <div className="grid grid-cols-8 gap-1 mb-8">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div 
                      key={i}
                      className="w-2 h-2 rounded-full bg-border"
                    />
                  ))}
                </div>
                
                <h3 className="text-2xl font-bold text-foreground">{communityLinks[index].title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Your questions,<br />answered.
              </h2>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-border pb-4">
                  <AccordionTrigger className="text-left text-foreground font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground italic mb-12">
            Get started today
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-6 text-base rounded-full">
              SIGN UP <Sparkles className="ml-2 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="font-semibold px-8 py-6 text-base rounded-full border-2">
              READ THE DOCS <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          
          {/* Workflow diagram placeholder */}
          <div className="flex items-center justify-center gap-4 flex-wrap opacity-60">
            <div className="bg-muted rounded-lg px-4 py-2 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Start call
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="bg-muted rounded-lg px-4 py-2 text-sm">API Request</div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="bg-muted rounded-lg px-4 py-2 text-sm">Send SMS</div>
          </div>
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
}
