import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SITE_URL } from "@/constants/site";
import { fetchPublishedPosts } from "@/lib/blogData";
import type { BlogPostEntry } from "@/types/blog";

export default function BlogIndex() {
  const [posts, setPosts] = useState<BlogPostEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchPublishedPosts();
        if (!cancelled) setPosts(list);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load blog posts.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <SEO
        title="Blog"
        description="Voice AI product updates, best practices for operators, and guides for shipping reliable voice agents without prompt engineering."
        keywords="voice AI blog, AI voice agents, conversational AI, Voiceable"
        url={`${SITE_URL}/blog`}
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />

        <main className="flex-1 pt-28 pb-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Blog</h1>
            <p className="text-lg text-muted-foreground mb-12">
              Notes on shipping voice AI in production — from the Voiceable team.
            </p>

            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                <span>Loading posts…</span>
              </div>
            )}

            {error && !loading && (
              <p className="text-destructive" role="alert">
                {error}
              </p>
            )}

            {!loading && !error && posts.length === 0 && (
              <p className="text-muted-foreground">No posts yet. Check back soon.</p>
            )}

            {!loading && !error && posts.length > 0 && (
              <ul className="space-y-10">
                {posts.map((post) => (
                  <li key={post.slug}>
                    <article className="border-b border-border pb-10 last:border-0">
                      <time
                        dateTime={post.publishedAt}
                        className="text-sm text-muted-foreground"
                      >
                        {post.publishedAt
                          ? format(new Date(post.publishedAt), "MMMM d, yyyy")
                          : ""}
                      </time>
                      <h2 className="text-2xl font-semibold mt-2 mb-2">
                        <Link
                          to={`/blog/${post.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h2>
                      <p className="text-muted-foreground mb-4">{post.description}</p>
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
