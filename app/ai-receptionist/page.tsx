import type { Metadata } from "next";
import AiReceptionistDemo from "@/views/AiReceptionistDemo";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "Try an AI receptionist for your business",
  metadataTitle: {
    absolute: "Try an AI receptionist for your business | Upriser",
  },
  description:
    "Enter your phone number and website, and call an AI receptionist that already knows your hours, services and answers — in about 30 seconds.",
  path: "/ai-receptionist",
  keywords: ["AI receptionist", "AI phone answering", "virtual receptionist", "Upriser"],
  // Ad landing page — traffic comes from paid, not search, and we don't want it
  // competing with the main site.
  robots: { index: false, follow: false },
});

export default function AiReceptionistPage() {
  return <AiReceptionistDemo />;
}
