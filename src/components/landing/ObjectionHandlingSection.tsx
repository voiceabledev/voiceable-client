import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Objection {
  question: string;
  answer: string;
}

interface ObjectionHandlingSectionProps {
  title?: string;
  objections: Objection[];
}

export function ObjectionHandlingSection({
  title = "Common Questions",
  objections,
}: ObjectionHandlingSectionProps) {
  return (
    <section className="py-24 px-6 bg-card/30">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-12 text-center">
          {title}
        </h2>
        
        <Accordion type="single" collapsible className="w-full space-y-4">
          {objections.map((objection, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-background rounded-2xl border border-border px-6"
            >
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-6">
                {objection.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                {objection.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

