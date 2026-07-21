"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, PhoneCall, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { demoSessionsApi, type DemoSession } from "@/lib/api";
import { formatPhoneNumber, toE164, formatE164ForDisplay } from "@/lib/phone";
import { AuthBrandLink } from "@/components/auth/AuthBrandLink";
import { Aurora } from "@/components/ai-receptionist/Aurora";
import { BuildProgress } from "@/components/ai-receptionist/BuildProgress";

const STEPS = [
  { title: "Enter your phone number", detail: "That's where we'll ring you." },
  { title: "Add your website", detail: "We read it to learn your hours, services and FAQs." },
  { title: "Answer and talk to it", detail: "We call you in seconds. Ask it anything." },
];

const EASE = [0.16, 1, 0.3, 1] as const;

/** Entrance stagger for the hero column. */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

const INPUT_CLASS =
  "h-12 border-white/10 bg-white/[0.04] text-base text-white placeholder:text-white/25 focus-visible:ring-emerald-400/40";

export default function AiReceptionistDemo() {
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState<DemoSession | null>(null);
  const [calling, setCalling] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Polling keeps firing while the call request is in flight, so guard the
  // auto-trigger in a ref rather than on session state.
  const callTriggeredRef = useRef(false);
  const reduce = useReducedMotion();

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  // Poll while the receptionist is being built.
  useEffect(() => {
    if (
      !session ||
      session.status === "ready" ||
      session.status === "failed" ||
      session.status === "busy"
    ) {
      stopPolling();
      return;
    }
    if (pollRef.current) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await demoSessionsApi.get(session.id);
        if (res.data) setSession(res.data);
      } catch {
        // Transient poll failures are not worth surfacing; the next tick retries.
      }
    }, 2000);

    return stopPolling;
  }, [session, stopPolling]);

  const placeCall = useCallback(async (id: number, isRetry = false) => {
    setCalling(true);
    setCallError(null);
    try {
      const res = await demoSessionsApi.call(id, { retry: isRetry });
      if (res.data) setSession(res.data);
    } catch (err) {
      setCallError(err instanceof Error ? err.message : "We couldn't place the call.");
    } finally {
      setCalling(false);
    }
  }, []);

  // Ring the visitor as soon as the receptionist is ready.
  useEffect(() => {
    if (session?.status !== "ready") return;
    if (session.call_placed || callTriggeredRef.current) return;

    callTriggeredRef.current = true;
    void placeCall(session.id);
  }, [session, placeCall]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const e164 = toE164(phone);
    if (!e164) {
      setError("Enter a 10-digit phone number.");
      return;
    }
    if (!website.trim().includes(".")) {
      setError("Enter your website, like abcmassage.com");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const res = await demoSessionsApi.create({ phone: e164, website: website.trim() });
      if (res.data) setSession(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    stopPolling();
    callTriggeredRef.current = false;
    setSession(null);
    setError(null);
    setCallError(null);
  };

  // AnimatePresence with mode="wait" must receive exactly ONE child. Several
  // sibling `&&` branches leave it holding the exiting screen forever and the
  // next screen never mounts, so the whole UI is keyed off this single value.
  const phase: "form" | "working" | "ready" | "halted" = !session
    ? "form"
    : session.status === "pending" || session.status === "scraping"
      ? "working"
      : session.status === "ready"
        ? "ready"
        : "halted";

  function renderForm() {
    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid w-full gap-14 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-20"
      >
        <div>
          <motion.div
            variants={item}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            No signup — live in about 30 seconds
          </motion.div>

          <motion.h1
            variants={item}
            className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]"
          >
            Three steps to a working{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              AI receptionist
            </span>
          </motion.h1>

          <motion.p variants={item} className="mt-5 max-w-md text-lg text-white/55">
            It answers your phone, knows your business, and never misses a call.
          </motion.p>

          <motion.ol variants={item} className="relative mt-10 space-y-6">
            <span
              aria-hidden
              className="absolute left-[15px] top-3 h-[calc(100%-2rem)] w-px bg-gradient-to-b from-emerald-400/40 via-white/10 to-transparent"
            />
            {STEPS.map((step, i) => (
              <motion.li key={step.title} variants={item} className="relative flex gap-5">
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-400/25 bg-[#0B1219] text-sm font-semibold text-emerald-300">
                  {i + 1}
                </span>
                <div className="pt-0.5">
                  <div className="font-medium text-white">{step.title}</div>
                  <p className="mt-1 text-sm text-white/45">{step.detail}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>

        <motion.div variants={item}>
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-px rounded-[1.4rem] bg-gradient-to-b from-emerald-400/25 to-transparent opacity-60 blur-[2px]"
            />
            <form
              onSubmit={handleSubmit}
              noValidate
              className="relative space-y-5 rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-7 backdrop-blur-xl"
            >
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white/70">
                  Your phone number
                </Label>
                <Input
                  id="phone"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                  disabled={submitting}
                  className={INPUT_CLASS}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-white/70">
                  Your website
                </Label>
                <Input
                  id="website"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="abcmassage.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  disabled={submitting}
                  className={INPUT_CLASS}
                />
              </div>

              {error && (
                <p role="alert" className="flex items-center gap-2 text-sm text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="group h-12 w-full bg-gradient-to-r from-emerald-500 to-teal-400 text-base font-semibold text-[#04120C] shadow-[0_0_30px_-6px_rgba(52,211,153,0.6)] transition-all hover:brightness-110 hover:shadow-[0_0_44px_-6px_rgba(52,211,153,0.75)]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting…
                  </>
                ) : (
                  <>
                    Try it
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-white/35">
                We only call the number you enter. No spam, ever.
              </p>
            </form>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  function renderReady(current: DemoSession) {
    return (
      <div className="mx-auto w-full max-w-xl text-center">
        {/* Ringing phone: concentric pulses */}
        <div className="relative mx-auto mb-8 h-32 w-32">
          {!reduce &&
            [0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute inset-0 rounded-full border border-emerald-400/40"
                initial={{ scale: 0.6, opacity: 0.55 }}
                animate={{ scale: 1.65, opacity: 0 }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "easeOut",
                }}
              />
            ))}
          <div className="absolute inset-6 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 shadow-[0_0_50px_-8px_rgba(52,211,153,0.8)]">
            <motion.span
              animate={reduce ? undefined : { rotate: [0, -12, 12, -8, 8, 0] }}
              transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 1.4 }}
            >
              <PhoneCall className="h-9 w-9 text-[#04120C]" />
            </motion.span>
          </div>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {current.business_name ? (
            <>
              Your receptionist for{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                {current.business_name}
              </span>{" "}
              is ready
            </>
          ) : (
            "Your receptionist is ready"
          )}
        </h1>

        {calling && (
          <p className="mt-5 flex items-center justify-center gap-2 text-sm text-white/55">
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting your call…
          </p>
        )}

        {!calling && current.call_placed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6"
          >
            <p className="text-sm text-white/50">We&apos;re calling you now at</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-300 sm:text-4xl">
              {current.phone_e164 ? formatE164ForDisplay(current.phone_e164) : ""}
            </p>
            <p className="mt-3 text-sm text-white/45">Answer your phone and start talking.</p>
          </motion.div>
        )}

        {callError && (
          <div className="mt-6">
            <p role="alert" className="text-sm text-rose-300">
              {callError}
            </p>
            <Button
              onClick={() => placeCall(current.id, true)}
              variant="outline"
              className="mt-3 border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]"
              disabled={calling}
            >
              Try calling me again
            </Button>
          </div>
        )}

        {current.suggested_questions?.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mt-12 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-left backdrop-blur"
          >
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">
              Some things to try asking
            </h2>
            <ul className="space-y-2.5">
              {current.suggested_questions.map((q) => (
                <motion.li
                  key={q}
                  variants={item}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white/70"
                >
                  &ldquo;{q}&rdquo;
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {!calling && current.call_placed && !callError && (
          <Button
            onClick={() => placeCall(current.id, true)}
            variant="ghost"
            size="sm"
            className="mt-8 text-white/50 hover:bg-white/[0.06] hover:text-white"
          >
            Call me again
          </Button>
        )}

        <p className="mt-6 text-xs text-white/30">
          This is a demo, so it only knows what we could read from your website.
        </p>
      </div>
    );
  }

  function renderHalted(current: DemoSession) {
    const busy = current.status === "busy";
    const minutes =
      current.retry_after_seconds && current.retry_after_seconds > 0
        ? Math.ceil(current.retry_after_seconds / 60)
        : null;

    return (
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
          <AlertCircle className="h-7 w-7 text-amber-300" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          {busy ? "The demo line is in use right now" : "We couldn't read that website"}
        </h1>

        <p className="mt-3 text-sm text-white/50">
          {busy
            ? minutes
              ? `Someone else is trying theirs out. It frees up in about ${minutes} minute${
                  minutes === 1 ? "" : "s"
                } — we've saved your details.`
              : "Someone else is trying theirs out. Try again in a moment — we've saved your details."
            : current.failure_reason ||
              "Check the address and try again, or try a different page of your site."}
        </p>

        <Button
          onClick={reset}
          variant="outline"
          className="mt-8 border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]"
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070B10] text-white">
      <Aurora />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <header>
          <AuthBrandLink href="/" variant="onDark" />
        </header>

        <div className="flex flex-1 items-center py-10">
          {/*
            No AnimatePresence here. With mode="wait" it kept the exiting
            screen mounted and never swapped in the next one, so the UI froze
            on the form while the session actually completed behind it. A plain
            keyed motion.div remounts cleanly on every phase change; we lose the
            exit animation and keep a working funnel.
          */}
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="w-full"
          >
            {phase === "form" && renderForm()}
            {phase === "working" && <BuildProgress website={website} />}
            {phase === "ready" && session && renderReady(session)}
            {phase === "halted" && session && renderHalted(session)}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
