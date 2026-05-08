import type { Metadata } from "next";
import BlogIndex from "@/views/blog/BlogIndex";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "Blog | Voiceable",
  description:
    "Voice AI product updates, best practices for operators, and guides for shipping reliable voice agents without prompt engineering.",
  path: "/blog",
  keywords: ["voice AI blog", "AI voice agents", "conversational AI", "Voiceable"],
});

export default function BlogPage() {
  return <BlogIndex />;
}
