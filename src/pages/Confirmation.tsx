import { 
  Calendar,
  Shield,
  Clock,
  Zap,
  CalendarCheck,
  Bell,
  RefreshCw
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
    title: "Appointment Confirmation",
    description: "Know who's actually coming.",
    features: [
      "Confirms upcoming appointments automatically",
      "Reaches out via call or message",
      "Handles multiple confirmations at once"
    ],
    icon: CalendarCheck
  },
  {
    title: "Rescheduling & Cancellations",
    description: "Fix gaps before they cost you.",
    features: [
      "Offers new time slots",
      "Processes cancellations cleanly",
      "Frees availability early"
    ],
    subtext: "Your team stays in control.",
    icon: RefreshCw
  },
  {
    title: "Reminders That Work",
    description: "Reduce forgetfulness without nagging.",
    features: [
      "Sends timely reminders",
      "Uses a calm, professional tone",
      "Adjusts based on appointment type"
    ],
    icon: Bell
  },
  {
    title: "Clean Calendar Updates",
    description: "No surprises for your staff.",
    features: [
      "Updates appointment status",
      "Adds notes when needed",
      "Syncs with your scheduling system"
    ],
    subtext: "Your calendar reflects reality.",
    icon: Calendar
  }
];

const perfectFor = [
  "Medical and dental practices",
  "Clinics and med spas",
  "Legal and financial services",
  "Home services and contractors",
  "Any business that runs on scheduled time"
];

const steps = [
  {
    number: "1",
    title: "Define confirmation rules",
    items: [
      "When to confirm",
      "How far in advance",
      "What to do if someone can't make it"
    ]
  },
  {
    number: "2",
    title: "Set tone and boundaries",
    items: [
      "How formal the agent should be",
      "What it can answer",
      "When to escalate to a human"
    ]
  },
  {
    number: "3",
    title: "Connect your calendar",
    items: [
      "Use your existing scheduling tool"
    ]
  },
  {
    number: "4",
    title: "Go live",
    items: [
      "The agent starts confirming appointments automatically"
    ]
  }
];

const reliableFeatures = [
  {
    title: "Consistent follow-ups",
    description: "Every appointment gets the same care",
    icon: CalendarCheck
  },
  {
    title: "Safe conversations",
    description: "No hallucinated instructions",
    icon: Shield
  },
  {
    title: "Always available",
    description: "Evenings and weekends included",
    icon: Clock
  },
  {
    title: "Scales effortlessly",
    description: "One location or many",
    icon: Zap
  }
];

const clientExperience = [
  "Clear communication",
  "Easy rescheduling",
  "Respect for their time",
  "No awkward missed-call loops"
];

const integrationChannels = [
  "Calendars and booking tools",
  "Existing phone numbers",
  "SMS and voice confirmations",
  "Single or multi-location setups"
];

const testimonials = [
  {
    quote: "Our no-show rate dropped without adding staff or chasing clients.",
    author: "Office Manager",
    company: "Medical Practice"
  },
  {
    quote: "Reschedules happen earlier, so we actually fill the gaps.",
    author: "Operations Lead",
    company: "Professional Services"
  }
];

export default function Confirmation() {
  return (
    <>
      <SEO
        title="Reduce No-Shows Before They Happen | Voiceable"
        description="Automatically confirm appointments, handle reschedules, and keep your calendar accurate — without manual calls or texts. No scripts, no prompt writing."
        keywords="appointment confirmation, reduce no-shows, appointment reminders, automated confirmation, scheduling automation, appointment management, booking confirmation"
        url="https://voice-agent-ai-4288599ce3fe.herokuapp.com/confirmation"
      />
      <div className="min-h-screen bg-background">
        <Navigation />

        <HeroSection
          badge="No scripts, no prompt writing, no manual follow-ups"
          title="Reduce No-Shows"
          titleHighlight="Before They Happen"
          description="Automatically confirm appointments, handle reschedules, and keep your calendar accurate — without manual calls or texts."
          primaryCta="Talk to the agent"
          secondaryCta="Create your agent"
          secondaryCtaLink="/sign-up"
          icons={[
            { icon: CalendarCheck, label: "Confirm", color: "bg-emerald/20" },
            { icon: Bell, label: "Remind", color: "bg-primary/20" },
            { icon: RefreshCw, label: "Reschedule", color: "bg-accent/20" }
          ]}
        />

        <ValueProposition
          title="Built for busy schedules, not reminder spreadsheets"
          subtitle="No-shows waste time, revenue, and team focus."
          description="Your AI confirmation agent reaches out ahead of appointments, confirms attendance, and resolves conflicts before they become empty slots."
          highlights={["No scripts.", "No prompt writing.", "No manual follow-ups."]}
        />

        <TryItSection
          title="Experience it before setting anything up"
          description="Talk to a real AI agent and hear how it:"
          features={[
            "Confirms an upcoming appointment",
            "Handles rescheduling politely",
            "Answers common questions",
            "Updates the calendar automatically"
          ]}
          ctaText="Talk to the agent"
        />

        <UseCasesSection
          title="What the confirmation agent handles"
          useCases={useCases}
        />

        <PerfectForSection
          title="Designed for appointment-based businesses"
          items={perfectFor}
          footer="If a missed appointment costs you — this is for you."
        />

        <StepsSection
          title="How it works"
          steps={steps}
          footer="No prompts. No scripts. No manual work."
        />

        <FeaturesGrid
          title="Reliable and respectful by default"
          features={reliableFeatures}
          footer={{
            line1: "This isn't a reminder bot.",
            line2: "It's a scheduling safeguard."
          }}
        />

        <ExperienceSection
          title="Better experience for clients"
          items={clientExperience}
        />

        <IntegrationsSection
          title="Connects with your systems"
          channels={integrationChannels}
        />

        <TestimonialsSection testimonials={testimonials} />

        <CTASection
          title="Ready to eliminate no-shows?"
          description="Set up your confirmation agent in minutes."
          primaryCta="Talk to the agent"
          secondaryCta="Create your agent"
          secondaryCtaLink="/sign-up"
        />

        <Footer />
      </div>
    </>
  );
}