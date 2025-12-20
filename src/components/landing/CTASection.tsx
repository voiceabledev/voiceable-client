import { Button } from "@/components/ui/button";
import { Phone, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface CTASectionProps {
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  secondaryCtaLink: string;
}

export function CTASection({
  title,
  description,
  primaryCta,
  secondaryCta,
  secondaryCtaLink,
}: CTASectionProps) {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          {title}
        </h2>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          {description}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            size="lg" 
            className="group bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10 py-7 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Phone className="w-5 h-5 mr-2 group-hover:animate-bounce" />
            {primaryCta}
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="font-semibold px-10 py-7 text-lg rounded-full border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300" 
            asChild
          >
            <Link to={secondaryCtaLink}>
              {secondaryCta} <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}