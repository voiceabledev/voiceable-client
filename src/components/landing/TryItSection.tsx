import { Button } from "@/components/ui/button";
import { Phone, Check } from "lucide-react";

interface TryItSectionProps {
  title: string;
  description: string;
  features: string[];
  ctaText: string;
  note?: string;
  onCtaClick?: () => void;
}

export function TryItSection({
  title,
  description,
  features,
  ctaText,
  note = "No signup required.",
  onCtaClick,
}: TryItSectionProps) {
  return (
    <section className="py-32 px-6 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-12 leading-tight">
          {title}
        </h2>
        
        <div className="glass-card rounded-3xl p-8 md:p-12 mb-12">
          <p className="text-xl font-medium text-foreground mb-8">{description}</p>
          
          <div className="grid md:grid-cols-2 gap-4 text-left">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="text-lg text-foreground">{feature}</span>
              </div>
            ))}
          </div>
          
          <p className="text-muted-foreground mt-8 text-sm">{note}</p>
        </div>
        
        <Button 
          size="lg" 
          onClick={onCtaClick}
          className="group bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10 py-7 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Phone className="w-5 h-5 mr-2 group-hover:animate-bounce" />
          {ctaText}
        </Button>
      </div>
    </section>
  );
}