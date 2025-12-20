import { Check, LucideIcon } from "lucide-react";

interface UseCase {
  title: string;
  description: string;
  features: string[];
  subtext?: string;
  icon: LucideIcon;
}

interface UseCasesSectionProps {
  title: string;
  useCases: UseCase[];
  layout?: "grid" | "stacked";
}

export function UseCasesSection({
  title,
  useCases,
  layout = "grid",
}: UseCasesSectionProps) {
  if (layout === "stacked") {
    return (
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center">
            {title}
          </h2>
          
          <div className="space-y-12">
            {useCases.map((useCase, index) => (
              <div 
                key={index} 
                className="glass-card rounded-3xl p-8 md:p-12 transition-all duration-300 hover:shadow-xl"
              >
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <useCase.icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-foreground">{useCase.title}</h3>
                    </div>
                    <p className="text-lg text-muted-foreground mb-6">{useCase.description}</p>
                    
                    <ul className="space-y-3 mb-4">
                      {useCase.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {useCase.subtext && (
                      <p className="text-sm text-muted-foreground mt-4 italic">{useCase.subtext}</p>
                    )}
                  </div>
                  
                  <div className="relative hidden lg:flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl" />
                    <div className="relative p-12">
                      <useCase.icon className="w-32 h-32 text-primary/20" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center">
          {title}
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <div 
              key={index} 
              className="group glass-card rounded-3xl p-8 md:p-10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <useCase.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">{useCase.title}</h3>
              </div>
              <p className="text-lg text-muted-foreground mb-6">{useCase.description}</p>
              
              <ul className="space-y-3 mb-4">
                {useCase.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {useCase.subtext && (
                <p className="text-sm text-muted-foreground mt-4 italic">{useCase.subtext}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}