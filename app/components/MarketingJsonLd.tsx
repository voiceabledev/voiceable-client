import { SITE_URL } from "@/constants/site";

const DESCRIPTION =
  "Upriser answers your phone and website with AI voice assistants that book appointments, resolve questions, run outbound campaigns, and hand off to your team — 24/7.";

/** Organization + WebSite + SoftwareApplication for crawlers (App Router; no Helmet). */
export function MarketingJsonLd() {
  const orgId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;
  const logoUrl = `${SITE_URL}/voiceable_logo.png`;

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": orgId,
    name: "Upriser",
    legalName: "Upriser Studio",
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
    name: "Upriser",
    url: SITE_URL,
    description: DESCRIPTION,
    publisher: { "@id": orgId },
  };

  const softwareApplication = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Upriser",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: DESCRIPTION,
    url: SITE_URL,
    provider: { "@id": orgId },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/pricing`,
      price: "0",
      priceCurrency: "USD",
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
