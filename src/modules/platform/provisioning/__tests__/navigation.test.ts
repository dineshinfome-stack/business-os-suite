/**
 * Gate 3.4 · Navigation contract.
 * Every provisioning sub-nav destination must exist as a route file, and the
 * platform sidebar must expose the same children.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { PROVISIONING_SUBNAV } from "../components/subnav";
import { PLATFORM_NAV } from "@/components/platform/nav-items";

const ROUTES = join(process.cwd(), "src/routes/_authenticated/platform/provisioning");

function routeFileFor(to: string): string {
  const leaf = to.replace("/platform/provisioning", "").replace(/^\//, "");
  return join(ROUTES, leaf === "" ? "index.tsx" : `${leaf}.tsx`);
}

describe("provisioning navigation", () => {
  it("exposes overview, history, queue, failures and health", () => {
    expect(PROVISIONING_SUBNAV.map((i) => i.to)).toEqual([
      "/platform/provisioning",
      "/platform/provisioning/history",
      "/platform/provisioning/queue",
      "/platform/provisioning/failed",
      "/platform/provisioning/health",
    ]);
  });

  it.each(PROVISIONING_SUBNAV)("$label resolves to a route file", (item) => {
    expect(existsSync(routeFileFor(item.to))).toBe(true);
  });

  it("mirrors the sub-nav in the platform sidebar", () => {
    const entry = PLATFORM_NAV.find((item) => item.id === "provisioning");
    expect(entry?.children?.map((c) => c.to)).toEqual(
      PROVISIONING_SUBNAV.map((i) => i.to),
    );
  });

  it("guards the whole subtree with a layout route", () => {
    expect(existsSync(join(ROUTES, "route.tsx"))).toBe(true);
  });
});
