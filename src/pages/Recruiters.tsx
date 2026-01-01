import { Button } from "@/components/ui/button";
import { 
  Phone, 
  ArrowRight,
  Shield,
  Clock,
  Check,
  Calendar,
  MessageSquare,
  Zap,
  Users,
  Sparkles,
  Linkedin,
  Github,
  Twitter,
  Target,
  UserCheck,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  BarChart3,
  DollarSign
} from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { openWidgetWithConfig } from "@/utils/widgetHelpers";
import {
  ObjectionHandlingSection,
  TestimonialsSection,
  RecruiterDashboard,
} from "@/components/landing";

const useCases = [
  {
    title: "Staffing & Recruiting Agencies",
    category: "SCALE SCREENING",
    description: "Screen 10× more candidates without more recruiters",
    results: "Same-day screening · 3× more screened candidates · Higher placement velocity",
    quote: "We used to take 3-5 days to screen candidates. Now it's same-day. Our recruiters focus on placements, not scheduling. Client trust improved immediately.",
    metrics: {
      screeningVolume: "3× more screened candidates",
      placementVelocity: "Higher placement velocity",
      clientTrust: "Better client trust",
      timeSaved: "25+ recruiter hours/month"
    },
    icon: Phone
  },
  {
    title: "High-Volume Hiring",
    category: "24/7 SCREENING",
    description: "Never miss qualified candidates again",
    results: "24/7 screening across time zones · No scheduling bottlenecks · Predictable candidate experience",
    quote: "Customer support roles get 200+ applicants. We couldn't screen them all fast enough. Now every candidate gets contacted within 2 hours. Completion rates jumped 60%.",
    metrics: {
      perfectFor: "Customer support, Sales, Operations, Frontline roles",
      responseTime: "Contact within 2 hours",
      completionRate: "60% increase in completion rates",
      timezoneCoverage: "24/7 across all time zones"
    },
    icon: MessageSquare
  },
  {
    title: "Internal Recruiting Teams",
    category: "RECRUITER TIME PROTECTION",
    description: "Protect recruiter time for real conversations",
    results: "Fewer low-signal screens · Higher quality interviews · Shorter time-to-hire",
    quote: "Recruiters finally spend time interviewing — not chasing candidates. Interview quality improved across the board because we're only talking to pre-qualified candidates.",
    metrics: {
      recruiterFocus: "Focus on interviews, not logistics",
      interviewQuality: "Higher quality interviews",
      timeToHire: "Shorter time-to-hire",
      candidateQuality: "Only pre-qualified candidates reach interviews"
    },
    icon: Calendar
  },
  {
    title: "Re-Engaging Past Candidates",
    category: "ATS MINING",
    description: "Turn your ATS into an active talent pool",
    results: "No sourcing required · Warm talent surfaced instantly · Active pipeline from existing database",
    quote: "We had 2,400 candidates in our ATS from past roles. AI called them, checked interest, and surfaced 180 that were ready now. That's a full pipeline without any sourcing.",
    metrics: {
      atsMining: "2,400 candidates → 180 ready now",
      sourcingCost: "Zero sourcing required",
      pipelineValue: "Full pipeline from existing database",
      revivalRate: "7.5% revival rate on past candidates"
    },
    icon: RefreshCw
  }
];

const steps = [
  {
    number: "1",
    title: "Instant Phone Screening",
    items: [
      "As soon as a candidate enters your pipeline, the AI agent reaches out",
      "Introduces itself like a recruiter",
      "Explains the role clearly",
      "Asks structured, role-specific questions",
      "Adapts naturally to candidate responses",
      "No scripts. No prompts. Just conversation."
    ]
  },
  {
    number: "2",
    title: "Qualification Logic",
    items: [
      "The agent evaluates answers against your criteria",
      "Must-have requirements",
      "Disqualifiers",
      "Nice-to-haves",
      "Signals of seniority or readiness",
      "Qualified candidates are flagged. Unqualified ones are handled respectfully."
    ]
  },
  {
    number: "3",
    title: "Smart Escalation",
    items: [
      "When the agent detects:",
      "Strong alignment",
      "Clarifying questions",
      "High intent",
      "It escalates to a human recruiter or books the next interview immediately",
      "No delays. No handoffs lost."
    ]
  },
  {
    number: "4",
    title: "Scheduling Without Back-and-Forth",
    items: [
      "The agent:",
      "Checks calendar availability",
      "Books interviews instantly",
      "Sends confirmations and reminders",
      "Handles reschedules automatically",
      "Candidates stay engaged because everything happens in one flow."
    ]
  }
];

