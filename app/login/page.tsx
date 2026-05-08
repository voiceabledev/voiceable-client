import type { Metadata } from "next";
import Login from "@/views/auth/Login";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return <Login />;
}
