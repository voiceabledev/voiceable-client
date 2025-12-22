import { 
  Phone, 
  Calendar,
  Shield,
  Clock,
  Zap,
  Target,
  UserCheck,
  TrendingUp,
  FileText
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
    title: "Instant Lead Follow-Up",
    description: "Reach leads while they're still interested.",
    features: [
      "Calls or messages new leads within seconds",
      "Responds outside business hours",
      "Handles multiple leads at once"
    ],
    icon: Zap
  },
  {
    title: "Qualification Conversations",
    description: "Ask the questions that matter.",
    features: [
      "Budget and readiness",
      "Timeline and urgency",
      "Fit for your services",
      "Decision-making authority"
    ],
    subtext: "All based on rules you define.",
    icon: Target
  },
  {
    title: "Appointment Booking",
    description: "Book meetings only when it makes sense.",
    features: [
      "Schedules qualified leads",
      "Respects availability and constraints",
      "Sends confirmations and reminders",
      "Handles reschedules automatically"
    ],
    subtext: "Your team shows up prepared.",
    icon: Calendar
  },
  {
    title: "Clean Handoffs",
    description: "No more cold calls for your sales team.",
    features: [
      "Sends structured notes to your CRM",
      "Flags high-intent leads",
      "Transfers live when needed"
    ],
    subtext: "Sales talks only to people who are ready.",
    icon: FileText
  }
];

const perfectFor = [
  "B2B services and consulting",
  "Real estate and brokerage",
  "Legal and financial services",
  "Insurance and lending",
  "High-volume inbound sales"
];

const steps = [
  {
    number: "1",
    title: "Define your ideal lead",
    items: [
      "Who you want to talk to",
      "What qualifies someone",
      "What disqualifies them"
    ]
  },
  {
    number: "2",
    title: "Set booking rules",
    items: [
      "When to book",
      "When to follow up",
      "When to escalate to a human"
    ]
  },
  {
    number: "3",
    title: "Connect your systems",
    items: [
      "Calendar, CRM, phone, or forms"
    ]
  },
  {
    number: "4",
    title: "Go live",
    items: [
      "Your agent starts qualifying and booking immediately"
    ]
  }
];

const consistencyFeatures = [
  {
    title: "Same questions, every time",
    description: "Clear qualification criteria",
    icon: UserCheck
  },
  {
    title: "Safe conversations",
    description: "No hallucinations",
    icon: Shield
  },
  {
    title: "Scales automatically",
    description: "10 leads or 10,000",
    icon: TrendingUp
  },
  {
    title: "Always available",
    description: "Never misses a lead",
    icon: Clock
  }
];

const leadExperience = [
  "Fast responses",
  "Clear next steps",
  "Respectful conversations",
  "No pressure tactics"
];

const integrationChannels = [
  "Inbound forms and ads",
  "Existing phone numbers",
  "CRMs and calendars",
  "Sales teams of any size"
];

const testimonials = [
  {
    quote: "Every lead gets contacted now. Our sales team only talks to qualified prospects.",
    author: "Sales Director",
    company: "B2B Services"
  },
  {
    quote: "Our booking rate improved without adding headcount.",
    author: "Founder",
    company: "Consulting Firm"
  }
];

export default function Scheduler() {
  const handleOpenWidget = () => {
    loadAndOpenWidget({
      
      agentId: "agent_9801kd0vxph3f5waz8e47h6wyrcf",
      apiKey: "pk_live_32287d896af0dac77154b95a4ed2973e9158e9c1958a7df6c893dc0df44f9d49",
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
        title="AI Lead Qualifier & Appointment Setter | Voiceable"
        description="Follow up with every lead instantly. Qualify intent, book appointments, and send your team only the conversations that matter. No scripts, no prompt engineering."
        keywords="AI lead qualifier, appointment setter, lead qualification, sales automation, automated booking, lead follow-up, sales agent, appointment scheduling"
        url="https://voice-agent-ai-4288599ce3fe.herokuapp.com/scheduler"
      />
      <div className="min-h-screen bg-background">
        <Navigation />

        <HeroSection
          badge="No scripts, no prompt engineering, no fragile workflows"
          title="AI Lead Qualifier &"
          titleHighlight="Appointment Setter"
          description="Follow up with every lead instantly."
          subdescription="Qualify intent, book appointments, and send your team only the conversations that matter."
          primaryCta="Talk to the agent"
          secondaryCta="Create your agent"
          secondaryCtaLink="/sign-up"
          onPrimaryCtaClick={handleOpenWidget}
          icons={[
            { icon: Zap, label: "Contact", color: "bg-emerald/20" },
            { icon: Target, label: "Qualify", color: "bg-primary/20" },
            { icon: Calendar, label: "Book", color: "bg-accent/20" }
          ]}
        />

        <ValueProposition
          title="Built for sales teams, not call centers"
          subtitle="Speed and consistency win deals — but manual follow-ups don't scale."
          description="Your AI lead qualifier contacts new leads immediately, asks the right questions, and books qualified meetings automatically."
          highlights={["No scripts.", "No prompt engineering.", "No fragile workflows."]}
        />

        <TryItSection
          title="Experience it before setting anything up"
          description="Talk to a real AI agent and hear how it:"
          features={[
            "Introduces itself professionally",
            "Asks qualification questions naturally",
            "Responds to objections",
            "Books meetings when criteria are met"
          ]}
          ctaText="Talk to the agent"
          onCtaClick={handleOpenWidget}
        />

        <UseCasesSection
          title="What the AI lead qualifier handles"
          useCases={useCases}
        />

        <PerfectForSection
          title="Designed for real revenue teams"
          items={perfectFor}
          footer="Anywhere follow-up speed and consistency matter."
        />

        <StepsSection
          title="How it works"
          steps={steps}
          footer="No prompts. No scripts. No manual tuning."
        />

        <FeaturesGrid
          title="Built for consistency and trust"
          features={consistencyFeatures}
          footer={{
            line1: "This isn't a bot experiment.",
            line2: "It's a revenue system."
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
          title="Ready to qualify every lead?"
          description="Start booking more meetings in minutes."
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