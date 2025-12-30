import { 
  Phone, 
  MessageSquare,
  Calendar,
  UserCheck,
  Shield,
  Clock,
  Zap,
  PhoneCall,
  PhoneForwarded,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
  RevenueCaptureDashboard,
  ROICalculator,
  ComparisonTable,
  ObjectionHandlingSection,
} from "@/components/landing";
import { openWidgetWithConfig } from "@/utils/widgetHelpers";

const useCases = [
  {
    title: "Medical & Dental Practices",
    category: "APPOINTMENT BOOKING",
    description: "152 appointments booked last month",
    results: "79% booking success · $2.50/booking · 24/7 coverage",
    quote: "Patient calls at 8pm with tooth pain. Books emergency appointment for next morning. We never lose another after-hours patient.",
    metrics: {
      costSavings: "$2,820/month vs. full-time receptionist",
      additionalRevenue: "$18k/month from previously missed calls"
    },
    icon: Calendar
  },
  {
    title: "Home Services",
    category: "EMERGENCY BOOKINGS",
    description: "234 service calls captured monthly",
    results: "72% booked immediately · $3.20/call · Peak season ready",
    quote: "Summer AC breakdowns happen at 10pm. Our AI books the emergency visit while competitors go to voicemail. We win every time.",
    metrics: {
      competitiveAdvantage: "Answer while competitors sleep",
      revenueCapture: "$28k/month in emergency bookings"
    },
    icon: Phone
  },
  {
    title: "Professional Services",
    category: "CONSULTATION BOOKING",
    description: "89 consultations booked monthly",
    results: "67% conversion · $1.95/booking · Weekend coverage",
    quote: "Friday 6pm inquiry about estate planning. AI books Monday consultation before they call our competitor. That's a $4,500 client we would've lost.",
    metrics: {
      weekendPerformance: "34% of bookings happen Sat-Sun",
      clientAcquisition: "23% increase in new clients"
    },
    icon: MessageSquare
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
    title: "24/7 Availability",
    items: [
      "No more 'Sorry, we're closed' voicemails",
      "Books appointments at 11pm, on Sundays, during holidays",
      "Your AI receptionist never sleeps, never takes breaks, never misses a shift"
    ]
  },
  {
    number: "2",
    title: "Instant Booking",
    items: [
      "Checks your real calendar, finds available slots",
      "Books the appointment and sends confirmations",
      "All in under 90 seconds. No 'I'll call you back tomorrow'"
    ]
  },
  {
    number: "3",
    title: "Handles Call Surges",
    items: [
      "3 people call at once? 10? No problem",
      "Your AI receptionist handles unlimited simultaneous calls",
      "Every caller gets immediate attention, not a busy signal"
    ]
  },
  {
    number: "4",
    title: "Smart Escalation",
    items: [
      "Emergency? Complex question? Frustrated customer?",
      "Automatically transfers to your human team with full context",
      "AI handles routine bookings, humans handle what matters"
    ]
  }
];

