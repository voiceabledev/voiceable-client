import type { Metadata } from "next";
import BlogIndex from "@/views/blog/BlogIndex";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "Voice AI Blog: Live Sales, Conversion & Operator Playbooks | Voiceable",
  description:
    "Guides, product updates, and playbooks on live sales voice AI: capturing high-intent visitors, designing real-time conversations, and shipping reliable voice agents without prompt engineering.",
  path: "/blog",
  keywords: [
    "voice AI blog",
    "live sales voice AI",
    "AI voice agents",
    "conversational AI",
    "AI sales playbook",
    "website conversion",
    "Voiceable",
  ],
});

export default function BlogPage() {
  return <BlogIndex />;
}
