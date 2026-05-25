import type { Metadata } from "next";
import ResetPassword from "@/views/auth/ResetPassword";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "Reset password | Voiceable",
  description:
    "Request a secure link to reset your Voiceable account password.",
  path: "/reset-password",
  keywords: ["Voiceable password reset", "forgot password"],
});

export default function ResetPasswordPage() {
  return <ResetPassword />;
}
