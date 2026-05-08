import type { Metadata } from "next";
import Pricing from "@/views/Pricing";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "Pricing | Voiceable",
  description:
    "Prepaid minute bundles for AI voice agents on Voiceable: transparent usage pricing, then volume quotes when you scale.",
  path: "/pricing",
  keywords: [
    "Voiceable pricing",
    "AI voice agent pricing",
    "prepaid voice minutes",
    "usage-based voice",
    "enterprise voice AI",
  ],
});

export default function PricingPage() {
  return <Pricing />;
}
