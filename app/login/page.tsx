import type { Metadata } from "next";
import Login from "@/views/auth/Login";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "Log in | Voiceable",
  description:
    "Sign in to Voiceable to manage assistants, workflows, billing, and voice conversations for your organization.",
  path: "/login",
  keywords: ["Voiceable login", "sign in", "voice AI dashboard"],
  robots: { index: false, follow: true },
});

export default function LoginPage() {
  return <Login />;
}
