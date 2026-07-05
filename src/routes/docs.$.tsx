import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getDoc } from "../lib/docs";
import { MarkdownDoc } from "../components/MarkdownDoc";
import { Mermaid } from "../components/Mermaid";

export const Route = createFileRoute("/docs/$")({
  loader: ({ params }) => {
    const doc = getDoc(params._splat ?? "");
    if (!doc) throw notFound();
    return { doc };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Doc not found — BusinessOS ERP" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { doc } = loaderData;
    const title = `${doc.frontmatter.title} — BusinessOS ERP Docs`;
    const desc =
      doc.frontmatter.summary ?? "BusinessOS ERP documentation.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
      ],
    };
  },
  notFoundComponent: DocNotFound,
  component: DocPage,
});

function DocNotFound() {
  const params = Route.useParams();
  return (
    <div className="py-12 text-center">
      <h1 className="text-2xl font-semibold">Doc not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        No document at <code className="rounded bg-muted px-1">{params._splat}</code>.
      </p>
      <div className="mt-4">
        <Link to="/docs" className="text-sm text-primary underline">
          Back to docs home
        </Link>
      </div>
    </div>
  );
}

function DocPage() {
  const { doc } = Route.useLoaderData();
  const fm = doc.frontmatter;

  return (
    <div>
      <header className="mb-6 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {fm.document_type && (
            <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary">
              {fm.document_type}
            </span>
          )}
          {fm.layer && (
            <span className="rounded bg-muted px-2 py-0.5 capitalize">{fm.layer}</span>
          )}
          {fm.status && (
            <span className="rounded bg-muted px-2 py-0.5 capitalize">{fm.status}</span>
          )}
          {fm.version && <span>v{fm.version}</span>}
          {fm.owner && <span>Owner: {fm.owner}</span>}
          {fm.created && <span>Created: {fm.created}</span>}
          {fm.updated && <span>Updated: {fm.updated}</span>}
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{fm.title}</h1>
        {fm.summary && <p className="mt-2 text-muted-foreground">{fm.summary}</p>}
        {fm.tags && fm.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {fm.tags.map((t: string) => (
              <span
                key={t}
                className="rounded border border-border bg-muted/40 px-2 py-0.5 text-xs"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </header>

      {doc.isMermaid ? <Mermaid chart={doc.body} /> : <MarkdownDoc body={doc.body} />}

      {fm.depends_on && fm.depends_on.length > 0 && (
        <section className="mt-10 border-t border-border pt-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Depends on
          </h2>
          <ul className="text-sm">
            {fm.depends_on.map((d: string) => (
              <li key={d}>
                <code className="rounded bg-muted px-1 py-0.5">{d}</code>
              </li>
            ))}
          </ul>
        </section>
      )}

      {fm.referenced_by && fm.referenced_by.length > 0 && (
        <section className="mt-6 border-t border-border pt-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Referenced by
          </h2>
          <ul className="text-sm">
            {fm.referenced_by.map((d: string) => (
              <li key={d}>
                <code className="rounded bg-muted px-1 py-0.5">{d}</code>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
