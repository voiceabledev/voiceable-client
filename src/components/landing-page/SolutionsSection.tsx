import { useState } from "react";
import { ShoppingBag, UtensilsCrossed, MessageSquare, Package, Phone, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const solutions = [
  {
    id: "retail",
    label: "Retail / E-commerce",
    icon: ShoppingBag,
    title: "Customer Support & Order Management Agent",
    description: "Handle every customer inquiry, order tracking request, and support issue across phone, SMS, and email, so your team can focus on growing your business",
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
  {
    id: "restaurant",
    label: "Restaurant / QSR",
    icon: UtensilsCrossed,
    title: "Order Taker & Customer Service Agent",
    description: "Handle phone orders, reservations, menu inquiries, and customer service 24/7, never miss an order or reservation again",
    features: [
      {
        icon: Phone,
        title: "Automated Order Taking",
        description: "Process phone orders, answer menu questions, handle special requests, and confirm order details, all automatically, even during peak hours."
      },
      {
        icon: Clock,
        title: "Reservation & Support",
        description: "Manage reservations, handle complaints, provide location and hours information, and route urgent issues to the right team member instantly."
      }
    ]
  }
];

const SolutionsSection = () => {
  const [activeTab, setActiveTab] = useState("retail");
  const activeSolution = solutions.find(s => s.id === activeTab) || solutions[0];

  return (
    <section id="solutions" className="py-32">
      <div className="container mx-auto px-6">
        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-16">
          {solutions.map((solution) => {
            const Icon = solution.icon;
            const isActive = activeTab === solution.id;
            
            return (
              <button
                key={solution.id}
                onClick={() => setActiveTab(solution.id)}
                className={`
                  flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium
                  transition-all duration-300
                  ${isActive 
                    ? "bg-secondary text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{solution.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          {/* Left side - Text content */}
          <div className="animate-fade-in">
            <p className="text-primary mb-2">
              <span className="text-primary">Operator</span> is your...
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {activeSolution.title}
            </h2>
            <p className="text-muted-foreground mb-8">
              {activeSolution.description}
            </p>

            {/* Features */}
            <div className="space-y-6 mb-8">
              {activeSolution.features.map((feature, index) => {
                const FeatureIcon = feature.icon;
                return (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      <FeatureIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right side - Chart */}
          <div className="bg-card rounded-3xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Requests Handled</h3>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-xs rounded-full bg-secondary">Daily</button>
                <button className="px-3 py-1 text-xs rounded-full text-muted-foreground">Monthly</button>
              </div>
            </div>

            {/* Chart visualization */}
            <div className="relative h-64">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-muted-foreground">
                <span>100</span>
                <span>80</span>
                <span>60</span>
                <span>40</span>
                <span>20</span>
                <span>0</span>
              </div>

              {/* Chart area */}
              <div className="ml-10 h-full relative">
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
                    strokeWidth="3"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    className="animate-fade-in"
                    style={{ 
                      strokeDasharray: 500,
                      strokeDashoffset: 0,
                    }}
                  />
                </svg>

                {/* Current value indicator */}
                <div className="absolute right-0 top-4 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple animate-pulse" />
                  <span className="text-2xl font-bold">87</span>
                </div>
              </div>

              {/* X-axis label */}
              <div className="absolute bottom-0 left-10 right-0 text-center text-xs text-muted-foreground">
                Number of Requests Automated
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;

