/**
 * Board Rec 1 — Header Slot Registry.
 *
 * A tiny static registry that lets header items (Navigator, Search, Favorites,
 * Recent, AI, Notifications, Help, Profile, …) be declared as data instead of
 * inline JSX inside AppShell. New modules contribute a slot without touching
 * the shell.
 *
 *   AppShell → <HeaderSlots area="start|end" /> → sorted registered slots
 *
 * `order` is a stable integer (10, 20, 30 …) so downstream modules can slot
 * between existing entries without renumbering.
 */
import type { ComponentType } from "react";

export type HeaderSlotArea = "start" | "end";

export interface HeaderSlot {
  /** Stable identifier; MUST match the id passed to useHeader().open(id). */
  id: string;
  area: HeaderSlotArea;
  order: number;
  /** Renders inside the header. May itself register a HeaderPopover. */
  component: ComponentType;
  /** Optional flag to disable a slot without removing the registration. */
  disabled?: boolean;
}

const registry: HeaderSlot[] = [];
const seen = new Set<string>();

export function registerHeaderSlot(slot: HeaderSlot): void {
  if (seen.has(slot.id)) return; // idempotent under HMR
  seen.add(slot.id);
  registry.push(slot);
}

export function getHeaderSlots(area: HeaderSlotArea): HeaderSlot[] {
  return registry
    .filter((s) => s.area === area && !s.disabled)
    .slice()
    .sort((a, b) => a.order - b.order);
}

/** Test-only: reset the registry between test cases. */
export function __resetHeaderSlotsForTest(): void {
  registry.length = 0;
  seen.clear();
}
