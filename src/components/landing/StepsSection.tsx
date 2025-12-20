interface Step {
  number: string;
  title: string;
  items: string[];
}

interface StepsSectionProps {
  title: string;
  steps: Step[];
  footer?: string;
}

export function StepsSection({ title, steps, footer }: StepsSectionProps) {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center">
          {title}
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="group relative bg-card rounded-2xl p-8 border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-lg font-bold mb-6 group-hover:scale-110 transition-transform duration-300">
                {step.number}
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-4">{step.title}</h3>
              
              <ul className="space-y-2">
                {step.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-1 font-bold">•</span>
                    <span className="text-muted-foreground text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {footer && (
          <p className="text-center text-lg text-foreground font-medium">
            {footer}
          </p>
        )}
      </div>
    </section>
  );
}