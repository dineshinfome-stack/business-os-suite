import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { nav, searchIndex, type SearchEntry } from "../lib/docs";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs — BusinessOS ERP" },
      {
        name: "description",
        content:
          "BusinessOS ERP documentation suite: Canon, architecture, ADRs, engines, catalogs, and domain PRDs.",
      },
      { property: "og:title", content: "BusinessOS ERP — Documentation" },
      {
        property: "og:description",
        content: "Single source of truth for BusinessOS ERP.",
      },
    ],
  }),
  component: DocsLayout,
});

function DocsLayout() {
  const [query, setQuery] = useState("");
  const fuse = useMemo(
    () =>
      new Fuse<SearchEntry>(searchIndex, {
        keys: [
          { name: "title", weight: 0.5 },
          { name: "summary", weight: 0.2 },
          { name: "headings", weight: 0.2 },
          { name: "firstParagraph", weight: 0.1 },
        ],
        threshold: 0.4,
        includeMatches: false,
      }),
    [],
  );
  const results = query.trim() ? fuse.search(query.trim()).slice(0, 20) : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link to="/" className="text-sm font-semibold tracking-tight">
            BusinessOS ERP
          </Link>
          <span className="text-sm text-muted-foreground">/ Docs</span>
          <div className="ml-auto w-full max-w-sm">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search docs…"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-6">
        <aside className="sticky top-16 hidden max-h-[calc(100vh-5rem)] w-64 shrink-0 overflow-y-auto pr-2 md:block">
          {query.trim() ? (
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Results ({results.length})
              </div>
              <ul className="space-y-1">
                {results.map((r) => (
                  <li key={r.item.path}>
                    <Link
                      to="/docs/$"
                      params={{ _splat: r.item.path }}
                      className="block truncate rounded px-2 py-1 text-sm hover:bg-muted"
                    >
                      {r.item.title}
                    </Link>
                  </li>
                ))}
                {results.length === 0 && (
                  <li className="px-2 py-1 text-xs text-muted-foreground">No matches.</li>
                )}
              </ul>
            </div>
          ) : (
            <nav className="space-y-4 text-sm">
              {nav.map((group) => (
                <div key={group.label}>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </div>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => (
                      <li key={item.path || "index"}>
                        {item.path === "" ? (
                          <Link
                            to="/docs"
                            className="block truncate rounded px-2 py-1 hover:bg-muted [&.active]:bg-muted [&.active]:font-medium"
                            activeOptions={{ exact: true }}
                          >
                            {item.title}
                          </Link>
                        ) : (
                          <Link
                            to="/docs/$"
                            params={{ _splat: item.path }}
                            className="block truncate rounded px-2 py-1 hover:bg-muted [&.active]:bg-muted [&.active]:font-medium"
                          >
                            {item.title}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          )}
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
