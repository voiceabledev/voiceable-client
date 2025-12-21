import { Button } from "@/components/ui/button";
import { Phone, ArrowRight, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface HeroIcon {
  icon: LucideIcon;
  label: string;
  color: string;
}

interface HeroSectionProps {
  badge: string;
  title: string;
  titleHighlight: string;
  description: string;
  subdescription?: string;
  primaryCta: string;
  secondaryCta: string;
  secondaryCtaLink: string;
  icons: HeroIcon[];
  onPrimaryCtaClick?: () => void;
}

export function HeroSection({
  badge,
  title,
  titleHighlight,
  description,
  subdescription,
  primaryCta,
  secondaryCta,
  secondaryCtaLink,
  icons,
  onPrimaryCtaClick,
}: HeroSectionProps) {
  return (
    <section className="pt-32 pb-24 px-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-violet/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-sm font-medium text-primary">{badge}</span>
        </div>
        
        {/* Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-8 leading-tight tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {title}<br />
          <span className="bg-gradient-to-r from-primary via-emerald-light to-primary bg-clip-text text-transparent">
            {titleHighlight}
          </span>
        </h1>
        
        {/* Description */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {description}
        </p>
        {subdescription && (
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            {subdescription}
          </p>
        )}
        
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Button 
            size="lg" 
            onClick={onPrimaryCtaClick}
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
        
        {/* Icon Visual */}
        <div className="relative animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="relative h-64 md:h-80 flex items-center justify-center">
            {/* Connecting Lines */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
              <svg className="w-full h-20" viewBox="0 0 400 80" fill="none">
                <path 
                  d="M80 40 L200 40 L320 40" 
                  stroke="url(#gradient)" 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
                  className="opacity-30"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <div className="grid grid-cols-3 gap-8 md:gap-16 max-w-2xl relative z-10">
              {icons.map((item, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center space-y-4 group"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl ${item.color} flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
                    <item.icon className="w-10 h-10 md:w-12 md:h-12 text-foreground" />
                  </div>
                  <span className="text-sm md:text-base font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}