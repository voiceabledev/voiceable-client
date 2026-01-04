import { useState } from "react";
import { Clock, Smile, Globe, ArrowRightLeft, AlertTriangle, Calendar, CreditCard, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
  {
    id: "emergencies",
    label: "Emergencies",
    title: "Emergencies",
    description: "Immediate response to urgent situations that require immediate attention, 24/7.",
    message: "There's a huge bat in our living room and we can't get it out...",
    icon: AlertTriangle,
    emoji: "🏠",
  },
  {
    id: "showings",
    label: "Showings",
    title: "Showings",
    description: "Seamlessly schedule property viewings and manage tour requests in real-time.",
    message: "Hi, I saw your listing online. Can I schedule a viewing for this weekend?",
    icon: Calendar,
    emoji: "📅",
  },
  {
    id: "payments",
    label: "Payments",
    title: "Payments",
    description: "Handle rent payments, questions about billing, and payment method updates instantly.",
    message: "I tried to pay my rent but the payment isn't going through. Can you help?",
    icon: CreditCard,
    emoji: "💳",
  },
  {
    id: "issues",
    label: "Issues",
    title: "Issues",
    description: "Track and resolve maintenance requests, from minor fixes to urgent repairs.",
    message: "My kitchen sink has been leaking for days. When can someone come fix it?",
    icon: Wrench,
    emoji: "🔧",
  },
];

const ResponsesSection = () => {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const activeCategoryData = categories.find(cat => cat.id === activeCategory) || categories[0];

  return (
    <section id="responses" className="relative">
      <div className="container mx-auto px-6">
        {/* <div className="max-w-4xl mx-auto mb-32">
          <div className="bg-card rounded-3xl border border-border p-8">
            <div className="conversation-bubble max-w-2xl mx-auto mb-8">
              <p className="text-sm leading-relaxed">
                It looks like this may be connected to the heating{" "}
                <span className="underline decoration-primary decoration-2 underline-offset-2">issue you reported last week</span>. 
                Thank you for flagging that. I've just created an emergency ticket for this 
                issue and will be dispatching our preferred vendor{" "}
                <span className="underline decoration-primary decoration-2 underline-offset-2">Hailey Heating & Cooling</span>.
              </p>
              <p className="text-sm mt-4">
                I will send you a text update as soon as their
                technician is on route...
              </p>
            </div>

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>
            
            <p className="text-center text-xs text-muted-foreground tracking-widest uppercase">
              Powered by Voiceable
            </p>
          </div>
        </div> */}

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-32">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 mb-3 justify-center md:justify-start">
              <Smile className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Personalized Outreach</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Greets residents by name, recalls last tickets,
              and tailors replies to unit history and lease
              details.
            </p>
          </div>

          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 mb-3 justify-center md:justify-start">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Localized Responses</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Speaks the resident's language, references
              local regs, and adjusts time zones
              automatically.
            </p>
          </div>

          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 mb-3 justify-center md:justify-start">
              <ArrowRightLeft className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Warm Transfers</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Seamlessly hand live calls from the AI
              operator to your team, no dropped context,
              no repeating details.
            </p>
          </div>
        </div>

        {/* 24/7 Responses section */}
        <div className="text-center">
          <div className="feature-pill mb-8 inline-flex">
            <Clock className="w-4 h-4" />
            <span>24/7 Responses</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Never miss another ring
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Stress free, <span className="text-primary">Voiceable</span> answers every phone call &
            message. Automatically responding, handling, routing,
            and escalating based on the scenario...
          </p>

          {/* Category Tabs */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
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
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>

          {/* Animated word */}
          <div className="mb-16">
            <AnimatePresence mode="wait">
              <motion.span
                key={activeCategoryData.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-5xl md:text-7xl font-bold text-gradient-purple block"
              >
                {/* {activeCategoryData.title} */}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Phone notification mockup */}
          <div className="max-w-xs mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategoryData.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-b from-card to-background rounded-[2.5rem] border border-border p-4 shadow-2xl h-auto"
              >
                <div className="bg-muted rounded-2xl p-4 overflow-visible">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-pink/20 flex items-center justify-center">
                      <span className="text-pink text-xs">{activeCategoryData.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Madeline</span>
                        <span className="text-xs text-muted-foreground">1:46 AM</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed break-words">
                    {activeCategoryData.message}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResponsesSection;

