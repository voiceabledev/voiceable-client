/** Canonical marketing site origin (no trailing slash). Override with NEXT_PUBLIC_SITE_URL in env. */
export const SITE_URL = (
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SITE_URL) ||
  "https://www.voiceable.dev"
).replace(/\/+$/, "");
