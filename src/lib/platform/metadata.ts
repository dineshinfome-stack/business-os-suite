/**
 * Phase 1 — Platform metadata accessor.
 *
 * Thin scaffold; returns the certified MOD-001 module identity so later
 * phases can consume a single source of truth.
 */
import type { PlatformMetadata } from "./types";

const METADATA: PlatformMetadata = {
  moduleId: "MOD-001",
  moduleName: "Platform Administration",
  version: "1.0.0-foundation",
  capabilityCatalog: "docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v2.md",
};

export function getPlatformMetadata(): PlatformMetadata {
  return METADATA;
}
