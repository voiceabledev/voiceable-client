"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Database, DollarSign, Phone, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Header from "@/components/landing-page/Header";
import Footer from "@/components/landing-page/Footer";

/** Voice top-up tiers: prices include markup vs internal base; rounded to whole dollars. */
const VOICE_TOP_UPS: { quantity: number; priceUsd: number }[] = [
  { quantity: 250, priceUsd: 41 },
  { quantity: 500, priceUsd: 83 },
  { quantity: 1000, priceUsd: 166 },
  { quantity: 1500, priceUsd: 248 },
  { quantity: 3000, priceUsd: 497 },
  { quantity: 6000, priceUsd: 992 },
  { quantity: 12000, priceUsd: 1985 },
];

/** Per-minute rate shown in copy: $0.15 × 1.05², rounded to cents. */
const UNIT_RATE_USD = Math.round(0.15 * 1.05 * 1.05 * 100) / 100;

const MAX_MINUTES = Math.max(...VOICE_TOP_UPS.map((t) => t.quantity));

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatUsdPerMinute(n: number, fractionDigits: 2 | 3 = 2) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(n);
}

const easeOut = [0.22, 1, 0.36, 1] as const;

/** Shown in comparison table for PAYG hosting line. */
const HOSTING_COST_PER_MIN_USD = 0.0525;

/** One-time setup when provisioning a Voiceable phone number (not required for web-only voice). */
const PHONE_NUMBER_SETUP_FEE_USD = 5;

const PRICING_FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "Can I try for free?",
    a: "We periodically offer trials and pilots depending on your use case. Create an account to see what is available today, or contact sales if you need a guided evaluation or demo environment.",
  },
  {
    q: "Can I get fixed monthly pricing instead of pay-as-you-go?",
    a: "Yes, we offer enterprise plans with fixed monthly pricing. Contact our sales team to discuss your needs.",
  },
  {
    q: "Can I get volume discounts?",
    a: "Yes. Larger prepaid bundles improve effective rates; committed volume and enterprise agreements include additional discounts. Contact sales for a quote tailored to your traffic.",
  },
  {
    q: "What does pricing look like at scale?",
    a: "Beyond standard bundles, pricing moves to volume agreements: committed minutes, optional SLAs, and tailored support. We will model total cost with you based on traffic, regions, and channels.",
  },
  {
    q: "How can I get more than 14 days of call history?",
    a: "Default retention for call history is 14 days on standard bundles. Longer retention, exports, and compliance-friendly storage are available on enterprise plans. Contact sales to extend retention.",
  },
];

