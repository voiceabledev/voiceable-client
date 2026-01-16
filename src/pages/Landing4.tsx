import { useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/landing-page/Header";
import HeroSection from "@/components/landing-page/HeroSection";
import AssistantSection from "@/components/landing-page/AssistantSection";
import ResponsesSection from "@/components/landing-page/ResponsesSection";
import FeaturesSection from "@/components/landing-page/FeaturesSection";
import LiveCallsSection from "@/components/landing-page/LiveCallsSection";
import HumanLedSection from "@/components/landing-page/HumanLedSection";
import SeamlessSetupSection from "@/components/landing-page/SeamlessSetupSection";
import SolutionsSection from "@/components/landing-page/SolutionsSection";
import CTASection from "@/components/landing-page/CTASection";
import Footer from "@/components/landing-page/Footer";
import OperatorInterfaceSection from "@/components/landing-page/OperatorInterfaceSection";
import { SEO } from "@/components/SEO";
import { 
  MessageCircle, 
  Calendar, 
  UserPlus, 
  PhoneForwarded, 
  RefreshCw, 
  Users, 
  Clock, 
  Globe, 
  ArrowRightLeft, 
  FileText, 
  CheckCircle2, 
  Brain, 
  Briefcase, 
  UserCheck, 
  TrendingUp, 
  BarChart3,
  Building2,
  Stethoscope,
  Home,
  Truck,
  Code,
  Phone,
  Sparkles,
  ArrowRight,
  Heart,
  Play,
  Pause,
  AlertCircle,
  Meh,
  Smile,
  RotateCcw,
  Layers,
  Cloud,
  CloudLightning,
  Mail,
  Infinity as InfinityIcon,
  ShieldCheck,
  Mic,
  Video,
  Languages,
  Zap,
  ShoppingBag,
  Plane,
  Factory,
  UtensilsCrossed,
  Scissors,
  Dumbbell,
  Sparkles as SparklesIcon
} from "lucide-react";

const Landing4 = () => {
  const [activeFeature, setActiveFeature] = useState("assistant");
  const location = useLocation();
  const baseUrl = "https://voice-agent-ai-4288599ce3fe.herokuapp.com";
  const currentUrl = `${baseUrl}${location.pathname}`;

  // Content configuration for small businesses - appointment booking and customer service
  const heroContent = {
    badgeText: "Never miss a booking, 24/7",
    headline: "Book appointments & serve customers with an AI assistant that never sleeps",
    subtitle: "Voiceable handles every call, books appointments automatically, answers customer questions, and manages your schedule 24/7. Perfect for salons, spas, barbershops, fitness studios, and restaurants.",
    socialProofText: "Trusted by Small Business Owners"
  };

  const featuresContent = [
    {
      title: "Book Appointments 24/7",
      description: "Customers book appointments anytime, even when you're closed. Voiceable checks your calendar in real-time, books available slots, sends confirmations, and handles rescheduling automatically. Never miss a booking opportunity.",
      benefits: ["Book appointments 24/7", "Reduce no-shows with reminders"],
      gradient: "from-primary/20 via-emerald-500/10 to-transparent",
      icon: Calendar,
    },
    {
      title: "Answer Customer Questions",
      description: "Instantly answers questions about services, pricing, hours, availability, and policies. Voiceable pulls information from your knowledge base and handles common inquiries, freeing you to focus on serving customers in person.",
      benefits: ["Instant answers to FAQs", "Reduce phone interruptions"],
      gradient: "from-green/20 via-emerald-500/10 to-transparent",
      icon: MessageCircle,
    },
    {
      title: "Manage Your Schedule",
      description: "Seamlessly syncs with your booking system (Google Calendar, Square, Mindbody, and more). Real-time availability checking, automatic conflict resolution, and smart scheduling that maximizes your time.",
      benefits: ["Real-time calendar sync", "Smart scheduling optimization"],
      gradient: "from-amber/20 via-orange-500/10 to-transparent",
      icon: Clock,
    },
    {
      title: "Reduce No-Shows",
      description: "Automated reminders and confirmations keep customers informed. Voiceable sends appointment reminders via call, text, or email, and handles last-minute changes, significantly reducing no-shows.",
      benefits: ["Automated reminders", "Handle rescheduling easily"],
      gradient: "from-purple/20 via-pink-500/10 to-transparent",
      icon: RefreshCw,
    },
    {
      title: "Customer Follow-ups",
      description: "Automated follow-ups after appointments to gather feedback, rebook services, and nurture customer relationships. Keep customers engaged and coming back with personalized outreach.",
      benefits: ["Automated follow-ups", "Increase repeat bookings"],
      gradient: "from-blue/20 via-cyan-500/10 to-transparent",
      icon: Heart,
    },
  ];

  const solutionsContent = [
    {
      id: "salon-spa",
      label: "Salon & Spa",
      icon: SparklesIcon,
      title: "Salon & Spa Booking Agent",
      description: "Handle appointment bookings, service inquiries, and customer questions 24/7. Perfect for hair salons, nail salons, spas, and beauty studios looking to never miss a booking.",
      features: [
        {
          icon: Calendar,
          title: "24/7 Appointment Booking",
          description: "Clients book appointments anytime, even after hours. Check real-time availability, book services, and send confirmations automatically."
        },
        {
          icon: MessageCircle,
          title: "Service & Pricing Q&A",
          description: "Answers questions about services, pricing, packages, and availability. Reduces front desk interruptions and handles common inquiries instantly."
        }
      ]
    },
    {
      id: "barbershop",
      label: "Barbershop",
      icon: Scissors,
      title: "Barbershop Scheduling Agent",
      description: "Manage walk-ins and appointments, answer service questions, and keep your barbershop running smoothly. Handle high call volumes during peak hours without missing bookings.",
      features: [
        {
          icon: Clock,
          title: "Flexible Scheduling",
          description: "Book appointments and check walk-in availability in real-time. Customers can schedule ahead or check same-day availability instantly."
        },
        {
          icon: MessageCircle,
          title: "Service Information",
          description: "Answers questions about services, pricing, barber availability, and shop hours. Handles common inquiries so you can focus on cutting hair."
        }
      ]
    },
    {
      id: "fitness",
      label: "Fitness",
      icon: Dumbbell,
      title: "Fitness Studio Booking Agent",
      description: "Book classes, answer membership questions, and manage your fitness studio schedule 24/7. Perfect for gyms, yoga studios, pilates studios, and personal training businesses.",
      features: [
        {
          icon: Calendar,
          title: "Class & Session Booking",
          description: "Members and prospects book classes, personal training sessions, and consultations 24/7. Real-time class availability and automatic waitlist management."
        },
        {
          icon: MessageCircle,
          title: "Membership & Pricing Q&A",
          description: "Answers questions about memberships, pricing, class schedules, trainer availability, and facility amenities. Reduces front desk workload significantly."
        }
      ]
    },
    {
      id: "restaurants",
      label: "Restaurants",
      icon: UtensilsCrossed,
      title: "Restaurant Reservation Agent",
      description: "Handle reservations, answer questions about hours and menu, and manage your restaurant's phone line 24/7. Perfect for fine dining, cafes, and restaurants of all sizes.",
      features: [
        {
          icon: Calendar,
          title: "Reservation Management",
          description: "Customers make reservations, check availability, and modify bookings 24/7. Syncs with your reservation system and handles special requests."
        },
        {
          icon: MessageCircle,
          title: "Hours, Menu & Specials",
          description: "Answers questions about business hours, menu items, specials, dietary restrictions, and event bookings. Reduces host stand interruptions during busy service."
        }
      ]
    },
  ];

  const responsesCategories = [
    {
      id: "appointment-booking",
      label: "Appointment Booking",
      title: "Appointment Booking",
      description: "Book appointments and reservations 24/7 with real-time availability checking.",
      message: "Hi, I'd like to book an appointment for a haircut next week. What times are available?",
      icon: Calendar,
      emoji: "📅",
    },
    {
      id: "service-inquiries",
      label: "Service Inquiries",
      title: "Service Inquiries",
      description: "Answer questions about services, pricing, and availability instantly.",
      message: "What services do you offer and what are your prices? I'm looking to book something soon.",
      icon: MessageCircle,
      emoji: "💬",
    },
    {
      id: "availability-checks",
      label: "Availability Checks",
      title: "Availability Checks",
      description: "Check real-time availability for appointments, classes, or reservations.",
      message: "Do you have any availability for tomorrow afternoon? I'd like to schedule something.",
      icon: Clock,
      emoji: "⏰",
    },
    {
      id: "booking-modifications",
      label: "Booking Modifications",
      title: "Booking Modifications",
      description: "Reschedule, cancel, or modify existing appointments seamlessly.",
      message: "I need to reschedule my appointment from tomorrow to next week. Can you help me with that?",
      icon: RefreshCw,
      emoji: "🔄",
    },
    {
      id: "customer-support",
      label: "Customer Support",
      title: "Customer Support",
      description: "Handle customer questions, concerns, and special requests.",
      message: "I have a question about my upcoming appointment and some special requests. Can you help?",
      icon: PhoneForwarded,
      emoji: "📞",
    },
  ];

  const liveCallsContent = [
    { type: "Customer", location: "in San Francisco", topic: "Appointment Booking", status: "Resolved" as const, time: "11 min ago", duration: "260 sec" },
    { type: "Client", location: "in Portland", topic: "Service Inquiry", status: "Unresolved" as const, time: "26 min ago", duration: "205 sec" },
    { type: "Customer", location: "in New York", topic: "Reschedule Request", status: "Unresolved" as const, time: "14 min ago", duration: "339 sec" },
    { type: "Client", location: "in Austin", topic: "Availability Check", status: "Unresolved" as const, time: "16 min ago", duration: "3518 sec" },
    { type: "Customer", location: "in Chicago", topic: "Booking Confirmed", status: "Resolved" as const, time: "16 min ago", duration: "249 sec" },
    { type: "Client", location: "in Miami", topic: "Pricing Question", status: "Unresolved" as const, time: "23 min ago", duration: "1807 sec" },
    { type: "Customer", location: "in Seattle", topic: "Follow-up Call", status: "Resolved" as const, time: "13 min ago", duration: "207 sec" },
    { type: "Client", location: "in Boston", topic: "Special Request", status: "In Progress" as const, time: "8 min ago", duration: "292 sec" },
  ];

  const seamlessSetupFeatures = [
    {
      id: "calendar-integration",
      title: "Calendar Integration",
      description: "Syncs with Google Calendar, Square Appointments, Mindbody, Acuity, and other booking systems. Real-time availability checking and automatic conflict resolution.",
      Icon: Calendar,
    },
    {
      id: "appointment-management",
      title: "Appointment Management",
      description: "Book, reschedule, and cancel appointments automatically. Send confirmations, reminders, and handle last-minute changes seamlessly.",
      Icon: Clock,
    },
    {
      id: "customer-information",
      title: "Customer Information",
      description: "Captures customer details, preferences, and special requests. Builds customer profiles automatically for personalized service.",
      Icon: UserPlus,
    },
    {
      id: "follow-up-automation",
      title: "Follow-up Automation",
      description: "Automated follow-ups after appointments to gather feedback, rebook services, and nurture customer relationships. Increase repeat bookings automatically.",
      Icon: RefreshCw,
    },
    {
      id: "warm-transfers",
      title: "Warm Transfers",
      description: "Seamlessly transfer calls to your team when needed with full context. No dropped calls, no repeating information.",
      Icon: ArrowRightLeft,
    },
    {
      id: "call-recording",
      title: "Call Recording & Analytics",
      description: "Every conversation is automatically captured, transcribed, and indexed. Review calls, track booking trends, and improve customer service.",
      Icon: InfinityIcon,
    },
    {
      id: "test-before-launch",
      title: "Test Before Launch",
      description: "Run real-world booking simulations to test your workflows and fix gaps before customers ever call.",
      Icon: ShieldCheck,
    },
  ];

  const assistantContent = {
    headline: "Upgrade your phone line to an AI assistant that books appointments and serves customers 24/7",
    description: "Voiceable handles every call, books appointments automatically, answers customer questions, and manages your schedule. Never miss a booking, even when you're closed."
  };

  const ctaContent = {
    title: "AI Booking Assistant",
    description: "Never miss a booking with an AI agent that books appointments, answers questions, and manages your schedule 24/7",
    features: [
      "100% uptime over the last 30 days",
      "24/7 appointment booking, day & night",
      "Natural conversational AI",
      "Integrate with any booking system"
    ]
  };

  // Operator Interface segments for small businesses - appointment management and customer service
  const operatorSegments = [
    {
      id: "appointment-management",
      label: "Appointment Management",
      tabs: [
        { id: "booking", label: "Booking", icon: Calendar },
        { id: "rescheduling", label: "Rescheduling", icon: RefreshCw },
      ]
    },
    {
      id: "customer-service",
      label: "Customer Service",
      tabs: [
        { id: "service_inquiries", label: "Service Inquiries", icon: MessageCircle },
        { id: "availability", label: "Availability", icon: Clock },
      ]
    },
    {
      id: "booking-system",
      label: "Booking System",
      tabs: [
        { id: "calendar_sync", label: "Calendar Sync", icon: Calendar },
        { id: "confirmations", label: "Confirmations", icon: CheckCircle2 },
      ]
    },
    {
      id: "follow-ups",
      label: "Follow-ups",
      tabs: [
        { id: "reminders", label: "Reminders", icon: RefreshCw },
        { id: "rebooking", label: "Rebooking", icon: Heart },
      ]
    },
  ];

  const operatorTabExamples = {
    booking: {
      user: {
        name: "Sarah",
        location: "Customer",
        time: "10:30 AM EST",
        avatar: "S",
        message: "Hi, I'd like to book a haircut for next week. I'm available Tuesday or Wednesday afternoon. What times do you have?"
      },
      ai: {
        audioDuration: "00:45",
        message: "Hi Sarah! I'd be happy to help you book a haircut. I can see we have availability on Tuesday afternoon at 2:00 PM or 3:30 PM, and Wednesday at 1:00 PM or 4:00 PM. Which time works best for you? I'll send you a confirmation text and email once we confirm."
      },
      metadata: {
        status: "Appointment Booked",
        statusColor: "bg-green-500",
        priority: "Medium",
        sentiment: "Interested",
        sentimentIcon: Smile,
        actions: [
          "Action: Appointment Booked",
          "Confirmation Sent"
        ],
        documents: [
          "Docs: Booking System",
          "Appointment_Confirmation.pdf"
        ]
      }
    },
    rescheduling: {
      user: {
        name: "Michael",
        location: "Client",
        time: "2:15 PM EST",
        avatar: "M",
        message: "I need to reschedule my appointment from tomorrow to next Friday. Can you check what's available?"
      },
      ai: {
        audioDuration: "00:38",
        message: "Hi Michael! I can help you reschedule. Let me check our calendar for next Friday. I see we have openings at 10:00 AM, 2:00 PM, or 3:30 PM. Which time works best for you? I'll update your appointment and send you a new confirmation."
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
    service_inquiries: {
      user: {
        name: "Jennifer",
        location: "Customer",
        time: "11:20 AM EST",
        avatar: "J",
        message: "What services do you offer and what are your prices? I'm looking to book something soon."
      },
      ai: {
        audioDuration: "00:52",
        message: "Hi Jennifer! We offer a full range of services including haircuts, styling, coloring, and treatments. Our haircuts start at $45, styling services range from $35 to $85, and coloring services start at $95. I can provide more details about any specific service you're interested in, or I'd be happy to schedule a consultation to discuss your needs in more detail."
      },
      metadata: {
        status: "Information Provided",
        statusColor: "bg-blue-500",
        priority: "Low",
        sentiment: "Interested",
        sentimentIcon: Smile,
        actions: [
          "Action: Service Info Shared",
          "Pricing Details Provided"
        ],
        documents: [
          "Docs: Service Menu",
          "Pricing_Guide.pdf"
        ]
      }
    },
    availability: {
      user: {
        name: "David",
        location: "Client",
        time: "3:45 PM EST",
        avatar: "D",
        message: "Do you have any availability for tomorrow afternoon? I'd like to schedule something."
      },
      ai: {
        audioDuration: "00:48",
        message: "Hi David! Let me check our availability for tomorrow afternoon. I can see we have openings at 1:00 PM, 2:30 PM, and 4:00 PM. Which time works best for you? What service are you looking to book?"
      },
      metadata: {
        status: "Availability Checked",
        statusColor: "bg-blue-500",
        priority: "Low",
        sentiment: "Interested",
        sentimentIcon: Smile,
        actions: [
          "Action: Availability Shared",
          "Times Offered"
        ],
        documents: [
          "Docs: Calendar",
          "Availability_Report.pdf"
        ]
      }
    },
    calendar_sync: {
      user: {
        name: "Emily",
        location: "Customer",
        time: "1:30 PM EST",
        avatar: "E",
        message: "I just booked an appointment. Can you make sure it's saved in your system?"
      },
      ai: {
        audioDuration: "00:42",
        message: "Hi Emily! Absolutely, I've already synced your appointment to our booking system. Your appointment is confirmed for next Tuesday at 2:00 PM, and you should have received a confirmation email and text. Your appointment is also visible in our calendar system. Is there anything specific you'd like me to verify or update?"
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
          "Docs: Booking System",
          "Appointment_Details.pdf"
        ]
      }
    },
    confirmations: {
      user: {
        name: "Robert",
        location: "Client",
        time: "9:15 AM EST",
        avatar: "R",
        message: "I booked an appointment last week. Can you send me a confirmation with the details?"
      },
      ai: {
        audioDuration: "00:35",
        message: "Hi Robert! I can see your appointment is scheduled for this Friday at 3:00 PM. I've just sent you a confirmation email and text message with all the details, including the date, time, service, and our address. You should receive it within the next minute. Is there anything else you'd like me to help you with?"
      },
      metadata: {
        status: "Confirmation Sent",
        statusColor: "bg-green-500",
        priority: "Low",
        sentiment: "Positive",
        sentimentIcon: Smile,
        actions: [
          "Action: Confirmation Sent",
          "Email & Text Delivered"
        ],
        documents: [
          "Docs: Confirmation System",
          "Appointment_Confirmation.pdf"
        ]
      }
    },
    reminders: {
      user: {
        name: "Lisa",
        location: "Customer",
        time: "10:00 AM EST",
        avatar: "L",
        message: "I have an appointment tomorrow. Will I get a reminder?"
      },
      ai: {
        audioDuration: "00:40",
        message: "Hi Lisa! Yes, you'll receive an automated reminder 24 hours before your appointment tomorrow at 2:00 PM. You'll get both a text message and an email reminder. If you need to reschedule or have any questions before then, just give us a call anytime."
      },
      metadata: {
        status: "Reminder Scheduled",
        statusColor: "bg-blue-500",
        priority: "Medium",
        sentiment: "Interested",
        sentimentIcon: Smile,
        actions: [
          "Action: Reminder Scheduled",
          "24-Hour Reminder Set"
        ],
        documents: [
          "Docs: Reminder System",
          "Reminder_Schedule.pdf"
        ]
      }
    },
    rebooking: {
      user: {
        name: "Thomas",
        location: "Client",
        time: "4:20 PM EST",
        avatar: "T",
        message: "I just finished my appointment and I'd like to book my next one. Can you help me schedule it?"
      },
      ai: {
        audioDuration: "00:45",
        message: "Hi Thomas! I'd be happy to help you book your next appointment. Based on your service today, I'd recommend scheduling in about 4-6 weeks. I can see we have availability in that timeframe. Would you like to book it now, or would you prefer to call back when you're ready? I can also send you a reminder when it's time to rebook."
      },
      metadata: {
        status: "Rebooking Offered",
        statusColor: "bg-green-500",
        priority: "Medium",
        sentiment: "Positive",
        sentimentIcon: Smile,
        actions: [
          "Action: Rebooking Initiated",
          "Follow-up Scheduled"
        ],
        documents: [
          "Docs: Rebooking System",
          "Next_Appointment_Options.pdf"
        ]
      }
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SEO
        title="AI Booking Assistant for Small Businesses | Voiceable"
        description="Never miss a booking with AI voice agents that book appointments, answer customer questions, and manage your schedule 24/7. Perfect for salons, spas, barbershops, fitness studios, and restaurants."
        keywords="AI booking assistant, appointment scheduling, small business AI, salon booking, spa booking, barbershop scheduling, fitness studio booking, restaurant reservations, AI receptionist, automated appointment booking, small business automation, voice AI for small business"
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
          showCalendarOnly={true}
        />
        <ResponsesSection categories={responsesCategories} />
        <SolutionsSection solutions={solutionsContent} />
        <HumanLedSection />
        <SeamlessSetupSection features={seamlessSetupFeatures} />
        <CTASection 
          title={ctaContent.title}
          description={ctaContent.description}
          features={ctaContent.features}
          showCalendarOnly={true}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Landing4;
