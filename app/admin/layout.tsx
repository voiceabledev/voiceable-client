"use client";

import { Suspense } from "react";
import { AdminRoute } from "@/components/AdminRoute";
import AdminLayout from "@/views/admin/AdminLayout";

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoute>
      <Suspense fallback={<LoadingFallback />}>
        <AdminLayout>{children}</AdminLayout>
      </Suspense>
    </AdminRoute>
  );
}
