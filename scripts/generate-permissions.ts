/**
 * Generate `src/lib/generated/permission-keys.ts` from the canonical
 * `docs/15-governance/permission-catalog.manifest.yaml`.
 *
 * Usage:
 *   bun run gen:permissions
 *   bun run gen:permissions --check   # exit 1 if the file is stale (CI drift guard)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// Minimal YAML parser sufficient for our manifest shape (block scalars,
// block sequences, and flow sequences). Keeps the script dependency-free.
type Node = string | number | boolean | null | Node[] | { [k: string]: Node };

function parseYaml(src: string): Node {
  // Strip comments and trailing whitespace
  const lines = src
    .split("\n")
    .map((l) => (l.match(/^(\s*)(#.*)?$/) ? l.replace(/\s*#.*$/, "") : l.replace(/\s+#.*$/, "")))
    .filter((l) => l.trim().length > 0);

  let i = 0;

  function parseValue(raw: string): Node {
    const s = raw.trim();
    if (s === "" || s === "null" || s === "~") return null;
    if (s === "true") return true;
    if (s === "false") return false;
    if (/^-?\d+$/.test(s)) return parseInt(s, 10);
    if (s.startsWith("[") && s.endsWith("]")) {
      const inner = s.slice(1, -1).trim();
      if (!inner) return [];
      return inner.split(",").map((x) => parseValue(x.trim()));
    }
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      return s.slice(1, -1);
    }
    return s;
  }

  function indentOf(line: string): number {
    return line.match(/^\s*/)![0].length;
  }

  function parseBlock(indent: number): Node {
    // Peek to decide mapping vs sequence
    const first = lines[i];
    if (first === undefined) return null;
    const isSeq = first.trim().startsWith("- ");
    if (isSeq) {
      const arr: Node[] = [];
      while (i < lines.length) {
        const line = lines[i];
        if (indentOf(line) < indent) break;
        if (indentOf(line) === indent && line.trim().startsWith("- ")) {
          const after = line.trim().slice(2);
          if (after.includes(":") && !after.trim().startsWith("[")) {
            // sequence of maps — synthesise the first key/value and continue at deeper indent
            i++;
            const map: { [k: string]: Node } = {};
            const [k, ...rest] = after.split(":");
            const inline = rest.join(":").trim();
            if (inline) map[k.trim()] = parseValue(inline);
            else {
              // block scalar for this key
              const childIndent = indentOf(lines[i] ?? "");
              map[k.trim()] = childIndent > indent ? parseBlock(childIndent) : null;
            }
            // continue absorbing keys at (indent + 2)
            const mapIndent = indent + 2;
            while (i < lines.length && indentOf(lines[i]) === mapIndent && !lines[i].trim().startsWith("- ")) {
              const l = lines[i];
              const [kk, ...rr] = l.trim().split(":");
              const iv = rr.join(":").trim();
              i++;
              if (iv) map[kk.trim()] = parseValue(iv);
              else {
                const ci = indentOf(lines[i] ?? "");
                map[kk.trim()] = ci > mapIndent ? parseBlock(ci) : null;
              }
            }
            arr.push(map);
          } else {
            arr.push(parseValue(after));
            i++;
          }
        } else {
          break;
        }
      }
      return arr;
    }
    const map: { [k: string]: Node } = {};
    while (i < lines.length) {
      const line = lines[i];
      if (indentOf(line) < indent) break;
      if (indentOf(line) > indent) break;
      if (line.trim().startsWith("- ")) break;
      const [k, ...rest] = line.split(":");
      const inline = rest.join(":").trim();
      i++;
      if (inline) map[k.trim()] = parseValue(inline);
      else {
        const ci = indentOf(lines[i] ?? "");
        map[k.trim()] = ci > indent ? parseBlock(ci) : null;
      }
    }
    return map;
  }

  return parseBlock(0);
}

interface Manifest {
  version: number;
  permissions: Array<{ key: string; name: string; description?: string }>;
  roles: Array<{ key: string; name: string; scope: string; rank: number }>;
}

const check = process.argv.includes("--check");

const manifestPath = resolve("docs/15-governance/permission-catalog.manifest.yaml");
const outPath = resolve("src/lib/generated/permission-keys.ts");

const parsed = parseYaml(readFileSync(manifestPath, "utf8")) as unknown as Manifest;

function toConst(key: string): string {
  return key.toUpperCase().replace(/[.]/g, "_");
}

const permKeys = parsed.permissions.map((p) => p.key);
const roleKeys = parsed.roles.map((r) => r.key);

const output = `/**
 * AUTO-GENERATED — do not edit by hand.
 * Regenerate with \`bun run gen:permissions\` after editing
 * \`docs/15-governance/permission-catalog.manifest.yaml\`.
 */

export const PERMISSIONS = {
${permKeys.map((k) => `  ${toConst(k)}: "${k}",`).join("\n")}
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSION_KEYS: readonly PermissionKey[] = [
${permKeys.map((k) => `  "${k}",`).join("\n")}
] as const;

export const ROLE_KEYS = {
${roleKeys.map((k) => `  ${k.toUpperCase()}: "${k}",`).join("\n")}
} as const;

export type RoleKey = (typeof ROLE_KEYS)[keyof typeof ROLE_KEYS];
`;

if (check) {
  const current = readFileSync(outPath, "utf8");
  if (current !== output) {
    console.error(
      "[gen:permissions] Generated file is stale. Run `bun run gen:permissions` and commit the diff.",
    );
    process.exit(1);
  }
  console.log("[gen:permissions] Generated file is up to date.");
} else {
  writeFileSync(outPath, output);
  console.log(`[gen:permissions] wrote ${outPath} (${permKeys.length} permissions, ${roleKeys.length} roles)`);
}
