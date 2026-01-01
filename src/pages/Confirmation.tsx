import { 
  Calendar,
  Shield,
  Clock,
  Zap,
  CalendarCheck,
  Bell,
  RefreshCw,
  DollarSign,
  TrendingDown,
  Target,
  AlertCircle,
  ArrowRight,
  BarChart3
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
  TryItSection,
  StepsSection,
  FeaturesGrid,
  PerfectForSection,
  ExperienceSection,
  IntegrationsSection,
  TestimonialsSection,
  ComparisonTable,
  ObjectionHandlingSection,
  NoShowPreventionDashboard,
  NoShowCostCalculator,
} from "@/components/landing";

const useCases = [
  {
    title: "Medical & Dental Practices",
    category: "NO-SHOW PREVENTION",
    description: "34 no-shows prevented monthly",
    results: "20% → 6% no-show rate · $7,480 revenue saved · 23 early reschedules",
    quote: "We had to build buffer time into our schedule because of no-shows. Now we're running at 94% capacity. That's 48 additional patient slots per month we can actually bill for.",
    metrics: {
      revenueRecovered: "$7,480/month",
      capacityImprovement: "24% more billable hours",
      staffEfficiency: "No more calling patients all day",
      roi: "19x first month"
    },
    icon: CalendarCheck
  },
  {
    title: "Legal Services",
    category: "BILLABLE HOUR PROTECTION",
    description: "17 consultations saved monthly",
    results: "15% → 4% no-show rate · $6,800 revenue saved · Billable hour protection",
    quote: "Attorney time is $400/hour. When someone no-shows a 1-hour consult, that's $400 gone. AI confirmation cut no-shows by 73%. That's $6,800/month in attorney time we actually bill now.",
    metrics: {
      billableHoursProtected: "17 hours/month",
      revenueImpact: "$6,800/month",
      attorneySatisfaction: "'I can trust my calendar again'",
      clientExperience: "4.8/5 rating on confirmations"
    },
    icon: Shield
  },
  {
    title: "Med Spa & Wellness",
    category: "TREATMENT PROTECTION",
    description: "28 treatments saved monthly",
    results: "27% → 8% no-show rate · $8,400 revenue saved · Product prep waste eliminated",
    quote: "We were prepping skincare products and blocking treatment rooms for people who never showed. Now we know 2 days ahead. We've cut product waste by 70% and fill 85% of cancelled slots.",
    metrics: {
      revenueSaved: "$8,400/month",
      productWasteReduced: "$900/month",
      fillRate: "85% of early cancellations get rebooked",
      totalImpact: "$9,300/month benefit"
    },
    icon: Bell
  },
  {
    title: "Home Services",
    category: "TRUCK ROLL OPTIMIZATION",
    description: "22 service calls saved monthly",
    results: "18% → 5% no-show rate · $4,840 revenue saved · Truck roll optimization",
    quote: "Sending a crew to an empty house costs $220 (fuel, time, lost opportunity). AI catches cancellations early enough that we can route the crew to another job. Saved 22 wasted trips last month.",
    metrics: {
      wastedTruckRolls: "22 prevented",
      revenueSaved: "$4,840/month",
      crewEfficiency: "13% more jobs per day",
      customerSatisfaction: "No more 'where are you?' confusion"
    },
    icon: RefreshCw
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
    title: "Proactive Confirmation (24-48 Hours Out)",
    items: [
      "Doesn't just remind — actively confirms",
      "Calls or texts each client, asks if they're still coming",
      "Detects hesitation or conflicts, gets a clear yes or reschedule",
      "One-way reminders get ignored. Two-way confirmation gets clarity"
    ]
  },
  {
    number: "2",
    title: "Conflict Detection",
    items: [
      "Picks up on signals automated texts miss",
      "'Oh actually, I forgot I have...' 'I'm not sure I can make it' 'Can I call you back?' (they won't)",
      "Catches the soft no's before they become hard no-shows"
    ]
  },
  {
    number: "3",
    title: "Early Rescheduling",
    items: [
      "When someone can't make it, reschedules immediately while they're engaged",
      "Offers available slots from your real calendar",
      "Books the new time on the spot",
      "They're still a client — just different timing"
    ]
  },
  {
    number: "4",
    title: "Gap Recovery Window",
    items: [
      "Because you know 24-48 hours ahead instead of 10 minutes before, you actually have time to:",
      "Offer slot to waitlist, reach out to prospects who wanted 'first availability'",
      "Move up other appointments, fill the slot with someone else",
      "Revenue recovered instead of lost"
    ]
  }
];

