import type { Metadata } from "next";
import Privacy from "@/views/Privacy";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "Privacy Policy | Voiceable",
  description:
    "Voiceable Privacy Policy — how we collect, safeguard and disclose information that results from your use of our Service.",
  path: "/privacy",
  keywords: ["privacy policy", "data protection", "GDPR", "CCPA", "privacy rights"],
});

export default function PrivacyPage() {
  return <Privacy />;
}
