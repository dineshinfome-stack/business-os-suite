/**
 * Gate 3.7 · Administration domain rules.
 *
 * Covers the two contracts the console depends on: deterministic attention
 * ranking and the settings ownership/validation contract.
 */
import { describe, expect, it } from "vitest";

import {
  ATTENTION_PRECEDENCE,
  ATTENTION_SEVERITY,
  buildAttentionItem,
  explain,
  orderAttention,
  summarizeAttention,
  type AttentionSeed,
} from "@/lib/platform-admin/attention";
import {
  PLATFORM_SETTING_REGISTRY,
  findSettingSpec,
  isEditableSetting,
  isSecretShapedKey,
  validateFeatureChange,
  validateSettingChange,
} from "@/lib/platform-admin/validation";
import { ADMINISTRATION_SUBNAV } from "@/modules/platform/administration/components/subnav";

function seed(overrides: Partial<AttentionSeed> & Pick<AttentionSeed, "type">) {
  return buildAttentionItem(
    {
      tenantId: "t1",
      tenantName: "Tenant One",
      source: "provisioning",
      reasonParams: {},
      createdAt: "2026-01-01T00:00:00.000Z",
      lastUpdatedAt: "2026-01-01T00:00:00.000Z",
      correlationId: null,
      destination: "/platform/provisioning/failed",
      destinationLabel: "Open failures",
      ...overrides,
    } as AttentionSeed,
    new Map(),
  );
}

describe("attention ranking", () => {
  it("ranks rollback failure above retry exhaustion above plain failure", () => {
    expect(ATTENTION_PRECEDENCE.provisioning_rollback_failed).toBeLessThan(
      ATTENTION_PRECEDENCE.provisioning_retry_exhausted,
    );
    expect(ATTENTION_PRECEDENCE.provisioning_retry_exhausted).toBeLessThan(
      ATTENTION_PRECEDENCE.provisioning_failed,
    );
  });

  it("orders by precedence before severity", () => {
    const ordered = orderAttention([
      seed({ type: "pending_deletion" }),
      seed({ type: "provisioning_rollback_failed", tenantId: "t2" }),
      seed({ type: "provisioning_failed", tenantId: "t3" }),
    ]);
    expect(ordered.map((i) => i.type)).toEqual([
      "provisioning_rollback_failed",
      "provisioning_failed",
      "pending_deletion",
    ]);
  });

  it("is deterministic for identical precedence and severity", () => {
    const a = seed({ type: "provisioning_failed", tenantId: "b" });
    const b = seed({ type: "provisioning_failed", tenantId: "a" });
    expect(orderAttention([a, b]).map((i) => i.tenantId)).toEqual(["a", "b"]);
    expect(orderAttention([b, a]).map((i) => i.tenantId)).toEqual(["a", "b"]);
  });

  it("deduplicates by id keeping the freshest row", () => {
    const older = seed({ type: "provisioning_failed" });
    const newer = seed({
      type: "provisioning_failed",
      lastUpdatedAt: "2026-02-01T00:00:00.000Z",
    });
    const ordered = orderAttention([older, newer]);
    expect(ordered).toHaveLength(1);
    expect(ordered[0].lastUpdatedAt).toBe("2026-02-01T00:00:00.000Z");
  });

  it("assigns critical severity to unrecoverable provisioning states", () => {
    expect(ATTENTION_SEVERITY.provisioning_rollback_failed).toBe("critical");
    expect(ATTENTION_SEVERITY.provisioning_retry_exhausted).toBe("critical");
  });

  it("explains items from persisted values only", () => {
    expect(explain("provisioning_failed", { step: "create_project", attempts: 3 })).toContain(
      'step "create_project"',
    );
    expect(explain("maintenance_beyond_threshold", { maintenanceDays: 9, thresholdDays: 7 })).toContain(
      "9 day(s)",
    );
  });

  it("counts only open items in the summary", () => {
    const acknowledged = buildAttentionItem(
      {
        type: "provisioning_failed",
        tenantId: "t9",
        tenantName: "Nine",
        source: "provisioning",
        reasonParams: {},
        createdAt: "2026-01-01T00:00:00.000Z",
        lastUpdatedAt: "2026-01-01T00:00:00.000Z",
        correlationId: null,
        destination: "/platform/provisioning/failed",
        destinationLabel: "Open failures",
      } as AttentionSeed,
      new Map([["provisioning_failed:t9", "2026-01-02T00:00:00.000Z"]]),
    );
    const summary = summarizeAttention([
      acknowledged,
      seed({ type: "provisioning_rollback_failed", tenantId: "t8" }),
    ]);
    expect(summary.total).toBe(1);
    expect(summary.critical).toBe(1);
    expect(acknowledged.status).toBe("acknowledged");
  });
});

describe("settings ownership contract", () => {
  it("every registry entry declares owner, mutability and source of truth", () => {
    for (const spec of PLATFORM_SETTING_REGISTRY) {
      expect(spec.owner).toBeTruthy();
      expect(spec.mutability).toBeTruthy();
      expect(spec.sourceOfTruth).toBeTruthy();
    }
  });

  it("rejects unknown keys", () => {
    expect(validateSettingChange("platform.not_a_setting", 1)).toMatchObject({
      ok: false,
    });
  });

  it("rejects writes to non-editable settings", () => {
    const readOnly = PLATFORM_SETTING_REGISTRY.find((s) => s.mutability !== "editable");
    expect(readOnly).toBeDefined();
    expect(isEditableSetting(readOnly!.key)).toBe(false);
    expect(validateSettingChange(readOnly!.key, "x")).toMatchObject({ ok: false });
  });

  it("enforces declared type and range on editable numbers", () => {
    const numeric = PLATFORM_SETTING_REGISTRY.find(
      (s) => s.mutability === "editable" && s.dataType === "number" && s.max != null,
    );
    expect(numeric).toBeDefined();
    expect(validateSettingChange(numeric!.key, "10")).toMatchObject({ ok: false });
    expect(validateSettingChange(numeric!.key, numeric!.max! + 1)).toMatchObject({
      ok: false,
    });
    expect(validateSettingChange(numeric!.key, numeric!.min ?? 1)).toMatchObject({
      ok: true,
    });
  });

  it("rejects unknown feature keys and non-boolean values", () => {
    expect(validateFeatureChange("nope", true)).toMatchObject({ ok: false });
  });

  it("flags secret-shaped field names for redaction", () => {
    expect(isSecretShapedKey("service_role_key")).toBe(true);
    expect(isSecretShapedKey("access_token")).toBe(true);
    expect(isSecretShapedKey("display_name")).toBe(false);
  });

  it("keeps a spec for every key exposed in the registry lookup", () => {
    for (const spec of PLATFORM_SETTING_REGISTRY) {
      expect(findSettingSpec(spec.key)).toBe(spec);
    }
  });
});

describe("administration navigation", () => {
  it("exposes eight unique sections under /platform/admin", () => {
    expect(ADMINISTRATION_SUBNAV).toHaveLength(8);
    const targets = ADMINISTRATION_SUBNAV.map((i) => i.to);
    expect(new Set(targets).size).toBe(8);
    for (const to of targets) expect(to.startsWith("/platform/admin")).toBe(true);
  });

  it("marks only the overview route as exact", () => {
    const exact = ADMINISTRATION_SUBNAV.filter((i) => i.exact);
    expect(exact.map((i) => i.to)).toEqual(["/platform/admin"]);
  });
});
