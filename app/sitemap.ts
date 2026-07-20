import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants/site";
import { fetchPublishedPosts } from "@/lib/blogData";

const STATIC: MetadataRoute.Sitemap = [
  { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.85 },
  { url: `${SITE_URL}/pricing`, changeFrequency: "monthly", priority: 0.9 },
  { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.5 },
  { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: Awaited<ReturnType<typeof fetchPublishedPosts>> = [];
  try {
    posts = await fetchPublishedPosts({ next: { revalidate: 3600 } });
  } catch {
    posts = [];
  }

  const blogEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : p.publishedAt ? new Date(p.publishedAt) : new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...STATIC, ...blogEntries];
}
