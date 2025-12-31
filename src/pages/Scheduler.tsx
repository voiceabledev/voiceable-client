import { 
  Phone, 
  Calendar,
  Shield,
  Clock,
  Zap,
  Target,
  UserCheck,
  TrendingUp,
  FileText,
  ArrowRight,
  DollarSign,
  BarChart3,
  Lightbulb
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  PipelineImpactDashboard,
  ComparisonTable,
  ObjectionHandlingSection,
  SpeedImpactCalculator,
} from "@/components/landing";

const useCases = [
  {
    title: "B2B SaaS Company",
    category: "DEMO QUALIFICATION",
    description: "124 qualified demos booked monthly",
    results: "67% lead-to-meeting rate · $487k pipeline · 38 sec avg response",
    quote: "We were drowning in form fills and our BDR was overwhelmed. Now every lead gets qualified instantly. Our BDR only takes pre-qualified meetings. Close rate up 34%.",
    metrics: {
      pipelineValue: "$487k/month (was $273k)",
      salesEfficiency: "BDR handles 3x more volume",
      roi: "23x in first 90 days"
    },
    icon: Zap
  },
  {
    title: "Real Estate Brokerage",
    category: "SHOWING BOOKING",
    description: "89 property showings booked monthly",
    results: "72% qualification rate · $2.1M pipeline · 24/7 coverage",
    quote: "Saturday 9pm inquiry on a $850k listing. AI qualifies them, confirms financing, books Sunday showing. They made an offer Monday. We would've lost that to whoever answered first.",
    metrics: {
      afterHoursPerformance: "56% of inquiries come evenings/weekends",
      speedAdvantage: "Beat competitors by average 18 hours",
      conversion: "34% faster sales cycle"
    },
    icon: Calendar
  },
  {
    title: "Legal Services Firm",
    category: "CONSULTATION BOOKING",
    description: "67 consultations booked monthly",
    results: "61% qualification rate · $180k new client value · Immediate response",
    quote: "Potential client calls Friday at 6pm about estate planning. AI qualifies case value, urgency, budget. Books Monday consultation. They're pre-sold before our attorney even talks to them.",
    metrics: {
      caseValue: "$180k in new client revenue/month",
      qualificationAccuracy: "92% of booked consultations convert",
      timeSaved: "15 hours/month on unqualified calls"
    },
    icon: Target
  },
  {
    title: "Insurance Agency",
    category: "QUOTE QUALIFICATION",
    description: "156 policy quotes qualified monthly",
    results: "58% quote-to-sale rate · $94k new premium · Multi-product upsell",
    quote: "Lead requests auto insurance quote. AI asks about home, life, business coverage. Books comprehensive review. Average policy value increased 2.4x because we're qualifying the whole picture.",
    metrics: {
      revenuePerLead: "Up 140%",
      crossSellRate: "67% (was 23%)",
      agentEfficiency: "Handle 2x volume, same headcount"
    },
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
    title: "Instant Contact (< 60 seconds)",
    items: [
      "Form submitted at 11pm? Weekend inquiry? Lunch break?",
      "Your AI qualifier calls or messages within 60 seconds. Every time.",
      "No lead waits. No competitor beats you."
    ]
  },
  {
    number: "2",
    title: "Smart Qualification Questions",
    items: [
      "Asks exactly what your sales team needs to know: budget range, timeline, decision authority, current situation, specific needs",
      "Feels natural, never robotic",
      "Adapts based on their answers"
    ]
  },
  {
    number: "3",
    title: "Books Only Quality Meetings",
    items: [
      "Not every lead deserves your sales team's time",
      "AI knows your criteria: books qualified leads immediately, schedules follow-up for maybes, disqualifies bad fits politely",
      "Your calendar fills with buyers, not tire-kickers"
    ]
  },
  {
    number: "4",
    title: "Perfect Handoff",
    items: [
      "When your sales rep joins the call, they see: complete qualification notes, budget confirmed, timeline clear, objections already handled, specific pain points identified",
      "No more 'So... tell me about your business.'"
    ]
  }
];

