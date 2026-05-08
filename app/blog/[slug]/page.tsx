import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPost from "@/views/blog/BlogPost";
import { fetchPostBySlug } from "@/lib/blogData";
import { SITE_URL } from "@/constants/site";

const SITE_NAME = "Voiceable Studio";

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
  const title = post.title.includes(SITE_NAME) ? post.title : `${post.title} | ${SITE_NAME}`;
  const image = absolutePostImage(post.ogImage);
  return {
    title,
    description: post.description || undefined,
    alternates: { canonical },
    openGraph: {
      title,
      description: post.description || undefined,
      url: canonical,
      type: "article",
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt || undefined,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.description || undefined,
      images: [image],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug, { next: { revalidate: 300 } });
  if (!post) notFound();
  return <BlogPost />;
}
