import { Check, MessageCircle, Calendar, Wrench, LucideIcon } from "lucide-react";

interface Feature {
  title: string;
  description: string;
  benefits: string[];
  gradient: string;
  icon: LucideIcon;
}

interface FeaturesSectionProps {
  features?: Feature[];
}

const defaultFeatures: Feature[] = [
  {
    title: "Instant Response",
    description: "Responds 24/7 like a human to everyday customer questions like order status, payment, and product details. Voiceable pulls answers from your knowledge base, logs every interaction, and leaves staff free for higher-value work.",
    benefits: ["Uptick in resident satisfaction", "Decrease manual ticket volume"],
    gradient: "from-primary/20 via-emerald-500/10 to-transparent",
    icon: MessageCircle,
  },
  {
    title: "Takes Action",
    description: "Prospects book appointments in a single tap. Voiceable syncs with your calendar, sends confirmations and reminders, and follows up automatically, so no lead falls through the cracks.",
    benefits: ["Convert more leads to appointments", "Reduce missed connections"],
    gradient: "from-green/20 via-emerald-500/10 to-transparent",
    icon: Calendar,
  },
  {
    title: "Resolves Issue",
    description: "Real-time triage diagnoses issues, prioritizes them, and routes them to the right team before the phone even stops ringing -- cutting out voicemail ping-pong and guesswork.",
    benefits: ["On-time work-order completion", "Eliminate remote call centers"],
    gradient: "from-amber/20 via-orange-500/10 to-transparent",
    icon: Wrench,
  },
];

const FeaturesSection = ({ features = defaultFeatures }: FeaturesSectionProps) => {
  return (
    <section id="features" className="py-16 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="sr-only">Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
            <div 
              key={index}
              className="bg-card rounded-3xl border border-border overflow-hidden group hover:border-primary/50 transition-all relative flex flex-col min-h-[400px] md:h-[500px]"
            >
              {/* Icon header section */}
              <div className={`relative w-full h-48 overflow-hidden bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/20" />
                
                {/* Icon */}
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-foreground">{feature.title}</h3>
                </div>
              </div>
              
              {/* Content section */}
              <div className="p-4 md:p-6 flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground mb-4 md:mb-6 leading-relaxed flex-1">
                  {feature.description}
                </p>
                
                <div className="space-y-2">
                  {feature.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-primary">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

