import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== "/lander") {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/";
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|favicon.svg|site.webmanifest|robots.txt|sitemap.xml|og-image.png).*)",
  ],
};
