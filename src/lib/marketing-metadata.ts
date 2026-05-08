import type { Metadata } from "next";
import { SITE_URL } from "@/constants/site";

function pageUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

function ogImageUrl(imagePath: string): string {
  if (imagePath.startsWith("http")) return imagePath;
  const p = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${SITE_URL}${p}`;
}

/** Shared SEO fields for marketing/legal pages (Next Metadata API). */
export function marketingMetadata(opts: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  imagePath?: string;
}): Metadata {
  const url = pageUrl(opts.path);
  const image = ogImageUrl(opts.imagePath ?? "/og-image.png");
  return {
    title: opts.title,
    description: opts.description,
    ...(opts.keywords?.length ? { keywords: opts.keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: "Voiceable",
      images: [{ url: image }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [image],
    },
  };
}
