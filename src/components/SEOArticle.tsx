import { Helmet } from "react-helmet-async";
import { SITE_URL } from "@/constants/site";
import type { BlogPostEntry } from "@/types/blog";

const SITE_NAME = "Voiceable Studio";
const TWITTER = "@voiceaistudio";

interface SEOArticleProps {
  post: BlogPostEntry;
}

function absoluteImage(path: string | null | undefined): string {
  if (!path) return `${SITE_URL}/og-image.png`;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function SEOArticle({ post }: SEOArticleProps) {
  const canonical = post.canonical || `${SITE_URL}/blog/${post.slug}`;
  const titleForMeta = post.title.includes(SITE_NAME) ? post.title : `${post.title} | ${SITE_NAME}`;
  const published = post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined;
  const modified = post.updatedAt ? new Date(post.updatedAt).toISOString() : published;
  const ogImage = absoluteImage(post.ogImage);

  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: published,
    dateModified: modified || published,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/voiceable_logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    image: ogImage,
    url: canonical,
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: canonical,
      },
    ],
  };

  return (
    <Helmet>
      <title>{titleForMeta}</title>
      <meta name="title" content={titleForMeta} />
      <meta name="description" content={post.description} />
      <meta name="author" content={post.author} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="article" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      {published && <meta property="article:published_time" content={published} />}
      {(modified || published) && (
        <meta property="article:modified_time" content={modified || published} />
      )}
      <meta property="article:author" content={post.author} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={post.description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:creator" content={TWITTER} />
      <meta name="twitter:site" content={TWITTER} />

      <script type="application/ld+json">{JSON.stringify(blogPosting)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
    </Helmet>
  );
}
