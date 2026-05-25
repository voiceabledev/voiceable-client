import type { Metadata } from "next";
import BlogIndex from "@/views/blog/BlogIndex";
import { fetchPublishedPosts } from "@/lib/blogData";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "Voice AI Blog",
  description:
    "Read Voiceable guides, product updates, and playbooks for live sales voice AI, real-time conversations, and reliable voice agents.",
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

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof fetchPublishedPosts>> | undefined;

  try {
    posts = await fetchPublishedPosts({ next: { revalidate: 3600 } });
  } catch {
    posts = undefined;
  }

  return <BlogIndex initialPosts={posts} />;
}
