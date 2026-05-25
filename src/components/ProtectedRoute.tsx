"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRouteFallback({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="max-w-md text-center">
        <Link href="/" className="mb-6 inline-flex items-center justify-center">
          <img src="/voiceable_logo.png" alt="Voiceable" className="h-7 w-auto" />
        </Link>
        <h1 className="mb-3 text-2xl font-semibold tracking-tight">Voiceable dashboard</h1>
        <div className="mx-auto mb-5 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        <p className="mb-4 text-sm text-muted-foreground">{message}</p>
        <p className="mb-4 text-sm leading-6 text-muted-foreground">
          The Voiceable dashboard is where teams create AI voice assistants, review conversations,
          configure live sales flows, connect integrations, and manage account settings. Sign in to
          continue working on your assistants, or explore the public Voiceable site to learn how
          real-time voice conversations help revenue teams engage high-intent visitors.
        </p>
        <p className="mb-6 text-sm leading-6 text-muted-foreground">
          New teams can review pricing, read implementation guides, or create an account to start
          building voice experiences for sales, support, and customer engagement.
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
          <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
            Home
          </Link>
          <Link href="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="/sign-up" rel="nofollow" className="text-muted-foreground transition-colors hover:text-foreground">
            Sign up
          </Link>
          <Link href="/blog" className="text-muted-foreground transition-colors hover:text-foreground">
            Blog
          </Link>
          <Link href="/login" rel="nofollow" className="text-muted-foreground transition-colors hover:text-foreground">
            Log in
          </Link>
        </nav>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const token = apiClient.getToken();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated && !token) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, token, router]);

  if (loading) {
    return <ProtectedRouteFallback message="Checking your session..." />;
  }

  if (!isAuthenticated && !token) {
    return <ProtectedRouteFallback message="Redirecting you to log in..." />;
  }

  return <>{children}</>;
}
