/**
 * SPR-MOD-001-003 — Dashboard widget registry (default).
 *
 * Modules register widgets by importing this file and calling
 * `registerDashboardWidget`. Widgets carry an optional permission gate;
 * the template filters them per-caller.
 */
import type { WidgetRegistry, WidgetRegistryEntry } from "./types";

const _registry: WidgetRegistry = {};

export function registerDashboardWidget(entry: WidgetRegistryEntry): void {
  _registry[entry.id] = entry;
}

export function getDashboardWidget(id: string): WidgetRegistryEntry | undefined {
  return _registry[id];
}

export function getDashboardRegistry(): WidgetRegistry {
  return _registry;
}
