"use client";

import Header from "@/components/landing-page/Header";
import HeroSection from "@/components/landing-page/HeroSection";
import FeaturesSection from "@/components/landing-page/FeaturesSection";
import LiveCallsSection from "@/components/landing-page/LiveCallsSection";
import SolutionsSection from "@/components/landing-page/SolutionsSection";
import CTASection from "@/components/landing-page/CTASection";
import Footer from "@/components/landing-page/Footer";
import OperatorInterfaceSection from "@/components/landing-page/OperatorInterfaceSection";
import SecuritySection from "@/components/landing-page/SecuritySection";
import {
  BarChart3,
  Briefcase,
  Building2,
  Clock,
  DollarSign,
  Eye,
  Landmark,
  Mic,
  Phone,
  Plane,
  ShoppingBag,
  Smile,
  Target,
  TrendingUp,
  UserCheck,
  Zap,
  Sparkles,
} from "lucide-react";
import {
  BehavioralShiftSection,
  ContrastSection,
  CredibilitySection,
  HowItWorksSection,
  HybridScaleSection,
  MetricsProofSection,
} from "@/components/landing-page/SalesNarrativeSections";

const salesOperatorSegments = [
  {
    id: "intent-signals",
    label: "Intent signals",
    tabs: [
      { id: "pricing_intent", label: "Pricing page", icon: BarChart3 },
      { id: "repeat_views", label: "Key pages", icon: Eye },
    ],
  },
  {
    id: "live-sales",
    label: "Live sales",
    tabs: [
      { id: "instant_voice", label: "Instant voice", icon: Mic },
      { id: "rep_handoff", label: "Human handoff", icon: Phone },
    ],
  },
];

const salesOperatorTabExamples = {
  pricing_intent: {
    user: {
      name: "Jordan",
      location: "Enterprise pricing",
      time: "10:04 AM PST",
      avatar: "J",
      message:
        "I have been comparing your Growth and Enterprise plans for ten minutes. I need someone to clarify SSO seats and onboarding before I pull the trigger this week.",
    },
    ai: {
      audioDuration: "01:02",
      message:
        "Hi Jordan — I see you have been on Enterprise pricing with strong engagement. I can connect you instantly over voice, walk through SSO and onboarding, and line up anything you still need today. Tap start when you are ready.",
    },
    metadata: {
      status: "High intent detected",
      statusColor: "bg-amber-500",
      priority: "High",
      sentiment: "Ready to buy",
      sentimentIcon: Smile,
      actions: ["Action: Intent surfaced", "Action: Ready to connect"],
      documents: ["Docs: Enterprise comparison", "SSO_and_seats.pdf"],
    },
  },
  repeat_views: {
    user: {
      name: "Sam",
      location: "Returning visitor",
      time: "2:51 PM EST",
      avatar: "S",
      message:
        "This is my third visit to the product page today. Still deciding between tiers. What is realistic for onboarding if we kick off tomorrow?",
    },
    ai: {
      audioDuration: "00:54",
      message:
        "Thanks for coming back — that repeat attention is helpful context. Voice is the quickest way to get you a definitive answer tied to how you intend to onboard. Shall we connect you live right now?",
    },
    metadata: {
      status: "Returning sessions",
      statusColor: "bg-blue-500",
      priority: "Medium",
      sentiment: "Engaged",
      sentimentIcon: Smile,
      actions: ["Action: Repeat browse tracked", "Action: Invite to live pitch"],
      documents: ["Docs: SKU comparison", "Onboarding_calendar.pdf"],
    },
  },
  instant_voice: {
    user: {
      name: "Priya",
      location: "Live session",
      time: "4:22 PM IST",
      avatar: "P",
      message: "Accepted the instant voice invitation from the calculator page.",
    },
    ai: {
      audioDuration: "00:58",
      message:
        "Great — Priya from Voiceable Sales here. Walking you through rollout with your calculator inputs so you hit your internal targets without rework. Anything on security or SOC2 you still need?",
    },
    metadata: {
      status: "On live voice",
      statusColor: "bg-green-500",
      priority: "High",
      sentiment: "Progressing",
      sentimentIcon: Smile,
      actions: ["Action: Session started", "Action: Talking points surfaced"],
      documents: ["Docs: Mutual action plan", "Security_FAQ.pdf"],
    },
  },
  rep_handoff: {
    user: {
      name: "Alex",
      location: "Qualified AE handoff",
      time: "9:08 AM CET",
      avatar: "A",
      message: "The assistant qualified budget and timeline. I am stepping in live to close this quarter expansion.",
    },
    ai: {
      audioDuration: "00:36",
      message:
        "Summarizing Jordan for you: SSO for 520 seats needs legal review tomorrow. Prospect wants rollout in two phases. Routing full transcript and objections to CRM now.",
    },
    metadata: {
      status: "Rep joined",
      statusColor: "bg-green-500",
      priority: "High",
      sentiment: "Confident",
      sentimentIcon: Smile,
      actions: ["Action: Rep notified", "Action: Brief delivered"],
      documents: ["Docs: Conversation summary", "CRM_push_record.pdf"],
    },
  },
};

