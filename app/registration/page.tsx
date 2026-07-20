import type { Metadata } from "next";
import Registration from "@/views/auth/Registration";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "Get started | Upriser",
  description:
    "Create your Upriser account and build your first AI product information agent in minutes.",
  path: "/registration",
  keywords: ["Upriser registration", "create account", "AI product information agent"],
  robots: { index: false, follow: true },
});

export default function RegistrationPage() {
  return <Registration />;
}
