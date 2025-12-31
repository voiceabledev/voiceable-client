import { useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Zap,
  Languages,
  Mic,
  Plug,
  TrendingUp,
  DollarSign,
  BarChart3,
  Target,
  Brain,
  AlertCircle,
  TrendingDown,
  Lightbulb,
  PhoneForwarded,
  LineChart,
  Award
} from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";

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
    icon: Target,
    title: "Outcome Intelligence",
    description: "AI automatically detects successful bookings, qualifications, resolutions, and revenue attribution per call. Stop guessing. Start measuring."
  },
  {
    icon: DollarSign,
    title: "Real-Time ROI Dashboard",
    description: "See business impact instantly: revenue generated vs. cost spent, success rate trends, cost per outcome by agent, savings vs. human alternative."
  },
  {
    icon: PhoneForwarded,
    title: "Smart Escalation System",
    description: "Human handoff done right: automatic detection of complexity, full context passed to human, escalation cost tracking, AI suggestions to reduce rate."
  },
  {
    icon: TrendingUp,
    title: "Continuous Optimization",
    description: "AI-powered performance suggestions: switch voices for better success, add FAQs to reduce escalations, optimize timing. Like having a conversion optimization team."
  },
  {
    icon: Plug,
    title: "Business Tool Integrations",
    description: "Connect what you already use: Calendly, Cal.com, Google Calendar, Pipedrive, HubSpot, Salesforce, Stripe. Agents work with your existing stack."
  },
  {
    icon: Beaker,
    title: "A/B Testing Built-In",
    description: "Test and optimize automatically: compare voices for performance, test conversation flows, measure impact of changes, roll out winners automatically."
  },
  {
    icon: Languages,
    title: "100+ Languages Supported",
    description: "Global by default: configure in any language, auto-detect caller language, switch languages mid-conversation, same performance tracking worldwide."
  },
  {
    icon: Shield,
    title: "Enterprise-Grade Reliability",
    description: "Production-ready infrastructure: 99.99% uptime SLA, sub-500ms latency, SOC 2 compliant, built-in AI guardrails. This isn't a demo. It's an operational system."
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
    title: "Define Your Goal",
    description: "Not: 'Write a system prompt'. But: 'What should this agent accomplish?' Choose your business objective: book appointments, qualify leads, resolve support, collect payments. We configure everything based on your goal."
  },
  {
    number: "2",
    title: "Launch in Minutes",
    description: "No prompts. No configuration. No setup. We automatically choose the right AI model, configure conversation flow, set up outcome tracking, and enable smart escalations. Your agent is ready to work."
  },
  {
    number: "3",
    title: "Connect Your Tools (Optional)",
    description: "Calendar, CRM, payment systems — connect what you need. Agents can check calendar availability, create CRM records, send confirmations, process payments. Or work standalone — your choice."
  },
  {
    number: "4",
    title: "Monitor Real Business Impact",
    description: "See exactly what your agent accomplishes: appointments booked, revenue generated, AI cost, ROI. Get AI insights like 'Add FAQ document to save $68/month'. Prove ROI on day one."
  }
];

const useCases = [
  {
    title: "Medical Practice",
    category: "APPOINTMENT BOOKING",
    description: "Book new patient appointments",
    results: "152 bookings/month · 79% success rate · $2.50/booking",
    quote: "We used to pay a receptionist $3,200/month. Now we pay $380/month and never miss a call.",
    metrics: {
      costSavings: "$2,820/month",
      roi: "850%"
    },
    greatFor: "Clinics, home services, property management, auto services"
  },
  {
    title: "Recruiting Agency",
    category: "CANDIDATE SCREENING",
    description: "Screen candidates before human interview",
    results: "89 candidates screened/month · 67% qualified · $2.10/screen",
    quote: "Saves our recruiters 40 hours/month. We can handle 3x more job reqs with the same team.",
    metrics: {
      timeSavings: "40 hours/month",
      costSavings: "$2,400/month"
    },
    greatFor: "Real estate, legal, insurance, B2B services"
  },
  {
    title: "SaaS Company",
    category: "LEAD QUALIFICATION",
    description: "Qualify inbound demo requests",
    results: "124 leads qualified/month · $48k pipeline generated · $1.95/lead",
    quote: "Every qualified lead goes straight to sales with complete context. Close rate up 18%.",
    metrics: {
      pipelineValue: "$48,000/month",
      efficiency: "+18%"
    },
    greatFor: "Any business with a list of inactive leads"
  },
  {
    title: "Home Services",
    category: "SUPPORT & DISPATCH",
    description: "Resolve issues and schedule repairs",
    results: "234 calls/month · 72% resolved without human · $3.20/call",
    quote: "Customers get instant answers. Our team only handles the truly complex stuff.",
    metrics: {
      escalationReduction: "72%",
      costSavings: "$1,680/month"
    },
    greatFor: "Any appointment-based business"
  }
];

