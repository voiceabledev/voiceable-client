import type { Metadata } from "next";
import SignUp from "@/views/auth/SignUp";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "Sign up | Upriser",
  description:
    "Create your Upriser account to build AI voice agents, manage conversations, and connect voice experiences to your stack.",
  path: "/sign-up",
  keywords: ["Upriser sign up", "create account", "voice AI platform"],
  robots: { index: false, follow: true },
});

export default function SignUpPage() {
  return <SignUp />;
}
