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
  Bot,
  Briefcase,
  CalendarCheck,
  Clock,
  Globe,
  Headphones,
  Mic,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  ShoppingBag,
  Smile,
  Store,
  UserCheck,
  Users,
  Sparkles,
} from "lucide-react";
import { HowItWorksSection } from "@/components/landing-page/SalesNarrativeSections";

const operatorSegments = [
  {
    id: "phone-calls",
    label: "Phone calls",
    tabs: [
      { id: "inbound_call", label: "Inbound call", icon: PhoneIncoming },
      { id: "outbound_campaign", label: "Outbound campaign", icon: PhoneOutgoing },
    ],
  },
  {
    id: "live-conversations",
    label: "Live conversations",
    tabs: [
      { id: "web_widget", label: "Website widget", icon: Globe },
      { id: "human_handoff", label: "Human handoff", icon: Phone },
    ],
  },
];

const operatorTabExamples = {
  inbound_call: {
    user: {
      name: "Jordan",
      location: "Inbound call",
      time: "10:04 AM PST",
      avatar: "J",
      message:
        "Hi, I'm calling to ask about your opening hours this weekend and whether I can move my appointment to Saturday morning.",
    },
    ai: {
      audioDuration: "01:02",
      message:
        "Of course, Jordan. We're open Saturday from 9 to 5. I can see your Thursday appointment — I have 9:30 or 11:00 AM available on Saturday. Which works better for you?",
    },
    metadata: {
      status: "Call answered instantly",
      statusColor: "bg-green-500",
      priority: "High",
      sentiment: "Positive",
      sentimentIcon: Smile,
      actions: ["Action: Appointment found", "Action: Reschedule offered"],
      documents: ["Docs: Business hours", "Booking_calendar.pdf"],
    },
  },
  outbound_campaign: {
    user: {
      name: "Sam",
      location: "Outbound campaign",
      time: "2:51 PM EST",
      avatar: "S",
      message: "Answered a reminder call from the appointment confirmation campaign.",
    },
    ai: {
      audioDuration: "00:54",
      message:
        "Hi Sam, this is a quick reminder about your appointment tomorrow at 2 PM. Can you still make it, or would you like me to find another time?",
    },
    metadata: {
      status: "Campaign running",
      statusColor: "bg-blue-500",
      priority: "Medium",
      sentiment: "Engaged",
      sentimentIcon: Smile,
      actions: ["Action: Reminder delivered", "Action: Attendance confirmed"],
      documents: ["Docs: Campaign list", "Appointment_schedule.pdf"],
    },
  },
  web_widget: {
    user: {
      name: "Priya",
      location: "Website widget",
      time: "4:22 PM IST",
      avatar: "P",
      message: "Started a voice conversation from the widget on your pricing page.",
    },
    ai: {
      audioDuration: "00:58",
      message:
        "Hi Priya! Happy to help you compare plans. Based on what you've described, the Growth plan covers your team — and I can answer anything about setup or billing right now.",
    },
    metadata: {
      status: "On live voice",
      statusColor: "bg-green-500",
      priority: "High",
      sentiment: "Progressing",
      sentimentIcon: Smile,
      actions: ["Action: Session started", "Action: Plan question answered"],
      documents: ["Docs: Plan comparison", "Pricing_FAQ.pdf"],
    },
  },
  human_handoff: {
    user: {
      name: "Alex",
      location: "Escalated to your team",
      time: "9:08 AM CET",
      avatar: "A",
      message: "The assistant escalated a billing dispute that needed a human decision.",
    },
    ai: {
      audioDuration: "00:36",
      message:
        "Handing off to you with full context: customer was double-charged on the June invoice, wants a refund to the original card. Transcript and account details are attached.",
    },
    metadata: {
      status: "Team member joined",
      statusColor: "bg-green-500",
      priority: "High",
      sentiment: "Resolved",
      sentimentIcon: Smile,
      actions: ["Action: Escalation triggered", "Action: Context delivered"],
      documents: ["Docs: Conversation summary", "Billing_history.pdf"],
    },
  },
};

