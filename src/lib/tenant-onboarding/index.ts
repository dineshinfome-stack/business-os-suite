/**
 * SPR-MOD-001-003 · Gate 3.8 — Pass 3.8.1 (Architecture & Contracts)
 *
 * Tenant-onboarding application layer. Pass 3.8.1 exposes pure contracts only:
 * no persistence, no read services, no commands, no routes, no UI.
 */
export * from "./contracts";
export * from "./state-machine";
export * from "./query-keys";
export * from "./readiness";
export * from "./required-settings.registry";
export * from "./schemas";
export * from "./types";
