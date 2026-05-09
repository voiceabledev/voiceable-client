import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants/site";
import { fetchPublishedPosts } from "@/lib/blogData";

const STATIC: MetadataRoute.Sitemap = [
  { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
  { url: `${SITE_URL}/customer-support`, changeFrequency: "monthly", priority: 0.85 },
  { url: `${SITE_URL}/retail-ecommerce`, changeFrequency: "monthly", priority: 0.8 },
  { url: `${SITE_URL}/recruitment`, changeFrequency: "monthly", priority: 0.8 },
  { url: `${SITE_URL}/small-business`, changeFrequency: "monthly", priority: 0.8 },
  { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.85 },
  { url: `${SITE_URL}/pricing`, changeFrequency: "monthly", priority: 0.9 },
  { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.5 },
  { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.5 },
  { url: `${SITE_URL}/sign-up`, changeFrequency: "monthly", priority: 0.6 },
  { url: `${SITE_URL}/login`, changeFrequency: "monthly", priority: 0.6 },
  { url: `${SITE_URL}/reset-password`, changeFrequency: "monthly", priority: 0.4 },
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
