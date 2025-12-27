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
  Sparkles,
  Check,
  Calendar,
  MessageSquare,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { openWidgetWithConfig } from "@/utils/widgetHelpers";

const faqs = [
  {
    question: "What is Voiceable Studio?",
    answer: "Voiceable Studio is a comprehensive platform for building, deploying, and managing AI-powered voice agents. It provides everything you need to create natural-sounding voice interactions at scale."
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
  // {
  //   icon: Layers,
  //   title: "API-native",
  //   description: "Everything is exposed as an API, with 1000s of configurations and integrations."
  // },
  {
    icon: TestTube,
    title: "Automated testing",
    description: "Design test suites of simulated voice agents to identify hallucination risks before going to production."
  },
  // {
  //   icon: Code,
  //   title: "Bring your own models",
  //   description: "Bring your own API keys for transcription, LLM, or text-to-speech models. Or, plug in your own self-hosted models."
  // },
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
  // {
  //   icon: Rocket,
  //   title: "Forward-deployed team",
  //   description: "Get deployment assistance and a dedicated forward-deployed engineer to go live in a week.",
  //   color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
  // },
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
  // {
  //   icon: FileCheck,
  //   title: "SOC2, HIPAA, PCI compliant",
  //   description: "Enterprise-level security for even the most regulated healthcare and financial services.",
  //   color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
  // }
];

const steps = [
  {
    number: "1",
    title: "Describe the role",
    description: "Choose what the agent is responsible for — reception, sales, support, follow-ups."
  },
  {
    number: "2",
    title: "Set the rules",
    description: "Tell us what the agent should do, what it should avoid, and when to escalate."
  },
  {
    number: "3",
    title: "Connect your systems",
    description: "Calendar, CRM, forms, or phone number — connect only what you need."
  },
  {
    number: "4",
    title: "Go live",
    description: "Your agent starts handling calls immediately and improves over time."
  }
];

const useCases = [
  {
    title: "AI Receptionist",
    description: "Never miss a call again.",
    features: [
      "Answers inbound calls instantly",
      "Handles common questions",
      "Books appointments based on your rules",
      "Works after hours, weekends, and holidays"
    ],
    greatFor: "Clinics, home services, property management, auto services"
  },
  {
    title: "Lead Qualification & Scheduling",
    description: "Follow up while leads are still hot.",
    features: [
      "Calls new leads automatically",
      "Qualifies intent and budget",
      "Books meetings for your team",
      "Sends structured notes to your CRM"
    ],
    greatFor: "Real estate, legal, insurance, B2B services"
  },
  {
    title: "Re-engage Past Leads",
    description: "Turn old leads into new opportunities.",
    features: [
      "Calls contacts already in your CRM",
      "Identifies renewed interest",
      "Books appointments when timing is right"
    ],
    greatFor: "Any business with a list of inactive leads"
  },
  {
    title: "Appointment Confirmation",
    description: "Reduce no-shows without manual work.",
    features: [
      "Confirms upcoming appointments",
      "Handles rescheduling",
      "Keeps your calendar accurate"
    ],
    greatFor: "Any appointment-based business"
  }
];

const reliabilityFeatures = [
  {
    title: "Always available",
    description: "Answers calls instantly"
  },
  {
    title: "Consistent behavior",
    description: "Follows your rules every time"
  },
  {
    title: "Safe by default",
    description: "Avoids hallucinations and sensitive actions"
  },
  {
    title: "Scales effortlessly",
    description: "From a few calls to thousands"
  }
];

const integrationChannels = [
  "Phone calls (inbound & outbound)",
  "Website voice widgets",
  "SMS follow-ups",
  "Existing business numbers"
];

const testimonials = [
  {
    quote: "We stopped missing calls overnight. The agent handles routine conversations, and our team focuses on real work.",
    author: "Operations Lead",
    company: "Home Services"
  },
  {
    quote: "Setup was surprisingly simple. We didn't write a single prompt.",
    author: "Founder",
    company: "Professional Services"
  }
];

const communityStats = [
  { label: "CONFIGURATION POINTS", value: "4.2K+" },
  { label: "SUPPORT TOPICS", value: "13K+" },
  { label: "FOLLOWERS", value: "9.6K+" }
];

const communityLinks = [
  { icon: BookOpen, title: "Docs", href: "https://docs.voiceable.dev/" },
  { icon: Github, title: "GitHub", href: "https://github.com" },
  { icon: Users, title: "Community", href: "https://discord.com" },
];

export default function Home() {
  const handleOpenWidget = () => {
    openWidgetWithConfig();
  };

  return (
    <>
      <SEO
        title="Create AI Voice Agents — Without Writing Prompts | Voiceable"
        description="Handle calls, qualify leads, and book appointments with AI agents you create by describing the job — not engineering the AI. No prompts. No scripts. No fragile configurations."
        keywords="AI voice agents, voice assistants, conversational AI, AI receptionist, lead qualification, appointment scheduling, voice automation, AI telephony, business automation"
        url="https://voice-agent-ai-4288599ce3fe.herokuapp.com"
      />
      <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 mb-6">
            <span className="text-sm font-semibold text-primary">✨ No prompts, no scripts, no complexity</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-8 leading-tight tracking-tight">
            Create AI Voice Agents<br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Without Writing Prompts</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Handle calls, qualify leads, and book appointments with AI agents you create by describing the job — not engineering the AI.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Button size="lg" onClick={handleOpenWidget} className="bg-emerald-500 hover:bg-emerald-600 hover:scale-105 text-white font-semibold px-10 py-7 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200">
              <Phone className="w-5 h-5 mr-2" />
              Talk to a live agent
            </Button>
            <Button size="lg" variant="outline" className="font-semibold px-10 py-7 text-lg rounded-full border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200" asChild>
              <Link to="/sign-up">
                Create your agent <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
          
          {/* Animated wave visualization with modern styling */}
          <div className="relative h-64 md:h-80 flex items-center justify-center bg-gradient-to-b from-muted/50 to-transparent rounded-3xl backdrop-blur-sm">
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
              <Button size="lg" variant="secondary" className="rounded-full px-8 py-6 bg-card/90 backdrop-blur-md shadow-2xl hover:scale-110 transition-transform duration-200">
                <Zap className="w-5 h-5 mr-2 text-emerald-500" />
                TALK TO AI
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Built for real businesses Section */}
      <section className="py-24 px-6 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-center leading-tight">
            Built for real businesses,<br />not prompt engineers
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-16 text-center max-w-3xl mx-auto">
            You shouldn't need to understand LLMs, prompts, or workflows to deploy a reliable AI voice agent.
          </p>
          
          <div className="bg-background/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg space-y-8">
            <p className="text-xl font-medium text-foreground">
              Our platform lets you design agents the same way you'd brief a new hire:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-4 p-5 rounded-xl bg-card hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <span className="text-lg text-foreground font-medium">What their role is</span>
              </div>
              <div className="flex items-start gap-4 p-5 rounded-xl bg-card hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <span className="text-lg text-foreground font-medium">What they should handle</span>
              </div>
              <div className="flex items-start gap-4 p-5 rounded-xl bg-card hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <span className="text-lg text-foreground font-medium">When to escalate</span>
              </div>
              <div className="flex items-start gap-4 p-5 rounded-xl bg-card hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <span className="text-lg text-foreground font-medium">What they should never do</span>
              </div>
            </div>
            
            <div className="pt-6">
              <p className="text-lg text-foreground text-center font-medium">
                We translate that into a production-ready voice agent that works 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Try it before you believe it Section */}
      <section className="py-32 px-6 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Try it before you believe it
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 leading-relaxed">
            Talk to a real AI agent right now.
          </p>
          <p className="text-lg text-muted-foreground mb-8">
            No signup. No setup. No explanation required.
          </p>
          
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 mb-12 shadow-xl">
            <p className="text-lg md:text-xl text-foreground leading-relaxed">
              You'll hear how it handles questions, follows rules, and knows when to hand off — exactly the way yours would.
            </p>
          </div>
          
          <Button size="lg" onClick={handleOpenWidget} className="bg-emerald-500 hover:bg-emerald-600 hover:scale-105 text-white font-semibold px-10 py-7 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200">
            <Phone className="w-5 h-5 mr-2" />
            Talk to a live agent
          </Button>
        </div>
      </section>

      {/* API Section */}
      {/* <section className="py-24 px-6 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto">
          <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-4 text-center">API</p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-12">
            Making Voiceable simple<br />and accessible.
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
              <pre className="text-foreground"> */}
{/* {`# npm install @voice-ai/server-sdk
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
}`} */}
              {/* </pre>
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
      </section> */}

      {/* Use Cases Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary/10 to-accent/10">
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
                  <span className="text-primary">Voiceable</span> handles inbound calls<br />with AI-powered intelligence.<br />
                  <span className="font-normal text-muted-foreground">Scale from zero to millions<br />of calls with enterprise reliability.</span>
                </p>
                
                <div className="flex gap-4">
                  <Button variant="outline" className="rounded-full">
                    LEARN MORE <Sparkles className="ml-2 w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="rounded-full">
                    TRY IT NOW <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
                
                <div className="pt-6 mt-8">
                  <blockquote className="text-muted-foreground italic">
                    "Built for developers who need flexibility and control. Voiceable's API-first architecture lets you customize every aspect of the voice experience."
                  </blockquote>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20" />
                    <div>
                      <p className="font-medium text-foreground">Voiceable Team</p>
                      <p className="text-sm text-muted-foreground">BETA</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Visual */}
            <div className="rounded-2xl p-8 flex items-center justify-center">
              <div className="space-y-4">
                <div className="bg-card rounded-xl p-4 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium text-foreground">Receive call</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">SHIPPER INFO</span>
                  </div>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-lg ml-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">Use tool</span>
                  </div>
                  <p className="text-xs text-muted-foreground">🔗 Fetch_available_jobs_from_broker</p>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-lg ml-16">
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
      <section className="py-24 px-6 bg-card">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center">
            How it works
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {steps.map((step, index) => (
              <div key={index} className="bg-background rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-lg font-bold mb-6">
                  {step.number}
                </span>
                
                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
          
          <p className="text-center text-lg text-foreground font-medium">
            No prompts. No scripts. No fragile configurations.
          </p>
        </div>
      </section>

      {/* Designed for reliability Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">
            Designed for reliability, not demos
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {reliabilityFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <p className="text-center text-lg text-foreground font-medium mt-12">
            This isn't a chatbot. It's an operational system.
          </p>
        </div>
      </section>

      {/* Works where your customers are Section */}
      <section className="py-24 px-6 bg-card">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8 text-center">
            Works where your customers already are
          </h2>
          
          <ul className="space-y-4 mb-8">
            {integrationChannels.map((channel, index) => (
              <li key={index} className="flex items-center gap-3">
                <Check className="w-6 h-6 text-primary flex-shrink-0" />
                <span className="text-lg text-foreground">{channel}</span>
              </li>
            ))}
          </ul>
          
          <p className="text-center text-lg text-muted-foreground">
            You don't need to change how your business operates — the agent adapts to you.
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center">
            Trusted by teams who care about outcomes
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-card rounded-2xl p-8 shadow-lg">
                <blockquote className="text-lg text-foreground italic mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20" />
                  <div>
                    <p className="font-medium text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      {/* <section className="py-24 px-6 bg-card border-y border-border">
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
                
                <div className="grid grid-cols-8 gap-1 mb-8">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div 
                      key={i}
                      className="w-2 h-2 rounded-full bg-border"
                    />
                  ))}
                </div>
                
                {communityLinks[index] && (
                  <a 
                    href={communityLinks[index].href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-2xl font-bold text-foreground hover:text-primary transition-colors"
                  >
                    {communityLinks[index].title}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-24 px-6 bg-card">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Start with a conversation
          </h2>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            The fastest way to understand the platform is to talk to an agent.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={handleOpenWidget} className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-6 text-base rounded-full">
              Talk to a live agent
            </Button>
            <Button size="lg" variant="outline" className="font-semibold px-8 py-6 text-base rounded-full border-2" asChild>
              <Link to="/sign-up">
                Create your agent <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
    </>
  );
}
