"use client";

import { usePathname } from "next/navigation";
import { Construction } from "lucide-react";

export default function PlaceholderPage() {
  const pathname = usePathname();
  const pageName = pathname.slice(1).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
          <Construction className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">{pageName || "Page"}</h1>
        <p className="text-muted-foreground">This page is under construction</p>
      </div>
    </div>
  );
}
