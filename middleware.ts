import { NextRequest, NextResponse } from "next/server";

const APEX_HOST = "voiceable.dev";
const CANONICAL_HOST = "www.voiceable.dev";
const PRODUCTION_HOSTS = new Set([APEX_HOST, CANONICAL_HOST]);

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const isHttpRequest = forwardedProto === "http" || request.nextUrl.protocol === "http:";
  const url = request.nextUrl.clone();
  let shouldRedirect = false;

  if (host === APEX_HOST) {
    url.hostname = CANONICAL_HOST;
    url.port = "";
    shouldRedirect = true;
  }

  if (host && PRODUCTION_HOSTS.has(host) && isHttpRequest) {
    url.hostname = host === APEX_HOST ? CANONICAL_HOST : host;
    url.protocol = "https";
    url.port = "";
    shouldRedirect = true;
  }

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