const reliabilityFeatures = [
  {
    title: "Instant Calendar Integration",
    description: "Connects to Calendly, Google Calendar, Cal.com. Sees your real availability, books the slot, sends confirmation. All while your caller is still on the phone.",
    icon: Calendar
  },
  {
    title: "After-Hours Champion",
    description: "Your best hours for bookings? 5pm-9pm and weekends. When your human receptionist is off. Your AI receptionist shines exactly when you need it most.",
    icon: Clock
  },
  {
    title: "No More Phone Tag",
    description: "67% of voicemails never get returned. Your AI receptionist books the appointment immediately or transfers to your team. No callbacks needed. No revenue lost.",
    icon: Phone
  },
  {
    title: "Handles Your Busy Seasons",
    description: "Tax season? Wedding season? Holiday rush? Your AI receptionist scales instantly. Handle 10x call volume without hiring temporary staff or missing bookings.",
    icon: Zap
  },
  {
    title: "Smart About Urgency",
    description: "Detects emergency keywords, prioritizes based on your rules, escalates when needed. Books routine appointments automatically, gets you involved for VIP clients or complex situations.",
    icon: Shield
  },
  {
    title: "Works With Your Team",
    description: "Your human receptionist handles walk-ins and complex questions. Your AI receptionist captures phone bookings 24/7. They're a team, not a replacement.",
    icon: UserCheck
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
    quote: "First weekend with our AI receptionist: 23 bookings. That's $4,600 in revenue we would've completely missed. Paid for itself in 72 hours.",
    author: "HVAC Company Owner",
    company: "Home Services",
    metric: "$4,600 revenue captured"
  },
  {
    quote: "We were skeptical. Then we saw the dashboard: 67 after-hours bookings in month one. That's $13,400 we were losing every single month. Now we're capturing it.",
    author: "Medical Practice Manager",
    company: "Healthcare",
    metric: "$13,400/month captured"
  },
  {
    quote: "The math is simple: we miss 35% fewer calls, book 3x more after-hours appointments, and save $2,800/month vs. hiring a second receptionist. Easiest ROI calculation I've ever seen.",
    author: "Operations Director",
    company: "Professional Services Firm",
    metric: "$2,800/month saved"
  }
];

