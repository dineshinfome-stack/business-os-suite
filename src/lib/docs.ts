// Docs registry — compiles all markdown + .mmd files into a static index.
// SSR-safe: pure string operations, no Node built-ins.

import meta from "../../docs/_meta.json";

export type DocFrontmatter = {
  title: string;
  summary?: string;
  document_type?: string;
  layer?: string;
  owner?: string;
  status?: string;
  version?: string;
  created?: string;
  updated?: string;
  tags?: string[];
  depends_on?: string[];
  referenced_by?: string[];
};

export type Doc = {
  path: string; // e.g. "canon" or "02-architecture/master-architecture"
  filePath: string; // e.g. "/docs/canon.md"
  frontmatter: DocFrontmatter;
  body: string;
  isMermaid: boolean;
};

export type NavItem = { title: string; path: string };
export type NavGroup = { label: string; items: NavItem[] };
export const nav: NavGroup[] = (meta as { groups: NavGroup[] }).groups;

// Eager-glob every markdown and mermaid file under /docs.
const mdFiles = import.meta.glob("/docs/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const mmdFiles = import.meta.glob("/docs/**/*.mmd", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parseFrontmatter(raw: string): { frontmatter: DocFrontmatter; body: string } {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw);
  if (!match) return { frontmatter: { title: "" }, body: raw };
  const yaml = match[1];
  const body = match[2];
  const fm: Record<string, unknown> = {};
  for (const line of yaml.split("\n")) {
    const m = /^([a-zA-Z_][\w-]*)\s*:\s*(.*)$/.exec(line);
    if (!m) continue;
    const key = m[1];
    let val: string = m[2].trim();
    if (val.startsWith("[") && val.endsWith("]")) {
      try {
        fm[key] = JSON.parse(val);
        continue;
      } catch {
        // ignore
      }
    }
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    fm[key] = val;
  }
  return { frontmatter: fm as DocFrontmatter, body };
}

function toRoutePath(filePath: string): string {
  // "/docs/foo/bar.md" -> "foo/bar"
  return filePath
    .replace(/^\/docs\//, "")
    .replace(/\.md$/, "")
    .replace(/\.mmd$/, "");
}

const docs: Record<string, Doc> = {};

for (const [filePath, raw] of Object.entries(mdFiles)) {
  const path = toRoutePath(filePath);
  const { frontmatter, body } = parseFrontmatter(raw);
  if (!frontmatter.title) frontmatter.title = path;
  docs[path] = { path, filePath, frontmatter, body, isMermaid: false };
}

for (const [filePath, raw] of Object.entries(mmdFiles)) {
  const path = toRoutePath(filePath);
  docs[path] = {
    path,
    filePath,
    frontmatter: { title: path.split("/").pop() || path, summary: "Mermaid diagram source." },
    body: raw,
    isMermaid: true,
  };
}

export function getDoc(path: string): Doc | undefined {
  const clean = path.replace(/^\/+|\/+$/g, "");
  return docs[clean];
}

export function allDocs(): Doc[] {
  return Object.values(docs);
}

// Simple search index built at module load.
export type SearchEntry = {
  path: string;
  title: string;
  summary: string;
  headings: string[];
  firstParagraph: string;
};

export const searchIndex: SearchEntry[] = allDocs().map((d) => {
  const headings = Array.from(d.body.matchAll(/^#{1,6}\s+(.+)$/gm)).map((m) => m[1].trim());
  const firstParagraph =
    d.body
      .split("\n")
      .find((l) => l.trim() && !l.startsWith("#") && !l.startsWith(">")) ?? "";
  return {
    path: d.path,
    title: d.frontmatter.title,
    summary: d.frontmatter.summary ?? "",
    headings,
    firstParagraph,
  };
});
