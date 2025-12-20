import { Check } from "lucide-react";

interface PerfectForSectionProps {
  title: string;
  items: string[];
  footer?: string;
}

export function PerfectForSection({ title, items, footer }: PerfectForSectionProps) {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-12 text-center">
          {title}
        </h2>
        
        <div className="glass-card rounded-3xl p-8 md:p-12">
          <p className="text-xl font-medium text-foreground mb-8 text-center">Perfect for:</p>
          
          <ul className="space-y-4 mb-8">
            {items.map((item, index) => (
              <li 
                key={index} 
                className="group flex items-center gap-4 p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <span className="text-lg text-foreground">{item}</span>
              </li>
            ))}
          </ul>
          
          {footer && (
            <p className="text-center text-lg text-muted-foreground italic">
              {footer}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}