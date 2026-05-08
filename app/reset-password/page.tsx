import type { Metadata } from "next";
import ResetPassword from "@/views/auth/ResetPassword";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: true },
};

export default function ResetPasswordPage() {
  return <ResetPassword />;
}