const reliabilityFeatures = [
  {
    title: "Achieves goals consistently",
    description: "79% average success rate across all use cases"
  },
  {
    title: "Knows when to escalate",
    description: "Transfers before frustration, with full context"
  },
  {
    title: "Tracks real business metrics",
    description: "Revenue, cost, ROI — not just 'sentiment scores'"
  },
  {
    title: "Improves automatically",
    description: "AI suggests optimizations based on your data"
  },
  {
    title: "Proves its worth",
    description: "Every call tied to business outcome"
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
    quote: "The dashboard showed us exactly where we were losing money. We fixed 3 issues and our booking rate jumped from 68% to 82% in two weeks.",
    author: "Practice Manager",
    company: "Medical Clinic",
    metric: "$12k additional revenue/month"
  },
  {
    quote: "I can finally prove ROI to the CEO. Last month: 234 qualified leads, $48k pipeline, 20x return. He approved budget for 3 more agents.",
    author: "VP Sales",
    company: "B2B SaaS",
    metric: "3x team expansion approved"
  },
  {
    quote: "We tested 4 different voice AI platforms. Voiceable was the only one that showed us cost per booking and suggested improvements.",
    author: "Operations Director",
    company: "Home Services",
    metric: "Switched from competitor after 1 week"
  },
  {
    quote: "Setup took 15 minutes. No prompts, no config. Just picked 'appointment booking' and it worked. The ROI dashboard is chef's kiss.",
    author: "Founder",
    company: "Professional Services",
    metric: "Setup time: 15 minutes"
  },
  {
    quote: "The escalation intelligence is genius. It knows when it's out of its depth and hands off gracefully. Our customers don't even realize it's AI.",
    author: "Support Lead",
    company: "E-commerce",
    metric: "72% reduction in escalations"
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

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};

export default function Home() {
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const handleOpenWidget = () => {
    setShowCalendarModal(true);
  };

  // Refs for scroll animations
  const heroRef = useRef(null);
  const valuePropRef = useRef(null);
  const featuresRef = useRef(null);
  const useCasesRef = useRef(null);
  const howItWorksRef = useRef(null);
  const reliabilityRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const valuePropInView = useInView(valuePropRef, { once: true, margin: "-100px" });
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const useCasesInView = useInView(useCasesRef, { once: true, margin: "-100px" });
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" });
  const reliabilityInView = useInView(reliabilityRef, { once: true, margin: "-100px" });
  const testimonialsInView = useInView(testimonialsRef, { once: true, margin: "-100px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });

  // Parallax scroll
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <>
      <SEO
        title="Convert Leads & Resolve Issues With a 24/7 Support Line | Voiceable"
        description="Answer every call, 24/7. Voiceable automates your frontline communications, works with your existing phone lines, and handles appointments, leads, and support—all while tracking outcomes automatically."
        keywords="AI voice agents, 24/7 phone answering, automated receptionist, AI support line, lead qualification, appointment scheduling, voice automation, AI telephony, business automation, call answering service"
        url="https://voice-agent-ai-4288599ce3fe.herokuapp.com"
      />
      <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Animated gradient background */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent"
          style={{ y: backgroundY }}
        />
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-40 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/3 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            className="inline-block px-4 py-2 rounded-full bg-primary/10 mb-6"
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <motion.span 
              className="text-sm font-semibold text-primary flex items-center gap-2"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              ✨ Answer every call, 24/7
            </motion.span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight"
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Convert Leads & Resolve Issues<br />
            <motion.span 
              className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0%", "100%", "0%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: "200% 200%",
              }}
            >
              With a 24/7 Support Line
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl font-medium text-foreground mb-4 max-w-4xl mx-auto leading-relaxed"
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Voiceable is purpose-built to automate your frontline communications. Powered by AI, it works seamlessly with your existing phone lines & systems to answer every call and message, by day or night.
          </motion.p>
          
          <motion.p 
            className="text-base md:text-lg text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Book appointments, qualify leads, handle support, and track every outcome—all while you sleep.
          </motion.p>

          {/* Social Proof Banner */}
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm md:text-base"
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold">
              <DollarSign className="w-4 h-4" />
              Avg ROI: 15-20x
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold">
              <Check className="w-4 h-4" />
              95% success rate
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-semibold">
              <Zap className="w-4 h-4" />
              2.5min avg call
            </div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" variant="outline" className="font-semibold px-10 py-7 text-lg rounded-full border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200" asChild>
                <Link to="/sign-up">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Sign Up
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" onClick={handleOpenWidget} className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-10 py-7 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200">
                <Phone className="w-5 h-5 mr-2" />
                Book Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Social Proof Quote */}
          <motion.div 
            className="max-w-3xl mx-auto mb-12"
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
              <p className="text-sm text-muted-foreground mb-2 text-center">Trusted by businesses who measure outcomes, not just conversations</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center -ml-2">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center -ml-2">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center -ml-2">
                  <Users className="w-4 h-4 text-primary" />
                </div>
              </div>
              <blockquote className="text-center mt-4 italic text-foreground">
                "152 appointments booked last month. $7,600 in revenue. The dashboard shows exactly where every dollar goes."
              </blockquote>
              <p className="text-center text-sm text-muted-foreground mt-2">— Medical Practice Manager</p>
            </div>
          </motion.div>
          
        </div>
      </section>

      {/* Built for real businesses Section */}
      <section ref={valuePropRef} className="py-24 px-6 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-center leading-tight"
            initial="hidden"
            animate={valuePropInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            Works With Your Existing<br />Phone Lines & Systems
          </motion.h2>
          
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground mb-16 text-center max-w-3xl mx-auto"
            initial="hidden"
            animate={valuePropInView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            No new numbers. No complex setup. Connect your existing phone system and start answering calls in minutes.
          </motion.p>
          
          <motion.div 
            className="bg-background/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg space-y-8"
            initial="hidden"
            animate={valuePropInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div variants={fadeInUp}>
                <h3 className="text-lg font-semibold text-foreground mb-4">What it does:</h3>
                <div className="space-y-3">
                  {[
                    "Answers every call, 24/7",
                    "Books appointments automatically",
                    "Qualifies leads in real-time",
                    "Handles support issues instantly",
                    "Tracks outcomes and revenue"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div variants={fadeInUp}>
                <h3 className="text-lg font-semibold text-foreground mb-4">How it works:</h3>
                <div className="space-y-3">
                  {[
                    "Connects to your existing phone number",
                    "Integrates with your calendar & CRM",
                    "Learns from your business rules",
                    "Escalates to humans when needed",
                    "Shows you exactly what it accomplished"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              className="pt-6 text-center"
              variants={fadeInUp}
            >
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/sign-up">
                  See How It Works <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Intelligence, Not Just Automation Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            Handles Every Scenario
          </motion.h2>
          
          <motion.p 
            className="text-xl text-muted-foreground mb-16 text-center max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            From booking appointments to resolving support issues, your AI agent handles it all—and tracks what matters.
          </motion.p>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div 
              className="bg-card rounded-2xl p-8 hover:shadow-xl transition-all duration-300"
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Instant Response</h3>
              <p className="text-muted-foreground mb-4">
                Answers every call immediately, 24/7:
              </p>
              <ul className="space-y-2">
                {["No missed calls or voicemails", "Responds in under 2 seconds", "Works on your existing number", "Handles multiple calls simultaneously"].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-500" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-4 italic">
                Never miss another call, even at 2am.
              </p>
            </motion.div>

            <motion.div 
              className="bg-card rounded-2xl p-8 hover:shadow-xl transition-all duration-300"
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Takes Action</h3>
              <p className="text-muted-foreground mb-4">
                Does more than just talk—actually completes tasks:
              </p>
              <ul className="space-y-2">
                {["Books appointments on your calendar", "Creates leads in your CRM", "Dispatches vendors for maintenance", "Sends confirmations automatically"].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-500" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-4 italic">
                Your team only sees completed work, not raw calls.
              </p>
            </motion.div>

            <motion.div 
              className="bg-card rounded-2xl p-8 hover:shadow-xl transition-all duration-300"
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <PhoneForwarded className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Resolves Issues</h3>
              <p className="text-muted-foreground mb-4">
                Handles support requests end-to-end:
              </p>
              <ul className="space-y-2">
                {["Diagnoses problems from conversation", "Creates work orders automatically", "Dispatches the right vendor", "Follows up until resolved"].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-500" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-4 italic">
                No more voicemail ping-pong or guesswork.
              </p>
            </motion.div>

            <motion.div 
              className="bg-card rounded-2xl p-8 hover:shadow-xl transition-all duration-300"
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Tracks Outcomes</h3>
              <p className="text-muted-foreground mb-4">
                See exactly what your agent accomplished:
              </p>
              <ul className="space-y-2">
                {["Appointments booked", "Leads qualified", "Issues resolved", "Revenue generated"].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-500" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-4 italic">
                Real business metrics, not just call volume.
              </p>
            </motion.div>
          </motion.div>

          <motion.div 
            className="text-center mt-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <Button size="lg" variant="outline" className="rounded-full" asChild>
              <Link to="/sign-up">
                See Performance Dashboard Demo <BarChart3 className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ROI Dashboard Section */}
      <section className="py-24 px-6 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            See What It's Doing Right Now
          </motion.h2>
          
          <motion.p 
            className="text-xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Every call, every outcome, every dollar—tracked in real-time.
          </motion.p>

          <motion.div 
            className="bg-background rounded-3xl p-8 md:p-12 shadow-2xl border border-border"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scaleIn}
          >
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Last 30 Days Performance</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Revenue Generated</p>
                  <p className="text-3xl font-bold text-emerald-600">$7,600 <span className="text-sm text-emerald-500">↑23%</span></p>
                </div>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Cost Savings</p>
                  <p className="text-3xl font-bold text-blue-600">$1,540/month</p>
                </div>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Success Rate</p>
                  <p className="text-3xl font-bold text-violet-600">79% <span className="text-sm text-violet-500">↑4%</span></p>
                </div>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Escalation Rate</p>
                  <p className="text-3xl font-bold text-amber-600">15% <span className="text-sm text-amber-500">↓2%</span></p>
                </div>
              </div>
              
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground mb-1">AI Recommendation:</p>
                    <p className="text-foreground mb-2">"Add insurance FAQ document"</p>
                    <p className="text-sm text-muted-foreground">→ Reduce escalations 35% · Save $68/month</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="rounded-full">Implement</Button>
                    <Button size="sm" variant="ghost" className="rounded-full">Learn More</Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">Every agent comes with:</p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  "Real-time ROI dashboard",
                  "Cost per outcome tracking",
                  "Revenue attribution",
                  "AI-powered optimization suggestions",
                  "Exportable reports for your boss"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-lg font-semibold text-foreground mb-4">Know exactly what your agent is accomplishing, every day.</p>
              <Button size="lg" variant="outline" className="rounded-full" asChild>
                <Link to="/sign-up">
                  See Live Dashboard <BarChart3 className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* See the Intelligence in Action Section */}
      <section className="py-32 px-6 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <motion.div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        <motion.div 
          className="max-w-4xl mx-auto text-center relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2 
            className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
            variants={fadeInUp}
          >
            Try It Right Now
          </motion.h2>
          
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground mb-4 leading-relaxed"
            variants={fadeInUp}
          >
            Call our demo agent and experience how it works.
          </motion.p>
          <motion.p 
            className="text-lg text-muted-foreground mb-8"
            variants={fadeInUp}
          >
            No signup required. Just call and see how it handles your questions, books appointments, and resolves issues—all while tracking outcomes automatically.
          </motion.p>
          
          <motion.div 
            className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 mb-12 shadow-xl"
            variants={scaleIn}
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-lg md:text-xl text-foreground leading-relaxed mb-6">
              Call now and talk to a real AI agent handling real requests.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" onClick={handleOpenWidget} className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200">
                  <Phone className="w-5 h-5 mr-2" />
                  Book Demo
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="font-semibold px-8 py-6 rounded-full border-2" asChild>
                  <Link to="/sign-up">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Sign Up
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-card/30 rounded-2xl p-6"
            variants={fadeInUp}
          >
            <p className="text-sm text-muted-foreground mb-3">Every agent automatically tracks:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {[
                "Calls answered",
                "Appointments booked",
                "Leads qualified",
                "Issues resolved",
                "Revenue generated"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4 italic">All included, no extra setup required.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Use Cases Section */}
      <section ref={useCasesRef} className="py-24 px-6 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-7xl mx-auto">
          <motion.p 
            className="text-muted-foreground font-semibold text-sm tracking-widest uppercase mb-4"
            initial="hidden"
            animate={useCasesInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            USE CASES
          </motion.p>
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-foreground mb-12"
            initial="hidden"
            animate={useCasesInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            Real Use Cases.<br />Measurable Results.
          </motion.h2>
          
          <motion.div 
            className="space-y-8"
            initial="hidden"
            animate={useCasesInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                className="bg-card rounded-2xl p-8 md:p-12 border border-border hover:shadow-xl transition-all duration-300"
                variants={fadeInUp}
                whileHover={{ scale: 1.01, y: -5 }}
              >
                <div className="flex items-start justify-between gap-6 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase">
                        {useCase.category}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{useCase.title}</h3>
                    <p className="text-lg text-muted-foreground mb-4">{useCase.description}</p>
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                        Results: {useCase.results}
                      </span>
                    </div>
                    <blockquote className="text-foreground italic mb-4 border-l-4 border-primary pl-4">
                      "{useCase.quote}"
                    </blockquote>
                    <div className="flex items-center gap-4 flex-wrap">
                      {Object.entries(useCase.metrics).map(([key, value], idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-sm font-semibold text-foreground">
                            {key === 'costSavings' && 'Cost Savings: '}
                            {key === 'roi' && 'ROI: '}
                            {key === 'timeSavings' && 'Time Savings: '}
                            {key === 'pipelineValue' && 'Pipeline Value: '}
                            {key === 'efficiency' && 'Sales Team Efficiency: '}
                            {key === 'escalationReduction' && 'Escalation Reduction: '}
                            <span className="text-primary">{value}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button variant="outline" className="rounded-full" asChild>
                      <Link to="/sign-up">
                        View Full Case Study <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works Section */}
      <section ref={howItWorksRef} className="py-24 px-6 bg-card">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center"
            initial="hidden"
            animate={howItWorksInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            How it works
          </motion.h2>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 relative"
            initial="hidden"
            animate={howItWorksInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            {/* Progress line for desktop */}
            <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
            
            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                className="bg-background rounded-2xl p-8 hover:shadow-lg transition-all duration-300 relative group"
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                {/* Connection dot for desktop */}
                <div className="hidden lg:block absolute -top-4 left-1/2 w-8 h-8 bg-primary/20 rounded-full border-4 border-background transform -translate-x-1/2 group-hover:bg-primary/40 transition-colors" />
                
                <motion.span 
                  className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-lg font-bold mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {step.number}
                </motion.span>
                
                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.p 
            className="text-center text-lg text-foreground font-medium"
            initial="hidden"
            animate={howItWorksInView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            No prompts. No scripts. No fragile configurations.
          </motion.p>
        </div>
      </section>

      {/* Features Section - Add before reliability */}
      <section ref={featuresRef} className="py-24 px-6 bg-gradient-to-b from-background to-card/50">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center"
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            Powerful Capabilities,<br />Business-Focused Interface
          </motion.h2>
          
          <motion.p 
            className="text-xl text-muted-foreground mb-16 text-center max-w-3xl mx-auto"
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Every feature ties to business impact. Stop guessing. Start measuring.
          </motion.p>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-card rounded-2xl p-8 hover:shadow-xl transition-all duration-300 group"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.03, y: -5 }}
                >
                  <motion.div 
                    className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon className="w-7 h-7 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Enterprise Features Section */}
      <section className="py-24 px-6 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            Enterprise-grade reliability
          </motion.h2>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {enterpriseFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className={`${feature.color} rounded-2xl p-8 hover:shadow-lg transition-all duration-300`}
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <motion.div 
                    className="w-16 h-16 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center mb-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon className="w-8 h-8" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="opacity-90">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Designed for reliability Section */}
      <section ref={reliabilityRef} className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center"
            initial="hidden"
            animate={reliabilityInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            Built to Work, Not Just Impress
          </motion.h2>
          
          <motion.p 
            className="text-xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto"
            initial="hidden"
            animate={reliabilityInView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Production-ready infrastructure that answers every call, every time—day or night.
          </motion.p>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12"
            initial="hidden"
            animate={reliabilityInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            {reliabilityFeatures.map((feature, index) => (
              <motion.div 
                key={index} 
                className="bg-card rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300"
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <motion.div 
                  className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Check className="w-8 h-8 text-primary" />
                </motion.div>
                <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.p 
            className="text-center text-lg text-foreground font-medium mt-12"
            initial="hidden"
            animate={reliabilityInView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            This isn't a demo. It's your 24/7 phone line that actually works.
          </motion.p>

          <motion.div 
            className="text-center mt-8"
            initial="hidden"
            animate={reliabilityInView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/sign-up">
                See Performance Benchmarks <BarChart3 className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Works where your customers are Section */}
      <section className="py-24 px-6 bg-card">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-foreground mb-8 text-center"
            variants={fadeInUp}
          >
            Works where your customers already are
          </motion.h2>
          
          <motion.ul 
            className="space-y-4 mb-8"
            variants={staggerContainer}
          >
            {integrationChannels.map((channel, index) => (
              <motion.li 
                key={index} 
                className="flex items-center gap-3"
                variants={fadeInUp}
                whileHover={{ x: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                >
                  <Check className="w-6 h-6 text-primary flex-shrink-0" />
                </motion.div>
                <span className="text-lg text-foreground">{channel}</span>
              </motion.li>
            ))}
          </motion.ul>
          
          <motion.p 
            className="text-center text-lg text-muted-foreground"
            variants={fadeInUp}
          >
            You don't need to change how your business operates — the agent adapts to you.
          </motion.p>
        </motion.div>
      </section>

      {/* Escalation Intelligence Section */}
      <section className="py-24 px-6 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            When Human Touch Matters Most
          </motion.h2>
          
          <motion.p 
            className="text-xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            AI agents should know when they're out of their depth.
          </motion.p>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div 
              className="bg-card rounded-2xl p-8 hover:shadow-xl transition-all duration-300"
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Brain className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Smart Escalation Detection</h3>
              <p className="text-muted-foreground mb-4">
                Automatically transfers when it detects:
              </p>
              <ul className="space-y-2">
                {["Medical emergency keywords", "Customer frustration or anger", "Complex requests beyond scope", "After multiple failed attempts"].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-500" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-4 italic">
                No more "I can help you with that" loops.
              </p>
            </motion.div>

            <motion.div 
              className="bg-card rounded-2xl p-8 hover:shadow-xl transition-all duration-300"
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <FileCheck className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Context That Actually Helps</h3>
              <p className="text-muted-foreground mb-4">
                When transferring to human:
              </p>
              <ul className="space-y-2">
                {["Full conversation summary", "Customer intent identified", "Previous interaction history", "Recommended next action"].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-500" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-4 italic">
                Your team picks up with full context, every time.
              </p>
            </motion.div>

            <motion.div 
              className="bg-card rounded-2xl p-8 hover:shadow-xl transition-all duration-300"
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Escalation as a Metric</h3>
              <p className="text-muted-foreground mb-4">
                Track and optimize handoffs:
              </p>
              <ul className="space-y-2">
                {["Escalation rate over time", "Top escalation reasons", "Cost per escalation", "Context handoff quality"].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-500" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-4 italic">
                Escalation isn't failure — it's an optimizable workflow.
              </p>
            </motion.div>

            <motion.div 
              className="bg-card rounded-2xl p-8 hover:shadow-xl transition-all duration-300"
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Lightbulb className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Reduce Escalations Automatically</h3>
              <p className="text-muted-foreground mb-4">
                AI suggests improvements:
              </p>
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <p className="text-foreground italic mb-2">
                  "12 calls escalated for insurance questions this week."
                </p>
                <p className="text-sm text-muted-foreground">
                  Add insurance FAQ to knowledge base → reduce 35%
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-4 italic">
                Turn handoffs into competitive advantage.
              </p>
            </motion.div>
          </motion.div>

          <motion.div 
            className="text-center mt-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <Button size="lg" variant="outline" className="rounded-full" asChild>
              <Link to="/sign-up">
                See Escalation Dashboard <BarChart3 className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center"
            initial="hidden"
            animate={testimonialsInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            Trusted by Teams Who Measure Results
          </motion.h2>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate={testimonialsInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index} 
                className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
                variants={scaleIn}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <blockquote className="text-lg text-foreground italic mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-3 mb-4">
                  <motion.div 
                    className="w-10 h-10 rounded-full bg-primary/20"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  />
                  <div>
                    <p className="font-medium text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-semibold text-primary">{testimonial.metric}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="py-24 px-6 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            Why Businesses Choose Voiceable
          </motion.h2>
          
          <motion.p 
            className="text-xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Built for business operators, not AI engineers.
          </motion.p>

          <motion.div 
            className="bg-background rounded-3xl p-8 md:p-12 shadow-2xl border border-border overflow-x-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scaleIn}
          >
            <div className="min-w-full">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold text-foreground"></th>
                    <th className="text-left py-4 px-4 font-semibold text-muted-foreground">Other Platforms</th>
                    <th className="text-left py-4 px-4 font-semibold text-primary">Voiceable</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Setup", other: "Write prompts, configure models", voiceable: "Pick goal, launch in minutes" },
                    { feature: "Metrics", other: "Call volume, transcripts", voiceable: "Revenue generated, cost per outcome" },
                    { feature: "Optimization", other: "Manual A/B testing, spreadsheets", voiceable: "AI suggests improvements" },
                    { feature: "Escalations", other: "Failed = bad", voiceable: "Optimizable workflow with cost tracking" },
                    { feature: "ROI", other: "Calculate yourself", voiceable: "Real-time dashboard with attribution" },
                    { feature: "Success Rate", other: "Unknown until you deploy", voiceable: "Pre-tested templates with benchmarks" },
                    { feature: "Support", other: "Documentation", voiceable: "AI-powered insights and recommendations" },
                    { feature: "Pricing", other: "Usage-based only", voiceable: "Success-based tiers" }
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-card/50 transition-colors">
                      <td className="py-4 px-4 font-medium text-foreground">{row.feature}</td>
                      <td className="py-4 px-4 text-muted-foreground">{row.other}</td>
                      <td className="py-4 px-4 text-foreground font-medium">{row.voiceable}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 text-center">
              <Button size="lg" variant="outline" className="rounded-full" asChild>
                <Link to="/sign-up">
                  Start Measuring Results <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
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
      <section ref={ctaRef} className="py-24 px-6 bg-card relative overflow-hidden">
        {/* Animated background */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            backgroundSize: "200% 200%",
          }}
        />
        <motion.div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        <motion.div 
          className="max-w-7xl mx-auto text-center relative z-10"
          initial="hidden"
          animate={ctaInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.h2 
            className="text-4xl md:text-6xl font-bold text-foreground mb-6"
            variants={fadeInUp}
          >
            Start Answering Every Call
          </motion.h2>
          
          <motion.p 
            className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            variants={fadeInUp}
          >
            Connect your phone number, set your goals, and let your AI agent handle the rest.
          </motion.p>

          <motion.div 
            className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-border max-w-4xl mx-auto"
            variants={fadeInUp}
          >
            <p className="text-lg font-semibold text-foreground mb-6">Most teams see results in 48 hours:</p>
            <div className="grid md:grid-cols-5 gap-4 text-sm">
              <div>
                <p className="font-bold text-primary mb-1">Hour 1</p>
                <p className="text-muted-foreground">Pick your goal, launch agent</p>
              </div>
              <div>
                <p className="font-bold text-primary mb-1">Hour 24</p>
                <p className="text-muted-foreground">First successful outcomes tracked</p>
              </div>
              <div>
                <p className="font-bold text-primary mb-1">Hour 48</p>
                <p className="text-muted-foreground">ROI dashboard shows clear value</p>
              </div>
              <div>
                <p className="font-bold text-primary mb-1">Week 2</p>
                <p className="text-muted-foreground">AI suggests first optimization</p>
              </div>
              <div>
                <p className="font-bold text-primary mb-1">Month 1</p>
                <p className="text-muted-foreground">15-20x ROI on average</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
            variants={fadeInUp}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" variant="outline" className="font-semibold px-8 py-6 text-base rounded-full border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200" asChild>
                <Link to="/sign-up">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Create Your Agent
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" onClick={handleOpenWidget} className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-6 text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-200">
                <Phone className="w-5 h-5 mr-2" />
                Book Demo
              </Button>
            </motion.div>
          </motion.div>

          <motion.p 
            className="text-sm text-muted-foreground"
            variants={fadeInUp}
          >
            14-day free trial · No credit card · Cancel anytime
          </motion.p>
        </motion.div>
      </section>

      {/* Calendar Modal */}
      <Dialog open={showCalendarModal} onOpenChange={setShowCalendarModal}>
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

      <Footer />
    </div>
    </>
  );
}
