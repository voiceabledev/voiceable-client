import { SITE_URL } from "@/constants/site";

const DESCRIPTION =
  "Voiceable helps revenue teams connect high-intent website visitors with real-time voice conversations, increasing conversion, deal size, and speed to close.";

/** Organization + WebSite + SoftwareApplication for crawlers (App Router; no Helmet). */
export function MarketingJsonLd() {
  const orgId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;
  const logoUrl = `${SITE_URL}/voiceable_logo.png`;

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": orgId,
    name: "Voiceable",
    legalName: "Voiceable Studio",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: logoUrl,
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    name: "Voiceable",
    url: SITE_URL,
    description: DESCRIPTION,
    publisher: { "@id": orgId },
  };

  const softwareApplication = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Voiceable",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: DESCRIPTION,
    url: SITE_URL,
    provider: { "@id": orgId },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/pricing`,
    },
  };

  const chunks = [organization, website, softwareApplication];

  return (
    <>
      {chunks.map((obj, i) => (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
          key={i}
          type="application/ld+json"
        />
      ))}
    </>
  );
}
