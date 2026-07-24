import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useOrg } from "@/contexts/org-context";
import { useAuth } from "@/contexts/auth-context";
import { queryKeys } from "@/lib/query-keys";
import {
  listCommandHistoryFn,
  recordCommandHistoryFn,
  type CommandHistoryRow,
} from "@/lib/navigation/command-history.functions";

export function useCommandHistory() {
  const { current } = useOrg();
  const { status } = useAuth();
  const isAuthed = status === "authenticated";
  const orgId = current?.organizationId ?? null;
  const qc = useQueryClient();
  const listFn = useServerFn(listCommandHistoryFn);
  const recordFn = useServerFn(recordCommandHistoryFn);

  const query = useQuery<CommandHistoryRow[]>({
    queryKey: queryKeys.navigation.commandHistory(orgId),
    queryFn: () => listFn(),
    enabled: isAuthed && Boolean(orgId),
    staleTime: 30_000,
  });


  const record = useMutation({
    mutationFn: (navId: string) => recordFn({ data: { navId } }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.navigation.commandHistory(orgId) }),
  });

  return {
    history: query.data ?? [],
    isLoading: query.isLoading,
    record: record.mutate,
  };
}
