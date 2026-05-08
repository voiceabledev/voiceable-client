/**
 * Legacy Vite SPA shell. The production app is served by Next.js (`app/`).
 * Run `npm run dev` / `npm run build`. Embeddable widget: `npm run build:widget`.
 */
export default function App() {
  return (
    <div className="p-8 font-sans">
      <p className="mb-2">This entry is not used by Next.js.</p>
      <p className="text-muted-foreground text-sm">
        Use <code className="rounded bg-muted px-1 py-0.5">npm run dev</code> for local development.
      </p>
    </div>
  );
}
