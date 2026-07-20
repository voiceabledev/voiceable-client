import {
  type LucideIcon,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  Brain,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Crosshair,
  EyeOff,
  Gauge,
  GitCompare,
  Mail,
  MessageCircle,
  Mic,
  PhoneOutgoing,
  Radar,
  Shield,
  Sparkles,
  Timer,
  TrendingDown,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  XCircle,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

const easing = [0.16, 1, 0.3, 1] as const;

const viewport = {
  once: true,
  margin: "-72px",
  amount: 0.2 as const,
};

const staggerParentOpts = {
  initial: "hidden" as const,
  whileInView: "visible" as const,
  viewport,
};

const staggerContainerVar = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.06 },
  },
};

const staggerItemVar = {
  hidden: { opacity: 1, y: 0 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easing },
  },
};

const fadeUpHeader = {
  initial: { opacity: 1, y: 0 },
  whileInView: { opacity: 1, y: 0 },
  viewport,
  transition: { duration: 0.45, ease: easing },
};

const intentMoments: { text: string; icon: LucideIcon }[] = [
  { text: "Visitors land on your pricing page.", icon: CircleDollarSign },
  { text: "They compare plans, hesitate, and leave.", icon: GitCompare },
  { text: "Voiceable lets you step in at the exact moment it matters.", icon: Crosshair },
];

const howItWorksSteps: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Create your assistant",
    description: "Pick a voice and teach it your business with your docs and FAQs.",
    icon: Radar,
  },
  {
    title: "Connect a number or widget",
    description: "Attach a phone number or embed the voice widget on your site.",
    icon: PhoneOutgoing,
  },
  {
    title: "Let it handle conversations",
    description: "It answers calls, books appointments, and resolves questions 24/7.",
    icon: Gauge,
  },
  {
    title: "Review and step in",
    description: "See transcripts and outcomes, and take over live when it matters.",
    icon: BadgeCheck,
  },
];

const buyersReject: { label: string; icon: LucideIcon }[] = [
  { label: "Forms", icon: ClipboardList },
  { label: "Emails", icon: Mail },
  { label: "We'll get back to you", icon: MessageCircle },
];

const voiceBrings: { label: string; icon: LucideIcon }[] = [
  { label: "Trust", icon: Shield },
  { label: "Speed", icon: Zap },
  { label: "Clarity", icon: Sparkles },
];

const hybridItems: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "AI qualifies and routes leads",
    description:
      "Use AI to understand who is browsing, what they need, and where they should go next.",
    icon: Bot,
  },
  {
    title: "Humans step in for high-value deals",
    description: "Route serious buyers to your team while the context is still fresh.",
    icon: Users,
  },
  {
    title: "Run automated flows where it makes sense",
    description: "Scale repeatable revenue conversations without waiting for a rep to be free.",
    icon: Zap,
  },
];

const proofItems: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Higher conversion rates",
    description: "More high-intent visitors get help before they leave.",
    icon: TrendingUp,
  },
  {
    title: "Larger average deals",
    description: "Sales teams can guide buyers toward the right package or product.",
    icon: BarChart3,
  },
  {
    title: "Faster time to close",
    description: "Questions get answered while purchase intent is active.",
    icon: Timer,
  },
];

const withoutVoiceable: { text: string; icon: LucideIcon }[] = [
  { text: "Anonymous traffic", icon: EyeOff },
  { text: "Lost intent", icon: TrendingDown },
  { text: "Missed opportunities", icon: XCircle },
];

const withVoiceable: { text: string; icon: LucideIcon }[] = [
  { text: "Identified buyers", icon: UserRound },
  { text: "Real conversations", icon: Mic },
  { text: "Revenue captured in the moment", icon: Wallet },
];

