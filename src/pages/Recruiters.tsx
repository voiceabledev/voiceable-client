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
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { loadAndOpenWidget } from "@/utils/widgetLoader";

const useCases = [
  {
    title: "Automated Phone Screens",
    description: "Screen every candidate — without scheduling headaches.",
    features: [
      "Calls candidates automatically",
      "Asks role-specific screening questions",
      "Captures structured answers",
      "Flags qualified candidates for review"
    ],
    greatFor: "High-volume roles, early-stage screening, staffing agencies",
    icon: Phone
  },
  {
    title: "Candidate Follow-Ups",
    description: "Never lose candidates due to slow response times.",
    features: [
      "Follows up after applications",
      "Answers common questions about the role",
      "Keeps candidates engaged",
      "Escalates interested or qualified candidates"
    ],
    greatFor: "Inbound applications, talent pools, evergreen roles",
    icon: MessageSquare
  },
  {
    title: "Interview Scheduling",
    description: "Remove back-and-forth emails completely.",
    features: [
      "Coordinates availability",
      "Books interviews automatically",
      "Sends confirmations and reminders",
      "Handles reschedules"
    ],
    greatFor: "Internal recruiting teams and agencies",
    icon: Calendar
  },
  {
    title: "Re-engage Past Candidates",
    description: "Turn your ATS into an active pipeline.",
    features: [
      "Calls candidates from previous processes",
      "Checks current availability and interest",
      "Surfaces warm talent for new roles"
    ],
    greatFor: "Agencies and companies with large candidate databases",
    icon: RefreshCw
  }
];

const steps = [
  {
    number: "1",
    title: "Describe the role",
    items: [
      "What role you're hiring for",
      "What questions matter",
      "What makes a candidate qualified"
    ]
  },
  {
    number: "2",
    title: "Set hiring rules",
    items: [
      "Must-have requirements",
      "Disqualifiers",
      "When to escalate to a recruiter"
    ]
  },
  {
    number: "3",
    title: "Connect your tools",
    items: [
      "ATS",
      "Calendar",
      "Phone numbers",
      "Email or SMS"
    ]
  },
  {
    number: "4",
    title: "Start screening",
    items: [
      "Your agent starts calling candidates and delivering structured insights immediately"
    ]
  }
];

const workflowFeatures = [
  {
    title: "Consistent screening",
    description: "Every candidate gets the same experience",
    icon: Target
  },
  {
    title: "Structured data",
    description: "Answers delivered in recruiter-friendly summaries",
    icon: Shield
  },
  {
    title: "Candidate-safe",
    description: "Avoids inappropriate or misleading responses",
    icon: UserCheck
  },
  {
    title: "Scales instantly",
    description: "Screen 10 or 10,000 candidates",
    icon: Zap
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
    quote: "We screen candidates continuously now. No more waiting days to schedule phone screens.",
    author: "Talent Lead",
    company: "Staffing Agency"
  },
  {
    quote: "The quality of candidates reaching interviews improved immediately.",
    author: "Head of People",
    company: "SaaS Company"
  }
];


