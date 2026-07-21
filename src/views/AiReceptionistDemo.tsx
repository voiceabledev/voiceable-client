"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Phone, PhoneCall, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { demoSessionsApi, type DemoSession } from "@/lib/api";
import { formatPhoneNumber, toE164, formatE164ForDisplay } from "@/lib/phone";
import { AuthBrandLink } from "@/components/auth/AuthBrandLink";

const STEPS = [
  { title: "Enter your phone number", detail: "That's where we'll ring you." },
  { title: "Add your website", detail: "We read it to learn your hours, services and FAQs." },
  { title: "Answer and talk to it", detail: "We call you in seconds. Ask it anything." },
];

/** Copy shown while the build job runs. Deliberately mirrors the real stages. */
const WORKING_COPY: Record<string, string> = {
  pending: "Scanning your website…",
  scraping: "Scanning your website…",
};

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

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  // Poll while the receptionist is being built.
  useEffect(() => {
    if (!session || session.status === "ready" || session.status === "failed" || session.status === "busy") {
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

  const isWorking =
    session !== null && (session.status === "pending" || session.status === "scraping");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <header className="mb-10">
          <AuthBrandLink href="/" />
        </header>

        {!session && (
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Three steps to a working AI receptionist
              </h1>
              <p className="mt-3 text-muted-foreground">
                It answers your phone, knows your business, and never misses a call.
              </p>

              <ol className="mt-8 space-y-5">
                {STEPS.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {i + 1}
                    </span>
                    <div>
                      <div className="font-medium">{step.title}</div>
                      <p className="text-sm text-muted-foreground">{step.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="lg:pt-4">
              <form
                onSubmit={handleSubmit}
                className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
                noValidate
              >
                <div className="space-y-2">
                  <Label htmlFor="phone">Your phone number</Label>
                  <Input
                    id="phone"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Your website</Label>
                  <Input
                    id="website"
                    inputMode="url"
                    autoComplete="url"
                    placeholder="abcmassage.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting…
                    </>
                  ) : (
                    <>
                      Try it
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  No signup. Takes about 30 seconds.
                </p>
              </form>
            </div>
          </div>
        )}

        {isWorking && (
          <div className="mx-auto max-w-md text-center">
            <div className="mb-6 inline-flex rounded-full bg-primary/10 p-5">
              <Globe className="h-10 w-10 animate-pulse text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {WORKING_COPY[session.status] ?? "Building your receptionist…"}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Reading {website} for your hours, services and common questions.
            </p>
            <Loader2 className="mx-auto mt-8 h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {session?.status === "ready" && (
          <div className="mx-auto max-w-lg text-center">
            <div className="mb-6 inline-flex rounded-full bg-primary/10 p-5">
              <PhoneCall className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {session.business_name
                ? `Your receptionist for ${session.business_name} is ready`
                : "Your receptionist is ready"}
            </h1>

            {calling && (
              <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting your call…
              </p>
            )}

            {!calling && session.call_placed && (
              <>
                <p className="mt-3 text-sm text-muted-foreground">
                  We&apos;re calling you now at
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                  {session.phone_e164 ? formatE164ForDisplay(session.phone_e164) : ""}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Answer your phone and start talking.
                </p>
              </>
            )}

            {callError && (
              <div className="mt-4">
                <p role="alert" className="text-sm text-destructive">
                  {callError}
                </p>
                <Button
                  onClick={() => placeCall(session.id, true)}
                  variant="outline"
                  className="mt-3"
                  disabled={calling}
                >
                  Try calling me again
                </Button>
              </div>
            )}

            {session.suggested_questions?.length > 0 && (
              <div className="mt-10 rounded-2xl border border-border bg-card p-6 text-left">
                <h2 className="mb-4 text-sm font-semibold">Some things to try asking</h2>
                <ul className="space-y-3">
                  {session.suggested_questions.map((q) => (
                    <li key={q} className="flex gap-3 text-sm text-muted-foreground">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>&ldquo;{q}&rdquo;</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!calling && session.call_placed && !callError && (
              <Button
                onClick={() => placeCall(session.id, true)}
                variant="outline"
                size="sm"
                className="mt-8"
              >
                Call me again
              </Button>
            )}

            <p className="mt-8 text-xs text-muted-foreground">
              This is a demo, so it only knows what we could read from your website.
            </p>
          </div>
        )}

        {session?.status === "busy" && (
          <div className="mx-auto max-w-md text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              The demo line is in use right now
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Someone else is trying theirs out. Give it a few minutes and try again —
              we&apos;ve saved your details.
            </p>
            <Button onClick={reset} variant="outline" className="mt-8">
              Try again
            </Button>
          </div>
        )}

        {session?.status === "failed" && (
          <div className="mx-auto max-w-md text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              We couldn&apos;t read that website
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {session.failure_reason ||
                "Check the address and try again, or try a different page of your site."}
            </p>
            <Button onClick={reset} variant="outline" className="mt-8">
              Try again
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
