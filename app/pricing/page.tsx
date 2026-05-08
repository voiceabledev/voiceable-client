import type { Metadata } from "next";
import Pricing from "@/views/Pricing";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "Pricing | Voiceable",
  description:
    "Transparent pricing for AI voice agents—estimate hosting, transport, speech, and model costs for your call volume.",
  path: "/pricing",
  keywords: ["Voiceable pricing", "AI voice cost", "conversation pricing", "telephony rates"],
});

export default function PricingPage() {
  return <Pricing />;
}
