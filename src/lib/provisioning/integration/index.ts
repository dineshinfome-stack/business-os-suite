/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.2.2 · Provisioning integration layer.
 *
 * Concrete persistence and event implementations of the Gate 3.2.1 ports, plus
 * the composition root that assembles the orchestrator.
 *
 * NOTE: the Supabase binding (`supabase-data-client.ts`) is intentionally NOT
 * re-exported here so that importing the integration layer never pulls an
 * infrastructure client into the graph. Import it explicitly where needed.
 */
export * from "./data-client";
export * from "./repository-adapter";
export * from "./writer-adapter";
export * from "./event-sink";
export * from "./service";
export * from "./factory";
