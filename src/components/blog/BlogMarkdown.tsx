import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

interface BlogMarkdownProps {
  markdown: string;
}

/** Normalize newlines (handles `\r\n` and accidental literal `\n` sequences). */
function normalizeNewlines(source: string): string {
  let s = source.replace(/\r\n/g, "\n");
  // Fix double-escaped newlines occasionally seen when content was over-escaped in JSON/tools
  if (!s.includes("\n") && s.includes("\\n")) {
    s = s.replace(/\\n/g, "\n");
  }
  return s;
}

/**
 * Remove common leading indentation so the whole document is not parsed as an indented code block.
 */
function dedentMarkdown(source: string): string {
  const lines = source.split("\n");
  const nonEmpty = lines.filter((line) => line.trim().length > 0);
  if (nonEmpty.length === 0) return source.trim();

  let minIndent = Infinity;
  for (const line of nonEmpty) {
    const match = /^[\t ]*/.exec(line);
    const n = match ? match[0].length : 0;
    minIndent = Math.min(minIndent, n);
  }
  if (!Number.isFinite(minIndent) || minIndent === 0) {
    return lines.join("\n").trim();
  }

  return lines
    .map((line) => (line.length === 0 ? line : line.slice(minIndent)))
    .join("\n")
    .trim();
}

/** Strip a leading YAML frontmatter block if present (e.g. paste from a repo `.md` file). */
function stripYamlFrontmatter(source: string): string {
  if (!source.startsWith("---\n")) return source;
  const end = source.indexOf("\n---\n", 4);
  if (end === -1) return source;
  return source.slice(end + 5).trimStart();
}

function prepareMarkdown(raw: string): string {
  const normalized = normalizeNewlines(raw);
  const withoutFm = stripYamlFrontmatter(normalized);
  return dedentMarkdown(withoutFm);
}

export function BlogMarkdown({ markdown }: BlogMarkdownProps) {
  const prepared = prepareMarkdown(markdown);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children, className, ...rest }) => (
          <h2 className={className} {...rest}>
            {children}
          </h2>
        ),
        a: ({ href, children, className, ...rest }) => {
          if (href?.startsWith("/")) {
            return (
              <Link href={href} className={className} {...rest}>
                {children}
              </Link>
            );
          }
          return (
            <a
              href={href}
              className={className}
              target="_blank"
              rel="noopener noreferrer"
              {...rest}
            >
              {children}
            </a>
          );
        },
      }}
    >
      {prepared}
    </ReactMarkdown>
  );
}
