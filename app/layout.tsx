import type { Metadata } from "next";
import { SITE_URL } from "@/constants/site";
import "./globals.css";
import { Providers } from "./providers";
import { MarketingJsonLd } from "./components/MarketingJsonLd";
import { MicrosoftClarity } from "./components/MicrosoftClarity";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Live Sales Voice AI for High-Intent Website Visitors | Voiceable",
    template: "%s | Voiceable",
  },
  description:
    "Voiceable helps revenue teams connect high-intent website visitors with real-time voice conversations, increasing conversion, deal size, and speed to close.",
  keywords: [
    "live sales",
    "voice AI sales",
    "website conversion",
    "high-intent visitors",
    "real-time sales",
    "AI sales assistant",
    "conversion optimization",
    "revenue automation",
  ],
  authors: [{ name: "Voiceable Studio" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Voiceable",
    title: "Live Sales Voice AI for High-Intent Website Visitors | Voiceable",
    description:
      "Voiceable helps revenue teams connect high-intent website visitors with real-time voice conversations, increasing conversion, deal size, and speed to close.",
    images: [{ url: "/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Sales Voice AI for High-Intent Website Visitors | Voiceable",
    description:
      "Voiceable helps revenue teams connect high-intent website visitors with real-time voice conversations, increasing conversion, deal size, and speed to close.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MarketingJsonLd />
        <Providers>
          {children}
          <MicrosoftClarity />
        </Providers>
      </body>
    </html>
  );
}
