import { Check } from "lucide-react";

interface ExperienceSectionProps {
  title: string;
  items: string[];
}

export function ExperienceSection({ title, items }: ExperienceSectionProps) {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8 text-center">
          {title}
        </h2>
        
        <p className="text-xl text-muted-foreground mb-12 text-center">
          Every interaction feels natural and professional:
        </p>
        
        <div className="glass-card rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-4">
            {items.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <span className="text-lg text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}