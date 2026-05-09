import { type LucideIcon, EyeOff, Lock, ShieldCheck } from "lucide-react";

const items: { title: string; description: string; icon: LucideIcon }[] = [
  // {
  //   title: "SOC 2 & HIPAA compliance",
  //   description:
  //     "SOC 2 Type II certification and HIPAA compliance for handling sensitive phone conversations and customer data across regulated industries.",
  //   icon: ShieldCheck,
  // },
  {
    title: "Automatic PII redaction",
    description:
      "Sensitive information is detected and removed in real time. Credit card numbers, SSNs, and personal identifiers are redacted from transcripts, logs, and analytics to reduce risk and support compliance.",
    icon: EyeOff,
  },
  {
    title: "State-of-the-art encryption",
    description:
      "All phone conversations and transcripts are protected with AES-256 encryption — both during calls and in storage — meeting enterprise security standards.",
    icon: Lock,
  },
];

const SecuritySection = () => (
  <section
    id="security"
    aria-labelledby="security-heading"
    className="py-20 md:py-32 scroll-mt-28 border-t border-border/60"
  >
    <div className="container mx-auto px-6">
      <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
        <div className="feature-pill mb-6 inline-flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>How to implement this in Voiceable</span>
        </div>
        <h2
          id="security-heading"
          className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
        >
          Enterprise-grade security and compliance.
        </h2>
        <p className="text-lg text-muted-foreground">
          Your data is protected with bank-level security. Voiceable maintains the highest
          standards of compliance so you can ship voice on revenue-critical flows with confidence.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="group relative rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm transition-shadow hover:shadow-md hover:border-primary/25"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-primary mb-5 transition-transform group-hover:scale-105">
                <Icon className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default SecuritySection;
