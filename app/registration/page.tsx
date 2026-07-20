import type { Metadata } from "next";
import Registration from "@/views/auth/Registration";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "Get started | AI-Powered Personalized Voice for Hotels",
  description:
    "Stay connected with your guests anytime, anywhere — delivering smooth, effortless communication and genuine engagement every step of the way!",
  path: "/registration",
  keywords: [
    "Upriser registration",
    "AI voice agent",
    "personalized voice for hotels",
    "create account",
  ],
  imagePath: "https://upriser.ai/wp-content/uploads/2025/10/upriser-featured.png",
  robots: { index: false, follow: true },
});

export default function RegistrationPage() {
  return <Registration />;
}
