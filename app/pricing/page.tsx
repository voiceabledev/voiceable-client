import type { Metadata } from "next";
import Pricing from "@/views/Pricing";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "Pricing | Upriser",
  description:
    "Prepaid minute bundles for AI voice agents on Upriser: transparent usage pricing, then volume quotes when you scale.",
  path: "/pricing",
  keywords: [
    "Upriser pricing",
    "AI voice agent pricing",
    "prepaid voice minutes",
    "usage-based voice",
    "enterprise voice AI",
  ],
});

export default function PricingPage() {
  return <Pricing />;
}
