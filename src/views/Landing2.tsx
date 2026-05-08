"use client";

import { useState } from "react";
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
import { MessageCircle, Calendar, UserPlus, PhoneForwarded, RefreshCw, Check, Clock, Smile, Globe, ArrowRightLeft, AlertTriangle, Calendar as CalendarIcon, CreditCard, Wrench, Package, Truck, ShoppingBag, Box, Building2, Stethoscope, Home, Truck as TruckIcon, Code, Phone, Sparkles, ArrowRight, Heart, Play, Pause, CheckCircle2, FileText, Meh, Frown, RotateCcw, Layers, Brain, Cloud, Users, CloudLightning, Mail, Infinity as InfinityIcon, ShieldCheck, UserCheck, TrendingUp, BarChart3, Zap } from "lucide-react";

const Landing = () => {
  const [activeFeature, setActiveFeature] = useState("assistant");

  // Content configuration for AI Call Center / Sales & Support - Service Companies Focus
  const heroContent = {
    badgeText: "Never miss a job, 24/7",
    headline: "24/7 AI call center for service companies",
    subtitle: "Plumbing. HVAC. Electrical. Contracting. When the phone rings, jobs get booked or lost. Voiceable ensures every call is answered, every lead qualified, and every job scheduled, day or night.",
    socialProofText: "Trusted by Service Companies"
  };

  const featuresContent = [
    {
      title: "Answer Every Call, 24/7",
      description: "Nights, weekends, holidays — we never clock out. Voiceable answers instantly with natural, human-like voice AI. No voicemails. No missed opportunities. Every call gets answered, day or night.",
      benefits: ["24/7 coverage, never miss a call", "Natural human-like responses"],
      gradient: "from-primary/20 via-emerald-500/10 to-transparent",
      icon: Phone,
    },
    {
      title: "Qualify Real Leads",
      description: "We gather job details, filter out tire-kickers, and prioritize real customers. Voiceable asks the right questions, assesses urgency, and only passes job-ready leads to your team. No wasted time on unqualified calls.",
      benefits: ["Job-ready leads only", "Filter out tire-kickers"],
      gradient: "from-green/20 via-emerald-500/10 to-transparent",
      icon: UserCheck,
    },
    {
      title: "Book Jobs Automatically",
      description: "Job-ready leads with details sent straight to your CSR or CRM system. Voiceable schedules appointments directly on your calendar, captures all job details, and syncs everything automatically. Turn every call into a booked job.",
      benefits: ["Direct calendar booking", "Automatic job scheduling"],
      gradient: "from-amber/20 via-orange-500/10 to-transparent",
      icon: Calendar,
    },
    {
      title: "Lower Costs",
      description: "Replace expensive call centers with AI. Voiceable handles after-hours calls, weekend emergencies, and overflow without adding staff. Reduce overhead while improving coverage and response times.",
      benefits: ["Replace expensive call centers", "Reduce overhead costs"],
      gradient: "from-purple/20 via-pink-500/10 to-transparent",
      icon: TrendingUp,
    },
    {
      title: "Peace of Mind",
      description: "Focus on running your business while we handle the phones. Voiceable ensures every call is answered, every lead is qualified, and every job opportunity is captured. Never lose revenue to missed calls again.",
      benefits: ["Never miss a job opportunity", "Focus on your business"],
      gradient: "from-blue/20 via-cyan-500/10 to-transparent",
      icon: ShieldCheck,
    },
  ];

  const solutionsContent = [
    {
      id: "plumbing",
      label: "Plumbing",
      icon: Wrench,
      title: "Plumbing Service Call Center",
      description: "Never miss a plumbing job, day or night. Voiceable answers every call, qualifies emergency vs. routine jobs, and schedules appointments directly to your calendar. Handle after-hours emergencies and weekend calls without adding staff.",
      features: [
        {
          icon: Phone,
          title: "24/7 Emergency Coverage",
          description: "Answer every call, even after hours and weekends. Qualify emergency jobs and route them appropriately. Never lose revenue to missed calls."
        },
        {
          icon: Calendar,
          title: "Automatic Job Scheduling",
          description: "Book appointments directly to your calendar. Capture job details, location, and urgency. Only pass job-ready leads to your team."
        }
      ]
    },
    {
      id: "hvac",
      label: "HVAC",
      icon: Cloud,
      title: "HVAC Service Booking Agent",
      description: "Handle HVAC service calls 24/7. Voiceable qualifies leads, schedules maintenance appointments, and books emergency repairs. Turn every call into a booked job, even when your office is closed.",
      features: [
        {
          icon: Clock,
          title: "Round-the-Clock Availability",
          description: "Answer calls nights, weekends, and holidays. Qualify emergency AC/heat repairs and schedule routine maintenance. Never miss a service opportunity."
        },
        {
          icon: UserCheck,
          title: "Smart Lead Qualification",
          description: "Filter out tire-kickers and prioritize real customers. Gather system details, assess urgency, and only pass qualified leads to your technicians."
        }
      ]
    },
    {
      id: "electrical",
      label: "Electrical",
      icon: Zap,
      title: "Electrical Contractor Call Center",
      description: "Book electrical jobs 24/7 without missing a call. Voiceable handles inquiries, qualifies projects, and schedules appointments. Perfect for electricians handling residential and commercial work.",
      features: [
        {
          icon: Phone,
          title: "Always-On Call Handling",
          description: "Answer every call instantly, even after hours. Qualify electrical projects, assess scope, and schedule estimates. Turn inquiries into booked jobs."
        },
        {
          icon: Calendar,
          title: "Direct Calendar Booking",
          description: "Schedule appointments directly to your calendar or CRM. Capture project details, location, and customer information automatically."
        }
      ]
    },
    {
      id: "contracting",
      label: "Contracting",
      icon: Home,
      title: "General Contractor Call Center",
      description: "Never miss a contracting opportunity. Voiceable answers calls, qualifies projects, and books estimates 24/7. Handle residential and commercial inquiries even when your office is closed.",
      features: [
        {
          icon: Phone,
          title: "24/7 Project Inquiries",
          description: "Answer every call, day or night. Qualify project scope, budget, and timeline. Only pass serious prospects to your team."
        },
        {
          icon: UserCheck,
          title: "Qualified Lead Capture",
          description: "Filter out unqualified leads and focus on real opportunities. Gather project details and schedule estimates automatically."
        }
      ]
    },
  ];

  const responsesCategories = [
    {
      id: "job-booking",
      label: "Job Booking",
      title: "Job Booking",
      description: "Answer calls, qualify leads, and book jobs directly to your calendar 24/7.",
      message: "Hi, I need a plumber. My kitchen sink is leaking and I need someone to come out today if possible.",
      icon: Calendar,
      emoji: "📅",
    },
    {
      id: "lead-qualification",
      label: "Lead Qualification",
      title: "Lead Qualification",
      description: "Gather job details, filter out tire-kickers, and prioritize real customers.",
      message: "I'm calling about getting an estimate for a bathroom renovation. What's your availability?",
      icon: UserCheck,
      emoji: "🎯",
    },
    {
      id: "emergency-calls",
      label: "Emergency Calls",
      title: "Emergency Calls",
      description: "Handle after-hours emergencies and urgent service requests instantly.",
      message: "My AC stopped working and it's 90 degrees in here. Can someone come out tonight?",
      icon: AlertTriangle,
      emoji: "🚨",
    },
    {
      id: "service-inquiries",
      label: "Service Inquiries",
      title: "Service Inquiries",
      description: "Answer questions about services, pricing, availability, and scheduling.",
      message: "What are your rates for a routine HVAC maintenance check? When can you schedule it?",
      icon: MessageCircle,
      emoji: "💬",
    },
    {
      id: "job-details",
      label: "Job Details",
      title: "Job Details",
      description: "Capture complete job information and send job-ready leads to your team.",
      message: "I need electrical work done. Can you tell me more about your services and schedule an estimate?",
      icon: FileText,
      emoji: "📋",
    },
  ];

  const liveCallsContent = [
    { type: "Customer", location: "in San Francisco", topic: "Plumbing Emergency", status: "Resolved" as const, time: "11 min ago", duration: "260 sec" },
    { type: "Lead", location: "in Portland", topic: "HVAC Service", status: "Unresolved" as const, time: "26 min ago", duration: "205 sec" },
    { type: "Customer", location: "in New York", topic: "Electrical Estimate", status: "Unresolved" as const, time: "14 min ago", duration: "339 sec" },
    { type: "Lead", location: "in Austin", topic: "Contracting Project", status: "Unresolved" as const, time: "16 min ago", duration: "3518 sec" },
    { type: "Customer", location: "in Chicago", topic: "Job Booked", status: "Resolved" as const, time: "16 min ago", duration: "249 sec" },
    { type: "Lead", location: "in Miami", topic: "After-Hours Call", status: "Unresolved" as const, time: "23 min ago", duration: "1807 sec" },
    { type: "Customer", location: "in Seattle", topic: "Service Inquiry", status: "Resolved" as const, time: "13 min ago", duration: "207 sec" },
    { type: "Lead", location: "in Boston", topic: "Weekend Emergency", status: "In Progress" as const, time: "8 min ago", duration: "292 sec" },
  ];

  const seamlessSetupFeatures = [
    {
      id: "calendar-integration",
      title: "Calendar Integration",
      description: "Syncs with Google Calendar, Outlook, and your scheduling system to book jobs automatically. Real-time availability checking and automatic conflict resolution.",
      Icon: Calendar,
    },
    {
      id: "crm-sync",
      title: "CRM Sync",
      description: "Automatically syncs leads, job details, and customer data to your CRM system. Job-ready leads flow directly into your pipeline without manual data entry.",
      Icon: Users,
    },
    {
      id: "24-7-coverage",
      title: "24/7 Coverage",
      description: "Nights, weekends, holidays — we never clock out. Answer every call, even when your office is closed. Never miss a job opportunity again.",
      Icon: Clock,
    },
    {
      id: "lead-qualification",
      title: "Automated Lead Qualification",
      description: "Gathers job details, filters out tire-kickers, and prioritizes real customers. Only job-ready leads get passed to your team, saving you time and money.",
      Icon: UserCheck,
    },
    {
      id: "job-booking",
      title: "Automatic Job Booking",
      description: "Books jobs directly to your calendar or CRM. Captures all job details, location, and customer information automatically. Turn every call into a booked job.",
      Icon: CheckCircle2,
    },
    {
      id: "call-analytics",
      title: "Call Analytics & Reporting",
      description: "Track call volume, job booking rates, lead quality, and revenue from calls. Measure ROI and improve operations with data-driven insights.",
      Icon: BarChart3,
    },
    {
      id: "test-before-launch",
      title: "Test Before Launch",
      description: "Run real-world call simulations to test your workflows, job booking process, and qualification criteria before going live.",
      Icon: ShieldCheck,
    },
  ];

  const assistantContent = {
    headline: "Your always-on call center, powered by AI",
    description: "Voiceable works around the clock to answer inbound calls, qualify real leads, and schedule jobs directly on your calendar or CRM. No voicemails. No missed opportunities. Just booked jobs, 24/7."
  };

  const ctaContent = {
    title: "24/7 AI Call Center",
    description: "Stop losing jobs to missed calls. Let Voiceable be your 24/7 call center and turn every call into revenue",
    features: [
      "100% uptime over the last 30 days",
      "24/7 coverage, nights, weekends, holidays",
      "Job-ready leads only",
      "Direct calendar and CRM integration"
    ]
  };

  // Operator Interface segments for service companies - job booking focus
  const operatorSegments = [
    {
      id: "call-answering",
      label: "Call Answering",
      tabs: [
        { id: "call_comes_in", label: "Call Comes In", icon: Phone },
        { id: "after_hours", label: "After Hours", icon: Clock },
      ]
    },
    {
      id: "lead-qualification",
      label: "Lead Qualification",
      tabs: [
        { id: "qualify_lead", label: "Qualify Lead", icon: UserCheck },
        { id: "job_details", label: "Job Details", icon: FileText },
      ]
    },
    {
      id: "job-booking",
      label: "Job Booking",
      tabs: [
        { id: "book_job", label: "Book Job", icon: Calendar },
        { id: "calendar_sync", label: "Calendar Sync", icon: CalendarIcon },
      ]
    },
    {
      id: "crm-integration",
      label: "CRM Integration",
      tabs: [
        { id: "crm_sync", label: "CRM Sync", icon: Users },
        { id: "job_ready_leads", label: "Job-Ready Leads", icon: CheckCircle2 },
      ]
    },
  ];

  const operatorTabExamples = {
    call_comes_in: {
      user: {
        name: "Michael",
        location: "Customer",
        time: "10:30 AM EST",
        avatar: "M",
        message: "Hi, I need a plumber. My kitchen sink is leaking and I need someone to come out today if possible."
      },
      ai: {
        audioDuration: "00:35",
        message: "Hi Michael! I'd be happy to help you with your plumbing issue. I can see this is urgent since your sink is leaking. Let me gather a few quick details so I can get you scheduled right away. What's the address where you need service, and what's the best phone number to reach you? I'll get a plumber scheduled for you today."
      },
      metadata: {
        status: "Call Answered",
        statusColor: "bg-green-500",
        priority: "High",
        sentiment: "Urgent",
        sentimentIcon: AlertTriangle,
        actions: [
          "Action: Call Answered Instantly",
          "Emergency Job Identified"
        ],
        documents: [
          "Docs: Service Call Protocol",
          "Emergency_Response_Guide.pdf"
        ]
      }
    },
    after_hours: {
      user: {
        name: "Sarah",
        location: "Customer",
        time: "11:45 PM EST",
        avatar: "S",
        message: "My AC stopped working and it's really hot in here. Can someone come out tonight?"
      },
      ai: {
        audioDuration: "00:42",
        message: "Hi Sarah! I understand this is an emergency situation. Even though it's after hours, I can help you get service tonight. Let me get your address and contact information, and I'll dispatch an HVAC technician to your location. This is exactly the kind of emergency we handle 24/7. Can you provide your address?"
      },
      metadata: {
        status: "After-Hours Emergency",
        statusColor: "bg-red-500",
        priority: "High",
        sentiment: "Urgent",
        sentimentIcon: AlertTriangle,
        actions: [
          "Action: After-Hours Call Handled",
          "Emergency Technician Dispatched"
        ],
        documents: [
          "Docs: After-Hours Protocol",
          "Emergency_Dispatch_Log.pdf"
        ]
      }
    },
    qualify_lead: {
      user: {
        name: "Jennifer",
        location: "Lead",
        time: "11:20 AM EST",
        avatar: "J",
        message: "I'm calling about getting an estimate for a bathroom renovation. What's your availability?"
      },
      ai: {
        audioDuration: "00:52",
        message: "Hi Jennifer! I'd be happy to help you with your bathroom renovation project. To give you the most accurate estimate, I'd like to ask a few questions. What's the scope of the renovation - are you looking at a full remodel or specific updates? What's your timeline, and what's your approximate budget range? Once I have these details, I can schedule an in-person estimate with one of our contractors."
      },
      metadata: {
        status: "Lead Qualifying",
        statusColor: "bg-blue-500",
        priority: "Medium",
        sentiment: "Interested",
        sentimentIcon: Smile,
        actions: [
          "Action: Qualification Started",
          "Project Details Gathered"
        ],
        documents: [
          "Docs: Qualification Criteria",
          "Lead_Profile.pdf"
        ]
      }
    },
    job_details: {
      user: {
        name: "David",
        location: "Customer",
        time: "3:45 PM EST",
        avatar: "D",
        message: "I need electrical work done. Can you tell me more about your services and schedule an estimate?"
      },
      ai: {
        audioDuration: "00:48",
        message: "Hi David! I'd be happy to help you with your electrical work. We handle everything from panel upgrades and wiring to lighting installation and electrical repairs. To schedule an estimate, I'll need a few details. What type of electrical work do you need - is it for a new installation, repair, or upgrade? What's the address, and when would be a good time for one of our electricians to come out?"
      },
      metadata: {
        status: "Job Details Captured",
        statusColor: "bg-green-500",
        priority: "Medium",
        sentiment: "Interested",
        sentimentIcon: Smile,
        actions: [
          "Action: Job Details Collected",
          "Estimate Scheduled"
        ],
        documents: [
          "Docs: Job Information",
          "Customer_Details.pdf"
        ]
      }
    },
    book_job: {
      user: {
        name: "Robert",
        location: "Customer",
        time: "9:15 AM EST",
        avatar: "R",
        message: "I need HVAC maintenance. When can you schedule it? I'm available next week."
      },
      ai: {
        audioDuration: "00:45",
        message: "Hi Robert! I can schedule your HVAC maintenance right away. I can see we have availability next week on Tuesday morning, Wednesday afternoon, or Thursday morning. Which day works best for you? Once we confirm the time, I'll book it directly to your calendar and send you a confirmation. Our technician will arrive with all the details about your system."
      },
      metadata: {
        status: "Job Booked",
        statusColor: "bg-green-500",
        priority: "Medium",
        sentiment: "Positive",
        sentimentIcon: Smile,
        actions: [
          "Action: Job Scheduled",
          "Calendar Updated"
        ],
        documents: [
          "Docs: Booking System",
          "Job_Confirmation.pdf"
        ]
      }
    },
    calendar_sync: {
      user: {
        name: "Emily",
        location: "Customer",
        time: "1:30 PM EST",
        avatar: "E",
        message: "I just booked a service appointment. Can you make sure it's saved in your system?"
      },
      ai: {
        audioDuration: "00:35",
        message: "Hi Emily! Absolutely, I've already synced your appointment to our calendar system. Your service appointment for next Tuesday at 2:00 PM is confirmed and visible in our scheduling system. You should have received a confirmation email and text. Your technician will have all the job details when they arrive. Is there anything specific you'd like me to verify or update?"
      },
      metadata: {
        status: "Synced to Calendar",
        statusColor: "bg-green-500",
        priority: "Low",
        sentiment: "Positive",
        sentimentIcon: Smile,
        actions: [
          "Action: Calendar Sync Complete",
          "Appointment Confirmed"
        ],
        documents: [
          "Docs: Calendar Integration",
          "Appointment_Details.pdf"
        ]
      }
    },
    crm_sync: {
      user: {
        name: "Thomas",
        location: "Lead",
        time: "4:20 PM EST",
        avatar: "T",
        message: "I just spoke with someone about getting an estimate. Can you make sure all my information is saved?"
      },
      ai: {
        audioDuration: "00:35",
        message: "Hi Thomas! Absolutely, I've already synced all the information from our conversation to your CRM profile. Your contact details, project information, qualification notes, and scheduled estimate have been automatically updated in our system. Your project manager can see everything in real-time. Is there anything specific you'd like me to verify or update?"
      },
      metadata: {
        status: "Synced to CRM",
        statusColor: "bg-green-500",
        priority: "Low",
        sentiment: "Positive",
        sentimentIcon: Smile,
        actions: [
          "Action: CRM Sync Complete",
          "Lead Profile Updated"
        ],
        documents: [
          "Docs: CRM Integration",
          "Lead_Profile_Update.pdf"
        ]
      }
    },
    job_ready_leads: {
      user: {
        name: "Lisa",
        location: "Customer",
        time: "10:00 AM EST",
        avatar: "L",
        message: "I need a plumber for a leaky pipe. It's urgent and I need someone today."
      },
      ai: {
        audioDuration: "00:40",
        message: "Hi Lisa! I understand this is urgent. I've gathered all the job details - you have a leaky pipe that needs immediate attention. I've qualified this as a high-priority job and it's been sent directly to your plumber with all the details: your address, contact information, and the nature of the emergency. They'll be in touch shortly to confirm arrival time. This job is now in your system and ready to go."
      },
      metadata: {
        status: "Job-Ready Lead",
        statusColor: "bg-green-500",
        priority: "High",
        sentiment: "Urgent",
        sentimentIcon: AlertTriangle,
        actions: [
          "Action: Job-Ready Lead Created",
          "Technician Notified"
        ],
        documents: [
          "Docs: Job Details",
          "Job_Ready_Lead_Report.pdf"
        ]
      }
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
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
          audioSrc="/landing-page-audio.mp3"
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
