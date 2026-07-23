import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useOrg } from "@/contexts/org-context";
import { queryKeys } from "@/lib/query-keys";
import {
  listFavoritesFn,
  addFavoriteFn,
  removeFavoriteFn,
  reorderFavoritesFn,
  type FavoriteRow,
} from "@/lib/navigation/favorites.functions";

export function useFavorites() {
  const { current } = useOrg();
  const orgId = current?.organizationId ?? null;
  const qc = useQueryClient();
  const listFn = useServerFn(listFavoritesFn);
  const addFn = useServerFn(addFavoriteFn);
  const rmFn = useServerFn(removeFavoriteFn);
  const reorderFn = useServerFn(reorderFavoritesFn);

  const query = useQuery<FavoriteRow[]>({
    queryKey: queryKeys.navigation.favorites(orgId),
    queryFn: () => listFn(),
    enabled: Boolean(orgId),
    staleTime: 60_000,
  });

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: queryKeys.navigation.favorites(orgId) });

  const add = useMutation({
    mutationFn: (navId: string) => addFn({ data: { navId } }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (navId: string) => rmFn({ data: { navId } }),
    onSuccess: invalidate,
  });
  const reorder = useMutation({
    mutationFn: (orderedNavIds: string[]) => reorderFn({ data: { orderedNavIds } }),
    onSuccess: invalidate,
  });

  const ids = new Set((query.data ?? []).map((r) => r.nav_id));
  return {
    favorites: query.data ?? [],
    isLoading: query.isLoading,
    isFavorite: (navId: string) => ids.has(navId),
    add: add.mutate,
    remove: remove.mutate,
    toggle: (navId: string) => (ids.has(navId) ? remove.mutate(navId) : add.mutate(navId)),
    reorder: reorder.mutate,
  };
}
