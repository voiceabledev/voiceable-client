import type { Metadata } from "next";
import Registration from "@/views/auth/Registration";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  // Match upriser.ai home title (voice-only); absolute avoids layout "| Upriser" suffix.
  title: "Get started | AI-Powered Personalized Voice for Hotels",
  metadataTitle: {
    absolute: "Get started | AI-Powered Personalized Voice for Hotels",
  },
  description:
    "Stay connected with your guests anytime, anywhere — delivering smooth, effortless communication and genuine engagement every step of the way!",
  path: "/signup-demo",
  keywords: [
    "Upriser",
    "AI voice agent",
    "personalized voice for hotels",
    "create account",
    "signup demo",
  ],
  imagePath: "https://upriser.ai/wp-content/uploads/2025/10/upriser-featured.png",
  robots: { index: true, follow: true },
});

export default function SignupDemoPage() {
  return <Registration />;
}
