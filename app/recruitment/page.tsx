import type { Metadata } from "next";
import Landing3 from "@/views/Landing3";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "Live Sales Voice AI for High-Intent Website Visitors | Voiceable",
  description:
    "Voiceable helps revenue teams connect high-intent website visitors with real-time voice conversations, increasing conversion, deal size, and speed to close.",
  path: "/recruitment",
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
});

export default function RecruitmentPage() {
  return <Landing3 />;
}
