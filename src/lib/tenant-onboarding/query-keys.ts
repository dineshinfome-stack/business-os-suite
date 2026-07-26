/**
 * SPR-MOD-001-003 · Gate 3.8 — Pass 3.8.1 (Architecture & Contracts)
 *
 * Canonical TanStack Query keys for tenant onboarding. Definitions only — no
 * hooks, no read services, no server calls in this pass. Documented
 * invalidation sets live in `PHASE3_GATE38_ONBOARDING_MATRIX.md`.
 */
import type { OnboardingListFilterDTO } from "./types/v1";

/** Deterministic, serializable filter normalization (stable key ordering). */
export function normalizeOnboardingFilters(
  filters: OnboardingListFilterDTO = {},
): Record<string, unknown> {
  const entries = Object.entries(filters)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .sort(([a], [b]) => a.localeCompare(b));
  return Object.fromEntries(entries);
}

export const tenantOnboardingKeys = {
  all: ["tenant-onboarding"] as const,

  platformLists: () => [...tenantOnboardingKeys.all, "platform-list"] as const,
  platformList: (filters: OnboardingListFilterDTO = {}) =>
    [
      ...tenantOnboardingKeys.platformLists(),
      normalizeOnboardingFilters(filters),
    ] as const,

  details: () => [...tenantOnboardingKeys.all, "detail"] as const,
  detail: (tenantId: string) =>
    [...tenantOnboardingKeys.details(), tenantId] as const,

  steps: (tenantId: string) =>
    [...tenantOnboardingKeys.all, "steps", tenantId] as const,
  progress: (tenantId: string) =>
    [...tenantOnboardingKeys.all, "progress", tenantId] as const,
  blockers: (tenantId: string) =>
    [...tenantOnboardingKeys.all, "blockers", tenantId] as const,
  readiness: (tenantId: string) =>
    [...tenantOnboardingKeys.all, "readiness", tenantId] as const,
  activity: (tenantId: string) =>
    [...tenantOnboardingKeys.all, "activity", tenantId] as const,
  invitation: (tenantId: string) =>
    [...tenantOnboardingKeys.all, "invitation", tenantId] as const,
};