const Landing3 = () => {
  const heroContent = {
    badgeText: "AI voice agents for your business",
    headline: "AI voice agents that answer every call",
    subtitle: "Every call should be handled like it's your best employee answering.",
    tagline: "Any time of day. Any day of the week.",
    socialProofText: "Built for support, bookings, and sales teams",
  };

  const featuresContent = [
    {
      title: "Answer every call, 24/7",
      description:
        "Connect a phone number and your AI assistant picks up instantly — answering questions, booking appointments, and resolving issues around the clock.",
      benefits: ["Instant pickup, no hold music", "Books and reschedules appointments", "Trained on your business knowledge"],
      closing: "Never miss a customer again.",
      gradient: "from-primary/20 via-emerald-500/10 to-transparent",
      icon: PhoneIncoming,
    },
    {
      title: "Talk to visitors on your website",
      description:
        "Add a voice widget to your site so visitors can ask questions out loud and get real answers — no forms, no waiting for an email reply.",
      benefits: ["One-line embed on any site", "Real-time voice conversations", "Answers grounded in your docs"],
      closing: "No scheduling. No waiting.",
      gradient: "from-purple/20 via-pink-500/10 to-transparent",
      icon: Mic,
    },
    {
      title: "Escalate to humans when it matters",
      description:
        "Your assistant handles the routine and hands off the rest — with full context, transcripts, and outcomes tracked for every conversation.",
      benefits: ["Human handoff with full context", "Outbound campaigns and reminders", "Transcripts and outcome analytics"],
      gradient: "from-amber/20 via-orange-500/10 to-transparent",
      icon: UserCheck,
    },
  ];

  const solutionsContent = [
    {
      id: "customer-support",
      label: "Customer support",
      icon: Headphones,
      title: "AI voice agents for customer support",
      description:
        "Resolve common questions instantly and escalate complex issues to your team with full context — 24/7, without hold queues.",
      features: [
        {
          icon: Bot,
          title: "Resolve on the first call",
          description:
            "Answers grounded in your knowledge base handle the questions your team sees every day.",
        },
        {
          icon: UserCheck,
          title: "Escalate with context",
          description:
            "When a human is needed, your team gets the transcript and the situation — not a cold start.",
        },
      ],
    },
    {
      id: "small-business",
      label: "Small business",
      icon: Store,
      title: "An AI receptionist for bookings and scheduling",
      description:
        "Salons, spas, studios, and restaurants: take bookings, answer questions, and manage your schedule even when you're with a customer.",
      features: [
        {
          icon: CalendarCheck,
          title: "Book appointments by voice",
          description:
            "Customers call, the assistant checks availability and books — no app, no back-and-forth.",
        },
        {
          icon: Clock,
          title: "Cover every hour",
          description:
            "Evenings, weekends, and busy rushes are answered the same as a quiet Tuesday morning.",
        },
      ],
    },
    {
      id: "retail-ecommerce",
      label: "Retail & eCommerce",
      icon: ShoppingBag,
      title: "Voice answers for shoppers who are deciding",
      description:
        "Give shoppers instant answers on products, orders, sizing, and returns — on the phone or right on your product pages.",
      features: [
        {
          icon: Globe,
          title: "Help on the page",
          description:
            "The website widget answers product and order questions while the shopper is still looking.",
        },
        {
          icon: PhoneIncoming,
          title: "Order and return calls handled",
          description:
            "Routine order status and return questions are resolved without tying up your team.",
        },
      ],
    },
    {
      id: "recruitment",
      label: "Recruitment",
      icon: Briefcase,
      title: "Screen and schedule candidates automatically",
      description:
        "Run outbound screening calls, answer candidate questions, and book interviews without your recruiters dialing all day.",
      features: [
        {
          icon: PhoneOutgoing,
          title: "Outbound screening at scale",
          description:
            "Campaigns call candidate lists, ask your screening questions, and log outcomes.",
        },
        {
          icon: Users,
          title: "Hand qualified candidates to recruiters",
          description:
            "Strong candidates get routed to your team with the full conversation attached.",
        },
      ],
    },
  ];

  const liveCallsContent = [
    { type: "Customer", location: "Inbound Call", topic: "Appointment Booking", status: "Resolved" as const, time: "4 min ago", duration: "312 sec" },
    { type: "Visitor", location: "Website Widget", topic: "Plan Comparison", status: "In Progress" as const, time: "7 min ago", duration: "489 sec" },
    { type: "Shopper", location: "Inbound Call", topic: "Order Status", status: "Resolved" as const, time: "11 min ago", duration: "266 sec" },
    { type: "Candidate", location: "Outbound Campaign", topic: "Screening Call", status: "Unresolved" as const, time: "15 min ago", duration: "205 sec" },
    { type: "Customer", location: "Inbound Call", topic: "Reschedule Request", status: "Resolved" as const, time: "17 min ago", duration: "339 sec" },
    { type: "Customer", location: "Escalation", topic: "Billing Question", status: "In Progress" as const, time: "21 min ago", duration: "581 sec" },
    { type: "Visitor", location: "Website Widget", topic: "Product Question", status: "Resolved" as const, time: "26 min ago", duration: "420 sec" },
    { type: "Customer", location: "Outbound Campaign", topic: "Appointment Reminder", status: "Resolved" as const, time: "29 min ago", duration: "198 sec" },
  ];

  const ctaContent = {
    title: "Stop missing calls. Let your AI assistant pick up.",
    description:
      "Create an assistant, connect a phone number or embed the widget, and start handling real conversations today.",
    features: [
      "Answer every call instantly, 24/7",
      "Book appointments and resolve questions",
      "Escalate to your team with full context",
      "See transcripts and outcomes for every call",
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
          previewName="Incoming call"
          previewMeta="Booking — Saturday appointment"
          previewStatus="Answered by your AI assistant"
        />
        <FeaturesSection
          eyebrow="What Voiceable does"
          title="Your best employee, on every call."
          description="Voiceable answers your phone and your website with AI voice assistants trained on your business."
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
                From the first ring to a resolved conversation.
              </h2>
              <p className="text-lg text-muted-foreground">
                Switch scenarios to preview how Voiceable handles inbound calls, outbound campaigns, website voice conversations, and handoffs to your team.
              </p>
            </div>
          </div>
          <OperatorInterfaceSection
            segments={operatorSegments}
            tabExamples={operatorTabExamples}
            audioSrc="/landing-page-audio.mp3"
          />
        </section>
        <HowItWorksSection />
        <SolutionsSection
          eyebrow="Built for real conversations"
          title="One assistant. Many jobs."
          description="From support lines to booking desks to screening calls — wherever a conversation moves your business forward."
          activeEyebrow="Perfect for"
          chartTitle="Calls handled"
          chartValue="87"
          chartXAxisLabel="Conversations resolved this week"
          solutions={solutionsContent}
        />
        <LiveCallsSection
          title="Live conversations across your business"
          subtitle="A snapshot of the calls and voice chats Voiceable assistants are handling right now."
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
            secondaryButtonLabel="Get started free"
            secondaryButtonAction="signup"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Landing3;
