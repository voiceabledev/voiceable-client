import { LucideIcon } from "lucide-react";

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface FeaturesGridProps {
  title: string;
  features: Feature[];
  footer?: {
    line1: string;
    line2: string;
  };
}

export function FeaturesGrid({ title, features, footer }: FeaturesGridProps) {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">
          {title}
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group text-center p-6 rounded-2xl hover:bg-background transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
        
        {footer && (
          <div className="text-center mt-12 space-y-2">
            <p className="text-lg text-foreground font-medium">{footer.line1}</p>
            <p className="text-xl text-foreground font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {footer.line2}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}