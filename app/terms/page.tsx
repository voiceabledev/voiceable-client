import type { Metadata } from "next";
import Terms from "@/views/Terms";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "Terms of Service | Upriser",
  description:
    "Upriser Terms of Service — the legally binding agreement between Upriser Inc. and you for use of our website and Services.",
  path: "/terms",
  keywords: ["terms of service", "terms and conditions", "legal agreement", "user agreement"],
});

export default function TermsPage() {
  return <Terms />;
}
