import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Load Microsoft Clarity only in production, deferred to reduce forced reflows
if (import.meta.env.MODE === "production") {
  // Defer Clarity loading until after initial render to prevent forced reflows
  const loadClarity = () => {
    (function(c: Record<string, unknown>, l: Document, a: string, r: string, i: string) {
      const clarityFn = function(...args: unknown[]) {
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
      if (y && y.parentNode) {
        y.parentNode.insertBefore(t, y);
      }
    })(window as unknown as Record<string, unknown>, document, "clarity", "script", "uspxcboix3");
  };

  // Use requestIdleCallback if available, otherwise fallback to setTimeout
  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadClarity, { timeout: 2000 });
  } else {
    setTimeout(loadClarity, 2000);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
