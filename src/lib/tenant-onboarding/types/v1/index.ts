/**
 * Gate 3.8 · Pass 3.8.1 — versioned tenant-onboarding DTOs, v1.
 *
 * These are the ONLY onboarding shapes that may cross the server-function
 * boundary into the browser. No database rows, credentials, tokens, SQL,
 * provider payloads, raw audit metadata or stack traces may appear here.
 *
 * Compatibility: additive fields stay in v1; breaking changes require v2.
 */
export const TENANT_ONBOARDING_DTO_VERSION = "v1" as const;

export type * from "./onboarding-step.dto";
export type * from "./onboarding-progress.dto";
export type * from "./onboarding-readiness-check.dto";
export type * from "./onboarding-readiness.dto";
export type * from "./onboarding-organization.dto";
export type * from "./onboarding-branch.dto";
export type * from "./admin-invitation.dto";
export type * from "./admin-membership.dto";
export type * from "./onboarding-activity.dto";
export type * from "./onboarding-summary.dto";
export type * from "./onboarding-detail.dto";
export type * from "./onboarding-action-result.dto";
export type * from "./onboarding-bootstrap-result.dto";
export type * from "./onboarding-activation-result.dto";
export type * from "./onboarding-page.dto";