const consistencyFeatures = [
  {
    title: "The 60-Second Rule",
    description: "Every second after form submission, your close rate drops. Our AI contacts leads in under 60 seconds. Every. Single. Time. While competitors are sending 'thanks for your interest' emails.",
    icon: Clock
  },
  {
    title: "Qualification Intelligence",
    description: "Not a survey bot. Asks follow-up questions based on answers, detects buying signals, identifies objections early, escalates high-value leads immediately. Thinks like your best BDR.",
    icon: Target
  },
  {
    title: "Knows When to Push, When to Nurture",
    description: "Ready to buy now? Books the meeting. Need 3 months? Schedules follow-up. Budget concerns? Addresses them or disqualifies politely. Not every lead gets the same treatment.",
    icon: UserCheck
  },
  {
    title: "CRM Sync That Actually Works",
    description: "Creates contact with full qualification data, updates deal stage automatically, logs conversation notes, sets follow-up tasks, triggers sales notifications. Your CRM finally stays current.",
    icon: FileText
  },
  {
    title: "Handles Objections Naturally",
    description: "'Too expensive' → Discusses ROI and payment options. 'Need to think about it' → Identifies real concern, offers to book follow-up. 'Just researching' → Qualifies timeline, books future conversation. Trained on your actual objection-handling framework.",
    icon: Shield
  },
  {
    title: "Works Your Peak Hours",
    description: "Form fills spike at 8pm, weekends, holidays? That's exactly when your AI qualifier shines. While your team is off, it's booking your best meetings.",
    icon: Zap
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
    quote: "First month: 67 qualified meetings from 103 leads. Before AI: 23 meetings from similar volume. Our sales team is closing deals, not chasing cold leads. Best $380/month we've ever spent.",
    author: "Director of Sales",
    company: "B2B Services",
    metric: "67 qualified meetings/month"
  },
  {
    quote: "The pipeline report changed everything. We could see exactly which leads came in after hours and how many we were missing. Now those are our BEST leads because no competitor is awake to respond.",
    author: "Founder",
    company: "Consulting Agency",
    metric: "After-hours leads = best leads"
  },
  {
    quote: "Our BDR was burning out trying to respond to weekend leads on Monday. Now she handles qualified meetings only. Her quota attainment went from 78% to 134%. She sends the AI flowers.",
    author: "VP Sales",
    company: "Insurance",
    metric: "BDR quota: 78% → 134%"
  },
  {
    quote: "We tested this skeptically. Week one: 12 qualified meetings. Week two: 19. Week three: our CEO asked why we didn't do this a year ago. Fastest ROI of any sales tool we've bought.",
    author: "Head of Revenue Ops",
    company: "SaaS",
    metric: "Fastest ROI of any sales tool"
  }
];

