import type { Metadata } from "next";
import Landing3 from "@/views/Landing3";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "Voice AI for Recruitment & Hiring Teams | Voiceable",
  description:
    "Answer candidate questions, schedule interviews, and keep applicants engaged with real-time voice conversations — without slowing down your recruiting team.",
  path: "/recruitment",
  keywords: [
    "voice AI recruitment",
    "hiring automation",
    "candidate engagement",
    "interview scheduling AI",
    "recruiting voice assistant",
    "talent acquisition AI",
    "Voiceable",
  ],
});

export default function RecruitmentPage() {
  return <Landing3 />;
}
