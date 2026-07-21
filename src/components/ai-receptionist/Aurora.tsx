"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Ambient background for the ad landing page: two slow-drifting colour fields
 * over a faint grid. Deliberately low-contrast — it should read as depth, not
 * decoration, and never compete with the form.
 *
 * Honours prefers-reduced-motion by rendering the same composition static.
 */
export function Aurora() {
  const reduce = useReducedMotion();

  const drift = (dx: number, dy: number, seconds: number) =>
    reduce
      ? undefined
      : {
          x: [0, dx, 0],
          y: [0, dy, 0],
          transition: {
            duration: seconds,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        };

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base wash */}
      <div className="absolute inset-0 bg-[#070B10]" />

      {/* Colour fields */}
      <motion.div
        animate={drift(60, -40, 18)}
        className="absolute -left-40 -top-40 h-[36rem] w-[36rem] rounded-full opacity-[0.28] blur-[120px]"
        style={{ background: "radial-gradient(circle, hsl(160 84% 45%), transparent 65%)" }}
      />
      <motion.div
        animate={drift(-50, 50, 24)}
        className="absolute -right-32 top-1/4 h-[32rem] w-[32rem] rounded-full opacity-[0.22] blur-[120px]"
        style={{ background: "radial-gradient(circle, hsl(262 83% 62%), transparent 65%)" }}
      />
      <motion.div
        animate={drift(40, 30, 30)}
        className="absolute -bottom-20 left-1/3 h-[28rem] w-[28rem] rounded-full opacity-[0.15] blur-[130px]"
        style={{ background: "radial-gradient(circle, hsl(158 64% 52%), transparent 65%)" }}
      />

      {/* Grid, faded out toward the edges so it never draws a hard box */}
      <div
        className="absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, #000 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, #000 40%, transparent 100%)",
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#070B10_100%)]" />
    </div>
  );
}