const Landing3 = () => {
  const heroContent = {
    badgeText: "Live sales for high-intent visitors",
    headline: "AI voice sales for high-intent visitors",
    subtitle:
      "Every inbound call should be handled by your top sales rep.",
    tagline: "Any time of day. Any day of the week.",
    socialProofText: "Built for revenue teams and high-consideration sales",
  };

  const featuresContent = [
    {
      title: "Capture high-intent moments",
      description:
        "Know when someone is ready: pricing page visits, time spent on key pages, repeated product views. Trigger a conversation before they bounce.",
      benefits: ["Pricing page visits", "Time spent on key pages", "Repeated product views"],
      closing: "Trigger a real conversation before they bounce.",
      gradient: "from-primary/20 via-emerald-500/10 to-transparent",
      icon: Target,
    },
    {
      title: "Turn traffic into conversations",
      description:
        "Replace forms and delayed follow-ups with instant voice, real human or AI-assisted selling, and context-aware conversations.",
      benefits: ["Instant voice connection", "Human or AI-assisted sales", "Context-aware conversations"],
      closing: "No scheduling. No waiting.",
      gradient: "from-purple/20 via-pink-500/10 to-transparent",
      icon: Mic,
    },
    {
      title: "Increase conversion and deal size",
      description:
        "When you talk to buyers at the right moment, conversion rates climb, average order value expands, and sales cycles shorten.",
      benefits: ["Conversion rates go up", "Average deal size increases", "Sales cycles shrink"],
      gradient: "from-amber/20 via-orange-500/10 to-transparent",
      icon: DollarSign,
    },
  ];

  const solutionsContent = [
    {
      id: "high-ticket-ecommerce",
      label: "High-ticket eCommerce",
      icon: ShoppingBag,
      title: "Live sales for high-ticket eCommerce",
      description:
        "Give shoppers an instant expert voice when they are comparing options, asking sizing questions, or hesitating on a high-value cart.",
      features: [
        {
          icon: Eye,
          title: "Spot purchase intent",
          description:
            "Watch behavior like repeated product views, time on product pages, and high-value cart activity.",
        },
        {
          icon: DollarSign,
          title: "Protect high-value carts",
          description:
            "Connect buyers to a human or AI sales assistant before the moment passes.",
        },
      ],
    },
    {
      id: "b2b-saas",
      label: "B2B SaaS",
      icon: Briefcase,
      title: "Pricing and demo-page conversion for SaaS",
      description:
        "Turn pricing-page hesitation into live qualification, routing, and deal guidance while buyers are actively evaluating.",
      features: [
        {
          icon: BarChart3,
          title: "Qualify active demand",
          description:
            "Use page behavior and declared needs to route serious buyers to the right rep or AI flow.",
        },
        {
          icon: Clock,
          title: "Shorten sales cycles",
          description:
            "Answer plan, security, and pricing questions immediately instead of waiting for a form response.",
        },
      ],
    },
    {
      id: "financial-services",
      label: "Financial services",
      icon: Landmark,
      title: "Trusted conversations for complex decisions",
      description:
        "Help prospects move forward when they need clarity, confidence, and a real answer before committing.",
      features: [
        {
          icon: UserCheck,
          title: "Route high-value prospects",
          description:
            "Use intent signals to identify who needs a specialist and when to bring one in.",
        },
        {
          icon: TrendingUp,
          title: "Increase decision confidence",
          description:
            "Voice builds trust faster than passive pages, emails, and generic lead forms.",
        },
      ],
    },
    {
      id: "travel-real-estate",
      label: "Travel & real estate",
      icon: Plane,
      title: "Conversation-led buying for considered purchases",
      description:
        "Support buyers who are comparing destinations, properties, availability, or packages and need help choosing.",
      features: [
        {
          icon: Building2,
          title: "Guide complex choices",
          description:
            "Bring in the right context around inventory, preferences, budget, and timing.",
        },
        {
          icon: Zap,
          title: "Capture momentum",
          description:
            "Turn active browsing into a live conversation before the buyer continues somewhere else.",
        },
      ],
    },
  ];

  const liveCallsContent = [
    { type: "Buyer", location: "on Pricing", topic: "Plan Comparison", status: "Resolved" as const, time: "4 min ago", duration: "312 sec" },
    { type: "Visitor", location: "in Demo Flow", topic: "Security Review", status: "In Progress" as const, time: "7 min ago", duration: "489 sec" },
    { type: "Shopper", location: "on Product Page", topic: "High-Value Cart", status: "Resolved" as const, time: "11 min ago", duration: "266 sec" },
    { type: "Prospect", location: "on Calculator", topic: "ROI Question", status: "Unresolved" as const, time: "15 min ago", duration: "205 sec" },
    { type: "Buyer", location: "on Plans", topic: "Upgrade Path", status: "Resolved" as const, time: "17 min ago", duration: "339 sec" },
    { type: "Visitor", location: "on Checkout", topic: "Financing", status: "In Progress" as const, time: "21 min ago", duration: "581 sec" },
    { type: "Prospect", location: "on Case Study", topic: "Enterprise Fit", status: "Resolved" as const, time: "26 min ago", duration: "420 sec" },
    { type: "Buyer", location: "on Booking Page", topic: "Availability", status: "Unresolved" as const, time: "29 min ago", duration: "198 sec" },
  ];

  const ctaContent = {
    title: "Do not wait for leads. Talk to buyers when they are ready.",
    description:
      "Book a guided walkthrough or start a converting flow today — turn active intent into conversations your team can close.",
    features: [
      "Capture high-intent visitors in real time",
      "Route qualified buyers to humans or AI",
      "Shorten the distance from intent to close",
      "Recover revenue already coming through paid traffic",
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Header />
      <main>
        <HeroSection
          badgeText={heroContent.badgeText}
          headline={heroContent.headline}
          subtitle={heroContent.subtitle}
          tagline={heroContent.tagline}
          socialProofText={heroContent.socialProofText}
          primaryCtaLabel="Talk to Sales"
          primaryCtaAction="calendar"
          secondaryCtaLabel="See it in action"
          secondaryCtaAction="anchor"
          secondaryAnchorId="product-demo"
          previewName="High-intent visitor"
          previewMeta="Pricing — Enterprise comparison"
          previewStatus="Live sales conversation triggered"
        />
        <CredibilitySection />
        <FeaturesSection
          eyebrow="Core value props"
          title="Convert buying intent before it disappears."
          description="Voiceable turns your best website moments into live sales conversations."
          features={featuresContent}
        />
        <section id="product-demo" aria-label="Product demo" className="scroll-mt-28">
          <div className="container mx-auto px-4 md:px-6 pt-12 pb-8 md:pt-20 md:pb-12">
            <div className="max-w-3xl mx-auto text-center">
              <div className="feature-pill mb-6 inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>See it in action</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                From intent signals to revenue conversations on your site.
              </h2>
              <p className="text-lg text-muted-foreground">
                Switch scenarios to preview how Voiceable reacts when pricing traffic spikes, shoppers return repeatedly, buyers accept instant voice, or your rep jumps in mid-flow.
              </p>
            </div>
          </div>
          <OperatorInterfaceSection
            segments={salesOperatorSegments}
            tabExamples={salesOperatorTabExamples}
            audioSrc="/landing-page-audio.mp3"
          />
        </section>
        <SolutionsSection
          eyebrow="Built for revenue-critical flows"
          title="Voiceable is not for support tickets."
          description="It is for moments where revenue is on the line, anywhere a conversation can unlock a decision."
          activeEyebrow="Perfect for"
          chartTitle="Intent captured"
          chartValue="87"
          chartXAxisLabel="High-intent moments engaged"
          solutions={solutionsContent}
        />
        <HowItWorksSection />
        <BehavioralShiftSection />
        <HybridScaleSection />
        <MetricsProofSection />
        <ContrastSection />
        <LiveCallsSection
          title="Live conversations in motion across your funnel"
          subtitle="Snapshot of buyer moments teams are resolving with Voiceable right now."
          calls={liveCallsContent}
        />
        <SecuritySection />
        <div className="pb-8 md:pb-12">
          <CTASection
            title={ctaContent.title}
            description={ctaContent.description}
            features={ctaContent.features}
            showCalendarOnly={true}
            primaryButtonLabel="Book a demo"
            primaryButtonAction="calendar"
            secondaryButtonLabel="Start converting today"
            secondaryButtonAction="signup"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Landing3;
