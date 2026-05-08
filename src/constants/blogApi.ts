/**
 * Public blog JSON under `getApiBaseUrl()` (Rails scope: `/voiceable-api/...`).
 *
 * Override if your deployment uses a different resource segment than Rails
 * `resources :blog_posts` (default `blog_posts`).
 */
export function blogPostsApiSegment(): string {
  const raw =
    typeof process !== "undefined" && process.env?.NEXT_PUBLIC_BLOG_POSTS_API_PATH?.trim()
      ? process.env.NEXT_PUBLIC_BLOG_POSTS_API_PATH.trim()
      : "blog_posts";
  return raw.replace(/^\/+|\/+$/g, "") || "blog_posts";
}

/** e.g. `/blog_posts` */
export function blogPostsIndexApiPath(): string {
  return `/${blogPostsApiSegment()}`;
}

/** e.g. `/blog_posts/my-post-slug` */
export function blogPostShowApiPath(slug: string): string {
  return `${blogPostsIndexApiPath()}/${encodeURIComponent(slug)}`;
}