const recruiterFeatures = [
  {
    title: "No Scripts Required",
    description: "Describe the role. The agent handles the conversation.",
    icon: Target
  },
  {
    title: "Consistent Screening",
    description: "Every candidate gets the same structured experience.",
    icon: Shield
  },
  {
    title: "Candidate-Safe by Design",
    description: "Clear boundaries. Transparent next steps. Respectful tone.",
    icon: UserCheck
  },
  {
    title: "Scales Instantly",
    description: "Screen 10 or 10,000 candidates — no extra setup.",
    icon: Zap
  },
  {
    title: "Multilingual & Global",
    description: "Hire across regions without timezone friction.",
    icon: Users
  }
];

const candidateExperience = [
  "Clear communication",
  "Respectful tone",
  "Transparent next steps",
  "Fast responses"
];

const integrationChannels = [
  "Inbound and outbound calls",
  "ATS-driven workflows",
  "High-volume or niche roles",
  "Global and multilingual hiring"
];

const testimonials = [
  {
    quote: "We stopped losing candidates to slow follow-ups. Voiceable screens faster than any human team could — and the quality is better.",
    author: "Talent Lead",
    company: "Staffing Agency",
    metrics: "3-5 days → same-day screening"
  },
  {
    quote: "This didn't replace recruiters. It made them effective again.",
    author: "Head of People",
    company: "SaaS Company",
    metrics: "25+ recruiter hours saved/month"
  },
  {
    quote: "Completion rates jumped immediately. Candidates actually finish the screening because it's fast and conversational.",
    author: "Recruiting Manager",
    company: "Tech Startup",
    metrics: "60% increase in completion rates"
  },
  {
    quote: "We went from screening 40 candidates/month to 180. Same team. Same quality. Just faster.",
    author: "Director of Talent",
    company: "Enterprise SaaS",
    metrics: "4.5× more candidates screened"
  }
];


