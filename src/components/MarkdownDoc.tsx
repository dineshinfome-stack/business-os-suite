import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { Link } from "@tanstack/react-router";
import { Mermaid } from "./Mermaid";

type Props = { body: string };

// Rewrite relative markdown links to /docs/<path> router links.
function rewriteHref(href: string): string {
  if (!href) return href;
  if (/^([a-z]+:)?\/\//i.test(href) || href.startsWith("#") || href.startsWith("mailto:")) {
    return href;
  }
  // "./foo.md" or "../foo/bar.md"
  const cleaned = href.replace(/\.md$/, "").replace(/^\.\//, "");
  return `/docs/${cleaned}`.replace(/\/+/g, "/");
}

export function MarkdownDoc({ body }: Props) {
  return (
    <article className="prose prose-slate max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-a:text-primary prose-code:before:content-none prose-code:after:content-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]]}
        components={{
          a: ({ href, children, ...rest }) => {
            const target = rewriteHref(href ?? "");
            if (target.startsWith("/docs/")) {
              return (
                <Link to={target} className="text-primary underline underline-offset-2">
                  {children}
                </Link>
              );
            }
            return (
              <a
                href={target}
                {...rest}
                target={target.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
              >
                {children}
              </a>
            );
          },
          code: ({ className, children, ...rest }) => {
            const match = /language-(\w+)/.exec(className ?? "");
            const lang = match?.[1];
            const content = String(children).replace(/\n$/, "");
            if (lang === "mermaid") {
              return <Mermaid chart={content} />;
            }
            if (!lang) {
              return (
                <code className="rounded bg-muted px-1 py-0.5 text-sm" {...rest}>
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...rest}>
                {children}
              </code>
            );
          },
          pre: ({ children, ...rest }) => (
            <pre
              className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-sm"
              {...rest}
            >
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-muted-foreground/30 pl-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-border bg-muted/40 px-3 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border-b border-border px-3 py-2">{children}</td>,
        }}
      >
        {body}
      </ReactMarkdown>
    </article>
  );
}
