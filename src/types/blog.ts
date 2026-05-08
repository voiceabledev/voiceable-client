export interface BlogPostFrontmatter {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  tags: string[];
  canonical: string | null;
  ogImage: string | null;
  draft: boolean;
}

/** Entry stored in generated blogPosts.json (includes markdown body). */
export interface BlogPostEntry extends BlogPostFrontmatter {
  body: string;
}

export interface BlogPostsManifest {
  generatedAt: string;
  posts: BlogPostEntry[];
}
