import { useState } from "react";
import { ShoppingBag, UtensilsCrossed, MessageSquare, Package, Phone, Clock, ChevronRight, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SolutionFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface Solution {
  id: string;
  label: string;
  icon: LucideIcon;
  title: string;
  description: string;
  features: SolutionFeature[];
}

interface SolutionsSectionProps {
  solutions?: Solution[];
  eyebrow?: string;
  title?: string;
  description?: string;
  activeEyebrow?: string;
  chartTitle?: string;
  chartValue?: string;
  chartXAxisLabel?: string;
  sectionClassName?: string;
}

const defaultSolutions: Solution[] = [
  {
    id: "retail",
    label: "Retail / E-commerce",
    icon: ShoppingBag,
    title: "Customer Support & Order Management Agent",
    description: "Handle every customer inquiry, order tracking request, and support issue across phone, so your team can focus on growing your business",
    features: [
      {
        icon: MessageSquare,
        title: "24/7 Customer Support",
        description: "Instant responses to product questions, order status, shipping inquiries, and returns, deflecting FAQs and boosting satisfaction without adding headcount."
      },
      {
        icon: Package,
        title: "Automated Order Management",
        description: "Handle returns, exchanges, refunds, and inventory inquiries automatically. Process requests, update order status, and keep customers informed every step of the way."
      }
    ]
  },
];

const SolutionsSection = ({
  solutions = defaultSolutions,
  eyebrow,
  title,
  description,
  activeEyebrow = "Voiceable is your...",
  chartTitle = "Requests Handled",
  chartValue = "87",
  chartXAxisLabel = "Number of Requests Automated",
  sectionClassName = ""
}: SolutionsSectionProps) => {
  const [activeTab, setActiveTab] = useState(solutions[0]?.id || "retail");
  const activeSolution = solutions.find(s => s.id === activeTab) || solutions[0];

  return (
    <section id="solutions" className={`py-32 scroll-mt-28 ${sectionClassName}`.trim()}>
      <div className="container mx-auto px-6">
        {title && (
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            {eyebrow && <p className="text-primary font-medium mb-3">{eyebrow}</p>}
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">{title}</h2>
            {description && <p className="text-lg text-muted-foreground">{description}</p>}
          </div>
        )}
        {/* Tabs */}
        <div className="w-full mb-8 md:mb-16 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
          <div className="flex items-center gap-2 min-w-max justify-center md:justify-center">
            {solutions.map((solution) => {
              const Icon = solution.icon;
              const isActive = activeTab === solution.id;
              
              return (
                <button
                  key={solution.id}
                  onClick={() => setActiveTab(solution.id)}
                  className={`
                    flex items-center gap-2 px-3 md:px-4 lg:px-5 py-2 md:py-3 rounded-full text-xs md:text-sm font-medium whitespace-nowrap
                    transition-all duration-300 flex-shrink-0
                    ${isActive 
                      ? "bg-secondary text-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{solution.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start max-w-6xl mx-auto">
          {/* Left side - Text content */}
          <div className="animate-fade-in px-4 md:px-0">
            <p className="text-primary mb-2 text-sm md:text-base">
              {activeEyebrow}
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
              {activeSolution?.title}
            </h2>
            <p className="text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">
              {activeSolution?.description}
            </p>

            {/* Features */}
            <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
              {activeSolution?.features.map((feature, index) => {
                const FeatureIcon = feature.icon;
                return (
                  <div key={index} className="flex gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      <FeatureIcon className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold mb-1 text-sm md:text-base">{feature.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right side - Chart */}
          <div className="bg-card rounded-3xl border border-border p-4 md:p-6 mx-4 md:mx-0">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="font-semibold text-sm md:text-base">{chartTitle}</h3>
              <div className="flex items-center gap-2">
                <button className="px-2 md:px-3 py-1 text-xs rounded-full bg-secondary">Daily</button>
                <button className="px-2 md:px-3 py-1 text-xs rounded-full text-muted-foreground">Monthly</button>
              </div>
            </div>

            {/* Chart visualization */}
            <div className="relative h-48 md:h-64">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-6 md:bottom-8 w-6 md:w-8 flex flex-col justify-between text-[10px] md:text-xs text-muted-foreground">
                <span>100</span>
                <span>80</span>
                <span>60</span>
                <span>40</span>
                <span>20</span>
                <span>0</span>
              </div>

              {/* Chart area */}
              <div className="ml-8 md:ml-10 h-full relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="border-t border-border/30" />
                  ))}
                </div>

                {/* Line chart */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--amber))" />
                      <stop offset="50%" stopColor="hsl(var(--green))" />
                      <stop offset="100%" stopColor="hsl(var(--purple))" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0,200 Q 50,180 100,160 T 200,120 T 300,80 T 400,40"
                    fill="none"
                    stroke="url(#chartGradient)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    className="animate-fade-in md:stroke-[3]"
                    style={{ 
                      strokeDasharray: 500,
                      strokeDashoffset: 0,
                    }}
                  />
                </svg>

                {/* Current value indicator */}
                <div className="absolute right-0 top-2 md:top-4 flex items-center gap-1.5 md:gap-2">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-purple animate-pulse" />
                  <span className="text-xl md:text-2xl font-bold">{chartValue}</span>
                </div>
              </div>

              {/* X-axis label */}
              <div className="absolute bottom-0 left-8 md:left-10 right-0 text-center text-[10px] md:text-xs text-muted-foreground px-2">
                {chartXAxisLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;

