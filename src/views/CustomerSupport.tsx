"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Headphones,
  HeartHandshake,
  PhoneCall,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Wand2,
  Zap,
} from "lucide-react";

import Header from "@/components/landing-page/Header";
import Footer from "@/components/landing-page/Footer";
import CTASection from "@/components/landing-page/CTASection";
import { DemoCallModal } from "@/components/landing-page/DemoCallModal";
import { Button } from "@/components/ui/button";

const easing = [0.16, 1, 0.3, 1] as const;
const viewport = { once: true, margin: "-72px", amount: 0.2 as const };

const howItWorks = [
  {
    icon: Zap,
    title: "Instant response",
    description:
      "Resolve common issues — order tracking, password resets, refund status — without making customers wait on hold.",
  },
  {
    icon: Wand2,
    title: "Contextual support",
    description:
      "Pull real-time data from your CRM, billing, and support tools so every conversation feels personal and informed.",
  },
  {
    icon: HeartHandshake,
    title: "Smart escalation",
    description:
      "Hand complex cases to your human team with full transcripts, intent, and account context for faster resolution.",
  },
];

const outcomes = [
  {
    icon: TrendingDown,
    label: "Reduce average handle time",
    detail: "Voice agents answer instantly and resolve in seconds.",
  },
  {
    icon: TrendingUp,
    label: "Improve first-call resolution",
    detail: "Context is collected up front so issues close on the first call.",
  },
  {
    icon: BadgeCheck,
    label: "Lower support costs",
    detail: "Automate the repetitive 60–80% so your team handles what matters.",
  },
  {
    icon: Clock,
    label: "Deliver 24/7 service",
    detail: "Coverage across nights, weekends, and holidays without growing headcount.",
  },
];

const integrations = [
  "Salesforce",
  "HubSpot",
  "Zendesk",
  "Intercom",
  "Stripe",
  "Shopify",
  "Twilio",
  "Slack",
];

const CustomerSupport = () => {
  const [showDemoCallModal, setShowDemoCallModal] = useState(false);

  return (
    <div
      className="min-h-screen bg-background text-foreground overflow-x-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <Header />

      <main>
        <section className="relative pt-32 md:pt-40 pb-20 md:pb-28 overflow-hidden">
          <div className="hero-glow" aria-hidden />
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 mb-8">
                <Headphones className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm text-primary font-medium">
                  Customer support, automated
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Resolve customer issues{" "}
                <span className="text-gradient-amber">faster and better</span>{" "}
                with AI
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-10">
                Voiceable automates your front line with intelligent voice agents that handle common
                questions, troubleshoot problems, and escalate when needed — all in real time, 24/7.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-7 py-6"
                  onClick={() => setShowDemoCallModal(true)}
                >
                  Request a demo
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  variant="ghost"
                  className="text-foreground hover:bg-secondary rounded-full px-7 py-6 border-2 border-foreground"
                  onClick={() => {
                    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  See how it works
                </Button>
              </div>

              <p className="mt-10 text-sm text-muted-foreground">
                Trusted by support and revenue teams delivering better customer experiences.
              </p>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="py-20 md:py-28 scroll-mt-28 border-t border-border/60"
        >
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-14">
              <div className="feature-pill mb-6 inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>How it works</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Deliver better customer service experiences.
              </h2>
              <p className="text-lg text-muted-foreground">
                When a customer calls in, Voiceable answers instantly and walks them through your
                support workflows using natural conversation. The agent understands intent, pulls in
                relevant account details, answers questions, and resolves the issue — or routes it to
                a human with full context.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
              {howItWorks.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={viewport}
                    whileHover={{ y: -4, transition: { duration: 0.25 } }}
                    transition={{ duration: 0.5, ease: easing }}
                    className="relative rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm transition-shadow hover:shadow-md hover:border-primary/25"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-primary">
                        <Icon className="h-6 w-6" strokeWidth={1.75} />
                      </div>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                        {index + 1}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 border-t border-border/60 bg-secondary/15">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <div className="feature-pill mb-6 inline-flex items-center gap-2">
                <BadgeCheck className="w-4 h-4" />
                <span>Outcomes</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                The results speak for themselves.
              </h2>
              <p className="text-lg text-muted-foreground">
                Teams running Voiceable on their support line see measurable change in volume,
                resolution speed, and cost-to-serve.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
              {outcomes.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md hover:border-primary/25"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-5">
                      <Icon className="w-6 h-6" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-base font-semibold mb-2">{item.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 border-t border-border/60">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-sm uppercase tracking-wider text-muted-foreground mb-6">
                Plugs into the tools your support team already uses
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {integrations.map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 border-t border-border/60">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto rounded-3xl border border-border bg-card p-8 md:p-12 grid md:grid-cols-[1.1fr_1fr] gap-8 items-center">
              <div>
                <div className="feature-pill mb-6 inline-flex items-center gap-2">
                  <PhoneCall className="w-4 h-4" />
                  <span>Demo phone call</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  See what Voiceable can do for your support team.
                </h2>
                <p className="text-muted-foreground mb-6">
                  Hear a live conversation in under 60 seconds. Voiceable will call you, walk you
                  through a real support flow, and show how escalation hands off to a human with
                  full context.
                </p>
                <Button
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-7 py-6"
                  onClick={() => setShowDemoCallModal(true)}
                >
                  Request a demo
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="rounded-2xl border border-border bg-background/60 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Inbound support call</p>
                    <p className="text-xs text-muted-foreground">Order tracking — 0:47</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <p className="rounded-xl bg-muted/40 border border-border/60 p-3">
                    <span className="font-medium text-foreground">Customer:</span> Hey, I&apos;m
                    trying to find out where my order is. It&apos;s been five days.
                  </p>
                  <p className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                    <span className="font-medium text-primary">Voiceable:</span> I&apos;ve pulled it
                    up — your order shipped from our Reno warehouse and is out for delivery today
                    before 8 PM. Want me to text you the tracking link now?
                  </p>
                  <p className="rounded-xl bg-muted/40 border border-border/60 p-3">
                    <span className="font-medium text-foreground">Customer:</span> Yes, please.
                  </p>
                  <p className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                    <span className="font-medium text-primary">Voiceable:</span> Sent. Anything else
                    I can help with today?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <CTASection
          title="Voice support agent"
          description="Staff your support line with an AI agent available 24/7 in any language — and let your team focus on the calls that need a human."
          features={[
            "Resolves common support issues instantly",
            "Pulls real-time context from your stack",
            "Escalates to humans with full transcripts",
            "Available 24/7 in 30+ languages",
          ]}
          primaryButtonLabel="Talk to Voiceable"
          primaryButtonAction="demo"
          secondaryButtonLabel="Book a demo"
          secondaryButtonAction="calendar"
        />
      </main>

      <Footer />

      <DemoCallModal
        open={showDemoCallModal}
        onOpenChange={setShowDemoCallModal}
        onSubmit={(data) => {
          console.log("Demo call requested:", data);
        }}
      />
    </div>
  );
};

export default CustomerSupport;
