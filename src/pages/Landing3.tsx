import { useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/landing-page/Header";
import HeroSection from "@/components/landing-page/HeroSection";
import AssistantSection from "@/components/landing-page/AssistantSection";
import ResponsesSection from "@/components/landing-page/ResponsesSection";
import FeaturesSection from "@/components/landing-page/FeaturesSection";
import LiveCallsSection from "@/components/landing-page/LiveCallsSection";
import HumanLedSection from "@/components/landing-page/HumanLedSection";
import SeamlessSetupSection from "@/components/landing-page/SeamlessSetupSection";
import SolutionsSection from "@/components/landing-page/SolutionsSection";
import CTASection from "@/components/landing-page/CTASection";
import Footer from "@/components/landing-page/Footer";
import OperatorInterfaceSection from "@/components/landing-page/OperatorInterfaceSection";
import { SEO } from "@/components/SEO";
import { 
  MessageCircle, 
  Calendar, 
  UserPlus, 
  PhoneForwarded, 
  RefreshCw, 
  Users, 
  Clock, 
  Globe, 
  ArrowRightLeft, 
  FileText, 
  CheckCircle2, 
  Brain, 
  Briefcase, 
  UserCheck, 
  TrendingUp, 
  BarChart3,
  Building2,
  Stethoscope,
  Home,
  Truck,
  Code,
  Phone,
  Sparkles,
  ArrowRight,
  Heart,
  Play,
  Pause,
  AlertCircle,
  Meh,
  Smile,
  RotateCcw,
  Layers,
  Cloud,
  CloudLightning,
  Mail,
  Infinity as InfinityIcon,
  ShieldCheck,
  Mic,
  Video,
  Languages,
  Zap,
  ShoppingBag,
  Plane,
  Factory,
  UtensilsCrossed
} from "lucide-react";

const Landing3 = () => {
  const [activeFeature, setActiveFeature] = useState("assistant");
  const location = useLocation();
  const baseUrl = "https://voice-agent-ai-4288599ce3fe.herokuapp.com";
  const currentUrl = `${baseUrl}${location.pathname}`;

  // Content configuration for recruiters - AI interviewing and candidate qualification
  const heroContent = {
    badgeText: "Screen candidates, 24/7",
    headline: "Interview and qualify candidates with AI-powered voice agents",
    subtitle: "Voiceable connects to your ATS, conducts natural interviews 24/7, qualifies candidates automatically, and keeps your recruitment pipeline updated. Screen thousands of candidates without scheduling headaches.",
    socialProofText: "Trusted by Recruiters & Hiring Teams"
  };

  const featuresContent = [
    {
      title: "Conduct AI Interviews",
      description: "Natural-sounding AI conducts conversational interviews that feel genuine and human-like. Candidates interview at their convenience, 24/7, in multiple languages. No scheduling conflicts, no missed interviews.",
      benefits: ["Interview 24/7, any time", "Natural conversational experience"],
      gradient: "from-primary/20 via-emerald-500/10 to-transparent",
      icon: Mic,
    },
    {
      title: "Qualify Candidates",
      description: "Automatically assesses candidate qualifications, skills, and fit. Voiceable asks relevant questions, evaluates responses, and ranks candidates based on your criteria. Get instant summaries and insights.",
      benefits: ["Instant candidate assessment", "Data-driven candidate ranking"],
      gradient: "from-green/20 via-emerald-500/10 to-transparent",
      icon: UserCheck,
    },
    {
      title: "ATS Integration",
      description: "Seamlessly syncs with your ATS (Greenhouse, Lever, Workday, Bullhorn, and more). Candidate data, interview notes, and assessments automatically flow into your recruitment system. Stay updated in real-time.",
      benefits: ["Real-time ATS sync", "No manual data entry"],
      gradient: "from-amber/20 via-orange-500/10 to-transparent",
      icon: Briefcase,
    },
    {
      title: "Multi-Language Support",
      description: "Interview candidates in 10+ languages, breaking down language barriers and expanding your talent pool. Perfect for global recruitment and diverse teams.",
      benefits: ["Interview in 10+ languages", "Expand talent pool globally"],
      gradient: "from-purple/20 via-pink-500/10 to-transparent",
      icon: Languages,
    },
    {
      title: "Team Collaboration",
      description: "Share interview recordings, summaries, and candidate assessments with your team. Collaborate seamlessly to make faster, informed hiring decisions together.",
      benefits: ["Share interviews instantly", "Collaborate on hiring decisions"],
      gradient: "from-blue/20 via-cyan-500/10 to-transparent",
      icon: Users,
    },
  ];

  const solutionsContent = [
    {
      id: "hospitality",
      label: "Hospitality",
      icon: Building2,
      title: "AI Recruiter for Hospitality Teams",
      description: "Screen and hire hotel, restaurant, and hospitality talent faster. Reduce no-shows, conduct interviews 24/7, and fill roles quickly with AI-powered candidate screening.",
      features: [
        {
          icon: Clock,
          title: "24/7 Candidate Screening",
          description: "Candidates interview at their convenience, even during off-hours. No scheduling conflicts, no missed interviews, faster time-to-hire."
        },
        {
          icon: UserCheck,
          title: "Automated Qualification",
          description: "Instantly assess candidate fit, experience, and availability. Get ranked candidate lists and make hiring decisions faster."
        }
      ]
    },
    {
      id: "retail",
      label: "Retail",
      icon: ShoppingBag,
      title: "Retail Staffing & Hiring Agent",
      description: "Hire retail staff faster with AI-powered interviews. Screen candidates for customer service skills, availability, and fit. Perfect for stores, boutiques, and retail chains.",
      features: [
        {
          icon: Clock,
          title: "Flexible Interview Scheduling",
          description: "Candidates interview 24/7, fitting around their current work schedules. No need to take time off for initial screenings."
        },
        {
          icon: UserCheck,
          title: "Customer Service Assessment",
          description: "Evaluate communication skills, customer service experience, and retail knowledge automatically through conversational interviews."
        }
      ]
    },
    {
      id: "healthcare",
      label: "Healthcare",
      icon: Stethoscope,
      title: "Healthcare Staffing & Recruitment",
      description: "Screen and hire healthcare professionals efficiently. Conduct interviews for nurses, medical assistants, and support staff with AI-powered candidate screening.",
      features: [
        {
          icon: Clock,
          title: "24/7 Interview Availability",
          description: "Healthcare workers can interview around their demanding schedules. No missed opportunities due to scheduling conflicts."
        },
        {
          icon: UserCheck,
          title: "Credential & Experience Verification",
          description: "Assess qualifications, certifications, and relevant experience. Automatically verify candidate credentials and sync to your ATS."
        }
      ]
    },
    {
      id: "warehousing",
      label: "Warehousing",
      icon: Truck,
      title: "High-Volume Hiring for Warehouses",
      description: "Screen and hire warehouse talent with zero hassle. Automate candidate screening, reduce no-shows, and hire faster with AI-powered voice interviews built for high-volume roles.",
      features: [
        {
          icon: Zap,
          title: "High-Volume Screening",
          description: "Screen thousands of candidates simultaneously. No scheduling bottlenecks, no waiting for recruiter availability."
        },
        {
          icon: TrendingUp,
          title: "Faster Time-to-Hire",
          description: "Reduce time-to-hire by 70%. Candidates interview immediately, get instant assessments, and move through your pipeline faster."
        }
      ]
    },
    {
      id: "manufacturers",
      label: "Manufacturers",
      icon: Factory,
      title: "Manufacturing Workforce Recruitment",
      description: "Hire manufacturing workers, production staff, and skilled laborers faster. Screen candidates for technical skills, safety knowledge, and reliability.",
      features: [
        {
          icon: Clock,
          title: "Shift-Friendly Interviews",
          description: "Candidates interview when convenient, even after night shifts. No scheduling barriers for shift workers."
        },
        {
          icon: UserCheck,
          title: "Skills & Safety Assessment",
          description: "Evaluate technical skills, safety certifications, and manufacturing experience. Assess reliability and work history automatically."
        }
      ]
    },
    {
      id: "recruitment-agencies",
      label: "Recruitment Agencies",
      icon: Briefcase,
      title: "Recruitment Agency Automation",
      description: "Scale your recruitment agency with AI-powered candidate screening. Handle more placements, reduce time per candidate, and improve client satisfaction.",
      features: [
        {
          icon: Zap,
          title: "Scale Candidate Screening",
          description: "Screen 10x more candidates without adding recruiters. Automate initial screenings and focus on high-value placements."
        },
        {
          icon: TrendingUp,
          title: "Faster Placements",
          description: "Reduce time-to-placement by 60%. Candidates get instant feedback, and you get ranked lists of qualified candidates faster."
        }
      ]
    },
    {
      id: "quick-serve-restaurants",
      label: "Quick-Serve Restaurants",
      icon: UtensilsCrossed,
      title: "QSR Staffing & Hiring Solution",
      description: "Hire restaurant staff, cashiers, and kitchen crew quickly. Reduce turnover with better candidate screening and faster hiring decisions.",
      features: [
        {
          icon: Clock,
          title: "24/7 Interview Access",
          description: "Candidates interview anytime, even during peak hours. No need to coordinate schedules with busy restaurant managers."
        },
        {
          icon: UserCheck,
          title: "Availability & Attitude Assessment",
          description: "Evaluate candidate availability, work ethic, and customer service attitude. Assess fit for fast-paced restaurant environments."
        }
      ]
    },
  ];

  const responsesCategories = [
    {
      id: "interview",
      label: "Interview",
      title: "Interview",
      description: "Conduct natural, conversational interviews with candidates 24/7.",
      message: "Hi, I'm calling about the warehouse position. I'd like to schedule an interview if possible.",
      icon: Mic,
      emoji: "🎤",
    },
    {
      id: "qualification",
      label: "Qualification",
      title: "Qualification",
      description: "Automatically assess candidate qualifications and fit for roles.",
      message: "I have 5 years of experience in logistics and I'm available to start immediately. What are the requirements for this role?",
      icon: UserCheck,
      emoji: "✅",
    },
    {
      id: "screening",
      label: "Screening",
      title: "Screening",
      description: "Screen candidates for skills, experience, and availability.",
      message: "I'm interested in the hospitality position. Can you tell me more about the schedule and benefits?",
      icon: Users,
      emoji: "👥",
    },
    {
      id: "ats-sync",
      label: "ATS Sync",
      title: "ATS Sync",
      description: "Automatically sync candidate data and interview notes to your ATS.",
      message: "I've completed the interview. Can you update my application status in your system?",
      icon: Briefcase,
      emoji: "💼",
    },
    {
      id: "follow-up",
      label: "Follow-up",
      title: "Follow-up",
      description: "Automated follow-ups with candidates and hiring managers.",
      message: "I wanted to follow up on my interview from last week. Have you made a decision yet?",
      icon: RefreshCw,
      emoji: "🔄",
    },
  ];

  const liveCallsContent = [
    { type: "Candidate", location: "in San Francisco", topic: "Initial Screening", status: "Resolved" as const, time: "11 min ago", duration: "260 sec" },
    { type: "Applicant", location: "in Portland", topic: "Interview Q&A", status: "Unresolved" as const, time: "26 min ago", duration: "205 sec" },
    { type: "Candidate", location: "in New York", topic: "Follow-up Call", status: "Unresolved" as const, time: "14 min ago", duration: "339 sec" },
    { type: "Applicant", location: "in Austin", topic: "Qualification", status: "Unresolved" as const, time: "16 min ago", duration: "3518 sec" },
    { type: "Candidate", location: "in Chicago", topic: "Interview Complete", status: "Resolved" as const, time: "16 min ago", duration: "249 sec" },
    { type: "Applicant", location: "in Miami", topic: "Reschedule Interview", status: "Unresolved" as const, time: "23 min ago", duration: "1807 sec" },
    { type: "Candidate", location: "in Seattle", topic: "Application Status", status: "Resolved" as const, time: "13 min ago", duration: "207 sec" },
    { type: "Applicant", location: "in Boston", topic: "Call Transfer", status: "In Progress" as const, time: "8 min ago", duration: "292 sec" },
  ];

  const seamlessSetupFeatures = [
    {
      id: "ats-integration",
      title: "ATS Integration",
      description: "Syncs with Greenhouse, Lever, Workday, Bullhorn, and other ATS platforms. Candidate data, interview notes, and assessments automatically flow into your recruitment system.",
      Icon: Briefcase,
    },
    {
      id: "interview-automation",
      title: "Automated Interviewing",
      description: "Conduct natural, conversational interviews 24/7. Candidates interview at their convenience, in multiple languages, with instant summaries and assessments.",
      Icon: Mic,
    },
    {
      id: "candidate-qualification",
      title: "Candidate Qualification",
      description: "Automatically assess candidate qualifications, skills, and fit. Get ranked candidate lists and data-driven insights to identify top talent efficiently.",
      Icon: UserCheck,
    },
    {
      id: "team-collaboration",
      title: "Team Collaboration",
      description: "Share interview recordings, summaries, and candidate assessments with your team. Collaborate seamlessly to make faster, informed hiring decisions.",
      Icon: Users,
    },
    {
      id: "multi-language",
      title: "Multi-Language Support",
      description: "Interview candidates in 10+ languages, breaking down language barriers and expanding your talent pool globally.",
      Icon: Languages,
    },
    {
      id: "call-recording",
      title: "Call Recording & Analytics",
      description: "Every interview is automatically captured, transcribed, and indexed. Search, audit, and improve your hiring process with comprehensive analytics.",
      Icon: InfinityIcon,
    },
    {
      id: "test-before-launch",
      title: "Test Before Launch",
      description: "Run real-world interview simulations to stress-test your questions and workflows before candidates ever call.",
      Icon: ShieldCheck,
    },
  ];

  const assistantContent = {
    headline: "Upgrade your recruitment process with AI that interviews and qualifies candidates 24/7",
    description: "Voiceable conducts natural interviews, qualifies candidates automatically, and syncs everything to your ATS. No scheduling headaches, no missed candidates, just faster hiring decisions."
  };

  const ctaContent = {
    title: "AI Recruiter",
    description: "Screen candidates 24/7 with an AI agent that interviews, qualifies, and syncs to your ATS",
    features: [
      "100% uptime over the last 30 days",
      "24/7 candidate interviews, day & night",
      "Natural conversational AI",
      "Integrate with any ATS platform"
    ]
  };

  // Operator Interface segments for recruiters - interviewing and candidate qualification
  const operatorSegments = [
    {
      id: "interviewing",
      label: "Interviewing",
      tabs: [
        { id: "initial_screening", label: "Initial Screening", icon: Mic },
        { id: "technical_interview", label: "Technical Interview", icon: Brain },
      ]
    },
    {
      id: "qualification",
      label: "Qualification",
      tabs: [
        { id: "candidate_assessment", label: "Candidate Assessment", icon: UserCheck },
        { id: "skills_evaluation", label: "Skills Evaluation", icon: BarChart3 },
      ]
    },
    {
      id: "ats-management",
      label: "ATS Management",
      tabs: [
        { id: "ats_sync", label: "ATS Sync", icon: Briefcase },
        { id: "candidate_tracking", label: "Candidate Tracking", icon: TrendingUp },
      ]
    },
    {
      id: "collaboration",
      label: "Collaboration",
      tabs: [
        { id: "team_review", label: "Team Review", icon: Users },
        { id: "candidate_followup", label: "Follow-up", icon: RefreshCw },
      ]
    },
  ];

  const operatorTabExamples = {
    initial_screening: {
      user: {
        name: "John",
        location: "Candidate",
        time: "2:30 PM EST",
        avatar: "J",
        message: "Hi, I'm calling about the warehouse position I applied for. I'd like to schedule an interview if possible."
      },
      ai: {
        audioDuration: "01:15",
        message: "Hi John! Thank you for your interest in the warehouse position. I'd be happy to conduct an initial screening interview with you right now. This will take about 10-15 minutes and will help us understand your experience and availability. Are you ready to begin, or would you prefer to schedule this for later?"
      },
      metadata: {
        status: "Screening In Progress",
        statusColor: "bg-blue-500",
        priority: "Medium",
        sentiment: "Interested",
        sentimentIcon: Smile,
        actions: [
          "Action: Initial Screening Started",
          "Interview Recording Active"
        ],
        documents: [
          "Docs: Interview Guide",
          "Candidate_Application_12345.pdf"
        ]
      }
    },
    technical_interview: {
      user: {
        name: "Maria",
        location: "Tech Candidate",
        time: "11:00 AM EST",
        avatar: "M",
        message: "I'm calling about the software developer position. I've completed the initial screening and I'm ready for the technical interview."
      },
      ai: {
        audioDuration: "01:25",
        message: "Hi Maria! Great to speak with you. I can see you've passed the initial screening. For the technical interview, I'll be asking you about your programming experience, problem-solving approach, and specific technical skills relevant to the role. This will take about 20-30 minutes. Are you ready to begin?"
      },
      metadata: {
        status: "Technical Interview",
        statusColor: "bg-blue-500",
        priority: "High",
        sentiment: "Confident",
        sentimentIcon: Smile,
        actions: [
          "Action: Technical Interview Started",
          "Skills Assessment Initiated"
        ],
        documents: [
          "Docs: Technical Interview Guide",
          "Job_Requirements_Dev.pdf"
        ]
      }
    },
    candidate_assessment: {
      user: {
        name: "Alex",
        location: "Applicant",
        time: "3:15 PM EST",
        avatar: "A",
        message: "I've completed the interview. Can you tell me how I did and what the next steps are?"
      },
      ai: {
        audioDuration: "00:50",
        message: "Hi Alex! Thank you for completing the interview. Based on your responses, you've demonstrated strong qualifications for the role. Your interview has been automatically assessed and ranked. Our hiring team will review your profile along with other candidates, and you should hear back within 2-3 business days. I've also synced all your interview data to our ATS system."
      },
      metadata: {
        status: "Assessment Complete",
        statusColor: "bg-green-500",
        priority: "Medium",
        sentiment: "Positive",
        sentimentIcon: Smile,
        actions: [
          "Action: Candidate Assessed",
          "Ranking Updated"
        ],
        documents: [
          "Docs: Assessment Results",
          "Candidate_Score_Report.pdf"
        ]
      }
    },
    skills_evaluation: {
      user: {
        name: "Chris",
        location: "Candidate",
        time: "1:45 PM EST",
        avatar: "C",
        message: "I have 5 years of experience in logistics and warehouse management. I'm available to start immediately."
      },
      ai: {
        audioDuration: "00:55",
        message: "Hi Chris! That's excellent experience. Based on your background in logistics and warehouse management, you seem like a strong fit for this role. I'm evaluating your skills against our requirements, and I can see you meet most of our key criteria. Your availability to start immediately is also a plus. Let me complete the skills evaluation and update your candidate profile."
      },
      metadata: {
        status: "Skills Evaluated",
        statusColor: "bg-green-500",
        priority: "High",
        sentiment: "Qualified",
        sentimentIcon: Smile,
        actions: [
          "Action: Skills Assessment Complete",
          "Candidate Profile Updated"
        ],
        documents: [
          "Docs: Skills Evaluation",
          "Candidate_Qualification_Report.pdf"
        ]
      }
    },
    ats_sync: {
      user: {
        name: "Sarah",
        location: "Applicant",
        time: "10:20 AM EST",
        avatar: "S",
        message: "I've completed my interview. Can you make sure all my information is saved in your system?"
      },
      ai: {
        audioDuration: "00:42",
        message: "Hi Sarah! Absolutely, I've automatically synced all your interview data, assessment results, and candidate information to our ATS system. Your profile is now complete with interview recordings, transcripts, and evaluation scores. The hiring team can access everything in real-time. Is there anything specific you'd like me to verify or update?"
      },
      metadata: {
        status: "Synced to ATS",
        statusColor: "bg-green-500",
        priority: "Low",
        sentiment: "Positive",
        sentimentIcon: Smile,
        actions: [
          "Action: ATS Sync Complete",
          "Profile Updated"
        ],
        documents: [
          "Docs: ATS Integration",
          "Sync_Confirmation_Report.pdf"
        ]
      }
    },
    candidate_tracking: {
      user: {
        name: "Michael",
        location: "Candidate",
        time: "4:00 PM EST",
        avatar: "M",
        message: "I wanted to check on the status of my application. I completed the interview last week."
      },
      ai: {
        audioDuration: "00:48",
        message: "Hi Michael! I can see your application status in our system. You completed the interview last week, and your profile is currently under review by our hiring team. Your candidate ranking is in the top tier, which is great. We expect to make decisions within the next few days, and you'll be notified as soon as there's an update. I'll also send you an email with your current status."
      },
      metadata: {
        status: "Under Review",
        statusColor: "bg-yellow-500",
        priority: "Medium",
        sentiment: "Neutral",
        sentimentIcon: Meh,
        actions: [
          "Action: Status Checked",
          "Update Email Sent"
        ],
        documents: [
          "Docs: Candidate Tracking",
          "Application_Status_Report.pdf"
        ]
      }
    },
    team_review: {
      user: {
        name: "Jessica",
        location: "Hiring Manager",
        time: "9:30 AM EST",
        avatar: "J",
        message: "I need to review the top candidates for the warehouse position. Can you show me the interview summaries and assessments?"
      },
      ai: {
        audioDuration: "00:35",
        message: "Hi Jessica! I've compiled the interview summaries and assessments for the top candidates. I can see 5 candidates who scored highly in the initial screening. Their interview recordings, transcripts, and evaluation scores are all available in the team review dashboard. Would you like me to highlight the top 3 candidates based on our assessment criteria?"
      },
      metadata: {
        status: "Ready for Review",
        statusColor: "bg-blue-500",
        priority: "High",
        sentiment: "Neutral",
        sentimentIcon: Meh,
        actions: [
          "Action: Review Package Prepared",
          "Top Candidates Highlighted"
        ],
        documents: [
          "Docs: Team Review Package",
          "Candidate_Comparison_Report.pdf"
        ]
      }
    },
    candidate_followup: {
      user: {
        name: "David",
        location: "Candidate",
        time: "2:15 PM EST",
        avatar: "D",
        message: "I wanted to follow up on my interview from last week. Have you made a decision yet?"
      },
      ai: {
        audioDuration: "2:02",
        message: "Hi David! Thank you for following up. I can see your interview from last week is still under review. The hiring team is currently evaluating all candidates and expects to make a decision by the end of this week. I'll make sure you're notified as soon as there's an update. In the meantime, I can send you a summary of your interview performance if you'd like."
      },
      metadata: {
        status: "Follow-up Active",
        statusColor: "bg-blue-500",
        priority: "Medium",
        sentiment: "Interested",
        sentimentIcon: Smile,
        actions: [
          "Action: Follow-up Logged",
          "Status Update Scheduled"
        ],
        documents: [
          "Docs: Follow-up Campaign",
          "Interview_Summary_Report.pdf"
        ]
      }
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SEO
        title="AI Recruiting & Candidate Screening | Voiceable"
        description="Screen and hire talent faster with AI-powered voice interviews. Conduct interviews 24/7, qualify candidates automatically, and sync to your ATS. Perfect for recruiters, hiring teams, and high-volume recruitment."
        keywords="AI recruiting, AI interviews, candidate screening, automated hiring, ATS integration, voice AI recruiting, AI recruiter, candidate qualification, automated interviews, recruitment automation, hiring automation, AI phone interviews"
        url={currentUrl}
        image="/og-image.png"
      />
      <Header />
      <main>
        <HeroSection 
          badgeText={heroContent.badgeText}
          headline={heroContent.headline}
          subtitle={heroContent.subtitle}
          socialProofText={heroContent.socialProofText}
        />
        <OperatorInterfaceSection 
          segments={operatorSegments}
          tabExamples={operatorTabExamples}
          audioSrc="/recruitment-landing-page-audio.mp3"
        />
        <FeaturesSection features={featuresContent} />
        <LiveCallsSection calls={liveCallsContent} />
        <AssistantSection 
          headline={assistantContent.headline}
          description={assistantContent.description}
          showCalendarOnly={true}
        />
        <ResponsesSection categories={responsesCategories} />
        <SolutionsSection solutions={solutionsContent} />
        <HumanLedSection />
        <SeamlessSetupSection features={seamlessSetupFeatures} />
        <CTASection 
          title={ctaContent.title}
          description={ctaContent.description}
          features={ctaContent.features}
          showCalendarOnly={true}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Landing3;
