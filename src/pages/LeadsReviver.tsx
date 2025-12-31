import { 
  Calendar,
  Shield,
  Clock,
  MessageSquare,
  UserCheck,
  RefreshCw,
  FileText,
  Search,
  ArrowRight,
  DollarSign,
  BarChart3,
  TrendingUp,
  Lightbulb,
  Phone,
  Target
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import {
  HeroSection,
  TryItSection,
  StepsSection,
  FeaturesGrid,
  PerfectForSection,
  ExperienceSection,
  IntegrationsSection,
  TestimonialsSection,
  RevenueRecoveryDashboard,
  HiddenRevenueCalculator,
  ComparisonTable,
  ObjectionHandlingSection,
} from "@/components/landing";

const useCases = [
  {
    title: "B2B SaaS Company",
    category: "DEMO REVIVAL",
    description: "67 demo bookings from old leads monthly",
    results: "18% revival rate · $340k resurrected pipeline · $15/lead cost",
    quote: "We spent $180k on ads last year. Then realized we had 2,400 old demo requests in HubSpot. AI found 432 that were actually ready now. That's $400k in pipeline for $3,600 in revival cost.",
    metrics: {
      pipelineResurrected: "$340k/month from existing database",
      vsNewAcquisition: "Would cost $48k in ad spend",
      savings: "$44,400/month by mining CRM first"
    },
    icon: RefreshCw
  },
  {
    title: "Real Estate Brokerage",
    category: "LISTING APPOINTMENTS",
    description: "43 listing appointments from past inquiries monthly",
    results: "21% revival rate · 8 closings · $240k commission captured",
    quote: "Had 1,800 leads from open houses and Zillow inquiries over 2 years. Most went cold. AI re-engaged them: 378 were actively looking again. Closed 8 this month. Pure profit — we'd already paid for those leads.",
    metrics: {
      commissionGenerated: "$240k from 'dead' leads",
      originalCost: "Already paid 6-18 months ago",
      revivalCost: "$4,800",
      roi: "50x"
    },
    icon: Calendar
  },
  {
    title: "Professional Services Firm",
    category: "CONSULTATION REVIVAL",
    description: "34 consultations from past quotes monthly",
    results: "27% revival rate on quoted prospects · $180k new client value",
    quote: "We had 680 prospects we'd quoted but never closed. Thought they went with competitors. AI called them: 184 never chose anyone — just got busy. We're now closing deals we thought we lost 14 months ago.",
    metrics: {
      clientValue: "$180k/month in closed business",
      source: "Leads we'd written off completely",
      bestSegment: "Quotes from 8-12 months ago (31% revival rate)"
    },
    icon: Search
  },
  {
    title: "Fitness & Wellness",
    category: "MEMBERSHIP REVIVAL",
    description: "89 membership signups from lapsed inquiries monthly",
    results: "24% revival rate · $34k MRR recovered · Trial-to-paid focus",
    quote: "1,400 people took free trials but never joined. AI re-engaged them: 336 situations had changed (moved closer, got more time, budget freed up). 89 signed up this month. That's $34k MRR we thought was gone forever.",
    metrics: {
      mrrRecovered: "$34k from old trial signups",
      ltv: "$2,400 average LTV per revived member",
      totalValue: "$213k from forgotten leads"
    },
    icon: FileText
  }
];

const perfectFor = [
  "Service businesses with long sales cycles",
  "Real estate and brokerage",
  "Legal and financial services",
  "Gyms, clinics, and memberships",
  "Any team with a large CRM of past leads"
];

const steps = [
  {
    number: "1",
    title: "Identify Revival Candidates",
    items: [
      "Not all old leads are equal. AI analyzes: time since last contact, original interest level, business fit, historical engagement",
      "Prioritizes leads most likely to convert now",
      "Starts with your best opportunities"
    ]
  },
  {
    number: "2",
    title: "Respectful Re-Engagement",
    items: [
      "No 'hey, just checking in' garbage",
      "Clear, honest outreach: 'We spoke 8 months ago about [specific topic]. Wanted to see if your situation has changed.'",
      "Acknowledges the gap. Gives them an easy out"
    ]
  },
  {
    number: "3",
    title: "Resurface Real Interest",
    items: [
      "Asks the questions that matter now: Has your timing changed? Is this still a priority? What's different since we last spoke?",
      "Detects genuine interest vs. politeness",
      "Stops when someone's not interested"
    ]
  },
  {
    number: "4",
    title: "Book Qualified Meetings",
    items: [
      "If they're ready now, books the meeting immediately",
      "If they need 2 months, schedules follow-up",
      "If they're truly not interested, removes them politely. Your team only talks to resurrected opportunities"
    ]
  }
];

const revenueRecoveryFeatures = [
  {
    title: "Smart Segmentation",
    description: "Prioritizes high-intent leads from 6-12 months ago",
    icon: Target
  },
  {
    title: "Timing Intelligence",
    description: "Knows when circumstances most likely changed",
    icon: Clock
  },
  {
    title: "Respectful by Design",
    description: "Acknowledges gap, gives opt-out, stops after 2 attempts",
    icon: Shield
  },
  {
    title: "Interest Signal Detection",
    description: "Distinguishes genuine interest from politeness",
    icon: Search
  },
  {
    title: "CRM Intelligence Sync",
    description: "Updates status automatically",
    icon: FileText
  },
  {
    title: "Cost-Per-Revival Tracking",
    description: "Compares to new acquisition economics",
    icon: DollarSign
  }
];

const leadExperience = [
  "A clear reason for the call",
  "Honest questions about timing",
  "A simple way to say yes or no",
  "Respectful follow-through"
];

const integrationChannels = [
  "CRMs and lead databases",
  "Phone numbers you already use",
  "Calendars and scheduling tools",
  "Inbound or outbound workflows"
];

const testimonials = [
  {
    quote: "Cut our ad budget 40%, increased pipeline 60%. We're mining our CRM instead of spending on new ads.",
    author: "VP of Sales",
    company: "B2B SaaS",
    metrics: "2,100 old leads → 378 interest → $340k pipeline"
  },
  {
    quote: "Had 2,100 old leads sitting in HubSpot. AI found 378 that were actually ready now. That's $340k in pipeline we already paid for.",
    author: "Director of Sales",
    company: "Professional Services",
    metrics: "27% revival rate on quoted prospects"
  },
  {
    quote: "$240k in deals from 14-month-old leads. We thought they went with competitors. Most never chose anyone.",
    author: "Broker",
    company: "Real Estate",
    metrics: "43 appointments → 8 closings"
  },
  {
    quote: "$180k pipeline for $3,600. That's 50x ROI on leads we'd written off completely.",
    author: "Owner",
    company: "Home Services",
    metrics: "89 signups from lapsed inquiries"
  }
];

export default function LeadsReviver() {
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const handleOpenWidget = () => {
    setShowCalendarModal(true);
  };

  return (
    <>
      <SEO
        title="Your CRM Is a Gold Mine | AI Lead Reviver | Voiceable"
        description="Your CRM is a gold mine. 15-25% of 'dead' leads are ready to buy now. AI lead reviver resurfaces opportunities from your existing database — no new ad spend required."
        keywords="lead revival, CRM mining, dead lead recovery, sunk cost recovery, lead re-engagement, hidden pipeline, lead reactivation, CRM reactivation, sales automation, lead follow-up, past leads"
        url="https://voice-agent-ai-4288599ce3fe.herokuapp.com/leads-reviver"
      />
      <div className="min-h-screen bg-background">
        <Navigation />

        <HeroSection
          badge="Voice agents that prove their ROI"
          title="Your CRM Is a Gold Mine"
          titleHighlight=""
          description="You've spent thousands acquiring leads. 60-80% went cold before they bought. Your AI lead reviver resurfaces ready buyers from your existing database — no new ad spend required."
          primaryCta="Book Demo"
          secondaryCta="Calculate Your Hidden Revenue"
          secondaryCtaLink="/sign-up"
          onPrimaryCtaClick={handleOpenWidget}
          icons={[
            { icon: RefreshCw, label: "Re-contact", color: "bg-primary/20" },
            { icon: Search, label: "Qualify", color: "bg-accent/20" },
            { icon: Calendar, label: "Book", color: "bg-emerald/20" }
          ]}
        />

        {/* Stats Banner */}
        <section className="py-8 px-6 bg-card/30 -mt-12 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm md:text-base">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold">
                <Target className="w-4 h-4" />
                15-25% of 'dead' leads are ready now
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold">
                <DollarSign className="w-4 h-4" />
                10x cheaper than new acquisition
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-semibold">
                <TrendingUp className="w-4 h-4" />
                Average revival rate: 18%
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Banner */}
        <section className="py-12 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-8 md:p-12 border border-border shadow-lg">
              <p className="text-sm text-muted-foreground mb-4 text-center">Trusted by teams who refuse to leave money on the table</p>
              <blockquote className="text-xl md:text-2xl text-foreground italic text-center mb-6 leading-relaxed">
                "We had 2,847 leads from the past 2 years sitting in our CRM. The AI found 412 that were actually ready to buy now. That's <span className="font-bold text-emerald-600 dark:text-emerald-400">$340k in pipeline</span> we already paid to acquire but never closed."
              </blockquote>
              <p className="text-center text-muted-foreground font-medium">— Director of Sales, B2B Services</p>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="py-24 px-6 bg-card/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-center leading-tight">
              You're Sitting on a Fortune<br />You've Already Paid For
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
              Look at your CRM right now. How many leads are in there?
            </p>
            
            <div className="bg-background/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg space-y-8">
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {[
                  "Inquiries from 6 months ago that 'weren't ready yet'",
                  "Quotes you sent that went silent",
                  "Demo requests that never scheduled",
                  "Discovery calls that said 'we'll circle back'",
                  "Trial signups that never converted"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-card hover:shadow-md transition-all">
                    <span className="text-amber-500 text-xl">•</span>
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-border pt-8">
                <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Here's what actually happened to most of them:</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <span className="text-red-600 dark:text-red-400 font-bold text-lg">❌</span>
                    <div>
                      <p className="font-semibold text-foreground mb-1">The timing myth:</p>
                      <p className="text-foreground">They weren't "not interested" — they were legitimately busy. Project got delayed. Budget got frozen. Key stakeholder went on leave. Now? The project is green-lit.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <span className="text-red-600 dark:text-red-400 font-bold text-lg">❌</span>
                    <div>
                      <p className="font-semibold text-foreground mb-1">The follow-up gap:</p>
                      <p className="text-foreground">Your rep called twice, emailed three times, then moved on. That lead needed 7-12 touchpoints. You stopped at 5.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <span className="text-red-600 dark:text-red-400 font-bold text-lg">❌</span>
                    <div>
                      <p className="font-semibold text-foreground mb-1">The perfect timing miss:</p>
                      <p className="text-foreground">They wanted to buy in Q4. You called them in Q2. By Q4, you'd forgotten about them. They bought from someone else.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <span className="text-red-600 dark:text-red-400 font-bold text-lg">❌</span>
                    <div>
                      <p className="font-semibold text-foreground mb-1">The capacity crunch:</p>
                      <p className="text-foreground">Your team had 50 new leads to work. Old leads got deprioritized. Then forgotten entirely.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-4 text-center">The brutal economics:</h3>
                  <div className="space-y-3">
                    <p className="text-foreground text-center">
                      You paid <strong>$50-300 to acquire each lead</strong>. If you have 3,000 "dead" leads in your CRM, that's
                    </p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400 text-center">
                      $150,000-900,000 in sunk acquisition costs
                    </p>
                    <p className="text-foreground text-center mt-4">
                      Research shows <strong>15-25% of old leads are actually ready to buy now</strong> if someone just asked them.
                    </p>
                    <p className="text-foreground text-center">
                      That's <strong className="text-emerald-600 dark:text-emerald-400">450-750 opportunities</strong> sitting in your database. <strong>You've already paid for them.</strong>
                    </p>
                  </div>
                </div>
                
                <p className="text-xl font-bold text-center text-foreground">
                  Why spend $50k/month on new ads when you're sitting on $200k in forgotten pipeline?
                </p>
              </div>
            </div>
          </div>
        </section>

        <TryItSection
          title="Experience it before setting anything up"
          description="Talk to a real AI agent and hear how it:"
          features={[
            "Re-introduces your business naturally",
            "Checks timing and interest",
            "Handles objections calmly",
            "Books appointments when it makes sense"
          ]}
          ctaText="Talk to the agent"
          onCtaClick={handleOpenWidget}
        />

        <PerfectForSection
          title="Designed for businesses with real pipelines"
          items={perfectFor}
          footer="If you've ever said 'we should follow up on those someday' — this is for you."
        />

        <StepsSection
          title="Mine Your CRM for Ready Buyers"
          steps={steps}
          footer="No prompts. No scripts. No manual dialing."
        />

        <RevenueRecoveryDashboard />

        {/* Use Cases Section with Custom Layout */}
        <section className="py-24 px-6 bg-card/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center">
              Real Results from Real Teams
            </h2>
            <p className="text-xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
              See how teams are recovering pipeline from leads they already paid for
            </p>
            
            <div className="space-y-12">
              {useCases.map((useCase, index) => (
                <div 
                  key={index} 
                  className="bg-background rounded-3xl p-8 md:p-12 shadow-xl border border-border"
                >
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <useCase.icon className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-primary uppercase tracking-wide">{useCase.category}</p>
                          <h3 className="text-2xl md:text-3xl font-bold text-foreground">{useCase.title}</h3>
                        </div>
                      </div>
                      <p className="text-lg text-muted-foreground mb-4">{useCase.description}</p>
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-6">{useCase.results}</p>
                      
                      <blockquote className="border-l-4 border-primary pl-4 italic text-foreground mb-6">
                        "{useCase.quote}"
                      </blockquote>
                      
                      <div className="bg-primary/5 rounded-xl p-4 space-y-2">
                        {Object.entries(useCase.metrics).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                            <span className="text-sm font-semibold text-foreground">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="relative hidden lg:flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl" />
                      <div className="relative p-12">
                        <useCase.icon className="w-32 h-32 text-primary/20" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FeaturesGrid
          title="Built for Revenue Recovery, Not Cold Spam"
          features={revenueRecoveryFeatures}
          footer={{
            line1: "This isn't spam automation.",
            line2: "It's thoughtful follow-up at scale."
          }}
        />

        <HiddenRevenueCalculator />

        <ComparisonTable
          title="Lead Revival: Manual vs Email vs AI"
          rows={[
            {
              feature: "Capacity",
              human: "20-30 calls/day max",
              answeringService: "Unlimited",
              voiceable: "Unlimited, scales automatically"
            },
            {
              feature: "Personalization",
              human: "High (if rep remembers context)",
              answeringService: "Low (scripted)",
              voiceable: "High (remembers every detail)"
            },
            {
              feature: "Cost",
              human: "$50-100k/year salary",
              answeringService: "$0.50-2/call",
              voiceable: "$15/revival (10x cheaper than new leads)"
            },
            {
              feature: "Response Rate",
              human: "15-20% (if they answer)",
              answeringService: "8-12%",
              voiceable: "18-25% average"
            },
            {
              feature: "Interest Detection",
              human: "Subjective",
              answeringService: "None",
              voiceable: "AI detects genuine interest vs politeness"
            },
            {
              feature: "Timing",
              human: "Business hours only",
              answeringService: "24/7 but scripted",
              voiceable: "24/7, natural conversations"
            },
            {
              feature: "Respectfulness",
              human: "Varies by rep",
              answeringService: "Aggressive scripts",
              voiceable: "Acknowledges gap, gives opt-out, stops after 2 attempts"
            },
            {
              feature: "CRM Updates",
              human: "Manual entry",
              answeringService: "None",
              voiceable: "Automatic, real-time"
            },
            {
              feature: "Scale",
              human: "Limited by headcount",
              answeringService: "Limited by budget",
              voiceable: "Unlimited, cost-effective"
            }
          ]}
        />

        <ObjectionHandlingSection
          title="Common Concerns About Lead Revival"
          objections={[
            {
              question: "Won't this annoy leads who already said no?",
              answer: "Our AI is respectful by design. It acknowledges the gap in time, gives a clear opt-out, and stops after 2 attempts if there's no interest. Average satisfaction rating: 4.2/5. Most leads appreciate the follow-up — they just needed someone to ask again at the right time."
            },
            {
              question: "How is this different from spam calling?",
              answer: "These leads gave you their contact information. They inquired, requested quotes, or signed up for demos. You have a legitimate business relationship. This is re-engaging existing relationships, not cold calling strangers. It's the difference between calling a past client and cold calling a random number."
            },
            {
              question: "Our old leads are probably with competitors by now.",
              answer: "Research shows: 44% of old leads never chose anyone. 27% are still evaluating options. Only 29% went with a competitor. That means 71% of your 'dead' leads are still potential customers — they just need someone to ask again."
            },
            {
              question: "We tried re-engaging before and it didn't work.",
              answer: "Manual re-engagement doesn't scale. Your rep called 20 leads, got 2 responses, gave up. AI can test thousands of leads, find patterns (e.g., 'leads from 6-9 months ago have 22% revival rate'), and persist where it makes sense. It's the difference between a single fishing line and a trawler net."
            }
          ]}
        />

        {/* Segmentation Strategy Section */}
        <section className="py-24 px-6 bg-card/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center">
              Smart Segmentation Strategy
            </h2>
            <p className="text-xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
              Not all old leads are equal. Here's how we prioritize for maximum revival:
            </p>
            
            <div className="space-y-6">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-8 border-2 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-emerald-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">1</span>
                  <h3 className="text-2xl font-bold text-foreground">Tier 1: Recent & Engaged (6-12 months)</h3>
                </div>
                <p className="text-lg text-foreground mb-2">22-31% revival rate</p>
                <p className="text-muted-foreground">These are your best opportunities. They engaged recently, showed real interest, then went quiet. Highest priority for revival.</p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">2</span>
                  <h3 className="text-2xl font-bold text-foreground">Tier 2: Older But Qualified (12-18 months)</h3>
                </div>
                <p className="text-lg text-foreground mb-2">15-20% revival rate</p>
                <p className="text-muted-foreground">Still qualified leads, just older. Good revival potential if circumstances changed.</p>
              </div>
              
              <div className="bg-violet-50 dark:bg-violet-900/20 rounded-2xl p-8 border-2 border-violet-200 dark:border-violet-800">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-violet-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">3</span>
                  <h3 className="text-2xl font-bold text-foreground">Tier 3: Ancient But Large (18-36 months)</h3>
                </div>
                <p className="text-lg text-foreground mb-2">8-12% revival rate</p>
                <p className="text-muted-foreground">Lower priority, but if deal size is large, worth a try. Only if time permits.</p>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border-2 border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">✗</span>
                  <h3 className="text-2xl font-bold text-foreground">Don't Bother</h3>
                </div>
                <p className="text-muted-foreground">Never qualified, poor fit, explicitly opted out, or already went with competitor.</p>
              </div>
            </div>
            
            <div className="mt-8 bg-primary/5 rounded-xl p-6 border border-primary/20">
              <p className="text-center text-foreground">
                <strong>Strategy:</strong> Mine Tier 1 first (highest ROI), then Tier 2, only Tier 3 if time permits. AI automatically prioritizes based on revival probability.
              </p>
            </div>
          </div>
        </section>

        {/* The Economics of Revival Section */}
        <section className="py-24 px-6 bg-background">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center">
              The Economics of Revival
            </h2>
            <p className="text-xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
              Why spend on new acquisition when you're sitting on a gold mine?
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border-2 border-red-200 dark:border-red-800">
                <h3 className="text-2xl font-bold text-foreground mb-6">New Acquisition</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Ad spend:</p>
                    <p className="text-2xl font-bold text-foreground">$50-300/lead</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Conversion rate:</p>
                    <p className="text-2xl font-bold text-foreground">2-5%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cost per customer:</p>
                    <p className="text-2xl font-bold text-foreground">$1,000-15,000</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time to close:</p>
                    <p className="text-2xl font-bold text-foreground">3-6 months</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-8 border-2 border-emerald-200 dark:border-emerald-800">
                <h3 className="text-2xl font-bold text-foreground mb-6">Lead Revival</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Revival cost:</p>
                    <p className="text-2xl font-bold text-foreground">$15/lead</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Revival rate:</p>
                    <p className="text-2xl font-bold text-foreground">15-25%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cost per customer:</p>
                    <p className="text-2xl font-bold text-foreground">$60-100</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time to close:</p>
                    <p className="text-2xl font-bold text-foreground">1-3 months</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-primary/10 rounded-3xl p-8 md:p-12 border border-primary/20">
              <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Real Example:</h3>
              <div className="space-y-4 max-w-3xl mx-auto">
                <p className="text-lg text-foreground">
                  You have <strong>3,000 old leads</strong> in your CRM. You paid <strong>$150/lead</strong> to acquire them.
                </p>
                <div className="bg-background rounded-xl p-6">
                  <p className="text-foreground mb-2">
                    <strong>Sunk acquisition cost:</strong> $450,000 (already spent)
                  </p>
                  <p className="text-foreground mb-2">
                    <strong>Revivable leads (18%):</strong> 540 leads
                  </p>
                  <p className="text-foreground mb-2">
                    <strong>Average deal value:</strong> $8,000
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-4">
                    Revenue potential: $4,320,000
                  </p>
                  <p className="text-foreground mt-4">
                    <strong>Revival cost:</strong> $8,100 (540 leads × $15)
                  </p>
                  <p className="text-xl font-bold text-foreground mt-4">
                    ROI: <span className="text-emerald-600 dark:text-emerald-400">180x</span> on money already spent
                  </p>
                </div>
                <p className="text-xl font-bold text-center text-foreground mt-6">
                  This isn't new revenue. This is found money.
                </p>
              </div>
            </div>
          </div>
        </section>

        <TestimonialsSection 
          testimonials={testimonials}
          title="Trusted by Teams Who Refuse to Leave Money on the Table"
        />

        {/* Final CTA Section */}
        <section className="py-24 px-6 bg-card/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-center">
              Stop Ignoring Your Gold Mine
            </h2>
            
            <div className="bg-background rounded-3xl p-8 md:p-12 shadow-2xl border border-border mt-12">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-6 text-center">What you get:</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {[
                    "14-day free trial",
                    "Set up in 15 minutes",
                    "First revived lead within 48 hours",
                    "Pipeline dashboard shows hidden value immediately",
                    "Average revival rate: 15-25%"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-card">
                      <span className="text-emerald-500 text-xl">✓</span>
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-border pt-8 mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Every agent includes:</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    "Unlimited lead revival calls",
                    "Smart segmentation & prioritization",
                    "Respectful, natural conversations",
                    "Automatic CRM updates",
                    "Real-time revival rate tracking",
                    "Cost-per-revival analytics"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 mb-8">
                <p className="text-center text-2xl font-bold text-foreground mb-2">
                  $380/month
                </p>
                <p className="text-center text-muted-foreground">
                  Average pipeline recovered: $180k-340k from existing database
                </p>
              </div>
              
              <p className="text-xl font-bold text-center text-foreground mb-8">
                Would you rather spend $20k on new ads, or $380 mining leads you already paid for?
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8" onClick={handleOpenWidget}>
                  Book Demo
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
                  <Link to="/sign-up">
                    Start Free Trial
                  </Link>
                </Button>
              </div>
            </div>
          </div>
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