const revenueProtectionFeatures = [
  {
    title: "The 48-Hour Window",
    description: "Confirms 2 days out, not 2 hours. Why? Because 48 hours gives you time to refill a cancelled slot. 2 hours means you eat the loss. Early confirmation = recoverable revenue.",
    icon: Clock
  },
  {
    title: "Conflict Surfacing",
    description: "Automated texts can't detect hesitation. AI conversation picks up: 'I think I can make it...' (they won't), 'Let me check...' (they forgot), 'Actually...' (conflict coming). Surfaces the soft no before it becomes a no-show.",
    icon: AlertCircle
  },
  {
    title: "Reschedule vs. Cancel",
    description: "When someone can't make it, reschedule immediately instead of losing them forever. Offers available times right then. Books the new slot. They stay a client — you just moved the revenue.",
    icon: RefreshCw
  },
  {
    title: "Waitlist Activation",
    description: "When someone cancels with 48-hour notice, automatically: notifies waitlist clients, offers newly available slot, fills the gap before revenue is lost. Turns cancellations into opportunities.",
    icon: Calendar
  },
  {
    title: "Pattern Recognition",
    description: "Tracks which appointment types have highest no-show rates, which days/times are riskiest, which clients have history of cancelling, seasonal patterns. Adjusts confirmation strategy automatically.",
    icon: BarChart3
  },
  {
    title: "Multi-Location Scaling",
    description: "Run 3 locations? 10? Each gets confirmed, tracked separately, analyzed for local patterns. One dashboard for all locations. No additional complexity.",
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
    quote: "First week we saved 8 appointments. That's $1,760. By week 4 we'd saved 34 appointments. $7,480 in revenue we would've completely lost. This is the easiest ROI calculation I've ever seen.",
    author: "Practice Manager",
    company: "Dental Clinic",
    metrics: "23% → 6% no-show rate in first month"
  },
  {
    quote: "Our front desk used to spend half the day calling patients to confirm. Now they focus on patients who are actually here. No-shows dropped from 23% to 7%. Our team is happier, our revenue is up.",
    author: "Operations Director",
    company: "Med Spa",
    metrics: "50% reduction in confirmation calls"
  },
  {
    quote: "We run 4 locations. No-show rates were 15%, 22%, 18%, and 25% across locations. Now they're all under 8%. That's $22k/month in saved revenue across all locations. Paid for itself in 36 hours.",
    author: "Owner",
    company: "Multi-Location Wellness",
    metrics: "4 locations, all under 8% no-show rate"
  },
  {
    quote: "I was skeptical about AI handling confirmations. Then I saw the numbers: 89% confirmation rate vs. 31% with automated texts. And clients love how easy it is to reschedule. Win-win.",
    author: "Clinic Director",
    company: "Physical Therapy",
    metrics: "89% confirmation rate"
  }
];

