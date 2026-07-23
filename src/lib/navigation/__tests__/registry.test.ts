import { describe, it, expect } from "vitest";
import {
  NAV_REGISTRY,
  NAV_ID_REGEX,
  MAX_CHILDREN_PER_MODULE,
  MAX_TOTAL_ITEMS,
} from "@/lib/navigation/registry";
import { ALL_PERMISSION_KEYS } from "@/lib/generated/permission-keys";

describe("navigation registry", () => {
  it("has no duplicate nav_ids", () => {
    const seen = new Set<string>();
    for (const n of NAV_REGISTRY) {
      expect(seen.has(n.id), `duplicate nav_id: ${n.id}`).toBe(false);
      seen.add(n.id);
    }
  });

  it("every nav_id matches the format", () => {
    for (const n of NAV_REGISTRY) {
      expect(NAV_ID_REGEX.test(n.id), `bad nav_id: ${n.id}`).toBe(true);
    }
  });

  it("every parent id resolves to an active item", () => {
    const active = new Set(
      NAV_REGISTRY.filter((n) => n.id_status === "active").map((n) => n.id),
    );
    for (const n of NAV_REGISTRY) {
      if (n.parent) {
        expect(active.has(n.parent), `unknown parent ${n.parent} on ${n.id}`).toBe(true);
      }
    }
  });

  it("every permission references a known key", () => {
    const known = new Set<string>(ALL_PERMISSION_KEYS);
    for (const n of NAV_REGISTRY) {
      if (n.permission) {
        expect(known.has(n.permission), `unknown permission ${n.permission} on ${n.id}`).toBe(
          true,
        );
      }
    }
  });

  it("warn-only: total items under threshold", () => {
    const total = NAV_REGISTRY.filter((n) => n.id_status === "active").length;
    if (total > MAX_TOTAL_ITEMS) {
      // eslint-disable-next-line no-console
      console.warn(`[nav] registry size ${total} exceeds ${MAX_TOTAL_ITEMS}`);
    }
    expect(total).toBeGreaterThan(0);
  });

  it("warn-only: children per module under threshold", () => {
    const childCount = new Map<string, number>();
    for (const n of NAV_REGISTRY) {
      if (n.id_status !== "active" || !n.parent) continue;
      childCount.set(n.parent, (childCount.get(n.parent) ?? 0) + 1);
    }
    for (const [parent, count] of childCount) {
      if (count > MAX_CHILDREN_PER_MODULE) {
        // eslint-disable-next-line no-console
        console.warn(`[nav] ${parent} has ${count} children (> ${MAX_CHILDREN_PER_MODULE})`);
      }
    }
    expect(childCount.size).toBeGreaterThanOrEqual(0);
  });
});
