import { 
  Calendar,
  Shield,
  Clock,
  Zap,
  CalendarCheck,
  Bell,
  RefreshCw,
  MessageSquare
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
    title: "Voice Widget Integration",
    description: "Embed conversational AI anywhere.",
    features: [
      "Add voice capabilities to any website",
      "Natural, human-like conversations",
      "Works on mobile and desktop"
    ],
    icon: MessageSquare
  },
  {
    title: "Real-Time Assistance",
    description: "Help visitors the moment they need it.",
    features: [
      "Answer questions instantly",
      "Guide users through your site",
      "Handle complex inquiries naturally"
    ],
    subtext: "No more support tickets for simple questions.",
    icon: Zap
  },
  {
    title: "Appointment Booking",
    description: "Convert conversations into bookings.",
    features: [
      "Schedule directly through voice",
      "Confirm availability in real-time",
      "Send automatic confirmations"
    ],
    icon: Calendar
  },
  {
    title: "Lead Qualification",
    description: "Identify high-intent visitors automatically.",
    features: [
      "Ask qualifying questions naturally",
      "Capture lead information",
      "Route to the right team member"
    ],
    subtext: "Every visitor gets personalized attention.",
    icon: CalendarCheck
  }
];

const perfectFor = [
  "E-commerce and retail websites",
  "SaaS and software companies",
  "Professional services firms",
  "Healthcare and wellness practices",
  "Any website that values customer experience"
];

const steps = [
  {
    number: "1",
    title: "Configure your agent",
    items: [
      "Define your brand voice",
      "Set conversation goals",
      "Choose what to handle"
    ]
  },
  {
    number: "2",
    title: "Customize the widget",
    items: [
      "Match your brand colors",
      "Position where it works best",
      "Set availability hours"
    ]
  },
  {
    number: "3",
    title: "Add to your website",
    items: [
      "One line of code",
      "Works with any platform"
    ]
  },
  {
    number: "4",
    title: "Go live",
    items: [
      "Start engaging visitors immediately"
    ]
  }
];

const reliableFeatures = [
  {
    title: "Always available",
    description: "24/7 support for your visitors",
    icon: Clock
  },
  {
    title: "Brand-consistent",
    description: "Matches your voice and style",
    icon: MessageSquare
  },
  {
    title: "Safe & reliable",
    description: "No inappropriate responses",
    icon: Shield
  },
  {
    title: "Scales with you",
    description: "Handles any traffic volume",
    icon: Zap
  }
];

const visitorExperience = [
  "Natural voice interactions",
  "Instant responses",
  "Personalized assistance",
  "Seamless handoffs to humans"
];

const integrationChannels = [
  "Any website or web app",
  "CRMs and booking systems",
  "Live chat platforms",
  "Analytics and tracking tools"
];

const testimonials = [
  {
    quote: "Our website engagement tripled after adding the voice widget. Visitors actually talk to us now.",
    author: "Marketing Director",
    company: "E-commerce Brand"
  },
  {
    quote: "The voice widget handles 80% of our support questions. Our team focuses on what matters.",
    author: "Customer Success Lead",
    company: "SaaS Company"
  }
];

export default function BubbleVoice() {
  return (
    <>
      <SEO
        title="Voice Widget for Your Website | Voiceable"
        description="Add conversational AI to your website with a simple voice widget. Engage visitors, answer questions, and book appointments — all through natural voice interactions."
        keywords="voice widget, website voice assistant, conversational AI, voice chat, website engagement, customer support automation, voice interface"
        url="https://www.voiceable.dev/bubble-voice"
      />
      <div className="min-h-screen bg-background">
        <Navigation />

        <HeroSection
          badge="Simple integration, powerful conversations"
          title="Voice Widget"
          titleHighlight="For Your Website"
          description="Add conversational AI to your website with a simple voice widget. Engage visitors, answer questions, and book appointments — all through natural voice interactions."
          primaryCta="Try the widget"
          secondaryCta="Get started"
          secondaryCtaLink="/sign-up"
          icons={[
            { icon: MessageSquare, label: "Engage", color: "bg-emerald/20" },
            { icon: Bell, label: "Assist", color: "bg-primary/20" },
            { icon: Calendar, label: "Convert", color: "bg-accent/20" }
          ]}
        />

        <ValueProposition
          title="Built for websites, not call centers"
          subtitle="Your visitors expect instant, personalized help."
          description="The voice widget brings conversational AI to your website — helping visitors get answers, book appointments, and connect with your team through natural voice interactions."
          highlights={["One line of code.", "Works everywhere.", "Scales automatically."]}
        />

        <TryItSection
          title="Experience it yourself"
          description="Try the voice widget and see how it:"
          features={[
            "Greets visitors naturally",
            "Answers questions in real-time",
            "Guides users to what they need",
            "Books appointments seamlessly"
          ]}
          ctaText="Try the widget"
        />

        <UseCasesSection
          title="What the voice widget handles"
          useCases={useCases}
        />

        <PerfectForSection
          title="Designed for modern websites"
          items={perfectFor}
          footer="If you want visitors to engage, not just browse — this is for you."
        />

        <StepsSection
          title="How it works"
          steps={steps}
          footer="No complex setup. No coding required."
        />

        <FeaturesGrid
          title="Built for reliability and trust"
          features={reliableFeatures}
          footer={{
            line1: "This isn't just a chatbot.",
            line2: "It's your website's voice."
          }}
        />

        <ExperienceSection
          title="Better experience for visitors"
          items={visitorExperience}
        />

        <IntegrationsSection
          title="Works with your tools"
          channels={integrationChannels}
        />

        <TestimonialsSection testimonials={testimonials} />

        <CTASection
          title="Ready to give your website a voice?"
          description="Add the widget in minutes."
          primaryCta="Try the widget"
          secondaryCta="Get started"
          secondaryCtaLink="/sign-up"
        />

        <Footer />
      </div>
    </>
  );
}