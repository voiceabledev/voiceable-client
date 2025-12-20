import { 
  Phone, 
  MessageSquare,
  Calendar,
  UserCheck,
  Shield,
  Clock,
  Zap,
  PhoneCall,
  PhoneForwarded
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import {
  HeroSection,
  ValueProposition,
  TryItSection,
  UseCasesSection,
  StepsSection,
  FeaturesGrid,
  PerfectForSection,
  ExperienceSection,
  IntegrationsSection,
  TestimonialsSection,
  CTASection,
} from "@/components/landing";

const useCases = [
  {
    title: "Answer Every Call",
    description: "No more voicemail. No more hold times.",
    features: [
      "Answers inbound calls instantly",
      "Works 24/7, including nights and weekends",
      "Handles multiple calls at once"
    ],
    icon: Phone
  },
  {
    title: "Answer Common Questions",
    description: "Free your team from repetitive calls.",
    features: [
      "Business hours",
      "Services offered",
      "Pricing ranges (if allowed)",
      "Location and directions"
    ],
    subtext: "All based on your rules.",
    icon: MessageSquare
  },
  {
    title: "Book & Manage Appointments",
    description: "Let callers book without waiting.",
    features: [
      "Schedules appointments",
      "Confirms availability",
      "Handles reschedules and cancellations",
      "Sends confirmations automatically"
    ],
    icon: Calendar
  },
  {
    title: "Route the Right Calls",
    description: "Only escalate when it matters.",
    features: [
      "Transfers urgent calls",
      "Routes based on intent",
      "Collects context before handoff"
    ],
    subtext: "Your team never picks up cold calls again.",
    icon: PhoneForwarded
  }
];

const perfectFor = [
  "Clinics & medical practices",
  "Home services (HVAC, plumbing, electrical)",
  "Property management",
  "Auto services",
  "Professional offices"
];

const steps = [
  {
    number: "1",
    title: "Describe your front desk",
    items: [
      "What your business does",
      "What calls to handle",
      "When to escalate"
    ]
  },
  {
    number: "2",
    title: "Set clear rules",
    items: [
      "What the receptionist can say",
      "What it should never say",
      "When to transfer to a human"
    ]
  },
  {
    number: "3",
    title: "Connect your calendar & phone",
    items: [
      "Use your existing number or get a new one"
    ]
  },
  {
    number: "4",
    title: "Go live",
    items: [
      "Your AI receptionist starts answering calls immediately"
    ]
  }
];

const reliabilityFeatures = [
  {
    title: "Consistent responses",
    description: "Follows your rules every time",
    icon: UserCheck
  },
  {
    title: "Safe conversations",
    description: "Avoids hallucinations and sensitive topics",
    icon: Shield
  },
  {
    title: "Always available",
    description: "Never misses a call",
    icon: Clock
  },
  {
    title: "Scales instantly",
    description: "One call or a thousand",
    icon: Zap
  }
];

const callerExperience = [
  "A calm, professional voice",
  "Clear answers",
  "Respectful handoffs",
  "Transparent next steps"
];

const integrationChannels = [
  "Existing phone numbers",
  "Calendars and scheduling tools",
  "CRMs and booking systems",
  "Websites and call flows"
];

const testimonials = [
  {
    quote: "We stopped missing after-hours calls entirely. The AI receptionist paid for itself in weeks.",
    author: "Operations Manager",
    company: "Home Services"
  },
  {
    quote: "Our staff finally has time to focus on customers in front of them.",
    author: "Office Manager",
    company: "Medical Practice"
  }
];

export default function Receptionist() {
  return (
    <>
      <SEO
        title="AI Receptionist That Answers Every Call | Voiceable"
        description="Never miss a call again. Your AI receptionist answers, qualifies, and routes calls — exactly the way you define. No scripts, no prompt writing, no technical setup."
        keywords="AI receptionist, virtual receptionist, automated receptionist, call answering service, front desk automation, medical receptionist, business phone system"
        url="https://voice-agent-ai-4288599ce3fe.herokuapp.com/receptionist"
      />
      <div className="min-h-screen bg-background">
        <Navigation />

        <HeroSection
          badge="No scripts, no prompt writing, no technical setup"
          title="AI Receptionist"
          titleHighlight="That Answers Every Call"
          description="Never miss a call again."
          subdescription="Your AI receptionist answers, qualifies, and routes calls — exactly the way you define."
          primaryCta="Talk to the AI receptionist"
          secondaryCta="Create your receptionist"
          secondaryCtaLink="/sign-up"
          icons={[
            { icon: PhoneCall, label: "Answer", color: "bg-emerald/20" },
            { icon: MessageSquare, label: "Assist", color: "bg-primary/20" },
            { icon: PhoneForwarded, label: "Route", color: "bg-accent/20" }
          ]}
        />

        <ValueProposition
          title="Built for front desks, not engineers"
          subtitle="Missed calls mean missed revenue."
          description="Your AI receptionist answers instantly, follows your rules, and handles routine conversations — so your team can focus on customers who actually need them."
          highlights={["No scripts.", "No prompt writing.", "No technical setup."]}
        />

        <TryItSection
          title="Try it before setting anything up"
          description="Call a real AI receptionist right now and experience how it:"
          features={[
            "Greets callers professionally",
            "Answers common questions",
            "Books appointments",
            "Knows when to transfer to a human"
          ]}
          ctaText="Talk to the AI receptionist"
        />

        <UseCasesSection
          title="What an AI receptionist handles for you"
          useCases={useCases}
        />

        <PerfectForSection
          title="Designed for real businesses"
          items={perfectFor}
          footer="Anywhere a front desk answers the same questions all day."
        />

        <StepsSection
          title="How it works"
          steps={steps}
          footer="No prompts. No scripts. No fragile logic."
        />

        <FeaturesGrid
          title="Reliable by default"
          features={reliabilityFeatures}
          footer={{
            line1: "This is not a chatbot.",
            line2: "It's your front desk, automated."
          }}
        />

        <ExperienceSection
          title="Better experience for callers"
          items={callerExperience}
        />

        <IntegrationsSection
          title="Connects with your systems"
          channels={integrationChannels}
        />

        <TestimonialsSection testimonials={testimonials} />

        <CTASection
          title="Ready to never miss a call?"
          description="Set up your AI receptionist in minutes."
          primaryCta="Talk to the AI receptionist"
          secondaryCta="Create your receptionist"
          secondaryCtaLink="/sign-up"
        />

        <Footer />
      </div>
    </>
  );
}