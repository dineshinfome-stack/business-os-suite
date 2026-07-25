/**
 * Phase 1 — Platform Foundation barrel.
 *
 * Single import surface for Platform metadata, constants, config, logger,
 * and shared types. Later phases (Tenant Registry, Provisioning,
 * Lifecycle) build on these thin scaffolds.
 */
export * from "./types";
export * from "./constants";
export * from "./config";
export { getPlatformMetadata } from "./metadata";
export { platformLogger } from "./logger";
