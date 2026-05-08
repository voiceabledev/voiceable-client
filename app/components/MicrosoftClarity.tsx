"use client";

import { useEffect } from "react";

/**
 * Loads Microsoft Clarity in production only (mirrors former main.tsx behavior).
 */
export function MicrosoftClarity() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return;

    const loadClarity = () => {
      (function (
        c: Record<string, unknown>,
        l: Document,
        a: string,
        r: string,
        i: string,
      ) {
        const clarityFn = function (...args: unknown[]) {
          const fn = c[a] as { q?: unknown[] };
          if (!fn.q) fn.q = [];
          fn.q.push(args);
        };
        c[a] = c[a] || clarityFn;
        if (!(c[a] as { q?: unknown[] }).q) {
          (c[a] as { q: unknown[] }).q = [];
        }
        const t = l.createElement(r) as HTMLScriptElement;
        t.async = true;
        t.src = "https://www.clarity.ms/tag/" + i;
        const y = l.getElementsByTagName(r)[0];
        if (y?.parentNode) {
          y.parentNode.insertBefore(t, y);
        }
      })(window as unknown as Record<string, unknown>, document, "clarity", "script", "uspxcboix3");
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(loadClarity, { timeout: 2000 });
    } else {
      setTimeout(loadClarity, 2000);
    }
  }, []);

  return null;
}