export default function Scheduler() {
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const handleOpenWidget = () => {
    setShowCalendarModal(true);
  };

  return (
    <>
      <SEO
        title="Contact Leads in Under 60 Seconds | AI Lead Qualifier | Voiceable"
        description="Contact leads in under 60 seconds. AI lead qualifier qualifies prospects instantly and books only quality meetings. 78% of deals go to whoever responds first. Stop losing to speed."
        keywords="AI lead qualifier, appointment setter, lead qualification, sales automation, automated booking, lead follow-up, sales agent, appointment scheduling, pipeline velocity, 60 second response, lead qualification AI, sales automation tool"
        url="https://voice-agent-ai-4288599ce3fe.herokuapp.com/scheduler"
      />
      <div className="min-h-screen bg-background">
        <Navigation />

        <HeroSection
          badge="Voice agents that prove their ROI"
          title="Strike While They're Hot"
          titleHighlight=""
          description="78% of deals go to whoever responds first. Your AI lead qualifier contacts new leads in under 60 seconds, qualifies them instantly, and books meetings while your competitors are still drafting emails."
          primaryCta="Book Demo"
          secondaryCta="See How Many Leads Go Cold"
          secondaryCtaLink="/sign-up"
          onPrimaryCtaClick={handleOpenWidget}
          icons={[
            { icon: Zap, label: "Contact", color: "bg-emerald/20" },
            { icon: Target, label: "Qualify", color: "bg-primary/20" },
            { icon: Calendar, label: "Book", color: "bg-accent/20" }
          ]}
        />

        {/* Stats Banner */}
        <section className="py-8 px-6 bg-card/30 -mt-12 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm md:text-base">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold">
                <Clock className="w-4 h-4" />
                Responds in &lt; 60 seconds
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold">
                <TrendingUp className="w-4 h-4" />
                3-5x more qualified meetings
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-semibold">
                <UserCheck className="w-4 h-4" />
                Your sales team only talks to ready buyers
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Banner */}
        <section className="py-12 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-8 md:p-12 border border-border shadow-lg">
              <p className="text-sm text-muted-foreground mb-4 text-center">Trusted by revenue teams that refuse to lose deals to speed</p>
              <blockquote className="text-xl md:text-2xl text-foreground italic text-center mb-6 leading-relaxed">
                "We went from <span className="text-red-600 dark:text-red-400 font-bold">23%</span> to <span className="text-emerald-600 dark:text-emerald-400 font-bold">67%</span> lead-to-meeting rate. Same traffic, same offer. The only difference? Instant qualification instead of waiting for our BDR to follow up the next day."
              </blockquote>
              <p className="text-center text-muted-foreground font-medium">— VP Sales, B2B SaaS</p>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="py-24 px-6 bg-card/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-center leading-tight">
              Your Leads Are Going Cold While You Sleep
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
              Here's what happens to most leads:
            </p>
            
            <div className="bg-background/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg space-y-8">
              <div className="space-y-6">
                <div className="border-l-4 border-red-500 pl-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-bold">Hour 1</span>
                    <span className="text-sm text-muted-foreground">Lead submits form at 7:30pm</span>
                  </div>
                  <p className="text-foreground mb-1">Your response: "Thanks, we'll be in touch tomorrow"</p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold">Competitor with AI: Qualified and meeting booked in 90 seconds</p>
                </div>

                <div className="border-l-4 border-orange-500 pl-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm font-bold">Hour 12</span>
                    <span className="text-sm text-muted-foreground">You email at 9am next morning</span>
                  </div>
                  <p className="text-foreground mb-1">Lead interest level: <span className="text-red-600 dark:text-red-400 font-semibold">Dropped 80%</span></p>
                  <p className="text-muted-foreground">They've already talked to 2 competitors</p>
                  <p className="text-muted-foreground">Your email goes to spam folder</p>
                </div>

                <div className="border-l-4 border-amber-500 pl-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-bold">Hour 24</span>
                    <span className="text-sm text-muted-foreground">Your BDR calls, gets voicemail</span>
                  </div>
                  <p className="text-foreground mb-1">Lead has forgotten who you are</p>
                  <p className="text-muted-foreground">They're comparing 4 other options</p>
                  <p className="text-muted-foreground">You've entered the price war</p>
                </div>

                <div className="border-l-4 border-red-600 pl-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-bold">Day 3</span>
                    <span className="text-sm text-muted-foreground">You finally connect</span>
                  </div>
                  <p className="text-foreground mb-1">They say "still evaluating options"</p>
                  <p className="text-muted-foreground">You're now just another quote</p>
                  <p className="text-red-600 dark:text-red-400 font-bold text-lg">Win rate: 12%</p>
                </div>
              </div>
              
              <div className="border-t border-border pt-8">
                <h3 className="text-2xl font-bold text-foreground mb-6 text-center">The research is brutal:</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <span className="text-red-600 dark:text-red-400 font-bold text-lg">•</span>
                    <span className="text-foreground"><strong>78% of customers</strong> buy from whoever responds first</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <span className="text-red-600 dark:text-red-400 font-bold text-lg">•</span>
                    <span className="text-foreground">After <strong>5 minutes</strong>, lead response drops <strong>400%</strong></span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <span className="text-red-600 dark:text-red-400 font-bold text-lg">•</span>
                    <span className="text-foreground">After <strong>1 hour</strong>, qualification rate drops <strong>70%</strong></span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">•</span>
                    <span className="text-foreground">Leads contacted in <strong>60 seconds</strong> = <strong>391% higher conversion</strong></span>
                  </div>
                </div>
                
                <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
                  <p className="text-xl font-bold text-center text-foreground">
                    Every minute you wait, your close rate drops.
                  </p>
                  <p className="text-lg text-center text-foreground mt-2">
                    Your AI lead qualifier strikes while they're hot.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PipelineImpactDashboard />

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

        {/* Use Cases Section with Metrics */}
        <section className="py-24 px-6 bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-12 text-center">
              Real Use Cases.<br />Measurable Pipeline Impact.
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
                              {key === 'pipelineValue' && 'Pipeline Value: '}
                              {key === 'salesEfficiency' && 'Sales Efficiency: '}
                              {key === 'roi' && 'ROI: '}
                              {key === 'afterHoursPerformance' && 'After-Hours Performance: '}
                              {key === 'speedAdvantage' && 'Speed Advantage: '}
                              {key === 'conversion' && 'Conversion: '}
                              {key === 'caseValue' && 'Case Value: '}
                              {key === 'qualificationAccuracy' && 'Qualification Accuracy: '}
                              {key === 'timeSaved' && 'Time Saved: '}
                              {key === 'revenuePerLead' && 'Revenue Per Lead: '}
                              {key === 'crossSellRate' && 'Cross-Sell Rate: '}
                              {key === 'agentEfficiency' && 'Agent Efficiency: '}
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
          title="Designed for real revenue teams"
          items={perfectFor}
          footer="Anywhere follow-up speed and consistency matter."
        />

        <StepsSection
          title="Contact, Qualify, Book — In Under 90 Seconds"
          steps={steps}
          footer="No prompts. No scripts. No manual tuning."
        />

        <FeaturesGrid
          title="Built for Pipeline Velocity, Not Just Lead Capture"
          features={consistencyFeatures}
          footer={{
            line1: "This isn't a bot experiment.",
            line2: "It's a pipeline acceleration system."
          }}
        />

        <SpeedImpactCalculator />

        <ComparisonTable
          rows={[
            { feature: "Response Time", human: "4-48 hours average", answeringService: "Email drip delays", voiceable: "< 60 seconds always" },
            { feature: "Availability", human: "Business hours", answeringService: "24/7 (automated)", voiceable: "True 24/7 live conversations" },
            { feature: "Qualification Depth", human: "✓ Excellent when they connect", answeringService: "✗ Surface-level forms", voiceable: "✓ Natural conversation" },
            { feature: "Cost", human: "$4,500-6,000/BDR/month", answeringService: "$500-2,000/month", voiceable: "$380/month" },
            { feature: "Handles Objections", human: "✓ When available", answeringService: "✗ Scripted email responses", voiceable: "✓ Real-time, adaptive" },
            { feature: "Lead Capacity", human: "50-100/month per BDR", answeringService: "Unlimited but impersonal", voiceable: "Unlimited + personalized" },
            { feature: "Meeting Quality", human: "Depends on BDR skill", answeringService: "Low (no screening)", voiceable: "High (qualified before booking)" },
            { feature: "Tracks Pipeline Impact", human: "Manual CRM updates", answeringService: "Campaign metrics only", voiceable: "✓ Real-time attribution" },
          ]}
        />

        <ObjectionHandlingSection
          objections={[
            {
              question: "Won't leads prefer talking to a human?",
              answer: "They prefer talking to someone who responds immediately. 78% of deals go to whoever responds first — not whoever sounds most human. In testing, leads rated our AI qualifier at 4.6/5 for professionalism. They care about: getting answers fast, feeling heard, clear next steps. Speed beats 'humanness' every time. Plus: your sales team takes over for the actual meeting. AI qualifies, humans close."
            },
            {
              question: "What if the AI misqualifies leads?",
              answer: "Our AI follows your exact qualification criteria. In real-world usage: 92% qualification accuracy, 8% escalated to human when uncertain, 94% of booked meetings show up. And you can review every conversation. The AI learns from corrections. Most customers see accuracy improve to 96%+ by month two."
            },
            {
              question: "We have a complex sales process.",
              answer: "Perfect. Complex processes need consistency. Your AI qualifier asks the same questions the same way every time. It never forgets to ask about budget. It never skips authority questions because it's in a rush. Your BDRs are great, but they're human. They have good days and bad days. The AI? Same perfect qualification, every single lead."
            },
            {
              question: "Our BDRs do more than just qualify.",
              answer: "Keep them! Your AI qualifier handles the repetitive qualification grind. Your BDRs focus on: high-value relationship building, complex deal strategy, territory planning, closing enterprise deals. Think of it as: AI qualifies 100% of leads instantly. BDRs take only qualified meetings and focus on revenue activities. Same team, 3x more qualified pipeline."
            }
          ]}
        />

        {/* The Speed Advantage Section */}
        <section className="py-24 px-6 bg-card/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-12 text-center">
              What Happens When You Respond in 60 Seconds vs. 24 Hours
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-8 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-8 h-8 text-emerald-600" />
                  <h3 className="text-2xl font-bold text-foreground">60 Second Response</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Lead is still on your website",
                    "Your brand is top-of-mind",
                    "Buying intent is highest",
                    "No competitor contact yet",
                    "Qualification rate: 67%",
                    "You control the narrative"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">✓</span>
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-8 h-8 text-red-600" />
                  <h3 className="text-2xl font-bold text-foreground">24 Hour Response</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Lead has contacted 3-4 competitors",
                    "They're comparing prices",
                    "Interest has cooled significantly",
                    "You're in a commodity battle",
                    "Qualification rate: 12%",
                    "You're chasing, not leading"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">✗</span>
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-12 bg-primary/10 rounded-2xl p-8 border border-primary/20 text-center">
              <p className="text-xl font-bold text-foreground mb-2">The data doesn't lie:</p>
              <p className="text-2xl text-foreground mb-4">
                MIT study: <span className="text-emerald-600 dark:text-emerald-400 font-bold">391% higher conversion</span> when contacted in 60 seconds vs. 24 hours.
              </p>
              <p className="text-lg text-muted-foreground">
                Every minute you wait is pipeline you'll never see.
              </p>
            </div>
          </div>
        </section>

        <ExperienceSection
          title="Better experience for leads"
          items={leadExperience}
        />

        <IntegrationsSection
          title="Connects with your systems"
          channels={integrationChannels}
        />

        <TestimonialsSection 
          title="Trusted by Revenue Teams That Refuse to Lose Deals to Speed"
          testimonials={testimonials} 
        />

        {/* Final CTA Section with Pricing */}
        <section className="py-24 px-6 bg-card relative overflow-hidden">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Stop Losing Deals to Slow Response
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Start qualifying every lead instantly
            </p>

            <div className="bg-background/60 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-border max-w-4xl mx-auto">
              <p className="text-lg font-semibold text-foreground mb-6">What you get:</p>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {[
                  "&lt; 60 second lead response",
                  "Natural qualification conversations",
                  "Automatic meeting booking",
                  "Complete CRM sync",
                  "Real-time pipeline tracking",
                  "Smart objection handling"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-border pt-6">
                <div className="bg-primary/5 rounded-xl p-4 mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Benefits:</p>
                  <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <span className="text-foreground">14-day free trial</span>
                    <span className="text-foreground">•</span>
                    <span className="text-foreground">Set up in 15 minutes</span>
                    <span className="text-foreground">•</span>
                    <span className="text-foreground">First qualified meeting within 48 hours</span>
                    <span className="text-foreground">•</span>
                    <span className="text-foreground">Pipeline dashboard shows impact immediately</span>
                    <span className="text-foreground">•</span>
                    <span className="text-foreground">Average pipeline increase: 2-3x</span>
                  </div>
                </div>
                
                <p className="text-2xl font-bold text-foreground mb-2">
                  Cost: <span className="text-primary">$380/month</span>
                </p>
                <p className="text-lg text-muted-foreground">
                  Average pipeline increase: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">$180k-487k/month</span>
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Button 
                size="lg" 
                onClick={handleOpenWidget}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-6 text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Phone className="w-5 h-5 mr-2" />
                Book Demo
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

        {/* Calendar Modal */}
        <Dialog open={showCalendarModal} onOpenChange={setShowCalendarModal}>
          <DialogContent className="max-w-4xl w-full h-[90vh] max-h-[800px] p-0 flex flex-col">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
              <DialogTitle>Schedule a Meeting</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden min-h-0">
              <iframe
                src="https://calendly.com/imvitoroliveira"
                className="w-full h-full border-0"
                title="Calendly Scheduling"
                allow="camera; microphone; geolocation"
              />
            </div>
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    </>
  );
}