export default function Recruiters() {
  const handleOpenWidget = () => {
    openWidgetWithConfig();
  };

  return (
    <>
      <SEO
        title="Stop Losing Great Candidates | AI Recruiting Agents | Voiceable"
        description="Automate candidate screening, follow-ups, and interview scheduling with AI recruiting agents. No scripts, no prompts, no technical setup. Hire faster with Voiceable."
        keywords="AI recruiting, recruiting agents, candidate screening, automated phone screens, recruiting automation, ATS integration, talent acquisition, staffing automation, candidate loss prevention, screening automation, recruiter time savings"
        url="https://voice-agent-ai-4288599ce3fe.herokuapp.com/recruiters"
      />
      <div className="min-h-screen bg-background">
        <Navigation />

        {/* Hero Section */}
        <section className="pt-32 pb-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-violet/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in group">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-sm font-semibold text-primary">✨ No scripts, no prompt engineering, no technical setup</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Stop Losing Great Candidates<br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">Before You Ever Talk to Them</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Slow screening, missed calls, and scheduling delays silently kill your pipeline. Voiceable's AI recruiting agents screen candidates instantly, follow up automatically, and book interviews — so qualified talent never slips away.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Button
                size="lg"
                onClick={handleOpenWidget}
                className="group bg-emerald-500 hover:bg-emerald-600 hover:scale-105 text-white font-semibold px-10 py-7 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Phone className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                Talk to a Recruiting Agent
              </Button>
              <Button size="lg" variant="outline" className="group font-semibold px-10 py-7 text-lg rounded-full border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300" asChild>
                <Link to="/sign-up">
                  Create Your Agent <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            {/* Stats Banner */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm md:text-base mb-20">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold hover:scale-105 transition-transform duration-300 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <TrendingUp className="w-4 h-4" />
                60-80% faster screening cycles
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold hover:scale-105 transition-transform duration-300 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <Users className="w-4 h-4" />
                2-3× more completed phone screens
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-semibold hover:scale-105 transition-transform duration-300 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <Clock className="w-4 h-4" />
                Average time saved: 25+ recruiter hours/month
              </div>
            </div>
            
            {/* Recruiting visual */}
            <div className="relative h-64 md:h-80 flex items-center justify-center bg-gradient-to-b from-muted/50 to-transparent rounded-3xl backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <div className="grid grid-cols-3 gap-8 max-w-2xl">
                <div className="flex flex-col items-center space-y-3 group">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/30 transition-all duration-300">
                    <Phone className="w-10 h-10 text-primary group-hover:animate-pulse" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Screen</span>
                </div>
                <div className="flex flex-col items-center space-y-3 group">
                  <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-accent/30 transition-all duration-300" style={{ transitionDelay: '0.1s' }}>
                    <UserCheck className="w-10 h-10 text-accent group-hover:animate-pulse" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Qualify</span>
                </div>
                <div className="flex flex-col items-center space-y-3 group">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500/30 transition-all duration-300" style={{ transitionDelay: '0.2s' }}>
                    <Calendar className="w-10 h-10 text-emerald-500 group-hover:animate-pulse" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Schedule</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Banner */}
        <section className="py-12 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-8 md:p-12 border border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/20">
              <p className="text-sm text-muted-foreground mb-4 text-center">Trusted by teams hiring at scale</p>
              <blockquote className="text-xl md:text-2xl text-foreground italic text-center mb-6 leading-relaxed">
                "We went from screening candidates in 3-5 days to same-day. Completion rates jumped immediately, and interview quality improved across the board."
              </blockquote>
              <p className="text-center text-muted-foreground font-medium">— Head of Talent, SaaS Company</p>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="py-24 px-6 bg-card/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-center leading-tight">
              How Many Good Candidates<br />Are You Losing Right Now?
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
              Someone applied to one of your roles this morning. They were interested. They were qualified. They were available. And by the time your team gets to them — they're gone.
            </p>
            
            <div className="bg-background/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-6 text-center">The brutal reality of recruiting delays:</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  {[
                    "Candidates expect contact within 24 hours",
                    "After 48 hours, response rates drop by 50%",
                    "After 72 hours, most top candidates are already interviewing elsewhere"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-card hover:shadow-md hover:scale-[1.02] transition-all duration-300 group">
                      <span className="text-red-500 text-xl group-hover:scale-125 transition-transform">•</span>
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-4 text-center">Let's say you receive 300 applications/month:</h3>
                <div className="space-y-3">
                  <p className="text-foreground text-center">
                    <strong>40% never get screened</strong> due to time constraints
                  </p>
                  <p className="text-foreground text-center">
                    <strong>30% drop off</strong> waiting for follow-up
                  </p>
                  <p className="text-foreground text-center">
                    <strong>20% no-show</strong> phone screens
                  </p>
                  <p className="text-foreground text-center">
                    Only <strong className="text-red-600 dark:text-red-400">10-15% reach hiring managers</strong>
                  </p>
                  <p className="text-xl font-bold text-center text-foreground mt-4">
                    That's not a sourcing problem. That's a screening bottleneck.
                  </p>
                </div>
              </div>
              
              <div className="border-t border-border pt-8">
                <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Why traditional screening breaks down</h3>
                <p className="text-foreground mb-4 text-center">Your current process probably looks like this:</p>
                <div className="space-y-3 mb-8">
                  {[
                    "Recruiter reviews resumes in batches",
                    "Emails candidates to schedule calls",
                    "Misses calls due to time zones or availability",
                    "Plays calendar ping-pong",
                    "Spends hours on screens that go nowhere"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-card hover:bg-card/80 transition-colors duration-300 group" style={{ animationDelay: `${index * 0.1}s` }}>
                      <span className="text-muted-foreground text-xl group-hover:text-foreground transition-colors">•</span>
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800 mb-6">
                  <p className="font-semibold text-foreground mb-3">The result:</p>
                  <div className="space-y-2">
                    {[
                      "Great candidates disengage",
                      "Recruiters burn time on logistics",
                      "Hiring managers see inconsistent quality",
                      "Time-to-hire stretches unnecessarily"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-red-600 dark:text-red-400">❌</span>
                        <span className="text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                  <p className="font-semibold text-foreground mb-3">What actually works:</p>
                  <ul className="space-y-2">
                    {[
                      "Immediate outreach after application",
                      "Structured, consistent screening",
                      "Two-way conversation (not forms)",
                      "Instant qualification or escalation",
                      "Scheduling while the candidate is engaged"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-center text-foreground font-bold mt-4">
                    Speed + consistency = better hires.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Built for recruiters Section */}
        <section className="py-24 px-6 bg-card/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-center leading-tight">
              Built for recruiters,<br />not engineers
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-16 text-center max-w-3xl mx-auto">
              Recruiting shouldn't be limited by calendars, time zones, or manual screening calls.
            </p>
            
            <div className="bg-background/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg space-y-8">
              <p className="text-xl font-medium text-foreground text-center">
                Our AI recruiting agents handle the repetitive parts of hiring — so your team can focus on interviews, relationships, and decisions.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 pt-6">
                <div className="text-center p-6 rounded-xl bg-card hover:shadow-md hover:scale-105 hover:border-primary/30 border border-transparent transition-all duration-300 group">
                  <p className="text-lg text-foreground font-semibold group-hover:text-primary transition-colors">No scripts.</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-card hover:shadow-md hover:scale-105 hover:border-primary/30 border border-transparent transition-all duration-300 group">
                  <p className="text-lg text-foreground font-semibold group-hover:text-primary transition-colors">No prompt engineering.</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-card hover:shadow-md hover:scale-105 hover:border-primary/30 border border-transparent transition-all duration-300 group">
                  <p className="text-lg text-foreground font-semibold group-hover:text-primary transition-colors">No technical setup.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Try a real recruiting agent Section */}
        <section className="py-32 px-6 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-12 leading-tight">
              Try a real recruiting agent
            </h2>
            
            <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 mb-12 shadow-xl">
              <p className="text-xl font-medium text-foreground mb-8">Talk to an AI agent that:</p>
              
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors duration-300 group">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1 group-hover:scale-125 transition-transform" />
                  <span className="text-lg text-foreground group-hover:text-primary transition-colors">Introduces itself like a recruiter</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors duration-300 group">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1 group-hover:scale-125 transition-transform" />
                  <span className="text-lg text-foreground group-hover:text-primary transition-colors">Asks structured screening questions</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors duration-300 group">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1 group-hover:scale-125 transition-transform" />
                  <span className="text-lg text-foreground group-hover:text-primary transition-colors">Responds naturally to candidates</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors duration-300 group">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1 group-hover:scale-125 transition-transform" />
                  <span className="text-lg text-foreground group-hover:text-primary transition-colors">Knows when to escalate to a human</span>
                </div>
              </div>
              
              <p className="text-muted-foreground mt-8">No signup required.</p>
            </div>
            
            <Button
              size="lg"
              onClick={handleOpenWidget}
              className="bg-emerald-500 hover:bg-emerald-600 hover:scale-105 text-white font-semibold px-10 py-7 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Phone className="w-5 h-5 mr-2" />
              Talk to a recruiting agent
            </Button>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-24 px-6 bg-card/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center">
              Real Results from Real Recruiting Teams
            </h2>
            <p className="text-xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
              See how teams are scaling screening and protecting recruiter time
            </p>
            
            <div className="space-y-12">
              {useCases.map((useCase, index) => (
                <div 
                  key={index} 
                  className="bg-background rounded-3xl p-8 md:p-12 shadow-xl border border-border hover:shadow-2xl hover:border-primary/30 transition-all duration-500 group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          <useCase.icon className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-primary uppercase tracking-wide">{useCase.category}</p>
                          <h3 className="text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors">{useCase.title}</h3>
                        </div>
                      </div>
                      <p className="text-lg text-muted-foreground mb-4">{useCase.description}</p>
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-6">{useCase.results}</p>
                      
                      <blockquote className="border-l-4 border-primary pl-4 italic text-foreground mb-6 group-hover:border-primary/80 transition-colors">
                        "{useCase.quote}"
                      </blockquote>
                      
                      <div className="bg-primary/5 rounded-xl p-4 space-y-2 group-hover:bg-primary/10 transition-colors">
                        {Object.entries(useCase.metrics).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center hover:bg-background/50 rounded px-2 py-1 transition-colors">
                            <span className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                            <span className="text-sm font-semibold text-foreground">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="relative hidden lg:flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl group-hover:from-primary/10 group-hover:to-accent/10 transition-all duration-300" />
                      <div className="relative p-12">
                        <useCase.icon className="w-32 h-32 text-primary/20 group-hover:text-primary/30 group-hover:scale-110 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works Section */}
        <section className="py-24 px-6 bg-card">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center">
              Screen, Qualify, Schedule — Automatically
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {steps.map((step, index) => (
                <div key={index} className="bg-background rounded-2xl p-8 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group border border-transparent hover:border-primary/20">
                  <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-lg font-bold mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    {step.number}
                  </span>
                  
                  <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">{step.title}</h3>
                  
                  <ul className="space-y-2">
                    {step.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 group/item">
                        <span className="text-primary mt-1 group-hover/item:scale-125 transition-transform">•</span>
                        <span className="text-muted-foreground text-sm group-hover/item:text-foreground transition-colors">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <RecruiterDashboard />

        {/* Designed for hiring workflows Section */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">
              Designed for hiring workflows
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mt-12">
              {recruiterFeatures.map((feature, index) => (
                <div key={index} className="text-center group hover:scale-105 transition-all duration-300">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="w-8 h-8 text-primary group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors">{feature.description}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12 space-y-2">
              <p className="text-lg text-foreground font-medium">
                Built for Recruiters, Not Engineers
              </p>
            </div>
          </div>
        </section>

        {/* Candidate experience Section */}
        <section className="py-24 px-6 bg-card">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8 text-center">
              Candidate experience comes first
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 text-center">
              Candidates don't feel like they're "talking to AI."
            </p>
            
            <div className="bg-background/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg">
              <p className="text-lg font-medium text-foreground mb-6 text-center">They experience:</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {candidateExperience.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-card hover:bg-card/80 hover:scale-[1.02] transition-all duration-300 group">
                    <Check className="w-6 h-6 text-primary flex-shrink-0 group-hover:scale-125 transition-transform" />
                    <span className="text-lg text-foreground group-hover:text-primary transition-colors">{item}</span>
                  </div>
                ))}
              </div>
              
              <p className="text-center text-lg text-foreground font-medium mt-8">
                Better experience → better completion → better hiring outcomes.
              </p>
            </div>
          </div>
        </section>

        {/* Works with your existing process Section */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8 text-center">
              Works with your existing process
            </h2>
            
            <ul className="space-y-4 mb-8">
              {integrationChannels.map((channel, index) => (
                <li key={index} className="flex items-center gap-3 p-4 rounded-xl bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:scale-[1.02] transition-all duration-300 group">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 group-hover:scale-125 transition-transform" />
                  <span className="text-lg text-foreground group-hover:text-primary transition-colors">{channel}</span>
                </li>
              ))}
            </ul>
            
            <p className="text-center text-lg text-muted-foreground">
              The agent adapts to your hiring process — not the other way around.
            </p>
          </div>
        </section>

        <ObjectionHandlingSection
          title="Common Questions About AI Recruiting"
          objections={[
            {
              question: "Will candidates know it's AI?",
              answer: "They don't feel like they're talking to AI — they feel responded to. Candidates report: faster responses, clearer expectations, less friction than scheduling calls. Better experience → higher completion → better hires."
            },
            {
              question: "What about complex roles?",
              answer: "You define: what matters, what disqualifies, when to escalate. The agent follows your rules and brings humans in when it should."
            },
            {
              question: "Will this replace recruiters?",
              answer: "No. It removes the worst parts of the job. Recruiters: stop chasing candidates, stop repeating the same screens, focus on interviews, relationships, decisions."
            }
          ]}
        />

        {/* Economics of Automation Section */}
        <section className="py-24 px-6 bg-background">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center">
              The Economics of Automation
            </h2>
            <p className="text-xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
              Why Screening Automation Beats Hiring More Recruiters
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border-2 border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-300">
                <h3 className="text-2xl font-bold text-foreground mb-6">Current</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">300 applicants/month</p>
                    <p className="text-2xl font-bold text-foreground">100 screens completed manually</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">20 min per phone screen</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">33 recruiter hours/month</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Issues:</p>
                    <ul className="space-y-1 mt-2">
                      <li className="text-foreground">• Delayed outreach</li>
                      <li className="text-foreground">• Candidate drop-off</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-8 border-2 border-emerald-200 dark:border-emerald-800 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                <h3 className="text-2xl font-bold text-foreground mb-6">With Voiceable</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">300 applicants/month</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">180+ screens completed</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Benefits:</p>
                    <ul className="space-y-1 mt-2">
                      <li className="text-foreground">• Same-day outreach</li>
                      <li className="text-foreground">• Recruiter time saved: 25+ hours/month</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cost:</p>
                    <p className="text-xl font-bold text-foreground">Less than a part-time recruiter</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Outcome:</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Faster hires, better candidates, happier team</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <TestimonialsSection 
          testimonials={testimonials}
          title="Trusted by Teams Hiring at Scale"
        />

        {/* CTA Section */}
        <section className="py-24 px-6 bg-card/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-center">
              Start Screening Without the Bottleneck
            </h2>
            
            <div className="bg-background rounded-3xl p-8 md:p-12 shadow-2xl border border-border mt-12 hover:shadow-3xl transition-all duration-300">
              <p className="text-center text-lg text-muted-foreground mb-8">
                <strong>14-day free trial</strong> · No credit card required
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {[
                  "Create your recruiting agent",
                  "Screen real candidates",
                  "See structured summaries instantly"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-card hover:bg-card/80 hover:scale-[1.02] transition-all duration-300 group">
                    <span className="text-emerald-500 text-xl group-hover:scale-125 transition-transform">✓</span>
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={handleOpenWidget}
                  className="group bg-emerald-500 hover:bg-emerald-600 hover:scale-105 text-white font-semibold px-10 py-7 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Phone className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                  Talk to a Recruiting Agent
                </Button>
                <Button size="lg" variant="outline" className="group font-semibold px-10 py-7 text-lg rounded-full border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300" asChild>
                  <Link to="/sign-up">
                    Create Your Agent <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
