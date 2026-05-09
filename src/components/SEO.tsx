import { Helmet } from "react-helmet-async";
import { SITE_URL } from "@/constants/site";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  twitterHandle?: string;
}

export function SEO({
  title = "Live Sales Voice AI for High-Intent Website Visitors | Voiceable",
  description =
    "Voiceable helps revenue teams connect high-intent website visitors with real-time voice conversations, increasing conversion, deal size, and speed to close.",
  keywords =
    "live sales, voice AI sales, website conversion, high-intent visitors, real-time sales, AI sales assistant, conversion optimization, revenue automation",
  image = "/og-image.png",
  url = SITE_URL,
  type = "website",
  siteName = "Voiceable",
  twitterHandle = "@voiceaistudio",
}: SEOProps) {
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const fullUrl = url;
  const absoluteImage = image.startsWith("http")
    ? image
    : `${SITE_URL}${image.startsWith("/") ? image : `/${image}`}`;

  return (
    <Helmet>
      {/* Primary Meta Tags - These will automatically replace matching tags from index.html */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={siteName} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook - These will replace matching og: tags from index.html */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter - These will replace matching twitter: tags from index.html */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />
      {twitterHandle && <meta name="twitter:creator" content={twitterHandle} />}
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#10b981" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: siteName,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description,
          url: SITE_URL,
          provider: {
            "@type": "Organization",
            name: siteName,
            url: SITE_URL,
          },
          offers: {
            "@type": "Offer",
            url: `${SITE_URL}/pricing`,
          },
        })}
      </script>

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: siteName,
          url: SITE_URL,
          logo: absoluteImage,
        })}
      </script>

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteName,
          url: SITE_URL,
          description,
          publisher: {
            "@type": "Organization",
            name: siteName,
            url: SITE_URL,
          },
        })}
      </script>
    </Helmet>
  );
}

