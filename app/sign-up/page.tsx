import type { Metadata } from "next";
import SignUp from "@/views/auth/SignUp";

export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false, follow: true },
};

export default function SignUpPage() {
  return <SignUp />;
}
