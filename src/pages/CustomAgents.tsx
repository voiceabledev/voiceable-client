import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Zap,
  MessageSquare,
  Wrench,
  Cpu,
  Phone,
  Wifi,
  Users,
  ChevronDown,
  Clock,
  ArrowRight,
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

const CustomAgents = () => {
  const [activeStep, setActiveStep] = useState(0);

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Ultra low latency",
      description: "Responses in under 500ms for seamless, real-time conversations.",
      link: "LATENCY GUIDE",
      visual: (
        <div className="bg-card rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {["Voice", "Tools", "Model", "Settings", "Analysis"].map((tab, i) => (
                <button
                  key={tab}
                  className={`px-3 py-1 text-xs rounded-full ${
                    i === 0
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-muted-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <span className="px-3 py-1 text-xs border border-border rounded-full">CODE</span>
          </div>
          <div className="space-y-4">
            <div className="text-muted-foreground text-sm">Latency</div>
            <div className="text-4xl font-light">450 ms</div>
            <div className="flex gap-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Deepgram
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                gpt-4o
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                Vapi
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Natural conversation ability",
      description:
        "Turn-taking, human-like voices, and custom pronunciation and transcription keywords.",
      link: "CONVERSATION BEHAVIOR",
      visual: (
        <div className="bg-card rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              {["Voice", "Tools", "Model", "Settings", "Analysis"].map((tab, i) => (
                <button
                  key={tab}
                  className={`px-3 py-1 text-xs rounded-full ${
                    i === 0
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-muted-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <span className="px-3 py-1 text-xs border border-border rounded-full">CODE</span>
          </div>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-foreground">Select Voice:</span>
            <span className="text-primary font-medium">Cole</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">
            Edit Voice:
          </div>
          <div className="space-y-4">
            {[
              { label: "Wait Seconds", value: "0.4", filled: 4 },
              { label: "On Punctuation Seconds", value: "0.1", filled: 2 },
              { label: "On Number Seconds", value: "1.5", filled: 3 },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/30"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i < item.filled ? "bg-primary" : "bg-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm px-3 py-1 bg-card rounded border border-border">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      icon: <Wrench className="w-5 h-5" />,
      title: "Live call tool & data access",
      description: "Ground responses in external data and trigger tools, including MCP, in the moment.",
      link: "INTRO TO TOOLS",
      visual: null,
    },
    {
      icon: <Cpu className="w-5 h-5" />,
      title: "Custom model support",
      description: "Bring your own models or choose from 200+ fully-supported integrations.",
      link: "CONNECT MODELS",
      visual: (
        <div className="bg-card rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              {["Voice", "Tools", "Model", "Settings", "Analysis"].map((tab, i) => (
                <button
                  key={tab}
                  className={`px-3 py-1 text-xs rounded-full ${
                    i === 2
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-muted-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <span className="px-3 py-1 text-xs border border-border rounded-full">CODE</span>
          </div>
          <div className="flex items-center gap-2 mb-6 p-4 bg-background/50 rounded-lg border border-primary/30">
            <span className="text-foreground">Choose Provider:</span>
            <span className="text-muted-foreground">Custom LLM</span>
            <ChevronDown className="w-4 h-4 ml-auto text-muted-foreground" />
          </div>
          <div className="space-y-2">
            {[
              { name: "Custom LLM", icon: "⚙️" },
              { name: "Azure OpenAI", icon: "🅰️" },
              { name: "Anthropic", icon: "🅰️" },
              { name: "Groq", icon: "🟢" },
              { name: "Cerebras", icon: "🟣" },
            ].map((provider) => (
              <div
                key={provider.name}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <span className="text-lg">{provider.icon}</span>
                <span className="text-sm">{provider.name}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    // {
    //   icon: <Phone className="w-5 h-5" />,
    //   title: "Telephony control",
    //   description: "Custom SIP support, warm transfers, voicemail detection and DTMF support.",
    //   link: "SIP GUIDE",
    //   visual: null,
    // },
    {
      icon: <Wifi className="w-5 h-5" />,
      title: "99.99% Reliability",
      description: "Enterprise-grade uptime with built-in recovery from model or network failures.",
      link: "CHECK STATUS",
      visual: (
        <div className="bg-card rounded-xl p-6 border border-border/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm font-medium">API [Weekly]</span>
            </div>
            <span className="text-primary text-sm">99.998% uptime</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-8 rounded-sm ${
                  i === 14 || i === 15 ? "bg-yellow-400" : "bg-primary"
                }`}
              />
            ))}
          </div>
          <div className="bg-background/50 rounded-lg p-4 border border-border/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Total Call Minutes</span>
              <span className="text-sm">40min, 58sec</span>
            </div>
            <div className="h-16 flex items-end">
              <svg viewBox="0 0 200 40" className="w-full h-full">
                <path
                  d="M0,35 Q30,30 60,25 T120,20 T180,10 L200,8"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                />
                <path
                  d="M0,35 Q30,30 60,25 T120,20 T180,10 L200,8 L200,40 L0,40 Z"
                  fill="url(#gradient)"
                  opacity="0.3"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Works for the whole team",
      description: "Devs build exactly what they want via API—product teams move fast with UI. No compromise.",
      link: "ENTERPRISE GUIDE",
      visual: null,
    },
  ];

  const howItWorksSteps = [
    {
      title: "Give your agent context",
      description: "Provide instructions and tools, and configure as if you were building it yourself.",
    },
    {
      title: "Pick your models",
      description: "Choose from 200+ built-in integrations or connect your own model.",
    },
    {
      title: "Integrate your business data",
      description: "Integrate your authenticated internal API services to fetch data and perform actions.",
    },
    {
      title: "Tune and observe in production",
      description: "Catch hallucinations before they go live with evals and observability stack support.",
    },
  ];

  const resources = [
    {
      category: "Company News",
      date: "Aug 07, 2025",
      title: "GPT-5 Now Live",
      description: "Build GPT-5 powered Voiceable agents",
    },
    {
      category: "Agent Building",
      date: "Jul 14, 2025",
      title: "How we solved latency",
      description: "ASR → LLM → TTS pipeline optimization",
    },
  ];

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
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-light leading-tight">
                Build custom voice agents{" "}
                <span className="font-semibold">that scale</span>
              </h1>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Built for developers</h3>
                  <p className="text-sm text-muted-foreground">
                    API-native and compatible with any stack for total control.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Configurable by design</h3>
                  <p className="text-sm text-muted-foreground">
                    1000+ points of config, bring your own models, or choose from 200+.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="uppercase tracking-wider text-xs py-6 px-8" asChild>
                  <Link to="/">
                    Start Building <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="uppercase tracking-wider text-xs py-6 px-8"
                >
                  Docs
                </Button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative w-full aspect-square">
                {/* Circular visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border-2 border-primary/30 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-2 border-primary/50 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-2xl">🎤</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating labels */}
                <div className="absolute top-4 right-8 px-4 py-2 bg-card rounded-lg border border-border/50 text-sm flex items-center gap-2">
                  <span className="text-primary">💚</span> Customer Support
                </div>
                <div className="absolute top-1/4 left-0 px-4 py-2 bg-card rounded-lg border border-border/50 text-sm flex items-center gap-2">
                  <span className="text-yellow-400">🟡</span> Lead Qualification
                </div>
                <div className="absolute bottom-1/4 left-4 px-4 py-2 bg-card rounded-lg border border-border/50 text-sm flex items-center gap-2">
                  <span className="text-blue-400">🔷</span> Info Collector
                </div>
                <div className="absolute bottom-8 right-4 px-4 py-2 bg-card rounded-lg border border-border/50 text-sm flex items-center gap-2">
                  <span className="text-purple-400">📅</span> Appointment Scheduler
                </div>

                {/* Audio bars */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1">
                  {[40, 60, 80, 50, 70, 90, 45, 65].map((h, i) => (
                    <div
                      key={i}
                      className="w-2 rounded-full animate-pulse"
                      style={{
                        height: `${h}px`,
                        backgroundColor:
                          i < 2
                            ? "hsl(280, 80%, 60%)"
                            : i < 4
                            ? "hsl(200, 80%, 60%)"
                            : i < 6
                            ? "hsl(var(--primary))"
                            : "hsl(45, 90%, 60%)",
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <span className="text-primary font-semibold uppercase tracking-wider text-sm">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-light mt-4 mb-6 max-w-3xl">
            Built for developers, ready for business
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mb-16">
            Build voice agents with the flexibility and customizability of raw code, without
            having to build the entire voice stack from scratch.
          </p>

          <div className="space-y-32">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-3xl font-light mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground mb-6">{feature.description}</p>
                  <a
                    href="#"
                    className="text-sm uppercase tracking-wider font-medium hover:text-primary transition-colors inline-flex items-center gap-2"
                  >
                    {feature.link}
                    <span className="text-xs">📑</span>
                  </a>
                </div>
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  {feature.visual || (
                    <div className="bg-card/50 rounded-xl aspect-video border border-border/50 flex items-center justify-center">
                      <div className="text-muted-foreground">Visual placeholder</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-card/30 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <span className="text-muted-foreground uppercase tracking-wider text-sm">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-light mt-4 mb-16">
            From silence to speech <span className="text-primary font-medium">in minutes</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
            Spin up a call-ready voice assistant simply, then customize and scale however you
            like.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorksSteps.map((step, index) => (
              <button
                key={step.title}
                onClick={() => setActiveStep(index)}
                className={`p-6 rounded-xl text-left transition-all ${
                  activeStep === index
                    ? "bg-card border-2 border-primary/50 shadow-lg"
                    : "bg-card/50 border border-border/50 hover:border-primary/30"
                }`}
              >
                <h3 className="font-medium mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Related Resources */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-light">Related resources</h2>
              <p className="text-muted-foreground mt-2">
                Explore guides, updates and insights
              </p>
            </div>
            <Button variant="outline" className="uppercase tracking-wider text-xs">
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {resources.map((resource) => (
              <div key={resource.title} className="group cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {resource.category}
                  </span>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {resource.date}
                  </span>
                </div>
                <div className="bg-card rounded-xl aspect-video mb-4 border border-border/50 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                  <div className="text-center p-6">
                    <h4 className="text-lg font-medium">{resource.description}</h4>
                  </div>
                </div>
                <h3 className="text-xl font-medium group-hover:text-primary transition-colors">
                  {resource.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 border-t border-border/50 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-light mb-12">Get started today</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="uppercase tracking-wider text-xs py-6 px-12" asChild>
              <Link to="/sign-up" onClick={() => {
                window.location.href = "/sign-up";
              }}>
                Sign Up <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="uppercase tracking-wider text-xs py-6 px-12"
              onClick={() => {
                window.location.href = "https://docs.voiceable.dev/";
              }}
            >
              Read the Docs
            </Button>
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
    </div>
  );
};

export default CustomAgents;
