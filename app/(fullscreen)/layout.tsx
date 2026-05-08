"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function FullscreenProtectedLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
