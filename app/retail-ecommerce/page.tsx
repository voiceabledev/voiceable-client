import type { Metadata } from "next";
import Landing from "@/views/Landing";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "AI Voice Agents for Retail & E-commerce | Voiceable",
  description:
    "Transform customer service with AI voice agents for retail stores and e-commerce businesses. Handle order tracking, delivery scheduling, returns, and customer inquiries 24/7 with intelligent voice automation.",
  path: "/retail-ecommerce",
  keywords: [
    "AI voice agents",
    "retail automation",
    "e-commerce customer service",
    "order management",
    "delivery scheduling",
    "customer support automation",
    "voice AI for retail",
    "AI phone answering",
    "automated customer service",
    "retail AI assistant",
  ],
});

export default function RetailEcommercePage() {
  return <Landing />;
}
