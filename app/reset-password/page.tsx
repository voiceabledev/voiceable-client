import type { Metadata } from "next";
import ResetPassword from "@/views/auth/ResetPassword";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "Reset password | Voiceable",
  description:
    "Reset your Voiceable account password with a secure email link and regain access to your AI voice agent workspace.",
  path: "/reset-password",
  keywords: ["Voiceable password reset", "forgot password"],
  robots: { index: false, follow: true },
});

export default function ResetPasswordPage() {
  return <ResetPassword />;
}