export default function Confirmation() {
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const handleOpenWidget = () => {
    setShowCalendarModal(true);
  };

  return (
    <>
      <SEO
        title="Stop Paying for Empty Chairs | AI Appointment Confirmation | Voiceable"
        description="Stop paying for empty chairs. AI appointment confirmation reduces no-shows by 60-80%, reschedules early enough to refill slots. Average savings: $4,800/month. See your ROI instantly."
        keywords="appointment confirmation, reduce no-shows, no-show prevention, appointment reminders, automated confirmation, scheduling automation, appointment management, booking confirmation, revenue protection, prevent no-shows"
        url="https://voice-agent-ai-4288599ce3fe.herokuapp.com/confirmation"
      />
      <div className="min-h-screen bg-background">
        <Navigation />

        <HeroSection
          badge="Voice agents that prove their ROI"
          title="Stop Paying for Empty Chairs"
          titleHighlight=""
          description="Every no-show is lost revenue you can't recover. Your AI confirmation agent reduces no-shows by 60-80%, reschedules early enough to refill slots, and tracks every dollar saved."
          primaryCta="Calculate Your No-Show Losses"
          secondaryCta="Book Demo"
          secondaryCtaLink="/sign-up"
          onPrimaryCtaClick={handleOpenWidget}
          icons={[
            { icon: CalendarCheck, label: "Confirm", color: "bg-emerald/20" },
            { icon: Bell, label: "Remind", color: "bg-primary/20" },
            { icon: RefreshCw, label: "Reschedule", color: "bg-accent/20" }
          ]}
        />

        {/* Stats Banner */}
        <section className="py-8 px-6 bg-card/30 -mt-12 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm md:text-base">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold">
                <TrendingDown className="w-4 h-4" />
                60-80% reduction in no-shows
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold">
                <RefreshCw className="w-4 h-4" />
                2-3x more early reschedules
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-semibold">
                <DollarSign className="w-4 h-4" />
                Average savings: $4,800/month
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Banner */}
        <section className="py-12 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-8 md:p-12 border border-border shadow-lg">
              <p className="text-sm text-muted-foreground mb-4 text-center">Trusted by appointment-based businesses who refuse to lose revenue</p>
              <blockquote className="text-xl md:text-2xl text-foreground italic text-center mb-6 leading-relaxed">
                "We went from 23% no-show rate to 6% in the first month. That's 34 appointments saved. At $220 per appointment, that's <span className="font-bold text-emerald-600 dark:text-emerald-400">$7,480 in recovered revenue</span>. The agent paid for itself in 2 days."
              </blockquote>
              <p className="text-center text-muted-foreground font-medium">— Practice Manager, Dental Clinic</p>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="py-24 px-6 bg-card/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-center leading-tight">
              How Much Are No-Shows Costing You?
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
              Right now, someone has an appointment on your calendar. They're not coming. And you won't know until it's too late to fill the slot.
            </p>
            
            <div className="bg-background/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-6 text-center">The brutal math of no-shows:</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {[
                    "Medical/Dental: 15-25%",
                    "Legal services: 10-20%",
                    "Home services: 12-18%",
                    "Med spas/Wellness: 20-30%",
                    "Professional services: 8-15%"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-card hover:shadow-md transition-all">
                      <span className="text-red-500 text-xl">•</span>
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-4 text-center">Let's say you have 200 appointments per month:</h3>
                <div className="space-y-3">
                  <p className="text-foreground text-center">
                    At <strong>20% no-show rate</strong> = <strong className="text-red-600 dark:text-red-400">40 empty appointments</strong>
                  </p>
                  <p className="text-foreground text-center">
                    At <strong>$150 per appointment</strong> = <strong className="text-red-600 dark:text-red-400">$6,000 lost revenue/month</strong>
                  </p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400 text-center mt-4">
                    That's $72,000 per year sitting in empty chairs
                  </p>
                </div>
              </div>
              
              <div className="border-t border-border pt-8">
                <h3 className="text-2xl font-bold text-foreground mb-6 text-center">But it's actually worse:</h3>
                <div className="space-y-4 mb-8">
                  {[
                    { icon: "❌", text: "Your team prepared — Pulled files, prepped materials, blocked time" },
                    { icon: "❌", text: "You held the slot — Turned away other clients for this time" },
                    { icon: "❌", text: "You can't recover it — That hour is gone forever" },
                    { icon: "❌", text: "Your staff gets paid anyway — Fixed costs with no revenue" },
                    { icon: "❌", text: "Late cancellations are worst — No time to fill the gap" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <span className="text-red-600 dark:text-red-400 font-bold text-lg">{item.icon}</span>
                      <span className="text-foreground">{item.text}</span>
                    </div>
                  ))}
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">The confirmation gap:</h3>
                  <p className="text-foreground mb-4">Your current process probably looks like this:</p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span className="text-foreground">Send automated email confirmation (50% never open it)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span className="text-foreground">Maybe send a text reminder (many ignore it)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span className="text-foreground">Hope they show up</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span className="text-foreground">Find out they're not coming at appointment time</span>
                    </li>
                  </ul>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                    <p className="font-semibold text-foreground mb-2">What actually works:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                        <span className="text-foreground">Personal confirmation 24-48 hours before</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                        <span className="text-foreground">Two-way conversation to surface conflicts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                        <span className="text-foreground">Easy rescheduling before it's too late</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                        <span className="text-foreground">Early detection means you can refill the slot</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <p className="text-xl font-bold text-center text-foreground">
                  The difference between 20% no-shows and 6% no-shows is <span className="text-emerald-600 dark:text-emerald-400">$4,200/month</span> in pure revenue recovery.
                </p>
              </div>
            </div>
          </div>
        </section>

        <TryItSection
          title="Experience it before setting anything up"
          description="Talk to a real AI agent and hear how it:"
          features={[
            "Confirms an upcoming appointment",
            "Handles rescheduling politely",
            "Answers common questions",
            "Updates the calendar automatically"
          ]}
          ctaText="Book Demo"
          onCtaClick={handleOpenWidget}
        />

        <StepsSection
          title="Confirm, Catch Conflicts, Refill Slots"
          steps={steps}
          footer="No prompts. No scripts. No manual work."
        />

        <NoShowPreventionDashboard />

        {/* Use Cases Section with Custom Layout */}
        <section className="py-24 px-6 bg-card/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center">
              Real Results from Real Businesses
            </h2>
            <p className="text-xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
              See how appointment-based businesses are protecting revenue from no-shows
            </p>
            
            <div className="space-y-12">
              {useCases.map((useCase, index) => (
                <div 
                  key={index} 
                  className="bg-background rounded-3xl p-8 md:p-12 shadow-xl border border-border"
                >
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <useCase.icon className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-primary uppercase tracking-wide">{useCase.category}</p>
                          <h3 className="text-2xl md:text-3xl font-bold text-foreground">{useCase.title}</h3>
                        </div>
                      </div>
                      <p className="text-lg text-muted-foreground mb-4">{useCase.description}</p>
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-6">{useCase.results}</p>
                      
                      <blockquote className="border-l-4 border-primary pl-4 italic text-foreground mb-6">
                        "{useCase.quote}"
                      </blockquote>
                      
                      <div className="bg-primary/5 rounded-xl p-4 space-y-2">
                        {Object.entries(useCase.metrics).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                            <span className="text-sm font-semibold text-foreground">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="relative hidden lg:flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl" />
                      <div className="relative p-12">
                        <useCase.icon className="w-32 h-32 text-primary/20" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FeaturesGrid
          title="Built for Revenue Protection, Not Just Reminders"
          features={revenueProtectionFeatures}
          footer={{
            line1: "This isn't a reminder bot.",
            line2: "It's a revenue protection system."
          }}
        />

        <NoShowCostCalculator />

        <ExperienceSection
          title="Better experience for clients"
          items={clientExperience}
        />

        <IntegrationsSection
          title="Connects with your systems"
          channels={integrationChannels}
        />

        <ComparisonTable
          title="AI Confirmation vs. Traditional Methods"
          column1Label="Manual Staff Calls"
          column2Label="Automated Reminders"
          column3Label="Voiceable AI"
          rows={[
            {
              feature: "Method",
              human: "Phone calls by staff",
              answeringService: "One-way text/email",
              voiceable: "Two-way AI conversation"
            },
            {
              feature: "Timing",
              human: "When staff has time",
              answeringService: "24hrs before (usually)",
              voiceable: "24-48hrs before (optimal)"
            },
            {
              feature: "Confirmation Rate",
              human: "60-70% reach rate",
              answeringService: "20-30% respond",
              voiceable: "85-90% confirmation"
            },
            {
              feature: "Detects Conflicts",
              human: "Sometimes",
              answeringService: "✗ Can't detect hesitation",
              voiceable: "✓ Consistently"
            },
            {
              feature: "Easy Rescheduling",
              human: "✓ If available",
              answeringService: "✗ Requires callback",
              voiceable: "✓ Immediate booking"
            },
            {
              feature: "Staff Time",
              human: "2-4 hrs/day",
              answeringService: "None (but ineffective)",
              voiceable: "Zero"
            },
            {
              feature: "No-Show Reduction",
              human: "Moderate (30-40%)",
              answeringService: "Minimal (5-10%)",
              voiceable: "High (60-80%)"
            },
            {
              feature: "Cost",
              human: "$600-1,200/month (staff time)",
              answeringService: "$50-200/month",
              voiceable: "$380/month"
            },
            {
              feature: "Scales With Growth",
              human: "✗ Need more staff",
              answeringService: "✓ Yes",
              voiceable: "✓ Unlimited"
            },
            {
              feature: "Tracks ROI",
              human: "✗ Manual tracking",
              answeringService: "✗ No data",
              voiceable: "✓ Real-time dashboard"
            }
          ]}
        />

        <ObjectionHandlingSection
          title="Common Questions About AI Confirmation"
          objections={[
            {
              question: "We already send automated reminders. Aren't those enough?",
              answer: "Automated reminders are one-way broadcasts. People ignore them because: they arrive at inconvenient times, there's no accountability (no one's waiting for a response), rescheduling requires extra effort (call back, find website, etc.), and they don't surface soft conflicts ('I think I can make it...'). The data shows: Automated reminders: 20-30% response rate, minimal no-show reduction. AI confirmation: 85-90% response rate, 60-80% no-show reduction. The difference? Two-way conversation with immediate rescheduling."
            },
            {
              question: "Won't clients find AI confirmations annoying?",
              answer: "Testing shows the opposite. Clients rate AI confirmations at 4.7/5 satisfaction because: it's faster than playing phone tag with your office, they can reschedule immediately without callbacks, the timing is convenient (AI respects their timezone), and they appreciate the professionalism and clarity. The clients who are 'annoyed' by confirmations? They're the same ones who would have no-showed. Better to know now than at appointment time."
            },
            {
              question: "What about clients who just don't respond?",
              answer: "Your AI agent handles this strategically: First attempt (48hrs before): Friendly confirmation request. No response → Second attempt (24hrs before): 'Just checking if we're still set for tomorrow'. Still no response: Flags as 'likely no-show' + notifies your team. Your staff can then: call high-value appointments personally, offer slot to waitlist proactively, be prepared for potential no-show. You go from 'surprised at appointment time' to 'informed and prepared.'"
            },
            {
              question: "We have a small team. Can we really handle all these confirmation calls?",
              answer: "That's exactly the point — you don't handle them. The AI does. Your current situation probably looks like: front desk spends 2-3 hours/day calling to confirm, they interrupt clients who are in appointments, they miss people, forget follow-ups, other work gets delayed. With AI confirmation: zero staff time on confirmation calls, front desk focuses on clients who are actually there, 100% consistency, zero forgotten follow-ups, your team gets more productive, not busier."
            }
          ]}
        />

        {/* Economics of Prevention Section */}
        <section className="py-24 px-6 bg-background">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center">
              The Economics of Prevention
            </h2>
            <p className="text-xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
              Why fixing no-shows beats almost every other investment
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border-2 border-red-200 dark:border-red-800">
                <h3 className="text-2xl font-bold text-foreground mb-6">Current State</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">30 no-shows per month</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">$6,000 lost revenue/month</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Annual impact:</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">$72,000 lost revenue/year</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Staff time wasted on prep:</p>
                    <p className="text-2xl font-bold text-foreground">~20 hours/month</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-8 border-2 border-emerald-200 dark:border-emerald-800">
                <h3 className="text-2xl font-bold text-foreground mb-6">With AI Confirmation (6% no-show rate)</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">9 no-shows per month (21 saved)</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$4,200/month saved</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Annual impact:</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$50,400</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Staff time recovered:</p>
                    <p className="text-2xl font-bold text-foreground">14 hours/month</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-primary/10 rounded-3xl p-8 md:p-12 border border-primary/20">
              <div className="max-w-3xl mx-auto space-y-4">
                <p className="text-center text-foreground">
                  <strong>Cost:</strong> $380/month ($4,560/year)
                </p>
                <p className="text-3xl font-bold text-center text-emerald-600 dark:text-emerald-400">
                  Net Benefit: $45,840/year
                </p>
                <p className="text-center text-foreground mt-6">
                  This beats: New marketing campaigns (uncertain ROI), Additional staff (increases fixed costs), Facility improvements (capital intensive), New equipment (depreciation)
                </p>
                <p className="text-xl font-bold text-center text-foreground mt-6">
                  Why? Because preventing no-shows: Recovers immediate revenue from existing capacity, Requires zero capital investment, Has guaranteed, measurable ROI, Improves every month automatically, Scales with your growth
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Timing Strategy Section */}
        <section className="py-24 px-6 bg-card/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center">
              Timing Strategy
            </h2>
            <p className="text-xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
              When to confirm for maximum impact
            </p>
            
            <div className="space-y-6">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-8 border-2 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-emerald-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">1</span>
                  <h3 className="text-2xl font-bold text-foreground">48 Hours Before (Optimal)</h3>
                </div>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                    <span className="text-foreground">Highest response rate (89%)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                    <span className="text-foreground">Time to refill cancelled slots</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                    <span className="text-foreground">Catches conflicts early</span>
                  </li>
                </ul>
                <p className="text-muted-foreground"><strong>Best for:</strong> all appointment types</p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">2</span>
                  <h3 className="text-2xl font-bold text-foreground">24 Hours Before (Backup)</h3>
                </div>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span className="text-foreground">Still good response rate (76%)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span className="text-foreground">Limited refill window</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span className="text-foreground">Better than nothing</span>
                  </li>
                </ul>
                <p className="text-muted-foreground"><strong>Best for:</strong> same-day appointments</p>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border-2 border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">3</span>
                  <h3 className="text-2xl font-bold text-foreground">2-4 Hours Before (Last Resort)</h3>
                </div>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400">•</span>
                    <span className="text-foreground">Low response rate (42%)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400">•</span>
                    <span className="text-foreground">Too late to refill</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400">•</span>
                    <span className="text-foreground">Only catches emergencies</span>
                  </li>
                </ul>
                <p className="text-muted-foreground"><strong>Better than:</strong> finding out at appointment time</p>
              </div>
            </div>
            
            <div className="mt-8 bg-primary/5 rounded-xl p-6 border border-primary/20">
              <p className="text-center text-foreground">
                <strong>The AI automatically:</strong> Confirms at optimal time for appointment type, Follows up if no response at 48hrs, Sends final reminder at 2hrs for high-value appointments, Adapts based on your patterns
              </p>
            </div>
          </div>
        </section>

        {/* Multi-Location Management Section */}
        <section className="py-24 px-6 bg-background">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center">
              Multi-Location Management
            </h2>
            <p className="text-xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
              Scale without complexity
            </p>
            
            <div className="bg-card rounded-3xl p-8 md:p-12 shadow-xl border border-border space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Centralized Dashboard:</h3>
                <p className="text-foreground mb-4">View all locations in one place:</p>
                <ul className="space-y-2 mb-6">
                  {[
                    "Total no-show rate across locations",
                    "Revenue saved per location",
                    "Compare location performance",
                    "Identify problem locations"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
                <p className="font-semibold text-foreground mb-2">Location-Specific Insights:</p>
                <p className="text-foreground italic">"Location 3 has 18% no-show rate vs. 6% average. Recommend reviewing booking process."</p>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Unified Agent, Local Awareness:</h3>
                <ul className="space-y-2 mb-6">
                  {[
                    "One AI handles all locations",
                    "Mentions correct location in confirmation",
                    "Books at appropriate location",
                    "Syncs with each location's calendar"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Franchise-Ready:</h3>
                <ul className="space-y-2">
                  {[
                    "Same consistency across locations",
                    "Owner-level reporting",
                    "Location manager access",
                    "Brand voice maintained"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <TestimonialsSection 
          testimonials={testimonials}
          title="Trusted by Appointment-Based Businesses Who Refuse to Lose Revenue"
        />

        {/* Final CTA Section */}
        <section className="py-24 px-6 bg-card/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-center">
              Stop Losing Money to No-Shows
            </h2>
            
            <div className="bg-background rounded-3xl p-8 md:p-12 shadow-2xl border border-border mt-12">
              <div className="mb-8">
                <p className="text-center text-lg text-muted-foreground mb-6">
                  Start saving revenue today: <strong>14-day free trial</strong> · No credit card · Cancel anytime
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {[
                    "Set up in 15 minutes",
                    "Reduce no-shows immediately",
                    "ROI dashboard shows savings",
                    "Average reduction: 60-80%"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-card">
                      <span className="text-emerald-500 text-xl">✓</span>
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-border pt-8 mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-6 text-center">What you get:</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    "Automated appointment confirmation",
                    "Smart rescheduling handling",
                    "Two-way conversation capability",
                    "Calendar sync and updates",
                    "No-show rate tracking",
                    "Revenue saved analytics"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 mb-8">
                <p className="text-center text-2xl font-bold text-foreground mb-2">
                  $380/month
                </p>
                <p className="text-center text-muted-foreground">
                  Average monthly savings: $4,200-8,400
                </p>
              </div>
              
              <p className="text-xl font-bold text-center text-foreground mb-8">
                The math is simple: Save $4,200/month for $380/month cost = <span className="text-emerald-600 dark:text-emerald-400">$3,820 net gain</span>
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8" asChild>
                  <Link to="/sign-up">
                    Start Free Trial
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8" onClick={handleOpenWidget}>
                  Calculate Your Savings
                </Button>
              </div>
            </div>
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