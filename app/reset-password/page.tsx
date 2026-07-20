import type { Metadata } from "next";
import ResetPassword from "@/views/auth/ResetPassword";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "Reset password | Upriser",
  description:
    "Reset your Upriser account password with a secure email link and regain access to your AI voice agent workspace.",
  path: "/reset-password",
  keywords: ["Upriser password reset", "forgot password"],
  robots: { index: false, follow: true },
});

export default function ResetPasswordPage() {
  return <ResetPassword />;
}
