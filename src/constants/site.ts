/** Canonical marketing site origin (no trailing slash). Override with VITE_SITE_URL in env. */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://www.voiceable.dev").replace(
  /\/+$/,
  ""
);
