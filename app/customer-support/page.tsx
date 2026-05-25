import type { Metadata } from "next";
import CustomerSupport from "@/views/CustomerSupport";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "AI Voice Agents for Support",
  description:
    "Automate customer support with AI voice agents that answer questions, troubleshoot issues, escalate when needed, and improve resolution 24/7.",
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