function ComparisonSectionHeader({ icon: Icon, label }: { icon: typeof TrendingUp; label: string }) {
  return (
    <TableRow className="border-b-0 hover:bg-transparent">
      <TableCell colSpan={3} className="bg-emerald-500/[0.09] dark:bg-emerald-500/15 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
          <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          {label}
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function Pricing() {
  const [showTalkCalendar, setShowTalkCalendar] = useState(false);
  const [bundlesOpen, setBundlesOpen] = useState(false);
  const reducedMotionPreference = useReducedMotion();
  const prefersReducedMotion = reducedMotionPreference === true;

  const heroTransition = prefersReducedMotion ? { duration: 0 } : { duration: 0.55, ease: easeOut };
  const blockTransition = prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.06, ease: easeOut };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="bg-background">
        {/* Hero — minimal, reference layout */}
        <section className="relative pt-28 pb-16 px-6">
          <div className="relative max-w-3xl mx-auto text-center space-y-5">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={heroTransition}
              className="flex justify-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-3.5 py-1.5 text-xs font-semibold text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200">
                <DollarSign className="h-3.5 w-3.5" aria-hidden />
                Transparent Pricing
              </span>
            </motion.div>
            <motion.h1
              className="text-4xl md:text-5xl font-bold tracking-tight text-balance text-foreground"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...heroTransition, delay: prefersReducedMotion ? 0 : 0.04 }}
            >
              Simple, scalable{" "}
              <span className="text-orange-500 dark:text-orange-400">pricing</span>
            </motion.h1>
            <motion.p
              className="text-base md:text-lg text-muted-foreground leading-relaxed text-balance max-w-xl mx-auto"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...heroTransition, delay: prefersReducedMotion ? 0 : 0.1 }}
            >
              Pay only for what you use. No hidden fees, no surprises.
            </motion.p>
          </div>
        </section>

        {/* Two-column plans */}
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-4xl">
            <motion.div
              className="grid gap-6 sm:grid-cols-2 sm:gap-8"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={blockTransition}
            >
              <div className="flex flex-col rounded-2xl border border-border bg-card px-8 py-10 text-center shadow-sm">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Pay As You Go</h2>
                <p className="mt-2 text-sm text-muted-foreground">Usage based pricing</p>
                <div className="mt-8">
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-full px-8 font-semibold border-foreground/20 hover:bg-muted/50"
                  >
                    <Link href="/sign-up">Start with $10 Free</Link>
                  </Button>
                </div>
              </div>
              <div className="flex flex-col rounded-2xl border border-border bg-card px-8 py-10 text-center shadow-sm">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Enterprise</h2>
                <p className="mt-2 text-sm text-muted-foreground">Annual contract with custom pricing</p>
                <div className="mt-8">
                  <Button
                    type="button"
                    size="lg"
                    className="rounded-full px-8 font-semibold bg-foreground text-background hover:bg-foreground/90"
                    onClick={() => setShowTalkCalendar(true)}
                  >
                    Contact Sales
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="px-6 pb-20">
          <motion.div
            className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, ease: easeOut }}
          >
            <Table>
              <TableHeader>
                <TableRow className="border-b hover:bg-transparent">
                  <TableHead className="w-[40%] font-semibold text-foreground bg-muted/30" />
                  <TableHead className="text-center font-semibold text-foreground bg-muted/30">
                    Pay As You Go
                  </TableHead>
                  <TableHead className="text-center font-semibold text-foreground bg-muted/30">Enterprise</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <ComparisonSectionHeader icon={TrendingUp} label="Usage and Scale" />
                <TableRow className="border-border/80">
                  <TableCell className="font-medium text-foreground">Call minutes</TableCell>
                  <TableCell className="text-center text-muted-foreground">Usage based</TableCell>
                  <TableCell className="text-center text-muted-foreground">Custom</TableCell>
                </TableRow>
                <ComparisonSectionHeader icon={Database} label="Platform" />
                <TableRow className="border-border/80">
                  <TableCell className="font-medium text-foreground">Hosting (calls)</TableCell>
                  <TableCell className="text-center tabular-nums text-muted-foreground">
                    {formatUsdPerMinute(HOSTING_COST_PER_MIN_USD, 3)} / min
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">Custom</TableCell>
                </TableRow>
                <TableRow className="border-border/80">
                  <TableCell className="align-top">
                    <span className="font-medium text-foreground">Phone number setup</span>
                    <span className="mt-1 block text-xs font-normal text-muted-foreground leading-snug">
                      Per number if you use a Voiceable phone line.
                    </span>
                  </TableCell>
                  <TableCell className="text-center align-middle tabular-nums text-muted-foreground">
                    {formatUsd(PHONE_NUMBER_SETUP_FEE_USD)} / number
                  </TableCell>
                  <TableCell className="text-center align-middle text-muted-foreground">Custom</TableCell>
                </TableRow>
                <TableRow className="border-border/80">
                  <TableCell className="font-medium text-foreground">Channels</TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex justify-center" aria-label="Included">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex justify-center" aria-label="Included">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow className="border-0">
                  <TableCell className="font-medium text-foreground">Call history</TableCell>
                  <TableCell className="text-center tabular-nums text-muted-foreground">14 days</TableCell>
                  <TableCell className="text-center text-muted-foreground">Extended options</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </motion.div>

          {/* Bundles — collapsed by default to match simpler page; still available */}
          <motion.div
            className="mx-auto max-w-4xl mt-10"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: easeOut }}
          >
            <Collapsible open={bundlesOpen} onOpenChange={setBundlesOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-border/80 bg-muted/20 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/35"
                >
                  <span>Prepaid minute bundles ({VOICE_TOP_UPS.length} tiers)</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${bundlesOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden">
                <Card className="mt-3 border-border/80 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Bundles</CardTitle>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Minutes cover inbound, outbound, and web voice. Above{" "}
                      <span className="tabular-nums font-medium text-foreground">
                        {MAX_MINUTES.toLocaleString("en-US")}
                      </span>{" "}
                      minutes, use Enterprise for volume pricing. Adding a Voiceable phone number includes a{" "}
                      <span className="font-medium text-foreground">
                        {formatUsd(PHONE_NUMBER_SETUP_FEE_USD)} setup fee per number
                      </span>
                      ; web-only assistants do not incur this charge.
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Minutes included</TableHead>
                          <TableHead className="text-right">Bundle price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {VOICE_TOP_UPS.map((row) => (
                          <TableRow key={row.quantity}>
                            <TableCell className="font-medium tabular-nums">{row.quantity.toLocaleString("en-US")}</TableCell>
                            <TableCell className="text-right tabular-nums font-medium">{formatUsd(row.priceUsd)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
            <div className="mt-6 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-4">
              <p className="text-sm text-muted-foreground max-sm:w-full">
                Need volume or terms beyond these bundles?
              </p>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="rounded-full px-8 font-semibold border-foreground/20 shrink-0"
                onClick={() => setShowTalkCalendar(true)}
              >
                Contact sales for custom pricing
              </Button>
            </div>
          </motion.div>
        </section>

        {/* FAQ — centered, minimal chrome */}
        <section className="px-6 pb-24">
          <motion.div
            className="mx-auto max-w-2xl"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, ease: easeOut }}
          >
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center text-foreground mb-12">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {PRICING_FAQ_ITEMS.map((item, index) => (
                <AccordionItem key={item.q} value={`faq-${index}`} className="border-border">
                  <AccordionTrigger className="text-left text-[15px] font-medium text-foreground hover:no-underline py-5 [&[data-state=open]]:text-foreground">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-[15px] leading-relaxed pb-6 pt-0">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </section>
      </main>

      <Footer />

      <Dialog open={showTalkCalendar} onOpenChange={setShowTalkCalendar}>
        <DialogContent className="max-w-4xl w-[95vw] h-[85vh] max-h-[720px] p-0 flex flex-col gap-0">
          <DialogTitle className="sr-only">Schedule a call with Voiceable</DialogTitle>
          <div className="flex-1 overflow-hidden min-h-0 rounded-b-lg">
            <iframe
              src="https://cal.com/voiceabledev/30min?overlayCalendar=true"
              className="w-full h-full min-h-[480px] border-0"
              title="Schedule a call with Voiceable"
              allow="camera; microphone; geolocation"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
