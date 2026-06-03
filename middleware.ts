import { NextRequest, NextResponse } from "next/server";

const APEX_HOST = "voiceable.dev";
const CANONICAL_HOST = "www.voiceable.dev";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  const url = request.nextUrl.clone();
  let shouldRedirect = false;

  // Apex → www. Netlify may also enforce this in domain settings; duplicate 308 is harmless.
  if (host === APEX_HOST) {
    url.hostname = CANONICAL_HOST;
    url.port = "";
    url.protocol = "https";
    shouldRedirect = true;
  }

  // Do not infer HTTP from request.nextUrl.protocol — behind Netlify/Vercel the internal
  // hop is always http:, which caused an infinite redirect loop on www.voiceable.dev.
  // HTTPS upgrades are handled at the Netlify edge.

  if (url.pathname === "/lander") {
    url.pathname = "/";
    shouldRedirect = true;
  }

  if (!shouldRedirect) {
    return NextResponse.next();
  }

  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|favicon.svg|site.webmanifest|robots.txt|sitemap.xml|og-image.png).*)",
  ],
};
