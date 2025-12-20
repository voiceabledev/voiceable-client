import { Quote } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  company: string;
}

interface TestimonialsSectionProps {
  title?: string;
  testimonials: Testimonial[];
}

export function TestimonialsSection({ title = "What our customers say", testimonials }: TestimonialsSectionProps) {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center">
          {title}
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="group relative glass-card rounded-3xl p-8 transition-all duration-300 hover:shadow-xl"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20 group-hover:text-primary/40 transition-colors" />
              
              <p className="text-lg text-foreground mb-6 leading-relaxed italic">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                  {testimonial.author[0]}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}