const widgetConfig = () => ({
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

export default function Recruiters() {
  const handleOpenWidget = () => {
    loadAndOpenWidget(widgetConfig());
  };

  return (
    <>
      <SEO
        title="AI Recruiting Agents That Screen Candidates for You | Voiceable"
        description="Automate phone screens, candidate follow-ups, and scheduling with AI agents you create by describing the role — not writing prompts. Built for recruiters, not engineers."
        keywords="AI recruiting, recruiting agents, candidate screening, automated phone screens, recruiting automation, ATS integration, talent acquisition, staffing automation"
        url="https://voice-agent-ai-4288599ce3fe.herokuapp.com/recruiters"
      />
      <div className="min-h-screen bg-background">
        <Navigation />

        {/* Hero Section */}
        <section className="pt-32 pb-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 mb-6">
              <span className="text-sm font-semibold text-primary">✨ No scripts, no prompt engineering, no technical setup</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-8 leading-tight tracking-tight">
              AI Recruiting Agents<br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">That Screen Candidates for You</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Automate phone screens, candidate follow-ups, and scheduling with AI agents you create by describing the role — not writing prompts.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Button
                size="lg"
                onClick={handleOpenWidget}
                className="bg-emerald-500 hover:bg-emerald-600 hover:scale-105 text-white font-semibold px-10 py-7 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Phone className="w-5 h-5 mr-2" />
                Talk to a recruiting agent
              </Button>
              <Button size="lg" variant="outline" className="font-semibold px-10 py-7 text-lg rounded-full border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200" asChild>
                <Link to="/sign-up">
                  Create your agent <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
            
            {/* Recruiting visual */}
            <div className="relative h-64 md:h-80 flex items-center justify-center bg-gradient-to-b from-muted/50 to-transparent rounded-3xl backdrop-blur-sm">
              <div className="grid grid-cols-3 gap-8 max-w-2xl">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                    <Phone className="w-10 h-10 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Screen</span>
                </div>
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
                    <UserCheck className="w-10 h-10 text-accent" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Qualify</span>
                </div>
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Calendar className="w-10 h-10 text-emerald-500" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Schedule</span>
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
                <div className="text-center p-6 rounded-xl bg-card hover:shadow-md transition-shadow">
                  <p className="text-lg text-foreground font-semibold">No scripts.</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-card hover:shadow-md transition-shadow">
                  <p className="text-lg text-foreground font-semibold">No prompt engineering.</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-card hover:shadow-md transition-shadow">
                  <p className="text-lg text-foreground font-semibold">No technical setup.</p>
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
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <span className="text-lg text-foreground">Introduces itself like a recruiter</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <span className="text-lg text-foreground">Asks structured screening questions</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <span className="text-lg text-foreground">Responds naturally to candidates</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <span className="text-lg text-foreground">Knows when to escalate to a human</span>
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
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center">
              What recruiters use AI agents for
            </h2>
            
            <div className="space-y-16">
              {useCases.map((useCase, index) => (
                <div key={index} className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg">
                  <div className="grid lg:grid-cols-2 gap-12 items-start">
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <useCase.icon className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="text-3xl font-bold text-foreground">{useCase.title}</h3>
                      </div>
                      <p className="text-xl text-muted-foreground mb-6">{useCase.description}</p>
                      
                      <ul className="space-y-3 mb-6">
                        {useCase.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">Great for:</span> {useCase.greatFor}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
                      <useCase.icon className="w-32 h-32 text-primary/30" />
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
              How it works
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {steps.map((step, index) => (
                <div key={index} className="bg-background rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-lg font-bold mb-6">
                    {step.number}
                  </span>
                  
                  <h3 className="text-xl font-bold text-foreground mb-4">{step.title}</h3>
                  
                  <ul className="space-y-2">
                    {step.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-muted-foreground text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Designed for hiring workflows Section */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">
              Designed for hiring workflows
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
              {workflowFeatures.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12 space-y-2">
              <p className="text-lg text-foreground font-medium">
                This isn't a chatbot.
              </p>
              <p className="text-xl text-foreground font-bold">
                It's a recruiting system.
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
                  <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-card">
                    <Check className="w-6 h-6 text-primary flex-shrink-0" />
                    <span className="text-lg text-foreground">{item}</span>
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
                <li key={index} className="flex items-center gap-3 p-4 rounded-xl bg-card/50 backdrop-blur-sm">
                  <Check className="w-6 h-6 text-primary flex-shrink-0" />
                  <span className="text-lg text-foreground">{channel}</span>
                </li>
              ))}
            </ul>
            
            <p className="text-center text-lg text-muted-foreground">
              The agent adapts to your hiring process — not the other way around.
            </p>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 px-6 bg-card">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center">
              Trusted by teams hiring at scale
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-background rounded-2xl p-8 shadow-lg">
                  <blockquote className="text-lg text-foreground italic mb-6">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20" />
                    <div>
                      <p className="font-medium text-foreground">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Start with a conversation
            </h2>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              The best way to understand it is to experience it.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={handleOpenWidget}
                className="bg-emerald-500 hover:bg-emerald-600 hover:scale-105 text-white font-semibold px-10 py-7 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Phone className="w-5 h-5 mr-2" />
                Talk to a recruiting agent
              </Button>
              <Button size="lg" variant="outline" className="font-semibold px-10 py-7 text-lg rounded-full border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200" asChild>
                <Link to="/sign-up">
                  Create your recruiting agent <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
