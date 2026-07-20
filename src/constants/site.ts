/** Canonical marketing site origin (no trailing slash).
 * Prefer NEXT_PUBLIC_SITE_URL; on Netlify, `URL` is the production site origin.
 */
export const SITE_URL = (
  (typeof process !== "undefined" &&
    (process.env?.NEXT_PUBLIC_SITE_URL || process.env?.URL)) ||
  "https://voice.upriser.ai"
).replace(/\/+$/, "");
