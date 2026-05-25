import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPost from "@/views/blog/BlogPost";
import { fetchPostBySlug } from "@/lib/blogData";
import { SITE_URL } from "@/constants/site";

const META_TITLE_OVERRIDES: Record<string, string> = {
  "best-conversational-ai-platforms": "Best Conversational AI Platforms",
};
const META_DESCRIPTION_OVERRIDES: Record<string, string> = {
  "best-conversational-ai-platforms":
    "Compare the 12 best conversational AI platforms for 2026, including voice AI, contact centers, internal support, and website conversion tools.",
};

type Props = { params: Promise<{ slug: string }> };

function absolutePostImage(og: string | null | undefined) {
  if (!og) return `${SITE_URL}/og-image.png`;
  if (og.startsWith("http")) return og;
  return `${SITE_URL}${og.startsWith("/") ? og : `/${og}`}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug, { next: { revalidate: 300 } });
  if (!post) {
    return { title: "Post not found" };
  }
  const canonical = post.canonical || `${SITE_URL}/blog/${post.slug}`;
  const title = META_TITLE_OVERRIDES[post.slug] || post.title;
  const description = META_DESCRIPTION_OVERRIDES[post.slug] || post.description || undefined;
  const image = absolutePostImage(post.ogImage);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt || undefined,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug, { next: { revalidate: 300 } });
  if (!post) notFound();
  return <BlogPost initialPost={post} />;
}
