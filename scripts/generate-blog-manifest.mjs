#!/usr/bin/env node
/**
 * Reads content/blog/*.md (gray-matter), writes src/generated/blogPosts.json.
 * Excludes draft posts from the manifest (production bundle / SEO).
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const blogDir = path.join(root, "content", "blog");
const outDir = path.join(root, "src", "generated");
const outFile = path.join(outDir, "blogPosts.json");

function parseTags(data) {
  if (Array.isArray(data.tags)) return data.tags.map(String);
  if (typeof data.tags === "string")
    return data.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  return [];
}

function main() {
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
  }
  fs.mkdirSync(outDir, { recursive: true });

  const files = fs.existsSync(blogDir)
    ? fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"))
    : [];

  const posts = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(blogDir, file), "utf8");
    const { data, content } = matter(raw);
    const slug = data.slug || path.basename(file, ".md");
    const publishedAt = data.publishedAt || data.date || "";
    const updatedAt = data.updatedAt || publishedAt || "";

    posts.push({
      slug: String(slug),
      title: String(data.title || slug),
      description: String(data.description || ""),
      publishedAt,
      updatedAt,
      author: String(data.author || "Voiceable"),
      tags: parseTags(data),
      canonical: data.canonical ? String(data.canonical) : null,
      ogImage: data.ogImage ? String(data.ogImage) : null,
      draft: Boolean(data.draft),
      body: content.trim(),
    });
  }

  posts.sort((a, b) => {
    const ta = Date.parse(a.publishedAt) || 0;
    const tb = Date.parse(b.publishedAt) || 0;
    return tb - ta;
  });

  const publicPosts = posts.filter((p) => !p.draft);

  const manifest = {
    generatedAt: new Date().toISOString(),
    posts: publicPosts,
  };

  fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2));
  console.log(`Blog manifest: ${publicPosts.length} published posts → ${path.relative(root, outFile)}`);
}

main();
