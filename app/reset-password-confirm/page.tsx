import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordConfirm from "@/views/auth/ResetPasswordConfirm";

export const metadata: Metadata = {
  title: "Confirm password reset",
  robots: { index: false, follow: true },
};

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