export const CredibilitySection = () => (
  <section id="credibility" className="py-20 scroll-mt-28">
    <div className="container mx-auto px-6">
      <motion.div
        className="max-w-5xl mx-auto rounded-3xl border border-border bg-gradient-to-b from-card via-card to-secondary/25 p-8 md:p-12 text-center shadow-sm relative overflow-hidden"
        initial={{ opacity: 1, y: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.6, ease: easing }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-1/4 h-48 w-48 rounded-full bg-primary/15 blur-3xl"
        />
        <motion.p className="text-primary font-medium mb-4" {...fadeUpHeader}>
          Most websites lose their best opportunities.
        </motion.p>
        <motion.h2
          className="text-3xl md:text-5xl font-bold tracking-tight mb-10"
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.55, delay: 0.05, ease: easing }}
        >
          Visitors are showing buying intent before they ever fill out a form.
        </motion.h2>
        <motion.div
          className="grid md:grid-cols-3 gap-4 text-left"
          variants={staggerContainerVar}
          {...staggerParentOpts}
        >
          {intentMoments.map((moment, index) => {
            const Icon = moment.icon;
            return (
              <motion.div
                key={moment.text}
                variants={staggerItemVar}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className="group relative rounded-2xl bg-card/90 backdrop-blur-sm border border-border p-5 md:p-6 pt-14 md:pt-16 shadow-sm transition-shadow hover:shadow-md hover:border-primary/25"
              >
                <span className="absolute top-3 left-4 text-xs font-semibold text-primary/70 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary transition-colors group-hover:bg-primary/15">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed pr-2">
                  {moment.text}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export const RevenueCriticalFlowsSection = () => (
  <section className="py-16 md:py-24 relative overflow-hidden">
    <motion.div
      aria-hidden
      className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent pointer-events-none"
      initial={{ scaleX: 1, opacity: 1 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={viewport}
      transition={{ duration: 0.8, ease: easing }}
    />
    <div className="container mx-auto px-6 text-center relative z-10">
      <motion.div className="feature-pill mb-8 inline-flex" {...fadeUpHeader}>
        <TrendingUp className="w-4 h-4" />
        <span>Revenue-critical flows</span>
      </motion.div>
      <motion.h2
        className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
        initial={{ opacity: 1, y: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.55, delay: 0.06, ease: easing }}
      >
        Built for moments where revenue is on the line.
      </motion.h2>
      <motion.p
        className="text-lg text-muted-foreground max-w-3xl mx-auto"
        initial={{ opacity: 1, y: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.5, delay: 0.12, ease: easing }}
      >
        Voiceable is not for support tickets. It is for buying moments where a conversation can unlock a
        decision.
      </motion.p>
    </div>
  </section>
);

export const HowItWorksSection = () => (
  <section id="how-it-works" className="py-20 md:py-32 scroll-mt-28 border-t border-border/60">
    <div className="container mx-auto px-6">
      <div className="max-w-3xl mx-auto text-center mb-14">
        <motion.div className="feature-pill mb-8 inline-flex" {...fadeUpHeader}>
          <Zap className="w-4 h-4" />
          <span>How it works</span>
        </motion.div>
        <motion.h2
          className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.55, delay: 0.05, ease: easing }}
        >
          Live on your phone line in minutes.
        </motion.h2>
        <motion.p
          className="text-lg text-muted-foreground"
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.48, delay: 0.1, ease: easing }}
        >
          Four steps from sign-up to an assistant handling real conversations.
        </motion.p>
      </div>
      <motion.div
        className="grid md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto"
        variants={staggerContainerVar}
        {...staggerParentOpts}
      >
        {howItWorksSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              variants={staggerItemVar}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
              className="relative rounded-3xl border border-border bg-card p-6 flex flex-col h-full shadow-sm transition-shadow hover:shadow-md hover:border-primary/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-primary">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {index + 1}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground flex-1 leading-relaxed">{step.description}</p>
              {index < howItWorksSteps.length - 1 && (
                <motion.div
                  aria-hidden
                  className="hidden md:flex absolute top-1/2 -right-3 z-10 -translate-y-1/2 w-7 h-7 rounded-full bg-background border border-border items-center justify-center shadow-sm"
                  initial={{ opacity: 1, scale: 1 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={viewport}
                  transition={{ delay: 0.15 + index * 0.08, duration: 0.35, ease: easing }}
                >
                  <ArrowRight className="w-3.5 h-3.5 text-primary" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  </section>
);

export const BehavioralShiftSection = () => (
  <section className="py-20 md:py-32">
    <div className="container mx-auto px-6">
      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 md:gap-12 items-center max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 1, x: 0 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={viewport}
          transition={{ duration: 0.55, ease: easing }}
        >
          <div className="feature-pill mb-8 inline-flex">
            <MessageCircle className="w-4 h-4" />
            <span>Why this works</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Buyers want answers now.</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            They are already thinking about buying. Voice gives them the speed, trust, and clarity that forms
            and delayed follow-ups cannot.
          </p>
        </motion.div>
        <motion.div
          className="space-y-4"
          variants={staggerContainerVar}
          initial="visible"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.div
            variants={staggerItemVar}
            className="rounded-3xl border border-border bg-card p-6 shadow-sm"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-pink shrink-0" />
              Buyers do not want
            </h3>
            <div className="space-y-3">
              {buyersReject.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 text-muted-foreground rounded-xl bg-muted/40 px-3 py-2.5 border border-border/50"
                  >
                    <ItemIcon className="w-4 h-4 text-muted-foreground shrink-0 opacity-90" strokeWidth={1.75} />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
          <motion.div
            variants={staggerItemVar}
            className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/10 to-transparent p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <motion.span
                className="rounded-lg bg-primary/20 p-1.5"
                animate={{
                  rotate: [0, 8, -8, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-4 h-4 text-primary" />
              </motion.span>
              <h3 className="font-semibold">They want</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Answers now, when they are already thinking about buying.
            </p>
          </motion.div>
          <motion.div
            variants={staggerItemVar}
            className="rounded-3xl border border-primary/30 bg-primary/10 p-6 shadow-sm"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary shrink-0" />
              Voice brings
            </h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {voiceBrings.map((item) => {
                const VIcon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-background/80 border border-border p-4 text-center transition-transform hover:-translate-y-0.5"
                  >
                    <VIcon className="w-5 h-5 text-primary mx-auto mb-2" strokeWidth={1.75} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center sm:text-left">
              That combination is what closes deals.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  </section>
);

export const HybridScaleSection = () => (
  <section className="py-20 md:py-32 border-t border-border/60 bg-secondary/15">
    <div className="container mx-auto px-6">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <motion.div className="feature-pill mb-8 inline-flex" {...fadeUpHeader}>
          <Brain className="w-4 h-4" />
          <span>AI + human hybrid</span>
        </motion.div>
        <motion.h2
          className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.55, delay: 0.06, ease: easing }}
        >
          Start with your team. Scale with AI.
        </motion.h2>
      </div>
      <motion.div
        className="grid md:grid-cols-3 gap-4 md:gap-6"
        variants={staggerContainerVar}
        {...staggerParentOpts}
      >
        {hybridItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              variants={staggerItemVar}
              whileHover={{ y: -6, transition: { duration: 0.28, ease: easing } }}
              className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg hover:border-primary/20 group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-purple/10 border border-primary/20 text-primary mb-5 transition-transform group-hover:scale-105">
                <Icon className="w-7 h-7" strokeWidth={1.6} />
              </div>
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  </section>
);

export const MetricsProofSection = () => (
  <section className="py-20">
    <div className="container mx-auto px-6">
      <motion.div
        className="max-w-5xl mx-auto rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-transparent to-purple/10 p-[1px] shadow-md"
        initial={{ opacity: 1, y: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.55, ease: easing }}
      >
        <div className="rounded-[calc(var(--radius)-2px)] bg-card p-8 md:p-12">
          <motion.p className="text-primary font-medium mb-2 flex items-center gap-2" {...fadeUpHeader}>
            <BarChart3 className="w-5 h-5 opacity-90" strokeWidth={1.75} />
            Teams using Voiceable see
          </motion.p>
          <motion.div
            className="grid md:grid-cols-3 gap-8 md:gap-6"
            variants={staggerContainerVar}
            {...staggerParentOpts}
          >
            {proofItems.map((item) => {
              const PIcon = item.icon;
              return (
                <motion.div key={item.title} variants={staggerItemVar} className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 border border-primary/25 text-primary mb-4">
                    <PIcon className="w-6 h-6" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
          <motion.p
            className="text-xs text-muted-foreground mt-8 border-t border-border pt-8"
            initial={{ opacity: 1 }}
            whileInView={{ opacity: 1 }}
            viewport={viewport}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            Replace these proof points with real numbers once stronger performance data is available.
          </motion.p>
        </div>
      </motion.div>
    </div>
  </section>
);

export const ContrastSection = () => (
  <section className="py-20 md:py-32 scroll-mt-28">
    <div className="container mx-auto px-6">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <motion.div className="feature-pill mb-6 inline-flex" {...fadeUpHeader}>
          <GitCompare className="w-4 h-4" />
          <span>Strong contrast</span>
        </motion.div>
        <motion.h2
          className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.52, delay: 0.05, ease: easing }}
        >
          Anonymous traffic versus live buyer conversations.
        </motion.h2>
        <motion.p
          className="text-lg text-muted-foreground"
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.45, delay: 0.1, ease: easing }}
        >
          The gap is not traffic quality. It is whether you engage intent while it still exists.
        </motion.p>
      </div>
      <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">
        <motion.div
          className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm"
          initial={{ opacity: 1, x: 0 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={viewport}
          transition={{ duration: 0.5, ease: easing }}
        >
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <XCircle className="w-7 h-7 text-muted-foreground" />
            Without Voiceable
          </h3>
          <ul className="space-y-3">
            {withoutVoiceable.map((item, i) => {
              const WIC = item.icon;
              return (
                <motion.li
                  key={item.text}
                  initial={{ opacity: 1, x: 0 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={viewport}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: easing }}
                  className="flex items-center gap-3 text-muted-foreground rounded-xl border border-transparent bg-muted/30 px-3 py-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-pink border border-border/60">
                    <WIC className="w-4 h-4" strokeWidth={1.75} />
                  </span>
                  <span>{item.text}</span>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>
        <motion.div
          className="rounded-3xl border border-primary/35 bg-gradient-to-br from-primary/18 to-purple/15 p-6 md:p-8 shadow-md ring-1 ring-primary/15"
          initial={{ opacity: 1, x: 0 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={viewport}
          transition={{ duration: 0.5, ease: easing }}
        >
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-7 h-7 text-primary" />
            With Voiceable
          </h3>
          <ul className="space-y-3">
            {withVoiceable.map((item, i) => {
              const WIC = item.icon;
              return (
                <motion.li
                  key={item.text}
                  initial={{ opacity: 1, x: 0 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={viewport}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: easing }}
                  className="flex items-center gap-3 rounded-xl border border-primary/25 bg-background/60 px-3 py-3 backdrop-blur-sm"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 border border-primary/25 text-primary">
                    <WIC className="w-4 h-4" strokeWidth={1.75} />
                  </span>
                  <span>{item.text}</span>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>
      </div>
    </div>
  </section>
);