export default function Receptionist() {
  const handleOpenWidget = () => {
    openWidgetWithConfig();
  };

  return (
    <>
      <SEO
        title="Never Miss Another Booking | AI Receptionist 24/7 | Voiceable"
        description="Never miss another booking. AI receptionist answers 24/7, books appointments instantly, and captures revenue you're currently losing. See exactly what you're missing."
        keywords="AI receptionist, virtual receptionist, automated receptionist, call answering service, front desk automation, medical receptionist, business phone system, revenue capture, lost bookings, after-hours bookings, ROI calculator, appointment booking AI, 24/7 receptionist"
        url="https://voice-agent-ai-4288599ce3fe.herokuapp.com/receptionist"
      />
      <div className="min-h-screen bg-background">
        <Navigation />

        <HeroSection
          badge="Voice agents that prove their ROI"
          title="Never Miss a Booking Again"
          titleHighlight=""
          description="Every missed call is lost revenue. Your AI receptionist answers 24/7, books appointments instantly, and tracks every dollar captured."
          primaryCta="Talk to Demo Receptionist"
          secondaryCta="See How Much Revenue You're Losing"
          secondaryCtaLink="/sign-up"
          onPrimaryCtaClick={handleOpenWidget}
          icons={[
            { icon: PhoneCall, label: "Answer", color: "bg-emerald/20" },
            { icon: MessageSquare, label: "Assist", color: "bg-primary/20" },
            { icon: PhoneForwarded, label: "Route", color: "bg-accent/20" }
          ]}
        />

        {/* Stats Banner */}
        <section className="py-8 px-6 bg-card/30 -mt-12 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm md:text-base">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold">
                <Phone className="w-4 h-4" />
                Answers in under 2 rings
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold">
                <Clock className="w-4 h-4" />
                Books while you sleep
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-semibold">
                <Zap className="w-4 h-4" />
                Captures 3-5x more appointments
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Banner */}
        <section className="py-12 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-8 md:p-12 border border-border shadow-lg">
              <p className="text-sm text-muted-foreground mb-4 text-center">Trusted by businesses who measure outcomes, not just conversations</p>
              <blockquote className="text-xl md:text-2xl text-foreground italic text-center mb-6 leading-relaxed">
                "We were missing 40% of calls during lunch and after 5pm. Now we capture every booking opportunity. That's an extra <span className="font-bold text-emerald-600 dark:text-emerald-400">$18k/month</span> we were just leaving on the table."
              </blockquote>
              <p className="text-center text-muted-foreground font-medium">— Dental Practice Owner</p>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="py-24 px-6 bg-card/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-center leading-tight">
              How Much Revenue Are You Losing?
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
              Your human receptionist is excellent. But they can't:
            </p>
            
            <div className="bg-background/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg space-y-8">
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {[
                  "Answer calls during lunch breaks",
                  "Take bookings after closing time",
                  "Handle 3 calls simultaneously",
                  "Work weekends without overtime",
                  "Never call in sick"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-card hover:shadow-md transition-all">
                    <span className="text-red-500 text-xl">✗</span>
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-border pt-8">
                <h3 className="text-2xl font-bold text-foreground mb-6 text-center">The math is brutal:</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <span className="text-red-600 dark:text-red-400 font-bold text-lg">•</span>
                    <span className="text-foreground">Average business misses <strong>30-40% of calls</strong></span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <span className="text-red-600 dark:text-red-400 font-bold text-lg">•</span>
                    <span className="text-foreground"><strong>62% of missed calls</strong> never call back</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <span className="text-red-600 dark:text-red-400 font-bold text-lg">•</span>
                    <span className="text-foreground">Each missed booking = <strong>$150-500 lost revenue</strong></span>
                  </div>
                </div>
                
                <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 mb-6">
                  <p className="text-lg text-foreground mb-2 text-center">
                    <strong>Example calculation:</strong>
                  </p>
                  <p className="text-xl text-foreground text-center font-semibold">
                    If you get 200 calls/month and miss 30%, that's <span className="text-red-600 dark:text-red-400">60 lost bookings</span>.
                  </p>
                  <p className="text-xl text-foreground text-center font-semibold mt-2">
                    At $200/booking, you're losing <span className="text-red-600 dark:text-red-400 text-2xl">$12,000/month</span>.
                  </p>
                </div>
                
                <p className="text-xl font-bold text-center text-foreground">
                  Your AI receptionist captures what you're missing.
                </p>
              </div>
            </div>
          </div>
        </section>

        <RevenueCaptureDashboard />

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
          onCtaClick={handleOpenWidget}
        />

        {/* Use Cases Section with ROI */}
        <section className="py-24 px-6 bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-12 text-center">
              Real Use Cases.<br />Measurable Results.
            </h2>
            
            <div className="space-y-8">
              {useCases.map((useCase, index) => (
                <div
                  key={index}
                  className="bg-card rounded-2xl p-8 md:p-12 border border-border hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-6 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase">
                          {useCase.category}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{useCase.title}</h3>
                      <p className="text-lg text-muted-foreground mb-4">{useCase.description}</p>
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                          Results: {useCase.results}
                        </span>
                      </div>
                      <blockquote className="text-foreground italic mb-4 border-l-4 border-primary pl-4">
                        "{useCase.quote}"
                      </blockquote>
                      <div className="flex items-center gap-4 flex-wrap">
                        {Object.entries(useCase.metrics).map(([key, value], idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-sm font-semibold text-foreground">
                              {key === 'costSavings' && 'Cost Savings: '}
                              {key === 'additionalRevenue' && 'Additional Revenue: '}
                              {key === 'competitiveAdvantage' && 'Competitive Advantage: '}
                              {key === 'revenueCapture' && 'Revenue Capture: '}
                              {key === 'weekendPerformance' && 'Weekend Performance: '}
                              {key === 'clientAcquisition' && 'Client Acquisition: '}
                              <span className="text-primary">{value}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <PerfectForSection
          title="Designed for real businesses"
          items={perfectFor}
          footer="Anywhere a front desk answers the same questions all day."
        />

        <StepsSection
          title="Answer Every Call, Every Time"
          steps={steps}
          footer="No prompts. No scripts. No fragile logic."
        />

        <FeaturesGrid
          title="Built for Revenue Capture, Not Just Call Answering"
          features={reliabilityFeatures}
          footer={{
            line1: "This is not a chatbot.",
            line2: "It's your revenue capture system, automated."
          }}
        />

        <ROICalculator />

        <ComparisonTable
          rows={[
            { feature: "Cost", human: "$3,200-4,000/month", answeringService: "$800-1,500/month", voiceable: "$380/month" },
            { feature: "Availability", human: "Business hours only", answeringService: "24/7 (with limitations)", voiceable: "True 24/7" },
            { feature: "Booking Ability", human: "✓ During work hours", answeringService: "✗ Takes messages", voiceable: "✓ Books immediately" },
            { feature: "Call Capacity", human: "1-2 simultaneous", answeringService: "Limited", voiceable: "Unlimited" },
            { feature: "Tracks Revenue", human: "Manual spreadsheets", answeringService: "✗ No tracking", voiceable: "✓ Real-time dashboard" },
            { feature: "After-Hours", human: "Voicemail only", answeringService: "Messages only", voiceable: "Books appointments" },
            { feature: "Setup Time", human: "2-4 weeks hiring", answeringService: "1-2 weeks", voiceable: "15 minutes" },
            { feature: "Sick Days", human: "Unpredictable coverage gaps", answeringService: "Occasional delays", voiceable: "Never" },
          ]}
        />

        <ObjectionHandlingSection
          objections={[
            {
              question: "What if customers want to talk to a human?",
              answer: "They can. Your AI receptionist handles routine bookings instantly (90 seconds vs. 4-minute average). For complex questions or VIP clients, it transfers immediately with full context. Result: Routine bookings happen faster. Your human team focuses on high-value interactions."
            },
            {
              question: "Will customers know it's AI?",
              answer: "Most don't notice. Those who do? They appreciate the instant booking and 24/7 availability. We've found 94% satisfaction rates because the experience is better — no hold times, no callbacks, no voicemail."
            },
            {
              question: "What about our existing receptionist?",
              answer: "Your AI receptionist isn't a replacement — it's an expansion. Your human receptionist handles walk-ins, complex situations, and provides the personal touch. Your AI captures the 30-40% of calls that would otherwise be missed. Think of it as hiring a night shift + weekend + lunch coverage receptionist for $380/month."
            }
          ]}
        />

        <ExperienceSection
          title="Better experience for callers"
          items={callerExperience}
        />

        <IntegrationsSection
          title="Connects with your systems"
          channels={integrationChannels}
        />

        <TestimonialsSection 
          title="Trusted by Businesses That Refuse to Lose Revenue"
          testimonials={testimonials} 
        />

        {/* Final CTA Section with Pricing */}
        <section className="py-24 px-6 bg-card relative overflow-hidden">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Stop Losing Bookings
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Start capturing revenue you're currently missing
            </p>

            <div className="bg-background/60 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-border max-w-4xl mx-auto">
              <p className="text-lg font-semibold text-foreground mb-6">What you get:</p>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {[
                  "24/7 call answering",
                  "Instant appointment booking",
                  "Real-time revenue dashboard",
                  "Smart escalation to your team",
                  "Calendar integration",
                  "Unlimited concurrent calls"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-border pt-6">
                <p className="text-2xl font-bold text-foreground mb-2">
                  Cost: <span className="text-primary">$380/month</span>
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  Average value captured: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">$12,000-18,000/month</span>
                </p>
                
                <div className="bg-primary/5 rounded-xl p-4 mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Benefits:</p>
                  <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <span className="text-foreground">14-day free trial</span>
                    <span className="text-foreground">•</span>
                    <span className="text-foreground">Set up in 15 minutes</span>
                    <span className="text-foreground">•</span>
                    <span className="text-foreground">First booking within 24 hours</span>
                    <span className="text-foreground">•</span>
                    <span className="text-foreground">ROI dashboard shows captured revenue</span>
                    <span className="text-foreground">•</span>
                    <span className="text-foreground">Average ROI: 15-20x</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Button 
                size="lg" 
                onClick={handleOpenWidget}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-6 text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Phone className="w-5 h-5 mr-2" />
                Talk to Demo Receptionist
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="font-semibold px-8 py-6 text-base rounded-full border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200" 
                asChild
              >
                <Link to="/sign-up">
                  Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              14-day free trial · No credit card · Cancel anytime
            </p>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}