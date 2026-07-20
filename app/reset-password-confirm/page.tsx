import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordConfirm from "@/views/auth/ResetPasswordConfirm";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata: Metadata = marketingMetadata({
  title: "Confirm password reset | Upriser",
  description:
    "Set a new password for your Upriser account using the link from your email.",
  path: "/reset-password-confirm",
  keywords: ["Upriser password reset", "new password"],
  robots: { index: false, follow: true },
});

function ConfirmFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground text-sm">
      Loading…
    </div>
  );
}

export default function ResetPasswordConfirmPage() {
  return (
    <Suspense fallback={<ConfirmFallback />}>
      <ResetPasswordConfirm />
    </Suspense>
  );
}
