interface ValuePropositionProps {
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
}

export function ValueProposition({
  title,
  subtitle,
  description,
  highlights,
}: ValuePropositionProps) {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-center leading-tight">
          {title.split(',')[0]},<br />
          <span className="text-muted-foreground">{title.split(',')[1] || subtitle}</span>
        </h2>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-16 text-center max-w-3xl mx-auto">
          {subtitle}
        </p>
        
        <div className="glass-card rounded-3xl p-8 md:p-12 space-y-8">
          <p className="text-xl font-medium text-foreground text-center leading-relaxed">
            {description}
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 pt-6">
            {highlights.map((highlight, index) => (
              <div 
                key={index} 
                className="group text-center p-6 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <p className="text-lg text-foreground font-semibold group-hover:text-primary transition-colors">
                  {highlight}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}