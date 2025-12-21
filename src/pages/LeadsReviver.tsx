import { 
  Calendar,
  Shield,
  Clock,
  MessageSquare,
  UserCheck,
  RefreshCw,
  FileText,
  Search
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
import { loadAndOpenWidget } from "@/utils/widgetLoader";

const useCases = [
  {
    title: "Re-Contact Past Leads",
    description: "Bring your CRM back to life.",
    features: [
      "Calls leads from previous campaigns",
      "Reaches out at appropriate times",
      "Handles large lists automatically"
    ],
    icon: RefreshCw
  },
  {
    title: "Interest & Intent Checks",
    description: "Find out who's actually ready now.",
    features: [
      "Asks about current needs",
      "Identifies urgency and readiness",
      "Stops outreach when interest is low"
    ],
    subtext: "No pressure. No spam.",
    icon: Search
  },
  {
    title: "Appointment Booking",
    description: "Turn renewed interest into action.",
    features: [
      "Schedules meetings for interested leads",
      "Sends confirmations and reminders",
      "Handles reschedules automatically"
    ],
    icon: Calendar
  },
  {
    title: "Clean CRM Updates",
    description: "Give your team clarity, not noise.",
    features: [
      "Updates lead status",
      "Adds structured conversation notes",
      "Flags warm opportunities"
    ],
    subtext: "Your team sees exactly who to follow up with — and why.",
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
    title: "Choose who to re-engage",
    items: [
      "Select leads based on age, source, or status"
    ]
  },
  {
    number: "2",
    title: "Define re-engagement rules",
    items: [
      "How to introduce the call",
      "What questions to ask",
      "When to stop or escalate"
    ]
  },
  {
    number: "3",
    title: "Connect your CRM & calendar",
    items: [
      "Use your existing systems"
    ]
  },
  {
    number: "4",
    title: "Go live",
    items: [
      "Your agent starts re-engaging leads automatically"
    ]
  }
];

const respectfulFeatures = [
  {
    title: "Opt-out aware",
    description: "Respects preferences",
    icon: UserCheck
  },
  {
    title: "Tone-controlled",
    description: "Never aggressive",
    icon: MessageSquare
  },
  {
    title: "Rule-based",
    description: "No hallucinated promises",
    icon: Shield
  },
  {
    title: "Consistent",
    description: "Every lead gets the same experience",
    icon: Clock
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
    quote: "We discovered opportunities we would have never revisited manually.",
    author: "Revenue Lead",
    company: "Professional Services"
  },
  {
    quote: "The conversations feel human. We're not burning bridges.",
    author: "Founder",
    company: "Local Services"
  }
];

export default function LeadsReviver() {
  const handleOpenWidget = () => {
    loadAndOpenWidget({
      agentId: "agent_5301kcx1kyyzf4w8q6z6f4kzybfx",
      apiKey: "pk_live_5193012d945fe17ccb842fbdd9e69dc96c0274a18801fb2b588da9c84256faba",
      apiBaseUrl: "http://localhost:3001",
      title: "Need help?",
      subtitle: "Talk to our AI assistant",
      buttonText: "Start a call",
      welcomeMessage: "Hi! How can I help you today?",
      iconType: "phone",
      position: "bottom-right",
      widgetSize: "medium",
      primaryColor: "#000000",
      primaryTextColor: "#ffffff",
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
      borderColor: "#e5e7eb",
      userBubbleColor: "#f3f4f6",
      agentBubbleColor: "#eff6ff",
      borderRadius: "16px",
    });
  };

  return (
    <>
      <SEO
        title="Re-Engage Leads You Thought Were Lost | Voiceable"
        description="Automatically reach out to past leads, identify renewed interest, and book appointments — without manual follow-ups. No scripts, no prompt writing, no awkward outreach."
        keywords="lead reactivation, dead leads, lead nurturing, CRM reactivation, sales automation, lead follow-up, past leads, lead revival"
        url="https://voice-agent-ai-4288599ce3fe.herokuapp.com/leads-reviver"
      />
      <div className="min-h-screen bg-background">
        <Navigation />

        <HeroSection
          badge="No scripts, no prompt writing, no awkward outreach"
          title="Re-Engage Leads"
          titleHighlight="You Thought Were Lost"
          description="Automatically reach out to past leads, identify renewed interest, and book appointments — without manual follow-ups."
          primaryCta="Talk to the agent"
          secondaryCta="Create your agent"
          secondaryCtaLink="/sign-up"
          onPrimaryCtaClick={handleOpenWidget}
          icons={[
            { icon: RefreshCw, label: "Re-contact", color: "bg-primary/20" },
            { icon: Search, label: "Qualify", color: "bg-accent/20" },
            { icon: Calendar, label: "Book", color: "bg-emerald/20" }
          ]}
        />

        <ValueProposition
          title="Built for overlooked pipelines, not cold calling"
          subtitle="Most 'dead' leads aren't uninterested — they were just busy, not ready, or never followed up."
          description="Your AI lead reviver reaches out respectfully, asks the right questions, and surfaces real opportunities for your team."
          highlights={["No scripts.", "No prompt writing.", "No awkward outreach."]}
        />

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

        <UseCasesSection
          title="What the AI lead reviver handles"
          useCases={useCases}
        />

        <PerfectForSection
          title="Designed for businesses with real pipelines"
          items={perfectFor}
          footer="If you've ever said 'we should follow up on those someday' — this is for you."
        />

        <StepsSection
          title="How it works"
          steps={steps}
          footer="No prompts. No scripts. No manual dialing."
        />

        <FeaturesGrid
          title="Respectful by design"
          features={respectfulFeatures}
          footer={{
            line1: "This isn't spam automation.",
            line2: "It's thoughtful follow-up at scale."
          }}
        />

        <ExperienceSection
          title="Better experience for leads"
          items={leadExperience}
        />

        <IntegrationsSection
          title="Connects with your systems"
          channels={integrationChannels}
        />

        <TestimonialsSection testimonials={testimonials} />

        <CTASection
          title="Ready to revive your pipeline?"
          description="Start re-engaging leads in minutes."
          primaryCta="Talk to the agent"
          secondaryCta="Create your agent"
          secondaryCtaLink="/sign-up"
          onPrimaryCtaClick={handleOpenWidget}
        />

        <Footer />
      </div>
    </>
  );
}