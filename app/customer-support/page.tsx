import type { Metadata } from "next";
import CustomerSupport from "@/views/CustomerSupport";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "AI Voice Agents for Customer Support — Resolve Issues 24/7 | Voiceable",
  description:
    "Automate your front line with intelligent voice agents that handle common questions, troubleshoot problems, and escalate when needed — all in real time. Reduce handle time, improve first-call resolution, and lower support costs.",
  path: "/customer-support",
  keywords: [
    "AI customer support",
    "AI voice agent",
    "customer support automation",
    "AI call center",
    "first-call resolution",
    "24/7 support",
    "support escalation AI",
    "voice AI for support",
    "Voiceable",
  ],
});

export default function CustomerSupportPage() {
  return <CustomerSupport />;
}
