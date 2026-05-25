"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { BlogMarkdown } from "@/components/blog/BlogMarkdown";
import { fetchPostBySlug } from "@/lib/blogData";
import type { BlogPostEntry } from "@/types/blog";
import NotFound from "@/views/NotFound";

interface BlogPostProps {
  initialPost?: BlogPostEntry;
}

export default function BlogPost({ initialPost }: BlogPostProps) {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostEntry | null | undefined>(() =>
    initialPost ?? (slug ? undefined : null)
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPost) return;

    if (!slug) {
      setPost(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setPost(undefined);
      setError(null);
      try {
        const entry = await fetchPostBySlug(slug);
        if (!cancelled) setPost(entry);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load this post.");
          setPost(undefined);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialPost, slug]);

  if (post === undefined && !error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 pt-28 pb-16 px-6 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          <span>Loading…</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 pt-28 pb-16 px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-destructive" role="alert">
              {error}
            </p>
            <Link href="/blog" className="inline-block mt-6 text-primary hover:underline font-medium">
              ← All posts
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return <NotFound />;
  }

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />

        <main className="flex-1 pt-28 pb-16 px-6">
          <article className="max-w-3xl mx-auto">
            <nav className="text-sm text-muted-foreground mb-8">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link href="/blog" className="hover:text-foreground">
                Blog
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{post.title}</span>
            </nav>

            <header className="mb-10">
              <time
                dateTime={post.publishedAt}
                className="text-sm text-muted-foreground"
              >
                {post.publishedAt
                  ? format(new Date(post.publishedAt), "MMMM d, yyyy")
                  : ""}
              </time>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-2">
                {post.title}
              </h1>
              <p className="text-muted-foreground mt-4 text-lg">{post.description}</p>
              <p className="text-sm text-muted-foreground mt-2">By {post.author}</p>
            </header>

            <div
              className="prose prose-lg dark:prose-invert prose-headings:scroll-mt-24 max-w-none
                prose-a:text-primary prose-img:rounded-lg prose-hr:border-border"
            >
              <BlogMarkdown markdown={post.body} />
            </div>

            <footer className="mt-16 pt-8 border-t border-border">
              <Link href="/blog" className="text-primary hover:underline font-medium">
                ← All posts
              </Link>
            </footer>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
}
