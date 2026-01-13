import { useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/landing-page/Header";
import HeroSection from "@/components/landing-page/HeroSection";
import FeatureNav from "@/components/landing-page/FeatureNav";
import AssistantSection from "@/components/landing-page/AssistantSection";
import ResponsesSection from "@/components/landing-page/ResponsesSection";
import FeaturesSection from "@/components/landing-page/FeaturesSection";
import LiveCallsSection from "@/components/landing-page/LiveCallsSection";
import HumanLedSection from "@/components/landing-page/HumanLedSection";
import SeamlessSetupSection from "@/components/landing-page/SeamlessSetupSection";
import SolutionsSection from "@/components/landing-page/SolutionsSection";
import UserLoveSection from "@/components/landing-page/UserLoveSection";
import CTASection from "@/components/landing-page/CTASection";
import Footer from "@/components/landing-page/Footer";
import OperatorInterfaceSection from "@/components/landing-page/OperatorInterfaceSection";
import { SEO } from "@/components/SEO";
import { MessageCircle, Calendar, UserPlus, PhoneForwarded, RefreshCw, Check, Clock, Smile, Globe, ArrowRightLeft, AlertTriangle, Calendar as CalendarIcon, CreditCard, Wrench, Package, Truck, ShoppingBag, Box, Building2, Stethoscope, Home, Truck as TruckIcon, Code, Phone, Sparkles, ArrowRight, Heart, Play, Pause, CheckCircle2, FileText, Meh, Frown, RotateCcw, Layers, Brain, Cloud, Users, CloudLightning, Mail, Infinity as InfinityIcon, ShieldCheck } from "lucide-react";

const Landing = () => {
  const [activeFeature, setActiveFeature] = useState("assistant");
  const location = useLocation();
  const baseUrl = "https://voice-agent-ai-4288599ce3fe.herokuapp.com";
  const currentUrl = `${baseUrl}${location.pathname}`;

  // Content configuration for scheduling, Q&A, and CRM sync focus
  const heroContent = {
    badgeText: "Never miss a demo call, 24/7",
    headline: "Convert leads & book appointments with a 24/7 AI assistant",
    subtitle: "Your 24/7 AI SDR that qualifies leads, books demos directly into Cal.com, syncs context to your CRM, and answers technical questions. Perfect for B2B SaaS teams with $10k–$200k MRR managing high inbound volume.",
    socialProofText: "Trusted by B2B SaaS Teams"
  };

  const featuresContent = [
    {
      title: "Answer Questions",
      description: "Responds 24/7 to common inquiries about services, pricing, availability, and business hours. Voiceable pulls answers from your knowledge base and handles FAQs instantly, freeing your team for high-value conversations.",
      benefits: ["Reduce call volume by 60%", "Instant answers to common questions"],
      gradient: "from-primary/20 via-emerald-500/10 to-transparent",
      icon: MessageCircle,
    },
    {
      title: "Book Appointments",
      description: "Prospects book appointments in a single call. Voiceable syncs with your calendar (Google Calendar, Outlook, Calendly), sends confirmations and reminders, and follows up automatically, so no lead falls through the cracks.",
      benefits: ["Convert more leads to appointments", "Reduce missed connections"],
      gradient: "from-green/20 via-emerald-500/10 to-transparent",
      icon: Calendar,
    },
    {
      title: "Collect Information",
      description: "Automatically captures lead information, qualifies prospects, and syncs everything to your CRM (HubSpot, Salesforce, Pipedrive). No manual data entry, no lost leads, complete visibility into every interaction.",
      benefits: ["100% lead capture rate", "Automatic CRM sync"],
      gradient: "from-amber/20 via-orange-500/10 to-transparent",
      icon: UserPlus,
    },
    {
      title: "Transfer Calls",
      description: "Seamlessly hand live calls from the AI to your team with full context. No dropped calls, no repeating information - your team gets complete conversation history and can pick up exactly where the AI left off.",
      benefits: ["Zero dropped calls", "Full context handoff"],
      gradient: "from-purple/20 via-pink-500/10 to-transparent",
      icon: PhoneForwarded,
    },
    {
      title: "Follow Up",
      description: "Automated follow-ups ensure no lead is forgotten. Voiceable sends reminders, checks in on scheduled appointments, and nurtures prospects through your sales funnel automatically.",
      benefits: ["Never miss a follow-up", "Automated lead nurturing"],
      gradient: "from-blue/20 via-cyan-500/10 to-transparent",
      icon: RefreshCw,
    },
  ];

  const solutionsContent = [
    // {
    //   id: "clinics",
    //   label: "Clinics",
    //   icon: Stethoscope,
    //   title: "Appointment Scheduling & Patient Q&A Agent",
    //   description: "Handle appointment bookings, patient inquiries, intake forms, and follow-ups 24/7. Sync with your practice management system and never miss a patient call.",
    //   features: [
    //     {
    //       icon: Calendar,
    //       title: "Automated Appointment Booking",
    //       description: "Patients book appointments directly through phone calls. Syncs with your calendar system, sends confirmations, and handles rescheduling automatically."
    //     },
    //     {
    //       icon: MessageCircle,
    //       title: "Patient Q&A & Intake",
    //       description: "Answers questions about services, insurance, hours, and collects patient information before appointments. Reduces front desk workload significantly."
    //     }
    //   ]
    // },
    // {
    //   id: "real-estate",
    //   label: "Real Estate",
    //   icon: Home,
    //   title: "Property Inquiries & Viewing Scheduling Agent",
    //   description: "Handle property inquiries, schedule viewings, qualify leads, and sync everything to your CRM. Never miss a potential buyer or renter.",
    //   features: [
    //     {
    //       icon: MessageCircle,
    //       title: "Property Information & Q&A",
    //       description: "Answers questions about properties, neighborhoods, pricing, and availability. Provides detailed information instantly, 24/7."
    //     },
    //     {
    //       icon: Calendar,
    //       title: "Viewing Scheduling & Lead Qualification",
    //       description: "Books property viewings, qualifies leads, and automatically syncs all information to your CRM. Follows up with prospects automatically."
    //     }
    //   ]
    // },
    // {
    //   id: "logistics",
    //   label: "Logistics",
    //   icon: TruckIcon,
    //   title: "Delivery Scheduling & Customer Support Agent",
    //   description: "Handle delivery scheduling, tracking inquiries, and customer support 24/7. Syncs with your logistics system and keeps customers informed every step.",
    //   features: [
    //     {
    //       icon: Calendar,
    //       title: "Delivery Scheduling",
    //       description: "Customers schedule deliveries, reschedule appointments, and get real-time updates. Integrates with your logistics platform automatically."
    //     },
    //     {
    //       icon: MessageCircle,
    //       title: "Tracking & Support Q&A",
    //       description: "Answers questions about delivery status, provides tracking information, and handles customer inquiries instantly, reducing support ticket volume."
    //     }
    //   ]
    // },
    {
      id: "saas-support",
      label: "B2B SaaS",
      icon: Code,
      title: "Your 24/7 AI SDR for inbound demo calls",
      description: "Turn inbound calls into booked demos, without hiring SDRs. Qualifies leads, books demos directly into Cal.com, syncs context to your CRM, and answers technical questions. Perfect for B2B SaaS teams with $10k–$200k MRR managing high inbound volume.",
      features: [
        {
          icon: Calendar,
          title: "Qualify Leads & Book Demos",
          description: "Qualifies leads based on budget and use case, books product demos directly into Cal.com, and syncs all information to your CRM. Converts inbound calls into qualified demos automatically, even outside business hours."
        },
        {
          icon: MessageCircle,
          title: "Technical Q&A & Support",
          description: "Answers technical questions like 'Can you integrate with X?' and provides product information. Handles common support inquiries, reducing support team workload while keeping leads engaged."
        }
      ]
    },
  ];

  const responsesCategories = [
    {
      id: "scheduling",
      label: "Scheduling",
      title: "Scheduling",
      description: "Seamlessly schedule appointments, meetings, and calls in real-time with calendar integration.",
      message: "Hi, I'd like to book an appointment for next week. What times are available?",
      icon: Calendar,
      emoji: "📅",
    },
    {
      id: "qa",
      label: "Q&A",
      title: "Q&A",
      description: "Answer questions about services, pricing, hours, and business information instantly.",
      message: "What are your business hours and what services do you offer? I'm looking for more information.",
      icon: MessageCircle,
      emoji: "💬",
    },
    {
      id: "lead-collection",
      label: "Lead Collection",
      title: "Lead Collection",
      description: "Collect and qualify lead information, then sync automatically to your CRM.",
      message: "I'm interested in learning more about your services. Can you tell me more and help me get started?",
      icon: UserPlus,
      emoji: "📋",
    },
    {
      id: "call-transfer",
      label: "Call Transfer",
      title: "Call Transfer",
      description: "Warm transfers with full context to your team when human assistance is needed.",
      message: "Can I speak with someone about pricing and custom solutions? I have some specific requirements.",
      icon: PhoneForwarded,
      emoji: "📞",
    },
    {
      id: "follow-up",
      label: "Follow-up",
      title: "Follow-up",
      description: "Automated follow-ups and reminders to nurture leads and maintain relationships.",
      message: "I wanted to follow up on our conversation from last week. Are you still interested in scheduling a demo?",
      icon: RefreshCw,
      emoji: "🔄",
    },
  ];

  const liveCallsContent = [
    { type: "Lead", location: "in San Francisco", topic: "Appointment Booking", status: "Resolved" as const, time: "11 min ago", duration: "260 sec" },
    { type: "Prospect", location: "in Portland", topic: "Service Q&A", status: "Unresolved" as const, time: "26 min ago", duration: "205 sec" },
    { type: "Customer", location: "in New York", topic: "Follow-up Call", status: "Unresolved" as const, time: "14 min ago", duration: "339 sec" },
    { type: "Lead", location: "in Austin", topic: "Lead Qualification", status: "Unresolved" as const, time: "16 min ago", duration: "3518 sec" },
    { type: "Prospect", location: "in Chicago", topic: "Demo Scheduling", status: "Resolved" as const, time: "16 min ago", duration: "249 sec" },
    { type: "Customer", location: "in Miami", topic: "Appointment Reschedule", status: "Unresolved" as const, time: "23 min ago", duration: "1807 sec" },
    { type: "Lead", location: "in Seattle", topic: "Information Request", status: "Resolved" as const, time: "13 min ago", duration: "207 sec" },
    { type: "Prospect", location: "in Boston", topic: "Call Transfer", status: "In Progress" as const, time: "8 min ago", duration: "292 sec" },
  ];

  const seamlessSetupFeatures = [
    {
      id: "calendar-integration",
      title: "Calendar Integration",
      description: "Syncs with Google Calendar, Outlook, and Calendly to book appointments automatically. Real-time availability checking and conflict resolution.",
      Icon: Calendar,
    },
    {
      id: "crm-sync",
      title: "CRM Sync",
      description: "Automatically syncs leads, conversations, and appointment data to HubSpot, Salesforce, Pipedrive, and other CRMs. No manual data entry required.",
      Icon: Users,
    },
    {
      id: "lead-capture",
      title: "Lead Capture & Qualification",
      description: "Captures lead information, qualifies prospects based on your criteria, and routes them to the right team member or workflow automatically.",
      Icon: UserPlus,
    },
    {
      id: "follow-up-automation",
      title: "Follow-up Automation",
      description: "Automated follow-ups, reminders, and nurturing sequences ensure no lead is forgotten. Customizable workflows for your sales process.",
      Icon: RefreshCw,
    },
    {
      id: "warm-transfers",
      title: "Warm Transfers",
      description: "Seamlessly hand live calls from the voice agent to your team with full context. No dropped calls, no repeating information.",
      Icon: ArrowRightLeft,
    },
    {
      id: "call-recording",
      title: "Call Recording & Analytics",
      description: "Every conversation is automatically captured, transcribed, and indexed so you can search, audit, and improve service quality.",
      Icon: InfinityIcon,
    },
    {
      id: "test-before-launch",
      title: "Test Before Launch",
      description: "Run real-world call simulations to stress-test workflows and fix gaps before customers ever call.",
      Icon: ShieldCheck,
    },
  ];

  const assistantContent = {
    headline: "Upgrade your voicemail to an AI assistant that books appointments and qualifies leads",
    description: "Voiceable handles each call uniquely based on the caller and scenario. It books appointments, answers questions, qualifies leads, and syncs everything to your CRM automatically."
  };

  const ctaContent = {
    title: "Voice Agent",
    description: "Staff your phone line with an agent available 24/7 that books appointments, answers questions, and syncs to your CRM",
    features: [
      "100% uptime over the last 30 days",
      "24/7 availability, day & night",
      "Instant human-like responses",
      "Integrate with any CRM or calendar"
    ]
  };

  // Operator Interface segments for scheduling/Q&A/CRM focus
  const operatorSegments = [
    {
      id: "scheduling",
      label: "Scheduling",
      tabs: [
        { id: "appointment_booking", label: "Appointment Booking", icon: Calendar },
        { id: "calendar_sync", label: "Calendar Sync", icon: CalendarIcon },
      ]
    },
    {
      id: "qa-support",
      label: "Q&A & Support",
      tabs: [
        { id: "questions", label: "Questions", icon: MessageCircle },
        { id: "information", label: "Information", icon: Globe },
      ]
    },
    {
      id: "lead-management",
      label: "Lead Management",
      tabs: [
        { id: "lead_collection", label: "Lead Collection", icon: UserPlus },
        { id: "crm_sync", label: "CRM Sync", icon: Users },
      ]
    },
    {
      id: "call-handling",
      label: "Call Handling",
      tabs: [
        { id: "call_transfer", label: "Call Transfer", icon: PhoneForwarded },
        { id: "follow_up", label: "Follow-up", icon: RefreshCw },
      ]
    },
  ];

  const operatorTabExamples = {
    appointment_booking: {
      user: {
        name: "Michael",
        location: "Patient",
        time: "10:30 AM EST",
        avatar: "M",
        message: "Hi, I'd like to schedule an appointment for next week. I'm available Tuesday or Wednesday afternoon. What times do you have?"
      },
      ai: {
        audioDuration: "00:45",
        message: "Hi Michael! I'd be happy to help you schedule an appointment. I can see we have availability on Tuesday afternoon at 2:00 PM or 3:30 PM, and Wednesday at 1:00 PM or 4:00 PM. Which time works best for you? I'll send you a confirmation email and calendar invite once we confirm."
      },
      metadata: {
        status: "Appointment Scheduled",
        statusColor: "bg-green-500",
        priority: "Medium",
        sentiment: "Interested",
        sentimentIcon: Smile,
        actions: [
          "Action: Appointment Booked",
          "Calendar Invite Sent"
        ],
        documents: [
          "Docs: Calendar Integration",
          "Appointment_Confirmation.pdf"
        ]
      }
    },
    calendar_sync: {
      user: {
        name: "Sarah",
        location: "Client",
        time: "2:15 PM EST",
        avatar: "S",
        message: "I need to reschedule my appointment from tomorrow to next Friday. Can you check what's available?"
      },
      ai: {
        audioDuration: "00:38",
        message: "Hi Sarah! I can help you reschedule. Let me check our calendar for next Friday. I see we have openings at 10:00 AM, 2:00 PM, or 3:30 PM. Which time works best for you? I'll update your appointment and send you a new confirmation."
      },
      metadata: {
        status: "Rescheduled",
        statusColor: "bg-blue-500",
        priority: "Low",
        sentiment: "Neutral",
        sentimentIcon: Meh,
        actions: [
          "Action: Appointment Rescheduled",
          "Calendar Updated"
        ],
        documents: [
          "Docs: Calendar Sync",
          "Updated_Appointment.pdf"
        ]
      }
    },
    questions: {
      user: {
        name: "Jennifer",
        location: "Prospect",
        time: "11:20 AM EST",
        avatar: "J",
        message: "What are your business hours and what services do you offer? I'm looking for more information before scheduling."
      },
      ai: {
        audioDuration: "00:52",
        message: "Hi Jennifer! We're open Monday through Friday from 9 AM to 6 PM, and Saturday from 10 AM to 2 PM. We offer a range of services including consultations, follow-up appointments, and specialized treatments. I can provide more details about any specific service you're interested in, or I'd be happy to schedule a consultation to discuss your needs in more detail."
      },
      metadata: {
        status: "Answered",
        statusColor: "bg-blue-500",
        priority: "Low",
        sentiment: "Interested",
        sentimentIcon: Smile,
        actions: [
          "Action: Information Provided",
          "Service Details Shared"
        ],
        documents: [
          "Docs: Service Information",
          "Business_Hours_Guide.pdf"
        ]
      }
    },
    information: {
      user: {
        name: "David",
        location: "Customer",
        time: "3:45 PM EST",
        avatar: "D",
        message: "Can you tell me about your pricing and payment options? I'm considering your services."
      },
      ai: {
        audioDuration: "00:48",
        message: "Hi David! I'd be happy to provide pricing information. Our consultation fee is $150, and follow-up appointments are $100. We accept all major credit cards, and we also offer payment plans for larger packages. I can email you a detailed pricing sheet, or if you'd like, I can schedule a consultation where we can discuss pricing in more detail based on your specific needs."
      },
      metadata: {
        status: "Information Provided",
        statusColor: "bg-blue-500",
        priority: "Low",
        sentiment: "Interested",
        sentimentIcon: Smile,
        actions: [
          "Action: Pricing Info Shared",
          "Email Sent"
        ],
        documents: [
          "Docs: Pricing Guide",
          "Payment_Options.pdf"
        ]
      }
    },
    lead_collection: {
      user: {
        name: "Robert",
        location: "Lead",
        time: "9:15 AM EST",
        avatar: "R",
        message: "I'm interested in learning more about your services. Can you help me get started and collect my information?"
      },
      ai: {
        audioDuration: "00:55",
        message: "Hi Robert! I'd be happy to help you get started. To better assist you, I'll need some basic information. Can you provide your name, email address, and phone number? Also, what specific service are you most interested in? Once I have this information, I can send you detailed materials and schedule a consultation if you'd like."
      },
      metadata: {
        status: "Lead Captured",
        statusColor: "bg-green-500",
        priority: "Medium",
        sentiment: "Interested",
        sentimentIcon: Smile,
        actions: [
          "Action: Lead Information Collected",
          "CRM Sync Initiated"
        ],
        documents: [
          "Docs: Lead Details",
          "CRM_Entry_Created.pdf"
        ]
      }
    },
    crm_sync: {
      user: {
        name: "Emily",
        location: "Prospect",
        time: "1:30 PM EST",
        avatar: "E",
        message: "I just completed a consultation call. Can you make sure all my information is saved in your system?"
      },
      ai: {
        audioDuration: "00:42",
        message: "Hi Emily! Absolutely, I've already synced all the information from our conversation to your CRM profile. Your contact details, consultation notes, and preferences have been automatically updated. You should see everything reflected in your account. Is there anything specific you'd like me to verify or update?"
      },
      metadata: {
        status: "Synced to CRM",
        statusColor: "bg-green-500",
        priority: "Low",
        sentiment: "Positive",
        sentimentIcon: Smile,
        actions: [
          "Action: CRM Sync Complete",
          "Profile Updated"
        ],
        documents: [
          "Docs: CRM Integration",
          "Profile_Update_Confirmation.pdf"
        ]
      }
    },
    call_transfer: {
      user: {
        name: "Thomas",
        location: "Client",
        time: "4:20 PM EST",
        avatar: "T",
        message: "I have some specific questions about pricing and custom solutions. Can I speak with someone from your sales team?"
      },
      ai: {
        audioDuration: "00:35",
        message: "Hi Thomas! I'd be happy to connect you with our sales team. Let me transfer you to one of our specialists who can discuss pricing and custom solutions in detail. I'll make sure they have all the context from our conversation so you don't have to repeat anything."
      },
      metadata: {
        status: "Transferring",
        statusColor: "bg-yellow-500",
        priority: "Medium",
        sentiment: "Interested",
        sentimentIcon: Smile,
        actions: [
          "Action: Call Transfer Initiated",
          "Context Shared"
        ],
        documents: [
          "Docs: Call History",
          "Transfer_Notes.pdf"
        ]
      }
    },
    follow_up: {
      user: {
        name: "Lisa",
        location: "Prospect",
        time: "10:00 AM EST",
        avatar: "L",
        message: "I wanted to follow up on our conversation from last week. Are you still interested in scheduling a consultation?"
      },
      ai: {
        audioDuration: "00:40",
        message: "Hi Lisa! Thank you for following up. I can see we discussed scheduling a consultation last week. I have availability this week on Tuesday at 2 PM or Thursday at 10 AM. Would either of those times work for you? I can also check next week's availability if you prefer."
      },
      metadata: {
        status: "Follow-up Active",
        statusColor: "bg-blue-500",
        priority: "Medium",
        sentiment: "Interested",
        sentimentIcon: Smile,
        actions: [
          "Action: Follow-up Initiated",
          "Appointment Offered"
        ],
        documents: [
          "Docs: Follow-up Campaign",
          "Previous_Conversation_Notes.pdf"
        ]
      }
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SEO
        title="AI Voice Agents for Scheduling, Q&A & CRM Sync | Voiceable"
        description="Transform your phone line with AI voice agents that answer questions, book appointments, collect lead information, and sync to your CRM 24/7. Perfect for clinics, real estate, logistics, and SaaS support teams."
        keywords="AI voice agents, appointment scheduling, lead management, CRM sync, AI receptionist, automated scheduling, lead qualification, voice AI for SMB, AI phone answering, automated appointment booking, CRM integration, lead capture automation"
        url={currentUrl}
        image="/og-image.png"
      />
      <Header />
      <main>
        <HeroSection 
          badgeText={heroContent.badgeText}
          headline={heroContent.headline}
          subtitle={heroContent.subtitle}
          socialProofText={heroContent.socialProofText}
        />
        <OperatorInterfaceSection 
          segments={operatorSegments}
          tabExamples={operatorTabExamples}
        />
        <FeaturesSection features={featuresContent} />
        <LiveCallsSection calls={liveCallsContent} />
        <AssistantSection 
          headline={assistantContent.headline}
          description={assistantContent.description}
        />
        <ResponsesSection categories={responsesCategories} />
        <SolutionsSection solutions={solutionsContent} />
        <HumanLedSection />
        <SeamlessSetupSection features={seamlessSetupFeatures} />
        {/* <UserLoveSection /> */}
        <CTASection 
          title={ctaContent.title}
          description={ctaContent.description}
          features={ctaContent.features}
        />
      </main>
      <Footer />
      {/* <FeatureNav 
        activeFeature={activeFeature} 
        onFeatureChange={setActiveFeature} 
      /> */}
    </div>
  );
};

export default Landing;
