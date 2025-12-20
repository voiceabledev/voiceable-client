import { Zap } from "lucide-react";

interface IntegrationsSectionProps {
  title: string;
  channels: string[];
}

export function IntegrationsSection({ title, channels }: IntegrationsSectionProps) {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-12 text-center">
          {title}
        </h2>
        
        <div className="glass-card rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-6">
            {channels.map((channel, index) => (
              <div 
                key={index} 
                className="group flex items-center gap-4 p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <span className="text-foreground font-medium">{channel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}