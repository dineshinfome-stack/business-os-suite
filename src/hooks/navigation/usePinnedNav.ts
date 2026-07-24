/**
 * Thin wrapper over useFavorites exposing "pinned" semantics.
 * Pinned == favorited in the current data model; the label differs by context.
 */
import { useFavorites } from "./useFavorites";

export function usePinnedNav() {
  const { favorites, isFavorite, toggle, isLoading } = useFavorites();
  const pinnedIds = new Set(favorites.map((f) => f.nav_id));
  return {
    pinnedIds,
    isPinned: isFavorite,
    togglePin: toggle,
    isLoading,
  };
}
