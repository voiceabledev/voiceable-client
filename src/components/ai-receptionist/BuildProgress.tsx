"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The wait is the weakest moment in the funnel — a bare spinner makes ~20
 * seconds feel broken. These steps mirror the real backend stages (fetch pages
 * -> extract details -> configure the agent), and the final one only completes
 * when the server actually reports ready, so the UI never claims to be done
 * before it is.
 */
const STEPS = [
  { label: "Reading your homepage", after: 0 },
  { label: "Looking for services and hours", after: 3500 },
  { label: "Picking up common questions", after: 8000 },
  { label: "Building your receptionist", after: 13000 },
];

export function BuildProgress({ website }: { website: string }) {
  const [elapsed, setElapsed] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const started = Date.now();
    const t = setInterval(() => setElapsed(Date.now() - started), 250);
    return () => clearInterval(t);
  }, []);

  // The last step stays in-progress until the parent swaps this component out.
  const activeIndex = STEPS.reduce(
    (acc, step, i) => (elapsed >= step.after ? i : acc),
    0,
  );

  return (
    <div className="mx-auto w-full max-w-md text-center">
      <div className="relative mx-auto mb-10 h-28 w-28">
        {/* Orbiting ring */}
        {!reduce && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-dashed border-emerald-400/30"
          />
        )}
        <motion.div
          animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-3 flex items-center justify-center rounded-full bg-emerald-400/10 ring-1 ring-inset ring-emerald-400/25"
        >
          <Globe className="h-9 w-9 text-emerald-300" />
        </motion.div>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Building your receptionist
      </h1>
      <p className="mt-3 text-sm text-white/50">
        Reading <span className="text-white/80">{website}</span>
      </p>

      <ul className="mx-auto mt-10 space-y-3 text-left">
        {STEPS.map((step, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;

          return (
            <motion.li
              key={step.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: done || active ? 1 : 0.35, x: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3"
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors",
                  done && "bg-emerald-400/15 text-emerald-300",
                  active && "bg-emerald-400/10 text-emerald-300",
                  !done && !active && "bg-white/[0.06] text-white/30",
                )}
              >
                {done ? (
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </motion.span>
                ) : active ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </span>
              <span
                className={cn(
                  "text-sm transition-colors",
                  done ? "text-white/55" : active ? "text-white" : "text-white/35",
                )}
              >
                {step.label}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
