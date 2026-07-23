/**
 * Retired-id cleanup helper (Sprint 0.7 §1.3).
 *
 * Every persisted-reference surface (favorites, command history, expanded
 * groups) MUST filter unknown/retired ids on read AND fire-and-forget
 * prune the stale rows so accumulation does not grow.
 */
import { NAV_REGISTRY } from "./registry";

const activeIds = () =>
  new Set(NAV_REGISTRY.filter((n) => n.id_status === "active").map((n) => n.id));

/** Split a list of persisted nav_ids into { kept, stale }. */
export function partitionByActive(ids: readonly string[]): {
  kept: string[];
  stale: string[];
} {
  const active = activeIds();
  const kept: string[] = [];
  const stale: string[] = [];
  for (const id of ids) (active.has(id) ? kept : stale).push(id);
  return { kept, stale };
}

/**
 * Delete stale (retired/unknown) nav_ids from a table for a (user, org)
 * scope. Runs fire-and-forget from list handlers; errors are swallowed and
 * logged — this is opportunistic cleanup, not a critical write path.
 */
export async function pruneRetiredNavIds(
  supabase: {
    from: (t: string) => {
      delete: () => {
        eq: (a: string, b: unknown) => {
          eq: (a: string, b: unknown) => {
            in: (a: string, b: string[]) => Promise<{ error: unknown }>;
          };
        };
      };
    };
  },
  table: "nav_favorites" | "nav_command_history",
  userId: string,
  organizationId: string,
  staleIds: string[],
): Promise<void> {
  if (staleIds.length === 0) return;
  try {
    await supabase
      .from(table)
      .delete()
      .eq("user_id", userId)
      .eq("organization_id", organizationId)
      .in("nav_id", staleIds);
  } catch {
    // opportunistic — never block reads on cleanup
  }
}
