import type { BlogPostEntry } from "@/types/blog";
import { getApiBaseUrl } from "@/lib/api";

interface BlogPostApiRow {
  slug: string;
  title: string;
  description: string | null;
  body: string;
  published_at: string | null;
  updated_at: string;
  author: string;
  tags: string[];
  canonical: string | null;
  og_image: string | null;
  draft: boolean;
}

interface BlogListEnvelope {
  status: { code: number; message?: string };
  data?: BlogPostApiRow[];
}

interface BlogShowEnvelope {
  status: { code: number; message?: string };
  data?: BlogPostApiRow;
}

function mapRowToEntry(row: BlogPostApiRow): BlogPostEntry {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    publishedAt: row.published_at ?? "",
    updatedAt: row.updated_at ?? "",
    author: row.author,
    tags: Array.isArray(row.tags) ? row.tags : [],
    canonical: row.canonical,
    ogImage: row.og_image,
    draft: row.draft,
    body: row.body,
  };
}

async function publicGetJson<T>(path: string): Promise<T> {
  const base = getApiBaseUrl().replace(/\/+$/, "");
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "omit",
  });

  const text = await res.text();
  let json: unknown = {};
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON from blog API");
    }
  }

  if (!res.ok) {
    const msg =
      typeof json === "object" && json !== null && "status" in json
        ? String((json as { status?: { message?: string } }).status?.message || res.statusText)
        : res.statusText;
    const err = new Error(msg);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }

  return json as T;
}

/**
 * Fetches published blog posts from the public API (no auth).
 */
export async function fetchPublishedPosts(): Promise<BlogPostEntry[]> {
  const json = await publicGetJson<BlogListEnvelope>("/blog_posts");
  const rows = json.data;
  if (!Array.isArray(rows)) return [];
  return rows.map(mapRowToEntry);
}

/**
 * Fetches a single published post by slug. Returns null if not found (404).
 */
export async function fetchPostBySlug(slug: string): Promise<BlogPostEntry | null> {
  const path = `/blog_posts/${encodeURIComponent(slug)}`;
  try {
    const json = await publicGetJson<BlogShowEnvelope>(path);
    if (!json.data) return null;
    return mapRowToEntry(json.data);
  } catch (e) {
    const status = (e as Error & { status?: number }).status;
    if (status === 404) return null;
    throw e;
  }
}
