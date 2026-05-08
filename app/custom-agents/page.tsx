import type { Metadata } from "next";
import CustomAgents from "@/views/CustomAgents";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "Custom AI Voice Agents | Voiceable",
  description:
    "Build production-ready voice agents with ultra-low latency, telephony integrations, and APIs your team can customize end-to-end.",
  path: "/custom-agents",
  keywords: [
    "custom voice AI",
    "voice agents API",
    "AI telephony",
    "low latency voice",
    "Voiceable",
  ],
});

export default function CustomAgentsPage() {
  return <CustomAgents />;
}
