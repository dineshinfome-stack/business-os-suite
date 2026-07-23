import { describe, it, expect } from "vitest";
import { mergeSearchResults } from "@/lib/search/merge";
import { registryProvider } from "@/lib/search/providers/registry-provider";
import type { PermissionKey } from "@/lib/generated/permission-keys";
import type { SearchResult } from "@/lib/search/types";

const perms = new Set<PermissionKey>([
  "settings.general.view",
  "search.global.use",
]);

describe("mergeSearchResults", () => {
  const base: SearchResult = {
    id: "x",
    resource_type: "page",
    organization_id: "org1",
    title: "Foo",
    route: "/foo",
    score: 50,
  };

  it("filters out results the caller lacks permission for", () => {
    const restricted: SearchResult = {
      ...base,
      id: "y",
      permission: "platform.users.delete" as PermissionKey,
    };
    const out = mergeSearchResults([[base, restricted]], { permissions: perms, limit: 10 });
    expect(out.map((r) => r.id)).toEqual(["x"]);
  });

  it("dedupes by (resource_type, id) keeping the higher score", () => {
    const lo: SearchResult = { ...base, score: 30 };
    const hi: SearchResult = { ...base, score: 90 };
    const out = mergeSearchResults([[lo], [hi]], { permissions: perms, limit: 10 });
    expect(out).toHaveLength(1);
    expect(out[0].score).toBe(90);
  });

  it("sorts by score desc and honours limit", () => {
    const rows: SearchResult[] = [1, 2, 3, 4, 5].map((n) => ({
      ...base,
      id: `id${n}`,
      score: n * 10,
    }));
    const out = mergeSearchResults([rows], { permissions: perms, limit: 3 });
    expect(out.map((r) => r.id)).toEqual(["id5", "id4", "id3"]);
  });
});

describe("registryProvider", () => {
  it("returns [] for empty query", async () => {
    const out = await registryProvider.search(
      { query: "", organizationId: "org1", userId: "u1" },
      { permissions: perms },
    );
    expect(out).toEqual([]);
  });

  it("matches nav items case-insensitively and applies permission gating", async () => {
    const out = await registryProvider.search(
      { query: "settings", organizationId: "org1", userId: "u1" },
      { permissions: perms },
    );
    // Should find at least the Settings nav item (permission-less).
    expect(out.some((r) => r.title.toLowerCase().includes("settings"))).toBe(true);
    // Platform Settings requires settings.security.manage — not in perms.
    expect(out.some((r) => r.title === "Platform Settings")).toBe(false);
  });
});
