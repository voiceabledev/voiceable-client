import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";

interface BlogMarkdownProps {
  markdown: string;
}

export function BlogMarkdown({ markdown }: BlogMarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children, className, ...rest }) => {
          if (href?.startsWith("/")) {
            return (
              <Link to={href} className={className} {...rest}>
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
      {markdown}
    </ReactMarkdown>
  );
}
