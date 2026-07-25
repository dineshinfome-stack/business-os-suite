/**
 * Phase 1 — Platform Foundation shared types.
 *
 * Thin, foundation-only types consumed by later phases (Tenant Registry,
 * Provisioning, Lifecycle). Tenant-domain entities are intentionally
 * excluded here — they belong to Phase 2.
 */

export type PlatformStatus = "operational" | "degraded" | "maintenance";

export interface PlatformMetadata {
  /** Stable module id — mirrors MOD-001 registry. */
  moduleId: "MOD-001";
  /** Human name shown in UI surfaces. */
  moduleName: "Platform Administration";
  /** Foundation version — bumped when the Platform module boundary changes. */
  version: string;
  /** Pointer to the capability catalog document (repo-relative). */
  capabilityCatalog: string;
}

export interface PlatformSettings {
  /** Foundation phase currently active in the repository. */
  foundationPhase: 1 | 2 | 3 | 4;
  /** Optional theme id. Reuses the existing theme system. */
  themeId?: string;
}

export interface Platform {
  metadata: PlatformMetadata;
  status: PlatformStatus;
  settings: PlatformSettings;
}
